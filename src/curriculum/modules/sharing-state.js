export default {
  "id": "sharing-state",
  "title": "Sharing State",
  "description": "useContext and state architecture",
  "icon": "Share2",
  "lessons": [
    {
      "id": "use-context",
      "title": "Context API",
      "content": "\n# Passing Data Deeply with Context\n\n### What is it?\n**Building on props and component trees:** Instead of manually threading props down through many intermediate layers (\"prop drilling\"), **Context** lets a parent component broadcast information directly to any component in the subtree below it—no matter how deep.\n\n> 💡 **Mental Model:** Think of Context like a building's PA system: instead of running a wire (prop) down through every single floor and hallway to reach one office, you make one announcement at the top and any floor that's listening can just tune in.\n\n### Why do we need it?\nUsually, you pass data down via props. But if you have to pass data through 5 layers of components (prop drilling), it gets messy and couples intermediate components to data they don't even need.\n\n### Before Context: lift state up\nContext solves *deep* prop drilling — many layers, most of which don't care about the value. It's the wrong tool for two nearby siblings that just need to share one value:\n```jsx\n// Two siblings, same parent — plain props are enough, no Context needed\nfunction App() {\n  const [query, setQuery] = useState('');\n  return (\n    <>\n      <SearchBox query={query} onQueryChange={setQuery} />\n      <Results query={query} />\n    </>\n  );\n}\n```\nThe state lives in the nearest shared parent (`App`) and flows down as ordinary props to both children — this is \"lifting state up,\" and it's simpler to trace than Context: no Provider, no `useContext` call, no whole-subtree re-render to reason about. Reach for Context once that shared parent is many layers away and threading the prop through every layer in between becomes the actual pain point.\n\n### How?\nYou create a context object using `createContext()`. You wrap your component tree in `<YourContext.Provider value={...}>`. Any component inside the provider can read the value by calling `useContext(YourContext)`.\n\n### Syntax/Example\n```jsx\nimport { createContext, useContext } from 'react';\n\n// 1. Create a Context object with an optional default value\nconst ThemeContext = createContext('light');\n\n// 2. Wrap your component tree with the Context element (React 19 syntax)\n<ThemeContext value=\"dark\">\n  <ChildComponent />\n</ThemeContext>\n\n// 3. Inside any child component:\nconst theme = useContext(ThemeContext);\n```\n\n### Common Pitfalls & Gotchas\n1. **Passing inline objects without memoization**: Writing `<AuthContext value={{ user, setUser }}>` generates a fresh object reference on every parent render, forcing every consuming child to re-render even if `user` didn't change. Always memoize with `useMemo` or separate state and dispatch into distinct contexts.\n2. **Reading Context outside a Provider**: Calling `useContext(MyContext)` without an ancestor Provider returns the default value passed to `createContext(defaultValue)` (or `undefined` if none was given). Create a custom consumer hook (`useTheme()`) that throws a helpful error if the context is `undefined`.\n3. **Using Context for high-frequency updates**: Context is designed for low-frequency changes (themes, auth state, locale). For high-frequency state (e.g. cursor positions, text inputs, live animations), use Zustand or component-local state to avoid whole-tree re-render waterfalls.\n\n### Example\n```jsx\nimport { createContext, useContext } from 'react';\n\nconst UserContext = createContext();\n\nfunction Dashboard() {\n  // Any component inside the Provider can read the value.\n  const user = useContext(UserContext);\n  return <h1>Welcome, {user}!</h1>;\n}\n\nexport default function App() {\n  // The value is provided at the top of the tree.\n  return (\n    <UserContext.Provider value=\"Alice\">\n      <Dashboard />\n    </UserContext.Provider>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** We have a `ThemeContext`, but the `Navbar` component is currently hardcoded to use a 'light' theme.\n\n**Solution:** Read the theme value by calling `useContext(ThemeContext)` inside `Navbar`. Toggle the theme button to see the Navbar update automatically!\n\n### Hints\n* In React 19, you can just render `<ThemeContext value={...}>` instead of `<ThemeContext.Provider value={...}>`.\n* Any time the provided `value` changes, ALL components consuming that context re-render. Use Context sparingly for truly global data.\n",
      "starterCode": "import { useState, createContext, useContext } from 'react';\n\nconst ThemeContext = createContext('light');\n\nfunction Navbar() {\n  // ❌ Hardcoded theme!\n  const theme = 'light';\n\n  return (\n    <div style={{ \n      padding: 20, \n      background: theme === 'dark' ? '#333' : '#eee',\n      color: theme === 'dark' ? '#fff' : '#000'\n    }}>\n      My App Navbar\n    </div>\n  );\n}\n\nexport default function App() {\n  const [theme, setTheme] = useState('light');\n\n  return (\n    <ThemeContext value={theme}>\n      <Navbar />\n      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>\n        Toggle Theme\n      </button>\n    </ThemeContext>\n  );\n}\n",
      "solutionCode": "import { useState, createContext, useContext } from 'react';\n\nconst ThemeContext = createContext('light');\n\nfunction Navbar() {\n  const theme = useContext(ThemeContext);\n\n  return (\n    <div style={{ \n      padding: 20, \n      background: theme === 'dark' ? '#333' : '#eee',\n      color: theme === 'dark' ? '#fff' : '#000'\n    }}>\n      My App Navbar\n    </div>\n  );\n}\n\nfunction App() {\n  const [theme, setTheme] = useState('light');\n\n  return (\n    <ThemeContext value={theme}>\n      <Navbar />\n      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>\n        Toggle Theme\n      </button>\n    </ThemeContext>\n  );\n}\n",
      "exampleWalkthrough": {
        "code": "import { createContext, useContext } from 'react';\n\nconst UserContext = createContext();\n\nfunction Dashboard() {\n  // Any component inside the Provider can read the value.\n  const user = useContext(UserContext);\n  return <h1>Welcome, {user}!</h1>;\n}\n\nexport default function App() {\n  // The value is provided at the top of the tree.\n  return (\n    <UserContext.Provider value=\"Alice\">\n      <Dashboard />\n    </UserContext.Provider>\n  );\n}",
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
            "description": "The Provider puts a value on that channel for everything rendered inside it. Depth does not matter: a component twenty levels down reads it as directly as a child does, and no component in between has to know the value exists.\n\nWhat matters is being *inside* the Provider. A component rendered outside it reads the context default instead — which is `undefined` here, and is exactly the bug this example used to ship.",
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
                "description": "Context is a dependency injection system, not a state manager. Every time the context value changes, EVERY single component consuming that context is forced to re-render."
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
                "description": "This forces EVERY SINGLE component consuming that context to re-render, even if `user` didn't actually change! Always wrap the value in `useMemo`."
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
          "type": "pro-tip",
          "walkthrough": {
            "code": "const StateContext = createContext(null);\nconst DispatchContext = createContext(null);\n\nexport function ThemeProvider({ children }) {\n  const [theme, setTheme] = useState('light');\n  return (\n    <StateContext.Provider value={theme}>\n      <DispatchContext.Provider value={setTheme}>\n        {children}\n      </DispatchContext.Provider>\n    </StateContext.Provider>\n  );\n}",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2
                ],
                "description": "When state changes in a single Context, EVERY component calling `useContext()` re-renders, even buttons that only need the `setTheme` setter!"
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
    }
  ]
};
