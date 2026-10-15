export default {
  "id": "performance",
  "title": "Rendering & Performance",
  "description": "Understand rendering and identity, then measure and optimize deliberately.",
  "lessons": [
    {
      "id": "reconciliation",
      "title": "Reconciliation and Rendering",
      "content": "\n# Reconciliation & Fiber\n\n### What is it?\n**Reconciliation** is the process React uses to figure out what DOM nodes need to be updated when a component's state changes.\n\n> 💡 **Mental Model:** Think of reconciliation like a librarian re-shelving books after a room reorganization: if a book (element) is still the same type in roughly the same spot, the librarian just leaves it and updates the label — only when a spot holds a completely different type of book does the librarian pull it and put a new one in its place.\n\n### Why do we need it?\nBy default, when a parent component re-renders, **all of its children re-render too**—even if their props didn't change! Understanding this process is key to writing performant applications.\n\n### How?\nReact compares the React Elements returned by a render against the existing Fiber tree to compute the minimal DOM mutations. It operates in two phases: the **Render phase (Pure)** where it builds the new virtual DOM, and the **Commit phase (Mutating)** where it synchronously applies changes to the actual DOM.\n\n### Syntax/Example\n```jsx\n// This returns a list of items using a stable, unique ID\n// This causes React to efficiently re-order DOM nodes without\n// destroying and re-creating them when the array changes\n{items.map(item => (\n  <div key={item.id}>{item.name}</div>\n))}\n\n// Warning: Using the array index as a key causes React to\n// lose track of elements if they are deleted or re-ordered\n{items.map((item, index) => (\n  <div key={index}>{item.name}</div>\n))}\n```\n\n### Example\n```jsx\nimport { useState } from 'react';\n\nfunction Child() {\n  console.log('Child rendered');\n  return <p>I re-render whenever my parent does.</p>;\n}\n\nexport default function Parent() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <button onClick={() => setCount(c => c + 1)}>Update parent ({count})</button>\n      <Child />\n    </div>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** There is no bug to fix here! This is an experiment. Open the console. Type in the input box. Notice how *both* the App (parent) and the Child log a render on every single keystroke. Click \"Check Answer\" when you are done observing to move on.\n\n**Solution:** Just observe the behavior and click Check Answer. The exact text output on the screen when you type will be `App rendered!` followed by `Child rendered!` in the console.\n\n### Hints\n* **React 19:** React 19 makes rendering even faster, but the core rules of reconciliation remain the same.\n",
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
                "description": "What makes React fast enough is not the diffing itself — it is what the diffing lets React *avoid*. Reconciliation narrows a whole re-render down to the handful of attributes and text nodes that actually differ, and React batches the state updates behind a commit so the browser lays out and paints once rather than after every individual change.\n\nThe honest framing: the Virtual DOM buys you a declarative programming model at an acceptable cost, not raw speed over hand-written DOM updates."
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
      "id": "react-memo",
      "title": "memo, useCallback & Compiler-era Performance",
      "content": "\n# React.memo & useCallback\n\n### What is it?\n**Building on component rendering, and on `useMemo` from the State Architecture module:** By default, whenever a parent component re-renders, all of its children re-render too. **`React.memo`** and **`useCallback`** allow us to break this cascade by skipping renders when props haven't changed.\n\n> 💡 **Mental Model:** Think of React.memo like a bouncer with a checklist: before letting a re-render happen, the bouncer compares the new props against the old ones — same list, no entry (skip the render); anything different, and it's let through.\n\n### Why do we need it?\nIn complex apps with heavy child components (charts, data tables, canvases), parent re-renders can cause UI lag. Wrapping children in `React.memo` ensures they only re-render if their props changed. However, passing new inline callbacks breaks `React.memo`—which is why we pair it with `useCallback` to keep function references stable!\n\n### How?\nWrap the component in `memo()`. Wrap callback props in `useCallback(fn, deps)`.\n\n### Syntax/Example\n```jsx\nimport { memo, useCallback } from 'react';\n\n// This returns a memoized version of the component\nconst ExpensiveChart = memo(function Chart({ data, onDelete }) {\n  return <div>{/* heavy rendering logic */}</div>;\n});\n```\n\n### Example\n```jsx\nimport { useState, memo, useCallback } from 'react';\n\nconst Child = memo(function Child({ count, onIncrement }) {\n  console.log('Child rendered!');\n  return (\n    <div style={{ padding: 12, border: '1px solid #555', marginTop: 10 }}>\n      <p>Child Count: {count}</p>\n      <button onClick={onIncrement}>Increment</button>\n    </div>\n  );\n});\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  const [text, setText] = useState('');\n\n  const handleIncrement = useCallback(() => {\n    setCount(c => c + 1);\n  }, []);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input\n        value={text}\n        onChange={e => setText(e.target.value)}\n        placeholder=\"Type to re-render parent...\"\n      />\n      <Child count={count} onIncrement={handleIncrement} />\n    </div>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** Typing in the input causes `ExpensiveChild` to re-render needlessly on every keystroke because `onDelete` receives a new function reference every render. Wrap `ExpensiveChild` in `memo(...)` and memoize `handleDelete` using `useCallback(...)` so `ExpensiveChild` only renders once.\n\n**Solution:** Wrap `function ExpensiveChild` with `const ExpensiveChild = memo(function ExpensiveChild({ onDelete }) { ... });` and wrap `handleDelete` with `const handleDelete = useCallback(() => { setItems([]); }, []);`.\n\n### Hints\n* `React.memo` does a shallow comparison of props. If any prop is a newly created function, `React.memo` thinks the prop changed! `useCallback` gives your function a stable identity across renders.\n",
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
            "code": "// With the React Compiler enabled in your build:\nfunction ProductCard({ product, onSelect }) {\n  // Memoized at build time, with no wrapper in the source\n  return <Card onClick={() => onSelect(product.id)}>{product.name}</Card>;\n}",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2,
                  4
                ],
                "description": "The React Compiler memoizes component outputs and callback references at build time, without manual `React.memo()` or `useCallback()` wrappers.\n\nNote the first line carefully: the Compiler is an **opt-in Babel plugin** you add to your build, not something React 19 ships with. On a project that has not enabled it, everything in this lesson still applies exactly as written."
              },
              {
                "highlightLines": [
                  2
                ],
                "description": "It also relies strictly on the Rules of React — pure render functions, immutable props and state. A component that breaks them is skipped rather than fixed. Understanding manual memoization stays essential for profiling, and for the very large amount of existing code that will never be compiled."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "diagnostic-object-identity",
      "title": "Diagnostic: Reference Identity",
      "content": "\n# Diagnostic: Reference Identity Breaking Memo\n\n### What is it?\n**Building on object references and React.memo:** In JavaScript, two distinct objects with identical properties are not equal (`{} === {}` evaluates to `false`). Passing inline object or array literals to a `memo()`-wrapped component creates a new reference on every render, completely defeating memoization!\n\n> 💡 **Mental Model:** Think of object identity like two identical-looking keys cut at different hardware stores: they may open the same lock (same shape/values), but a strict `===` check is checking whether it's literally the same physical key, not just a matching one.\n\n### Why do we need it?\nObject identity is one of the most common pitfalls in React optimization. If you pass inline objects to a child wrapped in `React.memo`, the child will re-render on every parent update regardless.\n\n### How?\nUse `useMemo` to keep the object or array reference stable across re-renders.\n\n### Syntax/Example\n```jsx\n// This creates a NEW object reference on every render!\nconst config = { label: 'Settings', version: 1 };\n\n// Memo will fail because config !== previousConfig\n<ExpensiveChild config={config} />\n```\n\n### Example\n```jsx\nimport { memo, useState } from 'react';\n\nconst ExpensiveChild = memo(function ExpensiveChild({ config }) {\n  console.log('ExpensiveChild rendered');\n  return <p>Label: {config.label}</p>;\n});\n\nexport default function Parent() {\n  const [text, setText] = useState('');\n\n  // A brand-new object on every render, so memo never bails out.\n  const config = { label: 'Settings', version: 1 };\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input\n        value={text}\n        onChange={e => setText(e.target.value)}\n        placeholder=\"Type here and watch the console\"\n      />\n      <ExpensiveChild config={config} />\n    </div>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** Memo is applied but it's not working. Diagnose and fix without changing the ExpensiveChild component.\n\n**Solution:** Wrap `config` in `useMemo` with an empty dependency array: `const config = useMemo(() => ({ label: 'Settings', version: 1 }), []);`\n\n### Hints\n* Notice that `ExpensiveChild` logs \"ExpensiveChild rendered\" on every keystroke, even though it is wrapped in `memo`. This is because `config` is created anew on every render of `App`.\n",
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
                "description": "Every component consuming that context then re-renders, even though the data inside the object is unchanged — only the wrapper moved. Memoize the value with `useMemo`, or split state and dispatch into separate contexts."
              }
            ]
          }
        },
        {
          "title": "The same bug, one module over: identity and Effect dependencies",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// This lesson: a new object defeats `memo` on a child\nconst config = { label: 'Settings' };\n<ExpensiveChild config={config} />\n\n// Same cause, different victim: a new object re-fires an Effect\nfunction Room({ roomId }) {\n  const options = { roomId };                  // new object every render\n  useEffect(() => {\n    connect(options);\n  }, [options]);                               // \"changed\" every render\n}\n\n// Usually the best fix is not useMemo — it is not needing the object outside:\nfunction Room({ roomId }) {\n  useEffect(() => {\n    const options = { roomId };\n    connect(options);\n  }, [roomId]);                                // a primitive, compared by value\n}",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2,
                  3
                ],
                "description": "`memo` compares props with `Object.is`. A dependency array compares entries with `Object.is`. They are the same comparison, so they have the same failure — and it is worth seeing both, because the symptoms look nothing alike.\n\nHere the symptom is \"memo does nothing\". Below it is \"my Effect fires constantly\"."
              },
              {
                "highlightLines": [
                  6,
                  7,
                  8,
                  9,
                  10
                ],
                "description": "An Effect depending on a freshly-built object re-runs on *every render of the component*, not when the data changes. If that Effect opens a socket or starts a fetch, you now tear down and rebuild a connection every time an unrelated piece of state moves.\n\nThe dependency array is present, correct-looking, and doing nothing at all."
              },
              {
                "highlightLines": [
                  13,
                  14,
                  15,
                  16,
                  17
                ],
                "description": "Reach for `useMemo` second, not first. Ask whether the object needs to exist outside the Effect at all — usually it does not, and constructing it inside means the dependency can be the primitive it was built from. Primitives compare by value, so the Effect re-runs exactly when the data genuinely changed.\n\n`useMemo` earns its cost only when the object must be stable *outside* one Effect: shared with a child, or read by two Effects."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "profiling-renders",
      "title": "Profiling Renders with React DevTools",
      "content": "\n# Profiling Renders with React DevTools\n\n### What is it?\nThe React DevTools **Profiler** records what actually rendered during an interaction, how long each component took, and — if you ask it to — *why* each one rendered. It is the instrument that turns \"the app feels slow\" into a component name and a reason.\n\n> 💡 **Mental Model:** Think of it like a receipt rather than a stopwatch. A stopwatch tells you the meal took forty minutes. The receipt breaks it down line by line, so you can see that thirty-five of those minutes were one dish nobody ordered.\n\n### Why do we need it?\nEvery performance lesson so far has ended with some version of \"measure first\" — and then not shown you how. That advice is unfalsifiable without a tool, and unfalsifiable advice is how codebases end up with `memo` on everything and no idea which of it helps.\n\nThe Profiler answers three questions guessing cannot: **which** components rendered, **how often**, and **why**. In practice the third is the one that solves the bug, and it is the one people never turn on.\n\n### How?\nInstall the React Developer Tools browser extension, open the **Profiler** tab, and before recording anything, open its settings (the gear) and tick **\"Record why each component rendered while profiling\"**. It is off by default and it is the entire point of the exercise.\n\nThen: press record, perform *one* interaction — a single keystroke, one click — and stop. A short recording of one action is readable. A ten-second recording of you clicking around is not.\n\n### Reading what comes back\n- **The flamegraph** shows one commit. Bar width is time *including children*, so a wide bar often means one expensive descendant, not an expensive component.\n- **The ranked chart** sorts that same commit by self-time, which is usually the faster way to find the actual cost.\n- **The commit list** across the top is how many times React committed during your one interaction. Ten commits for one keystroke is itself the finding.\n- **Hovering a component** shows \"Why did this render?\" — *Props changed: (onSelect)*, *Hook 1 changed*, *Parent rendered*. A prop listed as changed whose value looks identical is an identity problem, and the fix is in the parent.\n\n### The judgement the tool cannot make\nCost × frequency is what matters. A component that takes 40ms once on mount is fine. One that takes 2ms on every keystroke is not. The flamegraph shows you cost; only the commit count shows you frequency, and only you can decide whether the interaction felt wrong to begin with.\n\n### Challenge\n**Challenge:** There is nothing to fix here — this is an instrumented tree to practise reading. Open React DevTools, enable **\"Record why each component rendered\"**, record a single keystroke in the input, and work out from the recording (not from the source) which components rendered and which of them had no reason to. Then press \"I observed it\" and Check Answer.\n\nWhat you should find: typing re-renders `App`, and because `App` re-rendered, `Sidebar` and every `Row` re-render too — with the reason *Parent rendered* rather than any prop of their own changing. `Sidebar` displays nothing that changed. That is the shape of the problem; the fix is ownership, which the next lesson's rubric will ask you to defend.\n\n### Hints\n* The setting you need is off by default. Profiler tab → gear icon → **General** → \"Record why each component rendered while profiling\".\n* Record **one** interaction. The commit count for a single keystroke is a finding in itself.\n* \"Parent rendered\" is not a bug on its own — it is the default. It becomes a bug when the parent had no business re-rendering either.\n* The console markers in this example do the same job crudely. The Profiler tells you the same story with timings and without editing the source, which is why it scales.\n\n**Solution:**\nA single keystroke re-renders `App`, and with it `Sidebar` and all fifty `Row` components — every one of them for the reason *Parent rendered*, none because their own data changed. The input's state is owned too high: it lives in `App`, so every component under `App` pays for every character typed. Moving that state into the component that actually uses it, or splitting the input into its own component, fixes the cause. Reaching for `memo` on `Row` would only hide it.\n\n### Example\n```jsx\nimport { useState } from 'react';\n\nconst ROWS = Array.from({ length: 50 }, (_, i) => ({ id: i, label: `Row ${i}` }));\n\nfunction Row({ row }) {\n  console.log('render: Row', row.id);\n  return <li>{row.label}</li>;\n}\n\nfunction Sidebar() {\n  console.log('render: Sidebar');\n  return <aside style={{ padding: 8, border: '1px solid #555' }}>Nothing here changes.</aside>;\n}\n\nexport default function App() {\n  const [text, setText] = useState('');\n  console.log('render: App');\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input value={text} onChange={e => setText(e.target.value)} placeholder=\"Type one character\" />\n      <Sidebar />\n      <ul style={{ maxHeight: 120, overflow: 'auto' }}>\n        {ROWS.map(row => <Row key={row.id} row={row} />)}\n      </ul>\n    </div>\n  );\n}\n```\n",
      "starterCode": "import { useState } from 'react';\n\nconst ROWS = Array.from({ length: 50 }, (_, i) => ({ id: i, label: `Row ${i}` }));\n\nfunction Row({ row }) {\n  console.log('render: Row', row.id);\n  return <li>{row.label}</li>;\n}\n\nfunction Sidebar() {\n  console.log('render: Sidebar');\n  return <aside style={{ padding: 8, border: '1px solid #555' }}>Nothing here changes.</aside>;\n}\n\nexport default function App() {\n  const [text, setText] = useState('');\n  console.log('render: App');\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input value={text} onChange={e => setText(e.target.value)} placeholder=\"Type one character\" />\n      <Sidebar />\n      <ul style={{ maxHeight: 120, overflow: 'auto' }}>\n        {ROWS.map(row => <Row key={row.id} row={row} />)}\n      </ul>\n    </div>\n  );\n}",
      "solutionCode": "import { useState } from 'react';\n\nconst ROWS = Array.from({ length: 50 }, (_, i) => ({ id: i, label: `Row ${i}` }));\n\nfunction Row({ row }) {\n  console.log('render: Row', row.id);\n  return <li>{row.label}</li>;\n}\n\nfunction Sidebar() {\n  console.log('render: Sidebar');\n  return <aside style={{ padding: 8, border: '1px solid #555' }}>Nothing here changes.</aside>;\n}\n\n// The fix the Profiler points at: the input's state is owned by the smallest\n// component that uses it, so typing no longer re-renders the rows or the sidebar.\nfunction SearchBox() {\n  const [text, setText] = useState('');\n  console.log('render: SearchBox');\n  return <input value={text} onChange={e => setText(e.target.value)} placeholder=\"Type one character\" />;\n}\n\nexport default function App() {\n  console.log('render: App');\n\n  return (\n    <div style={{ padding: 20 }}>\n      <SearchBox />\n      <Sidebar />\n      <ul style={{ maxHeight: 120, overflow: 'auto' }}>\n        {ROWS.map(row => <Row key={row.id} row={row} />)}\n      </ul>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\nconst ROWS = Array.from({ length: 50 }, (_, i) => ({ id: i, label: `Row ${i}` }));\n\nfunction Row({ row }) {\n  console.log('render: Row', row.id);\n  return <li>{row.label}</li>;\n}\n\nfunction Sidebar() {\n  console.log('render: Sidebar');\n  return <aside style={{ padding: 8, border: '1px solid #555' }}>Nothing here changes.</aside>;\n}\n\nexport default function App() {\n  const [text, setText] = useState('');\n  console.log('render: App');\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input value={text} onChange={e => setText(e.target.value)} placeholder=\"Type one character\" />\n      <Sidebar />\n      <ul style={{ maxHeight: 120, overflow: 'auto' }}>\n        {ROWS.map(row => <Row key={row.id} row={row} />)}\n      </ul>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              16,
              21
            ],
            "description": "One piece of state, owned by `App`, driving one input. Nothing here looks wrong — this is how almost everyone writes a search box first.\n\nOpen the console and type a single character. Then count the lines.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6,
              11,
              17
            ],
            "description": "Fifty-two log lines per keystroke: `App`, `Sidebar`, and all fifty `Row`s.\n\n`Sidebar` renders literally constant markup. The rows render from `ROWS`, a module-level constant that cannot change. Neither has any reason to re-render, and both do, on every character.\n\nThe console markers make that countable. The Profiler makes it *attributable*, which is the difference.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              22,
              24
            ],
            "description": "Record one keystroke in the Profiler with \"why did this render\" enabled, and hover `Sidebar`. It says **Parent rendered** — not \"props changed\", because none did.\n\nThat phrase is the diagnosis. It means nothing about `Sidebar` is at fault; the question is why its parent rendered, and the answer is that the parent owns state the parent does not use.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              15,
              16
            ],
            "description": "So the fix is ownership, not memoization. Push `text` down into a `SearchBox` component and `App` stops re-rendering, which stops everything under it from re-rendering.\n\n`memo(Row)` would also stop the rows, at the cost of fifty prop comparisons per keystroke and a `memo` wrapper you now have to maintain — treating the symptom while the cause keeps firing. Measure, find the cause, fix the cause.\n\nThe exact text output on the screen will be:\n`[Input: Type one character]`\n`Nothing here changes.`\nfollowed by a scrollable list from `Row 0` to `Row 49`.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "function SearchBox() {\n  const [text, setText] = useState('');\n  console.log('render: SearchBox');\n  return <input value={text} onChange={e => setText(e.target.value)} placeholder=\"Type one character\" />;\n}\n\nexport default function App() {\n  console.log('render: App');\n  return (\n    <div style={{ padding: 20 }}>\n      <SearchBox />\n      <Sidebar />\n      <ul>{ROWS.map(row => <Row key={row.id} row={row} />)}</ul>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              1,
              2,
              4
            ],
            "description": "The state moves into the smallest component that actually reads it. `SearchBox` owns `text`, renders the input, and is the only thing a keystroke can affect.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7,
              8
            ],
            "description": "`App` now holds no state at all, so typing gives React no reason to call it. Everything below it — `Sidebar`, all fifty rows — is untouched.\n\nRe-record a keystroke and the commit contains one component instead of fifty-two.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              11,
              12,
              13
            ],
            "description": "Note what did *not* get added: no `memo`, no `useCallback`, no `useMemo`. The render was not made cheaper — it was made unnecessary, which is strictly better and one fewer thing to keep correct.\n\nThis is why \"profile first\" matters. The profile said *Parent rendered*, and that points at ownership. Guessing would have pointed at `memo`.",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Turn on \"why did this render\" — it is off by default",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// React DevTools -> Profiler tab -> gear icon -> General\n//   [x] Record why each component rendered while profiling\n\n// What you get when hovering a component afterwards:\n//   \"Props changed: (onSelect)\"   -> identity problem in the parent\n//   \"Hook 1 changed\"              -> its own state or context moved\n//   \"Parent rendered\"             -> nothing of its own changed at all",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2
                ],
                "description": "Without this box ticked the Profiler tells you *what* rendered and *how long* it took, which is the half of the story you can already guess. The reason is the half that finds the bug, and it costs one checkbox."
              },
              {
                "highlightLines": [
                  5,
                  6,
                  7
                ],
                "description": "Three answers, three different fixes. **Props changed** on a value that looks the same means the parent is rebuilding an object or function — fix the parent. **Hook changed** means its own state or a context it reads moved — that is usually legitimate. **Parent rendered** means look upward: this component is collateral damage."
              }
            ]
          }
        },
        {
          "title": "Record one interaction, not one session",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ Press record, use the app for 30 seconds, stop\n//    -> hundreds of commits, no idea which belong to what\n\n// ✅ Press record, type ONE character, stop\n//    -> a handful of commits you can read individually\n\n// The commit count for a single interaction is itself the finding:\n//    1 commit  per keystroke  -> normal\n//    3 commits per keystroke  -> something is chaining state updates",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2
                ],
                "description": "A long recording is unreadable. You cannot tell which commit came from which action, so you end up looking at the widest bar and optimising whatever happens to be under it."
              },
              {
                "highlightLines": [
                  4,
                  5,
                  7,
                  8,
                  9
                ],
                "description": "One action produces a commit list short enough to inspect commit by commit. And the count itself is diagnostic: several commits for one keystroke usually means an Effect is setting state in response to state — the feedback-loop shape from the Debugging module, showing up as a performance symptom."
              }
            ]
          }
        },
        {
          "title": "The Profiler measures development builds",
          "type": "misconception",
          "walkthrough": {
            "code": "// Development build: Strict Mode double-invokes, warnings run,\n// dev-only bookkeeping is included in every timing.\n\n// Production build: none of that.\n// Absolute numbers can be several times smaller.\n\n// What stays true in both: which components rendered, and why.",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2,
                  4,
                  5
                ],
                "description": "Treat the millisecond figures as relative, not absolute. Development React is deliberately slower, and Strict Mode's double-invoke inflates component timings on top of that. A 30ms bar in dev is not a 30ms bar for your users."
              },
              {
                "highlightLines": [
                  7
                ],
                "description": "The structural findings survive the difference. \"Fifty components re-render on every keystroke\" and \"this renders because its parent did\" are facts about your component tree, not about the build — which is exactly why the reason matters more than the timing."
              }
            ]
          }
        }
      ]
    }
  ]
};
