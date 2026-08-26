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
import modernReact from './modules/modern-react.js';
import typescript from './modules/typescript.js';
import debugging from './modules/debugging.js';
import capstones from './modules/capstones.js';
export const MODULES_MAP = { 'js-fundamentals':jsFundamentals,'fundamentals':fundamentals,'mental-models':mentalModels,'forms':forms,'sharing-state':sharingState,'advanced-state':advancedState,'custom-hooks':customHooks,'side-effects':sideEffects,'intermediate':intermediate,'testing':testing,'routing':routing,'state-scale':stateScale,'performance':performance,'advanced':advanced,'modern-react':modernReact,'typescript':typescript,'debugging':debugging,'capstones':capstones } 
export function getModuleData(moduleId) { return MODULES_MAP[moduleId] || null; }
