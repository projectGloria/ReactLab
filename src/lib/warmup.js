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
    // Run an initial Babel compilation to warm up the AST engine and module scopes
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

  // Stage 4: Pre-warm curriculum registry and all 14 module payloads into memory cache (75% -> 95%)
  report(80, 'Caching curriculum modules & challenge validators...');
  try {
    // Dynamically load all 14 curriculum modules in parallel so navigation has zero async network delay
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
