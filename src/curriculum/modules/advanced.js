export default {
  "id": "advanced",
  "title": "Suspense & Concurrency",
  "description": "Suspense boundaries, code splitting, and interruptible rendering.",
  "icon": "Sparkles",
  "lessons": [
    {
      "id": "suspense",
      "title": "Suspense for Data Fetching",
      "dependencies": {
        "@tanstack/react-query": "^5.0.0"
      },
      "content": "\n# Suspense for Data Fetching\n\n### What is it?\n**Building on asynchronous data fetching:** In modern React, **`<Suspense>`** decouples component render logic from loading spinners by pausing rendering until asynchronous promises resolve and rendering fallback UI in the interim.\n\n> 💡 **Mental Model:** Think of Suspense as a restaurant's \\\"your table isn't ready\\\" sign — instead of seating you at an empty table and making you stare at nothing, the host shows you a waiting area (the fallback) and seats you the moment the real table (the data) is ready.\n\n### Why do we need it?\nUsually, you have to write `if (isLoading) return <Spinner />` inside every single component that fetches data. This pollutes your UI logic with fallback states.\n\n### How?\nWhen you use a Suspense-enabled data fetcher (like TanStack Query's `useSuspenseQuery`), the component completely skips the `isLoading` check. If the data isn't ready yet, the component literally \"suspends\" its render and throws control up the tree to the nearest `<Suspense fallback={...}>` boundary. This allows you to decouple your loading UI from your actual components!\n\n### Syntax/Example\n```jsx\nimport { Suspense, lazy } from 'react';\n\nconst ProfileTimeline = lazy(() => import('./ProfileTimeline'));\n\nfunction Profile() {\n  return (\n    // This causes the fallback UI to render while the lazy\n    // component or data is loading\n    <Suspense fallback={<h2>Loading timeline...</h2>}>\n      <ProfileTimeline />\n    </Suspense>\n  );\n}\n```\n\n### Example\n```jsx\nimport { Suspense, use } from 'react';\n\nconst userPromise = new Promise(resolve =>\n  setTimeout(() => resolve({ name: 'Ada Lovelace' }), 1500)\n);\n\nfunction Profile() {\n  // `use` suspends until the promise resolves, then returns its value.\n  const user = use(userPromise);\n  return <h2>{user.name}</h2>;\n}\n\nexport default function App() {\n  return (\n    <div style={{ padding: 20 }}>\n      <Suspense fallback={<div>Loading profile...</div>}>\n        <Profile />\n      </Suspense>\n    </div>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** Remove the hardcoded `isLoading` check by upgrading `useQuery` to `useSuspenseQuery`. Then wrap the `<UserList />` in a `<Suspense>` boundary.\n\n**Solution:** Change `const { data } = useQuery(...)` to `const { data } = useSuspenseQuery(...)`. In `App`, wrap `<UserList />` in `<Suspense fallback={<div>Loading users...</div>}>`.\n\n### Hints\n* **The Waterfall Problem:** Be warned: sequential Suspense components can create network waterfalls (A loads -> B loads -> C loads). For optimal performance, either hoist queries to the parent or use parallel techniques like `useSuspenseQueries` to fetch everything simultaneously.\n",
      "starterCode": "import { Suspense } from 'react';\nimport { QueryClient, QueryClientProvider, useQuery, useSuspenseQuery } from '@tanstack/react-query';\n\nconst queryClient = new QueryClient();\n\nexport default function App() {\n  return (\n    <QueryClientProvider client={queryClient}>\n      <div style={{ padding: 20 }}>\n        <h1>User Directory</h1>\n        {/* 👉 2. Wrap <UserList /> in a <Suspense> boundary */}\n        {/* 👉 3. Provide a fallback UI to the boundary */}\n        <UserList />\n      </div>\n    </QueryClientProvider>\n  );\n}\n\nfunction UserList() {\n  // 👉 1. Change useQuery to useSuspenseQuery\n  const { data } = useQuery({\n    queryKey: ['users'],\n    queryFn: () => fetch('https://jsonplaceholder.typicode.com/users').then(res => res.json())\n  });\n\n  return (\n    <ul>\n      {data?.map(user => (\n        <li key={user.id}>{user.name}</li>\n      ))}\n    </ul>\n  );\n}",
      "solutionCode": "import { Suspense } from 'react';\nimport { QueryClient, QueryClientProvider, useQuery, useSuspenseQuery } from '@tanstack/react-query';\n\nconst queryClient = new QueryClient();\n\nexport default function App() {\n  return (\n    <QueryClientProvider client={queryClient}>\n      <div style={{ padding: 20 }}>\n        <h1>User Directory</h1>\n        <Suspense fallback={<div>Loading users...</div>}>\n          <UserList />\n        </Suspense>\n      </div>\n    </QueryClientProvider>\n  );\n}\n\nfunction UserList() {\n  const { data } = useSuspenseQuery({\n    queryKey: ['users'],\n    queryFn: () => fetch('https://jsonplaceholder.typicode.com/users').then(res => res.json())\n  });\n\n  return (\n    <ul>\n      {data?.map(user => (\n        <li key={user.id}>{user.name}</li>\n      ))}\n    </ul>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { Suspense, use } from 'react';\n\nconst userPromise = new Promise(resolve =>\n  setTimeout(() => resolve({ name: 'Ada Lovelace' }), 1500)\n);\n\nfunction Profile() {\n  // `use` suspends until the promise resolves, then returns its value.\n  const user = use(userPromise);\n  return <h2>{user.name}</h2>;\n}\n\nexport default function App() {\n  return (\n    <div style={{ padding: 20 }}>\n      <Suspense fallback={<div>Loading profile...</div>}>\n        <Profile />\n      </Suspense>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              9
            ],
            "description": "`use` is what suspending looks like in React 19. Hand it a Promise; if the Promise has not settled, the component stops rendering right here and React looks for a boundary.\n\nWhen it has settled, the same call returns the value directly — no `data`, no `isLoading`, no null check. `user` is a user.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              16,
              18
            ],
            "description": "The nearest `<Suspense>` above the suspended component renders its `fallback` instead. Everything outside the boundary is unaffected and stays interactive.\n\nThis is the same mechanism `lazy` uses for code splitting. One boundary handles both — a component waiting for its code and a component waiting for its data are the same problem to React.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              3,
              5
            ],
            "description": "The Promise is created at module scope, and that placement is load-bearing. Creating it inside `Profile` would produce a new Promise on every render, so every render would suspend again and the component would never resolve.\n\nWhich is why you rarely write this by hand. A framework loader or a library like React Query owns the caching that makes \"the same request\" identifiable across renders; `use` is the consumer side of that contract.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10
            ],
            "description": "Note what `Profile` does not contain: no loading branch, no error branch, no early return. Those moved to boundaries — `<Suspense>` for loading, an error boundary for failure — so the component only has to describe the successful case.\n\nThe exact text output on the screen will be:\n`Loading profile...`\n\nreplaced after 1.5 seconds by `Ada Lovelace`.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { Suspense } from 'react';\nimport { QueryClient, QueryClientProvider, useSuspenseQuery } from '@tanstack/react-query';\n\nconst queryClient = new QueryClient();\n\nexport default function App() {\n  return (\n    <QueryClientProvider client={queryClient}>\n      <div style={{ padding: 20 }}>\n        <h1>User Directory</h1>\n        <Suspense fallback={<div>Loading users...</div>}>\n          <UserList />\n        </Suspense>\n      </div>\n    </QueryClientProvider>\n  );\n}\n\nfunction UserList() {\n  const { data } = useSuspenseQuery({\n    queryKey: ['users'],\n    queryFn: () => fetch('https://jsonplaceholder.typicode.com/users').then(res => res.json())\n  });\n\n  return (\n    <ul>\n      {data?.map(user => (\n        <li key={user.id}>{user.name}</li>\n      ))}\n    </ul>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              11,
              13
            ],
            "description": "We wrap the `UserList` component inside a `Suspense` boundary with a `fallback` UI.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              20
            ],
            "description": "We replace `useQuery` with `useSuspenseQuery` inside `UserList`. Now, there is no manual `isLoading` checking!\n\nThe exact text output on the screen will be:\n`User Directory`\n`Leanne Graham`\n`Ervin Howell`\n`...`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "How does Suspense know data is loading?",
          "type": "legacy",
          "walkthrough": {
            "code": "function Profile() {\n  const data = fetchSomeData(); // Throws a Promise!\n  return <div>{data.name}</div>;\n}",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "Historically, Suspense-integrated libraries (React Query, Relay) signalled \"not ready\" by **throwing a pending Promise** from render. React caught it, paused that subtree, and retried when the Promise settled."
              },
              {
                "highlightLines": [
                  2
                ],
                "description": "React 19 replaced that contract with `use()`. Throwing a promise from your own render code is no longer the supported mechanism — `use(promise)` is, and it is what the next card shows. The old shape is worth recognising because it is what libraries built on before 19, and what you will find if you read their source."
              }
            ]
          }
        },
        {
          "title": "Can Suspense boundaries be nested?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "<Suspense fallback={<PageSkeleton />}>\n  <Layout>\n    <Suspense fallback={<ChartSpinner />}>\n      <HeavyChart />\n    </Suspense>\n  </Layout>\n</Suspense>",
            "steps": [
              {
                "highlightLines": [
                  1,
                  3
                ],
                "description": "Yes! React handles nested Suspense boundaries elegantly."
              },
              {
                "highlightLines": [
                  1,
                  2,
                  3,
                  4,
                  5
                ],
                "description": "The layout will render immediately while showing `<PageSkeleton />` if the layout itself is loading. Once the layout finishes, it will show the `<ChartSpinner />` exactly where the chart belongs."
              }
            ]
          }
        },
        {
          "title": "Does Suspense work with standard Promises?",
          "type": "misconception",
          "walkthrough": {
            "code": "function App() {\n  // Doesn't work!\n  const data = use(fetch('/api'));\n}",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "In React 18, Suspense only worked with specific integrated libraries (like React.lazy, Relay, or Next.js)."
              },
              {
                "highlightLines": [
                  3
                ],
                "description": "However, in React 19, the new `use()` hook allows you to read a standard Promise directly during render, and it natively integrates with Suspense! (But don't call `fetch` directly in render, or it loops)."
              }
            ]
          }
        },
        {
          "title": "How Suspense Represents Work and Reveals Boundaries",
          "type": "did-you-know",
          "walkthrough": {
            "code": "function AsyncComponent() {\n  const data = readData(); // Throws a Promise if pending!\n  return <div>{data.title}</div>;\n}\n\n// Suspense catches the thrown Promise:\n<Suspense fallback={<Spinner />}>\n  <AsyncComponent />\n</Suspense>",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "In the pre-React-19 contract, an async reader that needed data it did not have would literally `throw` a JavaScript `Promise` up the call stack. React 19 supersedes this with `use()` for code you write — this is here so the mechanism is not a mystery when you read a library."
              },
              {
                "highlightLines": [
                  7,
                  8,
                  9
                ],
                "description": "The nearest `<Suspense>` boundary catches the thrown Promise, displays the `fallback`, and re-renders the child automatically when the Promise resolves."
              }
            ]
          }
        },
        {
          "title": "The waterfall problem: sequential vs. parallel Suspense fetches",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ Waterfall: each child's fetch only starts once IT renders,\n// and it only renders once its parent's Suspense has already resolved\nfunction ProfilePage() {\n  return (\n    <Suspense fallback={<Spinner />}>\n      <ProfileDetails />       {/* fetch #1 starts, ~500ms */}\n      <Suspense fallback={<Spinner />}>\n        <ProfileTimeline />    {/* fetch #2 doesn't START until #1 resolves */}\n      </Suspense>\n    </Suspense>\n  );\n}\n// Total time: ~500ms + ~500ms = ~1000ms\n\n// ✅ Parallel: kick off both requests before either component renders\nfunction ProfilePage() {\n  const [details, timeline] = useSuspenseQueries({\n    queries: [detailsQuery, timelineQuery],\n  });\n  return <Suspense fallback={<Spinner />}><Profile details={details} timeline={timeline} /></Suspense>;\n}\n// Total time: max(~500ms, ~500ms) = ~500ms",
            "steps": [
              {
                "highlightLines": [
                  3,
                  4,
                  5,
                  6,
                  7,
                  8
                ],
                "description": "Nesting Suspense boundaries is easy to reach for, but each inner boundary's fetch only *starts* once its own component renders — and that component doesn't render until everything above it has already resolved. Two 500ms fetches nested like this take ~1000ms total, back to back, even though neither request depends on the other's result."
              },
              {
                "highlightLines": [
                  11
                ],
                "description": "This is the exact failure mode the lesson's hints call out: sequential Suspense components create a network waterfall, request-after-request, purely because of *where they sit in the tree* — not because the data actually has a dependency."
              },
              {
                "highlightLines": [
                  15,
                  16,
                  17,
                  18
                ],
                "description": "`useSuspenseQueries` (or hoisting both queries to a shared parent and starting them together) fires both requests immediately, before either component suspends. Total wait time drops to whichever request is slower, not their sum — the fix is about *when the request starts*, not about Suspense itself."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "code-splitting",
      "title": "Code Splitting",
      "content": "\n# Code Splitting & Suspense\n\n### What is it?\n**Building on bundle optimization:** Instead of forcing users to download the entire application's JavaScript bundle upfront before anything can render, **Code Splitting** lets you split your code into chunks loaded on demand.\n\n> 💡 **Mental Model:** Think of code splitting like packing for a trip in stages: you don't carry your winter coat through airport security if you're headed somewhere warm first — you grab it later, from storage, only once you actually need it.\n\n### Why do we need it?\nSending a massive JavaScript bundle to the browser all at once makes your app very slow to load initially. Splitting the bundle improves initial load time.\n\n### How?\nWe use **`React.lazy`** to dynamically import a component, and **`<Suspense>`** to show a fallback UI (like a spinner or loading text) while the code is downloading over the network.\n\n### Syntax/Example\n```jsx\nimport { lazy, Suspense } from 'react';\n\n// This causes the HeavyWidget component to be loaded\n// asynchronously (e.g. in a separate JavaScript chunk)\nconst HeavyWidget = lazy(() => import('./HeavyWidget'));\n\nfunction App() {\n  // This causes a fallback UI to display while\n  // HeavyWidget is downloading\n  return (\n    <Suspense fallback={<p>Loading widget...</p>}>\n      <HeavyWidget />\n    </Suspense>\n  );\n}\n```\n\n### Example\n```jsx\nimport { lazy, Suspense } from 'react';\n\nfunction Chart() {\n  return <div style={{ padding: 12, border: '1px solid #555' }}>A heavy chart.</div>;\n}\n\n// Stands in for `lazy(() => import('./Chart'))`: the same shape, but\n// resolvable in a single-file playground, and slow enough to see.\nconst HeavyChart = lazy(\n  () => new Promise(resolve => setTimeout(() => resolve({ default: Chart }), 1500))\n);\n\nexport default function Dashboard() {\n  return (\n    <div style={{ padding: 20 }}>\n      <Suspense fallback={<div>Loading chart...</div>}>\n        <HeavyChart />\n      </Suspense>\n    </div>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** We have a mocked `HeavyChart` component that takes 2 seconds to download. When you click \"Load Chart\", the app crashes because the component is suspended but there is no Suspense boundary to catch it! Wrap `<HeavyChart />` inside a `<Suspense fallback={...}>` boundary to show a loading message.\n\n**Solution:** Wrap `<HeavyChart data={[10, 20, 30]} />` in `<Suspense fallback={<div>Loading heavy chart...</div>}> ... </Suspense>`.\n\n### Hints\n* **Route-Based Code Splitting:** The most common use case is route-based splitting, where entire pages are lazy-loaded (`lazy(() => import('./pages/Home'))`). Each dynamic import creates a new chunk in your build output!\n",
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
      "id": "transitions",
      "title": "Concurrent Transitions",
      "content": "\n# Concurrent Transitions\n\n### What is it?\n**Building on React rendering priorities:** React state updates are urgent by default; the **`useTransition`** hook lets you mark slow state updates as non-urgent transitions so keystrokes and clicks remain instantaneous.\n\n> 💡 **Mental Model:** Think of a transition like a barista taking a rush order: pouring your coffee (urgent typing) never waits behind the big catering order (expensive re-render) — the barista can pause the catering job mid-stream to keep serving people at the counter.\n\n### Why do we need it?\nBy default, React state updates are **urgent**. If you type into an input field, React MUST finish updating the state and re-rendering the entire component before you can type the next letter. If your component renders a massive list of 10,000 items, filtering that list on every keystroke will completely freeze the browser, making the input feel laggy and unresponsive.\n\n### How?\nIf you wrap your slow filter update in a transition, React will keep the input field perfectly responsive, rendering the slow list in the background and gracefully interrupting it if you keep typing!\n\n### Syntax/Example\n```jsx\nimport { useState, useTransition } from 'react';\n\nfunction SearchResults() {\n  const [query, setQuery] = useState('');\n  // This returns a pending boolean and a transition function\n  const [isPending, startTransition] = useTransition();\n\n  const handleChange = (e) => {\n    // This causes the state update to be marked as low priority,\n    // keeping the UI responsive while rendering expensive lists\n    startTransition(() => {\n      setQuery(e.target.value);\n    });\n  };\n\n  return (\n    <div>\n      <input onChange={handleChange} />\n      {isPending ? <Spinner /> : <HeavyList query={query} />}\n    </div>\n  );\n}\n```\n\n### Example\n```jsx\nimport { useState, useTransition } from 'react';\n\nconst items = Array.from({ length: 8000 }, (_, i) => `Item ${i}`);\n\nexport default function Search() {\n  const [text, setText] = useState('');\n  const [query, setQuery] = useState('');\n  const [isPending, startTransition] = useTransition();\n\n  const handleChange = (e) => {\n    setText(e.target.value);\n    startTransition(() => setQuery(e.target.value));\n  };\n\n  const results = items.filter(item => item.includes(query));\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input value={text} onChange={handleChange} placeholder=\"Filter 8000 items\" />\n      {isPending && <span> Updating...</span>}\n      <p>{results.length} matches</p>\n      <ul style={{ maxHeight: 150, overflow: 'auto' }}>\n        {results.slice(0, 100).map(item => <li key={item}>{item}</li>)}\n      </ul>\n    </div>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** One keystroke drives two state updates. `setText` keeps the input responsive and must stay urgent; `setFilter` drives a 10,000-row re-render and should be interruptible. Wrap **only** `setFilter` in a transition.\n\n**Solution:** Add `const [isPending, startTransition] = useTransition();` in `App`. In `handleChange`, leave `setText(e.target.value)` exactly as it is and write `startTransition(() => setFilter(e.target.value));` beneath it. Add `{isPending && <span> Updating...</span>}` below the input.\n\nWrapping `setText` too would be the classic mistake: the input's own value would become interruptible, and the field would visibly lag behind the keyboard — the precise problem transitions exist to prevent.\n\n### Hints\n* **useDeferredValue:** If the state comes from a parent component and you *don't* have access to the setter function to use `startTransition`, you can use `useDeferredValue(filter)` inside the child component. It achieves the exact same concurrent deferral from the consumer's side.\n",
      "starterCode": "import { useState, useTransition } from 'react';\n\n// A massive, slow-to-render list of 10,000 items\nconst items = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);\n\nexport default function App() {\n  // Two pieces of state from one keystroke, and they are NOT equally urgent.\n  const [text, setText] = useState('');      // what the input shows — must be instant\n  const [filter, setFilter] = useState('');  // what the list uses — can lag behind\n\n  // 👉 1. Call useTransition here\n\n  const handleChange = (e) => {\n    setText(e.target.value);\n    // 👉 2. Mark ONLY the list update as non-urgent, by wrapping it in startTransition\n    setFilter(e.target.value);\n  };\n\n  const filteredItems = items.filter(item => item.toLowerCase().includes(filter.toLowerCase()));\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input type=\"text\" value={text} onChange={handleChange} placeholder=\"Filter items...\" />\n      \n      {/* 👉 3. Render \" Updating...\" here if isPending is true */}\n      \n      <ul>\n        {filteredItems.map(item => (\n          <li key={item}>{item}</li>\n        ))}\n      </ul>\n    </div>\n  );\n}",
      "solutionCode": "import { useState, useTransition } from 'react';\n\n// A massive, slow-to-render list of 10,000 items\nconst items = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);\n\nexport default function App() {\n  const [text, setText] = useState('');\n  const [filter, setFilter] = useState('');\n  const [isPending, startTransition] = useTransition();\n\n  const handleChange = (e) => {\n    setText(e.target.value);\n    startTransition(() => {\n      setFilter(e.target.value);\n    });\n  };\n\n  const filteredItems = items.filter(item => item.toLowerCase().includes(filter.toLowerCase()));\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input type=\"text\" value={text} onChange={handleChange} placeholder=\"Filter items...\" />\n      {isPending && <span> Updating...</span>}\n      <ul>\n        {filteredItems.map(item => (\n          <li key={item}>{item}</li>\n        ))}\n      </ul>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useState, useTransition } from 'react';\n\nconst items = Array.from({ length: 8000 }, (_, i) => `Item ${i}`);\n\nexport default function Search() {\n  const [text, setText] = useState('');\n  const [query, setQuery] = useState('');\n  const [isPending, startTransition] = useTransition();\n\n  const handleChange = (e) => {\n    setText(e.target.value);\n    startTransition(() => setQuery(e.target.value));\n  };\n\n  const results = items.filter(item => item.includes(query));\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input value={text} onChange={handleChange} placeholder=\"Filter 8000 items\" />\n      {isPending && <span> Updating...</span>}\n      <p>{results.length} matches</p>\n      <ul style={{ maxHeight: 150, overflow: 'auto' }}>\n        {results.slice(0, 100).map(item => <li key={item}>{item}</li>)}\n      </ul>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              11
            ],
            "description": "Two pieces of state from one keystroke, and they are not equally urgent. `text` drives the input itself, so it must update immediately — an input that lags behind the keyboard feels broken however fast the rest is.\n\nThis update stays outside the transition for exactly that reason.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              12
            ],
            "description": "`startTransition` marks the other update as interruptible. React is now allowed to abandon a half-finished render of the 8000-item filter when another keystroke arrives, and start again with the newer value.\n\nWithout it, each keystroke commits a full filter render before the next character can be processed, and the field stutters.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              8,
              20
            ],
            "description": "`isPending` is true while the deferred render is outstanding, which is how you tell the user that the visible list is one step behind rather than broken.\n\nNote what it is not: a loading spinner for a network request. Nothing is being fetched here — this is React telling you it is still working.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              15,
              21
            ],
            "description": "Type quickly and watch the two diverge: the characters appear instantly while the match count trails and catches up.\n\nThis is a scheduling tool, not a performance fix. The filter still costs what it costs; the transition only decides what may be interrupted while it runs.\n\nThe exact text output on the screen will be:\n`[Input: Filter 8000 items]`\n`8000 matches`\n\nfollowed by the first hundred items.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useState, useTransition } from 'react';\n\nconst items = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);\n\nexport default function App() {\n  const [text, setText] = useState('');\n  const [filter, setFilter] = useState('');\n  const [isPending, startTransition] = useTransition();\n\n  const handleChange = (e) => {\n    setText(e.target.value);\n    startTransition(() => {\n      setFilter(e.target.value);\n    });\n  };\n\n  const filteredItems = items.filter(item => item.toLowerCase().includes(filter.toLowerCase()));\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input type=\"text\" value={text} onChange={handleChange} placeholder=\"Filter items...\" />\n      {isPending && <span> Updating...</span>}\n      <ul>\n        {filteredItems.map(item => (\n          <li key={item}>{item}</li>\n        ))}\n      </ul>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              8
            ],
            "description": "We call `useTransition` to get the `startTransition` function and the `isPending` flag.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              11
            ],
            "description": "`setText` stays outside the transition. It drives the input's own `value`, so it has to commit on the very next frame — an interruptible text field feels broken no matter how fast everything else is.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              12,
              14
            ],
            "description": "Only `setFilter` goes inside `startTransition`. React may now abandon a half-finished render of the 10,000-row list when the next keystroke arrives, and start again with the newer value.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              21,
              22
            ],
            "description": "Type quickly and watch the two diverge: characters appear instantly while the list trails and catches up, with `Updating...` saying so.\n\nThe exact text output on the screen will be:\n`[Input: Filter items...] Updating...`\n`Item 1`\n`Item 2`\n`...`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why use `startTransition`?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "startTransition(() => {\n  setSearchQuery(input);\n});",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "Updating a heavy data table might freeze the browser for 100ms, making typing in the search box feel laggy."
              },
              {
                "highlightLines": [
                  1
                ],
                "description": "By wrapping the state update in `startTransition`, you tell React: 'This update is low priority. If the user types another letter, pause rendering the heavy table to handle the keystroke first!'"
              }
            ]
          }
        },
        {
          "title": "Transitions vs Debouncing",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Debouncing (Artificial Delay)\nconst search = useDebounce(input, 500);\n\n// Transitions (Immediate Priority Execution)\nstartTransition(() => setQuery(input));",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "Debouncing always forces the user to wait 500ms, even if they have a brand new M3 Mac that could have rendered it instantly."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "Transitions execute as fast as the CPU allows. If the device is fast, there is no delay. It only pauses the work if the user actively interrupts it (like by typing again)."
              }
            ]
          }
        },
        {
          "title": "Can I use transitions for network requests?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "const [isPending, startTransition] = useTransition();\n\nstartTransition(async () => {\n  await submitData();\n});",
            "steps": [
              {
                "highlightLines": [
                  3,
                  4,
                  5
                ],
                "description": "In React 19, `startTransition` officially supports asynchronous functions!"
              },
              {
                "highlightLines": [
                  1
                ],
                "description": "This means `isPending` will automatically stay `true` for the entire duration of the async API call, making it the perfect tool for handling form submissions without needing manual `setLoading` states."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "use-deferred-value",
      "title": "useDeferredValue: Lagging a Value On Purpose",
      "content": "\n# useDeferredValue: Lagging a Value On Purpose\n\n### What is it?\n**Building on transitions:** `useTransition` marks an *update* as interruptible, which means you have to own the `setState` call. **`useDeferredValue`** does the same job from the other end — hand it a value and it hands back a copy that is allowed to lag, so the expensive render that reads the copy becomes the interruptible one.\n\n> 💡 **Mental Model:** Think of a live broadcast on a short delay. The studio feed (`query`) is instant; the version that goes out (`deferredQuery`) trails just far enough that the slow work downstream never holds up the camera.\n\n### Why do we need it?\n`startTransition` needs the setter. A component that *receives* a value — as a prop from a parent, from Context, or from the URL — has no setter to wrap, so it cannot mark the incoming update as non-urgent. Deferring the value it already holds is the only lever it has left.\n\n### How?\n`const deferred = useDeferredValue(value)` returns `value` on the first render. After that, when `value` changes, it returns the **previous** value while React renders the new one in the background at a lower priority, then swaps it in. Comparing the two (`value !== deferred`) tells you a background render is in flight, which is how you dim results that are one step behind.\n\nOne condition makes or breaks it: the expensive work must actually be skipped when the deferred value has not changed. That means the child reading it is wrapped in `memo`, or the calculation sits in a `useMemo` keyed on the deferred value. Without that, the child re-renders on every keystroke anyway and you have gained nothing.\n\n### Syntax/Example\n```jsx\nimport { useState, useDeferredValue } from 'react';\n\nfunction Search() {\n  const [query, setQuery] = useState('');\n  // Lags one render behind `query` while a background render is in flight\n  const deferredQuery = useDeferredValue(query);\n\n  return (\n    <>\n      <input value={query} onChange={(e) => setQuery(e.target.value)} />\n      {/* Results is wrapped in memo, so it re-renders only when deferredQuery changes */}\n      <Results query={deferredQuery} />\n    </>\n  );\n}\n```\n\n### Example\n```jsx\nimport { useState, useDeferredValue, memo } from 'react';\n\nconst items = Array.from({ length: 5000 }, (_, i) => `Item ${i}`);\n\nconst Results = memo(function Results({ query }) {\n  const matches = items.filter(item => item.includes(query));\n  return (\n    <>\n      <p>{matches.length} matches</p>\n      <ul style={{ maxHeight: 140, overflow: 'auto' }}>\n        {matches.slice(0, 50).map(item => <li key={item}>{item}</li>)}\n      </ul>\n    </>\n  );\n});\n\nexport default function App() {\n  const [query, setQuery] = useState('');\n  const deferredQuery = useDeferredValue(query);\n  const isStale = query !== deferredQuery;\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder=\"Filter 5000 items\" />\n      <div style={{ opacity: isStale ? 0.5 : 1 }}>\n        <Results query={deferredQuery} />\n      </div>\n    </div>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** The filter box re-renders a 5,000-row list on every keystroke, and `ResultList` is already wrapped in `memo` — it just never gets the chance to skip, because the prop changes every time. Defer the value instead: create `deferredQuery`, pass it down instead of `query`, and dim the wrapper while the two disagree.\n\n**Solution:** Add `useDeferredValue` to the import. Inside `App`, write `const deferredQuery = useDeferredValue(query);` and `const isStale = query !== deferredQuery;`. Change the wrapper to `<div style={{ opacity: isStale ? 0.5 : 1 }}>` and the child to `<ResultList query={deferredQuery} />`.\n\nLeaving `query` on the input is the point, not an oversight — the field must stay urgent. Only the value the expensive subtree reads is allowed to lag.\n\n### Hints\n* **Which one do I reach for?** If you own the `setState`, `useTransition` is more direct and gives you `isPending` for free. If the value arrives from somewhere else, `useDeferredValue` is the version that works. They schedule the same way underneath.\n* **It is not a debounce.** A debounce waits a fixed number of milliseconds whether or not the device needed them. A deferred value starts the background render immediately and only lets it be interrupted — on a fast machine you may never see a stale frame at all.\n",
      "starterCode": "import { useState, memo } from 'react';\n\n// 5,000 rows, re-filtered on every keystroke.\nconst items = Array.from({ length: 5000 }, (_, i) => `Item ${i + 1}`);\n\nconst ResultList = memo(function ResultList({ query }) {\n  const matches = items.filter(item => item.toLowerCase().includes(query.toLowerCase()));\n  return (\n    <ul style={{ maxHeight: 160, overflow: 'auto' }}>\n      {matches.map(item => <li key={item}>{item}</li>)}\n    </ul>\n  );\n});\n\nexport default function App() {\n  const [query, setQuery] = useState('');\n\n  // 👉 1. Create a lagging copy of query and call it deferredQuery\n  // 👉 2. Derive isStale by comparing query with deferredQuery\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder=\"Filter items...\" />\n      {/* 👉 3. Pass deferredQuery down, and dim this wrapper while isStale */}\n      <div style={{ opacity: 1 }}>\n        <ResultList query={query} />\n      </div>\n    </div>\n  );\n}",
      "solutionCode": "import { useState, useDeferredValue, memo } from 'react';\n\n// 5,000 rows, re-filtered on every keystroke.\nconst items = Array.from({ length: 5000 }, (_, i) => `Item ${i + 1}`);\n\nconst ResultList = memo(function ResultList({ query }) {\n  const matches = items.filter(item => item.toLowerCase().includes(query.toLowerCase()));\n  return (\n    <ul style={{ maxHeight: 160, overflow: 'auto' }}>\n      {matches.map(item => <li key={item}>{item}</li>)}\n    </ul>\n  );\n});\n\nexport default function App() {\n  const [query, setQuery] = useState('');\n  const deferredQuery = useDeferredValue(query);\n  const isStale = query !== deferredQuery;\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder=\"Filter items...\" />\n      <div style={{ opacity: isStale ? 0.5 : 1 }}>\n        <ResultList query={deferredQuery} />\n      </div>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useState, useDeferredValue, memo } from 'react';\n\nconst items = Array.from({ length: 5000 }, (_, i) => `Item ${i}`);\n\nconst Results = memo(function Results({ query }) {\n  const matches = items.filter(item => item.includes(query));\n  return (\n    <>\n      <p>{matches.length} matches</p>\n      <ul style={{ maxHeight: 140, overflow: 'auto' }}>\n        {matches.slice(0, 50).map(item => <li key={item}>{item}</li>)}\n      </ul>\n    </>\n  );\n});\n\nexport default function App() {\n  const [query, setQuery] = useState('');\n  const deferredQuery = useDeferredValue(query);\n  const isStale = query !== deferredQuery;\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder=\"Filter 5000 items\" />\n      <div style={{ opacity: isStale ? 0.5 : 1 }}>\n        <Results query={deferredQuery} />\n      </div>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              19
            ],
            "description": "`useDeferredValue` takes a value and returns a copy of it that is permitted to be out of date. On the first render the two are identical; after that, when `query` changes, this line keeps returning the old value while React renders the new one in the background.\n\nNothing is delayed by a timer. React starts the background render at once — it is just allowed to interrupt it when something more urgent arrives.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              26,
              5
            ],
            "description": "The expensive subtree reads `deferredQuery`, never `query`. That is the whole mechanism: the slow render is driven by the value that is allowed to lag.\n\n`memo` on line 5 is load-bearing, not decoration. Without it `Results` re-renders whenever `App` does, so the deferred prop would change nothing and the filter would still run on every keystroke.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              20,
              25
            ],
            "description": "`query !== deferredQuery` is true exactly while a background render is outstanding. It is the same information `isPending` gives you with `useTransition`, derived by hand because there is no pending flag here.\n\nDimming the stale result is what turns an unexplained delay into visible feedback: the list is old, and the app knows it.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              24,
              18
            ],
            "description": "The input keeps reading `query` directly, so it commits on the very next frame and typing never stutters. Type quickly and you can watch the match count trail the text and then catch up.\n\nThe exact text output on the screen will be:\n`[Input: Filter 5000 items]`\n`5000 matches`\n\nfollowed by the first fifty items.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useState, useDeferredValue, memo } from 'react';\n\n// 5,000 rows, re-filtered on every keystroke.\nconst items = Array.from({ length: 5000 }, (_, i) => `Item ${i + 1}`);\n\nconst ResultList = memo(function ResultList({ query }) {\n  const matches = items.filter(item => item.toLowerCase().includes(query.toLowerCase()));\n  return (\n    <ul style={{ maxHeight: 160, overflow: 'auto' }}>\n      {matches.map(item => <li key={item}>{item}</li>)}\n    </ul>\n  );\n});\n\nexport default function App() {\n  const [query, setQuery] = useState('');\n  const deferredQuery = useDeferredValue(query);\n  const isStale = query !== deferredQuery;\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder=\"Filter items...\" />\n      <div style={{ opacity: isStale ? 0.5 : 1 }}>\n        <ResultList query={deferredQuery} />\n      </div>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              1,
              17
            ],
            "description": "`useDeferredValue` joins the import, and one line inside `App` produces the lagging copy. `query` itself is untouched — deferring never replaces the state, it adds a second reading of it.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              18
            ],
            "description": "`isStale` is true only while React is still rendering the newer value in the background. There is no pending flag to read here, so comparing the two values is how you find out.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              24
            ],
            "description": "`ResultList` now receives `deferredQuery`. Because it is wrapped in `memo`, an unchanged deferred value means it skips the 5,000-row filter entirely — which is what makes the deferral worth anything.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              22,
              23
            ],
            "description": "The input still reads `query`, so the field stays instant; only the list is allowed to fall behind, and it dims while it does.\n\nThe exact text output on the screen will be:\n`[Input: Filter items...]`\n`Item 1`\n`Item 2`\n`...`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "useTransition or useDeferredValue?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// You own the setter:\nstartTransition(() => setQuery(input));\n\n// The value arrives from elsewhere:\nconst deferredQuery = useDeferredValue(query);",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "Use `useTransition` when the update starts in your own component. You get `isPending` for free and you can mark several setters at once."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "Use `useDeferredValue` when the value comes in as a prop, from Context, or from the URL, and there is no setter for you to wrap. Same scheduler underneath — different end of the pipe."
              }
            ]
          }
        },
        {
          "title": "Deferring without memo does nothing",
          "type": "misconception",
          "walkthrough": {
            "code": "const deferredQuery = useDeferredValue(query);\n\n// Re-renders whenever App does, deferred or not:\nfunction Results({ query }) { /* ... */ }\n\n// Skips the work when the deferred value is unchanged:\nconst Results = memo(function Results({ query }) { /* ... */ });",
            "steps": [
              {
                "highlightLines": [
                  4
                ],
                "description": "A plain child re-renders every time its parent does, whatever prop it was handed. The deferred value changes nothing, and the expensive filter still runs on every keystroke."
              },
              {
                "highlightLines": [
                  7
                ],
                "description": "`memo` is what lets an unchanged deferred value turn into skipped work. Wrapping the child — or putting the calculation in a `useMemo` keyed on the deferred value — is a requirement here, not a further optimization."
              }
            ]
          }
        },
        {
          "title": "It is not a debounce",
          "type": "misconception",
          "walkthrough": {
            "code": "// Debounce: a fixed wait, on every device\nconst search = useDebounce(input, 500);\n\n// Deferred: starts now, interruptible\nconst search = useDeferredValue(input);",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "A debounce refuses to do the work for 500ms regardless of how fast the machine is, so a device that could have rendered instantly still waits."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "A deferred value starts the background render immediately and only yields when something urgent interrupts it. On a fast machine the stale frame may never be visible at all."
              }
            ]
          }
        }
      ]
    }
  ]
};
