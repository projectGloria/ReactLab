// v2 — 2026-09-14 — registry metadata now wins over payload metadata.
//
// A module payload carries its own `title`/`description`, and so does the entry
// in `index.js`. Nothing kept them in step, so they drifted: 3 module titles, 13
// module descriptions and 7 lesson titles disagreed. The sidebar reads the
// registry and the lesson header reads the payload, so a learner could see
// "Identity, Keys & Remounts" in the nav and "Reconciliation Rules & Key
// Remounts" at the top of the same page.
//
// `index.js` is documented as the single source of truth for module order and
// numbering, so it is the source of truth for the names too. Payload metadata is
// kept only as a fallback for anything the registry does not specify.
import curriculum from './index.js';
import intro from './modules/intro.js';
import jsFundamentals from './modules/js-fundamentals.js';
import fundamentals from './modules/fundamentals.js';
import mentalModels from './modules/mental-models.js';
import forms from './modules/forms.js';
import sharingState from './modules/sharing-state.js';
import advancedState from './modules/advanced-state.js';
import customHooks from './modules/custom-hooks.js';
import sideEffects from './modules/side-effects.js';
import intermediate from './modules/intermediate.js';
import testing from './modules/testing.js';
import routing from './modules/routing.js';
import stateScale from './modules/state-scale.js';
import performance from './modules/performance.js';
import advanced from './modules/advanced.js';
import reactServer from './modules/react-server.js';
import modernReact from './modules/modern-react.js';
import tsFundamentals from './modules/ts-fundamentals.js';
import typescript from './modules/typescript.js';
import debugging from './modules/debugging.js';
import capstones from './modules/capstones.js';

const PAYLOADS = { 'intro':intro,'js-fundamentals':jsFundamentals,'fundamentals':fundamentals,'mental-models':mentalModels,'forms':forms,'sharing-state':sharingState,'advanced-state':advancedState,'custom-hooks':customHooks,'side-effects':sideEffects,'intermediate':intermediate,'testing':testing,'routing':routing,'state-scale':stateScale,'performance':performance,'advanced':advanced,'react-server':reactServer,'modern-react':modernReact,'ts-fundamentals':tsFundamentals,'typescript':typescript,'debugging':debugging,'capstones':capstones };

function applyRegistryMetadata(moduleId, payload) {
  const entry = curriculum.find((m) => m.id === moduleId);
  if (!entry) return payload;

  const titleById = new Map((entry.lessons || []).map((l) => [l.id, l.title]));
  return {
    ...payload,
    title: entry.title || payload.title,
    description: entry.description || payload.description,
    icon: entry.icon || payload.icon,
    lessons: (payload.lessons || []).map((lesson) => {
      const registryTitle = titleById.get(lesson.id);
      return registryTitle ? { ...lesson, title: registryTitle } : lesson;
    }),
  };
}

export const MODULES_MAP = Object.fromEntries(
  Object.entries(PAYLOADS).map(([id, payload]) => [id, applyRegistryMetadata(id, payload)]),
);

export function getModuleData(moduleId) { return MODULES_MAP[moduleId] || null; }
