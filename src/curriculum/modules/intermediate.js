export default {
  "id": "intermediate",
  "title": "Intermediate Patterns",
  "lessons": [
    {
      "id": "composition",
      "title": "Component Composition",
      "content": "\n# Component Composition (children prop)\n\n### What is it?\n**Building on props:** **Component Composition** is a pattern where you use the special `children` prop to pass JSX directly into a component, rather than passing data through many rigid configuration props.\n\n> \ud83d\udca1 **Mental Model:** Think of composition like a picture frame shop: the frame (parent component) doesn't care what photo you put inside it — it just provides the border and lets you slot in whatever content fits, instead of the shop needing a separate frame model for every possible photo.\n\n### Why do we need it?\nInstead of passing dozens of configuration props to a component (like `title`, `content`, `footerText`), passing children makes your component highly flexible. It's how you build reusable container components like Cards, Modals, and Layouts that don't need to know what content they are wrapping.\n\n### How?\nWhen you nest JSX inside a component's tags, React automatically passes that nested JSX as a prop named `children`. Inside the component, you can render `{children}` wherever you want the nested content to appear.\n\n### Syntax/Example\n```jsx\n// This returns a generic wrapper component\nfunction Card({ children }) {\n  // This causes whatever is passed between <Card> and </Card>\n  // to be rendered inside this div\n  return <div className=\"card-ui\">{children}</div>;\n}\n\n// This causes the Title and Button to be passed\n// as 'children' to Card\n<Card>\n  <h2>Title</h2>\n  <button>Action</button>\n</Card>\n```\n\n### Example\n```jsx\nfunction Card({ children }) {\n  return (\n    <div style={{ border: '1px solid black', padding: 20, borderRadius: 8 }}>\n      {children}\n    </div>\n  );\n}\n\nfunction App() {\n  return (\n    <Card>\n      <h2>Title</h2>\n      <p>Body content inside the card.</p>\n    </Card>\n  );\n}\n\nexport default App;\n```\n\n### Challenge and Solution\n**Challenge:** The `Dialog` component below is very rigid. It only accepts a `title` and `message` string. Refactor it to accept `children` so we can pass HTML and other React components inside it!\n\n**Solution:** Change `Dialog({ title, message })` to `Dialog({ title, children })`. Inside `Dialog`, replace `<p>{message}</p>` with `{children}`. In `App`, change `<Dialog message=\"...\" />` to `<Dialog><p>...</p><button>...</button></Dialog>`.\n\n### Hints\n* Real component libraries often expose multiple \"slots\" via separate props (e.g., `<Dialog title=\"Warning\" footer={<Button>OK</Button>}>`).\n* React provides `React.Children` utilities to count, map, and manipulate children, though it's rarely needed in modern code.\n",
      "starterCode": "export default function App() {\n  return (\n    <Dialog \n      title=\"Warning\" \n      message=\"Are you sure you want to delete this?\" \n    />\n  );\n}\n\nfunction Dialog({ title, message }) {\n  return (\n    <div style={{ border: '2px solid red', padding: '20px', borderRadius: '8px' }}>\n      <h2>{title}</h2>\n      <hr />\n      {/* 👉 Refactor this to render children instead of message */}\n      <p>{message}</p>\n    </div>\n  );\n}\n",
      "solutionCode": "export default function App() {\n  return (\n    <Dialog title=\"Warning\">\n      <p>Are you sure you want to delete this?</p>\n      <button>Delete Forever</button>\n    </Dialog>\n  );\n}\n\nfunction Dialog({ title, children }) {\n  return (\n    <div style={{ border: '2px solid red', padding: '20px', borderRadius: '8px' }}>\n      <h2>{title}</h2>\n      <hr />\n      {children}\n    </div>\n  );\n}\n",
      "exampleWalkthrough": {
        "code": "function Card({ children }) {\n  return (\n    <div style={{ border: '1px solid black', padding: 20, borderRadius: 8 }}>\n      {children}\n    </div>\n  );\n}\n\nfunction App() {\n  return (\n    <Card>\n      <h2>Title</h2>\n      <p>Body content inside the card.</p>\n    </Card>\n  );\n}\n\nexport default App;",
        "steps": [
          {
            "highlightLines": [
              11,
              14
            ],
            "description": "Nesting JSX between a component's opening and closing tags is the whole mechanism. React collects everything written in there and hands it to the component as a prop.\n\nNothing special is happening at the call site — this is the same syntax as HTML, and it reads the same way.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              1
            ],
            "description": "The component receives it in a prop with a reserved name: `children`. That is the only part of this that is a convention rather than plain props.\n\n`Card` never learns what it is wrapping. It cannot, and that is the point — it stays useful for content nobody has written yet.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              4
            ],
            "description": "Render `{children}` wherever the content belongs, and the layout is done.\n\nThis is the alternative to a `Card` with a `title` prop, a `body` prop, a `footer` prop and a `variant` prop — a component that has to be edited every time a new use appears. Composition pushes those decisions out to the caller instead.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              12,
              13
            ],
            "description": "The exact text output on the screen will be:\n`Title`\n`Body content inside the card.`\n\ninside a bordered box.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "export default function App() {\n  return (\n    <Dialog title=\"Warning\">\n      <p>Are you sure you want to delete this?</p>\n      <button>Delete Forever</button>\n    </Dialog>\n  );\n}\n\nfunction Dialog({ title, children }) {\n  return (\n    <div style={{ border: '2px solid red', padding: '20px', borderRadius: '8px' }}>\n      <h2>{title}</h2>\n      <hr />\n      {children}\n    </div>\n  );",
        "steps": [
          {
            "highlightLines": [
              10
            ],
            "description": "We update `Dialog` to accept `children` instead of `message`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              15
            ],
            "description": "We render `{children}` inside the Dialog body.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              3,
              6
            ],
            "description": "Now in `App`, we can pass arbitrary JSX into `Dialog`! It's much more flexible.\n\nThe exact text output on the screen will be:\n`Warning`\n`Are you sure you want to delete this?`\n`[Button: Delete Forever]`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Prop Drilling vs Composition",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Bad: Passing props down 5 levels\n<Layout user={user} />\n\n// Good: Passing children\n<Layout>\n  <UserCard user={user} />\n</Layout>",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "If you find yourself passing props through multiple layers of components that don't actually use them (prop drilling), Composition is your best friend."
              },
              {
                "highlightLines": [
                  5,
                  6,
                  7
                ],
                "description": "By using the `children` prop, you can define the child component at the top level where the data already exists, completely bypassing the middleman!"
              }
            ]
          }
        },
        {
          "title": "Does Composition break React Developer Tools?",
          "type": "misconception",
          "walkthrough": {
            "code": "<Card>\n  <Avatar />\n  <Title />\n</Card>",
            "steps": [
              {
                "highlightLines": [
                  1,
                  4
                ],
                "description": "Actually, it makes the DevTools significantly cleaner! Instead of seeing `<Card avatarProps={...} titleProps={...} />`..."
              },
              {
                "highlightLines": [
                  2,
                  3
                ],
                "description": "You see the exact visual hierarchy nested beautifully in the tree. It makes debugging layout issues drastically easier."
              }
            ]
          }
        },
        {
          "title": "Does Composition solve state management?",
          "type": "misconception",
          "walkthrough": {
            "code": "<Dashboard user={user}>\n  <Sidebar user={user} />\n</Dashboard>",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2
                ],
                "description": "Composition completely solves prop drilling (passing props through 10 layers). The top level component just passes the data directly into the children slots."
              },
              {
                "highlightLines": [
                  1,
                  2
                ],
                "description": "But it does NOT solve state synchronization across entirely different branches of the component tree. You still need Zustand or Context for global data!"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "render-props",
      "title": "Render Props (Historical Pattern)",
      "content": "\n# Render Props Pattern\n\n### What is it?\n**Building on composition:** A **render prop** is a pattern for sharing stateful logic between components where a component receives a function prop that returns JSX and calls it with internal state.\n\n> \u26a0\ufe0f **Recognize, don't default to:** Custom Hooks have superseded render props as the go-to way to share stateful logic in modern React \u2014 a hook lets you reuse the *logic* without forcing an extra wrapper component into the tree. This pattern is worth recognizing because it still shows up in real codebases and some libraries, not because you should reach for it in new code.\n\n> \ud83d\udca1 **Mental Model:** Think of a render prop like hiring a chauffeur who drives the route (the shared logic) but lets you decide what you look at out the window the whole way (what gets rendered) \u2014 the driving is reusable, the sightseeing is yours to customize.\n\n### Why do we need it?\nSometimes a component owns a complex piece of state (like mouse tracking, window size, or data fetching), but it shouldn't dictate how that state is visually rendered. Render props allow the parent to define the UI, while the child manages the logic.\n\n### How?\nYou pass a prop (often named `render` or `children`) which is a function. The child component calls this function, passing its internal state as an argument, and renders whatever the function returns.\n\n### Syntax/Example\n```jsx\n// This returns a component that accepts a function as a prop\nfunction MouseTracker({ render }) {\n  const [pos, setPos] = useState({ x: 0, y: 0 });\n  \n  // This causes the 'render' function to be called\n  // with the internal state\n  return <div onMouseMove={e => setPos({x: e.clientX, y: e.clientY})}>\n    {render(pos)}\n  </div>;\n}\n\n// This causes the MouseTracker to render the position dynamically\n<MouseTracker render={(pos) => <h1>Mouse is at {pos.x}, {pos.y}</h1>} />\n```\n\n### Example\n```jsx\nimport { useState } from 'react';\n\nfunction MouseTracker({ render }) {\n  const [pos, setPos] = useState({ x: 0, y: 0 });\n  return (\n    <div\n      onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}\n      style={{ height: '200px', border: '1px solid black' }}\n    >\n      {render(pos)}\n    </div>\n  );\n}\n\nfunction App() {\n  return <MouseTracker render={({x, y}) => <p>X: {x}, Y: {y}</p>} />;\n}\n\nexport default App;\n```\n\n### Challenge and Solution\n**Challenge:** Create a `MouseTracker` component that tracks the mouse (x, y) state and uses a render prop to let the parent decide *how* to render that state.\n\n**Solution:** Add `{ render }` to the `MouseTracker` props. Replace `Mouse is moving...` with `{render(position)}`. In `App`, render `<MouseTracker render={({ x, y }) => <h1>The mouse is at ({x}, {y})</h1>} />`.\n\n### Hints\n* While Custom Hooks have largely replaced Render Props for logic sharing, you will still see this pattern often in libraries (like React Router or Formik) and for UI rendering.\n",
      "starterCode": "import { useState } from 'react';\n\n// 👉 Make this component accept a \"render\" function as a prop\nfunction MouseTracker() {\n  const [position, setPosition] = useState({ x: 0, y: 0 });\n\n  return (\n    <div \n      style={{ height: '300px', border: '1px solid #666', padding: '16px' }}\n      onMouseMove={(e) => setPosition({ x: e.clientX, y: e.clientY })}\n    >\n      {/* Call the render prop here and pass the position object */}\n      Mouse is moving...\n    </div>\n  );\n}\n\nexport default function App() {\n  return (\n    <MouseTracker \n      // 👉 Pass a render prop that returns <h1>The mouse is at (x, y)</h1>\n    />\n  );\n}\n",
      "solutionCode": "import { useState } from 'react';\n\nfunction MouseTracker({ render }) {\n  const [position, setPosition] = useState({ x: 0, y: 0 });\n\n  return (\n    <div \n      style={{ height: '300px', border: '1px solid #666', padding: '16px' }}\n      onMouseMove={(e) => setPosition({ x: e.clientX, y: e.clientY })}\n    >\n      {render(position)}\n    </div>\n  );\n}\n\nfunction App() {\n  return (\n    <MouseTracker \n      render={({ x, y }) => (\n        <h1>The mouse is at ({x}, {y})</h1>\n      )}\n    />\n  );\n}\n",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\nfunction MouseTracker({ render }) {\n  const [pos, setPos] = useState({ x: 0, y: 0 });\n  return (\n    <div\n      onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}\n      style={{ height: '200px', border: '1px solid black' }}\n    >\n      {render(pos)}\n    </div>\n  );\n}\n\nfunction App() {\n  return <MouseTracker render={({x, y}) => <p>X: {x}, Y: {y}</p>} />;\n}\n\nexport default App;",
        "steps": [
          {
            "highlightLines": [
              3,
              4
            ],
            "description": "`MouseTracker` owns the stateful part — subscribing to movement and holding the coordinates — and accepts a `render` prop instead of deciding what to draw.\n\nSplitting behaviour from presentation is the goal. The rest of the pattern is the machinery that was needed to reach it before hooks existed.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7,
              10
            ],
            "description": "On each move, state updates and the component re-renders. Rather than returning fixed JSX, it *calls* `render(pos)` and returns whatever comes back.\n\nThat call is the inversion: the child supplies the data, the parent supplies the markup.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              16
            ],
            "description": "The caller decides the UI. The same `MouseTracker` could drive a readout, a follower dot, or a debug overlay, with no change inside it.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              15
            ],
            "description": "Recognise this pattern; reach for a custom hook instead. `const pos = useMousePosition()` gives the same reuse with no extra component in the tree, no nesting when two of them combine, and no function prop to memoize.\n\nIt is here because plenty of libraries still expose render props, and you need to be able to read them.\n\nMove the pointer over the bordered box; the exact text output on the screen will be:\n`X: <pointer x>, Y: <pointer y>`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useState } from 'react';\n\nfunction MouseTracker({ render }) {\n  const [position, setPosition] = useState({ x: 0, y: 0 });\n\n  return (\n    <div \n      style={{ height: '300px', border: '1px solid #666', padding: '16px' }}\n      onMouseMove={(e) => setPosition({ x: e.clientX, y: e.clientY })}\n    >\n      {render(position)}\n    </div>\n  );\n}\n\nfunction App() {\n  return (\n    <MouseTracker \n      render={({ x, y }) => (\n        <h1>The mouse is at ({x}, {y})</h1>\n      )}\n    />\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3,
              11
            ],
            "description": "We update `MouseTracker` to accept the `render` prop and call it with the `position` state.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              19,
              21
            ],
            "description": "In `App`, we pass a function to the `render` prop that returns the <h1> element. It destructures `x` and `y` from the argument.\n\nThe exact text output on the screen will be:\n`The mouse is at ([x], [y])`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Is Render Props dead because of Hooks?",
          "type": "misconception",
          "walkthrough": {
            "code": "<MouseTracker render={({ x, y }) => (\n  <p>Mouse is at {x}, {y}</p>\n)} />",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "Hooks replaced most Render Props use cases for logic sharing. However, Render Props are still extremely useful for UI sharing!"
              },
              {
                "highlightLines": [
                  2
                ],
                "description": "If you are building a highly reusable library component (like a list Virtualizer) that needs to control internal layout but let the user define how each row *looks*, Render Props are perfect."
              }
            ]
          }
        },
        {
          "title": "Is it bad to pass an inline function to a render prop?",
          "type": "misconception",
          "walkthrough": {
            "code": "<Mouse render={({ x, y }) => <p>{x}, {y}</p>} />",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "Usually, passing an inline function creates a new reference on every render, which can break memoization of child components."
              },
              {
                "highlightLines": [
                  1
                ],
                "description": "However, if the child component (like `<Mouse />`) isn't wrapped in `React.memo`, it doesn't matter at all! The performance impact is zero."
              }
            ]
          }
        },
        {
          "title": "Can I use multiple render props?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "<SplitScreen \n  left={({ width }) => <Sidebar w={width} />}\n  right={({ width }) => <Content w={width} />}\n/>",
            "steps": [
              {
                "highlightLines": [
                  2,
                  3
                ],
                "description": "Yes! There is nothing special about the `render` prop or the `children` prop. They are just variables."
              },
              {
                "highlightLines": [
                  2,
                  3
                ],
                "description": "You can pass as many function-based props as you want (like `renderHeader`, `renderFooter`, `renderItem`) to build incredibly flexible grid or layout components."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "error-boundaries",
      "title": "Error Boundaries",
      "dependencies": {
        "react-error-boundary": "^5.0.0"
      },
      "content": "\n# Error Boundaries\n\n### What is it?\n**Building on React's rendering pipeline:** **Error Boundaries** are special components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of crashing the entire app into a blank screen.\n\n> \ud83d\udca1 **Mental Model:** Think of an error boundary like a circuit breaker in a house: if one appliance (component) short-circuits, the breaker trips and isolates just that room, instead of the whole house losing power.\n\n### Why do we need it?\nIf a JavaScript error occurs during rendering inside a React component, React unmounts the entire component tree, resulting in a blank screen for the user. Error boundaries prevent this total crash, keeping the rest of the app functional while showing an error message in the broken section.\n\n### How?\nInternally, Error Boundaries rely on `getDerivedStateFromError` and `componentDidCatch`. In modern production React, we use the standard `<ErrorBoundary>` component from `react-error-boundary`.\n\n### Syntax/Example\n```jsx\n// This defines a class component that catches JavaScript errors\nclass ErrorBoundary extends React.Component {\n  state = { hasError: false };\n\n  // This causes the state to update when an error is thrown\n  static getDerivedStateFromError(error) {\n    return { hasError: true };\n  }\n\n  render() {\n    // This returns a fallback UI if an error occurred\n    if (this.state.hasError) return <h1>Something went wrong.</h1>;\n    // Otherwise, this returns the normal children\n    return this.props.children; \n  }\n}\n```\n\n### Example\n```jsx\nimport { ErrorBoundary } from 'react-error-boundary';\n\nfunction BuggyComponent() {\n  throw new Error(\"I crashed!\");\n  return <div>I will never render</div>;\n}\n\nfunction App() {\n  return (\n    <ErrorBoundary fallback={<p>Component crashed!</p>}>\n      <BuggyComponent />\n    </ErrorBoundary>\n  );\n}\n\nexport default App;\n```\n\n### Challenge and Solution\n**Challenge:** `<BuggyComponent>` throws an error when it renders, crashing the whole app. Import and wrap it in an `ErrorBoundary` so the rest of the app stays alive.\n\n**Solution:** Import `{ ErrorBoundary }` from `'react-error-boundary'`. Wrap `<BuggyComponent />` with `<ErrorBoundary fallback={<h2>Something went wrong!</h2>}>`.\n\n### Hints\n* The `<ErrorBoundary>` component also accepts an `onError` prop: `onError={(error, info) => logToSentry(error, info)}`. This lets you capture crashes in production monitoring tools like Sentry or Datadog.\n",
      "starterCode": "// 👉 1. Import { ErrorBoundary } from 'react-error-boundary'\n\nfunction BuggyComponent() {\n  throw new Error(\"I crashed!\");\n  return <div>I will never render</div>;\n}\n\nexport default function App() {\n  return (\n    <div style={{ padding: 20 }}>\n      <h1>My App</h1>\n      {/* 👉 2. Wrap BuggyComponent in ErrorBoundary with a fallback prop */}\n      <BuggyComponent />\n    </div>\n  );\n}\n",
      "solutionCode": "import { ErrorBoundary } from 'react-error-boundary';\n\nfunction BuggyComponent() {\n  throw new Error(\"I crashed!\");\n  return <div>I will never render</div>;\n}\n\nfunction App() {\n  return (\n    <div style={{ padding: 20 }}>\n      <h1>My App</h1>\n      <ErrorBoundary fallback={<h2>Something went wrong!</h2>}>\n        <BuggyComponent />\n      </ErrorBoundary>\n    </div>\n  );\n}\n",
      "exampleWalkthrough": {
        "code": "import { ErrorBoundary } from 'react-error-boundary';\n\nfunction BuggyComponent() {\n  throw new Error(\"I crashed!\");\n  return <div>I will never render</div>;\n}\n\nfunction App() {\n  return (\n    <ErrorBoundary fallback={<p>Component crashed!</p>}>\n      <BuggyComponent />\n    </ErrorBoundary>\n  );\n}\n\nexport default App;",
        "steps": [
          {
            "highlightLines": [
              10,
              12
            ],
            "description": "`<ErrorBoundary>` wraps anything that might throw, and `fallback` is what renders instead if it does.\n\nWhere you put the boundary is a design decision, not a formality: it defines how much of the screen disappears when something inside it fails. One boundary at the root means any error blanks the whole app.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              4,
              11
            ],
            "description": "When `BuggyComponent` throws during render, React unwinds the tree upward looking for the nearest boundary. It finds this one, so the crash stops here instead of unmounting the entire application — which is what React does when nothing catches.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10
            ],
            "description": "The fallback renders in the failed subtree's place and everything outside the boundary keeps working.\n\nThe exact text output on the screen will be:\n`Component crashed!`",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              3,
              5
            ],
            "description": "Two limits worth knowing before you rely on this. Boundaries catch errors thrown during **rendering**, in lifecycle methods, and in constructors — they do **not** catch errors thrown in event handlers, in `setTimeout` callbacks, or in async code after an `await`. Those need ordinary `try/catch`.\n\nAnd `react-error-boundary` also offers an `onError` callback, which is where a real application reports the crash to its monitoring service — a boundary that silently swallows failures is a boundary that hides them.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { ErrorBoundary } from 'react-error-boundary';\n\nfunction BuggyComponent() {\n  throw new Error(\"I crashed!\");\n  return <div>I will never render</div>;\n}\n\nfunction App() {\n  return (\n    <div style={{ padding: 20 }}>\n      <h1>My App</h1>\n      <ErrorBoundary fallback={<h2>Something went wrong!</h2>}>\n        <BuggyComponent />\n      </ErrorBoundary>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              1,
              12,
              14
            ],
            "description": "We import `ErrorBoundary` and wrap the buggy component, providing a `fallback` UI.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              11
            ],
            "description": "Now, even though the child crashes, the App's `<h1>` still renders successfully!\n\nThe exact text output on the screen will be:\n`My App`\n`Something went wrong!`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why didn't my Error Boundary catch the error?",
          "type": "misconception",
          "walkthrough": {
            "code": "function BrokenComponent() {\n  useEffect(() => {\n    throw new Error(\"Oops\"); // Not caught!\n  }, []);\n}",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "Error Boundaries ONLY catch errors that occur during the rendering phase."
              },
              {
                "highlightLines": [
                  2,
                  3,
                  4
                ],
                "description": "They do NOT catch errors inside event handlers (like `onClick`), asynchronous code (like `setTimeout`), or `useEffect` hooks. You still need traditional `try/catch` blocks for those!"
              }
            ]
          }
        },
        {
          "title": "Can I use Hooks inside an Error Boundary?",
          "type": "misconception",
          "walkthrough": {
            "code": "class ErrorBoundary extends React.Component {\n  componentDidCatch(error, info) {\n    // Hooks are illegal here!\n  }\n}",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "As of React 18, Error Boundaries are the ONLY React feature that strictly requires a JavaScript Class."
              },
              {
                "highlightLines": [
                  3
                ],
                "description": "You absolutely cannot use Hooks (`useState`, `useContext`) inside them. If the boundary needs global state, you must pass it down as props from a higher wrapper component."
              }
            ]
          }
        },
        {
          "title": "Why did the Error Boundary catch my 404 API error?",
          "type": "misconception",
          "walkthrough": {
            "code": "fetch('/api/users').then(res => {\n  if (!res.ok) throw new Error('404 Not Found');\n});",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "Trick question: It didn't!"
              },
              {
                "highlightLines": [
                  2
                ],
                "description": "Error Boundaries ONLY catch crashes that happen during the React rendering pipeline. A failed `fetch` promise rejection happens completely asynchronously outside of React's render cycle, so the boundary ignores it. You must catch it manually and set an error state."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "testing-error-boundaries",
      "title": "Testing Error Boundaries",
      "dependencies": {
        "@testing-library/react": "^16.0.1",
        "@testing-library/jest-dom": "^6.5.0",
        "vitest": "^2.1.4",
        "react-error-boundary": "^5.0.0"
      },
      "content": "\n# Testing Error Boundaries\n\n### What is it?\n**Building on React Testing Library basics (Testing React module) and the Error Boundaries lesson above:** Testing an Error Boundary means intentionally rendering a component that throws, and asserting the fallback UI appears — instead of asserting a specific piece of app logic works correctly.\n\n> 💡 **Mental Model:** Think of it like fire-drill testing a smoke detector: you don't wait for a real fire (a real bug reaching production), you deliberately trigger it under controlled conditions and confirm the alarm (the fallback UI) actually goes off.\n\n### Why is this a distinct testing case?\nMost component tests assert something works. This one deliberately makes something *fail*, on purpose, and asserts the failure is handled gracefully. Two things make it trickier than a normal test:\n1. React logs the caught error to the console by default — expected noise, not a real failure, but it clutters test output unless you suppress it.\n2. The assertion isn't \"the component rendered correctly\" — it's \"the fallback rendered, and the rest of the app survived.\"\n\n### How?\nRender the tree exactly as production does — the buggy component wrapped in its `ErrorBoundary` — and assert on the fallback text with `getByText`, the same query APIs from the first testing lesson. Suppress the expected `console.error` noise with `vi.spyOn(console, 'error').mockImplementation(() => {})` for the duration of the test, then restore it.\n\n### Syntax/Example\n```jsx\nimport { vi, test, expect, beforeEach, afterEach } from 'vitest';\nimport { render, screen } from '@testing-library/react';\n\nlet spy;\nbeforeEach(() => {\n  // This causes React's expected \"error caught\" console noise to be silenced\n  spy = vi.spyOn(console, 'error').mockImplementation(() => {});\n});\nafterEach(() => {\n  spy.mockRestore();\n});\n\ntest('renders the fallback when a child throws', () => {\n  render(<App />);\n  expect(screen.getByText('Something went wrong.')).toBeInTheDocument();\n});\n```\n\n### Example\n```jsx\nimport { render, screen } from '@testing-library/react';\nimport App from './App';\n\nlet consoleErrorSpy;\n\nbeforeEach(() => {\n  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});\n});\n\nafterEach(() => {\n  consoleErrorSpy.mockRestore();\n});\n\ntest('shows the fallback UI instead of crashing', () => {\n  render(<App />);\n  expect(screen.getByText('Something went wrong.')).toBeInTheDocument();\n});\n```\n\n### Challenge and Solution\n**Challenge:** `App.test.jsx` already contains two correct, given tests: one asserts the fallback UI appears, the other asserts `SafeWidget` (a sibling outside the crash) stays mounted. Both currently fail because `App.jsx` renders `BuggyComponent` unwrapped, crashing the whole tree. Fix `App.jsx` — not the test — by importing `ErrorBoundary` from `react-error-boundary` and wrapping `BuggyComponent` with a `fallback`.\n\n**Solution:** Import `{ ErrorBoundary }` from `'react-error-boundary'`. Wrap `<BuggyComponent />` in `<ErrorBoundary fallback={<p>Something went wrong.</p>}>`, leaving `SafeWidget`'s text outside the boundary so it keeps rendering.\n\n### Hints\n* You're fixing `App.jsx`, not `App.test.jsx` — the test file already reflects what should be true once the component is correct.\n* The suppressed `console.error` in the test setup is expected and intentional — React always logs a caught error, even when your ErrorBoundary is working exactly right.\n* `getByText` finds the fallback text the same way it finds any other visible text — an Error Boundary test uses the same query APIs as every other component test, just aimed at a deliberately broken input.\n",
      "starterCode": {
        "/App.jsx": "function BuggyComponent() {\n  throw new Error('Crashed!');\n}\n\n// 👉 This crash currently takes down the whole tree, including SafeWidget below it.\n// Wrap BuggyComponent in an ErrorBoundary with a fallback so SafeWidget survives.\nexport default function App() {\n  return (\n    <div>\n      <BuggyComponent />\n      <p>SafeWidget still here</p>\n    </div>\n  );\n}",
        "/App.test.jsx": "import { render, screen } from '@testing-library/react';\nimport { vi, test, expect, beforeEach, afterEach } from 'vitest';\nimport App from './App';\n\n// React logs the caught error to the console — this is expected noise,\n// not a real test failure, so it's silenced for the duration of these tests.\nlet consoleErrorSpy;\nbeforeEach(() => {\n  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});\n});\nafterEach(() => {\n  consoleErrorSpy.mockRestore();\n});\n\ntest('shows the fallback UI instead of crashing when a child throws', () => {\n  render(<App />);\n  expect(screen.getByText('Something went wrong.')).toBeInTheDocument();\n});\n\ntest('the rest of the app stays mounted after the crash is caught', () => {\n  render(<App />);\n  expect(screen.getByText('SafeWidget still here')).toBeInTheDocument();\n});"
      },
      "solutionCode": {
        "/App.jsx": "import { ErrorBoundary } from 'react-error-boundary';\n\nfunction BuggyComponent() {\n  throw new Error('Crashed!');\n}\n\nexport default function App() {\n  return (\n    <div>\n      <ErrorBoundary fallback={<p>Something went wrong.</p>}>\n        <BuggyComponent />\n      </ErrorBoundary>\n      <p>SafeWidget still here</p>\n    </div>\n  );\n}",
        "/App.test.jsx": "import { render, screen } from '@testing-library/react';\nimport { vi, test, expect, beforeEach, afterEach } from 'vitest';\nimport App from './App';\n\n// React logs the caught error to the console — this is expected noise,\n// not a real test failure, so it's silenced for the duration of these tests.\nlet consoleErrorSpy;\nbeforeEach(() => {\n  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});\n});\nafterEach(() => {\n  consoleErrorSpy.mockRestore();\n});\n\ntest('shows the fallback UI instead of crashing when a child throws', () => {\n  render(<App />);\n  expect(screen.getByText('Something went wrong.')).toBeInTheDocument();\n});\n\ntest('the rest of the app stays mounted after the crash is caught', () => {\n  render(<App />);\n  expect(screen.getByText('SafeWidget still here')).toBeInTheDocument();\n});"
      },
      "exampleWalkthrough": {
        "code": "import { render, screen } from '@testing-library/react';\nimport App from './App';\n\nlet consoleErrorSpy;\n\nbeforeEach(() => {\n  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});\n});\n\nafterEach(() => {\n  consoleErrorSpy.mockRestore();\n});\n\ntest('shows the fallback UI instead of crashing', () => {\n  render(<App />);\n  expect(screen.getByText('Something went wrong.')).toBeInTheDocument();\n});",
        "steps": [
          {
            "highlightLines": [
              6,
              7,
              8
            ],
            "description": "A component that throws on purpose still makes React log the error before the boundary catches it, so a passing test would bury real output under an expected stack trace.\n\n`vi.spyOn(console, 'error').mockImplementation(() => {})` replaces it with a no-op for the duration of this file. Note that it is a spy, not a deletion — you can still assert on what was logged if you want to.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10,
              11,
              12
            ],
            "description": "`mockRestore()` puts the real `console.error` back. This is not tidiness — leaving it mocked silences errors in every test that runs afterwards in the same process, and the failure that surfaces then will look like it belongs to some unrelated file.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              14,
              15,
              16
            ],
            "description": "The test itself is ordinary. Render the tree and query for the fallback's visible text.\n\nWhat it deliberately does *not* do is reach for the boundary component, inspect its state, or check that `componentDidCatch` fired. The assertion is what a user would see, which is the only part that has to keep working when the boundary is reimplemented.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { ErrorBoundary } from 'react-error-boundary';\n\nfunction BuggyComponent() {\n  throw new Error('Crashed!');\n}\n\nexport default function App() {\n  return (\n    <div>\n      <ErrorBoundary fallback={<p>Something went wrong.</p>}>\n        <BuggyComponent />\n      </ErrorBoundary>\n      <p>SafeWidget still here</p>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [9, 10, 11],
            "description": "`BuggyComponent` is now wrapped in `<ErrorBoundary fallback={<p>Something went wrong.</p>}>`. This is exactly what the first given test asserts on: once this renders, `screen.getByText('Something went wrong.')` finds the fallback and that test passes.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [12],
            "description": "`<p>SafeWidget still here</p>` stays outside the `ErrorBoundary`, as its own sibling. Before this fix, `BuggyComponent` throwing crashed the entire `App` tree — including this line. Now the boundary contains the crash to just its own subtree, so this text survives and the second given test passes too.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [1],
            "description": "Notice `App.test.jsx` never changed — both tests were correct from the start. This is a common shape for testing work in general: the test describes the contract the component should honor, and fixing the component is what makes the description true.\n\nThe exact text output on the screen will be:\n`Something went wrong.`\n`SafeWidget still here`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why not just expect(() => render(<BuggyComponent />)).toThrow()?",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ This does NOT reliably work for React component errors\nexpect(() => render(<BuggyComponent />)).toThrow();\n\n// ✅ Render inside the same boundary production uses,\n// then assert on the FALLBACK — not the throw\nrender(<ErrorBoundary fallback={<p>Error!</p>}><BuggyComponent /></ErrorBoundary>);\nexpect(screen.getByText('Error!')).toBeInTheDocument();",
            "steps": [
              {
                "highlightLines": [2],
                "description": "This pattern works for plain JavaScript functions that throw, but React's rendering internals catch and rethrow errors in ways that don't always propagate cleanly to a `toThrow()` assertion — and even when it does 'work,' it's testing the wrong thing: production code never sees a raw uncaught throw, because the ErrorBoundary catches it first."
              },
              {
                "highlightLines": [5, 6],
                "description": "Test the actual production shape: render the component *inside* the same boundary that wraps it in the real app, and assert on the fallback UI a real user would see — not on the exception the boundary already exists to prevent from ever surfacing."
              }
            ]
          }
        },
        {
          "title": "Forgetting to restore the console spy leaks into other tests",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// ❌ No afterEach — the mock silently stays active\nbeforeEach(() => {\n  vi.spyOn(console, 'error').mockImplementation(() => {});\n});\n// Every test in this file (and depending on config, others) now has\n// console.error silently swallowed — including real bugs.\n\n// ✅ Always pair a spy with its restore\nafterEach(() => {\n  consoleErrorSpy.mockRestore();\n});",
            "steps": [
              {
                "highlightLines": [2, 3, 4, 5, 6],
                "description": "A `console.error` spy without a matching restore doesn't just affect this one test — it stays mocked for every test that runs afterward in the same file (or suite, depending on your test isolation config), silently hiding real errors you'd otherwise have caught."
              },
              {
                "highlightLines": [9, 10, 11],
                "description": "Treat `spyOn`/`mockRestore` as a pair, the same discipline as `useEffect`'s setup/cleanup — every mock that changes global behavior needs an equally deliberate undo."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "portals",
      "title": "Portals",
      "content": "\n# Portals (createPortal)\n\n### What is it?\n**Building on the DOM hierarchy:** **Portals** provide a way to render elements into a DOM node that exists outside the parent component's DOM container (e.g. into `document.body`) while maintaining the React component hierarchy.\n\n> \ud83d\udca1 **Mental Model:** Think of a portal like a security badge that lets an employee (your component) work physically in a different building (a different DOM node) while still officially being on the same company's payroll (the same React tree, context, and events).\n\n### Why do we need it?\nSometimes you need a component to visually \"break out\" of its container. For example, if you build a Modal, Tooltip, or Dropdown inside a component that has `overflow: hidden` or a restrictive `z-index`, the UI will be clipped or hidden. Portals let you escape these CSS constraints.\n\n### How?\nYou use the `createPortal(child, container)` function from `react-dom`. You pass it the JSX you want to render, and a reference to the DOM node (like `document.body`) where you want it injected.\n\n### Syntax/Example\n```jsx\nimport { createPortal } from 'react-dom';\n\n// This returns a modal component\nfunction Modal({ children }) {\n  // This causes the children to be rendered directly into \n  // document.body, outside the normal React DOM hierarchy\n  return createPortal(\n    <div className=\"modal-overlay\">{children}</div>,\n    document.body\n  );\n}\n```\n\n### Example\n```jsx\nimport { createPortal } from 'react-dom';\n\nfunction Tooltip({ text }) {\n  return createPortal(\n    <div style={{ position: 'absolute', top: 10, right: 10, background: 'yellow' }}>\n      {text}\n    </div>,\n    document.body\n  );\n}\n\nfunction App() {\n  return (\n    <div style={{ overflow: 'hidden', height: 50, border: '1px solid black' }}>\n      <Tooltip text=\"I am not clipped!\" />\n    </div>\n  );\n}\n\nexport default App;\n```\n\n### Challenge and Solution\n**Challenge:** The Modal component is currently rendering inside the App `div`, which has `overflow: hidden` applied. The modal is trapped! Use `createPortal` to render the Modal into `document.body` instead.\n\n**Solution:** Import `createPortal` from `react-dom`. In the `Modal` component, instead of returning `modalUI` directly, `return createPortal(modalUI, document.body);`.\n\n### Hints\n* **Event Bubbling Magic:** Events fired inside a portal still bubble through the **React tree**, not the DOM tree. If you click inside the modal, the `onClick` of the component that rendered the Portal will still catch it. This is a common gotcha for dismiss logic.\n",
      "starterCode": "import { useState } from 'react';\nimport { createPortal } from 'react-dom';\n\nfunction Modal({ children, onClose }) {\n  const modalUI = (\n    <div style={{\n      position: 'absolute', top: '50px', left: '50px',\n      background: 'white', color: 'black', padding: '20px',\n      boxShadow: '0 0 10px rgba(0,0,0,0.5)'\n    }}>\n      {children}\n      <br/><button onClick={onClose}>Close</button>\n    </div>\n  );\n\n  // 👉 Return modalUI wrapped in createPortal, targeting document.body\n  return modalUI;\n}\n\nexport default function App() {\n  const [isOpen, setIsOpen] = useState(false);\n\n  return (\n    <div style={{ height: '150px', overflow: 'hidden', border: '2px solid gray' }}>\n      <h1>My App</h1>\n      <button onClick={() => setIsOpen(true)}>Open Modal</button>\n      \n      {isOpen && (\n        <Modal onClose={() => setIsOpen(false)}>\n          <h2>I am a Modal!</h2>\n          <p>If I am not in a portal, I am trapped by overflow: hidden!</p>\n        </Modal>\n      )}\n    </div>\n  );\n}\n",
      "solutionCode": "import { useState } from 'react';\nimport { createPortal } from 'react-dom';\n\nfunction Modal({ children, onClose }) {\n  const modalUI = (\n    <div style={{\n      position: 'absolute', top: '50px', left: '50px',\n      background: 'white', color: 'black', padding: '20px',\n      boxShadow: '0 0 10px rgba(0,0,0,0.5)'\n    }}>\n      {children}\n      <br/><button onClick={onClose}>Close</button>\n    </div>\n  );\n\n  return createPortal(modalUI, document.body);\n}\n\nexport default function App() {\n  const [isOpen, setIsOpen] = useState(false);\n\n  return (\n    <div style={{ height: '150px', overflow: 'hidden', border: '2px solid gray' }}>\n      <h1>My App</h1>\n      <button onClick={() => setIsOpen(true)}>Open Modal</button>\n      \n      {isOpen && (\n        <Modal onClose={() => setIsOpen(false)}>\n          <h2>I am a Modal!</h2>\n          <p>If I am not in a portal, I am trapped by overflow: hidden!</p>\n        </Modal>\n      )}\n    </div>\n  );\n}\n",
      "exampleWalkthrough": {
        "code": "import { createPortal } from 'react-dom';\n\nfunction Tooltip({ text }) {\n  return createPortal(\n    <div style={{ position: 'absolute', top: 10, right: 10, background: 'yellow' }}>\n      {text}\n    </div>,\n    document.body\n  );\n}\n\nfunction App() {\n  return (\n    <div style={{ overflow: 'hidden', height: 50, border: '1px solid black' }}>\n      <Tooltip text=\"I am not clipped!\" />\n    </div>\n  );\n}\n\nexport default App;",
        "steps": [
          {
            "highlightLines": [
              1
            ],
            "description": "`createPortal` comes from `react-dom`, not from `react`. That import path is a reminder that this is a DOM-specific escape hatch rather than part of the core model.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              4,
              8
            ],
            "description": "Two arguments: the React node to render, and the DOM element to render it into. Here that is `document.body`, so the tooltip's markup lands at the end of the document rather than inside its parent.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              14,
              15
            ],
            "description": "And this is what it buys. The parent has `overflow: hidden` and a height of 50px, which would clip any normal child. The portalled tooltip escapes it entirely.\n\nThe same trick answers `z-index` stacking contexts and `position: relative` ancestors — the CSS problems that have no CSS solution once a component is nested deeply enough.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              3,
              15
            ],
            "description": "What does *not* change is the React tree. `Tooltip` is still a child of that `<div>` as far as React is concerned, so context flows into it and events bubble out of it to the React parent — not to the DOM parent it was rendered into.\n\nThe DOM position moved; the component position did not. Both facts matter, and they point in different directions.\n\nThe exact text output on the screen will be:\n`I am not clipped!` in the top-right corner of the preview, outside the bordered box.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useState } from 'react';\nimport { createPortal } from 'react-dom';\n\nfunction Modal({ children, onClose }) {\n  const modalUI = (\n    <div style={{\n      position: 'absolute', top: '50px', left: '50px',\n      background: 'white', color: 'black', padding: '20px',\n      boxShadow: '0 0 10px rgba(0,0,0,0.5)'\n    }}>\n      {children}\n      <br/><button onClick={onClose}>Close</button>\n    </div>\n  );\n\n  return createPortal(modalUI, document.body);\n}\n\n// ... App",
        "steps": [
          {
            "highlightLines": [
              16
            ],
            "description": "We wrap the `modalUI` with `createPortal`, targeting `document.body`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10
            ],
            "description": "Now, even though the App has `overflow: hidden`, the modal successfully escapes and overlays the screen!\n\nThe exact text output on the screen will be (when open):\n`My App`\n`[Button: Open Modal]`\n`I am a Modal!`\n`If I am not in a portal, I am trapped by overflow: hidden!`\n`[Button: Close]`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Do Portals break React events?",
          "type": "misconception",
          "walkthrough": {
            "code": "<div onClick={handleAppClick}>\n  <ModalPortal>\n    <button onClick={handleModalClick}>Click</button>\n  </ModalPortal>\n</div>",
            "steps": [
              {
                "highlightLines": [
                  2,
                  4
                ],
                "description": "Even though `ModalPortal` physically teleports the DOM nodes to a completely different part of the document (like the `<body>` tag)..."
              },
              {
                "highlightLines": [
                  1,
                  3
                ],
                "description": "React's synthetic event system still perfectly respects the original React Tree! Clicking the modal button will successfully bubble the event up to `handleAppClick`."
              }
            ]
          }
        },
        {
          "title": "Why use Portals instead of absolute positioning?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "<div style={{ overflow: 'hidden' }}>\n  <div style={{ position: 'absolute' }}>\n    Modal Content\n  </div>\n</div>",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "If a parent div has `overflow: hidden` or `z-index` stacking contexts, absolutely positioned elements will STILL be trapped inside that container and cut off."
              },
              {
                "highlightLines": [
                  1,
                  2,
                  3,
                  4
                ],
                "description": "Portals solve this permanently by physically appending the DOM node directly to `document.body`, escaping all CSS traps!"
              }
            ]
          }
        },
        {
          "title": "Does Context work across a Portal?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "<ThemeContext.Provider value=\"dark\">\n  <div>\n    <ModalPortal>\n      <button>I will be dark!</button>\n    </ModalPortal>\n  </div>\n</ThemeContext.Provider>",
            "steps": [
              {
                "highlightLines": [
                  1,
                  4
                ],
                "description": "Yes it does! Even though the Portal renders the HTML `<button>` way outside of the React Root div in the physical DOM..."
              },
              {
                "highlightLines": [
                  4
                ],
                "description": "React still maintains the logical Virtual DOM tree perfectly. The button can easily consume the `ThemeContext` from its logical parent!"
              }
            ]
          }
        },
        {
          "title": "The React Event Bubbling Paradox in Portals",
          "type": "did-you-know",
          "walkthrough": {
            "code": "function Parent() {\n  // Catches clicks from the Portal even though it is in document.body!\n  return (\n    <div onClick={() => console.log('Parent caught event!')}>\n      <ModalPortal />\n    </div>\n  );\n}",
            "steps": [
              {
                "highlightLines": [
                  4,
                  5
                ],
                "description": "Even though a Portal injects HTML into `document.body` outside the parent DOM node, Synthetic Events still bubble UP the React Virtual Component Tree!"
              },
              {
                "highlightLines": [
                  4
                ],
                "description": "This allows parent components to handle events from modals and tooltips naturally without needing manual DOM event bridges."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "compound-components",
      "title": "Compound Components (Pattern)",
      "content": "\n# Compound Components\n\n### What is it?\n**Building on context and composition:** The **Compound Components** pattern lets you build complex multi-part UI widgets (like Tabs, Accordions, or Menus) where multiple components coordinate and share implicit state behind the scenes.\n\n> \ud83d\udca1 **Mental Model:** Think of compound components like a TV remote and the TV itself: the buttons don't work alone and the screen doesn't respond to nothing \u2014 they're designed as a set that only makes sense used together, silently sharing one shared understanding of what's on screen.\n\n### Why do we need it?\nWhen building complex UI elements, a single component often gets overloaded with props (e.g., `<Tabs tabs={[{title: 'Home', content: '...'}]} />`). Compound components solve this by giving the user maximum flexibility over the layout, while maintaining linked functionality.\n\n### How?\nYou use React Context to share state between a parent wrapper and its children. The parent provides the state, and the sub-components consume it. You then assign the sub-components as properties of the parent for a clean namespace (e.g., `Tabs.Panel`).\n\n### Syntax/Example\n```jsx\n// This creates a Context to share state\n// between compound components\nconst TabsContext = createContext();\n\nfunction Tabs({ children }) {\n  const [active, setActive] = useState(0);\n  // This causes the active tab state to be shared\n  // with all children\n  return <TabsContext.Provider value={{ active, setActive }}>\n    {children}\n  </TabsContext.Provider>;\n}\n\n// This attaches sub-components to the main Tabs component\nTabs.Panel = function Panel({ index, children }) {\n  const { active } = useContext(TabsContext);\n  // This causes the panel to render ONLY if it is the active one\n  return active === index ? <div>{children}</div> : null;\n};\n```\n\n### Example\n```jsx\nimport { createContext, useContext, useState } from 'react';\n\nconst MenuContext = createContext();\n\nfunction Menu({ children }) {\n  const [open, setOpen] = useState(false);\n  return (\n    <MenuContext.Provider value={{ open, setOpen }}>\n      <div style={{ position: 'relative' }}>{children}</div>\n    </MenuContext.Provider>\n  );\n}\n\nMenu.Button = function MenuButton({ children }) {\n  const { open, setOpen } = useContext(MenuContext);\n  return <button onClick={() => setOpen(!open)}>{children}</button>;\n};\n\nMenu.List = function MenuList({ children }) {\n  const { open } = useContext(MenuContext);\n  return open ? <ul>{children}</ul> : null;\n};\n\nfunction App() {\n  return (\n    <Menu>\n      <Menu.Button>Toggle Menu</Menu.Button>\n      <Menu.List>\n        <li>Item 1</li>\n        <li>Item 2</li>\n      </Menu.List>\n    </Menu>\n  );\n}\n\nexport default App;\n```\n\n### Challenge and Solution\n**Challenge:** We are building a `<Tabs>` compound component. The `Tabs.Panel` already works, but `Tabs.Tab` is broken because it isn't reading from the `TabsContext`!\n\n**Solution:** In `Tab`, get `activeTab` and `setActiveTab` from `TabsContext` using `useContext(TabsContext)`. Calculate `isActive` as `activeTab === index`. Add an `onClick={() => setActiveTab(index)}` handler to the button.\n\n### Hints\n* **Fragile APIs & Defensive Coding:** Passing `index` props manually is error-prone. Real compound components often use unique `id` props or `React.Children.map`.\n* Always add a null-check guard in your sub-components: `if (!context) throw new Error('Tab must be used inside Tabs');`\n",
      "starterCode": "import { createContext, useContext, useState } from 'react';\n\nconst TabsContext = createContext();\n\nfunction Tabs({ children }) {\n  const [activeTab, setActiveTab] = useState(0);\n  return (\n    <TabsContext.Provider value={{ activeTab, setActiveTab }}>\n      <div style={{ border: '1px solid #ccc', borderRadius: '4px' }}>\n        {children}\n      </div>\n    </TabsContext.Provider>\n  );\n}\n\nfunction TabList({ children }) {\n  return <div style={{ display: 'flex', borderBottom: '1px solid #ccc' }}>{children}</div>;\n}\n\nfunction Tab({ index, children }) {\n  // 👉 The Tab component is missing the context!\n  // 1. Get `activeTab` and `setActiveTab` from TabsContext.\n  // 2. Change the button's background based on `activeTab === index`.\n  // 3. Call `setActiveTab(index)` when clicked.\n  \n  const isActive = false;\n\n  return (\n    <button \n      style={{ \n        flex: 1, padding: '10px', border: 'none', cursor: 'pointer',\n        background: isActive ? '#007bff' : '#eee',\n        color: isActive ? 'white' : 'black'\n      }}\n    >\n      {children}\n    </button>\n  );\n}\n\nfunction TabPanels({ children }) {\n  return <div style={{ padding: '20px' }}>{children}</div>;\n}\n\nfunction TabPanel({ index, children }) {\n  const { activeTab } = useContext(TabsContext);\n  if (activeTab !== index) return null;\n  return <div>{children}</div>;\n}\n\n// Assign them as properties for that sweet <Tabs.Tab> syntax\nTabs.List = TabList;\nTabs.Tab = Tab;\nTabs.Panels = TabPanels;\nTabs.Panel = TabPanel;\n\nexport default function App() {\n  return (\n    <Tabs>\n      <Tabs.List>\n        <Tabs.Tab index={0}>Profile</Tabs.Tab>\n        <Tabs.Tab index={1}>Settings</Tabs.Tab>\n      </Tabs.List>\n      <Tabs.Panels>\n        <Tabs.Panel index={0}>User Profile Details here.</Tabs.Panel>\n        <Tabs.Panel index={1}>Account Settings here.</Tabs.Panel>\n      </Tabs.Panels>\n    </Tabs>\n  );\n}\n",
      "solutionCode": "import { createContext, useContext, useState } from 'react';\n\nconst TabsContext = createContext();\n\nfunction Tabs({ children }) {\n  const [activeTab, setActiveTab] = useState(0);\n  return (\n    <TabsContext.Provider value={{ activeTab, setActiveTab }}>\n      <div style={{ border: '1px solid #ccc', borderRadius: '4px' }}>\n        {children}\n      </div>\n    </TabsContext.Provider>\n  );\n}\n\nfunction TabList({ children }) {\n  return <div style={{ display: 'flex', borderBottom: '1px solid #ccc' }}>{children}</div>;\n}\n\nfunction Tab({ index, children }) {\n  const { activeTab, setActiveTab } = useContext(TabsContext);\n  \n  const isActive = activeTab === index;\n\n  return (\n    <button \n      onClick={() => setActiveTab(index)}\n      style={{ \n        flex: 1, padding: '10px', border: 'none', cursor: 'pointer',\n        background: isActive ? '#007bff' : '#eee',\n        color: isActive ? 'white' : 'black'\n      }}\n    >\n      {children}\n    </button>\n  );\n}\n\nfunction TabPanels({ children }) {\n  return <div style={{ padding: '20px' }}>{children}</div>;\n}\n\nfunction TabPanel({ index, children }) {\n  const { activeTab } = useContext(TabsContext);\n  if (activeTab !== index) return null;\n  return <div>{children}</div>;\n}\n\n// Assign them as properties for that sweet <Tabs.Tab> syntax\nTabs.List = TabList;\nTabs.Tab = Tab;\nTabs.Panels = TabPanels;\nTabs.Panel = TabPanel;\n\nexport default function App() {\n  return (\n    <Tabs>\n      <Tabs.List>\n        <Tabs.Tab index={0}>Profile</Tabs.Tab>\n        <Tabs.Tab index={1}>Settings</Tabs.Tab>\n      </Tabs.List>\n      <Tabs.Panels>\n        <Tabs.Panel index={0}>User Profile Details here.</Tabs.Panel>\n        <Tabs.Panel index={1}>Account Settings here.</Tabs.Panel>\n      </Tabs.Panels>\n    </Tabs>\n  );\n}\n",
      "exampleWalkthrough": {
        "code": "import { createContext, useContext, useState } from 'react';\n\nconst MenuContext = createContext();\n\nfunction Menu({ children }) {\n  const [open, setOpen] = useState(false);\n  return (\n    <MenuContext.Provider value={{ open, setOpen }}>\n      <div style={{ position: 'relative' }}>{children}</div>\n    </MenuContext.Provider>\n  );\n}\n\nMenu.Button = function MenuButton({ children }) {\n  const { open, setOpen } = useContext(MenuContext);\n  return <button onClick={() => setOpen(!open)}>{children}</button>;\n};\n\nMenu.List = function MenuList({ children }) {\n  const { open } = useContext(MenuContext);\n  return open ? <ul>{children}</ul> : null;\n};\n\nfunction App() {\n  return (\n    <Menu>\n      <Menu.Button>Toggle Menu</Menu.Button>\n      <Menu.List>\n        <li>Item 1</li>\n        <li>Item 2</li>\n      </Menu.List>\n    </Menu>\n  );\n}\n\nexport default App;",
        "steps": [
          {
            "highlightLines": [
              6,
              8
            ],
            "description": "`Menu` owns the open/closed state and puts it on a Context. It renders `{children}` without inspecting them, so it never needs to know what a menu is made of.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              14,
              15,
              19,
              20
            ],
            "description": "The pieces are attached to `Menu` as properties, which is where the pattern gets its shape: `Menu.Button` and `Menu.List` announce in their own names that they only make sense inside a `Menu`.\n\nEach reads the Context for the state it needs. No props are threaded from `Menu` to them, so inserting a wrapper `<div>` between them changes nothing.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              26,
              32
            ],
            "description": "The caller composes the parts in whatever arrangement the design needs, and the state still connects. Compare the alternative — a `<Menu items={[...]} buttonLabel=\"...\" align=\"left\" />` that grows a prop for every variation somebody asks for.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              21
            ],
            "description": "The cost side, since this pattern is easy to over-apply: a child rendered outside its parent gets `undefined` from `useContext` and fails at a confusing place. Production versions throw a deliberate error instead — \"MenuList must be used within a Menu\".\n\nWorth it for a component library with real composition needs; overkill for a menu used twice in one app.\n\nThe exact text output on the screen will be:\n`[Button: Toggle Menu]`\n\nand after clicking it, `Item 1` and `Item 2`.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "function Tab({ index, children }) {\n  const { activeTab, setActiveTab } = useContext(TabsContext);\n  \n  const isActive = activeTab === index;\n\n  return (\n    <button \n      onClick={() => setActiveTab(index)}\n      style={{ \n        flex: 1, padding: '10px', border: 'none', cursor: 'pointer',\n        background: isActive ? '#007bff' : '#eee',\n        color: isActive ? 'white' : 'black'\n      }}\n    >\n      {children}\n    </button>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              2,
              4
            ],
            "description": "We read the context to determine if this specific Tab is active.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              8
            ],
            "description": "Clicking the tab calls the shared `setActiveTab` function, which automatically updates the Tabs and the Panels at the same time!\n\nThe exact text output on the screen will be:\n`[Button: Profile]`\n`[Button: Settings]`\n`User Profile Details here.` (when Profile is active)",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why use `React.Children.map`?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "React.Children.map(children, child => {\n  return React.cloneElement(child, { isOpen });\n});",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "While Context is the modern standard for Compound Components, `React.Children` and `cloneElement` are still widely used in older libraries."
              },
              {
                "highlightLines": [
                  2
                ],
                "description": "They allow a parent component to invisibly inject props into its direct children. However, it's considered a legacy pattern because it's brittle and harder to type with TypeScript."
              }
            ]
          }
        },
        {
          "title": "Why export the children as properties?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "const Select = ({ children }) => <div>{children}</div>;\nSelect.Option = ({ value }) => <option>{value}</option>;\n\n// Usage\n<Select>\n  <Select.Option value=\"1\" />\n</Select>",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "Attaching sub-components directly to the main component (`Select.Option`) is incredibly common in enterprise libraries like Ant Design or Radix."
              },
              {
                "highlightLines": [
                  6
                ],
                "description": "It explicitly tells the developer that `Option` is inextricably linked to `Select` and shouldn't be used anywhere else, keeping the import statements clean."
              }
            ]
          }
        },
        {
          "title": "Why use Context for Compound Components?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "function Accordion({ children }) {\n  const [openId, setOpenId] = useState(null);\n  return <AccordionContext.Provider value={{ openId, setOpenId }}>{children}</AccordionContext.Provider>;\n}",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "Using Context is the modern, robust way to build Compound Components instead of the legacy `React.Children.map`."
              },
              {
                "highlightLines": [
                  3
                ],
                "description": "It allows the child components (like `<Accordion.Item>`) to be nested arbitrarily deep inside divs or other wrappers, while still magically having access to the parent's `openId` state!"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "forward-ref",
      "title": "Refs and forwardRef Patterns",
      "content": "\n# Forwarding Refs (React 19)\n\n### What is it?\n**Building on useRef and DOM elements:** Ref forwarding allows a custom component to accept a `ref` prop from its parent and attach it down to an underlying DOM element.\n\n> \ud83d\udca1 **Mental Model:** Think of forwardRef like a relay handoff in a race: the parent hands the baton (the ref) to the child component, and forwardRef makes sure that baton doesn't get dropped at the handoff \u2014 it passes straight through to the actual DOM node underneath.\n\n### Why do we need it?\nBy default, if you pass a `ref` to a custom component (e.g. `<CustomInput ref={myRef} />`), the component receives it but does nothing with it. If the parent wants to call `.focus()` on the actual HTML `<input>`, the custom component must explicitly pass that ref down to the DOM element.\n\n### How?\nIn **React 19**, `ref` is just a regular prop—no special wrapper needed. You can destructure it directly alongside your other props, and pass it to the internal HTML element.\n\n### Syntax/Example\n```jsx\n// In React 19, ref is a plain prop\nfunction CustomInput({ label, ref, ...props }) {\n  // This causes the forwarded ref to be attached directly \n  // to the underlying HTML <input> element\n  return <input ref={ref} className=\"custom-input\" {...props} />;\n}\n\n// In the parent component:\nconst inputRef = useRef();\n<CustomInput ref={inputRef} />\n```\n\n### Example\n```jsx\nimport { useRef } from 'react';\n\n// In React 19, ref is a plain prop\nfunction FancyButton({ ref, children, ...props }) {\n  return (\n    <button ref={ref} style={{ border: '2px solid red' }} {...props}>\n      {children}\n    </button>\n  );\n}\n\nfunction App() {\n  const btnRef = useRef(null);\n  return (\n    <div>\n      <FancyButton ref={btnRef}>Click me</FancyButton>\n      <button onClick={() => console.log(btnRef.current)}>Log Ref</button>\n    </div>\n  );\n}\n\nexport default App;\n```\n\n### Challenge and Solution\n**Challenge:** The App wants to focus the `CustomInput` when you click the button, but `inputRef.current` is `null`. Forward the ref!\n\n**Solution:** Add `ref` to the destructured props of `CustomInput`: `function CustomInput({ label, ref, ...props })`. Attach `ref` to the inner `<input>` element: `<input ref={ref} {...props} />`.\n\n### Hints\n* **React 18 Legacy API:** In older React versions, you had to wrap the component in `forwardRef((props, ref) => ...)`. You will see this in older codebases.\n* **The Professional Pattern (`useImperativeHandle`):** Passing the raw DOM `ref` breaks encapsulation. Use `useImperativeHandle` to expose only the API you intend (like `focus()`), rather than exposing the entire DOM node.\n",
      "starterCode": "import { useRef } from 'react';\n\n// 👉 CustomInput currently ignores the ref prop from the parent!\n// In React 19, ref is a plain prop. Add it to the destructured params\n// and pass it to the inner <input> element.\nfunction CustomInput({ label, ...props }) {\n  return (\n    <div style={{ marginBottom: '10px' }}>\n      <label style={{ display: 'block', fontWeight: 'bold' }}>{label}</label>\n      <input \n        style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}\n        {...props} \n      />\n    </div>\n  );\n}\n\nexport default function App() {\n  const inputRef = useRef(null);\n\n  const focusInput = () => {\n    // This will do nothing (or crash) right now because inputRef.current is null!\n    if (inputRef.current) {\n      inputRef.current.focus();\n    }\n  };\n\n  return (\n    <div style={{ padding: '20px', border: '1px solid #ccc' }}>\n      <h2>Sign Up</h2>\n      <CustomInput ref={inputRef} label=\"Email Address\" placeholder=\"Enter your email\" />\n      <button onClick={focusInput}>Focus Email Input</button>\n    </div>\n  );\n}\n",
      "solutionCode": "import { useRef } from 'react';\n\n// In React 19, ref is a plain prop — no forwardRef wrapper needed!\nfunction CustomInput({ label, ref, ...props }) {\n  return (\n    <div style={{ marginBottom: '10px' }}>\n      <label style={{ display: 'block', fontWeight: 'bold' }}>{label}</label>\n      <input \n        ref={ref}\n        style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}\n        {...props} \n      />\n    </div>\n  );\n}\n\nexport default function App() {\n  const inputRef = useRef(null);\n\n  const focusInput = () => {\n    if (inputRef.current) {\n      inputRef.current.focus();\n    }\n  };\n\n  return (\n    <div style={{ padding: '20px', border: '1px solid #ccc' }}>\n      <h2>Sign Up</h2>\n      <CustomInput ref={inputRef} label=\"Email Address\" placeholder=\"Enter your email\" />\n      <button onClick={focusInput}>Focus Email Input</button>\n    </div>\n  );\n}\n",
      "exampleWalkthrough": {
        "code": "import { useRef } from 'react';\n\n// In React 19, ref is a plain prop\nfunction FancyButton({ ref, children, ...props }) {\n  return (\n    <button ref={ref} style={{ border: '2px solid red' }} {...props}>\n      {children}\n    </button>\n  );\n}\n\nfunction App() {\n  const btnRef = useRef(null);\n  return (\n    <div>\n      <FancyButton ref={btnRef}>Click me</FancyButton>\n      <button onClick={() => console.log(btnRef.current)}>Log Ref</button>\n    </div>\n  );\n}\n\nexport default App;",
        "steps": [
          {
            "highlightLines": [
              3,
              4
            ],
            "description": "In React 19, `ref` is an ordinary prop. Destructure it out of props alongside everything else — no `forwardRef` wrapper, no second function argument.\n\nBefore 19, `ref` was intercepted by React and never reached the component, which is the entire reason `forwardRef` existed. You will still meet it in older code and in libraries that support both.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6
            ],
            "description": "The component passes the ref down to the real `<button>`. After commit, React sets `ref.current` to that DOM node.\n\nThis is an opt-in: `FancyButton` chose which of its internal elements the outside world may hold. A component that accepts a ref and does not forward it leaves `ref.current` as `null`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              13,
              16
            ],
            "description": "The parent creates the ref and hands it over. Once rendered, `btnRef.current` is the inner `<button>`, ready for `.focus()`, `.scrollIntoView()`, or a measurement.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              17
            ],
            "description": "Click **Log Ref** and the actual DOM node appears in the console.\n\nUse this sparingly. Handing a parent direct access to a child's DOM node is a hole in the component's boundary, and it is worth taking only for the things props genuinely cannot express — focus, text selection, media playback, measurement.\n\nThe exact text output on the screen will be:\n`[Button: Click me] [Button: Log Ref]`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useRef } from 'react';\n\n// In React 19, ref is a plain prop — no forwardRef wrapper needed!\nfunction CustomInput({ label, ref, ...props }) {\n  return (\n    <div style={{ marginBottom: '10px' }}>\n      <label style={{ display: 'block', fontWeight: 'bold' }}>{label}</label>\n      <input \n        ref={ref}\n        style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}\n        {...props} \n      />\n    </div>\n  );\n}\n\n// ... App",
        "steps": [
          {
            "highlightLines": [
              4,
              9
            ],
            "description": "We added `ref` to the CustomInput component parameters, and attached it to the inner HTML `<input>`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              13
            ],
            "description": "Now when the parent clicks 'Focus Email Input', the ref correctly calls `.focus()` on the inner HTML element!\n\nThe exact text output on the screen will be:\n`Sign Up`\n`Email Address`\n`[Input: Enter your email]`\n`[Button: Focus Email Input]`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why does passing `ref` to my component throw a warning?",
          "type": "misconception",
          "walkthrough": {
            "code": "// INCORRECT\nfunction MyInput({ ref }) { return <input ref={ref} />; }\n\n// CORRECT\nconst MyInput = forwardRef((props, ref) => <input ref={ref} />);",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "`ref` and `key` are special reserved words in React. You cannot access them normally through the `props` object."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "If you want a custom component to accept a `ref` from its parent and attach it to an underlying DOM node, you MUST wrap the component in `forwardRef`."
              }
            ]
          }
        },
        {
          "title": "Can I expose multiple refs from one component?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "useImperativeHandle(ref, () => ({\n  focus: () => inputRef.current.focus(),\n  reset: () => setFormState(null)\n}));",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "By pairing `forwardRef` with the `useImperativeHandle` hook, you can create a custom object to return instead of a raw DOM node."
              },
              {
                "highlightLines": [
                  2,
                  3
                ],
                "description": "This allows you to expose a clean API of custom functions (like `reset` or `playAnimation`) to the parent component, completely hiding the messy DOM logic inside."
              }
            ]
          }
        },
        {
          "title": "Can I forward a ref to a class component?",
          "type": "misconception",
          "walkthrough": {
            "code": "// Legacy class component\n<MyClassComponent ref={myRef} />",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "You don't need `forwardRef` for Class components!"
              },
              {
                "highlightLines": [
                  2
                ],
                "description": "If you put a `ref` on a Class component, React automatically attaches the ref to the actual mounted instance of the class, giving you full access to all its internal methods. `forwardRef` was invented exclusively for Function components."
              }
            ]
          }
        },
        {
          "title": "useImperativeHandle: Exposing Controlled APIs via Ref",
          "type": "pro-tip",
          "walkthrough": {
            "code": "const CustomInput = forwardRef((props, ref) => {\n  const inputRef = useRef(null);\n  useImperativeHandle(ref, () => ({\n    focus: () => inputRef.current.focus(),\n    reset: () => { inputRef.current.value = ''; }\n  }));\n  return <input ref={inputRef} {...props} />;\n});",
            "steps": [
              {
                "highlightLines": [
                  3,
                  4,
                  5,
                  6
                ],
                "description": "Instead of exposing the entire raw `<input>` DOM node, `useImperativeHandle` lets you expose only a safe, tailored set of methods (`focus()`, `reset()`)."
              }
            ]
          }
        }
      ]
    }
  ]
};
