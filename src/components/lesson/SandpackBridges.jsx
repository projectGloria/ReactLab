import { useEffect, useRef } from 'react';
import { useSandpack } from '@codesandbox/sandpack-react';
import { cacheExample } from '../../lib/exampleEditCache.js';
import { isInternalSandpackFile } from './useLessonSandpack.js';
import { formatCode } from '../../lib/formatter.js';

// Render-nothing components that live inside <SandpackProvider> purely to reach
// the Sandpack context, which is only readable from a descendant. Each one wires
// a single piece of Sandpack state back out to the lesson view.

/**
 * Persists the learner's edits so reopening a lesson restores their playground.
 *
 * `ownedFiles` is the lesson's own file list. Only those are cached: everything
 * else in `sandpack.files` belongs to the react template, and storing the
 * template's placeholder `/App.js` alongside the lesson's was what let a
 * second visit to a lesson open on "Hello world".
 */
export function SandpackCacher({ lessonId, ownedFiles }) {
  const { sandpack } = useSandpack();
  useEffect(() => {
    const lessonFiles = {};
    for (const [filePath, file] of Object.entries(sandpack.files || {})) {
      if (isInternalSandpackFile(filePath)) continue;
      if (ownedFiles && !ownedFiles.includes(filePath)) continue;
      lessonFiles[filePath] = file.code;
    }

    const timeoutId = setTimeout(() => {
      if (Object.keys(lessonFiles).length > 0) {
        cacheExample(lessonId, lessonFiles);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [sandpack.files, lessonId, ownedFiles]);

  return null;
}

// SandpackResetter lived here: it called sandpack.resetAllFiles() whenever the
// reset button bumped resetKey. That key is also part of the provider's React
// key, so bumping it already unmounts the provider and builds a fresh one from
// the lesson's authored files -- the reset ran against an instance that had just
// been created and had nothing to undo.

/** Feeds the current code and any runtime error to the AI mentor panel. */
export function SandpackContextReporter({ onContext }) {
  const { sandpack } = useSandpack();

  useEffect(() => {
    const code = Object.entries(sandpack.files || {})
      .map(([filePath, file]) => `// ${filePath}\n${file.code || ''}`)
      .join('\n\n');
    const runtimeError = sandpack.error?.message || sandpack.error || '';
    onContext({ code, runtimeError: String(runtimeError) });
  }, [onContext, sandpack.error, sandpack.files]);

  return null;
}

/**
 * Runs the stylesheet through Prettier once when a lesson opens, so CSS is
 * readable on arrival instead of requiring a manual Ctrl+S in the styles.css
 * tab every time.
 *
 * Scoped to .css deliberately. Component files are the learner's own work and
 * reformatting them under the cursor on load would be intrusive; the
 * stylesheet is scaffolding, and its shape carries no intent worth preserving.
 * formatCode returns the input untouched on a parse error, so partially
 * written CSS is never mangled.
 */
export function SandpackCssFormatter({ lessonId }) {
  const { sandpack } = useSandpack();
  const formattedForLesson = useRef(null);

  useEffect(() => {
    if (!lessonId || formattedForLesson.current === lessonId) return;
    const cssPaths = Object.keys(sandpack.files || {}).filter((p) => p.endsWith('.css'));
    if (cssPaths.length === 0) return;

    formattedForLesson.current = lessonId;
    let cancelled = false;

    (async () => {
      for (const filePath of cssPaths) {
        const original = sandpack.files[filePath]?.code;
        if (!original) continue;
        const formatted = await formatCode(original, filePath);
        // Re-check the file still holds what we formatted: the learner may
        // have typed while Prettier was working, and clobbering that would be
        // worse than leaving the file unformatted.
        if (cancelled || formatted === original) continue;
        if (sandpack.files[filePath]?.code !== original) continue;
        sandpack.updateFile(filePath, formatted);
      }
    })();

    return () => { cancelled = true; };
  }, [lessonId, sandpack]);

  return null;
}
