export default {
  "id": "modern-react",
  "title": "React 19.2",
  "description": "Understand current React APIs in architectural context rather than as isolated tricks.",
  "icon": "Sparkles",
  "lessons": [
    {
      "id": "effect-events",
      "title": "useEffectEvent: Separating Events from Effects",
      "content": "\n# useEffectEvent: Separating Events from Effects\n\n### What is it?\n`useEffectEvent` (React 19.2) creates an \"Effect Event\" — a function that behaves like an event handler smuggled inside an Effect. It's called from inside an Effect, always reads the *latest* props and state when it runs, but is not itself a reactive value the Effect needs to depend on.\n\n### Why do we need it?\nAn Effect sometimes needs to trigger event-like logic — a log line, a notification — that should see current values, without that logic forcing the Effect to re-synchronize every time those values change. Adding the value to the dependency array satisfies the lint rule, but couples two different kinds of reactivity together: the Effect's real synchronization contract (say, with `roomId`) gets re-triggered by a value (`theme`) that has nothing to do with what's actually being synchronized.\n\n### How?\nWrap the event-like logic in `useEffectEvent` instead of adding its inputs to the Effect's dependency array. The resulting function is called from inside the Effect but excluded from its dependencies — it always reads the current values of everything it references, without making the Effect reactive to them. This is not a general-purpose way to silence a dependency warning: the legitimate case is narrow — logic that's triggered *by* an Effect but conceptually belongs to a single moment in time, not to the Effect's ongoing synchronization.\n\n### Syntax/Example\n```javascript\nconst onConnected = useEffectEvent(() => console.log('connected', theme));\nuseEffect(() => {\n  console.log('connect', roomId);\n  onConnected();\n  return () => console.log('disconnect', roomId);\n}, [roomId]); // theme is read fresh, but isn't a dependency\n```\n\n### Common Pitfalls & Gotchas\n1. **Using it to silence a dependency warning that isn't understood.** If the honest answer to \"does this genuinely need to re-run when this value changes?\" is yes, it's a real dependency — `useEffectEvent` is for when the answer is no, but the latest value is still needed.\n2. **Calling an Effect Event during render.** Effect Events are meant to be called only from inside Effects (or other Effect Events) — that's the mechanism that lets them read fresh values without being reactive.\n3. **Passing an Effect Event down as a regular callback prop.** Treat the result as a private helper for the Effect that declared it, not a general-purpose function handed to children.\n\n### Challenge and Solution\n**Challenge:** Move a notification callback into `useEffectEvent` so changing theme does not force a room connection to reconnect.\n\n**Solution:** Create an Effect Event for the notification logic and keep the synchronization dependency, such as `roomId`, in the Effect.\n\n### Hints\n* Ask what the Effect is actually synchronizing with — only that belongs in its dependency array.\n* An Effect Event reads the latest value without becoming reactive to it; a normal dependency does both.\n\n\n### Example\n```jsx\nimport { useEffect, useEffectEvent, useState } from 'react';\n\nexport default function App() {\n  const [roomId, setRoomId] = useState('general');\n  const [theme, setTheme] = useState('light');\n\n  const onConnected = useEffectEvent(() => {\n    console.log('connected to', roomId, 'with theme', theme);\n  });\n\n  useEffect(() => {\n    console.log('connect', roomId);\n    onConnected();\n    return () => console.log('disconnect', roomId);\n  }, [roomId]);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <p>Room: {roomId}</p>\n      <p>Theme: {theme}</p>\n      <button onClick={() => setRoomId(r => r === 'general' ? 'random' : 'general')}>\n        Switch room (reconnects)\n      </button>\n      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>\n        Toggle theme (no reconnect)\n      </button>\n    </div>\n  );\n}\n```\n",
      "starterCode": "import { useEffect } from 'react';\nexport default function App({ roomId, theme }) {\n  useEffect(() => { console.log('connect', roomId, theme); }, [roomId, theme]);\n  return <p>{theme}</p>;\n}",
      "solutionCode": "import { useEffect, useEffectEvent } from 'react';\nexport default function App({ roomId, theme }) {\n  const onConnected = useEffectEvent(() => console.log('connected', theme));\n  useEffect(() => {\n    console.log('connect', roomId);\n    onConnected();\n    return () => console.log('disconnect', roomId);\n  }, [roomId]);\n  return <p>{theme}</p>;\n}",
      "exampleWalkthrough": {
        "code": "import { useEffect, useEffectEvent, useState } from 'react';\n\nexport default function App() {\n  const [roomId, setRoomId] = useState('general');\n  const [theme, setTheme] = useState('light');\n\n  const onConnected = useEffectEvent(() => {\n    console.log('connected to', roomId, 'with theme', theme);\n  });\n\n  useEffect(() => {\n    console.log('connect', roomId);\n    onConnected();\n    return () => console.log('disconnect', roomId);\n  }, [roomId]);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <p>Room: {roomId}</p>\n      <p>Theme: {theme}</p>\n      <button onClick={() => setRoomId(r => r === 'general' ? 'random' : 'general')}>\n        Switch room (reconnects)\n      </button>\n      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>\n        Toggle theme (no reconnect)\n      </button>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              15
            ],
            "description": "`[roomId]` states what this Effect actually synchronizes with: a connection to a room. Change the room and it must disconnect and reconnect; that is the whole of its contract.\n\nThe tempting wrong fix is `[roomId, theme]`. The linter goes quiet and the app now drops its connection every time somebody toggles the theme.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7,
              8,
              9
            ],
            "description": "`useEffectEvent` carves out the part that is event-like. `onConnected` reads the latest `roomId` and `theme` whenever it runs, but it is not itself a reactive value, so it does not belong in — and must not be added to — the dependency array.\n\nTwo kinds of reactivity were tangled together; this separates them.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              13
            ],
            "description": "It is called from inside the Effect, and only from there. That is the mechanism, not a style rule: reading fresh values without being reactive is only coherent at the moment an Effect fires.\n\nDo not call one during render, and do not pass one to a child as a callback prop. Treat it as a private helper belonging to the Effect that declared it.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              21,
              24
            ],
            "description": "Open the console and try both buttons. **Switch room** logs a disconnect and a reconnect; **Toggle theme** logs nothing, yet the next connection still reports the current theme.\n\nUse this narrowly. If the honest answer to \"should this Effect re-run when that value changes?\" is yes, it is a real dependency, and `useEffectEvent` is the wrong tool.\n\nThe exact text output on the screen will be:\n`Room: general`\n`Theme: light`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "const onConnected = useEffectEvent(() => console.log('connected', theme));\nuseEffect(() => {\n  console.log('connect', roomId);\n  onConnected();\n  return () => console.log('disconnect', roomId);\n}, [roomId]);",
        "steps": [
          {
            "highlightLines": [1],
            "description": "`onConnected` is declared with `useEffectEvent`, not a plain function. Even though it reads `theme` from the component's props, it is *not* a reactive value from the Effect's point of view — it always sees the latest `theme` when called, without needing to be listed as a dependency.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [2, 3, 4, 5, 6],
            "description": "The Effect's dependency array is back down to just `[roomId]` — its true synchronization dependency. The Effect now only reconnects when the room actually changes, exactly matching what it's synchronizing with.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [4],
            "description": "`onConnected()` is called from inside the Effect, right after the connection log. It behaves like an event handler smuggled into an Effect: it runs at a moment the Effect chooses, but always reads current props/state rather than a stale closure — the best of both worlds, without corrupting the Effect's dependency list.",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "useEffectEvent is not a silence-the-linter button",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ Wrong reason to reach for useEffectEvent:\n// \"I don't want to think about why the linter wants this dependency\"\n\n// ✅ Right reason:\n// \"This value should be read at the moment the Effect fires,\n//  but its changes shouldn't re-trigger the Effect's synchronization\"",
            "steps": [
              {
                "highlightLines": [1, 2, 3],
                "description": "If your instinct is \"this dependency warning is annoying, let me wrap it in useEffectEvent to make it go away,\" stop — that's the exact anti-pattern the React team built this hook specifically to prevent misusing `useEffect`'s escape hatches for."
              },
              {
                "highlightLines": [4, 5, 6],
                "description": "The legitimate case is narrow: event-like logic (a callback, a log, a notification) that's triggered *by* an Effect but conceptually belongs to a single moment in time, not to the ongoing synchronization the Effect performs. If in doubt, ask: \"does this genuinely need to re-run when this value changes?\" If yes, it's a real dependency. If no, but you still need the latest value, that's `useEffectEvent`."
              }
            ]
          }
        },
        {
          "title": "Effect Events can't be called during render or passed down as props",
          "type": "did-you-know",
          "walkthrough": {
            "code": "const onConnected = useEffectEvent(() => console.log(theme));\n\n// ✅ Call it from inside an Effect\nuseEffect(() => { onConnected(); }, [roomId]);\n\n// ❌ Don't call it during render, and don't pass it to a child\n// as if it were a regular callback prop",
            "steps": [
              {
                "highlightLines": [3, 4],
                "description": "Effect Events are meant to be called only from inside Effects (or other Effect Events) — that's the whole mechanism that lets them read fresh values without being reactive dependencies."
              },
              {
                "highlightLines": [6, 7],
                "description": "Calling one during render, or handing it to a child component as a generic prop, breaks the guarantee the hook is built on. Treat `useEffectEvent` results as private helpers for the Effect that declared them, not as general-purpose functions."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "activity",
      "title": "Activity: Keeping Hidden UI Ready",
      "content": "\n# `<Activity />`: Keeping Hidden UI Ready\n\n### What is it?\nReact 19.2 introduces `<Activity>`, a boundary with `visible` and `hidden` modes. A hidden Activity keeps its subtree's component instances and state alive while detaching it from the visible DOM, tearing down its Effects, and deprioritizing any pending work inside it.\n\n### Why do we need it?\nPlain conditional rendering fully unmounts the losing branch — its state is torn down, and switching back mounts a brand-new instance from scratch, losing whatever the user had in progress. That's fine for UI genuinely meant to reset, but wrong for tab-like UI a user is expected to revisit, where losing a draft or refetching data on every switch feels broken. CSS `display: none` solves the state-loss problem but overcorrects: everything stays fully mounted, so Effects — subscriptions, timers, connections — keep running invisibly, doing work for something nobody can see.\n\n### How?\nWrap each candidate view in its own `<Activity>` boundary and drive its `mode` from whichever one is currently selected. Both are always rendered in the tree; only the mode changes. When `mode=\"hidden\"`, React keeps the instance and its state, detaches its DOM from view, unmounts its Effects, and deprioritizes its updates so they don't compete with visible-tree work. Switching back to `mode=\"visible\"` re-attaches the same instance — never a new one — so local state is exactly where it was left.\n\n### Syntax/Example\n```jsx\nfunction Tabs({ tab }) {\n  return (\n    <>\n      <Activity mode={tab === 'one' ? 'visible' : 'hidden'}>\n        <Panel label=\"One\" />\n      </Activity>\n      <Activity mode={tab === 'two' ? 'visible' : 'hidden'}>\n        <Panel label=\"Two\" />\n      </Activity>\n    </>\n  );\n}\n```\n\n### Common Pitfalls & Gotchas\n1. **Treating Activity as `display: none` with extra steps.** `display: none` keeps Effects running in the background; hidden Activity tears them down while preserving state — a distinct third option, not a variant of either fully-mounted or fully-unmounted.\n2. **Reaching for it everywhere.** For UI a user rarely revisits, or where losing state on close is expected — a one-shot confirm dialog, a simple modal — plain conditional rendering is simpler with no real downside.\n3. **Expecting hidden content to keep doing background work.** Hidden Activity content unmounts its Effects specifically so it isn't running subscriptions or timers nobody can see — genuine background work needs a different tool.\n\n### Challenge and Solution\n**Challenge:** Replace conditional unmounting with Activity boundaries so switching tabs preserves each panel's local state.\n\n**Solution:** Render both panels in Activity boundaries and toggle their mode.\n\n### Hints\n* Activity earns its cost specifically for views a user is likely to revisit where remounting is expensive or lossy.\n* Hidden Activity content is mounted-with-state but Effect-free — neither \"fully on\" nor \"fully off.\"\n\n\n### Example\n```jsx\nimport { Activity, useState } from 'react';\n\nfunction Panel({ label }) {\n  const [text, setText] = useState('');\n  return (\n    <section style={{ padding: 12, border: '1px solid #ccc', marginTop: 8 }}>\n      <h2>{label}</h2>\n      <input value={text} onChange={e => setText(e.target.value)} placeholder=\"Type a draft...\" />\n    </section>\n  );\n}\n\nexport default function App() {\n  const [tab, setTab] = useState('one');\n  return (\n    <div style={{ padding: 20 }}>\n      <button onClick={() => setTab(tab === 'one' ? 'two' : 'one')}>Switch tab</button>\n      <Activity mode={tab === 'one' ? 'visible' : 'hidden'}>\n        <Panel label=\"Tab One\" />\n      </Activity>\n      <Activity mode={tab === 'two' ? 'visible' : 'hidden'}>\n        <Panel label=\"Tab Two\" />\n      </Activity>\n    </div>\n  );\n}\n```\n",
      "starterCode": "import { useState } from 'react';\nfunction Panel({ label }) { const [text, setText] = useState(''); return <section><h2>{label}</h2><input value={text} onChange={e => setText(e.target.value)} /></section>; }\nexport default function App() { const [tab,setTab]=useState('one'); return <><button onClick={()=>setTab(tab==='one'?'two':'one')}>Switch</button>{tab==='one'?<Panel label=\"One\"/>:<Panel label=\"Two\"/>}</>; }",
      "solutionCode": "import { Activity, useState } from 'react';\nfunction Panel({ label }) { const [text, setText] = useState(''); return <section><h2>{label}</h2><input value={text} onChange={e => setText(e.target.value)} /></section>; }\nexport default function App() { const [tab,setTab]=useState('one'); return <><button onClick={()=>setTab(tab==='one'?'two':'one')}>Switch</button><Activity mode={tab==='one'?'visible':'hidden'}><Panel label=\"One\"/></Activity><Activity mode={tab==='two'?'visible':'hidden'}><Panel label=\"Two\"/></Activity></>; }",
      "exampleWalkthrough": {
        "code": "import { Activity, useState } from 'react';\n\nfunction Panel({ label }) {\n  const [text, setText] = useState('');\n  return (\n    <section style={{ padding: 12, border: '1px solid #ccc', marginTop: 8 }}>\n      <h2>{label}</h2>\n      <input value={text} onChange={e => setText(e.target.value)} placeholder=\"Type a draft...\" />\n    </section>\n  );\n}\n\nexport default function App() {\n  const [tab, setTab] = useState('one');\n  return (\n    <div style={{ padding: 20 }}>\n      <button onClick={() => setTab(tab === 'one' ? 'two' : 'one')}>Switch tab</button>\n      <Activity mode={tab === 'one' ? 'visible' : 'hidden'}>\n        <Panel label=\"Tab One\" />\n      </Activity>\n      <Activity mode={tab === 'two' ? 'visible' : 'hidden'}>\n        <Panel label=\"Tab Two\" />\n      </Activity>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              18,
              20
            ],
            "description": "`<Activity mode=\"hidden\">` hides its children without unmounting them. The DOM is removed from view, but the component instances stay in the tree.\n\nCompare the usual `{tab === 'one' && <Panel />}`, which takes the losing branch out of the tree entirely.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              4,
              8
            ],
            "description": "Which is why the draft survives. Type into Tab One, switch away, switch back — the text is still there, because that `useState` was never torn down.\n\nWith conditional rendering the panel would have unmounted, the state would have been destroyed, and coming back would mount a brand-new instance starting from an empty string.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              21,
              23
            ],
            "description": "Both panels are mounted the whole time, which is the other half of what this buys: the hidden one has already fetched its data and prepared its DOM, so revealing it is instant rather than a fresh mount.\n\nEffects inside a hidden Activity are cleaned up while hidden and re-run when it becomes visible, so subscriptions and timers do not keep running in the background.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              17
            ],
            "description": "The choice is about intent. Unmounting is right when you *want* a reset — the `identity-and-keys` lesson uses exactly that on purpose. Activity is right when the user would be annoyed to lose what they had.\n\nThe cost is memory and initial work for UI nobody may look at, so it is a tool for a handful of tabs and panels, not for every conditional in an app.\n\nThe exact text output on the screen will be:\n`[Button: Switch tab]`\n`Tab One`\n`[Input: Type a draft...]`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "<Activity mode={tab==='one'?'visible':'hidden'}><Panel label=\"One\"/></Activity>\n<Activity mode={tab==='two'?'visible':'hidden'}><Panel label=\"Two\"/></Activity>",
        "steps": [
          {
            "highlightLines": [1, 2],
            "description": "Both panels are now always rendered — there's no more conditional that removes one from the tree. Each is wrapped in its own `<Activity>` boundary with a `mode` that tracks whether it's the selected tab.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [1],
            "description": "When `mode=\"hidden\"`, React keeps the subtree's component instances and their state alive, but detaches its DOM from view and deprioritizes any pending work inside it — it won't compete with visible-tree updates for the main thread. This is meaningfully different from just setting `display: none` on a normal render: hidden Activity content also unmounts its Effects (subscriptions, timers) while keeping state, so it's not doing background work you can't see either.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [1, 2],
            "description": "Switch `tab` back to `'one'`: its Activity flips to `mode=\"visible\"`, the same `Panel` instance re-attaches to the DOM, and whatever text the user had typed is exactly where they left it — because the component was never unmounted, only hidden.",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Activity is not just CSS display:none with extra steps",
          "type": "misconception",
          "walkthrough": {
            "code": "// display: none — component fully stays mounted, Effects keep running\n<div style={{ display: tab === 'one' ? 'block' : 'none' }}>\n  <Panel label=\"One\" />\n</div>\n\n// Activity mode=\"hidden\" — component stays mounted, but\n// its Effects are torn down and its updates are deprioritized",
            "steps": [
              {
                "highlightLines": [1, 2, 3, 4],
                "description": "Hiding with CSS keeps everything running exactly as if it were visible — Effects still fire, subscriptions stay open, timers keep ticking, even though the user can't see any of it. That's often wasted work, and sometimes actively wrong (a WebSocket connection you don't need while a tab is hidden)."
              },
              {
                "highlightLines": [6, 7],
                "description": "Hidden Activity content unmounts its Effects (so no wasted subscriptions/timers) while preserving component state (so no lost user input). It's a distinct third option, not a stylistic variant of either \"fully mounted\" or \"fully unmounted.\""
              }
            ]
          }
        },
        {
          "title": "When Activity is overkill",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Simple, rarely-revisited toggle — plain conditional rendering is fine\nisOpen && <ConfirmDialog />\n\n// Tab/panel UI the user switches between repeatedly,\n// where losing draft state or refetching data each time is costly\n<Activity mode={activeTab === 'settings' ? 'visible' : 'hidden'}>\n  <SettingsPanel />\n</Activity>",
            "steps": [
              {
                "highlightLines": [2],
                "description": "For UI the user rarely returns to, or where losing local state on close is expected (a confirm dialog, a one-shot modal), plain conditional rendering is simpler and has no downside worth avoiding."
              },
              {
                "highlightLines": [5, 6, 7],
                "description": "Activity earns its keep specifically for views a user is likely to revisit where remounting is expensive or lossy — tabs with unsaved drafts, panels with their own data fetching you don't want to repeat, or heavy component trees you'd rather keep warm than rebuild."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "react-compiler",
      "title": "React Compiler and Manual Memoization",
      "content": "\n# React Compiler and Manual Memoization\n\n### What is it?\nThe React Compiler performs automatic memoization in supported builds — analyzing a component and inserting the equivalent of `useMemo`, `useCallback`, and `memo` at build time, wherever it determines those would actually help.\n\n### Why do we need it?\nPre-Compiler advice often teaches defensive memoization everywhere: wrap every derived value in `useMemo`, every callback in `useCallback`, so that `React.memo` on child components actually pays off. That has a real cost — more hooks to read, a dependency array that has to be kept perfectly in sync by hand (get it wrong and the result is stale values, not just a missed optimization), and more code to review for components that are often cheap to re-render anyway. The Compiler automates the mechanical part of that work, but it doesn't replace the reasoning behind it.\n\n### How?\nWith the Compiler enabled and a component following the Rules of React — no mutating props/state during render, no calling hooks conditionally — write straightforward, declarative code and let the Compiler insert memoization automatically where it determines it helps. Manual memoization becomes something to add deliberately after measuring a real bottleneck, not a defensive default sprinkled over every value and callback. Understanding render causes, identity, and component boundaries remains necessary — the Compiler optimizes *how often* work re-runs, not *what causes* a re-render in the first place.\n\n### Syntax/Example\n```javascript\n// Pre-Compiler defensive style\nconst price = useMemo(() => formatPrice(product.price), [product.price]);\n```\n\n```javascript\n// Compiler-era style — same optimized output, less code to maintain\nconst price = formatPrice(product.price);\n```\n\n### Common Pitfalls & Gotchas\n1. **Assuming the Compiler removes the need to understand re-renders.** It automates *adding* memoization correctly; it doesn't explain *why* a subtree re-renders in the first place — that's still a skill worth having for real performance problems.\n2. **Breaking the Rules of React and expecting full optimization anyway.** A component that mutates props/state during render or calls hooks conditionally can cause the Compiler to skip optimizing it, or in rarer cases produce subtly incorrect memoization.\n3. **Memoizing cheap work out of habit.** `useMemo`'s own bookkeeping (comparing a dependency array, caching, retrieving a cached value) can cost more than a trivial calculation like string concatenation — measure before manually memoizing, even without the Compiler.\n\n### Challenge and Solution\n**Challenge:** This component breaks two Rules of React in its render body: it writes to a module-level counter, and it sorts a shared array in place. Both make the component unsafe for the Compiler to optimize, and the in-place sort visibly corrupts a second list that renders `PRODUCTS` in its original order. Make the render body pure without losing either feature.\n\n**Solution:** Move the commit counter into an Effect, where side effects belong, and sort a copy (`[...PRODUCTS].sort(...)` or `PRODUCTS.toSorted(...)`) so the shared array is never mutated. Deleting code is not the goal; keeping both behaviours while making the render body a pure calculation is.\n\n### Hints\n* Look at what the render body *writes to*, not just what it reads. Two statements here change something that outlives the current render.\n* `sort()` and `reverse()` operate in place and return the same array you called them on. That is why the \"Recently added\" list reorders itself. `[...array].sort()` and `array.toSorted()` do not.\n* Counting renders is a side effect, and React has a specific place for side effects. It is not the render body.\n* The Compiler cannot rescue an impure component. Purity is the entry fee for automatic memoization, not a bonus on top of it.\n\n\n### Example\n```jsx\nimport { useState } from 'react';\n\nconst PRODUCTS = [\n  { id: 'kb', name: 'Keyboard', price: 80 },\n  { id: 'mn', name: 'Monitor', price: 160 },\n  { id: 'ms', name: 'Mouse', price: 25 },\n];\n\nexport default function App() {\n  const [budget, setBudget] = useState(120);\n\n  // Copy first: sort() reorders in place, and the second list below\n  // reads the same array expecting its original order.\n  const cheapestFirst = [...PRODUCTS].sort((a, b) => a.price - b.price);\n  const affordable = cheapestFirst.filter((p) => p.price <= budget);\n\n  return (\n    <div style={{ padding: 16, fontFamily: 'system-ui' }}>\n      <h2>Shop (budget {budget})</h2>\n      <button onClick={() => setBudget((b) => b + 50)}>Raise budget</button>\n\n      <h3>Affordable, cheapest first</h3>\n      <ul>\n        {affordable.map((p) => <li key={p.id}>{p.name} - {p.price}</li>)}\n      </ul>\n\n      <h3>Recently added (original order)</h3>\n      <ol>\n        {PRODUCTS.map((p) => <li key={p.id}>{p.name}</li>)}\n      </ol>\n    </div>\n  );\n}\n```\n",
      "starterCode": "import { useState } from 'react';\n\n// Shared module data. Every render of every instance reads this same array.\nconst PRODUCTS = [\n  { id: 'kb', name: 'Keyboard', price: 80 },\n  { id: 'mn', name: 'Monitor', price: 160 },\n  { id: 'ms', name: 'Mouse', price: 25 },\n];\n\n// Module-level counter that the render body increments.\nlet renderCount = 0;\n\nexport default function App() {\n  const [budget, setBudget] = useState(120);\n\n  renderCount += 1;\n\n  // sort() sorts in place: it mutates PRODUCTS instead of returning a new array.\n  const cheapestFirst = PRODUCTS.sort((a, b) => a.price - b.price);\n  const affordable = cheapestFirst.filter((p) => p.price <= budget);\n\n  return (\n    <div style={{ padding: 16, fontFamily: 'system-ui' }}>\n      <h2>Shop (budget {budget})</h2>\n      <button onClick={() => setBudget((b) => b + 50)}>Raise budget</button>\n\n      <h3>Affordable, cheapest first</h3>\n      <ul>\n        {affordable.map((p) => <li key={p.id}>{p.name} - {p.price}</li>)}\n      </ul>\n\n      {/* This list never sorts anything. Watch what the render body above does to it. */}\n      <h3>Recently added (original order)</h3>\n      <ol>\n        {PRODUCTS.map((p) => <li key={p.id}>{p.name}</li>)}\n      </ol>\n    </div>\n  );\n}",
      "solutionCode": "import { useEffect, useState } from 'react';\n\n// Shared module data. Every render of every instance reads this same array.\nconst PRODUCTS = [\n  { id: 'kb', name: 'Keyboard', price: 80 },\n  { id: 'mn', name: 'Monitor', price: 160 },\n  { id: 'ms', name: 'Mouse', price: 25 },\n];\n\nlet renderCount = 0;\n\nexport default function App() {\n  const [budget, setBudget] = useState(120);\n\n  // Counting commits is a side effect, so it belongs in an Effect, not the render body.\n  useEffect(() => {\n    renderCount += 1;\n  });\n\n  // Sort a copy. PRODUCTS itself is never touched, so this render is pure.\n  const cheapestFirst = [...PRODUCTS].sort((a, b) => a.price - b.price);\n  const affordable = cheapestFirst.filter((p) => p.price <= budget);\n\n  return (\n    <div style={{ padding: 16, fontFamily: 'system-ui' }}>\n      <h2>Shop (budget {budget})</h2>\n      <button onClick={() => setBudget((b) => b + 50)}>Raise budget</button>\n\n      <h3>Affordable, cheapest first</h3>\n      <ul>\n        {affordable.map((p) => <li key={p.id}>{p.name} - {p.price}</li>)}\n      </ul>\n\n      {/* Stays in its authored order now, because nothing mutates PRODUCTS. */}\n      <h3>Recently added (original order)</h3>\n      <ol>\n        {PRODUCTS.map((p) => <li key={p.id}>{p.name}</li>)}\n      </ol>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\nconst PRODUCTS = [\n  { id: 'kb', name: 'Keyboard', price: 80 },\n  { id: 'mn', name: 'Monitor', price: 160 },\n  { id: 'ms', name: 'Mouse', price: 25 },\n];\n\nexport default function App() {\n  const [budget, setBudget] = useState(120);\n\n  // Copy first: sort() reorders in place, and the second list below\n  // reads the same array expecting its original order.\n  const cheapestFirst = [...PRODUCTS].sort((a, b) => a.price - b.price);\n  const affordable = cheapestFirst.filter((p) => p.price <= budget);\n\n  return (\n    <div style={{ padding: 16, fontFamily: 'system-ui' }}>\n      <h2>Shop (budget {budget})</h2>\n      <button onClick={() => setBudget((b) => b + 50)}>Raise budget</button>\n\n      <h3>Affordable, cheapest first</h3>\n      <ul>\n        {affordable.map((p) => <li key={p.id}>{p.name} - {p.price}</li>)}\n      </ul>\n\n      <h3>Recently added (original order)</h3>\n      <ol>\n        {PRODUCTS.map((p) => <li key={p.id}>{p.name}</li>)}\n      </ol>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              14
            ],
            "description": "`[...PRODUCTS]` before `.sort()` is the whole lesson in one line. `sort` is not a transformation that returns a new array — it reorders the array you called it on, in place, and returns that same array.\n\nSo `PRODUCTS.sort(...)` would rewrite a module-level constant during a render.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              28
            ],
            "description": "And here is where that would surface, nowhere near the line that caused it. This list reads `PRODUCTS` directly to show insertion order. Its author never sorted anything; it would simply start rendering in price order one day, because a different part of the component mutated the array they share.\n\nBugs from impure renders are almost always shaped like this: the damage appears somewhere that looks innocent.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              15,
              23
            ],
            "description": "Both `cheapestFirst` and `affordable` are ordinary derived values, recomputed on every render. No `useMemo`, no `useCallback`, no `memo` anywhere.\n\nThat is the point of the Compiler: it inserts that memoization itself, at a granularity no one would maintain by hand, so the source stays as simple as the model says it should be.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              9,
              20
            ],
            "description": "But the contract is conditional. The Compiler memoizes automatically **only for components that follow the Rules of React** — pure renders, no mutation of anything the component did not create.\n\nA component that mutates during render gets skipped, and quietly: the code still works, it just never receives the optimization. So \"the Compiler will handle it\" is earned by writing pure components, not assumed.\n\nThe exact text output on the screen will be:\n`Shop (budget 120)`\n`[Button: Raise budget]`\n`Affordable, cheapest first`\n`Mouse - 25`\n`Keyboard - 80`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "useEffect(() => {\n  renderCount += 1;\n});\n\nconst cheapestFirst = [...PRODUCTS].sort((a, b) => a.price - b.price);\nconst affordable = cheapestFirst.filter((p) => p.price <= budget);",
        "steps": [
          {
            "highlightLines": [1, 2, 3],
            "description": "The counter was not deleted, it was moved to where side effects are actually allowed. An Effect with no dependency array runs after every commit, which is exactly what a render counter wants, and the render body is now free of the write.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [5],
            "description": "`[...PRODUCTS]` builds a fresh array first, so `sort()` reorders that throwaway copy instead of the shared module data. `PRODUCTS.toSorted((a, b) => a.price - b.price)` is the newer built-in that does the same job in one call. The \"Recently added\" list is stable again, because nothing reorders the array it reads.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [5, 6],
            "description": "Both values are still recomputed on every render, and that is correct: they are derived data, and deriving during render is the right category for them. What changed is that computing them no longer has side effects. This render body is now a pure function of props and state, which is precisely the shape the Compiler needs in order to memoize it for you.",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "The Compiler doesn't replace understanding *why* something re-renders",
          "type": "misconception",
          "walkthrough": {
            "code": "// The Compiler optimizes HOW OFTEN work re-runs.\n// It does not change WHAT causes a re-render in the first place:\n// - a parent re-rendering\n// - state or props changing\n// - context value changing\n\n// You still need to know these to debug a real performance problem.",
            "steps": [
              {
                "highlightLines": [1, 2, 3, 4, 5, 6],
                "description": "\"The Compiler makes memoization unnecessary\" oversells it. It automates the *mechanical* work of adding `useMemo`/`useCallback`/`memo` correctly — it doesn't remove the need to understand render causes, component boundaries, or why a subtree is re-rendering in the first place. Diagnosing \"why is this slow\" is still a skill; writing the fix by hand mostly isn't anymore."
              }
            ]
          }
        },
        {
          "title": "The Compiler requires following the Rules of React",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// ❌ Breaks Compiler assumptions — mutating props/state during render\nfunction Bad({ items }) {\n  items.push({ id: 'new' }); // Mutation during render!\n  return <List items={items} />;\n}\n\n// The Compiler can bail out of optimizing components\n// that violate purity, conditional hook calls, etc.",
            "steps": [
              {
                "highlightLines": [2, 3, 4],
                "description": "The Compiler's automatic memoization is only safe to apply because it assumes components are pure — the same rules the `pure-rendering` lesson covers (no mutating props/state/module variables during render, no conditional hook calls)."
              },
              {
                "highlightLines": [7, 8],
                "description": "A component that breaks these rules can cause the Compiler to skip optimizing it, or in rarer cases produce subtly incorrect memoization. Writing render-pure components isn't just a correctness rule anymore — it's also what unlocks the Compiler's automatic optimization for that component."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "modern-react-architecture",
      "title": "Modern React: Choose the Boundary First",
      "content": "\n# Modern React: Choose the Boundary First\n\n### What is it?\nAdvanced React skill is not memorizing every API — it's correctly classifying what kind of problem a piece of UI logic actually is before reaching for a specific hook. Most \"which hook should I use\" confusion resolves once the category is named correctly.\n\n### Why do we need it?\nStarting from \"which hook do I need\" turns architecture into trial and error, and tends to default to `useEffect` because it's the most flexible escape hatch available — not because it's the right tool for a given problem. A single feature can span several genuinely different categories at once, each with its own correct tool, and conflating them is where accidental complexity creeps in.\n\n### How?\nBefore writing code, classify each piece of logic against a small set of categories: a user event belongs in an event handler or Action; a value computable from existing data belongs in render as a derived value; ongoing synchronization with something outside React belongs in an Effect; remote data belongs in a server-state library or framework data layer; a mutation that should appear to succeed immediately pairs an Action with optimistic state; UI a user is likely to return to belongs behind an Activity boundary; and a server/client execution split belongs to framework or Server Component architecture. Once the category is named, the API choice is usually close to automatic.\n\n### Syntax/Example\n```javascript\n// A search-as-you-type feature — classify BEFORE picking an API:\n// 1. Typing itself             -> event (onChange)\n// 2. Filtering local data      -> render (derived value)\n// 3. Fetching server results   -> Effect or server-state library\n// 4. Loading spinner           -> render, driven by #3's state\n```\n\n### Common Pitfalls & Gotchas\n1. **Reaching for `useEffect` as a catch-all.** It's the most flexible hook available, which makes it tempting to use for problems — like derived values or direct event responses — that have a more specific, more correct tool.\n2. **Treating the loading spinner as its own decision.** It isn't — it's just rendering based on whatever state the actual data-fetching decision already produced.\n3. **Skipping classification for \"simple\" features.** Even a small feature can span multiple categories at once; naming each piece explicitly is what keeps a four-line feature from accidentally being built with one tool doing everyone's job.\n\n### Challenge and Solution\n**Challenge:** A task filter runs four Effects, and three of them are misclassified. Two keep derived data in state and sync it with Effects; a third routes a button click through a `pendingClear` flag so an Effect can perform the clear. The fourth genuinely synchronizes with something outside React. Classify each one, then refactor - the difficult part of this exercise is leaving the correct Effect alone.\n\n**Solution:** `visible` and `openCount` are derived values, so compute them during render and drop their state. Clearing the filter is an event, so the button's handler calls `setQuery('')` directly. Only `document.title` is real synchronization with an external system, so only that Effect survives.\n\n### Hints\n* Ask each Effect one question before touching it: is this responding to a user action (**event**), calculating something from state you already have (**render**), or keeping something outside React in step (**effect**)?\n* Two of these Effects exist only to call a state setter after some other state changed. That is the signature of derived data that should never have been state in the first place.\n* An Effect that opens with `if (!someFlag) return;` is usually an event handler in disguise. Ask what set the flag, and whether that code could have just done the work itself.\n* Deleting every Effect is the wrong answer. `document.title` is a real external system and that Effect is correctly classified, so leave it exactly as it is.\n\n\n### Example\n```jsx\nimport { useEffect, useState } from 'react';\n\nconst ALL_TASKS = [\n  { id: 1, title: 'Write migration', done: true },\n  { id: 2, title: 'Review PR', done: false },\n  { id: 3, title: 'Ship release', done: false },\n  { id: 4, title: 'Update changelog', done: true },\n];\n\nexport default function App() {\n  const [query, setQuery] = useState('');\n  const [tasks] = useState(ALL_TASKS);\n\n  const visible = tasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()));\n  const openCount = visible.filter((t) => !t.done).length;\n\n  function handleClear() {\n    setQuery('');\n  }\n\n  useEffect(() => {\n    document.title = openCount + ' open';\n  }, [openCount]);\n\n  return (\n    <div style={{ padding: 16, fontFamily: 'system-ui' }}>\n      <input\n        value={query}\n        onChange={(e) => setQuery(e.target.value)}\n        placeholder=\"Filter tasks\"\n      />\n      <button onClick={handleClear}>Clear</button>\n      <p>{openCount} open</p>\n      <ul>\n        {visible.map((t) => <li key={t.id}>{t.title}</li>)}\n      </ul>\n    </div>\n  );\n}\n```\n",
      "starterCode": "import { useEffect, useState } from 'react';\n\nconst ALL_TASKS = [\n  { id: 1, title: 'Write migration', done: true },\n  { id: 2, title: 'Review PR', done: false },\n  { id: 3, title: 'Ship release', done: false },\n  { id: 4, title: 'Update changelog', done: true },\n];\n\nexport default function App() {\n  const [query, setQuery] = useState('');\n  const [tasks] = useState(ALL_TASKS);\n\n  // Four Effects below. Exactly one of them is genuinely an Effect-shaped problem.\n  const [visible, setVisible] = useState(ALL_TASKS);\n  const [openCount, setOpenCount] = useState(0);\n  const [pendingClear, setPendingClear] = useState(false);\n\n  useEffect(() => {\n    setVisible(tasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase())));\n  }, [tasks, query]);\n\n  useEffect(() => {\n    setOpenCount(visible.filter((t) => !t.done).length);\n  }, [visible]);\n\n  useEffect(() => {\n    if (!pendingClear) return;\n    setQuery('');\n    setPendingClear(false);\n  }, [pendingClear]);\n\n  useEffect(() => {\n    document.title = openCount + ' open';\n  }, [openCount]);\n\n  return (\n    <div style={{ padding: 16, fontFamily: 'system-ui' }}>\n      <input\n        value={query}\n        onChange={(e) => setQuery(e.target.value)}\n        placeholder=\"Filter tasks\"\n      />\n      <button onClick={() => setPendingClear(true)}>Clear</button>\n      <p>{openCount} open</p>\n      <ul>\n        {visible.map((t) => <li key={t.id}>{t.title}</li>)}\n      </ul>\n    </div>\n  );\n}",
      "solutionCode": "import { useEffect, useState } from 'react';\n\nconst ALL_TASKS = [\n  { id: 1, title: 'Write migration', done: true },\n  { id: 2, title: 'Review PR', done: false },\n  { id: 3, title: 'Ship release', done: false },\n  { id: 4, title: 'Update changelog', done: true },\n];\n\nexport default function App() {\n  const [query, setQuery] = useState('');\n  const [tasks] = useState(ALL_TASKS);\n\n  // RENDER: both values are computable from state we already hold, so compute them.\n  const visible = tasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()));\n  const openCount = visible.filter((t) => !t.done).length;\n\n  // EVENT: the click already knows what it wants to do, so it does it here.\n  function handleClear() {\n    setQuery('');\n  }\n\n  // EFFECT: document.title lives outside React. This one was classified correctly.\n  useEffect(() => {\n    document.title = openCount + ' open';\n  }, [openCount]);\n\n  return (\n    <div style={{ padding: 16, fontFamily: 'system-ui' }}>\n      <input\n        value={query}\n        onChange={(e) => setQuery(e.target.value)}\n        placeholder=\"Filter tasks\"\n      />\n      <button onClick={handleClear}>Clear</button>\n      <p>{openCount} open</p>\n      <ul>\n        {visible.map((t) => <li key={t.id}>{t.title}</li>)}\n      </ul>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useEffect, useState } from 'react';\n\nconst ALL_TASKS = [\n  { id: 1, title: 'Write migration', done: true },\n  { id: 2, title: 'Review PR', done: false },\n  { id: 3, title: 'Ship release', done: false },\n  { id: 4, title: 'Update changelog', done: true },\n];\n\nexport default function App() {\n  const [query, setQuery] = useState('');\n  const [tasks] = useState(ALL_TASKS);\n\n  const visible = tasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()));\n  const openCount = visible.filter((t) => !t.done).length;\n\n  function handleClear() {\n    setQuery('');\n  }\n\n  useEffect(() => {\n    document.title = openCount + ' open';\n  }, [openCount]);\n\n  return (\n    <div style={{ padding: 16, fontFamily: 'system-ui' }}>\n      <input\n        value={query}\n        onChange={(e) => setQuery(e.target.value)}\n        placeholder=\"Filter tasks\"\n      />\n      <button onClick={handleClear}>Clear</button>\n      <p>{openCount} open</p>\n      <ul>\n        {visible.map((t) => <li key={t.id}>{t.title}</li>)}\n      </ul>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              11,
              12
            ],
            "description": "Start by counting what is genuinely state. `query` changes over time in response to the user and cannot be computed from anything else, so it qualifies. `tasks` is the data set.\n\nThat is the whole list. Everything else on screen is a consequence of these two.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              14,
              15
            ],
            "description": "`visible` and `openCount` are therefore **derived** — plain calculations in the render body, not state, and not Effects.\n\nAn earlier version of this component had an Effect computing `visible` and a second Effect computing `openCount` from the first. That chains: a keystroke renders, Effect one runs and sets state, that renders, Effect two runs and sets state, that renders again. Three renders and two intermediate frames where the count on screen disagrees with the list beside it.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              17,
              18,
              32
            ],
            "description": "Clearing the filter is an **event**. The click already knows what the user wants, so the handler does it.\n\nThe version worth recognising routed this through a `pendingClear` boolean and an Effect watching it — state invented purely to carry a message from a handler to an Effect that runs a render later. If a piece of state exists only to remember that something happened, the thing that happened should have done the work.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              21,
              22,
              23
            ],
            "description": "One Effect survives, and it is the one synchronizing with something outside React. `document.title` is not part of the rendered tree, nothing in the return statement can set it, and it has to track `openCount` no matter what caused that number to change.\n\nThat is the question to ask of every Effect: what outside React am I keeping in step with? No answer means it should not be an Effect.\n\nThe exact text output on the screen will be:\n`[Input: Filter tasks] [Button: Clear]`\n`2 open`\n\nfollowed by all four task titles.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "// RENDER: derived during render, no state and no Effect\nconst visible = tasks.filter((t) => t.title.includes(query));\nconst openCount = visible.filter((t) => !t.done).length;\n\n// EVENT: the handler performs the work directly\nfunction handleClear() {\n  setQuery('');\n}\n\n// EFFECT: the one real external synchronization\nuseEffect(() => {\n  document.title = openCount + ' open';\n}, [openCount]);",
        "steps": [
          {
            "highlightLines": [1, 2, 3],
            "description": "Two `useState` calls and two Effects collapsed into two ordinary `const` declarations. Because they are recalculated on every render, they can never be stale and can never disagree with `query` - the entire class of desynchronization bug disappears along with the state that made it possible.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [5, 6, 7, 8],
            "description": "The `pendingClear` flag is gone entirely. The click handler resets `query` directly, so the intent is carried out at the moment it is expressed rather than being encoded into state, rendered, and decoded on the other side. One render instead of two, and no flag to keep in sync.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [10, 11, 12, 13],
            "description": "The surviving Effect is untouched, and that is the point of the exercise. It reaches outside React to something React does not own, and it declares `[openCount]` so it re-syncs exactly when the value it mirrors changes.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [],
            "description": "Four Effects went in and one came out, but \"delete Effects\" was never the rule being applied. Each was classified first - render, render, event, synchronization - and the refactor simply followed from the category. Run that classification before writing code and the API choice stops being a guess.",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why \"which hook do I use\" is the wrong first question",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ Starting from the API: \"I need state that updates from the server...\n//     useState? useEffect? Some library? Let me try things until it works\"\n\n// ✅ Starting from the category: \"This is remote data with caching/\n//     retry/invalidation needs → that's server-state → React Query\"",
            "steps": [
              {
                "highlightLines": [1, 2, 3],
                "description": "Starting from \"which hook\" turns architecture into trial and error — you end up bolting `useEffect` onto everything because it's the most flexible escape hatch, not because it's the right tool for a given problem."
              },
              {
                "highlightLines": [4, 5],
                "description": "Starting from the category — what kind of problem is this, really? — narrows the API choice to (usually) exactly one reasonable option. This is the same discipline the `event-vs-effect` and `state-or-derived` lessons build individually; this lesson is about applying it as a first step, habitually, before writing any code."
              }
            ]
          }
        },
        {
          "title": "The seven categories, as a checklist",
          "type": "did-you-know",
          "walkthrough": {
            "code": "1. User event               → event handler or Action\n2. Derived value             → compute during render\n3. External synchronization  → Effect\n4. Remote data                → server-state or framework data layer\n5. Optimistic mutation        → Action + optimistic state\n6. Hidden UI likely to return → Activity\n7. Server/client execution    → framework / RSC architecture",
            "steps": [
              {
                "highlightLines": [1, 2, 3, 4, 5, 6, 7],
                "description": "This is the full classification list from this lesson's content, worth keeping as a mental checklist: when starting a new piece of UI logic, run down this list before opening the React docs for a specific hook. Most \"which hook should I use\" confusion resolves once the category is correctly named."
              }
            ]
          }
        }
      ]
    }
  ]
};
