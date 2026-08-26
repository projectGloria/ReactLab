import { useState, useEffect } from 'react';
import { useSandpack } from '@codesandbox/sandpack-react';
import { Sparkles, Check } from 'lucide-react';
import { formatCode } from '../../lib/formatter.js';

export default function FormatButton({ style = {}, showLabel = false }) {
  const { sandpack } = useSandpack();
  const [isFormatting, setIsFormatting] = useState(false);
  const [justFormatted, setJustFormatted] = useState(false);

  const handleFormat = async () => {
    if (isFormatting) return;
    const activeFilePath = sandpack.activeFile || Object.keys(sandpack.files)[0] || '/App.jsx';
    const currentCode = sandpack.files[activeFilePath]?.code;

    if (!currentCode) return;

    setIsFormatting(true);
    try {
      const formatted = await formatCode(currentCode, activeFilePath);
      if (formatted && formatted !== currentCode) {
        sandpack.updateFile(activeFilePath, formatted);
        setJustFormatted(true);
        setTimeout(() => setJustFormatted(false), 1200);
      }
    } finally {
      setIsFormatting(false);
    }
  };

  const handleDuplicateLine = () => {
    const activeFilePath = sandpack.activeFile || Object.keys(sandpack.files)[0] || '/App.jsx';
    const currentCode = sandpack.files[activeFilePath]?.code;
    if (!currentCode) return;

    let startLineIdx = -1;
    let endLineIdx = -1;

    // 1. Try to find the focused CodeMirror cursor / line
    const activeElem = document.activeElement;
    const cmContent = activeElem?.closest?.('.cm-content') || document.querySelector('.cm-content');

    if (cmContent) {
      const allLines = Array.from(cmContent.querySelectorAll('.cm-line'));
      const selection = window.getSelection();

      if (selection && selection.anchorNode) {
        const getLineElem = (node) => {
          if (!node) return null;
          return node.nodeType === 3 ? node.parentElement?.closest('.cm-line') : node.closest?.('.cm-line');
        };

        const anchorLine = getLineElem(selection.anchorNode);
        const focusLine = getLineElem(selection.focusNode) || anchorLine;

        if (anchorLine) {
          const aIdx = allLines.indexOf(anchorLine);
          const fIdx = focusLine ? allLines.indexOf(focusLine) : aIdx;
          if (aIdx !== -1) {
            startLineIdx = Math.min(aIdx, fIdx !== -1 ? fIdx : aIdx);
            endLineIdx = Math.max(aIdx, fIdx !== -1 ? fIdx : aIdx);
          }
        }
      }
    }

    const codeLines = currentCode.split('\n');
    if (startLineIdx >= 0 && endLineIdx >= 0 && endLineIdx < codeLines.length) {
      const duplicatedLines = codeLines.slice(startLineIdx, endLineIdx + 1);
      codeLines.splice(endLineIdx + 1, 0, ...duplicatedLines);
      sandpack.updateFile(activeFilePath, codeLines.join('\n'));
    } else if (codeLines.length > 0) {
      // If cursor is at the end or undetermined, duplicate the last line
      codeLines.push(codeLines[codeLines.length - 1]);
      sandpack.updateFile(activeFilePath, codeLines.join('\n'));
    }
  };

  // Support Ctrl+S / Cmd+S (format), Shift+Alt+F (format), and Ctrl+D / Cmd+D (duplicate line)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCtrlS = (e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S');
      const isShiftAltF = e.shiftKey && e.altKey && (e.key === 'f' || e.key === 'F');
      const isCtrlD = (e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D') && !e.shiftKey && !e.altKey;

      if (isCtrlS || isShiftAltF) {
        e.preventDefault();
        e.stopPropagation();
        handleFormat();
      } else if (isCtrlD) {
        e.preventDefault();
        e.stopPropagation();
        handleDuplicateLine();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [sandpack.files, sandpack.activeFile]);

  return (
    <button
      type="button"
      onClick={handleFormat}
      disabled={isFormatting}
      aria-label="Format code with Prettier (Ctrl+S or Shift+Alt+F)"
      title="Format code (Ctrl + S / Shift + Alt + F)"
      style={{
        background: justFormatted ? 'rgba(52, 211, 153, 0.15)' : 'transparent',
        color: justFormatted ? 'var(--success, #788c5d)' : 'var(--text-secondary, #a8a29e)',
        border: `1px solid ${justFormatted ? 'var(--success, #788c5d)' : 'var(--border-subtle, rgba(255,255,255,0.1))'}`,
        borderRadius: 'var(--radius-sm, 6px)',
        padding: showLabel ? '4px 10px' : '6px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.75rem',
        fontWeight: 500,
        transition: 'all 0.2s ease',
        ...style,
      }}
    >
      {justFormatted ? (
        <Check size={14} strokeWidth={2.5} />
      ) : (
        <Sparkles size={14} style={{ transform: isFormatting ? 'rotate(180deg)' : 'none', transition: 'transform 0.4s' }} />
      )}
      {showLabel && <span>{justFormatted ? 'Formatted!' : 'Format'}</span>}
    </button>
  );
}
