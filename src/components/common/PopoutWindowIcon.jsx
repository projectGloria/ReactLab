// Popout glyph for the detach-to-window buttons. Hand-drawn rather than pulled
// from lucide so the arrow sits inside the window frame.
export default function PopoutWindowIcon({ size = 15, color = 'currentColor', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
      <path d="m11 16 5-5" />
      <path d="m13 11 3 0 0 3" />
    </svg>
  );
}
