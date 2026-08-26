import { useMemo, useState } from 'react';
import { Brain, CheckCircle2, ArrowRight, RotateCcw } from 'lucide-react';
import useProgressStore from '../../store/useProgressStore.js';
import { LEARNING_CHECKS } from '../../curriculum/learningChecks.js';

const stageLabels = {
  prediction: 'Predict',
  explain: 'Explain',
  transfer: 'Transfer',
};

function isOpenResponse(check) {
  return check.type === 'text';
}

function highlightInlineCode(code) {
  if (!code) return '';
  const tokenRegex = /(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(?:`(?:\\[\s\S]|[^`])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?:<\/?[\w$-]+|\/?>)|(?:\b(?:import|export|default|from|function|return|const|let|var|if|else|switch|case|break|for|while|do|try|catch|finally|throw|new|typeof|instanceof|async|await|class|extends|super|this|null|undefined|true|false)\b)|(?:\b(?:useState|useEffect|useContext|useReducer|useCallback|useMemo|useRef|useId|useTransition|useDeferredValue|useActionState|useOptimistic)\b)|(?:\b[A-Z][a-zA-Z0-9_]*\b)|(?:\b\d+(?:\.\d+)?\b)|(?:[{}()[\];,.:?=+\-*/%&|^!<>~])/g;

  let lastIndex = 0;
  const parts = [];
  let match;

  while ((match = tokenRegex.exec(code)) !== null) {
    const text = match[0];
    const index = match.index;

    if (index > lastIndex) {
      parts.push(<span key={`txt-${lastIndex}`} style={{ color: 'var(--text-primary, #f5f4ee)' }}>{code.slice(lastIndex, index)}</span>);
    }

    if (text.startsWith('//') || text.startsWith('/*')) {
      parts.push(<span key={`c-${index}`} style={{ color: 'var(--text-muted, #7a776d)', fontStyle: 'italic' }}>{text}</span>);
    } else if (text.startsWith('"') || text.startsWith("'") || text.startsWith('`')) {
      parts.push(<span key={`s-${index}`} style={{ color: '#86efac' }}>{text}</span>);
    } else if (text.startsWith('<') || text.startsWith('</') || text === '/>' || text === '>') {
      parts.push(<span key={`t-${index}`} style={{ color: '#f87171' }}>{text}</span>);
    } else if (/^(useState|useEffect|useContext|useReducer|useCallback|useMemo|useRef|useId|useTransition|useDeferredValue|useActionState|useOptimistic)$/.test(text)) {
      parts.push(<span key={`h-${index}`} style={{ color: '#60a5fa', fontWeight: 600 }}>{text}</span>);
    } else if (/^[A-Z][a-zA-Z0-9_]*$/.test(text)) {
      parts.push(<span key={`comp-${index}`} style={{ color: '#60a5fa' }}>{text}</span>);
    } else if (/^(import|export|default|from|function|return|const|let|var|if|else|switch|case|break|for|while|do|try|catch|finally|throw|new|typeof|instanceof|async|await|class|extends|super|this|null|undefined|true|false)$/.test(text)) {
      parts.push(<span key={`k-${index}`} style={{ color: 'var(--accent-primary, #d97757)', fontWeight: 600 }}>{text}</span>);
    } else if (/^\d/.test(text)) {
      parts.push(<span key={`n-${index}`} style={{ color: '#fcd34d' }}>{text}</span>);
    } else {
      parts.push(<span key={`p-${index}`} style={{ color: 'var(--text-secondary, #b0aea5)' }}>{text}</span>);
    }

    lastIndex = index + text.length;
  }

  if (lastIndex < code.length) {
    parts.push(<span key={`tail-${lastIndex}`} style={{ color: 'var(--text-primary, #f5f4ee)' }}>{code.slice(lastIndex)}</span>);
  }

  return parts;
}

// Formats prompt and option text with inline code blocks and tags
function FormattedCheckText({ text, isPrompt = false }) {
  if (!text) return null;

  // Split on inline code blocks `code` or pattern matches like { ... }, function signatures, etc.
  // First check if text contains backticks: `code`
  if (text.includes('`')) {
    const segments = text.split(/`([^`]+)`/g);
    return (
      <span>
        {segments.map((seg, i) => {
          if (i % 2 === 1) {
            return (
              <code key={i} className="learning-check-inline-code">
                {highlightInlineCode(seg)}
              </code>
            );
          }
          return <span key={i}>{seg}</span>;
        })}
      </span>
    );
  }

  // If prompt has an em-dash separating code statement and the question, format the code statement separately
  if (isPrompt && text.includes(' — ')) {
    const [codePart, ...rest] = text.split(' — ');
    const questionPart = rest.join(' — ');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="learning-check-code-banner">
          <code>{highlightInlineCode(codePart)}</code>
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
          {questionPart}
        </div>
      </div>
    );
  }

  // Handle options that have code before dash/em-dash: e.g. "{ name: "B" } — age is lost"
  if (text.includes(' — ') || text.includes(' - ')) {
    const delim = text.includes(' — ') ? ' — ' : ' - ';
    const [codePart, ...descParts] = text.split(delim);
    const desc = descParts.join(delim);
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <code className="learning-check-inline-code">{highlightInlineCode(codePart)}</code>
        <span style={{ color: 'var(--text-muted, #888)', fontSize: '0.9em' }}>—</span>
        <span style={{ color: 'var(--text-secondary)' }}>{desc}</span>
      </span>
    );
  }

  return <span>{text}</span>;
}

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

function coverageThreshold(keyTermCount) {
  if (keyTermCount <= 3) return 1 / keyTermCount;
  if (keyTermCount <= 6) return 0.34;
  return 0.28;
}

function gradeTextResponse(response, modelAnswer) {
  const keyTerms = extractKeyTerms(modelAnswer);
  if (keyTerms.length === 0) return { correct: true, coverage: 1 };
  const responseLower = response.toLowerCase();
  const matched = keyTerms.filter((term) => responseLower.includes(term));
  const coverage = matched.length / keyTerms.length;
  return { correct: coverage >= coverageThreshold(keyTerms.length), coverage };
}

export default function LearningChecks({ lessonId }) {
  const checks = useMemo(() => LEARNING_CHECKS[lessonId] || [], [lessonId]);
  const recordLearningCheck = useProgressStore((state) => state.recordLearningCheck);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState('');
  const [response, setResponse] = useState('');
  const [confidence, setConfidence] = useState('medium'); // 'low' | 'medium' | 'high'
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  if (checks.length === 0) return null;

  const check = checks[step];
  const value = isOpenResponse(check) ? response.trim() : selected;
  const canSubmit = Boolean(value) && (!isOpenResponse(check) || response.trim().length >= (check.minLength || 12));

  const submit = () => {
    if (!canSubmit || submitted) return;
    let correct = null;
    let coverage = null;

    if (check.type === 'choice') {
      correct = selected === check.answer;
    } else if (check.modelAnswer) {
      const graded = gradeTextResponse(value, check.modelAnswer);
      correct = graded.correct;
      coverage = graded.coverage;
    } else {
      correct = true; // valid non-empty response
    }

    setResult({ correct, coverage, feedback: check.feedback, modelAnswer: check.modelAnswer });
    setSubmitted(true);
    recordLearningCheck(lessonId, check.id, {
      type: check.stage,
      response: value,
      correct,
      confidence,
    });
  };

  const next = () => {
    if (step >= checks.length - 1) return;
    setStep((current) => current + 1);
    setSelected('');
    setResponse('');
    setSubmitted(false);
    setResult(null);
  };

  const reset = () => {
    setStep(0);
    setSelected('');
    setResponse('');
    setSubmitted(false);
    setResult(null);
  };

  return (
    <section aria-labelledby={`${lessonId}-learning-checks`} className="learning-check">
      <div className="learning-check-head">
        <div>
          <div className="learning-check-eyebrow">
            <Brain size={18} /> Learning check
          </div>
          <h3 id={`${lessonId}-learning-checks`} className="learning-check-title">
            Commit before you reveal
          </h3>
          <p className="learning-check-desc">
            Predict what React will do, explain your reasoning, then transfer the idea to a new situation.
          </p>
        </div>
        <span className="learning-check-progress">
          {step + 1} / {checks.length}
        </span>
      </div>

      <div className="learning-check-body">
        <div className="learning-check-stage">
          {stageLabels[check.stage] || check.stage}
        </div>
        <div className="learning-check-prompt">
          <FormattedCheckText text={check.prompt} isPrompt={true} />
        </div>

        {check.code && (
          <pre className="learning-check-code">
            <code>{highlightInlineCode(check.code)}</code>
          </pre>
        )}

        {check.type === 'choice' ? (
          <div className="learning-check-options">
            {check.options.map((option, index) => (
              <button
                key={option}
                type="button"
                disabled={submitted}
                onClick={() => setSelected(String(index))}
                className={`learning-check-option${selected === String(index) ? ' is-selected' : ''}`}
              >
                <span className="learning-check-option-letter">{String.fromCharCode(65 + index)}.</span>
                <span className="learning-check-option-content">
                  <FormattedCheckText text={option} />
                </span>
              </button>
            ))}
          </div>
        ) : (
          <textarea
            value={response}
            disabled={submitted}
            onChange={(event) => setResponse(event.target.value)}
            placeholder={check.placeholder || 'Write the reasoning you would tell another developer...'}
            rows={4}
            className="learning-check-textarea"
          />
        )}

        {!submitted ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>Confidence:</span>
              {(['low', 'medium', 'high']).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setConfidence(lvl)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: confidence === lvl ? 'var(--accent-primary)' : 'rgba(255,255,255,0.04)',
                    color: confidence === lvl ? '#fff' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={submit}
              className={`learning-check-submit${canSubmit ? ' is-enabled' : ''}`}
            >
              Check my reasoning <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <div role="status" className={`learning-check-feedback${result.correct ? ' is-correct' : ''}`}>
            <div className="learning-check-feedback-head">
              <CheckCircle2 size={16} /> {result.correct ? 'Good reasoning.' : 'Useful attempt—compare your model carefully.'}
            </div>
            <p className="learning-check-feedback-text">{result.feedback}</p>
            {result.modelAnswer && (
              <p className="learning-check-feedback-model"><strong>Model answer:</strong> {result.modelAnswer}</p>
            )}
          </div>
        )}
      </div>

      {submitted && (
        <div className="learning-check-actions">
          {step < checks.length - 1 ? (
            <button type="button" onClick={next} className="ui-btn-primary">
              Continue to {stageLabels[checks[step + 1].stage].toLowerCase()} <ArrowRight size={15} />
            </button>
          ) : (
            <button type="button" onClick={reset} className="ui-btn-ghost">
              Review again <RotateCcw size={14} />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
