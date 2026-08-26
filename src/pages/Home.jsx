// v4 — 2026-08-18 — narrow Zustand subscriptions to required state slices
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import curriculum, { TOTAL_LESSONS } from '../curriculum/index';
import useProgressStore from '../store/useProgressStore';
import { Play, BookOpen, Award, ArrowRight, AlertTriangle } from 'lucide-react';

// Rolls the per-lesson signals ReviewDashboard already tracks (missed learning
// checks, failed challenges, solution peeks) up to the module level, so weak
// spots are visible before diving into any single lesson's review queue.
function computeModuleHealth(curriculum, lessonState) {
  return curriculum.map((mod) => {
    let touched = 0;
    let weight = 0;
    mod.lessons.forEach((lesson) => {
      const state = lessonState?.[lesson.id];
      if (!state) return;
      const checks = Object.values(state.learningChecks || {});
      const missed = checks.filter((c) => c.correct === false).length;
      const lessonWeight = missed * 15 + (state.lastChallengeResult === 'failed' ? 20 : 0) + (state.solutionViewed ? 8 : 0);
      if (checks.length > 0 || state.challengeAttempts) touched += 1;
      weight += lessonWeight;
    });
    // Only rate modules with enough signal to say something meaningful.
    const hasSignal = touched >= 2;
    return { module: mod, weight, touched, hasSignal };
  });
}

export default function Home() {
  const navigate = useNavigate();
  const currentLesson = useProgressStore((state) => state.currentLesson);
  const completedLessons = useProgressStore((state) => state.completedLessons);
  const lessonState = useProgressStore((state) => state.lessonState);
  
  // Find where to start/resume
  const { targetPath, isResuming } = React.useMemo(() => {
    let path = `/lesson/${curriculum[0].id}/${curriculum[0].lessons[0].id}`;
    let resuming = false;

    if (currentLesson) {
      for (const mod of curriculum) {
        const lesson = mod.lessons.find(l => l.id === currentLesson);
        if (lesson) {
          path = `/lesson/${mod.id}/${lesson.id}`;
          resuming = true;
          break;
        }
      }
    } else if (completedLessons.length > 0) {
      let found = false;
      for (const mod of curriculum) {
        for (const lesson of mod.lessons) {
          if (!completedLessons.includes(lesson.id)) {
            path = `/lesson/${mod.id}/${lesson.id}`;
            resuming = true;
            found = true;
            break;
          }
        }
        if (found) break;
      }
    }
    return { targetPath: path, isResuming: resuming };
  }, [currentLesson, completedLessons]);

  const progressPercent = Math.round((completedLessons.length / TOTAL_LESSONS) * 100);

  const moduleHealth = React.useMemo(() => computeModuleHealth(curriculum, lessonState), [lessonState]);
  const maxWeight = Math.max(1, ...moduleHealth.map((m) => m.weight));
  const hasAnySignal = moduleHealth.some((m) => m.hasSignal);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '40px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background blur elements */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '20%',
        width: '400px',
        height: '400px',
        background: 'var(--accent-glow)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '20%',
        width: '300px',
        height: '300px',
        background: 'var(--success-bg)',
        filter: 'blur(80px)',
        borderRadius: '50%',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '650px',
        padding: '56px 48px',
        backgroundColor: 'var(--bg-panel)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-subtle)',
        backdropFilter: 'var(--backdrop-blur)',
        WebkitBackdropFilter: 'var(--backdrop-blur)'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))',
          boxShadow: 'var(--shadow-glow)',
          marginBottom: '24px',
          color: 'white'
        }}>
          <BookOpen size={32} />
        </div>
        
        <h1 style={{ 
          fontSize: '3rem', 
          marginBottom: '16px', 
          background: 'linear-gradient(to right, #fff, var(--text-secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.03em'
        }}>
          Master ReactJS
        </h1>
        
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '1.2rem', 
          marginBottom: '40px',
          lineHeight: 1.6
        }}>
          A curated journey from the fundamentals to advanced patterns. Complete lessons, write real code, and track your progress.
        </p>

        {completedLessons.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '40px',
            padding: '16px 24px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <Award size={24} color="var(--success)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Your Progress</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                <div style={{ width: '150px', height: '6px', backgroundColor: 'var(--bg-hover)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: 'var(--success)' }} />
                </div>
                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{progressPercent}%</span>
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={() => navigate(targetPath)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '18px 40px',
            backgroundColor: 'var(--accent-solid)',
            color: '#141413',
            border: 'none',
            borderRadius: '100px',
            fontSize: '1.1rem',
            fontWeight: 600,
            boxShadow: '0 4px 14px 0 var(--accent-glow)',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s, background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 24px var(--accent-glow)';
            e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px 0 var(--accent-glow)';
            e.currentTarget.style.backgroundColor = 'var(--accent-solid)';
          }}
        >
          {isResuming ? <Play size={20} fill="currentColor" /> : <BookOpen size={20} />}
          {isResuming ? 'Resume Learning' : 'Start Your Journey'}
          <ArrowRight size={20} />
        </button>
      </div>

      {hasAnySignal && (
        <div className="ui-card" style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '650px',
          width: '100%',
          marginTop: '24px',
          textAlign: 'left',
          padding: '22px 26px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <AlertTriangle size={16} color="var(--warning)" />
            <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>Where you're weakest</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {moduleHealth.map(({ module, weight, hasSignal }) => (
              <Link
                key={module.id}
                to={hasSignal ? `/review?module=${module.id}` : `/module/${module.id}`}
                style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'var(--text-primary)' }}
                title={hasSignal ? `Review the "${module.title}" lessons you've struggled with` : `Open ${module.title}`}
              >
                <span style={{ fontSize: 13, width: 170, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{module.title}</span>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--bg-hover)', overflow: 'hidden' }}>
                  {hasSignal && (
                    <div style={{
                      height: '100%',
                      width: `${Math.max(4, (weight / maxWeight) * 100)}%`,
                      background: weight / maxWeight > 0.6 ? 'var(--error)' : weight / maxWeight > 0.25 ? 'var(--warning)' : 'var(--success)',
                      borderRadius: 4,
                    }} />
                  )}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 68, textAlign: 'right' }}>
                  {hasSignal ? (weight === 0 ? 'Solid' : weight / maxWeight > 0.6 ? 'Needs work' : weight / maxWeight > 0.25 ? 'Shaky' : 'Mostly fine') : 'Not enough data'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
