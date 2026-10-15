import { describe, it, expect } from 'vitest';
import curriculum from '../index.js';
import { MODULES_MAP } from '../registry.js';
import { MODULES_MAP_TR } from '../registryTr.js';
import {
  getLocalizedModuleData,
  getLocalizedCurriculum,
  isLessonTranslatedIn,
  mergeLesson,
} from '../localizedCurriculum.js';

// The whole safety argument for shipping a translation is that a translated
// lesson cannot change the code a learner runs or is graded on. These tests pin
// that: the overlay may only replace prose.

const translatedPairs = [];
for (const [moduleId, overlay] of Object.entries(MODULES_MAP_TR)) {
  for (const lessonId of Object.keys(overlay.lessons || {})) {
    translatedPairs.push([moduleId, lessonId]);
  }
}

describe('localizedCurriculum', () => {
  it('has something to test', () => {
    expect(translatedPairs.length).toBeGreaterThan(0);
  });

  describe.each(translatedPairs)('%s/%s', (moduleId, lessonId) => {
    const en = MODULES_MAP[moduleId].lessons.find((l) => l.id === lessonId);
    const tr = getLocalizedModuleData(moduleId, 'tr').lessons.find((l) => l.id === lessonId);

    it('keeps every code field byte-identical to English', () => {
      expect(tr.starterCode).toBe(en.starterCode);
      expect(tr.solutionCode).toBe(en.solutionCode);
      expect(tr.exampleWalkthrough?.code).toBe(en.exampleWalkthrough?.code);
      expect(tr.walkthrough?.code).toBe(en.walkthrough?.code);
      expect(tr.dependencies).toEqual(en.dependencies);
    });

    it('keeps highlighted lines aligned with the code they point at', () => {
      const lines = (w) => (w?.steps || []).map((s) => s.highlightLines);
      expect(lines(tr.exampleWalkthrough)).toEqual(lines(en.exampleWalkthrough));
      expect(lines(tr.walkthrough)).toEqual(lines(en.walkthrough));
    });

    it('actually replaces the prose', () => {
      expect(tr.content).not.toBe(en.content);
      expect(tr.content.length).toBeGreaterThan(100);
    });

    it('keeps the lesson id, so progress and routing are unaffected', () => {
      expect(tr.id).toBe(en.id);
    });
  });

  it('falls back to English for an untranslated module', () => {
    const untranslated = curriculum.find((m) => !MODULES_MAP_TR[m.id]);
    expect(untranslated, 'expected at least one untranslated module').toBeDefined();
    expect(getLocalizedModuleData(untranslated.id, 'tr')).toBe(MODULES_MAP[untranslated.id]);
  });

  it('falls back per lesson inside a partially translated module', () => {
    // A module present in the overlay but missing one lesson must still return
    // that lesson, in English, rather than dropping it from the curriculum.
    const partial = { lessons: { nope: { title: 'x', content: 'y' } } };
    const base = MODULES_MAP.fundamentals.lessons[0];
    expect(mergeLesson(base, partial.lessons[base.id])).toBe(base);
  });

  it('reports translation status per lesson', () => {
    const [moduleId, lessonId] = translatedPairs[0];
    expect(isLessonTranslatedIn(moduleId, lessonId, 'tr')).toBe(true);
    expect(isLessonTranslatedIn(moduleId, lessonId, 'en')).toBe(true);
    expect(isLessonTranslatedIn('performance', 'reconciliation', 'tr')).toBe(false);
  });

  it('localizes navigation titles without changing ids or order', () => {
    const localized = getLocalizedCurriculum(curriculum, 'tr');
    expect(localized.map((m) => m.id)).toEqual(curriculum.map((m) => m.id));
    for (const [i, module] of localized.entries()) {
      expect(module.lessons.map((l) => l.id)).toEqual(curriculum[i].lessons.map((l) => l.id));
    }
    const intro = localized.find((m) => m.id === 'intro');
    expect(intro.title).toBe('Başlangıç');
  });

  it('returns the curriculum untouched for an unknown locale', () => {
    expect(getLocalizedCurriculum(curriculum, 'de')).toBe(curriculum);
  });
});
