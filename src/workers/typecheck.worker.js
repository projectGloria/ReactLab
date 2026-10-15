// A real TypeScript compiler, off the main thread.
//
// The TypeScript lessons teach a language whose entire value is the errors it
// reports, and Sandpack does not report them: it strips types with Babel and
// runs the JavaScript underneath. So a lesson could tell the reader that
// `useState(null)` infers `null` and then cheerfully run the code that proves
// otherwise. This worker closes that gap by running the actual checker.
//
// Three things are bundled in at build time, because the app has to work with
// no network: the compiler, the standard library declarations, and React's
// types. Together they are large, which is why this file is loaded lazily and
// only for the TypeScript modules.
//
// It is inlined as a blob worker (`?worker&inline` at the import site) rather
// than emitted as a separate script. A packaged build is served over file://,
// where the page's origin is `null` and a worker loaded from a file:// URL is
// refused; a blob URL is constructed from the page itself and is allowed.
import ts from 'typescript';

// The lib chain for `target: ES2020` plus the DOM. Globbed rather than listed
// because `lib.es2020.full.d.ts` pulls in its dependencies through `///
// <reference lib>` directives, and missing one shows up as thousands of
// "cannot find name" errors rather than as a missing file.
const LIB_SOURCES = import.meta.glob(
  '/node_modules/typescript/lib/lib.{es5,es2015,es2015.*,es2016,es2016.*,es2017,es2017.*,es2018,es2018.*,es2019,es2019.*,es2020,es2020.*,dom,dom.iterable,scripthost,webworker.importscripts,decorators,decorators.legacy}.d.ts',
  { query: '?raw', import: 'default', eager: true },
);

import reactTypes from '/node_modules/@types/react/index.d.ts?raw';
import reactGlobalTypes from '/node_modules/@types/react/global.d.ts?raw';
import reactJsxRuntimeTypes from '/node_modules/@types/react/jsx-runtime.d.ts?raw';
import cssTypes from '/node_modules/csstype/index.d.ts?raw';

const LIB_DIR = '/node_modules/typescript/lib';
const DEFAULT_LIB = `${LIB_DIR}/lib.es2020.full.d.ts`;
const ENTRY = '/App.tsx';

// Path -> text, for everything that is not the learner's own file.
const vfs = new Map();
for (const [path, text] of Object.entries(LIB_SOURCES)) vfs.set(path, text);
vfs.set('/node_modules/@types/react/index.d.ts', reactTypes);
vfs.set('/node_modules/@types/react/global.d.ts', reactGlobalTypes);
vfs.set('/node_modules/@types/react/jsx-runtime.d.ts', reactJsxRuntimeTypes);
vfs.set('/node_modules/csstype/index.d.ts', cssTypes);

// `lib.es2020.full.d.ts` is one of the few lib files the glob above cannot
// match by name, since it is `es2020.full` and the pattern stops at `es2020.*`
// -- which it does match. Guard anyway: without a default lib nothing resolves.
if (!vfs.has(DEFAULT_LIB)) {
  const fallback = [`${LIB_DIR}/lib.es2020.d.ts`, `${LIB_DIR}/lib.es5.d.ts`].find((p) => vfs.has(p));
  if (fallback) vfs.set(DEFAULT_LIB, `/// <reference lib="${fallback.split('lib.')[1].replace(/\.d\.ts$/, '')}" />\n/// <reference lib="dom" />\n`);
}

// Only `react` needs to resolve. Anything else a lesson imports has no types
// here, and reporting "cannot find module" for it would be noise about the
// sandbox rather than about the learner's code -- so TS2307 is filtered below.
const MODULE_MAP = {
  'react': '/node_modules/@types/react/index.d.ts',
  'react/jsx-runtime': '/node_modules/@types/react/jsx-runtime.d.ts',
  'react/jsx-dev-runtime': '/node_modules/@types/react/jsx-runtime.d.ts',
  'csstype': '/node_modules/csstype/index.d.ts',
};

const COMPILER_OPTIONS = {
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  jsx: ts.JsxEmit.ReactJSX,
  jsxImportSource: 'react',
  strict: true,
  noEmit: true,
  esModuleInterop: true,
  allowSyntheticDefaultImports: true,
  skipLibCheck: true,
  forceConsistentCasingInFileNames: true,
};

// The learner's file, versioned so the language service knows when to re-parse
// it. Everything else in the VFS never changes, which is the whole reason for
// using a language service rather than a fresh program per keystroke: the two
// megabytes of lib declarations are parsed once and reused.
let entryText = '';
let entryVersion = 0;

const readFile = (fileName) => (fileName === ENTRY ? entryText : vfs.get(fileName));

const host = {
  getScriptFileNames: () => [ENTRY],
  getScriptVersion: (fileName) => (fileName === ENTRY ? String(entryVersion) : '1'),
  getScriptSnapshot: (fileName) => {
    const text = readFile(fileName);
    return text === undefined ? undefined : ts.ScriptSnapshot.fromString(text);
  },
  getCurrentDirectory: () => '/',
  getCompilationSettings: () => COMPILER_OPTIONS,
  getDefaultLibFileName: () => DEFAULT_LIB,
  getDefaultLibLocation: () => LIB_DIR,
  fileExists: (fileName) => readFile(fileName) !== undefined,
  readFile,
  directoryExists: () => true,
  getDirectories: () => [],
  readDirectory: () => [],
  resolveModuleNameLiterals: (literals, containingFile) =>
    literals.map((literal) => {
      const resolvedFileName = resolveSpecifier(literal.text, containingFile);
      return resolvedFileName
        ? { resolvedModule: { resolvedFileName, extension: ts.Extension.Dts, isExternalLibraryImport: true } }
        : { resolvedModule: undefined };
    }),
};

// `@types/react/jsx-runtime.d.ts` re-exports the JSX namespace from `./index`,
// and that one relative import is load-bearing: without it TypeScript cannot
// find `JSX.IntrinsicElements` and every tag in the file reports ts7026.
function normalizePath(path) {
  const parts = [];
  for (const segment of path.split('/')) {
    if (segment === '' || segment === '.') continue;
    if (segment === '..') parts.pop();
    else parts.push(segment);
  }
  return `/${parts.join('/')}`;
}

function resolveSpecifier(specifier, containingFile) {
  if (MODULE_MAP[specifier]) return MODULE_MAP[specifier];
  if (!specifier.startsWith('.')) return undefined;

  const directory = containingFile.slice(0, containingFile.lastIndexOf('/'));
  const base = normalizePath(`${directory}/${specifier}`);
  return [base, `${base}.d.ts`, `${base}/index.d.ts`].find((candidate) => vfs.has(candidate));
}

let service = null;
function getService() {
  if (!service) service = ts.createLanguageService(host, ts.createDocumentRegistry());
  return service;
}

// Reported as-is except for one exclusion: an unresolved import of something
// this sandbox has no types for is a fact about the sandbox, not the lesson.
const IGNORED_CODES = new Set([2307]);

function check(code) {
  entryText = code;
  entryVersion += 1;

  const svc = getService();
  const diagnostics = [
    ...svc.getSyntacticDiagnostics(ENTRY),
    ...svc.getSemanticDiagnostics(ENTRY),
  ];

  const source = svc.getProgram()?.getSourceFile(ENTRY);

  return diagnostics
    .filter((d) => !IGNORED_CODES.has(d.code))
    .map((d) => {
      const position = source && typeof d.start === 'number'
        ? ts.getLineAndCharacterOfPosition(source, d.start)
        : { line: 0, character: 0 };
      return {
        code: d.code,
        line: position.line + 1,
        column: position.character + 1,
        category: d.category === ts.DiagnosticCategory.Error ? 'error' : 'warning',
        message: ts.flattenDiagnosticMessageText(d.messageText, ' '),
      };
    })
    .sort((a, b) => a.line - b.line || a.column - b.column);
}

self.onmessage = (event) => {
  const { id, code } = event.data || {};
  try {
    self.postMessage({ id, diagnostics: check(String(code ?? '')) });
  } catch (error) {
    // A crash in the checker must not look like "your code is fine".
    self.postMessage({ id, error: String(error?.message || error) });
  }
};
