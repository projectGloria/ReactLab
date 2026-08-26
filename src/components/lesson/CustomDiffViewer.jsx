import { useEffect, useRef } from 'react';

export default function CustomDiffViewer({ diffLineObjects, isTyping, onSkip }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isTyping || !containerRef.current) return;
    const elements = Array.from(containerRef.current.querySelectorAll('.typing-line'));
    const totalChars = elements.reduce((sum, el) => sum + (el.dataset.fullText.length + 1), 0);
    let currentChars = 0;
    
    let animationFrameId;
    let lastTime = 0;
    const fps = 30; // smooth 30fps update
    const interval = 1000 / fps;
    const charsPerTick = Math.max(1, Math.floor(totalChars / (1000 / interval))); // Finish in ~1 second

    const updateDOM = (timestamp) => {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      
      if (deltaTime > interval) {
        currentChars += charsPerTick;
        lastTime = timestamp;
        
        if (currentChars >= totalChars) {
          elements.forEach(el => {
            el.textContent = el.dataset.fullText || ' ';
            if (el.nextElementSibling && el.nextElementSibling.className === 'cursor') {
              el.nextElementSibling.style.display = 'none';
            }
          });
          onSkip();
          return;
        }

        let charsLeft = currentChars;
        elements.forEach(el => {
          const fullText = el.dataset.fullText;
          const len = fullText.length + 1;
          const cursor = el.nextElementSibling && el.nextElementSibling.className === 'cursor' ? el.nextElementSibling : null;
          
          if (charsLeft >= len) {
            el.textContent = fullText || ' ';
            charsLeft -= len;
            if (cursor) cursor.style.display = 'none';
            el.parentElement.style.display = 'block';
          } else if (charsLeft > 0) {
            el.textContent = fullText.substring(0, charsLeft) || ' ';
            charsLeft = 0;
            if (cursor) cursor.style.display = 'inline-block';
            el.parentElement.style.display = 'block';
          } else {
            el.textContent = '';
            if (cursor) cursor.style.display = 'none';
            // Hide lines that haven't been reached yet
            el.parentElement.style.display = 'none';
          }
        });
      }
      animationFrameId = requestAnimationFrame(updateDOM);
    };

    animationFrameId = requestAnimationFrame(updateDOM);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isTyping, onSkip]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        height: '100%', 
        overflowY: 'auto', 
        backgroundColor: 'var(--bg-panel)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-mono, monospace)', 
        fontSize: '13px', 
        lineHeight: 1.6,
        position: 'relative'
      }}
    >
      <pre style={{ margin: 0, padding: '16px 0', fontFamily: 'inherit' }}>
        {diffLineObjects.map((lineObj, idx) => {
          if (lineObj.removed) {
            return (
              <div key={idx} style={{ 
                backgroundColor: 'var(--error-bg)', 
                color: 'var(--text-secondary)',
                padding: '0 16px',
                borderLeft: '4px solid var(--error)'
              }}>
                {lineObj.text || ' '}
              </div>
            );
          } else if (lineObj.added) {
            if (!isTyping) {
              return (
                <div key={idx} style={{ 
                  backgroundColor: 'var(--success-bg)', 
                  padding: '0 16px',
                  borderLeft: '4px solid var(--success)'
                }}>
                  <span>{lineObj.text || ' '}</span>
                </div>
              );
            }
            
            return (
              <div key={idx} style={{ 
                backgroundColor: 'var(--success-bg)', 
                padding: '0 16px',
                borderLeft: '4px solid var(--success)',
                display: 'none' // hidden initially
              }}>
                <span className="typing-line" data-full-text={lineObj.text}></span>
                <span className="cursor" style={{ 
                  display: 'none',
                  width: '6px',
                  height: '14px',
                  backgroundColor: 'var(--text-primary)',
                  verticalAlign: 'middle',
                  marginLeft: '2px',
                  animation: 'blink 1s step-end infinite' 
                }}></span>
              </div>
            );
          } else {
            return (
              <div key={idx} style={{ padding: '0 16px', borderLeft: '4px solid transparent' }}>
                {lineObj.text || ' '}
              </div>
            );
          }
        })}
      </pre>
      
      {isTyping && (
        <div 
          onClick={onSkip}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, cursor: 'pointer' }}
          title="Click to skip animation"
        />
      )}
    </div>
  );
}
