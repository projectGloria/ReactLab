// v4 — 2026-08-18 — narrow Zustand subscriptions to required state slices
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, BrainCircuit, CheckCircle2, Clock3, RotateCcw, Sparkles, Mic, Square, Play, Pause, Trash2, Repeat, TrendingUp, CalendarDays, Zap } from 'lucide-react';
import useProgressStore from '../store/useProgressStore';
import curriculum from '../curriculum/index';
import { LEARNING_CHECKS } from '../curriculum/learningChecks';
import { validators } from '../curriculum/validators.js';
import SpeedDrillModal from '../components/review/SpeedDrillModal.jsx';

const flattenLessons = () => curriculum.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, moduleId: module.id, moduleTitle: module.title })));

function getReviewReason(state) {
  const learningChecks = Object.values(state?.learningChecks || {});
  if (state?.lastChallengeResult === 'failed') return 'Challenge needs another pass';
  if (state?.solutionViewed) return 'Review after using support';
  if (learningChecks.some((check) => check.correct === false)) return 'A learning check was missed';
  if (state?.nextReviewAt && new Date(state.nextReviewAt) <= new Date()) return 'Scheduled review is due';
  if (state?.challengeAttempts && !state?.lastReviewedAt) return 'Practice started, review not scheduled';
  return 'Recommended first review';
}

// Strips the trailing dynamic count, e.g. "Felt sure but missed it (2×)" -> "Felt sure but missed it",
// so the same underlying reason is recognized across reviews even as its count changes.
const normalizeReasonLabel = (label) => label.replace(/\s*\(.*\)\s*$/, '');

// Looks at the last few recorded reviews (state.reviewHistory, written by recordReview)
// and finds a reason that showed up in at least the two most recent ones — i.e. the same
// underlying issue (overconfidence, a specific missed check category, etc.) keeps
// resurfacing rather than being a one-off. Returns null when there's not enough history
// or nothing recurs.
function getRecurringReason(state) {
  const history = state?.reviewHistory || [];
  if (history.length < 2) return null;
  const recent = history.slice(-3);
  const counts = new Map();
  recent.forEach((entry) => {
    (entry.reasons || []).forEach((label) => {
      const key = normalizeReasonLabel(label);
      counts.set(key, (counts.get(key) || 0) + 1);
    });
  });
  let best = null;
  counts.forEach((count, label) => {
    if (count >= 2 && (!best || count > best.count)) best = { label, count };
  });
  return best;
}

function formatDate(date) {
  if (!date) return 'Not scheduled';
  const value = new Date(date);
  if (value <= new Date()) return 'Due now';
  return `Due ${value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

// Most lessons don't have a hand-written LEARNING_CHECKS entry. Rather than excluding
// them from review entirely, fall back to a free-recall prompt built from the lesson
// itself so practiced lessons are never invisible to the review queue.
//
// A single fixed prompt gets stale fast if the same lesson comes up for review many
// times (which is the point of spaced repetition — it will). These templates rotate
// deterministically by how many times the lesson has been reviewed, so repeat visits
// ask a genuinely different question instead of the exact same line forever.
const GENERIC_PROMPT_TEMPLATES = [
  (lesson) => `Without rereading it: what's the core idea behind "${lesson.title}", and what problem does it solve?`,
  (lesson) => `If you had to teach "${lesson.title}" to someone in two sentences, what would you say?`,
  (lesson) => `What's the most common mistake you'd expect someone to make with "${lesson.title}", and why does it happen?`,
  (lesson) => `Where in a real app would you actually reach for "${lesson.title}"? Describe a concrete scenario.`,
  (lesson) => `What would break, or work worse, if "${lesson.title}" didn't exist and you had to work around it?`,
];

function buildGenericCheck(lesson, reviewCount = 0) {
  const template = GENERIC_PROMPT_TEMPLATES[reviewCount % GENERIC_PROMPT_TEMPLATES.length];
  return {
    id: `${lesson.id}-generic-recall-${reviewCount % GENERIC_PROMPT_TEMPLATES.length}`,
    stage: 'free recall',
    type: 'text',
    prompt: template(lesson),
    feedback: "There's no single right phrasing here — the point is retrieving it from memory before checking, not matching exact wording. If it didn't come easily, that's useful signal: open the full lesson below.",
  };
}

// Lightweight keyword-coverage grading for free-text answers. This is not semantic
// grading — it checks whether the response actually touches the key terms the model
// answer relies on, which is enough to distinguish "explained the real mechanism" from
// "wrote something plausible-sounding but missed the point." Checks without a
// modelAnswer (e.g. the generic free-recall fallback) stay ungraded — correct: null —
// since there's no fixed answer to compare against, only self-rating applies there.
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'for', 'with', 'is', 'are',
  'was', 'were', 'be', 'been', 'that', 'this', 'it', 'its', 'as', 'by', 'from', 'so', 'than',
  'then', 'when', 'where', 'which', 'who', 'what', 'why', 'how', 'can', 'will', 'would',
  'should', 'could', 'into', 'not', 'no', 'if', 'because', 'their', 'they', 'you', 'your',
  'we', 'our', 'each', 'other', 'over', 'only', 'also', 'while', 'still', 'these', 'those',
]);

function extractKeyTerms(text) {
  const words = (text || '').toLowerCase().match(/[a-z][a-z-]{3,}/g) || [];
  return Array.from(new Set(words)).filter((w) => !STOPWORDS.has(w));
}

// A flat 0.35 threshold isn't fair across all model answers: a long, jargon-dense
// model answer makes 35% trivially easy to brush past by accident, while a short
// model answer (2-3 key terms) means missing just one term can tank you unfairly.
// Scale the bar with how many key terms there are to answer, while keeping it
// forgiving overall — this still isn't semantic grading, just a fairer version of
// the same keyword-coverage heuristic.
function coverageThreshold(keyTermCount) {
  if (keyTermCount <= 3) return 1 / keyTermCount; // one hit is enough when there's little to hit
  if (keyTermCount <= 6) return 0.34;
  return 0.28; // long model answers: don't require covering nearly all of it
}

function gradeTextResponse(response, modelAnswer) {
  const keyTerms = extractKeyTerms(modelAnswer);
  if (keyTerms.length === 0) return null;
  const responseLower = response.toLowerCase();
  const matched = keyTerms.filter((term) => responseLower.includes(term));
  const coverage = matched.length / keyTerms.length;
  return { correct: coverage >= coverageThreshold(keyTerms.length), coverage };
}

// "Recall it in code" grading: instead of English keywords, the signal is
// whether the learner's from-memory code actually reaches for the same
// hooks and components the real solution does — and, where the lesson has
// one, whether it satisfies the same structural rules used to grade the
// live Challenge (validators.js), not just whether the right names appear
// anywhere. This is not a diff and doesn't care about exact syntax,
// variable names, or formatting.
function extractCodeSignals(code) {
  const hooks = code.match(/\buse[A-Z]\w*/g) || [];
  const components = (code.match(/<([A-Z]\w*)/g) || []).map((m) => m.slice(1));
  return Array.from(new Set([...hooks, ...components]));
}

function gradeCodeResponse(response, lesson) {
  const config = validators[lesson.id];
  const rules = Array.isArray(config) ? config : config?.rules;

  // Prefer the lesson's own hand-written structural checks when available —
  // same rules ChallengeModal grades the live playground against, so this
  // catches "used the right hook but wired it up wrong" (e.g. useEffect
  // called but without the empty dependency array), not just "typed the
  // right hook name somewhere". Falls back to generic signal-matching for
  // lessons without a validators entry (or a requiresObservation-only entry
  // with no automated rules — that flag exists for challenges that need a
  // human to confirm something in the console/DOM, which a from-memory text
  // answer can't satisfy either way).
  if (Array.isArray(rules) && rules.length > 0) {
    const filesForRules = { '/App.jsx': { code: response } };
    const passed = rules.filter((rule) => {
      try {
        return rule.test(response, filesForRules);
      } catch {
        return false;
      }
    });
    const coverage = passed.length / rules.length;
    // Unlike the generic signal-matching fallback below, these rules are the
    // same small, curated checklist the live Challenge requires 100% of to
    // mark a lesson complete (see CodeActions.jsx) — each one encodes a
    // specific necessary fact (e.g. "the dependency array must be empty",
    // not just "useEffect was called"). Awarding "correct" on partial
    // coverage here would silently pass exactly the wiring mistakes this
    // mode exists to catch, so — unlike the prose/generic-signal grading
    // elsewhere in this file — there's no partial-credit threshold: every
    // rule must pass.
    return {
      correct: passed.length === rules.length,
      coverage,
      failedMessages: rules.filter((r) => !passed.includes(r)).map((r) => r.message),
      source: 'validators',
    };
  }

  if (typeof lesson.solutionCode !== 'string') return null;
  const signals = extractCodeSignals(lesson.solutionCode);
  if (signals.length === 0) return null;
  const matched = signals.filter((signal) => response.includes(signal));
  const coverage = matched.length / signals.length;
  // Lower bar than text grading (0.5 vs ~0.3) since these signals are precise
  // API names, not loosely-related keywords — missing half of them usually
  // means a genuinely different (or incomplete) approach, not just different phrasing.
  return { correct: coverage >= 0.5, coverage, signals, matched, source: 'signals' };
}

const CONFIDENCE_OPTIONS = [
  { value: 'low', label: 'Not sure', points: 1 },
  { value: 'medium', label: 'Fairly sure', points: 2 },
  { value: 'high', label: 'Confident', points: 3 },
];

// Records a short spoken answer via MediaRecorder. When the browser supports
// SpeechRecognition (Chrome/Edge), we also run a live transcription pass so the
// spoken answer can be keyword-graded exactly like a typed one, instead of being
// an ungraded black box that only feeds the self-rating step. Recording still
// works without transcription support — it just falls back to the old
// record-only behavior (graded: null, self-rating only).
function VoiceRecall({ onRecorded, disabled }) {
  const [status, setStatus] = useState('idle'); // idle | recording | recorded | unsupported | denied
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioElRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');

  const SpeechRecognitionImpl = typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null;

  useEffect(() => {
    if (typeof window !== 'undefined' && (!navigator.mediaDevices || !window.MediaRecorder)) {
      setStatus('unsupported');
    }
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      recognitionRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      transcriptRef.current = '';
      setTranscript('');
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setStatus('recorded');
        onRecorded({ hasAudio: true, transcript: transcriptRef.current.trim() || null });
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus('recording');

      if (SpeechRecognitionImpl) {
        const recognition = new SpeechRecognitionImpl();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.onresult = (event) => {
          let finalText = '';
          for (let i = event.resultIndex; i < event.results.length; i += 1) {
            if (event.results[i].isFinal) finalText += event.results[i][0].transcript;
          }
          if (finalText) {
            transcriptRef.current = `${transcriptRef.current} ${finalText}`.trim();
            setTranscript(transcriptRef.current);
          }
        };
        // Transcription is a nice-to-have layered on top of recording — if it errors
        // out mid-session (network hiccup, permissions edge case), just let the
        // recording continue and fall back to ungraded, same as browsers without
        // SpeechRecognition support at all.
        recognition.onerror = () => {};
        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch {
      setStatus('denied');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop();
  };

  const reRecord = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setIsPlaying(false);
    setTranscript('');
    transcriptRef.current = '';
    setStatus('idle');
    onRecorded(null);
  };

  const togglePlayback = () => {
    if (!audioElRef.current) return;
    if (isPlaying) audioElRef.current.pause();
    else audioElRef.current.play();
  };

  if (status === 'unsupported') return null; // silently fall back to typing only

  return (
    <div style={{ marginTop: 15, border: '1px dashed var(--border-subtle)', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {status === 'idle' && (
          <button type="button" onClick={startRecording} disabled={disabled} className="ui-btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Mic size={15} /> Explain it out loud instead
          </button>
        )}
        {status === 'denied' && (
          <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Microphone access was denied — type your answer instead.</span>
        )}
        {status === 'recording' && (
          <button type="button" onClick={stopRecording} className="ui-btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8, borderColor: 'var(--error)', color: 'var(--error)' }}>
            <Square size={13} fill="currentColor" /> Recording… tap to stop
          </button>
        )}
        {status === 'recorded' && (
          <>
            <audio ref={audioElRef} src={audioUrl} onEnded={() => setIsPlaying(false)} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
            <button type="button" onClick={togglePlayback} className="ui-btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isPlaying ? <Pause size={14} /> : <Play size={14} />} {isPlaying ? 'Playing…' : 'Play back your answer'}
            </button>
            {!disabled && (
              <button type="button" onClick={reRecord} title="Re-record" style={{ border: 0, background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Trash2 size={14} />
              </button>
            )}
          </>
        )}
      </div>
      {status === 'recording' && SpeechRecognitionImpl && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          {transcript || 'Listening…'}
        </div>
      )}
      {status === 'recorded' && (
        transcript
          ? <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}><strong style={{ color: 'var(--text-muted)' }}>Transcribed: </strong>{transcript}</div>
          : <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{SpeechRecognitionImpl ? "Couldn't make out a transcript — this answer will be self-rated only, not keyword-graded." : "Your browser can't transcribe speech, so this answer will be self-rated only, not keyword-graded."}</div>
      )}
    </div>
  );
}

function ReviewPrompt({ lesson, check, onRate }) {
  const [selected, setSelected] = useState(null);
  const [response, setResponse] = useState('');
  const [confidence, setConfidence] = useState(null);
  const [voiceAnswer, setVoiceAnswer] = useState(null); // null | { hasAudio, transcript }
  const [result, setResult] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [rated, setRated] = useState(false);
  const recordLearningCheck = useProgressStore((state) => state.recordLearningCheck);
  const hasVoiceAnswer = Boolean(voiceAnswer?.hasAudio);
  const voiceTranscript = voiceAnswer?.transcript || '';
  // "Recall it in code" is only offered on lessons with a single-file string
  // solutionCode — the multi-file object shape (routing/testing lessons)
  // doesn't have one blob to extract API signals from.
  const canRecallInCode = check.type === 'text' && typeof lesson.solutionCode === 'string' && lesson.solutionCode.trim().length > 0;
  const [answerMode, setAnswerMode] = useState('text'); // 'text' | 'code'
  const inCodeMode = canRecallInCode && answerMode === 'code';

  const submit = () => {
    if (!confidence) return;
    if (check.type === 'choice' && selected === null) return;
    if (check.type === 'text' && response.trim().length < 12 && !hasVoiceAnswer) return;

    let correct = null;
    let coverage = null;
    if (check.type === 'choice') {
      correct = selected === String(check.answer);
    } else if (inCodeMode) {
      const graded = gradeCodeResponse(response, lesson);
      if (graded) {
        correct = graded.correct;
        coverage = graded.coverage;
      }
    } else if (check.modelAnswer) {
      // A transcribed voice answer is graded exactly like typed text. Only when
      // there's no transcript (unsupported browser, or the recognizer didn't catch
      // anything) does it fall through to ungraded (correct: null), relying on
      // self-rating alone.
      const textToGrade = hasVoiceAnswer ? voiceTranscript : response;
      if (textToGrade) {
        const graded = gradeTextResponse(textToGrade, check.modelAnswer);
        if (graded) {
          correct = graded.correct;
          coverage = graded.coverage;
        }
      }
    }

    const confidencePoints = CONFIDENCE_OPTIONS.find((c) => c.value === confidence)?.points || 2;
    const overconfident = correct === false && confidencePoints >= 2;

    const payload = {
      correct,
      coverage,
      response: check.type === 'choice' ? selected : hasVoiceAnswer ? (voiceTranscript || '(answered by voice, not transcribed)') : response.trim(),
      confidence,
      overconfident,
    };
    setResult(payload);
    setShowAnswer(true);
    recordLearningCheck(lesson.id, check.id, payload);
  };

  const rate = (rating) => {
    setRated(true);
    onRate(rating);
  };

  return (
    <div className="ui-card" style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ color: 'var(--accent-primary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>{check.stage}</div>
          <h3 style={{ margin: '6px 0 0', fontSize: 20 }}>{check.prompt}</h3>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{lesson.title}</span>
      </div>
      {check.code && <pre style={{ whiteSpace: 'pre-wrap', padding: 14, borderRadius: 10, background: 'var(--bg-code)', color: 'var(--text-primary)', overflowX: 'auto', fontSize: 13 }}>{check.code}</pre>}
      {check.type === 'choice' ? (
        <div style={{ display: 'grid', gap: 9, marginTop: 15 }}>
          {check.options.map((option, index) => {
            const value = String(index);
            const isChosen = selected === value;
            const isCorrect = showAnswer && value === String(check.answer);
            return <button key={option} type="button" onClick={() => !result && setSelected(value)} style={{ textAlign: 'left', padding: '12px 14px', borderRadius: 10, border: `1px solid ${isCorrect ? 'var(--success)' : isChosen ? 'var(--accent-primary)' : 'var(--border-subtle)'}`, background: isCorrect ? 'rgba(120,140,93,0.12)' : isChosen ? 'var(--accent-glow)' : 'transparent', color: 'var(--text-primary)', cursor: result ? 'default' : 'pointer' }}><strong style={{ marginRight: 9 }}>{String.fromCharCode(65 + index)}.</strong>{option}</button>;
          })}
        </div>
      ) : (
        <>
          {canRecallInCode && !result && (
            <div style={{ display: 'flex', gap: 8, marginTop: 15 }}>
              <button type="button" onClick={() => setAnswerMode('text')} className={answerMode === 'text' ? 'ui-btn-primary' : 'ui-btn-ghost'} style={{ fontSize: 12.5, padding: '6px 12px' }}>Explain in words</button>
              <button type="button" onClick={() => setAnswerMode('code')} className={answerMode === 'code' ? 'ui-btn-primary' : 'ui-btn-ghost'} style={{ fontSize: 12.5, padding: '6px 12px' }}>Recreate it in code</button>
            </div>
          )}
          <textarea
            value={response}
            onChange={(event) => { setResponse(event.target.value); if (hasVoiceAnswer) setVoiceAnswer(null); }}
            disabled={Boolean(result) || hasVoiceAnswer}
            placeholder={inCodeMode ? "Recreate the pattern from memory — doesn't need to be exact, we're checking for the right hooks/components..." : 'Explain your reasoning in your own words...'}
            rows={inCodeMode ? 7 : 4}
            style={{
              width: '100%', marginTop: canRecallInCode ? 10 : 15, resize: 'vertical', boxSizing: 'border-box',
              borderRadius: 10, border: '1px solid var(--border-subtle)',
              background: hasVoiceAnswer ? 'var(--bg-hover)' : 'var(--bg-input)', color: 'var(--text-primary)',
              padding: 13, fontFamily: inCodeMode ? 'var(--font-mono, monospace)' : 'inherit',
              fontSize: inCodeMode ? 13 : undefined, opacity: hasVoiceAnswer ? 0.5 : 1,
            }}
          />
          {!result && !inCodeMode && <VoiceRecall onRecorded={setVoiceAnswer} disabled={Boolean(result)} />}
        </>
      )}
      {!result && (
        <div style={{ marginTop: 16 }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 8 }}>Before you check — how confident are you in that answer?</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginBottom: 14 }}>
            {CONFIDENCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setConfidence(option.value)}
                style={{
                  border: `1px solid ${confidence === option.value ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                  borderRadius: 9,
                  padding: '9px 6px',
                  background: confidence === option.value ? 'var(--accent-glow)' : 'transparent',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: 12.5,
                  fontWeight: 700,
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={!confidence || (check.type === 'text' && response.trim().length < 12 && !hasVoiceAnswer)}
            className="ui-btn-primary"
            title={!confidence ? 'Pick a confidence level first' : undefined}
          >
            Check my reasoning
          </button>
        </div>
      )}
      {result && <div style={{ marginTop: 16, borderRadius: 10, padding: 14, background: result.correct === false ? 'rgba(217,160,87,0.12)' : 'rgba(120,140,93,0.12)', border: `1px solid ${result.correct === false ? 'rgba(217,160,87,0.4)' : 'rgba(120,140,93,0.4)'}` }}>
        <strong>{result.correct === null ? 'Reasoning captured.' : result.correct ? (inCodeMode ? 'Reached for the right APIs.' : 'Covers the key idea.') : (inCodeMode ? "Doesn't quite match the pattern the solution uses." : 'Missing part of the key idea.')}</strong>
        {result.overconfident && (
          <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--warning)', fontWeight: 700 }}>
            ⚠ You felt {result.confidence === 'high' ? 'confident' : 'fairly sure'} but missed it — that gap is worth flagging for extra review.
          </div>
        )}
        <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{check.feedback}</p>
        {showAnswer && inCodeMode && (
          <div style={{ margin: '10px 0 0' }}>
            <strong>Solution:</strong>
            <pre style={{ whiteSpace: 'pre-wrap', marginTop: 6, padding: 12, borderRadius: 8, background: 'var(--bg-code)', color: 'var(--text-primary)', overflowX: 'auto', fontSize: 12.5 }}>{lesson.solutionCode}</pre>
          </div>
        )}
        {showAnswer && !inCodeMode && check.modelAnswer && <p style={{ margin: '10px 0 0', lineHeight: 1.6 }}><strong>Model answer: </strong>{check.modelAnswer}</p>}
      </div>}
      {result && !rated && (
        <div style={{ marginTop: 18 }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 8 }}>How well did that come back to you?</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
            {RATE_OPTIONS.map((option) => (
              <button key={option.value} type="button" onClick={() => rate(option.value)} style={{ border: '1px solid var(--border-subtle)', borderRadius: 9, padding: '10px 6px', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 13 }}>{option.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{option.hint}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      {rated && <div style={{ marginTop: 14, color: 'var(--accent-primary)', fontSize: 13, fontWeight: 700 }}>Scheduled — see you next time.</div>}
    </div>
  );
}

// Builds a 7-day (oldest → newest) review-count trail from lastReviewedAt
// timestamps already stored per lesson — no new tracking needed.
function buildActivityTrail(lessonState) {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    days.push({ date: day, count: 0 });
  }
  Object.values(lessonState || {}).forEach((state) => {
    if (!state?.lastReviewedAt) return;
    const reviewedDay = new Date(state.lastReviewedAt);
    reviewedDay.setHours(0, 0, 0, 0);
    const bucket = days.find((d) => d.date.getTime() === reviewedDay.getTime());
    if (bucket) bucket.count += 1;
  });
  return days;
}

function ActivityTrail({ lessonState }) {
  const days = useMemo(() => buildActivityTrail(lessonState), [lessonState]);
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <div className="ui-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 28 }}>
      <div style={{ marginRight: 8 }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Last 7 days</div>
        <div style={{ fontSize: 15, fontWeight: 800, marginTop: 2 }}>Review activity</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flex: 1, height: 46 }}>
        {days.map((day, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
            <div
              title={`${day.count} review${day.count === 1 ? '' : 's'} on ${day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
              style={{
                width: '100%',
                maxWidth: 26,
                height: `${Math.max(4, (day.count / max) * 34)}px`,
                borderRadius: 4,
                background: day.count > 0 ? 'var(--accent-primary)' : 'var(--bg-hover)',
                opacity: day.count > 0 ? 0.5 + 0.5 * (day.count / max) : 1,
              }}
            />
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{day.date.toLocaleDateString(undefined, { weekday: 'narrow' })}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Builds a 7-day (today → +6) forecast of how many completed lessons come due each
// day, from nextReviewAt across ALL lesson state — not just the current top-12 queue —
// so it reflects the real upcoming workload, not just what's already surfaced today.
function buildForecast(lessonState) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(today);
    day.setDate(day.getDate() + i);
    return { date: day, count: 0 };
  });
  let overdue = 0;
  Object.values(lessonState || {}).forEach((state) => {
    if (!state?.nextReviewAt) return;
    const due = new Date(state.nextReviewAt);
    const dueDay = new Date(due);
    dueDay.setHours(0, 0, 0, 0);
    if (dueDay < today) { overdue += 1; return; }
    const bucket = days.find((d) => d.date.getTime() === dueDay.getTime());
    if (bucket) bucket.count += 1;
  });
  return { days, overdue };
}

function ReviewForecast({ lessonState }) {
  const { days, overdue } = useMemo(() => buildForecast(lessonState), [lessonState]);
  const max = Math.max(1, overdue, ...days.map((d) => d.count));
  return (
    <div className="ui-card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <CalendarDays size={16} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: 15 }}>Next 7 days</h3>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 64 }}>
        {overdue > 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 10, color: 'var(--error)', fontWeight: 800 }}>{overdue}</span>
            <div title={`${overdue} overdue`} style={{ width: '100%', maxWidth: 22, height: `${Math.max(4, (overdue / max) * 40)}px`, borderRadius: 4, background: 'var(--error)' }} />
            <span style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>Now</span>
          </div>
        )}
        {days.map((day, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
            {day.count > 0 && <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 700 }}>{day.count}</span>}
            <div
              title={`${day.count} due ${day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
              style={{ width: '100%', maxWidth: 22, height: `${Math.max(4, (day.count / max) * 40)}px`, borderRadius: 4, background: day.count > 0 ? 'var(--accent-primary)' : 'var(--bg-hover)' }}
            />
            <span style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>{i === 0 ? 'Today' : day.date.toLocaleDateString(undefined, { weekday: 'narrow' })}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Buckets the append-only calibrationLog (confidence at answer-time vs. whether the
// answer was actually correct) by confidence level, to show whether "confident" answers
// are actually more often right than "not sure" ones — i.e. whether self-assessment is
// well-calibrated, a meta-skill distinct from content mastery.
function buildCalibration(calibrationLog) {
  const buckets = { low: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, high: { correct: 0, total: 0 } };
  (calibrationLog || []).forEach((entry) => {
    const bucket = buckets[entry.confidence];
    if (!bucket) return;
    bucket.total += 1;
    if (entry.correct) bucket.correct += 1;
  });
  return buckets;
}

function CalibrationChart({ calibrationLog }) {
  const buckets = useMemo(() => buildCalibration(calibrationLog), [calibrationLog]);
  const totalAnswers = CONFIDENCE_OPTIONS.reduce((sum, opt) => sum + buckets[opt.value].total, 0);
  if (totalAnswers < 4) return null; // not enough graded answers yet to say anything meaningful
  return (
    <div className="ui-card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <TrendingUp size={16} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: 15 }}>Confidence calibration</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {CONFIDENCE_OPTIONS.map((option) => {
          const bucket = buckets[option.value];
          const accuracy = bucket.total > 0 ? Math.round((bucket.correct / bucket.total) * 100) : null;
          return (
            <div key={option.value}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{option.label}</span>
                <span style={{ color: 'var(--text-muted)' }}>{accuracy === null ? 'No data' : `${accuracy}% correct (${bucket.total})`}</span>
              </div>
              <div style={{ height: 7, borderRadius: 4, background: 'var(--bg-hover)', overflow: 'hidden' }}>
                {accuracy !== null && (
                  <div style={{ height: '100%', width: `${accuracy}%`, borderRadius: 4, background: accuracy >= 70 ? 'var(--success)' : accuracy >= 40 ? 'var(--warning)' : 'var(--error)' }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p style={{ margin: '14px 0 0', fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
        Well-calibrated looks like "Confident" scoring noticeably higher than "Not sure." If they're close together, your gut sense of what you know isn't tracking reality yet.
      </p>
    </div>
  );
}

export default function ReviewDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const moduleFilter = searchParams.get('module');
  const lessonState = useProgressStore((state) => state.lessonState);
  const recordReview = useProgressStore((state) => state.recordReview);
  const calibrationLog = useProgressStore((state) => state.calibrationLog);
  const [activeIndex, setActiveIndex] = useState(0);
  const lessons = useMemo(() => flattenLessons(), []);
  // "Reviewed this session" is derived from lessonState.lastReviewedAt (persisted
  // in the store) rather than local component state, so the dimmed queue styling
  // survives navigating away from Review Lab and back, not just this mount.
  const [sessionStartedAt] = useState(() => new Date().toISOString());
  const reviewedIds = useMemo(() => {
    const ids = new Set();
    Object.entries(lessonState || {}).forEach(([lessonId, state]) => {
      if (state?.lastReviewedAt && state.lastReviewedAt >= sessionStartedAt) ids.add(lessonId);
    });
    return ids;
  }, [lessonState, sessionStartedAt]);

  const queue = useMemo(() => {
    // Eligibility now requires the lesson to actually be marked complete — Review Lab
    // should only quiz you on material you've finished, not anything you've merely
    // clicked into (opened a challenge, peeked at a solution). Partial interaction no
    // longer counts.
    const candidates = lessons.filter((lesson) => {
      const state = lessonState?.[lesson.id];
      if (moduleFilter && lesson.moduleId !== moduleFilter) return false;
      return Boolean(state?.status === 'complete');
    });
    const scored = candidates.map((lesson) => {
      const state = lessonState?.[lesson.id] || {};
      const checks = Object.values(state.learningChecks || {});
      const missed = checks.filter((check) => check.correct === false).length;
      const overconfident = checks.filter((check) => check.overconfident).length;
      const due = state.nextReviewAt && new Date(state.nextReviewAt) <= new Date();
      // Kept as separate labeled terms (not just a summed number) so the queue
      // order can be explained to a curious learner via priorityBreakdown below,
      // rather than being an opaque score.
      const priorityBreakdown = [
        due && { label: 'Scheduled review due', points: 100 },
        state.lastChallengeResult === 'failed' && { label: 'Last challenge failed', points: 45 },
        overconfident > 0 && { label: `Felt sure but missed it (${overconfident}×)`, points: overconfident * 30 },
        state.solutionViewed && { label: 'Used the solution', points: 25 },
        missed > 0 && { label: `${missed} learning check${missed > 1 ? 's' : ''} missed`, points: missed * 15 },
        state.challengeAttempts && { label: 'Practice attempted', points: 10 },
      ].filter(Boolean);
      const priority = priorityBreakdown.reduce((sum, item) => sum + item.points, 0);
      return { lesson, state, priority, priorityBreakdown, reason: getReviewReason(state), recurring: getRecurringReason(state) };
    });
    return scored.sort((a, b) => b.priority - a.priority || a.lesson.title.localeCompare(b.lesson.title)).slice(0, 12);
  }, [lessons, lessonState, moduleFilter]);

  const filteredModuleTitle = moduleFilter ? curriculum.find((m) => m.id === moduleFilter)?.title : null;
  const active = queue[Math.min(activeIndex, Math.max(queue.length - 1, 0))];
  const activeChecks = active ? (LEARNING_CHECKS[active.lesson.id]?.length ? LEARNING_CHECKS[active.lesson.id] : [buildGenericCheck(active.lesson, active.state.reviewCount || 0)]) : [];
  // Cycle through a lesson's staged checks (predict/explain/transfer) across successive
  // reviews instead of always showing the first one — otherwise stages 2 and 3 are
  // never seen, no matter how many times the lesson comes up for review.
  const activeCheck = active ? activeChecks[(active.state.reviewCount || 0) % activeChecks.length] : undefined;
  const dueCount = queue.filter((item) => item.state.nextReviewAt && new Date(item.state.nextReviewAt) <= new Date()).length;
  const reviewedCount = Object.values(lessonState || {}).filter((state) => state.lastReviewedAt).length;
  const masteredCount = Object.values(lessonState || {}).filter((state) => ['good', 'easy'].includes(state.lastReviewRating)).length;

  const rateReview = (lessonId, rating) => {
    const item = queue.find((q) => q.lesson.id === lessonId);
    recordReview(lessonId, rating, item ? item.priorityBreakdown.map((p) => p.label) : []);
  };

  const moveNext = () => setActiveIndex((index) => Math.min(index + 1, Math.max(queue.length - 1, 0)));

  const [isSpeedDrillOpen, setIsSpeedDrillOpen] = useState(false);

  return <main className="review-dashboard" style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 28px 72px', height: '100%', overflowY: 'auto' }}>
    <section className="review-dashboard-hero" style={{ display: 'flex', justifyContent: 'space-between', gap: 28, alignItems: 'flex-end', marginBottom: 28 }}>
      <div>
        <div style={{ color: 'var(--accent-primary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800 }}>Retrieval Lab</div>
        <h1 style={{ margin: '8px 0', fontSize: 'clamp(2rem, 5vw, 3.4rem)', letterSpacing: '-0.04em' }}>Review what your brain is trying to forget.</h1>
        <p style={{ maxWidth: 660, color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.7, margin: 0 }}>Short, targeted retrieval is more useful than rereading. Use this queue to revisit missed concepts, explain decisions in your own words, and return to the lesson only when you need another worked example.</p>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setIsSpeedDrillOpen(true)}
          className="ui-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', padding: '10px 18px', backgroundColor: 'var(--accent-primary, #d97757)', color: '#141413', fontWeight: 700 }}
        >
          <Zap size={16} fill="currentColor" />
          <span>Daily Speed Drill</span>
        </button>
        <button type="button" onClick={() => navigate('/')} className="ui-btn-ghost" style={{ whiteSpace: 'nowrap' }}>Back to curriculum</button>
      </div>
    </section>
    <SpeedDrillModal isOpen={isSpeedDrillOpen} onClose={() => setIsSpeedDrillOpen(false)} />
    {filteredModuleTitle && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '10px 16px', borderRadius: 10, border: '1px solid var(--accent-primary)', background: 'var(--accent-glow)', width: 'fit-content' }}>
        <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Filtered to <strong>{filteredModuleTitle}</strong></span>
        <button type="button" onClick={() => setSearchParams({})} style={{ border: 0, background: 'transparent', color: 'var(--accent-primary)', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 }}>Clear</button>
      </div>
    )}
    <section className="review-dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 28 }}>
      {[['Due now', dueCount, Clock3], ['In queue', queue.length, BrainCircuit], ['Reviewed', reviewedCount, CheckCircle2], ['Reinforced', masteredCount, Sparkles]].map(([label, value, Icon]) => <div key={label} className="ui-stat-tile"><Icon size={18} color="var(--accent-primary)" /><div className="ui-stat-value">{value}</div><div className="ui-stat-label">{label}</div></div>)}
    </section>
    <ActivityTrail lessonState={lessonState} />
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 20, marginBottom: 28 }}>
      <ReviewForecast lessonState={lessonState} />
      <CalibrationChart calibrationLog={calibrationLog} />
    </section>
    <section className="review-dashboard-content" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(260px, 0.8fr)', gap: 20, alignItems: 'start' }}>
      <div>{active && activeCheck ? <><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><div><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Review {activeIndex + 1} of {queue.length}</span><h2 style={{ margin: '4px 0 0', fontSize: 24 }}>{active.lesson.title}</h2></div><span
        style={{ color: 'var(--accent-primary)', fontSize: 13, fontWeight: 700, cursor: 'help' }}
        title={active.priorityBreakdown.length ? active.priorityBreakdown.map((item) => `${item.label} (+${item.points})`).join('\n') : undefined}
      >{active.reason}</span></div>{active.recurring && <div style={{ marginBottom: 10, fontSize: 12.5, color: 'var(--error)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><Repeat size={13} /> Recurring: "{active.recurring.label}" — came up in {active.recurring.count} of your last {Math.min(active.state.reviewHistory?.length || 0, 3)} reviews</div>}<ReviewPrompt key={`${active.lesson.id}-${activeCheck.id}`} lesson={active.lesson} check={activeCheck} onRate={(rating) => rateReview(active.lesson.id, rating)} /><div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 14 }}><button type="button" onClick={moveNext} disabled={activeIndex >= queue.length - 1} className="ui-btn-primary">Next review <ArrowRight size={15} style={{ verticalAlign: 'middle' }} /></button><Link to={`/lesson/${active.lesson.moduleId}/${active.lesson.id}`} style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Open full lesson</Link></div></> : <div className="ui-card" style={{ padding: 28 }}><h2>Start with the curriculum</h2><p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Mark a lesson complete and it will appear here for review.</p><Link to="/" style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>Choose a lesson <ArrowRight size={15} style={{ verticalAlign: 'middle' }} /></Link></div>}</div>
      <aside className="review-queue ui-card" style={{ padding: 18 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><h3 style={{ margin: 0 }}>Review queue</h3><RotateCcw size={17} color="var(--text-muted)" /></div>{queue.map((item, index) => <button
        key={item.lesson.id}
        type="button"
        onClick={() => setActiveIndex(index)}
        title={item.priorityBreakdown.length ? item.priorityBreakdown.map((p) => `${p.label} (+${p.points})`).join('\n') : undefined}
        style={{ display: 'block', width: '100%', textAlign: 'left', border: 0, borderTop: index === 0 ? 0 : '1px solid var(--border-subtle)', padding: '12px 0', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', opacity: reviewedIds.has(item.lesson.id) ? 0.55 : 1 }}
      ><div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><strong style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>{item.recurring && <Repeat size={11} color="var(--error)" title={`Recurring: ${item.recurring.label}`} />}{item.lesson.title}</strong><span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{formatDate(item.state.nextReviewAt)}</span></div><div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>{item.reason}</div></button>)}</aside>
    </section>
  </main>;
}
