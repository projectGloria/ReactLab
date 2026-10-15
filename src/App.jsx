import { useState, useEffect } from 'react';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Atom, Sparkles } from 'lucide-react';

import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import LessonView from './pages/LessonView';
import ModuleOverview from './pages/ModuleOverview';
import ReviewDashboard from './pages/ReviewDashboard';
import DetachedWindow from './pages/DetachedWindow';
import GlossaryPage from './pages/GlossaryPage';
import NotFound from './pages/NotFound';

function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(10);
  const [statusText, setStatusText] = useState('Initializing ReactLab...');

  useEffect(() => {
    let isCancelled = false;

    async function run() {
      try {
        const { warmupApp } = await import('./lib/warmup');
        if (isCancelled) return;
        await warmupApp((pct, text) => {
          if (!isCancelled) {
            setProgress(pct);
            setStatusText(text);
          }
        });
      } catch (err) {
        console.error('[SplashScreen] Warmup error:', err);
      } finally {
        if (!isCancelled) {
          setTimeout(() => {
            if (!isCancelled) onFinish();
          }, 200);
        }
      }
    }

    run();

    return () => {
      isCancelled = true;
    };
  }, [onFinish]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#0e0d0c',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#f5f5f4',
      userSelect: 'none',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          maxWidth: '380px',
          width: '90%',
          textAlign: 'center',
        }}
      >
        {/* Animated Glow Logo */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            inset: '-12px',
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.45) 0%, rgba(249, 115, 22, 0) 70%)',
            borderRadius: '50%',
            filter: 'blur(10px)',
          }} />
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '20px',
            backgroundColor: '#181715',
            border: '1px solid rgba(249, 115, 22, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary, #f97316)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
            position: 'relative',
          }}>
            <Atom size={36} className="spin-slow" />
          </div>
        </div>

        <div>
          <h1 style={{
            fontSize: '1.6rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            margin: 0,
            background: 'linear-gradient(135deg, #ffffff 30%, #a8a29e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            ReactLab
          </h1>
          <p style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary, #a8a29e)',
            marginTop: '4px',
            marginBottom: 0,
          }}>
            Interactive Masterclass Platform
          </p>
        </div>

        {/* Progress Bar Container */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            width: '100%',
            height: '4px',
            borderRadius: '999px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
          }}>
            <motion.div
              style={{
                height: '100%',
                backgroundColor: 'var(--accent-primary, #f97316)',
                borderRadius: '999px',
                boxShadow: '0 0 12px rgba(249, 115, 22, 0.8)',
              }}
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#78716c',
            fontFamily: 'var(--font-mono, monospace)',
          }}>
            {statusText}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PageLoader() {
  return (
    <div role="status" style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-app, #141311)',
      color: 'var(--text-secondary, #a8a29e)',
      fontSize: '0.9rem',
    }}>
      Loading...
    </div>
  );
}

// Packaged Electron pages use file://, including hashes for detached windows.
const Router = window.location.protocol === 'file:' ? HashRouter : BrowserRouter;

function App() {
  const [isReady, setIsReady] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!isReady && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            <SplashScreen onFinish={() => setIsReady(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      <Router>
        <Routes>
          <Route path="/detached/:type/:moduleId/:lessonId" element={<DetachedWindow />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="module/:moduleId" element={<ModuleOverview />} />
            <Route path="review" element={<ReviewDashboard />} />
            <Route path="glossary" element={<GlossaryPage />} />
            <Route path="lesson/:moduleId/:lessonId" element={<LessonView />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
