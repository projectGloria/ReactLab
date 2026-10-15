// Which lesson introduces which concept, and how to spot that concept in code.
//
// The curriculum had no notion of a prerequisite. `dependencies` on a lesson is
// Sandpack's npm list, not a teaching order, and the only gating was linear:
// finish lesson N to unlock N+1. Nothing checked whether lesson N+1 used
// something lesson N+40 explains. So it drifted -- the JS module opened with JSX
// and `useState`, the custom-hooks module was built on an `useEffect` taught
// three modules later, and code splitting used a Suspense boundary introduced
// two lessons afterwards.
//
// Rather than hand-maintaining a `requires` list per lesson (which rots the
// moment a lesson's code is edited), each concept carries a detector. The
// validator scans the code a learner actually has to read and edit, and fails if
// a concept turns up before the lesson that teaches it.
//
// `detect` runs against code, not prose. Prose may legitimately mention what is
// coming ("you will meet Context in module 08"), and those are reported as
// warnings, not errors -- see PROSE_PREVIEW_OK below.

export const CONCEPTS = {
  imports: { label: 'import / export', taughtBy: 'modules-and-imports', detect: /^\s*(import\s|export\s)/m },
  jsx: { label: 'JSX', taughtBy: 'jsx-intro', detect: /<[A-Za-z][\w.]*(\s|\/|>)|<>/ },
  components: { label: 'components', taughtBy: 'components', detect: /<[A-Z]\w*(\s|\/|>)/ },
  props: { label: 'props', taughtBy: 'props', detect: /function\s+[A-Z]\w*\s*\(\s*\{|\bprops\./ },
  state: { label: 'useState', taughtBy: 'state', detect: /\buseState\s*\(/ },
  events: { label: 'event handlers', taughtBy: 'events', detect: /\son(Click|Change|Submit|Blur|Focus|KeyDown)=/ },
  lists: { label: 'list rendering with keys', taughtBy: 'lists-and-keys', detect: /\bkey=\{/ },
  effects: { label: 'useEffect', taughtBy: 'use-effect', detect: /\buseEffect\s*\(/ },
  layoutEffects: { label: 'useLayoutEffect', taughtBy: 'use-layout-effect', detect: /\buseLayoutEffect\s*\(/ },
  refs: { label: 'useRef', taughtBy: 'use-ref', detect: /\buseRef\s*\(/ },
  reducers: { label: 'useReducer', taughtBy: 'use-reducer', detect: /\buseReducer\s*\(/ },
  memoHook: { label: 'useMemo', taughtBy: 'use-memo', detect: /\buseMemo\s*\(/ },
  ids: { label: 'useId', taughtBy: 'use-id', detect: /\buseId\s*\(/ },
  context: { label: 'Context', taughtBy: 'use-context', detect: /\b(createContext|useContext)\s*\(/ },
  syncExternalStore: { label: 'useSyncExternalStore', taughtBy: 'use-sync-external-store', detect: /\buseSyncExternalStore\s*\(/ },
  errorBoundaries: { label: 'error boundaries', taughtBy: 'error-boundaries', detect: /componentDidCatch|getDerivedStateFromError/ },
  portals: { label: 'portals', taughtBy: 'portals', detect: /\bcreatePortal\s*\(/ },
  forwardRef: { label: 'forwardRef', taughtBy: 'forward-ref', detect: /\bforwardRef\s*[(<]/ },
  memoApi: { label: 'memo / useCallback', taughtBy: 'react-memo', detect: /\buseCallback\s*\(|\bmemo\s*\(\s*(function|\(|[A-Z])/ },
  router: { label: 'React Router', taughtBy: 'react-router', detect: /from\s+['"]react-router|<Route\b|<Link\b|\buseNavigate\s*\(/ },
  zustand: { label: 'Zustand', taughtBy: 'zustand', detect: /from\s+['"]zustand/ },
  reactQuery: { label: 'React Query', taughtBy: 'react-query', detect: /@tanstack\/react-query|\buseQuery\s*\(|\buseMutation\s*\(/ },
  suspense: { label: 'Suspense', taughtBy: 'suspense', detect: /<Suspense\b/ },
  lazy: { label: 'React.lazy', taughtBy: 'code-splitting', detect: /\blazy\s*\(\s*\(\s*\)\s*=>/ },
  transitions: { label: 'transitions', taughtBy: 'transitions', detect: /\buseTransition\s*\(|\bstartTransition\s*\(/ },
  deferredValue: { label: 'useDeferredValue', taughtBy: 'use-deferred-value', detect: /\buseDeferredValue\s*\(/ },
  serverComponents: { label: 'Server Components', taughtBy: 'server-components', detect: /['"]use (server|client)['"]/ },
  actions: { label: 'Actions', taughtBy: 'actions-api', detect: /\buseActionState\s*\(|\buseFormStatus\s*\(/ },
  optimistic: { label: 'useOptimistic', taughtBy: 'use-optimistic', detect: /\buseOptimistic\s*\(/ },
  effectEvents: { label: 'useEffectEvent', taughtBy: 'effect-events', detect: /\buseEffectEvent\s*\(/ },
  activity: { label: 'Activity', taughtBy: 'activity', detect: /<Activity\b/ },
  // Taught by the first lesson of `ts-fundamentals`, not by the first lesson
  // that types a component: the language module now comes first, and its object
  // types would otherwise read as "using TypeScript before TypeScript".
  typescript: { label: 'TypeScript', taughtBy: 'ts-annotations', detect: /\binterface\s+\w+\s*\{|\btype\s+\w+\s*=\s*\{|:\s*React\.\w+</ },
  testing: { label: 'testing', taughtBy: 'rtl-basics', detect: /\bdescribe\s*\(|\bexpect\s*\(|\bscreen\./ },
};

// Concepts a lesson may use in code before its own teaching lesson, each with
// the reason it is deliberate. Keep this list short: every entry is a place the
// reader meets something unexplained, and "it was already like that" is not a
// reason. An entry that no longer triggers is reported so it can be deleted.
export const ALLOWANCES = {
  // "Reusable component" is not demonstrable without passing something in: two
  // identical buttons do not show reuse. So this lesson shows a prop one lesson
  // before props are named, and its prose says so explicitly and points at the
  // next lesson. Showing before naming is fine; showing without naming is not.
  components: ['props'],
  // Same shape, in the other direction: state is only observable when something
  // changes it, and the smallest honest trigger is a button click. The lesson
  // introduces onClick in one sentence and hands it to the events lesson next.
  state: ['events'],
};

// Lessons whose *prose* may preview a later concept, because the text names the
// module it is coming from rather than assuming the reader knows it.
export const PROSE_PREVIEW_OK = true;

// Insight cards are side reading, and a few lessons exist precisely to motivate
// something that comes later -- the JS module's whole argument is "here is why
// React needs this", which cannot be made without showing React. Those cards are
// allowed to run ahead of the teaching order, and each lesson listed here says so
// in its own prose.
//
// Everything NOT listed here gets a warning when an insight uses a concept from a
// later lesson, because an unannounced forward reference in a card is how a reader
// ends up believing they missed something. Add a lesson here only after its text
// actually tells the reader what is coming.
export const INSIGHT_PREVIEW_OK = new Set([
  // The JS Fundamentals module is a bridge *to* React; its cards show the React
  // code each JS feature unlocks, and every one of them is framed that way.
  'js-variables',
  'js-arrow-functions',
  'js-template-literals',
  'js-destructuring',
  'js-spread-rest',
  'js-array-methods',
  'js-ternary',
  'js-promises',
  // Mental Models deliberately names the tool that comes later rather than
  // leaving the reader to invent a worse answer in the meantime.
  'state-or-derived',
  'pure-rendering',
  // Escape-hatch lessons that end by pointing at the production tool for the job.
  'data-fetching',
  // Cards that reach one module ahead and now say so in their own text. Each of
  // these names the lesson the concept belongs to before using it.
  'jsx-intro',            // components, taught next lesson
  'controlled-inputs',    // useRef, taught in State Architecture
  'per-field-validation', // useEffect, taught in the next module
  'use-ref',              // useEffect, for "when does this run"
  'use-memo',             // useEffect dependency arrays, same identity problem
]);

/** Concept keys whose detector fires anywhere in `code`. */
export function conceptsUsedIn(code) {
  if (typeof code !== 'string' || !code) return [];
  return Object.keys(CONCEPTS).filter((key) => CONCEPTS[key].detect.test(code));
}
