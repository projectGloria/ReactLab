import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

/**
 * Copy-to-clipboard control for a code block. Positioned absolutely, so the
 * block it belongs to needs `position: relative`.
 *
 * Hidden until the block is hovered or the button itself is focused -- keyboard
 * users would otherwise have no way to reach a control that only appears on
 * hover. Reveal is driven by the `.code-copy-btn` rule in components.css rather
 * than by React state, so hovering never causes a render.
 */
export default function CopyButton({ text, label = 'Copy code' }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const handleCopy = useCallback(async (event) => {
    // These sit inside clickable regions in a couple of places; copying is not
    // a request to also open whatever is underneath.
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(text ?? '');
      setCopied(true);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard permission denied, or no secure context. Nothing useful to
      // say, and throwing here would take the lesson down with it.
    }
  }, [text]);

  return (
    <button
      type="button"
      className="code-copy-btn"
      onClick={handleCopy}
      title={copied ? 'Copied' : label}
      aria-label={copied ? 'Copied' : label}
    >
      {copied ? <Check size={13} color="var(--success, #788c5d)" /> : <Copy size={13} />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}
