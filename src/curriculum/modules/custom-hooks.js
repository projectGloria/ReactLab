export default {
  "id": "custom-hooks",
  "title": "Custom Hooks",
  "description": "Reusable stateful logic without hiding ownership or synchronization boundaries.",
  "lessons": [
    {
      "id": "use-local-storage",
      "title": "Your First Custom Hook",
      "content": "\n# Your First Custom Hook\n\n### What is it?\n**Building on useState and useEffect:** A **custom hook** is a JavaScript function whose name starts with \"use\" and that calls other hooks. It allows you to extract and share stateful logic across multiple components without copying and pasting.\n\n> \ud83d\udca1 **Mental Model:** Think of a useLocalStorage hook as a coat-check counter: you hand off a value to be held (write to storage) and later hand back a ticket to reclaim it (read from storage) — and a good coat check always has a backup plan if your ticket turns out to be unreadable.\n\n### Why do we need it?\nReact comes with powerful built-in hooks like `useState` and `useEffect`. But if multiple components in your app need to, for example, persist state to `localStorage`, you would normally have to copy-paste the exact same `useState` and `useEffect` boilerplate into every single component. Custom hooks allow you to extract this stateful logic.\n\n### How?\nYou write a regular function, start its name with `use`, and move the repeated hooks inside it. Then you return whatever values the calling components will need (often an array like `[value, setValue]`).\n\n### Syntax/Example\n```javascript\n// This defines a custom hook that wraps standard Hooks\nexport function useLocalStorage(key, initialValue) {\n  const [value, setValue] = useState(() => {\n    // This causes local storage to be read ONLY on the first render\n    try {\n      const item = window.localStorage.getItem(key);\n      return item !== null ? JSON.parse(item) : initialValue;\n    } catch {\n      return initialValue;\n    }\n  });\n\n  useEffect(() => {\n    // This causes the value to sync to localStorage whenever it changes\n    try {\n      window.localStorage.setItem(key, JSON.stringify(value));\n    } catch {}\n  }, [key, value]);\n\n  // This returns the standard state tuple to the consumer\n  return [value, setValue];\n}\n```\n\n### Common Pitfalls & Gotchas\n1. **Conditional Hook calls inside custom hooks**: Custom hooks must follow the Rules of Hooks just like components. Never call `useState` or `useEffect` conditionally inside a custom hook based on an argument.\n2. **Missing SSR checks**: In Server-Side Rendering or Next.js/Remix environments, accessing `window.localStorage` directly during initial render throws `ReferenceError: window is not defined`. Always guard with `typeof window !== 'undefined'`.\n3. **Ignoring JSON parse exceptions**: User data in localStorage can become corrupted or non-JSON. Always wrap `JSON.parse` in a `try...catch` block with a sensible fallback.\n\n### Example\n```jsx\nimport { useState, useEffect } from 'react';\n\nfunction useWindowWidth() {\n  const [width, setWidth] = useState(window.innerWidth);\n\n  useEffect(() => {\n    const handleResize = () => setWidth(window.innerWidth);\n    window.addEventListener('resize', handleResize);\n    return () => window.removeEventListener('resize', handleResize);\n  }, []);\n\n  return width;\n}\n\nfunction App() {\n  const width = useWindowWidth();\n  return <div>Window width is: {width}px</div>;\n}\n\nexport default App;\n```\n\n### Challenge and Solution\n**Challenge:** Look at the `ThemeToggle` and `UsernameField` components. They are both duplicating the logic to sync their state with `localStorage`. Extract that logic into a new custom hook called `useLocalStorage` in `App.jsx`.\n\n**Solution:** Create `useLocalStorage(key, initialValue)`. Move the `useState` and `useEffect` inside. Return `[value, setValue]`. Then in both components, call `const [theme, setTheme] = useLocalStorage('theme', 'light');` and `const [name, setName] = useLocalStorage('username', '');`.\n\n### Hints\n* Custom hooks must always start with `use` (so ESLint can enforce rules).\n* A production-ready `useLocalStorage` should include `try/catch` blocks in case `localStorage` is disabled.\n",
      "starterCode": "import { useState, useEffect } from 'react';\n\n// 👉 2. Create useLocalStorage(key, initialValue) here!\n\nfunction ThemeToggle() {\n  // 👉 1. Look at this duplicated logic!\n  // 👉 3. Replace this with: const [theme, setTheme] = useLocalStorage('theme', 'light');\n  const [theme, setTheme] = useState(() => {\n    return localStorage.getItem('theme') ?? 'light'; // Using ?? is safer than || if '0' or '' are valid\n  });\n\n  useEffect(() => {\n    localStorage.setItem('theme', theme);\n  }, [theme]);\n\n  return (\n    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>\n      Current Theme: {theme}\n    </button>\n  );\n}\n\nfunction UsernameField() {\n  // 👉 1. This is the exact same logic again!\n  // 👉 3. Replace this with: const [name, setName] = useLocalStorage('username', '');\n  const [name, setName] = useState(() => {\n    return localStorage.getItem('username') || '';\n  });\n\n  useEffect(() => {\n    localStorage.setItem('username', name);\n  }, [name]);\n\n  return (\n    <input \n      value={name} \n      onChange={e => setName(e.target.value)} \n      placeholder=\"Username\" \n    />\n  );\n}\n\nexport default function App() {\n  return (\n    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>\n      <h1>Custom Hooks</h1>\n      <ThemeToggle />\n      <UsernameField />\n    </div>\n  );\n}",
      "solutionCode": "import { useState, useEffect } from 'react';\n\nfunction useLocalStorage(key, initialValue) {\n  const [value, setValue] = useState(() => {\n    try {\n      const item = window.localStorage.getItem(key);\n      return item !== null ? JSON.parse(item) : initialValue;\n    } catch {\n      return initialValue;\n    }\n  });\n\n  useEffect(() => {\n    try {\n      window.localStorage.setItem(key, JSON.stringify(value));\n    } catch {}\n  }, [key, value]);\n\n  return [value, setValue];\n}\n\nfunction ThemeToggle() {\n  const [theme, setTheme] = useLocalStorage('theme', 'light');\n  return (\n    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>\n      Current Theme: {theme}\n    </button>\n  );\n}\n\nfunction UsernameField() {\n  const [name, setName] = useLocalStorage('username', '');\n  return (\n    <input\n      value={name}\n      onChange={e => setName(e.target.value)}\n      placeholder=\"Username\"\n    />\n  );\n}\n\nexport default function App() {\n  return (\n    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>\n      <h1>Custom Hooks</h1>\n      <ThemeToggle />\n      <UsernameField />\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useState, useEffect } from 'react';\n\nfunction useWindowWidth() {\n  const [width, setWidth] = useState(window.innerWidth);\n\n  useEffect(() => {\n    const handleResize = () => setWidth(window.innerWidth);\n    window.addEventListener('resize', handleResize);\n    return () => window.removeEventListener('resize', handleResize);\n  }, []);\n\n  return width;\n}\n\nfunction App() {\n  const width = useWindowWidth();\n  return <div>Window width is: {width}px</div>;\n}\n\nexport default App;",
        "steps": [
          {
            "highlightLines": [
              3,
              4
            ],
            "description": "We create a custom hook named `useWindowWidth`. Inside, it uses `useState` to track the width.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6,
              7,
              8,
              9,
              10
            ],
            "description": "It uses `useEffect` to listen to window resize events, cleaning up after itself.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              12,
              16
            ],
            "description": "Finally, it returns the raw width. The `App` component simply calls `useWindowWidth()` and gets the live width! All that complex event listener logic is completely hidden.\n\nThe exact text output on the screen will be:\n`Window width is: [current width]px`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useState, useEffect } from 'react';\n\nfunction useLocalStorage(key, initialValue) {\n  const [value, setValue] = useState(() => {\n    try {\n      const item = window.localStorage.getItem(key);\n      return item !== null ? JSON.parse(item) : initialValue;\n    } catch {\n      return initialValue;\n    }\n  });\n\n  useEffect(() => {\n    try {\n      window.localStorage.setItem(key, JSON.stringify(value));\n    } catch {}\n  }, [key, value]);\n\n  return [value, setValue];\n}\n\n// ... components",
        "steps": [
          {
            "highlightLines": [
              3
            ],
            "description": "We define a new function starting with `use`. It takes a `key` and an `initialValue`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              4,
              9,
              15,
              17
            ],
            "description": "We moved the lazy initializer reading from localStorage (with `JSON.parse` and `try/catch`) and the `useEffect` syncing (with `JSON.stringify`) directly inside our custom hook.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              21
            ],
            "description": "Finally, we return the array `[value, setValue]`. Now any component can get persisted state with a single line of code!\n\nThe exact text output on the screen will be:\n`Custom Hooks`\n`[Button: Current Theme: light]`\n`[Input: Username]`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why does `JSON.parse` break sometimes?",
          "type": "misconception",
          "walkthrough": {
            "code": "const raw = localStorage.getItem('user');\nconst data = JSON.parse(raw);",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "If the item doesn't exist in local storage, `getItem` returns `null`."
              },
              {
                "highlightLines": [
                  2
                ],
                "description": "While `JSON.parse(null)` safely returns `null`, if the stored value is an invalid string or `undefined`, it will throw a catastrophic error and crash your app! Always wrap it in a `try/catch`."
              }
            ]
          }
        },
        {
          "title": "Wait, isn't local storage synchronous?",
          "type": "misconception",
          "walkthrough": {
            "code": "const value = localStorage.getItem('theme'); // Freezes the browser!",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "Local storage is a synchronous, blocking API. When you read from it, the entire JavaScript engine pauses."
              },
              {
                "highlightLines": [
                  1
                ],
                "description": "If you store massive JSON objects in local storage and read them during the initial React render, you will visibly delay the app from painting the screen!"
              }
            ]
          }
        },
        {
          "title": "Is local storage actually secure?",
          "type": "misconception",
          "walkthrough": {
            "code": "localStorage.setItem('auth_token', 'my-secret-jwt'); // HIGH RISK",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "Absolutely not! Local Storage has exactly zero security protections."
              },
              {
                "highlightLines": [
                  1
                ],
                "description": "Any malicious JavaScript running on the page (like a compromised third-party analytics script) can instantly read everything inside local storage. Sensitive tokens should be stored in secure HttpOnly cookies."
              }
            ]
          }
        },
        {
          "title": "Lazy State Initialization to Prevent Performance Bottlenecks",
          "type": "pro-tip",
          "walkthrough": {
            "code": "// ❌ Bad: localStorage.getItem runs on EVERY render\nconst [value, setValue] = useState(localStorage.getItem(key));\n\n// ✅ Good: Function initializer runs ONLY on mount!\nconst [value, setValue] = useState(() => {\n  return localStorage.getItem(key);\n});",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "`localStorage` is a synchronous disk read. Calling it directly in `useState(...)` forces a slow disk read on every single re-render!"
              },
              {
                "highlightLines": [
                  5,
                  6,
                  7
                ],
                "description": "Passing a function `useState(() => ...)` tells React to execute the initializer function only ONCE when the component mounts."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "use-debounce",
      "title": "Debouncing Rapid Updates",
      "content": "\n# Debouncing Rapid Updates\n\n### What is it?\n**Building on custom hooks and timers:** \"Debouncing\" is a pattern that delays running an expensive operation until a certain period of silence (e.g. 500ms) has elapsed after the last event.\n\n> \ud83d\udca1 **Mental Model:** Think of debouncing like an elevator door: it doesn't close the instant one person steps in \u2014 it waits a beat to see if anyone else is still walking up, then closes and goes.\n\n### Why do we need it?\nSome UI operations are extremely expensive—like filtering a massive list of 10,000 items, or sending a network request to an API. If you trigger these operations on every single keystroke of an `<input>`, your app will feel incredibly laggy or hit rate limits.\n\n### How?\nSetting up a debounce timer with `setTimeout` and cleaning it up with `clearTimeout` every time a component renders is tedious. By building a `useDebounce` custom hook, we can encapsulate all of this complexity.\n\n### Syntax/Example\n```javascript\nexport function useDebounce(value, delay) {\n  const [debouncedValue, setDebouncedValue] = useState(value);\n\n  useEffect(() => {\n    // This causes the value update to be delayed\n    const handler = setTimeout(() => setDebouncedValue(value), delay);\n    \n    // This causes the previous timeout to cancel if value changes again\n    return () => clearTimeout(handler);\n  }, [value, delay]);\n\n  return debouncedValue;\n}\n```\n\n### Common Pitfalls & Gotchas\n1. **Debouncing functions instead of state values**: Passing a raw callback to a timer inside render without `useCallback` or `useRef` causes the timer to hold a stale closure over old variables. Debouncing the *derived state value* (as shown here) is far safer and more idiomatic in React.\n2. **Missing `clearTimeout` cleanup**: If the component unmounts or the user types another character before `delay` ms passes, forgetting to clear the previous timer causes memory leaks and out-of-order state updates.\n3. **Using debounce when `useDeferredValue` is better**: In React 19, if your goal is solely to de-prioritize heavy list filtering without an artificial arbitrary timer, `useDeferredValue(text)` is often better than an artificial 300ms debounce because React will render the deferred value as soon as CPU becomes idle.\n\n### Example\n```jsx\nimport { useState, useEffect } from 'react';\n\nfunction useDebounce(value, delay) {\n  const [debouncedValue, setDebouncedValue] = useState(value);\n  useEffect(() => {\n    const handler = setTimeout(() => setDebouncedValue(value), delay);\n    return () => clearTimeout(handler);\n  }, [value, delay]);\n  return debouncedValue;\n}\n\nfunction Search() {\n  const [text, setText] = useState('');\n  const debouncedText = useDebounce(text, 1000);\n  return (\n    <div>\n      <input onChange={e => setText(e.target.value)} placeholder=\"Type fast...\" />\n      <p>Actual: {text}</p>\n      <p>Debounced: {debouncedText}</p>\n    </div>\n  );\n}\n\nexport default Search;\n```\n\n### Challenge and Solution\n**Challenge:** The search input runs the filter on EVERY keystroke. Create a `useDebounce` hook and use it to delay the filter string so the work happens once, after the typing stops.\n\n**What debouncing does and does not fix.** It stops the *filter computation* from running per keystroke — that is the whole of its job here. It does **not** stop React re-rendering the list, because typing still updates `filter` state and the component still returns 10,000 `<li>` elements for reconciliation. If that reconciliation is the real cost, debouncing will not feel like much: you would reach for `useDeferredValue` to make the list render interruptible (the Concurrent Transitions lesson), or render fewer rows. Debounce controls *how often work starts*, not *how expensive the work is*.\n\n**Solution:** Create `useDebounce(value, delay)` in `App.jsx`. Inside, create a `debouncedValue` state. Add a `useEffect` that calls `setTimeout` to update it, and returns `clearTimeout`. In the App, call `const debouncedFilter = useDebounce(filter, 500)` and use that to filter the list.\n\n### Hints\n* **Debounce vs Throttle:** Debounce fires *only after* N ms of silence. Throttle limits execution to *at most once* per N ms.\n",
      "starterCode": "import { useState, useEffect } from 'react';\n\n// A massive, slow-to-render list of 10,000 items\nconst items = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);\n\n// 👉 1-4. Create useDebounce(value, delay) here!\n\nexport default function App() {\n  const [filter, setFilter] = useState('');\n  \n  // 👉 5. Call useDebounce(filter, 500) and use its return value to filter the items\n  \n  // Notice how laggy typing feels because it filters 10,000 items on EVERY keystroke!\n  const filteredItems = items.filter(item => item.toLowerCase().includes(filter.toLowerCase()));\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input \n        type=\"text\" \n        value={filter}\n        onChange={e => setFilter(e.target.value)} \n        placeholder=\"Search...\" \n      />\n      <ul>\n        {filteredItems.map(item => (\n          <li key={item}>{item}</li>\n        ))}\n      </ul>\n    </div>\n  );\n}",
      "solutionCode": "import { useState, useEffect } from 'react';\n\n// A massive, slow-to-render list of 10,000 items\nconst items = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);\n\nfunction useDebounce(value, delay) {\n  const [debouncedValue, setDebouncedValue] = useState(value);\n\n  useEffect(() => {\n    const handler = setTimeout(() => {\n      setDebouncedValue(value);\n    }, delay);\n\n    return () => {\n      clearTimeout(handler);\n    };\n  }, [value, delay]);\n\n  return debouncedValue;\n}\n\nexport default function App() {\n  const [filter, setFilter] = useState('');\n  const debouncedFilter = useDebounce(filter, 500);\n  \n  const filteredItems = items.filter(item => item.toLowerCase().includes(debouncedFilter.toLowerCase()));\n\n  return (\n    <div style={{ padding: 20 }}>\n      <input \n        type=\"text\" \n        value={filter}\n        onChange={e => setFilter(e.target.value)} \n        placeholder=\"Search...\" \n      />\n      <ul>\n        {filteredItems.map(item => (\n          <li key={item}>{item}</li>\n        ))}\n      </ul>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useState, useEffect } from 'react';\n\nfunction useDebounce(value, delay) {\n  const [debouncedValue, setDebouncedValue] = useState(value);\n  useEffect(() => {\n    const handler = setTimeout(() => setDebouncedValue(value), delay);\n    return () => clearTimeout(handler);\n  }, [value, delay]);\n  return debouncedValue;\n}\n\nfunction Search() {\n  const [text, setText] = useState('');\n  const debouncedText = useDebounce(text, 1000);\n  return (\n    <div>\n      <input onChange={e => setText(e.target.value)} placeholder=\"Type fast...\" />\n      <p>Actual: {text}</p>\n      <p>Debounced: {debouncedText}</p>\n    </div>\n  );\n}\n\nexport default Search;",
        "steps": [
          {
            "highlightLines": [
              4
            ],
            "description": "The hook maintains its own internal state `debouncedValue` to hold the 'delayed' version of the value.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6,
              7
            ],
            "description": "Every time the `value` changes, the effect sets a timer to update the internal state. Crucially, if the `value` changes again BEFORE the timer fires, React runs the cleanup function `clearTimeout` to cancel the previous timer. This is the core mechanic of debouncing!",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              14
            ],
            "description": "The component uses the debounced value. While typing fast, `Actual` updates instantly, but `Debounced` waits 1 second after you stop typing!\n\nThe exact text output on the screen will be:\n`[Input: Type fast...]`\n`Actual: `\n`Debounced: `",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useState, useEffect } from 'react';\n\nconst items = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);\n\nfunction useDebounce(value, delay) {\n  const [debouncedValue, setDebouncedValue] = useState(value);\n\n  useEffect(() => {\n    const handler = setTimeout(() => {\n      setDebouncedValue(value);\n    }, delay);\n\n    return () => {\n      clearTimeout(handler);\n    };\n  }, [value, delay]);\n\n  return debouncedValue;\n}\n\nexport default function App() {\n  const [filter, setFilter] = useState('');\n  const debouncedFilter = useDebounce(filter, 500);\n  \n  const filteredItems = items.filter(item => item.toLowerCase().includes(debouncedFilter.toLowerCase()));\n  // ... render\n}",
        "steps": [
          {
            "highlightLines": [
              5,
              6,
              8,
              9,
              13,
              18
            ],
            "description": "We created the `useDebounce` hook perfectly, returning the internal `debouncedValue`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              23
            ],
            "description": "In `App`, we call `useDebounce(filter, 500)`. Now `debouncedFilter` will only update 500ms after the user stops typing.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              25
            ],
            "description": "By using `debouncedFilter` to run the `filter` operation instead of the raw `filter` state, the 10,000 items are only crunched once, half a second after the typing stops.\n\nBe precise about what improved: the *filtering* now runs once instead of once per keystroke. The list itself still re-renders on every keystroke, because `filter` is still state and the component still returns 10,000 `<li>` elements. Debounce is a tool for controlling how often work *starts* — for making an expensive render interruptible, that is `useDeferredValue` and `useTransition`.\n\nThe exact text output on the screen will be:\n`[Input: Search...]`\n`Item 1`\n`Item 2`\n`Item 3`\n`...`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Debounce vs Throttle",
          "type": "did-you-know",
          "walkthrough": {
            "code": "useDebounce(searchTerm, 500);\nuseThrottle(scrollPosition, 100);",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "**Debounce** waits for a pause. It only fires AFTER the user stops typing for 500ms. Perfect for search bars."
              },
              {
                "highlightLines": [
                  2
                ],
                "description": "**Throttle** enforces a speed limit. It fires continuously, but only once every 100ms. Perfect for tracking scroll or mouse movements."
              }
            ]
          }
        },
        {
          "title": "Why did my debounced function never run?",
          "type": "misconception",
          "walkthrough": {
            "code": "// INCORRECT\nfunction App() {\n  const search = debounce(() => fetch(), 500);\n  return <input onChange={search} />\n}",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "If you define a vanilla debounce function inside the component, React creates a brand NEW debounced function on every single render."
              },
              {
                "highlightLines": [
                  3
                ],
                "description": "The old function is destroyed before its 500ms timer finishes! You must wrap the debounce in `useCallback` or use a custom `useDebounce` hook so the timer persists."
              }
            ]
          }
        },
        {
          "title": "Why does the API still fire randomly?",
          "type": "misconception",
          "walkthrough": {
            "code": "useEffect(() => {\n  const handler = setTimeout(() => fetch(search), 500);\n  // FORGOT CLEANUP!\n}, [search]);",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "A debounce hook absolutely relies on the `useEffect` cleanup function."
              },
              {
                "highlightLines": [
                  3
                ],
                "description": "If the user types a second letter within 500ms, the cleanup function must run `clearTimeout(handler)` to kill the first timer. If you forget the cleanup, the timers pile up and the API fires 10 times anyway!"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "use-sync-external-store",
      "title": "useSyncExternalStore",
      "content": "\n# useSyncExternalStore\n\n### What is it?\n**Building on custom hooks and effects:** `useSyncExternalStore` is the hook specifically built for subscribing a component to a value that lives *outside* React — a browser API, a third-party store, or (as you'll see below) `localStorage` changes coming from another browser tab. It replaces the common \"useState + useEffect with a manual event listener\" pattern for exactly this case.\n\n> 💡 **Mental Model:** Think of it like a building's fire alarm system rather than everyone individually checking for smoke: instead of every component running its own useEffect to poll or listen for changes, `useSyncExternalStore` gives React one standardized way to ask \"what's the current value?\" and \"tell me when it changes\" — and React handles the rest, including staying consistent if it needs to check twice.\n\n### Why not just useState + useEffect?\nThe manual pattern (subscribe in a `useEffect`, call `setState` when the external thing changes) works for most cases — you've already seen it work for `localStorage` in the previous lesson. But it has one specific gap: under React's concurrent rendering, React can render a component tree more than once for a single update, or interrupt and resume rendering. A `useState`-based subscription has no way to guarantee every part of the tree reads the *same* snapshot of the external value during that process — different components can briefly disagree about what the current value even is. This is called **tearing**. `useSyncExternalStore` exists specifically to prevent it.\n\n### How?\n```javascript\nconst value = useSyncExternalStore(subscribe, getSnapshot);\n```\n- **`subscribe(callback)`**: a function you provide that registers `callback` with the external source (e.g. `addEventListener`) and returns an unsubscribe function.\n- **`getSnapshot()`**: a function that synchronously returns the *current* value of the external source right now.\n\nReact calls `getSnapshot` during render to read the value, and calls it again whenever `subscribe`'s callback fires, to check whether the value actually changed.\n\n### Syntax/Example\n```javascript\nimport { useSyncExternalStore } from 'react';\n\nfunction subscribe(callback) {\n  window.addEventListener('online', callback);\n  window.addEventListener('offline', callback);\n  return () => {\n    window.removeEventListener('online', callback);\n    window.removeEventListener('offline', callback);\n  };\n}\n\nfunction getSnapshot() {\n  return navigator.onLine;\n}\n\nfunction useOnlineStatus() {\n  // This returns the current value AND keeps it correctly synchronized,\n  // even under concurrent rendering\n  return useSyncExternalStore(subscribe, getSnapshot);\n}\n```\n\n### Example\n```jsx\nimport { useSyncExternalStore } from 'react';\n\nfunction subscribe(callback) {\n  window.addEventListener('online', callback);\n  window.addEventListener('offline', callback);\n  return () => {\n    window.removeEventListener('online', callback);\n    window.removeEventListener('offline', callback);\n  };\n}\n\nfunction getSnapshot() {\n  return navigator.onLine;\n}\n\nfunction useOnlineStatus() {\n  return useSyncExternalStore(subscribe, getSnapshot);\n}\n\nexport default function App() {\n  const isOnline = useOnlineStatus();\n  return <h2>{isOnline ? 'Online' : 'Offline'}</h2>;\n}\n```\n\n### Challenge and Solution\n**Challenge:** `useOnlineStatus` currently uses the manual `useState` + `useEffect` pattern. Refactor it to use `useSyncExternalStore` instead. Define a `subscribe(callback)` function that registers/unregisters the `online` and `offline` listeners, and a `getSnapshot()` function that returns `navigator.onLine`, then call `useSyncExternalStore(subscribe, getSnapshot)`.\n\n**Solution:** Replace the `useState`/`useEffect` body with `return useSyncExternalStore(subscribe, getSnapshot);`, where `subscribe` and `getSnapshot` are defined as standalone functions outside the component (so they don't get recreated every render).\n\n### Hints\n* `subscribe` must return an unsubscribe function — the same shape as a `useEffect` cleanup function, just handed to React differently.\n* `getSnapshot` must be a plain synchronous function — no `async`, no Promises. It just reads and returns the current value.\n* **On the server there is no `navigator`.** `useSyncExternalStore` takes an optional third argument, `getServerSnapshot`, which React calls during server rendering and hydration instead of `getSnapshot`. Without it, an SSR framework throws on the first render. For this hook you would pass `() => true` — assume online on the server, then correct it on the client.\n* You can't fully demonstrate cross-tab syncing inside this single sandboxed preview — toggle your browser's DevTools \"Offline\" network mode instead to trigger the `online`/`offline` events and watch the status update.\n",
      "starterCode": "import { useState, useEffect } from 'react';\n\n// 👉 Refactor this to use useSyncExternalStore instead.\nfunction useOnlineStatus() {\n  const [isOnline, setIsOnline] = useState(navigator.onLine);\n\n  useEffect(() => {\n    function handleChange() {\n      setIsOnline(navigator.onLine);\n    }\n    window.addEventListener('online', handleChange);\n    window.addEventListener('offline', handleChange);\n    return () => {\n      window.removeEventListener('online', handleChange);\n      window.removeEventListener('offline', handleChange);\n    };\n  }, []);\n\n  return isOnline;\n}\n\nexport default function App() {\n  const isOnline = useOnlineStatus();\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>{isOnline ? '✅ Online' : '❌ Offline'}</h2>\n      <p>Toggle DevTools \"Offline\" network mode to see this update.</p>\n    </div>\n  );\n}",
      "solutionCode": "import { useSyncExternalStore } from 'react';\n\nfunction subscribe(callback) {\n  window.addEventListener('online', callback);\n  window.addEventListener('offline', callback);\n  return () => {\n    window.removeEventListener('online', callback);\n    window.removeEventListener('offline', callback);\n  };\n}\n\nfunction getSnapshot() {\n  return navigator.onLine;\n}\n\nfunction useOnlineStatus() {\n  return useSyncExternalStore(subscribe, getSnapshot);\n}\n\nexport default function App() {\n  const isOnline = useOnlineStatus();\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>{isOnline ? '✅ Online' : '❌ Offline'}</h2>\n      <p>Toggle DevTools \"Offline\" network mode to see this update.</p>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useSyncExternalStore } from 'react';\n\nfunction subscribe(callback) {\n  window.addEventListener('online', callback);\n  window.addEventListener('offline', callback);\n  return () => {\n    window.removeEventListener('online', callback);\n    window.removeEventListener('offline', callback);\n  };\n}\n\nfunction getSnapshot() {\n  return navigator.onLine;\n}\n\nfunction useOnlineStatus() {\n  return useSyncExternalStore(subscribe, getSnapshot);\n}\n\nexport default function App() {\n  const isOnline = useOnlineStatus();\n  return <h2>{isOnline ? 'Online' : 'Offline'}</h2>;\n}",
        "steps": [
          {
            "highlightLines": [
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10
            ],
            "description": "`subscribe` tells React how to listen: register `callback` with the external source and return the function that unregisters it. React calls `callback` to mean \"something out there changed, re-read it\".\n\nNote that `subscribe` is declared outside the component. If it were recreated on every render, React would tear down and re-establish the subscription every render — the same identity trap as an unstable dependency in `useEffect`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              12,
              13,
              14
            ],
            "description": "`getSnapshot` tells React how to read the current value, synchronously and on demand. React calls it during render and again whenever `subscribe` fires the callback, and compares the results with `Object.is`.\n\nSo it has to return a stable value for unchanged data. Returning a fresh object each call — `{ online: navigator.onLine }` — would look like a change every time and loop forever.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              16,
              17,
              18
            ],
            "description": "The hook collapses to one line. No `useState`, no `useEffect`, no cleanup, and no window where React has committed a render against a value the store has already moved past.\n\nThat last part is the reason this hook exists rather than being sugar. The manual `useState` + `useEffect` version reads the store *after* rendering, so under concurrent rendering two components can commit against different values of the same store — a torn read. `useSyncExternalStore` reads through `getSnapshot` at exactly the right moment to make that impossible.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              20,
              21,
              22
            ],
            "description": "The component just calls the hook, the same as any other. Everything above is the hook author's problem, not the consumer's.\n\nWith the network connected, the exact text output on the screen will be:\n`Online`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "function subscribe(callback) {\n  window.addEventListener('online', callback);\n  window.addEventListener('offline', callback);\n  return () => {\n    window.removeEventListener('online', callback);\n    window.removeEventListener('offline', callback);\n  };\n}\n\nfunction getSnapshot() {\n  return navigator.onLine;\n}\n\nfunction useOnlineStatus() {\n  return useSyncExternalStore(subscribe, getSnapshot);\n}",
        "steps": [
          {
            "highlightLines": [1, 2, 3, 4, 5, 6],
            "description": "The `useEffect`'s listener-registration logic moved out, unchanged in substance, into a standalone `subscribe` function — it still adds both listeners and still returns a matching cleanup function.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [8, 9, 10],
            "description": "The old `useState(navigator.onLine)` initializer and the `setIsOnline(navigator.onLine)` call inside the handler both collapse into one thing: `getSnapshot`, which just returns `navigator.onLine` whenever asked.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [12, 13, 14],
            "description": "`useOnlineStatus` no longer manages its own state at all — it delegates entirely to `useSyncExternalStore(subscribe, getSnapshot)`, which is both shorter and gives the concurrent-rendering safety guarantee the manual version couldn't.\n\nThe exact text output on the screen will be:\n`✅ Online` (or `❌ Offline`, depending on your connection)",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "This app's own code has exactly this problem",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// From this app's own useProgressStore.js / useUIStore.js:\nif (typeof window !== 'undefined') {\n  window.addEventListener('storage', (event) => {\n    if (event.key === 'reactlab_progress') {\n      useProgressStore.persist?.rehydrate();\n    }\n  });\n}",
            "steps": [
              {
                "highlightLines": [1, 2, 3, 4, 5, 6, 7],
                "description": "ReactLab's own progress and settings stores keep multiple open windows (the main window and any detached pop-outs) in sync by listening for the browser's `storage` event — the exact same shape of problem this lesson teaches: subscribing to a value that lives outside React's own state."
              },
              {
                "highlightLines": [],
                "description": "This code works, and rewriting it isn't necessary — Zustand's `persist` middleware already handles the state update safely here. But the underlying pattern — \"subscribe to an external event, re-read a snapshot when it fires\" — is precisely what `useSyncExternalStore` was built to formalize and make tear-safe, if you were building this kind of cross-window sync directly into a component instead of a store."
              }
            ]
          }
        },
        {
          "title": "Don't reach for this by default — it's a specific-purpose tool",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ Overkill for state that already lives inside React\nconst count = useSyncExternalStore(subscribeToCount, getCountSnapshot);\n\n// ✅ Just use useState — there's no external source here\nconst [count, setCount] = useState(0);\n\n// ✅ useSyncExternalStore earns its place for a TRUE external source:\n// browser APIs, third-party libraries, values outside React's own tree",
            "steps": [
              {
                "highlightLines": [2],
                "description": "If the value is something your component (or a parent) already owns and updates with `setState`, there's no external source to subscribe to — reach for `useSyncExternalStore` only when the value's source of truth genuinely lives outside React."
              },
              {
                "highlightLines": [5],
                "description": "Ordinary component state, form input state, or anything you'd normally lift up to a parent stays exactly as it is — `useState`, not this hook."
              },
              {
                "highlightLines": [7, 8],
                "description": "The real use cases are narrow and specific: browser APIs like `navigator.onLine` or `window.matchMedia`, state libraries that manage their own store outside React (this is literally how libraries like Zustand implement their own `useStore` hook under the hood), or any other value React itself doesn't own."
              }
            ]
          }
        }
      ]
    }
  ]
};
