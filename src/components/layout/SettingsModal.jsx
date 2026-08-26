// v4 — 2026-08-18 — narrow Zustand subscriptions to required state slices
import { useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, Mic, MicOff, Check, RotateCcw, Keyboard, Sparkles, Lock, Unlock, Camera, RefreshCw } from 'lucide-react';
import useUIStore from '../../store/useUIStore';
import useProgressStore from '../../store/useProgressStore';
import { SOUND_PROFILES } from '../../lib/soundEffects';
import { TOTAL_LESSONS } from '../../curriculum/index';
import defaultAvatar from '../../assets/sonia-avatar.jpg';
import AIMentorSettings from './AIMentorSettings.jsx';

export default function SettingsModal() {
  const {
    isSettingsOpen,
    closeSettings,
    isVoiceEnabled,
    toggleVoice,
    soniaAvatar,
    setSoniaAvatar,
    resetSoniaAvatar,
    isSoundEnabled,
    toggleSound,
    soundProfile,
    setSoundProfile,
    soundVolume,
    setSoundVolume,
    unlockAllLessons,
    toggleUnlockAll,
    windowControlsVisibility,
    setWindowControlsVisibility,
  } = useUIStore(useShallow((state) => ({
    isSettingsOpen: state.isSettingsOpen,
    closeSettings: state.closeSettings,
    isVoiceEnabled: state.isVoiceEnabled,
    toggleVoice: state.toggleVoice,
    soniaAvatar: state.soniaAvatar,
    setSoniaAvatar: state.setSoniaAvatar,
    resetSoniaAvatar: state.resetSoniaAvatar,
    isSoundEnabled: state.isSoundEnabled,
    toggleSound: state.toggleSound,
    soundProfile: state.soundProfile,
    setSoundProfile: state.setSoundProfile,
    soundVolume: state.soundVolume,
    setSoundVolume: state.setSoundVolume,
    unlockAllLessons: state.unlockAllLessons,
    toggleUnlockAll: state.toggleUnlockAll,
    windowControlsVisibility: state.windowControlsVisibility || 'hover',
    setWindowControlsVisibility: state.setWindowControlsVisibility,
  })));

  const { completedLessons, resetProgress, exportProgress, importProgress } = useProgressStore(
    useShallow((state) => ({
      completedLessons: state.completedLessons,
      resetProgress: state.resetProgress,
      exportProgress: state.exportProgress,
      importProgress: state.importProgress,
    }))
  );
  const fileInputRef = useRef(null);
  const progressFileInputRef = useRef(null);

  if (!isSettingsOpen) return null;

  const currentAvatar = soniaAvatar || defaultAvatar;

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress to 256x256 max via canvas for lightweight storage
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Draw cropped center square
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSoniaAvatar(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset all lesson progress? This cannot be undone.')) {
      resetProgress();
    }
  };

  const handleExportProgress = () => {
    const data = exportProgress();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `reactlab-progress-${dateStamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportProgressClick = () => {
    progressFileInputRef.current?.click();
  };

  const handleImportProgressFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      let parsed;
      try {
        parsed = JSON.parse(event.target.result);
      } catch {
        window.alert("That file isn't valid JSON — couldn't import progress.");
        e.target.value = '';
        return;
      }
      const confirmed = window.confirm(
        'Importing will replace your current progress with the contents of this file. This cannot be undone. Continue?'
      );
      if (!confirmed) {
        e.target.value = '';
        return;
      }
      const result = importProgress(parsed);
      if (!result.ok) {
        window.alert(result.error);
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeSettings();
        }}
        >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{
            backgroundColor: '#171614',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '920px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '24px 28px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(217, 119, 87, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary, #d97757)',
              }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f5f5f4' }}>
                  Preferences & Settings
                </h2>
                <div style={{ fontSize: '0.8rem', color: '#78716c', marginTop: '2px' }}>
                  Customize your learning environment, avatar, audio, and progression
                </div>
              </div>
            </div>

            <button
              onClick={closeSettings}
              style={{
                background: 'none',
                border: 'none',
                color: '#a8a29e',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            


            {/* 1. Sonia Voice Narration & Editable Avatar */}
            <div style={{
              backgroundColor: '#12110f',
              borderRadius: '14px',
              padding: '18px 20px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Clickable/Editable Avatar */}
                <div
                  style={{ position: 'relative', width: '52px', height: '52px', cursor: 'pointer', flexShrink: 0 }}
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to change Sonia's avatar"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid var(--accent-primary, #d97757)',
                    backgroundColor: '#262522',
                  }}>
                    <img
                      src={currentAvatar}
                      alt="Sonia Avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                  {/* Camera overlay icon */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    backgroundColor: '#1e1d1a',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary, #d97757)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  }}>
                    <Camera size={11} />
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f5f5f4', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Sonia AI Voice Tutor</span>
                    <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(120,140,93,0.15)', color: '#788c5d', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(120,140,93,0.3)' }}>
                      Edge Neural
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#a8a29e', marginTop: '3px' }}>
                    Click avatar to change photo • Voice guidance
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {soniaAvatar && (
                  <button
                    onClick={resetSoniaAvatar}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '100px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: 'transparent',
                      color: '#a8a29e',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    title="Reset to default Sonia avatar"
                  >
                    <RefreshCw size={12} />
                    Reset Photo
                  </button>
                )}

                <button
                  onClick={toggleVoice}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '100px',
                    border: isVoiceEnabled ? '1px solid rgba(120,140,93,0.4)' : '1px solid rgba(255,255,255,0.12)',
                    backgroundColor: isVoiceEnabled ? 'rgba(120,140,93,0.15)' : 'transparent',
                    color: isVoiceEnabled ? '#788c5d' : '#a8a29e',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isVoiceEnabled ? <Mic size={14} /> : <MicOff size={14} />}
                  {isVoiceEnabled ? 'Active' : 'Disabled'}
                </button>
              </div>
            </div>

            {/* 2. AI Mentor Runtime & Cloud Provider */}
            <AIMentorSettings />

            {/* 3. Sound FX Engine & Profiles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f5f5f4' }}>
                    Typing & Interaction Audio
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#a8a29e', marginTop: '2px' }}>
                    Zero-latency mechanical keyboard typing and tactile clicks
                  </div>
                </div>

                <button
                  onClick={toggleSound}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '100px',
                    border: isSoundEnabled ? '1px solid rgba(217,119,87,0.4)' : '1px solid rgba(255,255,255,0.12)',
                    backgroundColor: isSoundEnabled ? 'rgba(217,119,87,0.15)' : 'transparent',
                    color: isSoundEnabled ? 'var(--accent-primary, #d97757)' : '#a8a29e',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isSoundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  {isSoundEnabled ? 'Sound On' : 'Muted'}
                </button>
              </div>

              {/* Volume Slider */}
              {isSoundEnabled && (
                <div style={{
                  backgroundColor: '#12110f',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <span style={{ fontSize: '0.8rem', color: '#a8a29e', minWidth: '60px' }}>Volume:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={soundVolume}
                    onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                    style={{
                      flex: 1,
                      accentColor: 'var(--accent-primary, #d97757)',
                      cursor: 'pointer',
                      height: '5px',
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f5f5f4', minWidth: '36px', textAlign: 'right' }}>
                    {Math.round(soundVolume * 100)}%
                  </span>
                </div>
              )}

              {/* 5 Sound Profiles Grid */}
              {isSoundEnabled && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                  {SOUND_PROFILES.map((p) => {
                    const isSelected = soundProfile === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSoundProfile(p.id)}
                        style={{
                          backgroundColor: isSelected ? 'rgba(217, 119, 87, 0.12)' : '#12110f',
                          border: isSelected ? '1px solid rgba(217, 119, 87, 0.45)' : '1px solid var(--border-subtle)',
                          borderRadius: '12px',
                          padding: '12px 14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isSelected ? '#f5f5f4' : '#d6d3d1' }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#78716c', marginTop: '2px' }}>
                              {p.desc}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check size={16} color="var(--accent-primary, #d97757)" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. Progression & Free Roam Mode */}
            <div style={{
              backgroundColor: '#12110f',
              borderRadius: '14px',
              padding: '18px 20px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f5f5f4', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Free Roam Mode</span>
                  <span style={{ fontSize: '0.65rem', backgroundColor: unlockAllLessons ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.06)', color: unlockAllLessons ? '#3b82f6' : '#78716c', padding: '2px 6px', borderRadius: '4px' }}>
                    {unlockAllLessons ? 'Unlocked' : 'Sequential'}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#a8a29e', marginTop: '3px' }}>
                  {unlockAllLessons ? 'All modules and lessons are accessible.' : 'Lessons unlock sequentially as you complete previous ones.'}
                </div>
              </div>

              <button
                onClick={toggleUnlockAll}
                style={{
                  padding: '8px 14px',
                  borderRadius: '100px',
                  border: unlockAllLessons ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.12)',
                  backgroundColor: unlockAllLessons ? 'rgba(59,130,246,0.15)' : 'transparent',
                  color: unlockAllLessons ? '#3b82f6' : '#a8a29e',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                }}
              >
                {unlockAllLessons ? <Unlock size={14} /> : <Lock size={14} />}
                {unlockAllLessons ? 'All Unlocked' : 'Locked Mode'}
              </button>
            </div>

            {/* 5. Keyboard Shortcuts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f5f5f4', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Keyboard size={16} color="var(--accent-primary, #d97757)" />
                <span>Editor Keyboard Shortcuts</span>
              </div>
              <div style={{
                backgroundColor: '#12110f',
                borderRadius: '12px',
                padding: '14px 16px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.8rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#a8a29e' }}>Format Code (Prettier)</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <kbd style={{ backgroundColor: '#262522', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace' }}>Ctrl+S</kbd>
                    <span style={{ color: '#78716c' }}>or</span>
                    <kbd style={{ backgroundColor: '#262522', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace' }}>Shift+Alt+F</kbd>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#a8a29e' }}>Duplicate Line Down</span>
                  <kbd style={{ backgroundColor: '#262522', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace' }}>Ctrl+D</kbd>
                </div>
              </div>
            </div>

            {/* 6. Progress backup — export/import */}
            <div style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f5f5f4' }}>
                  Backup Progress
                </div>
                <div style={{ fontSize: '0.75rem', color: '#78716c', marginTop: '2px' }}>
                  Progress is stored only in this browser. Export a copy or restore one.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={handleExportProgress}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))',
                    color: '#d6d3d1',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Export
                </button>
                <button
                  onClick={handleImportProgressClick}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))',
                    color: '#d6d3d1',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Import
                </button>
                <input
                  ref={progressFileInputRef}
                  type="file"
                  accept="application/json"
                  onChange={handleImportProgressFile}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {/* 7. Window Controls Mode Selector (Always Visible vs On Hover) */}
            <div style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f5f5f4' }}>
                  Top-Left Window Controls
                </div>
                <div style={{ fontSize: '0.78rem', color: '#78716c', marginTop: '2px' }}>
                  Choose whether window controls stay visible permanently or slide in when hovered
                </div>
              </div>

              <div style={{
                display: 'inline-flex',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                padding: '3px',
                borderRadius: '9px',
                border: '1px solid var(--border-subtle)',
                gap: '4px',
              }}>
                <button
                  type="button"
                  onClick={() => setWindowControlsVisibility('always')}
                  style={{
                    padding: '6px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: windowControlsVisibility === 'always' ? 'var(--accent-primary)' : 'transparent',
                    color: windowControlsVisibility === 'always' ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Always Visible
                </button>
                <button
                  type="button"
                  onClick={() => setWindowControlsVisibility('hover')}
                  style={{
                    padding: '6px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: windowControlsVisibility === 'hover' ? 'var(--accent-primary)' : 'transparent',
                    color: windowControlsVisibility === 'hover' ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  On Hover
                </button>
              </div>
            </div>

            {/* 8. Danger Zone / Reset Progress */}
            <div style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f5f5f4' }}>
                  Learning Progress
                </div>
                <div style={{ fontSize: '0.75rem', color: '#78716c', marginTop: '2px' }}>
                  {completedLessons.length} of {TOTAL_LESSONS} lessons completed
                </div>
              </div>

              <button
                onClick={handleResetProgress}
                style={{
                  background: 'none',
                  border: '1px solid rgba(193, 95, 60, 0.3)',
                  color: '#c15f3c',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(193, 95, 60, 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <RotateCcw size={13} />
                Reset Progress
              </button>
            </div>

          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
