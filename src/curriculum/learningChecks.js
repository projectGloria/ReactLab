import { EXTENDED_LEARNING_CHECKS } from './learningCheckExtensions.js';

const BASE_LEARNING_CHECKS = {
  state: [
    {
      id: 'state-predict-render',
      stage: 'prediction',
      type: 'choice',
      prompt: 'What will the button display after one click?',
      code: "const [count, setCount] = useState(0);\n\nfunction handleClick() {\n  setCount(count + 1);\n  setCount(count + 1);\n}",
      options: ['0', '1', '2', 'It depends on the browser'],
      answer: '1',
      feedback: 'Both updates read the same count from this render. React batches the updates, so both requests ask for the next value 1.',
      modelAnswer: '1',
    },
    {
      id: 'state-explain-functional-update',
      stage: 'explain',
      type: 'text',
      prompt: 'Explain why the functional updater form is safer when the next state depends on the previous state.',
      minLength: 20,
      feedback: 'A strong explanation mentions that the updater receives the latest queued state rather than closing over one render’s snapshot.',
      modelAnswer: 'Use setCount(previous => previous + 1) when updates depend on prior state, because React can apply each updater to the latest queued value.',
    },
    {
      id: 'state-transfer-object',
      stage: 'transfer',
      type: 'text',
      prompt: 'You store a user object with name and age. What must you preserve when changing only the age?',
      minLength: 14,
      feedback: 'The key idea is that object state is replaced, not automatically merged. Preserve the other fields with a copy.',
      modelAnswer: 'Call setUser(previous => ({ ...previous, age: nextAge })) so the name and other fields remain intact.',
    },
  ],
  'js-variables': [
    {
      id: 'js-variables-explain-closure',
      stage: 'explain',
      type: 'text',
      prompt: 'Why does a loop using `var` and `setTimeout` print the same final number multiple times, while `let` prints 0, 1, 2?',
      minLength: 20,
      feedback: '`var` creates one function-scoped variable shared across iterations, whereas `let` creates a distinct block-scoped binding per iteration.',
      modelAnswer: '`var` is function-scoped so all timeout callbacks share one binding that reaches the final loop value; `let` creates a fresh lexical binding on each iteration.',
    },
  ],
  'jsx-intro': [
    {
      id: 'jsx-intro-explain-classname',
      stage: 'explain',
      type: 'text',
      prompt: 'Why does JSX require `className` instead of `class` for assigning CSS classes?',
      minLength: 16,
      feedback: 'JSX compiles to JavaScript where `class` is a reserved keyword; `className` maps directly to the DOM property.',
      modelAnswer: 'React DOM uses `className` as the JSX prop corresponding to the element class property.',
    },
  ],
  'js-template-literals': [
    {
      id: 'js-template-transfer-jsx',
      stage: 'transfer',
      type: 'text',
      prompt: 'How do template literals simplify dynamic class or style strings in React?',
      minLength: 16,
      feedback: 'Template literals allow clean string interpolation like `className={`btn ${active ? "active" : ""}`}` without clunky string concatenation.',
      modelAnswer: 'They allow dynamic variable interpolation inside string templates without fragile string concatenation operators.',
    },
  ],
  'js-array-methods': [
    {
      id: 'js-array-explain-map',
      stage: 'explain',
      type: 'text',
      prompt: 'Why must you use `.map()` rather than `.forEach()` when rendering a list in JSX?',
      minLength: 16,
      feedback: '.map() returns a new array of JSX elements; .forEach() returns undefined and produces no rendered output.',
      modelAnswer: '.map() returns an array of transformed elements that React can render, whereas .forEach() returns undefined.',
    },
  ],
  events: [
    {
      id: 'events-explain-invoke-vs-ref',
      stage: 'explain',
      type: 'text',
      prompt: 'Why does `onClick={handleClick()}` cause bugs compared to `onClick={handleClick}`?',
      minLength: 16,
      feedback: 'Parentheses call the function immediately during the render phase instead of passing a callback reference for user clicks.',
      modelAnswer: 'Invoking the function with parentheses executes it immediately during render instead of passing a callback to run on click.',
    },
  ],
  conditional: [
    {
      id: 'conditional-transfer-unmount',
      stage: 'transfer',
      type: 'text',
      prompt: 'What is the key functional difference between conditionally rendering with a ternary vs CSS `display: none`?',
      minLength: 18,
      feedback: 'Conditional rendering unmounts the component and resets its state, whereas `display: none` keeps the DOM node and state alive.',
      modelAnswer: 'Conditional rendering unmounts the component from the tree and clears state; CSS display:none keeps state and DOM nodes mounted.',
    },
  ],
  props: [
    {
      id: 'props-predict-flow',
      stage: 'prediction',
      type: 'choice',
      prompt: 'Where should the value that is displayed in both components live?',
      code: 'Parent\n├─ SearchInput\n└─ ResultsList',
      options: ['Inside SearchInput only', 'Inside ResultsList only', 'In the closest common parent', 'In a module-level variable'],
      answer: '2',
      feedback: 'Shared state belongs in the closest common parent that needs to coordinate the child components.',
      modelAnswer: 'In the closest common parent.',
    },
    {
      id: 'props-explain-one-way',
      stage: 'explain',
      type: 'text',
      prompt: 'Why does React prefer one-way data flow from parent to child instead of letting a child mutate a prop directly?',
      minLength: 20,
      feedback: 'Look for predictability: one owner changes the value, and the new value flows down again.',
      modelAnswer: 'One owner makes updates traceable. A child requests a change through a callback, while the parent remains responsible for the state.',
    },
    {
      id: 'props-transfer-callback',
      stage: 'transfer',
      type: 'text',
      prompt: 'Design the prop contract for a child button that asks its parent to remove an item. Name the prop and describe its argument.',
      minLength: 18,
      feedback: 'The child should receive a callback such as onRemove and pass an item identifier back to the owner.',
      modelAnswer: 'Use a prop such as onRemove(itemId); the child calls it, and the parent updates its owned list.',
    },
  ],
  'lists-and-keys': [
    {
      id: 'keys-predict-reuse',
      stage: 'prediction',
      type: 'choice',
      prompt: 'A checked first row is removed while the remaining rows use index keys. What is the most likely problem?',
      code: "items.map((item, index) => (\n  <Row key={index} item={item} />\n))",
      options: ['React cannot render the list', 'The wrong row may retain the checked state', 'The list becomes immutable', 'The browser reloads the page'],
      answer: '1',
      feedback: 'Index keys describe positions, not item identity. After removal, React may reuse a row instance for a different item.',
      modelAnswer: 'The wrong row may retain the checked state.',
    },
    {
      id: 'keys-explain-identity',
      stage: 'explain',
      type: 'text',
      prompt: 'Explain what a good key tells React that the array position does not.',
      minLength: 18,
      feedback: 'A good answer connects the key to stable identity across renders, insertion, removal, and reordering.',
      modelAnswer: 'A stable key identifies the same logical item across renders, allowing React to preserve or reset the correct component state.',
    },
    {
      id: 'keys-transfer-reset',
      stage: 'transfer',
      type: 'text',
      prompt: 'How could you intentionally reset a form when switching between two profiles?',
      minLength: 16,
      feedback: 'A key can intentionally make React treat the form as a new component when the profile identity changes.',
      modelAnswer: 'Render the form with key={profile.id}; changing the key resets the form state for the new profile.',
    },
  ],
  'use-effect': [
    {
      id: 'effect-classify-derived',
      stage: 'prediction',
      type: 'choice',
      prompt: 'Where should a full name derived from first and last name usually be calculated?',
      code: "const [first, setFirst] = useState('Ada');\nconst [last, setLast] = useState('Lovelace');",
      options: ['In render as a normal expression', 'In a useEffect that sets more state', 'In a module-level singleton', 'Only after a button click'],
      answer: '0',
      feedback: 'A value derivable from current props or state belongs in render. Adding an Effect creates redundant state and another render pass.',
      modelAnswer: 'In render as a normal expression.',
    },
    {
      id: 'effect-explain-external',
      stage: 'explain',
      type: 'text',
      prompt: 'What makes an operation a genuine Effect rather than ordinary render logic or an event handler?',
      minLength: 20,
      feedback: 'The defining idea is synchronization with something outside React, such as a subscription, timer, DOM API, or network connection.',
      modelAnswer: 'An Effect synchronizes React with an external system; pure calculations belong in render and user-caused actions belong in event handlers.',
    },
    {
      id: 'effect-transfer-cleanup',
      stage: 'transfer',
      type: 'text',
      prompt: 'A component subscribes to a chat room whenever roomId changes. What must cleanup do before the next subscription?',
      minLength: 18,
      feedback: 'Cleanup should disconnect or unsubscribe the previous external resource so old listeners do not continue receiving events.',
      modelAnswer: 'Disconnect the previous room subscription before connecting to the new room and when the component unmounts.',
    },
  ],
  components: [
    {
      id: 'components-predict-tree',
      stage: 'prediction',
      type: 'choice',
      prompt: 'What is the primary reason to split a large UI into components?',
      code: 'Dashboard\n├─ Sidebar\n├─ Toolbar\n└─ ResultsPanel',
      options: ['To create more files regardless of size', 'To give each part a clear responsibility and reusable boundary', 'To avoid writing JSX', 'To make every component stateful'],
      answer: '1',
      feedback: 'A useful component boundary makes responsibility, data flow, and reuse easier to understand and change.',
      modelAnswer: 'To give each part a clear responsibility and reusable boundary.',
    },
    {
      id: 'components-explain-composition',
      stage: 'explain',
      type: 'text',
      prompt: 'Explain how composition lets a parent customize a reusable component without the component knowing every possible use case.',
      minLength: 20,
      feedback: 'Mention passing content or behavior through props, especially children, instead of hard-coding every variant.',
      modelAnswer: 'The parent supplies content or behavior through props such as children, while the reusable component owns the shared layout and behavior.',
    },
    {
      id: 'components-transfer-boundary',
      stage: 'transfer',
      type: 'text',
      prompt: 'Name one signal that a component boundary is probably in the wrong place.',
      minLength: 14,
      feedback: 'Good signals include duplicated state, excessive prop threading, or a component that has multiple unrelated responsibilities.',
      modelAnswer: 'Excessive prop drilling, duplicated state, or unrelated responsibilities are signs the boundary should be reconsidered.',
    },
  ],
};



Object.assign(BASE_LEARNING_CHECKS, {
  'rendering-model': [{ id:'rendering-model-predict', stage:'prediction', type:'choice', prompt:'Why do three setCount(count + 1) calls usually produce one increment?', options:['Each call mutates count immediately','All three updates read the same render snapshot','React ignores duplicate updates','The browser batches DOM clicks'], answer:'1', feedback:'Each update reads the count captured by the current render. Functional updaters can consume the queued state one by one.', modelAnswer:'They all read the same render snapshot, so each requests the same next value.' }],
  'state-or-derived': [{ id:'state-derived-transfer', stage:'transfer', type:'text', prompt:'Give one reason to avoid storing a value that can be derived from existing state.', minLength:20, feedback:'Mention duplicate sources of truth and synchronization bugs.', modelAnswer:'Derived values can be calculated during render, so extra state creates a second source of truth.' }],
  'state-ownership': [{ id:'state-ownership-predict', stage:'prediction', type:'choice', prompt:'Two sibling components both need to read and change the same value. Where should that state live?', options:['In whichever sibling renders first','Duplicated in useState in both siblings','In their nearest common parent component','In a module-level variable outside React'], answer:'2', feedback:'Siblings cannot read each other’s local state directly, so the value has to live in the lowest component that is an ancestor of both.', modelAnswer:'It should be lifted up to the nearest shared parent and passed down to both siblings as props.' }],
  'identity-and-keys': [{ id:'identity-keys-explain', stage:'explain', type:'text', prompt:'Why can changing a key intentionally reset local component state?', minLength:20, feedback:'Explain that the key changes component identity from React’s perspective.', modelAnswer:'A changed key gives the component a new identity, so React replaces the previous instance and its local state starts fresh.' }],
  'pure-rendering': [{ id:'pure-rendering-explain', stage:'explain', type:'text', prompt:'Why can mutating a module-level variable during render cause bugs that only show up sometimes?', minLength:20, feedback:'Mention that React can call a component function more than once, out of order, or discard a render — pure calculations survive that safely, but mutations do not.', modelAnswer:'React may render a component more than once (Strict Mode, retries, concurrent features) or discard a render without committing it, and a mutation still happens even for renders that never reach the screen.' }],
  'event-vs-effect': [{ id:'event-effect-transfer', stage:'transfer', type:'text', prompt:'Name one action that belongs in an event handler rather than an Effect.', minLength:12, feedback:'Good examples include submitting, deleting, or responding directly to a click.', modelAnswer:'Submitting an order in response to a button click belongs in the click handler.' }],
  'effect-events': [{ id:'effect-events-explain', stage:'explain', type:'text', prompt:'Why is useEffectEvent not a general way to silence dependency warnings?', minLength:25, feedback:'It is for genuinely event-like logic fired from an Effect.', modelAnswer:'Effect Events separate event-like logic from synchronization; hiding real dependencies can hide bugs.' }],
  'react-compiler': [{ id:'compiler-transfer', stage:'transfer', type:'text', prompt:'What should you investigate before manually adding memoization?', minLength:20, feedback:'Mention measurement and architecture before optimization.', modelAnswer:'Measure the bottleneck first and determine whether state ownership or component boundaries can remove the work.' }],
  'accessibility-and-testing': [{ id:'accessibility-role', stage:'prediction', type:'choice', prompt:'Which is the strongest default for a clickable action?', options:['div with onClick','button','span with tabindex=0','p with role=button'], answer:'1', feedback:'A native button provides semantics, keyboard behavior, focus behavior, and an accessible role.', modelAnswer:'button' }],
  'use-sync-external-store': [{ id:'use-sync-external-store-explain', stage:'explain', type:'text', prompt:'Why can a useState + useEffect subscription to an external value cause "tearing" under concurrent rendering, when useSyncExternalStore cannot?', minLength:25, feedback:'Mention that React can render more than once for one update, and useSyncExternalStore guarantees every read during that process sees a consistent snapshot.', modelAnswer:'React may render a component tree more than once for a single update under concurrent rendering. A useState-based subscription has no way to guarantee every part of the tree reads the same value during that process, so different components can briefly disagree — useSyncExternalStore is specifically designed to prevent that.' }],
  'router-loaders': [{ id:'router-loaders-predict', stage:'prediction', type:'choice', prompt:'A route has a loader attached. When does React Router call it, relative to the route\'s component rendering?', options:['After the component renders, like useEffect', 'Before the component renders, as part of navigating to that route', 'Only when the component calls useLoaderData()', 'Only once, the first time the app loads'], answer:'1', feedback:'The loader runs as part of navigation, before the route\'s element is rendered — that is what lets the component skip its own loading state.', modelAnswer:'Before the component renders — the loader runs as part of navigating to the route, and the component only renders once the loader has resolved.' }],
  'testing-error-boundaries': [{ id:'testing-error-boundaries-explain', stage:'explain', type:'text', prompt:'Why should a test for an Error Boundary render the buggy component inside the same ErrorBoundary the real app uses, rather than asserting that rendering it throws?', minLength:25, feedback:'Mention that production code never sees a raw uncaught throw, since the boundary catches it first — the test should match that shape.', modelAnswer:'In production, the ErrorBoundary always catches the error before it becomes an uncaught throw, so a real user only ever sees the fallback UI. The test should render the same boundary and assert on the fallback, matching what actually happens, instead of asserting on an exception the boundary exists specifically to prevent from surfacing.' }]
});

// Checks that complete the prediction/explain/transfer model for lessons that
// previously carried only one or two stages, plus the three capstones, which have
// no code challenge and so rely entirely on these to report weakness to Review Lab.
// Applied AFTER the merge below and concatenated rather than spread, because these
// lessons' existing checks are split across both source objects — a spread would
// silently replace the originals for whichever file already defined them.
const STAGE_COMPLETIONS = {
  'rendering-model': [
    { id:'rendering-model-explain-snapshot', stage:'explain', type:'text', prompt:'An event handler calls `await` and then reads a state variable. Why does it see the value from before the await rather than the current one?', minLength:25, feedback:'The handler did not move to a newer render — it is still executing inside the one that created it.', modelAnswer:'The handler closes over the values from the render snapshot that created it, and awaiting suspends inside that closure rather than re-reading the binding, so it still sees the captured value even after newer renders have happened.' },
    { id:'rendering-model-transfer-timeout', stage:'transfer', type:'text', prompt:'A `setTimeout` callback needs the state as it is when the timeout fires, not as it was when the timeout was scheduled. What do you change?', minLength:20, feedback:'The scheduled callback keeps the snapshot it was created in, so you need a way to reach past it.', modelAnswer:'Read the latest value through a ref, or use the functional updater form so the callback receives the queued state instead of the snapshot captured when the timeout was scheduled.' },
  ],
  'state-or-derived': [
    { id:'state-derived-predict-init', stage:'prediction', type:'choice', prompt:'The user edits the first name. What does `fullName` show on the next render?', code:"const [first, setFirst] = useState('Ada');\nconst [last, setLast] = useState('Lovelace');\nconst [fullName, setFullName] = useState(first + ' ' + last);\n\nfunction handleFirst(next) {\n  setFirst(next);\n}", options:['It updates automatically to match', 'It still shows the original "Ada Lovelace"', 'React throws a stale-state warning', 'Both name fields reset to empty'], answer:'1', feedback:'The argument to useState is an initial value, not a live binding. It was read once on the first render and nothing recomputes it afterwards.', modelAnswer:'It still shows the original "Ada Lovelace", because useState only read that value once on the first render.' },
    { id:'state-derived-explain-truth', stage:'explain', type:'text', prompt:'Storing a derived value in state creates a second source of truth. Describe the specific failure that follows from that.', minLength:25, feedback:'The problem is not performance — it is that correctness now depends on remembering something.', modelAnswer:'The copy and the original can disagree, because every code path that changes the source has to remember to update the derived copy too; miss one and the UI shows stale data with no error to point at it.' },
  ],
  'state-ownership': [
    { id:'state-ownership-explain-tradeoff', stage:'explain', type:'text', prompt:'Why does lifting state up sometimes make a component harder to reuse, and what are you trading away?', minLength:25, feedback:'Lifting is not free. Name what the child loses.', modelAnswer:'Lifting moves control to the parent, so the child can no longer be dropped in anywhere without a parent supplying that value and its setter; you trade the child’s independence for a single shared source of truth.' },
    { id:'state-ownership-transfer-split', stage:'transfer', type:'text', prompt:'A form field’s draft text is needed only by that field, but a submit button in the parent needs to know whether the form is dirty. Where does each piece live?', minLength:20, feedback:'Ownership is decided per value, not per component.', modelAnswer:'Keep the draft text local to the field since nothing else reads or changes it, and lift only the dirty flag up to the parent that owns submission.' },
  ],
  'identity-and-keys': [
    { id:'identity-keys-predict-remount', stage:'prediction', type:'choice', prompt:'The user types in the profile editor, switches to settings, then switches back. What is in the profile editor now?', code:"{tab === 'profile'\n  ? <Editor key=\"profile\" draft={profileDraft} />\n  : <Editor key=\"settings\" draft={settingsDraft} />}", options:['The text they typed, preserved', 'Empty — the previous instance was destroyed when the key changed', 'Whatever was typed in the settings editor', 'React warns about duplicate keys'], answer:'1', feedback:'Different keys mean different identities. Switching tabs unmounts one Editor and mounts a fresh one, so local state is discarded rather than preserved.', modelAnswer:'Empty — changing the key destroys the old instance along with its local state.' },
    { id:'identity-keys-transfer-sort', stage:'transfer', type:'text', prompt:'A sortable list keys its rows by array index, and each row holds an open/closed detail toggle. What goes wrong after sorting, and what fixes it?', minLength:25, feedback:'Ask what an index actually identifies: a position, or an item?', modelAnswer:'An index identifies a position rather than an item, so after sorting React reuses each instance for different data and the toggle state stays with the position instead of the row; key by a stable item id so identity follows the data.' },
  ],
  'pure-rendering': [
    { id:'pure-rendering-predict-strict', stage:'prediction', type:'choice', prompt:'Three Rows render in Strict Mode during development. How many entries does `renderLog` end up holding?', code:"let renderLog = [];\n\nfunction Row({ label }) {\n  renderLog.push(label);\n  return <li>{label}</li>;\n}", options:['Three', 'Six, because Strict Mode double-invokes components in development', 'Zero', 'One per commit, so one'], answer:'1', feedback:'Strict Mode calls components twice in development precisely to surface this: a pure component produces identical JSX either way, but a mutation happens twice and shows up.', modelAnswer:'Six — Strict Mode double-invokes components in development, which exposes the impure push.' },
    { id:'pure-rendering-transfer-logging', stage:'transfer', type:'text', prompt:'You want to log every time a component actually appears on screen. Where does that logging go, and why not in the render body?', minLength:20, feedback:'Not every render reaches the screen.', modelAnswer:'Put it in an Effect, which runs after React commits; a render body can run for renders that are repeated or discarded, so logging there counts renders the user never saw.' },
  ],
  'event-vs-effect': [
    { id:'event-effect-predict-relay', stage:'prediction', type:'choice', prompt:'What is the main problem with sending the order from this Effect instead of from the click handler?', code:"function handleClick() {\n  setSubmitted(true);\n}\n\nuseEffect(() => {\n  if (submitted) sendOrder(cart);\n}, [submitted]);", options:['The Effect cannot read cart', 'The send is tied to a state value rather than to the click, so anything that reproduces that state can trigger it again', 'Effects are not allowed to call async functions', 'React will batch the two updates into one'], answer:'1', feedback:'The click is a single moment that already happened. Encoding it as state and reacting to the state means the send is now caused by a value, and values can recur.', modelAnswer:'The send is tied to a state value rather than to the click itself, so anything that reproduces that state can trigger it again.' },
    { id:'event-effect-explain-cause', stage:'explain', type:'text', prompt:'An Effect and an event handler can contain byte-for-byte identical code. What decides which one is correct?', minLength:25, feedback:'The deciding question is about cause, not content.', modelAnswer:'Ask why the code runs: if it runs because the user did something specific, it belongs in the handler; if it runs because the component is on screen and has to stay in step with an external system, it belongs in an Effect.' },
  ],
  'use-ref': [
    { id:'use-ref-explain-render', stage:'explain', type:'text', prompt:'Why does React tell you not to read or write `ref.current` during render, when it is just a property on an ordinary object?', minLength:25, feedback:'Think about what React is allowed to do with a render it has not committed yet.', modelAnswer:'Touching it during render makes the render impure and its output dependent on mutation order, so React can no longer safely repeat, discard, or reorder renders; refs are meant to be read and written in handlers and Effects, after the render is committed.' },
  ],
  'use-reducer': [
    { id:'use-reducer-explain-pure', stage:'explain', type:'text', prompt:'A reducer only computes the next state from the previous state and an action. Why does it still have to be a pure function?', minLength:25, feedback:'React reserves the right to call it more than once for the same action.', modelAnswer:'React may call the reducer more than once for the same action, in Strict Mode or when replaying queued updates, so a fetch, a mutation, or a random value inside it would either happen twice or produce a different result each time.' },
  ],
  'use-memo': [
    { id:'use-memo-explain-insufficient', stage:'explain', type:'text', prompt:'Why can wrapping a value in useMemo still fail to stop a child re-rendering, even though the memoized value itself is stable?', minLength:25, feedback:'Memoizing one value does not memoize the component that receives it.', modelAnswer:'useMemo stabilizes one value, not the component; unless the child is wrapped in memo and every prop it receives is also referentially stable, a single inline object or arrow function in the same JSX still hands it a changed prop.' },
  ],
  'use-sync-external-store': [
    { id:'use-sync-external-store-predict-snapshot', stage:'prediction', type:'choice', prompt:'`getSnapshot` is called on every render. What happens if it builds and returns a fresh object each time?', options:['React caches the result automatically', 'React sees a changed snapshot every render and re-renders in a loop', 'The subscription silently stops firing', 'Nothing — snapshots are compared field by field'], answer:'1', feedback:'React compares snapshots with Object.is, so a newly built object always compares unequal and React concludes the store changed on every single render.', modelAnswer:'React sees a new value every render and re-renders in an infinite loop.' },
    { id:'use-sync-external-store-transfer-online', stage:'transfer', type:'text', prompt:'You want a component to re-render when the browser goes online or offline. Name the two functions you supply and what each is responsible for.', minLength:25, feedback:'One answers how to hear about changes, the other answers what the value is right now.', modelAnswer:'A subscribe function that registers a listener for the online and offline events and returns a cleanup that removes it, and a getSnapshot function that returns navigator.onLine as the current value.' },
  ],
  'testing-error-boundaries': [
    { id:'testing-error-boundaries-predict-noise', stage:'prediction', type:'choice', prompt:'A test renders a throwing component inside an ErrorBoundary. The fallback assertion passes, but the output is full of red console noise. Why?', options:['The boundary failed to catch the error', 'React logs caught render errors to the console by design, even when a boundary handles them', 'The assertion ran before the boundary had rendered', 'jsdom cannot render fallback UI'], answer:'1', feedback:'React still reports the error so it is never silently swallowed during development. The noise is expected; the passing assertion is the real signal.', modelAnswer:'React deliberately logs the caught error to the console even though the boundary handled it.' },
    { id:'testing-error-boundaries-transfer-placement', stage:'transfer', type:'text', prompt:'Your app has a single ErrorBoundary at the root, and a widget in the sidebar crashes. What does the user see, and how would you change the placement?', minLength:25, feedback:'A boundary defines a failure domain, and the nearest one wins.', modelAnswer:'The entire app is replaced by the root fallback because that is the nearest boundary; wrap the sidebar widget in its own boundary so the failure stays contained and the rest of the page keeps working.' },
  ],
  'router-loaders': [
    { id:'router-loaders-explain-nostate', stage:'explain', type:'text', prompt:'Why does moving a fetch from `useEffect` into a route loader remove the loading state rather than just relocating it?', minLength:25, feedback:'The loading state exists because of an ordering constraint. Name the constraint.', modelAnswer:'An Effect cannot start until the component has already rendered once, so an empty first render is unavoidable; a loader runs during navigation, before the route element renders, so the component’s first render already has its data.' },
    { id:'router-loaders-transfer-waterfall', stage:'transfer', type:'text', prompt:'A dashboard renders three panels that each fetch in their own Effect, and the requests fire one after another. How do loaders change this, and what has to change structurally?', minLength:25, feedback:'Name both the win and the cost of switching APIs.', modelAnswer:'A route loader can request all three in parallel before the route renders, collapsing the waterfall into roughly one round trip, but it requires the data router API with createBrowserRouter and RouterProvider instead of the declarative Routes API.' },
  ],
  'effect-events': [
    { id:'effect-events-predict-count', stage:'prediction', type:'choice', prompt:'The user changes the theme five times without ever leaving the room. How many times does `logVisit` run?', code:"const onVisit = useEffectEvent(() => {\n  logVisit(roomId, theme);\n});\n\nuseEffect(() => {\n  onVisit();\n}, [roomId]);", options:['Five, once per theme change', 'Once — theme is read inside an Effect Event, so it never becomes a dependency', 'Zero, because the Effect never re-runs', 'Six'], answer:'1', feedback:'The Effect Event reads the latest theme at the moment it is called, but does not make the Effect reactive to it. Only roomId can re-trigger the Effect.', modelAnswer:'Once — theme is read inside the Effect Event, so changing it never re-triggers the Effect.' },
    { id:'effect-events-transfer-split', stage:'transfer', type:'text', prompt:'An Effect reconnects a chat room and also needs to show a toast using the current user’s display name. Which part goes where, and why?', minLength:25, feedback:'Split by reactivity: what it synchronizes with versus what it merely reads.', modelAnswer:'The connection stays in the Effect with roomId as its dependency, and the toast moves into an Effect Event so it reads the latest display name without a name change forcing the room to reconnect.' },
  ],
  'react-compiler': [
    { id:'react-compiler-predict-impure', stage:'prediction', type:'choice', prompt:'With the React Compiler enabled, what is the most likely outcome for this component?', code:"let cache = {};\n\nfunction Row({ item }) {\n  cache[item.id] = item.name;\n  return <li>{item.name}</li>;\n}", options:['It is memoized normally — the Compiler rewrites the mutation away', 'The Compiler may skip optimizing it, because the render body mutates state outside itself', 'It fails to compile entirely', 'The mutation is converted into a useState call automatically'], answer:'1', feedback:'The Compiler’s guarantees only hold for components that follow the Rules of React. A render body that mutates shared state opts out of the very optimization it was hoping to receive.', modelAnswer:'The Compiler may skip optimizing it, because the render body mutates shared state outside itself.' },
    { id:'react-compiler-explain-causes', stage:'explain', type:'text', prompt:'The Compiler automates memoization. Why does understanding what causes a re-render still matter?', minLength:25, feedback:'Distinguish how often work re-runs from what triggers the render in the first place.', modelAnswer:'The Compiler decides how often work re-runs, not what causes a component to render; state owned too high, unstable keys, or context that changes too broadly still re-render a subtree, and automatic memoization does not repair the architecture that triggered it.' },
  ],
  'accessibility-and-testing': [
    { id:'accessibility-explain-label', stage:'explain', type:'text', prompt:'A `<span>` sits directly above an input and visually reads as its label. Why does a screen reader still announce the input as unlabeled?', minLength:25, feedback:'Layout is not structure. The relationship has to exist somewhere other than on screen.', modelAnswer:'Visual proximity creates no programmatic relationship; the accessibility tree only sees an association made by a label htmlFor pointing at the input’s id, or an aria-label, so without one the input simply has no accessible name.' },
    { id:'accessibility-transfer-error', stage:'transfer', type:'text', prompt:'A validation error appears under a text input. What must be true for a screen reader user to hear it, and how would you test that?', minLength:25, feedback:'Rendering the text is not the same as associating it with the field.', modelAnswer:'The error element needs an id referenced by the input’s aria-describedby so it is announced with the field, and the test should find the input by its accessible role and name and assert on that description rather than asserting the error text exists somewhere in the DOM.' },
  ],
  'capstone-dashboard': [
    { id:'capstone-dashboard-predict-derived', stage:'prediction', type:'choice', prompt:'Your dashboard shows a filtered list and a "showing X of Y" counter. A reviewer asks why the counter is not held in state. What is the strongest answer?', options:['Storing it would be measurably slower', 'It is computable from the list and the filter, so storing it adds a second source of truth that can disagree', 'Counters are not allowed in useState', 'It would break React Testing Library queries'], answer:'1', feedback:'This is the rubric line about no redundant derived state: if a value can be calculated during render, storing it creates a synchronization obligation you never needed to take on.', modelAnswer:'It is derivable from the list and the filter, so storing it creates a second source of truth that can drift out of sync.' },
    { id:'capstone-dashboard-explain-lowest', stage:'explain', type:'text', prompt:'The rubric asks you to defend every state boundary. What makes the lowest common parent the right home for a shared filter, rather than the top of the app?', minLength:30, feedback:'Name what hoisting further up actually costs.', modelAnswer:'The lowest component that is an ancestor of every consumer gives them all one source of truth while keeping the re-render surface and the prop threading as small as possible; hoisting higher re-renders more of the tree and adds plumbing without buying anything.' },
    { id:'capstone-dashboard-transfer-tests', stage:'transfer', type:'text', prompt:'Your tests assert on CSS class names and internal state values, and they break every time you restyle a component. Restate the testing strategy the rubric is asking for.', minLength:30, feedback:'A test should fail when behaviour changes, not when markup does.', modelAnswer:'Query the way a user finds things, by role, label, and visible text, and assert on rendered output and behaviour after interaction, so a test only fails when user-visible behaviour changes rather than when markup or styling is refactored.' },
  ],
  'capstone-production-app': [
    { id:'capstone-production-predict-copy', stage:'prediction', type:'choice', prompt:'An issue list comes from the server. A reviewer finds a `useState` holding a copy of it, refreshed by an Effect after each fetch. What breaks first in production?', options:['Nothing — this is the standard pattern', 'The copy goes stale whenever the cache updates from anywhere else, so two screens disagree about the same issue', 'TypeScript refuses to compile it', 'MSW can no longer intercept the request'], answer:'1', feedback:'Server state already has an owner: the cache. Copying it into local state creates a second version that no mutation or invalidation knows to update.', modelAnswer:'The local copy goes stale when the cache updates elsewhere, so two screens disagree about the same data.' },
    { id:'capstone-production-explain-optimistic', stage:'explain', type:'text', prompt:'Optimistic UI shows a result before the server confirms it. Why must that value be treated as temporary UI state rather than as the new truth?', minLength:30, feedback:'Think about what rollback requires you to have kept separate.', modelAnswer:'The server can still reject the mutation, so the optimistic value is only a prediction; keeping it distinct from server data is exactly what makes rollback possible, and treating it as canonical leaves the UI showing something that never actually happened.' },
    { id:'capstone-production-transfer-record', stage:'transfer', type:'text', prompt:'Write the decision-record entry for one value in your app: name it, assign its category (local, URL, server, context, or external store), and justify why the neighbouring categories were rejected.', minLength:40, feedback:'The rubric wants the rejected alternatives justified, not just the winner named.', modelAnswer:'A strong entry names the value, assigns one category, and rejects the alternatives with reasons: the active filter is URL state because it must survive a reload and be shareable as a link, which local state cannot do, and it is not server state because no caching, retry, or invalidation is involved.' },
  ],
  'capstone-modern-react': [
    { id:'capstone-modern-predict-boundary', stage:'prediction', type:'choice', prompt:'You mark a component `’use client’` so it can hold state. It imports and renders a large data-formatting module. What is the consequence?', options:['The formatting module stays on the server', 'The module is pulled into the client bundle too, because a client component’s imports ship with it', 'Server Components can no longer render that component', 'The Compiler removes the unused import'], answer:'1', feedback:'The boundary is a bundling boundary, not only an execution one. Everything a client component imports travels with it, which is why the boundary belongs as low in the tree as it can go.', modelAnswer:'The module ships to the client as well, because a client component’s imports are bundled along with it.' },
    { id:'capstone-modern-explain-rejected', stage:'explain', type:'text', prompt:'The rubric asks you to document why a simpler boundary was rejected for each advanced API. Why is that more valuable than demonstrating the API works?', minLength:30, feedback:'Working code shows the what. Something else has to record the why.', modelAnswer:'Making an API work only proves it runs; naming the simpler option you rejected proves you understood the problem well enough to compare solutions, and it is the record that stops the next developer from deleting or duplicating the boundary without knowing what it was there for.' },
    { id:'capstone-modern-transfer-activity', stage:'transfer', type:'text', prompt:'A settings panel is hidden when the user switches tabs, but re-opening it must preserve scroll position and unsaved input without keeping its data subscriptions alive. Which boundary, and why not the two obvious alternatives?', minLength:40, feedback:'Both obvious answers satisfy one half of the requirement and fail the other.', modelAnswer:'Use Activity in hidden mode: unmounting discards the unsaved input and scroll position, while hiding with CSS display none leaves subscriptions and timers running, and Activity is the option that preserves state while tearing down Effects.' },
  ],
};

const mergedChecks = { ...BASE_LEARNING_CHECKS, ...EXTENDED_LEARNING_CHECKS };
for (const [lessonId, additions] of Object.entries(STAGE_COMPLETIONS)) {
  mergedChecks[lessonId] = [...(mergedChecks[lessonId] || []), ...additions];
}

// LearningChecks.jsx walks a lesson's checks in array order and announces the next
// one as "Continue to <stage>", so the array order *is* the sequence the learner
// experiences. Sort it into the intended prediction -> explain -> transfer
// progression: predict the behaviour, explain the mechanism, then transfer it to a
// new situation. Array.prototype.sort is stable, so lessons carrying more than one
// check of the same stage keep their authored relative order.
const STAGE_ORDER = { prediction: 0, explain: 1, transfer: 2 };
for (const lessonId of Object.keys(mergedChecks)) {
  mergedChecks[lessonId] = [...mergedChecks[lessonId]].sort(
    (a, b) => (STAGE_ORDER[a.stage] ?? 99) - (STAGE_ORDER[b.stage] ?? 99)
  );
}

export const LEARNING_CHECKS = mergedChecks;

