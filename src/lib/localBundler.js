// v2 — 2026-09-14 — finished the offline evaluation path.
//
// This file used to stop half way: it could transpile a string and it could
// build an HTML shell, but nothing ever *ran* the transpiled code, and
// BUILTIN_MODULES was never read by anything. So the app claimed to be
// offline-first while every playground round-tripped to CodeSandbox's hosted
// bundler, and a dropped connection produced a blank iframe with no explanation.
//
// It now does the whole job: transpile each file to CommonJS, hand the modules
// to a tiny `require` shim inside a same-origin iframe, and resolve bare
// specifiers out of a registry of packages this app already bundles. Every
// runnable lesson in the curriculum imports only from that registry, so the
// playground works with the network unplugged.
//
// Sandpack is still the default when a connection exists: it owns the editor,
// the file tabs and the error overlay. This is the fallback, not a replacement.
import * as Babel from '@babel/standalone';
import * as React from 'react';
import * as JsxRuntime from 'react/jsx-runtime';
import * as ReactDOMClient from 'react-dom/client';
import * as ReactDOM from 'react-dom';
import * as ReactRouterDOM from 'react-router-dom';
import * as Zustand from 'zustand';
import * as ZustandShallow from 'zustand/react/shallow';
import * as ReactQuery from '@tanstack/react-query';
import * as ReactErrorBoundary from 'react-error-boundary';
import * as FramerMotion from 'framer-motion';
import * as LucideReact from 'lucide-react';

/**
 * Bare specifiers a lesson may import offline. These are the app's own
 * dependencies, already in the bundle, so they cost nothing extra to expose.
 *
 * Keep this in step with the `dependencies` fields across
 * `src/curriculum/modules/` -- `canRunOffline` below is what enforces that a
 * lesson needing something absent here falls back to the hosted bundler rather
 * than failing confusingly.
 */
export const BUILTIN_MODULES = {
  'react': React,
  'react/jsx-runtime': JsxRuntime,
  'react/jsx-dev-runtime': JsxRuntime,
  'react-dom': ReactDOM,
  'react-dom/client': ReactDOMClient,
  'react-router-dom': ReactRouterDOM,
  'react-router': ReactRouterDOM,
  'zustand': Zustand,
  'zustand/react/shallow': ZustandShallow,
  '@tanstack/react-query': ReactQuery,
  'react-error-boundary': ReactErrorBoundary,
  'framer-motion': FramerMotion,
  'lucide-react': LucideReact,
};

/** Whether every dependency this lesson declares can be resolved offline. */
export function canRunOffline(dependencies) {
  if (!dependencies) return true;
  return Object.keys(dependencies).every((name) => name in BUILTIN_MODULES);
}

/**
 * Transpile one file to CommonJS so the `require` shim below can execute it.
 *
 * The JSX runtime is `automatic`, which is what the curriculum's code assumes:
 * lessons do not `import React from 'react'`, so a `classic` transform would
 * emit `React.createElement` against an undefined binding.
 */
export function transpileCode(code, filename = 'App.jsx') {
  try {
    const isTypeScript = /\.tsx?$/.test(filename);
    const presets = [
      ['react', { runtime: 'automatic' }],
      ['env', { modules: 'commonjs', targets: { esmodules: true } }],
    ];
    if (isTypeScript) presets.push(['typescript', { isTSX: true, allExtensions: true }]);

    const transformed = Babel.transform(code, { filename, presets, plugins: [] });
    return { ok: true, code: transformed.code };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

const codeOf = (entry) => (typeof entry === 'string' ? entry : entry?.code || '');

/**
 * Transpile a Sandpack-shaped file map. Stylesheets are passed through as-is;
 * everything else is compiled. A syntax error in any file short-circuits, since
 * the error is what the learner needs to see.
 */
export function buildOfflineModules(files) {
  const modules = {};
  let stylesheet = '';

  for (const [path, entry] of Object.entries(files || {})) {
    const source = codeOf(entry);
    if (path.endsWith('.css')) {
      stylesheet += `\n${source}`;
      continue;
    }
    const result = transpileCode(source, path.replace(/^\//, ''));
    if (!result.ok) return { ok: false, error: `${path}: ${result.error}` };
    modules[path] = result.code;
  }

  return { ok: true, modules, stylesheet };
}

// The module runtime that executes inside the iframe. Kept as a string rather
// than a real module because it has to be evaluated in the iframe's realm, not
// this one -- a lesson's `window`, `document` and error handlers must be the
// sandbox's, not the app's.
//
// It defines a boot function rather than running on load. Writing the document
// and *then* attaching the module map would be a race; instead the parent calls
// `__REACTLAB_BOOT__` once the frame is ready, passing everything in.
const RUNTIME = `
window.__REACTLAB_BOOT__ = function (modules, builtins, entry) {
  var cache = {};

  function fail(label, err) {
    var text = err && (err.stack || err.message) ? (err.stack || err.message) : String(err);
    var root = document.getElementById('root');
    if (root) {
      root.innerHTML = '<div class="sandbox-error"><strong>' + label + '</strong><br/>' +
        String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</div>';
    }
    try { window.parent.postMessage({ type: 'SANDBOX_ERROR', error: String(text) }, '*'); } catch (e) {}
  }

  window.onerror = function (msg, url, line, col, err) { fail('Runtime Error', err || msg); return true; };
  window.addEventListener('unhandledrejection', function (e) { fail('Unhandled Rejection', e.reason); });

  // Resolve './thing' and '../thing' against the importing file, trying the
  // extensions and index files a bundler would try. Bare specifiers come from
  // the registry the parent injected.
  function resolve(from, spec) {
    if (spec.charAt(0) !== '.') return null;
    var base = from.split('/').slice(0, -1).filter(Boolean);
    var parts = spec.split('/');
    for (var i = 0; i < parts.length; i++) {
      if (parts[i] === '.' || parts[i] === '') continue;
      if (parts[i] === '..') base.pop();
      else base.push(parts[i]);
    }
    var joined = '/' + base.join('/');
    var candidates = [joined, joined + '.js', joined + '.jsx', joined + '.ts', joined + '.tsx',
                      joined + '/index.js', joined + '/index.jsx', joined + '/index.ts', joined + '/index.tsx'];
    for (var c = 0; c < candidates.length; c++) {
      if (Object.prototype.hasOwnProperty.call(modules, candidates[c])) return candidates[c];
    }
    return joined;
  }

  function requireFrom(from) {
    return function (spec) {
      if (/\\.css$/.test(spec)) return {};
      var path = resolve(from, spec);
      if (path === null) {
        if (Object.prototype.hasOwnProperty.call(builtins, spec)) return builtins[spec];
        throw new Error('Cannot resolve "' + spec + '" offline. This lesson needs a package that is not bundled with the app; reconnect to run it.');
      }
      if (cache[path]) return cache[path].exports;
      if (!Object.prototype.hasOwnProperty.call(modules, path)) {
        throw new Error('Cannot resolve "' + spec + '" from "' + from + '".');
      }
      var module = { exports: {} };
      cache[path] = module;
      var fn = new Function('require', 'module', 'exports', modules[path]);
      fn(requireFrom(path), module, module.exports);
      return module.exports;
    };
  }

  try {
    var exported = requireFrom('/index.js')('.' + entry);
    var App = exported && (exported.default || exported.App);
    if (typeof App !== 'function') {
      fail('Nothing to render', new Error('This file has no default export, so there is no component to render.'));
      return;
    }
    var ReactRuntime = builtins['react'];
    var ClientRuntime = builtins['react-dom/client'];
    ClientRuntime.createRoot(document.getElementById('root')).render(
      ReactRuntime.createElement(ReactRuntime.StrictMode, null, ReactRuntime.createElement(App))
    );
  } catch (err) {
    fail('Error', err);
  }
};
`;

/**
 * The iframe document. The lesson's compiled modules and the package registry
 * are attached to the frame by `OfflinePreview` *before* this runs, so the
 * runtime above finds them on `window`.
 */
export function createLocalSandboxHtml(stylesheet = '') {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body {
      background-color: #141413;
      color: #f5f4ee;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 16px;
      margin: 0;
      box-sizing: border-box;
    }
    * { box-sizing: border-box; }
    #root { min-height: 100%; }
    .sandbox-error {
      background-color: rgba(193, 95, 60, 0.15);
      border: 1px solid #c15f3c;
      color: #fca5a5;
      padding: 14px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 0.85rem;
      white-space: pre-wrap;
    }
  </style>
  <style>${stylesheet}</style>
</head>
<body>
  <div id="root"></div>
  <!-- The closing tag is assembled rather than written literally: this file is
       itself JavaScript, and a literal </script> inside it would end the script
       block early anywhere the bundle is inlined into a page. -->
  <script>${RUNTIME}${'<'}/script>
</body>
</html>`;
}
