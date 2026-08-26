import { useState, useEffect } from 'react';
import { Minus, Square, Copy, X, Settings } from 'lucide-react';
import useUIStore from '../../store/useUIStore';

export function WindowControls({ style, className = '' }) {
  const isDesktop = typeof window !== 'undefined' && Boolean(window.electronAPI?.isDesktop);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const openSettings = useUIStore((state) => state.openSettings);

  useEffect(() => {
    if (!isDesktop || !window.electronAPI?.window?.isMaximized) return;
    let mounted = true;
    window.electronAPI.window.isMaximized().then((res) => {
      if (mounted && res?.ok) setIsMaximized(Boolean(res.isMaximized));
    }).catch(() => {});
    return () => { mounted = false; };
  }, [isDesktop]);

  const handleMinimize = (e) => {
    e.stopPropagation();
    if (isDesktop && window.electronAPI?.window?.minimize) {
      window.electronAPI.window.minimize();
    }
  };

  const handleToggleMaximize = async (e) => {
    e.stopPropagation();
    if (isDesktop && window.electronAPI?.window?.toggleMaximize) {
      const res = await window.electronAPI.window.toggleMaximize();
      if (res?.ok && typeof res.isMaximized === 'boolean') {
        setIsMaximized(res.isMaximized);
      } else {
        setIsMaximized((prev) => !prev);
      }
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    if (isDesktop && window.electronAPI?.window?.close) {
      window.electronAPI.window.close();
    }
  };

  return (
    <div
      className={`macos-traffic-lights-container ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        WebkitAppRegion: 'no-drag',
        appRegion: 'no-drag',
        ...style,
      }}
    >
      {/* Options / Settings Button (Visible on Hover next to minimize) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          openSettings();
        }}
        title="Preferences & Options"
        aria-label="Preferences & Options"
        className="traffic-light-btn traffic-light-options"
        style={{
          background: 'transparent',
          border: 'none',
          padding: '2px',
          marginRight: '2px',
          borderRadius: '4px',
          color: 'var(--text-secondary, #a8a29e)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isHovered ? 1 : 0,
          pointerEvents: isHovered ? 'auto' : 'none',
          transition: 'opacity 0.15s ease, color 0.15s ease, background-color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary, #fff)';
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary, #a8a29e)';
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Settings size={13} />
      </button>

      {/* Minimize: Yellow */}
      <button
        type="button"
        onClick={handleMinimize}
        title="Minimize"
        aria-label="Minimize"
        className="traffic-light-btn traffic-light-minimize"
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#f5be4f',
          border: '0.5px solid rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: '0 0.5px 1px rgba(0,0,0,0.3)',
        }}
      >
        <Minus
          size={7}
          strokeWidth={3}
          color="#805400"
          style={{
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.12s ease',
          }}
        />
      </button>

      {/* Maximize/Restore: Green */}
      <button
        type="button"
        onClick={handleToggleMaximize}
        title={isMaximized ? 'Restore' : 'Maximize'}
        aria-label={isMaximized ? 'Restore' : 'Maximize'}
        className="traffic-light-btn traffic-light-maximize"
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#5ecb43',
          border: '0.5px solid rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: '0 0.5px 1px rgba(0,0,0,0.3)',
        }}
      >
        {isMaximized ? (
          <Copy
            size={6}
            strokeWidth={3}
            color="#0d6100"
            style={{
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.12s ease',
            }}
          />
        ) : (
          <Square
            size={6}
            strokeWidth={3}
            color="#0d6100"
            style={{
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.12s ease',
            }}
          />
        )}
      </button>

      {/* Close: Red */}
      <button
        type="button"
        onClick={handleClose}
        title="Close"
        aria-label="Close"
        className="traffic-light-btn traffic-light-close"
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#eb6a5e',
          border: '0.5px solid rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: '0 0.5px 1px rgba(0,0,0,0.3)',
        }}
      >
        <X
          size={7}
          strokeWidth={3.5}
          color="#681108"
          style={{
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.12s ease',
          }}
        />
      </button>
    </div>
  );
}

export default function TitleBar({ title = 'ReactLab', subtitle, leading, children, style }) {
  const isDesktop = typeof window !== 'undefined' && Boolean(window.electronAPI?.isDesktop);

  const handleToggleMaximize = async () => {
    if (isDesktop && window.electronAPI?.window?.toggleMaximize) {
      await window.electronAPI.window.toggleMaximize();
    }
  };

  return (
    <div
      className="custom-titlebar"
      onDoubleClick={handleToggleMaximize}
      style={{
        height: '34px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 14px 0 16px',
        backgroundColor: 'var(--bg-sidebar, #191817)',
        borderBottom: 'none',
        userSelect: 'none',
        WebkitAppRegion: 'drag',
        appRegion: 'drag',
        zIndex: 9999,
        flexShrink: 0,
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          minWidth: 0,
        }}
      >
        {leading && (
          <div style={{ WebkitAppRegion: 'no-drag', appRegion: 'no-drag', display: 'flex', alignItems: 'center' }}>
            {leading}
          </div>
        )}
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: 'var(--text-secondary, #b0aea5)',
            textTransform: 'uppercase',
            pointerEvents: 'none',
          }}
        >
          {title}
        </span>
        {subtitle && (
          <>
            <span style={{ color: 'var(--border-subtle, rgba(255,255,255,0.15))', fontSize: '11px', pointerEvents: 'none' }}>/</span>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--text-muted, #7a776d)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '420px',
                pointerEvents: 'none',
              }}
            >
              {subtitle}
            </span>
          </>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          WebkitAppRegion: 'no-drag',
          appRegion: 'no-drag',
        }}
      >
        {children}
      </div>

      <WindowControls />
    </div>
  );
}
