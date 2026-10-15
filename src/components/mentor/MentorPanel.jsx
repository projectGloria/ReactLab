import React, { useEffect, useRef, useState, useMemo } from 'react';
import { RefreshCw, Send, X, Settings, ExternalLink, Check, Copy, History, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import useUIStore from '../../store/useUIStore';
import curriculum from '../../curriculum/index';
import highlightCode from '../../lib/highlightCode.jsx';
import TutorAvatar from '../lesson/TutorAvatar.jsx';
import { getCloudModel, PROVIDER_LABELS } from '../../lib/aiProviders.js';
import { getEffectiveSystemPrompt } from '../../lib/mentorPersonas.js';
import { buildMentorContext } from '../../lib/mentorContext.js';

// What the supervisor's status codes mean in one short line, so the status strip
// can say why the mentor is not ready instead of always blaming the settings.
const LOCAL_STATUS_TEXT = {
  'not-installed': 'runtime not installed',
  installing: 'installing the runtime…',
  'installed-stopped': 'runtime stopped',
  starting: 'starting…',
  'running-no-model': 'model not available',
  'downloading-model': 'downloading the model…',
  error: 'runtime error',
};

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: 'Ask me about this lesson. I will explain the mental model first and give you a hint before a full solution.',
};


function MentorCodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const highlighted = useMemo(() => highlightCode(code), [code]);

  return (
    <div className="mentor-code-wrapper">
      <div className="mentor-code-header">
        <span className="mentor-code-lang">{language || 'javascript'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="mentor-code-copy-btn"
          title="Copy code"
        >
          {copied ? <Check size={13} color="var(--success, #788c5d)" /> : <Copy size={13} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="mentor-code-pre">
        <code>{highlighted}</code>
      </pre>
    </div>
  );
}

const markdownComponents = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\n$/, '');

    // react-markdown 10 stopped passing `inline`, so the block/inline decision is
    // made from the content: a snippet is a card only when it spans lines. The
    // old `codeString.length > 40` rule turned one-liners inside numbered lists
    // into full code cards, which broke the list open -- the marker sat alone on
    // one line and the sentence explaining it started with a stray ":" below.
    if (codeString.includes('\n')) {
      return (
        <MentorCodeBlock
          code={codeString}
          language={match ? match[1] : 'javascript'}
        />
      );
    }

    return (
      <code className="mentor-inline-code" {...props}>
        {children}
      </code>
    );
  },
};

function getMentorApi() {
  return window.electronAPI?.mentor;
}

function MentorPanelInner({
  lessonId,
  lessonTitle,
  lessonExcerpt,
  activeSection,
  code,
  files,
  lesson,
  runtimeError,
  moduleId,
  onClose,
  isDetached = false,
  isInline = false,
  isZenMode = false,
}) {
  const navigate = useNavigate();
  const mentorName = useUIStore((state) => state.mentorName);
  const language = useUIStore((state) => state.language);
  const aiProvider = useUIStore((state) => state.aiProvider);
  const mentorCustomPrompt = useUIStore((state) => state.mentorCustomPrompt);
  const mentorPresetId = useUIStore((state) => state.mentorPresetId);
  const geminiApiKey = useUIStore((state) => state.geminiApiKey);
  const groqApiKey = useUIStore((state) => state.groqApiKey);
  const openAiApiKey = useUIStore((state) => state.openAiApiKey);
  const openSettings = useUIStore((state) => state.openSettings);
  const savedMessages = useUIStore((state) => state.mentorConversations?.[lessonId]);
  const savedDraft = useUIStore((state) => state.mentorDrafts?.[lessonId]);
  const allConversations = useUIStore((state) => state.mentorConversations || {});
  const setMentorConversation = useUIStore((state) => state.setMentorConversation);
  const setMentorDraft = useUIStore((state) => state.setMentorDraft);
  const clearMentorConversation = useUIStore((state) => state.clearMentorConversation);
  const clearAllMentorSessions = useUIStore((state) => state.clearAllMentorSessions);

  const [messages, setMessages] = useState(() => savedMessages || [INITIAL_MESSAGE]);
  const [question, setQuestion] = useState(() => savedDraft || '');
  const [isSending, setIsSending] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [status, setStatus] = useState({ loading: true, available: false, models: [] });
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Synchronize state changes to store
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    return () => {
      if (messagesRef.current && messagesRef.current.length > 0) {
        setMentorConversation(lessonId, messagesRef.current);
      }
    };
  }, [lessonId, setMentorConversation]);

  useEffect(() => {
    setMessages(savedMessages || [INITIAL_MESSAGE]);
    setQuestion(savedDraft || '');
  }, [lessonId]);

  useEffect(() => {
    return () => {
      setMentorDraft(lessonId, question);
    };
  }, [question, lessonId, setMentorDraft]);

  const getActiveApiKey = () => {
    if (aiProvider === 'gemini') return geminiApiKey;
    if (aiProvider === 'groq') return groqApiKey;
    if (aiProvider === 'openai') return openAiApiKey;
    return '';
  };

  useEffect(() => {
    inputRef.current?.focus();
    let cancelled = false;
    const mentorApi = getMentorApi();

    if (!mentorApi) {
      setStatus({ loading: false, available: false, models: [], error: 'Run ReactLab in Electron to use the local mentor runtime, or configure Cloud AI in Settings.' });
      return undefined;
    }

    if (aiProvider !== 'ollama') {
      const hasKey = Boolean(getActiveApiKey());
      setStatus({
        loading: false,
        available: hasKey,
        models: [aiProvider.toUpperCase()],
        provider: aiProvider,
        message: hasKey ? `Cloud AI Ready (${aiProvider.toUpperCase()})` : `Add your ${aiProvider.toUpperCase()} API key in Settings to begin.`,
      });
      return undefined;
    }

    mentorApi.getStatus().then((result) => {
      if (!cancelled) setStatus({ loading: false, ...result });
    }).catch(() => {
      if (!cancelled) setStatus({ loading: false, available: false, models: [], error: 'Could not check the local model runtime.' });
    });

    const unsubscribe = window.electronAPI?.ollama?.onStatus?.((next) => {
      if (!cancelled && next) setStatus({ loading: false, ...next });
    });

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [aiProvider, geminiApiKey, groqApiKey, openAiApiKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (isDetached) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isHistoryOpen) setIsHistoryOpen(false);
        else onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isDetached, isHistoryOpen]);

  const handlePopOut = async () => {
    const popoutPath = `/detached/mentor/${moduleId || 'fundamentals'}/${lessonId}`;
    if (window.electronAPI?.openDetachedWindow) {
      await window.electronAPI.openDetachedWindow({
        type: 'mentor',
        urlPath: popoutPath,
        title: `${mentorName || 'ReactLab Mentor'} — ${lessonTitle || 'Tutor'}`,
        width: 850,
        height: 720,
      });
      onClose?.();
    } else {
      window.open(popoutPath, '_blank', 'width=850,height=720');
      onClose?.();
    }
  };

  const submit = async (event) => {
    event?.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || isSending) return;

    const history = messages.filter((message) => message.role === 'user' || message.role === 'assistant');
    setMessages((current) => [...current, { role: 'user', content: trimmed }]);
    setQuestion('');
    setIsSending(true);

    const mentorApi = getMentorApi();
    if (!mentorApi) {
      setMessages((current) => [...current, { role: 'assistant', content: 'The local AI mentor requires ReactLab in Electron. You can also configure a free Gemini or Groq key in Settings.' }]);
      setIsSending(false);
      return;
    }

    // Add placeholder assistant message for streaming
    setMessages((current) => [...current, { role: 'assistant', content: '' }]);

    const unsubscribe = mentorApi.onChunk ? mentorApi.onChunk((chunk) => {
      setIsSending(false);
      setMessages((current) => {
        const last = current[current.length - 1];
        if (last && last.role === 'assistant') {
          return [...current.slice(0, -1), { ...last, content: last.content + chunk }];
        }
        return current;
      });
    }) : undefined;

    try {
      // Sends the preset's own text when the box was never edited -- the chat used
      // to send nothing at all and quietly answer with main.cjs's default persona.
      const effectiveSystemPrompt = getEffectiveSystemPrompt(mentorPresetId, mentorCustomPrompt);

      const result = await mentorApi.ask({
        provider: aiProvider,
        apiKey: getActiveApiKey(),
        systemPrompt: effectiveSystemPrompt,
        // Main decides how to phrase the instruction; the renderer only reports
        // which language the learner is reading the lesson in.
        language,
        question: trimmed,
        history,
        context: buildMentorContext({
          lesson: lesson || { id: lessonId, title: lessonTitle, displayContent: lessonExcerpt },
          moduleId,
          files,
          code,
          activeSection,
          runtimeError,
          lessonTitle,
          lessonExcerpt,
        }),
      });

      setMessages((current) => {
        const last = current[current.length - 1];
        if (last && last.role === 'assistant') {
          return [
            ...current.slice(0, -1),
            {
              role: 'assistant',
              content: result.ok
                ? result.content
                : `I could not answer that: ${result.error}`,
            },
          ];
        }
        return current;
      });
    } catch (error) {
      setMessages((current) => [
        ...current.slice(0, -1),
        {
          role: 'assistant',
          content: `Mentor error: ${error.message || 'Unknown network error.'}`,
        },
      ]);
    } finally {
      if (unsubscribe) unsubscribe();
      setIsSending(false);
    }
  };

  const resetConversation = () => {
    clearMentorConversation(lessonId);
    setMessages([INITIAL_MESSAGE]);
  };

  const handleSelectSessionThread = (targetLessonId) => {
    // Find lesson metadata
    let targetModuleId = moduleId;
    for (const mod of curriculum) {
      if (mod.lessons.some((l) => l.id === targetLessonId)) {
        targetModuleId = mod.id;
        break;
      }
    }
    setIsHistoryOpen(false);
    navigate(`/lesson/${targetModuleId}/${targetLessonId}`);
  };

  const isCloud = aiProvider !== 'ollama';
  const isLocalReady = status.status === 'ready' || Boolean(status.serverRunning && status.modelInstalled);
  const isReady = isCloud ? Boolean(getActiveApiKey()) : isLocalReady;
  const modelLabel = isCloud ? getCloudModel(aiProvider) || aiProvider.toUpperCase() : status.model || 'local model';
  const providerLabel = PROVIDER_LABELS[aiProvider] || aiProvider;
  const statusText = status.loading
    ? 'Checking AI model…'
    : isReady
      ? `${modelLabel} · ready${isCloud ? ' (cloud)' : ' (offline)'}`
      : isCloud
        ? `${modelLabel} · add your ${providerLabel} API key in Settings`
        : `${modelLabel} · ${LOCAL_STATUS_TEXT[status.status] || status.error || status.message || 'not ready — open Settings'}`;

  const sessionThreads = Object.entries(allConversations)
    .filter(([id, msgs]) => Array.isArray(msgs) && msgs.length > 1)
    .map(([id, msgs]) => {
      let title = id;
      for (const mod of curriculum) {
        const match = mod.lessons.find((l) => l.id === id);
        if (match) {
          title = match.title;
          break;
        }
      }
      const firstUserMsg = msgs.find((m) => m.role === 'user')?.content || 'Conversation';
      return { id, title, preview: firstUserMsg, messageCount: msgs.length };
    });

  const content = (
    <>
      <div className="mentor-panel-header">
        <div className="mentor-panel-heading">
          <TutorAvatar size={38} isSpeaking={isSending} />
          <div>
            <div className="mentor-panel-eyebrow">
              {/* Names the model instead of the old permanent "Offline" tag. */}
              AI Tutor • {modelLabel}
            </div>
            <h2>{mentorName || 'ReactLab Mentor'}</h2>
          </div>
        </div>

        <div className="mentor-panel-header-actions">
          <button
            type="button"
            className="mentor-icon-button"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            title="Session Chat History"
            aria-label="Session History"
            style={{ color: isHistoryOpen ? 'var(--accent-primary, #d97757)' : undefined }}
          >
            <History size={16} />
          </button>
          {!isDetached ? (
            <button
              type="button"
              className="mentor-icon-button"
              onClick={handlePopOut}
              title="Pop out into a separate window"
              aria-label="Pop out into a separate window"
            >
              <ExternalLink size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="mentor-icon-button"
              onClick={() => {
                if (window.electronAPI?.window?.close) {
                  window.electronAPI.window.close();
                } else {
                  window.close();
                }
              }}
              title="Dock back into main window"
              aria-label="Dock back"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                width: 'auto',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--accent-primary, #d97757)',
                backgroundColor: 'rgba(217, 119, 87, 0.1)',
                border: '1px solid rgba(217, 119, 87, 0.3)',
                borderRadius: '6px',
              }}
            >
              <ExternalLink size={13} style={{ transform: 'rotate(180deg)' }} />
              <span>Dock back</span>
            </button>
          )}
          <button type="button" className="mentor-icon-button" onClick={openSettings} title="AI Settings & API Keys" aria-label="Settings">
            <Settings size={16} />
          </button>
          <button type="button" className="mentor-icon-button" onClick={resetConversation} title="Reset conversation" aria-label="Reset conversation">
            <RefreshCw size={16} />
          </button>
          {onClose && (
            <button type="button" className="mentor-icon-button" onClick={onClose} title="Close mentor (Esc)" aria-label="Close mentor">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className={`mentor-status${isReady ? ' is-ready' : ''}`} role="status">
        <span className="mentor-status-dot" />
        {statusText}
      </div>

      <div style={{ position: 'relative', flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Session History Sidebar Drawer */}
        <AnimatePresence>
          {isHistoryOpen && (
            <motion.aside
              initial={{ x: -260, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -260, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                width: '260px',
                backgroundColor: '#12110f',
                borderRight: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 10,
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                boxShadow: '4px 0 20px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f5f5f4', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <History size={14} color="var(--accent-primary, #d97757)" />
                  <span>Session History</span>
                </div>
                {sessionThreads.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllMentorSessions}
                    title="Clear all session conversations"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#78716c',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                {sessionThreads.length === 0 ? (
                  <div style={{ fontSize: '0.72rem', color: '#78716c', padding: '16px 8px', textAlign: 'center', lineHeight: 1.5 }}>
                    No conversations in this session yet. Ask a question to start a thread!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {sessionThreads.map((thread) => {
                      const isActive = (thread.id === lessonId);
                      return (
                        <button
                          key={thread.id}
                          type="button"
                          onClick={() => handleSelectSessionThread(thread.id)}
                          style={{
                            textAlign: 'left',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            backgroundColor: isActive ? 'rgba(217, 119, 87, 0.15)' : 'transparent',
                            border: isActive ? '1px solid rgba(217, 119, 87, 0.3)' : '1px solid transparent',
                            color: isActive ? '#f5f5f4' : '#a8a29e',
                            cursor: 'pointer',
                            transition: 'all 0.12s ease',
                          }}
                        >
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {thread.title}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#78716c', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {thread.preview}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="mentor-messages" style={{ flex: 1 }}>
          {messages.filter((m) => m.content || isSending).map((message, index) => {
            const isAssistant = message.role === 'assistant';
            const isLastAssistant = isAssistant && index === messages.length - 1;
            const showThinking = isSending && isLastAssistant && !message.content;
            return (
              <div key={`${message.role}-${index}`} className={`mentor-message mentor-message-${message.role}`}>
                <div className="mentor-message-role">
                  {isAssistant && <TutorAvatar size={22} isSpeaking={showThinking} />}
                  <span>{isAssistant ? (mentorName || 'ReactLab Mentor') : 'You'}</span>
                </div>
                <div className={`mentor-message-content${showThinking ? ' mentor-thinking' : ''}`}>
                  {showThinking ? (
                    `${isCloud ? `Consulting ${aiProvider.toUpperCase()}…` : 'Thinking locally…'}`
                  ) : isAssistant ? (
                    <div className="mentor-markdown-body">
                      <ReactMarkdown
                        components={markdownComponents}
                      >
                        {typeof message.content === 'string' ? message.content : ''}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form className="mentor-composer" onSubmit={submit}>
        <textarea
          ref={inputRef}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="Ask a question about this code or concept… (Enter to send, Shift+Enter for newline)"
          rows={3}
          disabled={isSending}
        />
        <div className="mentor-composer-footer">
          <span className="mentor-composer-tip">Press <strong>Enter</strong> to ask, <strong>Shift+Enter</strong> for newline</span>
          <button type="submit" className="mentor-send-button" disabled={!question.trim() || isSending}>
            <Send size={15} />
            Ask mentor
          </button>
        </div>
      </form>
    </>
  );

  if (isDetached || isInline) {
    return (
      <div className={`mentor-panel${isInline ? ' is-inline-panel' : ' is-detached'}`}>
        {content}
      </div>
    );
  }

  return (
    <div
      className="mentor-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="ReactLab AI Mentor"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '840px',
          height: 'min(780px, 84vh)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#161513',
          border: '1px solid rgba(217, 119, 87, 0.35)',
          borderRadius: '16px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75)',
          overflow: 'hidden',
        }}
      >
        {content}
      </motion.div>
    </div>
  );
}

class MentorErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Mentor Panel Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="mentor-modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={this.props.onClose}
        >
          <div
            style={{
              padding: '24px',
              backgroundColor: '#1c1b18',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              color: '#f5f5f4',
              maxWidth: '480px',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: 'var(--accent-primary)', marginBottom: '8px' }}>AI Mentor encountered an error</h3>
            <p style={{ color: '#a8a29e', fontSize: '0.88rem', marginBottom: '16px' }}>
              {this.state.error?.message || 'A rendering error occurred.'}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="ui-btn-primary"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Retry
              </button>
              <button
                type="button"
                className="ui-btn-ghost"
                onClick={this.props.onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function MentorPanel(props) {
  return (
    <MentorErrorBoundary onClose={props.onClose}>
      <MentorPanelInner {...props} />
    </MentorErrorBoundary>
  );
}
