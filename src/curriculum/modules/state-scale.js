export default {
  "id": "state-scale",
  "title": "State Management at Scale",
  "description": "Classify client state and server state before choosing tools.",
  "lessons": [
    {
      "id": "zustand",
      "title": "External Client State with Zustand",
      "dependencies": {
        "zustand": "^5.0.0"
      },
      "content": "\n# Global State with Zustand\n\n### What is it?\n**Building on Context and useReducer:** While Context re-renders every consumer whenever any value changes, **Zustand** manages global state outside the React tree with fine-grained selectors so components only re-render when their specific slice changes.\n\n> \ud83d\udca1 **Mental Model:** Think of a Zustand store like a shared office whiteboard: anyone who needs to check the current plan can walk up and read it, and anyone who's allowed can update it — nobody needs to mail a printed copy (props) to every desk in the building just to keep everyone in sync.\n\n### Why do we need it?\nReact Context is great for passing data down the tree without \"prop drilling\". However, it has a major performance flaw: **when a Context value changes, consumers of that changed value can be scheduled to re-render; non-consumers are not automatically affected.** If you put your entire app's state into one Context, typing in a single input field might re-render your entire application! To fix this with Context, you have to split your state into dozens of tiny, separate Contexts—which quickly becomes a nightmare to manage.\n\n### How?\nZustand creates a store *outside* of React. Components then \"subscribe\" to the store using **selectors**. A component will *only* re-render if the specific slice of state it selected has changed.\n\n### Syntax/Example\n```jsx\nimport { create } from 'zustand';\n\n// This creates a global store with state and actions\nconst useStore = create((set) => ({\n  bears: 0,\n  \n  // This causes the global 'bears' state to increment\n  increaseBears: () => set((state) => ({ bears: state.bears + 1 })),\n}));\n\nfunction BearCounter() {\n  // This returns the current 'bears' value and subscribes the\n  // component to updates\n  const bears = useStore((state) => state.bears);\n  return <h1>{bears} around here ...</h1>;\n}\n```\n\n### Example\n```jsx\nimport { create } from 'zustand';\n\nconst useAuthStore = create((set) => ({\n  user: null,\n  login: (name) => set({ user: name }),\n  logout: () => set({ user: null })\n}));\n\nfunction Profile() {\n  const user = useAuthStore((state) => state.user);\n  const logout = useAuthStore((state) => state.logout);\n  if (!user) return <p>Please log in</p>;\n  return <div>Welcome, {user}! <button onClick={logout}>Log Out</button></div>;\n}\n\nfunction App() {\n  const login = useAuthStore((state) => state.login);\n  return (\n    <div>\n      <button onClick={() => login(\"Alice\")}>Login Alice</button>\n      <Profile />\n    </div>\n  );\n}\n\nexport default App;\n```\n\n### Challenge and Solution\n**Challenge:** Add a `fishes: 0` state and an `addFish` action to the store in `src/store/useZooStore.js`. Then update `FishCounter` in `src/components/ZooDisplay.jsx` to select only `fishes`, and wire `addFish` to the \"Add Fish\" button in `App.jsx`.\n\n**Solution:** In `useZooStore`, add `fishes: 0, addFish: () => set((state) => ({ fishes: state.fishes + 1 }))`. In `FishCounter`, `const fishes = useZooStore((state) => state.fishes);`. In `App`, `const addFish = useZooStore((state) => state.addFish);` and attach it with `<button onClick={addFish}>Add Fish</button>`.\n\n### Hints\n* **Redux Toolkit** is another popular option. It is incredibly powerful and strict, making it great for massive enterprise teams. But it requires significant boilerplate.\n* **Middleware:** Zustand's real power shines with middleware. The `persist` middleware automatically saves your state to `localStorage`. The `devtools` middleware connects your store to the Redux DevTools extension for deep time-travel debugging.\n",
      "starterCode": {
        "/src/store/useZooStore.js": {
          "code": "import { create } from 'zustand';\n\nexport const useZooStore = create((set) => ({\n  bears: 0,\n  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),\n  // 👉 Add fishes: 0 and addFish action here!\n}));\n"
        },
        "/src/components/ZooDisplay.jsx": {
          "code": "import { useZooStore } from '../store/useZooStore';\n\nexport function BearCounter() {\n  const bears = useZooStore((state) => state.bears);\n  return <h2>{bears} bears</h2>;\n}\n\nexport function FishCounter() {\n  // 👉 2. Select ONLY the fishes state here!\n  return <h2>0 fishes</h2>;\n}\n"
        },
        "/App.jsx": {
          "code": "import { useZooStore } from './src/store/useZooStore';\nimport { BearCounter, FishCounter } from './src/components/ZooDisplay';\n\nexport default function App() {\n  const increasePopulation = useZooStore((state) => state.increasePopulation);\n  // 👉 3. Get the addFish action and attach it to the button!\n\n  return (\n    <div style={{ padding: 20 }}>\n      <h1>Zustand Zoo (Multi-File Architecture)</h1>\n      <BearCounter />\n      <FishCounter />\n      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>\n        <button onClick={increasePopulation}>Add Bear</button>\n        <button>Add Fish</button>\n      </div>\n    </div>\n  );\n}\n",
          "active": true
        }
      },
      "solutionCode": {
        "/src/store/useZooStore.js": {
          "code": "import { create } from 'zustand';\n\nexport const useZooStore = create((set) => ({\n  bears: 0,\n  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),\n  fishes: 0,\n  addFish: () => set((state) => ({ fishes: state.fishes + 1 }))\n}));\n"
        },
        "/src/components/ZooDisplay.jsx": {
          "code": "import { useZooStore } from '../store/useZooStore';\n\nexport function BearCounter() {\n  const bears = useZooStore((state) => state.bears);\n  return <h2>{bears} bears</h2>;\n}\n\nexport function FishCounter() {\n  const fishes = useZooStore((state) => state.fishes);\n  return <h2>{fishes} fishes</h2>;\n}\n"
        },
        "/App.jsx": {
          "code": "import { useZooStore } from './src/store/useZooStore';\nimport { BearCounter, FishCounter } from './src/components/ZooDisplay';\n\nexport default function App() {\n  const increasePopulation = useZooStore((state) => state.increasePopulation);\n  const addFish = useZooStore((state) => state.addFish);\n\n  return (\n    <div style={{ padding: 20 }}>\n      <h1>Zustand Zoo (Multi-File Architecture)</h1>\n      <BearCounter />\n      <FishCounter />\n      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>\n        <button onClick={increasePopulation}>Add Bear</button>\n        <button onClick={addFish}>Add Fish</button>\n      </div>\n    </div>\n  );\n}\n",
          "active": true
        }
      },
      "exampleWalkthrough": {
        "code": "import { create } from 'zustand';\n\nconst useAuthStore = create((set) => ({\n  user: null,\n  login: (name) => set({ user: name }),\n  logout: () => set({ user: null })\n}));\n\nfunction Profile() {\n  const user = useAuthStore((state) => state.user);\n  const logout = useAuthStore((state) => state.logout);\n  if (!user) return <p>Please log in</p>;\n  return <div>Welcome, {user}! <button onClick={logout}>Log Out</button></div>;\n}\n\nfunction App() {\n  const login = useAuthStore((state) => state.login);\n  return (\n    <div>\n      <button onClick={() => login(\"Alice\")}>Login Alice</button>\n      <Profile />\n    </div>\n  );\n}\n\nexport default App;",
        "steps": [
          {
            "highlightLines": [
              3,
              7
            ],
            "description": "The store is created once, at module scope, outside React entirely. It is a plain object with functions on it, and it exists whether or not anything is rendering.\n\nThat placement is the design. There is no provider to wrap the app in and no context boundary, so any component anywhere can reach this state without a shared ancestor.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10,
              11
            ],
            "description": "A component subscribes by calling the hook with a **selector**. `(state) => state.user` says \"wake me only when this slice changes\".\n\nZustand runs every selector after a change and compares the result. `Profile` re-renders when `user` changes and stays still for anything else in the store — the fine-grained subscription that Context cannot express, since a Context change re-renders every consumer.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              5,
              6
            ],
            "description": "Actions live in the store next to the data they change, so `login` and `logout` are not props anybody has to thread anywhere. `set` merges at the top level, which is why `set({ user: name })` leaves the rest of the store alone.\n\nSelecting an action is a deliberate choice too: `logout` is a stable function reference, so subscribing to it never causes a re-render.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              20,
              21
            ],
            "description": "Click **Login Alice** and `Profile` updates, with no state lifted, no props passed, and no provider in the tree.\n\nThe caveat this lesson exists to plant: reach for this for **client** state that is genuinely global — theme, auth, an open modal. Server data has different problems (caching, staleness, refetching) and belongs in the next lesson's tool, not here.\n\nThe exact text output on the screen will be:\n`[Button: Login Alice]`\n`Please log in`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "// src/store/useZooStore.js\nexport const useZooStore = create((set) => ({\n  bears: 0,\n  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),\n  fishes: 0,\n  addFish: () => set((state) => ({ fishes: state.fishes + 1 }))\n}));\n\n// src/components/ZooDisplay.jsx\nexport function FishCounter() {\n  const fishes = useZooStore((state) => state.fishes);\n  return <h2>{fishes} fishes</h2>;\n}\n\n// App.jsx\nconst increasePopulation = useZooStore((state) => state.increasePopulation);\nconst addFish = useZooStore((state) => state.addFish);\n\n<button onClick={increasePopulation}>Add Bear</button>\n<button onClick={addFish}>Add Fish</button>",
        "steps": [
          {
            "highlightLines": [
              5,
              6
            ],
            "description": "We add `fishes` and `addFish` to the Zustand store. Note that the store lives in its own file and is imported wherever it is needed — no provider, no shared ancestor.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10,
              11
            ],
            "description": "We use a selector `(state) => state.fishes` in `FishCounter`. It will now only re-render when `fishes` changes, not when `bears` does.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              17,
              20
            ],
            "description": "`App` selects the `addFish` action and attaches it to the button. Selecting an action is free: it is a stable function reference, so subscribing to it never causes a re-render.\n\nThe exact text output on the screen will be:\n`Zustand Zoo (Multi-File Architecture)`\n`0 bears`\n`0 fishes`\n`[Button: Add Bear] [Button: Add Fish]`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "The selector trap that freezes the app (Zustand 5)",
          "type": "misconception",
          "walkthrough": {
            "code": "import { useShallow } from 'zustand/react/shallow';\n\n// ❌ Infinite render loop — a fresh object every time the selector runs\nconst { bears, fishes } = useZooStore((s) => ({ bears: s.bears, fishes: s.fishes }));\n\n// ✅ Select each value separately — primitives compare by value\nconst bears = useZooStore((s) => s.bears);\nconst fishes = useZooStore((s) => s.fishes);\n\n// ✅ Or keep one selector and tell Zustand to compare shallowly\nconst { bears, fishes } = useZooStore(useShallow((s) => ({ bears: s.bears, fishes: s.fishes })));",
            "steps": [
              {
                "highlightLines": [
                  3,
                  4
                ],
                "description": "Zustand 5 is built on `useSyncExternalStore`, which compares each selector's result with `Object.is`. An object literal is a **new object every call**, so the comparison never matches, React is told the snapshot changed, it re-renders, the selector runs again, and around it goes — React eventually throws `Maximum update depth exceeded`.\n\nThis is the identity problem from the Rendering & Performance module, wearing a different hat. It was also a real bug in this very app: `LessonView.jsx` and `CodeActions.jsx` both carry a `v5` header comment recording the fix."
              },
              {
                "highlightLines": [
                  7,
                  8
                ],
                "description": "The simplest fix is to stop returning a composite at all. One selector per value returns primitives, which compare by value, so nothing looks changed unless it actually is."
              },
              {
                "highlightLines": [
                  11
                ],
                "description": "When you genuinely want several values from one selector, wrap it in `useShallow`. That swaps the equality check from \"same reference\" to \"same keys, same values\", which is what you meant in the first place.\n\nThe general rule for any external store: a selector must return something stable when the data has not changed."
              }
            ]
          }
        },
        {
          "title": "Why do I not need a Provider?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "import { create } from 'zustand';\n\nconst useStore = create((set) => ({ bears: 0 }));",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "Unlike Redux or Context, Zustand state lives completely outside of the React Tree."
              },
              {
                "highlightLines": [
                  3
                ],
                "description": "This means you don't need to wrap your entire app in a `<Provider>`. You just import the hook anywhere you need it, and Zustand handles the reactivity bindings internally!"
              }
            ]
          }
        },
        {
          "title": "Can I use Zustand outside of React?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "import useStore from './store';\n\n// In a vanilla JS file or WebSocket listener:\nuseStore.setState({ bears: 5 });",
            "steps": [
              {
                "highlightLines": [
                  4
                ],
                "description": "Because Zustand's core engine is completely agnostic to React, you can mutate and read state anywhere."
              },
              {
                "highlightLines": [
                  4
                ],
                "description": "This makes it incredibly powerful for integrating with WebSockets, Three.js, or complex Axios interceptors where React Hooks aren't allowed!"
              }
            ]
          }
        },
        {
          "title": "What problem does an external store solve compared with Context?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "const bears = useStore((state) => state.bears);",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "If you put `bears` and `fish` in a React Context, a component that only reads `bears` will still re-render when `fish` changes."
              },
              {
                "highlightLines": [
                  1
                ],
                "description": "Zustand uses a strict selector pattern. By returning `state.bears`, Zustand guarantees that this specific component will ONLY re-render if the `bears` property changes, entirely ignoring updates to `fish`."
              }
            ]
          }
        },
        {
          "title": "Atomic Selectors: How Zustand Prevents Unnecessary Renders",
          "type": "pro-tip",
          "walkthrough": {
            "code": "// ❌ Re-renders on ANY store change:\nconst { count } = useStore();\n\n// ✅ Re-renders ONLY when `count` specifically changes:\nconst count = useStore(state => state.count);",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "Calling `useStore()` without a selector subscribes to the entire state object, causing re-renders whenever any unrelated property updates."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "Passing an atomic selector `state => state.count` creates an isolated subscription that only wakes up when that specific value changes."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "react-query",
      "title": "Server State with React Query",
      "dependencies": {
        "@tanstack/react-query": "^5.0.0"
      },
      "content": "\n# Server State with React Query\n\n### What is it?\n**Building on useEffect data fetching:** Instead of manually managing loading booleans, error catches, caching, and race condition cleanups, **TanStack Query** manages server state as a robust, self-healing asynchronous cache.\n\n> \ud83d\udca1 **Mental Model:** Think of a server-state library like a hotel front desk that already knows your reservation: instead of every guest calling the reservation office themselves (fetching fresh every time), the front desk keeps a recently-checked copy on hand and only calls back to confirm when it's gotten stale.\n\n### Why do we need it?\nManually fetching data with `useEffect` means you have to handle loading states, errors, caching, deduplication, and race conditions all by yourself. It works for a simple tutorial, but it scales terribly in production. As your app handles more external data, you'll quickly realize that not all state is created equal.\n* **Client State** (like open modals, dark mode) belongs entirely to your app. It is synchronous and you have total control over it.\n* **Server State** (data fetched from a database) is different. It doesn't belong to you—it's an asynchronous snapshot of remote data that could become stale at any moment.\n\n### How?\nLibraries like TanStack Query treat remote data as a cache rather than global state. By simply passing a fetching function to the `useQuery` hook, React Query automatically deduplicates identical requests, caches the data in memory, handles `isLoading` and `error` states perfectly, and triggers automatic background refetches to keep data fresh.\n\n### Syntax/Example\n```jsx\nimport { useQuery } from '@tanstack/react-query';\n\nfunction UserProfile({ userId }) {\n  // This returns the fetched data, loading state, and error state\n  // It handles caching, retries, and deduplication automatically!\n  const { data, isLoading, error } = useQuery({\n    // This causes the query to be cached under the unique key\n    queryKey: ['user', userId],\n    // This defines the async function to fetch the data\n    queryFn: () => fetch('/api/users/' + userId).then(res => res.json()),\n  });\n\n  if (isLoading) return <span>Loading...</span>;\n  if (error) return <span>Error: {error.message}</span>;\n  return <div>{data.name}</div>;\n}\n```\n\n### Example\n```jsx\nimport { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';\n\nconst queryClient = new QueryClient();\n\nfunction Profile() {\n  const { data, isLoading } = useQuery({\n    queryKey: ['demo-user'],\n    queryFn: () => new Promise(resolve => setTimeout(() => resolve({ name: 'Alice' }), 1000))\n  });\n\n  if (isLoading) return <div>Loading...</div>;\n  return <div>Welcome, {data.name}!</div>;\n}\n\nfunction App() {\n  return (\n    <QueryClientProvider client={queryClient}>\n      <Profile />\n    </QueryClientProvider>\n  );\n}\n\nexport default App;\n```\n\n### Challenge and Solution\n**Challenge:** Replace the hardcoded variables in `UserList` with `useQuery` to fetch from `https://jsonplaceholder.typicode.com/users`. Then wire up the \"Add User\" button using `useMutation` so it posts a new user and invalidates the `['users']` query on success.\n\n**Solution:** Add `const { data, isLoading, error } = useQuery({ queryKey: ['users'], queryFn: () => fetch('https://jsonplaceholder.typicode.com/users').then(res => res.json()) });`. Remove the hardcoded `const isLoading = true;`, `const error = null;`, `const data = [];`. For the button, add `const queryClient = useQueryClient();` and `const addUser = useMutation({ mutationFn: (name) => fetch(url, { method: 'POST', body: JSON.stringify({ name }) }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }) });`, then call `addUser.mutate('New User')` from the button's `onClick`.\n\n### Hints\n* **Mutations & Invalidation:** Fetching data is only half the battle. React Query provides `useMutation` for POST/PUT/DELETE requests. After a successful mutation, you use `queryClient.invalidateQueries({ queryKey: ['users'] })` to instantly trigger a background refetch, perfectly synchronizing your server state.\n* **Expect the new user not to appear.** JSONPlaceholder is a read-only demo API: it accepts the POST and echoes a fake response, but it never actually stores anything. So the invalidation fires, the refetch runs correctly, and the list comes back exactly as it was. That is the API lying, not your code — watch the Network tab and the React Query devtools rather than the list to confirm the mutation worked.\n* Get the query client inside the component with `useQueryClient()` — it's how a mutation reaches back into the cache a `useQuery` elsewhere is reading from.\n",
      "starterCode": "import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';\n\nconst queryClient = new QueryClient();\n\nexport default function App() {\n  return (\n    <QueryClientProvider client={queryClient}>\n      <UserList />\n    </QueryClientProvider>\n  );\n}\n\nfunction UserList() {\n  // 👉 1. Call useQuery hook here instead of these hardcoded variables.\n  // 👉 2. Set queryKey to ['users']\n  // 👉 3. Set queryFn to fetch the JSONPlaceholder URL and return the parsed JSON.\n  \n  const isLoading = true; // Replace me!\n  const error = null;     // Replace me!\n  const data = [];        // Replace me!\n\n  // 👉 4. Get the query client with useQueryClient().\n  // 👉 5. Create a mutation with useMutation({ mutationFn, onSuccess }).\n  //       mutationFn should POST a new user; onSuccess should invalidate ['users'].\n\n  if (isLoading) return <div style={{ padding: 20 }}>Loading...</div>;\n  if (error) return <div style={{ padding: 20 }}>Error fetching data</div>;\n\n  return (\n    <div style={{ padding: 20 }}>\n      <ul>\n        {data.map(user => (\n          <li key={user.id}>{user.name}</li>\n        ))}\n      </ul>\n      {/* 👉 6. Call addUser.mutate('New User') here */}\n      <button onClick={() => {}}>Add User</button>\n    </div>\n  );\n}",
      "solutionCode": "import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';\n\nconst queryClient = new QueryClient();\n\nexport default function App() {\n  return (\n    <QueryClientProvider client={queryClient}>\n      <UserList />\n    </QueryClientProvider>\n  );\n}\n\nfunction UserList() {\n  const { data, isLoading, error } = useQuery({\n    queryKey: ['users'],\n    queryFn: () => fetch('https://jsonplaceholder.typicode.com/users').then(res => res.json())\n  });\n\n  const queryClient = useQueryClient();\n  const addUser = useMutation({\n    mutationFn: (name) => fetch('https://jsonplaceholder.typicode.com/users', {\n      method: 'POST',\n      body: JSON.stringify({ name }),\n    }).then(res => res.json()),\n    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),\n  });\n\n  if (isLoading) return <div style={{ padding: 20 }}>Loading...</div>;\n  if (error) return <div style={{ padding: 20 }}>Error fetching data</div>;\n\n  return (\n    <div style={{ padding: 20 }}>\n      <ul>\n        {data.map(user => (\n          <li key={user.id}>{user.name}</li>\n        ))}\n      </ul>\n      <button onClick={() => addUser.mutate('New User')}>Add User</button>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';\n\nconst queryClient = new QueryClient();\n\nfunction Profile() {\n  const { data, isLoading } = useQuery({\n    queryKey: ['demo-user'],\n    queryFn: () => new Promise(resolve => setTimeout(() => resolve({ name: 'Alice' }), 1000))\n  });\n\n  if (isLoading) return <div>Loading...</div>;\n  return <div>Welcome, {data.name}!</div>;\n}\n\nfunction App() {\n  return (\n    <QueryClientProvider client={queryClient}>\n      <Profile />\n    </QueryClientProvider>\n  );\n}\n\nexport default App;",
        "steps": [
          {
            "highlightLines": [
              6,
              9
            ],
            "description": "You do not fetch and then store. You *declare* which data this component needs, and the library owns the fetching, the caching, and the state around it.\n\nThat inversion is the whole idea. The component stops being responsible for when the request happens.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7
            ],
            "description": "`queryKey` is the cache identity. Another component asking for `['demo-user']` gets the cached value immediately instead of issuing a second request, and mounting this component again reuses what is already there.\n\nAnything the query depends on belongs in the key — `['user', id]`, not `['user']` — because the key is what tells the cache that two requests are different questions.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              8
            ],
            "description": "`queryFn` says only *how* to get the data, and must return a Promise. A real one would call `fetch`; this one resolves after a second so the loading state is visible without a network.\n\nIt is deliberately not told when to run. Mount, refocus, reconnect, and manual invalidation are the library's decisions.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              11,
              12
            ],
            "description": "The hook returns a state machine that has already been thought through: loading, error, success, plus the ones that only show up later — `isFetching` for a background refresh, stale-while-revalidate so a cached value shows instantly while a fresh one arrives.\n\nCompare the `useEffect` version from the Escape Hatches module: the same three branches, hand-rolled per component, with the race condition left as an exercise.\n\nThe `QueryClientProvider` on line 17 is what holds the cache — the hook needs it above it in the tree.\n\nThe exact text output on the screen will be:\n`Loading...`\n\nreplaced after a second by `Welcome, Alice!`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "function UserList() {\n  const { data, isLoading, error } = useQuery({\n    queryKey: ['users'],\n    queryFn: () => fetch('https://jsonplaceholder.typicode.com/users').then(res => res.json())\n  });\n\n  const queryClient = useQueryClient();\n  const addUser = useMutation({\n    mutationFn: (name) => fetch('https://jsonplaceholder.typicode.com/users', {\n      method: 'POST',\n      body: JSON.stringify({ name }),\n    }).then(res => res.json()),\n    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),\n  });\n\n  if (isLoading) return <div>Loading...</div>;\n  if (error) return <div>Error fetching data</div>;\n\n  return (\n    <div>\n      <ul>{data.map(user => <li key={user.id}>{user.name}</li>)}</ul>\n      <button onClick={() => addUser.mutate('New User')}>Add User</button>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              2,
              3,
              4,
              5
            ],
            "description": "We replace the hardcoded states with `useQuery`. We supply a `queryKey` and a `queryFn` that returns a Promise.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7,
              8,
              9,
              10,
              11,
              12,
              13
            ],
            "description": "`useMutation` is the write-side counterpart to `useQuery` — it wraps a POST/PUT/DELETE request the same way `useQuery` wraps a GET. `mutationFn` describes *how* to make the change; nothing runs until `.mutate(...)` is actually called.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              14
            ],
            "description": "`onSuccess` fires after the mutation resolves. Calling `queryClient.invalidateQueries({ queryKey: ['users'] })` here marks the `['users']` query as stale, which triggers React Query to refetch it automatically — the same cache `UserList`'s own `useQuery` reads from. This is the synchronization step: without it, the mutation would succeed on the server but the list on screen would silently keep showing the old data.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              21
            ],
            "description": "The button calls `addUser.mutate('New User')` — this is what actually triggers `mutationFn`. `useMutation` on its own does nothing until `.mutate()` is called, unlike `useQuery`, which runs automatically when the component mounts.\n\nThe exact text output on the screen will be:\n`Leanne Graham`\n`Ervin Howell`\n`...` (and a new user appended after clicking Add User)",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Does React Query actually fetch data?",
          "type": "misconception",
          "walkthrough": {
            "code": "const { data } = useQuery({\n  queryKey: ['users'],\n  queryFn: () => fetch('/api/users').then(res => res.json())\n});",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "React Query is totally agnostic to how you fetch data. It is not an HTTP client like Axios or fetch."
              },
              {
                "highlightLines": [
                  1,
                  2,
                  3,
                  4
                ],
                "description": "It is strictly an asynchronous state manager. It handles caching, retries, deduplication, and loading states, but YOU still have to write the actual fetch function."
              }
            ]
          }
        },
        {
          "title": "Why does React Query refetch when I switch tabs?",
          "type": "misconception",
          "walkthrough": {
            "code": "const query = useQuery({ queryKey: ['data'], queryFn: fetchFn });",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "By default, React Query aggressively enables `refetchOnWindowFocus`. If a user clicks away to Spotify and clicks back, it silently hits the API again."
              },
              {
                "highlightLines": [
                  1
                ],
                "description": "This guarantees the user always sees the freshest data. But if you have an expensive API, you should absolutely turn this off in the query settings!"
              }
            ]
          }
        },
        {
          "title": "What is `staleTime` vs `gcTime`?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "useQuery({\n  queryKey: ['user'],\n  staleTime: 5000, // 5 seconds\n  gcTime: 60000 // 1 minute\n});",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "`staleTime` dictates how long the data is considered 'fresh'. If you fetch again within 5 seconds, it returns the cache and doesn't even hit the API."
              },
              {
                "highlightLines": [
                  4
                ],
                "description": "`gcTime` (formerly cacheTime) dictates how long the data stays in memory AFTER the component unmounts. After 1 minute of nobody looking at the data, it gets garbage collected."
              }
            ]
          }
        },
        {
          "title": "The decision rule: Context vs. Zustand vs. React Query",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Ask in this order:\n\n// 1. Does this data come from a server/API and need caching,\n//    deduplication, or background refetching?\n//    -> React Query (this lesson)\n\n// 2. Is it client-only state that many UNRELATED components need\n//    (auth state, a shopping cart, UI theme)?\n//    -> Zustand\n\n// 3. Is it a value a nearby, related subtree needs, changing\n//    infrequently (theme, current user, form step)?\n//    -> Context\n\n// 4. Is it local to one component or its direct children?\n//    -> useState, lifted only as far as needed (mental-models: state-ownership)",
            "steps": [
              {
                "highlightLines": [3, 4, 5],
                "description": "Start here. If the value's source of truth is a server, not your app, it isn't really \"state\" you own at all — it's a cache of something else. React Query's caching, deduplication, and invalidation machinery is solving a fundamentally different problem than the other three options, so this question comes first."
              },
              {
                "highlightLines": [7, 8, 9],
                "description": "Zustand earns its cost specifically for client-only state that's genuinely global and touched by components with no ancestor/descendant relationship to each other — the `use-context` lesson's insight on Context re-rendering every consumer is exactly why Zustand's selector-based subscriptions exist as an alternative for this case."
              },
              {
                "highlightLines": [11, 12, 13],
                "description": "Context is the right default for values a related part of the tree needs but that don't change often — it costs nothing extra to set up and doesn't require a separate library, as long as you're not putting high-frequency-changing values in it (see the Context lesson's pitfalls)."
              },
              {
                "highlightLines": [15, 16],
                "description": "Most state is this case, and it's the easiest to get wrong by skipping straight to Context or a store out of habit. Start local, lift only as far as the nearest component that actually needs to coordinate it — reach for the other three tools only once that's provably not enough."
              }
            ]
          }
        }
      ]
    }
  ]
};
