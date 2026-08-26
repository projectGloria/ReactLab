import { useMemo } from 'react';
import { getCachedExample } from '../../lib/exampleEditCache.js';

// Files Sandpack's react template generates for itself. They are not lesson
// content, so they are excluded from the editor tabs and from the cached example.
export const INTERNAL_SANDPACK_FILES = [
  '/index.js',
  '/index.tsx',
  '/index.html',
  '/package.json',
  '/public/index.html',
];

export const isInternalSandpackFile = (filePath) => INTERNAL_SANDPACK_FILES.includes(filePath);

/**
 * Tab order for a lesson's files: component files first, stylesheets last,
 * alphabetical within each group. Shared with SandpackFileTabs so the strip the
 * learner sees and the file the provider opens can never disagree.
 *
 * The code is the lesson; the stylesheet is scaffolding, so a lesson never
 * opens on styles.css.
 */
export function orderLessonFiles(filePaths) {
  return [...filePaths].sort((a, b) => {
    const isACss = a.endsWith('.css');
    const isBCss = b.endsWith('.css');
    if (isACss !== isBCss) return isACss ? 1 : -1;
    return a.localeCompare(b);
  });
}

const DEFAULT_STYLES = `body {
  background-color: #141413;
  color: #ededed;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 20px;
  margin: 0;
  box-sizing: border-box;
}

* {
  box-sizing: border-box;
}
`;

/**
 * Builds a lesson's Sandpack file map: the lesson's authored code as the entry
 * file, the shared stylesheet, and the learner's saved edits layered on top.
 *
 * Exported separately from the hook so the cache round-trip is testable without
 * a renderer — that round-trip is where the "Hello world" playground bug lived.
 */
export function buildLessonFiles(authoredCode, moduleId, lessonId) {
  if (!authoredCode) return null;

  const isTS = authoredCode.includes('type ') ||
               authoredCode.includes('interface ') ||
               authoredCode.includes(': Props') ||
               authoredCode.includes('<boolean>') ||
               moduleId === 'typescript';

  const mainFileName = isTS ? '/App.tsx' : '/App.js';

  const lessonFiles = {
    [mainFileName]: { code: authoredCode, active: true },
    '/styles.css': { code: DEFAULT_STYLES },
  };

  // Layer the learner's saved edits over the lesson's own files, and only over
  // those. The cache is filled from `sandpack.files`, which also holds whatever
  // the react template contributed — including its placeholder `/App.js`
  // ("Hello world"). Restoring the cache wholesale therefore used to overwrite
  // the lesson's entry file with the template's, which is why a lesson opened a
  // second time showed code belonging to no lesson at all.
  const cached = getCachedExample(lessonId);
  if (cached && typeof cached === 'object') {
    for (const [filePath, value] of Object.entries(cached)) {
      if (!Object.hasOwn(lessonFiles, filePath)) continue;
      const code = typeof value === 'string' ? value : value?.code;
      if (typeof code !== 'string' || code.length === 0) continue;
      lessonFiles[filePath] = { ...lessonFiles[filePath], code };
    }
  }

  return lessonFiles;
}

/**
 * Derives everything the Sandpack provider needs from a parsed lesson: the file
 * map, which files get editor tabs, which one opens first, and the dependency
 * set. Kept out of the view so the bundling rules live in one place rather than
 * as four memos threaded through the layout.
 *
 * `resetKey` participates because the reset button clears the edit cache and
 * bumps it; without it in the dependency list this memo would hand the freshly
 * remounted provider the very edits the learner just asked to throw away.
 */
export default function useLessonSandpack(parsedLesson, moduleId, resetKey = 0) {
  const lessonId = parsedLesson?.id;
  const authoredCode = typeof parsedLesson?.executableExample === 'string'
    ? parsedLesson.executableExample
    : '';

  const files = useMemo(
    () => buildLessonFiles(authoredCode, moduleId, lessonId),
    [authoredCode, moduleId, lessonId, resetKey],
  );

  // Ordered exactly as SandpackFileTabs renders them, so "the first tab" and
  // "the first visible file" are the same file. When they disagreed, the tab
  // strip and the provider's `activeFile` option each tried to correct the
  // other on every render, which is what exhausted React's update depth.
  const visibleFiles = useMemo(
    () => (files ? orderLessonFiles(Object.keys(files)) : []),
    [files],
  );

  const activeFile = useMemo(() => visibleFiles[0], [visibleFiles]);

  // Six lessons -- the Testing module plus `testing-error-boundaries` -- have a
  // test file as their example. A test file exports no component, so Sandpack's
  // entry does `import App from "./App"` and gets `undefined`, and the preview
  // pane fills with a runtime error instead of anything a reader can learn from.
  // Those lessons show the editor only: the code is there to be read, and it
  // could not run here regardless, since the sandbox has no test runner.
  const isRunnable = useMemo(() => /export\s+default/.test(authoredCode), [authoredCode]);

  // React 19 is pinned explicitly since the curriculum covers useActionState/useOptimistic.
  const customSetup = useMemo(() => ({
    dependencies: {
      ...parsedLesson?.dependencies,
      'react': '^19.0.0',
      'react-dom': '^19.0.0',
    },
  }), [parsedLesson?.dependencies]);

  return { files, visibleFiles, activeFile, customSetup, isRunnable };
}
