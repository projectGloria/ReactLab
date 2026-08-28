// v5 — 2026-08-18 — fix infinite render loop: `state.lessonState?.[id] || {}`
//   returned a fresh object every render, breaking useSyncExternalStore
//   referential equality under zustand 5 (post electron/electron-builder
//   audit-fix upgrade surfaced this). Now selects raw value + useMemo
//   against a module-level EMPTY_LESSON_STATE singleton.
// v4 — 2026-08-18 — narrow Zustand subscriptions to required state slices
// v3 — 2026-08-18 — remove eager walkthrough audio preloading
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ReactMarkdown from 'react-markdown';
import { SandpackProvider, SandpackLayout, SandpackCodeEditor, SandpackPreview } from '@codesandbox/sandpack-react';
import { CheckCircle, RotateCcw, ArrowRight, Lightbulb, X, Play, Sparkles, Code2, PanelRightClose } from 'lucide-react';
import curriculum from '../curriculum/index.js';
import useProgressStore from '../store/useProgressStore.js';
import useUIStore from '../store/useUIStore.js';
import { isLessonUnlocked, getPrerequisiteLesson, getNextActiveLesson, getLessonGainSummary } from '../lib/progression.js';
import NotFound from './NotFound.jsx';
import useModalDialog from '../components/lesson/useModalDialog.js';
import React, { Suspense } from 'react';
import { getModuleData } from '../curriculum/registry.js';

// Custom Popout Icon with window and arrow inside
const StepThrough = React.lazy(() => import('../components/lesson/StepThrough.jsx'));
const ChallengeModal = React.lazy(() => import('../components/lesson/ChallengeModal.jsx'));
import MentorPanel from '../components/mentor/MentorPanel.jsx';
import { clearCachedExample } from '../lib/exampleEditCache.js';
import motivationalMessages from '../curriculum/motivationalMessages.js';
import FormatButton from '../components/lesson/FormatButton.jsx';
import LearningChecks from '../components/lesson/LearningChecks.jsx';
import { wrapGlossaryTerms } from '../components/common/TermExplainerTooltip.jsx';

import SANDPACK_THEME from '../lib/sandpackTheme.js';
import PopoutWindowIcon from '../components/common/PopoutWindowIcon.jsx';
import { SectionHeading, LessonSectionTracker } from '../components/lesson/LessonSections.jsx';
import LessonSkeleton from '../components/lesson/LessonSkeleton.jsx';
import useCompactLayout from '../components/lesson/useCompactLayout.js';
import WeakPrerequisiteNudge from '../components/lesson/WeakPrerequisiteNudge.jsx';
import useLessonSandpack from '../components/lesson/useLessonSandpack.js';
import SandpackFileTabs from '../components/lesson/SandpackFileTabs.jsx';
import ProseCodeBlock from '../components/lesson/ProseCodeBlock.jsx';
import PlainCodeBlock, { codeTextFromPre } from '../components/common/PlainCodeBlock.jsx';
import { SandpackCacher, SandpackContextReporter, SandpackCssFormatter } from '../components/lesson/SandpackBridges.jsx';
import { parseLessonContent } from '../lib/lessonContent.js';

const sandpackTheme = SANDPACK_THEME;

// Stable empty-object reference. Zustand 5's useSyncExternalStore does
// referential equality on the selector's return value — a fresh `{}`
// literal inside the selector (e.g. `state.x || {}`) never equals the
// previous snapshot, so React re-renders forever chasing a "changed"
// value that never settles. Module-level singleton fixes it.
const EMPTY_LESSON_STATE = {};

export default function LessonView() {
  const { moduleId, lessonId } = useParams();
  const completedLessons = useProgressStore((state) => state.completedLessons);
  const lessonStateRaw = useProgressStore((state) => state.lessonState?.[lessonId]);
  const lessonState = useMemo(() => lessonStateRaw || EMPTY_LESSON_STATE, [lessonStateRaw]);
  const setCurrentLesson = useProgressStore((state) => state.setCurrentLesson);
  const unlockAllLessons = useUIStore((state) => state.unlockAllLessons);
  const isZenMode = useUIStore((state) => state.isZenMode);
  const toggleZenMode = useUIStore((state) => state.toggleZenMode);
  const isMentorOpen = useUIStore((state) => state.isMentorOpen);
  const openMentor = useUIStore((state) => state.openMentor);
  const closeMentor = useUIStore((state) => state.closeMentor);
  const [showTracer, setShowTracer] = useState(false);
  const [tracerData, setTracerData] = useState(null);
  const [walkthroughType, setWalkthroughType] = useState(null);
  const [showChallenge, setShowChallenge] = useState(false);
  const [showEditor, setShowEditor] = useState(true); // default true for rich side-by-side experience
  const [showSpeechModal, setShowSpeechModal] = useState(false);
  const [mentorContext, setMentorContext] = useState({ code: '', files: null, runtimeError: '' });

  const setMentorContextSafe = useCallback((newCtx) => {
    setMentorContext((prev) => {
      if (prev.code === newCtx.code && prev.runtimeError === newCtx.runtimeError) {
        return prev;
      }
      return newCtx;
    });
  }, []);
  const [activeSection, setActiveSection] = useState(null);
  const contentScrollRef = useRef(null);
  const speechModalRef = React.useRef(null);
  // Gated on showSpeechModal: this hook locks body scroll and manages focus, and
  // neither should happen while the learner is just reading a lesson.
  useModalDialog(speechModalRef, () => setShowSpeechModal(false), showSpeechModal);
  const moduleData = useMemo(() => getModuleData(moduleId), [moduleId]);
  const moduleError = !moduleData && moduleId ? 'Unknown module' : null;
  const [resetKey, setResetKey] = useState(0);
  const isCompact = useCompactLayout();

  // Restore docked editor when detached window closes
  useEffect(() => {
    if (!window.electronAPI?.onDetachedClosed) return;
    const unsubscribe = window.electronAPI.onDetachedClosed((payload) => {
      if (payload?.type === 'editor') {
        setShowEditor(true);
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleCloseTracer = () => {
    setShowTracer(false);
    setTimeout(() => setTracerData(null), 300);
  };

  const nextLessonPath = useMemo(() => {
    let foundCurrent = false;
    for (const mod of curriculum) {
      for (const l of mod.lessons) {
        if (foundCurrent) return `/lesson/${mod.id}/${l.id}`;
        if (l.id === lessonId) foundCurrent = true;
      }
    }
    return null;
  }, [lessonId]);

  const parsedLesson = useMemo(() => {
    if (!moduleData || moduleData.id !== moduleId) return null;
    const lesson = moduleData.lessons.find((l) => l.id === lessonId);
    if (!lesson) return null;
    return parseLessonContent(lesson, moduleId);
  }, [moduleId, lessonId, moduleData]);

  useEffect(() => {
    if (parsedLesson?.id) {
      setCurrentLesson(parsedLesson.id);
      closeMentor();
      setMentorContextSafe({ code: '', runtimeError: '' });
      setActiveSection(parsedLesson.sections?.[0] || null);
    }
  }, [parsedLesson?.id, parsedLesson?.sections, setCurrentLesson, closeMentor, setMentorContextSafe]);

  // Open every lesson at the top. The scroll container persists across route
  // changes, so without this a new lesson inherits the previous one's scroll
  // offset and opens partway down. 'instant' rather than smooth: this is a
  // fresh page, not a movement within one.
  useEffect(() => {
    contentScrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [lessonId]);

  const handleActiveSection = useCallback((section) => {
    setActiveSection((current) => current?.id === section?.id ? current : section);
  }, []);

  const {
    files: sandpackFiles,
    visibleFiles: sandpackVisibleFiles,
    activeFile: sandpackActiveFile,
    customSetup: sandpackCustomSetup,
    isRunnable: isPlaygroundRunnable,
  } = useLessonSandpack(parsedLesson, moduleId, resetKey);

  if (!parsedLesson) {
    if (moduleError) {
      return <NotFound title="Lesson not found" message="Choose a lesson from the curriculum to continue learning." />;
    }
    if (!moduleData) return <LessonSkeleton />;
    return <NotFound title="Lesson not found" message="This module does not contain the lesson in this link." />;
  }

  const isUnlocked = isLessonUnlocked(lessonId, completedLessons, unlockAllLessons);
  const prereq = getPrerequisiteLesson(lessonId);
  const nextActive = getNextActiveLesson(completedLessons);
  const lessonGainText = getLessonGainSummary(parsedLesson);

  if (!isUnlocked) {
    const cardStagger = {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: 0.12,
          delayChildren: 0.05,
        }
      }
    };

    const itemFade = {
      hidden: { opacity: 0, y: 16 },
      show: {
        opacity: 1,
        y: 0,
        transition: {
          type: 'spring',
          damping: 22,
          stiffness: 280,
        }
      }
    };

    return (
      <div style={{
        height: '100%',
        backgroundColor: '#0c0b0a',
        color: '#f5f5f4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflowY: 'auto',
      }}>
        {/* Dynamic Multi-layered Ambient Glows */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.35, 0.6, 0.35],
          }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(193, 95, 60, 0.12) 0%, rgba(217, 119, 87, 0.05) 50%, rgba(0,0,0,0) 75%)',
            pointerEvents: 'none',
          }}
        />

        <motion.div
          variants={cardStagger}
          initial="hidden"
          animate="show"
          style={{
            maxWidth: '520px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'relative',
            zIndex: 1,
            margin: 'auto 0',
          }}
        >
          {/* Main Locked Card */}
          <motion.div
            variants={itemFade}
            style={{
              backgroundColor: '#171614',
              border: '1px solid var(--border-subtle)',
              borderRadius: '24px',
              padding: '36px 32px',
              textAlign: 'center',
              boxShadow: '0 24px 48px -12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            {/* Animated Glowing Red X Icon */}
            <div style={{ position: 'relative', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Red Ambient Glow Pulse behind X */}
              <motion.div
                animate={{
                  scale: [1, 1.35, 1],
                  opacity: [0.35, 0.75, 0.35],
                }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#c15f3c',
                  filter: 'blur(16px)',
                }}
              />

              {/* Animated Red X Pod */}
              <motion.div
                initial={{ scale: 0.6, rotate: -20, opacity: 0 }}
                animate={{
                  scale: [1, 1.06, 1],
                  rotate: [0, -3, 3, 0],
                  opacity: 1,
                }}
                transition={{
                  scale: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
                  rotate: { repeat: Infinity, duration: 5, ease: 'easeInOut' },
                  default: { type: 'spring', damping: 16, stiffness: 220 }
                }}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(193, 95, 60, 0.12)',
                  border: '1.5px solid rgba(193, 95, 60, 0.4)',
                  boxShadow: '0 8px 24px -4px rgba(193, 95, 60, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c15f3c',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <X size={30} strokeWidth={3} />
              </motion.div>
            </div>

            {/* Meticulously Centered 2-Line Text */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textAlign: 'center', width: '100%' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#c15f3c',
                backgroundColor: 'rgba(193, 95, 60, 0.1)',
                padding: '4px 12px',
                borderRadius: '100px',
                border: '1px solid rgba(193, 95, 60, 0.25)',
                marginBottom: '4px',
              }}>
                Progression Locked
              </span>

              <div style={{
                fontSize: '0.92rem',
                lineHeight: 1.55,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                marginTop: '4px',
              }}>
                <div style={{ color: '#d6d3d1' }}>
                  You haven&apos;t unlocked <strong style={{ color: '#ffffff', fontWeight: 600 }}>&ldquo;{parsedLesson.title}&rdquo;</strong> yet.
                </div>
                <div style={{ color: '#78716c', fontSize: '0.86rem' }}>
                  Complete earlier lessons to earn this step!
                </div>
              </div>
            </div>

            {/* Prerequisite Box */}
            {prereq && (
              <motion.div
                variants={itemFade}
                whileHover={{ scale: 1.01 }}
                style={{
                  backgroundColor: '#12110f',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontSize: '0.7rem',
                    color: '#78716c',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontWeight: 700,
                  }}>
                    Prerequisite Required
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#e7e5e4',
                    marginTop: '3px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {prereq.title}
                  </div>
                </div>

                <Link
                  to={`/lesson/${prereq.moduleId}/${prereq.id}`}
                  style={{
                    color: 'var(--accent-primary, #d97757)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '100px',
                    backgroundColor: 'rgba(217, 119, 87, 0.1)',
                    border: '1px solid rgba(217, 119, 87, 0.25)',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                >
                  <span>Go to</span>
                  <ArrowRight size={13} />
                </Link>
              </motion.div>
            )}

            {/* Action CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '2px' }}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to={`/lesson/${nextActive.moduleId}/${nextActive.id}`}
                  style={{
                    backgroundColor: 'var(--accent-primary, #d97757)',
                    color: '#ffffff',
                    textDecoration: 'none',
                    padding: '13px 20px',
                    borderRadius: '100px',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(217, 119, 87, 0.3)',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <Play size={15} fill="currentColor" />
                  <span>Resume Active: {nextActive.title}</span>
                </Link>
              </motion.div>

              <Link
                to={`/module/${moduleId}`}
                style={{
                  backgroundColor: 'transparent',
                  color: '#a8a29e',
                  textDecoration: 'none',
                  padding: '11px 16px',
                  borderRadius: '100px',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  border: '1px solid var(--border-subtle)',
                  display: 'block',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#a8a29e';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                Back to Module Overview
              </Link>
            </div>
          </motion.div>

          {/* Secondary Attached Card: "What you will gain by learning this" */}
          <motion.div
            variants={itemFade}
            style={{
              backgroundColor: '#141311',
              border: '1px solid rgba(217, 119, 87, 0.2)',
              borderRadius: '18px',
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              textAlign: 'left',
              boxShadow: '0 12px 28px -8px rgba(0,0,0,0.5)',
              background: 'linear-gradient(135deg, rgba(217,119,87,0.06) 0%, rgba(20,19,17,1) 100%)',
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(217, 119, 87, 0.15)',
              border: '1px solid rgba(217, 119, 87, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary, #d97757)',
              flexShrink: 0,
              marginTop: '1px',
            }}>
              <Sparkles size={18} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '0.78rem',
                color: 'var(--accent-primary, #d97757)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}>
                What you will gain by learning {parsedLesson.title}
              </div>
              <ul style={{
                margin: 0,
                padding: 0,
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                {lessonGainText.map((point, i) => (
                  <li key={i} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '0.88rem',
                    color: '#d6d3d1',
                    lineHeight: 1.5,
                  }}>
                    <CheckCircle
                      size={14}
                      style={{ flexShrink: 0, marginTop: '3px', color: 'var(--accent-primary, #d97757)' }}
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="lesson-view-page">
      <div style={{ flex: 1, display: 'flex', backgroundColor: 'var(--border-subtle)', overflow: 'hidden' }}>
        {showEditor ? (
          <PanelGroup direction={isCompact ? 'vertical' : 'horizontal'}>

            {/* Left Panel: Content */}
            <Panel defaultSize={50} minSize={30} style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
              <div
                ref={contentScrollRef}
                className="auto-hide-scrollbar lesson-content-scroll"
                style={{ flex: 1, overflowY: 'auto', padding: '24px 40px 48px' }}
              >
                <div className="prose" style={{ maxWidth: '720px', margin: '0 auto', color: 'var(--text-primary)' }}>
                  <LessonSectionTracker
                    containerRef={contentScrollRef}
                    sections={parsedLesson.sections}
                    onActiveSection={handleActiveSection}
                  />

                  {/* Top Lesson Header inside reading view */}
                  <div
                    className="lesson-prose-header-group"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '16px',
                      marginBottom: '20px',
                    }}
                  >
                    <h1
                      style={{
                        margin: 0,
                        fontSize: 'clamp(1.75rem, 3.5vw, 2.3rem)',
                        fontWeight: 800,
                        letterSpacing: '-0.03em',
                        color: 'var(--text-primary, #ededed)',
                        lineHeight: 1.2,
                      }}
                    >
                      {parsedLesson.title}
                    </h1>

                    {/* Top Right Action Icons: Reading Popout & Zen Mode (Visible on Hover) */}
                    <div
                      className="lesson-prose-action-icons"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        flexShrink: 0,
                        marginTop: '4px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={async () => {
                          const popoutPath = `/detached/content/${moduleId}/${parsedLesson.id}`;
                          if (window.electronAPI?.openDetachedWindow) {
                            await window.electronAPI.openDetachedWindow({
                              type: 'content',
                              urlPath: popoutPath,
                              title: `${parsedLesson.title} — Reading`,
                              width: 800,
                              height: 750,
                            });
                          } else {
                            window.open(popoutPath, '_blank', 'width=800,height=750');
                          }
                        }}
                        className="lesson-hover-action-btn"
                        title="Pop out Lesson Reading into a separate OS window"
                        aria-label="Pop out Lesson Reading"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                          borderRadius: '8px',
                          padding: '6px 8px',
                          color: 'var(--text-secondary, #a8a29e)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--text-primary, #fff)';
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-secondary, #a8a29e)';
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        }}
                      >
                        <PopoutWindowIcon size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleZenMode()}
                        className={`lesson-hover-action-btn${isZenMode ? ' is-active' : ''}`}
                        title={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode (Distraction-free workspace)"}
                        aria-label={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
                        style={{
                          background: isZenMode ? 'rgba(217, 119, 87, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          border: isZenMode ? '1px solid var(--accent-primary, #d97757)' : '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                          borderRadius: '8px',
                          padding: '6px 8px',
                          color: isZenMode ? 'var(--accent-primary, #d97757)' : 'var(--text-secondary, #a8a29e)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!isZenMode) {
                            e.currentTarget.style.color = 'var(--text-primary, #fff)';
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isZenMode) {
                            e.currentTarget.style.color = 'var(--text-secondary, #a8a29e)';
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                          }
                        }}
                      >
                        <Sparkles size={16} />
                      </button>
                    </div>
                  </div>

                  <WeakPrerequisiteNudge lessonId={parsedLesson.id} lessonState={lessonState} moduleId={moduleId} />

                  <div className="markdown-body" style={{ lineHeight: 1.6, fontSize: '1rem', color: 'var(--text-secondary)' }}>
                    <ReactMarkdown
                      components={{
                        h2: (props) => <SectionHeading level={2} {...props} />,
                        h3: (props) => <SectionHeading level={3} {...props} />,
                        h4: (props) => <SectionHeading level={4} {...props} />,
                        h5: (props) => <SectionHeading level={5} {...props} />,
                        h6: (props) => <SectionHeading level={6} {...props} />,
                        p: ({ children }) => {
                          return (
                            <p style={{ marginBottom: '16px', lineHeight: 1.65 }}>
                              {Array.isArray(children)
                                ? children.map((child, idx) => typeof child === 'string' ? <React.Fragment key={idx}>{wrapGlossaryTerms(child)}</React.Fragment> : child)
                                : typeof children === 'string' ? wrapGlossaryTerms(children) : children}
                            </p>
                          );
                        },
                        li: ({ children }) => {
                          return (
                            <li style={{ marginBottom: '6px', lineHeight: 1.6 }}>
                              {Array.isArray(children)
                                ? children.map((child, idx) => typeof child === 'string' ? <React.Fragment key={idx}>{wrapGlossaryTerms(child)}</React.Fragment> : child)
                                : typeof children === 'string' ? wrapGlossaryTerms(children) : children}
                            </li>
                          );
                        },
                        strong: ({ children }) => {
                          return (
                            <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                              {typeof children === 'string' ? wrapGlossaryTerms(children) : children}
                            </strong>
                          );
                        },
                        pre: ({ children }) => <ProseCodeBlock code={codeTextFromPre(children)} />,
                        code({ className, children, ...props }) {
                          return (
                            <code
                              style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '2px 7px',
                                borderRadius: '5px',
                                fontFamily: 'var(--font-mono, monospace)',
                                color: 'var(--accent-primary, #d97757)',
                                fontSize: '0.88em',
                                margin: '0 2px',
                              }}
                              {...props}
                              className={className}
                            >
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {parsedLesson.displayContent}
                    </ReactMarkdown>
                    <LearningChecks lessonId={parsedLesson.id} />
                  </div>

                  <hr style={{ margin: '40px 0', borderColor: 'var(--border-subtle)', borderStyle: 'solid' }} />

                  {parsedLesson.challengeDesc && (
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '50px 0 30px' }}>
                      <motion.button
                        whileHover="hover"
                        initial="initial"
                        onClick={() => setShowChallenge(true)}
                        variants={{
                          initial: { backgroundColor: 'transparent', color: 'var(--accent-primary)' },
                          hover: { backgroundColor: 'var(--accent-primary)', color: '#141413' }
                        }}
                        transition={{ duration: 0.2 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '12px 32px',
                          border: '1px solid var(--accent-primary)',
                          borderRadius: '100px',
                          fontSize: '0.85rem', cursor: 'pointer',
                          fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                          width: 'auto',
                          outline: 'none'
                        }}
                      >
                        <span>Take Challenge</span>
                        <motion.div
                          variants={{
                            initial: { x: 0 },
                            hover: { x: 5 }
                          }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          style={{ display: 'flex' }}
                        >
                          <ArrowRight size={16} strokeWidth={2.5} />
                        </motion.div>
                      </motion.button>
                    </div>
                  )}

                  {parsedLesson.insights && parsedLesson.insights.length > 0 && (
                    <div style={{ marginTop: '40px', padding: '24px', backgroundColor: 'rgba(217, 119, 87, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(217, 119, 87, 0.1)' }}>
                      <h3 style={{ margin: '0 0 16px 0', color: 'var(--warning)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Lightbulb size={18} /> Insights & Tips
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {parsedLesson.insights.map((insight, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setTracerData(insight.walkthrough);
                              setWalkthroughType(`insight-${idx}`);
                              setShowTracer(true);
                            }}
                            style={{
                              textAlign: 'left',
                              padding: '12px 16px',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--text-primary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.borderColor = 'var(--border-focus)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                backgroundColor: insight.type === 'misconception' ? 'rgba(193, 95, 60, 0.15)' : 'rgba(120, 140, 93, 0.15)',
                                color: insight.type === 'misconception' ? '#c15f3c' : '#788c5d'
                              }}>
                                {insight.type === 'misconception' ? 'Misconception' : 'Tip'}
                              </span>
                              <span style={{ fontWeight: 500 }}>{insight.title}</span>
                            </div>
                            <ArrowRight size={16} color="var(--accent-primary)" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </Panel>

            <PanelResizeHandle
              className="resize-handle"
              style={{
                width: isCompact ? '100%' : '2px',
                height: isCompact ? '2px' : 'auto',
                backgroundColor: 'transparent',
                cursor: isCompact ? 'row-resize' : 'col-resize'

              }}
            />

            {/* Right Panel: Example Playground */}
            <Panel defaultSize={50} minSize={30} style={{ backgroundColor: 'var(--bg-panel)', display: 'flex', flexDirection: 'column' }}>
              {parsedLesson.executableExample ? (
                <SandpackProvider
                  key={`${parsedLesson.id}#${resetKey}`}
                  template={moduleId === 'typescript' ? 'react-ts' : 'react'}
                  theme={sandpackTheme}
                  files={sandpackFiles}
                  customSetup={sandpackCustomSetup}
                  options={{
                    recompileMode: 'delayed',
                    recompileDelay: 300,
                    autorun: isPlaygroundRunnable,
                    visibleFiles: sandpackVisibleFiles,
                    activeFile: sandpackActiveFile,
                  }}
                >
                  <SandpackCacher lessonId={parsedLesson.id} ownedFiles={sandpackVisibleFiles} />
                  <SandpackContextReporter onContext={setMentorContextSafe} />
                  <SandpackCssFormatter lessonId={parsedLesson.id} />
                  <div style={{ display: 'none' }}><FormatButton /></div>
                  <div style={{ flex: 1, overflow: 'hidden', position: 'relative', backgroundColor: '#141413', display: 'flex', flexDirection: 'column' }}>
                    {/* Floating / Embedded Top Action Toolbar inside Sandpack tab bar header */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '3px',
                        right: '8px',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        height: '32px',
                      }}
                    >
                      {parsedLesson.exampleWalkthrough && (
                        <button
                          type="button"
                          onClick={() => {
                            setTracerData(parsedLesson.exampleWalkthrough);
                            setWalkthroughType('example');
                            setShowTracer(true);
                          }}
                          title="Explain step-by-step"
                          aria-label="Explain step-by-step"
                          style={{
                            background: 'rgba(217, 119, 87, 0.12)',
                            border: '1px solid var(--accent-primary, #d97757)',
                            padding: '5px 7px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 'var(--radius-sm, 6px)',
                            color: 'var(--accent-primary, #d97757)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseOver={e => {
                            e.currentTarget.style.backgroundColor = 'rgba(217, 119, 87, 0.25)';
                          }}
                          onMouseOut={e => {
                            e.currentTarget.style.backgroundColor = 'rgba(217, 119, 87, 0.12)';
                          }}
                        >
                          <Play size={13} fill="currentColor" />
                        </button>
                      )}

                      {/* Hide Editor Icon Button */}
                      <button
                        type="button"
                        onClick={() => setShowEditor(false)}
                        title="Hide Live Code Editor & Preview"
                        aria-label="Hide Live Code Editor"
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                          padding: '5px 7px',
                          cursor: 'pointer',
                          color: 'var(--text-secondary, #a8a29e)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 'var(--radius-sm, 6px)',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.color = 'var(--text-primary, #fff)';
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.color = 'var(--text-secondary, #a8a29e)';
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                        }}
                      >
                        <PanelRightClose size={14} />
                      </button>

                      {/* Pop Out Live Editor Window Button */}
                      <button
                        type="button"
                        onClick={async () => {
                          const popoutPath = `/detached/editor/${moduleId}/${parsedLesson.id}`;
                          if (window.electronAPI?.openDetachedWindow) {
                            await window.electronAPI.openDetachedWindow({
                              type: 'editor',
                              urlPath: popoutPath,
                              title: `${parsedLesson.title} — Live Sandbox`,
                              width: 950,
                              height: 800,
                            });
                          } else {
                            window.open(popoutPath, '_blank', 'width=950,height=800');
                          }
                          setShowEditor(false);
                        }}
                        title="Pop out Live Code Editor into a separate OS window"
                        aria-label="Pop out Live Code Editor"
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                          padding: '5px 7px',
                          cursor: 'pointer',
                          color: 'var(--text-secondary, #a8a29e)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 'var(--radius-sm, 6px)',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.color = 'var(--text-primary, #fff)';
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.color = 'var(--text-secondary, #a8a29e)';
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                        }}
                      >
                        <PopoutWindowIcon size={14} />
                      </button>

                      {/* Reset Code Button */}
                      <button
                        type="button"
                        onClick={() => {
                          clearCachedExample(parsedLesson.id);
                          setResetKey(k => k + 1);
                        }}
                        title="Reset to default code"
                        aria-label="Reset Code"
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                          padding: '5px 7px',
                          cursor: 'pointer',
                          color: 'var(--text-secondary, #a8a29e)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 'var(--radius-sm, 6px)',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.color = 'var(--text-primary, #fff)';
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.color = 'var(--text-secondary, #a8a29e)';
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                        }}
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>

                    <SandpackLayout style={{ height: '100%', border: 'none', borderRadius: 0, minHeight: 'auto', display: 'flex', flexDirection: 'column' }}>
                      <SandpackFileTabs lessonId={parsedLesson.id} />
                      <SandpackCodeEditor showLineNumbers={true} showTabs={false} closableTabs={false} style={{ flex: 1 }} />
                      {isPlaygroundRunnable ? (
                        <SandpackPreview style={{ flex: 1, borderTop: '1px solid var(--border-subtle)' }} showOpenInCodeSandbox={false} showRefreshButton={true} />
                      ) : (
                        <div
                          style={{
                            flex: 1,
                            borderTop: '1px solid var(--border-subtle)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '20px',
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                            fontSize: '0.85rem',
                            lineHeight: 1.5,
                          }}
                        >
                          <strong style={{ color: 'var(--text-secondary)' }}>This example is a test file.</strong>
                          <span>Read it and edit it above — there is no test runner in the sandbox, so there is nothing to preview.</span>
                        </div>
                      )}
                    </SandpackLayout>
                  </div>
                </SandpackProvider>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No interactive playground needed for this lesson.
                </div>
              )}
            </Panel>

            {/* Resizable AI Mentor Section at the far right */}
            {isMentorOpen && (
              <>
                <PanelResizeHandle
                  className="resize-handle"
                  style={{
                    width: isCompact ? '100%' : '4px',
                    height: isCompact ? '4px' : 'auto',
                    backgroundColor: 'var(--border-subtle)',
                    cursor: isCompact ? 'row-resize' : 'col-resize',
                  }}
                />
                <Panel defaultSize={30} minSize={20} style={{ backgroundColor: 'var(--bg-panel)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <Suspense fallback={null}>
                    <MentorPanel
                      lessonId={parsedLesson.id}
                      moduleId={moduleId}
                      lessonTitle={parsedLesson.title}
                      lessonExcerpt={parsedLesson.displayContent}
                      lesson={parsedLesson}
                      activeSection={activeSection}
                      code={mentorContext.code}
                      files={mentorContext.files}
                      runtimeError={mentorContext.runtimeError}
                      onClose={() => closeMentor()}
                      isInline={true}
                    />
                  </Suspense>
                </Panel>
              </>
            )}
          </PanelGroup>
        ) : (
          /* Full Page Content Mode */
          <div style={{ flex: 1, display: 'flex', backgroundColor: 'var(--bg-app)', width: '100%', overflow: 'hidden' }}>
            <PanelGroup direction={isCompact ? 'vertical' : 'horizontal'}>
              <Panel defaultSize={isMentorOpen ? 70 : 100} minSize={40} style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
                <div
                  ref={contentScrollRef}
                  className="auto-hide-scrollbar lesson-content-scroll"
                  style={{ flex: 1, overflowY: 'auto', padding: '24px 48px 48px' }}
                >
              <div className="prose" style={{ maxWidth: '860px', margin: '0 auto', color: 'var(--text-primary)' }}>
                <LessonSectionTracker
                  containerRef={contentScrollRef}
                  sections={parsedLesson.sections}
                  onActiveSection={handleActiveSection}
                />

                {/* Top Lesson Header inside full reading view */}
                <div
                  className="lesson-prose-header-group"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '16px',
                    marginBottom: '20px',
                  }}
                >
                  <h1
                    style={{
                      margin: 0,
                      fontSize: 'clamp(1.85rem, 4vw, 2.5rem)',
                      fontWeight: 800,
                      letterSpacing: '-0.03em',
                      color: 'var(--text-primary, #ededed)',
                      lineHeight: 1.2,
                    }}
                  >
                    {parsedLesson.title}
                  </h1>

                  {/* Action Icons in Full View: Open Live Editor, Reading Popout & Zen Mode */}
                  <div
                    className="lesson-prose-action-icons"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexShrink: 0,
                      marginTop: '4px',
                    }}
                  >
                    {parsedLesson.executableExample && (
                      <button
                        type="button"
                        onClick={() => setShowEditor(true)}
                        className="lesson-hover-action-btn"
                        title="Open Live Code Editor & Preview"
                        aria-label="Open Live Code Editor"
                        style={{
                          background: 'rgba(217, 119, 87, 0.12)',
                          border: '1px solid var(--accent-primary, #d97757)',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          color: 'var(--accent-primary, #d97757)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Code2 size={15} />
                        <span>Live Editor</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={async () => {
                        const popoutPath = `/detached/content/${moduleId}/${parsedLesson.id}`;
                        if (window.electronAPI?.openDetachedWindow) {
                          await window.electronAPI.openDetachedWindow({
                            type: 'content',
                            urlPath: popoutPath,
                            title: `${parsedLesson.title} — Reading`,
                            width: 800,
                            height: 750,
                          });
                        } else {
                          window.open(popoutPath, '_blank', 'width=800,height=750');
                        }
                      }}
                      className="lesson-hover-action-btn"
                      title="Pop out Lesson Reading into a separate OS window"
                      aria-label="Pop out Lesson Reading"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                        borderRadius: '8px',
                        padding: '6px 8px',
                        color: 'var(--text-secondary, #a8a29e)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--text-primary, #fff)';
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-secondary, #a8a29e)';
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      }}
                    >
                      <PopoutWindowIcon size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleZenMode()}
                      className={`lesson-hover-action-btn${isZenMode ? ' is-active' : ''}`}
                      title={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode (Distraction-free workspace)"}
                      aria-label={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
                      style={{
                        background: isZenMode ? 'rgba(217, 119, 87, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        border: isZenMode ? '1px solid var(--accent-primary, #d97757)' : '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                        borderRadius: '8px',
                        padding: '6px 8px',
                        color: isZenMode ? 'var(--accent-primary, #d97757)' : 'var(--text-secondary, #a8a29e)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isZenMode) {
                          e.currentTarget.style.color = 'var(--text-primary, #fff)';
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isZenMode) {
                          e.currentTarget.style.color = 'var(--text-secondary, #a8a29e)';
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        }
                      }}
                    >
                      <Sparkles size={16} />
                    </button>
                  </div>
                </div>

                <WeakPrerequisiteNudge lessonId={parsedLesson.id} lessonState={lessonState} moduleId={moduleId} />

                <div className="markdown-body" style={{ lineHeight: 1.7, fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
                  <ReactMarkdown
                    components={{
                      h2: (props) => <SectionHeading level={2} {...props} />,
                      h3: (props) => <SectionHeading level={3} {...props} />,
                      h4: (props) => <SectionHeading level={4} {...props} />,
                      h5: (props) => <SectionHeading level={5} {...props} />,
                      h6: (props) => <SectionHeading level={6} {...props} />,
                      pre: ({ children }) => <PlainCodeBlock code={codeTextFromPre(children)} />,
                      code({ className, children, ...props }) {
                        return (
                          <code style={{
                            backgroundColor: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '0.12em 0.38em',
                            borderRadius: '6px',
                            fontFamily: 'var(--font-mono, monospace)',
                            color: 'var(--accent-primary)',
                            fontSize: '0.9em',
                            margin: '0 0.1em'
                          }} {...props} className={className}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {parsedLesson.displayContent}
                  </ReactMarkdown>
                  <LearningChecks lessonId={parsedLesson.id} />
                </div>

                <hr style={{ margin: '48px 0', borderColor: 'var(--border-subtle)', borderStyle: 'solid' }} />

                {parsedLesson.challengeDesc && (
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '50px 0 30px' }}>
                    <motion.button
                      whileHover="hover"
                      initial="initial"
                      onClick={() => setShowChallenge(true)}
                      variants={{
                        initial: { backgroundColor: 'transparent', color: 'var(--accent-primary)' },
                        hover: { backgroundColor: 'var(--accent-primary)', color: '#141413' }
                      }}
                      transition={{ duration: 0.2 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '14px 36px',
                        border: '1px solid var(--accent-primary)',
                        borderRadius: '100px',
                        fontSize: '0.9rem', cursor: 'pointer',
                        fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                        width: 'auto',
                        outline: 'none'
                      }}
                    >
                      <span>Take Challenge</span>
                      <motion.div
                        variants={{
                          initial: { x: 0 },
                          hover: { x: 5 }
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        style={{ display: 'flex' }}
                      >
                        <ArrowRight size={16} strokeWidth={2.5} />
                      </motion.div>
                    </motion.button>
                  </div>
                )}

                {parsedLesson.insights && parsedLesson.insights.length > 0 && (
                  <div style={{ marginTop: '48px', padding: '28px', backgroundColor: 'rgba(217, 119, 87, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(217, 119, 87, 0.1)' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: 'var(--warning)', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Lightbulb size={18} /> Insights & Tips
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {parsedLesson.insights.map((insight, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setTracerData(insight.walkthrough);
                            setWalkthroughType(`insight-${idx}`);
                            setShowTracer(true);
                          }}
                          style={{
                            textAlign: 'left',
                            padding: '14px 18px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.borderColor = 'var(--border-focus)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              backgroundColor: insight.type === 'misconception' ? 'rgba(193, 95, 60, 0.15)' : 'rgba(120, 140, 93, 0.15)',
                              color: insight.type === 'misconception' ? '#c15f3c' : '#788c5d'
                            }}>
                              {insight.type === 'misconception' ? 'Misconception' : 'Tip'}
                            </span>
                            <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{insight.title}</span>
                          </div>
                          <ArrowRight size={16} color="var(--accent-primary)" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                </div>
              </div>
            </Panel>

              {isMentorOpen && (
                <>
                  <PanelResizeHandle
                    className="resize-handle"
                    style={{
                      width: isCompact ? '100%' : '4px',
                      height: isCompact ? '4px' : 'auto',
                      backgroundColor: 'var(--border-subtle)',
                      cursor: isCompact ? 'row-resize' : 'col-resize',
                    }}
                  />
                  <Panel defaultSize={30} minSize={20} style={{ backgroundColor: 'var(--bg-panel)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <Suspense fallback={null}>
                      <MentorPanel
                        lessonId={parsedLesson.id}
                        moduleId={moduleId}
                        lessonTitle={parsedLesson.title}
                        lessonExcerpt={parsedLesson.displayContent}
                        lesson={parsedLesson}
                        activeSection={activeSection}
                        code={mentorContext.code}
                        files={mentorContext.files}
                        runtimeError={mentorContext.runtimeError}
                        onClose={() => closeMentor()}
                        isInline={true}
                      />
                    </Suspense>
                  </Panel>
                </>
              )}
            </PanelGroup>
          </div>
        )}
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>

      <AnimatePresence>
        {showChallenge && parsedLesson && (
          <Suspense fallback={null}>
            <ChallengeModal
              lesson={parsedLesson}
              nextLessonPath={nextLessonPath}
              challenge={parsedLesson.challengeDesc}
              solutionDesc={parsedLesson.solutionDesc}
              hints={parsedLesson.hints}
              starterCode={parsedLesson.starterCode}
              solutionCode={parsedLesson.solutionCode}
              hasWalkthrough={!!parsedLesson.walkthrough}
              onShowWalkthrough={() => {
                setShowChallenge(false);
                setTracerData(parsedLesson.walkthrough);
                setWalkthroughType('challenge');
                setShowTracer(true);
              }}
              onClose={() => setShowChallenge(false)}
            />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSpeechModal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '24px'
          }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{
                backgroundColor: 'var(--bg-panel)',
                border: '1px solid var(--border-focus)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px',
                maxWidth: '480px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-primary)', marginBottom: '16px'
              }}>
                <Sparkles size={28} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text-primary)' }}>
                Time for a Challenge!
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 24px 0' }}>
                {parsedLesson.challengeDesc ? (
                  motivationalMessages[parsedLesson.id] || "You've read through the concepts! Let's test your understanding with a quick challenge to lock in the knowledge."
                ) : (
                  "Ready to prove your skills? Complete this challenge to unlock the next lesson!"
                )}
              </p>
              <button
                onClick={() => {
                  setShowSpeechModal(false);
                  setShowChallenge(true);
                }}
                className="ui-btn-primary"
                style={{
                  marginTop: '8px', padding: '14px 32px', fontSize: '1.05rem',
                  transition: 'background-color 0.2s, transform 0.1s',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                }}
              >
                Let's do it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating AI Mentor Button when mentor is closed */}
      {!isMentorOpen && (
        <motion.button
          type="button"
          onClick={() => openMentor()}
          className="zen-floating-mentor-btn"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Open AI Mentor Panel"
        >
          <Sparkles size={18} />
          <span>Ask Mentor</span>
        </motion.button>
      )}

      {showTracer && tracerData && (
        <Suspense fallback={null}>
          <StepThrough
            code={tracerData.code}
            steps={tracerData.steps}
            lessonId={parsedLesson.id}
            walkthroughType={walkthroughType}
            onClose={handleCloseTracer}
          />
        </Suspense>
      )}
    </div>
  );
}
