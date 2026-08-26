export default {
  "id": "mental-models",
  "title": "React Mental Models",
  "description": "Build the execution model behind rendering, state ownership, identity, purity, and events.",
  "icon": "Brain",
  "lessons": [
    {
      "id": "rendering-model",
      "title": "The Render Snapshot",
      "content": "\n# The Render Snapshot\n\n### What is it?\nA **render** is React calling your component function to produce a snapshot of UI for one specific set of props, state, and context. Every value inside that function call — including `count`, event handlers, and any closures created during it — is frozen to whatever it was at that instant. Calling a state setter does not go back and edit that snapshot; it only asks React to produce a new one.\n\n### Why do we need it?\nWithout this mental model, code like `setCount(count + 1); setCount(count + 1);` looks like it should add 2. It doesn't, because both calls read the exact same frozen `count` from the same render — they aren't \"the current count,\" they're \"the count this render was handed.\" Understanding renders as snapshots, not live references, is what makes state updates, closures inside effects, and stale-value bugs predictable instead of mysterious.\n\n### How?\nWhen state changes, React calls your component function again. That new call gets fresh constants — a new `count`, a new closure for every function defined inside it — but the *previous* call's constants are untouched; they simply belong to a render that has already finished being useful. If the next value needs to depend on the value immediately before it within the same event, pass a function to the setter instead of a value: React queues these functional updates and threads the previous queued result into the next one.\n\n### Syntax/Example\n```javascript\nfunction handleClick() {\n  setCount(previous => previous + 1); // reads the latest queued value\n  setCount(previous => previous + 1);\n  setCount(previous => previous + 1);\n}\n```\n\n### Common Pitfalls & Gotchas\n1. **Assuming `setCount(count + 1)` stacks.** Every call in the same event reads the same frozen `count`, so three calls queue the same value three times, not three increments.\n2. **Reading state right after calling its setter.** `setCount(x)` followed immediately by `console.log(count)` still prints the old value — the update hasn't been applied to this render's `count` and never will be; it only appears in the *next* render.\n3. **Expecting a `setTimeout` or effect callback to see \"the current\" state.** A closure created during a render keeps that render's snapshot forever, even if it runs long after a newer render has happened.\n\n### Challenge and Solution\n**Challenge:** Fix the click handler so three increments in one event produce 3, not 1.\n\n**Solution:** Use `setCount(previous => previous + 1)` for each call instead of `setCount(count + 1)`, so each update reads the result of the one queued before it.\n\n### Hints\n* A render is a photograph, not a live feed — nothing inside it changes once it has been taken.\n* Reach for the functional updater form specifically when the next value depends on a value that might still be queued from earlier in the same event.\n\n\n### Example\n```jsx\nimport { useState } from 'react';\n\nexport default function Snapshot() {\n  const [count, setCount] = useState(0);\n\n  function handleClick() {\n    setCount(count + 1);\n    setTimeout(() => {\n      alert(`The count for this render was ${count}`);\n    }, 3000);\n  }\n\n  return (\n    <div style={{ padding: 20 }}>\n      <p>Count: {count}</p>\n      <button onClick={handleClick}>Increment, then alert in 3s</button>\n    </div>\n  );\n}\n```\n",
      "starterCode": "import { useState } from 'react';\nexport default function App() {\n  const [count, setCount] = useState(0);\n  function handleClick() {\n    setCount(count + 1);\n    setCount(count + 1);\n    setCount(count + 1);\n  }\n  return <button onClick={handleClick}>Count: {count}</button>;\n}",
      "solutionCode": "import { useState } from 'react';\nexport default function App() {\n  const [count, setCount] = useState(0);\n  function handleClick() {\n    setCount(previous => previous + 1);\n    setCount(previous => previous + 1);\n    setCount(previous => previous + 1);\n  }\n  return <button onClick={handleClick}>Count: {count}</button>;\n}",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\nexport default function Snapshot() {\n  const [count, setCount] = useState(0);\n\n  function handleClick() {\n    setCount(count + 1);\n    setTimeout(() => {\n      alert(`The count for this render was ${count}`);\n    }, 3000);\n  }\n\n  return (\n    <div style={{ padding: 20 }}>\n      <p>Count: {count}</p>\n      <button onClick={handleClick}>Increment, then alert in 3s</button>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              4
            ],
            "description": "`count` is a plain constant, not a live reference to \"whatever the state is now\". It is the value React handed *this* render, and it stays frozen for the entire lifetime of this function call.\n\nEvery render gets its own `count`. They never change; they are replaced.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              8,
              9,
              10
            ],
            "description": "The arrow function passed to `setTimeout` closes over the `count` belonging to the render that was running when you clicked. Three seconds later the button may already show a different number — the alert will still report the old one, because that is the only `count` this closure can see.\n\nClick the button several times quickly and watch the alerts arrive with the values as they were at each click.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7,
              15
            ],
            "description": "`setCount(count + 1)` does not rewrite the `count` this closure already captured. It requests a *future* render, which will run the function again from the top with a new snapshot.\n\nThe exact text output on the screen will be:\n`Count: 0`\n`[Button: Increment, then alert in 3s]`\n\nand three seconds after the first click, an alert reading `The count for this render was 0`.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "function handleClick() {\n  setCount(previous => previous + 1);\n  setCount(previous => previous + 1);\n  setCount(previous => previous + 1);\n}",
        "steps": [
          {
            "highlightLines": [2],
            "description": "Instead of passing a *value* (`count + 1`, which reads the frozen snapshot), this passes a *function*. React doesn't evaluate it immediately — it queues it as an instruction: \"whatever the state ends up being at this point, add 1 to it.\"",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [2, 3, 4],
            "description": "All three calls queue an updater function rather than a value. React now has a queue of three `previous => previous + 1` functions attached to this one click event, instead of three copies of the same stale `count + 1` value.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [2, 3, 4],
            "description": "Before the next render, React processes the queue in order, feeding each function the output of the one before it: `0 → 1 → 2 → 3`. The functional form is the escape hatch specifically for \"the next value depends on the value right before it, queued in the same event\" — which is exactly this case.",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "setCount doesn't update count — even a line later",
          "type": "misconception",
          "walkthrough": {
            "code": "function handleClick() {\n  console.log(count); // 0\n  setCount(count + 1);\n  console.log(count); // still 0!\n}",
            "steps": [
              {
                "highlightLines": [2, 3, 4],
                "description": "Both `console.log(count)` calls print the same value. `setCount` schedules a re-render — it does not reach back and mutate the `count` constant that's already sitting in this function's closure. The new value only exists once React re-runs the component and hands the new render a new `count`."
              }
            ]
          }
        },
        {
          "title": "Why three identical setCount(count + 1) calls don't stack",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// count starts at 0\nsetCount(count + 1); // queues the value 1 (0 + 1)\nsetCount(count + 1); // queues the value 1 (0 + 1) — same count!\nsetCount(count + 1); // queues the value 1 (0 + 1) — same count!\n// React keeps only the LAST value queued for this key: 1",
            "steps": [
              {
                "highlightLines": [2, 3, 4],
                "description": "Each call reads `count` from the same frozen snapshot — 0 — so each one queues the literal value 1, not \"one more than the last queued update.\" Three value-based updates in a row collapse to a single net change. This is exactly what the functional-updater form is for: it lets each queued update see the *previous queued update's result*, not just the render's original snapshot."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "state-or-derived",
      "title": "State or Derived Data?",
      "content": "\n# State or Derived Data?\n\n### What is it?\nNot every value that changes over time needs to be its own piece of state. If a value can be calculated from props or state that already exist, it's **derived data** — a plain calculation performed fresh on every render — rather than a second, independently-stored value that has to be kept in sync by hand.\n\n### Why do we need it?\nStoring a derivable value as its own state creates two sources of truth for one fact. Every place that changes the original data now also has to remember to update the derived copy — miss one call site and the UI quietly shows a number that disagrees with the data it's supposed to summarize, with no error and no warning.\n\n### How?\nAsk: can this value be computed from the current props/state alone, without remembering anything about past renders or synchronizing with something outside React? If yes, don't call `useState` for it — just calculate it as a plain `const` in the component body. It recalculates on every render, which is exactly what keeps it from ever drifting out of sync.\n\n### Syntax/Example\n```javascript\n// Second source of truth that can drift\nconst [visibleCount, setVisibleCount] = useState(1);\n```\n\n```javascript\n// Always in sync with items, because it's computed from items\nconst visibleCount = items.filter(item => item.active).length;\n```\n\n### Common Pitfalls & Gotchas\n1. **Reaching for an Effect to \"keep it updated.\"** `useEffect(() => setDerived(calculate(source)), [source])` is a sign the value should be derived directly instead — the Effect only exists to copy one calculation into a second variable.\n2. **Worrying that recalculating every render is wasteful.** Filtering or mapping a modestly-sized array is far cheaper than the render-cycle and bug surface that storing it separately introduces. Reach for `useMemo` only after profiling shows the calculation itself is genuinely expensive.\n3. **Confusing \"changes over time\" with \"needs to be state.\"** A value can change on every render and still not be state — it just needs to be recalculated from something that is.\n\n### Challenge and Solution\n**Challenge:** Remove the redundant `visibleCount` state and derive the value from the existing list instead.\n\n**Solution:** Calculate `visibleCount` during render as `items.filter(item => item.active).length`; don't add an Effect just to keep a second copy synchronized.\n\n### Hints\n* The test: could a bug make this value disagree with its source data? If yes, it shouldn't be stored separately.\n* An Effect whose only job is copying one calculation into state is almost always a sign the value should be derived instead.\n\n\n### Example\n```jsx\nimport { useState } from 'react';\n\nconst CART = [\n  { id: 1, name: 'Keyboard', price: 80 },\n  { id: 2, name: 'Mouse', price: 25 }\n];\n\nexport default function Cart() {\n  const [taxRate, setTaxRate] = useState(0);\n\n  const subtotal = CART.reduce((sum, item) => sum + item.price, 0);\n  const total = subtotal + subtotal * taxRate;\n\n  return (\n    <div style={{ padding: 20 }}>\n      <p>Subtotal: ${subtotal}</p>\n      <p>Total: ${total.toFixed(2)}</p>\n      <button onClick={() => setTaxRate(0.2)}>Apply 20% tax</button>\n    </div>\n  );\n}\n```\n",
      "starterCode": "import { useState } from 'react';\nexport default function App() {\n  const [items] = useState([{ id: 1, active: true }, { id: 2, active: false }]);\n  const [visibleCount] = useState(1);\n  return <p>Visible: {visibleCount} / {items.length}</p>;\n}",
      "solutionCode": "import { useState } from 'react';\nexport default function App() {\n  const [items] = useState([{ id: 1, active: true }, { id: 2, active: false }]);\n  const visibleCount = items.filter(item => item.active).length;\n  return <p>Visible: {visibleCount} / {items.length}</p>;\n}",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\nconst CART = [\n  { id: 1, name: 'Keyboard', price: 80 },\n  { id: 2, name: 'Mouse', price: 25 }\n];\n\nexport default function Cart() {\n  const [taxRate, setTaxRate] = useState(0);\n\n  const subtotal = CART.reduce((sum, item) => sum + item.price, 0);\n  const total = subtotal + subtotal * taxRate;\n\n  return (\n    <div style={{ padding: 20 }}>\n      <p>Subtotal: ${subtotal}</p>\n      <p>Total: ${total.toFixed(2)}</p>\n      <button onClick={() => setTaxRate(0.2)}>Apply 20% tax</button>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              9
            ],
            "description": "Exactly one thing here is real state: `taxRate`. It changes over time in response to the user, and nothing else in the component can be used to work it out.\n\nThat is the test. If a value cannot be computed from what you already have, it is state.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              11,
              12
            ],
            "description": "`subtotal` and `total` are **derived**: plain calculations in the render body, recomputed on every render. There is no `useState` for them and no Effect keeping them in step, because there is nothing to keep in step — they are recalculated from their inputs each time, so they cannot go stale.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              17,
              18
            ],
            "description": "Now picture the alternative: `const [total, setTotal] = useState(0)` plus an Effect that writes `setTotal(...)` whenever `taxRate` changes.\n\nEvery tax change would then cost two renders — one with the *old* total briefly on screen, then the Effect fires, then a second render with the new one. And `total` becomes a second source of truth that some future code path can forget to update.\n\nThe exact text output on the screen will be:\n`Subtotal: $105`\n`Total: $105.00`\n`[Button: Apply 20% tax]`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "const visibleCount = items.filter(item => item.active).length;",
        "steps": [
          {
            "highlightLines": [1],
            "description": "`visibleCount` is not stored in `useState` at all — it's a plain `const`, recalculated fresh on every render straight from `items`, which is the actual source of truth.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [1],
            "description": "Because it's derived rather than stored, it is structurally impossible for `visibleCount` to disagree with `items` — there's no second value that a bug (or a missed dependency) could let drift out of sync.",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "The test: could a bug make this value \"lie\"?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Stored state: CAN disagree with items\nconst [visibleCount, setVisibleCount] = useState(0);\n\n// Derived value: CANNOT disagree with items\nconst visibleCount = items.filter(i => i.active).length;",
            "steps": [
              {
                "highlightLines": [2],
                "description": "If `visibleCount` is its own state, some code path has to remember to call `setVisibleCount` every single time `items` changes. Miss one call site — a bulk edit, a websocket update, an undo action — and the UI silently shows the wrong count while looking perfectly fine."
              },
              {
                "highlightLines": [5],
                "description": "A derived value has no update-forgetting failure mode at all, because there's nothing to forget to update. This is the practical test for \"should this be state\": if a missed update could make the value wrong, it probably shouldn't be state."
              }
            ]
          }
        },
        {
          "title": "\"But recalculating on every render is wasteful\" — usually not",
          "type": "misconception",
          "walkthrough": {
            "code": "// This filter runs on every render — and that's fine\nconst visibleCount = items.filter(item => item.active).length;\n\n// Only reach for useMemo if profiling shows this is actually slow\nconst visibleCount = useMemo(\n  () => items.filter(item => item.active).length,\n  [items]\n);",
            "steps": [
              {
                "highlightLines": [2],
                "description": "Filtering a small array is cheap — far cheaper than the extra render cycle and state-sync bug surface that storing it separately introduces. Recompute during render by default."
              },
              {
                "highlightLines": [5, 6, 7, 8],
                "description": "`useMemo` is a performance escape hatch for when profiling shows the calculation itself is expensive, not a default wrapper for every derived value. Reach for it after measuring, not before — see the Rendering & Performance module."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "state-ownership",
      "title": "State Ownership and Lifting State",
      "content": "\n# State Ownership\n\n### What is it?\nEvery piece of state needs exactly one **owner** — the component responsible for holding it and changing it. Ownership isn't fixed to wherever a value is first needed; it's determined by which components actually need to read or update it.\n\n### Why do we need it?\nPut state too low — inside one of two sibling components — and the other sibling has no way to read it; there's no path between siblings in React's tree. Put it too high, in some distant ancestor \"just in case,\" and unrelated components become coupled to state they don't care about, and unrelated parts of the tree re-render on every change. Ownership should sit at the lowest component that is a common ancestor of everyone who needs it.\n\n### How?\nBefore reaching for Context or a global store, ask two questions: which component actually needs to change this value, and which components need to read it? If only one component ever calls the setter and no sibling needs the value, it can stay entirely local. The moment a second component needs to read *or* influence it, move the state up to their nearest shared parent — \"lifting state up\" — and pass it back down as props.\n\n### Syntax/Example\n```jsx\nfunction App() {\n  const [query, setQuery] = useState('');\n  return (\n    <>\n      <SearchBox query={query} onQueryChange={setQuery} />\n      <Results query={query} />\n    </>\n  );\n}\n```\n\n### Common Pitfalls & Gotchas\n1. **Reaching for Context immediately for two nearby siblings.** Lifting state to a close shared parent and passing plain props down is simpler to trace and doesn't force every consumer to re-render on change — see the Sharing State module for when Context actually earns its cost.\n2. **Duplicating state in both siblings instead of lifting it.** Two independent `useState` calls for \"the same\" value will drift apart the moment one updates without the other.\n3. **Lifting state further than necessary.** State that's only ever read by one branch of the tree doesn't need to live at the app root \"to be safe\" — that just couples unrelated components and widens what re-renders on every change.\n\n### Challenge and Solution\n**Challenge:** `SearchBox` owns `query` locally, so `Results` has no way to read what was typed. Move the search state up to `App` and pass `query` plus an `onQueryChange` callback down to both.\n\n**Solution:** Keep one source of truth in the shared parent (`App`); `SearchBox` and `Results` both become controlled by props instead of holding their own copies.\n\n### Hints\n* Ownership follows need, not convenience — ask who has to read or change the value, not where it's easiest to declare.\n* \"Lifting state up\" and \"adding Context\" solve the same coordination problem at different distances; start with lifting and only add Context once prop drilling is the actual pain.\n\n\n### Example\n```jsx\nimport { useState } from 'react';\n\nfunction TemperatureInput({ celsius, onCelsiusChange }) {\n  return (\n    <input\n      aria-label=\"Celsius\"\n      value={celsius}\n      onChange={e => onCelsiusChange(e.target.value)}\n    />\n  );\n}\n\nfunction TemperatureDisplay({ celsius }) {\n  const fahrenheit = (Number(celsius) * 9) / 5 + 32;\n  return <p>{Number(celsius)}C is {fahrenheit}F</p>;\n}\n\nexport default function Thermostat() {\n  const [celsius, setCelsius] = useState('');\n\n  return (\n    <div style={{ padding: 20 }}>\n      <TemperatureInput celsius={celsius} onCelsiusChange={setCelsius} />\n      <TemperatureDisplay celsius={celsius} />\n    </div>\n  );\n}\n```\n",
      "starterCode": "import { useState } from 'react';\nfunction SearchBox() {\n  const [query, setQuery] = useState('');\n  return <input value={query} onChange={e => setQuery(e.target.value)} aria-label=\"Search\" />;\n}\nfunction Results() { return <p>Results for:</p>; }\nexport default function App() { return <><SearchBox /><Results /></>; }",
      "solutionCode": "import { useState } from 'react';\nfunction SearchBox({ query, onQueryChange }) {\n  return <input value={query} onChange={e => onQueryChange(e.target.value)} aria-label=\"Search\" />;\n}\nfunction Results({ query }) { return <p>Results for: {query}</p>; }\nexport default function App() {\n  const [query, setQuery] = useState('');\n  return <><SearchBox query={query} onQueryChange={setQuery} /><Results query={query} /></>;\n}",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\nfunction TemperatureInput({ celsius, onCelsiusChange }) {\n  return (\n    <input\n      aria-label=\"Celsius\"\n      value={celsius}\n      onChange={e => onCelsiusChange(e.target.value)}\n    />\n  );\n}\n\nfunction TemperatureDisplay({ celsius }) {\n  const fahrenheit = (Number(celsius) * 9) / 5 + 32;\n  return <p>{Number(celsius)}C is {fahrenheit}F</p>;\n}\n\nexport default function Thermostat() {\n  const [celsius, setCelsius] = useState('');\n\n  return (\n    <div style={{ padding: 20 }}>\n      <TemperatureInput celsius={celsius} onCelsiusChange={setCelsius} />\n      <TemperatureDisplay celsius={celsius} />\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              19
            ],
            "description": "`celsius` is real state — it changes over time as the user types — so it has to live in a `useState` *somewhere*. The question this lesson is about is which component owns it.\n\nHere it is `Thermostat`, the closest component that renders both of the components that need the value.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              3,
              23
            ],
            "description": "Had `TemperatureInput` kept its own `useState`, `TemperatureDisplay` would have no way to read it — siblings cannot reach into each other's state, and that is a dead end, not a problem to solve with clever prop passing.\n\nSo the input no longer owns anything. It receives `celsius` to display and `onCelsiusChange` to report changes back up. That pair is what \"controlled component\" means.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              13,
              24
            ],
            "description": "The display reads the same `celsius` from the same owner, so the two can never disagree. There is one source of truth and both children are views onto it.\n\nNote what this did *not* need: no Context, no global store, no synchronising Effect. Lifting state to the nearest common parent is the ordinary answer, and reaching for the other tools before trying it is how applications get complicated.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              22,
              25
            ],
            "description": "Type a number into the input and the paragraph updates on the same keystroke, because both children re-render from the one state change.\n\nBefore typing, the exact text output on the screen will be:\n`[Input: empty]`\n`0C is 32F`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "export default function App() {\n  const [query, setQuery] = useState('');\n  return <><SearchBox query={query} onQueryChange={setQuery} /><Results query={query} /></>;\n}",
        "steps": [
          {
            "highlightLines": [2],
            "description": "The state moved out of `SearchBox` and up into `App` — the nearest component that renders both `SearchBox` and `Results`. `App` is now the single owner of `query`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [3],
            "description": "`SearchBox` no longer owns `query` — it receives the current value as a prop and reports changes back up through `onQueryChange`. It became a \"controlled\" component: display what you're told, report what happens.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [3],
            "description": "`Results` now also receives `query` as a prop, so it always renders in sync with what's actually typed — both siblings read from the same single source of truth in `App`, instead of `SearchBox` privately holding a copy that `Results` can never see.",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Ownership question #1: who needs to change it?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// If only ONE component ever calls the setter,\n// state can usually stay local to that component.\n\n// If MULTIPLE components need to read OR change it,\n// it has to live in their nearest common parent.",
            "steps": [
              {
                "highlightLines": [1, 2, 3],
                "description": "A component that owns state no one else needs can keep it entirely to itself — a toggle's open/closed flag, an input's raw draft text before submit, a hover state. No lifting required."
              },
              {
                "highlightLines": [4, 5],
                "description": "The moment a second component needs to read *or* influence that value, it can no longer live only in the first component — it has to move up to whichever component is an ancestor of both. This is the actual trigger for lifting state up, not \"state is always better lifted.\""
              }
            ]
          }
        },
        {
          "title": "Lift state up before reaching for Context",
          "type": "misconception",
          "walkthrough": {
            "code": "// Two siblings under the same parent, 1 level apart:\n// ✅ Lift state to the parent, pass down as props\n\n// A value needed 6 components deep in an unrelated branch:\n// ✅ NOW Context earns its cost",
            "steps": [
              {
                "highlightLines": [1, 2],
                "description": "It's tempting to reach for Context the moment two components need to share something. But for state that's genuinely local to a small, nearby part of the tree, lifting it to the shared parent and passing plain props down is simpler, easier to trace, and doesn't force every consumer to re-render when the value changes."
              },
              {
                "highlightLines": [4, 5],
                "description": "Context earns its cost when the prop would otherwise have to thread through many layers of components that don't themselves care about it — \"prop drilling\" as a real, felt problem. Ownership still starts with the same question: which component is the lowest common owner? Context just changes *how* you deliver the value from there, not who owns it."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "identity-and-keys",
      "title": "Identity, Keys, and State Preservation",
      "content": "\n# Identity, Keys, and State Preservation\n\n### What is it?\nReact decides whether a rendered element is \"the same component instance as before\" or \"a new one\" based on its **identity** — a combination of component type, position in the tree, and, when present, its `key`. Same identity across renders means React preserves that instance's local state; different identity means it discards the old instance and mounts a fresh one.\n\n### Why do we need it?\nIdentity is what makes a counter's value survive a prop change but reset when a list reorders without stable keys — and it's the mechanism behind a subtle class of bugs: two different logical items rendered at the same position, with no key or an unstable key, look like \"the same instance\" to React, so local state leaks from one to the other exactly where it wasn't intended to.\n\n### How?\nBy default, identity comes from type and position: two renders of `<Timer>` at the same spot in the tree are the same instance even if their props differ, and its state survives. A `key` folds additional information into that identity — most commonly an item's own id in a list, so React can match instances correctly when the list reorders. The same mechanism can be used deliberately: giving a component a key derived from something like a selected user's id forces React to treat a state-carrying subtree as brand new whenever that value changes.\n\n### Syntax/Example\n```jsx\n// Selecting a different user should reset the editor's local draft state\n<Editor key={selectedUser.id} user={selectedUser} />\n```\n\n### Common Pitfalls & Gotchas\n1. **Using array index as a key.** Index-based keys describe position, not identity — after an item is inserted or removed anywhere but the end, every subsequent item's \"identity\" silently shifts, and their local state (an open dropdown, a draft) can end up attached to the wrong row.\n2. **Not realizing state can persist across visually different renders.** Two renders that look completely different (different props, different content) are still the same instance — and keep the same state — if type, position, and key all match.\n3. **Forgetting that a key change is a full reset, not a soft update.** React genuinely discards the old instance and its state rather than patching it — useful when that's the intent, disruptive when it isn't.\n\n### Challenge and Solution\n**Challenge:** One `Editor` instance is reused for two different users, so a draft typed for one user leaks into the next when the selection changes. Add a key so selecting another user starts a fresh editor.\n\n**Solution:** Put `key={selectedUser.id}` on `Editor`, so React treats a different user as a different component identity and mounts a fresh instance instead of reusing the old one's state.\n\n### Hints\n* Identity is type + position + key — changing any of them can create a \"new\" instance from React's point of view.\n* A changing key isn't just for lists — it's a general-purpose way to intentionally reset a subtree's local state.\n\n\n### Example\n```jsx\nimport { useState } from 'react';\n\nfunction Counter({ label }) {\n  const [n, setN] = useState(0);\n  return (\n    <button onClick={() => setN(n + 1)}>\n      {label}: {n}\n    </button>\n  );\n}\n\nexport default function IdentityDemo() {\n  const [isSecond, setIsSecond] = useState(false);\n\n  return (\n    <div style={{ padding: 20 }}>\n      {isSecond ? <Counter label=\"Second\" /> : <Counter label=\"First\" />}\n      <button onClick={() => setIsSecond(v => !v)}>Swap label</button>\n    </div>\n  );\n}\n```\n",
      "starterCode": "import { useState } from 'react';\nfunction Editor({ user }) {\n  const [draft, setDraft] = useState(user.name);\n  return <input aria-label=\"Draft\" value={draft} onChange={e => setDraft(e.target.value)} />;\n}\nexport default function App() {\n  const [selectedUser, setSelectedUser] = useState({ id: 1, name: 'Ada' });\n  return <><button onClick={() => setSelectedUser({ id: 2, name: 'Linus' })}>Select Linus</button><Editor user={selectedUser} /></>;\n}",
      "solutionCode": "import { useState } from 'react';\nfunction Editor({ user }) {\n  const [draft, setDraft] = useState(user.name);\n  return <input aria-label=\"Draft\" value={draft} onChange={e => setDraft(e.target.value)} />;\n}\nexport default function App() {\n  const [selectedUser, setSelectedUser] = useState({ id: 1, name: 'Ada' });\n  return <><button onClick={() => setSelectedUser({ id: 2, name: 'Linus' })}>Select Linus</button><Editor key={selectedUser.id} user={selectedUser} /></>;\n}",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\nfunction Counter({ label }) {\n  const [n, setN] = useState(0);\n  return (\n    <button onClick={() => setN(n + 1)}>\n      {label}: {n}\n    </button>\n  );\n}\n\nexport default function IdentityDemo() {\n  const [isSecond, setIsSecond] = useState(false);\n\n  return (\n    <div style={{ padding: 20 }}>\n      {isSecond ? <Counter label=\"Second\" /> : <Counter label=\"First\" />}\n      <button onClick={() => setIsSecond(v => !v)}>Swap label</button>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              17
            ],
            "description": "This reads like a choice between two different elements, but that is not what React sees. Both branches produce a `Counter` at the same position in the tree, with a different prop.\n\nSame type, same position — so as far as React is concerned this is the same component instance, being updated.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              4,
              17
            ],
            "description": "Because identity is preserved, the `Counter`'s own `n` survives the swap untouched. React does not unmount anything; it just updates the `label` prop on the instance that is already there.\n\nThis is the mechanism behind the more famous version of the surprise: two inputs in a ternary sharing one instance, and text typed into the first appearing in the second.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              18
            ],
            "description": "Try it: click the counter up to 3, then press **Swap label**. The label changes and the 3 stays.\n\nIdentity is not about whether the JSX *looks* different. It is type plus position in the tree — which is exactly why a `key` is the tool for saying \"no, treat this as a different thing\", and why moving an element to a different position resets it whether you wanted that or not.\n\nThe exact text output on the screen will be:\n`[Button: First: 0]`\n`[Button: Swap label]`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "<Editor key={selectedUser.id} user={selectedUser} />",
        "steps": [
          {
            "highlightLines": [1],
            "description": "Before this fix, `<Editor user={selectedUser} />` had no key — its identity was just \"the Editor at this position,\" which never changes no matter who `selectedUser` is. So React kept reusing the same instance, `draft` and all, when the user changed.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [1],
            "description": "`key={selectedUser.id}` folds the user's identity into the component's identity. When `selectedUser.id` goes from `1` to `2`, React sees a *different* key at this position — not the same Editor with new props, but conceptually a new component. It's not a coincidence that keys and identity share a name; the key literally participates in what makes two renders the same instance or not.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [1],
            "description": "React discards the old instance (and its stale `draft` state) and mounts a fresh `Editor`, which re-initializes `draft` from the new `user.name`. This is a deliberate, controlled reset — the same mechanism list keys use to track identity across reorders, just intentionally pointed at \"reset this subtree when X changes\" instead.",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Same key at the same position always means \"same instance\"",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// List reorder — React tracks identity BY KEY, not by array index\n// Before: [{id: 'a'}, {id: 'b'}, {id: 'c'}]\n// After a sort: [{id: 'c'}, {id: 'a'}, {id: 'b'}]\n\nitems.map(item => <Row key={item.id} data={item} />)",
            "steps": [
              {
                "highlightLines": [5],
                "description": "When the array reorders, React matches old instances to new ones by key, not by position. `key=\"a\"` is still the same `Row` instance it always was — its local state (an open dropdown, a hover flag) moves with it to its new slot, instead of getting scrambled the way index-based keys would scramble it."
              }
            ]
          }
        },
        {
          "title": "A missing key isn't just a console warning",
          "type": "misconception",
          "walkthrough": {
            "code": "// Using array index as key:\nitems.map((item, index) => <Row key={index} data={item} />)\n\n// After deleting items[0]:\n// Row that WAS at index 1 is now index 0 —\n// React thinks it's the SAME instance as the old index-0 Row",
            "steps": [
              {
                "highlightLines": [2],
                "description": "The console warning about missing/index keys is not just style nagging — index-based keys actively lie about identity whenever the list reorders, filters, or has items inserted/removed anywhere but the end."
              },
              {
                "highlightLines": [4, 5, 6],
                "description": "After a deletion shifts everything up by one, the item now at index 0 gets matched to whatever *used to* have key `0` — even though it's conceptually a completely different row. Any local state that row was holding (an expanded panel, a text draft) now appears to belong to the wrong item. Always derive keys from the data itself (an id), never from array position, unless the list is provably static and never reorders."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "pure-rendering",
      "title": "Render Purity",
      "content": "\n# Render Purity\n\n### What is it?\nRendering a component should be a **pure calculation**: given the same props, state, and context, it returns the same JSX, with no side effects that reach outside the function — no mutating variables declared elsewhere, no writing to the DOM directly, no kicking off network requests.\n\n### Why do we need it?\nReact does not guarantee it calls your component function exactly once per user-visible update. In development, Strict Mode deliberately double-invokes component functions to surface impurities. Under concurrent rendering, React can start rendering a component, pause it, discard the attempt entirely, or render it more than once before committing anything to the screen. A pure calculation tolerates all of that safely. A mutation does not: a write to some external variable happens even for a render that gets thrown away and never shown to the user.\n\n### How?\nKeep every value the user actually sees driven by `useState` (or props derived from it), computed fresh during render. If a side effect is needed — logging, subscribing to something external, reading `document` — that work belongs in an event handler (in direct response to something the user did) or a `useEffect` (for synchronization with something outside React), never inline in the render body itself.\n\n### Syntax/Example\n```jsx\n// Mutates a variable outside the render, during render\nlet renders = 0;\nfunction ImpureApp() {\n  renders += 1;\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;\n}\n\n// Pure — nothing escapes this render's own return value\nfunction PureApp() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;\n}\n```\n\n### Common Pitfalls & Gotchas\n1. **\"It worked when I tested it.\"** Impure render code often works in the simplest cases, because React frequently does call a component exactly once per commit — the bug hides until Strict Mode, a Suspense retry, or a concurrent feature changes that assumption, often intermittently and hard to reproduce.\n2. **Module-level caching \"for performance.\"** Writing computed results into a variable declared outside the component is a mutation during render, even if the intent is just memoization — reach for `useMemo` instead, which is designed to be safe under repeated or discarded renders.\n3. **Wanting a render counter for debugging.** A module-level counter mutated in the render body over-counts under Strict Mode's double-invoke; a `useRef` mutated in the render body is the closer-to-sanctioned version, since it's scoped to the component instance.\n\n### Challenge and Solution\n**Challenge:** A module-level `renders` variable is mutated directly in the render body to display a render count. Remove it and rely only on React state for the user-visible count.\n\n**Solution:** Delete the module-level counter and its mutation; keep `count` in `useState` and derive everything the button displays from that.\n\n### Hints\n* If a render can be called more than once, paused, or discarded, anything it mutates outside itself is at risk of running when the user never sees the result.\n* Side effects belong in event handlers or `useEffect` — never inline in the function body that produces JSX.\n\n\n### Example\n```jsx\nimport { useState } from 'react';\n\nconst guests = ['Ada', 'Linus', 'Grace'];\n\nexport default function GuestList() {\n  const [showAll, setShowAll] = useState(false);\n\n  // Pure: derives a new array and never touches `guests`.\n  const visible = showAll ? guests : guests.slice(0, 1);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <ul>\n        {visible.map(name => <li key={name}>{name}</li>)}\n      </ul>\n      <button onClick={() => setShowAll(v => !v)}>\n        {showAll ? 'Show fewer' : 'Show all'}\n      </button>\n      <p>The source list still has {guests.length} names.</p>\n    </div>\n  );\n}\n```\n",
      "starterCode": "import { useState } from 'react';\nlet renders = 0;\nexport default function App() {\n  const [count, setCount] = useState(0);\n  renders += 1;\n  return <button onClick={() => setCount(c => c + 1)}>Clicks: {count} / Renders: {renders}</button>;\n}",
      "solutionCode": "import { useState } from 'react';\nexport default function App() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c => c + 1)}>Clicks: {count}</button>;\n}",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\nconst guests = ['Ada', 'Linus', 'Grace'];\n\nexport default function GuestList() {\n  const [showAll, setShowAll] = useState(false);\n\n  // Pure: derives a new array and never touches `guests`.\n  const visible = showAll ? guests : guests.slice(0, 1);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <ul>\n        {visible.map(name => <li key={name}>{name}</li>)}\n      </ul>\n      <button onClick={() => setShowAll(v => !v)}>\n        {showAll ? 'Show fewer' : 'Show all'}\n      </button>\n      <p>The source list still has {guests.length} names.</p>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3,
              9
            ],
            "description": "`guests` lives outside the component, so it is not React's to reset between renders. `.slice(0, 1)` returns a **new** array and leaves the original alone.\n\nHad this line been `guests.length = 1` or `guests.reverse()`, rendering would have mutated state outside React — and the damage would persist after the render that caused it was long gone.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6,
              9
            ],
            "description": "That is the whole of render purity: given the same props and the same state, the function returns the same JSX and changes nothing outside itself.\n\nReact leans on this hard enough to check for it. In development, Strict Mode calls each component function twice per commit specifically to make impure renders visible — an impure one produces different results the second time, or does its damage twice.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              19
            ],
            "description": "React may also start rendering, throw the result away, and start again — that is what concurrent rendering means. A render that gets discarded still ran, so any mutation it performed still happened, with nothing on screen to explain it.\n\nLine 19 is the receipt: however many times this component renders, the source list is untouched.\n\nThe exact text output on the screen will be:\n`Ada`\n`[Button: Show all]`\n`The source list still has 3 names.`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "export default function App() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c => c + 1)}>Clicks: {count}</button>;\n}",
        "steps": [
          {
            "highlightLines": [1, 2, 3],
            "description": "The module-level `renders` variable and its `renders += 1` mutation are gone entirely. The only value the button displays now is `count`, which lives in `useState` and is scoped to this component instance.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [3],
            "description": "Nothing in this render reaches outside the function to mutate shared state. Call `App()` once, twice, or a hundred times with the same `count` — you get the identical JSX back every time, with zero side effects left behind. That's what makes it safe for React to call it as many times, in whatever order, as its internals need to.",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "\"But I just want a render counter for debugging\"",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ Mutates during render — unreliable under Strict Mode / concurrent rendering\nrenders += 1;\n\n// ✅ Track render count as a ref update — still not render-pure, but\n// refs are the sanctioned escape hatch and don't affect what gets returned\nconst renderCount = useRef(0);\nrenderCount.current += 1;",
            "steps": [
              {
                "highlightLines": [2],
                "description": "A module-level counter mutated in the render body will over-count under Strict Mode's double-invoke and can be wrong in other ways under concurrent rendering — it's counting function calls, not committed renders."
              },
              {
                "highlightLines": [5, 6],
                "description": "If you need a render counter for debugging, mutating a `useRef` in the render body is the closer-to-sanctioned version — it's still technically a side effect during render, which React explicitly tolerates for refs used this way, but it's scoped to the component instance and won't leak across renders/instances the way a module-level variable does. Either way, treat render-count tracking as a debugging tool, not production logic."
              }
            ]
          }
        },
        {
          "title": "Why \"it worked when I tested it\" isn't proof",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// In production, this mutation might \"work\" because React\n// usually calls render once per commit.\n\n// It silently breaks the moment you add:\n// - <StrictMode> (double-invoke in dev)\n// - a Suspense boundary that retries\n// - startTransition / concurrent features that can abandon a render",
            "steps": [
              {
                "highlightLines": [1, 2],
                "description": "Impure render code often \"works\" in the simplest cases because React frequently does call a component exactly once per commit — so the bug hides until conditions change."
              },
              {
                "highlightLines": [4, 5, 6, 7],
                "description": "The moment Strict Mode, Suspense retries, or concurrent rendering enters the picture, that assumption breaks — and it breaks silently, often only under specific timing that's hard to reproduce. This is why purity is treated as a hard rule rather than \"a good idea when convenient\": the bugs it prevents are exactly the intermittent, hard-to-reproduce kind."
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
            "highlightLines": [2],
            "description": "The `submitted` state and the `useEffect` that watched it are both gone. `console.log('submitted')` now runs directly inside `onClick` — exactly where the user's intent (\"I clicked submit\") is actually known.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [2],
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
                "highlightLines": [1, 2],
                "description": "A click, a form submit, a keypress — these are discrete moments where you know exactly why the code is running: because the user did something. Put the response directly at the source."
              },
              {
                "highlightLines": [4, 5, 6, 7],
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
                "highlightLines": [2],
                "description": "Routing a click through state-then-Effect isn't just \"more code for the same result\" — it's a genuinely different execution path. React has to commit a render where `submitted` is `true` before the Effect is even eligible to run, even though nothing about that render changed what's on screen."
              },
              {
                "highlightLines": [5],
                "description": "For a single console.log this render is invisible. For something more expensive — a component tree that's costly to reconcile, or an Effect with its own state updates chained after it — treating a click as an Effect trigger instead of handling it directly is a common, easy-to-miss source of extra re-renders."
              }
            ]
          }
        }
      ]
    }
  ]
};
