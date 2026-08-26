// v4 — 2026-08-18 — narrow Zustand subscriptions to required state slices
import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SandpackProvider, SandpackCodeViewer, SandpackLayout } from '@codesandbox/sandpack-react';
import { ChevronLeft, ChevronRight, RotateCcw, X, Volume2, VolumeX } from 'lucide-react';
import useModalDialog from './useModalDialog.js';
import CopyButton from '../common/CopyButton.jsx';
import { codeTextFromPre } from '../common/PlainCodeBlock.jsx';
import ReactMarkdown from 'react-markdown';
import TutorAvatar from './TutorAvatar.jsx';
import useUIStore from '../../store/useUIStore.js';
import SANDPACK_THEME from '../../lib/sandpackTheme.js';

export default function StepThrough({ code, steps, onClose, lessonId, walkthroughType }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const step = steps[currentStepIndex];
  const dialogRef = useRef(null);
  const audioRef = useRef(null);
  const titleId = 'step-through-title';
  const isVoiceEnabled = useUIStore((state) => state.isVoiceEnabled);
  const toggleVoice = useUIStore((state) => state.toggleVoice);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const handleClose = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onClose();
  }, [onClose]);
  
  useModalDialog(dialogRef, handleClose);

  // Handle audio playback
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);

    if (!isVoiceEnabled || !lessonId || !walkthroughType) return;

    const audioUrl = `/audio/${lessonId}-${walkthroughType}-step-${currentStepIndex}.mp3`;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onplaying = () => setIsSpeaking(true);
    audio.onended = () => setIsSpeaking(false);
    audio.onpause = () => setIsSpeaking(false);
    audio.onerror = () => setIsSpeaking(false);

    const timeout = setTimeout(() => {
      audio.play().catch(e => {
        console.log('Audio playback failed', e);
        setIsSpeaking(false);
      });
    }, 100);

    return () => {
      clearTimeout(timeout);
      audio.pause();
      audioRef.current = null;
    };
  }, [currentStepIndex, isVoiceEnabled, lessonId, walkthroughType]);

  // Convert highlightLines to Sandpack decorators array
  const decorators = [];
  if (step.highlightLines) {
    let highlightStart, highlightEnd;
    if (typeof step.highlightLines === 'number') {
      highlightStart = highlightEnd = step.highlightLines;
    } else if (step.highlightLines.length > 2) {
      highlightStart = step.highlightLines[0];
      highlightEnd = step.highlightLines[step.highlightLines.length - 1];
    } else {
      [highlightStart, highlightEnd] = step.highlightLines;
      highlightEnd = highlightEnd ?? highlightStart;
    }

    for (let i = highlightStart; i <= highlightEnd; i++) {
      decorators.push({ className: 'highlight-line', line: i });
    }
  }

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) setCurrentStepIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(prev => prev - 1);
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
  };

  return (
    <div className="step-through-overlay" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px'
    }} onClick={onClose}>
      <motion.div
        ref={dialogRef}
        className="step-through-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '1200px',
          height: '80vh',
          backgroundColor: 'var(--bg-app)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-panel)'
        }}>
          <h3 id={titleId} style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent-primary)' }}>Step-by-Step Execution</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 400 }}>
              (Step {currentStepIndex + 1} of {steps.length})
            </span>
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => {
                if (isVoiceEnabled) {
                  if (audioRef.current) {
                    audioRef.current.pause();
                    setIsSpeaking(false);
                  }
                } else {
                  // Speak current step immediately when turned on
                  setCurrentStepIndex(prev => prev);
                }
                toggleVoice();
              }}
              title={isVoiceEnabled ? "Mute Voice" : "Enable Voice"}
              style={{
                background: isVoiceEnabled ? 'rgba(217,119,87,0.1)' : 'transparent',
                border: '1px solid',
                borderColor: isVoiceEnabled ? 'var(--accent-glow)' : 'transparent',
                color: isVoiceEnabled ? 'var(--accent-primary)' : 'var(--text-secondary)',
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              {isVoiceEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
            </button>
            <button
              aria-label="Close step-by-step walkthrough"
              title="Close walkthrough"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Left Side: Code */}
          <div className="code-copy-host" style={{
            flex: '1.5',
            borderRight: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-panel)',
            overflow: 'auto',
            position: 'relative'
          }}>
            <CopyButton text={code} label="Copy the whole example" />
            <SandpackProvider
              template="react"
              theme={SANDPACK_THEME}
              files={{ '/App.js': code }}
              options={{ 
                visibleFiles: ['/App.js'],
                activeFile: '/App.js',
              }}
            >
              <SandpackLayout style={{ border: 'none', borderRadius: 0, height: '100%' }}>
                <SandpackCodeViewer 
                  showTabs={false} 
                  showLineNumbers={true}
                  decorators={decorators}
                  style={{ height: '100%' }}
                />
              </SandpackLayout>
            </SandpackProvider>
          </div>

          {/* Right Side: Explanation and State */}
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column', padding: '40px 48px', backgroundColor: 'var(--bg-app)', overflowY: 'auto' }}>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                style={{ flex: 1 }}
              >
                <AnimatePresence>
                  {isVoiceEnabled ? (
                    <motion.div 
                      key="Sonia"
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '16px', overflow: 'visible', padding: '12px', marginLeft: '-12px', marginTop: '-12px' }}
                    >
                      <TutorAvatar isSpeaking={isSpeaking} size={48} />
                      <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-0.01em' }}>
                        <span style={{ display: 'inline-block', width: '4px', height: '20px', backgroundColor: 'var(--accent-primary)', borderRadius: '2px', boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)' }}></span>
                        Sonia says:
                      </h4>
                    </motion.div>
                  ) : (
                    <motion.h4 
                      key="text-header"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ margin: '0 0 24px 0', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-0.01em' }}
                    >
                      <span style={{ display: 'inline-block', width: '4px', height: '20px', backgroundColor: 'var(--accent-primary)', borderRadius: '2px', boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)' }}></span>
                      What's happening here?
                    </motion.h4>
                  )}
                </AnimatePresence>
                <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.8, letterSpacing: '0.01em', marginBottom: '40px' }}>
                  <ReactMarkdown
                    components={{
                      pre({ children }) {
                        return (
                          <pre className="code-copy-host" style={{
                            position: 'relative',
                            backgroundColor: '#141413',
                            padding: '16px 20px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-subtle)',
                            overflowX: 'auto',
                            margin: '20px 0',
                            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)'
                          }}>
                            <CopyButton text={codeTextFromPre(children)} />
                            {children}
                          </pre>
                        );
                      },
                      code({ node, className, children, ...props }) {
                        // If it's a block code (has a language or is inside a pre), don't wrap it in a pill
                        const match = /language-(\w+)/.exec(className || '');
                        if (match || (node && node.position && node.position.start.column === 1 && String(children).includes('\n'))) {
                          return (
                            <code style={{ color: '#e5e7eb', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.9rem', lineHeight: 1.6 }} className={className} {...props}>
                              {children}
                            </code>
                          );
                        }
                        // Inline pill
                        return (
                          <code style={{ 
                            backgroundColor: 'rgba(255,255,255,0.06)', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '0.15em 0.4em', 
                            borderRadius: '6px', 
                            fontFamily: 'var(--font-mono, monospace)',
                            color: 'var(--accent-primary)',
                            fontSize: '0.9em',
                            margin: '0 0.1em'
                          }} {...props}>
                            {children}
                          </code>
                        )
                      },
                      p({ children }) {
                        return <p style={{ margin: '0 0 24px 0', whiteSpace: 'pre-wrap' }}>{children}</p>;
                      }
                    }}
                  >
                    {step.description || step.explanation || ''}
                  </ReactMarkdown>
                </div>

                {step.stateSnapshot && Object.keys(step.stateSnapshot).length > 0 && (
                  <div>
                    <h5 style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', marginBottom: '16px', fontWeight: 600 }}>
                      State Snapshot
                    </h5>
                    <div style={{ 
                      backgroundColor: 'rgba(0,0,0,0.15)', 
                      padding: '20px', 
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-subtle)',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.95rem',
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      {Object.entries(step.stateSnapshot).map(([key, value]) => (
                        <div key={key} style={{ display: 'flex', marginBottom: '12px', borderBottom: '1px dashed var(--border-subtle)', paddingBottom: '12px' }}>
                          <span style={{ color: 'var(--accent-primary)', flex: '0 0 160px', fontWeight: 500 }}>{key}: </span>
                          <span style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div style={{ marginTop: 'auto', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Progress Dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                {steps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStepIndex(idx)}
                    aria-label={`Go to step ${idx + 1}`}
                    aria-current={idx === currentStepIndex ? 'step' : undefined}
                    style={{
                      width: idx === currentStepIndex ? '24px' : '10px',
                      height: '10px',
                      borderRadius: '5px',
                      padding: 0,
                      border: 'none',
                      backgroundColor: idx === currentStepIndex ? 'var(--accent-primary)' : 'var(--bg-hover)',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
                ))}
              </div>

              {/* Prev / Next / Reset */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                <button
                  onClick={handleReset}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '12px 20px',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-focus)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
                  onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <RotateCcw size={18} /> Reset
                </button>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handlePrev}
                    disabled={currentStepIndex === 0}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '12px 24px',
                      backgroundColor: currentStepIndex === 0 ? 'var(--bg-hover)' : 'var(--bg-panel)',
                      color: currentStepIndex === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      transition: 'all 0.2s'
                    }}
                  >
                    <ChevronLeft size={18} /> Prev
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentStepIndex === steps.length - 1}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '12px 28px',
                      backgroundColor: currentStepIndex === steps.length - 1 ? 'var(--bg-hover)' : 'var(--accent-primary)',
                      color: currentStepIndex === steps.length - 1 ? 'var(--text-muted)' : 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: currentStepIndex === steps.length - 1 ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      boxShadow: currentStepIndex === steps.length - 1 ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.3)',
                      transition: 'all 0.2s'
                    }}
                  >
                    Next <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
