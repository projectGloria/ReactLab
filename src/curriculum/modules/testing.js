export default {
  "id": "testing",
  "title": "Testing React Components",
  "lessons": [
    {
      "id": "rtl-basics",
      "title": "Testing with React Testing Library",
      "dependencies": {
        "@testing-library/react": "^16.0.1",
        "@testing-library/user-event": "^14.5.2",
        "@testing-library/jest-dom": "^6.5.0",
        "vitest": "^2.1.4"
      },
      "content": "\n# Testing React Components\n\n### What is it?\n**Building on React components and events:** Testing gives you confidence to refactor without fear. The goal is not to test internal component state—it is to test the component **as a user would interact with it** in the DOM.\n\n> \ud83d\udca1 **Mental Model:** Think of Testing Library queries like a mystery shopper: they interact with a store the way a real customer would — reading labels, clicking visible buttons — never sneaking into the back office to check the inventory system (component internals) directly.\n\n### Why do we need it?\nRender your component into a test DOM and query it the way a user would: by role, label, and text—not by CSS class or component internals.\n\n### How?\nCore API:\n- **`render(<Component />)`** — Renders the component into a test DOM\n- **`screen.getByRole('button', { name: /submit/i })`** — Find by ARIA role\n- **`screen.getByText(/hello/i)`** — Find by visible text\n- **`userEvent.click(element)`** — Simulate user interactions (async)\n- **`expect(el).toBeInTheDocument()`** — Assert presence\n\n### Syntax/Example\n```javascript\nimport { test, expect } from 'vitest';\n\n// This defines a test case\ntest('addition works', () => {\n  // This causes the test to pass ONLY if 1 + 1 equals 2\n  expect(1 + 1).toBe(2);\n});\n```\n\n### Example\n```jsx\nimport { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\nimport Button from './Button';\n\ntest('button click works', async () => {\n  render(<Button>Submit</Button>);\n  const btn = screen.getByRole('button', { name: /submit/i });\n\n  await userEvent.click(btn);\n  expect(btn).toBeDisabled();\n});\n```\n\n### Challenge and Solution\n**Challenge:** The `Counter` component below has a bug: clicking the button does not increment the count correctly. Read the test to understand what it checks. Fix the `Counter` component so the test passes.\n\n**Solution:** In `App.jsx`, change `<button onClick={setCount}>Increment</button>` to `<button onClick={() => setCount(c => c + 1)}>Increment</button>`.\n\n### Hints\n* **Query Priority:** Prefer: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`. `getByRole` is the gold standard because it also validates accessibility.\n",
      "starterCode": {
        "/App.jsx": "import { useState } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <p>Count: {count}</p>\n      {/* ❌ Bug: onClick passes the event object to setCount */}\n      <button onClick={setCount}>Increment</button>\n    </div>\n  );\n}",
        "/App.test.jsx": "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\nimport Counter from './App';\n\ntest('increments count when button is clicked', async () => {\n  const user = userEvent.setup();\n  render(<Counter />);\n  expect(screen.getByText('Count: 0')).toBeInTheDocument();\n  await user.click(screen.getByRole('button', { name: /increment/i }));\n  expect(screen.getByText('Count: 1')).toBeInTheDocument();\n});"
      },
      "solutionCode": {
        "/App.jsx": "import { useState } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(c => c + 1)}>Increment</button>\n    </div>\n  );\n}",
        "/App.test.jsx": "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\nimport Counter from './App';\n\ntest('increments count when button is clicked', async () => {\n  const user = userEvent.setup();\n  render(<Counter />);\n  expect(screen.getByText('Count: 0')).toBeInTheDocument();\n  await user.click(screen.getByRole('button', { name: /increment/i }));\n  expect(screen.getByText('Count: 1')).toBeInTheDocument();\n});"
      },
      "exampleWalkthrough": {
        "code": "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\nimport Button from './Button';\n\ntest('button click works', async () => {\n  render(<Button>Submit</Button>);\n  const btn = screen.getByRole('button', { name: /submit/i });\n\n  await userEvent.click(btn);\n  expect(btn).toBeDisabled();\n});",
        "steps": [
          {
            "highlightLines": [
              6
            ],
            "description": "`render` mounts the component into a real DOM provided by the test environment — jsdom, usually. There is no shallow rendering here and no component instance to poke at; what you get is markup.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7
            ],
            "description": "`getByRole('button', { name: /submit/i })` finds the element the way an assistive technology would: by its role and its accessible name.\n\nPrefer this to `getByText` or a test id. A query by role fails when the button stops being reachable as a button — the accessible name disappears, or a `<div onClick>` replaced it — which is a regression you want a test to notice. A text query passes right through that.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              9
            ],
            "description": "`userEvent.click` simulates the full sequence a real click produces — pointer events, focus, then the click — rather than firing one synthetic event. It is asynchronous, so it needs the `await`.\n\n`fireEvent.click` is the lower-level alternative and skips all of that, which is why it can pass on components a real user cannot operate.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10
            ],
            "description": "The assertion is about what the user can now observe: the button is disabled.\n\nNotice what is never mentioned — no state variable, no prop, no internal function name. The test would survive a complete rewrite of the component's internals, and fail the moment the visible behaviour changed. That is the trade this whole module is arguing for.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "test('increments count', async () => {\n  const user = userEvent.setup();\n  render(<Counter />);\n  expect(screen.getByText('Count: 0')).toBeInTheDocument();\n  await user.click(screen.getByRole('button', { name: /increment/i }));\n  expect(screen.getByText('Count: 1')).toBeInTheDocument();\n});",
        "steps": [
          {
            "highlightLines": [
              3
            ],
            "description": "`render()` mounts the component into a real DOM (jsdom). The full component tree is rendered and queryable.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              4
            ],
            "description": "`screen.getByText` queries the DOM for an element containing this text. This tests user-visible output, not internal state.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              5
            ],
            "description": "`userEvent.click` simulates a real user click with correct event ordering. Always `await` it since events are processed asynchronously.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6
            ],
            "description": "After the click, the component re-renders with count = 1. If the button handler was broken (passing the event object to setCount), the count would be NaN and this assertion would fail.\n\nThe exact text output on the screen will be:\n(Test passes silently)",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why is `getBy` failing my tests?",
          "type": "misconception",
          "walkthrough": {
            "code": "// Throws an error if not found instantly\nscreen.getByText('Loading...');\n\n// Returns null safely if not found\nscreen.queryByText('Loading...');",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "Any query starting with `getBy` is strictly assertive. If the element isn't in the DOM the exact millisecond the query runs, it throws an error and crashes the test."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "If you explicitly want to test that an element does NOT exist, you must use `queryBy`, which safely returns `null` instead of throwing."
              }
            ]
          }
        },
        {
          "title": "Should I test component state?",
          "type": "misconception",
          "walkthrough": {
            "code": "expect(component.instance().state.count).toBe(1);",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "Absolutely not! React Testing Library fundamentally believes that tests should resemble how users interact with the app."
              },
              {
                "highlightLines": [
                  1
                ],
                "description": "Users don't know what `state.count` is. They only see the number `1` on the screen. Always test the DOM output, never the internal implementation details."
              }
            ]
          }
        },
        {
          "title": "Why does `queryBy` return null instead of throwing?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Test passes if the element is NOT there\nexpect(screen.queryByText('Error')).toBeNull();\n\n// Test crashes immediately if not there\nexpect(screen.getByText('Error')).not.toBeInTheDocument(); // Bad!",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "`queryBy` is specifically designed for negative assertions (verifying something doesn't exist)."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "If you try to use `getByText` combined with `.not.toBeInTheDocument()`, the `getByText` function itself will violently throw an error before it even reaches your expectation block!"
              }
            ]
          }
        },
        {
          "title": "The Accessible Query Priority Hierarchy in RTL",
          "type": "pro-tip",
          "walkthrough": {
            "code": "// Priority 1: Accessible to Everyone (Assistive tech & sighted users)\nscreen.getByRole('button', { name: /submit/i });\n\n// Priority 2: Semantic Form Labels\nscreen.getByLabelText(/email address/i);\n\n// Priority 3: Visual Text\nscreen.getByText(/welcome back/i);\n\n// Priority 4: Test ID (Last resort escape hatch)\nscreen.getByTestId('custom-canvas');",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "Always prefer `getByRole`. It ensures your UI is accessible to screen readers, keyboards, and assistive devices."
              },
              {
                "highlightLines": [
                  11
                ],
                "description": "Only use `getByTestId` for dynamic canvas elements or non-semantic third-party widgets where accessible roles are impossible."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "testing-async",
      "title": "Testing Async State",
      "dependencies": {
        "@testing-library/react": "^16.0.1",
        "@testing-library/user-event": "^14.5.2",
        "@testing-library/jest-dom": "^6.5.0",
        "vitest": "^2.1.4"
      },
      "content": "\n# Testing Async State\n\n### What is it?\n**Building on RTL basics and useEffect:** Most components fetch data asynchronously. Testing them requires handling async operations and mocking the network so tests are fast and deterministic.\n\n> \ud83d\udca1 **Mental Model:** Think of waitFor like waiting for a kettle to boil by listening for the whistle, not by guessing \\\"it's probably done after 90 seconds\\\" and walking away \u2014 you react to the actual signal instead of a guessed delay.\n\n### Why do we need it?\nReplace `global.fetch` with a mock for the test duration. The mock returns a resolved Promise immediately.\n\n### How?\nAsync Queries:\n- **`findBy*`** — async version of `getBy*`. Returns a Promise that resolves when the element appears (up to 1000ms timeout).\n- **`waitFor(() => expect(...))`** — polls an assertion until it passes or times out.\n\n### Syntax/Example\n```jsx\nimport { render, screen, waitFor } from '@testing-library/react';\n\ntest('loads and displays user data', async () => {\n  render(<UserProfile userId={1} />);\n  \n  // This asserts that the loading indicator is visible initially\n  expect(screen.getByText(/loading/i)).toBeInTheDocument();\n  \n  // This causes the test to wait until the assertion passes\n  await waitFor(() => {\n    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();\n  });\n});\n```\n\n### Example\n```jsx\nimport { render, screen } from '@testing-library/react';\nimport UserList from './UserList';\n\ntest('loads users', async () => {\n  render(<UserList />);\n  // Wait until the list items appear\n  const items = await screen.findAllByRole('listitem');\n  expect(items).toHaveLength(3);\n});\n```\n\n### Challenge and Solution\n**Challenge:** The test is failing because `getByText` is synchronous but the user name only appears after an async fetch. Look at the mock setup—it returns `[{ id: 1, name: 'Alice' }]`. Change `getByText` to `findByText` to make the query async.\n\n**Solution:** In `App.test.jsx`, change `expect(screen.getByText('Alice')).toBeInTheDocument();` to `expect(await screen.findByText('Alice')).toBeInTheDocument();`.\n\n### Hints\n* `findByText` returns a Promise, so you must use `await`!\n",
      "starterCode": {
        "/App.jsx": "import { useState, useEffect } from 'react';\n\nexport default function UserList() {\n  const [users, setUsers] = useState([]);\n  const [loading, setLoading] = useState(true);\n  useEffect(() => {\n    fetch('https://jsonplaceholder.typicode.com/users')\n      .then(r => r.json())\n      .then(data => { setUsers(data); setLoading(false); });\n  }, []);\n  if (loading) return <p>Loading...</p>;\n  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;\n}",
        "/App.test.jsx": "import { render, screen } from '@testing-library/react';\nimport UserList from './App';\nimport { vi, beforeEach, test, expect } from 'vitest';\n\nbeforeEach(() => {\n  global.fetch = vi.fn(() =>\n    Promise.resolve({ json: () => Promise.resolve([{ id: 1, name: 'Alice' }]) })\n  );\n});\n\ntest('renders user names', async () => {\n  render(<UserList />);\n  // ❌ getByText is synchronous but Alice appears asynchronously!\n  expect(screen.getByText('Alice')).toBeInTheDocument();\n});"
      },
      "solutionCode": {
        "/App.jsx": "import { useState, useEffect } from 'react';\n\nexport default function UserList() {\n  const [users, setUsers] = useState([]);\n  const [loading, setLoading] = useState(true);\n  useEffect(() => {\n    fetch('https://jsonplaceholder.typicode.com/users')\n      .then(r => r.json())\n      .then(data => { setUsers(data); setLoading(false); });\n  }, []);\n  if (loading) return <p>Loading...</p>;\n  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;\n}",
        "/App.test.jsx": "import { render, screen } from '@testing-library/react';\nimport UserList from './App';\nimport { vi, beforeEach, test, expect } from 'vitest';\n\nbeforeEach(() => {\n  global.fetch = vi.fn(() =>\n    Promise.resolve({ json: () => Promise.resolve([{ id: 1, name: 'Alice' }]) })\n  );\n});\n\ntest('renders user names', async () => {\n  render(<UserList />);\n  // ✅ findByText is async: waits for Alice to appear\n  expect(await screen.findByText('Alice')).toBeInTheDocument();\n});"
      },
      "exampleWalkthrough": {
        "code": "import { render, screen } from '@testing-library/react';\nimport UserList from './UserList';\n\ntest('loads users', async () => {\n  render(<UserList />);\n  // Wait until the list items appear\n  const items = await screen.findAllByRole('listitem');\n  expect(items).toHaveLength(3);\n});",
        "steps": [
          {
            "highlightLines": [
              5
            ],
            "description": "Rendering starts the component's fetch, but nothing has resolved yet. At this instant the list is empty, and a `getAllByRole` here would throw.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6,
              7
            ],
            "description": "`findAllByRole` is the async query: it retries until at least one match appears or it times out at around a second, and it returns a Promise, so it needs the `await`.\n\nThe three families are worth keeping straight. `getBy*` throws immediately when there is no match. `queryBy*` returns `null` instead, which is how you assert that something is **absent**. `findBy*` waits.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              8
            ],
            "description": "Once the elements exist, the assertion is ordinary and synchronous.\n\nWhat this test never does is reach for a timer or a fixed delay. `await new Promise(r => setTimeout(r, 500))` would pass on a fast machine and flake on a loaded CI runner; `findAllByRole` waits for the actual condition instead of guessing how long it takes.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "global.fetch = vi.fn(() =>\n  Promise.resolve({ json: () => Promise.resolve([{ id: 1, name: 'Alice' }]) })\n);\n\ntest('renders user names', async () => {\n  render(<UserList />);\n  expect(await screen.findByText('Alice')).toBeInTheDocument();\n});",
        "steps": [
          {
            "highlightLines": [
              1,
              3
            ],
            "description": "`vi.fn()` replaces `global.fetch` with a mock that resolves instantly with fake data. No network, no latency, no flakiness.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6
            ],
            "description": "`render(<UserList />)` mounts the component. The useEffect is scheduled but has NOT run yet—the component shows \"Loading...\".",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7
            ],
            "description": "`screen.findByText('Alice')` returns a Promise. RTL polls the DOM every 50ms until it finds the element or times out at 1000ms. Meanwhile the fetch mock resolves and the component re-renders.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7
            ],
            "description": "Once the element appears, the Promise resolves and the assertion passes. If the element never appears, the test fails with a clear timeout message.\n\nThe exact text output on the screen will be:\n(Test passes silently)",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "The magic of `findBy`",
          "type": "did-you-know",
          "walkthrough": {
            "code": "test('loads user', async () => {\n  render(<UserProfile />);\n  const el = await screen.findByText('John Doe');\n  expect(el).toBeInTheDocument();\n});",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "If your component fetches data, the element won't exist instantly on render."
              },
              {
                "highlightLines": [
                  3
                ],
                "description": "`findBy` is essentially a `getBy` wrapped in an automatic `waitFor`. It will repeatedly check the DOM for up to 1000ms until the element finally appears!"
              }
            ]
          }
        },
        {
          "title": "What is `userEvent` vs `fireEvent`?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Simplistic, fires instantly\nfireEvent.change(input, { target: { value: 'a' } });\n\n// Realistic, simulates full typing\nawait userEvent.type(input, 'a');",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "`fireEvent` is a low-level API that literally just dispatches a raw DOM event. It doesn't trigger focus, keydown, or keyup events."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "`userEvent` actually simulates a real human. When you `.type()`, it clicks the input, focuses it, fires keydown, inputs the char, and fires keyup. Always use `userEvent`!"
              }
            ]
          }
        },
        {
          "title": "Why do I need `act()` warnings?",
          "type": "misconception",
          "walkthrough": {
            "code": "Warning: An update to Component inside a test was not wrapped in act(...).",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "If you see this warning, it means your component tried to update its state (like setting a fetched user) AFTER your test had already completely finished running!"
              },
              {
                "highlightLines": [
                  1
                ],
                "description": "React is warning you that your test didn't wait long enough. To fix it, you need to use `await screen.findBy(...)` to ensure the test waits for the final state update before closing."
              }
            ]
          }
        },
        {
          "title": "The Decision Matrix: getBy vs queryBy vs findBy",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// 1. getBy*: Synchronous check. Throws immediately if NOT found.\nexpect(screen.getByRole('heading')).toBeInTheDocument();\n\n// 2. queryBy*: Synchronous check. Returns null if NOT found.\nexpect(screen.queryByText('Error')).not.toBeInTheDocument();\n\n// 3. findBy*: Asynchronous check. Retries until found or times out!\nexpect(await screen.findByText('Loaded Data')).toBeInTheDocument();",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "Use `getBy*` when the element should already exist in the DOM."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "Use `queryBy*` exclusively to assert that an element is ABSENT (`.not.toBeInTheDocument()`)."
              },
              {
                "highlightLines": [
                  8
                ],
                "description": "Use `await findBy*` whenever asserting on elements that appear after a state update, timer, or network fetch."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "testing-custom-hooks",
      "title": "Testing Custom Hooks with renderHook",
      "dependencies": {
        "@testing-library/react": "^16.0.1",
        "@testing-library/jest-dom": "^6.5.0",
        "vitest": "^2.1.4"
      },
      "content": "\n# Testing Custom Hooks with renderHook\n\n### What is it?\n**Building on Custom Hooks:** Hooks cannot be invoked like regular JavaScript functions because they require React's execution context. React Testing Library provides **`renderHook`** and **`act`** specifically to test custom hooks in isolation.\n\n> \ud83d\udca1 **Mental Model:** Think of testing a custom hook like reviewing a vending machine from the outside: you care that inserting a coin and pressing B4 gives you the right snack (its returned values and behavior) \u2014 you don't need to open the machine and inspect its gears to trust it works.\n\n### Why do we need it?\nWithout `renderHook`, you would have to construct a dummy test component every time you want to verify a hook's state and return values. `renderHook` creates an invisible harness component behind the scenes.\n\n### How?\n1. Call `const { result } = renderHook(() => useMyHook());`.\n2. Access the current hook values on `result.current`.\n3. Wrap any action that updates state inside `act(() => { result.current.increment(); })`.\n\n### Syntax/Example\n```javascript\nimport { renderHook, act } from '@testing-library/react';\nimport { useCounter } from './useCounter';\n\ntest('should increment counter', () => {\n  const { result } = renderHook(() => useCounter(0));\n  \n  act(() => {\n    result.current.increment();\n  });\n  \n  expect(result.current.count).toBe(1);\n});\n```\n\n### Example\n```jsx\nimport { renderHook, act } from '@testing-library/react';\nimport { useState } from 'react';\n\nfunction useToggle(initial = false) {\n  const [value, setValue] = useState(initial);\n  const toggle = () => setValue(v => !v);\n  return [value, toggle];\n}\n\ntest('toggles state', () => {\n  const { result } = renderHook(() => useToggle(false));\n  expect(result.current[0]).toBe(false);\n  act(() => {\n    result.current[1]();\n  });\n  expect(result.current[0]).toBe(true);\n});\n```\n\n### Challenge and Solution\n**Challenge:** The test for `useCounter` fails because state mutations must be wrapped inside `act(...)`. Wrap the `increment()` and `decrement()` invocations in `act()` so the test asserts the updated `count`.\n\n**Solution:** Wrap `result.current.increment()` inside `act(() => { result.current.increment(); })` in `useCounter.test.js`.\n\n### Hints\n* Always access `result.current` inside assertions, not a destructured variable from earlier, because `result.current` is mutated on re-render.\n",
      "starterCode": {
        "/useCounter.js": "import { useState } from 'react';\n\nexport function useCounter(initialValue = 0) {\n  const [count, setCount] = useState(initialValue);\n  const increment = () => setCount(c => c + 1);\n  const decrement = () => setCount(c => c - 1);\n  const reset = () => setCount(initialValue);\n  return { count, increment, decrement, reset };\n}",
        "/useCounter.test.js": "import { renderHook, act } from '@testing-library/react';\nimport { useCounter } from './useCounter';\nimport { test, expect } from 'vitest';\n\ntest('increments and decrements counter', () => {\n  const { result } = renderHook(() => useCounter(10));\n  expect(result.current.count).toBe(10);\n\n  // 👉 Wrap this increment call in act(() => { ... })\n  result.current.increment();\n  \n  expect(result.current.count).toBe(11);\n});"
      },
      "solutionCode": {
        "/useCounter.js": "import { useState } from 'react';\n\nexport function useCounter(initialValue = 0) {\n  const [count, setCount] = useState(initialValue);\n  const increment = () => setCount(c => c + 1);\n  const decrement = () => setCount(c => c - 1);\n  const reset = () => setCount(initialValue);\n  return { count, increment, decrement, reset };\n}",
        "/useCounter.test.js": "import { renderHook, act } from '@testing-library/react';\nimport { useCounter } from './useCounter';\nimport { test, expect } from 'vitest';\n\ntest('increments and decrements counter', () => {\n  const { result } = renderHook(() => useCounter(10));\n  expect(result.current.count).toBe(10);\n\n  act(() => {\n    result.current.increment();\n  });\n  \n  expect(result.current.count).toBe(11);\n});"
      },
      "exampleWalkthrough": {
        "code": "import { renderHook, act } from '@testing-library/react';\nimport { useState } from 'react';\n\nfunction useToggle(initial = false) {\n  const [value, setValue] = useState(initial);\n  const toggle = () => setValue(v => !v);\n  return [value, toggle];\n}\n\ntest('toggles state', () => {\n  const { result } = renderHook(() => useToggle(false));\n  expect(result.current[0]).toBe(false);\n  act(() => {\n    result.current[1]();\n  });\n  expect(result.current[0]).toBe(true);\n});",
        "steps": [
          {
            "highlightLines": [
              4,
              5,
              6,
              7
            ],
            "description": "The hook under test. Nothing about it is test-specific — it is the same `useToggle` the application would use.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              11
            ],
            "description": "`renderHook` mounts a throwaway component whose only job is to call the hook and expose what it returns.\n\nThat wrapper exists because hooks can only run inside a component. Calling `useToggle()` directly from a test would throw — the same rule that forbids calling hooks from plain functions in application code.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              13,
              14,
              15
            ],
            "description": "`act` wraps the state update. It tells React \"I am about to cause a change; process it fully before continuing\", so queued updates and effects are flushed before line 16 reads the value.\n\nWithout it the assertion can run against the state as it was before the toggle, and React warns about an update happening outside `act`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              12,
              16
            ],
            "description": "`result.current` is always the hook's latest return value — it is re-read after every render, which is why it has to be accessed fresh each time rather than destructured once at the top.\n\nUse this for hooks meant to be shared. For a hook used by exactly one component, testing that component's behaviour usually says more, since it tests the hook and its use together.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "test('increments counter', () => {\n  const { result } = renderHook(() => useCounter(10));\n  act(() => {\n    result.current.increment();\n  });\n  expect(result.current.count).toBe(11);\n});",
        "steps": [
          {
            "highlightLines": [
              3,
              5
            ],
            "description": "Wrapping the state modification in `act()` notifies React to process state updates and re-render the test harness.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6
            ],
            "description": "The assertion evaluates against `result.current.count` and passes cleanly.\n\nThe exact text output on the screen will be:\n(Test passes silently)",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why can't I destructure `const { count } = result.current`?",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ Bug: 'count' is copied as primitive number 0 and never updates!\nconst { result } = renderHook(() => useCounter());\nconst { count, increment } = result.current;\nact(() => increment());\nexpect(count).toBe(1); // FAILS: count is still 0!",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "When you destructure a primitive like a number or boolean, you copy its value at that single moment."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "`result` is a stable object ref whose `.current` property gets updated on every render. Always read `result.current.count`!"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "mocking-modules",
      "title": "Module Mocking with vi.mock",
      "dependencies": {
        "@testing-library/react": "^16.0.1",
        "@testing-library/user-event": "^14.5.2",
        "@testing-library/jest-dom": "^6.5.0",
        "vitest": "^2.1.4"
      },
      "content": "\n# Module Mocking with vi.mock\n\n### What is it?\n**Building on test isolation:** When components import third-party SDKs, analytics trackers, or external API modules, you want to mock those whole modules so tests run deterministically in memory without side effects.\n\n> \ud83d\udca1 **Mental Model:** Think of mocking a module like swapping a real stunt double in for an actor during a dangerous scene: the rest of the movie (your test) plays out exactly the same, but the real risky part (an actual network call or side effect) never actually happens.\n\n### Why do we need it?\nIf a component calls `trackAnalyticsEvent('checkout')` or `sendEmailNotification()`, unit tests should not make real network requests or corrupt real analytics dashboards.\n\n### How?\nUse Vitest's `vi.mock('./analytics', () => ({ ... }))` to replace an entire module file with spy functions (`vi.fn()`).\n\n### Syntax/Example\n```jsx\nimport { vi, test, expect } from 'vitest';\nimport { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\nimport * as analytics from './analytics';\nimport CheckoutButton from './CheckoutButton';\n\nvi.mock('./analytics', () => ({\n  trackPurchase: vi.fn(),\n}));\n\ntest('tracks purchase when clicked', async () => {\n  render(<CheckoutButton amount={99} />);\n  await userEvent.click(screen.getByRole('button', { name: /buy/i }));\n  expect(analytics.trackPurchase).toHaveBeenCalledWith(99);\n});\n```\n\n### Example\n```jsx\nimport { vi, test, expect } from 'vitest';\nimport * as api from './api';\n\nvi.mock('./api', () => ({\n  fetchUserProfile: vi.fn(() => Promise.resolve({ name: 'Bob' }))\n}));\n\ntest('mocks api correctly', async () => {\n  const user = await api.fetchUserProfile();\n  expect(user.name).toBe('Bob');\n});\n```\n\n### Challenge and Solution\n**Challenge:** The `SubscribeBox` component calls `newsletterService.subscribe(email)`. In `SubscribeBox.test.jsx`, use `vi.mock('./newsletterService')` to mock the service so it doesn't fail, and assert that `subscribe` was called with the user's email.\n\n**Solution:** Add `vi.mock('./newsletterService', () => ({ subscribe: vi.fn() }));` at the top of the test file.\n\n### Hints\n* `vi.mock` calls are hoisted by Vitest to the top of the file before imports run.\n",
      "starterCode": {
        "/newsletterService.js": "export async function subscribe(email) {\n  throw new Error('Real network request forbidden in unit tests!');\n}",
        "/SubscribeBox.jsx": "import { useState } from 'react';\nimport { subscribe } from './newsletterService';\n\nexport default function SubscribeBox() {\n  const [email, setEmail] = useState('');\n  const [done, setDone] = useState(false);\n\n  const handleSubmit = async (e) => {\n    e.preventDefault();\n    await subscribe(email);\n    setDone(true);\n  };\n\n  if (done) return <p>Subscribed!</p>;\n\n  return (\n    <form onSubmit={handleSubmit}>\n      <input \n        value={email} \n        onChange={e => setEmail(e.target.value)} \n        placeholder=\"Enter email\" \n      />\n      <button type=\"submit\">Join</button>\n    </form>\n  );\n}",
        "/SubscribeBox.test.jsx": "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\nimport { test, expect, vi } from 'vitest';\nimport SubscribeBox from './SubscribeBox';\nimport { subscribe } from './newsletterService';\n\n// 👉 Mock './newsletterService' with vi.mock so subscribe is a vi.fn()\n\ntest('subscribes user with email', async () => {\n  const user = userEvent.setup();\n  render(<SubscribeBox />);\n  \n  await user.type(screen.getByPlaceholderText(/enter email/i), 'dev@react.com');\n  await user.click(screen.getByRole('button', { name: /join/i }));\n  \n  expect(await screen.findByText(/subscribed!/i)).toBeInTheDocument();\n});"
      },
      "solutionCode": {
        "/newsletterService.js": "export async function subscribe(email) {\n  throw new Error('Real network request forbidden in unit tests!');\n}",
        "/SubscribeBox.jsx": "import { useState } from 'react';\nimport { subscribe } from './newsletterService';\n\nexport default function SubscribeBox() {\n  const [email, setEmail] = useState('');\n  const [done, setDone] = useState(false);\n\n  const handleSubmit = async (e) => {\n    e.preventDefault();\n    await subscribe(email);\n    setDone(true);\n  };\n\n  if (done) return <p>Subscribed!</p>;\n\n  return (\n    <form onSubmit={handleSubmit}>\n      <input \n        value={email} \n        onChange={e => setEmail(e.target.value)} \n        placeholder=\"Enter email\" \n      />\n      <button type=\"submit\">Join</button>\n    </form>\n  );\n}",
        "/SubscribeBox.test.jsx": "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\nimport { test, expect, vi } from 'vitest';\nimport SubscribeBox from './SubscribeBox';\nimport { subscribe } from './newsletterService';\n\nvi.mock('./newsletterService', () => ({\n  subscribe: vi.fn(() => Promise.resolve({ ok: true }))\n}));\n\ntest('subscribes user with email', async () => {\n  const user = userEvent.setup();\n  render(<SubscribeBox />);\n  \n  await user.type(screen.getByPlaceholderText(/enter email/i), 'dev@react.com');\n  await user.click(screen.getByRole('button', { name: /join/i }));\n  \n  expect(subscribe).toHaveBeenCalledWith('dev@react.com');\n  expect(await screen.findByText(/subscribed!/i)).toBeInTheDocument();\n});"
      },
      "exampleWalkthrough": {
        "code": "import { vi, test, expect } from 'vitest';\nimport * as api from './api';\n\nvi.mock('./api', () => ({\n  fetchUserProfile: vi.fn(() => Promise.resolve({ name: 'Bob' }))\n}));\n\ntest('mocks api correctly', async () => {\n  const user = await api.fetchUserProfile();\n  expect(user.name).toBe('Bob');\n});",
        "steps": [
          {
            "highlightLines": [
              4,
              5,
              6
            ],
            "description": "`vi.mock` replaces the whole `./api` module for this test file. The factory returns the stand-in, and `vi.fn()` records every call it receives.\n\nOne surprise worth expecting: this call is **hoisted** to the top of the file, above the imports, no matter where you write it. That is why the factory cannot reference variables declared outside it — they do not exist yet when it runs.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              2,
              9
            ],
            "description": "The import on line 2 resolves to the mock, not the real module. Any code anywhere in the tree that imports `./api` gets the same replacement, which is what makes this work for modules buried deep inside a component.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10
            ],
            "description": "Now the test controls what the network layer returns, with no server and no timing.\n\nThe cost is coupling: this test now knows that the code imports `./api` and calls `fetchUserProfile`. Rename that function and the test needs editing even though nothing the user sees has changed. Mock at the boundary you actually own, and prefer intercepting HTTP — the next lesson's approach — when the boundary is the network.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "vi.mock('./newsletterService', () => ({\n  subscribe: vi.fn(() => Promise.resolve({ ok: true }))\n}));",
        "steps": [
          {
            "highlightLines": [
              1,
              2,
              3
            ],
            "description": "The mock prevents the real newsletterService from throwing an error, simulating a 100% successful subscription.\n\nThe exact text output on the screen will be:\n(Test passes silently)",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "vi.mock vs vi.spyOn",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// vi.mock: Replaces the entire module file\nvi.mock('./analytics');\n\n// vi.spyOn: Wraps a single method on an existing object\nconst spy = vi.spyOn(console, 'error');",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "`vi.mock` is best when you want to completely swap out an external dependency."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "`vi.spyOn` lets you listen to calls on real methods and optionally restore them later using `spy.mockRestore()`."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "msw-api-mocking",
      "title": "Mocking Network APIs with MSW",
      "dependencies": {
        "@testing-library/react": "^16.0.1",
        "@testing-library/jest-dom": "^6.5.0",
        "msw": "^2.6.0",
        "vitest": "^2.1.4"
      },
      "content": "\n# Mocking Network APIs with MSW (Mock Service Worker)\n\n### What is it?\n**Building on asynchronous testing:** **MSW (Mock Service Worker)** is the widely used approach for API mocking. Instead of patching `fetch` or mocking Axios modules, MSW intercepts actual network requests at the HTTP boundary.\n\n> \ud83d\udca1 **Mental Model:** Think of MSW like a stand-in customer service line set up just for a fire drill: real-looking requests go out and get real-looking responses back, but nothing actually reaches the live servers on the other end.\n\n### Why do we need it?\nPatching `global.fetch` or Axios modules tests implementation details (e.g. your tests fail if you refactor from Axios to fetch). MSW intercepts HTTP requests transparently, allowing your components to use any fetching library while guaranteeing real network requests never hit production servers.\n\n### How?\n1. Define request handlers using `http.get('/api/users', () => HttpResponse.json([...]))`.\n2. Set up the test server with `setupServer(...handlers)`.\n3. Start listening before all tests (`server.listen()`) and reset handlers after each test (`server.resetHandlers()`).\n\n### Syntax/Example\n```jsx\nimport { http, HttpResponse } from 'msw';\nimport { setupServer } from 'msw/node';\nimport { render, screen } from '@testing-library/react';\n\nconst server = setupServer(\n  http.get('https://api.example.com/products', () => {\n    return HttpResponse.json([{ id: 1, name: 'Mechanical Keyboard' }]);\n  })\n);\n\nbeforeAll(() => server.listen());\nafterEach(() => server.resetHandlers());\nafterAll(() => server.close());\n\ntest('displays product names', async () => {\n  render(<ProductList />);\n  expect(await screen.findByText('Mechanical Keyboard')).toBeInTheDocument();\n});\n```\n\n### Example\n```jsx\nimport { http, HttpResponse } from 'msw';\nimport { setupServer } from 'msw/node';\n\nconst server = setupServer(\n  http.get('/api/status', () => HttpResponse.json({ status: 'healthy' }))\n);\n\ntest('server health check', async () => {\n  server.listen();\n  const res = await fetch('/api/status').then(r => r.json());\n  expect(res.status).toBe('healthy');\n  server.close();\n});\n```\n\n### Challenge and Solution\n**Challenge:** The test is failing with a network error. Create an MSW handler for `GET https://api.store.com/cart` that returns `{ total: 49.99, count: 2 }` using `HttpResponse.json()`, and pass it into `setupServer`.\n\n**Solution:** Define `http.get('https://api.store.com/cart', () => HttpResponse.json({ total: 49.99, count: 2 }))` and register it with `setupServer`.\n\n### Hints\n* With MSW 2.0+, use `http.get(...)` and return `HttpResponse.json(...)`.\n",
      "starterCode": {
        "/CartSummary.jsx": "import { useState, useEffect } from 'react';\n\nexport default function CartSummary() {\n  const [cart, setCart] = useState(null);\n  const [error, setError] = useState(false);\n\n  useEffect(() => {\n    fetch('https://api.store.com/cart')\n      .then(res => {\n        if (!res.ok) throw new Error('Failed');\n        return res.json();\n      })\n      .then(data => setCart(data))\n      .catch(() => setError(true));\n  }, []);\n\n  if (error) return <p>Failed to load cart</p>;\n  if (!cart) return <p>Loading cart...</p>;\n\n  return (\n    <div>\n      <h3>Cart: {cart.count} items</h3>\n      <p>Total: ${cart.total}</p>\n    </div>\n  );\n}",
        "/CartSummary.test.jsx": "import { render, screen } from '@testing-library/react';\nimport { http, HttpResponse } from 'msw';\nimport { setupServer } from 'msw/node';\nimport { beforeAll, afterEach, afterAll, test, expect } from 'vitest';\nimport CartSummary from './CartSummary';\n\n// 👉 Define MSW handler for GET 'https://api.store.com/cart'\n// returning { total: 49.99, count: 2 }\nconst server = setupServer(\n  // Add handler here!\n);\n\nbeforeAll(() => server.listen());\nafterEach(() => server.resetHandlers());\nafterAll(() => server.close());\n\ntest('renders cart count and total price', async () => {\n  render(<CartSummary />);\n  expect(await screen.findByText(/Cart: 2 items/i)).toBeInTheDocument();\n  expect(screen.getByText(/Total: \\$49.99/i)).toBeInTheDocument();\n});"
      },
      "solutionCode": {
        "/CartSummary.jsx": "import { useState, useEffect } from 'react';\n\nexport default function CartSummary() {\n  const [cart, setCart] = useState(null);\n  const [error, setError] = useState(false);\n\n  useEffect(() => {\n    fetch('https://api.store.com/cart')\n      .then(res => {\n        if (!res.ok) throw new Error('Failed');\n        return res.json();\n      })\n      .then(data => setCart(data))\n      .catch(() => setError(true));\n  }, []);\n\n  if (error) return <p>Failed to load cart</p>;\n  if (!cart) return <p>Loading cart...</p>;\n\n  return (\n    <div>\n      <h3>Cart: {cart.count} items</h3>\n      <p>Total: ${cart.total}</p>\n    </div>\n  );\n}",
        "/CartSummary.test.jsx": "import { render, screen } from '@testing-library/react';\nimport { http, HttpResponse } from 'msw';\nimport { setupServer } from 'msw/node';\nimport { beforeAll, afterEach, afterAll, test, expect } from 'vitest';\nimport CartSummary from './CartSummary';\n\nconst server = setupServer(\n  http.get('https://api.store.com/cart', () => {\n    return HttpResponse.json({ total: 49.99, count: 2 });\n  })\n);\n\nbeforeAll(() => server.listen());\nafterEach(() => server.resetHandlers());\nafterAll(() => server.close());\n\ntest('renders cart count and total price', async () => {\n  render(<CartSummary />);\n  expect(await screen.findByText(/Cart: 2 items/i)).toBeInTheDocument();\n  expect(screen.getByText(/Total: \\$49.99/i)).toBeInTheDocument();\n});"
      },
      "exampleWalkthrough": {
        "code": "import { http, HttpResponse } from 'msw';\nimport { setupServer } from 'msw/node';\n\nconst server = setupServer(\n  http.get('/api/status', () => HttpResponse.json({ status: 'healthy' }))\n);\n\ntest('server health check', async () => {\n  server.listen();\n  const res = await fetch('/api/status').then(r => r.json());\n  expect(res.status).toBe('healthy');\n  server.close();\n});",
        "steps": [
          {
            "highlightLines": [
              4,
              5,
              6
            ],
            "description": "`setupServer` takes request handlers: this one answers `GET /api/status` with JSON. MSW intercepts at the network layer, below `fetch`, so the application code makes a completely ordinary request and never learns it was handled locally.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              9,
              12
            ],
            "description": "`listen()` starts the interception and `close()` stops it.\n\nIn a real suite these belong in `beforeAll` and `afterAll`, with `server.resetHandlers()` in `afterEach` so that a handler one test overrides does not leak into the next. They are inline here to keep the whole lifecycle visible in one place.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10
            ],
            "description": "This is a real `fetch` call to a real URL. Nothing has been injected, stubbed, or passed in — which means the code under test can be exercised exactly as it ships.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              11
            ],
            "description": "That is the difference from `vi.mock`. Mocking a module couples the test to how the code is organised; intercepting HTTP couples it only to the contract with the server, which is the thing that actually has to stay stable.\n\nThe same handlers can also drive the app in development and in the browser, so one description of the API serves both.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "const server = setupServer(\n  http.get('https://api.store.com/cart', () => {\n    return HttpResponse.json({ total: 49.99, count: 2 });\n  })\n);\n\nbeforeAll(() => server.listen());\nafterEach(() => server.resetHandlers());\nafterAll(() => server.close());",
        "steps": [
          {
            "highlightLines": [
              2,
              3,
              4
            ],
            "description": "We declare our mock endpoint to return cart totals.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7,
              8,
              9
            ],
            "description": "The server lifecycle hooks start intercepting requests before tests run and clean up afterwards.\n\nThe exact text output on the screen will be:\n(Test passes silently)",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why MSW is superior to fetch mocking",
          "type": "pro-tip",
          "walkthrough": {
            "code": "// With MSW, you can test error status codes effortlessly\nserver.use(\n  http.get('https://api.store.com/cart', () => {\n    return new HttpResponse(null, { status: 500 });\n  })\n);",
            "steps": [
              {
                "highlightLines": [
                  2,
                  3,
                  4
                ],
                "description": "With MSW's `server.use()`, you can override responses on a per-test basis to simulate 500 server errors or 401 unauthorized states without rewiring mocks."
              }
            ]
          }
        }
      ]
    }
  ]
};
