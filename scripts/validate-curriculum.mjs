import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import curriculum from '../src/curriculum/index.js';
import { LEARNING_CHECKS } from '../src/curriculum/learningChecks.js';
import { LESSON_ENHANCEMENTS } from '../src/curriculum/lessonEnhancements.js';
import { parseLessonContent } from '../src/lib/lessonContent.js';
import { CONCEPTS, ALLOWANCES, INSIGHT_PREVIEW_OK, conceptsUsedIn } from '../src/curriculum/teachingGraph.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const moduleDir = path.join(root, 'src', 'curriculum', 'modules');
const FORBIDDEN_TEACHING_CLAIMS = [
  ['only correct way', 'Avoid absolute claims about React IDs/APIs.'],
  ['industry standard', 'Distinguish common practice from universal standards.'],
  ['first Route that matches', 'Use modern route-ranking language.'],
  ['Virtual DOM node (VNode)', 'Prefer React element/reconciliation terminology.'],
  ['every component that reads from that Context re-renders instantly', 'Context propagation wording is too absolute.'],
];

const errors = [];
const warnings = [];
const seenLessonIds = new Set();
// Registry order is the teaching order, so a lesson's index is also "how much
// the reader has been shown by now". Built before the main pass so the
// prerequisite check can compare positions without a second traversal.
const lessonOrder = new Map();
for (const moduleMeta of curriculum) {
  for (const lessonMeta of moduleMeta.lessons || []) {
    if (!lessonOrder.has(lessonMeta.id)) lessonOrder.set(lessonMeta.id, lessonOrder.size);
  }
}
const usedAllowances = new Set();
let lessonCount = 0;
let challengeCount = 0;
let checkCount = 0;

const fail = (message) => errors.push(message);
const warn = (message) => warnings.push(message);

for (const moduleMeta of curriculum) {
  const modulePath = path.join(moduleDir, `${moduleMeta.id}.js`);
  try {
    await fs.access(modulePath);
  } catch {
    fail(`Missing module file for ${moduleMeta.id}: ${modulePath}`);
    continue;
  }

  const loaded = (await import(pathToFileURL(modulePath).href)).default;
  if (!loaded?.lessons || !Array.isArray(loaded.lessons)) {
    fail(`${moduleMeta.id} does not export a lessons array.`);
    continue;
  }

  // Ensure strict lesson ordering match between registry (index.js) and module payload
  const registryLessonIds = (moduleMeta.lessons || []).map(l => l.id);
  const payloadLessonIds = loaded.lessons.map(l => l.id);
  if (JSON.stringify(registryLessonIds) !== JSON.stringify(payloadLessonIds)) {
    fail(`Lesson sequence mismatch in module "${moduleMeta.id}". Registry: [${registryLessonIds.join(', ')}] vs Payload: [${payloadLessonIds.join(', ')}]`);
  }

  // registry.js now overlays the registry's names onto the payload, so drifted
  // payload metadata is inert rather than user-visible. It is still dead text
  // that reads like it means something, so it gets reported for deletion.
  if (loaded.title && loaded.title !== moduleMeta.title) {
    warn(`${moduleMeta.id}: payload title "${loaded.title}" is ignored; the registry says "${moduleMeta.title}".`);
  }
  if (loaded.description && moduleMeta.description && loaded.description !== moduleMeta.description) {
    warn(`${moduleMeta.id}: payload description is ignored; the registry's wins.`);
  }
  for (const lessonMeta of moduleMeta.lessons || []) {
    const payloadLesson = loaded.lessons.find((l) => l.id === lessonMeta.id);
    if (payloadLesson && payloadLesson.title && payloadLesson.title !== lessonMeta.title) {
      warn(`${lessonMeta.id}: payload title "${payloadLesson.title}" is ignored; the registry says "${lessonMeta.title}".`);
    }
  }

  for (const lesson of loaded.lessons) {
    lessonCount += 1;
    if (!lesson.id) fail(`${moduleMeta.id} contains a lesson without an id.`);
    if (seenLessonIds.has(lesson.id)) fail(`Duplicate lesson id: ${lesson.id}`);
    seenLessonIds.add(lesson.id);

    const content = typeof lesson.content === 'string' ? lesson.content.trim() : '';

    // Claims are scanned across every surface a learner actually reads, not just
    // the lecture body. Insight cards and learning-check feedback were unscanned
    // for a long time, and that is exactly where the stale claims collected --
    // the forwardRef card that contradicted its own lesson lived in an insight.
    const prose = [
      content,
      ...(lesson.insights || []).flatMap((insight) => [
        insight.title || '',
        insight.walkthrough?.code || '',
        ...(insight.walkthrough?.steps || []).map((s) => s.description || ''),
      ]),
      ...(LEARNING_CHECKS[lesson.id] || []).flatMap((check) => [
        check.prompt || '',
        check.feedback || '',
        check.modelAnswer || '',
        ...(check.options || []),
      ]),
    ].join('\n');
    for (const [badPhrase, guidance] of FORBIDDEN_TEACHING_CLAIMS) {
      if (prose.toLowerCase().includes(badPhrase.toLowerCase())) warn(`${lesson.id}: ${guidance} Found: \"${badPhrase}\"`);
    }
    if (content.length < 180) warn(`${lesson.id} has very little lecture text (${content.length} characters).`);
    if (!lesson.title) warn(`${lesson.id} has no title.`);

    const hasChallenge = /###\s+(Your Task|Challenge|Challenge and Solution)/i.test(content);
    if (hasChallenge) {
      challengeCount += 1;
      const validatorConfig = (await import('../src/curriculum/validators.js')).validators[lesson.id];
      const rules = Array.isArray(validatorConfig) ? validatorConfig : validatorConfig?.rules;
      const observationOnly = validatorConfig && !Array.isArray(validatorConfig) && validatorConfig.requiresObservation && (!rules || rules.length === 0);
      if (!validatorConfig) warn(`${lesson.id} has a challenge but no automated validator.`);
      if (observationOnly) warn(`${lesson.id} is observation-only; prefer an automated behavioral assertion when possible.`);
    }
    if (hasChallenge && !/\*\*Solution:\*\*/i.test(content)) {
      warn(`${lesson.id} has a challenge heading but no visible solution explanation.`);
    }

    // The playground and the step-by-step walkthrough must run the same
    // program. They are read from different places -- the `### Example` block in
    // the markdown, and `exampleWalkthrough.code` -- with nothing connecting
    // them, so they drift silently unless something checks.
    const playground = parseLessonContent(lesson, moduleMeta.id).executableExample.trim();
    const walkthroughCode = String(lesson.exampleWalkthrough?.code ?? '').trim();
    if (!walkthroughCode) {
      fail(`${lesson.id} has no exampleWalkthrough, so its playground cannot be explained.`);
    } else if (playground !== walkthroughCode) {
      fail(`${lesson.id}: the playground runs different code than the step-by-step explains.`);
    }

    // A playground that hands over the challenge's answer removes the exercise.
    if (typeof lesson.solutionCode === 'string' && playground === lesson.solutionCode.trim()) {
      warn(`${lesson.id}: the playground code is the challenge solution verbatim, so opening the lesson spoils it.`);
    }

    // A lesson may only require what an earlier lesson taught. This is checked
    // against the code the reader has to read and edit -- the playground, the
    // challenge, and both walkthroughs -- because that is where an unexplained
    // concept stops being a mention and becomes something they must already
    // know to continue.
    const here = lessonOrder.get(lesson.id);
    if (here !== undefined) {
      const surfaces = {
        playground: lesson.exampleWalkthrough?.code,
        challenge: lesson.starterCode,
        solution: lesson.solutionCode,
        walkthrough: lesson.walkthrough?.code,
      };
      const allowed = ALLOWANCES[lesson.id] || [];
      for (const [surfaceName, code] of Object.entries(surfaces)) {
        for (const conceptKey of conceptsUsedIn(code)) {
          const concept = CONCEPTS[conceptKey];
          const taughtAt = lessonOrder.get(concept.taughtBy);
          if (taughtAt === undefined) {
            fail(`teachingGraph: concept "${conceptKey}" claims to be taught by "${concept.taughtBy}", which is not in the curriculum.`);
            continue;
          }
          if (taughtAt <= here) continue;
          if (allowed.includes(conceptKey)) { usedAllowances.add(`${lesson.id}:${conceptKey}`); continue; }
          fail(
            `${lesson.id} (#${here + 1}) uses ${concept.label} in its ${surfaceName} code, ` +
            `but that is not taught until ${concept.taughtBy} (#${taughtAt + 1}). ` +
            `Reorder the lesson, rewrite the code, or add a documented entry to ALLOWANCES in teachingGraph.js.`,
          );
        }
      }

      // Insight cards are optional side reading, and previewing a later concept
      // there is sometimes the point ("you'll meet useRef next module"). So this
      // is a warning rather than a gate -- but an unannounced forward reference
      // in an insight is still how a reader ends up confused, so it gets said
      // out loud instead of going unnoticed the way it used to.
      for (const insight of (INSIGHT_PREVIEW_OK.has(lesson.id) ? [] : lesson.insights || [])) {
        for (const conceptKey of conceptsUsedIn(insight.walkthrough?.code)) {
          const concept = CONCEPTS[conceptKey];
          const taughtAt = lessonOrder.get(concept.taughtBy);
          if (taughtAt === undefined || taughtAt <= here) continue;
          if ((ALLOWANCES[lesson.id] || []).includes(conceptKey)) continue;
          warn(
            `${lesson.id} (#${here + 1}) insight "${insight.title}" uses ${concept.label}, ` +
            `first taught in ${concept.taughtBy} (#${taughtAt + 1}). Say so in the card, or move it.`,
          );
        }
      }
    }

    const checks = LEARNING_CHECKS[lesson.id] || [];
    checkCount += checks.length;
    if (LESSON_ENHANCEMENTS[lesson.id] && !LESSON_ENHANCEMENTS[lesson.id].markdown) {
      fail(`${lesson.id} has an enhancement entry without markdown.`);
    }
    for (const check of checks) {
      if (!check.id || !check.stage || !check.prompt || !check.feedback) {
        fail(`${lesson.id} has an incomplete learning check: ${check.id || '(missing id)'}`);
      }
      if (check.type === 'choice') {
        if (!Array.isArray(check.options) || check.options.length < 2) fail(`${check.id} needs at least two options.`);
        if (!Number.isInteger(Number(check.answer)) || Number(check.answer) < 0 || Number(check.answer) >= check.options.length) {
          fail(`${check.id} has an invalid choice answer.`);
        }
      }
      if (check.type === 'text' && !check.modelAnswer) fail(`${check.id} needs a model answer.`);
    }
  }
}

// --- Translations ----------------------------------------------------------
// A translated lesson supplies prose only; its code is inherited from English.
// The single exception is the `### Example` block, which lives inside the
// markdown because that is where the playground is read from -- so it is
// compared character-for-character. Everything else checked here is shape: a
// translation with the wrong number of walkthrough steps would silently leave
// some steps in English and misalign the rest against their highlighted lines.
{
  const { MODULES_MAP } = await import('../src/curriculum/registry.js');
  const { MODULES_MAP_TR } = await import('../src/curriculum/registryTr.js');
  const exampleCode = (content) =>
    (String(content || '').match(/### Example\s*```(?:jsx|js|tsx|ts)\s*([\s\S]*?)```/i) || [, null])[1];

  let translatedLessons = 0;
  for (const [moduleId, overlay] of Object.entries(MODULES_MAP_TR)) {
    const base = MODULES_MAP[moduleId];
    if (!base) { fail(`Turkish overlay for unknown module: ${moduleId}`); continue; }

    for (const [lessonId, tr] of Object.entries(overlay.lessons || {})) {
      const en = base.lessons.find((l) => l.id === lessonId);
      if (!en) { fail(`Turkish overlay ${moduleId} has unknown lesson: ${lessonId}`); continue; }
      translatedLessons += 1;
      const where = `${moduleId}/${lessonId} (tr)`;

      // Prose-only: code fields must not be carried by a translation at all.
      for (const forbidden of ['starterCode', 'solutionCode', 'dependencies', 'id']) {
        if (tr[forbidden] !== undefined) {
          fail(`${where} defines "${forbidden}". Translations carry prose only; code is inherited from English.`);
        }
      }

      const enExample = exampleCode(en.content);
      const trExample = exampleCode(tr.content);
      if (trExample === null) {
        fail(`${where} has no "### Example" block, so the playground would fall back to a placeholder.`);
      } else if (trExample !== enExample) {
        fail(`${where}: the example code differs from the English lesson. Translate the prose around it, never the code inside it.`);
      }

      // The parser consumes these headings; translating them drops the section.
      for (const heading of ['### Example', '### Challenge', '### Hints', '**Solution:**']) {
        if (en.content.includes(heading) && !tr.content.includes(heading)) {
          fail(`${where} is missing the structural marker "${heading}", which the lesson parser needs verbatim.`);
        }
      }

      const stepCount = (w) => (Array.isArray(w?.steps) ? w.steps.length : 0);
      if (stepCount(tr.exampleWalkthrough) !== stepCount(en.exampleWalkthrough)) {
        fail(`${where}: exampleWalkthrough has ${stepCount(tr.exampleWalkthrough)} steps, English has ${stepCount(en.exampleWalkthrough)}.`);
      }
      if (stepCount(tr.walkthrough) !== stepCount(en.walkthrough)) {
        fail(`${where}: walkthrough has ${stepCount(tr.walkthrough)} steps, English has ${stepCount(en.walkthrough)}.`);
      }
      if (Array.isArray(tr.insights)) {
        if (tr.insights.length !== (en.insights?.length || 0)) {
          fail(`${where}: ${tr.insights.length} insights, English has ${en.insights?.length || 0}.`);
        }
        tr.insights.forEach((insight, i) => {
          const enSteps = en.insights?.[i]?.walkthrough?.steps?.length || 0;
          if (stepCount(insight) !== enSteps) {
            fail(`${where}: insight ${i + 1} has ${stepCount(insight)} steps, English has ${enSteps}.`);
          }
        });
      }

      // A translation cannot be diffed against its source -- the words are
      // supposed to differ. But prose that was edited on one side only leaves a
      // structural shadow: a section gains or loses a paragraph, a hint list
      // gains a bullet. `js-ternary` drifted exactly that way and sat there
      // describing two different challenges in two languages, so the shape of
      // each section is compared even though the words cannot be.
      const sectionShapes = (markdown) =>
        String(markdown || '').split(/^###\s+/m).map((part) => {
          const body = part.replace(/^[^\n]*\n/, '');
          return {
            paragraphs: body.split(/\n{2,}/).filter((p) => p.trim() && !p.trim().startsWith('```')).length,
            listItems: (body.match(/^\s*(?:[-*]|\d+\.)\s+/gm) || []).length,
          };
        });

      const enShapes = sectionShapes(en.content);
      const trShapes = sectionShapes(tr.content);
      if (enShapes.length !== trShapes.length) {
        warn(`${where} has ${trShapes.length} sections, English has ${enShapes.length}. One side was edited without the other.`);
      } else {
        enShapes.forEach((shape, i) => {
          if (shape.paragraphs !== trShapes[i].paragraphs) {
            warn(`${where}: section ${i} has ${trShapes[i].paragraphs} paragraphs, English has ${shape.paragraphs}.`);
          }
          if (shape.listItems !== trShapes[i].listItems) {
            warn(`${where}: section ${i} has ${trShapes[i].listItems} list items, English has ${shape.listItems}.`);
          }
        });
      }
    }
  }
  console.log(`Translations: ${translatedLessons}/${lessonCount} lessons available in Turkish.`);
}

// --- Dev playground overrides ----------------------------------------------
// `vite.config.js` serves src/playground/<module>/<lesson>/ over
// /api/playground/..., and ChallengeModal prefers those files over the lesson's
// own `starterCode` -- but only in dev. A packaged build always falls back to
// `starterCode`, so any divergence means an author is developing against code
// the learner will never see. It had drifted on 13 lessons, including three
// files that just said "No starter code" and one that still described a
// component the lesson had stopped shipping.
{
  const playgroundRoot = path.join(root, 'src', 'playground');
  const norm = (s) => String(s || '').replace(/\r\n/g, '\n').trim();

  // An override directory is addressed by module id *and* lesson id, so moving a
  // lesson between modules orphans its folder without breaking anything visibly
  // -- dev just silently stops serving it. Splitting `advanced` did exactly that
  // to two lessons, so the orphans are named here instead of rotting.
  {
    const live = new Set(curriculum.flatMap((m) => (m.lessons || []).map((l) => `${m.id}/${l.id}`)));
    let moduleDirs = [];
    try {
      moduleDirs = await fs.readdir(playgroundRoot, { withFileTypes: true });
    } catch { moduleDirs = []; }
    for (const moduleEntry of moduleDirs.filter((e) => e.isDirectory())) {
      const lessonDirs = await fs.readdir(path.join(playgroundRoot, moduleEntry.name), { withFileTypes: true });
      for (const lessonEntry of lessonDirs.filter((e) => e.isDirectory())) {
        const key = `${moduleEntry.name}/${lessonEntry.name}`;
        if (!live.has(key)) warn(`src/playground/${key}/ does not match any lesson in the registry. Move it to the lesson's current module, or delete it.`);
      }
    }
  }

  for (const moduleMeta of curriculum) {
    for (const lessonMeta of moduleMeta.lessons || []) {
      const dir = path.join(playgroundRoot, moduleMeta.id, lessonMeta.id);
      let entries;
      try {
        entries = await fs.readdir(dir);
      } catch {
        continue; // No override for this lesson, which is the normal case.
      }

      const loaded = (await import(pathToFileURL(path.join(moduleDir, `${moduleMeta.id}.js`)).href)).default;
      const starter = loaded.lessons.find((l) => l.id === lessonMeta.id)?.starterCode;

      for (const file of entries) {
        let authored;
        if (typeof starter === 'string') {
          authored = /^App\.(jsx?|tsx?)$/.test(file) ? starter : null;
        } else if (starter && typeof starter === 'object') {
          const key = Object.keys(starter).find((k) => k.replace(/^\//, '') === file);
          const value = key ? starter[key] : undefined;
          authored = typeof value === 'string' ? value : value?.code;
        }
        if (!authored) {
          warn(`src/playground/${moduleMeta.id}/${lessonMeta.id}/${file} has no matching entry in starterCode, so it shadows nothing in a packaged build.`);
          continue;
        }
        const onDisk = norm(await fs.readFile(path.join(dir, file), 'utf8'));
        if (onDisk !== norm(authored)) {
          fail(`src/playground/${moduleMeta.id}/${lessonMeta.id}/${file} differs from the lesson's starterCode. In dev it replaces it; in a packaged build it does not, so the two must match.`);
        }
      }
    }
  }
}

// An allowance that never fires is a note about a problem that no longer
// exists, and left in place it quietly permits the problem to come back.
for (const [lessonId, concepts] of Object.entries(ALLOWANCES)) {
  if (!lessonOrder.has(lessonId)) fail(`ALLOWANCES references unknown lesson: ${lessonId}`);
  for (const conceptKey of concepts) {
    if (!usedAllowances.has(`${lessonId}:${conceptKey}`)) {
      warn(`ALLOWANCES entry ${lessonId}:${conceptKey} is no longer needed and can be deleted.`);
    }
  }
}

for (const lessonId of Object.keys(LEARNING_CHECKS)) {
  if (!seenLessonIds.has(lessonId)) fail(`Learning checks reference unknown lesson: ${lessonId}`);
}
for (const lessonId of Object.keys(LESSON_ENHANCEMENTS)) {
  if (!seenLessonIds.has(lessonId)) fail(`Lecture enhancements reference unknown lesson: ${lessonId}`);
}

console.log(`Curriculum validation: ${lessonCount} lessons, ${challengeCount} challenge-bearing lessons, ${checkCount} learning checks.`);
for (const message of warnings) console.warn(`WARN: ${message}`);
for (const message of errors) console.error(`ERROR: ${message}`);
if (errors.length > 0) process.exit(1);
console.log('Curriculum validation passed.');
