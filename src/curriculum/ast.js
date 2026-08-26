import { Parser } from 'acorn';
import jsx from 'acorn-jsx';
import { simple, base } from 'acorn-walk';

const JSXParser = Parser.extend(jsx());

const jsxBase = {
  ...base,
  JSXElement(node, st, c) {
    c(node.openingElement, st);
    for (const child of node.children) c(child, st);
    if (node.closingElement) c(node.closingElement, st);
  },
  JSXOpeningElement(node, st, c) {
    c(node.name, st);
    for (const attr of node.attributes) c(attr, st);
  },
  JSXClosingElement(node, st, c) {
    c(node.name, st);
  },
  JSXAttribute(node, st, c) {
    c(node.name, st);
    if (node.value) c(node.value, st);
  },
  JSXSpreadAttribute(node, st, c) {
    c(node.argument, st);
  },
  JSXExpressionContainer(node, st, c) {
    c(node.expression, st);
  },
  JSXFragment(node, st, c) {
    c(node.openingFragment, st);
    for (const child of node.children) c(child, st);
    c(node.closingFragment, st);
  },
  JSXOpeningFragment() {},
  JSXClosingFragment() {},
  JSXText() {},
  JSXIdentifier() {},
  JSXMemberExpression(node, st, c) {
    c(node.object, st);
    c(node.property, st);
  },
  JSXNamespacedName(node, st, c) {
    c(node.namespace, st);
    c(node.name, st);
  },
  JSXEmptyExpression() {},
};

export const parseAST = (code) => {
  try {
    return JSXParser.parse(code, { sourceType: 'module', ecmaVersion: 'latest' });
  } catch {
    return null;
  }
};

export const findNode = (ast, visitors) => {
  if (!ast) return false;
  let found = false;
  
  // Wrap visitors to set found = true
  const wrappedVisitors = {};
  for (const [type, visitor] of Object.entries(visitors)) {
    wrappedVisitors[type] = (node) => {
      if (visitor(node)) found = true;
    };
  }
  simple(ast, wrappedVisitors, jsxBase);
  return found;
};
export const hasHookCall = (ast, hookName) => {
  return findNode(ast, {
    CallExpression(node) {
      return node.callee.type === 'Identifier' && node.callee.name === hookName;
    }
  });
};

export const hasComponent = (ast, name) => {
  return findNode(ast, {
    FunctionDeclaration(node) {
      return node.id && node.id.name === name;
    },
    VariableDeclarator(node) {
      return node.id.name === name && (node.init?.type === 'ArrowFunctionExpression' || node.init?.type === 'FunctionExpression');
    }
  });
};

export const hasJSXElement = (ast, name) => {
  return findNode(ast, {
    JSXOpeningElement(node) {
      return node.name.type === 'JSXIdentifier' && node.name.name === name;
    }
  });
};

export const hasHookCallWithDeps = (ast, hookName, expectedDeps = []) => {
  return findNode(ast, {
    CallExpression(node) {
      if (node.callee.type !== 'Identifier' || node.callee.name !== hookName) return false;
      if (expectedDeps === null) return true; // Any call is fine
      if (node.arguments.length < 2) return false;
      const depsNode = node.arguments[1];
      if (depsNode.type !== 'ArrayExpression') return false;
      
      const elementNames = depsNode.elements.map(el => {
        if (!el) return null;
        if (el.type === 'Identifier') return el.name;
        if (el.type === 'Literal') return String(el.value);
        return null;
      }).filter(Boolean);

      if (expectedDeps.length === 0) {
        return elementNames.length === 0;
      }
      return expectedDeps.every(dep => elementNames.includes(dep));
    }
  });
};

export const hasJSXAttribute = (ast, elementName, attributeName) => {
  return findNode(ast, {
    JSXOpeningElement(node) {
      if (elementName && (node.name.type !== 'JSXIdentifier' || node.name.name !== elementName)) {
        return false;
      }
      return node.attributes.some(attr => attr.type === 'JSXAttribute' && attr.name.name === attributeName);
    }
  });
};

export const hasStableKeyInMap = (ast) => {
  if (!ast) return false;
  return findNode(ast, {
    JSXAttribute(node) {
      if (node.name.name !== 'key' || !node.value) return false;
      const expr = node.value.type === 'JSXExpressionContainer' ? node.value.expression : null;
      if (!expr) return false;
      if (expr.type === 'Identifier') return !['index', 'random'].includes(expr.name);
      if (expr.type === 'MemberExpression' && !expr.computed && expr.object.type === 'Identifier' && expr.property.type === 'Identifier') {
        return !['index', 'random'].includes(expr.property.name);
      }
      return false;
    }
  });
};
