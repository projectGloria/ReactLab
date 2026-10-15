// v1 — 2026-09-14 — the playground's offline path.
//
// Sandpack compiles through a hosted bundler. With no connection it renders a
// spinner forever and says nothing, which is the worst possible answer for an
// app that calls itself offline-first. This renders the same lesson locally
// instead: Babel-standalone transpiles it in the browser, and a require shim
// inside a same-origin iframe resolves imports against packages the app already
// bundles (see BUILTIN_MODULES in localBundler.js).
//
// It is intentionally *only* a preview -- no editor, no file tabs, no live
// error overlay. Sandpack remains the experience when a connection exists; this
// exists so that losing one costs you the extra tooling, not the lesson.
import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { BUILTIN_MODULES, buildOfflineModules, createLocalSandboxHtml } from '../../lib/localBundler.js';

export default function OfflinePreview({ files, entryFile = '/App.js' }) {
  const frameRef = useRef(null);
  const [bootError, setBootError] = useState(null);

  // Transpiling is the expensive part, so it happens once per code change
  // rather than once per render.
  const bundle = useMemo(() => buildOfflineModules(files), [files]);

  useEffect(() => {
    setBootError(null);
    if (!bundle.ok) return;

    const frame = frameRef.current;
    if (!frame) return;

    let cancelled = false;
    const boot = () => {
      if (cancelled) return;
      try {
        const win = frame.contentWindow;
        if (!win?.__REACTLAB_BOOT__) return;
        win.__REACTLAB_BOOT__(bundle.modules, BUILTIN_MODULES, entryFile);
      } catch (err) {
        setBootError(err.message);
      }
    };

    frame.addEventListener('load', boot);
    // srcdoc assignment reloads the frame, which is what re-runs the lesson.
    frame.srcdoc = createLocalSandboxHtml(bundle.stylesheet);

    return () => {
      cancelled = true;
      frame.removeEventListener('load', boot);
    };
  }, [bundle, entryFile]);

  if (!bundle.ok || bootError) {
    return (
      <div style={{
        height: '100%', overflow: 'auto', padding: '16px',
        backgroundColor: 'rgba(193, 95, 60, 0.08)', color: '#fca5a5',
        fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem', whiteSpace: 'pre-wrap', lineHeight: 1.6,
      }}>
        <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <AlertTriangle size={15} /> {bundle.ok ? 'Could not start the offline preview' : 'Compile error'}
        </strong>
        {bootError || bundle.error}
      </div>
    );
  }

  return (
    <iframe
      ref={frameRef}
      title="Offline preview"
      sandbox="allow-scripts allow-same-origin allow-modals"
      style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#141413' }}
    />
  );
}
