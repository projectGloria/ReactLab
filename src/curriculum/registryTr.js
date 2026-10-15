// Turkish lesson overlays, mirroring `registry.js`'s hand-written map.
//
// A module appears here only once it has translated lessons. Modules that are
// absent -- and lessons absent from a module that is present -- fall back to
// English, so this list grows one module at a time without ever leaving the app
// in a broken half-translated state.
import intro from './modules-tr/intro.js';
import jsFundamentals from './modules-tr/js-fundamentals.js';
import fundamentals from './modules-tr/fundamentals.js';

export const MODULES_MAP_TR = {
  'intro': intro,
  'js-fundamentals': jsFundamentals,
  'fundamentals': fundamentals,
};
