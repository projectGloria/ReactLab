// v1 — 2026-09-14 — extracted from LessonView, which rendered this block twice.
//
// LessonView has two layouts (compact and wide) and carried a verbatim copy of
// the insight list in each. Two copies means a change to one of them is a change
// half the readers never see, which is how the badge styling and the click
// handler drifted apart in the first place.
import { Lightbulb, ArrowRight } from 'lucide-react';

// Three visual kinds, from four authored types. `pro-tip` and `did-you-know`
// both read as a tip and share styling. `legacy` is its own kind on purpose:
// the course deliberately shows superseded APIs (forwardRef, render props,
// cloneElement, throwing promises) so they can be *read* in existing code, and
// a reader who cannot tell those apart from current practice will copy them.
// That confusion is exactly what produced the forwardRef card that contradicted
// its own lesson.
const BADGES = {
  misconception: { label: 'Misconception', bg: 'rgba(193, 95, 60, 0.15)', fg: '#c15f3c' },
  legacy: { label: 'Legacy — recognise, don’t write', bg: 'rgba(140, 122, 168, 0.18)', fg: '#a692c9' },
  default: { label: 'Tip', bg: 'rgba(120, 140, 93, 0.15)', fg: '#788c5d' },
};

const badgeFor = (type) => BADGES[type] || BADGES.default;

export default function InsightList({ insights, onOpen, compact = false }) {
  if (!insights || insights.length === 0) return null;

  // The two call sites only ever differed by a few pixels of breathing room.
  const s = compact
    ? { marginTop: '40px', padding: '24px', heading: '1.1rem', button: '12px 16px', badge: '2px 8px', badgeFont: '0.7rem', title: undefined }
    : { marginTop: '48px', padding: '28px', heading: '1.15rem', button: '14px 18px', badge: '3px 8px', badgeFont: '0.72rem', title: '0.95rem' };

  return (
    <div style={{ marginTop: s.marginTop, padding: s.padding, backgroundColor: 'rgba(217, 119, 87, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(217, 119, 87, 0.1)' }}>
      <h3 style={{ margin: '0 0 16px 0', color: 'var(--warning)', fontSize: s.heading, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Lightbulb size={18} /> Insights &amp; Tips
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {insights.map((insight, idx) => {
          const badge = badgeFor(insight.type);
          return (
          <button
            key={idx}
            onClick={() => onOpen(insight, idx)}
            style={{
              textAlign: 'left',
              padding: s.button,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.borderColor = 'var(--border-focus)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                padding: s.badge,
                borderRadius: '4px',
                fontSize: s.badgeFont,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                backgroundColor: badge.bg,
                color: badge.fg,
                whiteSpace: 'nowrap',
              }}>
                {badge.label}
              </span>
              <span style={{ fontWeight: 500, fontSize: s.title }}>{insight.title}</span>
            </div>
            <ArrowRight size={16} color="var(--accent-primary)" />
          </button>
          );
        })}
      </div>
    </div>
  );
}
