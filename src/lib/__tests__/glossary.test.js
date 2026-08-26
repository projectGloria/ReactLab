import { describe, it, expect } from 'vitest';
import babel from '@babel/standalone';
import { GLOSSARY_TERMS } from '../glossary.js';

// The glossary drives the hover explainers in the lecture text, so a broken
// entry shows up mid-sentence rather than on some settings screen.

const entries = Object.entries(GLOSSARY_TERMS);

describe('glossary', () => {
  it('has entries', () => {
    expect(entries.length).toBeGreaterThan(50);
  });

  for (const [key, data] of entries) {
    describe(key, () => {
      it('is keyed by the lowercase phrase the matcher looks for', () => {
        expect(key).toBe(key.toLowerCase());
        expect(key.trim()).toBe(key);
      });

      it('has every field the tooltip renders', () => {
        for (const field of ['term', 'category', 'definition', 'mentalModel', 'code', 'whyItMatters']) {
          expect(typeof data[field], `${key}.${field}`).toBe('string');
          expect(data[field].length, `${key}.${field}`).toBeGreaterThan(0);
        }
      });

      it('has a code example that parses', () => {
        // The tooltip colours this with the shared tokenizer. A snippet that
        // cannot be parsed is also one the reader cannot trust.
        expect(() =>
          babel.transform(data.code, { presets: ['react'], filename: 'glossary.jsx' }),
        ).not.toThrow();
      });
    });
  }

  it('avoids terms that are ordinary English words', () => {
    // The matcher cannot tell "React Context" from "in the context of", so
    // ambiguous single words are deliberately kept out. An explainer popping up
    // on the wrong sense is worse than none.
    const banned = ['context', 'generic', 'transition', 'fragment', 'dispatch', 'spread', 'mount', 'identity', 'primitive', 'key', 'state', 'props'];
    const present = banned.filter((word) => Object.hasOwn(GLOSSARY_TERMS, word));
    expect(present).toEqual([]);
  });

  it('keeps every key short enough to appear in running prose', () => {
    const tooLong = entries.filter(([key]) => key.split(/\s+/).length > 4).map(([key]) => key);
    expect(tooLong).toEqual([]);
  });

  it('has aliases that are lowercase and do not collide', () => {
    // Aliases let "hoisted" open the Hoisting card. Two entries claiming the
    // same surface form would make which one wins depend on object order.
    const seen = new Map();
    const collisions = [];
    for (const [key, data] of entries) {
      for (const surface of [key, ...(data.aliases || [])]) {
        expect(surface, `${key}: alias must be lowercase`).toBe(surface.toLowerCase());
        if (seen.has(surface)) collisions.push(`${surface}: ${seen.get(surface)} and ${key}`);
        seen.set(surface, key);
      }
    }
    expect(collisions).toEqual([]);
  });
});
