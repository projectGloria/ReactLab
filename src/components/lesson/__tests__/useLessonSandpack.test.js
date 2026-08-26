import { describe, it, expect, beforeEach } from 'vitest';
import { buildLessonFiles, orderLessonFiles } from '../useLessonSandpack.js';
import { cacheExample, clearCachedExample } from '../../../lib/exampleEditCache.js';

// These guard the playground's file map. Every lesson's right-hand editor is
// built here, and the bugs this file replaces were all invisible on a lesson's
// first visit -- they only appeared the second time a lesson was opened, once
// the edit cache had something in it.

const LESSON_ID = 'test-lesson';
const AUTHORED = "import './styles.css';\n\nexport default function Invoice() {\n  return <p>authored</p>;\n}";

// What Sandpack's own react template ships as its entry file. When this leaks
// out of the cache and into a lesson's file map, the learner sees it instead of
// the lesson.
const TEMPLATE_APP = 'export default function App() {\n  return <h1>Hello world</h1>\n}';

describe('buildLessonFiles', () => {
  beforeEach(() => clearCachedExample(LESSON_ID));

  it('uses the lesson\'s authored code as the entry file', () => {
    const files = buildLessonFiles(AUTHORED, 'js-fundamentals', LESSON_ID);
    expect(files['/App.js'].code).toBe(AUTHORED);
    expect(files['/styles.css'].code).toContain('box-sizing');
  });

  it('restores the learner\'s edits on a second visit', () => {
    const edited = AUTHORED.replace('authored', 'edited by me');
    cacheExample(LESSON_ID, { '/App.js': edited });
    const files = buildLessonFiles(AUTHORED, 'js-fundamentals', LESSON_ID);
    expect(files['/App.js'].code).toBe(edited);
  });

  it('never lets a cached template file replace the lesson\'s entry file', () => {
    // A lesson whose entry file is /App.tsx: the react template still puts its
    // own /App.js in sandpack.files, so the cache can carry both.
    const tsAuthored = "import './styles.css';\n\ninterface Props { id: string }\nexport default function Row(p: Props) { return <li>{p.id}</li>; }";
    cacheExample(LESSON_ID, { '/App.js': TEMPLATE_APP, '/App.tsx': tsAuthored });
    const files = buildLessonFiles(tsAuthored, 'typescript', LESSON_ID);
    expect(Object.keys(files)).not.toContain('/App.js');
    expect(files['/App.tsx'].code).toBe(tsAuthored);
  });

  it('ignores cached paths the lesson does not own', () => {
    cacheExample(LESSON_ID, { '/App.js': AUTHORED, '/index.js': 'render(<App />)' });
    const files = buildLessonFiles(AUTHORED, 'js-fundamentals', LESSON_ID);
    expect(Object.keys(files).sort()).toEqual(['/App.js', '/styles.css']);
  });

  it('ignores an empty cached file rather than blanking the playground', () => {
    cacheExample(LESSON_ID, { '/App.js': '' });
    const files = buildLessonFiles(AUTHORED, 'js-fundamentals', LESSON_ID);
    expect(files['/App.js'].code).toBe(AUTHORED);
  });

  it('returns null when a lesson has no example code', () => {
    expect(buildLessonFiles('', 'js-fundamentals', LESSON_ID)).toBeNull();
  });
});

describe('orderLessonFiles', () => {
  it('opens a lesson on its code, never on the stylesheet', () => {
    expect(orderLessonFiles(['/styles.css', '/App.js'])[0]).toBe('/App.js');
    expect(orderLessonFiles(['/styles.css', '/App.tsx'])[0]).toBe('/App.tsx');
  });

  it('puts every stylesheet after every component file', () => {
    const ordered = orderLessonFiles(['/theme.css', '/Widget.js', '/styles.css', '/App.js']);
    expect(ordered).toEqual(['/App.js', '/Widget.js', '/styles.css', '/theme.css']);
  });

  it('does not mutate its input', () => {
    const input = ['/styles.css', '/App.js'];
    orderLessonFiles(input);
    expect(input).toEqual(['/styles.css', '/App.js']);
  });
});
