// v5 — 2026-09-14 — hide the preview for lessons with no renderable App; wire up
//   the readOnly prop; stop prepending a dead styles.css import; drop a stray BOM.
// v4 — 2026-08-18 — narrow Zustand subscriptions to required state slices
import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, Code2, Copy, Check, Play, Eye, EyeOff, GitCompare, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { SandpackProvider, SandpackCodeEditor, SandpackLayout, SandpackPreview, useSandpack } from '@codesandbox/sandpack-react';
import { diffLines } from 'diff';
import CodeActions from './CodeActions.jsx';
import useModalDialog from './useModalDialog.js';
import FormatButton from './FormatButton.jsx';
import useProgressStore from '../../store/useProgressStore.js';
import SANDPACK_THEME from '../../lib/sandpackTheme.js';
import SandpackOfflineNotice from './SandpackOfflineNotice.jsx';
import SandpackOfflineFallback from './SandpackOfflineFallback.jsx';
import { isTypeScriptModule } from './useLessonSandpack.js';
import TypeDiagnostics from './TypeDiagnostics.jsx';

const DEFAULT_STYLES = 'body { background-color: #141413; color: #ededed; font-family: system-ui, sans-serif; padding: 16px; margin: 0; box-sizing: border-box; overflow: hidden; } * { box-sizing: border-box; }';

function normalizeChallengeFiles(source, appFile) {
  if (typeof source === 'string') return { [appFile]: source };
  if (!source || typeof source !== 'object') return {};

  return Object.fromEntries(Object.entries(source).map(([path, code]) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const runtimePath = /^\/App\.(?:js|jsx|tsx)$/.test(normalizedPath) ? appFile : normalizedPath;
    return [runtimePath, typeof code === 'string' ? code : code?.code || ''];
  }));
}

function createSandpackFiles(source, appFile) {
  const files = {};
  for (const [path, sourceCode] of Object.entries(normalizeChallengeFiles(source, appFile))) {
    // The stylesheet is *not* imported into the entry file here. Sandpack's
    // react and react-ts templates already import it from their own entry, so
    // the sheet is applied before the lesson's component is reached -- the same
    // reasoning `stripStylesheetImport` in lessonContent.js documents for the
    // lesson playground. Prepending it added a dead line to the top of every
    // challenge, and made the two code paths disagree about the same fact.
    files[path] = { code: sourceCode, active: path === appFile };
  }

  if (!files['/styles.css']) files['/styles.css'] = { code: DEFAULT_STYLES, hidden: true };
  return files;
}

// ─── Diff View ───────────────────────────────────────────────────────────────
function DiffView({ starterCode, solutionCode, activeFile }) {
  const diffLines_ = useMemo(() => {
    let starter = '';
    let target = '';
    if (typeof starterCode === 'string') starter = starterCode;
    else if (starterCode) starter = starterCode[activeFile] || '';
    if (typeof solutionCode === 'string') target = solutionCode;
    else if (solutionCode) target = solutionCode[activeFile] || '';

    const changes = diffLines(starter, target);
    const result = [];
    let lineNum = 1;
    changes.forEach(change => {
      const lines = change.value.split('\n');
      if (lines[lines.length - 1] === '') lines.pop();
      lines.forEach(text => {
        result.push({ text, added: change.added, removed: change.removed, lineNum: change.removed ? null : lineNum++ });
      });
    });
    return result;
  }, [starterCode, solutionCode, activeFile]);

  return (
    <div style={{ height: '100%', overflow: 'auto', fontFamily: 'var(--font-mono, monospace)', fontSize: '13px', lineHeight: '22px' }}>
      {diffLines_.map((line, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            backgroundColor: line.added ? 'rgba(120,140,93,0.15)' : line.removed ? 'rgba(193,95,60,0.15)' : 'transparent',
            borderLeft: line.added ? '3px solid #788c5d' : line.removed ? '3px solid #c15f3c' : '3px solid transparent',
          }}
        >
          <span style={{ width: 36, textAlign: 'right', paddingRight: 12, color: '#555', userSelect: 'none', flexShrink: 0 }}>
            {line.added ? '+' : line.removed ? '-' : (line.lineNum ?? '')}
          </span>
          <span style={{
            color: line.added ? '#4ade80' : line.removed ? '#f87171' : 'var(--text-primary)',
            whiteSpace: 'pre',
            paddingLeft: 8,
          }}>
            {line.text || ' '}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Code Viewer (Sandpack) ───────────────────────────────────────────────────
function SandpackCodePanel({ label, subLabel, readOnly = false }) {
  const [copied, setCopied] = useState(false);
  const { sandpack } = useSandpack();
  const handleCopy = () => {
    const code = sandpack.files[sandpack.activeFile]?.code || '';
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: '#1e1e1e'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {label}
          </span>
          {subLabel && (
            <span style={{ fontSize: '0.7rem', color: '#777', fontFamily: 'monospace', backgroundColor: '#2a2a2a', padding: '2px 6px', borderRadius: '4px' }}>
              {subLabel}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FormatButton showLabel={true} />
          <button onClick={handleCopy} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
            backgroundColor: copied ? 'var(--success-solid)' : 'var(--bg-hover)',
            color: copied ? 'white' : 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s'
          }}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', backgroundColor: 'var(--bg-app)' }}>
        <SandpackLayout style={{ height: '100%', border: 'none', borderRadius: 0, minHeight: 'auto' }}>
          <SandpackCodeEditor showLineNumbers={true} readOnly={readOnly} />
        </SandpackLayout>
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function ChallengeModal({ lesson, nextLessonPath, challenge, solutionDesc, hints, starterCode, solutionCode, hasWalkthrough, onShowWalkthrough, onClose }) {
  const recordSolutionViewed = useProgressStore((state) => state.recordSolutionViewed);
  const [revealedHints, setRevealedHints] = useState(0);
  const hintList = Array.isArray(hints) ? hints : (hints ? [hints] : []);
  const dialogRef = useRef(null);
  const titleId = `challenge-title-${lesson.id}`;
  useModalDialog(dialogRef, onClose);

  const markdownComponents = useMemo(() => ({
    code({ className, children, ...props }) {
      return (
        <code style={{ 
          backgroundColor: 'rgba(255,255,255,0.06)', 
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '0.1em 0.35em', 
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
  }), []);

  const [solutionState, setSolutionState] = useState('hidden'); // 'hidden' | 'confirm' | 'showing'
  const [viewMode, setViewMode] = useState('solution'); // 'solution' | 'diff'

  const hasSolution = !!solutionCode;

  const isTypeScript = isTypeScriptModule(lesson.moduleId);
  const appFile = isTypeScript ? '/App.tsx' : '/App.js';
  const template = isTypeScript ? 'react-ts' : 'react';
  const starterFiles = useMemo(() => normalizeChallengeFiles(starterCode, appFile), [starterCode, appFile]);
  const [localFiles, setLocalFiles] = useState(starterFiles);

  useEffect(() => {
    let isMounted = true;
    setLocalFiles(starterFiles);

    if (!import.meta.env.DEV) return () => { isMounted = false; };

    const fetchLocalFiles = async () => {
      try {
        // The dev-server middleware (vite.config.js) matches paths of the form
        // /api/playground/<moduleId>/<lessonId> and reads src/playground/<moduleId>/<lessonId>/
        // from disk. This must stay a path, not a query string — a query string here
        // silently falls through Vite's SPA fallback (still a 200, but HTML, not JSON),
        // so res.ok is true and res.json() throws, always landing on the embedded
        // starter-code fallback below without any visible error. That meant the curated
        // files in src/playground/ were never actually loading in dev before this fix.
        const res = await fetch(`/api/playground/${lesson.moduleId}/${lesson.id}`);
        if (!res.ok) throw new Error(`Unable to load playground files (${res.status})`);
        const data = await res.json();
        if (isMounted && data.files && Object.keys(data.files).length > 0) {
          const devOverrides = normalizeChallengeFiles(data.files, appFile);
          const validOverrides = Object.fromEntries(
            Object.entries(devOverrides).filter(([_, code]) => code && code.trim().length > 0)
          );
          if (Object.keys(validOverrides).length > 0) {
            setLocalFiles(prev => ({ ...prev, ...validOverrides }));
          }
        }
      } catch (error) {
        console.warn('Using embedded starter code because local playground files are unavailable.', error);
      }
    };

    fetchLocalFiles();

    // R-05 Fix: Store listener and remove it on cleanup
    const handleUpdate = () => fetchLocalFiles();
    if (import.meta.hot) {
      import.meta.hot.on('playground-update', handleUpdate);
    }

    return () => {
      isMounted = false;
      if (import.meta.hot) {
        import.meta.hot.off('playground-update', handleUpdate);
      }
    };
  }, [lesson.id, lesson.moduleId, starterFiles, appFile]);

  // Build sandpack files for the code panel
  const sandpackFiles = useMemo(() => {
    if (solutionState === 'showing') {
      return createSandpackFiles(solutionCode, appFile);
    }
    return createSandpackFiles(localFiles, appFile);
  }, [solutionState, solutionCode, localFiles, appFile]);

  // Sandpack's entry does `import App from "./App"` and renders it. A lesson
  // whose files have no App with a default export therefore renders either a
  // runtime error (plain-DOM lessons like what-is-react, js-promises) or the
  // react template's own placeholder app (the test-file lessons, which have no
  // App at all). Neither teaches anything, so those lessons get the editor plus
  // an explanation instead of a preview -- mirroring useLessonSandpack's
  // `isRunnable`, which the lesson playground has had all along.
  const isRunnable = useMemo(() => {
    const entry = sandpackFiles[appFile]?.code;
    return typeof entry === 'string' && /export\s+default/.test(entry);
  }, [sandpackFiles, appFile]);

  // Active file for diff (first non-hidden file)
  const activeFile = useMemo(() => {
    const keys = Object.keys(sandpackFiles).filter(k => !sandpackFiles[k]?.hidden);
    return keys[0] || appFile;
  }, [sandpackFiles, appFile]);

  // Any lesson that imports a third-party package (zustand, react-router-dom, etc.)
  // must declare it in its `dependencies` field, or Sandpack's bundler can't resolve
  // the import and the sandbox fails to build. See lesson.dependencies in the module files.
  // We also explicitly enforce React 19 since the curriculum covers useActionState/useOptimistic.
  const customSetup = useMemo(() => ({
    dependencies: {
      ...lesson.dependencies,
      'react': '^19.0.0',
      'react-dom': '^19.0.0',
    }
  }), [lesson.dependencies]);

  const codeLabel = solutionState === 'showing' ? 'Solution Code' : 'Starter Code';
  const codePath = solutionState === 'showing' ? '' : 'Edit code directly in this panel';

  return (
    <div
      className="challenge-overlay"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
        zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px'
      }}
      onClick={onClose}
    >
      <motion.div
        ref={dialogRef}
        className="challenge-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '1200px', height: '85vh',
          backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          backgroundColor: 'var(--bg-panel)'
        }}>
          <h2 id={titleId} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)', fontSize: '1.1rem' }}>
            <Code2 size={20} />
            Your Challenge
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Diff / Solution tab toggle — only visible when solution is shown */}
            {solutionState === 'showing' && (
              <div style={{
                display: 'flex', gap: '4px', padding: '3px',
                backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)'
              }}>
                <button
                  onClick={() => setViewMode('solution')}
                  style={{
                    padding: '5px 14px', border: 'none', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                    backgroundColor: viewMode === 'solution' ? 'var(--bg-panel)' : 'transparent',
                    color: viewMode === 'solution' ? 'var(--text-primary)' : 'var(--text-muted)',
                    transition: 'all 0.15s'
                  }}
                >
                  Solution
                </button>
                <button
                  onClick={() => setViewMode('diff')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '5px 14px', border: 'none', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                    backgroundColor: viewMode === 'diff' ? 'var(--bg-panel)' : 'transparent',
                    color: viewMode === 'diff' ? 'var(--text-primary)' : 'var(--text-muted)',
                    transition: 'all 0.15s'
                  }}
                >
                  <GitCompare size={13} /> Diff
                </button>
              </div>
            )}
            <button aria-label="Close challenge" title="Close challenge" onClick={onClose} style={{
              background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '4px'
            }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="challenge-body" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Left: Instructions, Hints, Actions */}
          <div className="challenge-instructions auto-hide-scrollbar" style={{
            width: '38%', minWidth: '320px', padding: '32px 36px',
            borderRight: '1px solid var(--border-subtle)', overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: '0'
          }}>

            <div className="markdown-body" style={{ fontSize: '1.05rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              <ReactMarkdown components={markdownComponents}>{challenge || 'Follow the instructions in the lesson to complete this challenge!'}</ReactMarkdown>
            </div>

            <AnimatePresence>
              {solutionState === 'showing' && solutionDesc && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden', marginTop: '24px' }}
                >
                  <div style={{ 
                    padding: '20px 24px', 
                    backgroundColor: 'rgba(120,140,93,0.08)', 
                    borderRadius: 'var(--radius-lg)', 
                    border: '1px solid rgba(120,140,93,0.2)',
                    borderLeft: '4px solid var(--success-solid)' 
                  }}>
                    <h4 style={{ color: 'var(--success-solid)', marginBottom: '12px', fontSize: '0.95rem', marginTop: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Solution Explanation</h4>
                    <div className="markdown-body" style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                      <ReactMarkdown components={markdownComponents}>{solutionDesc}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons — pushed to bottom */}
            <div style={{ marginTop: 'auto', paddingTop: '32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

              {/* Hints */}
              {hintList.length > 0 && (
                <>
                  {hintList.slice(0, revealedHints).map((hint, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{
                        padding: '16px', marginBottom: '8px',
                        backgroundColor: 'rgba(217,160,87,0.1)', borderLeft: '4px solid var(--warning)',
                        borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                        color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.5
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--warning)' }}>Hint {i + 1}</div>
                        <ReactMarkdown components={markdownComponents}>{hint}</ReactMarkdown>
                      </div>
                    </motion.div>
                  ))}
                  
                  {revealedHints < hintList.length && (
                    <button className="ui-btn-primary" onClick={() => setRevealedHints(r => r + 1)} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      width: '100%', justifyContent: 'center', marginBottom: '8px'
                    }}>
                      <Lightbulb size={18} />
                      {revealedHints === 0 ? 'Stuck? Show a Hint' : 'Show Another Hint'}
                    </button>
                  )}
                </>
              )}

              {/* Walkthrough */}
              {hasWalkthrough && (
                <button className="ui-btn-ghost" onClick={onShowWalkthrough} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  width: '100%', justifyContent: 'center',
                  color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)'
                }}>
                  <Play size={16} />
                  Explain step-by-step
                </button>
              )}

              {/* Reveal Solution */}
              {hasSolution && solutionState === 'hidden' && (
                <button className="ui-btn-ghost" onClick={() => setSolutionState('confirm')} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  width: '100%', justifyContent: 'center'
                }}>
                  <Eye size={16} />
                  Reveal Solution
                </button>
              )}

              {/* Confirm step */}
              <AnimatePresence>
                {solutionState === 'confirm' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      padding: '16px 20px',
                      backgroundColor: 'rgba(193,95,60,0.08)',
                      border: '1px solid rgba(193,95,60,0.3)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex', flexDirection: 'column', gap: '12px'
                    }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Are you sure? Try the hints or walkthrough first — working through it yourself is how this sticks.
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => { recordSolutionViewed(lesson.id); setSolutionState('showing'); setViewMode('diff'); }}
                          style={{
                            flex: 1, padding: '8px 12px', backgroundColor: 'rgba(193,95,60,0.15)',
                            color: '#f87171', border: '1px solid rgba(193,95,60,0.4)',
                            borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                          }}
                        >
                          Show it anyway
                        </button>
                        <button
                          className="ui-btn-ghost"
                          onClick={() => setSolutionState('hidden')}
                          style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
                        >
                          Keep trying
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hide solution / back to starter */}
              {solutionState === 'showing' && (
                <button className="ui-btn-ghost" onClick={() => { setSolutionState('hidden'); setViewMode('solution'); }} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  width: '100%', justifyContent: 'center'
                }}>
                  <RotateCcw size={15} />
                  Back to Starter Code
                </button>
              )}
            </div>
          </div>

          {/* Right: Code Panel */}
          <div className="challenge-code-panel" style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <SandpackProvider template={template} theme={SANDPACK_THEME} files={sandpackFiles} customSetup={customSetup} options={{ autorun: true }}>
              <SandpackOfflineNotice dependencies={lesson.dependencies} />
              {/* Solution banner */}
              <AnimatePresence>
                {solutionState === 'showing' && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    style={{
                      padding: '8px 20px',
                      backgroundColor: 'rgba(193,95,60,0.12)',
                      borderBottom: '1px solid rgba(193,95,60,0.25)',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      fontSize: '0.8rem', color: '#f87171', fontWeight: 600
                    }}
                  >
                    <EyeOff size={13} />
                    Solution revealed — study it, understand it, then try to write it from memory.
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Code content and Live Preview */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
                <div style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0 }}>
                  {solutionState === 'showing' && viewMode === 'diff' ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-panel)' }}>
                      <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                          Diff: Starter → Solution
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span style={{ color: '#4ade80' }}>+</span> added &nbsp;
                          <span style={{ color: '#f87171' }}>-</span> removed
                        </span>
                      </div>
                      <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
                        <DiffView
                          starterCode={starterCode}
                          solutionCode={solutionCode}
                          activeFile={activeFile}
                        />
                      </div>
                    </div>
                  ) : (
                    <SandpackCodePanel label={codeLabel} subLabel={codePath} readOnly={solutionState === 'showing'} />
                  )}
                </div>

                {/* Live Preview (Bottom Half) */}
                <div style={{ height: '45%', display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-panel)', minHeight: 0 }}>
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-subtle)', backgroundColor: '#1e1e1e', color: '#888', fontSize: '0.75rem', fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{isRunnable ? `Live Preview (${codeLabel})` : 'No preview for this exercise'}</span>
                    {solutionState !== 'showing' && (
                      <CodeActions lesson={lesson} nextLessonPath={nextLessonPath} />
                    )}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden', position: 'relative', backgroundColor: '#141413' }}>
                    {isRunnable ? (
                      <SandpackOfflineFallback dependencies={lesson.dependencies} entryFile={appFile}>
                        <SandpackLayout style={{ height: '100%', border: 'none', borderRadius: 0, minHeight: 'auto' }}>
                          <SandpackPreview style={{ height: '100%', flex: 1, border: 'none' }} showOpenInCodeSandbox={false} showRefreshButton={true} />
                        </SandpackLayout>
                      </SandpackOfflineFallback>
                    ) : (
                      <div style={{
                        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '16px 32px', textAlign: 'center',
                        color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6
                      }}>
                        This exercise has no component to render — it is code to read and edit.
                        Check Answer still grades what you write.
                      </div>
                    )}
                  </div>
                  {/* Reports, never blocks: Check Answer still grades the code
                      the learner wrote, exactly as it does everywhere else. */}
                  <TypeDiagnostics enabled={isTypeScript} />
                </div>
              </div>
            </SandpackProvider>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

