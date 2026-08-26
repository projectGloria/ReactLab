import { useEffect, useMemo } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import SettingsModal from './SettingsModal';
import TitleBar from './TitleBar';
import useUIStore from '../../store/useUIStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import sounds from '../../lib/soundEffects';
import curriculum from '../../curriculum/index';

const SIDEBAR_WIDTH = 300;

export default function AppLayout() {
  const location = useLocation();
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const isZenMode = useUIStore((state) => state.isZenMode);

  // Compute dynamic title & subtitle based on current route
  const { barTitle, barSubtitle } = useMemo(() => {
    const path = location.pathname;
    if (path === '/') {
      return { barTitle: 'REACTLAB', barSubtitle: 'Masterclass Platform' };
    }
    if (path === '/review') {
      return { barTitle: 'RETRIEVAL LAB', barSubtitle: 'Active Recall & Spaced Repetition' };
    }
    if (path === '/glossary') {
      return { barTitle: 'GLOSSARY CODEX', barSubtitle: 'Mental Models & Terminology' };
    }
    if (path.startsWith('/module/')) {
      const moduleId = path.replace('/module/', '');
      const mod = curriculum.find((m) => m.id === moduleId);
      return { barTitle: 'MODULE OVERVIEW', barSubtitle: mod ? mod.title : 'Curriculum' };
    }
    if (path.startsWith('/lesson/')) {
      const parts = path.split('/');
      const modId = parts[2];
      const lesId = parts[3];
      const mod = curriculum.find((m) => m.id === modId);
      const les = mod?.lessons?.find((l) => l.id === lesId);
      return {
        barTitle: mod ? mod.title.toUpperCase() : 'LESSON',
        barSubtitle: les ? les.title : 'Interactive Tutorial',
      };
    }
    return { barTitle: 'REACTLAB', barSubtitle: '' };
  }, [location.pathname]);

  // 1. Play Opera GX-style Mechanical Keyboard Click on typing
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't play on standalone modifier keys
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
        return;
      }
      sounds.playKeyClick(e.key);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  // 2. Play Tactile Mouse / Button Click on UI interactions & track active scroll region
  useEffect(() => {
    let lastActiveRegion = 'main'; // 'sidebar' | 'main'

    const handlePointerDown = (e) => {
      // Check if clicking inside sidebar vs main content
      if (e.target.closest('.sidebar, .app-sidebar-shell')) {
        lastActiveRegion = 'sidebar';
      } else {
        lastActiveRegion = 'main';
      }

      // Check if clicking an interactive element
      const interactive = e.target.closest('button, a, [role="button"], input, select, textarea, .clickable');
      if (interactive) {
        sounds.playClick();
      }
    };

    const handleArrowScroll = (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'PageDown' && e.key !== 'PageUp') return;

      // Never intercept inside text inputs, code editor textareas, or active modal dialogs
      const activeEl = document.activeElement;
      if (activeEl && (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName) ||
        activeEl.isContentEditable ||
        activeEl.closest('.cm-editor, .sp-cm, [role="dialog"]')
      )) {
        return;
      }

      const isDown = e.key === 'ArrowDown' || e.key === 'PageDown';
      const scrollStep = e.key.startsWith('Page') ? 300 : 90;
      const delta = isDown ? scrollStep : -scrollStep;

      if (lastActiveRegion === 'sidebar') {
        const sidebarModules = document.querySelector('.sidebar-modules');
        if (sidebarModules) {
          e.preventDefault();
          sidebarModules.scrollBy({ top: delta, behavior: 'smooth' });
          return;
        }
      }

      // Default to main lesson / page content scroll container
      const mainScroll = document.querySelector('.lesson-content-scroll') ||
        document.querySelector('.lesson-view-page .auto-hide-scrollbar') ||
        document.querySelector('main .auto-hide-scrollbar') ||
        document.querySelector('main');

      if (mainScroll) {
        e.preventDefault();
        mainScroll.scrollBy({ top: delta, behavior: 'smooth' });
      }
    };

    window.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('keydown', handleArrowScroll, false);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('keydown', handleArrowScroll, false);
    };
  }, []);

  // Responsive sidebar collapsing on small screens
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 850px)');
    const closeOnSmallScreens = () => {
      if (mediaQuery.matches) setSidebarOpen(false);
    };

    closeOnSmallScreens();
    mediaQuery.addEventListener('change', closeOnSmallScreens);
    return () => mediaQuery.removeEventListener('change', closeOnSmallScreens);
  }, [setSidebarOpen]);

  // Global double-click on blank space toggles maximize / fullscreen
  useEffect(() => {
    const handleDoubleClick = async (e) => {
      const target = e.target;
      if (!target) return;

      // Ignore double clicks on interactive controls, inputs, buttons, links, code editors, and text selections
      const interactiveSelector = 'button, a, input, textarea, select, [contenteditable="true"], .cm-content, .cm-editor, .sp-code-editor, .sp-tab-button, .sidebar-lesson-link, .sidebar-module-link, .sidebar-review-link, .learning-check-option, .learning-check-textarea, .modal, .custom-titlebar, .traffic-light-btn';
      if (target.closest(interactiveSelector)) {
        return;
      }

      // Check if user is double clicking on a text paragraph to select text
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        return;
      }

      // Toggle window maximize / restore in Electron or browser fullscreen
      if (window.electronAPI?.window?.toggleMaximize) {
        await window.electronAPI.window.toggleMaximize();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {});
      } else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
    };

    window.addEventListener('dblclick', handleDoubleClick);
    return () => window.removeEventListener('dblclick', handleDoubleClick);
  }, []);

  return (
    <div className={`app-layout${isZenMode ? ' is-zen-mode' : ''}`} style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Universal Frameless Top Bar */}
      <TitleBar
        title={barTitle}
        subtitle={barSubtitle}
        leading={
          !isZenMode && !isSidebarOpen ? (
            <button
              type="button"
              onClick={toggleSidebar}
              title="Open Curriculum Sidebar"
              aria-label="Open Sidebar"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                borderRadius: '6px',
                padding: '3px 6px',
                color: 'var(--text-secondary, #b0aea5)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary, #fff)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary, #b0aea5)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <Menu size={14} />
            </button>
          ) : null
        }
      />

      <div style={{
        display: 'flex',
        flex: 1,
        width: '100%',
        height: 'calc(100vh - 34px)',
        overflow: 'hidden',
      }}>
        <AnimatePresence initial={false}>
          {!isZenMode && isSidebarOpen && (
            <motion.div
              className="app-sidebar-shell"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: SIDEBAR_WIDTH, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              style={{ overflow: 'hidden', flexShrink: 0 }}
            >
              <div style={{ width: SIDEBAR_WIDTH, height: '100%' }}>
                <Sidebar />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-app)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Outlet />
        </main>
      </div>
      <SettingsModal />
    </div>
  );
}
