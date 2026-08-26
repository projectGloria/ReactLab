/**
 * ReactLab Ultra-Low Latency Sound FX Engine
 * Pre-rendered AudioBuffers for instantaneous (0ms) tactile clicks & mechanical typing.
 */

let audioCtx = null;
const bufferCache = {};

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      initPreRenderedBuffers(audioCtx);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Warm up audio context on first interaction
if (typeof window !== 'undefined') {
  const warmUp = () => {
    getAudioContext();
    window.removeEventListener('pointerdown', warmUp);
    window.removeEventListener('keydown', warmUp);
  };
  window.addEventListener('pointerdown', warmUp, { once: true, passive: true });
  window.addEventListener('keydown', warmUp, { once: true, passive: true });
}

/**
 * Pre-render short click & thock buffers in memory to eliminate all runtime synthesis lag
 */
function initPreRenderedBuffers(ctx) {
  try {
    // 1. Mechanical Mouse Switch Click (14ms)
    bufferCache['click_mechanical'] = createClickBuffer(ctx, (t, i, len) => {
      const snap = Math.sin(2 * Math.PI * 3400 * t) * Math.exp(-t * 260);
      const thud = Math.sin(2 * Math.PI * 260 * t) * Math.exp(-t * 180);
      return snap * 0.6 + thud * 0.4;
    }, 0.014);

    // 2. Creamy Haptic Glass Tap (16ms)
    bufferCache['click_creamy'] = createClickBuffer(ctx, (t, i, len) => {
      const thock = Math.sin(2 * Math.PI * (220 - t * 4000) * t) * Math.exp(-t * 190);
      return thock * 0.9;
    }, 0.016);

    // 3. Cyberpunk HUD Tick (12ms)
    bufferCache['click_cyberpunk'] = createClickBuffer(ctx, (t, i, len) => {
      const tick = (Math.sin(2 * Math.PI * 1600 * t) > 0 ? 1 : -1) * Math.exp(-t * 320);
      return tick * 0.55;
    }, 0.012);

    // 4. Typewriter Latch (14ms)
    bufferCache['click_typewriter'] = createClickBuffer(ctx, (t, i, len) => {
      const noise = (Math.random() * 2 - 1) * Math.exp(-t * 280);
      const metallic = Math.sin(2 * Math.PI * 2800 * t) * Math.exp(-t * 350);
      return noise * 0.5 + metallic * 0.5;
    }, 0.014);

    // 5. Water Droplet Tick (16ms)
    bufferCache['click_water'] = createClickBuffer(ctx, (t, i, len) => {
      const freq = 650 + t * 40000;
      return Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 180) * 0.8;
    }, 0.016);
  } catch {
    // Ignore audio pre-render glitches
  }
}

function createClickBuffer(ctx, formula, duration = 0.015) {
  const sampleRate = ctx.sampleRate;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, numSamples, sampleRate);
  const channelData = buffer.getChannelData(0);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    channelData[i] = formula(t, i, numSamples);
  }
  return buffer;
}

export const SOUND_PROFILES = [
  { id: 'mechanical', name: 'Mechanical Thock', icon: '🖮', desc: 'Tactile switch with crisp plastic snap' },
  { id: 'creamy', name: 'Creamy ASMR', icon: '🧈', desc: 'Deep, dampened marble bubble thocks' },
  { id: 'cyberpunk', name: 'Cyberpunk HUD', icon: '🎮', desc: 'Opera GX-style futuristic digital blips' },
  { id: 'typewriter', name: 'Vintage Typewriter', icon: '📜', desc: 'Metallic mechanical hammer strikes' },
  { id: 'water', name: 'Water Droplets', icon: '💧', desc: 'Soothing organic droplet pops' },
];

class SoundEngine {
  constructor() {
    this.enabled = true;
    this.volume = 0.45;
    this.profile = 'mechanical';
  }

  setEnabled(val) {
    this.enabled = val;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  setProfile(profileId) {
    this.profile = profileId;
  }

  /**
   * Ultra-fast zero-latency click playback via pre-rendered AudioBuffer
   */
  playClick() {
    if (!this.enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const key = `click_${this.profile}`;
      const buffer = bufferCache[key] || bufferCache['click_mechanical'];
      if (!buffer) return;

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      // Random micro-pitch for natural tactile feel
      source.playbackRate.value = 0.96 + Math.random() * 0.08;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(this.volume * 0.35, ctx.currentTime);

      source.connect(gain);
      gain.connect(ctx.destination);

      source.start();
    } catch {
      // Ignore
    }
  }

  /**
   * Keystroke mechanical sound generator
   */
  playKeyClick(key = 'a') {
    if (!this.enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume * 0.38, now);
      masterGain.connect(ctx.destination);

      const pitchJitter = 0.94 + Math.random() * 0.12;

      switch (this.profile) {
        case 'creamy': {
          let baseFreq = key === ' ' ? 160 : key === 'Enter' ? 190 : 250;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq * 1.8 * pitchJitter, now);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, now + 0.045);

          gain.gain.setValueAtTime(0.95, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 850;

          osc.connect(gain);
          gain.connect(filter);
          filter.connect(masterGain);

          osc.start(now);
          osc.stop(now + 0.045);
          break;
        }
        case 'cyberpunk': {
          let baseFreq = key === ' ' ? 650 : key === 'Enter' ? 880 : 740;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq * pitchJitter, now);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.4 * pitchJitter, now + 0.03);

          gain.gain.setValueAtTime(0.7, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 0.03);
          break;
        }
        case 'typewriter': {
          if (key === 'Enter') {
            const bellOsc = ctx.createOscillator();
            const bellGain = ctx.createGain();
            bellOsc.type = 'sine';
            bellOsc.frequency.setValueAtTime(2400, now);
            bellGain.gain.setValueAtTime(0.6, now);
            bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            bellOsc.connect(bellGain);
            bellGain.connect(masterGain);
            bellOsc.start(now);
            bellOsc.stop(now + 0.35);
            return;
          }

          const buffer = bufferCache['click_typewriter'];
          if (buffer) {
            const src = ctx.createBufferSource();
            src.buffer = buffer;
            src.playbackRate.value = pitchJitter;
            src.connect(masterGain);
            src.start();
          }
          break;
        }
        case 'water': {
          let baseFreq = key === ' ' ? 400 : key === 'Enter' ? 550 : 620;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq * 0.7 * pitchJitter, now);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2 * pitchJitter, now + 0.022);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5 * pitchJitter, now + 0.05);

          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.8, now + 0.008);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }
        case 'mechanical':
        default: {
          let baseFreq = key === ' ' ? 220 : key === 'Enter' ? 290 : 420;
          const duration = 0.038;

          const highOsc = ctx.createOscillator();
          const highGain = ctx.createGain();
          highOsc.type = 'triangle';
          highOsc.frequency.setValueAtTime(baseFreq * 2.6 * pitchJitter, now);
          highOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + duration);
          highGain.gain.setValueAtTime(0.8, now);
          highGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
          highOsc.connect(highGain);
          highGain.connect(masterGain);

          const lowOsc = ctx.createOscillator();
          const lowGain = ctx.createGain();
          lowOsc.type = 'sine';
          lowOsc.frequency.setValueAtTime(baseFreq * 1.1 * pitchJitter, now);
          lowOsc.frequency.exponentialRampToValueAtTime(75, now + duration * 1.3);
          lowGain.gain.setValueAtTime(0.9, now);
          lowGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 1.3);
          lowOsc.connect(lowGain);
          lowGain.connect(masterGain);

          highOsc.start(now);
          lowOsc.start(now);
          highOsc.stop(now + duration);
          lowOsc.stop(now + duration * 1.3);
          break;
        }
      }
    } catch {
      // Ignore
    }
  }
}

export const sounds = new SoundEngine();
export const soundEffects = sounds;
export default sounds;
