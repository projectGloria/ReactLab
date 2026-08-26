import { useState, useEffect } from 'react';

/**
 * A lightweight syntax highlighter & typewriter effect for the blueprint canvas.
 */
function highlightCode(code) {
  // Simple token regex parser for clean JS/JSX styling without heavy bundles
  const tokenRegex = /(\/\/.*$|\/\*[\s\S]*?\*\/)|(["'`].*?["'`])|(\b(?:function|const|let|var|return|if|else|import|export|default|from|switch|case|break|typeof|async|await)\b)|(\b(?:useState|useEffect|useMemo|useCallback|useRef|useContext|useReducer)\b)|(<\/?[\w\d]+|\/?>)|(\b\d+\b)|([{}()[\],;.])/gm;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(code)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: code.slice(lastIndex, match.index), type: 'plain' });
    }

    if (match[1]) parts.push({ text: match[1], type: 'comment' });
    else if (match[2]) parts.push({ text: match[2], type: 'string' });
    else if (match[3]) parts.push({ text: match[3], type: 'keyword' });
    else if (match[4]) parts.push({ text: match[4], type: 'hook' });
    else if (match[5]) parts.push({ text: match[5], type: 'tag' });
    else if (match[6]) parts.push({ text: match[6], type: 'number' });
    else if (match[7]) parts.push({ text: match[7], type: 'punct' });

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < code.length) {
    parts.push({ text: code.slice(lastIndex), type: 'plain' });
  }

  return parts;
}

const colorMap = {
  comment: '#78716c',
  string: '#4ade80',
  keyword: '#c084fc',
  hook: '#38bdf8',
  tag: '#fb923c',
  number: '#facc15',
  punct: '#a8a29e',
  plain: '#f5f5f4',
};

export default function TypewriterCode({ code = '', speed = 35 }) {
  const [displayedLength, setDisplayedLength] = useState(0);

  useEffect(() => {
    setDisplayedLength(0);
    if (!code) return;

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current >= code.length) {
        setDisplayedLength(code.length);
        clearInterval(interval);
      } else {
        setDisplayedLength(current);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [code, speed]);

  const currentSnippet = code.slice(0, displayedLength);
  const tokens = highlightCode(currentSnippet);
  const isComplete = displayedLength >= code.length;

  return (
    <pre style={{
      margin: 0,
      fontFamily: 'var(--font-mono, monospace)',
      fontSize: '0.82rem',
      lineHeight: '1.65',
      overflowX: 'auto',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    }}>
      <code>
        {tokens.map((token, i) => (
          <span key={i} style={{ color: colorMap[token.type] || colorMap.plain }}>
            {token.text}
          </span>
        ))}
        {!isComplete && (
          <span style={{
            display: 'inline-block',
            width: '7px',
            height: '14px',
            backgroundColor: 'var(--accent-primary, #d97757)',
            marginLeft: '2px',
            verticalAlign: 'middle',
            animation: 'blink 0.8s infinite',
          }} />
        )}
      </code>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </pre>
  );
}
