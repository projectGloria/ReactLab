export default {
  "id": "advanced",
  "title": "Modern React Foundations",
  "lessons": [
    {
      "id": "suspense",
      "title": "Suspense for Data Fetching",
      "dependencies": {
        "@tanstack/react-query": "^5.0.0"
      },
      "content": "\n# Suspense for Data Fetching\n\n### What is it?\n**Building on asynchronous data fetching:** In modern React, **`<Suspense>`** decouples component render logic from loading spinners by pausing rendering until asynchronous promises resolve and rendering fallback UI in the interim.\n\n> \ud83d\udca1 **Mental Model:** Think of Suspense as a restaurant's \\\"your table isn't ready\\\" sign — instead of seating you at an empty table and making you stare at nothing, the host shows you a waiting area (the fallback) and seats you the moment the real table (the data) is ready.\n\n### Why do we need it?\nUsually, you have to write `if (isLoading) return <Spinner />` inside every single component that fetches data. This pollutes your UI logic with fallback states.\n\n### How?\nWhen you use a Suspense-enabled data fetcher (like TanStack Query's `useSuspenseQuery`), the component completely skips the `isLoading` check. If the data isn't ready yet, the component literally \"suspends\" its render and throws control up the tree to the nearest `<Suspense fallback={...}>` boundary. This allows you to decouple your loading UI from your actual components!\n\n### Syntax/Example\n```jsx\nimport { Suspense, lazy } from 'react';\n\nconst ProfileTimeline = lazy(() => import('./ProfileTimeline'));\n\nfunction Profile() {\n  return (\n    // This causes the fallback UI to render while the lazy\n    // component or data is loading\n    <Suspense fallback={<h2>Loading timeline...</h2>}>\n      <ProfileTimeline />\n    </Suspense>\n  );\n}\n```\n\n### Example\n```jsx\nimport { Suspense, use } from 'react';\n\nconst userPromise = new Promise(resolve =>\n  setTimeout(() => resolve({ name: 'Ada Lovelace' }), 1500)\n);\n\nfunction Profile() {\n  // `use` suspends until the promise resolves, then returns its value.\n  const user = use(userPromise);\n  return <h2>{user.name}</h2>;\n}\n\nexport default function App() {\n  return (\n    <div style={{ padding: 20 }}>\n      <Suspense fallback={<div>Loading profile...</div>}>\n        <Profile />\n      </Suspense>\n    </div>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** Remove the hardcoded `isLoading` check by upgrading `useQuery` to `useSuspenseQuery`. Then wrap the `<UserList />` in a `<Suspense>` boundary.\n\n**Solution:** Change `const { data } = useQuery(...)` to `const { data } = useSuspenseQuery(...)`. In `App`, wrap `<UserList />` in `<Suspense fallback={<div>Loading users...</div>}>`.\n\n### Hints\n* **The Waterfall Problem:** Be warned: sequential Suspense components can create network waterfalls (A loads -> B loads -> C loads). For optimal performance, either hoist queries to the parent or use parallel techniques like `useSuspenseQueries` to fetch everything simultaneously.\n",
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
          "type": "did-you-know",
          "walkthrough": {
            "code": "function Profile() {\n  const data = fetchSomeData(); // Throws a Promise!\n  return <div>{data.name}</div>;\n}",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "Under the hood, libraries integrated with Suspense (like React Query or Relay) intentionally THROW a pending Promise."
              },
              {
                "highlightLines": [
                  2
                ],
                "description": "React catches this thrown Promise, stops rendering the component, shows the nearest Suspense fallback, and waits for the Promise to resolve before trying again!"
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
                "description": "When an async reader needs data that isn't ready yet, it literally `throws` a JavaScript `Promise` up the call stack!"
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
                "highlightLines": [3, 4, 5, 6, 7, 8],
                "description": "Nesting Suspense boundaries is easy to reach for, but each inner boundary's fetch only *starts* once its own component renders — and that component doesn't render until everything above it has already resolved. Two 500ms fetches nested like this take ~1000ms total, back to back, even though neither request depends on the other's result.",
              },
              {
                "highlightLines": [11],
                "description": "This is the exact failure mode the lesson's hints call out: sequential Suspense components create a network waterfall, request-after-request, purely because of *where they sit in the tree* — not because the data actually has a dependency.",
              },
              {
                "highlightLines": [15, 16, 17, 18],
                "description": "`useSuspenseQueries` (or hoisting both queries to a shared parent and starting them together) fires both requests immediately, before either component suspends. Total wait time drops to whichever request is slower, not their sum — the fix is about *when the request starts*, not about Suspense itself.",
              }
            ]
          }
        }
      ]
    },
    {
      "id": "transitions",
      "title": "Concurrent Transitions",
      "content": "\n# Concurrent Transitions\n\n### What is it?\n**Building on React rendering priorities:** React state updates are urgent by default; the **`useTransition`** hook lets you mark slow state updates as non-urgent transitions so keystrokes and clicks remain instantaneous.\n\n> \ud83d\udca1 **Mental Model:** Think of a transition like a barista taking a rush order: pouring your coffee (urgent typing) never waits behind the big catering order (expensive re-render) \u2014 the barista can pause the catering job mid-stream to keep serving people at the counter.\n\n### Why do we need it?\nBy default, React state updates are **urgent**. If you type into an input field, React MUST finish updating the state and re-rendering the entire component before you can type the next letter. If your component renders a massive list of 10,000 items, filtering that list on every keystroke will completely freeze the browser, making the input feel laggy and unresponsive.\n\n### How?\nIf you wrap your slow filter update in a transition, React will keep the input field perfectly responsive, rendering the slow list in the background and gracefully interrupting it if you keep typing!\n\n### Syntax/Example\n```jsx\nimport { useState, useTransition } from 'react';\n\nfunction SearchResults() {\n  const [query, setQuery] = useState('');\n  // This returns a pending boolean and a transition function\n  const [isPending, startTransition] = useTransition();\n\n  const handleChange = (e) => {\n    // This causes the state update to be marked as low priority,\n    // keeping the UI responsive while rendering expensive lists\n    startTransition(() => {\n      setQuery(e.target.value);\n    });\n  };\n\n  return (\n    <div>\n      <input onChange={handleChange} />\n      {isPending ? <Spinner /> : <HeavyList query={query} />}\n    </div>\n  );\n}\n```\n\n### Example\n```jsx\nimport { useState, useTransition } from 'react';\n\nconst items = Array.from({ length: 8000 }, (_, i) => `Item ${i}`);\n\nexport default function Search() {\n  const [text, setText] = useState('');\n  const [query, setQuery] = useState('');\n  const [isPending, startTransition] = useTransition();\n\n  const handleChange = (e) => {\n    setText(e.target.value);\n    startTransition(() => setQuery(e.target.value));\n  };\n\n  const results = items.filter(item => item.includes(query));\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input value={text} onChange={handleChange} placeholder=\"Filter 8000 items\" />\n      {isPending && <span> Updating...</span>}\n      <p>{results.length} matches</p>\n      <ul style={{ maxHeight: 150, overflow: 'auto' }}>\n        {results.slice(0, 100).map(item => <li key={item}>{item}</li>)}\n      </ul>\n    </div>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** Wrap the `setFilter(e.target.value)` state update inside a transition to prevent the browser from lagging when filtering 10,000 items.\n\n**Solution:** Add `const [isPending, startTransition] = useTransition();` in `App`. In `handleChange`, write `startTransition(() => setFilter(e.target.value));`. Add `{isPending && <span> Updating...</span>}` below the input.\n\n### Hints\n* **useDeferredValue:** If the state comes from a parent component and you *don't* have access to the setter function to use `startTransition`, you can use `useDeferredValue(filter)` inside the child component. It achieves the exact same concurrent deferral from the consumer's side.\n",
      "starterCode": "import { useState, useTransition } from 'react';\n\n// A massive, slow-to-render list of 10,000 items\nconst items = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);\n\nexport default function App() {\n  const [filter, setFilter] = useState('');\n  \n  // 👉 1. Call useTransition here\n\n  const handleChange = (e) => {\n    // 👉 2. Wrap this urgent state update in startTransition!\n    setFilter(e.target.value);\n  };\n\n  const filteredItems = items.filter(item => item.toLowerCase().includes(filter.toLowerCase()));\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input type=\"text\" onChange={handleChange} placeholder=\"Filter items...\" />\n      \n      {/* 👉 3. Render \" Updating...\" here if isPending is true */}\n      \n      <ul>\n        {filteredItems.map(item => (\n          <li key={item}>{item}</li>\n        ))}\n      </ul>\n    </div>\n  );\n}",
      "solutionCode": "import { useState, useTransition } from 'react';\n\n// A massive, slow-to-render list of 10,000 items\nconst items = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);\n\nexport default function App() {\n  const [filter, setFilter] = useState('');\n  const [isPending, startTransition] = useTransition();\n\n  const handleChange = (e) => {\n    startTransition(() => {\n      setFilter(e.target.value);\n    });\n  };\n\n  const filteredItems = items.filter(item => item.toLowerCase().includes(filter.toLowerCase()));\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input type=\"text\" onChange={handleChange} placeholder=\"Filter items...\" />\n      {isPending && <span> Updating...</span>}\n      <ul>\n        {filteredItems.map(item => (\n          <li key={item}>{item}</li>\n        ))}\n      </ul>\n    </div>\n  );\n}",
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
        "code": "import { useState, useTransition } from 'react';\n\nconst items = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);\n\nexport default function App() {\n  const [filter, setFilter] = useState('');\n  const [isPending, startTransition] = useTransition();\n\n  const handleChange = (e) => {\n    startTransition(() => {\n      setFilter(e.target.value);\n    });\n  };\n\n  const filteredItems = items.filter(item => item.toLowerCase().includes(filter.toLowerCase()));\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input type=\"text\" onChange={handleChange} placeholder=\"Filter items...\" />\n      {isPending && <span> Updating...</span>}\n      <ul>\n        {filteredItems.map(item => (\n          <li key={item}>{item}</li>\n        ))}\n      </ul>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              7
            ],
            "description": "We call `useTransition` to get the `startTransition` function and the `isPending` flag.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10,
              12
            ],
            "description": "We wrap the slow state update inside `startTransition`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              20
            ],
            "description": "Now, as you type into the input field, the browser remains fully responsive and the list renders smoothly in the background!\n\nThe exact text output on the screen will be:\n`[Input: Filter items...] Updating...`\n`Item 1`\n`Item 2`\n`...`",
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
      "id": "server-components",
      "title": "Server Components Intro",
      "content": "\n# Server Components Intro\n\n### What is it?\n**Building on client single page applications:** **React Server Components (RSC)** execute exclusively on the server at request or build time, reading databases directly with zero client JavaScript bundle cost.\n\n> \ud83d\udca1 **Mental Model:** Think of Server Components like a restaurant's kitchen versus its dining room: the kitchen (server) prepares the dish once and sends out the finished plate \u2014 it doesn't need salt shakers or napkin holders (client interactivity), those only live out in the dining room (Client Components).\n\n### Why do we need it?\nHistorically, all React components ran in the browser. This meant your users had to download large JavaScript bundles, and components had to make slow API requests over the network to fetch data from the server.\n\n### How?\nServer Components have zero impact on bundle size, and they can read directly from your database without an API layer! By default in modern frameworks like Next.js, **all components are Server Components**. Because Server Components never reach the browser, they **cannot** use interactivity (`onClick`, `onChange`) or client hooks (`useState`, `useEffect`). If a component needs interactivity, you must explicitly mark it as a **Client Component** by adding the `'use client'` directive to the very top of the file.\n\n### Syntax/Example\n```jsx\n// This causes the file to be treated as a Client Component,\n// allowing the use of interactive hooks like useState and useEffect\n\"use client\";\n\nimport { useState } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(count + 1)}>\n      Clicked {count} times\n    </button>\n  );\n}\n```\n\n### Example\n```jsx\n'use client';\n\nimport { useState } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>{count}</button>;\n}\n```\n\n### Challenge and Solution\n**Challenge:** *(Note: Sandpack runs entirely in your browser, so we are simulating the framework enforcement here!)* The `Counter` component below uses `useState` and an `onClick` handler. Mark this file as a Client Component.\n\n**Solution:** Add `'use client';` to the very top of the file.\n\n### Hints\n* **The Boundary Model:** The `\"use client\"` directive does not mean \"render on the client\"—it creates a **boundary** where everything below it is bundled into the client JS and hydrated in the browser. \n",
      "starterCode": "// 👉 2. Add the 'use client'; directive to the very top of this file!\n\nimport { useState } from 'react';\n\nexport default function Counter() {\n  // 👉 1. This component uses client interactivity (useState and onClick)!\n  const [count, setCount] = useState(0);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <h1>Interactive Counter</h1>\n      <p>Current count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n    </div>\n  );\n}",
      "solutionCode": "'use client';\n\nimport { useState } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <h1>Interactive Counter</h1>\n      <p>Current count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "'use client';\n\nimport { useState } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>{count}</button>;\n}",
        "steps": [
          {
            "highlightLines": [
              1
            ],
            "description": "In a framework that supports React Server Components, components run **on the server by default**. They can read a database or the filesystem directly and they ship no JavaScript to the browser — but they cannot hold state or handle events.\n\n`'use client'` opts this file out of that default.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6,
              7
            ],
            "description": "And it has to, because of these two lines. `useState` needs somewhere to keep state across renders and `onClick` needs a live event listener — neither exists in HTML generated once on a server.\n\nThe rule follows from the mechanics rather than from taste: interactivity means client.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              5
            ],
            "description": "The directive marks a **boundary**, not a single component. This file and everything it imports gets bundled and sent to the browser for hydration.\n\nSo its position matters more than it looks. Put `'use client'` at the top of a layout and the entire subtree below it becomes client code, which is the usual way an app that adopted RSC ends up shipping the same bundle it had before.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              3
            ],
            "description": "The direction of the boundary is one-way: a server component can render a client component, but a client component cannot import a server one. It can still *receive* one — passed in as `children` — which is the pattern for keeping an interactive shell around server-rendered content.\n\nThe exact text output on the screen will be:\n`[Button: 0]`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "'use client';\n\nimport { useState } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <h1>Interactive Counter</h1>\n      <p>Current count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              1
            ],
            "description": "We add `'use client';` at the top of the file.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6,
              12
            ],
            "description": "Now the component can safely use interactive hooks like `useState` and `onClick`!\n\nThe exact text output on the screen will be:\n`Interactive Counter`\n`Current count: 0`\n`[Button: Increment]`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Can Server Components use `useState`?",
          "type": "misconception",
          "walkthrough": {
            "code": "export default async function Page() {\n  const [count, setCount] = useState(0); // ERROR!\n  const data = await db.query('...');\n}",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "Server Components (RSC) run entirely on the server and are completely stateless. They have no memory, no lifecycle, and never re-render."
              },
              {
                "highlightLines": [
                  2
                ],
                "description": "Because of this, you cannot use any interactivity hooks like `useState` or `useEffect`. If you need interactivity, you must declare it as a \\\"use client\\\" component."
              }
            ]
          }
        },
        {
          "title": "Wait, isn't SSR the same as Server Components?",
          "type": "misconception",
          "walkthrough": {
            "code": "// Traditional SSR: Renders to HTML, then hydrates on client\n// React Server Components (RSC): Never ships JS to client at all!",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "Traditional SSR (like old Next.js pages) renders HTML on the server, but still sends the massive JavaScript bundle to the browser to make it interactive."
              },
              {
                "highlightLines": [
                  2
                ],
                "description": "React Server Components are a completely new paradigm. The component executes on the server, streams JSON data to the browser, and the code for that component is NEVER downloaded by the user!"
              }
            ]
          }
        },
        {
          "title": "Can I import a Server Component into a Client Component?",
          "type": "misconception",
          "walkthrough": {
            "code": "'use client';\n// FATAL ERROR\nimport ServerConfig from './ServerConfig';\n\nfunction ClientApp() { return <ServerConfig />; }",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "You absolutely cannot import a Server Component directly into a file marked `'use client'`."
              },
              {
                "highlightLines": [
                  4
                ],
                "description": "Because the Client Component is downloaded to the browser, the browser would try to download the Server Component code too! You must pass the Server Component down as a `children` prop from a higher Server Component instead."
              }
            ]
          }
        },
        {
          "title": "The Flight Stream Protocol: How RSCs Send Data to the Browser",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// RSCs stream a JSON-like Flight Stream to the browser:\n// M1:{\"id\":\"./Card.js\",\"name\":\"Card\"}\n// J0:[\"$\",\"div\",null,{\"className\":\"container\",\"children\":[\"$\",\"$L1\",null,{}]}]",
            "steps": [
              {
                "highlightLines": [
                  2,
                  3
                ],
                "description": "React Server Components do not send HTML strings. They stream a compact Virtual DOM instruction set called the Flight Protocol."
              },
              {
                "highlightLines": [
                  3
                ],
                "description": "The client browser merges this stream directly into the live client DOM tree without losing in-flight state or resetting focus!"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "actions-api",
      "title": "Actions API (React 19)",
      "content": "\n# Async Forms with Actions\n\n### What is it?\n**Building on forms and event handlers:** React 19 **Actions** standardize asynchronous form submissions and mutations, replacing manual `onSubmit` handlers, `e.preventDefault()`, and custom `isPending` state tracking.\n\n> \ud83d\udca1 **Mental Model:** Think of the Actions API like a hotel concierge desk: you hand in one request (submit) and the concierge handles showing you a \\\"working on it\\\" status, then either a confirmation or an apology \u2014 you don't have to personally track and display each step yourself.\n\n### Why do we need it?\nFor live validation (like character counters), controlled inputs are still perfect. But for handling asynchronous form submission, manually tracking `isPending` state, catching errors, and calling `e.preventDefault()` is incredibly tedious boilerplate.\n\n### How?\nThe Actions family of hooks (`useActionState`, `useFormStatus`, `useOptimistic`) handles pending states, error handling, and optimistic UI automatically when you pass a function to the `<form action={...}>` prop.\n\n### Syntax/Example\n```jsx\nfunction UpdateProfile() {\n  async function action(formData) {\n    const name = formData.get('name');\n    await fetch('https://jsonplaceholder.typicode.com/users', { method: 'POST', body: JSON.stringify({name}) });\n  }\n\n  return (\n    <form action={action}>\n      <input name=\"name\" />\n      <button type=\"submit\">Update</button>\n    </form>\n  );\n}\n```\n\n### Example\n```jsx\nimport { useActionState } from 'react';\n\nasync function submitAction(prevState, formData) {\n  await new Promise(r => setTimeout(r, 1000));\n  return { message: \"Saved \" + formData.get(\"email\") };\n}\n\nfunction App() {\n  const [state, formAction, isPending] = useActionState(submitAction, null);\n  return (\n    <form action={formAction}>\n      <input name=\"email\" />\n      <button disabled={isPending}>{isPending ? \"Loading...\" : \"Submit\"}</button>\n      {state?.message && <p>{state.message}</p>}\n    </form>\n  );\n}\n\nexport default App;\n```\n\n### Challenge and Solution\n**Challenge:** Refactor the manual loading state in `Newsletter` to use `useActionState`.\n\n**Solution:** Add `const [state, formAction, isPending] = useActionState(submitAction, null);`. Remove `handleSubmit`, `isPending`, and `message` states. Change `<form onSubmit={...}>` to `<form action={formAction}>`. Replace `message` with `state?.message`.\n\n### Hints\n* **FormData:** Notice how the action function receives `formData`. You don't need to manually read `e.target` anymore. Just call `formData.get(\"inputName\")`!\n",
      "starterCode": "import { useState, useActionState } from 'react';\n\n// A fake server action\nasync function submitAction(prevState, formData) {\n  await new Promise(r => setTimeout(r, 1000));\n  return { message: \"Saved \" + formData.get(\"email\") };\n}\n\nexport default function Newsletter() {\n  // ❌ Manually tracking pending state is tedious!\n  const [isPending, setIsPending] = useState(false);\n  const [message, setMessage] = useState(null);\n\n  const handleSubmit = async (e) => {\n    e.preventDefault();\n    setIsPending(true);\n    const formData = new FormData(e.target);\n    const result = await submitAction(null, formData);\n    setMessage(result.message);\n    setIsPending(false);\n  };\n\n  return (\n    <form onSubmit={handleSubmit}>\n      <input name=\"email\" placeholder=\"Email\" required />\n      <button disabled={isPending}>\n        {isPending ? \"Subscribing...\" : \"Subscribe\"}\n      </button>\n      {message && <p>{message}</p>}\n    </form>\n  );\n}\n",
      "solutionCode": "import { useActionState } from 'react';\n\n// A fake server action\nasync function submitAction(prevState, formData) {\n  await new Promise(r => setTimeout(r, 1000));\n  return { message: \"Saved \" + formData.get(\"email\") };\n}\n\nexport default function Newsletter() {\n  const [state, formAction, isPending] = useActionState(submitAction, null);\n\n  return (\n    <form action={formAction}>\n      <input name=\"email\" placeholder=\"Email\" required />\n      <button disabled={isPending}>\n        {isPending ? \"Subscribing...\" : \"Subscribe\"}\n      </button>\n      {state?.message && <p>{state.message}</p>}\n    </form>\n  );\n}\n",
      "exampleWalkthrough": {
        "code": "import { useActionState } from 'react';\n\nasync function submitAction(prevState, formData) {\n  await new Promise(r => setTimeout(r, 1000));\n  return { message: \"Saved \" + formData.get(\"email\") };\n}\n\nfunction App() {\n  const [state, formAction, isPending] = useActionState(submitAction, null);\n  return (\n    <form action={formAction}>\n      <input name=\"email\" />\n      <button disabled={isPending}>{isPending ? \"Loading...\" : \"Submit\"}</button>\n      {state?.message && <p>{state.message}</p>}\n    </form>\n  );\n}\n\nexport default App;",
        "steps": [
          {
            "highlightLines": [
              9
            ],
            "description": "`useActionState` returns three things: the value the action last returned, a wrapped action to hand to the form, and a pending flag. One hook replaces the `isSubmitting` state, the `result` state, and the `try/finally` that usually surround a form submit.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              11
            ],
            "description": "Passing that action to `<form action={...}>` is what wires it up. React intercepts the submission, calls `preventDefault` for you, gathers the fields into a `FormData`, and invokes your function with it.\n\nThe inputs need no `value` and no `onChange` — they are uncontrolled, and `name` is what makes each one show up in the `FormData`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              3,
              4,
              5
            ],
            "description": "The action itself is an ordinary async function taking `(previousState, formData)`. Whatever it returns becomes the new `state`, which is how the result gets back to the UI without a `setState` anywhere.\n\nIt is also a plain function: no React APIs inside, nothing to mock, testable on its own.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              13,
              14
            ],
            "description": "`isPending` is managed by React for the whole lifetime of the action, so disabling the button and swapping its label needs no state of its own.\n\nSubmit the form and the button reads `Loading...` for a second before the message appears.\n\nThe exact text output on the screen will be:\n`[Input: email] [Button: Submit]`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useActionState } from 'react';\n\nasync function submitAction(prevState, formData) {\n  await new Promise(r => setTimeout(r, 1000));\n  return { message: \"Saved \" + formData.get(\"email\") };\n}\n\nexport default function Newsletter() {\n  const [state, formAction, isPending] = useActionState(submitAction, null);\n\n  return (\n    <form action={formAction}>\n      <input name=\"email\" placeholder=\"Email\" required />\n      <button disabled={isPending}>\n        {isPending ? \"Subscribing...\" : \"Subscribe\"}\n      </button>\n      {state?.message && <p>{state.message}</p>}\n    </form>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              9
            ],
            "description": "We replace all the manual `useState` calls with `useActionState`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              12
            ],
            "description": "We pass `formAction` directly to the `action` prop of the form.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              14,
              17
            ],
            "description": "We use `isPending` to disable the button, and display `state.message` when it arrives! No more `e.preventDefault()`!\n\nThe exact text output on the screen will be:\n`[Input: Email] [Button: Subscribe]`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "The magic of Actions",
          "type": "did-you-know",
          "walkthrough": {
            "code": "<form action={submitData}>\n  <input name=\"username\" />\n  <button type=\"submit\">Go</button>\n</form>",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "In React 19, you can pass a function directly to the HTML `action` attribute."
              },
              {
                "highlightLines": [
                  1
                ],
                "description": "React automatically intercepts the form submission, prevents the default reload, extracts the FormData, and manages the pending state for you entirely behind the scenes!"
              }
            ]
          }
        },
        {
          "title": "Can Actions handle JavaScript disabled browsers?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "<form action={submitData}>\n  <button type=\"submit\">Go</button>\n</form>",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "If you use Next.js or Remix with Server Actions, this exact React code degrades gracefully!"
              },
              {
                "highlightLines": [
                  1
                ],
                "description": "If the user's browser fails to load JavaScript, clicking Submit will trigger a standard HTML POST request, and the server action will still execute flawlessly."
              }
            ]
          }
        },
        {
          "title": "What is `useActionState`?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "const [state, formAction, isPending] = useActionState(updateName, { error: null });\n\n<form action={formAction}>\n  {state.error && <p>{state.error}</p>}",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "`useActionState` (React 19) is a massive quality of life upgrade for forms."
              },
              {
                "highlightLines": [
                  1,
                  4
                ],
                "description": "It automatically manages the pending state of your action, and catches whatever data your action returns (like validation errors) so you can easily render them."
              }
            ]
          }
        },
        {
          "title": "useFormStatus: Context-Free Pending Buttons",
          "type": "did-you-know",
          "walkthrough": {
            "code": "import { useFormStatus } from 'react-dom';\n\nfunction SubmitButton() {\n  const { pending } = useFormStatus();\n  return <button disabled={pending}>{pending ? 'Saving...' : 'Save'}</button>;\n}\n\n// Inside parent form:\n<form action={action}>\n  <input name=\"title\" />\n  <SubmitButton />\n</form>",
            "steps": [
              {
                "highlightLines": [
                  4,
                  5
                ],
                "description": "`useFormStatus` lets deeply nested child components read the parent `<form>`'s submission status without any prop drilling!"
              },
              {
                "highlightLines": [
                  9,
                  11
                ],
                "description": "Note: `useFormStatus` must be called from a component rendered INSIDE the `<form>`, not in the same component that renders the `<form>` tag itself."
              }
            ]
          }
        },
        {
          "title": "The happy path isn't the whole story — handling a rejected action",
          "type": "did-you-know",
          "walkthrough": {
            "code": "async function submitAction(prevState, formData) {\n  const email = formData.get('email');\n  if (!email.includes('@')) {\n    return { message: null, error: 'Enter a valid email address.' };\n  }\n  try {\n    await subscribeUser(email);\n    return { message: 'Subscribed!', error: null };\n  } catch (err) {\n    return { message: null, error: 'Something went wrong. Try again.' };\n  }\n}\n\nfunction Newsletter() {\n  const [state, formAction, isPending] = useActionState(submitAction, { message: null, error: null });\n  return (\n    <form action={formAction}>\n      <input name=\"email\" />\n      <button disabled={isPending}>{isPending ? 'Loading...' : 'Subscribe'}</button>\n      {state.error && <p style={{ color: 'red' }}>{state.error}</p>}\n      {state.message && <p>{state.message}</p>}\n    </form>\n  );\n}",
            "steps": [
              {
                "highlightLines": [2, 3, 4, 8, 9, 10],
                "description": "An action function can return failure the same way it returns success — as a value in the state object, not by throwing. Both a validation failure (bad input) and a caught exception (the request itself failing) resolve to the same shape: `{ message, error }`, with only one of the two ever set.",
              },
              {
                "highlightLines": [17],
                "description": "The component reads `state.error` exactly the way it reads `state.message` — there's no separate error-handling code path, no try/catch in the component itself. `useActionState` doesn't distinguish success from failure for you; the action function's return value is the single source of truth for what to render.",
              },
              {
                "highlightLines": [],
                "description": "This matters together with `useOptimistic`: if an action optimistically shows success immediately and then the action actually fails, returning an error from the action is what lets the UI roll back and explain what happened, instead of leaving the optimistic (wrong) state on screen forever.",
              }
            ]
          }
        }
      ]
    },
    {
      "id": "use-optimistic",
      "title": "Optimistic UI",
      "content": "\n# Optimistic UI with useOptimistic\n\n### What is it?\n**Building on Actions and state updates:** **`useOptimistic`** is a React 19 hook that lets you speculatively update the UI while a background mutation is in-flight, automatically rolling back if the request fails.\n\n> \ud83d\udca1 **Mental Model:** Think of optimistic UI like a barista calling out your name for a coffee before it's fully poured \u2014 it feels instant, but if the machine jams, they have to walk back and correct what they told you.\n\n### Why do we need it?\nIf a user clicks \"Like\", they shouldn't have to wait 2 seconds for the server to respond before the heart icon turns red. If the UI feels sluggish, users think your app is slow.\n\n### How?\nUpdate the UI immediately as if the action succeeded, then revert/replace with the real result when the server responds. This is the canonical pattern for any mutation (delete, like, add) in a connected app.\n\n### Syntax/Example\n```javascript\nconst [optimisticState, addOptimistic] = useOptimistic(\n  state,\n  // updateFn\n  (currentState, optimisticValue) => {\n    // merge and return new state with optimistic value\n    return [...currentState, optimisticValue];\n  }\n);\n```\n\n### Example\n```jsx\nimport { useState, useOptimistic } from 'react';\n\nfunction App() {\n  const [messages, setMessages] = useState(['Hello']);\n  const [optimisticMessages, addOptimisticMessage] = useOptimistic(\n    messages,\n    (state, newMsg) => [...state, newMsg]\n  );\n\n  async function action(formData) {\n    const msg = formData.get('msg');\n    addOptimisticMessage(msg + ' (sending...)');\n    await new Promise(r => setTimeout(r, 1000));\n    setMessages(prev => [...prev, msg]);\n  }\n\n  return (\n    <form action={action}>\n      {optimisticMessages.map((m, i) => <div key={i}>{m}</div>)}\n      <input name=\"msg\" />\n      <button>Send</button>\n    </form>\n  );\n}\n\nexport default App;\n```\n\n### Challenge and Solution\n**Challenge:** The starter code is missing the `useOptimistic` call. Add it so clicking a todo updates immediately without waiting 1.5 seconds.\n\n**Solution:** Add `const [optimisticTodos, setOptimistic] = useOptimistic(todos);` to `TodoList`. In `handleToggle`, call `setOptimistic(current => current.map(t => t.id === id ? { ...t, done: !t.done } : t));` before `await formAction(formData);`. Render `optimisticTodos` instead of `todos`.\n\n### Hints\n* **Automated Rollback:** If the server action throws an error, `useOptimistic` automatically reverts the state back to the \"real\" state when the action completes. You never need to write manual rollback logic!\n",
      "starterCode": "import { useState, useActionState } from 'react';\n\nconst initialTodos = [\n  { id: 1, text: 'Learn React', done: false },\n  { id: 2, text: 'Build something', done: false },\n];\n\nasync function toggleTodoAction(prevState, formData) {\n  const id = Number(formData.get('id'));\n  await new Promise(r => setTimeout(r, 1500));\n  return prevState.map(t => t.id === id ? { ...t, done: !t.done } : t);\n}\n\nexport default function TodoList() {\n  const [todos, formAction] = useActionState(toggleTodoAction, initialTodos);\n\n  async function handleToggle(formData) {\n    await formAction(formData);\n  }\n\n  return (\n    <ul style={{ padding: 20 }}>\n      {todos.map(todo => (\n        <li key={todo.id} style={{ opacity: todo.done ? 0.5 : 1 }}>\n          <form action={handleToggle}>\n            <input type=\"hidden\" name=\"id\" value={todo.id} />\n            <button type=\"submit\">\n              {todo.done ? '✓' : '○'} {todo.text}\n            </button>\n          </form>\n        </li>\n      ))}\n    </ul>\n  );\n}",
      "solutionCode": "import { useOptimistic, useActionState } from 'react';\n\nconst initialTodos = [\n  { id: 1, text: 'Learn React', done: false },\n  { id: 2, text: 'Build something', done: false },\n];\n\nasync function toggleTodoAction(prevState, formData) {\n  const id = Number(formData.get('id'));\n  await new Promise(r => setTimeout(r, 1500));\n  return prevState.map(t => t.id === id ? { ...t, done: !t.done } : t);\n}\n\nexport default function TodoList() {\n  const [todos, formAction] = useActionState(toggleTodoAction, initialTodos);\n  const [optimisticTodos, setOptimistic] = useOptimistic(todos);\n\n  async function handleToggle(formData) {\n    const id = Number(formData.get('id'));\n    setOptimistic(current =>\n      current.map(t => t.id === id ? { ...t, done: !t.done } : t)\n    );\n    await formAction(formData);\n  }\n\n  return (\n    <ul style={{ padding: 20 }}>\n      {optimisticTodos.map(todo => (\n        <li key={todo.id} style={{ opacity: todo.done ? 0.5 : 1 }}>\n          <form action={handleToggle}>\n            <input type=\"hidden\" name=\"id\" value={todo.id} />\n            <button type=\"submit\">\n              {todo.done ? '✓' : '○'} {todo.text}\n            </button>\n          </form>\n        </li>\n      ))}\n    </ul>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useState, useOptimistic } from 'react';\n\nfunction App() {\n  const [messages, setMessages] = useState(['Hello']);\n  const [optimisticMessages, addOptimisticMessage] = useOptimistic(\n    messages,\n    (state, newMsg) => [...state, newMsg]\n  );\n\n  async function action(formData) {\n    const msg = formData.get('msg');\n    addOptimisticMessage(msg + ' (sending...)');\n    await new Promise(r => setTimeout(r, 1000));\n    setMessages(prev => [...prev, msg]);\n  }\n\n  return (\n    <form action={action}>\n      {optimisticMessages.map((m, i) => <div key={i}>{m}</div>)}\n      <input name=\"msg\" />\n      <button>Send</button>\n    </form>\n  );\n}\n\nexport default App;",
        "steps": [
          {
            "highlightLines": [
              5,
              8
            ],
            "description": "`useOptimistic` takes the real state and a reducer describing how to apply a pending change on top of it. It returns the merged view plus a function to add one.\n\nThe important part is that it never touches `messages`. The optimistic value is a temporary layer over the truth, not an edit to it.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              12
            ],
            "description": "Calling it applies the reducer immediately, so the new message is on screen before the request has left. The user sees their own action land instantly, which is the entire point.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              13,
              14
            ],
            "description": "When the action finishes, React discards the optimistic layer and re-reads the real state — which the line above has just updated, so the temporary entry is replaced by the confirmed one.\n\nAnd if the action throws instead, the layer is discarded with nothing to replace it: the message disappears and the UI is back to the truth automatically. No manual rollback, which is the part hand-rolled optimistic updates usually get wrong.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              19
            ],
            "description": "The rendered list reads from `optimisticMessages`, never from `messages`. Reading the real state here would defeat the whole arrangement.\n\nWorth using where success is overwhelmingly likely and reversible — a sent message, a toggled like. Not for something the user would be misled by if it failed, such as a completed payment.\n\nThe exact text output on the screen will be:\n`Hello`\n`[Input] [Button: Send]`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "export default function TodoList() {\n  const [todos, formAction] = useActionState(toggleTodoAction, initialTodos);\n  const [optimisticTodos, setOptimistic] = useOptimistic(todos);\n\n  async function handleToggle(formData) {\n    const id = Number(formData.get('id'));\n    setOptimistic(current =>\n      current.map(t => t.id === id ? { ...t, done: !t.done } : t)\n    );\n    await formAction(formData);\n  }\n\n  return (\n    <ul style={{ padding: 20 }}>\n      {optimisticTodos.map(todo => (\n        <li key={todo.id}>\n        {/* ... */}\n        </li>\n      ))}\n    </ul>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3
            ],
            "description": "We initialize `useOptimistic` passing in the `todos` from our `useActionState`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7,
              9
            ],
            "description": "Before we await the real server action, we synchronously update the optimistic state to flip the `done` boolean.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              15
            ],
            "description": "We render `optimisticTodos` instead of `todos`. Now the UI reacts instantly!\n\nThe exact text output on the screen will be:\n`○ Learn React`\n`○ Build something`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "What is Optimistic UI?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "const [optimisticLikes, addOptimisticLike] = useOptimistic(\n  likes, \n  (state, newLike) => state + newLike\n);",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2,
                  3,
                  4
                ],
                "description": "When you click 'Like' on Twitter, the heart instantly turns red without waiting for the database response."
              },
              {
                "highlightLines": [
                  1,
                  2,
                  3,
                  4
                ],
                "description": "This is optimistic UI! We optimistically update the screen immediately. If the server eventually returns an error, we roll back the UI to the truth automatically."
              }
            ]
          }
        },
        {
          "title": "What happens if the API fails?",
          "type": "misconception",
          "walkthrough": {
            "code": "const [optimisticState, addOptimistic] = useOptimistic(state);\n\naction(async () => {\n  addOptimistic(newValue); // Instantly updates UI\n  await api.save(newValue); // If this throws an error...\n});",
            "steps": [
              {
                "highlightLines": [
                  5
                ],
                "description": "If the `await api.save()` throws an error, the Action fails."
              },
              {
                "highlightLines": [
                  4,
                  5
                ],
                "description": "React automatically catches the error and instantly rolls the `optimisticState` back to the exact truth from the server, erasing the fake value. No manual rollback code required!"
              }
            ]
          }
        },
        {
          "title": "Does `useOptimistic` persist across page reloads?",
          "type": "misconception",
          "walkthrough": {
            "code": "const [optimistic, addOptimistic] = useOptimistic(likes);",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "No! Optimistic state lives entirely in the browser's short-term memory during a single session."
              },
              {
                "highlightLines": [
                  1
                ],
                "description": "If the user refreshes the page before the server action actually finishes and saves to the database, the optimistic update will be completely lost."
              }
            ]
          }
        }
      ]
    }
  ]
};
