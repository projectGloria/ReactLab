// v1 — 2026-09-14 — surface the one thing the playground cannot do offline.
//
// Sandpack bundles through a hosted service (no `bundlerURL` override is set),
// and several lessons fetch from a public API. With no connection both fail the
// same way: a blank iframe and no explanation, which reads as "the app is
// broken" rather than "you are offline". This says which it is.
//
// Written with useSyncExternalStore on purpose — it is the exact `navigator.onLine`
// subscription the Custom Hooks module teaches, running in the app that teaches it.
import { useSyncExternalStore } from 'react';
import { WifiOff } from 'lucide-react';
import { canRunOffline } from '../../lib/localBundler.js';

function subscribe(callback) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

const getSnapshot = () => navigator.onLine;
const getServerSnapshot = () => true;

export function useIsOnline() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function SandpackOfflineNotice({ dependencies }) {
  const isOnline = useIsOnline();
  if (isOnline) return null;

  const runsLocally = canRunOffline(dependencies);
  if (runsLocally) {
    return (
      <div
        role="status"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          padding: '10px 14px',
          backgroundColor: 'rgba(120, 140, 93, 0.12)',
          borderBottom: '1px solid rgba(120, 140, 93, 0.35)',
          color: 'var(--text-secondary)',
          fontSize: '0.78rem',
          lineHeight: 1.5,
        }}
      >
        <WifiOff size={15} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--success-solid)' }} />
        <span>
          <strong style={{ color: 'var(--success-solid)' }}>Offline — running locally.</strong>{' '}
          The preview is compiled in your browser instead of the hosted bundler, so this lesson
          still works. You lose the live error overlay and the refresh button until the connection
          is back; everything else is unchanged.
        </span>
      </div>
    );
  }

  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '10px 14px',
        backgroundColor: 'rgba(217, 160, 87, 0.12)',
        borderBottom: '1px solid rgba(217, 160, 87, 0.35)',
        color: 'var(--text-secondary)',
        fontSize: '0.78rem',
        lineHeight: 1.5,
      }}
    >
      <WifiOff size={15} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--warning)' }} />
      <span>
        <strong style={{ color: 'var(--warning)' }}>Offline — this lesson needs a connection.</strong>{' '}
        Most playgrounds compile locally when you are offline, but this one imports a package the app
        does not bundle, so it has to use the hosted bundler. The lesson, walkthrough, hints and your
        progress all keep working. Lessons that fetch from a public API will also come back empty.
      </span>
    </div>
  );
}
