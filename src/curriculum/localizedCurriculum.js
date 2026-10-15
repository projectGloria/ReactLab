// Turkish lessons are an *overlay*, not a copy.
//
// A translated lesson file carries only the prose a reader reads: the lesson
// title, the lecture markdown, and the description text of each walkthrough
// step. It never carries `starterCode`, `solutionCode`, `highlightLines`,
// `stateSnapshot` or `dependencies` -- those are inherited from the English
// lesson, so a translation physically cannot drift the code, the line
// highlighting, or the challenge grading out of step with the original.
//
// The one place code does live inside translated text is the `### Example`
// block, because `parseLessonContent` reads the playground out of the markdown.
// `validate-curriculum.mjs` checks that block character-for-character against
// the English lesson, so a translator who "tidies" the code is told about it.
//
// Anything not yet translated falls back to English per lesson, which is what
// makes it safe to ship the translation a module at a time.

import { MODULES_MAP } from './registry.js';
import { MODULES_MAP_TR } from './registryTr.js';

const OVERLAYS = { tr: MODULES_MAP_TR };

/** Replace step descriptions by index, keeping every other field of the step. */
function mergeSteps(baseSteps, translatedSteps) {
  if (!Array.isArray(baseSteps)) return baseSteps;
  if (!Array.isArray(translatedSteps) || translatedSteps.length === 0) return baseSteps;
  return baseSteps.map((step, i) => {
    const description = translatedSteps[i];
    if (typeof description !== 'string' || !description) return step;
    return { ...step, description };
  });
}

function mergeWalkthrough(base, translated) {
  if (!base || !translated) return base;
  return { ...base, steps: mergeSteps(base.steps, translated.steps) };
}

function mergeInsights(baseInsights, translatedInsights) {
  if (!Array.isArray(baseInsights)) return baseInsights;
  if (!Array.isArray(translatedInsights)) return baseInsights;
  return baseInsights.map((insight, i) => {
    const t = translatedInsights[i];
    if (!t) return insight;
    return {
      ...insight,
      title: t.title || insight.title,
      walkthrough: mergeWalkthrough(insight.walkthrough, t),
    };
  });
}

/** One English lesson plus its translation, or the English lesson unchanged. */
export function mergeLesson(baseLesson, translated) {
  if (!translated) return baseLesson;
  return {
    ...baseLesson,
    title: translated.title || baseLesson.title,
    content: translated.content || baseLesson.content,
    exampleWalkthrough: mergeWalkthrough(baseLesson.exampleWalkthrough, translated.exampleWalkthrough),
    walkthrough: mergeWalkthrough(baseLesson.walkthrough, translated.walkthrough),
    insights: mergeInsights(baseLesson.insights, translated.insights),
  };
}

/**
 * Module payload for a locale. Falls back to English for the whole module, and
 * independently for each lesson inside a partially translated module.
 */
export function getLocalizedModuleData(moduleId, locale = 'en') {
  const base = MODULES_MAP[moduleId] || null;
  if (!base) return null;

  const overlay = OVERLAYS[locale]?.[moduleId];
  if (!overlay) return base;

  return {
    ...base,
    title: overlay.title || base.title,
    description: overlay.description || base.description,
    lessons: base.lessons.map((lesson) => mergeLesson(lesson, overlay.lessons?.[lesson.id])),
  };
}

/**
 * The registry (module ids, titles, lesson order) with translated titles where
 * they exist. The sidebar and module pages read this, so switching language
 * renames the navigation as well as the lesson body. Ids and order never change
 * -- progress, unlocking and routing all key off them.
 */
export function getLocalizedCurriculum(curriculum, locale = 'en') {
  const overlays = OVERLAYS[locale];
  if (!overlays) return curriculum;
  return curriculum.map((module) => {
    const overlay = overlays[module.id];
    if (!overlay) return module;
    return {
      ...module,
      title: overlay.title || module.title,
      description: overlay.description || module.description,
      lessons: module.lessons.map((lesson) => {
        const translatedTitle = overlay.lessons?.[lesson.id]?.title;
        return translatedTitle ? { ...lesson, title: translatedTitle } : lesson;
      }),
    };
  });
}

/** Whether one lesson has a translation in this locale (English is always true). */
export function isLessonTranslatedIn(moduleId, lessonId, locale = 'en') {
  if (locale === 'en') return true;
  return Boolean(OVERLAYS[locale]?.[moduleId]?.lessons?.[lessonId]);
}

/** How much of a module is translated, for progress reporting and tooling. */
export function translationCoverage(moduleId, locale = 'en') {
  const base = MODULES_MAP[moduleId];
  if (!base) return { total: 0, translated: 0 };
  const overlay = OVERLAYS[locale]?.[moduleId];
  const translated = base.lessons.filter((l) => overlay?.lessons?.[l.id]).length;
  return { total: base.lessons.length, translated };
}

export const SUPPORTED_LOCALES = ['en', 'tr'];
