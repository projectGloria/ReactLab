export default {
  "id": "sharing-state",
  "title": "Sharing State",
  "description": "Context boundaries, provider components, and reducer-backed app state.",
  "icon": "Share2",
  "lessons": [
    {
      "id": "use-context",
      "title": "Context API",
      "content": "\n# Passing Data Deeply with Context\n\n### What is it?\n**Building on props and component trees:** Instead of manually threading props down through many intermediate layers (\"prop drilling\"), **Context** lets a parent component broadcast information directly to any component in the subtree below it—no matter how deep.\n\n> 💡 **Mental Model:** Think of Context like a building's PA system: instead of running a wire (prop) down through every single floor and hallway to reach one office, you make one announcement at the top and any floor that's listening can just tune in.\n\n### Why do we need it?\nUsually, you pass data down via props. But if you have to pass data through 5 layers of components (prop drilling), it gets messy and couples intermediate components to data they don't even need.\n\n### Before Context: lift state up\nContext solves *deep* prop drilling — many layers, most of which don't care about the value. It's the wrong tool for two nearby siblings that just need to share one value:\n```jsx\n// Two siblings, same parent — plain props are enough, no Context needed\nfunction App() {\n  const [query, setQuery] = useState('');\n  return (\n    <>\n      <SearchBox query={query} onQueryChange={setQuery} />\n      <Results query={query} />\n    </>\n  );\n}\n```\nThe state lives in the nearest shared parent (`App`) and flows down as ordinary props to both children — this is \"lifting state up,\" and it's simpler to trace than Context: no Provider, no `useContext` call, no whole-subtree re-render to reason about. Reach for Context once that shared parent is many layers away and threading the prop through every layer in between becomes the actual pain point.\n\n### How?\nYou create a context object using `createContext()`. You wrap your component tree in `<YourContext.Provider value={...}>`. Any component inside the provider can read the value by calling `useContext(YourContext)`.\n\n### Syntax/Example\n```jsx\nimport { createContext, useContext } from 'react';\n\n// 1. Create a Context object with an optional default value\nconst ThemeContext = createContext('light');\n\n// 2. Wrap your component tree with the Context element (React 19 syntax)\n<ThemeContext value=\"dark\">\n  <ChildComponent />\n</ThemeContext>\n\n// 3. Inside any child component:\nconst theme = useContext(ThemeContext);\n```\n\n### Common Pitfalls & Gotchas\n1. **Passing inline objects without memoization**: Writing `<AuthContext value={{ user, setUser }}>` generates a fresh object reference on every parent render, forcing every consuming child to re-render even if `user` didn't change. Always memoize with `useMemo` or separate state and dispatch into distinct contexts.\n2. **Reading Context outside a Provider**: Calling `useContext(MyContext)` without an ancestor Provider returns the default value passed to `createContext(defaultValue)` (or `undefined` if none was given). Create a custom consumer hook (`useTheme()`) that throws a helpful error if the context is `undefined`.\n3. **Using Context for high-frequency updates**: Context is designed for low-frequency changes (themes, auth state, locale). For high-frequency state (e.g. cursor positions, text inputs, live animations), use Zustand or component-local state to avoid whole-tree re-render waterfalls.\n\n### Example\n```jsx\nimport { createContext, useContext } from 'react';\n\nconst UserContext = createContext();\n\nfunction Dashboard() {\n  // Any component inside the Provider can read the value.\n  const user = useContext(UserContext);\n  return <h1>Welcome, {user}!</h1>;\n}\n\nexport default function App() {\n  // The value is provided at the top of the tree.\n  return (\n    <UserContext value=\"Alice\">\n      <Dashboard />\n    </UserContext>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** We have a `ThemeContext`, but the `Navbar` component is currently hardcoded to use a 'light' theme.\n\n**Solution:** Read the theme value by calling `useContext(ThemeContext)` inside `Navbar`. Toggle the theme button to see the Navbar update automatically!\n\n### Hints\n* In React 19, you can just render `<ThemeContext value={...}>` instead of `<ThemeContext.Provider value={...}>`.\n* Any time the provided `value` changes, every component that reads this context re-renders — `memo` will not stop it, because the value arrives through the context channel rather than through props. Components that do not read it are unaffected. Use Context for data that is genuinely shared and changes rarely.\n",
      "starterCode": "import { useState, createContext, useContext } from 'react';\n\nconst ThemeContext = createContext('light');\n\nfunction Navbar() {\n  // ❌ Hardcoded theme!\n  const theme = 'light';\n\n  return (\n    <div style={{ \n      padding: 20, \n      background: theme === 'dark' ? '#333' : '#eee',\n      color: theme === 'dark' ? '#fff' : '#000'\n    }}>\n      My App Navbar\n    </div>\n  );\n}\n\nexport default function App() {\n  const [theme, setTheme] = useState('light');\n\n  return (\n    <ThemeContext value={theme}>\n      <Navbar />\n      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>\n        Toggle Theme\n      </button>\n    </ThemeContext>\n  );\n}\n",
      "solutionCode": "import { useState, createContext, useContext } from 'react';\n\nconst ThemeContext = createContext('light');\n\nfunction Navbar() {\n  const theme = useContext(ThemeContext);\n\n  return (\n    <div style={{ \n      padding: 20, \n      background: theme === 'dark' ? '#333' : '#eee',\n      color: theme === 'dark' ? '#fff' : '#000'\n    }}>\n      My App Navbar\n    </div>\n  );\n}\n\nexport default function App() {\n  const [theme, setTheme] = useState('light');\n\n  return (\n    <ThemeContext value={theme}>\n      <Navbar />\n      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>\n        Toggle Theme\n      </button>\n    </ThemeContext>\n  );\n}\n",
      "exampleWalkthrough": {
        "code": "import { createContext, useContext } from 'react';\n\nconst UserContext = createContext();\n\nfunction Dashboard() {\n  // Any component inside the Provider can read the value.\n  const user = useContext(UserContext);\n  return <h1>Welcome, {user}!</h1>;\n}\n\nexport default function App() {\n  // The value is provided at the top of the tree.\n  return (\n    <UserContext value=\"Alice\">\n      <Dashboard />\n    </UserContext>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3
            ],
            "description": "`createContext()` makes the channel itself. It holds no value and belongs to no component — it is the shared key that a provider and a consumer use to find each other.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              14,
              16
            ],
            "description": "Rendering the context object itself as an element puts a value on that channel for everything inside it. Depth does not matter: a component twenty levels down reads it as directly as a child does, and no component in between has to know the value exists.\n\n**Two spellings, one behaviour.** React 19 lets you write `<UserContext value={...}>` directly. Every version before it required `<UserContext.Provider value={...}>`, which still works and which you will see in most existing code.\n\nWhat matters is being *inside* it. A component rendered outside reads the context default instead — which is `undefined` here, and is exactly the bug this example used to ship.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7
            ],
            "description": "`useContext(UserContext)` reads the nearest Provider above this component in the tree. Not the nearest in the file, and not a global lookup — position in the rendered tree is what decides.\n\nThe exact text output on the screen will be:\n`Welcome, Alice!`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useState, createContext, useContext } from 'react';\n\nconst ThemeContext = createContext('light');\n\nfunction Navbar() {\n  const theme = useContext(ThemeContext);\n\n  return (\n    <div style={{ \n      padding: 20, \n      background: theme === 'dark' ? '#333' : '#eee',\n      color: theme === 'dark' ? '#fff' : '#000'\n    }}>\n      My App Navbar\n    </div>\n  );\n}\n\nexport default function App() {\n  const [theme, setTheme] = useState('light');\n\n  return (\n    <ThemeContext value={theme}>\n      <Navbar />\n      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>\n        Toggle Theme\n      </button>\n    </ThemeContext>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              24,
              25,
              26,
              27,
              28
            ],
            "description": "In React 19, we use the Context object itself as a JSX element instead of `.Provider`. We pass the current state as the value.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6
            ],
            "description": "Inside `Navbar`, we call `useContext(ThemeContext)` to read the value. When the state updates, `Navbar` automatically re-renders with the new theme!\n\nThe exact text output on the screen will be:\n`My App Navbar`\n`[Button: Toggle Theme]`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Does Context replace global state?",
          "type": "misconception",
          "walkthrough": {
            "code": "const value = useContext(ThemeContext);",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "Context is a dependency injection system, not a state manager. When the context value changes, every component that *consumes* that context is scheduled to re-render — `memo` on the consumer does not prevent it, because the value arrives through the context channel rather than through props. Components that don't read the context are unaffected."
              },
              {
                "highlightLines": [
                  1
                ],
                "description": "It is fantastic for slow-changing data (like themes or auth), but terrible for fast-changing data (like keyboard input). Use Zustand or Redux for high-frequency global state."
              }
            ]
          }
        },
        {
          "title": "Context Propagation and Render Costs",
          "type": "misconception",
          "walkthrough": {
            "code": "const [user, setUser] = useState(null);\n// Creates a NEW object on every render!\n<AuthContext.Provider value={{ user, setUser }}>",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "If you pass an inline object `{{ user, setUser }}` into a Provider, it creates a brand new memory reference every time the Provider re-renders."
              },
              {
                "highlightLines": [
                  3
                ],
                "description": "Every component consuming that context then re-renders, even though `user` itself did not change — only the wrapper object around it did. Memoize the value with `useMemo`, or split state and setter into two contexts."
              }
            ]
          }
        },
        {
          "title": "Should I put everything in one giant Context?",
          "type": "misconception",
          "walkthrough": {
            "code": "const AppContext = createContext({\n  theme: 'dark',\n  user: null,\n  cartTotal: 0\n});",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2,
                  3,
                  4
                ],
                "description": "Terrible idea! Any time a user adds an item to the cart, the `cartTotal` changes. Because they share a context, the Theme Header and the User Profile will be forced to re-render too."
              },
              {
                "highlightLines": [
                  1
                ],
                "description": "Always split contexts logically: `<ThemeContext>`, `<AuthContext>`, and `<CartContext>`. Components only re-render if the specific context they consume changes."
              }
            ]
          }
        },
        {
          "title": "The Split Context Pattern for High Performance",
          "type": "did-you-know",
          "walkthrough": {
            "code": "const StateContext = createContext(null);\nconst DispatchContext = createContext(null);\n\nexport function ThemeProvider({ children }) {\n  const [theme, setTheme] = useState('light');\n  return (\n    <StateContext.Provider value={theme}>\n      <DispatchContext.Provider value={setTheme}>\n        {children}\n      </DispatchContext.Provider>\n    </StateContext.Provider>\n  );\n}",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2
                ],
                "description": "When state changes in a single Context, every component calling `useContext()` on it re-renders — including buttons that only ever needed the `setTheme` setter and do not care about the value."
              },
              {
                "highlightLines": [
                  7,
                  8
                ],
                "description": "By splitting into `StateContext` and `DispatchContext`, action buttons that only dispatch never re-render when the state value changes!"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "context-provider-pattern",
      "title": "Provider Components & Safe Hooks",
      "content": "\n# Provider Components and Safe Consumer Hooks\n\n### What is it?\n**Building on Context:** In real codebases you almost never see `createContext` and `useContext` used raw at the call site. They are wrapped in two things: a **provider component** that owns the state and hands down a memoized value, and a **consumer hook** that reads the context and refuses to return anything useless.\n\n> 💡 **Mental Model:** Think of it like a building's reception desk rather than a loose stack of visitor badges. The provider is the desk — one place that issues the badge and knows what is on it. The consumer hook is the guard at the door: if you turn up without a badge it stops you at the threshold with a clear reason, instead of letting you wander in and discover something is wrong three floors up.\n\n### Why do we need it?\nTwo specific failures. First, `<AuthContext value={{ user, setUser }}>` builds a brand new object on every render of the provider, so every consumer re-renders even when `user` never changed — the identity problem, wearing a Context hat. Second, a component rendered outside the provider gets the `createContext` default, which is usually `null` or `undefined`. It then fails on a property access somewhere far away, and the stack trace points at the wrong component entirely.\n\nBoth are avoidable, and the fix is the same shape every time.\n\n### How?\nKeep three things together in one file: the context object (not exported — nothing outside should touch it), a provider component that owns the state and returns a `useMemo`'d value, and a hook that calls `useContext` and throws if the value is missing. Export only the last two. Consumers then call `useTheme()` and cannot get it wrong: either they are inside the provider and receive a real value, or they get an error naming the provider they forgot.\n\n### Common Pitfalls & Gotchas\n1. **Exporting the context object.** Once it escapes, callers can read it raw and bypass the hook's guarantee — including the null check. Export the hook, keep the context private.\n2. **Memoizing the value but not the functions in it.** `useMemo(() => ({ theme, setTheme }), [theme])` is stable because `setTheme` is already stable. Put a freshly-defined handler in there and you are back where you started; wrap it in `useCallback` first.\n3. **Giving `createContext` a plausible default.** `createContext('light')` looks friendly and removes your ability to detect a missing provider — the component just silently renders the default forever. Default to `null` so the absence is loud.\n\n### Example\n```jsx\nimport { createContext, useContext, useMemo, useState } from 'react';\n\nconst ThemeContext = createContext(null);\n\nfunction ThemeProvider({ children }) {\n  const [theme, setTheme] = useState('light');\n  const value = useMemo(() => ({ theme, setTheme }), [theme]);\n  return <ThemeContext value={value}>{children}</ThemeContext>;\n}\n\nfunction useTheme() {\n  const context = useContext(ThemeContext);\n  if (context === null) {\n    throw new Error('useTheme must be used inside a ThemeProvider');\n  }\n  return context;\n}\n\nfunction Toolbar() {\n  const { theme, setTheme } = useTheme();\n  return (\n    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>\n      Theme is {theme}\n    </button>\n  );\n}\n\nexport default function App() {\n  return (\n    <ThemeProvider>\n      <Toolbar />\n    </ThemeProvider>\n  );\n}\n```\n\n### Challenge\n**Challenge:** This file wires Context up by hand: `App` builds the value inline, and `Profile` calls `useContext` directly with no guard. Refactor it into the standard shape — a `UserProvider` component that owns the state and memoizes its value, and a `useUser` hook that throws a helpful error when the provider is missing.\n\n### Hints\n* `function UserProvider({ children })` owns the `useState` and returns `<UserContext value={value}>{children}</UserContext>`.\n* Wrap the value: `const value = useMemo(() => ({ user, setUser }), [user]);` — `setUser` is already stable, so `[user]` is the whole dependency list.\n* In `useUser`, read the context, and `throw new Error(...)` when it is `null` before returning it.\n\n**Solution:**\nMove the state and the memoized value into a `UserProvider` component, and put the `useContext` call plus its null check inside a `useUser` hook. Consumers then call `useUser()` and can no longer receive a half-initialised value — they either get the real thing or an error that names the provider they forgot to render.\n",
      "starterCode": "import { createContext, useContext, useState } from 'react';\n\nconst UserContext = createContext(null);\n\n// 👉 1. Build a UserProvider component that owns this state and memoizes the value.\n// 👉 2. Build a useUser hook that throws when the context is null.\n\nfunction Profile() {\n  const context = useContext(UserContext);\n  return <p>Signed in as {context.user}</p>;\n}\n\nexport default function App() {\n  const [user, setUser] = useState('Ada');\n\n  return (\n    <UserContext value={{ user, setUser }}>\n      <div style={{ padding: 20 }}>\n        <Profile />\n        <button onClick={() => setUser(u => (u === 'Ada' ? 'Linus' : 'Ada'))}>\n          Switch user\n        </button>\n      </div>\n    </UserContext>\n  );\n}",
      "solutionCode": "import { createContext, useContext, useMemo, useState } from 'react';\n\nconst UserContext = createContext(null);\n\nfunction UserProvider({ children }) {\n  const [user, setUser] = useState('Ada');\n  const value = useMemo(() => ({ user, setUser }), [user]);\n  return <UserContext value={value}>{children}</UserContext>;\n}\n\nfunction useUser() {\n  const context = useContext(UserContext);\n  if (context === null) {\n    throw new Error('useUser must be used inside a UserProvider');\n  }\n  return context;\n}\n\nfunction Profile() {\n  const { user } = useUser();\n  return <p>Signed in as {user}</p>;\n}\n\nfunction SwitchButton() {\n  const { setUser } = useUser();\n  return (\n    <button onClick={() => setUser(u => (u === 'Ada' ? 'Linus' : 'Ada'))}>\n      Switch user\n    </button>\n  );\n}\n\nexport default function App() {\n  return (\n    <UserProvider>\n      <div style={{ padding: 20 }}>\n        <Profile />\n        <SwitchButton />\n      </div>\n    </UserProvider>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { createContext, useContext, useMemo, useState } from 'react';\n\nconst ThemeContext = createContext(null);\n\nfunction ThemeProvider({ children }) {\n  const [theme, setTheme] = useState('light');\n  const value = useMemo(() => ({ theme, setTheme }), [theme]);\n  return <ThemeContext value={value}>{children}</ThemeContext>;\n}\n\nfunction useTheme() {\n  const context = useContext(ThemeContext);\n  if (context === null) {\n    throw new Error('useTheme must be used inside a ThemeProvider');\n  }\n  return context;\n}\n\nfunction Toolbar() {\n  const { theme, setTheme } = useTheme();\n  return (\n    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>\n      Theme is {theme}\n    </button>\n  );\n}\n\nexport default function App() {\n  return (\n    <ThemeProvider>\n      <Toolbar />\n    </ThemeProvider>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3
            ],
            "description": "`createContext(null)` — and `null` is a deliberate choice, not a placeholder.\n\nA friendlier-looking default like `createContext('light')` would mean a component rendered outside the provider silently receives `'light'` forever. Nothing errors, nothing looks wrong, and the theme just never changes for that subtree. `null` makes the absence detectable, which the hook below turns into a real message.\n\nNote also that `ThemeContext` is never exported. The two things below it are the entire public surface.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              5,
              6,
              8
            ],
            "description": "The provider is an ordinary component. It owns the state, renders the context around `{children}`, and knows nothing about what those children are — the same composition idea as any other wrapper component.\n\nThis is where state ownership finally settles: not in the component that displays the theme, not in one that changes it, but in one whose entire job is to hold it for both.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7
            ],
            "description": "`useMemo` is the line that stops this being slow. Without it, `{ theme, setTheme }` is a brand-new object on every render of `ThemeProvider`, and a new context value re-renders **every** consumer — even ones whose data did not change.\n\nThe dependency list is just `[theme]` because `setTheme` is already stable; React guarantees the identity of a `useState` setter across renders. Had the value carried a handler defined in the provider body, that handler would need `useCallback` first or the memo would achieve nothing.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              11,
              12,
              13,
              14,
              15,
              16,
              17
            ],
            "description": "The consumer hook is where the null default earns its keep. `useTheme` either returns a real value or throws with the name of the provider you forgot — at the component that actually made the mistake, not three levels deeper where `context.theme` finally blew up on `undefined`.\n\nThis is the whole reason to wrap `useContext` rather than call it directly. It converts a confusing runtime failure into a sentence that tells you what to do.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              20,
              28,
              30,
              32
            ],
            "description": "What the consumer sees is one hook call, with no idea a context is involved at all. And the app root reads as plain composition: wrap the tree, render the children.\n\nThe exact text output on the screen will be:\n`[Button: Theme is light]`\n\nClick it and the label flips to `Theme is dark`.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "function UserProvider({ children }) {\n  const [user, setUser] = useState('Ada');\n  const value = useMemo(() => ({ user, setUser }), [user]);\n  return <UserContext value={value}>{children}</UserContext>;\n}\n\nfunction useUser() {\n  const context = useContext(UserContext);\n  if (context === null) {\n    throw new Error('useUser must be used inside a UserProvider');\n  }\n  return context;\n}",
        "steps": [
          {
            "highlightLines": [
              1,
              2,
              4
            ],
            "description": "The state moves out of `App` and into a component whose only job is to own it. `App` goes back to being composition — it renders a provider around some children and holds nothing itself.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              3
            ],
            "description": "The inline `{{ user, setUser }}` from the starter was a fresh object on every render, so every consumer re-rendered on every render of `App` regardless of whether `user` changed. `useMemo` with `[user]` fixes that: a new object only when there is genuinely new data.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7,
              9,
              10,
              11,
              12
            ],
            "description": "`useUser` replaces the raw `useContext` call in `Profile`. The starter's version would have read `context.user` off `null` and crashed with `Cannot read properties of null`, pointing at `Profile` rather than at the missing provider.\n\nNow the failure names the cause. That difference is worth one `if` statement.",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why `createContext(null)` beats a friendly-looking default",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ Looks helpful, removes your ability to detect a missing provider\nconst ThemeContext = createContext('light');\n\n// A component rendered outside the provider gets 'light' forever.\n// Nothing throws. The theme just never changes, in one subtree.\n\n// ✅ Absence is detectable, so the hook can say something useful\nconst ThemeContext = createContext(null);",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2,
                  4,
                  5
                ],
                "description": "A default value that looks like real data makes \"forgot the provider\" indistinguishable from \"provider says light\". The bug does not announce itself — it shows up as one part of the UI that mysteriously ignores the theme toggle, usually days later."
              },
              {
                "highlightLines": [
                  7,
                  8
                ],
                "description": "`null` is a value nothing legitimately provides, so the consumer hook can treat it as proof the provider is missing. A default is only worth having when a component genuinely makes sense standalone — and for app-wide state like theme or auth, it almost never does."
              }
            ]
          }
        },
        {
          "title": "Memoizing the value is not optional when the value is an object",
          "type": "misconception",
          "walkthrough": {
            "code": "function AuthProvider({ children }) {\n  const [user, setUser] = useState(null);\n\n  // ❌ New object every render -> every consumer re-renders every render\n  return <AuthContext value={{ user, setUser }}>{children}</AuthContext>;\n}\n\nfunction AuthProvider({ children }) {\n  const [user, setUser] = useState(null);\n\n  // ✅ New object only when `user` actually changes\n  const value = useMemo(() => ({ user, setUser }), [user]);\n  return <AuthContext value={value}>{children}</AuthContext>;\n}",
            "steps": [
              {
                "highlightLines": [
                  4,
                  5
                ],
                "description": "Context compares values by reference, exactly like a dependency array does. An object literal in the JSX is a different object every render, so React concludes the value changed and re-renders every consumer — however many there are, however deep, whether or not `user` moved."
              },
              {
                "highlightLines": [
                  11,
                  12,
                  13
                ],
                "description": "The memo pins the reference to the data. Note what makes `[user]` sufficient: `setUser` comes from `useState` and React guarantees its identity across renders, so it never needs listing. A handler you wrote yourself in the provider body would, and would need `useCallback` to be worth memoizing at all."
              }
            ]
          }
        },
        {
          "title": "Keep the context object private",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// theme-context.js\nconst ThemeContext = createContext(null);   // not exported\n\nexport function ThemeProvider({ children }) { /* ... */ }\nexport function useTheme() { /* ...throws if missing... */ }\n\n// Everywhere else in the app:\nimport { useTheme } from './theme-context';",
            "steps": [
              {
                "highlightLines": [
                  2,
                  4,
                  5
                ],
                "description": "Two exports, and the context itself is not one of them. Everything the rest of the app can do is now something you designed: render the provider, or call the hook."
              },
              {
                "highlightLines": [
                  8
                ],
                "description": "Export the context too and any file can call `useContext(ThemeContext)` directly, skipping the null check the hook exists to enforce — at which point the guarantee is gone and you will not find out until something crashes.\n\nThis is the same instinct as leaving `formatPrice` unexported back in the Imports lesson: export the surface you intend to support, and keep the rest free to change."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "context-with-reducer",
      "title": "Context with a Reducer",
      "content": "\n# App State with Context and a Reducer\n\n### What is it?\n**Building on `useReducer` and the provider pattern:** Pairing a reducer with Context gives you an app-wide state container with no library at all — the reducer owns every transition, and Context delivers the current state and the `dispatch` function to whoever needs them.\n\n> 💡 **Mental Model:** Think of it as a noticeboard and a suggestion box mounted on opposite walls. Anyone can read the noticeboard (the state), anyone can post to the suggestion box (dispatch), and one clerk — the reducer — is the only thing that ever rewrites the board. People who only ever post never need to look up at the board at all.\n\n### Why do we need it?\nLifting state up stops working when the components that need it are spread across unrelated branches. Context alone fixes the delivery problem but not the update problem: every component that can change the state ends up holding its own setter logic, and the rules for how state may change are scattered across the tree.\n\nA reducer collects those rules into one pure function you can read top to bottom — and test without rendering anything. Context then delivers the result. It is Redux's core idea with none of its packaging, and for a great many apps it is enough.\n\n### How?\nUse **two** contexts, not one: one carrying the state, one carrying `dispatch`. This is not a micro-optimisation. `dispatch` never changes identity, so a component that only dispatches subscribes to something permanently stable and never re-renders when the state changes. Put both in one object and you have just re-coupled them.\n\n### Common Pitfalls & Gotchas\n1. **Putting state and dispatch in one context value.** Every button that only fires actions now re-renders on every state change, for data it does not read.\n2. **Reaching for this before lifting state up.** Two sibling components sharing one value do not need an app-wide store; they need a shared parent. Reach for this when the consumers are genuinely spread out and the transitions are genuinely non-trivial.\n3. **Letting the reducer do I/O.** It must stay pure — same state and action in, same state out. Fetching, logging and timers belong in the event handler that dispatches, or in an Effect.\n\n### Example\n```jsx\nimport { createContext, useContext, useReducer } from 'react';\n\nconst TasksContext = createContext(null);\nconst TasksDispatchContext = createContext(null);\n\nfunction tasksReducer(tasks, action) {\n  switch (action.type) {\n    case 'added':\n      return [...tasks, { id: action.id, text: action.text, done: false }];\n    case 'toggled':\n      return tasks.map(t => (t.id === action.id ? { ...t, done: !t.done } : t));\n    default:\n      return tasks;\n  }\n}\n\nfunction TasksProvider({ children }) {\n  const [tasks, dispatch] = useReducer(tasksReducer, [\n    { id: 1, text: 'Read the lesson', done: false }\n  ]);\n\n  return (\n    <TasksContext value={tasks}>\n      <TasksDispatchContext value={dispatch}>\n        {children}\n      </TasksDispatchContext>\n    </TasksContext>\n  );\n}\n\nfunction TaskList() {\n  const tasks = useContext(TasksContext);\n  const dispatch = useContext(TasksDispatchContext);\n\n  return (\n    <ul>\n      {tasks.map(task => (\n        <li key={task.id}>\n          <button onClick={() => dispatch({ type: 'toggled', id: task.id })}>\n            {task.done ? 'done' : 'todo'}: {task.text}\n          </button>\n        </li>\n      ))}\n    </ul>\n  );\n}\n\nfunction AddTask() {\n  const dispatch = useContext(TasksDispatchContext);\n  return (\n    <button onClick={() => dispatch({ type: 'added', id: Date.now(), text: 'New task' })}>\n      Add task\n    </button>\n  );\n}\n\nexport default function App() {\n  return (\n    <TasksProvider>\n      <div style={{ padding: 20 }}>\n        <AddTask />\n        <TaskList />\n      </div>\n    </TasksProvider>\n  );\n}\n```\n\n### Challenge\n**Challenge:** This counter keeps its state and its `dispatch` in a single context, so `Controls` — which only ever dispatches — re-renders on every count change. Split it into two contexts: `CountContext` for the value and `CountDispatchContext` for `dispatch`, and update both consumers to read from the right one.\n\n### Hints\n* Create a second context object next to the first: `const CountDispatchContext = createContext(null);`\n* Nest the two providers in `CounterProvider` — the state one outside, the dispatch one inside, or the other way round; the order does not matter.\n* `Display` needs only the count. `Controls` needs only `dispatch`. Neither should read both.\n\n**Solution:**\nDeclare a second context for `dispatch` and nest both providers around `{children}`. `Display` reads `CountContext`, `Controls` reads `CountDispatchContext`. Because `dispatch` from `useReducer` is referentially stable, `Controls` now subscribes to a value that never changes and stops re-rendering when the count does.\n",
      "starterCode": "import { createContext, useContext, useReducer } from 'react';\n\nconst CountContext = createContext(null);\n// 👉 1. Add a second context here, for dispatch only.\n\nfunction countReducer(count, action) {\n  if (action.type === 'incremented') return count + 1;\n  if (action.type === 'reset') return 0;\n  return count;\n}\n\nfunction CounterProvider({ children }) {\n  const [count, dispatch] = useReducer(countReducer, 0);\n  // 👉 2. Provide count and dispatch through two separate contexts.\n  return (\n    <CountContext value={{ count, dispatch }}>\n      {children}\n    </CountContext>\n  );\n}\n\nfunction Display() {\n  // 👉 3. Read only the count here.\n  const { count } = useContext(CountContext);\n  return <h2>Count: {count}</h2>;\n}\n\nfunction Controls() {\n  // 👉 4. Read only dispatch here.\n  const { dispatch } = useContext(CountContext);\n  return (\n    <div style={{ display: 'flex', gap: 8 }}>\n      <button onClick={() => dispatch({ type: 'incremented' })}>Increment</button>\n      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>\n    </div>\n  );\n}\n\nexport default function App() {\n  return (\n    <CounterProvider>\n      <div style={{ padding: 20 }}>\n        <Display />\n        <Controls />\n      </div>\n    </CounterProvider>\n  );\n}",
      "solutionCode": "import { createContext, useContext, useReducer } from 'react';\n\nconst CountContext = createContext(null);\nconst CountDispatchContext = createContext(null);\n\nfunction countReducer(count, action) {\n  if (action.type === 'incremented') return count + 1;\n  if (action.type === 'reset') return 0;\n  return count;\n}\n\nfunction CounterProvider({ children }) {\n  const [count, dispatch] = useReducer(countReducer, 0);\n  return (\n    <CountContext value={count}>\n      <CountDispatchContext value={dispatch}>\n        {children}\n      </CountDispatchContext>\n    </CountContext>\n  );\n}\n\nfunction Display() {\n  const count = useContext(CountContext);\n  return <h2>Count: {count}</h2>;\n}\n\nfunction Controls() {\n  const dispatch = useContext(CountDispatchContext);\n  return (\n    <div style={{ display: 'flex', gap: 8 }}>\n      <button onClick={() => dispatch({ type: 'incremented' })}>Increment</button>\n      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>\n    </div>\n  );\n}\n\nexport default function App() {\n  return (\n    <CounterProvider>\n      <div style={{ padding: 20 }}>\n        <Display />\n        <Controls />\n      </div>\n    </CounterProvider>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { createContext, useContext, useReducer } from 'react';\n\nconst TasksContext = createContext(null);\nconst TasksDispatchContext = createContext(null);\n\nfunction tasksReducer(tasks, action) {\n  switch (action.type) {\n    case 'added':\n      return [...tasks, { id: action.id, text: action.text, done: false }];\n    case 'toggled':\n      return tasks.map(t => (t.id === action.id ? { ...t, done: !t.done } : t));\n    default:\n      return tasks;\n  }\n}\n\nfunction TasksProvider({ children }) {\n  const [tasks, dispatch] = useReducer(tasksReducer, [\n    { id: 1, text: 'Read the lesson', done: false }\n  ]);\n\n  return (\n    <TasksContext value={tasks}>\n      <TasksDispatchContext value={dispatch}>\n        {children}\n      </TasksDispatchContext>\n    </TasksContext>\n  );\n}\n\nfunction TaskList() {\n  const tasks = useContext(TasksContext);\n  const dispatch = useContext(TasksDispatchContext);\n\n  return (\n    <ul>\n      {tasks.map(task => (\n        <li key={task.id}>\n          <button onClick={() => dispatch({ type: 'toggled', id: task.id })}>\n            {task.done ? 'done' : 'todo'}: {task.text}\n          </button>\n        </li>\n      ))}\n    </ul>\n  );\n}\n\nfunction AddTask() {\n  const dispatch = useContext(TasksDispatchContext);\n  return (\n    <button onClick={() => dispatch({ type: 'added', id: Date.now(), text: 'New task' })}>\n      Add task\n    </button>\n  );\n}\n\nexport default function App() {\n  return (\n    <TasksProvider>\n      <div style={{ padding: 20 }}>\n        <AddTask />\n        <TaskList />\n      </div>\n    </TasksProvider>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15
            ],
            "description": "The reducer is the whole specification of how this state may change, in one pure function, outside any component.\n\nRead it and you know every legal transition. No component can invent a new one — the most it can do is dispatch an action the reducer does not recognise, which the `default` case turns into \"nothing happens\" rather than corruption.\n\nAnd because it takes state and returns state, you can unit-test every transition without rendering a single component.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              3,
              4,
              23,
              24,
              27
            ],
            "description": "Two contexts, nested. This is the part worth being deliberate about.\n\n`tasks` changes constantly. `dispatch` never changes — `useReducer` guarantees its identity for the life of the component. Keeping them in separate contexts means each consumer subscribes to exactly the volatility it needs.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              47,
              48
            ],
            "description": "And here is the payoff. `AddTask` reads only `TasksDispatchContext`, whose value is permanently stable, so adding or toggling a task does **not** re-render this button.\n\nWith a single `{ tasks, dispatch }` context it would re-render on every keystroke of every task, for data it never reads. One extra `createContext` line buys that.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              31,
              32,
              39
            ],
            "description": "`TaskList` genuinely needs both, so it reads both — two hook calls rather than one destructure. That is the honest cost of the split, and it is small.\n\nNotice that neither consumer knows a reducer exists. They read a value and they send an action; how the transition happens is the reducer's business.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              56,
              58,
              59,
              60,
              62
            ],
            "description": "The root is composition again. State ownership lives in `TasksProvider`, and `App` just says what is inside it.\n\nThe exact text output on the screen will be:\n`[Button: Add task]`\n`[Button: todo: Read the lesson]`\n\nClick the task to toggle it; click **Add task** to append another.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "const CountContext = createContext(null);\nconst CountDispatchContext = createContext(null);\n\nfunction CounterProvider({ children }) {\n  const [count, dispatch] = useReducer(countReducer, 0);\n  return (\n    <CountContext value={count}>\n      <CountDispatchContext value={dispatch}>\n        {children}\n      </CountDispatchContext>\n    </CountContext>\n  );\n}\n\nfunction Display() {\n  const count = useContext(CountContext);\n  return <h2>Count: {count}</h2>;\n}\n\nfunction Controls() {\n  const dispatch = useContext(CountDispatchContext);\n  // ...buttons\n}",
        "steps": [
          {
            "highlightLines": [
              1,
              2
            ],
            "description": "A second context object, declared beside the first. Nothing clever — the whole technique is just refusing to put two things with different lifetimes in one box.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7,
              8,
              10,
              11
            ],
            "description": "Both providers wrap `{children}`. The nesting order is irrelevant; what matters is that each value travels on its own channel.\n\nAlso note the values are now the raw `count` and the raw `dispatch`, not an object wrapping them. No object means no identity to memoize — the whole `useMemo` question disappears.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              16,
              21
            ],
            "description": "Each consumer reads exactly one context. `Display` re-renders when the count changes, which is correct — it shows the count. `Controls` subscribes to `dispatch`, which never changes, so it renders once and then stays put no matter how high the count climbs.",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why `dispatch` is safe to pass anywhere",
          "type": "did-you-know",
          "walkthrough": {
            "code": "const [state, dispatch] = useReducer(reducer, initialState);\n\n// Stable for the life of the component — no useCallback needed\n<DeepChild onAction={dispatch} />\n\n// Compare a handler you wrote yourself:\nconst handleAction = (a) => dispatch(a);   // new function every render\n<DeepChild onAction={handleAction} />      // defeats memo on the child",
            "steps": [
              {
                "highlightLines": [
                  1,
                  3,
                  4
                ],
                "description": "React guarantees the identity of `dispatch` across renders, the same way it guarantees a `useState` setter. That is what makes the dispatch-context trick work at all: a context whose value is permanently stable never notifies anyone."
              },
              {
                "highlightLines": [
                  6,
                  7,
                  8
                ],
                "description": "Wrapping it in your own arrow function throws that away — a new function reference every render, which changes the context value, which re-renders every consumer, which is the thing you were avoiding. Pass `dispatch` itself, or wrap it in `useCallback` if you genuinely need to transform the action."
              }
            ]
          }
        },
        {
          "title": "When this is enough, and when it is not",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Context + reducer is a good fit when:\n//   - the state is genuinely app-wide (auth, theme, a cart)\n//   - transitions are rule-based and worth naming\n//   - updates are occasional, not per-keystroke\n\n// Reach for a store library when:\n//   - updates are frequent and consumers are many\n//   - you want selector-level subscriptions\n//   - state must be read outside React entirely",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2,
                  3,
                  4
                ],
                "description": "For most applications this is the ceiling you never hit. It is built in, it has no dependency, and the reducer gives you the one thing ad-hoc setters never do: a single readable account of how the state is allowed to move."
              },
              {
                "highlightLines": [
                  6,
                  7,
                  8,
                  9
                ],
                "description": "The limit is granularity. Context notifies every consumer of a changed value; it has no concept of \"only tell me if `state.cart.total` changed\". Splitting contexts buys you coarse control, but past a handful of splits you are hand-building what a store library gives you as selectors — which is the next module's subject."
              }
            ]
          }
        }
      ]
    }
  ]
};
