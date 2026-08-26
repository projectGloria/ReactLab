// v5 — 2026-08-18 — fix infinite render loop: `state.lessonState?.[id] || {}`
//   inline fallback returned a fresh object every render, breaking
//   zustand 5's useSyncExternalStore referential equality (same bug as
//   LessonView.jsx v5). Now selects raw value + useMemo against a
//   module-level EMPTY_LESSON_PROGRESS singleton.
// v4 — 2026-08-18 — narrow Zustand subscriptions to required state slices
﻿import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSandpack } from '@codesandbox/sandpack-react';
import { validators } from '../../curriculum/validators.js';
import useProgressStore from '../../store/useProgressStore.js';
import { celebrateLesson, celebrateModule } from '../../lib/celebrate.js';
import { isFinalLessonInModule } from '../../lib/progression.js';
import { runRuntimeAssertion } from '../../lib/runtimeTestHarness.js';

const EMPTY_LESSON_PROGRESS = {};

export default function CodeActions({ lesson, nextLessonPath }) {
  const { sandpack } = useSandpack();
  const markCompleted = useProgressStore((state) => state.markCompleted);
  const recordChallengeAttempt = useProgressStore((state) => state.recordChallengeAttempt);
  const [validationState, setValidationState] = useState(null);
  const [errors, setErrors] = useState([]);
  const completedLessons = useProgressStore(state => state.completedLessons);
  const isCompleted = completedLessons.includes(lesson.id);
  const lessonProgressRaw = useProgressStore(state => state.lessonState?.[lesson.id]);
  const lessonProgress = useMemo(() => lessonProgressRaw || EMPTY_LESSON_PROGRESS, [lessonProgressRaw]);
  const validatorConfig = validators[lesson.id];
  const requiresObservation = !Array.isArray(validatorConfig) && validatorConfig?.requiresObservation;
  const [observationConfirmed, setObservationConfirmed] = useState(false);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const schedule = (callback, delay) => {
    const timer = window.setTimeout(callback, delay);
    timers.current.push(timer);
  };

  const handleCheckAnswer = () => {
    setValidationState('checking');

    try {
      const cached = Object.fromEntries(Object.entries(sandpack.files).map(([path, file]) => [path, file.code]));

      const stripComments = (str) => {
        if (typeof str !== 'string') return '';
        return str.replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\/\*[\s\S]*?\*\/|\/\/[^\n]*)/g, (match, stringLiteral) => {
          return stringLiteral !== undefined ? stringLiteral : '';
        });
      };

      let currentCode = '';
      let filesWithoutComments = {};

      if (typeof cached === 'object' && cached !== null) {
        // Prefer the conventional entry file. If a lesson's files don't include one
        // (e.g. a multi-file lesson named after its component instead of App.*),
        // fall back to the first non-test, non-stylesheet file rather than silently
        // validating against an empty string.
        const entryPath = ['/App.js', '/App.tsx', '/App.jsx'].find(p => cached[p] !== undefined)
          ?? Object.keys(cached).find(p => !/\.test\.[jt]sx?$/.test(p) && !p.endsWith('.css'));
        currentCode = stripComments(entryPath ? cached[entryPath] : '');
        for (const [p, c] of Object.entries(cached)) {
          filesWithoutComments[p] = { code: stripComments(c) };
        }
      } else {
        currentCode = stripComments(cached || '');
        filesWithoutComments = { '/App.jsx': { code: currentCode } };
      }

      const rules = Array.isArray(validatorConfig) ? validatorConfig : validatorConfig?.rules;
      let activeErrors = [];

      const runtimeError = sandpack.error?.message || sandpack.error;
      if (runtimeError) {
        activeErrors.push('Compilation/Runtime Error: ' + runtimeError);
      }

      if (requiresObservation && !observationConfirmed) {
        activeErrors.push('Confirm that you observed the parent and child render logs before completing this lesson.');
      } else if (!Array.isArray(rules) || (rules.length === 0 && !requiresObservation)) {
        activeErrors.push('Automated validation is not configured for this lesson yet.');
      }

      const failedRules = Array.isArray(rules) ? rules.filter(rule => !rule.test(currentCode, filesWithoutComments)) : [];

      schedule(async () => {
        // Run any runtime assertions if validator specifies runtimeTests
        const runtimeTests = validatorConfig?.runtimeTests;
        if (runtimeTests && Array.isArray(runtimeTests) && failedRules.length === 0 && activeErrors.length === 0) {
          const iframeEl = document.querySelector('.sp-preview-iframe') || document.querySelector('iframe');
          const iframeWindow = iframeEl?.contentWindow;
          if (iframeWindow) {
            for (const t of runtimeTests) {
              const res = await runRuntimeAssertion(iframeWindow, t.type, t.options);
              if (!res.ok) {
                activeErrors.push(res.message);
              }
            }
          }
        }

        if (activeErrors.length > 0) {
          setValidationState('error');
          setErrors(activeErrors);
          recordChallengeAttempt(lesson.id, { outcome: 'failed', solutionViewed: Boolean(lessonProgress.solutionViewed), independent: !lessonProgress.solutionViewed });
          schedule(() => setValidationState(null), 4000);
        } else if (failedRules.length === 0) {
          setValidationState('success');
          setErrors([]);
          schedule(() => {
            recordChallengeAttempt(lesson.id, { outcome: 'passed', solutionViewed: Boolean(lessonProgress.solutionViewed), independent: !lessonProgress.solutionViewed });
            if (!isCompleted) {
              if (isFinalLessonInModule(lesson.id, completedLessons)) {
                celebrateModule();
              } else {
                celebrateLesson();
              }
            }
            markCompleted(lesson.id, { challengePassed: true, passedIndependently: !lessonProgress.solutionViewed });
            setValidationState(null);
          }, 1500);
        } else {
          setValidationState('error');
          setErrors(failedRules.map(r => r.message));
          recordChallengeAttempt(lesson.id, { outcome: 'failed', solutionViewed: Boolean(lessonProgress.solutionViewed), independent: !lessonProgress.solutionViewed });
          schedule(() => setValidationState(null), 4000);
        }
      }, 600);
    } catch (error) {
      console.error('Challenge validation failed:', error);
      setValidationState('error');
      setErrors(['Failed to read the current playground code.']);
      schedule(() => setValidationState(null), 4000);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {requiresObservation && !observationConfirmed && (
        <button
          onClick={() => setObservationConfirmed(true)}
          style={{
            padding: '8px 12px', backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', fontWeight: 600,
          }}
        >
          I observed it
        </button>
      )}
      <button 
        onClick={handleCheckAnswer}
        disabled={validationState === 'checking'}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 16px',
          backgroundColor: validationState === 'success' ? 'var(--success-solid)' : validationState === 'error' ? 'var(--error-solid)' : 'var(--accent-solid)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.75rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
          opacity: validationState === 'checking' ? 0.7 : 1
        }}
      >
        <CheckCircle size={14} /> 
        {validationState === 'checking' ? 'Checking...' : validationState === 'success' ? 'Correct!' : 'Check Answer'}
      </button>

      {isCompleted && nextLessonPath && (
        <Link 
          to={nextLessonPath}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px',
            backgroundColor: 'var(--bg-hover)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            textDecoration: 'none'
          }}
        >
          Next Lesson <ArrowRight size={14} />
        </Link>
      )}

      {validationState === 'error' && (
        <div role="alert" style={{
          position: 'absolute',
          top: '40px',
          right: '16px',
          backgroundColor: 'var(--error-solid)',
          color: 'white',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '0.8rem',
          zIndex: 100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          maxWidth: '300px'
        }}>
          <strong style={{ display: 'block', marginBottom: '8px' }}>Not quite right:</strong>
          <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}


