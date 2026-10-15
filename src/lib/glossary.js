/**
 * Comprehensive React & JS Glossary for Interactive Hover Explainers
 */

export const GLOSSARY_TERMS = {
  'mutable': {
    term: 'Mutable / Mutation',
    category: 'State & Memory',
    definition: 'A value or data structure whose internal contents can be changed in-place without creating a brand new reference in memory.',
    mentalModel: 'Editing a live shared Google Doc vs. creating a new versioned copy.',
    code: `// ❌ MUTATION (Breaks React re-renders):
const arr = [1, 2];
arr.push(3); // Same array reference, React won't detect change!

// ✅ IMMUTABLE (Triggers React re-render):
const newArr = [...arr, 3]; // New array reference created!`,
    whyItMatters: 'React relies on Object.is reference equality to know if state changed. Mutating state in-place prevents re-renders and breaks Time Travel / Concurrent mode.',
  },
  'immutable': {
    term: 'Immutable / Immutability',
    category: 'State & Memory',
    definition: 'Values that cannot be modified after they are created. To make changes, you produce a new copy with the modifications.',
    mentalModel: 'Taking a new photograph rather than drawing over an existing physical print.',
    code: `// ✅ Immutably updating an object in state:
setUser(prev => ({
  ...prev,
  name: 'Alice' // New object created
}));`,
    whyItMatters: 'Immutability ensures fast change detection, predictable component rendering, and safe concurrency in React 19.',
  },
  'closure': {
    term: 'Closure',
    category: 'JavaScript Core',
    definition: 'A function bundled together with references to its surrounding lexical state (scope), allowing it to remember variables from where it was created.',
    mentalModel: 'A backpack a function wears containing all variables that were in room when the function was born.',
    code: `function createCounter() {
  let count = 0;
  return function() {
    count++; // Accesses 'count' from outer scope even after createCounter finished!
    return count;
  };
}`,
    whyItMatters: 'React event handlers and useEffect callbacks form closures over state and props. Stale closures occur when an effect remembers an old render snapshot.',
  },
  'stale closure': {
    term: 'Stale Closure',
    category: 'React Lifecycle',
    definition: 'When a function captures variables from a past render snapshot and continues reading those outdated values instead of the latest component state.',
    mentalModel: 'Looking at yesterday’s printed weather forecast instead of checking today’s live sky.',
    code: `// ❌ STALE CLOSURE BUG:
useEffect(() => {
  const timer = setInterval(() => {
    // 'count' is forever frozen at 0 from mount!
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(timer);
}, []); // Missing [count] dep!

// ✅ FIX: Use functional state update
setCount(prev => prev + 1);`,
    whyItMatters: 'One of the most common React bugs in setInterval, event listeners, or async promises inside useEffect.',
  },
  'reconciliation': {
    term: 'Reconciliation',
    category: 'React Internals',
    definition: 'The algorithm React uses to diff the newly returned JSX element tree with the previous Virtual DOM tree to compute the minimal set of real DOM mutations.',
    mentalModel: 'A git diff algorithm comparing the old tree to the new tree and only committing changed lines.',
    code: `// React compares element type and key:
const before = <Button key="save" text="Save" />;
const after = <Button key="save" text="Saving..." />;

// Same type and key, so React updates the text prop
// rather than destroying and rebuilding the DOM node.`,
    whyItMatters: 'Understanding reconciliation explains why stable keys are vital for lists and why component types must remain static in render.',
  },
  'pure function': {
    term: 'Pure Function / Purity',
    category: 'Functional Programming',
    definition: 'A function that always returns the exact same output for identical arguments and produces zero observable side effects (no network calls, no DOM mutations, no variable mutations).',
    mentalModel: 'A formula in math like f(x) = 2x. 2 * 3 is always 6, and running it doesn\'t change your room temperature.',
    code: `// ❌ IMPURE — reads and mutates state outside the render
let guestCount = 0;
function ImpureCup() {
  guestCount++; // side effect during render!
  return <h2>Cup #{guestCount}</h2>;
}

// ✅ PURE — same input, same output, nothing else touched
function PureCup({ guestNumber }) {
  return <h2>Cup #{guestNumber}</h2>;
}`,
    whyItMatters: 'React component render functions must be pure. React can re-run render multiple times in Concurrent Mode and Strict Mode.',
  },
  'side effect': {
    term: 'Side Effect',
    category: 'React Lifecycle',
    definition: 'Any operation that reaches outside the component render calculation to modify the outside world (DOM mutations, timers, HTTP requests, analytics).',
    mentalModel: 'Cooking dinner (pure render calculation) vs. ordering takeout on your phone (side effect altering external state).',
    code: `// Side effects must live inside useEffect or Event Handlers:
useEffect(() => {
  document.title = \`You clicked \${count} times\`; // Side effect!
}, [count]);`,
    whyItMatters: 'Side effects placed directly in the component body run on every render pass and cause infinite loops or memory leaks.',
  },
  'declarative': {
    term: 'Declarative vs Imperative',
    category: 'Architecture',
    definition: 'Declarative programming describes WHAT the UI should look like given current state, whereas imperative programming lists step-by-step instructions on HOW to change the DOM.',
    mentalModel: 'Telling a GPS "Take me to Central Park" (declarative) vs. telling a driver "Turn left 100m, switch gear, brake" (imperative).',
    code: `// ❌ IMPERATIVE (jQuery style) — the steps to get there
const btn = document.getElementById('btn');
btn.classList.add('active');
btn.innerText = 'Loading...';

// ✅ DECLARATIVE (React style) — what it should look like
function SubmitButton({ isActive, isLoading }) {
  return (
    <button className={isActive ? 'active' : ''}>
      {isLoading ? 'Loading...' : 'Submit'}
    </button>
  );
}`,
    whyItMatters: 'React is declarative: you change state, and React handles mutating the underlying browser DOM elements automatically.',
  },
  'unidirectional data flow': {
    aliases: ['unidirectional', 'one-way data flow'],
    term: 'Unidirectional Data Flow',
    category: 'Architecture',
    definition: 'Data moves in one direction only: a parent passes values down to its children through props. A child cannot reach up and change its parent\'s data — it can only call a function the parent handed it.',
    mentalModel: 'Water flowing down a set of steps. It can only go downhill, so to find out where a puddle came from you walk upwards — there is exactly one path to check.',
    code: "function Parent() {\n  const [name, setName] = useState('Ada');\n  // Data goes down as a prop; a request to change it goes down as a function.\n  return <Child name={name} onRename={setName} />;\n}\n\nfunction Child({ name, onRename }) {\n  // The child cannot assign to name. It asks the owner to change it.\n  return <button onClick={() => onRename('Grace')}>{name}</button>;\n}",
    whyItMatters: 'When a value on screen is wrong, there is only one direction to search: upward, toward whoever owns it. This is what makes React bugs traceable rather than a hunt through everything that might have written to a shared object.',
  },
  'referential equality': {
    aliases: ['reference equality', 'object.is'],
    term: 'Referential Equality',
    category: 'JavaScript & Memory',
    definition: 'Comparing two variables to check if they point to the exact same location in memory (`Object.is(a, b)` or `a === b`), rather than comparing their values.',
    mentalModel: 'Comparing whether two keys open the exact same house lock vs. having two identical houses built on different streets.',
    code: `const a = { role: 'admin' };
const b = { role: 'admin' };
console.log(a === b); // FALSE! (Different memory addresses)

const c = a;
console.log(a === c); // TRUE! (Same memory address)`,
    whyItMatters: 'React hooks (useEffect, useMemo, React.memo) compare dependencies via referential equality. Passing inline `{}` or `[]` breaks memoization.',
  },
  'fiber': {
    term: 'React Fiber',
    category: 'React Internals',
    definition: 'React’s internal tree data structure representing a unit of work. Each Fiber node tracks component type, props, state, effects, and DOM pointers with pauseable scheduling.',
    mentalModel: 'A call stack with infinite undo/redo that can pause rendering when the user types, then resume background work.',
    code: `// Conceptual shape of a Fiber node:
const fiber = {
  type: ComponentFunction,
  memoizedState: hookStateList,
  child: childFiber,
  sibling: siblingFiber,
  return: parentFiber,
};`,
    whyItMatters: 'Fiber powers React 18 & 19 Concurrent features like `useTransition`, `Suspense`, and non-blocking background rendering.',
  },
  'synthetic event': {
    term: 'SyntheticEvent',
    category: 'React DOM',
    definition: 'A cross-browser wrapper around the browser’s native DOM event, providing identical event properties and behavior across Chrome, Safari, and Firefox.',
    mentalModel: 'A universal power plug adapter that lets any appliance plug into any country’s wall socket smoothly.',
    code: `function handleClick(e) {
  // 'e' is a React SyntheticEvent
  e.preventDefault();
  console.log(e.nativeEvent); // Access native browser Event
}`,
    whyItMatters: 'React attaches a single root event listener at the container level and delegates synthetic events for maximum performance.',
  },
  'batching': {
    term: 'Automatic Batching',
    category: 'State & Rendering',
    definition: 'When React groups multiple state updates into a single re-render pass for optimized performance.',
    mentalModel: 'Putting 3 items on a shopping list and going to the supermarket once, rather than driving to the store 3 separate times.',
    code: `function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  setText('done');
  // React 19 batches all 3 updates into ONLY 1 single re-render!
}`,
    whyItMatters: 'In React 18 and 19, automatic batching works everywhere: inside promises, setTimeout, native event listeners, and async functions.',
  },
  'hydration': {
    term: 'Hydration',
    category: 'SSR & Server Components',
    definition: 'The client-side process where React attaches event listeners and boots up interactivity on top of server-rendered static HTML.',
    mentalModel: 'Watering freeze-dried vegetables to bring them back to life and make them fresh and edible.',
    code: `// 1. Server sends fast HTML: <button id="btn">Click me</button>
// 2. Client browser loads JS bundle
// 3. React "hydrates": attaches onClick event listener to the existing button DOM node`,
    whyItMatters: 'Hydration mismatches happen when server HTML differs from client initial render (e.g. rendering `new Date()` or `window.innerWidth`).',
  },
  'prop drilling': {
    term: 'Prop Drilling',
    category: 'Component Architecture',
    definition: 'The process of passing props down through multiple intermediate components that do not need the data themselves, purely to reach a deeply nested child.',
    mentalModel: 'Passing a bucket of water through 10 people in a line just to water one plant at the end.',
    code: `// ❌ Prop drilling — every layer forwards a value it does not use
function Layout({ theme }) {
  return (
    <Sidebar theme={theme}>
      <Nav theme={theme}>
        <UserAvatar theme={theme} /> {/* only this one needed it */}
      </Nav>
    </Sidebar>
  );
}

// ✅ Fix with composition (<Nav><UserAvatar /></Nav>), Context, or a store.`,
    whyItMatters: 'Prop drilling clutters component interfaces. Fix it with Component Composition (`children`), Context, or lightweight global stores.',
  },
  'hoisting': {
    aliases: ['hoisted'],
    term: "Hoisting",
    category: "JavaScript Core",
    definition: "JavaScript moving a declaration to the top of its scope before any code runs, so the name exists before the line that declares it.",
    mentalModel: "The guest list is written before anyone arrives — but a `let` guest is on the list and still refused entry until they actually turn up.",
    code: `console.log(a); // undefined — var is hoisted AND initialised to undefined
var a = 1;

console.log(b); // ReferenceError — let is hoisted but NOT initialised
let b = 2;`,
    whyItMatters: "It is why `var` produces silent `undefined` bugs where `let` and `const` throw a clear error instead. The gap before a `let` is usable is called the temporal dead zone.",
  },
  'lexical scope': {
    term: "Lexical Scope",
    category: "JavaScript Core",
    definition: "The rule that a function can see the variables of the place it was *written*, not the place it was called from.",
    mentalModel: "A function remembers the room it was born in, no matter which room you carry it to.",
    code: `const name = 'outer';

function makeGreeter() {
  const name = 'inner';
  return () => name; // reads the name where it was written
}

makeGreeter()(); // 'inner', even though it is called from out here`,
    whyItMatters: "Lexical scope is what makes closures possible, and it is why an event handler sees the props and state of the render that created it rather than the current ones.",
  },
  'callback': {
    term: "Callback",
    category: "JavaScript Core",
    definition: "A function handed to some other code as a value, for that code to call later.",
    mentalModel: "Leaving your phone number: you are not calling anyone, you are describing how to reach you when something happens.",
    code: `// Passed, not called — note the missing ()
const good = <button onClick={handleClick}>Save</button>;

// Called immediately during render; React gets its return value
const bad = <button onClick={handleClick()}>Save</button>;`,
    whyItMatters: "Nearly every React API takes one: event handlers, Effect bodies, state updaters, `.map()` in a list. Calling instead of passing is the most common first-week mistake.",
  },
  'higher-order function': {
    aliases: ['higher-order'],
    term: "Higher-Order Function",
    category: "JavaScript Core",
    definition: "A function that takes a function as an argument, returns one, or both.",
    mentalModel: "A power tool that accepts interchangeable bits — the tool handles the motion, the bit decides what the motion does.",
    code: `// .map takes a function and decides when to call it
const doubled = [1, 2, 3].map(n => n * 2);

// A function that returns a function
const multiplyBy = factor => n => n * factor;
const triple = multiplyBy(3);`,
    whyItMatters: "`map`, `filter` and `reduce` are higher-order functions, and so is every custom hook that accepts a callback. It is the mechanism behind reusing behaviour without inheritance.",
  },
  'promise': {
    term: "Promise",
    category: "JavaScript Core",
    definition: "An object standing in for a value that does not exist yet, and will either resolve with a result or reject with an error.",
    mentalModel: "A cloakroom ticket. You cannot wear the ticket, but you can plan around what it will get you.",
    code: `const res = await fetch('/api/user'); // waits for the promise to settle
const user = await res.json();

// The same thing without await
fetch('/api/user')
  .then(res => res.json())
  .then(user => console.log(user));`,
    whyItMatters: "React 19 can consume promises directly with `use()`, and Suspense is built on a component throwing one. An Effect must never *be* async, because React expects its return value to be the cleanup function.",
  },
  'event loop': {
    term: "Event Loop",
    category: "JavaScript Core",
    definition: "The scheduler that runs your synchronous code to completion, then picks up queued work — timers, promise callbacks, events — one at a time.",
    mentalModel: "A single-lane road. Nothing overtakes; a long job blocks everything behind it, including painting.",
    code: `console.log('1');
setTimeout(() => console.log('3'), 0); // queued, not immediate
Promise.resolve().then(() => console.log('2'));
// Logs 1, 2, 3 — even with a 0ms timer`,
    whyItMatters: "JavaScript is single-threaded, so an expensive render blocks input and animation. That is the problem `startTransition` and concurrent rendering exist to manage.",
  },
  'truthy': {
    aliases: ['falsy'],
    term: "Truthy / Falsy",
    category: "JavaScript Core",
    definition: "How a non-boolean value behaves in a boolean position. Everything is truthy except `false`, `0`, `-0`, `0n`, `\"\"`, `null`, `undefined` and `NaN`.",
    mentalModel: "JavaScript asking \"is there anything here?\" rather than \"is this true?\"",
    code: `// The trap: 0 is falsy, but React still renders it
{count && <p>You have items</p>}   // renders a literal 0 when count is 0
{count > 0 && <p>You have items</p>} // renders nothing

// ?? falls back only on null/undefined; || also fires on '' and 0
const label = title ?? 'Untitled';`,
    whyItMatters: "The `{value && <JSX/>}` pattern is everywhere in React, and a numeric left-hand side is the classic way it goes wrong.",
  },
  'destructuring': {
    term: "Destructuring",
    category: "JavaScript Core",
    definition: "Syntax for pulling values out of an object or array into standalone variables in a single statement.",
    mentalModel: "Unpacking a box onto the table, so you reach for the thing itself rather than reaching into the box each time.",
    code: `// Objects match by name
const { name, role = 'Member' } = user;

// Arrays match by position — which is why you choose the names
const [count, setCount] = useState(0);

// In a parameter list, for props
function UserCard({ name, role }) { /* ... */ }`,
    whyItMatters: "It is how props are read and how `useState` returns two values. Array destructuring being positional is exactly why you can name your state anything.",
  },
  'template literal': {
    term: "Template Literal",
    category: "JavaScript Core",
    definition: "A string written in backticks that can embed expressions with `${...}` and span multiple lines.",
    mentalModel: "A fill-in-the-blank sentence, rather than gluing separate scraps of paper together.",
    code: `const message = \`Hello \${user}, you have \${count} items.\`;

// Common in JSX for conditional class names
<div className={\`card \${isActive ? 'card--active' : ''}\`} />`,
    whyItMatters: "JSX's `{expression}` works on the same idea: evaluate an expression and drop the result into the output.",
  },
  'arrow function': {
    term: "Arrow Function",
    category: "JavaScript Core",
    definition: "A compact function expression written `(args) => result`, which has no `this` of its own and inherits it from the surrounding scope.",
    mentalModel: "An employee who carries their own badge from home rather than borrowing whichever one is in the room.",
    code: `const add = (a, b) => a + b;          // implicit return

// Returning an object literal needs parentheses,
// or the braces are read as a function body
const makeUser = name => ({ name, active: true });`,
    whyItMatters: "Every inline event handler is one. The implicit return and the object-literal trap are both worth having in muscle memory.",
  },
  'race condition': {
    term: "Race Condition",
    category: "JavaScript Core",
    definition: "A bug whose outcome depends on which of several in-flight operations happens to finish first.",
    mentalModel: "Two letters posted a minute apart, arriving in the wrong order — and the last one on the mat wins.",
    code: `useEffect(() => {
  let cancelled = false;
  fetchUser(id).then(data => {
    if (!cancelled) setUser(data); // the stale response is ignored
  });
  return () => { cancelled = true; };
}, [id]);`,
    whyItMatters: "Switch quickly between two records and a slow first request can overwrite the second one's data, with no error anywhere. Effect cleanup is the fix.",
  },
  'render snapshot': {
    term: "Render Snapshot",
    category: "React Lifecycle",
    definition: "The fixed set of props and state a single render sees. It never changes; a new render produces a new one.",
    mentalModel: "A photograph, not a live video feed. Setting state does not edit the photo — it takes a new one.",
    code: `function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    // Still the OLD count — this render's snapshot
    setTimeout(() => alert(count), 3000);
  }
}`,
    whyItMatters: "It explains why a value inside a timer or a subscription looks frozen, and why the updater form `setCount(c => c + 1)` exists.",
  },
  'render phase': {
    term: "Render Phase",
    category: "React Internals",
    definition: "The step where React calls your components to work out what the UI should look like. No DOM is touched, and the work can be paused, restarted, or thrown away.",
    mentalModel: "Drafting the plan. Nothing has been built yet, and the draft can be binned.",
    code: `function App() {
  // This whole body is the render phase.
  // It must be pure: no DOM writes, no subscriptions, no mutation.
  const total = items.reduce((sum, i) => sum + i.price, 0);
  return <p>{total}</p>;
}`,
    whyItMatters: "Because a render can be discarded, anything with a side effect must not happen here — that is the whole basis of the render-purity rule.",
  },
  'commit phase': {
    term: "Commit Phase",
    category: "React Internals",
    definition: "The step after rendering where React applies the calculated changes to the real DOM and runs refs and Effects.",
    mentalModel: "Building from the approved plan. This part cannot be interrupted or undone halfway.",
    code: `useLayoutEffect(() => {
  // Runs during commit, before the browser paints
  setHeight(ref.current.getBoundingClientRect().height);
}, []);

useEffect(() => {
  // Runs after commit AND after paint
}, []);`,
    whyItMatters: "The difference between `useLayoutEffect` and `useEffect` is exactly which side of the paint they land on, which is why one can prevent a visible flicker and the other cannot.",
  },
  'concurrent rendering': {
    term: "Concurrent Rendering",
    category: "React Internals",
    definition: "React being able to start rendering, pause for something more urgent, and resume or abandon the work.",
    mentalModel: "A chef who puts down a slow dish when a quick order arrives, instead of blocking the kitchen.",
    code: `const [isPending, startTransition] = useTransition();

setQuery(text);                              // urgent: the input must keep up
startTransition(() => setFilter(text));      // interruptible: the big list can wait`,
    whyItMatters: "It is why render must be pure — a render that gets thrown away still ran, so any mutation it performed still happened.",
  },
  'strict mode': {
    term: "Strict Mode",
    category: "React Lifecycle",
    definition: "A development-only wrapper that deliberately double-invokes components and runs each Effect setup, cleanup, then setup again, to surface unsafe code.",
    mentalModel: "A pre-flight check that tries the landing gear twice, on the ground, where a fault is cheap.",
    code: `useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id); // without this, Strict Mode leaves TWO intervals
}, []);`,
    whyItMatters: "Doubled timers, duplicate subscriptions and repeated analytics events in development are Strict Mode reporting a real leak, not causing one. Removing it hides the bug rather than fixing it.",
  },
  'unmount': {
    term: "Mount / Unmount",
    category: "React Lifecycle",
    definition: "A component being added to the tree for the first time, and being removed from it. Unmounting destroys its state and runs every Effect cleanup.",
    mentalModel: "Moving into a flat and moving out. Coming back later means a new, empty flat.",
    code: `useEffect(() => {
  const socket = connect(roomId);
  return () => socket.close(); // runs on unmount, and before each re-run
}, [roomId]);`,
    whyItMatters: "Whether a component unmounts or merely re-renders decides whether its state survives — which is what `key` controls.",
  },
  'remount': {
    term: "Remount",
    category: "React Lifecycle",
    definition: "React destroying a component instance and creating a fresh one in its place, resetting all of its state.",
    mentalModel: "Not redecorating the room — knocking it down and building a new one.",
    code: `// Same component, same position: state is KEPT across users
const kept = <ProfileForm user={selectedUser} />;

// A changing key makes it a different instance: state is RESET
const reset = <ProfileForm key={selectedUser.id} user={selectedUser} />;`,
    whyItMatters: "It is the deliberate use of `key`: telling React that this is conceptually a different thing now, so a half-typed draft for one user does not leak into the next.",
  },
  'object identity': {
    term: "Object Identity",
    category: "JavaScript & Memory",
    definition: "Which object a reference points at, as opposed to what the object contains. Two objects with identical contents are still two objects.",
    mentalModel: "Two identical keys cut from the same blank still open different locks — sameness of shape is not sameness of thing.",
    code: `console.log({ a: 1 } === { a: 1 }); // false — different objects

// A new object every render, so memo and dependency
// arrays always see a change
const options = { roomId };
useEffect(() => { /* ... */ }, [options]); // re-runs every render`,
    whyItMatters: "React compares with `Object.is`, so an object rebuilt during render defeats `memo`, `useMemo` dependencies and Effect dependency arrays alike.",
  },
  'virtual dom': {
    term: "Virtual DOM",
    category: "React Internals",
    definition: "The lightweight tree of plain JavaScript objects React builds from your JSX, which it diffs against the previous tree to work out the smallest real DOM update.",
    mentalModel: "Marking up a photocopy rather than the original document, then applying only the edits.",
    code: `// This JSX...
const element = <h1 className="title">Hi</h1>;

// ...compiles to a plain object, not a DOM node
const asObject = { type: 'h1', props: { className: 'title', children: 'Hi' } };`,
    whyItMatters: "It is why re-rendering is far cheaper than it sounds: a re-render rebuilds objects, and only the differences reach the DOM.",
  },
  'derived state': {
    term: "Derived State",
    category: "State & Rendering",
    definition: "A value calculated from existing state or props during render, rather than stored in its own `useState`.",
    mentalModel: "A total at the bottom of a receipt. You do not store it — you add up the lines whenever you need it.",
    code: `// ❌ A second source of truth that has to be kept in sync
const [storedTotal, setStoredTotal] = useState(0);
useEffect(() => setStoredTotal(items.length), [items]);

// ✅ Recomputed every render, so it cannot go stale
const total = items.length;`,
    whyItMatters: "Most unnecessary Effects in a codebase are derived state in disguise. Deriving removes the extra render, the flicker, and the chance of drift.",
  },
  'single source of truth': {
    term: "Single Source of Truth",
    category: "Architecture",
    definition: "Each piece of information living in exactly one place, with everything else reading from it.",
    mentalModel: "One master copy of the document. Everyone links to it; nobody keeps their own edited duplicate.",
    code: `// One owner, two readers — they cannot disagree
function Search() {
  const [query, setQuery] = useState('');
  return (
    <>
      <SearchBox query={query} onQueryChange={setQuery} />
      <Results query={query} />
    </>
  );
}`,
    whyItMatters: "Two copies of the same fact will eventually disagree, and the bug appears far from the code that caused it.",
  },
  'lifting state': {
    term: "Lifting State Up",
    category: "Component Architecture",
    definition: "Moving a piece of state to the closest component that renders everything needing it, then passing it down as props.",
    mentalModel: "Two people who need the same document: give it to their shared manager rather than photocopying it.",
    code: `function Thermostat() {
  const [celsius, setCelsius] = useState('');
  return (
    <>
      <TemperatureInput celsius={celsius} onCelsiusChange={setCelsius} />
      <TemperatureDisplay celsius={celsius} />
    </>
  );
}`,
    whyItMatters: "Siblings cannot read each other's state. Lifting is the ordinary answer, and reaching for Context or a global store before trying it is how apps get complicated early.",
  },
  'server state': {
    term: "Server State",
    category: "Architecture",
    definition: "Data that lives on a server and is only cached in your app. Someone else can change it, so your copy can be out of date.",
    mentalModel: "A printout of a shared spreadsheet. It was accurate when you printed it.",
    code: `// Server state: cached, refetched, can go stale
const { data } = useQuery({ queryKey: ['issues'], queryFn: fetchIssues });

// Client state: nobody else can change it
const [isMenuOpen, setIsMenuOpen] = useState(false);`,
    whyItMatters: "Server state has problems client state does not — caching, staleness, refetching, request races — which is why it wants a different tool rather than a `useState` and an Effect.",
  },
  'url state': {
    term: "URL State",
    category: "Architecture",
    definition: "State kept in the address bar — the route, query parameters, the fragment — instead of in a component.",
    mentalModel: "Writing the page number on the outside of the book, so anyone holding the address lands in the same place.",
    code: `// ❌ Lost on refresh, and unlinkable
const [localFilter, setLocalFilter] = useState('open');

// ✅ Shareable, survives reload, Back works
const [params, setParams] = useSearchParams();
const filter = params.get('filter') ?? 'open';`,
    whyItMatters: "The test is whether a user might reasonably link to it, refresh onto it, or expect Back to undo it. If so, `useState` is the wrong home.",
  },
  'reducer': {
    term: "Reducer",
    category: "State & Rendering",
    definition: "A pure function taking the current state and an action, and returning the next state.",
    mentalModel: "A rulebook: given where we are and what just happened, here is where we end up. The rulebook never changes anything itself.",
    code: `function reducer(state, action) {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 };
    default: return state;
  }
}

const [state, dispatch] = useReducer(reducer, { count: 0 });`,
    whyItMatters: "It moves transition logic out of the component and into one testable function — worth it once several updates are related or one action changes several fields.",
  },
  'optimistic update': {
    aliases: ['optimistic ui'],
    term: "Optimistic Update",
    category: "Architecture",
    definition: "Showing the result of an action immediately, before the server has confirmed it, and rolling back if it fails.",
    mentalModel: "Ticking the box on your own list the moment you post the letter, and un-ticking it if it comes back.",
    code: `const [optimistic, addOptimistic] = useOptimistic(messages, (state, msg) => [...state, msg]);

async function send(formData) {
  addOptimistic(formData.get('msg')); // on screen instantly
  await postMessage(formData);        // React discards the layer either way
}`,
    whyItMatters: "Right where success is near-certain and reversible — a sent message, a like. Wrong where being misled would matter, such as a completed payment.",
  },
  'dependency array': {
    term: "Dependency Array",
    category: "React Lifecycle",
    definition: "The second argument to `useEffect`, `useMemo` or `useCallback`, listing the reactive values it reads. React compares each entry with `Object.is` after every render.",
    mentalModel: "A list of what this code is watching. Nothing on the list changed, so there is nothing to redo.",
    code: `useEffect(() => { /* ... */ });        // no array: after EVERY render
useEffect(() => { /* ... */ }, []);      // empty: once, on mount
useEffect(() => { /* ... */ }, [a, b]);  // on mount, and when a or b changes`,
    whyItMatters: "It is a description of what the code above it actually reads, not a switch. `[]` on an Effect that reads state is a false claim, and produces a stale closure.",
  },
  'cleanup function': {
    term: "Cleanup Function",
    category: "React Lifecycle",
    definition: "The function returned from an Effect. React calls it before every re-run of that Effect and once more when the component unmounts.",
    mentalModel: "Closing the door behind you — every time you leave, not just the last time.",
    code: `useEffect(() => {
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}, []);`,
    whyItMatters: "Anything an Effect starts and that can outlive it — a listener, a timer, a subscription, a request — needs the matching stop, or it leaks and fires against a component that is gone.",
  },
  'custom hook': {
    term: "Custom Hook",
    category: "Component Architecture",
    definition: "A function whose name begins with `use` and which calls other hooks, so stateful logic can be shared between components.",
    mentalModel: "Extracting a method, except the extracted part is allowed to remember things between renders.",
    code: `function useOnlineStatus() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

// Each caller gets its own independent state
const isOnline = useOnlineStatus();`,
    whyItMatters: "It shares logic, not state: two components calling the same hook get separate state. It is the hooks-era replacement for render props and higher-order components.",
  },
  'rules of hooks': {
    term: "Rules of Hooks",
    category: "React Lifecycle",
    definition: "Hooks must be called at the top level of a component or another hook, in the same order on every render — never inside a condition, loop, or nested function.",
    mentalModel: "React tracks your hooks by counting, not by name. Skip one and every hook after it hands back the wrong state.",
    code: `// ❌ Changes the call order between renders
if (isLoggedIn) {
  const [name, setName] = useState('');
}

// ✅ Always called; put the condition inside
const [name, setName] = useState('');`,
    whyItMatters: "They are also the precondition for the React Compiler: it only optimises components that follow them, and it does so silently either way.",
  },
  'memoization': {
    term: "Memoization",
    category: "React Internals",
    definition: "Caching the result of a calculation so it is only redone when its inputs change.",
    mentalModel: "The M+ button on a calculator: same inputs, same answer, no need to work it out again.",
    code: `// Caches a value
const total = useMemo(() => expensiveSum(items), [items]);

// Caches a function's identity
const onSave = useCallback(() => save(id), [id]);

// Skips a re-render when props are shallowly equal
const Row = memo(function Row({ item }) { /* ... */ });`,
    whyItMatters: "It is a hint, not a guarantee — React may discard the cache. And the React Compiler now inserts most of it for you, so it is increasingly something you read rather than write.",
  },
  'debounce': {
    term: "Debounce",
    category: "Architecture",
    definition: "Delaying an action until a burst of activity has stopped, so rapid repeats collapse into one run.",
    mentalModel: "A lift that waits a moment after the last person steps in, rather than departing on every footstep.",
    code: `useEffect(() => {
  const id = setTimeout(() => setDebounced(value), 500);
  return () => clearTimeout(id); // each keystroke cancels the previous timer
}, [value, 500]);`,
    whyItMatters: "It is what stops a search box firing a request per keystroke. Throttling is the cousin: run at most once per interval, rather than waiting for quiet.",
  },
  'error boundary': {
    term: "Error Boundary",
    category: "Component Architecture",
    definition: "A component that catches errors thrown while rendering anything beneath it and shows a fallback instead of unmounting the whole app.",
    mentalModel: "A fuse box. One circuit blows; the rest of the house keeps its lights on.",
    code: `<ErrorBoundary fallback={<p>Something went wrong.</p>}>
  <IssueList />
</ErrorBoundary>`,
    whyItMatters: "Where you put one decides how much of the screen disappears when something fails. They catch render, lifecycle and constructor errors — not errors in event handlers, timers, or after an `await`.",
  },
  'suspense': {
    term: "Suspense",
    category: "React Internals",
    definition: "A boundary that renders a fallback while a component beneath it is still waiting — for its code, or for its data.",
    mentalModel: "A \"back in five minutes\" sign on one shop, not on the whole street.",
    code: `<Suspense fallback={<div>Loading…</div>}>
  <Profile />   {/* suspends until use(promise) resolves */}
</Suspense>`,
    whyItMatters: "It moves the loading branch out of the component, so the component only has to describe the successful case. The same boundary serves `lazy()` code splitting and data fetching.",
  },
  'code splitting': {
    term: "Code Splitting",
    category: "Architecture",
    definition: "Breaking the bundle into chunks that load on demand rather than all at once on first paint.",
    mentalModel: "Packing the winter coat in the loft instead of carrying it everywhere all summer.",
    code: `const Chart = lazy(() => import('./Chart')); // becomes its own chunk

<Suspense fallback={<div>Loading chart…</div>}>
  <Chart />
</Suspense>`,
    whyItMatters: "Split along seams where users genuinely diverge — a route many never visit, an admin panel. Splitting something every user needs immediately just adds a round trip.",
  },
  'portal': {
    term: "Portal",
    category: "React DOM",
    definition: "Rendering a component's DOM output somewhere else in the document while keeping it in the same place in the React tree.",
    mentalModel: "A window cut through the wall. The room is unchanged; the view comes out somewhere else entirely.",
    code: `createPortal(
  <div className="tooltip">{text}</div>,
  document.body // escapes overflow:hidden and z-index ancestors
);`,
    whyItMatters: "Context still flows in and events still bubble to the React parent, not the DOM parent. The DOM position moves; the component position does not.",
  },
  'render prop': {
    term: "Render Prop",
    category: "Component Architecture",
    definition: "A pattern where a component takes a function as a prop and calls it to decide what to draw, instead of drawing fixed markup.",
    mentalModel: "A vending machine that holds the coins and the mechanism, and lets you supply the product.",
    code: `<MouseTracker render={({ x, y }) => <p>X: {x}, Y: {y}</p>} />`,
    whyItMatters: "Worth recognising in older code and in libraries. A custom hook now gives the same reuse with no extra component, no nesting when two combine, and no function prop to memoize.",
  },
  'composition': {
    term: "Composition",
    category: "Component Architecture",
    definition: "Building UI by passing content or behaviour into a reusable component, rather than teaching that component every case it must handle.",
    mentalModel: "A picture frame. It never needs to know what painting goes in it.",
    code: `function Card({ children }) {
  return <div className="card">{children}</div>;
}

<Card>
  <h2>Title</h2>
  <p>Anything at all.</p>
</Card>`,
    whyItMatters: "It is the alternative to a component that grows a new prop for every variation somebody asks for, and it also cures most prop drilling.",
  },
  'server component': {
    term: "Server Component",
    category: "SSR & Server Components",
    definition: "A component that runs only on the server. It can read a database directly and ships no JavaScript to the browser, but cannot hold state or handle events.",
    mentalModel: "A printed page: produced once, elsewhere, and delivered finished.",
    code: `'use client'; // opts this file, and everything it imports, into the browser

import { useState } from 'react';
export default function Counter() { /* needs state, so must be a client component */ }`,
    whyItMatters: "The boundary is the architectural decision: `'use client'` at the top of a layout drags its whole subtree into the bundle, which is the usual way an app adopts RSC and ships the same JavaScript as before.",
  },
  'screen reader': {
    term: "Screen Reader",
    category: "Architecture",
    definition: "Software that reads a page aloud, navigating by the structure and labels in the markup rather than by how it looks.",
    mentalModel: "Someone reading your UI down the phone. Layout tells them nothing; names and roles are all they have.",
    code: `// A span that looks like a label is not one
const notALabel = (
  <>
    <span>Email</span>
    <input />
  </>
);

// This pairing is what a screen reader can follow
const labelled = (
  <>
    <label htmlFor={id}>Email</label>
    <input id={id} />
  </>
);`,
    whyItMatters: "These failures are invisible during normal development because the page looks right. Querying by role and accessible name in tests is the reliable check.",
  },
  'imperative': {
    term: "Imperative",
    category: "Architecture",
    definition: "Describing the steps to reach a result, rather than describing the result and letting something else work out the steps.",
    mentalModel: "Turn-by-turn directions, versus giving the destination and letting the sat-nav route it.",
    code: `// Imperative: the sequence of DOM operations
const li = document.createElement('li');
li.textContent = item.name;
list.appendChild(li);

// Declarative: the shape it should have
<ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>`,
    whyItMatters: "React is declarative by default, and the imperative escape hatches — refs, `.focus()`, direct DOM measurement — are deliberately narrow. Reaching for one is a signal worth noticing.",
  },
};
