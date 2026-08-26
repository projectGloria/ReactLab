import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import curriculum from '../src/curriculum/index.js';
import { LEARNING_CHECKS } from '../src/curriculum/learningChecks.js';
import { LESSON_ENHANCEMENTS } from '../src/curriculum/lessonEnhancements.js';
import { parseLessonContent } from '../src/lib/lessonContent.js';

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

  for (const lesson of loaded.lessons) {
    lessonCount += 1;
    if (!lesson.id) fail(`${moduleMeta.id} contains a lesson without an id.`);
    if (seenLessonIds.has(lesson.id)) fail(`Duplicate lesson id: ${lesson.id}`);
    seenLessonIds.add(lesson.id);

    const content = typeof lesson.content === 'string' ? lesson.content.trim() : '';
    for (const [badPhrase, guidance] of FORBIDDEN_TEACHING_CLAIMS) {
      if (content.toLowerCase().includes(badPhrase.toLowerCase())) warn(`${lesson.id}: ${guidance} Found: \"${badPhrase}\"`);
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
