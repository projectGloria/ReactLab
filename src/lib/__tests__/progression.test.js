// v6 — 2026-08-18 — correct module-readiness regression to match production contract
// v5 — 2026-08-18 — add progression-engine regression coverage
import { describe, expect, it } from 'vitest';
import {
  ALL_ORDERED_LESSONS,
  getModuleReadiness,
  getPrerequisiteLesson,
  getWeakPrerequisites,
  isFinalLessonInModule,
  isLessonUnlocked,
  isModuleUnlocked,
} from '../progression.js';

const firstLesson = ALL_ORDERED_LESSONS[0];
const secondLesson = ALL_ORDERED_LESSONS[1];
const thirdLesson = ALL_ORDERED_LESSONS[2];

describe('progression unlock rules', () => {
  it('keeps the first lesson unlocked', () => {
    expect(isLessonUnlocked(firstLesson.id)).toBe(true);
  });

  it('requires the immediately previous lesson', () => {
    expect(isLessonUnlocked(secondLesson.id)).toBe(false);
    expect(isLessonUnlocked(secondLesson.id, [firstLesson.id])).toBe(true);
  });

  it('allows a completed lesson to remain unlocked', () => {
    expect(isLessonUnlocked(secondLesson.id, [secondLesson.id])).toBe(true);
  });

  it('supports unlock-all without weakening normal gating', () => {
    expect(isLessonUnlocked(thirdLesson.id)).toBe(false);
    expect(isLessonUnlocked(thirdLesson.id, [], true)).toBe(true);
  });

  it('returns false for an unknown lesson', () => {
    expect(isLessonUnlocked('does-not-exist')).toBe(false);
  });
});

describe('module unlock rules', () => {
  it('keeps the first module unlocked', () => {
    expect(isModuleUnlocked(firstLesson.moduleId)).toBe(true);
  });

  it('unlocks the next module when its first lesson is unlocked', () => {
    const nextModule = ALL_ORDERED_LESSONS.find(
      (lesson) => lesson.moduleIndex === firstLesson.moduleIndex + 1
    );

    expect(nextModule).toBeDefined();
    expect(isModuleUnlocked(nextModule.moduleId)).toBe(false);

    const prerequisite = getPrerequisiteLesson(nextModule.id);
    expect(prerequisite).not.toBeNull();
    expect(isModuleUnlocked(nextModule.moduleId, [prerequisite.id])).toBe(true);
  });

  it('returns false for an unknown module', () => {
    expect(isModuleUnlocked('does-not-exist')).toBe(false);
  });
});

describe('prerequisite lookup', () => {
  it('returns null for the first lesson', () => {
    expect(getPrerequisiteLesson(firstLesson.id)).toBeNull();
  });

  it('returns the immediately preceding lesson', () => {
    expect(getPrerequisiteLesson(secondLesson.id)?.id).toBe(firstLesson.id);
  });
});

describe('module completion detection', () => {
  it('does not mark an early lesson as the final lesson', () => {
    expect(isFinalLessonInModule(firstLesson.id)).toBe(false);
  });

  it('marks the final lesson when every other lesson is complete', () => {
    const moduleLessons = ALL_ORDERED_LESSONS.filter(
      (lesson) => lesson.moduleId === firstLesson.moduleId
    );
    const finalLesson = moduleLessons[moduleLessons.length - 1];
    const completed = moduleLessons
      .filter((lesson) => lesson.id !== finalLesson.id)
      .map((lesson) => lesson.id);

    expect(isFinalLessonInModule(finalLesson.id, completed)).toBe(true);
  });
});

describe('weak prerequisite detection', () => {
  it('flags a failed challenge that also required the solution', () => {
    const state = {
      [firstLesson.id]: {
        status: 'complete',
        lastChallengeResult: 'failed',
        solutionViewed: true,
      },
    };

    const result = getWeakPrerequisites(secondLesson.id, state);

    expect(result).toHaveLength(1);
    expect(result[0].lesson.id).toBe(firstLesson.id);
    expect(result[0].reason).toBe('you needed the solution here');
  });

  it('flags missed learning checks', () => {
    const state = {
      [firstLesson.id]: {
        status: 'complete',
        learningChecks: {
          one: { correct: false },
          two: { correct: false },
          three: { correct: true },
        },
      },
    };

    const result = getWeakPrerequisites(secondLesson.id, state);

    expect(result[0].reason).toBe('missed 2 learning checks');
  });

  it('ignores incomplete prerequisite state', () => {
    const state = {
      [firstLesson.id]: {
        status: 'in-progress',
        lastChallengeResult: 'failed',
        solutionViewed: true,
      },
    };

    expect(getWeakPrerequisites(secondLesson.id, state)).toEqual([]);
  });
});

describe('module readiness', () => {
  it('returns null for the first module', () => {
    expect(getModuleReadiness(firstLesson.moduleId, {})).toBeNull();
  });

  it('returns readiness after prior-module progress exists', () => {
    const laterModule = ALL_ORDERED_LESSONS.find(
      (lesson) => lesson.moduleIndex === firstLesson.moduleIndex + 1
    );

    expect(laterModule).toBeDefined();

    const priorLessons = ALL_ORDERED_LESSONS.filter(
      (lesson) => lesson.moduleId === firstLesson.moduleId
    );
    const lessonState = {
      [priorLessons[0].id]: {
        status: 'complete',
        learningChecks: {},
        lastChallengeResult: 'passed',
        solutionViewed: false,
      },
    };

    const readiness = getModuleReadiness(laterModule.moduleId, lessonState);

    expect(readiness).not.toBeNull();
    expect(readiness.completedCount).toBe(1);
    expect(readiness.totalCount).toBe(priorLessons.length);
    expect(readiness.weakLessons).toEqual([]);
  });
});
