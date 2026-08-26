import { useState } from 'react';
import { Sparkles, Key, CheckCircle2, Zap, Shield, HardDriveDownload, ExternalLink } from 'lucide-react';
import useUIStore from '../../store/useUIStore';
import OllamaSettings from './OllamaSettings';

const PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    tagline: 'Recommended • Fast & Free tier',
    model: 'gemini-3.6-flash',
    icon: Sparkles,
    badge: 'Blazing Fast (500ms)',
    getKeyUrl: 'https://aistudio.google.com/app/apikey',
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    tagline: 'Ultra-fast Llama 3.3 70B',
    model: 'llama-3.3-70b-versatile',
    icon: Zap,
    badge: 'Ultra Fast',
    getKeyUrl: 'https://console.groq.com/keys',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    tagline: 'GPT-4o Mini',
    model: 'gpt-4o-mini',
    icon: Shield,
    badge: 'High Accuracy',
    getKeyUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'ollama',
    name: 'Offline Ollama',
    tagline: '100% Private local model',
    model: 'qwen2.5-coder:3b',
    icon: HardDriveDownload,
    badge: 'Offline',
  },
];

export default function AIMentorSettings() {
  const {
    mentorName,
    setMentorName,
    aiProvider,
    setAiProvider,
    geminiApiKey,
    setGeminiApiKey,
    groqApiKey,
    setGroqApiKey,
    openAiApiKey,
    setOpenAiApiKey,
  } = useUIStore();

  const [savedToast, setSavedToast] = useState(false);

  const handleKeyChange = (provider, value) => {
    if (provider === 'gemini') setGeminiApiKey(value);
    if (provider === 'groq') setGroqApiKey(value);
    if (provider === 'openai') setOpenAiApiKey(value);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const getApiKeyForProvider = (provider) => {
    if (provider === 'gemini') return geminiApiKey;
    if (provider === 'groq') return groqApiKey;
    if (provider === 'openai') return openAiApiKey;
    return '';
  };

  const currentProvider = PROVIDERS.find((p) => p.id === aiProvider) || PROVIDERS[0];
  const activeKey = getApiKeyForProvider(aiProvider);

  return (
    <section style={{
      backgroundColor: '#12110f',
      borderRadius: '14px',
      padding: '18px 20px',
      border: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 600, color: '#f5f5f4' }}>
            <Sparkles size={17} color="var(--accent-primary, #d97757)" />
            <span>AI Mentor Settings</span>
            <span style={{
              fontSize: '0.65rem',
              backgroundColor: 'rgba(217, 119, 87, 0.15)',
              color: 'var(--accent-primary, #d97757)',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid rgba(217, 119, 87, 0.3)',
            }}>
              {currentProvider.badge}
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#a8a29e', marginTop: '5px', lineHeight: 1.5 }}>
            Personalize your AI coding mentor and choose how it answers your questions.
          </div>
        </div>
      </div>

      {/* AI Mentor Custom Name */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '14px',
        borderRadius: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#d6d3d1', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>AI Mentor Name / Persona</span>
          </label>
          {mentorName !== 'ReactLab Mentor' && (
            <button
              type="button"
              onClick={() => setMentorName('ReactLab Mentor')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-primary, #d97757)',
                fontSize: '0.72rem',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Reset to default
            </button>
          )}
        </div>
        <input
          type="text"
          value={mentorName || 'ReactLab Mentor'}
          onChange={(e) => setMentorName(e.target.value)}
          placeholder="e.g. ReactLab Mentor, Sonia, Ada..."
          maxLength={40}
          style={{
            width: '100%',
            backgroundColor: '#0a0a0a',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '0.82rem',
            color: '#f5f5f4',
            outline: 'none',
          }}
        />
        <div style={{ fontSize: '0.7rem', color: '#78716c' }}>
          This name appears above chat replies and header prompts.
        </div>
      </div>

      {/* Provider Selector Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
        {PROVIDERS.map((p) => {
          const isSelected = aiProvider === p.id;
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setAiProvider(p.id)}
              style={{
                backgroundColor: isSelected ? 'rgba(217, 119, 87, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                border: isSelected ? '1px solid var(--accent-primary, #d97757)' : '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '10px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: isSelected ? 'rgba(217, 119, 87, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isSelected ? 'var(--accent-primary, #d97757)' : '#a8a29e',
                flexShrink: 0,
              }}>
                <Icon size={16} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: isSelected ? '#f5f5f4' : '#d6d3d1' }}>
                  {p.name}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#78716c', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {p.tagline}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Cloud API Key Input for Gemini / Groq / OpenAI */}
      {aiProvider !== 'ollama' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '14px',
          borderRadius: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#d6d3d1', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key size={13} color="var(--accent-primary, #d97757)" />
              {currentProvider.name} API Key
            </label>
            {currentProvider.getKeyUrl && (
              <a
                href={currentProvider.getKeyUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--accent-primary, #d97757)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Get free key <ExternalLink size={11} />
              </a>
            )}
          </div>

          <input
            type="password"
            value={activeKey}
            onChange={(e) => handleKeyChange(aiProvider, e.target.value)}
            placeholder={`Paste your ${currentProvider.name} API key here (e.g. AIzaSy...)`}
            style={{
              width: '100%',
              backgroundColor: '#0a0a0a',
              border: activeKey ? '1px solid rgba(120, 140, 93, 0.4)' : '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.8rem',
              color: '#f5f5f4',
              fontFamily: 'monospace',
              outline: 'none',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem' }}>
            <span style={{ color: activeKey ? 'var(--success, #788c5d)' : '#78716c', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {activeKey ? <CheckCircle2 size={12} /> : null}
              {activeKey ? 'API Key saved securely in local browser storage' : 'Keys are stored locally on your device and never shared.'}
            </span>
            {savedToast && <span style={{ color: 'var(--accent-primary, #d97757)' }}>Saved!</span>}
          </div>
        </div>
      )}

      {/* Offline Ollama Manager */}
      {aiProvider === 'ollama' && (
        <OllamaSettings />
      )}

      {/* Mentor Persona & Custom System Prompt Instructions */}
      <MentorPersonaSection />
    </section>
  );
}

const PERSONA_PRESETS = [
  {
    id: 'default',
    title: 'Balanced Master Tutor',
    tagline: 'Default • React 19 Socratic + Hint-first',
    prompt: `You are ReactLab Mentor, a friendly, concise, and expert JavaScript & React coding tutor.

Communication Rules:
1. GREETINGS & CASUAL INPUTS: If the learner says "hello", "hi", "hey", "wait", "ok", or makes casual remarks, respond warmly and briefly in 1-2 friendly sentences (e.g. "Hello! How can I help you with this lesson?"). DO NOT dump lectures, unsolicited quiz questions, or huge code blocks unless the user actually asks a question.
2. DIRECT QUESTIONS: When the learner asks a specific question about JavaScript or React, give a direct, clear, and concise explanation (under 3-4 short paragraphs).
3. HINTS & CODE REVIEW: If they are stuck on a challenge or error, explain the mental model and give a focused hint first.
4. ACCURACY: Teach React 19.2 and modern JavaScript standards. Keep responses clean, natural, and directly relevant to what the learner asked.`,
  },
  {
    id: 'socratic',
    title: 'Strict Socratic',
    tagline: 'Guiding questions only • Never gives direct code solutions',
    prompt: `You are ReactLab Socratic Guide.
Your purpose is to help the learner discover the solution themselves through targeted inquiry.

Core Directives:
1. NEVER provide full solution code or direct copy-paste answers.
2. Ask one or two thought-provoking questions that guide the student to spot their own bug or missing concept.
3. If the student asks for the answer, gently reframe the problem into a smaller, simpler question.
4. Keep answers brief (under 120 words). Emphasize React 19 mental models and mechanics.`,
  },
  {
    id: 'terse',
    title: 'Terse & Direct',
    tagline: '1-2 sentences • Code snippets over prose',
    prompt: `You are ReactLab Terse Assistant.
You provide minimal, laser-focused technical assistance for experienced developers.

Core Directives:
1. Limit explanations to 1-2 sharp sentences maximum.
2. Provide concise, clean React 19 code snippets or diffs with no fluff or pleasantries.
3. Jump straight to the exact root cause of syntax or logic errors.`,
  },
  {
    id: 'conceptual',
    title: 'Deep Conceptualist',
    tagline: 'Explains internal runtimes & memory mental models first',
    prompt: `You are ReactLab Deep Conceptualist.
You teach React from first principles and runtime mechanics.

Core Directives:
1. Always explain the underlying mechanism first (e.g., Fiber reconciliation, JS closures, immutable references, snapshot rendering) before proposing a fix.
2. Use clear, rigorous mental models and call out why earlier workarounds existed vs. modern React 19 patterns.
3. After the conceptual breakdown, provide a focused hint for the lesson challenge.`,
  },
];

function MentorPersonaSection() {
  const { mentorPresetId, setMentorPresetId, mentorCustomPrompt, setMentorCustomPrompt } = useUIStore();
  const [toast, setToast] = useState(false);

  const activePreset = PERSONA_PRESETS.find((p) => p.id === mentorPresetId) || PERSONA_PRESETS[0];
  const effectivePrompt = mentorCustomPrompt || activePreset.prompt;

  const handleSelectPreset = (preset) => {
    setMentorPresetId(preset.id);
    setMentorCustomPrompt(preset.prompt);
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };

  const handlePromptChange = (value) => {
    setMentorCustomPrompt(value.slice(0, 4000));
  };

  const handleResetToPreset = () => {
    setMentorCustomPrompt(activePreset.prompt);
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '16px',
      borderRadius: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid var(--border-subtle)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f5f5f4', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="var(--accent-primary, #d97757)" />
            <span>Mentor Teaching Persona & System Prompt</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#a8a29e', marginTop: '2px' }}>
            Choose a starter persona or customize the exact instructions the AI mentor receives.
          </div>
        </div>
        {toast && (
          <span style={{ fontSize: '0.72rem', color: 'var(--success, #788c5d)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} /> Updated
          </span>
        )}
      </div>

      {/* Persona Presets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
        {PERSONA_PRESETS.map((preset) => {
          const isSelected = (mentorPresetId === preset.id);
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              style={{
                backgroundColor: isSelected ? 'rgba(217, 119, 87, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: isSelected ? '1px solid var(--accent-primary, #d97757)' : '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '10px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: isSelected ? '#f5f5f4' : '#d6d3d1' }}>
                {preset.title}
              </div>
              <div style={{ fontSize: '0.66rem', color: '#78716c', marginTop: '2px' }}>
                {preset.tagline}
              </div>
            </button>
          );
        })}
      </div>

      {/* System Prompt Textarea */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#a8a29e' }}>
            Active System Instructions ({effectivePrompt.length} / 4000 chars)
          </label>
          <button
            type="button"
            onClick={handleResetToPreset}
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-secondary, #a8a29e)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Reset to preset default
          </button>
        </div>
        <textarea
          value={effectivePrompt}
          onChange={(e) => handlePromptChange(e.target.value)}
          rows={6}
          placeholder="Enter custom mentor persona instructions..."
          style={{
            width: '100%',
            backgroundColor: '#0a0a0a',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '10px',
            fontSize: '0.75rem',
            color: '#f5f5f4',
            fontFamily: 'monospace',
            lineHeight: 1.4,
            resize: 'vertical',
            outline: 'none',
          }}
        />
        <div style={{ fontSize: '0.68rem', color: '#78716c', lineHeight: 1.4 }}>
          💡 <strong>Tip:</strong> Specify tone, concise response limits, and whether you prefer hints over complete solutions. Lesson context & code are injected automatically.
        </div>
      </div>
    </div>
  );
}
