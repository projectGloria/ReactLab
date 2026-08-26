import { useEffect, useRef, useState } from 'react';
import { SandpackProvider, SandpackLayout, SandpackCodeEditor } from '@codesandbox/sandpack-react';
import SANDPACK_THEME from '../../lib/sandpackTheme.js';
import CopyButton from '../common/CopyButton.jsx';

// Roughly CodeMirror's line box at the editor's font size. Only used to size the
// placeholder so the page does not jump when the real editor takes over.
const LINE_HEIGHT = 19;
const VERTICAL_PADDING = 16;

const WRAPPER_STYLE = {
  position: 'relative',
  margin: '24px 0',
  borderRadius: '10px',
  overflow: 'hidden',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  backgroundColor: '#141413',
};

/**
 * A read-only code block in the lecture prose, backed by the same Sandpack
 * editor the playground uses so the colours match exactly.
 *
 * Mounted lazily. Each one of these is a full SandpackProvider plus a CodeMirror
 * instance, and a lesson can hold six of them on top of the live playground --
 * paying for all of that up front is most of what a lesson costs to open, for
 * editors the reader may never scroll to. Until one comes near the viewport it
 * renders as plain preformatted text at the same size, so the swap is invisible
 * and the scrollbar never jumps.
 */
export default function ProseCodeBlock({ code }) {
  const containerRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isMounted) return undefined;
    const node = containerRef.current;
    // No IntersectionObserver (jsdom, an old runtime): mount immediately rather
    // than leaving the reader with a block that never upgrades.
    if (!node || typeof IntersectionObserver === 'undefined') {
      setIsMounted(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setIsMounted(true);
      },
      // Start loading a screen early so scrolling never outruns the swap.
      { rootMargin: '600px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isMounted]);

  const lineCount = code ? code.split('\n').length : 1;

  return (
    <div ref={containerRef} className="markdown-code-block code-copy-host" style={WRAPPER_STYLE}>
      <CopyButton text={code} />
      {isMounted ? (
        <SandpackProvider
          template="react"
          theme={SANDPACK_THEME}
          files={{ '/example.js': { code, active: true } }}
        >
          <SandpackLayout style={{ border: 'none', borderRadius: 0, minHeight: 'auto' }}>
            <SandpackCodeEditor showLineNumbers showTabs={false} readOnly showReadOnly={false} />
          </SandpackLayout>
        </SandpackProvider>
      ) : (
        <pre
          aria-hidden="true"
          style={{
            margin: 0,
            padding: `${VERTICAL_PADDING / 2}px 16px`,
            minHeight: lineCount * LINE_HEIGHT + VERTICAL_PADDING,
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '13px',
            lineHeight: `${LINE_HEIGHT}px`,
            color: 'var(--text-secondary, #a8a29e)',
            overflow: 'hidden',
          }}
        >
          {code}
        </pre>
      )}
    </div>
  );
}

export { codeTextFromPre } from '../common/PlainCodeBlock.jsx';
