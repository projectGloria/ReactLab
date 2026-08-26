import * as Babel from '@babel/standalone';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import * as ReactRouterDOM from 'react-router-dom';
import * as Zustand from 'zustand';
import * as FramerMotion from 'framer-motion';
import * as LucideReact from 'lucide-react';

// Registry of built-in curriculum dependencies available offline
export const BUILTIN_MODULES = {
  'react': React,
  'react-dom': ReactDOM,
  'react-dom/client': ReactDOM,
  'react-router-dom': ReactRouterDOM,
  'zustand': Zustand,
  'framer-motion': FramerMotion,
  'lucide-react': LucideReact,
};

/**
 * Transpile JSX / ES Modules code completely in-memory on the client without network.
 */
export function transpileCode(code, filename = 'App.jsx') {
  try {
    const isTypeScript = filename.endsWith('.ts') || filename.endsWith('.tsx');
    const presets = [
      ['react', { runtime: 'classic' }],
      ['env', { modules: 'commonjs', targets: { esmodules: true } }],
    ];
    if (isTypeScript) {
      presets.push('typescript');
    }

    const transformed = Babel.transform(code, {
      filename,
      presets,
      plugins: [],
    });

    return { ok: true, code: transformed.code };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/**
 * Build a standalone self-executing HTML document for iframe evaluation
 */
export function createLocalSandboxHtml(files, options = {}) {
  const fileEntries = typeof files === 'string'
    ? { '/App.jsx': files }
    : files;

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
  ${files['/styles.css'] ? `<style>${files['/styles.css'].code || files['/styles.css']}</style>` : ''}
</head>
<body>
  <div id="root"></div>
  <script>
    (function() {
      // Catch runtime errors and report to parent
      window.onerror = function(msg, url, line, col, err) {
        var errorText = err ? err.stack || err.message : msg;
        var root = document.getElementById('root');
        if (root) {
          root.innerHTML = '<div class="sandbox-error"><strong>Runtime Error:</strong><br/>' + errorText + '</div>';
        }
        window.parent.postMessage({ type: 'SANDBOX_ERROR', error: errorText }, '*');
        return true;
      };

      window.addEventListener('unhandledrejection', function(event) {
        var errorText = event.reason ? event.reason.stack || event.reason.message || event.reason : 'Unhandled Promise Rejection';
        var root = document.getElementById('root');
        if (root) {
          root.innerHTML = '<div class="sandbox-error"><strong>Unhandled Rejection:</strong><br/>' + errorText + '</div>';
        }
        window.parent.postMessage({ type: 'SANDBOX_ERROR', error: errorText }, '*');
      });
    })();
  </script>
</body>
</html>`;
}
