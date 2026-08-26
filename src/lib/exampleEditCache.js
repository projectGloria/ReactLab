// The learner's playground edits, per lesson.
//
// This used to be an in-memory Map capped at 15 entries, which meant every
// experiment was gone the moment the app closed -- and, because a Map evicts in
// insertion order, the lesson you had been editing all session could be dropped
// in favour of one you opened once. It now writes through to localStorage, so
// edits survive a restart, and evicts the least recently *used* entry.
//
// The in-memory Map stays as the read path: it is hit on every keystroke by the
// Sandpack cacher, and parsing JSON that often is wasteful.

const STORAGE_KEY = 'reactlab.playgroundEdits.v1';
const MAX_CACHE_SIZE = 60;

const exampleEditCache = new Map();
let hydrated = false;

function storage() {
  try {
    // Absent in the Node test environment; blocked outright in some browser
    // privacy modes, where merely touching the property throws.
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function hydrate() {
  if (hydrated) return;
  hydrated = true;
  const store = storage();
  if (!store) return;
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return;
    for (const [lessonId, files] of Object.entries(parsed)) {
      if (files && typeof files === 'object') exampleEditCache.set(lessonId, files);
    }
  } catch {
    // Corrupt or half-written payload: start clean rather than breaking every
    // playground on the way in.
    try { store.removeItem(STORAGE_KEY); } catch { /* nothing else to try */ }
  }
}

function persist() {
  const store = storage();
  if (!store) return;
  const entries = [...exampleEditCache.entries()];
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(entries)));
    return;
  } catch {
    // Out of quota, most likely.
  }
  // Retry with progressively fewer entries, dropping the least recently used
  // first. This trims only what gets *written* -- the in-memory cache is left
  // whole, because a storage failure must not cost the learner an edit they
  // just made.
  for (let keep = Math.floor(entries.length / 2); keep >= 1; keep = Math.floor(keep / 2)) {
    try {
      store.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(entries.slice(-keep))));
      return;
    } catch { /* try a smaller slice */ }
  }
  // Nothing persists this round; the session still has everything in memory.
}

export function getCachedExample(lessonId) {
  hydrate();
  const files = exampleEditCache.get(lessonId);
  if (files === undefined) return undefined;
  // Re-insert so this counts as recently used, and eviction takes the entry
  // nobody has opened in longest.
  exampleEditCache.delete(lessonId);
  exampleEditCache.set(lessonId, files);
  return files;
}

export function cacheExample(lessonId, files) {
  hydrate();
  exampleEditCache.delete(lessonId);
  while (exampleEditCache.size >= MAX_CACHE_SIZE) {
    exampleEditCache.delete(exampleEditCache.keys().next().value);
  }
  exampleEditCache.set(lessonId, files);
  persist();
}

export function clearCachedExample(lessonId) {
  hydrate();
  if (exampleEditCache.delete(lessonId)) persist();
}
