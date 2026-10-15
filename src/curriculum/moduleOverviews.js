import curriculum from './index.js';

export const moduleOverviews = {
  "intro": {
    badge: "MODULE 01 • GETTING STARTED",
    tagline: "Before the first component: what React is for.",
    subtitle: "By the end of this module you can explain what React does for you, and read the import lines that sit at the top of every file in this course.",
    whatIsIt: "Two short lessons with no React in them yet. The first shows what updating a page by hand costs, so that React's answer to it makes sense. The second explains how files share code with each other, which is what every `import` line in the rest of the course is doing.",
    whyLearnIt: "React is usually taught starting from its syntax, which leaves the reader typing something that works without knowing what it replaced. Seeing the manual version once makes the rest of the course feel like an answer rather than a ritual.",
    withoutThisReact: "Skipping this is survivable, but `import { useState } from 'react'` then stays a magic incantation, and the first confusing build error has nothing to attach itself to.",
    keyTakeaways: [
      { title: "The Core Problem", desc: "Data and screen are two copies of the same truth, and keeping them in step by hand is the job React removes." },
      { title: "Files Share Code", desc: "`export` offers something up; `import` collects it. A bare package name means code installed into node_modules." },
      { title: "Project Shape", desc: "Recognize package.json, node_modules, and the entry point you will meet in any React project." }
    ],
    codePreview: `count = count + 1;
render(); // the line React lets you stop writing`
  },

  "capstones": { badge: "MODULE • CAPSTONES", tagline: "Stop practicing fragments. Build applications.", subtitle: "Three integration projects that force state, data, routing, testing, performance, and architecture decisions to coexist.", whatIsIt: "Application-scale project briefs that require the learner to integrate multiple course concepts and defend architectural choices.", whyLearnIt: "A developer can pass isolated challenges and still struggle to design a coherent application. Capstones expose that gap.", withoutThisReact: "Without integration work, course completion can create false confidence about production readiness.", keyTakeaways: [{title:"Architecture",desc:"Choose boundaries before APIs."},{title:"Integration",desc:"Combine state, routing, server data, tests, and UX states."},{title:"Judgment",desc:"Explain why an architecture is appropriate rather than merely possible."}], codePreview: `render → state → server state → routing → tests → production decision` },
  "mental-models": { badge: "MODULE 01 • MENTAL MODELS", tagline: "Learn to predict what React will do before you run it.", subtitle: "By the end of this module you can say what will appear on screen, and why, without guessing — which is what makes React bugs findable.", whatIsIt: "How React actually behaves underneath the hooks you have been using: what a render is, which values are recalculated versus remembered, which component should own a piece of data, and why React sometimes keeps state and sometimes throws it away.", whyLearnIt: "Most difficult React bugs are failures of prediction: stale snapshots, incorrect state ownership, identity mistakes, and effects used for ordinary data flow.", withoutThisReact: "Without these models, developers can memorize hooks yet still struggle to explain re-renders and state preservation.", keyTakeaways: [{title:"Render Snapshots",desc:"Each render calculates UI from a snapshot of inputs."},{title:"State Ownership",desc:"Put state at the lowest common owner that must coordinate it."},{title:"Boundaries",desc:"Choose render, event, Effect, or server-state boundaries before APIs."}], codePreview: `const visible = items.filter(item => item.active);` },
  "modern-react": { badge: "MODULE • REACT 19.2", tagline: "Understand modern React as architecture, not API trivia.", subtitle: "Effect Events, Activity, Compiler-aware optimization, and boundaries.", whatIsIt: "A focused update for the React 19.2 generation of APIs.", whyLearnIt: "Current React changes the trade-offs around Effects and memoization.", withoutThisReact: "Without it, learners can leave with a pre-19 mental model.", keyTakeaways: [{title:"Effect Events",desc:"Separate event-like logic from Effect synchronization."},{title:"Activity",desc:"Preserve hidden UI while deprioritizing hidden work."},{title:"Compiler",desc:"Understand automatic memoization without abandoning performance reasoning."}], codePreview: `const onConnected = useEffectEvent(() => showNotification(theme));` },
  "debugging": { badge: "MODULE • DEBUGGING", tagline: "Learn React by investigating broken React.", subtitle: "Diagnose renders, Effects, identity, Strict Mode, and accessibility failures.", whatIsIt: "A production-oriented debugging track based on intentionally broken applications.", whyLearnIt: "Professional React work is dominated by explaining unexpected behavior and choosing the correct abstraction.", withoutThisReact: "Without debugging practice, developers become dependent on recipes.", keyTakeaways: [{title:"Mechanism First",desc:"Explain the render/update chain before changing code."},{title:"Measure",desc:"Use DevTools and the Profiler instead of guessing."},{title:"Accessibility",desc:"Treat semantics, labels, focus, and errors as part of the component contract."}], codePreview: `render → state update → render → effect → synchronization` },
  "js-fundamentals": {
    badge: "MODULE 00 • PREREQUISITES",
    tagline: "The JavaScript you will use on every page of React.",
    subtitle: "By the end of this module you can read and write the handful of JavaScript features that React code uses constantly — so React itself is the only new thing you have to learn next.",
    whatIsIt: "The parts of modern JavaScript that React leans on: how variables are scoped, the short arrow syntax for functions, pulling values out of objects and arrays, copying data instead of changing it, transforming lists, and waiting for things that take time.",
    whyLearnIt: "React is 100% pure JavaScript. Many of the bugs developers struggle with in React—stale closures, infinite loops, broken re-renders—turn out to be misunderstandings of plain JavaScript closures and reference equality, not React itself.",
    withoutThisReact: "Without modern JavaScript, React code would be bloated with prototype inheritance, manual `.bind(this)` boilerplate everywhere, and noisy imperative for-loops. ES6+ gives React its clean, expressive functional architecture.",
    keyTakeaways: [
      {
        title: "Lexical Closures",
        desc: "Understanding how inner functions capture outer variables in snapshot scopes is critical for mastering useState and useEffect."
      },
      {
        title: "Immutable Operations",
        desc: "Using .map(), .filter(), and spread syntax ensures you produce brand new object references without mutating state directly."
      },
      {
        title: "Destructuring & Rest",
        desc: "Unpack props, state tuples, and API responses cleanly with zero boilerplate."
      }
    ],
    codePreview: `const users = [{ id: 1, name: "Sonia", active: true }];

// Pure transformation without mutation
const activeNames = users
  .filter(u => u.active)
  .map(({ name }) => name.toUpperCase());`
  },

  "fundamentals": {
    badge: "MODULE 01 • CORE ARCHITECTURE",
    tagline: "Write your first components, and make them respond to a click.",
    subtitle: "By the end of this module you can build a screen out of reusable pieces, pass data into them, and change what they show when someone interacts.",
    whatIsIt: "The four things every React screen is made of: markup written inside JavaScript (JSX), components that group it into reusable pieces, props that pass data into a component, and state that lets a component remember something that changes.",
    whyLearnIt: "Every single React application—from a humble counter to a massive enterprise dashboard—is built on components and state. Mastering this foundation teaches you how React schedules renders and builds predictable user interfaces.",
    withoutThisReact: "Without this module, React wouldn't exist! Without JSX and components, you'd be writing thousands of manual `document.createElement()` and `innerHTML` DOM mutations. Without `useState`, web interfaces would be completely static and unable to respond to user interactions.",
    keyTakeaways: [
      {
        title: "Declarative UI",
        desc: "You describe WHAT the UI should look like for a given state; React figures out HOW to mutate the real DOM."
      },
      {
        title: "Unidirectional Data Flow",
        desc: "Props flow strictly top-to-bottom from parents to children, creating traceable, modular component trees."
      },
      {
        title: "State Immutability",
        desc: "State must never be modified directly—always call setter functions so the React reconciler schedules a re-render."
      }
    ],
    codePreview: `function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Clicked {count} times
    </button>
  );
}`
  },

  "forms": {
    badge: "MODULE 02 • USER INTERACTION",
    tagline: "Single Source of Truth. Tame user input with controlled state.",
    subtitle: "Eliminate out-of-sync inputs, handle multi-field forms, and build instant onBlur and submit validation pipelines.",
    whatIsIt: "How React synchronizes browser input elements (text, select, radio, checkboxes) with component state, replacing uncontrolled DOM mutations with a single, predictable source of truth.",
    whyLearnIt: "In traditional HTML, inputs manage their own internal state. In React, allowing inputs to drift away from component state causes desynchronization bugs, broken validations, and form submission errors.",
    withoutThisReact: "Without controlled forms, you would have to query the DOM manually (`document.getElementById('email').value`) whenever a user clicks submit. Controlled inputs give you instant validation, disabled submission states, and real-time masking.",
    keyTakeaways: [
      {
        title: "Controlled Inputs",
        desc: "The React state drives the input value, and the input's onChange updates the React state in a continuous loop."
      },
      {
        title: "Per-Field Touched State",
        desc: "Only display validation error messages after a user has focused and blurred a field, avoiding annoying premature errors."
      },
      {
        title: "Clean Form Data Modeling",
        desc: "Manage multi-field forms in a single state object with dynamic `[e.target.name]: value` computed keys."
      }
    ],
    codePreview: `function LoginForm() {
  const [email, setEmail] = useState('');

  return (
    <input
      value={email}
      onChange={e => setEmail(e.target.value)}
      placeholder="Enter email..."
    />
  );
}`
  },

  "side-effects": {
    badge: "MODULE 03 • SYNCHRONIZATION",
    tagline: "The Escape Hatch to the Real World. Synchronize React with APIs & Timers.",
    subtitle: "Master the 5-stage effect lifecycle, avoid infinite loops, and eliminate memory leaks with bulletproof cleanups.",
    whatIsIt: "How React components communicate with external systems outside the pure render loop—including HTTP fetching, WebSocket subscriptions, document title updates, and browser event listeners.",
    whyLearnIt: "Components must stay pure during rendering. Any side effect placed directly in the component body runs on EVERY render and causes infinite loops. `useEffect` lets you safely synchronize side effects with state changes.",
    withoutThisReact: "Without `useEffect`, React would be a closed mathematical box—pure calculation with zero ability to fetch data from a backend server, set a timer, or listen to browser resize events!",
    keyTakeaways: [
      {
        title: "Render Purity",
        desc: "Rendering must remain a pure function with zero side effects. Effects run strictly AFTER the browser paints."
      },
      {
        title: "Dependency Array Contract",
        desc: "Every reactive value (props or state) read inside the effect must be declared in the dependency array."
      },
      {
        title: "Cleanup Functions",
        desc: "Always return a cleanup function to abort pending fetches and remove event listeners before the component unmounts."
      }
    ],
    codePreview: `useEffect(() => {
  const controller = new AbortController();
  fetch('/api/user', { signal: controller.signal })
    .then(res => res.json())
    .then(setUser);

  return () => controller.abort(); // Cleanup!
}, [userId]);`
  },

  "advanced-state": {
    badge: "MODULE 04 • PERSISTENCE & LOGIC",
    tagline: "Escape Render Loops. Persistent refs, state machines & memory caches.",
    subtitle: "Harness useRef for DOM access, useReducer for complex state transitions, and useMemo for expensive computational caching.",
    whatIsIt: "The specialized hooks that handle scenarios `useState` cannot: persisting mutable values without triggering re-renders (`useRef`), modeling complex multi-action state machines (`useReducer`), and caching heavy calculations (`useMemo`).",
    whyLearnIt: "As applications grow, state logic scattered across dozens of `useState` setters becomes impossible to debug. `useReducer` centralizes state transitions, while `useRef` provides imperative escape hatches to DOM nodes.",
    withoutThisReact: "Without `useRef`, you could never measure a DOM element's height, focus an input automatically, or store interval timer IDs. Without `useReducer`, complex workflows (like shopping carts or multi-step wizards) turn into spaghetti state code.",
    keyTakeaways: [
      {
        title: "useRef vs useState",
        desc: "Updating a ref mutates its .current property immediately without scheduling a re-render."
      },
      {
        title: "Predictable Reducers",
        desc: "Decouple 'what happened' (actions) from 'how state updates' (pure reducer functions)."
      },
      {
        title: "Performance Memoization",
        desc: "Use useMemo to cache expensive O(N) calculations and preserve reference equality across renders."
      }
    ],
    codePreview: `// useRef: Mutable value without re-renders
const inputRef = useRef(null);
const timerId = useRef(null);

const focusInput = () => inputRef.current?.focus();`
  },

  "sharing-state": {
    badge: "MODULE 05 • STATE ARCHITECTURE",
    tagline: "Escape the Prop Drilling Pyramid. Broadcast global context across the tree.",
    subtitle: "Share state, themes, and authenticated user sessions deeply across your component tree without passing props 10 levels down.",
    whatIsIt: "React's built-in dependency injection system (`createContext` & `useContext`) that allows data to teleport directly to any consumer component in the tree.",
    whyLearnIt: "Passing user data or theme settings through 10 intermediate components that don't even use the data (prop drilling) creates fragile, tightly coupled code that breaks every time you refactor.",
    withoutThisReact: "Without Context, every nested modal, dropdown menu, and navbar button would require you to manually thread props through dozens of wrapper components, making modular architectures impossible.",
    keyTakeaways: [
      {
        title: "Teleporting Data",
        desc: "Context provides a broadcast channel that any child component can tap into with useContext()."
      },
      {
        title: "Split Context Pattern",
        desc: "Separate frequently changing state from stable dispatchers to prevent unnecessary child re-renders."
      },
      {
        title: "Custom Hook Wrappers",
        desc: "Always encapsulate useContext in a dedicated custom hook with fail-fast provider boundary checks."
      }
    ],
    codePreview: `const ThemeContext = createContext('dark');

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Click Me</button>;
}`
  },

  "custom-hooks": {
    badge: "MODULE 06 • COMPOSABILITY",
    tagline: "Extract Reactive Logic. Write reusable, headless superpowers.",
    subtitle: "Encapsulate stateful logic, localStorage sync, and window listeners into pure, composable custom hooks.",
    whatIsIt: "The pinnacle of React's functional paradigm: creating custom JavaScript functions starting with `use` that combine built-in hooks to share stateful logic across entirely unrelated components.",
    whyLearnIt: "Before custom hooks, sharing stateful logic required complex design patterns like Higher-Order Components (HOCs) and Render Props ('wrapper hell'). Custom hooks allow flat, elegant logic sharing with zero DOM overhead.",
    withoutThisReact: "Without custom hooks, if 10 different components need to sync state with `localStorage` or debounce user input, you'd have to copy-paste the exact same 25 lines of `useState` + `useEffect` code into every single component!",
    keyTakeaways: [
      {
        title: "Headless Logic",
        desc: "Custom hooks share stateful behavior, not UI. Two components using the same hook maintain independent state."
      },
      {
        title: "Composability",
        desc: "Build small single-purpose hooks (useDebounce, useLocalStorage) and compose them into powerful feature hooks."
      },
      {
        title: "Rules of Hooks",
        desc: "Custom hooks inherit the same rules: call them only at the top level of React functions."
      }
    ],
    codePreview: `function useLocalStorage(key, initialValue) {
  const [val, setVal] = useState(() => {
    return JSON.parse(localStorage.getItem(key)) ?? initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(val));
  }, [key, val]);

  return [val, setVal];
}`
  },

  "intermediate": {
    badge: "MODULE 07 • ARCHITECTURAL PATTERNS",
    tagline: "Architectural Superpowers. Composition, Portals & Boundary Defenses.",
    subtitle: "Break free from CSS overflow traps with Portals, catch runtime crashes with Error Boundaries, and compose flexible layouts.",
    whatIsIt: "Battle-tested advanced design patterns: Component Composition over inheritance, Portals for modals/tooltips, Error Boundaries for fault isolation, and `forwardRef` for controlled component APIs.",
    whyLearnIt: "Real-world production apps have messy edge cases—modals clipped by parent `overflow: hidden`, runtime third-party crashes that tear down the entire page, and custom inputs needing imperative focus control.",
    withoutThisReact: "Without Portals, modals and tooltips get trapped inside parent CSS transforms and z-index contexts. Without Error Boundaries, a single undefined property crash in a user comment wipes out your entire application into a blank white screen!",
    keyTakeaways: [
      {
        title: "Composition Over Inheritance",
        desc: "Pass components as children or props to build reusable layouts without complex class inheritance hierarchies."
      },
      {
        title: "React Portals",
        desc: "Render a child DOM node into document.body while preserving full React synthetic event bubbling."
      },
      {
        title: "Error Boundary Defenses",
        desc: "Wrap volatile components in Error Boundaries to display graceful fallback UI when runtime errors occur."
      }
    ],
    codePreview: `// Portals render outside parent DOM tree
createPortal(
  <div className="modal-backdrop">
    <DialogBox />
  </div>,
  document.body
);`
  },

  "performance": {
    badge: "MODULE 08 • ENGINE OPTIMIZATION",
    tagline: "The Fiber Diffing Engine. Reconcile millions of nodes in O(n) time.",
    subtitle: "Master the reconciliation algorithm, prevent object identity re-renders, and split bundles with React.lazy.",
    whatIsIt: "How React's Fiber engine reconciles the Virtual DOM with the real DOM in linear $O(n)$ time using key heuristics, and how tools like `React.memo`, `useCallback`, and code-splitting optimize render cycles.",
    whyLearnIt: "Every state update in React traverses the component subtree. Without understanding object identity and reconciliation keys, your application will re-render thousands of unchanged nodes, causing perceptible lag.",
    withoutThisReact: "Without keys and reconciliation heuristics, diffing two tree structures is an $O(n^3)$ algorithm—meaning a tree of 1,000 elements would require 1 billion comparison operations! React's reconciliation engine is what makes declarative UI fast.",
    keyTakeaways: [
      {
        title: "O(n) Diffing Heuristics",
        desc: "Different component types produce entirely new trees; keys uniquely identify elements across renders."
      },
      {
        title: "Reference Stability",
        desc: "Functions and objects declared inline recreate new memory addresses on every render, defeating React.memo."
      },
      {
        title: "Code Splitting",
        desc: "Use React.lazy and Suspense to dynamically download route chunks on demand, shrinking initial bundle sizes."
      }
    ],
    codePreview: `// Stable function reference for React.memo
const handleSave = useCallback(() => {
  saveItem(itemId);
}, [itemId]);

const MemoizedCard = React.memo(Card);`
  },

  "routing": {
    badge: "MODULE 09 • CLIENT-SIDE NAVIGATION",
    tagline: "The URL is Your State. Single Page Application navigation without page reloads.",
    subtitle: "Build nested layout hierarchies, parse dynamic parameters, and manage programmatic history transitions.",
    whatIsIt: "Client-side routing architecture in Single Page Applications (SPAs): intercepting browser navigation, matching URL pathnames against route trees, rendering nested `<Outlet />` layouts, and synchronizing query parameters.",
    whyLearnIt: "Modern web applications must feel instant. Full browser page reloads destroy client-side in-memory state and audio/video streams. Client-side routing updates only the changing view while keeping the surrounding app alive.",
    withoutThisReact: "Without client-side routing, clicking any navigation link would send a request to the web server and cause a full browser reload, discarding your Zustand state, resetting audio playback, and flashing a white screen!",
    keyTakeaways: [
      {
        title: "Single Page Routing",
        desc: "HTML5 History API (pushState) updates the URL bar without reloading the HTML page."
      },
      {
        title: "Nested Outlets",
        desc: "Preserve shared layout headers and sidebars while switching child views seamlessly."
      },
      {
        title: "URL As Single Source",
        desc: "Store filter IDs, pagination numbers, and search queries in the URL so users can bookmark and share links."
      }
    ],
    codePreview: `<Routes>
  <Route path="/" element={<AppLayout />}>
    <Route index element={<Dashboard />} />
    <Route path="users/:id" element={<UserProfile />} />
  </Route>
</Routes>`
  },

  "state-scale": {
    badge: "MODULE 10 • ARCHITECTURE AT SCALE",
    tagline: "State at Scale. Atomic stores and automated server-cache invalidation.",
    subtitle: "Tame high-scale client state with Zustand and manage asynchronous server caches with React Query.",
    whatIsIt: "Architecting enterprise-scale state management by decoupling local component state, global client stores (Zustand), and server-cache synchronization layers (React Query).",
    whyLearnIt: "Relying solely on React Context for fast-changing global state causes massive tree-wide re-render bottlenecks. Modern state libraries like Zustand use atomic selector subscriptions to re-render only the exact component that reads the changed slice.",
    withoutThisReact: "Without dedicated client and server state management, developers resort to storing server cache in `useEffect` state variables, resulting in cache stale-ness, duplicate network requests, and prop passing nightmares.",
    keyTakeaways: [
      {
        title: "Atomic Selectors",
        desc: "Components subscribe only to the exact slice of state they need, avoiding entire app re-renders."
      },
      {
        title: "Client State vs Server State",
        desc: "Client state is synchronous and UI-driven; Server state is asynchronous, remote, and cached."
      },
      {
        title: "Zero Boilerplate",
        desc: "Modern stores eliminate Redux actions, reducers, and thunk boilerplate in favor of simple getter/setter stores."
      }
    ],
    codePreview: `const useStore = create(set => ({
  count: 0,
  inc: () => set(s => ({ count: s.count + 1 })),
}));

// Only re-renders when count changes!
const count = useStore(state => state.count);`
  },

  "advanced": {
    badge: "MODULE 11 • SUSPENSE & CONCURRENCY",
    tagline: "Waiting, on purpose. Boundaries for loading and interruptible renders.",
    subtitle: "Declare where loading UI lives with Suspense, ship less JavaScript with lazy, and keep the app responsive while a slow render is in flight.",
    whatIsIt: "The two halves of React's answer to slowness: `<Suspense>` boundaries that own the loading UI for anything not ready yet, and the concurrent APIs (`useTransition`, `useDeferredValue`) that let React interrupt a slow render to handle a keystroke first.",
    whyLearnIt: "An app is not slow because a render takes 80ms; it is slow because that 80ms blocks the character the user just typed. Suspense moves loading states out of components, and transitions decide which work is allowed to be interrupted.",
    withoutThisReact: "Without Suspense every fetching component carries its own `if (isLoading)` branch, and without transitions a single expensive list re-render makes the input it filters feel broken.",
    keyTakeaways: [
      {
        title: "Boundaries Own Loading",
        desc: "A suspending component renders nothing; the nearest <Suspense> renders its fallback. Code and data suspend the same way."
      },
      {
        title: "Urgent vs Transition",
        desc: "startTransition marks an update as interruptible, so typing stays responsive while the expensive result catches up."
      },
      {
        title: "Deferring a Value",
        desc: "useDeferredValue lags one value behind on purpose, rendering the stale result until the fresh one is ready."
      }
    ],
    codePreview: `<Suspense fallback={<Skeleton />}>
  <Timeline />
</Suspense>

const deferredQuery = useDeferredValue(query);`
  },

  "react-server": {
    badge: "MODULE 12 • SERVER COMPONENTS & ACTIONS",
    tagline: "Move the work to the server. Then make the client feel instant.",
    subtitle: "Where the server/client boundary falls, how form Actions replace four state variables, and how useOptimistic hides the round trip.",
    whatIsIt: "React 19's mutation and server story: Server Components that run only on the backend, `useActionState`/`useFormStatus` for forms that submit through a function instead of an event handler, and `useOptimistic` for showing the result before the network confirms it.",
    whyLearnIt: "Mutations are where hand-rolled React gets ugliest — `loading`, `error`, `data`, `pending` and a try/catch per button. Actions fold all four into the primitive, and the server boundary decides how much code the user downloads at all.",
    withoutThisReact: "Without Actions every submit handler re-implements the same pending/error dance by hand. Without a server boundary, every formatting library and markdown parser ships to the browser whether the user needs it or not.",
    keyTakeaways: [
      {
        title: "The Boundary Is a Decision",
        desc: "Server Components have no state and no effects. 'use client' marks where interactivity — and the bundle — begins."
      },
      {
        title: "Actions API",
        desc: "An async action passed to <form action> gets pending state, error handling, and sequencing from React itself."
      },
      {
        title: "Optimistic UI",
        desc: "useOptimistic(state, updateFn) shows the expected result immediately and rolls back automatically if the action fails."
      }
    ],
    codePreview: `// React 19 Action with automatic pending state
const [state, formAction, isPending] = useActionState(
  async (prevState, formData) => {
    return await updateProfile(formData);
  },
  null
);`
  },

  "ts-fundamentals": {
    badge: "MODULE 17 • TYPESCRIPT FUNDAMENTALS",
    tagline: "Learn the language before pointing it at React.",
    subtitle: "Annotations and inference, unions and narrowing, object shapes, generics, and the strictness settings that make any of it worth running.",
    whatIsIt: "TypeScript on its own terms: how a type gets attached to a value, how a union is narrowed down to one of its members, how an object's shape is described, what a type parameter is for, and what `strict` actually switches on.",
    whyLearnIt: "The React TypeScript module that follows assumes all of this. Most people who find typed React frustrating are not struggling with React — they are meeting generics, unions and `unknown` for the first time inside a component, where three unfamiliar things happen at once.",
    withoutThisReact: "Without the language underneath, typed React degrades into copying signatures that work and reaching for `any` when they do not, which removes the entire benefit while keeping the entire cost.",
    keyTakeaways: [
      {
        title: "Annotate the Boundaries",
        desc: "State the types that cross a boundary — parameters, exports, empty containers — and let inference handle everything else."
      },
      {
        title: "Unions and Narrowing",
        desc: "A literal union makes impossible states unrepresentable; a typeof, === or in check is what lets you use one member of it."
      },
      {
        title: "unknown, not any",
        desc: "`any` switches checking off for everything it touches. `unknown` forces the check at the boundary where it always belonged."
      }
    ],
    codePreview: `type Status = 'idle' | 'loading' | 'success' | 'error';

function first<T>(items: T[]): T | undefined {
  return items[0];
}`
  },

  "typescript": {
    badge: "MODULE 12 • TYPE SAFETY",
    tagline: "Bulletproof Components. Catch bugs at compile time with type-safe contracts.",
    subtitle: "Type props, hooks, reducers, and polymorphic 'as' components with zero runtime overhead.",
    whatIsIt: "Combining React's declarative component model with TypeScript's static type system: typing props, `ReactNode` vs `ReactElement`, generic custom hooks, discriminated union reducers, and polymorphic component props.",
    whyLearnIt: "JavaScript lets you pass anything to any prop. In large teams and codebases, passing `undefined` or misspelled prop names creates subtle runtime crashes that only appear in production.",
    withoutThisReact: "Without TypeScript, refactoring a shared component used in 50 places is terrifying—one renamed prop will quietly break 10 pages without any compile-time warning until a user encounters a crash!",
    keyTakeaways: [
      {
        title: "Component Prop Contracts",
        desc: "Interfaces strictly define required, optional, and children props with automatic IDE autocompletion."
      },
      {
        title: "Discriminated Unions",
        desc: "Type complex reducer action payloads with 100% exhaustive switch statements via assertNever."
      },
      {
        title: "Generic Hooks",
        desc: "Author flexible custom hooks that preserve exact input-to-output data types across the application."
      }
    ],
    codePreview: `interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export function Button({ variant = 'primary', isLoading, children, ...rest }: ButtonProps) {
  return <button disabled={isLoading} {...rest}>{children}</button>;
}`
  },

  "testing": {
    badge: "MODULE 13 • QUALITY ASSURANCE",
    tagline: "Test the Behavior, Not the Implementation. Ship code with zero fear.",
    subtitle: "Write confident React Testing Library and MSW tests that emulate real user behavior.",
    whatIsIt: "Modern frontend testing principles using Vitest, React Testing Library (RTL), and Mock Service Worker (MSW): testing rendered accessibility trees, simulating user events, and intercepting network requests.",
    whyLearnIt: "Testing component internal state variables or shallow render implementations creates brittle tests that break every time you refactor. Testing accessible user interactions gives you true confidence to deploy on Fridays!",
    withoutThisReact: "Without automated tests, validating that a checkout form or auth flow works requires manually clicking through the app 50 times a day after every code change. RTL gives you instant automated proof that your UI works.",
    keyTakeaways: [
      {
        title: "Accessible Query Hierarchy",
        desc: "Always prioritize getByRole and getByLabelText to ensure your components are accessible to screen readers."
      },
      {
        title: "User Event Simulation",
        desc: "Use @testing-library/user-event to simulate real keyboard, blur, and click event chains."
      },
      {
        title: "Network Mocking with MSW",
        desc: "Intercept API calls at the network level instead of mocking global fetch, keeping tests realistic."
      }
    ],
    codePreview: `test('increments counter on user click', async () => {
  render(<Counter />);
  const button = screen.getByRole('button', { name: /clicked 0 times/i });
  
  await userEvent.click(button);
  expect(button).toHaveTextContent(/clicked 1 times/i);
});`
  }
};

// Badge numbers were typed by hand and drifted out of step with the teaching
// order: two modules both claimed "01", and the sequence a reader actually met
// ran 00, 01, 01, 02, 05, 04, 06, 03 -- numbering that contradicted the order it
// was numbering. The number is now derived from the module's real position in
// the registry, so reordering index.js cannot leave a stale badge behind. Only
// the label half ("CORE ARCHITECTURE") is authored below.
for (const [index, moduleMeta] of curriculum.entries()) {
  const overview = moduleOverviews[moduleMeta.id];
  if (!overview) continue;
  const label = (overview.badge || '').split('•').pop().trim() || moduleMeta.title.toUpperCase();
  overview.badge = `MODULE ${String(index + 1).padStart(2, '0')} • ${label}`;
}

export function getModuleOverview(moduleId, moduleTitle) {
  if (moduleOverviews[moduleId]) {
    return moduleOverviews[moduleId];
  }

  return {
    badge: `MODULE • ${moduleTitle.toUpperCase()}`,
    tagline: `Master ${moduleTitle} in Modern React.`,
    subtitle: `Deep dive into ${moduleTitle} with interactive code playgrounds and step-by-step AI voice explanations.`,
    whatIsIt: `This module explores the mechanics, patterns, and best practices surrounding ${moduleTitle} in production React applications.`,
    whyLearnIt: `Understanding ${moduleTitle} allows you to build scalable, high-performance web applications and prevents architectural bottlenecks.`,
    withoutThisReact: `Without ${moduleTitle}, building complex, production-grade applications in React would be inefficient and error-prone.`,
    keyTakeaways: [
      {
        title: "Mental Models",
        desc: `Learn how ${moduleTitle} operates under the hood inside the React engine.`
      },
      {
        title: "Real-World Patterns",
        desc: "Implement battle-tested solutions to common frontend engineering challenges."
      },
      {
        title: "Performance & Safety",
        desc: "Avoid common traps, memory leaks, and unnecessary render cycles."
      }
    ],
    codePreview: `// Module: ${moduleTitle}\n// Interactive lessons & challenges inside.`
  };
}
