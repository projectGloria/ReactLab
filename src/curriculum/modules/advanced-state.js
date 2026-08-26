export default {
  "id": "advanced-state",
  "title": "Advanced State",
  "description": "useRef, useReducer, and useMemo",
  "icon": "Cpu",
  "lessons": [
    {
      "id": "use-ref",
      "title": "useRef",
      "content": "\n# Referencing Values with useRef\n\n### What is it?\n**Building on useState:** `useState` gives you memory that, when changed, tells React to re-render. **`useRef`** gives you a different kind of memory: a mutable container whose changes are **invisible to React** and never trigger a re-render.\n\n> 💡 **Mental Model:** Think of `useState` as a whiteboard facing the audience — any change is immediately visible to everyone watching (re-render). `useRef` is your private notebook under the table — you can write whatever you want, read it later, but the audience (React) never sees the notebook move and never reacts to its changes.\n\n### Why do we need `useRef`?\nReact's declarative paradigm is built on pure render functions that map state to JSX. However, real-world web apps frequently need to interact with imperative browser APIs (e.g. focusing an input, measuring DOM element dimensions, controlling video playback) or persist values across renders (e.g. interval IDs, request cancellation tokens) without triggering unwanted component re-renders. `useRef` bridges the declarative React model with imperative DOM/lifecycle requirements.\n\n### Core Rules & Mechanics\n`useRef(initialValue)` returns a plain object: `{ current: initialValue }`. This object persists for the full lifetime of the component — same object reference on every render. You can read and write `.current` freely.\n\n### The two primary use cases\n\n**1. DOM node access** — Connect a ref to a real DOM element:\n```jsx\nconst inputRef = useRef(null);\n<input ref={inputRef} />\n// After mount: inputRef.current is the actual <input> DOM node\ninputRef.current.focus(); // Imperative DOM API\n```\n\n**2. Mutable instance variables** — Store values that need to survive renders without causing them:\n```javascript\nconst intervalId = useRef(null);\nintervalId.current = setInterval(tick, 1000); // No re-render on assignment\n```\n\n### When to use `useRef` vs `useState`\n| Need | Tool |\n|------|------|\n| Value visible in the UI | `useState` |\n| Trigger re-render on change | `useState` |\n| Store interval/timer ID | `useRef` |\n| Access a DOM element | `useRef` |\n| Track previous state value | `useRef` |\n| Store a value for an effect | `useRef` |\n\n### Common Pitfalls & Gotchas\n1. **Writing to `ref.current` during render**: The render phase must remain pure. Mutating `ref.current` during render produces nondeterministic bugs and breaks Concurrent React.\n2. **Expecting ref changes to update UI**: Modifying `ref.current = newVal` does not trigger a re-render. If the UI depends on the value, use `useState` instead.\n3. **Ref null on initial render**: DOM nodes are only attached during the commit phase, so `ref.current` is always `null` on the very first render before mount.\n\n### Challenge\n**Challenge:** The button should focus the input when clicked, but there's no way to access the DOM node yet. Add a `useRef` to get a reference to the input element, then call `.focus()` on it.\n\n### Hints\n* `const inputRef = useRef(null)` — initialize to `null` (the DOM node isn't available until after mount).\n* Pass `ref={inputRef}` to the `<input>` JSX element.\n* Inside the handler: `inputRef.current.focus()` — `.current` is the actual DOM element after mount.\n\n**Solution:**\nCreate the ref with `useRef`, attach it to the target DOM node when needed, and read or update `ref.current`. A ref is appropriate for imperative DOM access or a mutable value that should not trigger a render; use state when the UI must update.\n\n\n### Example\n```jsx\nimport { useRef } from 'react';\n\nexport default function FocusInput() {\n  const inputRef = useRef(null);\n\n  return (\n    <>\n      <input ref={inputRef} />\n      <button onClick={() => inputRef.current.focus()}>Focus</button>\n    </>\n  );\n}\n```\n",
      "starterCode": "import { useState } from 'react';\n\nexport default function FocusForm() {\n  const [text, setText] = useState('');\n  \n  function handleFocusClick() {\n    // ❌ We don't have a way to access the input DOM node yet!\n  }\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input \n        value={text} \n        onChange={e => setText(e.target.value)} \n        placeholder=\"Type here...\"\n      />\n      <button onClick={handleFocusClick}>Focus the input</button>\n    </div>\n  );\n}\n",
      "solutionCode": "import { useState, useRef } from 'react';\n\nexport default function FocusForm() {\n  const [text, setText] = useState('');\n  const inputRef = useRef(null);\n  \n  function handleFocusClick() {\n    inputRef.current.focus();\n  }\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input \n        ref={inputRef}\n        value={text} \n        onChange={e => setText(e.target.value)} \n        placeholder=\"Type here...\"\n      />\n      <button onClick={handleFocusClick}>Focus the input</button>\n    </div>\n  );\n}\n",
      "exampleWalkthrough": {
        "code": "import { useRef } from 'react';\n\nexport default function FocusInput() {\n  const inputRef = useRef(null);\n\n  return (\n    <>\n      <input ref={inputRef} />\n      <button onClick={() => inputRef.current.focus()}>Focus</button>\n    </>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              4
            ],
            "description": "`useRef(null)` creates the ref object: `{ current: null }`. The initial value `null` is used because the `<input>` DOM node doesn't exist yet — the component hasn't mounted. React will populate `.current` with the real DOM node after the component mounts.\n\nThe ref object persists across every render of this component — it's always the same object in memory, just with `.current` updated.",
            "stateSnapshot": {
              "inputRef.current": "null",
              "mountStatus": "pre-commit"
            }
          },
          {
            "highlightLines": [
              8
            ],
            "description": "`ref={inputRef}` is a special JSX prop (not passed to the component as a regular prop — React handles it internally). When React commits this `<input>` to the DOM, it sets `inputRef.current = inputDOMNode`. When the input is removed from the DOM, React sets `inputRef.current = null` again.",
            "stateSnapshot": {
              "inputRef.current": "<HTMLInputElement>",
              "mountStatus": "committed to DOM"
            }
          },
          {
            "highlightLines": [
              9
            ],
            "description": "Inside the event handler, `inputRef.current` is the actual HTML `<input>` element. We can call any native DOM API on it — `.focus()`, `.blur()`, `.select()`, `.scrollIntoView()`, etc. This is \"imperative\" code — stepping outside React's declarative model to directly control the DOM.\n\nThe exact text output on the screen will be:\n`[Input Field] [Button: Focus]`",
            "stateSnapshot": {
              "inputRef.current": "<HTMLInputElement>",
              "activeElement": "<HTMLInputElement (focused)>"
            }
          }
        ]
      },
      "walkthrough": {
        "code": "import { useState, useRef } from 'react';\n\nexport default function FocusForm() {\n  const [text, setText] = useState('');\n  const inputRef = useRef(null);\n  \n  function handleFocusClick() {\n    inputRef.current.focus();\n  }\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input \n        ref={inputRef}\n        value={text} \n        onChange={e => setText(e.target.value)} \n        placeholder=\"Type here...\"\n      />\n      <button onClick={handleFocusClick}>Focus the input</button>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              5
            ],
            "description": "We create `inputRef` with `useRef(null)`. This is initialized to `null` because at the time this line runs (during render), the input DOM node hasn't been created yet. React creates DOM nodes during the commit phase, after the render phase.",
            "stateSnapshot": {
              "text": "\"\"",
              "inputRef.current": "null"
            }
          },
          {
            "highlightLines": [
              13,
              14,
              15,
              16,
              17
            ],
            "description": "We pass `ref={inputRef}` to the `<input>`. This is the JSX mechanism for attaching a ref to a DOM element. React will set `inputRef.current = <input DOM node>` when it commits the element to the DOM — this happens before any event handlers can fire, so the ref is always populated by the time the user can click the button.",
            "stateSnapshot": {
              "text": "\"\"",
              "inputRef.current": "<HTMLInputElement>"
            }
          },
          {
            "highlightLines": [
              7,
              8,
              9
            ],
            "description": "`inputRef.current.focus()` programmatically focuses the input. This is the correct use of refs: escaping React's declarative model for imperative DOM operations that have no declarative equivalent in React (focus, blur, scroll, media play/pause).\n\nThe exact text output on the screen will be:\n`[Input: Type here...]`\n`[Button: Focus the input]`",
            "stateSnapshot": {
              "text": "\"\"",
              "inputRef.current": "<HTMLInputElement>",
              "focused": true
            }
          }
        ]
      },
      "insights": [
        {
          "title": "Does mutating `ref.current` trigger a re-render?",
          "type": "misconception",
          "walkthrough": {
            "code": "const renderCount = useRef(0);\n\n// Inside component body or event handler:\nrenderCount.current += 1;\nconsole.log('Renders so far:', renderCount.current);\n// ← No re-render! The UI does not update.",
            "steps": [
              {
                "highlightLines": [
                  4
                ],
                "description": "`ref.current = value` is a plain JavaScript property assignment. React has no setter to intercept — it never knows the value changed. Compare to `setState`: React wraps state in a proxy-like mechanism that triggers the render pipeline when called."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "This is the key distinction: **refs are memory for you** (the developer), **state is memory for React** (the renderer). Use refs when you need to track something for your own logic without the UI needing to reflect that change. Use state when the UI needs to update."
              }
            ]
          }
        },
        {
          "title": "Using `useRef` to track previous state values",
          "type": "did-you-know",
          "walkthrough": {
            "code": "function usePrevious(value) {\n  const ref = useRef(undefined);\n  \n  useEffect(() => {\n    ref.current = value; // Runs AFTER render\n  });\n  \n  return ref.current; // Returns the value from the PREVIOUS render\n}\n\n// Usage:\nconst prevCount = usePrevious(count);\n// During render: prevCount = old count\n// After render: ref updated to new count",
            "steps": [
              {
                "highlightLines": [
                  4,
                  5,
                  6
                ],
                "description": "`useEffect` without a dependency array runs after every render. During this render, it stores `value` (the current value) into `ref.current`. But this storage happens *after* the render is complete and the return value has been computed."
              },
              {
                "highlightLines": [
                  8
                ],
                "description": "`return ref.current` — when this line executes during render, `ref.current` still holds the value from the *previous* render's effect. The current render's effect hasn't fired yet (effects run after render). This subtle timing makes `useRef` a natural container for 'previous' values."
              }
            ]
          }
        },
        {
          "title": "Never write to `ref.current` during the render phase",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ Side effect during render — breaks Concurrent Mode!\nfunction BadComponent() {\n  const renderCount = useRef(0);\n  renderCount.current++; // Mutating during render!\n  return <p>Renders: {renderCount.current}</p>;\n}\n\n// ✅ Correct: read/write in event handlers or effects\nfunction GoodComponent() {\n  const renderCount = useRef(0);\n  useEffect(() => { renderCount.current++; }); // In effect!\n  return <p>Renders: {renderCount.current}</p>;\n}",
            "steps": [
              {
                "highlightLines": [
                  4
                ],
                "description": "React's Concurrent Mode may call your render function multiple times (rendering in the background, discarding results, re-rendering with different priority). If you mutate a ref during render, each discarded render attempt leaves a mutation behind — your counter becomes inflated by the number of aborted renders."
              },
              {
                "highlightLines": [
                  11
                ],
                "description": "Effects only run for renders that were actually committed to the DOM. Writing to refs inside `useEffect` is safe — it always reflects the number of committed renders, not attempted ones."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "use-reducer",
      "title": "Complex State (useReducer)",
      "content": "\n# Managing Complex State with useReducer\n\n### What is it?\n**Building on useState:** When state transitions become complex — multiple related values, transitions that depend on previous state, or actions that affect multiple pieces of state simultaneously — **`useReducer`** centralizes all state logic into a single, predictable, testable function called a **reducer**.\n\n> 💡 **Mental Model:** `useReducer` is like a bank. Your state is the balance. You don't directly modify the balance — instead, you submit a **transaction slip** (action) to the teller (reducer). The teller applies the transaction according to the bank's rules and gives you the new balance. You never handle the money directly — all changes go through the official process.\n\n### The anatomy of a reducer\n```javascript\nfunction reducer(state, action) {\n  // state: current state (read-only — don't mutate)\n  // action: { type: string, payload?: any }\n  // Must return: new state (always a new object/value)\n  \n  switch (action.type) {\n    case 'increment': return { ...state, count: state.count + 1 };\n    case 'reset':     return { count: 0 };\n    default:          return state; // Always handle unknown actions\n  }\n}\n```\n\n### Why is the reducer function outside the component?\nThe reducer is defined at the module level (outside the component) for two important reasons:\n1. **It doesn't depend on component scope** — pure functions that only depend on their arguments.\n2. **It's easily testable** — you can `import` the reducer and write unit tests against it without mounting any React component.\n\n### `useState` vs `useReducer` decision guide\nUse `useReducer` when:\n- State is an object with 3+ fields that change together.\n- The same user action modifies multiple state fields.\n- You need to test state transitions independently.\n- State transitions form a complex graph (like a form wizard).\n\nStick with `useState` when:\n- State is a single primitive (boolean, number, string).\n- State changes are independent and simple.\n\n### Challenge\n**Challenge:** The counter's UI is wired up but `state` and `dispatch` are missing. Initialize `useReducer` with the provided reducer and an initial state of `{ count: 0 }`, then wire up the buttons.\n\n### Hints\n* `const [state, dispatch] = useReducer(reducer, { count: 0 });`\n* Dispatch with `dispatch({ type: 'INCREMENT' })` — the `type` must match what the reducer checks.\n* `state.count` gives you the current count value.\n\n**Solution:**\nKeep the reducer pure: it receives the current state and an action, then returns the next state without side effects. Dispatch a descriptive action from the event handler and keep I/O, timers, and other effects outside the reducer.\n\n\n### Example\n```jsx\nimport { useReducer } from 'react';\n\nfunction reducer(state, action) {\n  if (action.type === 'toggle') return !state;\n  return state;\n}\n\nexport default function Toggle() {\n  const [isOn, dispatch] = useReducer(reducer, false);\n  return <button onClick={() => dispatch({ type: 'toggle' })}>{isOn ? 'ON' : 'OFF'}</button>;\n}\n```\n",
      "starterCode": "import { useReducer } from 'react';\n\nfunction reducer(state, action) {\n  switch (action.type) {\n    case 'INCREMENT':\n      return { count: state.count + 1 };\n    case 'DECREMENT':\n      return { count: state.count - 1 };\n    default:\n      return state;\n  }\n}\n\nexport default function Counter() {\n  // TODO: Use useReducer here\n\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Count: 0</h2>\n      <button>+</button>\n      <button>-</button>\n    </div>\n  );\n}",
      "solutionCode": "import { useReducer } from 'react';\n\nfunction reducer(state, action) {\n  switch (action.type) {\n    case 'INCREMENT':\n      return { count: state.count + 1 };\n    case 'DECREMENT':\n      return { count: state.count - 1 };\n    default:\n      return state;\n  }\n}\n\nexport default function Counter() {\n  const [state, dispatch] = useReducer(reducer, { count: 0 });\n\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Count: {state.count}</h2>\n      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>\n      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useReducer } from 'react';\n\nfunction reducer(state, action) {\n  if (action.type === 'toggle') return !state;\n  return state;\n}\n\nexport default function Toggle() {\n  const [isOn, dispatch] = useReducer(reducer, false);\n  return <button onClick={() => dispatch({ type: 'toggle' })}>{isOn ? 'ON' : 'OFF'}</button>;\n}",
        "steps": [
          {
            "highlightLines": [
              3,
              4,
              5,
              6
            ],
            "description": "The reducer is a **pure function** defined outside the component. It receives the current `state` and an `action` object, and returns the **next state**. Critical rules:\n- Never mutate `state` directly — always return a new value.\n- Never perform side effects (no `fetch`, no `setTimeout`).\n- Always return state for unknown action types (the `default` case).",
            "stateSnapshot": {
              "reducerStatus": "pure function definition",
              "currentState": "false",
              "actionReceived": "none"
            }
          },
          {
            "highlightLines": [
              9
            ],
            "description": "`useReducer(reducer, false)` creates the reducer state slot initialized to `false`. It returns `[isOn, dispatch]`. `isOn` is the current state value; `dispatch` is the stable function you call to send actions to the reducer.\n\n`dispatch` never changes identity across renders — safe to omit from effect dependency arrays.",
            "stateSnapshot": {
              "isOn": false,
              "dispatch": "function dispatch(action)"
            }
          },
          {
            "highlightLines": [
              10
            ],
            "description": "When the button is clicked, `dispatch({ type: 'toggle' })` sends an action. React calls `reducer(currentState, { type: 'toggle' })`, receives `true` (the toggled value), stores it, and re-renders. The button now shows 'ON'.\n\nThe exact text output on the screen will be:\n`[Button: OFF]`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useReducer } from 'react';\n\nfunction reducer(state, action) {\n  switch (action.type) {\n    case 'INCREMENT':\n      return { count: state.count + 1 };\n    case 'DECREMENT':\n      return { count: state.count - 1 };\n    default:\n      return state;\n  }\n}\n\nexport default function Counter() {\n  const [state, dispatch] = useReducer(reducer, { count: 0 });\n\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Count: {state.count}</h2>\n      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>\n      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              15
            ],
            "description": "`useReducer(reducer, { count: 0 })` initializes state as `{ count: 0 }`. The `reducer` function reference and the initial state are passed. React calls `reducer` internally whenever `dispatch` is called, passing the current state and the dispatched action.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              19
            ],
            "description": "`state.count` renders the current count. When `dispatch({ type: 'INCREMENT' })` is called, React runs `reducer({ count: 0 }, { type: 'INCREMENT' })` which returns `{ count: 1 }`. React stores this as the new state and re-renders — `state.count` is now `1`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              20,
              21
            ],
            "description": "Both buttons dispatch different action types to the same reducer. The reducer handles all possible state transitions in one place. Compare: with `useState`, each action would require its own `setState` call scattered throughout event handlers. With `useReducer`, all logic is centralized.\n\nThe exact text output on the screen will be:\n`Count: 0`\n`[Button: +] [Button: -]`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why is the reducer pure? What happens if it has side effects?",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ Side effect in reducer — runs TWICE in Strict Mode!\nfunction reducer(state, action) {\n  if (action.type === 'submit') {\n    fetch('/api/save', { body: JSON.stringify(state) }); // Side effect!\n    return { ...state, submitted: true };\n  }\n  return state;\n}",
            "steps": [
              {
                "highlightLines": [
                  4
                ],
                "description": "React Strict Mode deliberately calls reducers *twice* in development to verify they're pure. If your reducer makes a `fetch` call, it fires twice — submitting the form data to your API twice. In production Strict Mode doesn't double-call, but your reducer may still be called by time-travel debuggers (Redux DevTools) or React's internals for verification."
              },
              {
                "highlightLines": [
                  4
                ],
                "description": "Side effects belong in `useEffect` or event handlers, never in reducers. The reducer just computes the next state. The event handler dispatches the action AND makes the API call separately:\n```javascript\nasync function handleSubmit() {\n  dispatch({ type: 'submit' }); // Update state\n  await fetch('/api/save', ...); // Side effect\n}\n```"
              }
            ]
          }
        },
        {
          "title": "Actions with payloads: passing data to the reducer",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Dispatch with payload\ndispatch({ type: 'SET_NAME', payload: 'Alice' });\ndispatch({ type: 'ADD_TODO', payload: { id: 1, text: 'Buy milk' } });\n\n// Reducer handles it\nfunction reducer(state, action) {\n  switch (action.type) {\n    case 'SET_NAME': return { ...state, name: action.payload };\n    case 'ADD_TODO': return { ...state, todos: [...state.todos, action.payload] };\n  }\n}",
            "steps": [
              {
                "highlightLines": [
                  2,
                  3
                ],
                "description": "Actions aren't limited to `type`. You can attach any data as `payload`. The convention `{ type: string, payload: any }` comes from Flux/Redux but is just a pattern — React doesn't enforce it. You could call it `data`, `value`, or anything else."
              },
              {
                "highlightLines": [
                  8,
                  9
                ],
                "description": "The reducer reads `action.payload` to get the data it needs to compute the next state. By centralizing all these transitions, you can add new action types without touching event handlers — just add a new `case` to the reducer and dispatch the new action from the UI."
              }
            ]
          }
        },
        {
          "title": "`dispatch` is stable — safe to pass as a prop",
          "type": "did-you-know",
          "walkthrough": {
            "code": "const [state, dispatch] = useReducer(reducer, initialState);\n\n// dispatch is guaranteed stable across renders\n// Safe to pass without useCallback:\n<DeepChild onUpdate={dispatch} />",
            "steps": [
              {
                "highlightLines": [
                  1,
                  5
                ],
                "description": "React guarantees that the `dispatch` function reference is **stable** — it's the same function object on every render. This is different from event handler functions you define in the component body (which are new references on every render)."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "Because `dispatch` is stable, you can safely pass it down through props to deeply nested child components without needing to wrap it in `useCallback`. The child won't re-render just because the parent rendered. This makes `useReducer` + `dispatch` a popular alternative to prop-drilling callbacks."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "use-memo",
      "title": "useMemo",
      "content": "\n# Caching Computations with useMemo\n\n### What is it?\n**Building on re-renders and useState:** Every time a component renders, every line of code inside it runs again from top to bottom. **`useMemo`** caches the result of an expensive calculation between renders — it only recalculates when its dependencies change.\n\n> 💡 **Mental Model:** Think of `useMemo` like a calculator's 'M+' memory button: if you ask it to compute a complex formula with the same inputs, it doesn't recalculate — it just hands you the stored result. If an input changes, it recalculates once, updates the memory, and returns the new value.\n\n### Why do we need `useMemo`?\nIn React's declarative re-render model, whenever parent state changes, child functions execute anew. If your component performs CPU-intensive tasks (e.g. filtering thousands of items, complex data transformations, cryptographic operations) or needs to maintain referential identity for objects passed to memoized children (`React.memo`), recalculating on every trivial keystroke causes perceptible UI lag. `useMemo` avoids redundant computation.\n\n### Core Rules & Mechanics\n`const cachedValue = useMemo(() => calculateValue(), [dependencies])`\n1. On the initial render, React runs `calculateValue()` and stores the result.\n2. On subsequent renders, React compares dependencies with `Object.is`.\n3. If dependencies are identical, React returns the cached result without running the function.\n4. If any dependency changed, React re-runs `calculateValue()`, caches the new result, and returns it.\n\n### When `useMemo` is appropriate\n- The calculation is demonstrably slow (> 1ms under CPU throttling) and runs on frequently re-rendered components.\n- You are passing an array or object as a prop to a component wrapped in `React.memo` — memoizing the object reference prevents that child from re-rendering.\n- The computed value is used as a dependency of another Hook (like `useEffect` or another `useMemo`).\n\n### Common Pitfalls & Gotchas\n1. **Overusing `useMemo` on cheap operations**: Wrapping basic array maps or arithmetic in `useMemo` adds hook memory overhead without performance benefits.\n2. **Omitting dependencies**: If you read state or props inside the calculation function without listing them in the dependency array, your calculation will return stale results.\n3. **Expecting `useMemo` as a semantic guarantee**: React may clear the cache under memory pressure. Do not rely on `useMemo` for side effects or state persistence.\n\n### Challenge\n**Challenge:** The search filter runs an expensive sorting operation on every render (even when only `darkMode` changes!). Wrap the filtered list calculation in `useMemo` so it only re-runs when `search` or `items` changes.\n\n### Hints\n* `const filteredItems = useMemo(() => { ... }, [items, search])`\n* The function passed to `useMemo` must return the value you want to cache.\n* The dependency array must include every reactive value used inside the calculation.\n\n**Solution:**\nCalculate the derived value inside the `useMemo` callback and list the relevant inputs in the dependency array. Use `useMemo` when profiling confirms a slow calculation or to preserve reference identity, not as a default for simple expressions.\n\n\n### Example\n```jsx\nimport { useMemo, useState } from 'react';\n\nfunction slowSquare(n) {\n  const start = Date.now();\n  while (Date.now() - start < 200) {\n    // Deliberately blocking, so the difference is easy to feel.\n  }\n  return n * n;\n}\n\nexport default function Squarer() {\n  const [number, setNumber] = useState(4);\n  const [theme, setTheme] = useState('light');\n\n  const squared = useMemo(() => slowSquare(number), [number]);\n\n  return (\n    <div style={{ padding: 20, background: theme === 'dark' ? '#222' : '#eee', color: theme === 'dark' ? '#fff' : '#000' }}>\n      <p>{number} squared is {squared}</p>\n      <button onClick={() => setNumber(n => n + 1)}>Next number (slow)</button>\n      <button onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}>\n        Toggle theme (instant)\n      </button>\n    </div>\n  );\n}\n```\n",
      "starterCode": "import { useState } from 'react';\n\nconst numbers = Array.from({ length: 100000 }, (_, i) => i + 1);\n\nfunction isPrime(n) {\n  if (n < 2) return false;\n  for (let i = 2; i <= Math.sqrt(n); i++) {\n    if (n % i === 0) return false;\n  }\n  return true;\n}\n\nexport default function App() {\n  const [theme, setTheme] = useState('light');\n  const [limit, setLimit] = useState(10000);\n\n  // ❌ This runs on every render, even when only 'theme' changes\n  const primeCount = numbers.slice(0, limit).filter(isPrime).length;\n\n  return (\n    <div style={{ padding: 20, background: theme === 'dark' ? '#222' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}>\n      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>\n        Toggle Theme (should be instant)\n      </button>\n      <input\n        type=\"range\" min={1000} max={100000} step={1000}\n        value={limit} onChange={e => setLimit(Number(e.target.value))}\n      />\n      <p>Primes up to {limit}: {primeCount}</p>\n    </div>\n  );\n}",
      "solutionCode": "import { useState, useMemo } from 'react';\n\nconst numbers = Array.from({ length: 100000 }, (_, i) => i + 1);\n\nfunction isPrime(n) {\n  if (n < 2) return false;\n  for (let i = 2; i <= Math.sqrt(n); i++) {\n    if (n % i === 0) return false;\n  }\n  return true;\n}\n\nexport default function App() {\n  const [theme, setTheme] = useState('light');\n  const [limit, setLimit] = useState(10000);\n\n  const primeCount = useMemo(() => {\n    return numbers.slice(0, limit).filter(isPrime).length;\n  }, [limit]);\n\n  return (\n    <div style={{ padding: 20, background: theme === 'dark' ? '#222' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}>\n      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>\n        Toggle Theme (should be instant)\n      </button>\n      <input\n        type=\"range\" min={1000} max={100000} step={1000}\n        value={limit} onChange={e => setLimit(Number(e.target.value))}\n      />\n      <p>Primes up to {limit}: {primeCount}</p>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useMemo, useState } from 'react';\n\nfunction slowSquare(n) {\n  const start = Date.now();\n  while (Date.now() - start < 200) {\n    // Deliberately blocking, so the difference is easy to feel.\n  }\n  return n * n;\n}\n\nexport default function Squarer() {\n  const [number, setNumber] = useState(4);\n  const [theme, setTheme] = useState('light');\n\n  const squared = useMemo(() => slowSquare(number), [number]);\n\n  return (\n    <div style={{ padding: 20, background: theme === 'dark' ? '#222' : '#eee', color: theme === 'dark' ? '#fff' : '#000' }}>\n      <p>{number} squared is {squared}</p>\n      <button onClick={() => setNumber(n => n + 1)}>Next number (slow)</button>\n      <button onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}>\n        Toggle theme (instant)\n      </button>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3,
              4,
              5,
              6,
              7,
              8,
              9
            ],
            "description": "`slowSquare` blocks for 200ms on purpose. Real expensive work — sorting thousands of rows, parsing a large payload — behaves the same way: it runs on the main thread, and while it runs nothing else in the page can.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              15
            ],
            "description": "`useMemo` takes the calculation and a dependency list. On the first render it runs `slowSquare(number)` and stores the result. On later renders it compares `number` with `Object.is`; if it is unchanged, React hands back the stored value and never calls the function.\n\nNote what is memoized: the *value*, not the function. `useMemo(() => slowSquare(number), [number])` caches the number; `useCallback` is the version that caches a function.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              20,
              21
            ],
            "description": "This is where it shows. **Toggle theme** changes state, so the component re-renders and every line in its body runs again — except the memoized one, because `number` did not change. The toggle is instant.\n\n**Next number** does change `number`, so the calculation re-runs and the click visibly hangs for 200ms. Comment out the `useMemo` and both buttons hang.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              19
            ],
            "description": "A caveat worth carrying: `useMemo` is a performance hint, not a guarantee. React is allowed to discard a cached value — and does, in some situations — so never put anything in there that the app depends on happening exactly once.\n\nThe exact text output on the screen will be:\n`4 squared is 16`\n`[Button: Next number (slow)] [Button: Toggle theme (instant)]`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useState, useMemo } from 'react';\n\nexport default function App() {\n  const [theme, setTheme] = useState('light');\n  const [limit, setLimit] = useState(10000);\n\n  const primeCount = useMemo(() => {\n    return numbers.slice(0, limit).filter(isPrime).length;\n  }, [limit]);\n\n  return (\n    // ... UI rendering\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              7,
              8
            ],
            "description": "The expensive prime-counting computation is wrapped in `useMemo`. On the first render, it runs and stores the result (1229 primes in 10000 numbers).",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              9
            ],
            "description": "The dependency is `[limit]`. When the user toggles the theme (`setTheme(...)`), React re-renders the component. `limit` hasn't changed — `useMemo` returns the cached `1229` instantly. The expensive `filter(isPrime)` loop is skipped entirely. Theme toggle is now instant.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              5
            ],
            "description": "When the user drags the range slider, `limit` changes. `useMemo` detects the dependency changed, re-runs the prime computation with the new limit, caches the new result, and the component re-renders with the updated count.\n\nThe exact text output on the screen will be:\n`[Button: Toggle Theme (should be instant)]`\n`Primes up to 10000: 1229`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Should I wrap everything in `useMemo`?",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ useMemo adds overhead for cheap calculations\nconst greeting = useMemo(() => 'Hello, ' + name, [name]);\n\n// ✅ Just compute inline — this is essentially free\nconst greeting = 'Hello, ' + name;\n\n// ✅ useMemo is worthwhile for genuinely expensive work\nconst sortedItems = useMemo(\n  () => [...items].sort(complexComparator),\n  [items]\n);",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "`useMemo` has real overhead: React must store the dependency array, compare it on every render, and maintain the cache. For trivial operations like string concatenation, this overhead exceeds the cost of just computing the value. Premature memoization can make code slower."
              },
              {
                "highlightLines": [
                  9
                ],
                "description": "Profile before you memoize. The React Devtools Profiler shows which components are slow and why. Only add `useMemo` when you have measurable evidence of a performance problem, not as a preemptive habit."
              }
            ]
          }
        },
        {
          "title": "Using `useMemo` to stabilize object references for `useEffect` dependencies",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// ❌ New object on every render → effect re-runs every render\nconst config = { endpoint: '/api', retries: 3 };\nuseEffect(() => { connect(config); }, [config]); // Runs every render!\n\n// ✅ Memoized object — stable reference across renders\nconst config = useMemo(() => ({ endpoint: '/api', retries: 3 }), []);\nuseEffect(() => { connect(config); }, [config]); // Runs once",
            "steps": [
              {
                "highlightLines": [
                  2,
                  3
                ],
                "description": "`{ endpoint: '/api', retries: 3 }` is a new JavaScript object on every render. When used as a `useEffect` dependency, React's `Object.is` comparison returns `false` (two different object references), so the effect re-runs on every render — potentially causing infinite loops or unnecessary network requests."
              },
              {
                "highlightLines": [
                  6,
                  7
                ],
                "description": "`useMemo(() => ({ ... }), [])` creates the object once and returns the same reference on every subsequent render. The `useEffect` dependency comparison now returns `true` (same object reference) — the effect runs only once. This is one of the most valuable uses of `useMemo` in practice."
              }
            ]
          }
        },
        {
          "title": "React Compiler: useMemo becoming automatic",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Without React Compiler: manual memoization\nconst sorted = useMemo(() => [...items].sort(fn), [items]);\n\n// With React Compiler (React 19+): automatic!\n// The compiler detects that sorted depends on items\n// and memoizes it automatically — no useMemo needed!\nconst sorted = [...items].sort(fn);",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "The React Compiler (released with React 19) statically analyzes your component code, identifies which computations depend on which values, and automatically memoizes them — without any `useMemo` calls in your source code."
              },
              {
                "highlightLines": [
                  7
                ],
                "description": "To benefit from automatic memoization, your components and helpers must be pure — no side effects during render. If your codebase is already clean (no mutation during render, no global side effects), you can remove most manual `useMemo` calls and let the compiler handle optimization."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "use-id",
      "title": "Unique IDs (useId)",
      "content": "\n# Unique IDs with useId\n\n### What is it?\n**Building on forms and accessibility:** `useId` generates a unique, stable string ID that is guaranteed to match between server-side rendering and client-side hydration. It's designed specifically for linking form elements with their accessibility attributes.\n\n> \ud83d\udca1 **Mental Model:** Think of useId as a wristband dispenser at a check-in desk — every visitor (component instance) gets a unique tag from the same machine, so no two people ever end up wearing the same number, no matter how many check-in desks (server + client) are handing them out.\n\n### Why not just hardcode IDs like `id=\"email\"`?\n```jsx\n// ❌ Works for one instance — breaks with two!\nfunction EmailField() {\n  return (\n    <>\n      <label htmlFor=\"email\">Email</label>\n      <input id=\"email\" type=\"email\" />\n    </>\n  );\n}\n\n// Render <EmailField /> twice on the same page and both labels point at\n// the FIRST input. Accessibility is broken.\n```\nHardcoded IDs are globally unique in a browser document — there can only be one element with a given `id`. If you render `<EmailField />` twice on a page, both will have `id=\"email\"`, violating HTML spec and breaking screen reader navigation.\n\n### How `useId` solves this\n`useId` generates a string tied to the component's position in the React tree (e.g., `:r0:`, `:r1:`). Each component instance gets a unique position, so each call to `useId` yields a different string. Two instances of `<EmailField />` get `:r0:` and `:r1:` — guaranteed unique without any developer effort.\n\n### The SSR guarantee\nIDs generated by `useId` on the server during SSR exactly match the IDs generated on the client during hydration. This prevents React's 'hydration mismatch' error. `Math.random()` would generate different values on server and client — crashing the app.\n\n### When NOT to use `useId`\n- **Not for `key` props in lists** — `useId` is tied to a tree position, not to your data. If items reorder, keys shift. Always use data-derived IDs for list keys.\n- **Not for database IDs** — `useId` is an HTML attribute tool, not a UUID generator.\n\n### Challenge\n**Challenge:** The `EmailInput` component has hardcoded `\"TODO\"` IDs. If rendered twice, clicking either label focuses the same input. Replace the hardcoded values with a `useId`-generated string.\n\n### Hints\n* `const id = useId();` — call it at the top of the component.\n* Pass `id` to both `htmlFor` on the label and `id` on the input.\n* For a form with multiple fields, call `useId()` once and suffix: `` `${baseId}-email` ``.\n\n**Solution:**\nCall `useId` to generate a stable ID for accessibility relationships such as `label` and `input` or `aria-describedby`. Do not use it as a list key or as a business identifier because it identifies a component instance, not a data record.\n\n\n### Example\n```jsx\nimport { useId } from 'react';\n\nfunction FormField({ label }) {\n  const id = useId();\n  return (\n    <p>\n      <label htmlFor={id}>{label}: </label>\n      <input id={id} type=\"text\" />\n    </p>\n  );\n}\n\nexport default function SignupForm() {\n  return (\n    <div style={{ padding: 20 }}>\n      <FormField label=\"Username\" />\n      <FormField label=\"Nickname\" />\n    </div>\n  );\n}\n```\n",
      "starterCode": "import { useId } from 'react';\n\nexport default function EmailInput() {\n  // TODO: Get a unique ID\n  \n  return (\n    <div style={{ padding: 20 }}>\n      <label htmlFor=\"TODO\">Email Address: </label>\n      <input id=\"TODO\" type=\"email\" placeholder=\"you@example.com\" />\n    </div>\n  );\n}",
      "solutionCode": "import { useId } from 'react';\n\nexport default function EmailInput() {\n  const id = useId();\n  \n  return (\n    <div style={{ padding: 20 }}>\n      <label htmlFor={id}>Email Address: </label>\n      <input id={id} type=\"email\" placeholder=\"you@example.com\" />\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useId } from 'react';\n\nfunction FormField({ label }) {\n  const id = useId();\n  return (\n    <p>\n      <label htmlFor={id}>{label}: </label>\n      <input id={id} type=\"text\" />\n    </p>\n  );\n}\n\nexport default function SignupForm() {\n  return (\n    <div style={{ padding: 20 }}>\n      <FormField label=\"Username\" />\n      <FormField label=\"Nickname\" />\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              4
            ],
            "description": "`useId()` returns a string like `:r0:`, generated from this component's position in the React tree rather than from a counter or a random number.\n\nPosition is the important part: it means the server and the client independently arrive at the same id for the same element, which is what makes hydration match. A `Math.random()` or an incrementing counter would produce different ids on each side and break it.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7,
              8
            ],
            "description": "The same string goes to `htmlFor` on the label and `id` on the input. That pairing is what tells the browser the two belong together — clicking the label focuses the field, and a screen reader announces the label when the field receives focus.\n\nThis is the whole reason the id has to be unique. A duplicated id silently points every label at the first matching input.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              16,
              17
            ],
            "description": "Two `FormField` instances, each calling `useId` once, each getting its own value — because they sit at different positions in the tree. Click either label and the matching input focuses.\n\nOne thing `useId` is *not* for: keys in a list. Keys have to come from your data so they survive reordering, and an id tied to tree position does not.\n\nThe exact text output on the screen will be:\n`Username: [Input]`\n`Nickname: [Input]`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useId } from 'react';\n\nexport default function EmailInput() {\n  const id = useId();\n  \n  return (\n    <div style={{ padding: 20 }}>\n      <label htmlFor={id}>Email Address: </label>\n      <input id={id} type=\"email\" placeholder=\"you@example.com\" />\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              4
            ],
            "description": "`useId()` replaces the hardcoded `'TODO'` string. React generates a stable, unique ID for this component instance. The exact string varies (`:r0:`, `:r1:`) but is guaranteed unique within the document and stable across renders and hydration.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              8,
              9
            ],
            "description": "Both `htmlFor={id}` and `id={id}` receive the same generated string. The label is now properly associated with the input via a unique, non-colliding ID that works regardless of how many times `EmailInput` is rendered on the page.\n\nThe exact text output on the screen will be:\n`Email Address: [Input: you@example.com]`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Can I use `useId` for list keys?",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ useId is NOT for list keys!\nconst id = useId();\nitems.map((item, index) => (\n  <li key={`${id}-${index}`}>{item}</li>  // Same problem as using index!\n));\n\n// ✅ useId is for HTML attribute linking\nconst labelId = useId();\nreturn (\n  <>\n    <label htmlFor={labelId}>Name:</label>\n    <input id={labelId} />\n  </>\n);",
            "steps": [
              {
                "highlightLines": [
                  4
                ],
                "description": "Appending an index to `useId` doesn't help — the problem with index-as-key is that indices shift when items are deleted or reordered. Adding a `useId` prefix doesn't make the index stable. The key `:r0:-0` still refers to 'position 0' which can change."
              },
              {
                "highlightLines": [
                  8,
                  9,
                  10,
                  11,
                  12,
                  13
                ],
                "description": "`useId` is purpose-built for linking HTML elements via ID attributes. It solves the accessibility problem of unique IDs for form controls. For list keys, always use your data's stable unique identifiers (database IDs, UUIDs). Never generate random IDs during render for list keys."
              }
            ]
          }
        },
        {
          "title": "Why `Math.random()` breaks SSR (and `useId` doesn't)",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ Math.random() — different values on server vs client\nfunction Input() {\n  const id = Math.random().toString(); // '0.4829...' on server\n  return <input id={id} />;            // '0.9173...' on client → MISMATCH!\n}\n\n// ✅ useId — deterministic, same on server and client\nfunction Input() {\n  const id = useId(); // ':r0:' on server, ':r0:' on client → MATCH!\n  return <input id={id} />;\n}",
            "steps": [
              {
                "highlightLines": [
                  3,
                  4
                ],
                "description": "In SSR, the server renders HTML with `id='0.4829...'` and sends it to the browser. The browser's JavaScript then 'hydrates' the HTML — React runs on the client and checks if its virtual DOM matches the server HTML. When it sees `id='0.9173...'` vs `id='0.4829...'`, React throws a hydration mismatch error."
              },
              {
                "highlightLines": [
                  9
                ],
                "description": "`useId` generates IDs deterministically from the component's position in the React tree. The tree structure is the same on server and client, so the IDs are identical. Hydration succeeds. `useId` is designed for IDs derived from component identity that need to remain coordinated between server and client; it is not a replacement for database or server-generated resource IDs."
              }
            ]
          }
        },
        {
          "title": "One `useId` for multiple related fields",
          "type": "did-you-know",
          "walkthrough": {
            "code": "function RegistrationForm() {\n  const baseId = useId(); // Call once!\n  const nameId = `${baseId}-name`;\n  const emailId = `${baseId}-email`;\n  const passId = `${baseId}-password`;\n  \n  return (\n    <>\n      <label htmlFor={nameId}>Name</label>\n      <input id={nameId} />\n      <label htmlFor={emailId}>Email</label>\n      <input id={emailId} />\n    </>\n  );\n}",
            "steps": [
              {
                "highlightLines": [
                  2,
                  3,
                  4,
                  5
                ],
                "description": "You don't need one `useId()` call per field. Call it once and create suffixed variants by string concatenation. All derived IDs are still unique because the `baseId` is unique to this component instance — `:r0:-name`, `:r0:-email`, `:r0:-password` are all different and all globally unique."
              },
              {
                "highlightLines": [
                  9,
                  10,
                  11,
                  12
                ],
                "description": "If a second `<RegistrationForm />` is rendered, it gets `baseId = ':r1:'`, so its fields are `:r1:-name`, `:r1:-email`, `:r1:-password` — completely separate from the first form. Accessibility works correctly for both forms simultaneously."
              }
            ]
          }
        }
      ]
    }
  ]
};
