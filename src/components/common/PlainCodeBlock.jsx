import CopyButton from './CopyButton.jsx';

const BASE_STYLE = {
  position: 'relative',
  margin: '24px 0',
  padding: '18px',
  borderRadius: '10px',
  overflowX: 'auto',
  border: '1px solid var(--border-subtle)',
  backgroundColor: 'var(--bg-panel)',
  fontFamily: 'var(--font-mono, monospace)',
  fontSize: '0.92rem',
  lineHeight: 1.55,
};

/**
 * An unhighlighted code block with a hover copy button, for the surfaces that
 * show code without a Sandpack editor: the locked-lesson preview, the detached
 * notes window, and the step-by-step explanation pane.
 */
export default function PlainCodeBlock({ code, style }) {
  return (
    <pre className="code-copy-host" style={{ ...BASE_STYLE, ...style }}>
      <CopyButton text={code} />
      <code>{code}</code>
    </pre>
  );
}

/** Pulls the raw source out of the `<pre>` node react-markdown hands us. */
export function codeTextFromPre(children) {
  if (children && children.props && children.props.children) {
    return String(children.props.children).replace(/\n$/, '');
  }
  return String(children).replace(/\n$/, '');
}
