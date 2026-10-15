export default {
  "id": "side-effects",
  "title": "Escape Hatches & Synchronization",
  "description": "Effects for external synchronization rather than generic data flow.",
  "icon": "RefreshCw",
  "lessons": [
    {
      "id": "use-effect",
      "title": "useEffect Basics",
      "content": "\n# Side Effects with useEffect\n\n### What is it?\n**Building on component rendering:** A React component's *render phase* is a pure function — same input (props + state) always produces the same JSX. A **side effect** is anything that reaches outside that pure computation: fetching data, setting a timer, subscribing to an event, manually writing to the DOM. `useEffect` is the designated place to run these.\n\n> 💡 **Mental Model:** Your component's render is like a chef writing a recipe (pure — no cooking, just description). `useEffect` is when the kitchen actually cooks the food, after the recipe is done. The cooking happens after the UI is visible, and when the component leaves, `useEffect`'s cleanup function washes the dishes.\n\n### Why does `useEffect` run *after* render?\nThis is deliberate. React commits the DOM updates and lets the browser paint the screen *before* running effects. If effects were synchronous (like `useLayoutEffect`), every effect would block the browser from painting — your UI would feel sluggish. Effects running asynchronously after paint means React can guarantee the user sees a responsive UI first.\n\nThe execution order is:\n1. Component function runs → returns JSX\n2. React reconciles the virtual DOM diff\n3. React commits changes to the real DOM\n4. Browser paints pixels to screen\n5. **`useEffect` runs** (asynchronously, after paint)\n\n### The cleanup function — why it's critical\nEffects often create resources (timers, subscriptions, connections) that must be cleaned up. The function returned from `useEffect` is your cleanup. React calls it:\n- When the component **unmounts** from the DOM.\n- Before the effect **re-runs** with new dependencies.\n\n```javascript\nuseEffect(() => {\n  const id = setInterval(tick, 1000); // Setup: create resource\n  return () => clearInterval(id);     // Cleanup: destroy resource\n}, []);\n```\nWithout cleanup, intervals keep firing after the component is gone. Event listeners accumulate. WebSocket connections stay open. This is a **memory leak**.\n\n### ⚠️ `useEffect` cannot be `async`\n```javascript\n// ❌ async effect returns a Promise — not a cleanup function!\nuseEffect(async () => { await fetchData(); }, []);\n\n// ✅ Define async function inside the effect\nuseEffect(() => {\n  async function load() { const data = await fetchData(); setData(data); }\n  load();\n}, []);\n```\n\n### When NOT to use `useEffect`\nThis is crucial. Most `useEffect` misuse involves using it to compute derived state:\n```javascript\n// ❌ Extra render cycle, potential flicker, complex to debug\nconst [fullName, setFullName] = useState('');\nuseEffect(() => { setFullName(first + ' ' + last); }, [first, last]);\n```\n\n```javascript\n// ✅ Compute during render — zero overhead, always in sync\nconst fullName = first + ' ' + last;\n```\n\nIf a value can be computed from existing state/props, compute it inline. Do not reach for `useEffect`.\n\n### Challenge\n**Challenge:** The timer starts a new `setInterval` on every render — because it's not inside `useEffect`, it runs during the render phase and creates a new interval every time state changes. Fix it by wrapping the interval logic in `useEffect` with an empty dependency array and a cleanup function.\n\n⚠️ **Expect the preview to seize up before you fix it.** Each interval triggers a render, each render starts another interval, and the count doubles every second. Within about ten seconds the sandbox will be running hundreds of timers and the pane will stop responding. That runaway *is* the bug — read the code, make the fix, and the preview recovers on the next build. Hit the refresh button in the preview pane if it gets stuck.\n\n### Hints\n* Move the `setInterval` call inside `useEffect(() => { ... }, [])`.\n* Return `() => clearInterval(intervalId)` as the cleanup function.\n* Use the functional updater `s => s + 1` to avoid stale closure bugs.\n\n**Solution:**\nClassify the logic first. Keep pure calculations in render, user-caused work in the event handler, and use an Effect only to synchronize with an external system. Return cleanup for subscriptions, timers, listeners, or connections that must stop.\n\n\n### Example\n```jsx\nimport { useEffect, useState } from 'react';\n\nfunction MouseTracker() {\n  const [pos, setPos] = useState({ x: 0, y: 0 });\n\n  useEffect(() => {\n    function handleMove(e) {\n      setPos({ x: e.clientX, y: e.clientY });\n    }\n    window.addEventListener('mousemove', handleMove);\n    // Without this, the listener keeps firing after the component is gone.\n    return () => window.removeEventListener('mousemove', handleMove);\n  }, []);\n\n  return <p>Pointer at {pos.x}, {pos.y}</p>;\n}\n\nexport default function App() {\n  const [tracking, setTracking] = useState(true);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <button onClick={() => setTracking(t => !t)}>\n        {tracking ? 'Stop tracking' : 'Start tracking'}\n      </button>\n      {tracking && <MouseTracker />}\n    </div>\n  );\n}\n```\n",
      "starterCode": "import { useState } from 'react';\n\nexport default function Timer() {\n  const [seconds, setSeconds] = useState(0);\n\n  // ❌ This is a bug! It creates a new interval on every render!\n  const intervalId = setInterval(() => {\n    setSeconds(s => s + 1);\n  }, 1000);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Time: {seconds}s</h2>\n    </div>\n  );\n}\n",
      "solutionCode": "import { useState, useEffect } from 'react';\n\nexport default function Timer() {\n  const [seconds, setSeconds] = useState(0);\n\n  useEffect(() => {\n    const intervalId = setInterval(() => {\n      setSeconds(s => s + 1);\n    }, 1000);\n    return () => clearInterval(intervalId);\n  }, []);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Time: {seconds}s</h2>\n    </div>\n  );\n}\n",
      "exampleWalkthrough": {
        "code": "import { useEffect, useState } from 'react';\n\nfunction MouseTracker() {\n  const [pos, setPos] = useState({ x: 0, y: 0 });\n\n  useEffect(() => {\n    function handleMove(e) {\n      setPos({ x: e.clientX, y: e.clientY });\n    }\n    window.addEventListener('mousemove', handleMove);\n    // Without this, the listener keeps firing after the component is gone.\n    return () => window.removeEventListener('mousemove', handleMove);\n  }, []);\n\n  return <p>Pointer at {pos.x}, {pos.y}</p>;\n}\n\nexport default function App() {\n  const [tracking, setTracking] = useState(true);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <button onClick={() => setTracking(t => !t)}>\n        {tracking ? 'Stop tracking' : 'Start tracking'}\n      </button>\n      {tracking && <MouseTracker />}\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              6,
              10
            ],
            "description": "Subscribing to `mousemove` is a side effect: it reaches outside React and changes something in the browser. Doing it in the render body would attach a fresh listener on every render, so it belongs in an Effect.\n\nReact runs Effects **after** the component has been committed to the DOM and the browser has painted. By the time line 10 executes, the `<p>` is already on screen.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              13
            ],
            "description": "The empty dependency array means \"this Effect depends on nothing, so run it once when the component mounts and never again\".\n\nIt is a claim about the code above it, not a switch. If the Effect read a prop or a piece of state, `[]` would be a lie and the Effect would keep using the first render's value forever — which is the stale closure bug, two lessons from here.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              11,
              12
            ],
            "description": "The function returned from an Effect is its **cleanup**, and React calls it before every re-run and once more when the component unmounts.\n\nWithout it here, unmounting `MouseTracker` would leave the listener attached to `window` forever, still calling `setPos` on a component that no longer exists. Every subscription, timer, and connection an Effect opens needs the matching close.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              22,
              26
            ],
            "description": "Move the pointer over the preview and the numbers follow it. Press **Stop tracking** to unmount the child, and the cleanup on line 12 is what stops the work.\n\nThe exact text output on the screen will be:\n`[Button: Stop tracking]`\n`Pointer at 0, 0`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "useEffect(() => {\n  const intervalId = setInterval(() => {\n    setSeconds(s => s + 1);\n  }, 1000);\n\n  return () => {\n    clearInterval(intervalId);\n  };\n}, []);",
        "steps": [
          {
            "highlightLines": [
              1,
              9
            ],
            "description": "The `setInterval` is now inside `useEffect` with an empty dependency array `[]`. Before this fix, `setInterval` was called during render — every time state changed (i.e., every second), a new render occurred, which called `setInterval` again, creating another interval. With `useEffect(() => { ... }, [])`, the interval is created exactly once: on first mount.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              2,
              3,
              4,
              5
            ],
            "description": "The interval uses the functional updater `s => s + 1` instead of `setSeconds(seconds + 1)`. This is critical: because the effect runs only once (empty `[]`), the callback would forever see `seconds = 0` from its initial closure. The functional form bypasses this — React calls our function with the *current* state directly, regardless of what the closure captured.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6,
              7,
              8
            ],
            "description": "The cleanup function calls `clearInterval(intervalId)`. React runs this when the component unmounts. Without it, the interval fires indefinitely — even after the component is gone. The `intervalId` is captured in the closure at the time the effect ran, so cleanup always cancels the correct interval.\n\nThe exact text output on the screen will be:\n`Time: 1s`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Stop `useEffect`-ing Everything — Derived State ≠ Effect",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ Anti-pattern: useEffect for derived state\nconst [fullName, setFullName] = useState('');\nuseEffect(() => {\n  setFullName(firstName + ' ' + lastName);\n}, [firstName, lastName]);\n\n// ✅ Correct: compute it during render\nconst fullName = firstName + ' ' + lastName;",
            "steps": [
              {
                "highlightLines": [
                  2,
                  3,
                  4,
                  5
                ],
                "description": "The `useEffect` version has serious problems: it causes an **extra render cycle** (render → effect runs → setState → render again). On the second render, `fullName` is correct — but on the first render, it's the previous value or empty string. This causes a brief UI flicker and can produce subtle bugs in components that read `fullName` synchronously."
              },
              {
                "highlightLines": [
                  8
                ],
                "description": "Computed directly during render: one line, zero re-renders, always in sync. Any value that can be derived from existing state or props should be computed inline. Save `useEffect` for *external* synchronization — fetching, subscriptions, DOM manipulation, browser APIs."
              }
            ]
          }
        },
        {
          "title": "Why does my effect run twice in development? (Strict Mode)",
          "type": "did-you-know",
          "walkthrough": {
            "code": "useEffect(() => {\n  console.log('Connecting...'); // Fires TWICE in development!\n  const ws = connectWebSocket();\n  return () => ws.disconnect();  // Runs between the two mounts\n}, []);",
            "steps": [
              {
                "highlightLines": [
                  2,
                  4
                ],
                "description": "React 18+ with `<StrictMode>` intentionally mounts → unmounts → remounts your component in development. This simulates the behavior of features like `<Offscreen>` (future concurrent feature) and fast refresh during development. It is never double-mounted in production."
              },
              {
                "highlightLines": [
                  4
                ],
                "description": "This 'torture test' is designed specifically to catch missing cleanups. If your cleanup function properly tears down the effect (disconnects, clears the timer, removes the listener), the double-mount cycle is transparent — your app behaves identically whether mounted once or twice. If your effect breaks on the second mount, you have a cleanup bug."
              }
            ]
          }
        },
        {
          "title": "The Infinite Loop trap",
          "type": "misconception",
          "walkthrough": {
            "code": "const [count, setCount] = useState(0);\n\nuseEffect(() => {\n  setCount(count + 1);\n}); // ← No dependency array",
            "steps": [
              {
                "highlightLines": [
                  3,
                  4,
                  5
                ],
                "description": "When the dependency array is **omitted entirely** (not the same as `[]`), the effect runs after **every** render — including renders caused by the effect itself."
              },
              {
                "highlightLines": [
                  4
                ],
                "description": "The loop: render → effect → `setCount` → state changes → re-render → effect → `setCount` → ... The browser freezes instantly. Always include the dependency array. Omitting it entirely is almost always a bug."
              }
            ]
          }
        },
        {
          "title": "The 5-Stage Render & Effect Timeline",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Stage 1: React calls your component function → returns a React element tree\n// Stage 2: React reconciles it against the previous tree\n// Stage 3: React commits minimal DOM mutations\n// Stage 4: Browser paints pixels to the screen\n// Stage 5: useEffect callback fires (async, after paint)",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2
                ],
                "description": "**Render phase** (stages 1–2): Pure computation. React calls your function, collects the React elements it returns, and reconciles them against the previous tree. This may happen multiple times in concurrent mode — it must be pure and side-effect-free."
              },
              {
                "highlightLines": [
                  3,
                  4
                ],
                "description": "**Commit phase** (stage 3): React applies the minimal set of DOM mutations. `useLayoutEffect` fires synchronously here, before the browser paints. The browser then paints the updated DOM to the screen."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "**Effect phase** (stage 5): `useEffect` fires asynchronously after the browser has painted. This is why data-fetching inside `useEffect` always shows a loading state first — the component renders (with no data), paints, then the fetch begins. React did this intentionally: effects don't block the browser from showing a responsive UI."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "event-vs-effect",
      "title": "Event Handlers vs Effects",
      "content": "\n# Event Handlers vs Effects\n\n### What is it?\nTwo different kinds of code react to change in React, for two different reasons. An **event handler** runs because the user did something specific — a click, a submit, a keypress — and expresses their intent directly. An **Effect** runs after rendering to synchronize the component with something outside React, and keeps running in sync with that thing for as long as it's relevant, regardless of what originally caused a value to change.\n\n### Why do we need it?\nConfusing the two produces a specific, easy-to-miss bug pattern: routing a user action through state and an Effect that watches for that state, instead of just handling the action directly. The Effect can't tell the difference between \"the user just clicked\" and \"this value changed for some other reason\" — so it can also fire on initial mount, or in response to an unrelated re-render that happens to touch the same state, doing work the user never actually asked for at that moment.\n\n### How?\nAsk what caused the code to need to run. If the answer is \"a specific thing the user just did,\" put the response directly in that event's handler — a click handler, a submit handler. If the answer is \"this needs to stay synchronized with something outside React for as long as the component is mounted\" — a subscription, a browser API, a WebSocket connection — that's a genuine Effect, independent of any one triggering action.\n\n### Syntax/Example\n```jsx\n// Routes a click through state, then an Effect that watches it\nfunction Indirect() {\n  const [submitted, setSubmitted] = useState(false);\n  useEffect(() => { if (submitted) console.log('submitted'); }, [submitted]);\n  return <button onClick={() => setSubmitted(true)}>Submit</button>;\n}\n\n// Handles the click directly, at the moment intent is known\nfunction Direct() {\n  return <button onClick={() => console.log('submitted')}>Submit</button>;\n}\n```\n\n### Common Pitfalls & Gotchas\n1. **Using an Effect as a relay for a click.** This adds an invisible extra render — React has to commit the state change before the Effect is even eligible to run — for work that could have happened directly in the handler.\n2. **An Effect that can't distinguish \"why\" a value changed.** If the same state can become `true` from more than one cause (a click, a restored value, another effect), an Effect watching it fires for all of them equally, not just the one intended.\n3. **Assuming any state-change-driven side effect is an Effect's job.** The real test is whether the work needs to track a value over time and stay synchronized with something external — not whether it merely happens after state changes.\n\n### Challenge and Solution\n**Challenge:** A button click is routed through state and an Effect purely to log the click. Move the work into the event handler directly.\n\n**Solution:** Call `console.log('submitted')` straight from `onClick`; delete the `submitted` state and the Effect that watched it — there's nothing left that needs synchronizing.\n\n### Hints\n* Ask \"did something just happen, or does this need to stay synchronized?\" — the answer picks the right tool.\n* An Effect that exists only to react to one specific state flip, set by one specific click, is usually a click handler wearing a disguise.\n\n\n### Example\n```jsx\nimport { useEffect, useState } from 'react';\n\nexport default function CartButton() {\n  const [items, setItems] = useState([]);\n\n  // An Effect, because the page background lives outside React and has to\n  // be kept in step with state.\n  useEffect(() => {\n    document.body.style.backgroundColor = items.length > 2 ? '#3a2318' : '';\n  }, [items]);\n\n  function handleAdd() {\n    // An event handler, because this is caused by the click, not by a value.\n    setItems(prev => [...prev, 'Keyboard']);\n    console.log('add_to_cart');\n  }\n\n  return (\n    <div style={{ padding: 20 }}>\n      <button onClick={handleAdd}>Add to cart</button>\n      <p>{items.length} in cart. Add a third to change the background.</p>\n    </div>\n  );\n}\n```\n",
      "starterCode": "import { useEffect, useState } from 'react';\nexport default function App() {\n  const [submitted, setSubmitted] = useState(false);\n  useEffect(() => { if (submitted) console.log('submitted'); }, [submitted]);\n  return <button onClick={() => setSubmitted(true)}>Submit</button>;\n}",
      "solutionCode": "export default function App() {\n  return <button onClick={() => console.log('submitted')}>Submit</button>;\n}",
      "exampleWalkthrough": {
        "code": "import { useEffect, useState } from 'react';\n\nexport default function CartButton() {\n  const [items, setItems] = useState([]);\n\n  // An Effect, because the page background lives outside React and has to\n  // be kept in step with state.\n  useEffect(() => {\n    document.body.style.backgroundColor = items.length > 2 ? '#3a2318' : '';\n  }, [items]);\n\n  function handleAdd() {\n    // An event handler, because this is caused by the click, not by a value.\n    setItems(prev => [...prev, 'Keyboard']);\n    console.log('add_to_cart');\n  }\n\n  return (\n    <div style={{ padding: 20 }}>\n      <button onClick={handleAdd}>Add to cart</button>\n      <p>{items.length} in cart. Add a third to change the background.</p>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              12,
              13,
              14,
              15
            ],
            "description": "The analytics call sits in the handler because it is caused by the click. It happens once, at the exact moment the user's intent is known, and it needs no state to remember that the click occurred.\n\nThat is the test for an event handler: *this happened because the user did something specific.*",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              8,
              9,
              10
            ],
            "description": "The Effect exists for a different reason. The page background is an external system — it lives outside React's tree and does not re-render itself — so something has to push React's state out to it after each commit.\n\nThat is the test for an Effect: *this has to stay in step with state, regardless of what caused the state to change.* The background must be right after a click, after a restore from storage, after anything.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              4,
              10
            ],
            "description": "Now the anti-pattern this lesson exists to name. Suppose the analytics call were moved into an Effect keyed on an `addedToCart` flag instead.\n\nIt would then fire on the initial mount too, if that flag ever started `true` — a cart restored from `localStorage`, a page reopened from history — logging an \"add to cart\" the user never performed. The click would have become a fact about state rather than a moment in time, and moments in time cannot be reconstructed from state.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              20,
              21
            ],
            "description": "Click **Add to cart** three times and the preview background changes — the Effect running. Each click also logs once, from the handler.\n\nThe exact text output on the screen will be:\n`[Button: Add to cart]`\n`0 in cart. Add a third to change the background.`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "export default function App() {\n  return <button onClick={() => console.log('submitted')}>Submit</button>;\n}",
        "steps": [
          {
            "highlightLines": [
              2
            ],
            "description": "The `submitted` state and the `useEffect` that watched it are both gone. `console.log('submitted')` now runs directly inside `onClick` — exactly where the user's intent (\"I clicked submit\") is actually known.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              2
            ],
            "description": "There's no relay step anymore: no state flips to trigger a watcher, no dependency array to get wrong, no risk of the Effect also firing on mount or for an unrelated reason. One click, one direct action — which is also one fewer render than the original version needed.",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "The test: \"does this need to stay synchronized, or did something just happen?\"",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// \"Something just happened\" → event handler\nonClick={() => { saveDraft(); showToast('Saved!'); }}\n\n// \"Needs to stay synchronized with an external system\" → Effect\nuseEffect(() => {\n  const subscription = chatRoom.subscribe(roomId);\n  return () => subscription.unsubscribe();\n}, [roomId]);",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2
                ],
                "description": "A click, a form submit, a keypress — these are discrete moments where you know exactly why the code is running: because the user did something. Put the response directly at the source."
              },
              {
                "highlightLines": [
                  4,
                  5,
                  6,
                  7
                ],
                "description": "A chat room connection has to stay in sync with `roomId` for as long as the component is mounted and reacting to prop/state changes over time, regardless of what caused `roomId` to change. That ongoing synchronization requirement — not a specific triggering action — is what an Effect is for."
              }
            ]
          }
        },
        {
          "title": "An Effect-as-relay adds a render you can't see happening",
          "type": "misconception",
          "walkthrough": {
            "code": "// Extra render hiding in plain sight:\n// Click → setSubmitted(true) → RENDER → Effect fires → console.log\n//                                ^ this render did nothing user-visible\n\n// vs. the direct version:\n// Click → console.log — no extra render at all",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "Routing a click through state-then-Effect isn't just \"more code for the same result\" — it's a genuinely different execution path. React has to commit a render where `submitted` is `true` before the Effect is even eligible to run, even though nothing about that render changed what's on screen."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "For a single console.log this render is invisible. For something more expensive — a component tree that's costly to reconcile, or an Effect with its own state updates chained after it — treating a click as an Effect trigger instead of handling it directly is a common, easy-to-miss source of extra re-renders."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "use-effect-deps",
      "title": "useEffect Dependencies",
      "content": "\n# The Dependency Array\n\n### What is it?\n**Building on useEffect Basics:** The second argument to `useEffect` — the **dependency array** — is a list of values the effect reads from the component. React uses this list to decide when to re-run the effect: it re-runs whenever any value in the list is different from the previous render (compared using `Object.is`).\n\n### The three forms\n```javascript\nuseEffect(() => { sync(); });         // No array: runs after EVERY render\nuseEffect(() => { sync(); }, []);     // Empty array: runs once on mount\nuseEffect(() => { sync(); }, [a, b]); // Array: on mount + when a or b changes\n```\n\n> 💡 **Mental Model:** The dependency array is a *description*, not a *setting*. You're not telling React **when** to run the effect — you're telling React **what values** the effect depends on. React then figures out the correct timing from that description. If you describe the dependencies incorrectly, React will run the effect too rarely (stale closures) or too often (performance issues).\n\n### Stale Closures — the critical bug pattern\nWhen you omit a dependency that the effect uses, the effect's closure captures the initial value and never gets an update:\n```javascript\n// ❌ Stale closure: effect uses `id` but doesn't list it\nconst [id, setId] = useState(1);\nuseEffect(() => {\n  fetchUser(id); // Always fetches user 1, even after setId(2)!\n}, []); // id is never updated in this closure\n```\nThe effect closes over `id = 1` at mount time and is never re-run. Even though `id` changes, the effect is frozen with its initial value.\n\n### Why the ESLint plugin is your ally\nThe `eslint-plugin-react-hooks` plugin analyzes your effect and warns when you forget a dependency. When it warns, it's almost always right. The one case it might seem wrong is when you want an event listener that reads latest state — in which case, the `useRef` pattern (not disabling the linter) is the correct fix.\n\n### When NOT to ignore linter warnings\nDisabling `react-hooks/exhaustive-deps` with `// eslint-disable-next-line` is a code smell. It means your effect has an incorrect mental model. Instead:\n- If the dependency changes too often, memoize it with `useCallback` or `useMemo`.\n- If you only need the latest value without subscribing, use a `useRef` to store it.\n- If you genuinely want run-once behavior for something that uses a variable, it almost always means the variable should be outside the component or passed differently.\n\n### Challenge\n**Challenge:** The `Profile` component fetches data without a dependency array — so it re-fetches on every render, including renders caused by `setData`. Add the correct dependency to fix this.\n\n### Hints\n* The effect uses `userId` — that goes in the dependency array.\n* The correct array is `[userId]`, not `[]` — because you *do* want to refetch when `userId` changes.\n\n**Solution:**\nList every reactive value read by the Effect and include the values that determine the external synchronization. If the dependency list causes a loop, redesign the Effect or move derived logic out of it instead of suppressing the dependency warning.\n\n\n### Example\n```jsx\nimport { useEffect, useState } from 'react';\n\nexport default function DepsDemo() {\n  const [room, setRoom] = useState('general');\n  const [unrelated, setUnrelated] = useState(0);\n\n  // Only re-runs when `room` changes, not when `unrelated` does.\n  useEffect(() => {\n    document.body.style.backgroundColor = room === 'general' ? '#1d2a1d' : '#2a1d2a';\n  }, [room]);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <p>Room: {room}</p>\n      <button onClick={() => setRoom(r => (r === 'general' ? 'random' : 'general'))}>\n        Switch room\n      </button>\n      <button onClick={() => setUnrelated(n => n + 1)}>\n        Unrelated re-render ({unrelated})\n      </button>\n    </div>\n  );\n}\n```\n",
      "starterCode": "import { useState, useEffect } from 'react';\n\nexport default function App() {\n  const [id, setId] = useState(1);\n  return (\n    <div style={{ padding: 20 }}>\n      <button onClick={() => setId(id + 1)}>Next Profile</button>\n      <Profile userId={id} />\n    </div>\n  );\n}\n\nfunction Profile({ userId }) {\n  const [data, setData] = useState(\"Loading...\");\n\n  // ❌ Missing dependency array!\n  useEffect(() => {\n    setData(\"Loading...\");\n    setTimeout(() => {\n      setData(\"Data for user \" + userId);\n    }, 500);\n  }); \n\n  return <h3>{data}</h3>;\n}\n",
      "solutionCode": "import { useState, useEffect } from 'react';\n\nexport default function App() {\n  const [id, setId] = useState(1);\n  return (\n    <div style={{ padding: 20 }}>\n      <button onClick={() => setId(id + 1)}>Next Profile</button>\n      <Profile userId={id} />\n    </div>\n  );\n}\n\nfunction Profile({ userId }) {\n  const [data, setData] = useState(\"Loading...\");\n\n  useEffect(() => {\n    setData(\"Loading...\");\n    setTimeout(() => {\n      setData(\"Data for user \" + userId);\n    }, 500);\n  }, [userId]); \n\n  return <h3>{data}</h3>;\n}\n",
      "exampleWalkthrough": {
        "code": "import { useEffect, useState } from 'react';\n\nexport default function DepsDemo() {\n  const [room, setRoom] = useState('general');\n  const [unrelated, setUnrelated] = useState(0);\n\n  // Only re-runs when `room` changes, not when `unrelated` does.\n  useEffect(() => {\n    document.body.style.backgroundColor = room === 'general' ? '#1d2a1d' : '#2a1d2a';\n  }, [room]);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <p>Room: {room}</p>\n      <button onClick={() => setRoom(r => (r === 'general' ? 'random' : 'general'))}>\n        Switch room\n      </button>\n      <button onClick={() => setUnrelated(n => n + 1)}>\n        Unrelated re-render ({unrelated})\n      </button>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              10
            ],
            "description": "`[room]` is the dependency array. After every render React compares each entry with its value from the previous render using `Object.is`, and only re-runs the Effect if something differs.\n\nThe array is a description of what the Effect actually reads, which is why the linter can check it. It is not a place to put whatever makes the warning go away.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              18,
              19
            ],
            "description": "Press **Unrelated re-render**. The component re-renders — the number in the label changes — but the background stays put, because `room` compared equal and React skipped the Effect.\n\nThat skipping is the entire value of the array. Without it, every unrelated state change anywhere in this component would redo the external work.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              9,
              15
            ],
            "description": "Press **Switch room** and the background changes. `room` differs, so React runs the previous Effect's cleanup (there is none here) and then the Effect body again with the new value.\n\nThe three shapes are worth memorising: no array at all means \"after every render\"; `[]` means \"once on mount\"; `[a, b]` means \"whenever a or b changes\".",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              4,
              14
            ],
            "description": "The exact text output on the screen will be:\n`Room: general`\n`[Button: Switch room] [Button: Unrelated re-render (0)]`\n\nagainst a dark green page background, set by the Effect on mount.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "function Profile({ userId }) {\n  const [data, setData] = useState(\"Loading...\");\n\n  useEffect(() => {\n    setData(\"Loading...\");\n    setTimeout(() => {\n      setData(\"Data for user \" + userId);\n    }, 500);\n  }, [userId]); \n\n  return <h3>{data}</h3>;\n}",
        "steps": [
          {
            "highlightLines": [
              4,
              9
            ],
            "description": "Adding `[userId]` fixes the bug in two ways simultaneously:\n\n1. **Prevents runaway re-fetching:** Without the array, the effect ran after every render. `setData('Loading...')` caused a re-render, which ran the effect again, which called `setData` again — infinite loop. With `[userId]`, React only re-runs the effect when `userId` changes.\n\n2. **Keeps the fetch in sync with props:** When the parent changes `userId` from 1 to 2, React detects the dependency changed and re-runs the effect, fetching data for user 2.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6,
              7
            ],
            "description": "The effect reads `userId` from the closure. Because `userId` is in the dependency array, React guarantees this closure is always fresh — every time `userId` changes, a new effect closure is created that sees the new `userId` value.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              11
            ],
            "description": "The component renders correctly. On first render: `data = 'Loading...'`. 500ms later: `data = 'Data for user 1'`. When the button is clicked and `userId` becomes 2, the effect re-runs.\n\nThe exact text output on the screen will be:\n`[Button: Next Profile]`\n`Data for user 1`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why must functions in the component body go in the dependency array?",
          "type": "misconception",
          "walkthrough": {
            "code": "function App({ fetchUser }) {\n  // fetchUser is a new function reference on every render\n  useEffect(() => {\n    fetchUser(userId);\n  }, [fetchUser]); // Required — but may cause infinite re-runs!\n}",
            "steps": [
              {
                "highlightLines": [
                  5
                ],
                "description": "Yes, functions used inside an effect must be in the dependency array. But there's a trap: if the parent passes `fetchUser` as an inline arrow function (like `<App fetchUser={() => fetch(url)} />`), it's a new function reference on every parent render. Your effect re-runs every time the parent renders, even if nothing meaningful changed."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "The fix: the parent should wrap `fetchUser` in `useCallback` to memoize the reference. Alternatively, move `fetchUser` inside the effect itself (if it doesn't depend on component scope) or outside the component (if it's a pure utility function). Never suppress the linter — fix the root cause."
              }
            ]
          }
        },
        {
          "title": "Why the linter warnings are almost always right",
          "type": "misconception",
          "walkthrough": {
            "code": "const [id, setId] = useState(1);\n\n// ❌ Suppressing the linter — creates a stale closure\nuseEffect(() => {\n  fetchData(id);\n  // eslint-disable-next-line react-hooks/exhaustive-deps\n}, []);\n\n// ✅ Actually, if you don't want to re-fetch on id change,\n// your architecture is the problem — not the effect.",
            "steps": [
              {
                "highlightLines": [
                  6
                ],
                "description": "The linter warning `'id' is missing from the dependency array` means: your effect *reads* `id` but won't *update* when `id` changes. The closure is now permanently stale. The linter is correctly identifying that your effect's behavior is inconsistent with its dependencies."
              },
              {
                "highlightLines": [
                  10
                ],
                "description": "If you genuinely want to fetch only once and ignore future `id` changes, the issue is that `id` shouldn't be state — or the fetch should happen outside the component. When you feel the urge to suppress the linter, it's usually a signal to rethink the data flow, not to silence the warning."
              }
            ]
          }
        },
        {
          "title": "Object.is comparison: why objects/arrays as dependencies break effects",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ New object reference on every render!\nfunction App() {\n  const options = { theme: 'dark' }; // New object every render!\n  useEffect(() => {\n    applyTheme(options);\n  }, [options]); // Effect re-runs on every render — options always 'changed'!\n}",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "`{ theme: 'dark' }` looks stable, but JavaScript creates a **new object** in memory every time the function runs. React's `Object.is` comparison sees two different references (even though the values inside are identical) and concludes the dependency changed. The effect re-runs on every render."
              },
              {
                "highlightLines": [
                  6
                ],
                "description": "Fix: move the object outside the component (if it's truly static), or wrap it in `useMemo(() => ({ theme: 'dark' }), [])` to preserve the same reference across renders. Prefer primitive values (strings, numbers, booleans) as dependencies whenever possible — they compare by value, not reference."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "use-layout-effect",
      "title": "useLayoutEffect",
      "content": "\n# useLayoutEffect\n\n### What is it?\n**Building on useEffect:** While `useEffect` runs asynchronously *after* the browser paints, **`useLayoutEffect`** runs synchronously *before* the browser paints — in the same phase as class components' `componentDidMount`/`componentDidUpdate`.\n\n> 💡 **Mental Model:** Imagine a painter and a photographer. `useEffect` is the photographer who shows up after the painter has displayed the painting to visitors. `useLayoutEffect` is the photographer who sneaks in *before* the velvet rope goes up — they can adjust the painting's position before anyone sees it. Visitors never see the painting in the wrong position.\n\n### Why does this exist?\nFor one specific class of problems: **measuring DOM nodes and synchronously adjusting layout based on that measurement**. If you measure a node in `useEffect`, the sequence is:\n1. React renders, commits DOM\n2. Browser paints (user sees wrong position for ~1 frame)\n3. `useEffect` runs, measures, updates state\n4. React re-renders, commits corrected DOM\n5. Browser repaints (user sees correct position)\n\nThe user experiences a brief flash (the wrong position for one frame). `useLayoutEffect` eliminates step 2/3 ordering: it fires before painting, so the user only ever sees the correct final state.\n\n### ⚠️ When NOT to use it\n- **Prefer `useEffect` for everything else.** `useLayoutEffect` blocks the browser from painting. Doing heavy work here makes the UI feel sluggish.\n- **It breaks SSR.** Servers have no DOM, no painting, no layout. `useLayoutEffect` throws a warning on the server (Next.js, Remix). If you need it in SSR apps, guard it: `if (typeof window !== 'undefined')`.\n- **You shouldn't need it for data fetching, logging, or subscriptions.** Those are `useEffect` territory.\n\n### Challenge\n**Challenge:** The tooltip uses `useEffect` to measure the button's position. This causes a visible flash when the tooltip first appears (it briefly appears at `top: 0` before jumping to the correct position). Replace `useEffect` with `useLayoutEffect` to eliminate the flash.\n\n### Hints\n* Change the import: `useLayoutEffect` is exported from `'react'` just like `useEffect`.\n* The hook's API is identical — just change the name. No other code changes needed.\n\n**Solution:**\nUse the layout variant only when the browser must measure or update layout before the user sees the frame. For ordinary subscriptions, timers, and data synchronization, useEffect is the safer default because it does not block painting.\n\n\n### Example\n```jsx\nimport { useState, useLayoutEffect, useRef } from 'react';\n\nexport default function Tooltip() {\n  const [height, setHeight] = useState(0);\n  const ref = useRef(null);\n\n  useLayoutEffect(() => {\n    if (ref.current) {\n      setHeight(ref.current.getBoundingClientRect().height);\n    }\n  }, []);\n\n  return <div ref={ref}>Height is {height}px</div>;\n}\n```\n",
      "starterCode": "import { useState, useEffect, useRef } from 'react';\n\nexport default function Tooltip() {\n  const [show, setShow] = useState(false);\n  const [position, setPosition] = useState({ top: 0, left: 0 });\n  const tooltipRef = useRef(null);\n  const buttonRef = useRef(null);\n\n  useEffect(() => {\n    if (show && tooltipRef.current && buttonRef.current) {\n      const rect = buttonRef.current.getBoundingClientRect();\n      setPosition({ top: rect.bottom + 8, left: rect.left });\n    }\n  }, [show]);\n\n  return (\n    <div style={{ padding: 40 }}>\n      <button ref={buttonRef} onClick={() => setShow(s => !s)}>\n        Hover for tooltip\n      </button>\n      {show && (\n        <div ref={tooltipRef} style={{\n          position: 'fixed',\n          top: position.top,\n          left: position.left,\n          background: '#333',\n          color: '#fff',\n          padding: '4px 8px',\n          borderRadius: 4\n        }}>\n          I am a tooltip\n        </div>\n      )}\n    </div>\n  );}",
      "solutionCode": "import { useState, useLayoutEffect, useRef } from 'react';\n\nexport default function Tooltip() {\n  const [show, setShow] = useState(false);\n  const [position, setPosition] = useState({ top: 0, left: 0 });\n  const tooltipRef = useRef(null);\n  const buttonRef = useRef(null);\n\n  useLayoutEffect(() => {\n    if (show && tooltipRef.current && buttonRef.current) {\n      const rect = buttonRef.current.getBoundingClientRect();\n      setPosition({ top: rect.bottom + 8, left: rect.left });\n    }\n  }, [show]);\n\n  return (\n    <div style={{ padding: 40 }}>\n      <button ref={buttonRef} onClick={() => setShow(s => !s)}>\n        Hover for tooltip\n      </button>\n      {show && (\n        <div ref={tooltipRef} style={{\n          position: 'fixed',\n          top: position.top,\n          left: position.left,\n          background: '#333',\n          color: '#fff',\n          padding: '4px 8px',\n          borderRadius: 4\n        }}>\n          I am a tooltip\n        </div>\n      )}\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useState, useLayoutEffect, useRef } from 'react';\n\nexport default function Tooltip() {\n  const [height, setHeight] = useState(0);\n  const ref = useRef(null);\n\n  useLayoutEffect(() => {\n    if (ref.current) {\n      setHeight(ref.current.getBoundingClientRect().height);\n    }\n  }, []);\n\n  return <div ref={ref}>Height is {height}px</div>;\n}",
        "steps": [
          {
            "highlightLines": [
              7,
              8,
              9,
              10
            ],
            "description": "After React writes the `<div>` to the DOM (but before the browser paints), `useLayoutEffect` fires. We use `.getBoundingClientRect()` to measure the element's actual rendered height — this can only be done after the element exists in the DOM, which is why we can't do it during render.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              9
            ],
            "description": "We call `setHeight(height)` synchronously inside `useLayoutEffect`. React processes this state update immediately, before yielding control to the browser's paint step. This triggers a synchronous re-render with the correct height.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              13
            ],
            "description": "The browser finally paints the screen. The user sees the component with the already-correct height — they never see `Height is 0px` for even a single frame.\n\nThe exact text output on the screen will be:\n`Height is 18px`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useState, useLayoutEffect, useRef } from 'react';\n\nexport default function Tooltip() {\n  const [show, setShow] = useState(false);\n  const [position, setPosition] = useState({ top: 0, left: 0 });\n  const tooltipRef = useRef(null);\n  const buttonRef = useRef(null);\n\n  useLayoutEffect(() => {\n    if (show && tooltipRef.current && buttonRef.current) {\n      const rect = buttonRef.current.getBoundingClientRect();\n      setPosition({ top: rect.bottom + 8, left: rect.left });\n    }\n  }, [show]);\n\n  // ...render\n}",
        "steps": [
          {
            "highlightLines": [
              1,
              9
            ],
            "description": "We changed from `useEffect` to `useLayoutEffect`. The API is identical — same arguments, same return value. The only difference is *when* it fires relative to the browser's paint cycle.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10,
              11,
              12,
              13
            ],
            "description": "When `show` becomes `true`, React renders the tooltip into the DOM at `position = { top: 0, left: 0 }`. Before the browser can paint that initial (wrong) position, `useLayoutEffect` runs, measures the button, and calls `setPosition` with the correct coordinates. React immediately re-renders with the correct position — all before the first paint.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              16
            ],
            "description": "The browser paints: the tooltip appears exactly where it should, below the button. No visual jump, no flicker. Users on slow devices or slow renders won't notice anything wrong.\n\nThe exact text output on the screen will be:\n`[Button: Hover for tooltip]`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "useEffect vs useLayoutEffect: choosing the right one",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// ← useEffect: async, after paint\n//   Use for: data fetching, subscriptions, logging, timers\n\n// ← useLayoutEffect: sync, before paint\n//   Use for: DOM measurement + immediate layout correction\n//            (tooltips, modals, scroll restoration, focus management)",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "**Default to `useEffect` for almost all cases.** It's non-blocking and doesn't delay the browser from painting. Data fetching, event subscriptions, analytics, WebSocket connections — all `useEffect`."
              },
              {
                "highlightLines": [
                  5,
                  6
                ],
                "description": "**Use `useLayoutEffect` only when you see a visual flicker** caused by measuring a DOM element and updating state/position based on that measurement. Real examples: positioning a floating dropdown, measuring a collapsed section height before animating it open, restoring scroll position after navigation. If you're not measuring DOM nodes, you don't need `useLayoutEffect`."
              }
            ]
          }
        },
        {
          "title": "Why useLayoutEffect breaks Server-Side Rendering",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ Next.js will warn: useLayoutEffect does nothing on the server\nuseLayoutEffect(() => {\n  const width = window.innerWidth;\n}, []);",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "On the server (SSR), there is no DOM — no browser, no paint cycle, no `window`. `useLayoutEffect` fires synchronously *before* browser paint, but on the server there is no browser paint. React warns because the hook would run but do nothing useful, which is typically a bug."
              },
              {
                "highlightLines": [
                  3
                ],
                "description": "Fix: use a `useIsomorphicLayoutEffect` pattern (an alias that is `useLayoutEffect` on the client and `useEffect` on the server), or guard the code: `if (typeof window !== 'undefined') { ... }`. Better yet, for measuring purposes, use `useEffect` — the flicker is often imperceptible in SSR apps where the initial HTML already contains the correct structure."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "data-fetching",
      "title": "Client Data Fetching and Its Limits",
      "content": "\n# Fetching Data on Mount\n\n### What is it?\n**Building on useEffect and async/await:** A client component can synchronize with a remote resource from an Effect, but this is a low-level pattern rather than the universal React data-fetching architecture. Production apps often use a framework data layer or a server-state library for caching, deduplication, retries, invalidation, and request lifecycle management.\n\n> 💡 **Mental Model:** Think of data fetching in an effect like ordering food after you've already sat down: the component renders first (you're seated), then the order goes out (the request fires), and eventually the food arrives and gets set on the table (state updates when the response comes back).\n\n### The minimal data fetching lifecycle\n1. Component mounts → `loading = true`, `data = null`\n2. `useEffect` fires → fetch begins\n3. Fetch succeeds → `data = result`, `loading = false`\n4. Fetch fails → `error = message`, `loading = false`\n\n### Why use `AbortController`?\nIf the user navigates away while a fetch is in-flight, the fetch continues to completion and then updates UI with a result that may no longer be relevant. Cleanup can abort or otherwise invalidate stale work. `AbortController` lets you cancel the network request in the cleanup function:\n```javascript\nuseEffect(() => {\n  const controller = new AbortController();\n  async function load() {\n    const res = await fetch('/api/data', { signal: controller.signal });\n    const data = await res.json();\n    setData(data);\n  }\n  load();\n  return () => controller.abort(); // Cancel if component unmounts\n}, []);\n```\n\n### The limitation: waterfall fetching\nFetching inside `useEffect` always happens *after* render, which means there's always a loading state. In deeply nested component trees, each child can only start fetching after its parent renders — creating a \"waterfall.\" For production apps, consider React Query, SWR, or Next.js Server Components which fetch data *before* the component renders.\n\n### Challenge\n**Challenge:** Implement data fetching for a list of users. Fetch from `'https://jsonplaceholder.typicode.com/users'`, store results in state, manage a loading state, and include an `AbortController` for cleanup.\n\n### Hints\n* Use `useState` for three pieces of state: `users` (array), `loading` (boolean), and optionally `error`.\n* Inside `useEffect(() => { ... }, [])`, define and immediately call an async function.\n* Return `() => controller.abort()` as the cleanup.\n* **This lesson needs a connection.** `jsonplaceholder.typicode.com` is a real public API and the playground really calls it. Offline, the fetch rejects and you will sit on `Loading users...` — that is the network, not your code. Several later lessons (React Query, router loaders, Suspense) use the same endpoint for the same reason.\n\n**Solution:**\nTrack the request lifecycle explicitly: show a loading state, handle errors, render the data, and clean up or ignore stale responses when the inputs change. Keep the request synchronized with its inputs rather than fetching from render itself.\n\n\n### Example\n```jsx\nimport { useEffect, useState } from 'react';\n\nfunction UserProfile({ id }) {\n  const [user, setUser] = useState(null);\n\n  useEffect(() => {\n    let cancelled = false;\n    async function load() {\n      const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);\n      const data = await res.json();\n      if (!cancelled) setUser(data);\n    }\n    load();\n    return () => { cancelled = true; };\n  }, [id]);\n\n  return <h3>{user ? user.name : 'Loading...'}</h3>;\n}\n\nexport default function App() {\n  const [id, setId] = useState(1);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <button onClick={() => setId(n => (n % 5) + 1)}>Next user</button>\n      <UserProfile id={id} />\n    </div>\n  );\n}\n```\n",
      "starterCode": "import { useState, useEffect } from 'react';\n\nexport default function App() {\n  const [users, setUsers] = useState([]);\n  const [loading, setLoading] = useState(true);\n\n  // 👉 1. Use the effect hook to fetch data when the component mounts\n  // 👉 2. Fetch from 'https://jsonplaceholder.typicode.com/users'\n  // 👉 3. Update the state with data and loading status\n  \n  if (loading) return <div style={{ padding: 20 }}>Loading users...</div>;\n\n  return (\n    <ul style={{ padding: 20 }}>\n      {users.map(u => (\n        <li key={u.id} style={{ padding: '4px 0' }}>{u.name}</li>\n      ))}\n    </ul>\n  );\n}\n",
      "solutionCode": "import { useState, useEffect } from 'react';\n\nexport default function App() {\n  const [users, setUsers] = useState([]);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    const controller = new AbortController();\n    async function load() {\n      try {\n        const res = await fetch('https://jsonplaceholder.typicode.com/users', { signal: controller.signal });\n        const data = await res.json();\n        setUsers(data);\n        setLoading(false);\n      } catch (err) {\n        if (err.name !== 'AbortError') setLoading(false);\n      }\n    }\n    load();\n    return () => controller.abort();\n  }, []);\n\n  if (loading) return <div style={{ padding: 20 }}>Loading users...</div>;\n\n  return (\n    <ul style={{ padding: 20 }}>\n      {users.map(u => (\n        <li key={u.id} style={{ padding: '4px 0' }}>{u.name}</li>\n      ))}\n    </ul>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useEffect, useState } from 'react';\n\nfunction UserProfile({ id }) {\n  const [user, setUser] = useState(null);\n\n  useEffect(() => {\n    let cancelled = false;\n    async function load() {\n      const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);\n      const data = await res.json();\n      if (!cancelled) setUser(data);\n    }\n    load();\n    return () => { cancelled = true; };\n  }, [id]);\n\n  return <h3>{user ? user.name : 'Loading...'}</h3>;\n}\n\nexport default function App() {\n  const [id, setId] = useState(1);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <button onClick={() => setId(n => (n % 5) + 1)}>Next user</button>\n      <UserProfile id={id} />\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              6,
              15
            ],
            "description": "`[id]` means the fetch runs on mount and again whenever the parent passes a different id. Press **Next user** and you are watching that re-run.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              8,
              12,
              13
            ],
            "description": "The `async` function is declared *inside* the Effect and called immediately. The Effect itself cannot be `async`, because an `async` function returns a Promise and React expects the return value to be the cleanup function — it would try to call the Promise.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7,
              11,
              14
            ],
            "description": "The `cancelled` flag is the whole reason this is more than four lines. Press **Next user** twice quickly and two requests are in flight; if the first resolves last, it would overwrite the second's data and the screen would show the wrong user with no error anywhere.\n\nCleanup sets `cancelled = true` for the *previous* Effect run, so its `setUser` is skipped. An `AbortController` solves the same race by cancelling the request itself.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              17
            ],
            "description": "And now the limits this lesson is named for. Every consumer of this pattern rewrites the same loading flag, error branch, and race guard by hand; nothing is cached, so remounting refetches; and the request cannot start until the component has rendered, which puts a round trip after paint.\n\nThose are the gaps React Query and route loaders exist to fill — not because `useEffect` is wrong, but because this is a lot to get right repeatedly.\n\nThe exact text output on the screen will be:\n`[Button: Next user]`\n`Loading...`\n\nreplaced a moment later by `Leanne Graham`.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "function App() {\n  const [users, setUsers] = useState([]);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    const controller = new AbortController();\n    async function load() {\n      try {\n        const res = await fetch('https://jsonplaceholder.typicode.com/users', { signal: controller.signal });\n        const data = await res.json();\n        setUsers(data);\n        setLoading(false);\n      } catch (err) {\n        if (err.name !== 'AbortError') setLoading(false);\n      }\n    }\n    load();\n    return () => controller.abort();\n  }, []);\n  \n  if (loading) return <div>Loading...</div>;\n  return <ul>{/* render users */}</ul>;\n}",
        "steps": [
          {
            "highlightLines": [
              3,
              21
            ],
            "description": "`loading = true` means the component renders the loading fallback on the very first render — before the effect even fires. This ensures users never see a blank screen or a flash of empty list.\n\nAfter `setLoading(false)` is called (once data arrives), the component re-renders and shows the list.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6,
              18
            ],
            "description": "`AbortController` is the professional way to handle cleanup. `controller.abort()` cancels the pending `fetch` request. The browser cancels the network request entirely — not just ignores the response, but stops the connection. The `{ signal: controller.signal }` option links the fetch to this controller.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              13,
              14,
              15
            ],
            "description": "The `catch` handles two cases:\n- `AbortError`: the cleanup function fired (component unmounted or dependency changed). This is expected — we silently ignore it.\n- Any other error: a genuine network failure. We stop the loading spinner so the user isn't stuck. In production, you'd also set an `error` state and show an error message.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              11,
              12,
              17,
              18
            ],
            "description": "On success: set the users array and stop loading. The re-render shows the list.\n\nThe exact text output on the screen will be:\n`• Leanne Graham`\n`• Ervin Howell`\n`• Clementine Bauch`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why is my fetch called twice in development?",
          "type": "misconception",
          "walkthrough": {
            "code": "// In development with StrictMode:\n// Mount → Effect fires → fetch() called\n// Unmount → cleanup (abort) called\n// Remount → Effect fires again → fetch() called again\n\n// In production:\n// Mount → Effect fires → fetch() called (once, normally)",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2,
                  3,
                  4
                ],
                "description": "React StrictMode's double-invoke behavior causes the effect (and thus the fetch) to run twice in development. The second run happens after cleanup — so if you have an `AbortController`, the first fetch is cancelled, and only the second fetch's result reaches `setData`."
              },
              {
                "highlightLines": [
                  6,
                  7
                ],
                "description": "In production, StrictMode double-invoke doesn't occur. The fetch runs once. If you see double fetching in production, it's a different bug (likely duplicate `useEffect` registrations or strict mode improperly applied)."
              }
            ]
          }
        },
        {
          "title": "Race conditions: why the last request should always win",
          "type": "misconception",
          "walkthrough": {
            "code": "useEffect(() => {\n  let isCancelled = false; // Flag to prevent stale state\n  \n  async function load() {\n    const data = await fetchUser(userId); // Could be slow!\n    if (!isCancelled) setUser(data); // Only update if still current\n  }\n  load();\n  \n  return () => { isCancelled = true; }; // Mark as stale on cleanup\n}, [userId]);",
            "steps": [
              {
                "highlightLines": [
                  5
                ],
                "description": "Scenario: user clicks Profile A (request takes 3s), then quickly clicks Profile B (request takes 0.5s). Profile B's request resolves first. Then Profile A's request resolves and calls `setUser(profileA)` — overwriting the correct Profile B data with stale data. This is a **race condition**."
              },
              {
                "highlightLines": [
                  6,
                  10
                ],
                "description": "The `isCancelled` flag fixes it. When the user clicks Profile B, React runs cleanup for Profile A's effect, setting `isCancelled = true`. When Profile A's fetch finally resolves, the `if (!isCancelled)` check prevents it from calling `setUser`. The `AbortController` approach is cleaner — it actually cancels the network request rather than just ignoring the response."
              }
            ]
          }
        },
        {
          "title": "When to reach for React Query or SWR instead",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Manual useEffect data fetching:\n// ❌ No caching (refetches every mount)\n// ❌ No deduplication (two components both fetch same URL separately)\n// ❌ No background refetch (stale data shown after navigation)\n// ❌ No loading/error state built in\n\n// React Query:\nconst { data, isLoading, error } = useQuery({\n  queryKey: ['users'],\n  queryFn: () => fetch('/api/users').then(r => r.json())\n});",
            "steps": [
              {
                "highlightLines": [
                  2,
                  3,
                  4,
                  5
                ],
                "description": "Manual `useEffect` data fetching is fine for learning and simple cases. But it has real limitations: every unmount/remount triggers a new fetch (no caching), two components that need the same data make two separate requests (no deduplication), and stale data is shown without background updates."
              },
              {
                "highlightLines": [
                  8,
                  9,
                  10,
                  11
                ],
                "description": "React Query (TanStack Query) and SWR are dedicated data-fetching libraries that add caching, request deduplication, background refetching, pagination, optimistic updates, and more. For any production app doing significant data fetching, these libraries are the standard approach — not raw `useEffect`."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "diagnostic-stale-closure",
      "title": "Diagnostic: Stale Closure",
      "content": "\n# Diagnostic: Stale Closure\n\n### What is it?\n**Building on dependency arrays and closures:** A stale closure happens when a function inside `useEffect` (or `useCallback`, or `setTimeout`) captures a variable from a render cycle that no longer exists — and then uses that outdated value when called later.\n\n> 💡 **Mental Model:** Imagine writing a note in a journal: `\"Today the score is 5.\"` Two days later, the score is 12. The note is still physically in the journal saying 5 — it's a snapshot of the past. A stale closure is exactly this: a function that wrote down the old score and still operates on it, even though the score has moved on.\n\n### Why does this happen in React?\nEvery render creates *new* versions of all variables and functions inside the component. When `useEffect` runs, its callback captures the *values at that moment* via closure. If the effect is never re-run (empty dependency array), its callback forever holds onto the initial values, even as state changes on the next render.\n\n### The canonical stale closure example\n```javascript\nconst [count, setCount] = useState(0);\nuseEffect(() => {\n  const id = setInterval(() => {\n    setCount(count + 1); // 'count' is forever 0 — captured at mount!\n  }, 1000);\n  return () => clearInterval(id);\n}, []); // Empty array → effect runs once → closure is frozen\n```\nThe interval always computes `0 + 1 = 1`. `count` is forever stuck at 1.\n\n### The two fixes\n1. **Functional updater form** (preferred for state): `setCount(c => c + 1)` — React passes the current state directly, bypassing the closure entirely.\n2. **`useRef` as a mutable escape hatch**: Store the latest value in a ref, update it on every render, read from the ref inside the effect.\n\n### Challenge\n**Challenge:** The counter gets stuck at 1 because the interval callback closes over `count = 0`. Fix it without changing the dependency array — use the functional updater form.\n\n### Hints\n* Replace `setCount(count + 1)` with `setCount(c => c + 1)`.\n* The functional updater receives the current state value as its argument — completely bypassing whatever `count` is in the closure.\n\n**Solution:**\nThe handler captured a value from an older render. Include the changing value in the synchronization dependencies, use a functional state updater when appropriate, or move the logic to the event where the current value is available.\n\n\n### Example\n```jsx\nimport { useState, useEffect } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    const interval = setInterval(() => {\n      setCount(count + 1);\n    }, 1000);\n    return () => clearInterval(interval);\n  }, []);\n\n  return <h1>{count}</h1>;\n}\n```\n",
      "starterCode": "import { useState, useEffect } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    const interval = setInterval(() => {\n      setCount(count + 1);\n    }, 1000);\n    return () => clearInterval(interval);\n  }, []);\n\n  return <h1>{count}</h1>;\n}",
      "solutionCode": "import { useState, useEffect } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    const interval = setInterval(() => {\n      setCount(c => c + 1);\n    }, 1000);\n    return () => clearInterval(interval);\n  }, []);\n\n  return <h1>{count}</h1>;\n}",
      "exampleWalkthrough": {
        "code": "import { useState, useEffect } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    const interval = setInterval(() => {\n      setCount(count + 1);\n    }, 1000);\n    return () => clearInterval(interval);\n  }, []);\n\n  return <h1>{count}</h1>;\n}",
        "steps": [
          {
            "highlightLines": [
              4,
              11
            ],
            "description": "Run this and watch it: the number goes to 1 and then stops forever.\n\nOn the first render `count` is `0`. The Effect runs once, because of the empty dependency array, and the callback handed to `setInterval` closes over everything in scope at that moment — including that `0`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              8
            ],
            "description": "Every second the interval fires `setCount(count + 1)`. But `count` inside this closure is still the `0` captured on the first render, and it always will be — later renders create new `count` constants, and this callback cannot see them.\n\nSo the calculation is `0 + 1` every single time. React sets state to `1`, compares, finds it unchanged, and stops bothering to re-render.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6,
              7
            ],
            "description": "Two things could fix it, and they are not equally good.\n\nAdding `count` to the dependency array works, but it tears down and recreates the interval every second — the timer restarts from zero each time, so it drifts. The functional updater `setCount(c => c + 1)` fixes it properly: React passes the *current* value in, so the closure never needs to know it.\n\nThe general shape to recognise: an Effect with `[]` that reads a reactive value is claiming something untrue about itself.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useState, useEffect } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    const interval = setInterval(() => {\n      setCount(c => c + 1);\n    }, 1000);\n    return () => clearInterval(interval);\n  }, []);\n\n  return <h1>{count}</h1>;\n}",
        "steps": [
          {
            "highlightLines": [
              8
            ],
            "description": "The fix is one character change: `setCount(count + 1)` → `setCount(c => c + 1)`.\n\nThe **functional updater** `c => c + 1` doesn't read from the closure at all. Instead, React calls this function and passes it the *actual current state value* as `c`. React maintains the state value independently from closures — the functional form bypasses the closure entirely.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7,
              8,
              9
            ],
            "description": "Now the interval callback no longer reads `count` from the outer scope. It just says: 'Take whatever the current count is and add 1.' React handles providing the current count each time. The counter correctly increments every second: 0 → 1 → 2 → 3...",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10,
              13
            ],
            "description": "The cleanup still cancels the interval on unmount. The functional updater fixed the stale closure with zero dependency array changes.\n\nThe exact text output on the screen will be:\n`1`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "The `useRef` escape hatch for stale closures",
          "type": "did-you-know",
          "walkthrough": {
            "code": "const [count, setCount] = useState(0);\nconst latestCount = useRef(count);\n\n// Sync after each commit — not in the render body.\nuseEffect(() => {\n  latestCount.current = count;\n});\n\nuseEffect(() => {\n  const id = setInterval(() => {\n    console.log(latestCount.current); // Always the latest committed value\n  }, 1000);\n  return () => clearInterval(id);\n}, []);",
            "steps": [
              {
                "highlightLines": [
                  2,
                  4,
                  5,
                  6,
                  7
                ],
                "description": "`useRef` returns a mutable object that persists across renders, and updating it does not trigger one. Writing the newest `count` into it after every commit means the ref always holds the latest value.\n\nThe write lives in an Effect rather than in the render body on purpose: the render body must stay pure, and React asks you not to read or write `ref.current` during render."
              },
              {
                "highlightLines": [
                  11,
                  13
                ],
                "description": "The long-lived interval callback reads `latestCount.current` instead of `count`. It still captures `latestCount` in its closure — but that is a stable object whose *contents* keep moving, so the read is never stale.\n\nThis is the 'ref escape hatch'. Prefer the functional updater when you are setting state; reach for this when you need to *read* the newest value for something else. And note the cleanup: an interval an Effect starts is an interval that Effect has to stop."
              }
            ]
          }
        },
        {
          "title": "Why does the functional updater bypass the closure?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// setCount(count + 1): React receives a plain number\n// React stores: next_state = count + 1 (reads count from closure)\n\n// setCount(c => c + 1): React receives a function\n// React stores: next_state = fn(current_state)\n// React calls: (c => c + 1)(actualCurrentState)",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "When you pass a plain value (`count + 1`), React treats it as the literal next state value. If `count` in the closure is stale (0), React receives `1` and sets the state to `1` — regardless of what the true current state is."
              },
              {
                "highlightLines": [
                  5,
                  6
                ],
                "description": "When you pass a function (`c => c + 1`), React treats it as an updater function and calls it with the current queued state as the argument. This happens internally in React's state queue — completely separate from your component's closure. The stale closure doesn't matter because the function never reads from it."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "diagnostic-missing-cleanup",
      "title": "Diagnostic: Missing Cleanup",
      "content": "\n# Diagnostic: Missing Cleanup\n\n### What is it?\n**Building on effect lifecycles:** A missing cleanup is when an effect creates a resource (timer, subscription, event listener, network request) without providing a cleanup function to destroy it when the effect re-runs or the component unmounts.\n\n> 💡 **Mental Model:** Think of a missing cleanup function like leaving the water running after you leave the room: the effect (the tap) kept going even though nobody's there to use it anymore, quietly wasting resources until something notices the flood.\n\n### The three resource types that always need cleanup\n\n1. **Timers:** `setTimeout`, `setInterval`\n```javascript\nuseEffect(() => {\n  const id = setInterval(tick, 1000);\n  return () => clearInterval(id); // Required!\n}, []);\n```\n\n2. **Event listeners:** `addEventListener`\n```javascript\nuseEffect(() => {\n  window.addEventListener('resize', handleResize);\n  return () => window.removeEventListener('resize', handleResize); // Required!\n}, []);\n```\n\n3. **Network requests (race conditions):**\n```javascript\nuseEffect(() => {\n  const controller = new AbortController();\n  fetch(url, { signal: controller.signal });\n  return () => controller.abort(); // Required!\n}, [url]);\n```\n\n### Why cleanup runs twice in some scenarios\nThe cleanup function runs:\n- When the component **unmounts**.\n- **Before the effect re-runs** due to a dependency change.\n\nThis second case is subtle but important. If `userId` changes from 1 to 2, React:\n1. Runs cleanup for the `userId=1` effect (cancels old fetch)\n2. Runs the effect with `userId=2` (starts new fetch)\n\nThis is why effect cleanup + setup is often called the 'connect/disconnect' pattern.\n\n### The most dangerous missing cleanup: global event listeners\n```javascript\nuseEffect(() => {\n  window.addEventListener('keydown', handleKeyPress);\n  // No cleanup! The listener NEVER goes away — even after unmount!\n}, []);\n```\nEvery time the component mounts, a new listener is added. If the component mounts 10 times (during development with HMR, or in a list), 10 listeners accumulate. Each one fires on every keypress. This is a memory leak and a behavioral bug.\n\n### Challenge\n**Challenge:** The `UserCard` component fetches user data but has no cleanup. Press **Next user** several times quickly and watch the name land on whichever request finished last, rather than on the user actually selected. Add an `AbortController` to fix the race condition.\n\n### Hints\n* Create `const controller = new AbortController()` inside the effect.\n* Pass `{ signal: controller.signal }` as the second argument to `fetch`.\n* Return `() => controller.abort()` as the cleanup.\n* Wrap in try/catch and ignore `AbortError`.\n\n**Solution:**\nReturn a cleanup function that removes the listener, clears the timer, disconnects the subscription, or aborts the request. Cleanup runs before re-synchronization and when the component unmounts.\n\n\n### Example\n```jsx\nimport { useState, useEffect } from 'react';\n\nexport default function UserCard() {\n  const [userId, setUserId] = useState(1);\n  const [user, setUser] = useState(null);\n\n  useEffect(() => {\n    fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)\n      .then(r => r.json())\n      .then(data => setUser(data));\n  }, [userId]);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <button onClick={() => setUserId(n => (n % 5) + 1)}>Next user</button>\n      <h2>{user ? user.name : 'Loading...'}</h2>\n    </div>\n  );\n}\n```\n",
      "starterCode": "import { useState, useEffect } from 'react';\n\nexport default function UserCard() {\n  const [userId, setUserId] = useState(1);\n  const [user, setUser] = useState(null);\n\n  // No cleanup. Press \"Next user\" several times quickly and watch the name\n  // settle on whichever request happened to finish last.\n  useEffect(() => {\n    fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)\n      .then(r => r.json())\n      .then(data => setUser(data));\n  }, [userId]);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <button onClick={() => setUserId(n => (n % 5) + 1)}>Next user</button>\n      <h2>{user ? user.name : 'Loading...'}</h2>\n    </div>\n  );\n}",
      "solutionCode": "import { useState, useEffect } from 'react';\n\nexport default function UserCard() {\n  const [userId, setUserId] = useState(1);\n  const [user, setUser] = useState(null);\n\n  useEffect(() => {\n    const controller = new AbortController();\n    fetch(`https://jsonplaceholder.typicode.com/users/${userId}`, { signal: controller.signal })\n      .then(r => r.json())\n      .then(data => setUser(data))\n      .catch(err => {\n        if (err.name !== 'AbortError') console.error(err);\n      });\n    return () => controller.abort();\n  }, [userId]);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <button onClick={() => setUserId(n => (n % 5) + 1)}>Next user</button>\n      <h2>{user ? user.name : 'Loading...'}</h2>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useState, useEffect } from 'react';\n\nexport default function UserCard() {\n  const [userId, setUserId] = useState(1);\n  const [user, setUser] = useState(null);\n\n  useEffect(() => {\n    fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)\n      .then(r => r.json())\n      .then(data => setUser(data));\n  }, [userId]);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <button onClick={() => setUserId(n => (n % 5) + 1)}>Next user</button>\n      <h2>{user ? user.name : 'Loading...'}</h2>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              7,
              11
            ],
            "description": "When `userId` changes, React re-runs this Effect. What it does **not** do is cancel the request the previous run started — React knows nothing about that fetch.\n\nSo press **Next user** quickly a few times and several requests are in flight at once, each holding its own `setUser` callback.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              9,
              10
            ],
            "description": "Responses arrive in whatever order the network delivers them, which is not the order they were sent. If the request for user 1 is slow and lands after user 3's, its `.then(data => setUser(data))` runs last and puts user 1 back on screen.\n\nThe display now disagrees with `userId`, with no error, no warning, and nothing in the code that looks wrong.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7
            ],
            "description": "The Effect has no cleanup, and that is the defect. Returning a function that aborts the request — or that sets a `cancelled` flag the `.then` checks — makes each run responsible for undoing itself.\n\nThe habit worth forming: whenever an Effect starts something that can finish later, ask what happens if the Effect re-runs before it does. A fetch, a subscription, a timer, an animation frame — all the same question.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useState, useEffect } from 'react';\n\nexport default function UserCard() {\n  const [userId, setUserId] = useState(1);\n  const [user, setUser] = useState(null);\n\n  useEffect(() => {\n    const controller = new AbortController();\n    fetch(`https://jsonplaceholder.typicode.com/users/${userId}`, { signal: controller.signal })\n      .then(r => r.json())\n      .then(data => setUser(data))\n      .catch(err => {\n        if (err.name !== 'AbortError') console.error(err);\n      });\n    return () => controller.abort();\n  }, [userId]);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <button onClick={() => setUserId(n => (n % 5) + 1)}>Next user</button>\n      <h2>{user ? user.name : 'Loading...'}</h2>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              8
            ],
            "description": "`new AbortController()` creates a controller with a `signal` property. This signal can be passed to any `fetch` call to link them. When `controller.abort()` is called, the fetch sees the signal as aborted and immediately rejects its promise with an `AbortError`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              15
            ],
            "description": "The cleanup function calls `controller.abort()`. When `userId` changes, React runs cleanup before starting the new effect. The old fetch (for the previous user) receives the abort signal and is cancelled at the network level — the browser stops the request entirely.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              12,
              13,
              14
            ],
            "description": "The catch block handles the abort. `AbortError` is expected — it's not a bug, it's cleanup working correctly. We silently ignore it. Any other error (network failure, server error) is logged for debugging.",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why am I getting a 'setState on unmounted component' warning?",
          "type": "misconception",
          "walkthrough": {
            "code": "// No cleanup → fetch resolves after unmount → warning!\nuseEffect(() => {\n  fetch('/api/data')\n    .then(res => res.json())\n    .then(data => setData(data)); // Warning: component is gone!\n}, []);\n\n// With AbortController → fetch is cancelled before it resolves\nuseEffect(() => {\n  const ctrl = new AbortController();\n  fetch('/api/data', { signal: ctrl.signal }).then(...);\n  return () => ctrl.abort(); // Cancel before component disappears\n}, []);",
            "steps": [
              {
                "highlightLines": [
                  5
                ],
                "description": "When a component unmounts while a fetch is in flight, the fetch continues. When it resolves, it calls `setData` — but the component is gone. React (prior to v18) warned: 'Cannot update state of an unmounted component'. In React 18+, this was made a no-op to avoid the warning, but the memory leak (the closure keeps the component in memory) still exists."
              },
              {
                "highlightLines": [
                  11
                ],
                "description": "With `AbortController`, the cleanup cancels the network request when the component unmounts. The fetch's `.then` is never called — there's no attempt to update state on a gone component, and the closure is released. Clean."
              }
            ]
          }
        },
        {
          "title": "The accumulating event listener bug",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ No cleanup — new listener added every mount!\nuseEffect(() => {\n  window.addEventListener('keydown', handleKeyPress);\n}, []); // Handler never removed!\n\n// ✅ Correct — symmetric add/remove\nuseEffect(() => {\n  window.addEventListener('keydown', handleKeyPress);\n  return () => window.removeEventListener('keydown', handleKeyPress);\n}, []);",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "Every time the component mounts (initial load, HMR hot reload, StrictMode double-mount), a new `keydown` listener is added to `window`. Without cleanup, none of them are ever removed. 10 mounts = 10 listeners all firing simultaneously on every key press. Functions execute 10 times, possibly causing wrong behavior and consuming memory."
              },
              {
                "highlightLines": [
                  9
                ],
                "description": "The cleanup removes the exact same function reference that was added. `removeEventListener` only removes a listener if it matches both the event type AND the function reference exactly — which is why you should store the handler function in a variable (not use an inline arrow function), to ensure the same reference is used for both add and remove."
              }
            ]
          }
        },
        {
          "title": "Why multiple timeouts accumulate without cleanup",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ Every status change starts a new 3-second timer\nuseEffect(() => {\n  setTimeout(() => showNotification(), 3000);\n}, [status]);\n\n// ✅ Cleanup cancels previous timer before starting a new one\nuseEffect(() => {\n  const id = setTimeout(() => showNotification(), 3000);\n  return () => clearTimeout(id);\n}, [status]);",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "If `status` changes 5 times rapidly (e.g., a loading → success → error → loading → success sequence), 5 separate timeouts are created, each scheduled 3 seconds after their respective status change. All 5 fire independently — the user gets 5 notifications."
              },
              {
                "highlightLines": [
                  8,
                  9
                ],
                "description": "With cleanup, each time `status` changes, React cancels the previous timer before starting a new one. Only the most recent timer survives to fire. This is a 'debounce-like' behavior built naturally from React's cleanup mechanism."
              }
            ]
          }
        }
      ]
    }
  ]
};
