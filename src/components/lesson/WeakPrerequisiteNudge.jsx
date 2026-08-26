import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { getWeakPrerequisites } from '../../lib/progression.js';

// Surfaces prerequisite lessons (from the last 3 in curriculum order) that
// look shaky based on this learner's own Review Lab signals — failed
// challenge, solution viewed, missed learning checks, or overdue for review.
// Links straight to Review Lab filtered to that lesson's module so the fix
// is one click away instead of a separate trip to go find it.
export default function WeakPrerequisiteNudge({ lessonId, lessonState, moduleId }) {
  const weak = useMemo(
    () => getWeakPrerequisites(lessonId, lessonState || {}),
    [lessonId, lessonState]
  );
  if (!weak.length) return null;
  return (
    <div className="ui-card" style={{ padding: '14px 16px', marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'flex-start', borderColor: 'var(--warning)' }}>
      <Sparkles size={17} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
      <div style={{ fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--text-primary)' }}>This lesson builds on material that's a bit shaky for you: </strong>
        {weak.map((w, i) => (
          <span key={w.lesson.id}>
            {i > 0 && ', '}
            <Link to={`/review?module=${w.lesson.moduleId}`} style={{ color: 'var(--text-primary)', fontStyle: 'normal', textDecoration: 'underline', textDecorationColor: 'var(--border-subtle)' }}>{w.lesson.title}</Link> ({w.reason})
          </span>
        ))}
        {'. '}
        <Link to={`/review?module=${weak[0].lesson.moduleId}`} style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
          Review {weak.length > 1 ? 'them' : 'it'} in Review Lab first <ArrowRight size={12} style={{ verticalAlign: 'middle' }} />
        </Link>
      </div>
    </div>
  );
}
