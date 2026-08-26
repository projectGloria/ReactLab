import React from 'react';

// Shared lightweight JS/JSX/CSS tokenizer. Lives here rather than inside a
// component so every surface that shows code outside a Sandpack editor -- the
// mentor chat and the Glossary Codex -- colors it identically. Colors map onto
// the app tokens, so this stays in step with the rest of the palette.
//
// Not a parser: it is a single regex pass and makes no attempt to be correct
// for pathological input. It only has to be consistent.

export function highlightCode(code) {
  if (!code) return '';

  // Token regex for JS/JSX/HTML/CSS matching Playground Sandpack
  const tokenRegex = /(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(?:`(?:\\[\s\S]|[^`])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?:<\/?[\w$-]+|\/?>)|(?:\b(?:import|export|default|from|function|return|const|let|var|if|else|switch|case|break|for|while|do|try|catch|finally|throw|new|typeof|instanceof|async|await|class|extends|super|this|null|undefined|true|false)\b)|(?:\b(?:useState|useEffect|useContext|useReducer|useCallback|useMemo|useRef|useId|useTransition|useDeferredValue|useActionState|useOptimistic)\b)|(?:\b[A-Z][a-zA-Z0-9_]*\b)|(?:\b\d+(?:\.\d+)?\b)|(?:[{}()[\];,.:?=+\-*/%&|^!<>~])/g;

  let lastIndex = 0;
  const parts = [];
  let match;

  while ((match = tokenRegex.exec(code)) !== null) {
    const text = match[0];
    const index = match.index;

    // Plain text before token
    if (index > lastIndex) {
      parts.push(<span key={`txt-${lastIndex}`} style={{ color: 'var(--text-primary, #f5f4ee)' }}>{code.slice(lastIndex, index)}</span>);
    }

    // 1. Comments: // or /* */ -> var(--text-muted, #7a776d)
    if (text.startsWith('//') || text.startsWith('/*')) {
      parts.push(<span key={`c-${index}`} style={{ color: 'var(--text-muted, #7a776d)', fontStyle: 'italic' }}>{text}</span>);
    }
    // 2. Strings: '', "", `` -> var(--success, #788c5d)
    else if (text.startsWith('"') || text.startsWith("'") || text.startsWith('`')) {
      parts.push(<span key={`s-${index}`} style={{ color: 'var(--success, #788c5d)' }}>{text}</span>);
    }
    // 3. JSX Tags: <Card, </div>, />, > -> var(--error, #c15f3c)
    else if (text.startsWith('<') || text.startsWith('</') || text === '/>' || text === '>') {
      parts.push(<span key={`t-${index}`} style={{ color: 'var(--error, #c15f3c)' }}>{text}</span>);
    }
    // 4. React Hooks: useState, useEffect -> #60a5fa
    else if (/^(useState|useEffect|useContext|useReducer|useCallback|useMemo|useRef|useId|useTransition|useDeferredValue|useActionState|useOptimistic)$/.test(text)) {
      parts.push(<span key={`h-${index}`} style={{ color: '#60a5fa' }}>{text}</span>);
    }
    // 5. React Components / PascalCase Identifiers -> #60a5fa
    else if (/^[A-Z][a-zA-Z0-9_]*$/.test(text)) {
      parts.push(<span key={`comp-${index}`} style={{ color: '#60a5fa' }}>{text}</span>);
    }
    // 6. Language Keywords: function, return, import, export, const, let, default, etc. -> var(--accent-primary, #d97757)
    else if (/^(import|export|default|from|function|return|const|let|var|if|else|switch|case|break|for|while|do|try|catch|finally|throw|new|typeof|instanceof|async|await|class|extends|super|this|null|undefined|true|false)$/.test(text)) {
      parts.push(<span key={`k-${index}`} style={{ color: 'var(--accent-primary, #d97757)' }}>{text}</span>);
    }
    // 7. Numbers: 20, 8 -> var(--warning, #d9a057)
    else if (/^\d/.test(text)) {
      parts.push(<span key={`n-${index}`} style={{ color: 'var(--warning, #d9a057)' }}>{text}</span>);
    }
    // 8. Punctuation, braces, brackets, colons -> var(--text-secondary, #b0aea5)
    else {
      parts.push(<span key={`p-${index}`} style={{ color: 'var(--text-secondary, #b0aea5)' }}>{text}</span>);
    }

    lastIndex = index + text.length;
  }

  if (lastIndex < code.length) {
    parts.push(<span key={`tail-${lastIndex}`} style={{ color: 'var(--text-primary, #f5f4ee)' }}>{code.slice(lastIndex)}</span>);
  }

  return parts;
}


export default highlightCode;
