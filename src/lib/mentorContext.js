// Gathers everything the mentor should know about the lesson the learner is
// looking at: the lecture prose, the section they are reading, the challenge and
// its hints, the misconception insights, the step-by-step walkthrough, and every
// file currently open in the playground.
//
// Before this existed the renderer sent a title, one section, and a truncated
// blob of code, and electron/main.cjs dropped the lesson text on the floor
// entirely -- so "explain the code in App.js" was answered by a model that had
// never seen the lesson it belonged to.
//
// The result is plain data. electron/main.cjs decides how much of it fits in the
// prompt (see buildUserPrompt), because only it knows the model's budget.

import curriculum from '../curriculum/index.js';

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function fileCode(value) {
  if (typeof value === 'string') return value;
  return text(value?.code);
}

function findLessonPlacement(moduleId, lessonId) {
  const module = curriculum.find((item) => item.id === moduleId)
    || curriculum.find((item) => item.lessons?.some((lesson) => lesson.id === lessonId));
  if (!module) return { moduleTitle: '', position: '' };
  const index = module.lessons?.findIndex((lesson) => lesson.id === lessonId) ?? -1;
  return {
    moduleTitle: module.title || '',
    position: index >= 0 ? `lesson ${index + 1} of ${module.lessons.length}` : '',
  };
}

/**
 * @param lesson  the parseLessonContent() result for the open lesson
 * @param files   Sandpack's file map ({ '/App.js': { code } }) — the learner's
 *                live code, stylesheet included
 * @param code    legacy single-string fallback when no file map is available
 */
export function buildMentorContext({
  lesson,
  moduleId,
  files,
  code = '',
  activeSection = null,
  runtimeError = '',
  lessonTitle = '',
  lessonExcerpt = '',
} = {}) {
  const lessonId = lesson?.id || '';
  const { moduleTitle, position } = findLessonPlacement(moduleId || lesson?.moduleId, lessonId);

  const playgroundFiles = Object.entries(files || {})
    .map(([path, value]) => ({ path, code: fileCode(value) }))
    .filter((file) => file.code)
    // Component files before the stylesheet: the question is almost always
    // about the component, and the stylesheet is the first thing to drop when
    // the prompt runs out of room.
    .sort((a, b) => Number(a.path.endsWith('.css')) - Number(b.path.endsWith('.css')));

  const insights = (lesson?.insights || []).map((insight) => ({
    title: text(insight?.title),
    notes: (insight?.walkthrough?.steps || [])
      .map((step) => text(step?.description))
      .filter(Boolean),
  })).filter((insight) => insight.title || insight.notes.length);

  const walkthrough = (lesson?.exampleWalkthrough?.steps || [])
    .map((step) => text(step?.description))
    .filter(Boolean);

  return {
    lessonId,
    lessonTitle: lessonTitle || text(lesson?.title),
    moduleTitle,
    position,
    lecture: text(lesson?.displayContent) || text(lessonExcerpt),
    activeSection: activeSection && (activeSection.title || activeSection.content)
      ? { title: text(activeSection.title), content: text(activeSection.content) }
      : null,
    challenge: text(lesson?.challengeDesc),
    hints: (lesson?.hints || []).map(text).filter(Boolean),
    solutionExplanation: text(lesson?.solutionDesc),
    insights,
    walkthrough,
    files: playgroundFiles,
    code: playgroundFiles.length ? '' : text(code),
    referenceSolution: text(lesson?.solutionCode),
    runtimeError: text(runtimeError),
  };
}
