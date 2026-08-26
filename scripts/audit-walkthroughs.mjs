import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import curriculum from '../src/curriculum/index.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const moduleDir = path.join(root, 'src', 'curriculum', 'modules');

const issues = [];

function checkWalkthrough(lessonId, label, wt) {
  if (!wt || !wt.code) return;
  const lineCount = wt.code.split('\n').length;
  (wt.steps || []).forEach((step, i) => {
    const hl = step.highlightLines || [];
    const bad = hl.filter((n) => n < 1 || n > lineCount);
    if (bad.length) {
      issues.push(`${lessonId} :: ${label} step ${i} highlights out-of-range lines ${JSON.stringify(bad)} (code has ${lineCount} lines)`);
    }
    if (!step.description || step.description.trim().length < 5) {
      issues.push(`${lessonId} :: ${label} step ${i} has empty/near-empty description`);
    }
  });
}

function checkInsights(lessonId, insights) {
  (insights || []).forEach((insight, i) => {
    checkWalkthrough(lessonId, `insight[${i}] "${insight.title}"`, insight.walkthrough);
  });
}

// Rough check: does walkthrough.code roughly match solutionCode (post-challenge walkthroughs
// are expected to explain the SOLVED code, not the starter with the bug)
function checkSolutionAlignment(lessonId, lesson) {
  const wt = lesson.walkthrough;
  if (!wt || !wt.code || !lesson.solutionCode) return;
  if (typeof lesson.solutionCode !== 'string' || (lesson.starterCode && typeof lesson.starterCode !== 'string')) {
    issues.push(`${lessonId} :: multi-file solutionCode/starterCode (object) — skipped automated alignment check, verify manually`);
    return;
  }
  const normalize = (s) => s.replace(/\s+/g, ' ').trim();
  const wtNorm = normalize(wt.code);
  const solNorm = normalize(lesson.solutionCode);
  const starterNorm = lesson.starterCode ? normalize(lesson.starterCode) : null;
  if (wtNorm !== solNorm) {
    if (starterNorm && wtNorm === starterNorm) {
      issues.push(`${lessonId} :: walkthrough.code matches STARTER code (with the bug), not solutionCode — walkthrough may be explaining broken code as if it were correct`);
    } else {
      issues.push(`${lessonId} :: walkthrough.code differs from solutionCode (may be fine if intentionally simplified, but worth eyeballing)`);
    }
  }
}

for (const moduleMeta of curriculum) {
  const modulePath = path.join(moduleDir, `${moduleMeta.id}.js`);
  const loaded = (await import(pathToFileURL(modulePath).href)).default;
  for (const lesson of loaded.lessons || []) {
    checkWalkthrough(lesson.id, 'exampleWalkthrough', lesson.exampleWalkthrough);
    checkWalkthrough(lesson.id, 'walkthrough', lesson.walkthrough);
    checkInsights(lesson.id, lesson.insights);
    checkSolutionAlignment(lesson.id, lesson);
  }
}

console.log(`Checked walkthroughs across ${curriculum.length} modules.\n`);
console.log(`Found ${issues.length} potential issues:\n`);
for (const issue of issues) console.log(' - ' + issue);
