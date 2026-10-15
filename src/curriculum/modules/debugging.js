export default {
  "id": "debugging",
  "title": "Debugging & Production React",
  "description": "Broken-app diagnosis, Strict Mode, identity, and accessibility.",
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
            "description": "Run it and the preview fails immediately with **\"Too many re-renders. React limits the number of renders to prevent an infinite loop.\"** That message is the symptom this lesson exists to teach you to read backwards.\n\nIt is worth learning apart from its sibling: *\"Too many re-renders\"* means a state setter ran during **render**, which is this bug. *\"Maximum update depth exceeded\"* means an **Effect** kept setting state that retriggered itself — the next lesson's bug.\n\nLine 5 sits in the component function body — the render phase — not inside a handler or an Effect. It runs every single time `App` is called.",
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
            "highlightLines": [
              2,
              3
            ],
            "description": "The unconditional `setCount(count + 1)` call is deleted from the render body entirely. `count` is now only ever updated in response to the thing that should trigger it — a click.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              3
            ],
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
                "highlightLines": [
                  2
                ],
                "description": "Adding an `if` guard around a render-body `setCount` call often still loops — each guarded call still triggers a re-render, which re-evaluates the guard, and depending on the condition can still cascade."
              },
              {
                "highlightLines": [
                  8
                ],
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
                "highlightLines": [
                  1,
                  2,
                  3,
                  4,
                  5
                ],
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
            "highlightLines": [
              2
            ],
            "description": "`double` is no longer its own `useState` — it's a plain calculation from `count`, computed fresh on every render. There is nothing left to synchronize, so there's no Effect at all.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              2
            ],
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
                "highlightLines": [
                  2,
                  3,
                  4
                ],
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
                "highlightLines": [
                  2,
                  3,
                  4,
                  5,
                  6,
                  7
                ],
                "description": "An Effect calling a setState is completely normal when it's synchronizing with something genuinely external — window size, a subscription's latest value, a fetch response. The loop risk is specific to the case where the Effect's *only* input is state that already lives inside the same component and could have been derived instead."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "debug-strict-mode",
      "title": "Diagnostic: Strict Mode",
      "content": "\n# Diagnostic: Strict Mode\n\n### What is it?\nIn development, `<StrictMode>` deliberately replays each component's Effects: it runs setup, then immediately runs cleanup as if the component were unmounting, then runs setup again as if it were remounting — all before the user perceives anything happening.\n\n### Why do we need it?\nThis replay is designed to expose a specific bug class: an Effect that sets up a resource (a timer, a listener, a connection) with no cleanup function to tear it down. Without cleanup, Strict Mode's simulated-unmount step has nothing to call, so the following simulated-remount step stacks a second setup on top of the first — surfacing, immediately and reliably in development, a leak that would otherwise only show up the moment a component genuinely mounts and unmounts repeatedly in production.\n\n### How?\nEvery Effect that sets something up should return a cleanup function that undoes exactly that setup — clearing a timeout, removing an event listener, closing a connection. Trace the sequence with cleanup in place: mount → setup runs → simulated unmount → cleanup runs, undoing the first setup → simulated remount → setup runs again. Only the second setup is ever actually left active; the double-invoke becomes transparent, and the end behavior matches a single real mount.\n\n### Syntax/Example\n```javascript\n// No cleanup — Strict Mode's replay leaves two timers scheduled\nuseEffect(() => {\n  const timer = setTimeout(() => setConnected(true), 10);\n}, []);\n\n// Cleanup undoes exactly what setup created\nuseEffect(() => {\n  const timer = setTimeout(() => setConnected(true), 10);\n  return () => clearTimeout(timer);\n}, []);\n```\n\n### Common Pitfalls & Gotchas\n1. **Assuming Strict Mode's double-invoke is itself the bug.** It's a development-only diagnostic tool, not a production behavior — the actual bug is the missing cleanup, which Strict Mode just makes immediately visible.\n2. **Dismissing it because \"the app works fine in production.\"** The leak Strict Mode surfaces is real there too — components genuinely mount and unmount during normal navigation — it's just silent because it usually only leaks once per real mount instead of being doubled up front.\n3. **Thinking this only applies to `setTimeout`.** The same missing-cleanup shape applies to event listeners, WebSocket connections, subscriptions, and any other resource an Effect's setup creates.\n\n### Challenge and Solution\n**Challenge:** The timeout setup has no cleanup. Add cleanup so a setup → cleanup → setup cycle cannot leave an old timer active.\n\n**Solution:** Return a cleanup function that calls `clearTimeout(timer)`.\n\n### Hints\n* Strict Mode's mount → cleanup → remount sequence only runs in development, specifically to surface missing-cleanup bugs early.\n* Whatever an Effect's setup creates, its cleanup function must undo — the same shape applies regardless of the resource.\n* The playground example above is deliberately broken and stays broken: both of its intervals keep firing for as long as this lesson is open. That is not an oversight in the demo — it is the leak, running in front of you. Navigate away and they go with the page.\n\n\n### Example\n```jsx\nimport { useEffect, useState } from 'react';\n\nexport default function App() {\n  const [ticks, setTicks] = useState(0);\n\n  useEffect(() => {\n    // No cleanup, so the first interval is never stopped.\n    setInterval(() => setTicks(t => t + 1), 1000);\n  }, []);\n\n  return <p>Ticks: {ticks}</p>;\n}\n```\n",
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
            "highlightLines": [
              3
            ],
            "description": "A cleanup function is now returned from the Effect: `() => clearTimeout(timer)`. This is the piece that was missing — without it, Strict Mode's mount → cleanup → remount cycle had nothing to call in the cleanup step.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              2,
              3
            ],
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
                "highlightLines": [
                  1,
                  2,
                  3,
                  4,
                  5
                ],
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
                "highlightLines": [
                  2,
                  3,
                  4
                ],
                "description": "Missing cleanup for `setTimeout` is one instance of a general pattern — the same bug shape applies to event listeners, WebSocket connections, subscriptions, and any other resource an Effect sets up."
              },
              {
                "highlightLines": [
                  6,
                  7,
                  8
                ],
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
            "highlightLines": [
              2,
              3
            ],
            "description": "`<span>` becomes `<label htmlFor={id}>`, and the input gets a matching `id={id}`. This is now a programmatic label, not just a visual one — clicking the label text focuses the input, and a screen reader announces \"Email, edit text\" when the input receives focus.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              3,
              4
            ],
            "description": "`aria-describedby={id + '-error'}` on the input points at the error `<span>`'s own `id`. This tells assistive technology \"this text further describes this input\" — a screen reader announces both the label and the error text together when the input is focused, exactly matching what a sighted user sees at a glance.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              1
            ],
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
                "highlightLines": [
                  2
                ],
                "description": "A `<div>` styled to look like a checkbox has no keyboard support (Tab won't focus it by default, Space/Enter won't toggle it), no accessible role, and no announced state — all of that has to be hand-built with `tabIndex`, `role`, `aria-checked`, and key handlers to match what's broken."
              },
              {
                "highlightLines": [
                  5
                ],
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
                "highlightLines": [
                  3
                ],
                "description": "`getByLabelText` only finds an input if it has a real programmatic label — the exact `htmlFor`/`id` wiring this lesson teaches. A `<span>` styled as a label can't be found this way at all."
              },
              {
                "highlightLines": [
                  4
                ],
                "description": "React Testing Library's query priority (documented in the Testing module) deliberately favors `getByRole` and `getByLabelText` over `getByTestId` — the library's philosophy is that if a test can't find an element the way a screen reader user would, that's a real accessibility gap the test just caught, not a limitation of the testing tool."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "keyboard-and-focus",
      "title": "Keyboard Interaction & Focus Management",
      "content": "\n# Keyboard Interaction and Focus Management\n\n### What is it?\n**Building on accessibility as a contract:** Labels tell assistive technology what a control *is*. This lesson is about whether it can be *operated* — reached with Tab, activated with Enter or Space, dismissed with Escape — and about where the focus ring goes when your UI opens and closes things.\n\n> 💡 **Mental Model:** Focus is the keyboard's cursor. A mouse user points at whatever they want; a keyboard user can only act on the one element that currently holds focus. Open a dialog without moving focus into it and you have shown them a room while leaving them standing in the corridor.\n\n### Why do we need it?\nThis is the accessibility failure that mouse testing cannot catch, because with a mouse it genuinely works. A modal opens, you click the button inside, you close it. With a keyboard the same modal is unusable: Tab walks through the page hidden *behind* the overlay, Escape does nothing, and when the dialog finally closes focus has vanished to the document body so the next Tab starts from the top of the page.\n\nAnd it is not a minority concern. Keyboard operation is what screen reader users, switch users, people with tremors or RSI, and anyone who simply prefers not to reach for the mouse all depend on.\n\n### How?\nThree obligations, in order of how often they are skipped:\n\n1. **Use the real element.** `<button>` is focusable, fires on Enter *and* Space, announces itself as a button, and exposes its disabled state — all free. A `<div onClick>` has none of that, and matching it by hand means `tabIndex`, `role`, `onKeyDown` for two keys, and `aria-disabled`, all of which drift.\n2. **Move focus in, and put it back.** When a dialog opens, focus the dialog (`tabIndex={-1}` makes a non-interactive container focusable for exactly this purpose). When it closes, focus the control that opened it — otherwise the user is returned to nowhere.\n3. **Honour Escape.** A dismissible overlay that ignores Escape is a trap for anyone who cannot click the X.\n\n### Common Pitfalls & Gotchas\n1. **`tabIndex={0}` on things that are not controls.** It inserts a stop in the tab order that announces nothing and does nothing. Use `tabIndex={-1}` for programmatic focus targets, and `0` only for a genuinely custom interactive widget.\n2. **Removing the focus outline.** `outline: none` with nothing in its place makes the keyboard cursor invisible. If the default ring is ugly, replace it — `:focus-visible` styles only show it for keyboard users.\n3. **Assuming a focus trap is optional.** This lesson does the two easy wins; a production modal also needs Tab to cycle *within* the dialog. That is fiddly enough that a library (`focus-trap-react`, or a headless UI kit) is usually the right answer — knowing it is required is the part that matters here.\n\n### Challenge\n**Challenge:** This dialog works perfectly with a mouse and is unusable with a keyboard. Fix three things: give the dialog `role=\"dialog\"`, `aria-modal=\"true\"` and a `tabIndex={-1}` so it can hold focus; move focus into it when it opens and back to the trigger button when it closes; and close it when Escape is pressed.\n\n### Hints\n* One Effect, keyed on `isOpen`, can do all of it: focus the dialog, add a `keydown` listener, and return a cleanup that removes the listener and focuses `triggerRef.current`.\n* `tabIndex={-1}` means \"not in the tab order, but focusable from code\" — exactly what a dialog container needs.\n* The cleanup is what restores focus, because it runs when `isOpen` flips back to `false` and the Effect tears down.\n* Test it the way the bug was found: put the mouse down, and use only Tab, Enter and Escape.\n\n**Solution:**\nAdd `role=\"dialog\"`, `aria-modal=\"true\"`, an `aria-label`, and `tabIndex={-1}` to the dialog container, and give it a ref. In an Effect that runs when `isOpen` becomes true, call `dialogRef.current?.focus()` and register a `keydown` handler that closes on Escape. Return a cleanup that removes the listener and calls `triggerRef.current?.focus()`, so dismissing the dialog puts the keyboard back exactly where it was.\n\n### Example\n```jsx\nimport { useState } from 'react';\n\nexport default function App() {\n  const [log, setLog] = useState([]);\n  const record = (source) =>\n    setLog(entries => [...entries, { id: entries.length + 1, source }]);\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 12, justifyItems: 'start' }}>\n      <p>Put the mouse down. Tab to each control, then press Enter, then Space.</p>\n\n      <div\n        onClick={() => record('div with onClick')}\n        style={{ padding: '6px 12px', border: '1px solid #888', borderRadius: 6 }}\n      >\n        A div with onClick\n      </div>\n\n      <button onClick={() => record('real button')}>A real button</button>\n\n      <ul>\n        {log.map(entry => <li key={entry.id}>{entry.source}</li>)}\n      </ul>\n    </div>\n  );\n}\n```\n",
      "starterCode": "import { useState } from 'react';\n\nexport default function App() {\n  const [isOpen, setIsOpen] = useState(false);\n\n  // Works with a mouse. Try it with only Tab, Enter and Escape.\n  return (\n    <div style={{ padding: 20 }}>\n      <button onClick={() => setIsOpen(true)}>Open dialog</button>\n\n      {isOpen && (\n        <div style={{ marginTop: 16, padding: 16, border: '1px solid #888', borderRadius: 8 }}>\n          <p>Press Escape, or use the button below.</p>\n          <button onClick={() => setIsOpen(false)}>Close</button>\n        </div>\n      )}\n    </div>\n  );\n}",
      "solutionCode": "import { useEffect, useRef, useState } from 'react';\n\nexport default function App() {\n  const [isOpen, setIsOpen] = useState(false);\n  const dialogRef = useRef(null);\n  const triggerRef = useRef(null);\n\n  useEffect(() => {\n    if (!isOpen) return;\n\n    dialogRef.current?.focus();\n\n    function onKeyDown(e) {\n      if (e.key === 'Escape') setIsOpen(false);\n    }\n    document.addEventListener('keydown', onKeyDown);\n\n    return () => {\n      document.removeEventListener('keydown', onKeyDown);\n      triggerRef.current?.focus();\n    };\n  }, [isOpen]);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <button ref={triggerRef} onClick={() => setIsOpen(true)}>Open dialog</button>\n\n      {isOpen && (\n        <div\n          ref={dialogRef}\n          role=\"dialog\"\n          aria-modal=\"true\"\n          aria-label=\"Confirm action\"\n          tabIndex={-1}\n          style={{ marginTop: 16, padding: 16, border: '1px solid #888', borderRadius: 8 }}\n        >\n          <p>Press Escape, or use the button below.</p>\n          <button onClick={() => setIsOpen(false)}>Close</button>\n        </div>\n      )}\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\nexport default function App() {\n  const [log, setLog] = useState([]);\n  const record = (source) =>\n    setLog(entries => [...entries, { id: entries.length + 1, source }]);\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 12, justifyItems: 'start' }}>\n      <p>Put the mouse down. Tab to each control, then press Enter, then Space.</p>\n\n      <div\n        onClick={() => record('div with onClick')}\n        style={{ padding: '6px 12px', border: '1px solid #888', borderRadius: 6 }}\n      >\n        A div with onClick\n      </div>\n\n      <button onClick={() => record('real button')}>A real button</button>\n\n      <ul>\n        {log.map(entry => <li key={entry.id}>{entry.source}</li>)}\n      </ul>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              12,
              17
            ],
            "description": "A `div` with an `onClick` handler. With a mouse it is indistinguishable from a button — and with a keyboard it does not exist at all.\n\nTab past it and the focus ring never lands here. There is no way to reach it, so there is no way to press it.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              19
            ],
            "description": "The real `<button>` takes a tab stop, activates on Enter *and* on Space, and announces itself to a screen reader as a button — none of which was written here.\n\nThat is the whole argument for using the element the browser already ships: the behaviour is the default, not something you remember to add.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              4,
              5,
              6
            ],
            "description": "The log records who fired. Operate the page with the keyboard alone and only one of the two controls can ever appear in it.\n\nThe exact text output on the screen will be:\n`real button`\n\nrepeated once per Enter or Space, with nothing from the div.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              12,
              13,
              14,
              15,
              16
            ],
            "description": "Matching the button by hand means `tabIndex={0}`, `role=\"button\"`, and an `onKeyDown` that handles Enter and Space separately — plus `aria-disabled` once the control can be disabled.\n\nEvery one of those is a line that can be forgotten in the next component. The challenge below is the same lesson applied to a dialog, where the missing behaviour is focus rather than activation.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "useEffect(() => {\n  if (!isOpen) return;\n\n  dialogRef.current?.focus();\n\n  function onKeyDown(e) {\n    if (e.key === 'Escape') setIsOpen(false);\n  }\n  document.addEventListener('keydown', onKeyDown);\n\n  return () => {\n    document.removeEventListener('keydown', onKeyDown);\n    triggerRef.current?.focus();\n  };\n}, [isOpen]);",
        "steps": [
          {
            "highlightLines": [
              4
            ],
            "description": "Focus moves into the dialog the moment it opens. This is the line that stops Tab from walking through the page behind the overlay — and it only works because the container was given `tabIndex={-1}`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6,
              7,
              8,
              9
            ],
            "description": "Escape now dismisses it. Note that the handler is registered inside the Effect and removed in the cleanup, so there is exactly one listener while the dialog is open and none when it is not — the same add/remove symmetry the Missing Cleanup lesson drilled.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              11,
              12,
              13,
              15
            ],
            "description": "And the cleanup restores focus to the trigger. Because the dependency is `[isOpen]`, closing the dialog tears the Effect down, which runs this — so \"put the keyboard back where it was\" needs no separate close handler and cannot be forgotten on one of the two ways out.\n\nThat is the shape worth taking away: opening and closing are setup and cleanup of the same Effect, not two unrelated event handlers.",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "`tabIndex={-1}` versus `tabIndex={0}`",
          "type": "misconception",
          "walkthrough": {
            "code": "// -1: focusable from code, NOT in the tab order\n<div ref={dialogRef} tabIndex={-1} role=\"dialog\">…</div>\n\n// 0: inserted into the tab order in document position\n<div tabIndex={0} onClick={toggle}>Looks like a button</div>\n\n// What that div still lacks compared to <button>:\n//   Enter and Space do nothing\n//   no button role, no disabled state\n//   no announcement to a screen reader",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2
                ],
                "description": "`-1` is the one you almost always want. It makes an element a legal target for `.focus()` without adding a stop to the Tab sequence — exactly right for a dialog container, a scroll region, or anything you focus programmatically."
              },
              {
                "highlightLines": [
                  4,
                  5,
                  7,
                  8,
                  9
                ],
                "description": "`tabIndex={0}` on a non-control is where accessibility theatre starts. The element is now reachable, so it looks fixed, but pressing Enter on it does nothing and a screen reader announces a `generic` with no role or state.\n\nEvery one of those gaps has to be rebuilt by hand, and a real `<button>` has them already. Positive values like `tabIndex={3}` are worse still: they jump the natural order and are almost always a bug."
              }
            ]
          }
        },
        {
          "title": "Never remove the focus ring without replacing it",
          "type": "misconception",
          "walkthrough": {
            "code": "/* ❌ Deletes the keyboard's cursor for everyone */\nbutton { outline: none; }\n\n/* ✅ Style it instead — and :focus-visible shows it only to keyboard users */\nbutton:focus-visible {\n  outline: 2px solid var(--accent);\n  outline-offset: 2px;\n}",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2
                ],
                "description": "`outline: none` is one of the most common lines in any codebase and one of the most damaging. Focus still moves; the user just cannot see where it is. Operating the page becomes guesswork."
              },
              {
                "highlightLines": [
                  4,
                  5,
                  6,
                  7
                ],
                "description": "The usual motivation is that the ring appears on mouse clicks too, which looks untidy. `:focus-visible` solves exactly that: the browser shows the indicator when focus arrived by keyboard and suppresses it when it arrived by pointer.\n\nSo the honest fix is a nicer ring, never no ring."
              }
            ]
          }
        },
        {
          "title": "What this lesson deliberately leaves out: the focus trap",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Done here: focus in, focus back, Escape closes.\n\n// Still missing for a production modal:\n//   Tab from the last element should cycle to the first\n//   Shift+Tab from the first should cycle to the last\n//   content behind the dialog should be inert\n\n// Which is why this is usually a dependency, not hand-written:\n//   focus-trap-react, or a headless kit (Radix, React Aria, Headless UI)",
            "steps": [
              {
                "highlightLines": [
                  1,
                  3,
                  4,
                  5,
                  6
                ],
                "description": "Without a trap, Tab eventually walks out of the dialog and into the page behind it — the original bug, just delayed. A complete implementation also has to find every focusable descendant, handle them changing while the dialog is open, and mark the rest of the page inert."
              },
              {
                "highlightLines": [
                  8,
                  9
                ],
                "description": "That is genuinely fiddly, and getting it subtly wrong is worse than not trying. This is one of the clearest cases in React where the right move is a well-tested library.\n\nThe reason to learn the mechanics anyway is that you now know what the library is doing, and you can tell whether the one you picked actually does it."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "production-build",
      "title": "Shipping: What Changes in Production",
      "dependencies": {
        "react-error-boundary": "^5.0.0"
      },
      "content": "\n# Shipping: What Changes in Production\n\n### What is it?\nEverything you have written so far has run in a development build. A production build is a different program: smaller, faster, quieter, and much less forgiving when something goes wrong. This lesson is about the differences that actually bite.\n\n> 💡 **Mental Model:** Development React is a driving instructor's car — dual controls, someone narrating your mistakes, a speed limiter. Production is the same car with all of that removed. It goes faster because it is no longer checking on you, and nothing says a word when you take a corner badly.\n\n### What actually differs\n- **Strict Mode stops double-invoking.** Components and Effects run once per commit. Every bug Strict Mode was surfacing is still there; it is just quiet now.\n- **Warnings and validation are gone.** The `key` warning, the invalid-prop warning, the hook-order check — all development-only. They cost render time, so they are stripped.\n- **Timings shrink.** A Profiler figure from a dev build is inflated by the double-invoke and by dev-only bookkeeping. Treat dev numbers as comparative, never absolute.\n- **An uncaught render error blanks the page.** No overlay, no component name — React unmounts the whole tree and the user sees white. This is the single biggest behavioural difference, and it is the reason error boundaries stop being optional.\n- **Your `console.log`s ship.** They are in the bundle, they run on your users' machines, and anything you logged is visible in their devtools.\n\n### How?\n`npm run build` produces the bundle; `npm run preview` serves it locally, which is the only honest way to check any of the above before deploying. Three habits make the difference survivable:\n\n1. **Guard development-only code behind a build-time flag** — `import.meta.env.DEV` in Vite, `process.env.NODE_ENV !== 'production'` elsewhere. Both are *replaced with a literal* at build time, so the branch is removed from the bundle rather than merely skipped.\n2. **Put at least one error boundary above anything that can fail**, and give it an `onError` that reports somewhere you will actually look.\n3. **Configure per-environment values as environment variables**, not as a dev/prod boolean. There are usually more than two environments, and `VITE_API_URL` expresses that where `if (DEV)` cannot.\n\n### Common Pitfalls & Gotchas\n1. **Assuming `NODE_ENV` is set for you.** Vite sets it for its own build; a hand-rolled bundler or an Electron main process may not. If the check is wrong, you ship the development React build — several times larger and slower.\n2. **Swallowing errors to stop the boundary firing.** An empty `catch {}` makes the symptom disappear and the bug permanent. Catch, report, and show the user something honest.\n3. **Only testing the dev server.** Route fallbacks, base paths, asset URLs and environment variables are exactly the things that differ between `npm run dev` and a built bundle — and all of them fail *only* in the build.\n\n### Challenge\n**Challenge:** This dashboard ships three problems to production: a debug `console.log` that runs on every render for every user, a `catch` that swallows the failure entirely so nobody ever hears about it, and no error boundary, so anything that throws during render blanks the whole page. Fix all three — guard the log behind `IS_DEV`, call `reportError(error)` in the catch, and wrap the risky section in an `ErrorBoundary` with a fallback.\n\n### Hints\n* `IS_DEV` is already defined at the top of the file. In a real Vite app that line is `const IS_DEV = import.meta.env.DEV;` — it is a plain constant here only so the playground can run it.\n* `reportError` stands in for `Sentry.captureException` or your own endpoint. Calling it is the point; what it does is not.\n* `<ErrorBoundary fallback={...} onError={reportError}>` both contains the failure and reports it. A boundary that silently swallows is only half a fix.\n* Put the boundary around the part that can fail, not around the whole app — everything outside it keeps working.\n\n**Solution:**\nWrap the debug log in `if (IS_DEV)` so the bundler can drop it, call `reportError(error)` inside the catch instead of ignoring it, and put an `ErrorBoundary` with a `fallback` and an `onError` around the section that can throw. The page then degrades to a message in one region rather than a blank screen, and you find out it happened.\n\n### Example\n```jsx\nimport { ErrorBoundary } from 'react-error-boundary';\n\n// In a Vite app: const IS_DEV = import.meta.env.DEV;\n// In Next.js:    const IS_DEV = process.env.NODE_ENV !== 'production';\n// Either way it is replaced with a literal at build time, so the guarded\n// branch is removed from the bundle rather than merely skipped at runtime.\nconst IS_DEV = true;\n\nfunction reportError(error) {\n  // Stands in for Sentry.captureException(error) or your own endpoint.\n  console.error('[reported]', error.message);\n}\n\nfunction Widget() {\n  if (IS_DEV) console.log('Widget rendered');\n  throw new Error('The widget could not load.');\n}\n\nexport default function App() {\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Dashboard</h2>\n      <ErrorBoundary\n        fallback={<p>This section could not load. The rest of the page still works.</p>}\n        onError={reportError}\n      >\n        <Widget />\n      </ErrorBoundary>\n      <p>Everything outside the boundary is unaffected.</p>\n    </div>\n  );\n}\n```\n",
      "starterCode": "import { ErrorBoundary } from 'react-error-boundary';\n\n// In a real Vite app: const IS_DEV = import.meta.env.DEV;\nconst IS_DEV = true;\n\nfunction reportError(error) {\n  console.error('[reported]', error.message);\n}\n\nfunction loadSettings() {\n  try {\n    return JSON.parse('{ not json }');\n  } catch (error) {\n    // 👉 2. This swallows the failure. Report it instead.\n    return null;\n  }\n}\n\nfunction Widget() {\n  // 👉 1. This log ships to every user. Guard it.\n  console.log('Widget rendered', loadSettings());\n  throw new Error('The widget could not load.');\n}\n\nexport default function App() {\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Dashboard</h2>\n      {/* 👉 3. Anything that throws here blanks the whole page in production. */}\n      <Widget />\n      <p>Everything outside the boundary is unaffected.</p>\n    </div>\n  );\n}",
      "solutionCode": "import { ErrorBoundary } from 'react-error-boundary';\n\n// In a real Vite app: const IS_DEV = import.meta.env.DEV;\nconst IS_DEV = true;\n\nfunction reportError(error) {\n  console.error('[reported]', error.message);\n}\n\nfunction loadSettings() {\n  try {\n    return JSON.parse('{ not json }');\n  } catch (error) {\n    reportError(error);\n    return null;\n  }\n}\n\nfunction Widget() {\n  if (IS_DEV) console.log('Widget rendered', loadSettings());\n  throw new Error('The widget could not load.');\n}\n\nexport default function App() {\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Dashboard</h2>\n      <ErrorBoundary\n        fallback={<p>This section could not load. The rest of the page still works.</p>}\n        onError={reportError}\n      >\n        <Widget />\n      </ErrorBoundary>\n      <p>Everything outside the boundary is unaffected.</p>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { ErrorBoundary } from 'react-error-boundary';\n\n// In a Vite app: const IS_DEV = import.meta.env.DEV;\n// In Next.js:    const IS_DEV = process.env.NODE_ENV !== 'production';\n// Either way it is replaced with a literal at build time, so the guarded\n// branch is removed from the bundle rather than merely skipped at runtime.\nconst IS_DEV = true;\n\nfunction reportError(error) {\n  // Stands in for Sentry.captureException(error) or your own endpoint.\n  console.error('[reported]', error.message);\n}\n\nfunction Widget() {\n  if (IS_DEV) console.log('Widget rendered');\n  throw new Error('The widget could not load.');\n}\n\nexport default function App() {\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Dashboard</h2>\n      <ErrorBoundary\n        fallback={<p>This section could not load. The rest of the page still works.</p>}\n        onError={reportError}\n      >\n        <Widget />\n      </ErrorBoundary>\n      <p>Everything outside the boundary is unaffected.</p>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3,
              4,
              5,
              6,
              7
            ],
            "description": "The important word is **replaced**, not checked. `import.meta.env.DEV` is substituted with the literal `false` in a production build, so `if (false) console.log(...)` becomes dead code that the minifier deletes outright.\n\nThat is why this differs from a runtime flag: the logging is not skipped on your users' machines, it is not *there*.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              15
            ],
            "description": "An unguarded `console.log` in a component runs on every render, for every user, forever — and whatever you passed to it is sitting in their devtools. It is the most common thing to accidentally ship, because it is invisible in the one environment where you look.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              16,
              23,
              27
            ],
            "description": "`Widget` throws during render. In development you would get an overlay naming the component and the line. In production, with no boundary above it, React unmounts the entire tree: the user gets a blank white page, no message, and no way back except a reload.\n\nThe boundary turns that into one paragraph in one region, with the rest of the page still working.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              9,
              10,
              11,
              25
            ],
            "description": "`onError` is the half that is easy to leave out. A boundary without it contains the failure and tells nobody — the user sees a polite message and you never learn the feature is broken.\n\nIn a real app this is `Sentry.captureException` or an equivalent. The pattern matters more than the vendor: catch, show something honest, and report.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              29
            ],
            "description": "And the line outside the boundary keeps rendering, which is the whole argument for boundary placement. One at the app root turns any error into a blank page again; one per meaningful region degrades the page instead of losing it.\n\nThe exact text output on the screen will be:\n`Dashboard`\n`This section could not load. The rest of the page still works.`\n`Everything outside the boundary is unaffected.`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "function loadSettings() {\n  try {\n    return JSON.parse('{ not json }');\n  } catch (error) {\n    reportError(error);\n    return null;\n  }\n}\n\nfunction Widget() {\n  if (IS_DEV) console.log('Widget rendered', loadSettings());\n  throw new Error('The widget could not load.');\n}\n\n<ErrorBoundary\n  fallback={<p>This section could not load. The rest of the page still works.</p>}\n  onError={reportError}\n>\n  <Widget />\n</ErrorBoundary>",
        "steps": [
          {
            "highlightLines": [
              4,
              5,
              6
            ],
            "description": "The empty `catch` became a reporting `catch`. Returning `null` is still the right recovery — the app carries on without settings — but now the failure is recorded instead of erased.\n\nAn empty catch block is not error handling. It is a decision to never find out.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              11
            ],
            "description": "The log is behind `IS_DEV`, so the bundler removes it. Note that this also removes the `loadSettings()` call inside it — guarding a log guards everything the log was computing, which is often the more expensive half.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              15,
              16,
              17,
              19,
              20
            ],
            "description": "And the risky region is wrapped, with a fallback the user can read and an `onError` you will actually see.\n\nThree small changes, and the production failure mode goes from \"blank page, silence\" to \"one degraded panel, reported\". That difference is most of what shipping carefully means.",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Run the production build before you trust it",
          "type": "did-you-know",
          "walkthrough": {
            "code": "npm run build      // produce the bundle in dist/\nnpm run preview    // serve dist/ exactly as it will be served\n\n// Things that work in `npm run dev` and break in the build:\n//   deep links, if the host has no SPA fallback\n//   asset paths, if `base` is wrong for the deploy target\n//   anything reading an env var that was never set for the build\n//   code that depended on a dev-only warning to behave",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2
                ],
                "description": "`npm run dev` and `npm run build` produce different programs. The dev server rewrites paths, serves modules unbundled, and injects development React. `preview` serves the real artefact, which is the first moment any of the differences can show up."
              },
              {
                "highlightLines": [
                  4,
                  5,
                  6,
                  7,
                  8
                ],
                "description": "Every item on that list shares a shape: it is invisible in dev by construction. Which is why \"it works locally\" is not evidence about the build — the build is the thing that has to work, and it takes thirty seconds to check."
              }
            ]
          }
        },
        {
          "title": "Environment variables, not a dev/prod boolean",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ Only two environments can exist in this model\nconst API = IS_DEV ? 'http://localhost:3000' : 'https://api.example.com';\n\n// ✅ Named per deployment; the code stops caring\nconst API = import.meta.env.VITE_API_URL;\n\n// Vite only exposes variables prefixed VITE_ to client code.\n// That prefix is a safety rail: it stops a server secret in .env\n// from being inlined into a bundle every user can read.",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2
                ],
                "description": "A boolean can express two environments and real projects have more — local, CI, preview, staging, production. The moment a fourth appears, this line grows a nested ternary and the branch logic starts living in application code."
              },
              {
                "highlightLines": [
                  4,
                  5,
                  7,
                  8,
                  9
                ],
                "description": "An env var moves the decision to the deployment, where it belongs. The `VITE_` prefix is worth understanding rather than working around: anything without it stays out of the client bundle, which is what stops a database URL in your `.env` from shipping to the browser.\n\nAnd remember these are inlined at **build** time, not read at runtime — changing one means rebuilding."
              }
            ]
          }
        },
        {
          "title": "Source maps: shipped, or uploaded?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// vite.config.js\nexport default defineConfig({\n  build: {\n    sourcemap: true,        // emits .map files next to the bundle\n    // sourcemap: 'hidden', // emits them WITHOUT the //# comment\n  },\n});",
            "steps": [
              {
                "highlightLines": [
                  4
                ],
                "description": "Without source maps, a production stack trace points at minified names in a single-line bundle and tells you nothing. With them, your error reporter can show the original file and line — which is the difference between a fixable report and a shrug."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "The trade-off is that a public `.map` hands anyone your original source. `'hidden'` generates the maps without the comment that points browsers at them, so you can upload them to your error reporter and not serve them — the usual answer when the code is not open."
              }
            ]
          }
        }
      ]
    }
  ]
};
