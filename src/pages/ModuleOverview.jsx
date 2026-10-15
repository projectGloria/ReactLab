// v4 — 2026-08-18 — narrow Zustand subscriptions to required state slices
import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ArrowRight, CheckCircle, Circle, BookOpen, Layers, Zap, HelpCircle, Code2, Lock, TrendingUp, AlertTriangle } from 'lucide-react';
import curriculum from '../curriculum/index.js';
import { getModuleOverview } from '../curriculum/moduleOverviews.js';
import useProgressStore from '../store/useProgressStore.js';
import useUIStore from '../store/useUIStore';
import { isLessonUnlocked, isModuleUnlocked, getPrerequisiteLesson, getNextActiveLesson, getModuleReadiness } from '../lib/progression.js';
import NotFound from './NotFound.jsx';
import TypewriterCode from '../components/common/TypewriterCode.jsx';

// ─── Cinematic Slow Stagger Animation Variants ───────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.35, // 350ms between major blocks
      delayChildren: 0.15,
    },
  },
};

const subContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.22, // 220ms between each individual card
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.1, // Very slow, luxurious 1.1s glide
      ease: [0.16, 1, 0.3, 1], // Cinematic cubic bezier
    },
  },
};

// Difficulty signal derived from this learner's own history with a lesson —
// challenge attempts, whether the last attempt failed, whether they needed
// the solution. Physically reordering the module's lesson list isn't safe
// here: isLessonUnlocked() in progression.js gates each lesson strictly on
// the PREVIOUS lesson in curriculum order being complete, so resequencing
// lessons would also resequence the unlock chain. Surfacing difficulty as a
// badge gives the same "heads up, this one's harder" value without touching
// that chain.
function getDifficultySignal(state) {
  if (!state || !state.challengeAttempts) return null;
  const attempts = state.challengeAttempts;
  const struggled = state.lastChallengeResult === 'failed' || state.solutionViewed || attempts >= 3;
  if (!struggled) return null; // one or two clean attempts: nothing worth flagging
  // "Tough for you" is reserved for cases where they actually needed the
  // solution, or ground through an unusually high number of attempts on
  // their own — plain attempts >= 4 with an eventual clean pass shouldn't
  // read the same as a failed attempt they had to peek the answer for.
  const tough = state.solutionViewed || attempts >= 5;
  if (tough) return { label: 'Tough for you', color: 'var(--error)' };
  return { label: 'Took some work', color: 'var(--warning)' };
}

export default function ModuleOverview() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const completedLessons = useProgressStore((state) => state.completedLessons);
  const lessonState = useProgressStore((state) => state.lessonState);
  const unlockAllLessons = useUIStore((state) => state.unlockAllLessons);

  const moduleData = useMemo(() => {
    const mod = curriculum.find(m => m.id === moduleId);
    if (!mod) return null;
    // 1-based, like every other place a module number is shown. The raw
    // findIndex was rendered directly for a long time, so this page said
    // "Module 14" for the module the sidebar and the overview badge both
    // called 15 -- for every module in the course, not just one.
    const moduleNumber = curriculum.findIndex(m => m.id === moduleId) + 1;
    const overview = getModuleOverview(moduleId, mod.title);
    return { ...mod, moduleNumber, overview };
  }, [moduleId]);

  if (!moduleData) {
    return <NotFound />;
  }

  const { lessons, moduleNumber, overview, title: modTitle } = moduleData;

  const isModUnlocked = isModuleUnlocked(moduleId, completedLessons, unlockAllLessons);
  const readiness = useMemo(() => getModuleReadiness(moduleId, lessonState || {}), [moduleId, lessonState]);

  // Calculate module progress
  const completedCount = lessons.filter(l => completedLessons.includes(l.id)).length;
  const progressPercent = Math.round((completedCount / lessons.length) * 100);

  // Find target lesson to start/resume
  const nextLesson = lessons.find(l => !completedLessons.includes(l.id) && isLessonUnlocked(l.id, completedLessons, unlockAllLessons)) || lessons[0];
  const startPath = `/lesson/${moduleId}/${nextLesson.id}`;
  const isStarted = completedCount > 0;
  const nextActiveGlobal = getNextActiveLesson(completedLessons);

  const heroTitle = overview.tagline || overview.title || modTitle;
  const whyLearnText = overview.whyLearnIt || overview.whyLearn;
  const withoutText = overview.withoutThisReact || overview.withoutIt;
  const takeawaysList = overview.keyTakeaways || overview.takeaways || [];

  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      scrollBehavior: 'smooth',
      backgroundColor: '#0e0d0c',
      color: '#f5f5f4',
      padding: '40px 32px 80px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}
      >
        
        {/* ─── 1. Hero Section (CSSLab-inspired Dark Clay Canvas) ────────────── */}
        <motion.div
          variants={itemVariants}
          style={{
            position: 'relative',
            backgroundColor: '#171614',
            borderRadius: '24px',
            border: '1px solid var(--border-subtle)',
            padding: '48px 44px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
            gap: '40px',
            alignItems: 'center'
          }}
        >
          {/* Subtle Ambient Glow */}
          <div style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(217, 119, 87, 0.12) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none',
          }} />

          {/* Left Column: Pedagogical Hook & Overview Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--accent-primary, #d97757)',
                backgroundColor: 'rgba(217, 119, 87, 0.12)',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(217, 119, 87, 0.25)',
              }}>
                Module {moduleNumber}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#78716c' }}>
                • {lessons.length} Interactive Lessons
              </span>
              {!isModUnlocked && (
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#c15f3c',
                  backgroundColor: 'rgba(193, 95, 60, 0.15)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(193, 95, 60, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <Lock size={12} /> Locked
                </span>
              )}
            </div>

            <h1 style={{
              fontSize: '2.4rem',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              margin: 0,
              color: '#ffffff',
            }}>
              {heroTitle}
            </h1>

            <p style={{
              fontSize: '1.05rem',
              lineHeight: 1.6,
              color: '#a8a29e',
              margin: '4px 0 12px',
              maxWidth: '540px'
            }}>
              {overview.subtitle}
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
              {isModUnlocked ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(startPath)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: 'var(--accent-solid, #d97757)',
                    color: 'white',
                    border: 'none',
                    padding: '14px 28px',
                    borderRadius: '100px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(217,119,87,0.3)',
                    transition: 'background-color 0.2s, box-shadow 0.2s',
                  }}
                >
                  <Play size={16} fill="currentColor" />
                  {isStarted ? `Resume Module ${moduleNumber}` : `Trace Module ${moduleNumber}`}
                  <ArrowRight size={16} />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/lesson/${nextActiveGlobal.moduleId}/${nextActiveGlobal.id}`)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: '#262522',
                    color: '#a8a29e',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '14px 24px',
                    borderRadius: '100px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Lock size={16} />
                  Complete Current Active Lesson
                  <ArrowRight size={16} />
                </motion.button>
              )}

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('learning-path');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'transparent',
                  color: '#a8a29e',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  padding: '12px 18px',
                  borderRadius: '100px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = '#a8a29e';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <Layers size={16} />
                Inspect learning path
              </button>
            </div>
          </div>

          {/* Right Column: Visual Clay Preview Canvas */}
          <div style={{
            position: 'relative',
            backgroundColor: '#12110f',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            padding: '20px',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            minHeight: '200px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#c15f3c' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#eab308' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#788c5d' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#788c5d',
                  boxShadow: '0 0 8px #788c5d'
                }} />
                <span style={{ fontSize: '0.7rem', color: '#a8a29e', fontFamily: 'monospace', fontWeight: 600 }}>
                  Live Blueprint Canvas
                </span>
              </div>
            </div>

            <TypewriterCode code={overview.codePreview} speed={55} />
          </div>
        </motion.div>

        {/* ─── 2. Module Progress Tracker & Independent Mastery ────────────── */}
        <motion.div
          variants={itemVariants}
          style={{
            backgroundColor: '#171614',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(120, 140, 93, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#788c5d'
              }}>
                <CheckCircle size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f5f5f4' }}>
                  Module Completion
                </div>
                <div style={{ fontSize: '0.8rem', color: '#78716c', marginTop: '2px' }}>
                  {completedCount} of {lessons.length} lessons completed ({progressPercent}%)
                </div>
              </div>
            </div>

            {completedCount > 0 && (() => {
              const independentCount = lessons.filter(l => {
                const s = lessonState[l.id];
                return s?.status === 'complete' && !s.solutionViewed && (s.independentPasses > 0 || s.passedIndependently);
              }).length;
              const independentPct = Math.round((independentCount / completedCount) * 100);
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '20px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(217, 119, 87, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary, #d97757)'
                  }}>
                    <Zap size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f5f5f4' }}>
                      Independent Mastery
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#78716c', marginTop: '2px' }}>
                      {independentCount} of {completedCount} solved without solution peeking ({independentPct}%)
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          <div style={{ flex: 1, minWidth: '200px', maxWidth: '320px' }}>
            <div style={{ height: '8px', backgroundColor: '#262522', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                backgroundColor: progressPercent === 100 ? '#788c5d' : 'var(--accent-primary, #d97757)',
                width: `${progressPercent}%`,
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        </motion.div>

        {/* ─── 2b. Pre-module readiness check ────────────────────────────────
            Only shown when this learner's own signals (from the immediately
            preceding module) suggest they might be shaky on something this
            module leans on. Purely informational — never blocks starting. */}
        {readiness && readiness.weakLessons.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="ui-card"
            style={{ padding: '18px 22px', display: 'flex', gap: '14px', alignItems: 'flex-start', borderColor: 'var(--warning)' }}
          >
            <AlertTriangle size={20} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f5f5f4', marginBottom: '4px' }}>
                Before diving in: {readiness.weakLessons.length} lesson{readiness.weakLessons.length > 1 ? 's' : ''} from {readiness.priorModuleTitle} looked shaky for you
              </div>
              <div style={{ fontSize: '0.85rem', color: '#a8a29e', lineHeight: 1.6 }}>
                {readiness.weakLessons.map(l => l.title).join(', ')} — this module builds on that material, so a quick pass through Review Lab first might save you some backtracking.
              </div>
            </div>
            <Link
              to={`/review?module=${readiness.priorModuleId}`}
              className="ui-btn-ghost"
              style={{ flexShrink: 0, textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              Review first <ArrowRight size={14} />
            </Link>
          </motion.div>
        )}

        {/* ─── 3. Core Pedagogical Reasoning (3 Dark Clay Cards) ────────────── */}
        <motion.div
          variants={subContainerVariants}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}
        >
          {/* Card 1: What is this about? */}
          <motion.div
            variants={itemVariants}
            style={{
              backgroundColor: '#171614',
              borderRadius: '20px',
              border: '1px solid var(--border-subtle)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'rgba(217, 119, 87, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary, #d97757)',
            }}>
              <BookOpen size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
              What is this module about?
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6, color: '#a8a29e' }}>
              {overview.whatIsIt}
            </p>
          </motion.div>

          {/* Card 2: Why do I need to learn this? */}
          <motion.div
            variants={itemVariants}
            style={{
              backgroundColor: '#171614',
              borderRadius: '20px',
              border: '1px solid var(--border-subtle)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6',
            }}>
              <Zap size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
              Why do I need to learn this?
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6, color: '#a8a29e' }}>
              {whyLearnText}
            </p>
          </motion.div>

          {/* Card 3: Without this, why wouldn't React be React? */}
          <motion.div
            variants={itemVariants}
            style={{
              backgroundColor: '#171614',
              borderRadius: '20px',
              border: '1px solid var(--border-subtle)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'rgba(168, 85, 247, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a855f7',
            }}>
              <HelpCircle size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
              Without this, why wouldn&apos;t React be React?
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6, color: '#a8a29e' }}>
              {withoutText}
            </p>
          </motion.div>
        </motion.div>

        {/* ─── 4. Key Architectural Takeaways ───────────────────────────────── */}
        {takeawaysList.length > 0 && (
          <motion.div
            variants={itemVariants}
            style={{
              backgroundColor: '#171614',
              borderRadius: '20px',
              border: '1px solid var(--border-subtle)',
              padding: '28px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Code2 size={20} color="var(--accent-primary, #d97757)" />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                Key Mental Models & Takeaways
              </h3>
            </div>

            <motion.div
              variants={subContainerVariants}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '4px' }}
            >
              {takeawaysList.map((point, i) => {
                const isObj = typeof point === 'object' && point !== null;
                return (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    style={{
                      backgroundColor: '#12110f',
                      borderRadius: '12px',
                      padding: '16px 18px',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    <span style={{
                      backgroundColor: 'rgba(217, 119, 87, 0.15)',
                      color: 'var(--accent-primary, #d97757)',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    <div style={{ fontSize: '0.88rem', lineHeight: 1.5, color: '#d6d3d1' }}>
                      {isObj ? (
                        <>
                          <strong style={{ color: '#f5f5f4', display: 'block', marginBottom: '2px' }}>{point.title}</strong>
                          <span style={{ color: '#a8a29e' }}>{point.desc}</span>
                        </>
                      ) : (
                        <span>{point}</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}

        {/* ─── 5. Interactive Learning Path (One by One Cards) ──────────────── */}
        <motion.div
          variants={itemVariants}
          id="learning-path"
          style={{ display: 'flex', flexDirection: 'column', gap: '16px', scrollMarginTop: '30px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Learning Path ({lessons.length} Lessons)
            </h2>
            <span style={{ fontSize: '0.85rem', color: '#78716c' }}>
              Click any lesson to jump into the code playground
            </span>
          </div>

          <motion.div
            variants={subContainerVariants}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}
          >
            {lessons.map((lesson, idx) => {
              const isCompleted = completedLessons.includes(lesson.id);
              const isUnlocked = isLessonUnlocked(lesson.id, completedLessons, unlockAllLessons);
              const prereq = getPrerequisiteLesson(lesson.id);
              const difficulty = getDifficultySignal(lessonState?.[lesson.id]);

              if (!isUnlocked) {
                return (
                  <motion.div
                    key={lesson.id}
                    variants={itemVariants}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  >
                    <Link
                      to={`/lesson/${moduleId}/${lesson.id}`}
                      style={{
                        backgroundColor: '#12110f',
                        borderRadius: '14px',
                        border: '1px solid var(--border-subtle)',
                        padding: '18px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        opacity: 0.75,
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(193, 95, 60, 0.3)';
                        e.currentTarget.style.backgroundColor = '#171614';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.backgroundColor = '#12110f';
                      }}
                      title={prereq ? `Complete "${prereq.title}" to unlock (Click to view)` : 'Complete previous lesson to unlock'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <Lock size={20} color="#c15f3c" />
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#c15f3c', fontFamily: 'monospace', marginBottom: '2px', fontWeight: 600 }}>
                            LESSON {idx + 1} • LOCKED
                          </div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#a8a29e' }}>
                            {lesson.title}
                          </div>
                        </div>
                      </div>
                      <Lock size={16} color="#78716c" />
                    </Link>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={lesson.id}
                  variants={itemVariants}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                >
                  <Link
                    to={`/lesson/${moduleId}/${lesson.id}`}
                    style={{
                      backgroundColor: '#171614',
                      borderRadius: '14px',
                      border: isCompleted ? '1px solid rgba(120, 140, 93, 0.25)' : '1px solid var(--border-subtle)',
                      padding: '18px 20px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      transition: 'border-color 0.2s ease, background-color 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = isCompleted ? '#788c5d' : 'var(--accent-primary, #d97757)';
                      e.currentTarget.style.backgroundColor = '#1f1e1b';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = isCompleted ? 'rgba(120, 140, 93, 0.25)' : 'var(--border-subtle)';
                      e.currentTarget.style.backgroundColor = '#171614';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {isCompleted ? (
                        <CheckCircle size={20} color="#788c5d" />
                      ) : (
                        <Circle size={20} color="#78716c" />
                      )}
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#78716c', fontFamily: 'monospace', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>LESSON {idx + 1}</span>
                          {difficulty && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: difficulty.color, fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
                              <TrendingUp size={11} />
                              {difficulty.label}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: isCompleted ? '#f5f5f4' : '#d6d3d1' }}>
                          {lesson.title}
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={16} color="#78716c" />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

      </motion.div>
    </div>
  );
}
