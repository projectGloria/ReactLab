// v1 — 2026-09-14 — completion affordance for lessons with no graded challenge.
//
// `markCompleted` used to be reachable from exactly one place: the Check Answer
// button inside ChallengeModal. That button only renders when a lesson has a
// `### Challenge` section, and the three capstones deliberately have none — they
// are project briefs, not graded exercises. So the final module had no in-lesson
// way to be completed at all, and because unlocking is strictly linear
// (progression.js), capstone 1 blocked capstones 2 and 3 permanently. The only
// escape was a right-click context menu in the sidebar, which nothing points at.
//
// This renders in place of "Take Challenge" on those lessons.
import { useMemo, useState } from 'react';
import { CheckCircle, Circle, RotateCcw } from 'lucide-react';
import useProgressStore from '../../store/useProgressStore.js';
import { celebrateLesson, celebrateModule } from '../../lib/celebrate.js';
import { isFinalLessonInModule } from '../../lib/progression.js';

const EMPTY_RUBRIC = {};

/**
 * Pull the bullets out of a capstone's `## Acceptance rubric` section.
 *
 * Parsing the lesson's own markdown rather than duplicating the criteria in a
 * second place means the checklist cannot drift from the brief the learner just
 * read — the same reason the curriculum keeps hints and solutions in the lesson
 * body instead of beside it.
 */
export function parseRubric(markdown) {
  const section = String(markdown || '').match(/##\s*Acceptance rubric\s*\n([\s\S]*?)(?=\n##\s|\n###\s|$)/i);
  if (!section) return [];
  return [...section[1].matchAll(/^[-*]\s+(.+)$/gm)].map((m) => m[1].trim()).filter(Boolean);
}

export default function ProjectCompleteButton({ lessonId, rubricSource = '', compact = false }) {
  const completedLessons = useProgressStore((state) => state.completedLessons);
  const markCompleted = useProgressStore((state) => state.markCompleted);
  const toggleCompleted = useProgressStore((state) => state.toggleCompleted);
  const toggleRubricCriterion = useProgressStore((state) => state.toggleRubricCriterion);
  const rubricStateRaw = useProgressStore((state) => state.lessonState?.[lessonId]?.rubric);
  const rubricState = rubricStateRaw || EMPTY_RUBRIC;
  const isCompleted = completedLessons.includes(lessonId);
  const [confirming, setConfirming] = useState(false);

  const criteria = useMemo(() => parseRubric(rubricSource), [rubricSource]);
  const ticked = criteria.filter((c) => rubricState[c]).length;
  const allTicked = criteria.length > 0 && ticked === criteria.length;

  const handleComplete = () => {
    if (isFinalLessonInModule(lessonId, completedLessons)) {
      celebrateModule();
    } else {
      celebrateLesson();
    }
    // No `challengePassed` / `passedIndependently` here on purpose: this is a
    // self-assessed project, and Review Lab's priority score should not treat it
    // as a graded pass it never earned.
    markCompleted(lessonId, { selfAssessed: true });
    setConfirming(false);
  };

  if (isCompleted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', margin: '50px 0 30px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: compact ? '12px 32px' : '14px 36px',
          border: '1px solid var(--success-solid)', borderRadius: '100px',
          color: 'var(--success-solid)', fontSize: compact ? '0.85rem' : '0.9rem',
          fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          <CheckCircle size={16} strokeWidth={2.5} />
          <span>Project complete</span>
        </div>
        <button
          onClick={() => toggleCompleted(lessonId)}
          className="ui-btn-ghost"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', padding: '6px 14px' }}
        >
          <RotateCcw size={13} /> Mark as still in progress
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', margin: '50px 0 30px' }}>
      <p style={{ margin: 0, maxWidth: '460px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
        There is no automated check for a capstone. Work through the acceptance rubric,
        and mark it complete once you can defend every decision in it.
      </p>

      {criteria.length > 0 && (
        <div style={{
          width: '100%', maxWidth: '560px', textAlign: 'left',
          padding: '18px 20px', borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            marginBottom: '12px', fontSize: '0.7rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)',
          }}>
            <span>Acceptance rubric</span>
            <span style={{ color: allTicked ? 'var(--success-solid)' : 'var(--text-muted)' }}>
              {ticked} of {criteria.length}
            </span>
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {criteria.map((criterion) => {
              const done = Boolean(rubricState[criterion]);
              return (
                <li key={criterion}>
                  <button
                    onClick={() => toggleRubricCriterion(lessonId, criterion)}
                    aria-pressed={done}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '10px', width: '100%',
                      padding: '7px 8px', background: 'none', border: 'none', borderRadius: 'var(--radius-sm)',
                      textAlign: 'left', cursor: 'pointer', lineHeight: 1.5,
                      color: done ? 'var(--text-muted)' : 'var(--text-primary)',
                      fontSize: '0.875rem',
                      textDecoration: done ? 'line-through' : 'none',
                    }}
                  >
                    {done
                      ? <CheckCircle size={15} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--success-solid)' }} />
                      : <Circle size={15} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--text-muted)' }} />}
                    <span>{criterion}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {confirming ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleComplete}
            className="ui-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', fontSize: '0.85rem' }}
          >
            <CheckCircle size={15} /> Yes, I have met the rubric
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="ui-btn-ghost"
            style={{ padding: '10px 22px', fontSize: '0.85rem' }}
          >
            Not yet
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          title={criteria.length > 0 && !allTicked ? `${criteria.length - ticked} rubric criteria still unticked — you can still mark it complete.` : undefined}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: compact ? '12px 32px' : '14px 36px',
            border: '1px solid var(--accent-primary)', borderRadius: '100px',
            backgroundColor: 'transparent', color: 'var(--accent-primary)',
            fontSize: compact ? '0.85rem' : '0.9rem', cursor: 'pointer',
            fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
            outline: 'none',
          }}
        >
          <CheckCircle size={16} strokeWidth={2.5} />
          <span>Mark project complete</span>
        </button>
      )}
    </div>
  );
}
