import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const now = () => new Date().toISOString();

const mergeLessonState = (state, lessonId, patch) => ({
  ...state.lessonState,
  [lessonId]: {
    ...state.lessonState?.[lessonId],
    ...patch,
    lastVisited: now(),
  },
});

const useProgressStore = create(
  persist(
    (set, get) => ({
      completedLessons: [],
      lessonState: {},
      currentLesson: null,
      calibrationLog: [],

      markCompleted: (lessonId, metadata = {}) => set((state) => ({
        completedLessons: state.completedLessons.includes(lessonId)
          ? state.completedLessons
          : [...state.completedLessons, lessonId],
        lessonState: mergeLessonState(state, lessonId, {
          status: 'complete',
          completedAt: state.lessonState?.[lessonId]?.completedAt || now(),
          ...metadata,
        }),
      })),

      toggleCompleted: (lessonId) => set((state) => {
        const isCompleted = state.completedLessons.includes(lessonId);
        return {
          completedLessons: isCompleted
            ? state.completedLessons.filter((id) => id !== lessonId)
            : [...state.completedLessons, lessonId],
          lessonState: mergeLessonState(state, lessonId, {
            status: isCompleted ? 'incomplete' : 'complete',
            ...(isCompleted ? {} : { completedAt: now() }),
          }),
        };
      }),

      setCurrentLesson: (lessonId) => set((state) => ({
        currentLesson: lessonId,
        lessonState: mergeLessonState(state, lessonId, {}),
      })),

      recordChallengeAttempt: (lessonId, result = {}) => set((state) => {
        const previous = state.lessonState?.[lessonId] || {};
        return {
          lessonState: mergeLessonState(state, lessonId, {
            challengeAttempts: (previous.challengeAttempts || 0) + 1,
            lastChallengeResult: result.outcome || 'failed',
            lastChallengeAt: now(),
            ...(result.solutionViewed ? { solutionViewed: true } : {}),
            ...(result.hintsUsed ? { hintsUsed: (previous.hintsUsed || 0) + result.hintsUsed } : {}),
            ...(result.outcome === 'passed' ? {
              independentPasses: (previous.independentPasses || 0) + (result.independent ? 1 : 0),
              passedAfterSupport: result.independent
                ? (previous.passedAfterSupport || 0)
                : (previous.passedAfterSupport || 0) + 1,
            } : {}),
          }),
        };
      }),

      recordSolutionViewed: (lessonId) => set((state) => ({
        lessonState: mergeLessonState(state, lessonId, {
          solutionViewed: true,
          solutionViewedAt: now(),
        }),
      })),

      recordLearningCheck: (lessonId, checkId, result = {}) => set((state) => {
        // Global calibration log (confidence vs. actual correctness) powers the
        // Review Lab calibration chart — kept separate from per-lesson learningChecks
        // because that only stores the LATEST result per check, overwriting history
        // on every retry. This is an append-only trail, capped so it can't grow forever.
        const shouldLog = result.correct !== null && result.correct !== undefined && result.confidence;
        const calibrationLog = shouldLog
          ? [...(state.calibrationLog || []), { confidence: result.confidence, correct: result.correct, at: now() }].slice(-200)
          : (state.calibrationLog || []);
        return {
          calibrationLog,
          lessonState: mergeLessonState(state, lessonId, {
            learningChecks: {
              ...state.lessonState?.[lessonId]?.learningChecks,
              [checkId]: {
                ...result,
                attempts: (state.lessonState?.[lessonId]?.learningChecks?.[checkId]?.attempts || 0) + 1,
                answeredAt: now(),
              },
            },
          }),
        };
      }),

      recordReview: (lessonId, rating = 'hard', reasons = []) => set((state) => {
        const previous = state.lessonState?.[lessonId] || {};
        // Interval grows with consecutive non-'again' reviews (like SM-2-style spaced
        // repetition), instead of being pinned to a flat 1 day forever. Capped at 60
        // days so lessons never disappear from rotation for too long.
        const priorStreak = previous.reviewStreak || 0;
        let days;
        if (rating === 'again') days = 0;
        else if (rating === 'hard') days = 1;
        else {
          const base = rating === 'easy' ? 7 : 3;
          days = Math.min(Math.round(base * Math.pow(1.6, priorStreak)), 60);
        }
        const reviewedAt = now();
        const nextReviewAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
        // Short rolling history of why each review was triggered (the priority-breakdown
        // labels active at review time), so the UI can spot a reason recurring across
        // several reviews in a row rather than only ever showing the current snapshot.
        const reviewHistory = [...(previous.reviewHistory || []), { at: reviewedAt, rating, reasons }].slice(-8);
        return {
          lessonState: mergeLessonState(state, lessonId, {
            lastReviewedAt: reviewedAt,
            nextReviewAt,
            lastReviewRating: rating,
            reviewCount: (previous.reviewCount || 0) + 1,
            reviewStreak: rating === 'again' ? 0 : (previous.reviewStreak || 0) + 1,
            reviewHistory,
          }),
        };
      }),
      resetProgress: () => set({
        completedLessons: [],
        lessonState: {},
        currentLesson: null,
        calibrationLog: [],
      }),

      // Progress lives only in this browser's localStorage — no backup, no
      // cross-device sync. Export/import gives a manual way to back it up or
      // move it, and to recover if local storage ever gets cleared.
      exportProgress: () => {
        const { completedLessons, lessonState, currentLesson, calibrationLog } = get();
        return { version: 1, exportedAt: now(), completedLessons, lessonState, currentLesson, calibrationLog };
      },
      importProgress: (data) => {
        if (
          !data || typeof data !== 'object' ||
          !Array.isArray(data.completedLessons) ||
          typeof data.lessonState !== 'object' || data.lessonState === null
        ) {
          return { ok: false, error: "That file doesn't look like a ReactLab progress export." };
        }
        set({
          completedLessons: data.completedLessons,
          lessonState: data.lessonState,
          currentLesson: data.currentLesson ?? null,
          calibrationLog: Array.isArray(data.calibrationLog) ? data.calibrationLog : [],
        });
        return { ok: true };
      },
    }),
    {
      name: 'reactlab_progress',
    },
  ),
);

// Explicit cross-window state rehydration for multi-window desktop setups
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'reactlab_progress') {
      useProgressStore.persist?.rehydrate();
    }
  });
}

export default useProgressStore;
