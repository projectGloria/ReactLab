import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// The playground edit cache holds the learner's own work, so its two promises
// are worth pinning: edits survive a restart, and the entry evicted under
// pressure is the one nobody has opened in longest.

function fakeStorage({ failWrites = false } = {}) {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      if (failWrites) throw new Error('QuotaExceededError');
      map.set(k, v);
    },
    removeItem: (k) => map.delete(k),
    _map: map,
  };
}

/** Fresh module instance, so the in-memory Map starts empty each time. */
async function loadCache(storage) {
  vi.resetModules();
  if (storage) vi.stubGlobal('localStorage', storage);
  else vi.unstubAllGlobals();
  return import('../exampleEditCache.js');
}

describe('exampleEditCache', () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => vi.unstubAllGlobals());

  it('returns undefined for a lesson with no saved edits', async () => {
    const cache = await loadCache(fakeStorage());
    expect(cache.getCachedExample('nothing-here')).toBeUndefined();
  });

  it('round-trips edits through storage so they survive a restart', async () => {
    const store = fakeStorage();
    const first = await loadCache(store);
    first.cacheExample('js-template-literals', { '/App.js': 'const a = 1;' });

    // A new module instance with the same storage stands in for a restart.
    const second = await loadCache(store);
    expect(second.getCachedExample('js-template-literals')).toEqual({ '/App.js': 'const a = 1;' });
  });

  it('forgets a lesson when its playground is reset', async () => {
    const store = fakeStorage();
    const cache = await loadCache(store);
    cache.cacheExample('use-effect', { '/App.js': 'edited' });
    cache.clearCachedExample('use-effect');
    expect(cache.getCachedExample('use-effect')).toBeUndefined();

    const afterRestart = await loadCache(store);
    expect(afterRestart.getCachedExample('use-effect')).toBeUndefined();
  });

  it('evicts the least recently used lesson, not the oldest written', async () => {
    const cache = await loadCache(fakeStorage());
    for (let i = 0; i < 60; i++) cache.cacheExample(`lesson-${i}`, { '/App.js': `code ${i}` });

    // Touch the very first entry, then push the cache one over its limit.
    expect(cache.getCachedExample('lesson-0')).toEqual({ '/App.js': 'code 0' });
    cache.cacheExample('lesson-60', { '/App.js': 'code 60' });

    expect(cache.getCachedExample('lesson-0')).toEqual({ '/App.js': 'code 0' });
    expect(cache.getCachedExample('lesson-1')).toBeUndefined();
  });

  it('keeps working in memory when storage refuses to write', async () => {
    const cache = await loadCache(fakeStorage({ failWrites: true }));
    cache.cacheExample('use-ref', { '/App.js': 'edited' });
    expect(cache.getCachedExample('use-ref')).toEqual({ '/App.js': 'edited' });
  });

  it('starts clean rather than throwing on a corrupt payload', async () => {
    const store = fakeStorage();
    store.setItem('reactlab.playgroundEdits.v1', '{not json');
    const cache = await loadCache(store);
    expect(cache.getCachedExample('anything')).toBeUndefined();
    expect(store.getItem('reactlab.playgroundEdits.v1')).toBeNull();
  });

  it('works with no storage at all', async () => {
    const cache = await loadCache(null);
    cache.cacheExample('use-memo', { '/App.js': 'edited' });
    expect(cache.getCachedExample('use-memo')).toEqual({ '/App.js': 'edited' });
  });
});
