export default {
  "id": "debugging",
  "title": "Debugging & Production React",
  "description": "Diagnose broken rendering, Effects, identity, Strict Mode behavior, and accessibility failures.",
  "icon": "Bug",
  "lessons": [
    {
      "id": "debug-render-loop",
      "title": "Diagnostic: Infinite Render Loop",
      "content": "\n# Diagnostic: Infinite Render Loop\n\n### What is it?\nAn infinite render loop happens when a component calls a state setter directly in its render body — the function that runs on every render — with no condition that stops it. Each call schedules another render, which hits the same unconditional call again, forever.\n\n### Why do we need it?\nThis is one of the most common errors a real React app throws in development, and recognizing its shape immediately — \"state is being set somewhere it shouldn't be\" — is a fast, valuable diagnostic habit. Left unrecognized, it reads as mysterious: the app just hangs or the tab crashes with no obvious single line to blame.\n\n### How?\nDistinguish where a `setState` call lives. Inside the component function body, unguarded by an event or effect, it runs on *every single render* — call it once, and it queues another render, which calls it again. Inside an event handler, the same call only runs when the actual event fires, gated by user action. Inside a `useEffect` with an empty dependency array, it only runs once, after the first commit. The fix is never adding an `if` guard inside the render body — a guarded call still triggers a re-render that re-evaluates the guard, and can still cascade. Move the update to where it actually belongs: the event that should cause it, or a `useEffect` if it genuinely needs to happen once on mount.\n\n### Syntax/Example\n```jsx\n// Runs on EVERY render, unconditionally — infinite loop\nfunction LoopingApp() {\n  const [count, setCount] = useState(0);\n  setCount(count + 1);\n  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;\n}\n\n// Only runs in response to the click that should cause it\nfunction WorkingApp() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;\n}\n```\n\n### Common Pitfalls & Gotchas\n1. **Adding a condition instead of removing the call.** `if (count < 1) setCount(count + 1)` still re-renders, re-evaluates the guard, and can still cascade depending on the condition.\n2. **Not recognizing the specific error message.** React actually detects \"too many re-renders\" and throws deliberately, rather than letting the browser tab hang indefinitely — treat that message as an instant pointer toward a render-body `setState` call.\n3. **Confusing \"runs once on mount\" with a render-body call.** If something genuinely needs to happen once when a component first appears, that's `useEffect(fn, [])`, not a conditional in the render body.\n\n### Challenge and Solution\n**Challenge:** Move the update into the button event and explain the render → update → render loop you just removed.\n\n**Solution:** State updates triggered by a click belong in the event handler, not in render.\n\n### Hints\n* An unconditional `setState` call in the render body is always a loop, regardless of what value it sets.\n* \"Too many re-renders\" from React is a specific, recognizable signal — go straight to render-body state calls when you see it.\n\n\n### Example\n```jsx\nimport { useState } from 'react';\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  setCount(count + 1); // Runs on EVERY render, unconditionally\n  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;\n}\n```\n",
      "starterCode": "import { useState } from 'react';\nexport default function App() { const [count, setCount] = useState(0); setCount(count + 1); return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>; }",
      "solutionCode": "import { useState } from 'react';\nexport default function App() { const [count, setCount] = useState(0); return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>; }",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  setCount(count + 1); // Runs on EVERY render, unconditionally\n  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;\n}",
        "steps": [
          {
            "highlightLines": [
              5
            ],
            "description": "Run it and the preview fails immediately with **\"Maximum update depth exceeded\"**. That message is the symptom this lesson exists to teach you to read backwards.\n\nLine 5 sits in the component function body — the render phase — not inside a handler or an Effect. It runs every single time `App` is called.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              5
            ],
            "description": "Follow it round: `setCount` schedules a re-render, the re-render calls `App()`, `App()` reaches line 5, which calls `setCount`, which schedules a re-render.\n\nNothing breaks the cycle because nothing in it is conditional. React notices the runaway after about fifty nested updates and throws rather than locking the tab.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6
            ],
            "description": "Compare the identical call on line 6. Same function, same argument shape, no loop — because it is gated behind a click. It runs when a user acts, not when React renders.\n\nThat is the whole diagnosis. When you see this error, look for a state setter that is reachable during render: in the function body, in an Effect with no dependency array, or in an Effect whose dependencies it writes to itself.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "export default function App() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;\n}",
        "steps": [
          {
            "highlightLines": [2, 3],
            "description": "The unconditional `setCount(count + 1)` call is deleted from the render body entirely. `count` is now only ever updated in response to the thing that should trigger it — a click.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [3],
            "description": "The render function is pure again: called with the same state, it returns the same JSX, with no side effect that schedules another render on its own. The loop is broken not by adding a condition to stop it, but by moving the state update to where it actually belongs — the event.",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "\"But I only want to increment once\" — the fix is never a condition in render",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ Still runs on every render — the condition doesn't stop the loop\nif (count < 1) setCount(count + 1);\n\n// ❌ Still an anti-pattern even with a guard\nif (!hasInitialized) { setCount(1); setHasInitialized(true); }\n\n// ✅ If this needs to happen once on mount, that's what useEffect(fn, []) is for\nuseEffect(() => { setCount(1); }, []);",
            "steps": [
              {
                "highlightLines": [2],
                "description": "Adding an `if` guard around a render-body `setCount` call often still loops — each guarded call still triggers a re-render, which re-evaluates the guard, and depending on the condition can still cascade."
              },
              {
                "highlightLines": [8],
                "description": "If the real goal is \"run this once, when the component first appears,\" that's not a render-phase concern at all — it's a synchronization concern, which is what `useEffect` with an empty dependency array is for. Pattern-match the actual need (once on mount → Effect; in response to a click → event handler) instead of patching symptoms with conditionals in render."
              }
            ]
          }
        },
        {
          "title": "Why this doesn't just silently double the count forever quietly",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// React detects \"too many re-renders\" and throws deliberately,\n// rather than letting the loop run until the tab freezes:\n//\n// Error: Too many re-renders. React limits the number of renders\n// to prevent an infinite loop.",
            "steps": [
              {
                "highlightLines": [1, 2, 3, 4, 5],
                "description": "React actually has a built-in safety valve for exactly this bug: it counts consecutive renders triggered this way and throws a descriptive error once a threshold is hit, rather than genuinely hanging the browser tab forever. This is one of the most common errors a real React app throws in development — recognizing this exact message and immediately checking for a render-body `setState` call is a fast diagnostic habit worth having."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "debug-effect-loop",
      "title": "Diagnostic: Effect Feedback Loop",
      "content": "\n# Diagnostic: Effect Feedback Loop\n\n### What is it?\nAn Effect feedback loop happens when an Effect's own dependency array includes a value that the Effect itself sets. The Effect runs because a dependency changed, writes to that same dependency, which counts as another change, which can retrigger the Effect again.\n\n### Why do we need it?\nUnlike an unconditional render-body `setState` call, this shape doesn't always hang immediately — it can settle once the written value stops actually changing value-to-value. That makes it easy to miss: the app appears to work, but it's paying for one or more unnecessary render/Effect cycles for a value that likely never needed to be its own state, and it's fragile — change the calculation slightly and the same shape becomes a true infinite loop.\n\n### How?\nBefore fixing the dependency array, ask whether the Effect is necessary at all. The specific tell is an Effect whose only job is calling a setter for a piece of state that's also, directly or via a derived value, in its own dependency list. If the value being set can be computed from state that already exists, derive it as a plain calculation during render instead — that removes both the extra state and the Effect that existed only to keep the two in sync. Not every Effect-updates-state pattern is wrong: an Effect synchronizing with something genuinely external (window size, a subscription's latest value) calling a setter is completely normal, because its only input isn't state that already lives inside the same component.\n\n### Syntax/Example\n```javascript\n// Feedback loop — double is both computed by the Effect and in its deps\nuseEffect(() => setDouble(count * 2), [count, double]);\n\n// Derived value — no Effect needed at all\nconst double = count * 2;\n```\n\n### Common Pitfalls & Gotchas\n1. **Trusting the linter's dependency suggestion without asking why the value is state at all.** Satisfying the dependency array doesn't fix the underlying issue if the value shouldn't have been separate state in the first place.\n2. **Assuming it will always visibly hang.** Some feedback loops converge after one extra cycle and look fine — they're still wasted work and still one config change away from a true infinite loop.\n3. **Treating every Effect-calls-setState pattern as broken.** The problem is specific to an Effect whose only input is state it could have derived from — synchronizing with something external is a legitimate, common use of `useEffect`.\n\n### Challenge and Solution\n**Challenge:** This component derives `double` from `count` using an Effect. Remove the Effect and derive `double` during render.\n\n**Solution:** `const double = count * 2`.\n\n### Hints\n* The red flag shape: an Effect that sets state which is also, directly or indirectly, one of its own dependencies.\n* If a value is fully computable from existing state, it doesn't need its own `useState` or an Effect to keep it updated.\n\n\n### Example\n```jsx\nimport { useEffect, useState } from 'react';\n\nexport default function App() {\n  const [count] = useState(2);\n  const [double, setDouble] = useState(0);\n\n  useEffect(() => setDouble(count * 2), [count, double]);\n\n  return <p>{double}</p>;\n}\n```\n",
      "starterCode": "import { useEffect, useState } from 'react';\nexport default function App() { const [count] = useState(2); const [double, setDouble] = useState(0); useEffect(() => setDouble(count * 2), [count, double]); return <p>{double}</p>; }",
      "solutionCode": "import { useState } from 'react';\nexport default function App() { const [count] = useState(2); const double = count * 2; return <p>{double}</p>; }",
      "exampleWalkthrough": {
        "code": "import { useEffect, useState } from 'react';\n\nexport default function App() {\n  const [count] = useState(2);\n  const [double, setDouble] = useState(0);\n\n  useEffect(() => setDouble(count * 2), [count, double]);\n\n  return <p>{double}</p>;\n}",
        "steps": [
          {
            "highlightLines": [
              7
            ],
            "description": "The dependency array lists `double`, and the Effect's only job is to *write* `double`. Any Effect that depends on a value it also sets has, by construction, made itself its own trigger.\n\nThat shape is the thing to spot. It is worth recognising on sight, because the symptom is not always dramatic.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              5,
              7
            ],
            "description": "Trace it: mount with `double` at 0, the Effect runs and sets it to 4, `double` has changed so the dependencies have changed, so the Effect runs again and sets it to 4 once more.\n\nThis time `Object.is(4, 4)` is true, React bails out, and it stops. One wasted render and one wasted Effect run — the app looks fine.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              4,
              9
            ],
            "description": "Which is exactly why it is dangerous. Unlike the previous lesson's immediate crash, this settles, so it survives review and shows up as vague slowness. Change the calculation to something that does not converge and the same shape becomes a genuine infinite loop.\n\nAnd the fix is not to adjust the array. `double` is computable from `count`, so it should never have been state: `const double = count * 2` deletes the state, the Effect, and the question.\n\nNot every Effect that calls a setter is wrong — one synchronizing with a subscription or a window size legitimately does. The tell is an Effect whose only input is state that already lives in the same component.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "const [count] = useState(2);\nconst double = count * 2;",
        "steps": [
          {
            "highlightLines": [2],
            "description": "`double` is no longer its own `useState` — it's a plain calculation from `count`, computed fresh on every render. There is nothing left to synchronize, so there's no Effect at all.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [2],
            "description": "This is the same pattern as the `state-or-derived` lesson: if a value can be computed from existing state during render, storing it as its own state (and using an Effect to keep the two in sync) creates exactly the kind of feedback-loop risk this lesson demonstrates. Deriving it removes the loop by removing the two competing sources of truth, not by fixing the dependency array.",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "The tell: an Effect whose only job is to update its own dependency",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Red flag pattern — look for this specifically:\nuseEffect(() => {\n  setSomeState(/* computed from someState or a sibling value */);\n}, [someState /* or the sibling */]);",
            "steps": [
              {
                "highlightLines": [2, 3, 4],
                "description": "Whenever you see an Effect that calls a setter for a piece of state that's also (directly or via a value derived from it) in its own dependency array, that's the specific shape to be suspicious of. It's not always an infinite loop — sometimes it converges after one extra cycle — but it's always at minimum one unnecessary render, and it's a design smell that usually means the state shouldn't exist as state."
              }
            ]
          }
        },
        {
          "title": "Not every Effect-updates-state pattern is wrong",
          "type": "misconception",
          "walkthrough": {
            "code": "// ✅ Fine — synchronizing with something OUTSIDE React, not deriving from own state\nuseEffect(() => {\n  const width = window.innerWidth; // reads an external source\n  setWindowWidth(width);\n  const onResize = () => setWindowWidth(window.innerWidth);\n  window.addEventListener('resize', onResize);\n  return () => window.removeEventListener('resize', onResize);\n}, []);",
            "steps": [
              {
                "highlightLines": [2, 3, 4, 5, 6, 7],
                "description": "An Effect calling a setState is completely normal when it's synchronizing with something genuinely external — window size, a subscription's latest value, a fetch response. The loop risk is specific to the case where the Effect's *only* input is state that already lives inside the same component and could have been derived instead."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "debug-identity",
      "title": "Diagnostic: Unstable Object Identity",
      "content": "\n# Diagnostic: Unstable Object Identity\n\n### What is it?\nObjects and arrays in JavaScript are compared by reference, not by contents — `{ roomId: 'a' } !== { roomId: 'a' }`. When an object literal is created fresh inside a component body, it's a new reference on every render, even if the values inside it never actually changed.\n\n### Why do we need it?\nReact's dependency arrays (in `useEffect`, `useMemo`, `useCallback`) compare entries with reference equality for objects. An object recreated every render always looks \"changed\" to that comparison, which means an Effect depending on it re-runs on *every* render of the component — not just when the meaningful data inside it actually changes — silently defeating the entire purpose of listing it as a dependency.\n\n### How?\nDon't reach for `useMemo` as the first instinct. First ask whether the object needs to exist outside the Effect at all — if nothing else references it, construct it *inside* the Effect callback instead, and depend on the primitive values (like `roomId`) that it was built from. Primitives compare by value, so the Effect only re-runs when the underlying data genuinely changes. Reach for `useMemo` only when the object truly needs a stable identity outside a single Effect — shared with a child component, or read by more than one Effect.\n\n### Syntax/Example\n```javascript\n// New object every render — Effect re-runs on every render of App\nconst options = { roomId };\nuseEffect(() => console.log(options.roomId), [options]);\n\n// Built inside the Effect; depends on the primitive instead\nuseEffect(() => {\n  const options = { roomId };\n  console.log(options.roomId);\n}, [roomId]);\n```\n\n### Common Pitfalls & Gotchas\n1. **Reaching for `useMemo` by default.** It does fix the over-firing, but it adds a hook, its own dependency array to keep correct, and ongoing bookkeeping for a problem that often has a simpler fix — not needing the object outside the Effect at all.\n2. **Thinking this is unique to objects.** Array literals and inline function definitions get a fresh reference every render for exactly the same reason, and cause the same dependency-array problem.\n3. **Not connecting a \"re-runs every render\" bug back to identity.** If an Effect seems to fire far more often than the data it depends on actually changes, an unstable object/array/function reference in its dependency array is the first thing to check.\n\n### Challenge and Solution\n**Challenge:** Move `options` inside the Effect so synchronization depends on `roomId`.\n\n**Solution:** Create the object inside the Effect and use `[roomId]` as the dependency list.\n\n### Hints\n* Objects, arrays, and inline functions are all \"new\" every render unless memoized or constructed somewhere that isn't compared by reference.\n* Ask \"does this need to exist outside the Effect?\" before reaching for `useMemo`.\n\n\n### Example\n```jsx\nimport { useEffect, useState } from 'react';\n\nexport default function App() {\n  const [roomId] = useState('general');\n  const [clicks, setClicks] = useState(0);\n\n  const options = { roomId }; // A new object on EVERY render\n\n  useEffect(() => {\n    console.log('connecting to', options.roomId);\n  }, [options]);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <p>Room {roomId}</p>\n      <button onClick={() => setClicks(c => c + 1)}>Unrelated re-render ({clicks})</button>\n    </div>\n  );\n}\n```\n",
      "starterCode": "import { useEffect } from 'react';\nexport default function App({ roomId }) { const options = { roomId }; useEffect(() => console.log(options.roomId), [options]); return <p>Room {roomId}</p>; }",
      "solutionCode": "import { useEffect } from 'react';\nexport default function App({ roomId }) { useEffect(() => { const options = { roomId }; console.log(options.roomId); }, [roomId]); return <p>Room {roomId}</p>; }",
      "exampleWalkthrough": {
        "code": "import { useEffect, useState } from 'react';\n\nexport default function App() {\n  const [roomId] = useState('general');\n  const [clicks, setClicks] = useState(0);\n\n  const options = { roomId }; // A new object on EVERY render\n\n  useEffect(() => {\n    console.log('connecting to', options.roomId);\n  }, [options]);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <p>Room {roomId}</p>\n      <button onClick={() => setClicks(c => c + 1)}>Unrelated re-render ({clicks})</button>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              7
            ],
            "description": "`{ roomId }` builds a brand-new object every time `App` renders, even when `roomId` has not changed. Two objects with identical contents are not the same object: `{ roomId: 'a' } === { roomId: 'a' }` is `false`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              11
            ],
            "description": "React compares dependency entries with `Object.is`, which is reference equality for objects. `options` is a different reference on every render, so React concludes the dependencies changed — every time, without exception.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              9,
              10,
              16
            ],
            "description": "Open the console and press **Unrelated re-render**. The Effect logs on every click, despite `roomId` never changing. The dependency array is present, correct-looking, and doing nothing.\n\nHere it only logs. Make it open a socket or start a fetch and you have a connection torn down and rebuilt on every keystroke elsewhere in the component.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7
            ],
            "description": "Three ways out. Move the object inside the Effect, so it is not a dependency at all — usually the right answer, and it is what this component actually needs. Or depend on the primitive instead: `[roomId]`. Or wrap it in `useMemo` when it genuinely must exist outside.\n\nThe diagnostic habit: when an Effect re-runs more than it should, look at the *types* in its dependency array. Objects, arrays and functions created during render are new every render.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "useEffect(() => {\n  const options = { roomId };\n  console.log(options.roomId);\n}, [roomId]);",
        "steps": [
          {
            "highlightLines": [2],
            "description": "`options` now gets created *inside* the Effect callback, not in the component body. It's still a new object every time the Effect runs — but that's fine, because it's fully local to this one Effect execution and never compared by reference against anything.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [4],
            "description": "The dependency array is now `[roomId]` — a primitive string. Primitives compare by value, so `'general' === 'general'` regardless of which render produced each one. The Effect only re-runs when `roomId` actually, meaningfully changes.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [1, 2, 3, 4],
            "description": "The general fix demonstrated here: when an object's identity is causing spurious dependency-array changes, first ask whether the object even needs to exist outside the Effect. Moving construction inside the Effect (as done here) sidesteps the identity problem entirely — no `useMemo` needed, because there's no external reference to keep stable in the first place.",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "useMemo is not the first fix to reach for",
          "type": "misconception",
          "walkthrough": {
            "code": "// The instinct: \"identity keeps changing, let me memoize it\"\nconst options = useMemo(() => ({ roomId }), [roomId]);\nuseEffect(() => { console.log(options.roomId); }, [options]);\n\n// Simpler: does `options` need to exist outside the Effect at all?\nuseEffect(() => {\n  const options = { roomId };\n  console.log(options.roomId);\n}, [roomId]);",
            "steps": [
              {
                "highlightLines": [2, 3],
                "description": "`useMemo` does fix this — a memoized `options` keeps the same reference across renders as long as `roomId` doesn't change, so the Effect stops over-firing. But it adds a hook, a dependency array of its own to keep correct, and ongoing memoization bookkeeping for a problem that has a simpler fix."
              },
              {
                "highlightLines": [5, 6, 7, 8],
                "description": "If nothing outside the Effect actually needs `options`, just construct it inside the Effect and depend on the primitive `roomId` instead. Reach for `useMemo` only when the object genuinely needs to be shared — passed to a child, used in multiple places, or depended on by more than one Effect."
              }
            ]
          }
        },
        {
          "title": "Objects, arrays, AND functions all have this problem",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// All three of these are \"new\" every render:\nconst config = { roomId };        // new object\nconst tags = ['a', 'b'];          // new array\nconst onLoad = () => fetchData(); // new function\n\n// All three will make a dependency array \"always changed\"\n// unless memoized (useMemo/useCallback) or moved inside the Effect",
            "steps": [
              {
                "highlightLines": [2, 3, 4],
                "description": "This isn't specific to plain objects — array literals and inline function definitions get a fresh reference every render too, for exactly the same reason. Any of these, used as a dependency, will make the Effect think something changed every render unless you either memoize it or, as this lesson demonstrates, avoid needing it as a dependency at all."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "debug-strict-mode",
      "title": "Diagnostic: Strict Mode",
      "content": "\n# Diagnostic: Strict Mode\n\n### What is it?\nIn development, `<StrictMode>` deliberately replays each component's Effects: it runs setup, then immediately runs cleanup as if the component were unmounting, then runs setup again as if it were remounting — all before the user perceives anything happening.\n\n### Why do we need it?\nThis replay is designed to expose a specific bug class: an Effect that sets up a resource (a timer, a listener, a connection) with no cleanup function to tear it down. Without cleanup, Strict Mode's simulated-unmount step has nothing to call, so the following simulated-remount step stacks a second setup on top of the first — surfacing, immediately and reliably in development, a leak that would otherwise only show up the moment a component genuinely mounts and unmounts repeatedly in production.\n\n### How?\nEvery Effect that sets something up should return a cleanup function that undoes exactly that setup — clearing a timeout, removing an event listener, closing a connection. Trace the sequence with cleanup in place: mount → setup runs → simulated unmount → cleanup runs, undoing the first setup → simulated remount → setup runs again. Only the second setup is ever actually left active; the double-invoke becomes transparent, and the end behavior matches a single real mount.\n\n### Syntax/Example\n```javascript\n// No cleanup — Strict Mode's replay leaves two timers scheduled\nuseEffect(() => {\n  const timer = setTimeout(() => setConnected(true), 10);\n}, []);\n\n// Cleanup undoes exactly what setup created\nuseEffect(() => {\n  const timer = setTimeout(() => setConnected(true), 10);\n  return () => clearTimeout(timer);\n}, []);\n```\n\n### Common Pitfalls & Gotchas\n1. **Assuming Strict Mode's double-invoke is itself the bug.** It's a development-only diagnostic tool, not a production behavior — the actual bug is the missing cleanup, which Strict Mode just makes immediately visible.\n2. **Dismissing it because \"the app works fine in production.\"** The leak Strict Mode surfaces is real there too — components genuinely mount and unmount during normal navigation — it's just silent because it usually only leaks once per real mount instead of being doubled up front.\n3. **Thinking this only applies to `setTimeout`.** The same missing-cleanup shape applies to event listeners, WebSocket connections, subscriptions, and any other resource an Effect's setup creates.\n\n### Challenge and Solution\n**Challenge:** The timeout setup has no cleanup. Add cleanup so a setup → cleanup → setup cycle cannot leave an old timer active.\n\n**Solution:** Return a cleanup function that calls `clearTimeout(timer)`.\n\n### Hints\n* Strict Mode's mount → cleanup → remount sequence only runs in development, specifically to surface missing-cleanup bugs early.\n* Whatever an Effect's setup creates, its cleanup function must undo — the same shape applies regardless of the resource.\n\n\n### Example\n```jsx\nimport { useEffect, useState } from 'react';\n\nexport default function App() {\n  const [ticks, setTicks] = useState(0);\n\n  useEffect(() => {\n    // No cleanup, so the first interval is never stopped.\n    setInterval(() => setTicks(t => t + 1), 1000);\n  }, []);\n\n  return <p>Ticks: {ticks}</p>;\n}\n```\n",
      "starterCode": "import { useEffect, useState } from 'react';\nexport default function App() { const [connected, setConnected] = useState(false); useEffect(() => { const timer = setTimeout(() => setConnected(true), 10); }, []); return <p>{connected ? 'Connected' : 'Connecting'}</p>; }",
      "solutionCode": "import { useEffect, useState } from 'react';\nexport default function App() { const [connected, setConnected] = useState(false); useEffect(() => { const timer = setTimeout(() => setConnected(true), 10); return () => clearTimeout(timer); }, []); return <p>{connected ? 'Connected' : 'Connecting'}</p>; }",
      "exampleWalkthrough": {
        "code": "import { useEffect, useState } from 'react';\n\nexport default function App() {\n  const [ticks, setTicks] = useState(0);\n\n  useEffect(() => {\n    // No cleanup, so the first interval is never stopped.\n    setInterval(() => setTicks(t => t + 1), 1000);\n  }, []);\n\n  return <p>Ticks: {ticks}</p>;\n}",
        "steps": [
          {
            "highlightLines": [
              6,
              9
            ],
            "description": "In development, Strict Mode does not merely render twice. For every component it runs a full cycle: mount, run every Effect setup, run every Effect cleanup **as if unmounting**, then run every setup again.\n\nSo this Effect body executes twice on a single mount, and the cleanup step in between is given nothing to do.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              8
            ],
            "description": "Because there is no cleanup, the interval created by the first setup is never cleared. The second setup adds another on top of it.\n\nTwo intervals now call `setTicks` once a second each.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              4,
              11
            ],
            "description": "Watch the number: it climbs by two per second, not one. The bug is not Strict Mode — it is a missing `return () => clearInterval(id)`, and Strict Mode made a leak that was always there visible within seconds instead of after an hour of navigation.\n\nThe same pattern catches duplicate subscriptions, duplicate event listeners, and doubled analytics events.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7
            ],
            "description": "The instinct to suppress this is worth resisting. Removing `<StrictMode>` does not fix anything; it restores the state where the leak exists and nobody can see it.\n\nThe rule the check enforces is simple: an Effect must be safe to run, clean up, and run again. Anything that is not resilient to that is not resilient to a re-render either.\n\nThe exact text output on the screen will be:\n`Ticks: 0`\n\nrising by 2 every second.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "useEffect(() => {\n  const timer = setTimeout(() => setConnected(true), 10);\n  return () => clearTimeout(timer);\n}, []);",
        "steps": [
          {
            "highlightLines": [3],
            "description": "A cleanup function is now returned from the Effect: `() => clearTimeout(timer)`. This is the piece that was missing — without it, Strict Mode's mount → cleanup → remount cycle had nothing to call in the cleanup step.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [2, 3],
            "description": "Walk the cycle again with cleanup in place: mount → `setTimeout` #1 scheduled → Strict Mode's simulated unmount → cleanup runs → `clearTimeout` cancels timer #1 → simulated remount → `setTimeout` #2 scheduled. Only timer #2 is ever actually pending. The double-invoke is now transparent — the end behavior is identical to a single real mount.",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Strict Mode's double-invoke only happens in development",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Development: mount → cleanup → remount (Effects run twice)\n// Production build: mount only (Effects run once)\n//\n// This means a missing-cleanup bug can be INVISIBLE in production\n// while still being a real, live memory leak there.",
            "steps": [
              {
                "highlightLines": [1, 2, 3, 4, 5],
                "description": "It's tempting to think \"my app works fine in production, so this double-firing in dev doesn't matter.\" It's the opposite: the bug Strict Mode is designed to surface — a missing cleanup — is a real leak in production too, it's just silent there because the component usually only mounts once. Strict Mode is deliberately more aggressive in development specifically so you catch this before a user's browser tab slowly accumulates the leak over a session."
              }
            ]
          }
        },
        {
          "title": "This isn't unique to setTimeout",
          "type": "misconception",
          "walkthrough": {
            "code": "// Same missing-cleanup shape, different resource:\nuseEffect(() => {\n  window.addEventListener('resize', onResize); // no cleanup\n}, []);\n\nuseEffect(() => {\n  const socket = new WebSocket(url); // no cleanup\n}, [url]);",
            "steps": [
              {
                "highlightLines": [2, 3, 4],
                "description": "Missing cleanup for `setTimeout` is one instance of a general pattern — the same bug shape applies to event listeners, WebSocket connections, subscriptions, and any other resource an Effect sets up."
              },
              {
                "highlightLines": [6, 7, 8],
                "description": "The fix is always the same shape too: whatever the setup function creates, the cleanup function must undo. `diagnostic-missing-cleanup` (Escape Hatches module) covers this same principle applied to network requests specifically — worth reviewing together with this lesson."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "accessibility-and-testing",
      "title": "Accessibility as a React Skill",
      "content": "\n# Accessibility as a React Skill\n\n### What is it?\nAccessibility is part of a component's contract, not a separate pass applied afterward. It covers whether assistive technology — a screen reader, keyboard-only navigation — can perceive and operate the same UI a sighted mouse user can: programmatic labels, keyboard behavior, focus management, and correctly associated error messages.\n\n### Why do we need it?\nAccessibility bugs pass a visual review every time, because the page looks completely correct to sighted, mouse-driven testing. A `<span>` positioned right above an input reads as a label visually, but carries no programmatic relationship to that input at all — a screen reader announces it as unlabeled \"edit text,\" with no indication of what it's for. These bugs only surface with a screen reader, keyboard-only navigation, or an automated audit — never from looking at the rendered page.\n\n### How?\nPrefer native interactive elements before building custom ones — a real `<button>` or `<input type=\"checkbox\">` gets keyboard focus, correct semantics, and state announcements from the browser for free, where a styled `<div>` requires hand-building `tabIndex`, `role`, and key handlers to match. For labels, use `<label htmlFor={id}>` paired with a matching `id` on the input, generated with `useId()` so it stays unique even if the component renders more than once on the page. For errors or hints, `aria-describedby` pointing at the message's own `id` tells assistive technology the two are related, so a screen reader announces them together.\n\n### Syntax/Example\n```jsx\nfunction EmailField() {\n  const id = useId();\n  return (\n    <>\n      <label htmlFor={id}>Email</label>\n      <input id={id} aria-describedby={id + '-error'} />\n      <span id={id + '-error'}>Please enter a valid email.</span>\n    </>\n  );\n}\n```\n\n### Common Pitfalls & Gotchas\n1. **Reimplementing native controls with styled `<div>`s.** A `<div onClick={toggle}>` styled as a checkbox has no keyboard support and no accessible role by default — all of it has to be manually rebuilt to match what a real `<input type=\"checkbox\">` provides automatically.\n2. **Visual proximity standing in for programmatic association.** A label or error message positioned near an input communicates nothing to a screen reader unless it's actually wired with `htmlFor`/`id` or `aria-describedby`.\n3. **Hardcoding an id string.** A literal `id=\"email\"` breaks the moment the component renders more than once on the same page — two inputs share one id, and the label association becomes ambiguous.\n\n### Challenge and Solution\n**Challenge:** Give the input a programmatic label and associate the error message with it.\n\n**Solution:** Use `label htmlFor`, a stable input `id`, and `aria-describedby`.\n\n### Hints\n* If `screen.getByLabelText` or `getByRole` can't find an element, that's usually a real accessibility gap, not a limitation of the testing tool.\n* `useId()` solves the same \"must be unique per instance\" problem here as it does for any other id-generation need.\n\n\n### Example\n```jsx\nimport { useId } from 'react';\nexport default function App() {\n  const id = useId();\n  return (\n    <div style={{ padding: 20 }}>\n      <label htmlFor={id}>Email</label>\n      <input id={id} aria-describedby={id + '-error'} />\n      <p id={id + '-error'} style={{ color: 'crimson' }}>Please enter a valid email.</p>\n    </div>\n  );\n}\n```\n",
      "starterCode": "export default function App() { return <div><span>Email</span><input /><span>Please enter a valid email.</span></div>; }",
      "solutionCode": "import { useId } from 'react';\nexport default function App() { const id = useId(); return <div><label htmlFor={id}>Email</label><input id={id} aria-describedby={id + '-error'} /><span id={id + '-error'}>Please enter a valid email.</span></div>; }",
      "exampleWalkthrough": {
        "code": "import { useId } from 'react';\nexport default function App() {\n  const id = useId();\n  return (\n    <div style={{ padding: 20 }}>\n      <label htmlFor={id}>Email</label>\n      <input id={id} aria-describedby={id + '-error'} />\n      <p id={id + '-error'} style={{ color: 'crimson' }}>Please enter a valid email.</p>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3
            ],
            "description": "`useId` produces a value that is unique per component instance and stable across server and client, which is what makes it safe to build accessibility relationships out of.\n\nA hard-coded `id=\"email\"` works until the form appears twice on one page, and then every label points at the first input.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6,
              7
            ],
            "description": "`htmlFor` on the label matched to `id` on the input is what creates the *programmatic* relationship. A `<span>` sitting above the field looks identical on screen and carries none of it.\n\nWith the pairing: clicking the label focuses the input, and a screen reader announces \"Email\" when focus lands there. Without it, the field is announced as \"edit, blank\".",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7,
              8
            ],
            "description": "`aria-describedby` does the same job for the error message. It points at the paragraph's id, so the message is read out *after* the label when the field receives focus — rather than being a red sentence nearby that a screen reader user never learns is connected to anything.\n\nRed text alone also fails anyone who cannot distinguish the colour, which is why the association matters more than the styling.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              5,
              9
            ],
            "description": "Nothing here is an accessibility library. It is `label`, `htmlFor`, `id` and one ARIA attribute — the same HTML that has always done this, written in JSX.\n\nWhich is why this is a React skill rather than a specialism: the failure mode is invisible in normal development, because the page looks correct. The reliable check is to query by role and accessible name in your tests, exactly as the Testing module does — a test that cannot find the field by its label is telling you a user cannot either.\n\nThe exact text output on the screen will be:\n`Email`\n`[Input]`\n`Please enter a valid email.`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "const id = useId();\n<label htmlFor={id}>Email</label>\n<input id={id} aria-describedby={id + '-error'} />\n<span id={id + '-error'}>Please enter a valid email.</span>",
        "steps": [
          {
            "highlightLines": [2, 3],
            "description": "`<span>` becomes `<label htmlFor={id}>`, and the input gets a matching `id={id}`. This is now a programmatic label, not just a visual one — clicking the label text focuses the input, and a screen reader announces \"Email, edit text\" when the input receives focus.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [3, 4],
            "description": "`aria-describedby={id + '-error'}` on the input points at the error `<span>`'s own `id`. This tells assistive technology \"this text further describes this input\" — a screen reader announces both the label and the error text together when the input is focused, exactly matching what a sighted user sees at a glance.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [1],
            "description": "`useId()` generates the shared id instead of a hardcoded string like `\"email\"` — the same reason covered in the `use-id` lesson: hardcoded ids break the moment this component renders more than once on the same page. Accessibility wiring and the SSR-safe unique-id problem intersect here directly.",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Native elements give you this for free — don't rebuild it",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// ❌ Reimplementing a checkbox with a div loses native behavior entirely\n<div onClick={toggle} className={checked ? 'checked' : ''} />\n\n// ✅ A real checkbox gets keyboard support, screen reader semantics,\n//    and focus behavior with zero extra code\n<input type=\"checkbox\" checked={checked} onChange={toggle} />",
            "steps": [
              {
                "highlightLines": [2],
                "description": "A `<div>` styled to look like a checkbox has no keyboard support (Tab won't focus it by default, Space/Enter won't toggle it), no accessible role, and no announced state — all of that has to be hand-built with `tabIndex`, `role`, `aria-checked`, and key handlers to match what's broken."
              },
              {
                "highlightLines": [5],
                "description": "The real `<input type=\"checkbox\">` gets keyboard focus, Space-to-toggle, and screen-reader announcement of its checked state automatically, from the browser. The general rule: reach for a native interactive element before building a custom one — you inherit correct behavior instead of having to reimplement it."
              }
            ]
          }
        },
        {
          "title": "This connects directly back to testing",
          "type": "misconception",
          "walkthrough": {
            "code": "// Testing Library's queries reward accessible markup —\n// this ISN'T a coincidence:\nscreen.getByLabelText('Email');       // needs htmlFor/id or aria-label\nscreen.getByRole('button', { name: 'Submit' }); // needs a real <button>",
            "steps": [
              {
                "highlightLines": [3],
                "description": "`getByLabelText` only finds an input if it has a real programmatic label — the exact `htmlFor`/`id` wiring this lesson teaches. A `<span>` styled as a label can't be found this way at all."
              },
              {
                "highlightLines": [4],
                "description": "React Testing Library's query priority (documented in the Testing module) deliberately favors `getByRole` and `getByLabelText` over `getByTestId` — the library's philosophy is that if a test can't find an element the way a screen reader user would, that's a real accessibility gap the test just caught, not a limitation of the testing tool."
              }
            ]
          }
        }
      ]
    }
  ]
};
