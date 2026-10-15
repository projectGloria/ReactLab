// Client for the TypeScript worker: one worker for the whole app, created the
// first time a TypeScript lesson asks for it and kept alive afterwards, because
// the language service's parsed lib declarations are the expensive part.
import { useEffect, useRef, useState } from 'react';

let workerPromise = null;
let nextRequestId = 1;
const pending = new Map();

async function getWorker() {
  if (!workerPromise) {
    workerPromise = import('../workers/typecheck.worker.js?worker&inline')
      .then(({ default: TypecheckWorker }) => {
        const worker = new TypecheckWorker();
        worker.onmessage = (event) => {
          const { id, diagnostics, error } = event.data || {};
          const resolve = pending.get(id);
          if (!resolve) return;
          pending.delete(id);
          resolve({ diagnostics: diagnostics || [], error: error || null });
        };
        return worker;
      })
      .catch((error) => {
        // A missing worker must not take the lesson down with it. The editor
        // still runs the code; it just cannot say what tsc would have said.
        console.error('[typecheck] worker unavailable:', error);
        return null;
      });
  }
  return workerPromise;
}

export async function typeCheck(code) {
  const worker = await getWorker();
  if (!worker) return { diagnostics: [], error: 'unavailable' };

  const id = nextRequestId++;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    worker.postMessage({ id, code });
  });
}

/**
 * Debounced diagnostics for one piece of code.
 *
 * `status` is 'idle' before the first result, 'checking' while a request is in
 * flight, 'ready' once diagnostics are current, and 'unavailable' if the worker
 * could not be created at all — which the UI shows rather than silently
 * reporting zero errors, since "no errors" and "no checker" look identical.
 */
export default function useTypeCheck(code, enabled = true, delay = 500) {
  const [result, setResult] = useState({ diagnostics: [], status: 'idle' });
  // Results can arrive out of order after a fast edit; only the newest counts.
  const latest = useRef(0);

  useEffect(() => {
    if (!enabled || typeof code !== 'string' || code.trim().length === 0) {
      setResult({ diagnostics: [], status: 'idle' });
      return undefined;
    }

    const run = latest.current + 1;
    latest.current = run;
    setResult((previous) => ({ ...previous, status: 'checking' }));

    const timer = setTimeout(() => {
      typeCheck(code).then(({ diagnostics, error }) => {
        if (latest.current !== run) return;
        setResult({ diagnostics, status: error === 'unavailable' ? 'unavailable' : 'ready' });
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [code, enabled, delay]);

  return result;
}
