// v1 — 2026-09-14 — swaps Sandpack's hosted preview for the local one offline.
//
// Reads the live file map out of the Sandpack provider so the learner's own
// edits are what runs, filters out the files the template contributed (its
// placeholder entry, package.json, the public HTML -- none of which Babel should
// see), and hands the rest to OfflinePreview.
//
// Renders `children` unchanged whenever there is a connection, or whenever the
// lesson needs a package this app does not bundle. Those lessons still say so
// out loud via SandpackOfflineNotice rather than failing quietly.
import { useSandpack } from '@codesandbox/sandpack-react';
import OfflinePreview from './OfflinePreview.jsx';
import { useIsOnline } from './SandpackOfflineNotice.jsx';
import { canRunOffline } from '../../lib/localBundler.js';
import { isInternalSandpackFile } from './useLessonSandpack.js';

const RUNNABLE = /\.(jsx?|tsx?|css)$/;

export default function SandpackOfflineFallback({ dependencies, entryFile = '/App.js', children }) {
  const isOnline = useIsOnline();
  const { sandpack } = useSandpack();

  if (isOnline || !canRunOffline(dependencies)) return children;

  const files = {};
  for (const [path, file] of Object.entries(sandpack.files || {})) {
    if (isInternalSandpackFile(path) || !RUNNABLE.test(path)) continue;
    files[path] = file.code;
  }

  return <OfflinePreview files={files} entryFile={entryFile} />;
}
