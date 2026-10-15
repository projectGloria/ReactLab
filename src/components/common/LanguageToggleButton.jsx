// The flag shows the language you would switch *to*, not the one you are in --
// the same convention as a play button showing "play" while paused.
//
// Drawn as SVG rather than the 🇹🇷 / 🇬🇧 emoji on purpose: Windows has no glyphs
// for regional-indicator pairs and renders them as the bare letters "TR" and
// "GB", so the emoji version would show text on the one platform this app ships
// to as a desktop build.

function TurkishFlag({ size = 16 }) {
  return (
    <svg width={size * 1.5} height={size} viewBox="0 0 36 24" aria-hidden="true" focusable="false">
      <rect width="36" height="24" rx="2" fill="#E30A17" />
      {/* Crescent: a full disc with a smaller disc punched out of it. */}
      <circle cx="14" cy="12" r="6" fill="#fff" />
      <circle cx="16" cy="12" r="4.8" fill="#E30A17" />
      {/* Five-pointed star, one point facing away from the crescent. */}
      <polygon
        points="29.80,12.00 27.02,13.03 26.90,15.99 25.06,13.66 22.20,14.47 21.40,12.00 22.20,9.53 25.06,10.34 26.90,8.01 27.02,10.97"
        fill="#fff"
      />
    </svg>
  );
}

function BritishFlag({ size = 16 }) {
  return (
    <svg width={size * 1.5} height={size} viewBox="0 0 60 30" aria-hidden="true" focusable="false">
      <clipPath id="uk-clip">
        <rect width="60" height="30" rx="3" />
      </clipPath>
      <g clipPath="url(#uk-clip)">
        <rect width="60" height="30" fill="#012169" />
        {/* White saltire, then the red saltire offset inside it. */}
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="2.5" />
        {/* White cross, then the red cross on top. */}
        <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

export default function LanguageToggleButton({ language, onToggle, isTranslated = true }) {
  const goingToTurkish = language !== 'tr';
  const label = goingToTurkish ? 'Dersi Türkçe göster' : 'Show this lesson in English';
  // A lesson with no translation yet still reads in English while the switch is
  // set to Turkish. Saying so beats letting it look like the button did nothing.
  const title = !isTranslated && !goingToTurkish
    ? 'Bu ders henüz çevrilmedi — İngilizce gösteriliyor'
    : label;

  // Fades in with the neighbouring pop-out and zen buttons when the heading row
  // is hovered (see `.lesson-prose-header-group .lesson-language-toggle`), so the
  // heading stays uncluttered while reading. Its own class rather than
  // `lesson-hover-action-btn` because the untranslated state dims it to 0.55
  // instead of the full opacity the other two fade to.
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`lesson-language-toggle${!isTranslated && !goingToTurkish ? ' is-untranslated' : ''}`}
      title={title}
      aria-label={label}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
        borderRadius: '8px',
        padding: '6px 8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        transition: 'all 0.15s ease',
      }}
    >
      {goingToTurkish ? <TurkishFlag /> : <BritishFlag />}
    </button>
  );
}
