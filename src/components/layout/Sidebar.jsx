import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { CheckCircle, Circle, Atom, Lock, BrainCircuit, Volume2, VolumeX, BookOpen, Menu, Check, RotateCcw } from 'lucide-react';
import useProgressStore from '../../store/useProgressStore';
import useUIStore from '../../store/useUIStore';
import curriculum, { TOTAL_LESSONS } from '../../curriculum/index';
import { isLessonUnlocked, isModuleUnlocked } from '../../lib/progression';
import audioManifest from '../../curriculum/audioManifest.json';

// Whether narration has been generated for this install at all. With no audio
// anywhere, a "narration missing" badge on all 84 lessons is noise about a
// feature that simply is not set up -- the badge only says something useful once
// some lessons have audio and others do not.
const HAS_ANY_NARRATION = Object.values(audioManifest).some((c) => c?.present > 0);

function AudioCoverageBadge({ lessonId }) {
  if (!HAS_ANY_NARRATION) return null;
  const coverage = audioManifest[lessonId];
  if (!coverage || coverage.expected === 0) return null;
  if (coverage.present === coverage.expected) return null;
  const label = coverage.present === 0
    ? 'No narration recorded for this lesson yet'
    : `Narration incomplete: ${coverage.present}/${coverage.expected} steps have audio`;
  const Icon = coverage.present === 0 ? VolumeX : Volume2;
  return (
    <span title={label} className={`audio-coverage-badge ${coverage.present === 0 ? 'is-missing' : 'is-partial'}`}>
      <Icon size={13} />
    </span>
  );
}

export default function Sidebar() {
  const completedLessons = useProgressStore((state) => state.completedLessons);
  const toggleCompleted = useProgressStore((state) => state.toggleCompleted);
  const unlockAllLessons = useUIStore((state) => state.unlockAllLessons);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  // Context Menu State for Right Click
  const [contextMenu, setContextMenu] = useState(null); // { x, y, lesson }
  const contextMenuRef = useRef(null);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleContextMenu = (e, lesson) => {
    e.preventDefault();
    e.stopPropagation();
    const x = Math.min(e.clientX, window.innerWidth - 200);
    const y = Math.min(e.clientY, window.innerHeight - 100);
    setContextMenu({ x, y, lesson });
  };

  return (
    <aside aria-label="Curriculum" className="sidebar">
      {/* Header with Hover-Visible Hamburger Toggle Button */}
      <div
        className="sidebar-header"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          <div
            className="sidebar-logo-icon"
            style={{
              flexShrink: 0,
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(217, 119, 87, 0.2), rgba(97, 218, 251, 0.15))',
              border: '1px solid rgba(217, 119, 87, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary, #d97757)',
            }}
          >
            <Atom size={19} className="sidebar-atom-spin" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 className="sidebar-title" style={{ margin: 0 }}>ReactLab</h1>
            <div className="sidebar-progress-row" style={{ marginTop: '3px' }}>
              <div className="sidebar-progress-track">
                <div
                  className="sidebar-progress-fill"
                  style={{ width: `${Math.min(100, Math.round((completedLessons.length / TOTAL_LESSONS) * 100))}%` }}
                />
              </div>
              <span style={{ whiteSpace: 'nowrap' }}>{completedLessons.length}/{TOTAL_LESSONS} complete</span>
            </div>
          </div>
        </div>

        {/* Hamburger Collapse Button: Visible on Header Hover */}
        <button
          type="button"
          onClick={toggleSidebar}
          title="Collapse Sidebar"
          aria-label="Collapse Sidebar"
          className="sidebar-hamburger-btn"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
            borderRadius: '6px',
            color: 'var(--text-secondary, #a8a29e)',
            cursor: 'pointer',
            padding: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '8px',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary, #fff)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary, #a8a29e)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
          }}
        >
          <Menu size={16} />
        </button>
      </div>

      {/* Review Lab & Glossary Codex directly under ReactLab */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px', marginBottom: '8px' }}>
        <NavLink
          to="/review"
          className={({ isActive }) => `sidebar-review-link${isActive ? ' is-active' : ''}`}
        >
          <BrainCircuit size={17} />
          <span>Review Lab</span>
        </NavLink>
        <NavLink
          to="/glossary"
          className={({ isActive }) => `sidebar-review-link${isActive ? ' is-active' : ''}`}
        >
          <BookOpen size={17} />
          <span>Glossary Codex</span>
        </NavLink>
      </div>

      {/* Curriculum Module Tree */}
      <div className="auto-hide-scrollbar sidebar-modules">
        {curriculum.map((module, mIdx) => {
          const isModUnlocked = isModuleUnlocked(module.id, completedLessons, unlockAllLessons);

          return (
            <div key={module.id} className="sidebar-module">
              <NavLink
                to={`/module/${module.id}`}
                className={({ isActive }) =>
                  `sidebar-module-link${isActive ? ' is-active' : isModUnlocked ? '' : ' is-locked'}`
                }
                title={isModUnlocked ? `View Module ${mIdx} Overview` : `Module ${mIdx} (Locked - Click to view overview)`}
                onMouseDown={(e) => e.preventDefault()}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                  <span className="sidebar-module-prefix">{`Module ${mIdx}:`}</span>
                  <span className="sidebar-module-name">{module.title}</span>
                </div>
                {!isModUnlocked && <Lock size={12} color="#78716c" />}
              </NavLink>

              <div className="sidebar-lesson-list">
                {module.lessons.map(lesson => {
                  const isCompleted = completedLessons.includes(lesson.id);
                  const isUnlocked = isLessonUnlocked(lesson.id, completedLessons, unlockAllLessons);

                  return (
                    <NavLink
                      key={lesson.id}
                      to={`/lesson/${module.id}/${lesson.id}`}
                      className={({ isActive }) =>
                        `sidebar-lesson-link${isActive ? ' is-active' : isUnlocked ? '' : ' is-locked'}`
                      }
                      onMouseDown={(e) => e.preventDefault()}
                      onContextMenu={(e) => handleContextMenu(e, lesson)}
                    >
                      {/* Status icon is positioned into the sidebar gutter by
                          .sidebar-lesson-status rather than sitting in the flow,
                          so every lesson title starts on the same vertical line
                          whether or not the lesson has an icon. */}
                      {isCompleted ? (
                        <CheckCircle size={15} color="var(--success)" className="sidebar-lesson-status" />
                      ) : !isUnlocked ? (
                        <Lock size={13} color="#78716c" className="sidebar-lesson-status" />
                      ) : null}
                      <span className="sidebar-lesson-title">
                        {lesson.title}
                      </span>
                      <AudioCoverageBadge lessonId={lesson.id} />
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Context Menu for Lesson Right-Click */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 99999,
            backgroundColor: '#1c1b18',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.15))',
            borderRadius: '10px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.65)',
            padding: '6px',
            minWidth: '190px',
            backdropFilter: 'blur(12px)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              padding: '6px 10px 8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#8c8a82',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '4px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {contextMenu.lesson.title}
          </div>
          <button
            type="button"
            onClick={() => {
              toggleCompleted(contextMenu.lesson.id);
              setContextMenu(null);
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              color: '#ededed',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-primary, #d97757)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#ededed';
            }}
          >
            {completedLessons.includes(contextMenu.lesson.id) ? (
              <>
                <RotateCcw size={14} />
                <span>Mark as Incomplete</span>
              </>
            ) : (
              <>
                <Check size={14} />
                <span>Mark as Complete</span>
              </>
            )}
          </button>
        </div>
      )}
    </aside>
  );
}
