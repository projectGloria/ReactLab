import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Code2, Check } from 'lucide-react';
import { GLOSSARY_TERMS } from '../lib/glossary.js';
import highlightCode from '../lib/highlightCode.jsx';

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedKey, setCopiedKey] = useState(null);

  const activeGlossary = GLOSSARY_TERMS;

  const categories = useMemo(() => {
    const cats = new Set(['All']);
    Object.values(activeGlossary).forEach((term) => {
      if (term.category) cats.add(term.category);
    });
    return Array.from(cats);
  }, [activeGlossary]);

  const filteredTerms = useMemo(() => {
    return Object.entries(activeGlossary).filter(([key, data]) => {
      const matchesSearch =
        data.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        data.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (data.mentalModel && data.mentalModel.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (data.whyItMatters && data.whyItMatters.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || data.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, activeGlossary]);

  const handleCopyCode = (key, code) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div
      className="glossary-page auto-hide-scrollbar"
      style={{
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        scrollBehavior: 'smooth',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 80px', color: '#ededed' }}>
      {/* Header */}
      <header style={{ marginBottom: '36px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary, #d97757)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            <Sparkles size={16} /> ReactLab Knowledge Base
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', margin: '0 0 12px 0', letterSpacing: '-0.03em', color: '#fff' }}>
            Glossary & Mental Model Codex
          </h1>
          <p style={{ margin: 0, color: '#a8a29e', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '650px' }}>
            A comprehensive reference dictionary for essential React and JavaScript mental models, gotchas, and architectural concepts.
          </p>
        </div>
      </header>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#737373' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search concepts (e.g. mutable, closure, reconciliation, pure function, fiber)..."
            style={{
              width: '100%',
              padding: '14px 16px 14px 46px',
              borderRadius: '12px',
              backgroundColor: '#191817',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary, #d97757)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle, rgba(255, 255, 255, 0.12))'}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '100px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: `1px solid ${isSelected ? 'var(--accent-primary, #d97757)' : 'rgba(255,255,255,0.08)'}`,
                  backgroundColor: isSelected ? 'rgba(217, 119, 87, 0.15)' : 'rgba(255,255,255,0.02)',
                  color: isSelected ? 'var(--accent-primary, #d97757)' : '#a3a3a3',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Term Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: '20px' }}>
        <AnimatePresence>
          {filteredTerms.map(([key, data]) => (
            <motion.div
              key={key}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                backgroundColor: '#191817',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                borderRadius: '14px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#fff', fontWeight: 700 }}>
                    {data.term}
                  </h2>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(217, 119, 87, 0.12)',
                      color: 'var(--accent-primary, #d97757)',
                      border: '1px solid rgba(217, 119, 87, 0.25)',
                    }}
                  >
                    {data.category}
                  </span>
                </div>

                {/* Definition */}
                <p style={{ color: '#d4d4d4', fontSize: '0.92rem', lineHeight: 1.55, margin: '0 0 14px 0' }}>
                  {data.definition}
                </p>

                {/* Mental Model */}
                {data.mentalModel && (
                  <div
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderLeft: '3px solid var(--accent-primary, #d97757)',
                      padding: '8px 12px',
                      borderRadius: '0 8px 8px 0',
                      marginBottom: '16px',
                      fontSize: '0.84rem',
                      color: '#a3a3a3',
                      lineHeight: 1.45,
                    }}
                  >
                    <strong style={{ color: '#f5f5f4' }}>💡 Mental Model: </strong>
                    {data.mentalModel}
                  </div>
                )}

                {/* Code Block */}
                {data.code && (
                  <div style={{ position: 'relative', marginTop: '12px', marginBottom: '14px' }}>
                    <pre
                      style={{
                        margin: 0,
                        padding: '14px',
                        borderRadius: '10px',
                        backgroundColor: '#0c0b0a',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '0.8rem',
                        lineHeight: 1.5,
                        color: 'var(--text-primary)',
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {/* Same tokenizer the mentor chat uses, so code reads
                          identically wherever it appears outside a Sandpack
                          editor. Was a flat #93c5fd for the whole block. */}
                      <code>{highlightCode(data.code)}</code>
                    </pre>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(key, data.code)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        padding: '4px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: copiedKey === key ? '#4ade80' : '#d4d4d4',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {copiedKey === key ? <Check size={12} /> : <Code2 size={12} />}
                      <span>{copiedKey === key ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Why it matters footer */}
              {data.whyItMatters && (
                <div
                  style={{
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: '0.8rem',
                    color: '#737373',
                    lineHeight: 1.4,
                  }}
                >
                  <span style={{ color: '#a3a3a3', fontWeight: 600 }}>Why it matters: </span>
                  {data.whyItMatters}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  </div>
  );
}
