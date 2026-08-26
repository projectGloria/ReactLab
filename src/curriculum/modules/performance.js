export default {
  "id": "performance",
  "title": "Performance & Rendering",
  "lessons": [
    {
      "id": "reconciliation",
      "title": "Reconciliation",
      "content": "\n# Reconciliation & Fiber\n\n### What is it?\n**Reconciliation** is the process React uses to figure out what DOM nodes need to be updated when a component's state changes.\n\n> \ud83d\udca1 **Mental Model:** Think of reconciliation like a librarian re-shelving books after a room reorganization: if a book (element) is still the same type in roughly the same spot, the librarian just leaves it and updates the label — only when a spot holds a completely different type of book does the librarian pull it and put a new one in its place.\n\n### Why do we need it?\nBy default, when a parent component re-renders, **all of its children re-render too**—even if their props didn't change! Understanding this process is key to writing performant applications.\n\n### How?\nReact compares the React Elements returned by a render against the existing Fiber tree to compute the minimal DOM mutations. It operates in two phases: the **Render phase (Pure)** where it builds the new virtual DOM, and the **Commit phase (Mutating)** where it synchronously applies changes to the actual DOM.\n\n### Syntax/Example\n```jsx\n// This returns a list of items using a stable, unique ID\n// This causes React to efficiently re-order DOM nodes without\n// destroying and re-creating them when the array changes\n{items.map(item => (\n  <div key={item.id}>{item.name}</div>\n))}\n\n// Warning: Using the array index as a key causes React to\n// lose track of elements if they are deleted or re-ordered\n{items.map((item, index) => (\n  <div key={index}>{item.name}</div>\n))}\n```\n\n### Example\n```jsx\nimport { useState } from 'react';\n\nfunction Child() {\n  console.log('Child rendered');\n  return <p>I re-render whenever my parent does.</p>;\n}\n\nexport default function Parent() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <button onClick={() => setCount(c => c + 1)}>Update parent ({count})</button>\n      <Child />\n    </div>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** There is no bug to fix here! This is an experiment. Open the console. Type in the input box. Notice how *both* the App (parent) and the Child log a render on every single keystroke. Click \"Check Answer\" when you are done observing to move on.\n\n**Solution:** Just observe the behavior and click Check Answer. The exact text output on the screen when you type will be `App rendered!` followed by `Child rendered!` in the console.\n\n### Hints\n* **React 19:** React 19 makes rendering even faster, but the core rules of reconciliation remain the same.\n",
      "starterCode": "import { useState, useEffect, useRef } from 'react';\n\nfunction useRenderFlash(ref) {\n  useEffect(() => {\n    if (!ref.current) return;\n    const el = ref.current;\n    el.style.transition = 'none';\n    el.style.backgroundColor = 'rgba(74, 222, 128, 0.4)';\n    requestAnimationFrame(() => {\n      requestAnimationFrame(() => {\n        el.style.transition = 'background-color 0.8s ease';\n        el.style.backgroundColor = 'transparent';\n      });\n    });\n  });\n}\n\nfunction Child() {\n  const ref = useRef(null);\n  useRenderFlash(ref);\n  console.log(\"Child rendered!\");\n  return <div ref={ref} style={{ padding: 20, border: '2px solid blue', borderRadius: 8, margin: 10 }}>I am a child component</div>;\n}\n\nexport default function App() {\n  const [text, setText] = useState(\"\");\n  const ref = useRef(null);\n  useRenderFlash(ref);\n  console.log(\"App rendered!\");\n\n  return (\n    <div ref={ref} style={{ padding: 20, border: '2px solid red', borderRadius: 8 }}>\n      <h2>Parent Component</h2>\n      <input \n        value={text} \n        onChange={e => setText(e.target.value)} \n        placeholder=\"Type here...\" \n      />\n      <Child />\n    </div>\n  );\n}\n",
      "solutionCode": "import { useState, useEffect, useRef } from 'react';\n\nfunction useRenderFlash(ref) {\n  useEffect(() => {\n    if (!ref.current) return;\n    const el = ref.current;\n    el.style.transition = 'none';\n    el.style.backgroundColor = 'rgba(74, 222, 128, 0.4)';\n    requestAnimationFrame(() => {\n      requestAnimationFrame(() => {\n        el.style.transition = 'background-color 0.8s ease';\n        el.style.backgroundColor = 'transparent';\n      });\n    });\n  });\n}\n\nfunction Child() {\n  const ref = useRef(null);\n  useRenderFlash(ref);\n  console.log(\"Child rendered!\");\n  return <div ref={ref} style={{ padding: 20, border: '2px solid blue', borderRadius: 8, margin: 10 }}>I am a child component</div>;\n}\n\nexport default function App() {\n  const [text, setText] = useState(\"\");\n  const ref = useRef(null);\n  useRenderFlash(ref);\n  console.log(\"App rendered!\");\n\n  return (\n    <div ref={ref} style={{ padding: 20, border: '2px solid red', borderRadius: 8 }}>\n      <h2>Parent Component</h2>\n      <input \n        value={text} \n        onChange={e => setText(e.target.value)} \n        placeholder=\"Type here...\" \n      />\n      {/* The child renders because the parent rendered! This is normal. */}\n      <Child />\n    </div>\n  );\n}\n",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\nfunction Child() {\n  console.log('Child rendered');\n  return <p>I re-render whenever my parent does.</p>;\n}\n\nexport default function Parent() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <button onClick={() => setCount(c => c + 1)}>Update parent ({count})</button>\n      <Child />\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              9,
              13
            ],
            "description": "State lives in `Parent`. Clicking the button changes it, and React schedules a re-render of the component that owns it.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              14,
              4
            ],
            "description": "`Child` re-renders too, and the console line proves it — even though `Child` takes no props, reads no state, and cannot possibly produce different output.\n\nThat is the default and it is not a bug. React has no way to know a component's output is unchanged without calling it, so re-rendering a parent re-renders its entire subtree.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              12,
              15
            ],
            "description": "Re-rendering is not the same as touching the DOM. React builds a fresh element tree, compares it against the previous one, and applies only the differences — here, the single text node inside the button.\n\nThe `<p>` is not recreated, not repainted, and does not lose focus or scroll position. This is the step people mean by \"reconciliation\", and it is why a re-render usually costs far less than it sounds.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              3,
              5
            ],
            "description": "Which is the reason to measure before optimising. Wrapping `Child` in `memo` here would add a props comparison to save a function call that returns the same three-line result — a real cost buying a smaller one.\n\nThe exact text output on the screen will be:\n`[Button: Update parent (0)]`\n`I re-render whenever my parent does.`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "export default function App() {\n  const [text, setText] = useState(\"\");\n  console.log(\"App rendered!\");\n\n  return (\n    <div style={{ padding: 20, border: '2px solid red' }}>\n      <h2>Parent Component</h2>\n      <input \n        value={text} \n        onChange={e => setText(e.target.value)} \n        placeholder=\"Type here...\" \n      />\n      {/* The child renders because the parent rendered! This is normal. */}\n      <Child />\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              9
            ],
            "description": "Typing in the input updates the state, causing `App` to re-render.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              13
            ],
            "description": "Because `App` re-renders, `Child` also re-renders, even though it takes no props! This is the default behavior of React.\n\nThe exact text output on the screen will be:\n`Parent Component`\n`[Input: Type here...]`\n`I am a child component`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Is React's Virtual DOM actually fast?",
          "type": "misconception",
          "walkthrough": {
            "code": "const vdom1 = { type: 'div', props: { className: 'red' } };\nconst vdom2 = { type: 'div', props: { className: 'blue' } };",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2
                ],
                "description": "The Virtual DOM is actually pure overhead! React has to create thousands of these tiny objects in memory every time a state changes."
              },
              {
                "highlightLines": [
                  1,
                  2
                ],
                "description": "What makes React 'fast' is that it batches all DOM mutations together into one single highly-optimized browser update, avoiding the extreme cost of constant browser repaints."
              }
            ]
          }
        },
        {
          "title": "Why doesn't React just use `innerHTML`?",
          "type": "misconception",
          "walkthrough": {
            "code": "document.getElementById('root').innerHTML = newHTML;",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "If React just replaced the raw HTML string, you would instantly lose all input focus, text selection, and scroll positions across the entire app."
              },
              {
                "highlightLines": [
                  1
                ],
                "description": "The Virtual DOM Reconciliation process specifically ensures that only the exact changed text/nodes are touched, preserving the state of all other raw DOM elements."
              }
            ]
          }
        },
        {
          "title": "Why did my input lose focus?",
          "type": "misconception",
          "walkthrough": {
            "code": "function Parent() {\n  const CustomInput = () => <input />;\n  return <CustomInput />;\n}",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "If you define a component function inside another component, React sees a brand new function reference on every single render."
              },
              {
                "highlightLines": [
                  2
                ],
                "description": "React's reconciler assumes this is a completely different component type. It destroys the old `<input>` (losing focus) and mounts a new one every time the parent re-renders!"
              }
            ]
          }
        },
        {
          "title": "The O(n) Heuristic Rules of the React Reconciler",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Rule 1: Changing element type destroys and rebuilds the tree\n<div><Counter /></div> -> <span><Counter /></span> // Counter remounts!\n\n// Rule 2: Same element type at same position preserves state\n<div className=\"a\"><Counter /></div> -> <div className=\"b\"><Counter /></div> // State preserved!",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "General tree diffing is O(n³). React achieves lightning-fast O(n) speed by assuming different tag types represent different component trees."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "If the tag type is identical at the same position, React preserves the existing DOM node and component state, only updating changed attributes."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "reconciliation-rules",
      "title": "Reconciliation Rules & Key Remounts",
      "content": "\n# Reconciliation Rules & Key Remounts\n\n### What is it?\n**Building on reconciliation:** React preserves state when the same component stays at the same position in the tree, and completely destroys state when the component type changes or its `key` changes.\n\n> \ud83d\udca1 **Mental Model:** Think of the key as a name tag at a conference: even if everyone shuffles seats (list reorders), React can still recognize \\\"that's Sam\\\" by the name tag rather than by which chair they happen to be sitting in \u2014 lose the name tag (a stable key) and React starts treating everyone as a stranger it's never met.\n\n### Why do we need it?\nUnderstanding this lets you intentionally reset a component's internal state (like a form or video player) simply by changing its `key` prop, avoiding awkward manual `useEffect` state resetting!\n\n### How?\nPass a unique key (like `key={userId}`) to a component. Whenever `userId` changes, React unmounts the old component and mounts a clean, fresh instance with reset state.\n\n### Syntax/Example\n```jsx\n// Do not define components inside other components!\nfunction Parent() {\n  // BAD: Child is recreated every render, destroying its state\n  function Child() { return <div/>; }\n  \n  return <Child />;\n}\n```\n\n### Example\n```jsx\nimport { useState } from 'react';\n\nfunction Counter({ label }) {\n  const [n, setN] = useState(0);\n  return (\n    <button onClick={() => setN(n + 1)}>\n      {label}: {n}\n    </button>\n  );\n}\n\nexport default function App() {\n  const [userId, setUserId] = useState(1);\n  const [useKey, setUseKey] = useState(false);\n\n  return (\n    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>\n      <Counter key={useKey ? userId : 'fixed'} label={'User ' + userId} />\n      <button onClick={() => setUserId(id => (id === 1 ? 2 : 1))}>Switch user</button>\n      <label>\n        <input type=\"checkbox\" checked={useKey} onChange={e => setUseKey(e.target.checked)} />\n        Give it a key tied to userId\n      </label>\n    </div>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** \n1. Toggle the counter a few times after incrementing—notice how the count RESETS. This is the type-change rule.\n2. Observe that switching users does NOT reset the form (same type, same position—state is preserved).\n3. Fix this by adding `key={selectedUser}` to `<ProfileForm>` so switching users creates a fresh form.\n\n**Solution:** Add `key={selectedUser}` to `<ProfileForm user={selectedUser} />`.\n\n### Hints\n* Without the key, switching users would keep the same ProfileForm instance (same type, same position) and just re-render with new props—the user's typed name would persist across profiles.\n",
      "starterCode": "import { useState } from 'react';\n\nfunction CounterA() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c => c + 1)}>A: {count}</button>;\n}\n\nfunction CounterB() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c => c + 1)}>B: {count}</button>;\n}\n\nfunction ProfileForm({ user }) {\n  const [name, setName] = useState('');\n  return (\n    <div style={{ marginTop: 20, padding: 16, border: '1px solid #ccc' }}>\n      <p>Editing: <strong>{user}</strong></p>\n      <input value={name} onChange={e => setName(e.target.value)} placeholder=\"Full name\" />\n    </div>\n  );\n}\n\nexport default function App() {\n  const [showA, setShowA] = useState(true);\n  const [selectedUser, setSelectedUser] = useState('alice');\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Type-Switch Demo</h2>\n      <button onClick={() => setShowA(s => !s)}>Toggle Counter</button>\n      {showA ? <CounterA /> : <CounterB />}\n      <h2 style={{ marginTop: 20 }}>Key Remount Demo</h2>\n      <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>\n        <option value=\"alice\">Alice</option>\n        <option value=\"bob\">Bob</option>\n      </select>\n      {/* 👉 Add key={selectedUser} to ProfileForm */}\n      <ProfileForm user={selectedUser} />\n    </div>\n  );\n}",
      "solutionCode": "import { useState } from 'react';\n\nfunction CounterA() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c => c + 1)}>A: {count}</button>;\n}\n\nfunction CounterB() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c => c + 1)}>B: {count}</button>;\n}\n\nfunction ProfileForm({ user }) {\n  const [name, setName] = useState('');\n  return (\n    <div style={{ marginTop: 20, padding: 16, border: '1px solid #ccc' }}>\n      <p>Editing: <strong>{user}</strong></p>\n      <input value={name} onChange={e => setName(e.target.value)} placeholder=\"Full name\" />\n    </div>\n  );\n}\n\nexport default function App() {\n  const [showA, setShowA] = useState(true);\n  const [selectedUser, setSelectedUser] = useState('alice');\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Type-Switch Demo</h2>\n      <button onClick={() => setShowA(s => !s)}>Toggle Counter</button>\n      {showA ? <CounterA /> : <CounterB />}\n      <h2 style={{ marginTop: 20 }}>Key Remount Demo</h2>\n      <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>\n        <option value=\"alice\">Alice</option>\n        <option value=\"bob\">Bob</option>\n      </select>\n      <ProfileForm key={selectedUser} user={selectedUser} />\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\nfunction Counter({ label }) {\n  const [n, setN] = useState(0);\n  return (\n    <button onClick={() => setN(n + 1)}>\n      {label}: {n}\n    </button>\n  );\n}\n\nexport default function App() {\n  const [userId, setUserId] = useState(1);\n  const [useKey, setUseKey] = useState(false);\n\n  return (\n    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>\n      <Counter key={useKey ? userId : 'fixed'} label={'User ' + userId} />\n      <button onClick={() => setUserId(id => (id === 1 ? 2 : 1))}>Switch user</button>\n      <label>\n        <input type=\"checkbox\" checked={useKey} onChange={e => setUseKey(e.target.checked)} />\n        Give it a key tied to userId\n      </label>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              18,
              19
            ],
            "description": "Leave the checkbox unticked. Click the counter up to 3, then press **Switch user**.\n\nThe label changes to `User 2` and the count stays at 3. React saw the same component type at the same position with a constant key, so it updated the existing instance rather than creating a new one — and instances own their state.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              21,
              18
            ],
            "description": "Now tick the box. The key becomes `userId`, so switching users changes it, and React treats that as a different thing entirely: unmount the old `Counter`, mount a fresh one. The count resets to 0.\n\nThis is the deliberate use of `key` — not the list-rendering warning, but a way to say \"this is a new instance now\" at a single element.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              4
            ],
            "description": "Worth being precise about what a remount costs, because it is more than the number resetting. State is destroyed, every Effect's cleanup runs, the DOM nodes are thrown away and rebuilt, and focus inside the subtree is lost.\n\nThat makes a key on a large subtree an expensive instruction, and one whose expense is invisible in the diff.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7
            ],
            "description": "The two rules together: React keeps an instance when the **type and position** match, and a `key` overrides that judgement. A type change at the same position — `{flag ? <A /> : <B />}` — destroys state whether you wanted it to or not.\n\nThe exact text output on the screen will be:\n`[Button: User 1: 0]`\n`[Button: Switch user]`\n`[Checkbox] Give it a key tied to userId`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "export default function App() {\n  const [showA, setShowA] = useState(true);\n  const [selectedUser, setSelectedUser] = useState('alice');\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Type-Switch Demo</h2>\n      <button onClick={() => setShowA(s => !s)}>Toggle Counter</button>\n      {showA ? <CounterA /> : <CounterB />}\n      <h2 style={{ marginTop: 20 }}>Key Remount Demo</h2>\n      <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>\n        <option value=\"alice\">Alice</option>\n        <option value=\"bob\">Bob</option>\n      </select>\n      <ProfileForm key={selectedUser} user={selectedUser} />\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              8
            ],
            "description": "Toggling the counter swaps between `<CounterA>` and `<CounterB>`. Because they are different component types, React destroys their state when swapping.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              14
            ],
            "description": "We added `key={selectedUser}` to the ProfileForm. Now, when the selected user changes, React sees it as a completely new component and mounts a fresh form, resetting the internal text input state!\n\nThe exact text output on the screen will be:\n`Editing: alice` (and the input field resets when switched to bob)",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why did my component's state just vanish?",
          "type": "misconception",
          "walkthrough": {
            "code": "return (\n  <div>\n    {isEditing ? <ProfileEditor /> : <ProfileEditor />}\n  </div>\n);",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "If `isEditing` changes, you might expect the component to reset because you switched branches of the ternary. But it won't!"
              },
              {
                "highlightLines": [
                  3
                ],
                "description": "Because the component type `ProfileEditor` remained in the exact same position in the tree, React preserves its state. If you want it to reset, you must give them different `key` props!"
              }
            ]
          }
        },
        {
          "title": "The `key` remount trick",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Forcing a total reset\n<VideoPlayer key={videoUrl} src={videoUrl} />",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "Sometimes components (like complex video players or heavy data tables) get stuck in a weird internal state and you just want to totally reset them."
              },
              {
                "highlightLines": [
                  2
                ],
                "description": "By passing a dynamic variable to the `key` prop, you force React to completely destroy the old component and mount a fresh one the exact moment the key changes!"
              }
            ]
          }
        },
        {
          "title": "Can I use index as key if the list never changes?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "const staticMenu = ['Home', 'About', 'Contact'];\n\nstaticMenu.map((item, index) => <li key={index}>{item}</li>)",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "Yes! The strict rule against using array indices as keys only applies if the list can be re-ordered, filtered, added to, or deleted from."
              },
              {
                "highlightLines": [
                  1,
                  3
                ],
                "description": "If the list is perfectly static and the items will never shift their position in the array, using the index as a key is 100% safe and perfectly valid."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "react-memo",
      "title": "React.memo & useCallback",
      "content": "\n# React.memo & useCallback\n\n### What is it?\n**Building on component rendering, and on `useMemo` from the State Architecture module:** By default, whenever a parent component re-renders, all of its children re-render too. **`React.memo`** and **`useCallback`** allow us to break this cascade by skipping renders when props haven't changed.\n\n> \ud83d\udca1 **Mental Model:** Think of React.memo like a bouncer with a checklist: before letting a re-render happen, the bouncer compares the new props against the old ones \u2014 same list, no entry (skip the render); anything different, and it's let through.\n\n### Why do we need it?\nIn complex apps with heavy child components (charts, data tables, canvases), parent re-renders can cause UI lag. Wrapping children in `React.memo` ensures they only re-render if their props changed. However, passing new inline callbacks breaks `React.memo`—which is why we pair it with `useCallback` to keep function references stable!\n\n### How?\nWrap the component in `memo()`. Wrap callback props in `useCallback(fn, deps)`.\n\n### Syntax/Example\n```jsx\nimport { memo, useCallback } from 'react';\n\n// This returns a memoized version of the component\nconst ExpensiveChart = memo(function Chart({ data, onDelete }) {\n  return <div>{/* heavy rendering logic */}</div>;\n});\n```\n\n### Example\n```jsx\nimport { useState, memo, useCallback } from 'react';\n\nconst Child = memo(function Child({ count, onIncrement }) {\n  console.log('Child rendered!');\n  return (\n    <div style={{ padding: 12, border: '1px solid #555', marginTop: 10 }}>\n      <p>Child Count: {count}</p>\n      <button onClick={onIncrement}>Increment</button>\n    </div>\n  );\n});\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  const [text, setText] = useState('');\n\n  const handleIncrement = useCallback(() => {\n    setCount(c => c + 1);\n  }, []);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input\n        value={text}\n        onChange={e => setText(e.target.value)}\n        placeholder=\"Type to re-render parent...\"\n      />\n      <Child count={count} onIncrement={handleIncrement} />\n    </div>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** Typing in the input causes `ExpensiveChild` to re-render needlessly on every keystroke because `onDelete` receives a new function reference every render. Wrap `ExpensiveChild` in `memo(...)` and memoize `handleDelete` using `useCallback(...)` so `ExpensiveChild` only renders once.\n\n**Solution:** Wrap `function ExpensiveChild` with `const ExpensiveChild = memo(function ExpensiveChild({ onDelete }) { ... });` and wrap `handleDelete` with `const handleDelete = useCallback(() => { setItems([]); }, []);`.\n\n### Hints\n* `React.memo` does a shallow comparison of props. If any prop is a newly created function, `React.memo` thinks the prop changed! `useCallback` gives your function a stable identity across renders.\n",
      "starterCode": "import { useState, memo, useCallback, useEffect, useRef } from 'react';\n\nfunction useRenderFlash(ref) {\n  useEffect(() => {\n    if (!ref.current) return;\n    const el = ref.current;\n    el.style.transition = 'none';\n    el.style.backgroundColor = 'rgba(74, 222, 128, 0.4)';\n    requestAnimationFrame(() => {\n      requestAnimationFrame(() => {\n        el.style.transition = 'background-color 0.8s ease';\n        el.style.backgroundColor = 'transparent';\n      });\n    });\n  });\n}\n\n// 👉 1. Wrap ExpensiveChild using the memoization API\nfunction ExpensiveChild({ onDelete }) {\n  const ref = useRef(null);\n  useRenderFlash(ref);\n  console.log(\"ExpensiveChild rendered! 🐢\");\n  return (\n    <div ref={ref} style={{ padding: 20, border: '2px solid orange', marginTop: 10 }}>\n      <p>I am a very slow component!</p>\n      <button onClick={onDelete}>Delete Me</button>\n    </div>\n  );\n}\n\nexport default function App() {\n  const [text, setText] = useState(\"\");\n  const [items, setItems] = useState([1, 2, 3]);\n  const ref = useRef(null);\n  useRenderFlash(ref);\n\n  // 👉 2. Wrap this function using the appropriate hook so its reference stays stable\n  const handleDelete = () => {\n    setItems([]);\n  };\n\n  return (\n    <div ref={ref} style={{ padding: 20, border: '2px solid blue' }}>\n      <input \n        value={text} \n        onChange={e => setText(e.target.value)} \n        placeholder=\"Type here...\" \n      />\n      <ExpensiveChild onDelete={handleDelete} />\n    </div>\n  );\n}",
      "solutionCode": "import { useState, memo, useCallback, useEffect, useRef } from 'react';\n\nfunction useRenderFlash(ref) {\n  useEffect(() => {\n    if (!ref.current) return;\n    const el = ref.current;\n    el.style.transition = 'none';\n    el.style.backgroundColor = 'rgba(74, 222, 128, 0.4)';\n    requestAnimationFrame(() => {\n      requestAnimationFrame(() => {\n        el.style.transition = 'background-color 0.8s ease';\n        el.style.backgroundColor = 'transparent';\n      });\n    });\n  });\n}\n\nconst ExpensiveChild = memo(function ExpensiveChild({ onDelete }) {\n  const ref = useRef(null);\n  useRenderFlash(ref);\n  console.log(\"ExpensiveChild rendered! 🐢\");\n  return (\n    <div ref={ref} style={{ padding: 20, border: '2px solid orange', marginTop: 10 }}>\n      <p>I am a very slow component!</p>\n      <button onClick={onDelete}>Delete Me</button>\n    </div>\n  );\n});\n\nexport default function App() {\n  const [text, setText] = useState(\"\");\n  const [items, setItems] = useState([1, 2, 3]);\n  const ref = useRef(null);\n  useRenderFlash(ref);\n\n  const handleDelete = useCallback(() => {\n    setItems([]);\n  }, []);\n\n  return (\n    <div ref={ref} style={{ padding: 20, border: '2px solid blue' }}>\n      <input \n        value={text} \n        onChange={e => setText(e.target.value)} \n        placeholder=\"Type here...\" \n      />\n      <ExpensiveChild onDelete={handleDelete} />\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useState, memo, useCallback } from 'react';\n\nconst Child = memo(function Child({ count, onIncrement }) {\n  console.log('Child rendered!');\n  return (\n    <div style={{ padding: 12, border: '1px solid #555', marginTop: 10 }}>\n      <p>Child Count: {count}</p>\n      <button onClick={onIncrement}>Increment</button>\n    </div>\n  );\n});\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  const [text, setText] = useState('');\n\n  const handleIncrement = useCallback(() => {\n    setCount(c => c + 1);\n  }, []);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input\n        value={text}\n        onChange={e => setText(e.target.value)}\n        placeholder=\"Type to re-render parent...\"\n      />\n      <Child count={count} onIncrement={handleIncrement} />\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3,
              11
            ],
            "description": "`memo` wraps a component so React can skip calling it when its props are shallowly equal to last time. Without it, `Child` would re-render on every keystroke in the parent.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              15,
              23
            ],
            "description": "Typing updates `text`, so `App` re-renders. Nothing `Child` receives has changed — `count` is the same number — but `App` re-running means `Child`'s props are recreated from scratch.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              17,
              19
            ],
            "description": "Which is where `useCallback` earns its place. Without it, `handleIncrement` would be a new function on every render, and a new function is a changed prop, and a changed prop defeats `memo` completely.\n\nThe two are a pair. `memo` on the child with an unmemoized callback from the parent is the most common way this optimisation quietly does nothing.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              28,
              4
            ],
            "description": "So `memo` compares: same `count`, same `onIncrement` reference, and it skips the render. Type into the input and the console stays quiet.\n\nOne caveat worth carrying: the React Compiler memoizes this automatically, which makes hand-written `memo`/`useCallback` pairs increasingly something you read in existing code rather than write. Understand the mechanism; reach for it only when a profile says to.\n\nThe exact text output on the screen will be:\n`[Input: Type to re-render parent...]`\n`Child Count: 0`\n`[Button: Increment]`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "const ExpensiveChild = memo(function ExpensiveChild({ onDelete }) {\n  console.log(\"ExpensiveChild rendered! 👉\");\n  return (\n    <div style={{ padding: 20, border: '2px solid orange', marginTop: 10 }}>\n      <p>I am a very slow component!</p>\n      <button onClick={onDelete}>Delete Me</button>\n    </div>\n  );\n});\n\nexport default function App() {\n  const [text, setText] = useState(\"\");\n  const [items, setItems] = useState([1, 2, 3]);\n\n  const handleDelete = useCallback(() => {\n    setItems([]);\n  }, []);\n\n  return (\n    <div style={{ padding: 20, border: '2px solid blue' }}>\n      <input \n        value={text} \n        onChange={e => setText(e.target.value)} \n        placeholder=\"Type here...\" \n      />\n      <ExpensiveChild onDelete={handleDelete} />\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              1,
              9
            ],
            "description": "We wrapped `ExpensiveChild` with `memo()`. Now it will only re-render if its `onDelete` prop changes.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              15,
              17
            ],
            "description": "By wrapping `handleDelete` in `useCallback` with an empty dependency array, React caches the function. The reference stays the same across `App` re-renders.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              21,
              26
            ],
            "description": "When you type in the input, `App` re-renders, but `ExpensiveChild` does NOT! We've successfully broken the re-render chain.\n\nThe exact text output on the screen will be:\n`[Input: Type here...]`\n`I am a very slow component!`\n`[Button: Delete Me]`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Decision Rule: When to useMemo & useCallback",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// 🛑 RULE: Profile first, memoize second!\n\n// ✅ 1. Heavy computation (>1ms, 10,000 items)\nconst sorted = useMemo(() => heavySort(list), [list]);\n\n// ✅ 2. Prop passed to a React.memo() wrapped child\nconst handleClick = useCallback(() => deleteItem(id), [id]);\n<MemoizedChild onClick={handleClick} />\n\n// ❌ 3. Cheap math or normal un-memoized component? DO NOT WRAP!",
            "steps": [
              {
                "highlightLines": [
                  1,
                  4
                ],
                "description": "`useMemo` is strictly for: (1) Measurably heavy calculations, OR (2) Passing an object/array reference to a `React.memo` child or hook dependency."
              },
              {
                "highlightLines": [
                  7,
                  8
                ],
                "description": "`useCallback` is strictly for: Passing a function reference to a `React.memo` child or hook dependency array."
              },
              {
                "highlightLines": [
                  10
                ],
                "description": "If the child component is NOT wrapped in `React.memo()`, using `useCallback` on props is 100% wasted effort—the child re-renders regardless!"
              }
            ]
          }
        },
        {
          "title": "Why is `React.memo` doing nothing?",
          "type": "misconception",
          "walkthrough": {
            "code": "const HeavyGraph = React.memo(Graph);\n\n// This breaks memoization!\n<HeavyGraph data={[1, 2, 3]} />",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "`React.memo` only skips renders if the new props are strictly equal (`===`) to the old props."
              },
              {
                "highlightLines": [
                  4
                ],
                "description": "By passing a new inline array `[1, 2, 3]`, you create a brand new object in memory on every render. `React.memo` sees a new reference, assumes data changed, and re-renders anyway!"
              }
            ]
          }
        },
        {
          "title": "Should I wrap everything in `React.memo` by default?",
          "type": "misconception",
          "walkthrough": {
            "code": "const Button = React.memo(props => <button>{props.text}</button>);",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "No! Doing this is often worse for performance than doing nothing. React is incredibly fast at rendering simple components like buttons."
              },
              {
                "highlightLines": [
                  1
                ],
                "description": "The time it takes to run `React.memo`'s shallow comparison check on the props is often SLOWER than just letting React re-render the button!"
              }
            ]
          }
        },
        {
          "title": "How do I compare complex props in `React.memo`?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "const Chart = React.memo(HeavyChart, (prevProps, nextProps) => {\n  return prevProps.data.id === nextProps.data.id;\n});",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2,
                  3
                ],
                "description": "By default, `React.memo` does a shallow comparison (just checking if the object reference changed)."
              },
              {
                "highlightLines": [
                  1,
                  2
                ],
                "description": "But `React.memo` accepts an optional second argument: a custom comparison function! You can manually tell React exactly when the props are different enough to justify a re-render."
              }
            ]
          }
        },
        {
          "title": "The React Compiler: Will React.memo disappear?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// With the React 19 Compiler:\nfunction ProductCard({ product, onSelect }) {\n  // Automatically memoized at build time!\n  return <Card onClick={() => onSelect(product.id)}>{product.name}</Card>;\n}",
            "steps": [
              {
                "highlightLines": [
                  2,
                  4
                ],
                "description": "The React Compiler automatically memoizes component outputs and callback references at build time without needing manual `React.memo()` or `useCallback()` wrappers."
              },
              {
                "highlightLines": [
                  2
                ],
                "description": "However, the compiler relies strictly on the Rules of React (pure render functions, immutable props/state). Understanding manual memoization remains essential for profiling and working in existing codebases."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "code-splitting",
      "title": "Code Splitting",
      "content": "\n# Code Splitting & Suspense\n\n### What is it?\n**Building on bundle optimization:** Instead of forcing users to download the entire application's JavaScript bundle upfront before anything can render, **Code Splitting** lets you split your code into chunks loaded on demand.\n\n> \ud83d\udca1 **Mental Model:** Think of code splitting like packing for a trip in stages: you don't carry your winter coat through airport security if you're headed somewhere warm first \u2014 you grab it later, from storage, only once you actually need it.\n\n### Why do we need it?\nSending a massive JavaScript bundle to the browser all at once makes your app very slow to load initially. Splitting the bundle improves initial load time.\n\n### How?\nWe use **`React.lazy`** to dynamically import a component, and **`<Suspense>`** to show a fallback UI (like a spinner or loading text) while the code is downloading over the network.\n\n### Syntax/Example\n```jsx\nimport { lazy, Suspense } from 'react';\n\n// This causes the HeavyWidget component to be loaded\n// asynchronously (e.g. in a separate JavaScript chunk)\nconst HeavyWidget = lazy(() => import('./HeavyWidget'));\n\nfunction App() {\n  // This causes a fallback UI to display while\n  // HeavyWidget is downloading\n  return (\n    <Suspense fallback={<p>Loading widget...</p>}>\n      <HeavyWidget />\n    </Suspense>\n  );\n}\n```\n\n### Example\n```jsx\nimport { lazy, Suspense } from 'react';\n\nfunction Chart() {\n  return <div style={{ padding: 12, border: '1px solid #555' }}>A heavy chart.</div>;\n}\n\n// Stands in for `lazy(() => import('./Chart'))`: the same shape, but\n// resolvable in a single-file playground, and slow enough to see.\nconst HeavyChart = lazy(\n  () => new Promise(resolve => setTimeout(() => resolve({ default: Chart }), 1500))\n);\n\nexport default function Dashboard() {\n  return (\n    <div style={{ padding: 20 }}>\n      <Suspense fallback={<div>Loading chart...</div>}>\n        <HeavyChart />\n      </Suspense>\n    </div>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** We have a mocked `HeavyChart` component that takes 2 seconds to download. When you click \"Load Chart\", the app crashes because the component is suspended but there is no Suspense boundary to catch it! Wrap `<HeavyChart />` inside a `<Suspense fallback={...}>` boundary to show a loading message.\n\n**Solution:** Wrap `<HeavyChart data={[10, 20, 30]} />` in `<Suspense fallback={<div>Loading heavy chart...</div>}> ... </Suspense>`.\n\n### Hints\n* **Route-Based Code Splitting:** The most common use case is route-based splitting, where entire pages are lazy-loaded (`lazy(() => import('./pages/Home'))`). Each dynamic import creates a new chunk in your build output!\n",
      "starterCode": "import { useState, lazy, Suspense } from 'react';\n\n// Mocking a component that takes 2 seconds to download over the network\nconst HeavyChart = lazy(() => new Promise(resolve => {\n  setTimeout(() => resolve({ \n    default: () => <div style={{ padding: 20, background: 'yellow' }}>📊 Huge Chart Loaded!</div> \n  }), 2000);\n}));\n\nexport default function App() {\n  const [showChart, setShowChart] = useState(false);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Dashboard</h2>\n      <button onClick={() => setShowChart(true)}>Load Chart</button>\n      \n      <div style={{ marginTop: 20 }}>\n        {showChart && (\n          /* 👉 Wrap this HeavyChart in a boundary component for lazy loading! */\n          <HeavyChart data={[10, 20, 30]} />\n        )}\n      </div>\n    </div>\n  );\n}\n",
      "solutionCode": "import { useState, lazy, Suspense } from 'react';\n\nconst HeavyChart = lazy(() => new Promise(resolve => {\n  setTimeout(() => resolve({ \n    default: () => <div style={{ padding: 20, background: 'yellow' }}>📊 Huge Chart Loaded!</div> \n  }), 2000);\n}));\n\nexport default function App() {\n  const [showChart, setShowChart] = useState(false);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Dashboard</h2>\n      <button onClick={() => setShowChart(true)}>Load Chart</button>\n      \n      <div style={{ marginTop: 20 }}>\n        {showChart && (\n          <Suspense fallback={<div>Loading heavy chart...</div>}>\n            <HeavyChart />\n          </Suspense>\n        )}\n      </div>\n    </div>\n  );\n}\n",
      "exampleWalkthrough": {
        "code": "import { lazy, Suspense } from 'react';\n\nfunction Chart() {\n  return <div style={{ padding: 12, border: '1px solid #555' }}>A heavy chart.</div>;\n}\n\n// Stands in for `lazy(() => import('./Chart'))`: the same shape, but\n// resolvable in a single-file playground, and slow enough to see.\nconst HeavyChart = lazy(\n  () => new Promise(resolve => setTimeout(() => resolve({ default: Chart }), 1500))\n);\n\nexport default function Dashboard() {\n  return (\n    <div style={{ padding: 20 }}>\n      <Suspense fallback={<div>Loading chart...</div>}>\n        <HeavyChart />\n      </Suspense>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              9,
              10,
              11
            ],
            "description": "`lazy` takes a function that returns a Promise resolving to `{ default: Component }`. In a real app that function is `() => import('./Chart')`, and the bundler turns that dynamic import into a separate chunk that ships only when this line runs.\n\nThe Promise here resolves to the same shape after a delay, so the mechanism is identical and visible without a build step.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              17
            ],
            "description": "React tries to render `<HeavyChart />`, finds the component is not loaded, and **suspends** — the render stops here and React looks upward for a boundary that can handle it.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              16
            ],
            "description": "The nearest `<Suspense>` catches it and renders `fallback` instead. Everything outside the boundary renders normally and is interactive immediately.\n\nWhere the boundary goes is the real decision. Too high and half the page is replaced by a spinner; too low and the user gets a dozen separate ones. It should wrap the region that genuinely cannot be drawn yet.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              13,
              18
            ],
            "description": "When the Promise resolves, React swaps the fallback for the real component. Nothing above the boundary re-mounts.\n\nSplit along the seams where users actually diverge — a route they may never visit, a modal most people never open, an editor behind an admin toggle. Splitting a component every user needs on first paint just adds a round trip.\n\nThe exact text output on the screen will be:\n`Loading chart...`\n\nreplaced after 1.5 seconds by `A heavy chart.`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "export default function App() {\n  const [showChart, setShowChart] = useState(false);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Dashboard</h2>\n      <button onClick={() => setShowChart(true)}>Load Chart</button>\n      \n      <div style={{ marginTop: 20 }}>\n        {showChart && (\n          <Suspense fallback={<div>Loading heavy chart...</div>}>\n            <HeavyChart />\n          </Suspense>\n        )}\n      </div>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              11,
              13
            ],
            "description": "By wrapping the lazy-loaded `HeavyChart` component in `Suspense`, React knows what to show while the mock network request is pending.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7,
              12
            ],
            "description": "When you click 'Load Chart', the fallback \"Loading heavy chart...\" is rendered for 2 seconds. Once the promise resolves, the actual chart renders seamlessly!\n\nThe exact text output on the screen (after 2 seconds) will be:\n`📊 Huge Chart Loaded!`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Should I lazy load everything?",
          "type": "misconception",
          "walkthrough": {
            "code": "const Button = React.lazy(() => import('./Button'));",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "No! Lazy loading creates a network request. If you lazy load tiny components like Buttons, the network overhead will be vastly slower than just bundling it."
              },
              {
                "highlightLines": [
                  1
                ],
                "description": "Only lazy load massive components, heavy third-party libraries (like Chart.js), or entire route pages."
              }
            ]
          }
        },
        {
          "title": "Why did my lazy loaded component crash the app?",
          "type": "misconception",
          "walkthrough": {
            "code": "const Chart = lazy(() => import('./Chart'));\n\nreturn <Chart />; // Crashes instantly!",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "If you lazy load a component, it takes a few milliseconds to fetch the code over the network. React cannot render nothing."
              },
              {
                "highlightLines": [
                  3
                ],
                "description": "You MUST wrap the lazy component in a `<Suspense fallback={<Spinner />}>` boundary. If you forget, React immediately crashes the entire tree."
              }
            ]
          }
        },
        {
          "title": "Can I lazy load named exports?",
          "type": "misconception",
          "walkthrough": {
            "code": "// Cannot do this easily!\nconst { Modal } = React.lazy(() => import('./Components'));",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "`React.lazy` explicitly requires the promise to resolve to an object with a `default` property. It only supports default exports out of the box."
              },
              {
                "highlightLines": [
                  2
                ],
                "description": "To lazy load a named export, you have to write a weird wrapper promise: `lazy(() => import('./Comp').then(module => ({ default: module.Modal })))`."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "diagnostic-object-identity",
      "title": "Diagnostic: Object Identity",
      "content": "\n# Find the Bug: Object Identity Breaking Memo\n\n### What is it?\n**Building on object references and React.memo:** In JavaScript, two distinct objects with identical properties are not equal (`{} === {}` evaluates to `false`). Passing inline object or array literals to a `memo()`-wrapped component creates a new reference on every render, completely defeating memoization!\n\n> \ud83d\udca1 **Mental Model:** Think of object identity like two identical-looking keys cut at different hardware stores: they may open the same lock (same shape/values), but a strict `===` check is checking whether it's literally the same physical key, not just a matching one.\n\n### Why do we need it?\nObject identity is one of the most common pitfalls in React optimization. If you pass inline objects to a child wrapped in `React.memo`, the child will re-render on every parent update regardless.\n\n### How?\nUse `useMemo` to keep the object or array reference stable across re-renders.\n\n### Syntax/Example\n```jsx\n// This creates a NEW object reference on every render!\nconst config = { label: 'Settings', version: 1 };\n\n// Memo will fail because config !== previousConfig\n<ExpensiveChild config={config} />\n```\n\n### Example\n```jsx\nimport { memo, useState } from 'react';\n\nconst ExpensiveChild = memo(function ExpensiveChild({ config }) {\n  console.log('ExpensiveChild rendered');\n  return <p>Label: {config.label}</p>;\n});\n\nexport default function Parent() {\n  const [text, setText] = useState('');\n\n  // A brand-new object on every render, so memo never bails out.\n  const config = { label: 'Settings', version: 1 };\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input\n        value={text}\n        onChange={e => setText(e.target.value)}\n        placeholder=\"Type here and watch the console\"\n      />\n      <ExpensiveChild config={config} />\n    </div>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** Memo is applied but it's not working. Diagnose and fix without changing the ExpensiveChild component.\n\n**Solution:** Wrap `config` in `useMemo` with an empty dependency array: `const config = useMemo(() => ({ label: 'Settings', version: 1 }), []);`\n\n### Hints\n* Notice that `ExpensiveChild` logs \"ExpensiveChild rendered\" on every keystroke, even though it is wrapped in `memo`. This is because `config` is created anew on every render of `App`.\n",
      "starterCode": "import { useState, memo, useEffect, useRef } from 'react';\n\nfunction useRenderFlash(ref) {\n  useEffect(() => {\n    if (!ref.current) return;\n    const el = ref.current;\n    el.style.transition = 'none';\n    el.style.backgroundColor = 'rgba(74, 222, 128, 0.4)';\n    requestAnimationFrame(() => {\n      requestAnimationFrame(() => {\n        el.style.transition = 'background-color 0.8s ease';\n        el.style.backgroundColor = 'transparent';\n      });\n    });\n  });\n}\n\nconst ExpensiveChild = memo(function ExpensiveChild({ config }) {\n  const ref = useRef(null);\n  useRenderFlash(ref);\n  console.log('ExpensiveChild rendered');\n  return <div ref={ref} style={{ padding: 10, border: '2px solid orange', marginTop: 10 }}>{config.label}</div>;\n});\n\nexport default function App() {\n  const [text, setText] = useState('');\n  const config = { label: 'Settings', version: 1 };\n  const ref = useRef(null);\n  useRenderFlash(ref);\n\n  return (\n    <div ref={ref} style={{ padding: 20, border: '2px solid blue' }}>\n      <input value={text} onChange={e => setText(e.target.value)} />\n      <ExpensiveChild config={config} />\n    </div>\n  );\n}",
      "solutionCode": "import { useState, memo, useMemo, useEffect, useRef } from 'react';\n\nfunction useRenderFlash(ref) {\n  useEffect(() => {\n    if (!ref.current) return;\n    const el = ref.current;\n    el.style.transition = 'none';\n    el.style.backgroundColor = 'rgba(74, 222, 128, 0.4)';\n    requestAnimationFrame(() => {\n      requestAnimationFrame(() => {\n        el.style.transition = 'background-color 0.8s ease';\n        el.style.backgroundColor = 'transparent';\n      });\n    });\n  });\n}\n\nconst ExpensiveChild = memo(function ExpensiveChild({ config }) {\n  const ref = useRef(null);\n  useRenderFlash(ref);\n  console.log('ExpensiveChild rendered');\n  return <div ref={ref} style={{ padding: 10, border: '2px solid orange', marginTop: 10 }}>{config.label}</div>;\n});\n\nexport default function App() {\n  const [text, setText] = useState('');\n  const config = useMemo(() => ({ label: 'Settings', version: 1 }), []);\n  const ref = useRef(null);\n  useRenderFlash(ref);\n\n  return (\n    <div ref={ref} style={{ padding: 20, border: '2px solid blue' }}>\n      <input value={text} onChange={e => setText(e.target.value)} />\n      <ExpensiveChild config={config} />\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { memo, useState } from 'react';\n\nconst ExpensiveChild = memo(function ExpensiveChild({ config }) {\n  console.log('ExpensiveChild rendered');\n  return <p>Label: {config.label}</p>;\n});\n\nexport default function Parent() {\n  const [text, setText] = useState('');\n\n  // A brand-new object on every render, so memo never bails out.\n  const config = { label: 'Settings', version: 1 };\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input\n        value={text}\n        onChange={e => setText(e.target.value)}\n        placeholder=\"Type here and watch the console\"\n      />\n      <ExpensiveChild config={config} />\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3,
              4
            ],
            "description": "Type in the input and watch the console: `ExpensiveChild` logs on every keystroke, despite being wrapped in `memo`.\n\n`memo` compares props **shallowly** — `Object.is` on each one. For strings and numbers that does what you expect. For objects it compares references, not contents.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              12
            ],
            "description": "And here is the defect. This object literal is evaluated every time `Parent` renders, so `config` is a different object each time — same keys, same values, different reference.\n\n`{ label: 'Settings' } === { label: 'Settings' }` is `false`. It always has been; it is just easy to forget when the two objects look identical on screen.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              21
            ],
            "description": "So `memo` compares the previous `config` against the new one, gets `false`, and re-renders. The optimisation is not merely absent — it is now costing a comparison on every render and returning nothing.\n\nThe same trap catches inline arrays, inline object `style` props, and inline arrow functions passed as callbacks. Anything created during render is new every render.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              11,
              12
            ],
            "description": "Three ways out, in order of preference. Hoist it — this object depends on nothing, so it can live at module scope outside the component entirely. Or `useMemo(() => ({ ... }), [deps])` when it does depend on something. Or pass primitives instead: `<ExpensiveChild label=\"Settings\" version={1} />` sidesteps the question.\n\nAnd the diagnostic habit: when `memo` appears not to work, look at what is being passed, not at the memoized component.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "export default function App() {\n  const [text, setText] = useState('');\n  const config = useMemo(() => ({ label: 'Settings', version: 1 }), []);\n\n  return (\n    <>\n      <input value={text} onChange={e => setText(e.target.value)} />\n      <ExpensiveChild config={config} />\n    </>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3
            ],
            "description": "We wrapped the `config` object in `useMemo` with an empty dependency array. This guarantees the object reference will never change for the lifetime of `App`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              8
            ],
            "description": "We pass the stable `config` reference down. Now when you type in the input, `ExpensiveChild` stops rendering, as `React.memo` properly bails out!\n\nThe exact text output on the screen will be:\n`[Input]`\n`Settings`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "The empty object gotcha",
          "type": "misconception",
          "walkthrough": {
            "code": "function App() {\n  const config = { theme: 'dark' };\n  return <Child config={config} />\n}",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "Every time `App` renders, it executes line 2, allocating a brand new `{}` object in memory."
              },
              {
                "highlightLines": [
                  3
                ],
                "description": "Even though the contents are identical, `Child` will receive a new reference and re-render. Move static objects completely OUTSIDE the component function to fix this!"
              }
            ]
          }
        },
        {
          "title": "Can I just use `JSON.stringify` to compare objects?",
          "type": "misconception",
          "walkthrough": {
            "code": "useEffect(() => {\n  // Bad idea!\n}, [JSON.stringify(complexObject)]);",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "While stringifying an object inside a dependency array works to break reference identity, it is computationally terrible."
              },
              {
                "highlightLines": [
                  3
                ],
                "description": "`JSON.stringify` is extremely slow. Doing it on every render will cause massive frame drops. Instead, destructure primitive values: `[obj.id, obj.name]`."
              }
            ]
          }
        },
        {
          "title": "Why does Context cause unnecessary re-renders?",
          "type": "misconception",
          "walkthrough": {
            "code": "<ThemeContext.Provider value={{ theme, setTheme }}>\n  <App />\n</ThemeContext.Provider>",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "Passing an inline object `{{ theme, setTheme }}` into a provider creates a brand new object reference every single time the parent renders."
              },
              {
                "highlightLines": [
                  1
                ],
                "description": "This entirely destroys React's bailout mechanism. Every single child consuming the context will re-render violently. ALWAYS wrap context values in `useMemo`!"
              }
            ]
          }
        }
      ]
    }
  ]
};
