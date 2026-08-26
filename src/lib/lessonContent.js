import { LESSON_ENHANCEMENTS } from '../curriculum/lessonEnhancements.js';
import { extractLessonSections } from './lessonMarkdown.js';

/**
 * Removes `import './styles.css'` from a lesson's example code.
 *
 * The line does nothing: Sandpack's react and react-ts templates both import
 * the stylesheet from their own entry file, so the sheet is already applied
 * before the lesson's component is reached. It used to be prepended here to
 * every example, and 40 lessons also wrote it themselves, so those playgrounds
 * opened with the same dead import twice.
 *
 * Dropping it also lets a lesson's playground code and its step-by-step code be
 * the same string, character for character, with no scaffolding line to explain
 * away in the walkthrough.
 */
function stripStylesheetImport(code) {
  return code.replace(/^[ \t]*import\s+['"]\.\/styles\.css['"];?[ \t]*\r?\n?/gm, '').trim();
}

/**
 * Split one lesson's raw markdown into the pieces the lesson view renders
 * separately: prose, hints, the challenge brief and its solution, the runnable
 * playground example, and the section list used for in-lesson navigation.
 *
 * Sections consumed here are removed from `displayContent` so they are not also
 * rendered inline as prose — they reappear in the challenge modal, the hint
 * list, and the Sandpack editor instead.
 */
export function parseLessonContent(lesson, moduleId) {
  const rawLessonContent = lesson.content || '';
  const enhancement = LESSON_ENHANCEMENTS[lesson.id]?.markdown || '';
  let content = rawLessonContent.trim();

  // Remove the leading markdown H1 if it exists (e.g. "# Event Handling")
  content = content.replace(/^#\s+.*?\n+/, '');

  // Extract Hints
  const hintsRegex = /### Hints[\s\S]*?(?=###|$)/i;
  let hints = [];
  if (hintsRegex.test(content)) {
    const hintsMatch = content.match(hintsRegex)[0];
    content = content.replace(hintsMatch, '').trim();
    const bullets = [...hintsMatch.matchAll(/^\*\s+(.*)$/gm)].map(m => m[1].trim());
    if (bullets.length > 0) hints = bullets;
  }

  // Legacy fallback: a handful of older lessons wrote hints inline as
  // *Hint: ...* rather than in a `### Hints` section.
  //
  // A hardcoded DEFAULT_HINTS map used to sit here as a third fallback, but all
  // 52 of its entries were unreachable — every lesson it named now ships its own
  // `### Hints` section, so the map only survived as a place for stale text to
  // rot (two entries still described challenges that no longer exist). Removed;
  // recoverable from git history if a lesson ever ships without hints.
  if (hints.length === 0) {
    const legacyHintRegex = /\*Hint:.*?\*/gi;
    const legacyHintMatch = content.match(legacyHintRegex);
    if (legacyHintMatch) {
      hints = legacyHintMatch.map(h => h.replace(/^\*Hint:\s*/i, '').replace(/\*$/, '').trim());
      legacyHintMatch.forEach(h => {
        content = content.replace(h, '').trim();
      });
    }
  }

  // Extract Step-by-step Explanation and hide it (we use the walkthrough JSON)
  const stepRegex = /### Step-by-step Explanation[\s\S]*?(?=###|$)/i;
  if (stepRegex.test(content)) {
    content = content.replace(content.match(stepRegex)[0], '').trim();
  }

  // Parse out the challenge section
  const taskRegex = /### (?:Your Task|Challenge and Solution|Challenge)[\s\S]*?\n([\s\S]*?)(?=###|$)/i;
  let challenge = '';
  let solutionDesc = '';
  if (taskRegex.test(content)) {
    const match = content.match(taskRegex);
    content = content.replace(match[0], '').trim();
    challenge = match[1].trim();

    // Check if solution is included in the challenge section
    const solutionMatch = challenge.match(/\*\*Solution:\*\*([\s\S]*)/i);
    if (solutionMatch) {
      solutionDesc = solutionMatch[1].trim();
      challenge = challenge.replace(solutionMatch[0], '').trim();
    }
  }

  // Extract Code Example (Playground)
  //
  // This returns the lesson's *authored* code, always. The learner's own edits
  // used to be substituted in right here, which gave the playground two
  // different shapes depending on whether the lesson had been opened before: a
  // string on the first visit, a file map on every later one. That file map also
  // carried whatever files the Sandpack template contributed alongside the
  // lesson's own. Restoring edits now happens in useLessonSandpack, layered over
  // this authored code, so there is exactly one shape to reason about here.
  // One spelling only. The curriculum used to carry three -- `### Example`,
  // `### Code Example (Playground)` and `### The Problem` -- split 44/40/0, all
  // meaning the same thing. A test enforces the single form.
  const exampleRegex = /### Example\s*```(?:jsx|js|tsx|ts)\s*([\s\S]*?)```/i;
  let executableExample = '';
  const exampleMatch = (lesson.content || '').match(exampleRegex);
  if (exampleMatch) {
    executableExample = stripStylesheetImport(exampleMatch[1].trim());
    if (!executableExample.includes('export default')) {
      const funcMatches = [...executableExample.matchAll(/function\s+([A-Z]\w*)\s*\(/g)];
      if (funcMatches.length > 0) {
        const lastFunc = funcMatches[funcMatches.length - 1][1];
        executableExample += `\n\nexport default ${lastFunc};`;
      }
    }
  } else {
    executableExample = `export default function App() {\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Playground</h2>\n      <p>Experiment with React concepts here.</p>\n    </div>\n  );\n}`;
  }

  // The example section is consumed by the playground, so drop it from the
  // prose. Every one of the 84 lessons was otherwise rendering its example
  // twice: once as a read-only editor at the bottom of the lecture, and again
  // live in the panel beside it -- identical code, and a second Sandpack
  // instance per lesson to pay for it.
  const exampleSectionRegex = /\n?### Example[\s\S]*?(?=\n### |$)/i;
  content = content.replace(exampleSectionRegex, '').trim();

  // Pass through insights
  const insights = lesson.insights || [];
  content = (content + enhancement).trim();
  const sections = extractLessonSections(content, lesson.title);

  return {
    ...lesson,
    title: lesson.title,
    moduleId,
    displayContent: content,
    sections,
    challengeDesc: challenge,
    solutionDesc,
    hints,
    executableExample,
    insights,
  };
}
