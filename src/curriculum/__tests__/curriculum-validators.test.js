import { describe, it, expect } from 'vitest';
import curriculum from '../index.js';
import { validators } from '../validators.js';

// Helper to normalize lesson code into { code, files } exactly as CodeActions does
function normalizeFiles(codePayload) {
  if (typeof codePayload === 'string') {
    return {
      code: codePayload,
      files: { '/App.jsx': { code: codePayload } }
    };
  }

  if (typeof codePayload === 'object' && codePayload !== null) {
    const entryPath = ['/App.js', '/App.tsx', '/App.jsx'].find(p => codePayload[p] !== undefined)
      ?? Object.keys(codePayload).find(p => !/\.test\.[jt]sx?$/.test(p) && !p.endsWith('.css'));
    const entryRaw = entryPath ? codePayload[entryPath] : '';
    const entryCode = typeof entryRaw === 'object' && entryRaw !== null ? entryRaw.code : (typeof entryRaw === 'string' ? entryRaw : '');
    const files = {};
    for (const [p, c] of Object.entries(codePayload)) {
      const codeStr = typeof c === 'object' && c !== null ? c.code : (typeof c === 'string' ? c : '');
      files[p] = { code: codeStr || '' };
    }
    return { code: entryCode, files };
  }

  return { code: '', files: {} };
}

describe('Curriculum & Validator Integrity', () => {
  // Dynamically load all module payloads and test each lesson
  for (const moduleMeta of curriculum) {
    describe(`Module: ${moduleMeta.title} (${moduleMeta.id})`, () => {
      it('has strictly matching lesson order between registry and module payload', async () => {
        const mod = (await import(`../modules/${moduleMeta.id}.js`)).default;
        const registryIds = moduleMeta.lessons.map(l => l.id);
        const payloadIds = mod.lessons.map(l => l.id);
        expect(payloadIds).toEqual(registryIds);
      });

      for (const lessonSummary of moduleMeta.lessons) {
        describe(`Lesson: ${lessonSummary.title} (${lessonSummary.id})`, () => {
          it('canonical solutionCode passes all validation rules', async () => {
            const mod = (await import(`../modules/${moduleMeta.id}.js`)).default;
            const lesson = mod.lessons.find(l => l.id === lessonSummary.id);
            expect(lesson).toBeDefined();

            const validatorConfig = validators[lesson.id];
            const rules = Array.isArray(validatorConfig) ? validatorConfig : validatorConfig?.rules;

            if (!rules || rules.length === 0) {
              return;
            }

            const { code, files } = normalizeFiles(lesson.solutionCode);

            for (let i = 0; i < rules.length; i++) {
              const rule = rules[i];
              const passed = rule.test(code, files);
              expect(passed, `Solution for "${lesson.id}" failed rule #${i + 1}: ${rule.message}`).toBe(true);
            }
          });

          it('starterCode fails at least one validation rule (unless observation lesson)', async () => {
            const validatorConfig = validators[lessonSummary.id];
            const isObservation = !Array.isArray(validatorConfig) && validatorConfig?.requiresObservation;

            if (isObservation) {
              return;
            }

            const mod = (await import(`../modules/${moduleMeta.id}.js`)).default;
            const lesson = mod.lessons.find(l => l.id === lessonSummary.id);
            expect(lesson).toBeDefined();

            const rules = Array.isArray(validatorConfig) ? validatorConfig : validatorConfig?.rules;
            if (!rules || rules.length === 0) {
              return;
            }

            const { code, files } = normalizeFiles(lesson.starterCode);

            const results = rules.map(rule => rule.test(code, files));
            const allPassed = results.every(res => res === true);

            expect(
              allPassed,
              `Starter code for "${lesson.id}" passes ALL validator rules! The starter must fail at least one rule so the student is required to complete the task.`
            ).toBe(false);
          });
        });
      }
    });
  }
});
