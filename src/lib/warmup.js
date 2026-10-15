import { transpileCode } from './localBundler';
import { formatCode } from './formatter';
import curriculum from '../curriculum/index';

/**
 * ReactLab Warmup Pipeline
 * Warms up all critical runtime services (Babel transpiler, Prettier standalone,
 * curriculum modules, and fonts) during the splash screen so the first interaction is instant.
 *
 * @param {(progress: number, stageText: string) => void} onProgress
 */
export async function warmupApp(onProgress = () => {}) {
  const report = (pct, text) => {
    try {
      onProgress(pct, text);
    } catch {}
  };

  // Stage 1: Critical Fonts & CSS (0% -> 25%)
  report(15, 'Loading system fonts & layout tokens...');
  try {
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      await document.fonts.ready;
    }
  } catch (e) {
    console.debug('[Warmup] Font ready check skipped:', e);
  }

  // Stage 2: Pre-warm Babel transpiler & AST parser (25% -> 50%)
  report(35, 'Warming offline React 19 compiler...');
  try {
    // Not decorative: this is the same transpiler the offline playground uses,
    // so warming it here is what keeps the first offline preview instant.
    const dummyCode = 'export default function Probe() { return <div className="warm">Warmup</div>; }';
    transpileCode(dummyCode, 'Probe.jsx');
  } catch (e) {
    console.debug('[Warmup] Compiler warm-up:', e);
  }

  // Stage 3: Pre-warm Prettier formatter (50% -> 75%)
  report(60, 'Initializing Prettier AST formatters...');
  try {
    await formatCode('function probe( ){ return 42; }', 'probe.js');
  } catch (e) {
    console.debug('[Warmup] Formatter warm-up:', e);
  }

  // Stage 4: Pre-warm the curriculum registry and every module payload (75% -> 95%)
  report(80, 'Caching curriculum modules & challenge validators...');
  try {
    // Load every curriculum module in parallel so navigation has no async delay.
    // Counted from the registry rather than hardcoded -- this said "14 modules"
    // for a long time after the course grew past that.
    const modulePromises = curriculum.map((mod) =>
      import(`../curriculum/modules/${mod.id}.js`).catch((err) => {
        console.warn(`[Warmup] Failed to preload module ${mod.id}:`, err);
      })
    );
    await Promise.all(modulePromises);
  } catch (e) {
    console.debug('[Warmup] Module caching:', e);
  }

  // Stage 5: Done (100%)
  report(100, 'Ready!');
  // Small micro-pause for smooth UI completion
  await new Promise((resolve) => setTimeout(resolve, 150));
}
