// Single source of truth for every Sandpack editor in ReactLab.
// Keep this palette aligned with the Challenge editor so all code blocks
// have identical colors, typography, and surfaces.
export const SANDPACK_THEME = {
  colors: {
    surface1: 'var(--bg-panel)',
    surface2: 'var(--bg-hover)',
    surface3: 'var(--bg-sidebar)',
    clickable: 'var(--text-secondary)',
    base: 'var(--text-primary)',
    disabled: 'var(--text-muted)',
    hover: 'var(--accent-hover)',
    accent: 'var(--accent-primary)',
    error: 'var(--error)',
    errorSurface: 'var(--error-bg)',
  },
  syntax: {
    plain: 'var(--text-primary)',
    punctuation: 'var(--text-secondary)',
    keyword: 'var(--accent-primary)',
    tag: 'var(--error)',
    string: 'var(--success)',
    property: 'var(--warning)',
    function: '#60a5fa',
    comment: 'var(--text-muted)',
  },
  font: {
    body: 'var(--font-sans)',
    mono: 'var(--font-mono, monospace)',
    size: '14px',
  },
};

export default SANDPACK_THEME;
