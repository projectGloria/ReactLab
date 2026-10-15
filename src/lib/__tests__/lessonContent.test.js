import { describe, it, expect } from 'vitest';
import babel from '@babel/standalone';
import curriculum, { TOTAL_LESSONS } from '../../curriculum/index.js';
import { parseLessonContent } from '../lessonContent.js';
import { sectionSlug, extractLessonSections } from '../lessonMarkdown.js';
import { isTypeScriptModule } from '../../components/lesson/useLessonSandpack.js';

const FENCE = /^```([a-zA-Z]*)\n([\s\S]*?)^```/gm;

/** Every fenced block in a piece of markdown, as { lang, body }. */
function fencedBlocks(markdown) {
  const blocks = [];
  let match;
  FENCE.lastIndex = 0;
  while ((match = FENCE.exec(markdown))) blocks.push({ lang: match[1], body: match[2] });
  return blocks;
}

// These guard the lesson-markdown parser that LessonView relies on. Every lesson
// in the curriculum runs through it, so a regression here silently breaks hints,
// the challenge brief, or the playground for whichever lessons happen to trip it.

const allLessons = [];
for (const moduleMeta of curriculum) {
  const mod = (await import(`../../curriculum/modules/${moduleMeta.id}.js`)).default;
  for (const lesson of mod.lessons) allLessons.push({ moduleId: moduleMeta.id, lesson });
}

describe('parseLessonContent', () => {
  it('covers every lesson in the curriculum', () => {
    // Tied to the registry's own count rather than a literal, so adding a lesson
    // updates one number instead of leaving this test to be edited after the fact.
    expect(allLessons).toHaveLength(TOTAL_LESSONS);
  });

  for (const { moduleId, lesson } of allLessons) {
    describe(`${moduleId}/${lesson.id}`, () => {
      const parsed = parseLessonContent(lesson, moduleId);

      it('returns the shape LessonView renders', () => {
        expect(parsed.id).toBe(lesson.id);
        expect(parsed.moduleId).toBe(moduleId);
        expect(typeof parsed.displayContent).toBe('string');
        expect(Array.isArray(parsed.hints)).toBe(true);
        expect(Array.isArray(parsed.sections)).toBe(true);
        expect(Array.isArray(parsed.insights)).toBe(true);
        expect(typeof parsed.challengeDesc).toBe('string');
        expect(typeof parsed.solutionDesc).toBe('string');
      });

      it('always produces non-empty playground code', () => {
        const example = parsed.executableExample;
        expect(typeof example === 'string' || typeof example === 'object').toBe(true);
        if (typeof example === 'string') {
          expect(example.length).toBeGreaterThan(0);
          // Where the snippet defines a component, the parser must give Sandpack an
          // entry point. Test-file examples (RTL, vitest, MSW) legitimately define no
          // component and are shown as code to read rather than rendered.
          const definesComponent = /function\s+[A-Z]\w*\s*\(/.test(example);
          if (definesComponent) expect(example).toContain('export default');
        }
      });

      it('strips the extracted sections out of the rendered prose', () => {
        // Hints, the challenge brief, the step-by-step block, and the example are
        // all rendered by dedicated UI, so none may also appear inline in the
        // prose pane. The example is the one that used to leak: it rendered as a
        // read-only editor directly above the live playground running the same
        // code.
        expect(parsed.displayContent).not.toMatch(/^### Hints/im);
        expect(parsed.displayContent).not.toMatch(/^### (?:Your Task|Challenge and Solution|Challenge)/im);
        expect(parsed.displayContent).not.toMatch(/^### Step-by-step Explanation/im);
        expect(parsed.displayContent).not.toMatch(/^### (?:Example|Code Example \(Playground\)|The Problem)/im);
      });

      it('keeps lecture prose after the example section is removed', () => {
        // Guards the removal regex: an over-greedy match here would silently eat
        // the rest of the lesson.
        expect(parsed.displayContent.length).toBeGreaterThan(400);
      });

      it('gives every section a usable id and title', () => {
        for (const section of parsed.sections) {
          expect(section.id).toBeTruthy();
          expect(section.title).toBeTruthy();
          expect(section.content.length).toBeGreaterThan(0);
        }
      });
    });
  }

  it('runs the same code in the playground and the step-through', () => {
    // The bug this locks out: the playground reads the `### Example` block from
    // the markdown while "Explain step-by-step" reads `exampleWalkthrough.code`,
    // and nothing connected them. 74 of 84 lessons had drifted into explaining
    // one program while running a different one.
    const drifted = allLessons
      .filter(({ moduleId, lesson }) => {
        const playground = parseLessonContent(lesson, moduleId).executableExample.trim();
        return playground !== String(lesson.exampleWalkthrough?.code ?? '').trim();
      })
      .map(({ lesson }) => lesson.id);
    expect(drifted).toEqual([]);
  });

  it('highlights only lines the example actually has', () => {
    // A step pointing past the end of the code highlights nothing, silently.
    const bad = [];
    for (const { lesson } of allLessons) {
      const lineCount = String(lesson.exampleWalkthrough?.code ?? '').trim().split('\n').length;
      (lesson.exampleWalkthrough?.steps ?? []).forEach((step, i) => {
        for (const line of step.highlightLines ?? []) {
          if (line < 1 || line > lineCount) bad.push(`${lesson.id} step ${i}: line ${line} of ${lineCount}`);
        }
      });
    }
    expect(bad).toEqual([]);
  });

  it('closes every fenced code block', () => {
    // An odd number of fence markers means one block runs to the end of the
    // lesson, swallowing the prose after it.
    const unbalanced = allLessons
      .filter(({ lesson }) => ((lesson.content || '').match(/```/g) || []).length % 2 !== 0)
      .map(({ lesson }) => lesson.id);
    expect(unbalanced).toEqual([]);
  });

  it('labels every prose code block with the language it actually contains', () => {
    // One rule across the curriculum: `jsx` when the block contains a JSX
    // element, `javascript` when it does not, `tsx` for TypeScript. 21 blocks
    // were mislabelled in the other direction before this was pinned.
    const hasJsx = (s) => /<[A-Za-z][\w.]*(\s|\/|>)/.test(s) || /<>/.test(s);
    const wrong = [];
    for (const { moduleId, lesson } of allLessons) {
      for (const { lang, body } of fencedBlocks(parseLessonContent(lesson, moduleId).displayContent)) {
        if (!lang) { wrong.push(`${lesson.id}: untagged block`); continue; }
        if (lang === 'tsx') continue;
        const want = hasJsx(body) ? 'jsx' : 'javascript';
        if (lang !== want) wrong.push(`${lesson.id}: tagged ${lang}, should be ${want}`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it('keeps every prose code block parseable', () => {
    // This is what the reader actually sees go wrong. The editor showing these
    // snippets highlights by parsing them, and an unterminated construct -- a
    // JSX tag that never closes, a literal `...` inside braces -- leaves the
    // parser in an error state through to the end of the block, so everything
    // after the break renders as plain unhighlighted text. Comments losing
    // their grey is the usual first symptom.
    const broken = [];
    for (const { moduleId, lesson } of allLessons) {
      for (const { lang, body } of fencedBlocks(parseLessonContent(lesson, moduleId).displayContent)) {
        if (!['js', 'jsx', 'javascript', 'ts', 'tsx'].includes(lang)) continue;
        const isTS = lang === 'ts' || lang === 'tsx' || isTypeScriptModule(moduleId);
        try {
          babel.transform(body, {
            presets: isTS ? ['react', 'typescript'] : ['react'],
            filename: isTS ? 'snippet.tsx' : 'snippet.jsx',
          });
        } catch (error) {
          broken.push(`${lesson.id}: ${String(error.message).split('\n')[0]}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it('uses one heading for the playground example', () => {
    // The parser accepts three spellings for historical reasons; the curriculum
    // should only ever contain one.
    const odd = allLessons
      .filter(({ lesson }) => !/^### Example$/m.test(lesson.content || ''))
      .map(({ lesson }) => lesson.id);
    expect(odd).toEqual([]);
  });

  it('keeps the dead stylesheet import out of every playground', () => {
    // Sandpack's own entry file already imports styles.css, so the line is a
    // no-op. 40 lessons wrote it anyway and the parser prepended a second copy.
    // Authors may still write it; it gets stripped either way.
    const offenders = allLessons
      .map(({ moduleId, lesson }) => [lesson.id, parseLessonContent(lesson, moduleId).executableExample])
      .filter(([, code]) => /import\s+['"]\.\/styles\.css['"]/.test(String(code)))
      .map(([id]) => id);
    expect(offenders).toEqual([]);
  });

  it('finds hints for every lesson that ships a challenge', () => {
    const withChallenge = allLessons.filter(({ lesson }) => lesson.starterCode);
    const hintless = withChallenge
      .filter(({ moduleId, lesson }) => parseLessonContent(lesson, moduleId).hints.length === 0)
      .map(({ lesson }) => lesson.id);
    expect(hintless).toEqual([]);
  });

  it('sources every lesson hint from the lesson markdown itself', () => {
    // The hardcoded DEFAULT_HINTS fallback was removed because all 52 of its
    // entries had become unreachable. This is the invariant that made it dead and
    // that keeps it dead: hints live in the lesson, next to the content they hint at.
    const withoutOwnHints = allLessons
      .filter(({ lesson }) => lesson.starterCode)
      .filter(({ lesson }) => !/### Hints/i.test(lesson.content || ''))
      .map(({ lesson }) => lesson.id);
    expect(withoutOwnHints).toEqual([]);
  });
});

describe('lessonMarkdown', () => {
  it('slugifies heading text into stable anchor ids', () => {
    expect(sectionSlug('Why do we need it?')).toBe('why-do-we-need-it');
    expect(sectionSlug('`useState` Basics')).toBe('usestate-basics');
    expect(sectionSlug('')).toBe('overview');
    expect(sectionSlug('', 'fallback-id')).toBe('fallback-id');
  });

  it('ignores headings inside fenced code blocks', () => {
    const markdown = [
      '## Real Heading',
      'prose',
      '```js',
      '// ## Not A Heading',
      '```',
      '## Second Heading',
    ].join('\n');
    const titles = extractLessonSections(markdown, 'Lesson').map((s) => s.title);
    expect(titles).toEqual(['Lesson overview', 'Real Heading', 'Second Heading']);
  });
});
