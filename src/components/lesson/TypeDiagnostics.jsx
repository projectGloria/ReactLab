// v1 — 2026-09-14 — real tsc output for the TypeScript modules.
//
// Sandpack strips types with Babel and runs the JavaScript underneath, so a
// TypeScript lesson used to be the one place in this app where the thing being
// taught was invisible: the reader could write `const x: number = 'hello'` and
// watch it run. This panel reports what `tsc --strict` would say about the file
// currently in the editor, updated as it is edited.
//
// It reports and does not block. The playground still runs whatever the learner
// wrote, which is the honest model of how TypeScript actually works in a build.
import { useMemo } from 'react';
import { useSandpack } from '@codesandbox/sandpack-react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import useTypeCheck from '../../lib/useTypeCheck.js';

const ENTRY_CANDIDATES = ['/App.tsx', '/App.ts'];

const shellStyle = {
  padding: '10px 14px',
  borderTop: '1px solid var(--border-subtle)',
  backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.15))',
  fontSize: '0.76rem',
  lineHeight: 1.5,
  color: 'var(--text-secondary)',
  maxHeight: '190px',
  overflowY: 'auto',
};

export default function TypeDiagnostics({ enabled = true }) {
  const { sandpack } = useSandpack();

  const code = useMemo(() => {
    if (!enabled) return '';
    const entry = ENTRY_CANDIDATES.find((path) => sandpack.files[path]) ?? sandpack.activeFile;
    return sandpack.files[entry]?.code ?? '';
  }, [enabled, sandpack.files, sandpack.activeFile]);

  const { diagnostics, status } = useTypeCheck(code, enabled && code.length > 0);

  if (!enabled) return null;

  if (status === 'unavailable') {
    return (
      <div style={shellStyle} role="status">
        <AlertCircle size={14} style={{ verticalAlign: '-2px', marginRight: '6px', color: 'var(--warning)' }} />
        Type checking could not start in this build, so the playground is running untyped. Nothing else changes.
      </div>
    );
  }

  if (status === 'idle') return null;

  if (status === 'checking' && diagnostics.length === 0) {
    return (
      <div style={shellStyle} role="status">
        <Loader2 size={14} style={{ verticalAlign: '-2px', marginRight: '6px' }} />
        Type checking…
      </div>
    );
  }

  if (diagnostics.length === 0) {
    return (
      <div style={shellStyle} role="status">
        <CheckCircle2 size={14} style={{ verticalAlign: '-2px', marginRight: '6px', color: 'var(--success-solid)' }} />
        <strong style={{ color: 'var(--success-solid)' }}>No type errors.</strong>{' '}
        Checked with <code>strict</code> on, the same settings a new project ships with.
      </div>
    );
  }

  return (
    <div style={shellStyle} role="status" aria-live="polite">
      <div style={{ marginBottom: '8px', color: 'var(--warning)', fontWeight: 600 }}>
        <AlertCircle size={14} style={{ verticalAlign: '-2px', marginRight: '6px' }} />
        {diagnostics.length} type {diagnostics.length === 1 ? 'error' : 'errors'}
        {status === 'checking' ? ' (rechecking…)' : ''}
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '6px' }}>
        {diagnostics.map((d, index) => (
          <li key={`${d.code}-${d.line}-${d.column}-${index}`} style={{ display: 'flex', gap: '8px' }}>
            <span
              style={{
                flexShrink: 0,
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--text-tertiary, var(--text-secondary))',
              }}
            >
              {d.line}:{d.column}
            </span>
            <span>
              {d.message}{' '}
              <span style={{ opacity: 0.6 }}>(ts{d.code})</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
