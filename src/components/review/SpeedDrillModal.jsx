import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle2, XCircle, Timer, Award, RotateCcw, X, ArrowRight, Sparkles } from 'lucide-react';
import { LEARNING_CHECKS } from '../../curriculum/learningChecks.js';
import curriculum from '../../curriculum/index.js';
import useProgressStore from '../../store/useProgressStore.js';
import { soundEffects } from '../../lib/soundEffects.js';

export default function SpeedDrillModal({ isOpen, onClose }) {
  const recordLearningCheck = useProgressStore((state) => state.recordLearningCheck);

  // Collect all available learning checks across curriculum into a flat pool
  const allChecks = useMemo(() => {
    const pool = [];
    for (const [lessonId, checks] of Object.entries(LEARNING_CHECKS)) {
      for (const check of checks) {
        if (check.type === 'choice') {
          pool.push({ ...check, lessonId });
        }
      }
    }
    return pool;
  }, []);

  // Drill state
  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [totalSeconds, setTotalSeconds] = useState(0);

  // Initialize a fresh 5-question random deck
  const startNewDeck = () => {
    const shuffled = [...allChecks].sort(() => 0.5 - Math.random()).slice(0, 5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setIsFinished(false);
    setStartTime(Date.now());
  };

  useEffect(() => {
    if (isOpen) {
      startNewDeck();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentCard = deck[currentIndex];

  const handleSelect = (idx) => {
    if (isAnswered || isFinished) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = Number(idx) === Number(currentCard.answer);
    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
      soundEffects.play('success');
    } else {
      setStreak(0);
      soundEffects.play('error');
    }

    recordLearningCheck?.(currentCard.lessonId, currentCard.id, {
      selectedOption: idx,
      correct: isCorrect,
      confidence: 'confident',
    });
  };

  const handleNext = () => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setTotalSeconds(elapsed);
      soundEffects.play('complete');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        style={{
          width: '540px',
          maxWidth: '100%',
          backgroundColor: '#191817',
          border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))',
          borderRadius: '16px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(255,255,255,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="var(--accent-primary, #d97757)" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
              Daily Speed Drill
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {streak > 1 && (
              <span style={{ fontSize: '0.75rem', color: '#d9a057', fontWeight: 700 }}>
                🔥 {streak} Streak!
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        {!isFinished ? (
          <div style={{ padding: '24px 28px' }}>
            {/* Progress Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#888', marginBottom: '8px' }}>
              <span>Question {currentIndex + 1} of {deck.length}</span>
              <span>Score: {score}</span>
            </div>
            <div style={{ height: '4px', width: '100%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '20px' }}>
              <div
                style={{
                  height: '100%',
                  width: `${((currentIndex + (isAnswered ? 1 : 0)) / deck.length) * 100}%`,
                  backgroundColor: 'var(--accent-primary, #d97757)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            {/* Prompt */}
            <h3 style={{ fontSize: '1.05rem', lineHeight: 1.45, color: '#f5f5f4', margin: '0 0 20px 0', fontWeight: 600 }}>
              {currentCard?.prompt}
            </h3>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentCard?.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = Number(idx) === Number(currentCard.answer);

                let bg = 'rgba(255,255,255,0.03)';
                let border = '1px solid rgba(255,255,255,0.1)';
                let textColor = '#d4d4d4';

                if (isAnswered) {
                  if (isCorrect) {
                    bg = 'rgba(120, 140, 93, 0.15)';
                    border = '1px solid rgba(120, 140, 93, 0.4)';
                    textColor = '#4ade80';
                  } else if (isSelected) {
                    bg = 'rgba(193, 95, 60, 0.15)';
                    border = '1px solid rgba(193, 95, 60, 0.4)';
                    textColor = '#f87171';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelect(idx)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      backgroundColor: bg,
                      border,
                      color: textColor,
                      textAlign: 'left',
                      fontSize: '0.88rem',
                      lineHeight: 1.4,
                      cursor: isAnswered ? 'default' : 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{opt}</span>
                    {isAnswered && isCorrect && <CheckCircle2 size={16} color="#4ade80" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle size={16} color="#f87171" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation / Next Button */}
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: '20px' }}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderLeft: '3px solid var(--accent-primary, #d97757)',
                    fontSize: '0.8rem',
                    color: '#a3a3a3',
                    marginBottom: '16px',
                    lineHeight: 1.4,
                  }}
                >
                  {currentCard?.feedback}
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  className="ui-btn-primary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}
                >
                  <span>{currentIndex < deck.length - 1 ? 'Next Question' : 'View Results'}</span>
                  <ArrowRight size={15} />
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          /* Results Screen */
          <div style={{ padding: '36px 28px', textAlign: 'center' }}>
            <Award size={48} color="var(--accent-primary, #d97757)" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: '0 0 8px 0' }}>
              Drill Completed!
            </h2>
            <p style={{ color: '#a3a3a3', fontSize: '0.9rem', margin: '0 0 24px 0' }}>
              You answered <strong style={{ color: '#fff' }}>{score} of {deck.length}</strong> correctly in <strong style={{ color: '#fff' }}>{totalSeconds}s</strong>.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={startNewDeck}
                className="ui-btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px' }}
              >
                <RotateCcw size={15} />
                <span>Drill Again</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="ui-btn-ghost"
                style={{ padding: '10px 20px' }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
