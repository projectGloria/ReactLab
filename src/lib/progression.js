import curriculum from '../curriculum/index.js';

// Flattened list of all lessons in exact chronological progression order
export const ALL_ORDERED_LESSONS = curriculum.flatMap((m, mIdx) =>
  m.lessons.map((l, lIdx) => ({
    ...l,
    moduleId: m.id,
    moduleTitle: m.title,
    moduleIndex: mIdx,
    lessonIndex: lIdx,
  }))
);

/**
 * Check whether completing `lessonId` would finish every lesson in its module.
 * Used to decide between a small per-lesson celebration and a bigger
 * whole-module one. `completedLessons` should be the state *before* this
 * lesson's completion is applied (the lesson itself doesn't need to be in it).
 */
export function isFinalLessonInModule(lessonId, completedLessons = []) {
  const lesson = ALL_ORDERED_LESSONS.find((l) => l.id === lessonId);
  if (!lesson) return false;
  const moduleLessons = ALL_ORDERED_LESSONS.filter((l) => l.moduleId === lesson.moduleId);
  return moduleLessons.every((l) => l.id === lessonId || completedLessons.includes(l.id));
}

/**
 * Check if a specific lesson is unlocked based on completed lessons.
 * Rule: Lesson 0 is unlocked. Any subsequent lesson requires the previous lesson to be completed.
 */
export function isLessonUnlocked(lessonId, completedLessons = [], unlockAll = false) {
  if (unlockAll) return true;
  if (!lessonId) return false;

  const index = ALL_ORDERED_LESSONS.findIndex(l => l.id === lessonId);
  if (index === -1) return false;

  // First lesson is always unlocked
  if (index === 0) return true;

  // If already completed, it's unlocked
  if (completedLessons.includes(lessonId)) return true;

  // Unlocked if immediately preceding lesson is completed
  const prevLesson = ALL_ORDERED_LESSONS[index - 1];
  return completedLessons.includes(prevLesson.id);
}

/**
 * Check if an entire module is unlocked.
 * Rule: Module 0 is unlocked. Any module is unlocked if its first lesson is unlocked.
 */
export function isModuleUnlocked(moduleId, completedLessons = [], unlockAll = false) {
  if (unlockAll) return true;
  if (!moduleId) return false;

  const modIndex = curriculum.findIndex(m => m.id === moduleId);
  if (modIndex === -1) return false;
  if (modIndex === 0) return true;

  const mod = curriculum[modIndex];
  if (!mod.lessons || mod.lessons.length === 0) return false;

  // If the first lesson of this module is unlocked, the module is unlocked
  return isLessonUnlocked(mod.lessons[0].id, completedLessons, unlockAll);
}

/**
 * Get the prerequisite lesson that must be completed to unlock this lesson
 */
export function getPrerequisiteLesson(lessonId) {
  const index = ALL_ORDERED_LESSONS.findIndex(l => l.id === lessonId);
  if (index <= 0) return null;
  return ALL_ORDERED_LESSONS[index - 1];
}

/**
 * Find recently-completed lessons this lesson leans on that look shaky —
 * mirrors the same signals Review Lab's priority score uses (failed
 * challenge, solution viewed, missed learning checks, overdue for review)
 * so a learner gets a heads-up in the lesson itself instead of only
 * discovering the gap later in Review Lab. Looks back up to 3 prior
 * lessons (in curriculum order) rather than every completed lesson ever,
 * since the most likely relevant prerequisite is something recent.
 */
export function getWeakPrerequisites(lessonId, lessonState = {}) {
  const index = ALL_ORDERED_LESSONS.findIndex(l => l.id === lessonId);
  if (index <= 0) return [];

  const lookback = ALL_ORDERED_LESSONS.slice(Math.max(0, index - 3), index);
  const weak = [];
  for (const lesson of lookback) {
    const state = lessonState[lesson.id];
    if (!state || state.status !== 'complete') continue;
    const checks = Object.values(state.learningChecks || {});
    const missed = checks.filter((c) => c.correct === false).length;
    const due = state.nextReviewAt && new Date(state.nextReviewAt) <= new Date();
    let reason = null;
    if (state.lastChallengeResult === 'failed' && state.solutionViewed) reason = 'you needed the solution here';
    else if (due) reason = 'due for review';
    else if (missed > 0) reason = `missed ${missed} learning check${missed > 1 ? 's' : ''}`;
    else if (state.lastChallengeResult === 'failed') reason = 'last challenge attempt failed';
    if (reason) weak.push({ lesson, reason });
  }
  return weak;
}


/**
 * Aggregate readiness signal for a whole module, built from the same
 * shakiness checks as getWeakPrerequisites but scanning every lesson in
 * the immediately preceding module (the module you'd have had to finish
 * to unlock this one) rather than just the last 3 lessons. This is a
 * pre-module gut check, not a gate — modules stay unlocked regardless of
 * what this returns; it just gives a heads-up before you dive in.
 */
export function getModuleReadiness(moduleId, lessonState = {}) {
  const modIndex = curriculum.findIndex(m => m.id === moduleId);
  if (modIndex <= 0) return null; // first module has no prior module to check

  const priorModule = curriculum[modIndex - 1];
  const priorLessons = ALL_ORDERED_LESSONS.filter(l => l.moduleId === priorModule.id);
  const completed = priorLessons.filter(l => lessonState[l.id]?.status === 'complete');
  if (completed.length === 0) return null;

  const weakLessons = [];
  for (const lesson of completed) {
    const state = lessonState[lesson.id];
    const checks = Object.values(state.learningChecks || {});
    const missed = checks.filter((c) => c.correct === false).length;
    const due = state.nextReviewAt && new Date(state.nextReviewAt) <= new Date();
    const shaky = (state.lastChallengeResult === 'failed' && state.solutionViewed) || due || missed > 0;
    if (shaky) weakLessons.push(lesson);
  }

  return {
    priorModuleId: priorModule.id,
    priorModuleTitle: priorModule.title,
    completedCount: completed.length,
    totalCount: priorLessons.length,
    weakLessons,
  };
}


export function getNextActiveLesson(completedLessons = []) {
  for (const lesson of ALL_ORDERED_LESSONS) {
    if (!completedLessons.includes(lesson.id)) {
      return lesson;
    }
  }
  return ALL_ORDERED_LESSONS[0];
}

/**
 * Extract or synthesize a short, structured set of takeaways for a locked lesson.
 *
 * Returns an array of 1-2 clean, plain-text strings instead of one stitched-together
 * run-on sentence: a crisp "what this is" line, and — when available — a distinct
 * "why it matters" line pulled from a different section. Keeping them separate lets
 * the UI render them as a real list instead of a text blob, and avoids the old
 * failure mode where unrelated sentences got glued into one confusing paragraph.
 */
export function getLessonGainSummary(lesson) {
  if (!lesson) return ['Master core patterns and build scalable, reactive UI components with clean mental models.'];

  const content = lesson.content || lesson.displayContent || '';

  const formatSentence = (raw) => {
    if (!raw) return null;
    let clean = raw
      .replace(/```[\s\S]*?```/g, '') // remove code blocks
      .replace(/\*\*([^*]+)\*\*/g, '$1') // remove bold
      .replace(/`([^`]+)`/g, '$1') // remove code formatting
      .replace(/#+\s*[^\n]+/g, '') // remove headers
      .replace(/^\s*>\s?/gm, '') // remove blockquote markers
      .replace(/^\s*[-*]\s+/gm, '') // remove bullet markers
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '') // strip emoji
      .replace(/\n+/g, ' ') // collapse newlines
      .replace(/\s{2,}/g, ' ') // collapse leftover double spaces
      .trim();

    if (clean.endsWith(':')) {
      clean = clean.slice(0, -1).trim();
    }
    if (clean && !clean.endsWith('.') && !clean.endsWith('!') && !clean.endsWith('?')) {
      clean += '.';
    }
    return clean;
  };

  // Only take the first paragraph of a matched section (the crisp definition),
  // not the whole section — sections often continue into bullet lists, mental-model
  // callouts, etc. that don't read well stitched into one run-on line.
  const firstParagraph = (section) => section.trim().split(/\n\s*\n/)[0] || '';

  const takeaways = [];

  // 1. "### What is it?" — usually the crispest 1-sentence definition.
  const whatRegex = /### What is it\??\s*\n+([\s\S]*?)(?=\n###|\n```|$)/i;
  const whatMatch = content.match(whatRegex);
  if (whatMatch && whatMatch[1].trim()) {
    const candidate = formatSentence(firstParagraph(whatMatch[1]));
    if (candidate && candidate.length >= 30) {
      takeaways.push(candidate);
    }
  }

  // 2. A "why" section, under whichever heading this lesson actually used
  //    (content audit found a few lessons phrase it differently, e.g. "Why does
  //    React..." rather than "Why do we need it?" — match any Why heading).
  const whyRegex = /### Why[^\n]*\n+([\s\S]*?)(?=\n###|\n```|$)/i;
  const whyMatch = content.match(whyRegex);
  if (whyMatch && whyMatch[1].trim()) {
    const paras = whyMatch[1].split(/\n\s*\n/).map(formatSentence).filter(Boolean);
    const valid = paras.find(p => p.length >= 35 && !p.toLowerCase().startsWith('for example'));
    if (valid && valid !== takeaways[0]) {
      takeaways.push(valid);
    }
  }

  if (takeaways.length > 0) {
    return takeaways.slice(0, 2);
  }

  return [`Master ${lesson.title} mechanics, eliminate common frontend bugs, and write clean, declarative React code.`];
}
