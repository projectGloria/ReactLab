import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Code2 } from 'lucide-react';
import { GLOSSARY_TERMS } from '../../lib/glossary.js';
import highlightCode from '../../lib/highlightCode.jsx';

// Wide enough for a code example to breathe. The previous 380 forced most
// snippets to wrap mid-expression, which is exactly where they are hardest to
// read. Height is only used to decide whether the card fits above the word.
const TOOLTIP_WIDTH = 460;
const TOOLTIP_HEIGHT = 340;

// Every spelling the lecture text might use, mapped back to the glossary key
// that explains it. Aliases exist because the prose says "hoisted" where the
// entry is filed under "hoisting", and "optimistic UI" where the entry is
// "optimistic update" -- without them those terms are in the glossary but never
// actually reachable from a lesson.
const SURFACE_TO_KEY = new Map();
for (const [key, data] of Object.entries(GLOSSARY_TERMS)) {
  SURFACE_TO_KEY.set(key.toLowerCase(), key);
  for (const alias of data.aliases || []) SURFACE_TO_KEY.set(alias.toLowerCase(), key);
}

// Longest first, so "stale closure" wins over "closure" and "render phase" over
// "render". Built once at module load rather than per paragraph.
const SURFACE_FORMS = [...SURFACE_TO_KEY.keys()].sort((a, b) => b.length - a.length);
const MATCHER_SOURCE = `\\b(${SURFACE_FORMS
  .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('|')})(?:s|es|d|ed|ing|tion)?\\b`;

export function TermExplainerTooltip({ termKey, matchedText, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, placeAbove: true });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const normalizedKey = termKey.toLowerCase();
  const termData = GLOSSARY_TERMS[normalizedKey];

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    let left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
    // Keep inside viewport horizontally
    if (left < 16) left = 16;
    if (left + TOOLTIP_WIDTH > window.innerWidth - 16) {
      left = window.innerWidth - TOOLTIP_WIDTH - 16;
    }

    const spaceAbove = rect.top;
    const placeAbove = spaceAbove > TOOLTIP_HEIGHT + 20;

    const top = placeAbove
      ? rect.top - 8
      : rect.bottom + 8;

    setCoords({ top, left, placeAbove });
  };

  const handleMouseEnter = () => {
    updatePosition();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  if (!termData) {
    return <span>{children || matchedText}</span>;
  }

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        tabIndex={0}
        role="button"
        aria-label={`What is ${termData.term}?`}
        className={`glossary-term-highlight${isOpen ? ' is-open' : ''}`}
      >
        {children || matchedText}
      </span>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={tooltipRef}
              initial={{ opacity: 0, y: coords.placeAbove ? 6 : -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: coords.placeAbove ? 6 : -6, scale: 0.96 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                top: coords.placeAbove ? 'auto' : coords.top,
                bottom: coords.placeAbove ? window.innerHeight - coords.top : 'auto',
                left: coords.left,
                width: `${TOOLTIP_WIDTH}px`,
                maxWidth: 'calc(100vw - 32px)',
                maxHeight: 'min(70vh, 560px)',
                overflowY: 'auto',
                backgroundColor: '#191817',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                borderRadius: '12px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(217, 119, 87, 0.25)',
                zIndex: 99999,
                padding: '18px 20px',
                color: '#ededed',
                fontSize: '0.9rem',
                pointerEvents: 'auto',
                backdropFilter: 'blur(12px)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Sparkles size={14} color="var(--accent-primary, #d97757)" />
                  <span style={{ fontWeight: 700, fontSize: '1.02rem', color: '#fff' }}>
                    {termData.term}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(217, 119, 87, 0.12)',
                    color: 'var(--accent-primary, #d97757)',
                    border: '1px solid rgba(217, 119, 87, 0.25)',
                  }}
                >
                  {termData.category}
                </span>
              </div>

              {/* Definition */}
              <p style={{ margin: '0 0 12px 0', color: '#d4d4d4', lineHeight: 1.55, fontSize: '0.9rem' }}>
                {termData.definition}
              </p>

              {/* Mental Model */}
              {termData.mentalModel && (
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    borderLeft: '2px solid var(--accent-primary, #d97757)',
                    padding: '8px 12px',
                    borderRadius: '0 6px 6px 0',
                    marginBottom: '12px',
                    fontSize: '0.85rem',
                    color: '#a3a3a3',
                    lineHeight: 1.4,
                  }}
                >
                  <strong style={{ color: '#e5e5e5' }}>💡 Mental Model: </strong>
                  {termData.mentalModel}
                </div>
              )}

              {/* Code Snippet */}
              {termData.code && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8a8a85', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                    <Code2 size={12} /> Code Example
                  </div>
                  {/* Coloured by the shared tokenizer, the same one the mentor
                      chat and the Glossary Codex use. This block used to be a
                      single flat #93c5fd, so comments, strings and keywords all
                      came out the same light blue. */}
                  <pre
                    style={{
                      margin: 0,
                      padding: '12px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#0c0b0a',
                      border: '1px solid rgba(255,255,255,0.08)',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.8rem',
                      lineHeight: 1.55,
                      color: 'var(--text-primary, #f5f4ee)',
                      overflowX: 'auto',
                      whiteSpace: 'pre',
                    }}
                  >
                    <code>{highlightCode(termData.code)}</code>
                  </pre>
                </div>
              )}

              {/* Why it matters */}
              {termData.whyItMatters && (
                <div style={{ marginTop: '12px', fontSize: '0.82rem', color: '#8a8a85', lineHeight: 1.5 }}>
                  <span style={{ color: '#a3a3a3', fontWeight: 600 }}>Why it matters in React: </span>
                  {termData.whyItMatters}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

/**
 * Text parser that scans raw text/JSX children and wraps known glossary terms in TermExplainerTooltip
 */
export function wrapGlossaryTerms(text) {
  if (typeof text !== 'string') return text;

  if (SURFACE_FORMS.length === 0) return text;

  const regexPattern = new RegExp(MATCHER_SOURCE, 'gi');

  const elements = [];
  let lastIndex = 0;
  let match;
  // First mention only, per block of text. With 56 terms in the glossary,
  // marking every occurrence turns a paragraph about state into a paragraph of
  // underlines; the explainer is for the moment a word is first met.
  const alreadyMarked = new Set();

  while ((match = regexPattern.exec(text)) !== null) {
    const matchStart = match.index;
    const matchEnd = regexPattern.lastIndex;
    const matchedWord = match[0];
    // An alias resolves to the entry that explains it, so "hoisted" opens the
    // Hoisting card rather than finding nothing.
    const baseKey = SURFACE_TO_KEY.get(match[1].toLowerCase());
    if (!baseKey || alreadyMarked.has(baseKey)) continue;
    alreadyMarked.add(baseKey);

    // Push text before match
    if (matchStart > lastIndex) {
      elements.push(text.slice(lastIndex, matchStart));
    }

    // Push wrapped tooltip
    elements.push(
      <TermExplainerTooltip key={`${matchStart}-${matchedWord}`} termKey={baseKey} matchedText={matchedWord}>
        {matchedWord}
      </TermExplainerTooltip>
    );

    lastIndex = matchEnd;
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements.length > 0 ? elements : text;
}
