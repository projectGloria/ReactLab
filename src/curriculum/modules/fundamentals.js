export default {
  "id": "fundamentals",
  "title": "Fundamentals",
  "lessons": [
    {
      "id": "jsx-intro",
      "title": "JSX Syntax & Rules",
      "content": "\n# JSX Syntax & Rules\n\n### What is it?\n**JSX (JavaScript XML)** is a syntax extension that lets you write HTML-like markup directly inside JavaScript code. It's not a template language — it compiles down to plain JavaScript function calls.\n\n> 💡 **Mental Model:** JSX is a phone call in disguise. When you write `<h1 className=\"title\">Hello</h1>`, the compiler transforms it into `_jsx('h1', { className: 'title', children: 'Hello' })`. You're not writing HTML — you're writing a function call that returns a plain JavaScript object (a React element) describing what you want rendered.\n\n### Why does React use JSX instead of plain JavaScript?\nWithout JSX, declaring UI requires deeply nested function calls:\n```jsx\n// Without JSX: hard to read and maintain\nReact.createElement('div', { className: 'card' }, \n  React.createElement('h1', null, 'Hello World'),\n  React.createElement('p', null, 'Welcome')\n);\n\n// With JSX: reads like the UI structure it describes\n<div className=\"card\">\n  <h1>Hello World</h1>\n  <p>Welcome</p>\n</div>\n```\nThe JSX version shows you the visual hierarchy directly. The nested `createElement` calls hide it. JSX is purely a developer experience tool — the browser never sees it. Tools like Babel, Vite, or SWC compile JSX away before your code runs.\n\n### The 4 Core Rules of JSX\n\n1. **Single Root Element** — Every component return must have one top-level element. Use a Fragment `<>...</>` to group siblings without adding a real DOM node.\n\n2. **`className` instead of `class`** — ``className` is the React DOM prop corresponding to the element class property. JSX uses React DOM naming conventions rather than raw HTML attribute spelling.\n\n3. **camelCase Attributes** — HTML attributes like `onclick` become `onClick`, `tabindex` becomes `tabIndex`, `stroke-width` becomes `strokeWidth`. This matches JavaScript's DOM property naming conventions.\n\n4. **Self-Closing Tags Required** — JSX is parsed like XML, not HTML. In HTML, `<img src=\"...\" >` is valid. In JSX, every tag must be explicitly closed: `<img src=\"...\" />`.\n\n### Challenge\n**Challenge:** The code has three JSX errors: a missing root wrapper, a `class` attribute, and an unclosed `<img>` tag. Fix all three.\n\n### Hints\n* Wrap the content in `<>...</>` (a Fragment) to satisfy the single root rule without adding a real `<div>`.\n* In JSX, CSS classes go on `className`, not `class`.\n* Every self-closing tag needs a `/` before the `>`: `<img ... />`.\n\n**Solution:**\nReturn one valid JSX tree, use `className` for CSS classes, close every element, and place JavaScript expressions inside braces. When the value needs statements or multiple steps, calculate it before the return instead of placing statements inside JSX.\n\n\n### Example\n```jsx\nexport default function ProfileCard() {\n  const name = \"Ada Lovelace\";\n  const tags = [\"math\", \"computing\"];\n\n  return (\n    <>\n      <h1 className=\"heading\" tabIndex={0}>{name}</h1>\n      <p>Interests: {tags.join(\", \")}</p>\n      <img src=\"https://picsum.photos/seed/reactlab/120\" alt={name} />\n    </>\n  );\n}\n```\n",
      "starterCode": "export default function App() {\n  return (\n    <div>\n      <h1 class=\"heading\">Hello React!</h1>\n      <p>This is my first component.</p>\n      <img src=\"https://picsum.photos/200\">\n    </div>\n  )\n}\n",
      "solutionCode": "export default function App() {\n  return (\n    <>\n      <h1 className=\"heading\">Hello React!</h1>\n      <p>This is my first component.</p>\n      <img src=\"https://picsum.photos/200\" />\n    </>\n  );\n}",
      "exampleWalkthrough": {
        "code": "export default function ProfileCard() {\n  const name = \"Ada Lovelace\";\n  const tags = [\"math\", \"computing\"];\n\n  return (\n    <>\n      <h1 className=\"heading\" tabIndex={0}>{name}</h1>\n      <p>Interests: {tags.join(\", \")}</p>\n      <img src=\"https://picsum.photos/seed/reactlab/120\" alt={name} />\n    </>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              1,
              12
            ],
            "description": "A React component is a JavaScript function that starts with a capital letter and returns JSX. When React meets `<ProfileCard />` it calls this function and uses the returned value to build the DOM.\n\nCapitalisation is not optional: lowercase `<profileCard />` would be treated as an unknown HTML element, not as your component.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6,
              10
            ],
            "description": "**Rule 1 — a single root element.** A `return` statement produces one value, so JSX must too. `<>...</>` is a Fragment: it groups the three siblings without adding a wrapper `<div>` to the real DOM.\n\nWithout it, returning `<h1>`, `<p>` and `<img>` side by side would be three values where one is expected — a syntax error.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7
            ],
            "description": "**Rule 2 — `className`, not `class`.** JSX uses React DOM property names rather than raw HTML attribute spelling.\n\n**Rule 3 — camelCase attributes.** `tabindex` becomes `tabIndex`, `onclick` becomes `onClick`, `stroke-width` becomes `strokeWidth`. Same DOM property naming convention JavaScript already uses.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              9
            ],
            "description": "**Rule 4 — every tag closes.** JSX is parsed like XML, not HTML. `<img src=\"...\">` is valid HTML but a parse error in JSX; it has to be `<img src=\"...\" />`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7,
              8
            ],
            "description": "Curly braces drop a JavaScript expression into JSX. `{name}` reads a variable and `{tags.join(\", \")}` runs a method call — any expression works, because this is JavaScript, not a template language.\n\nThe exact text output on the screen will be:\n`Ada Lovelace`\n`Interests: math, computing`\n`[Image: Ada Lovelace]`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "export default function App() {\n  return (\n    <>\n      <h1 className=\"heading\">Hello React!</h1>\n      <p>This is my first component.</p>\n      <img src=\"https://picsum.photos/200\" />\n    </>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3,
              7
            ],
            "description": "The Fragment `<>...</>` is the fix for the missing root element. It compiles to `_jsx(Fragment, { children: [...] })` — a React internal that groups children without creating any real DOM node. Your rendered HTML will contain the `<h1>`, `<p>`, and `<img>` directly, with no extra wrapper `<div>`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              4
            ],
            "description": "`class` → `className`. This change exists because JSX is compiled to JavaScript, and `class` is a reserved JavaScript keyword (for ES6 class syntax). The compiler would choke on `class=`. React chose `className` because that's the name of the corresponding DOM property: `element.className`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6
            ],
            "description": "The `<img>` tag gets a self-closing slash. JSX uses an XML parser which requires explicit close signals. The browser's HTML parser is lenient and infers closing tags — JSX's compiler is not.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              4,
              5,
              6
            ],
            "description": "The component now compiles and renders.\n\nThe exact text output on the screen will be:\n`Hello React!`\n`This is my first component.`\n`[Image]`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "What is JSX actually compiled into?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// What you write:\nconst element = <h1 className=\"title\">Hello!</h1>;\n\n// What the compiler produces (React 17+ JSX transform):\nimport { jsx as _jsx } from 'react/jsx-runtime';\nconst element = _jsx('h1', { className: 'title', children: 'Hello!' });\n\n// The result is a plain JS object:\n// { type: 'h1', props: { className: 'title', children: 'Hello!' }, ... }",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "JSX is a syntactic shorthand — the browser never sees it. Vite, Babel, or SWC transform every JSX expression into a `_jsx()` call before your code reaches the browser."
              },
              {
                "highlightLines": [
                  6,
                  9
                ],
                "description": "`_jsx()` returns a plain JavaScript object a React element: a JavaScript value describing the UI. React uses element values as input to rendering and reconciliation; JSX itself never reaches the browser. JSX → objects → diff → real DOM mutations."
              }
            ]
          }
        },
        {
          "title": "Why can't I use `class` in JSX?",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ SyntaxError — 'class' is reserved in JavaScript\n<div class=\"container\">\n\n// ✅ Correct — className maps to element.className\n<div className=\"container\">",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "JSX compiles to JavaScript. `className` is the JSX prop React DOM uses for the element class property. Do not model this as a special React ban on the JavaScript keyword; it is primarily a DOM/JSX property naming convention."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "`className` is the name of the actual DOM property that represents an element's CSS class. `element.className = 'container'` is valid JavaScript — `element.class` is not. React chose `className` to match the DOM API directly."
              }
            ]
          }
        },
        {
          "title": "Can I define a component inside another component?",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ EXTREMELY bad — Child is redefined on every render\nfunction Parent() {\n  function Child() {   // New function reference every render!\n    return <div>Hello</div>;\n  }\n  return <Child />;\n}\n\n// ✅ Correct — Child is defined once at module level\nfunction Child() {\n  return <div>Hello</div>;\n}\nfunction Parent() {\n  return <Child />;\n}",
            "steps": [
              {
                "highlightLines": [
                  3,
                  4,
                  5
                ],
                "description": "Every time `Parent` renders, JavaScript creates a *brand new* `Child` function object in memory. Even if the function body is identical, it's a different function reference on each render."
              },
              {
                "highlightLines": [
                  6
                ],
                "description": "React uses the component function's identity (its memory reference) to track which components exist in the tree. When `<Child />` is rendered, React checks: 'Is this the same component as last time?' A new function reference means React answers 'No' — it tears down the entire old Child DOM and rebuilds it from scratch. State inside Child is destroyed on every render. Always define components at the module level."
              }
            ]
          }
        },
        {
          "title": "Why must all JSX tags be self-closed?",
          "type": "misconception",
          "walkthrough": {
            "code": "// HTML parser: lenient, infers closing\n<img src=\"logo.png\">\n<input type=\"text\">\n\n// JSX parser: strict XML rules, explicit close required\n<img src=\"logo.png\" />\n<input type=\"text\" />",
            "steps": [
              {
                "highlightLines": [
                  2,
                  3
                ],
                "description": "Browsers contain an extremely lenient HTML5 parser that infers closing tags based on the HTML spec's content model rules. `<img>` is a 'void element' — the browser knows it can't have children so it closes it automatically."
              },
              {
                "highlightLines": [
                  6,
                  7
                ],
                "description": "The JSX parser used by Babel/Vite doesn't have the HTML spec built in — it uses simpler XML parsing rules. In XML, every tag must be explicitly closed. This is actually a feature: it catches mismatched tags at compile time, before any code runs."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "components",
      "title": "Components & Reusability",
      "content": "\n# Components & Composition\n\n### What is it?\n**Building on JSX:** A React component is a JavaScript function that starts with a **Capital Letter** and returns JSX. Components are the fundamental unit of UI in React — you build complex interfaces by nesting small, focused components inside larger ones.\n\n> 💡 **Mental Model:** Think of components like LEGO bricks. A single brick (component) is simple and reusable. You can connect multiple bricks in different configurations to build anything from a small car to a large castle. The brick itself doesn't change — only how you compose them does.\n\n### Why does React use components this way?\nComponents solve the fundamental problem of code duplication in UI. Without them, if you need a button in 50 different places, you write 50 copies of button HTML. Change the button style once? Update 50 places. With a `<Button />` component, you write it once and change it once. Composition — putting components inside other components — is how you build arbitrarily complex UIs from simple, testable pieces.\n\n### How?\n1. Write a JavaScript function. Name it with a **Capital Letter**.\n2. Return JSX from it.\n3. Use it like an HTML tag anywhere in JSX: `<MyComponent />`.\n\n### ⚠️ The Capital Letter Rule\nThis isn't optional. JSX uses capitalization to distinguish user-defined components from HTML elements:\n- `<button>` → React renders an HTML `<button>` element.\n- `<Button>` → React calls your `Button` function and renders what it returns.\n\nLowercase `<button>` with a capital-B function defined as `button` will silently render nothing useful.\n\n### When NOT to extract a component\nDon't create a new component just because something is visually distinct. Create a component when:\n- The same JSX is repeated 2+ times.\n- A section becomes too large to reason about easily.\n- A section has its own independent state or behavior.\n\n### Challenge\n**Challenge:** The `App` component has duplicated profile markup. Extract a reusable `UserProfile` component that accepts `name` and `role` props, then use it in `App` with different data for each person.\n\n### Hints\n* `function UserProfile({ name, role }) { ... }` — destructure props in the parameter list.\n* Inside the component, use `{name}` and `{role}` where the hardcoded text currently is.\n* In `App`, render `<UserProfile name=\"Jane Doe\" role=\"Software Engineer\" />`.\n\n**Solution:**\nExtract the repeated or independently responsible UI into a component. Pass the changing data as props, keep the component focused on one responsibility, and compose it from the parent instead of duplicating its markup.\n\n\n### Example\n```jsx\nfunction Button({ label }) {\n  return <button className=\"btn\">{label}</button>;\n}\n\nexport default function ActionPanel() {\n  return (\n    <div>\n      <Button label=\"Save\" />\n      <Button label=\"Cancel\" />\n    </div>\n  );\n}\n```\n",
      "starterCode": "export default function App() {\n  return (\n    <div className=\"app-container\">\n      <h1>Our Team</h1>\n      \n      <div className=\"profile\">\n        <img src=\"https://picsum.photos/id/10/50/50\" style={{ borderRadius: '50%' }} />\n        <h3>Jane Doe</h3>\n        <p>Software Engineer</p>\n      </div>\n\n      <div className=\"profile\">\n        <img src=\"https://picsum.photos/id/20/50/50\" style={{ borderRadius: '50%' }} />\n        <h3>John Smith</h3>\n        <p>Product Manager</p>\n      </div>\n    </div>\n  );\n}\n",
      "solutionCode": "function UserProfile({ name, role }) {\n  return (\n    <div className=\"profile\">\n      <h3>{name}</h3>\n      <p>{role}</p>\n    </div>\n  );\n}\n\nexport default function App() {\n  return (\n    <div className=\"app-container\">\n      <h1>Our Team</h1>\n      <UserProfile name=\"Jane Doe\" role=\"Software Engineer\" />\n      <UserProfile name=\"John Smith\" role=\"Product Manager\" />\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "function Button({ label }) {\n  return <button className=\"btn\">{label}</button>;\n}\n\nexport default function ActionPanel() {\n  return (\n    <div>\n      <Button label=\"Save\" />\n      <Button label=\"Cancel\" />\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              1,
              2,
              3
            ],
            "description": "`Button` is a component — a regular JavaScript function returning JSX. It accepts one prop: `label`. The function has no knowledge of where it will be used — it just knows what it needs (`label`) and what it produces (a `<button>`).\n\nThis is the core of reusability: the component's logic is encapsulated. Callers don't need to know how `Button` renders its label — they just pass data.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              5,
              6,
              7,
              10,
              11
            ],
            "description": "`ActionPanel` is the parent component — it composes the UI by using `Button`. This is **composition**: combining small, focused components to build larger structures. `ActionPanel` doesn't care how `Button` renders — it only cares about the result.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              8,
              9
            ],
            "description": "Two `<Button />` instances with different `label` props. React calls the `Button` function once for each instance, passing a different props object each time: `{ label: 'Save' }` and `{ label: 'Cancel' }`. The two resulting DOM nodes are completely independent.\n\nThe exact text output on the screen will be:\n`[Button: Save]`\n`[Button: Cancel]`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "function UserProfile({ name, role }) {\n  return (\n    <div className=\"profile\">\n      <h3>{name}</h3>\n      <p>{role}</p>\n    </div>\n  );\n}\n\nexport default function App() {\n  return (\n    <div className=\"app-container\">\n      <h1>Our Team</h1>\n      <UserProfile name=\"Jane Doe\" role=\"Software Engineer\" />\n      <UserProfile name=\"John Smith\" role=\"Product Manager\" />\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              1,
              2,
              3,
              4,
              5,
              6,
              7
            ],
            "description": "We extract the repeated profile markup into a `UserProfile` function. The hardcoded strings are replaced with `{name}` and `{role}` — variables injected from the parent via props.\n\nThis component is now a template. It doesn't know or care who it's displaying — it just renders whatever it receives.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              14
            ],
            "description": "In `App`, we render the first `<UserProfile />` with Jane's data. React calls `UserProfile({ name: 'Jane Doe', role: 'Software Engineer' })` and places the result in the component tree at this position.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              15
            ],
            "description": "A second `<UserProfile />` with John's data. Same function, different input, different output. The two component instances are completely independent — they have separate positions in React's tree and, if they had state, separate state slots.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              12,
              13,
              14,
              15,
              16
            ],
            "description": "The component tree renders cleanly. Two instances of one component, two different people.\n\nThe exact text output on the screen will be:\n`Our Team`\n`Jane Doe`\n`Software Engineer`\n`John Smith`\n`Product Manager`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why does calling a component as a function break hooks?",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ Anti-pattern: calling component as a function\nfunction Parent() {\n  return <div>{Child()}</div>; // Hooks inside Child attach to Parent!\n}\n\n// ✅ Correct: use JSX syntax\nfunction Parent() {\n  return <div><Child /></div>; // Child has its own isolated hook slot\n}",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "When you write `{Child()}`, JavaScript executes `Child` as a plain function call inside `Parent`'s render. Any hooks inside `Child` (like `useState`) are registered in `Parent`'s hook list — not in a separate slot. This corrupts the hook call order, causes hooks-related errors, and breaks React's ability to track state separately for `Child`."
              },
              {
                "highlightLines": [
                  8
                ],
                "description": "JSX syntax `<Child />` tells React to create a separate node in its Fiber tree for `Child`. React manages `Child`'s hooks, state, and lifecycle completely independently of `Parent`. This is the correct mental model: each `<Component />` is a distinct living entity with its own private state."
              }
            ]
          }
        },
        {
          "title": "Why does capitalization determine what React renders?",
          "type": "misconception",
          "walkthrough": {
            "code": "// JSX compilation shows the difference:\n\n// Lowercase → passes a STRING to _jsx\n<div>  →  _jsx('div', {})\n\n// Uppercase → passes the FUNCTION REFERENCE to _jsx\n<Div>  →  _jsx(Div, {})",
            "steps": [
              {
                "highlightLines": [
                  4
                ],
                "description": "When JSX sees a lowercase tag, the compiler passes the tag name as a **string** literal to `_jsx`. React then uses `document.createElement('div')` — a native browser API call."
              },
              {
                "highlightLines": [
                  7
                ],
                "description": "When JSX sees a capitalized tag, the compiler passes the **function reference** itself to `_jsx`. React then calls that function and uses its return value as the rendered output. Capitalization is how the compiler decides string vs. reference — it's not a convention, it's a rule built into the JSX transform."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "props",
      "title": "Props (Passing Data)",
      "content": "\n# Props (Passing Data)\n\n### What is it?\n**Building on components:** Components are most useful when they render dynamic data. **Props** (properties) are the mechanism for passing data from a parent component down to a child component — React's one-way data highway.\n\n> 💡 **Mental Model:** Props are like function arguments, but for components. Just as `Math.max(3, 7)` passes `3` and `7` into the function, `<UserCard name=\"Alice\" age={25} />` passes `name` and `age` into the `UserCard` component. The component receives them as an object and uses them to produce output.\n\n### Why are props one-way (parent to child only)?\nThis is a deliberate architectural choice called **unidirectional data flow**. Data flows down; events flow up. This makes your app predictable: if a component displays wrong data, you know exactly where to look — *upward* to whatever renders it. In two-way data binding (like Angular's old approach), any component could change any data, making bugs far harder to trace.\n\n### Props are read-only\n**You must never modify props inside a component.** If you need to change a value, the parent must own the state and pass a setter function down as a prop.\n\n```javascript\nfunction UserCard({ age }) {\n  age = age + 1; // ❌ Never do this — React may warn or silently break\n}\n```\n\n### Passing non-string values\nStrings can be passed without `{}`. Everything else — numbers, booleans, objects, arrays, functions — must be wrapped in `{}`:\n```jsx\n<UserCard name=\"Alice\" age={25} isAdmin={true} onClick={handleClick} />\n```\n\n### Challenge\n**Challenge:** `UserProfile` is hardcoded and renders the same data every time. Add `name` and `role` props to it, replace the hardcoded strings with those props, then pass different values from `App`.\n\n### Hints\n* Add `{ name = 'Unknown', role = 'Member' }` to the function parameter — the defaults kick in if a prop isn't passed.\n* Inside the JSX, swap hardcoded strings for `{name}` and `{role}`.\n* Pass props like HTML attributes: `<UserProfile name=\"Jane Doe\" role=\"Software Engineer\" />`.\n\n**Solution:**\nKeep the value owned by the parent, pass the current value down as a prop, and pass a callback such as `onRemove(id)` when the child needs to request a change. The parent performs the state update and renders the new value back down.\n\n\n### Example\n```jsx\nfunction WelcomeMessage({ name, role }) {\n  return <h2>Hello {name}, you are a {role}!</h2>;\n}\n\nexport default function App() {\n  return <WelcomeMessage name=\"Alice\" role=\"Developer\" />;\n}\n```\n",
      "starterCode": "function UserProfile() {\n  return (\n    <div className=\"profile\">\n      <h3>Jane Doe</h3>\n      <p>Software Engineer</p>\n    </div>\n  );\n}\n\nexport default function App() {\n  return (\n    <div className=\"app-container\">\n      <h1>Our Team</h1>\n      <UserProfile />\n      <UserProfile />\n    </div>\n  );\n}\n",
      "solutionCode": "function UserProfile({ name = 'Unknown', role = 'Member' }) {\n  return (\n    <div className=\"profile\">\n      <h3>{name}</h3>\n      <p>{role}</p>\n    </div>\n  );\n}\n\nexport default function App() {\n  return (\n    <div className=\"container\">\n      <h2>Team Roster</h2>\n      <UserProfile name=\"Jane Doe\" role=\"Software Engineer\" />\n      <UserProfile name=\"John Smith\" role=\"System Admin\" />\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "function WelcomeMessage({ name, role }) {\n  return <h2>Hello {name}, you are a {role}!</h2>;\n}\n\nexport default function App() {\n  return <WelcomeMessage name=\"Alice\" role=\"Developer\" />;\n}",
        "steps": [
          {
            "highlightLines": [
              5,
              6
            ],
            "description": "The parent `App` renders `<WelcomeMessage name=\"Alice\" role=\"Developer\" />`. React collects the JSX attributes into a props object: `{ name: 'Alice', role: 'Developer' }`, then passes that object as the first argument when calling `WelcomeMessage`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              1
            ],
            "description": "`WelcomeMessage` receives the props object. By destructuring `{ name, role }` in the parameter list, we immediately extract the two values we need — no `props.name` needed. This is identical to: `const { name, role } = props;`",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              2
            ],
            "description": "The JSX embeds the prop values using `{name}` and `{role}`. React evaluates both expressions and produces the final string.\n\nThe exact text output on the screen will be:\n`Hello Alice, you are a Developer!`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "function UserProfile({ name = 'Unknown', role = 'Member' }) {\n  return (\n    <div className=\"profile\">\n      <h3>{name}</h3>\n      <p>{role}</p>\n    </div>\n  );\n}\n\nexport default function App() {\n  return (\n    <div className=\"container\">\n      <h2>Team Roster</h2>\n      <UserProfile name=\"Jane Doe\" role=\"Software Engineer\" />\n      <UserProfile name=\"John Smith\" role=\"System Admin\" />\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              1
            ],
            "description": "We add `{ name = 'Unknown', role = 'Member' }` to the parameter list. This does two things: **destructuring** (extracting `name` and `role` from the props object) and **default values** (if a parent renders `<UserProfile />` without passing `name`, it automatically defaults to `'Unknown'` instead of being `undefined`).",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              4,
              5
            ],
            "description": "The hardcoded `'Jane Doe'` and `'Software Engineer'` are replaced with `{name}` and `{role}`. These are JSX expression slots — React evaluates them and inserts whatever value is currently in those variables. The component is now a general-purpose template.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              13,
              14
            ],
            "description": "In `App`, each `<UserProfile />` gets different props. React calls `UserProfile({ name: 'Jane Doe', role: 'Software Engineer' })` for the first one and `UserProfile({ name: 'John Smith', role: 'System Admin' })` for the second. Two calls, two outputs, one function definition.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              11,
              12,
              13,
              14,
              15
            ],
            "description": "The component tree renders with dynamic data.\n\nThe exact text output on the screen will be:\n`Team Roster`\n`Jane Doe`\n`Software Engineer`\n`John Smith`\n`System Admin`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Props are strictly read-only — and here's why that matters",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ Never mutate props directly\nfunction UserCard({ age }) {\n  age = age + 1; // Mutating a prop is undefined behavior in React\n  return <span>{age}</span>;\n}\n\n// ✅ Derive a new value from the prop\nfunction UserCard({ age }) {\n  const displayAge = age + 1; // Create a new variable — leave prop untouched\n  return <span>{displayAge}</span>;\n}",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "Props flow from parent to child. If a child could silently modify them, the parent's state would become corrupted from below — the parent thinks it passed `age: 25`, but the value in memory is now `26`. This would make debugging nightmarish and violate React's unidirectional data flow contract."
              },
              {
                "highlightLines": [
                  9
                ],
                "description": "If you need a modified version of a prop, create a new derived variable. The prop itself stays immutable. If the data needs to change in response to user interaction, the parent must own a state variable and pass down a setter function: `<UserCard age={age} onAgeChange={setAge} />`."
              }
            ]
          }
        },
        {
          "title": "Can I pass JSX elements as props?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// The special 'children' prop — content between open and close tags\nfunction Card({ children, title }) {\n  return (\n    <div className=\"card\">\n      <h2>{title}</h2>\n      <div className=\"card-body\">{children}</div>\n    </div>\n  );\n}\n\n// Usage: anything between the tags becomes 'children'\n<Card title=\"My Profile\">\n  <img src=\"avatar.png\" />\n  <p>Hello from inside the card!</p>\n</Card>",
            "steps": [
              {
                "highlightLines": [
                  2,
                  6
                ],
                "description": "`children` is a special prop that React automatically populates with whatever JSX you put between a component's opening and closing tags. This enables a powerful pattern called **composition** — you can build layout/container components without needing to know what content they'll hold."
              },
              {
                "highlightLines": [
                  12,
                  13,
                  14,
                  15
                ],
                "description": "The `<img>` and `<p>` between `<Card>...</Card>` become `children`. React passes them as the `children` prop to the `Card` function. This is how UI libraries like Material UI, shadcn/ui, and Radix build wrapper components — `<Dialog>`, `<Card>`, `<Tooltip>` all use `children` to wrap whatever you put inside them."
              }
            ]
          }
        },
        {
          "title": "Prop drilling: when props become a problem",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Prop drilling: theme must be threaded through every level\nfunction App() {\n  const theme = 'dark';\n  return <Layout theme={theme} />;\n}\nfunction Layout({ theme }) {\n  return <Sidebar theme={theme} />; // Layout doesn't use theme!\n}\nfunction Sidebar({ theme }) {\n  return <Menu theme={theme} />; // Sidebar doesn't use theme!\n}\nfunction Menu({ theme }) {\n  return <div className={theme}>Menu</div>; // Only Menu needs it\n}",
            "steps": [
              {
                "highlightLines": [
                  7,
                  10
                ],
                "description": "Prop drilling happens when data needs to travel through several layers of components to reach a deep descendant. `Layout` and `Sidebar` don't use `theme` — they're just relay stations passing it through. Every intermediate component must declare and forward the prop, even though it doesn't care about it."
              },
              {
                "highlightLines": [
                  13
                ],
                "description": "Once you find yourself drilling props 3+ levels deep, it's time to consider Context API (`useContext`) or a state management library. These allow any component in the tree to directly access data without threading it through intermediaries."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "state",
      "title": "State with useState",
      "content": "\n# State with useState\n\n### What is it?\n**Building on JSX and props:** Props let parents pass static data down, but **state** is a component's private, changeable memory. `useState` is the hook that creates a piece of state, gives you the current value, and provides a function to update it — automatically triggering a re-render when it changes.\n\n> 💡 **Mental Model:** State is like a sticky note on the component. The note has a value written on it. When you call `setCount(1)`, you're not erasing and rewriting the current note — you're telling React: 'Next time you call this component function, hand it a new note that says 1.' React then calls the function again fresh, creating a new `const count = 1` constant. The old render's `count` is gone. Each render is a new function call, a new constant.\n\n### Why doesn't a regular `let` variable work?\n```javascript\nfunction Counter() {\n  let count = 0;          // Resets to 0 on EVERY render\n  function handleClick() {\n    count = count + 1;    // Updates the variable...\n    // ...but React doesn't know! No re-render happens.\n    // And even if it did re-render, count would reset to 0 again.\n  }\n}\n```\nNormal variables fail for two reasons:\n1. **React can't observe them.** React only re-renders when you call a state setter.\n2. **They reset on every render.** Each render invokes the component function fresh. `let count = 0` executes again, resetting the value.\n\n### The Snapshot Rule — the most important thing to understand\nWhen you call `setCount(count + 1)`, React doesn't update `count` immediately. It schedules a new render. **In the current function call, `count` remains the value it had when this render started.**\n\n```javascript\nconst [count, setCount] = useState(0);\n\nfunction handleClick() {\n  setCount(count + 1); // Schedules: next render, count = 1\n  setCount(count + 1); // Schedules: next render, count = 1 (not 2!)\n  console.log(count);  // Still 0 — this render's snapshot\n}\n```\nBoth `setCount` calls see the same `count` (0), so both schedule count = 1. To correctly increment multiple times, use the **functional update form**: `setCount(prev => prev + 1)`.\n\n### When NOT to use state\n- **Derived values:** If you can compute it from existing state, don't store it in state. `const fullName = firstName + ' ' + lastName` — not `useState`.\n- **Values that don't affect rendering:** Use `useRef` instead.\n- **Server data:** Use React Query or SWR which manage loading/error/caching automatically.\n\n### Challenge\n**Challenge:** The counter uses `let count` which resets every render and doesn't notify React of changes. Convert it to use `useState`.\n\n### Hints\n* Import `useState` from 'react'.\n* Replace `let count = 0` with `const [count, setCount] = useState(0)`.\n* In `handleClick`, call `setCount(count + 1)` instead of `count = count + 1`.\n\n**Solution:**\nUpdate state with the setter and preserve unrelated data. When the next value depends on the previous value, use the functional updater form such as `setCount(previous => previous + 1)`; for objects and arrays, create a new copy instead of mutating the old value.\n\n\n### Example\n```jsx\nimport { useState } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n    </div>\n  );\n}\n```\n",
      "starterCode": "export default function Counter() {\n  // ❌ This won't work!\n  let count = 0;\n\n  function handleClick() {\n    count = count + 1;\n    console.log(\"Count is now:\", count);\n  }\n\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Counter: {count}</h2>\n      <button onClick={handleClick}>Increment</button>\n    </div>\n  );\n}\n",
      "solutionCode": "import { useState } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n\n  function handleClick() {\n    setCount(count + 1);\n  }\n\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Counter: {count}</h2>\n      <button onClick={handleClick}>Increment</button>\n    </div>\n  );\n}\n",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              1,
              4
            ],
            "description": "`useState(0)` does two things during the first render: it creates a state slot in React's internal storage (outside the component function), and it returns `[0, setCount]`. The `0` is the initial value — used only on the very first render.\n\nCrucially, `count` is declared with `const`. You can't reassign it, and that's intentional — within this render, it's a fixed snapshot.",
            "stateSnapshot": {
              "count": 0,
              "renderPhase": "initial mount",
              "scheduledUpdate": "none"
            }
          },
          {
            "highlightLines": [
              7
            ],
            "description": "`{count}` renders the current state value. On the first render this is `0`. React reads from its internal state slot and provides it to your function.",
            "stateSnapshot": {
              "count": 0,
              "renderedUI": "\"Count: 0\""
            }
          },
          {
            "highlightLines": [
              8
            ],
            "description": "When clicked, `setCount(count + 1)` tells React: 'The state should be `1` on the next render.' React queues this update, and after the event handler finishes, re-invokes the `Counter` function. This time `useState(0)` ignores the `0` (the initial value is only used once) and returns `[1, setCount]` from the state slot. `count` is now `1`, the JSX re-renders showing `Count: 1`.\n\nThe exact text output on the screen will be:\n`Count: 0`\n`[Button: Increment]`",
            "stateSnapshot": {
              "currentCount": 0,
              "nextCount (scheduled)": 1,
              "reRenderTriggered": true
            }
          }
        ]
      },
      "walkthrough": {
        "code": "import { useState } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n\n  function handleClick() {\n    setCount(count + 1);\n  }\n\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Counter: {count}</h2>\n      <button onClick={handleClick}>Increment</button>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              1,
              4
            ],
            "description": "We add `import { useState }` and replace `let count = 0` with `const [count, setCount] = useState(0)`.\n\nThe old `let count` was a local variable that lived and died with each render. React had no connection to it. `useState` stores `count` in React's internal fiber node — it persists across renders and React monitors it.",
            "stateSnapshot": {
              "count": 0,
              "stateHolder": "React Fiber Node"
            }
          },
          {
            "highlightLines": [
              6,
              7,
              8
            ],
            "description": "We replace `count = count + 1` (which React ignores) with `setCount(count + 1)` (which React intercepts).\n\n`setCount` does three things when called: stores the new value in the fiber node, marks the component as 'needs re-render', and schedules the re-render for the next batch. Only after the event handler exits does React actually re-render.",
            "stateSnapshot": {
              "count (this render)": 0,
              "queuedState": 1,
              "renderStatus": "scheduled"
            }
          },
          {
            "highlightLines": [
              11,
              12,
              13,
              14
            ],
            "description": "The component renders. Clicking the button calls `handleClick`, which calls `setCount`, which triggers a new render with `count = 1`.\n\nThe exact text output on the screen will be:\n`Counter: 0`\n`[Button: Increment]`",
            "stateSnapshot": {
              "count": 1,
              "renderedHeader": "\"Counter: 1\""
            }
          }
        ]
      },
      "insights": [
        {
          "title": "Why does `count` still show 0 right after `setCount(1)`?",
          "type": "misconception",
          "walkthrough": {
            "code": "const [count, setCount] = useState(0);\n\nfunction handleClick() {\n  setCount(count + 1);\n  console.log(count); // 0 — not 1!\n  alert(`Count is ${count}`); // Also shows 0!\n}",
            "steps": [
              {
                "highlightLines": [
                  4
                ],
                "description": "`setCount` is not a synchronous variable assignment. It's an instruction to React's scheduler: 'Schedule a re-render with this value.' The instruction is queued — execution continues synchronously."
              },
              {
                "highlightLines": [
                  5,
                  6
                ],
                "description": "The `count` variable in the current render is a `const` — it was set when this render started and cannot change within the same call. `console.log(count)` and `alert(...)` both see the snapshot value from the beginning of this render: `0`.\n\nTo access the new value, you must wait for the next render. The `setCount` functional form `setCount(prev => prev + 1)` is how you chain multiple updates safely without reading stale values."
              }
            ]
          }
        },
        {
          "title": "State is a Snapshot: each render has its own `count`",
          "type": "misconception",
          "walkthrough": {
            "code": "// Render 1: count = 0\nfunction Counter() {\n  const count = 0; // React provides 0 from state slot\n  // onClick captures count = 0 via closure\n}\n\n// Render 2 (after setCount(1)): count = 1\nfunction Counter() {\n  const count = 1; // React provides 1 from state slot\n  // onClick captures count = 1 via closure\n}",
            "steps": [
              {
                "highlightLines": [
                  2,
                  3,
                  4
                ],
                "description": "Each render is a separate invocation of the component function. In render 1, `count` is a `const` set to `0`. Any event handlers defined in this render close over `count = 0`. Even 5 minutes later, if the user clicks a button from render 1, the handler still sees `count = 0` — it's captured in its closure."
              },
              {
                "highlightLines": [
                  8,
                  9,
                  10
                ],
                "description": "After `setCount(1)`, React calls `Counter()` again. This is a fresh invocation — `const count = 1`. New event handlers close over the new `count = 1`. The previous render's closure is gone.\n\nThis is why React state is called a 'snapshot' — each render sees a frozen picture of the state at the time it was rendered. There's no shared mutable variable — just a series of immutable snapshots."
              }
            ]
          }
        },
        {
          "title": "When to use functional update form: `setCount(prev => prev + 1)`",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ Potentially stale: reads count from closure\nfunction handleTripleClick() {\n  setCount(count + 1); // Both see count = 0\n  setCount(count + 1); // Both schedule count = 1\n  setCount(count + 1); // Net result: count becomes 1, not 3!\n}\n\n// ✅ Correct: each call gets the latest queued value\nfunction handleTripleClickFixed() {\n  setCount(prev => prev + 1); // prev = 0, schedules 1\n  setCount(prev => prev + 1); // prev = 1, schedules 2\n  setCount(prev => prev + 1); // prev = 2, schedules 3\n}",
            "steps": [
              {
                "highlightLines": [
                  3,
                  4,
                  5
                ],
                "description": "React batches multiple `setCount` calls in the same event handler. All three `setCount(count + 1)` calls see the same `count` from the current render's closure (0). They all schedule the same value (1). React deduplicates and `count` becomes 1, not 3."
              },
              {
                "highlightLines": [
                  10,
                  11,
                  12
                ],
                "description": "The functional form `setCount(prev => prev + 1)` receives the most recently queued state as `prev`. React processes the queue in order: first updater gets 0, returns 1. Second updater gets 1, returns 2. Third gets 2, returns 3. Final count: 3. Always use the functional form when the new state depends on the old state."
              }
            ]
          }
        },
        {
          "title": "Object state: why you must spread the old state",
          "type": "misconception",
          "walkthrough": {
            "code": "const [user, setUser] = useState({ name: 'Alice', age: 25 });\n\n// ❌ Replaces the ENTIRE state object — age is gone!\nsetUser({ name: 'Bob' });\nconsole.log(user); // { name: 'Bob' } — age vanished!\n\n// ✅ Spread old state first, then override specific fields\nsetUser(prev => ({ ...prev, name: 'Bob' }));\nconsole.log(user); // { name: 'Bob', age: 25 }",
            "steps": [
              {
                "highlightLines": [
                  4,
                  5
                ],
                "description": "Unlike class component `setState`, the `useState` setter **replaces** the entire state value. If your state is an object and you pass a partial object, React stores that partial object — the other fields are gone. This is the most common mistake with object state."
              },
              {
                "highlightLines": [
                  8,
                  9
                ],
                "description": "Spread `...prev` first to copy all existing fields, then override only the ones you want to change. This creates a new object (required for React to detect the change) while preserving all fields you didn't explicitly modify."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "events",
      "title": "Event Handling",
      "content": "\n# Event Handling\n\n### What is it?\n**Building on state:** We know state updates trigger re-renders, but something must *cause* those updates. **Event handlers** are functions that run in response to user actions — clicks, keystrokes, form submissions, mouse movements.\n\n> 💡 **Mental Model:** Think of React's event system like a translator standing between you and a foreign-language speaker: the browser 'speaks' its own native event dialect, and React's Synthetic Event wraps it so you get one consistent, predictable version no matter which browser is actually talking.\n\n### Why does React use synthetic event handlers?\nIn vanilla JavaScript, attaching event listeners directly with `addEventListener` requires manual cleanup (`removeEventListener`) on unmount to prevent memory leaks, and deals with cross-browser differences in event object properties. React manages event delegation at the root container level automatically, provides a normalized `SyntheticEvent` wrapper, and keeps UI logic declarative.\n\n### Core Rules & Mechanics\nReact wraps native browser events in a **Synthetic Event** layer:\n- Attribute names are **camelCase**: `onClick` not `onclick`, `onSubmit` not `onsubmit`.\n- You pass a **function reference**, not a string: `onClick={handleClick}` not `onClick=\"handleClick()\"`.\n- React normalizes cross-browser differences, so `event.target`, `event.preventDefault()`, and `event.stopPropagation()` work consistently everywhere.\n\n### The most important rule: no parentheses when passing\n```jsx\n// ✅ Pass the function reference — React will call it on click\n<button onClick={handleClick}>Save</button>;\n\n// ❌ Call the function immediately during render — fires on load!\n<button onClick={handleClick()}>Save</button>;\n```\n\n### `e.preventDefault()` — stopping default browser behavior\nHTML forms, anchor tags, and checkboxes have default browser behaviors. `e.preventDefault()` stops them:\n- `<form onSubmit>` → prevents page reload\n- `<a href>` → prevents navigation\n- `<input type=\"checkbox\">` → prevents default toggle (useful for controlled inputs)\n\n### Common Pitfalls & Gotchas\n1. **Calling the handler during render**: Passing `onClick={handleClick()}` executes the function during render instead of waiting for a click event, often causing infinite re-render loops if the handler calls `setState`.\n2. **Forgetting `preventDefault()` on form submit**: Native HTML forms submit an HTTP request and reload the page by default, wiping out all in-memory React state.\n3. **Event pooling misconceptions**: In modern React (17+ and React 19), Synthetic Events are no longer pooled, so you can safely read `event.target` in asynchronous code.\n\n### Challenge\n**Challenge:** The form currently refreshes the page when submitted (default HTML behavior). Add a `handleSubmit` function that calls `e.preventDefault()` and shows an `alert` with the current search query.\n\n### Hints\n* Create `function handleSubmit(e) { ... }` before the `return`.\n* Call `e.preventDefault()` as the first line inside it.\n* Attach it to the `<form>` with `onSubmit={handleSubmit}` — not to the button.\n\n**Solution:**\nPass a function reference to the event prop, read the event data inside the handler, and call `preventDefault()` only when the browser default action should be stopped. Keep the handler responsible for the user action rather than moving it into an Effect.\n\n\n### Example\n```jsx\nimport { useState } from 'react';\n\nexport default function ClickTracker() {\n  const [lastClick, setLastClick] = useState('nothing yet');\n\n  function handleClick(event) {\n    setLastClick(`${event.target.textContent} at x=${event.clientX}`);\n  }\n\n  return (\n    <div style={{ padding: 20 }}>\n      <button onClick={handleClick}>Left</button>\n      <button onClick={handleClick}>Right</button>\n      <button onClick={() => setLastClick('reset')}>Reset</button>\n      <p>Last: {lastClick}</p>\n    </div>\n  );\n}\n```\n",
      "starterCode": "import { useState } from 'react';\n\nexport default function SearchForm() {\n  const [query, setQuery] = useState('');\n\n  // TODO: Create a handleSubmit function here\n\n  return (\n    <form style={{ padding: 20 }}>\n      <input \n        value={query}\n        onChange={(e) => setQuery(e.target.value)}\n        placeholder=\"Search...\"\n      />\n      <button type=\"submit\">Search</button>\n    </form>\n  );\n}\n",
      "solutionCode": "import { useState } from 'react';\n\nexport default function SearchForm() {\n  const [query, setQuery] = useState('');\n\n  function handleSubmit(e) {\n    e.preventDefault();\n    alert(\"Searching for: \" + query);\n  }\n\n  return (\n    <form onSubmit={handleSubmit} style={{ padding: 20 }}>\n      <input \n        value={query}\n        onChange={(e) => setQuery(e.target.value)}\n        placeholder=\"Search...\"\n      />\n      <button type=\"submit\">Search</button>\n    </form>\n  );\n}\n",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\nexport default function ClickTracker() {\n  const [lastClick, setLastClick] = useState('nothing yet');\n\n  function handleClick(event) {\n    setLastClick(`${event.target.textContent} at x=${event.clientX}`);\n  }\n\n  return (\n    <div style={{ padding: 20 }}>\n      <button onClick={handleClick}>Left</button>\n      <button onClick={handleClick}>Right</button>\n      <button onClick={() => setLastClick('reset')}>Reset</button>\n      <p>Last: {lastClick}</p>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              6,
              7,
              8
            ],
            "description": "`handleClick` receives a **Synthetic Event** — React's wrapper around the native browser `MouseEvent`, with its properties normalised across Chrome, Firefox, Safari and Edge.\n\n`event.clientX` is the pointer's x position in the viewport; `event.target` is the exact DOM node that was clicked, which is how one handler can tell the two buttons apart.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              12,
              13
            ],
            "description": "`onClick={handleClick}` passes the **function reference**. You are not calling it here — you are telling React \"when a click happens, call this for me\". Writing `onClick={handleClick()}` would call it immediately during render and hand React the return value instead.\n\nBoth buttons share one handler. React attaches a single delegated listener at the root rather than one listener per button.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              14
            ],
            "description": "When a handler needs an argument the event does not carry, wrap it in an inline arrow: `() => setLastClick('reset')`. The arrow is the reference React stores, and it calls the setter with your value when it fires.\n\nThis creates a new function on every render. For a plain DOM button that costs nothing worth thinking about.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              4,
              15
            ],
            "description": "Each click stores a string in state, React re-renders, and the paragraph shows it.\n\nAfter clicking **Left**, the exact text output on the screen will be:\n`[Button: Left] [Button: Right] [Button: Reset]`\n`Last: Left at x=<pointer position>`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useState } from 'react';\n\nexport default function SearchForm() {\n  const [query, setQuery] = useState('');\n\n  function handleSubmit(e) {\n    e.preventDefault();\n    alert(\"Searching for: \" + query);\n  }\n\n  return (\n    <form onSubmit={handleSubmit} style={{ padding: 20 }}>\n      <input \n        value={query}\n        onChange={(e) => setQuery(e.target.value)}\n        placeholder=\"Search...\"\n      />\n      <button type=\"submit\">Search</button>\n    </form>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              6,
              7,
              8,
              9
            ],
            "description": "`handleSubmit` receives the form's Synthetic Submit Event. The very first line must be `e.preventDefault()` — without it, the browser's native form submission fires, which sends an HTTP GET request and refreshes the page, wiping all React state.\n\n`e.preventDefault()` intercepts the event before it reaches the browser's default handler, keeping the page alive and giving React full control.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              12
            ],
            "description": "We attach `handleSubmit` to the `<form>` element with `onSubmit`, not to the `<button>`. This is the correct pattern: the form's submit event fires both when the button is clicked *and* when the user presses Enter inside any input field. Attaching to the form handles both cases.",
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
              17,
              18,
              19,
              20
            ],
            "description": "The form renders. `query` state is controlled via `onChange` — every keystroke updates state, every state update re-renders the input.\n\nThe exact text output on the screen will be:\n`[Input: Search...]`\n`[Button: Search]`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why are there no parentheses on `handleClick`?",
          "type": "misconception",
          "walkthrough": {
            "code": "// ✅ CORRECT: passes the function reference\n<button onClick={handleClick}>\n\n// ❌ INCORRECT: calls the function during render!\n<button onClick={handleClick()}>",
            "steps": [
              {
                "highlightLines": [
                  5
                ],
                "description": "`handleClick()` with parentheses is a function call — JavaScript executes it immediately as JSX is being evaluated, during the render. The event listener on the button receives the *return value* of `handleClick` (probably `undefined`), not the function itself. Clicking the button later does nothing."
              },
              {
                "highlightLines": [
                  2
                ],
                "description": "`handleClick` without parentheses is a function *reference* — you're passing the function itself, like passing a variable. React stores it and calls it when the click event fires. Think of it as: 'Here is my phone number. Call me when something happens.' — not 'Call me right now.'"
              }
            ]
          }
        },
        {
          "title": "How to pass arguments to an event handler",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ Calls deleteItem immediately! (passing an argument)\n<button onClick={deleteItem(5)}>\n\n// ✅ Wraps it in an arrow function — called on click\n<button onClick={() => deleteItem(5)}>\n\n// ✅ Also works with event object available\n<button onClick={(e) => deleteItem(5, e)}>",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "If you need to pass an argument (like an ID), you can't write `onClick={deleteItem(5)}` — that calls it immediately during render. The button receives `undefined` as its click handler."
              },
              {
                "highlightLines": [
                  5,
                  8
                ],
                "description": "Wrap it in an arrow function: `() => deleteItem(5)`. The arrow function itself becomes the click handler. When clicked, the arrow function runs and calls `deleteItem(5)`. If you also need the event object, include it: `(e) => deleteItem(5, e)`."
              }
            ]
          }
        },
        {
          "title": "React's Synthetic Event system — why it's not a native event",
          "type": "did-you-know",
          "walkthrough": {
            "code": "function handleClick(e) {\n  console.log(e instanceof MouseEvent); // false!\n  console.log(e.nativeEvent instanceof MouseEvent); // true!\n  \n  // All standard properties still work:\n  e.preventDefault();\n  e.stopPropagation();\n  console.log(e.target, e.clientX, e.clientY);\n}",
            "steps": [
              {
                "highlightLines": [
                  2,
                  3
                ],
                "description": "React wraps the browser's native event in a **Synthetic Event** object. This normalized wrapper ensures that `onClick`, `onChange`, `onSubmit` work identically across all browsers. The original native event is always accessible via `e.nativeEvent` if you need browser-specific APIs."
              },
              {
                "highlightLines": [
                  6,
                  7,
                  8
                ],
                "description": "All standard event APIs work on the Synthetic Event: `preventDefault()`, `stopPropagation()`, `target`, mouse coordinates, keyboard codes. In React 17+, React stopped pooling and reusing Synthetic Event objects (an old optimization that caused confusing bugs), so you can safely store `e` in state or async callbacks."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "conditional",
      "title": "Conditional Rendering",
      "content": "\n# Conditional Rendering\n\n### What is it?\n**Building on state and props:** Now that our components hold dynamic state and receive props, we can render different UI branches depending on conditions. Conditional rendering is how React components adapt their output based on data.\n\n> \ud83d\udca1 **Mental Model:** Think of conditional rendering like a traffic light for JSX: depending on which color is lit (the condition), only one path gets shown \u2014 React never tries to render the red and green paths at once.\n\n### How React decides what to render\nJSX `{}` slots only accept **expressions** — things that produce a value. The three patterns used in React:\n\n1. **Ternary operator** — for showing one of two alternatives:\n```jsx\n{isLoggedIn ? <Dashboard /> : <LoginPage />}\n```\n\n2. **Logical AND (`&&`)** — for showing something or nothing:\n```jsx\n{isLoading && <Spinner />}\n```\n⚠️ **The zero trap:** `{count && <Badge />}` renders a literal `0` when `count === 0`. Always check `count > 0 && <Badge />`.\n\n3. **Early return** — for components with complex guard conditions:\n```jsx\nfunction Profile({ user }) {\n  if (!user) return <EmptyState />;\n  return <div>{user.name}</div>;\n}\n```\n\n### Why React unmounting is different from `display: none`\nThis is a critical distinction:\n- **`display: none`** → The component stays in the DOM, keeps its state, runs its effects, and consumes memory. It's just visually hidden.\n- **Conditional rendering** → The component is completely removed from the DOM. Its state is destroyed, effects are cleaned up, memory is freed.\n\nIf you want to preserve a component's state while hiding it, use CSS. If you want a clean reset, use conditional rendering.\n\n### Challenge\n**Challenge:** `Dashboard` currently shows both headings simultaneously. Use a ternary operator so it shows only `'Welcome back!'` when `isLoggedIn` is `true`, and only `'Please log in.'` when `false`.\n\n### Hints\n* Wrap the conditional output in a JSX expression: `{isLoggedIn ? (...) : (...)}`.\n* Remove the two hardcoded `<h1>` tags and replace them with the ternary.\n* Test with `isLoggedIn={false}` in `App` to verify the false branch.\n\n**Solution:**\nRender exactly one branch with a ternary or return early when the condition is complex. Do not use a bare numeric expression such as `count && <Badge />` when count may be zero, because React can render the zero.\n\n\n### Example\n```jsx\nimport { useState } from 'react';\n\nexport default function LoginStatus() {\n  const [isLoggedIn, setIsLoggedIn] = useState(false);\n\n  return (\n    <div style={{ padding: 20 }}>\n      {isLoggedIn ? <p>Welcome back!</p> : <p>Please log in.</p>}\n      {isLoggedIn && <button>Log out</button>}\n      <button onClick={() => setIsLoggedIn(v => !v)}>Toggle</button>\n    </div>\n  );\n}\n```\n",
      "starterCode": "export default function App() {\n  return <Dashboard isLoggedIn={false} />;\n}\n\nfunction Dashboard({ isLoggedIn }) {\n  return (\n    <div style={{ padding: 20 }}>\n      {/* TODO: Use conditional rendering here */}\n      <h1>Welcome back!</h1>\n      <h1>Please log in.</h1>\n    </div>\n  );\n}\n",
      "solutionCode": "export default function App() {\n  return <Dashboard isLoggedIn={false} />;\n}\n\nfunction Dashboard({ isLoggedIn }) {\n  return (\n    <div style={{ padding: 20 }}>\n      {isLoggedIn ? (\n        <h1>Welcome back!</h1>\n      ) : (\n        <h1>Please log in.</h1>\n      )}\n    </div>\n  );\n}\n",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\nexport default function LoginStatus() {\n  const [isLoggedIn, setIsLoggedIn] = useState(false);\n\n  return (\n    <div style={{ padding: 20 }}>\n      {isLoggedIn ? <p>Welcome back!</p> : <p>Please log in.</p>}\n      {isLoggedIn && <button>Log out</button>}\n      <button onClick={() => setIsLoggedIn(v => !v)}>Toggle</button>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              8
            ],
            "description": "The ternary `isLoggedIn ? <p>Welcome back!</p> : <p>Please log in.</p>` is a JavaScript expression. React evaluates it, receives one of the two elements, and renders that one. The other is never created.\n\nSo DOM nodes are genuinely built and destroyed as the condition changes — this is not CSS hiding one of them.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              9
            ],
            "description": "`isLoggedIn && <button>Log out</button>` is the logical AND pattern: render the button when the flag is true, render nothing when it is false. React treats `false`, `null` and `undefined` as \"no output\".\n\nOne trap: `0` is falsy but is **not** ignored — `{count && <p>…</p>}` renders a literal `0` on screen when `count` is `0`. Use `count > 0 && …` when the left side is a number.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              4,
              10
            ],
            "description": "The Toggle button flips the flag, so you can watch both branches swap in the preview rather than reading about them.\n\nStarting state is `false`, so the exact text output on the screen will be:\n`Please log in.`\n`[Button: Toggle]`\n\nAfter one click:\n`Welcome back!`\n`[Button: Log out] [Button: Toggle]`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "export default function App() {\n  return <Dashboard isLoggedIn={false} />;\n}\n\nfunction Dashboard({ isLoggedIn }) {\n  return (\n    <div style={{ padding: 20 }}>\n      {isLoggedIn ? (\n        <h1>Welcome back!</h1>\n      ) : (\n        <h1>Please log in.</h1>\n      )}\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              2,
              6
            ],
            "description": "`App` passes `isLoggedIn={false}` to `Dashboard`. This is a boolean value (not a string), so it requires `{}` brackets. `isLoggedIn=\"false\"` would pass the *string* `'false'`, which is truthy in JavaScript and would render the wrong branch.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              8,
              9,
              10,
              11,
              12
            ],
            "description": "Inside `Dashboard`, we remove the two hardcoded `<h1>` tags and replace them with a single ternary. React evaluates `isLoggedIn` (which is `false`), skips the first branch, and renders the second `<h1>`.\n\nThe important detail: the first `<h1>` is not hidden — it was never created. No DOM node for it exists. This is fundamentally different from `display: none`.",
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
            "description": "Since `isLoggedIn` is `false`, it renders the fallback branch.\n\nThe exact text output on the screen will be:\n`Please log in.`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "The Zero Gotcha with `&&`",
          "type": "misconception",
          "walkthrough": {
            "code": "const unreadMessages = 0;\n\n// ❌ Renders a visible '0' on the page!\nreturn <div>{unreadMessages && <Badge />}</div>;\n\n// ✅ Explicit boolean check — renders nothing when 0\nreturn <div>{unreadMessages > 0 && <Badge />}</div>;\n\n// ✅ Alternative: ternary with null\nreturn <div>{unreadMessages > 0 ? <Badge count={unreadMessages} /> : null}</div>;",
            "steps": [
              {
                "highlightLines": [
                  4
                ],
                "description": "JavaScript's `&&` operator returns one of its operands, not necessarily a boolean. `0 && <Badge />` evaluates to `0` because `0` is falsy — the `&&` short-circuits and returns the left operand. React receives the number `0` and renders it as the text node `'0'`. You'll see a mysterious zero on your page."
              },
              {
                "highlightLines": [
                  7,
                  10
                ],
                "description": "`unreadMessages > 0` always produces `true` or `false`. `false && <Badge />` returns `false`, which React renders as nothing. Safe regardless of the value.\n\nThis zero gotcha affects any numeric value, including `items.length`. Always use an explicit boolean check with numbers."
              }
            ]
          }
        },
        {
          "title": "Why `display:none` and conditional rendering are completely different",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// CSS hiding: component stays alive in memory\n<div style={{ display: show ? 'block' : 'none' }}>\n  <ExpensiveChart /> {/* Still mounted, running effects, consuming memory */}\n</div>\n\n// React conditional rendering: component is destroyed\n{show && <ExpensiveChart />} {/* Unmounted: effects cleaned up, state reset */}",
            "steps": [
              {
                "highlightLines": [
                  2,
                  3
                ],
                "description": "CSS `display: none` makes an element invisible but it remains fully alive in the DOM. If `ExpensiveChart` fetches data or runs a `setInterval`, it keeps running. Its state (zoom level, selected data point) is preserved. This is useful when you want to preserve state across hide/show cycles (like tab panels)."
              },
              {
                "highlightLines": [
                  7
                ],
                "description": "React conditional rendering unmounts the component entirely when the condition is false. Its DOM nodes are removed, `useEffect` cleanups run, state is discarded. When it mounts again, it starts fresh. Use this when you want a clean reset, need to free memory, or want effects to stop running while hidden."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "lists-and-keys",
      "title": "Rendering Lists & Keys",
      "content": "\n# Rendering Lists & Keys\n\n### What is it?\n**Building on components, array methods, and state:** When you need to render a list of items from an array, you transform each item into a JSX element using `.map()`. React requires a unique, stable **`key`** prop on each root element returned from the `.map()` callback.\n\n> 💡 **Mental Model:** Keys are like name badges at a conference. When the event coordinator (React) needs to update the seating arrangement (DOM), they scan name badges to identify who moved, who's new, and who left — instead of re-interviewing everyone. Without name badges, they'd have to assume everyone in seat 3 is the same person as whoever was in seat 3 last time — which breaks down as soon as anyone moves.\n\n### Why does React need keys?\nDuring reconciliation (React's diffing algorithm), React compares the previous virtual DOM tree to the new one. For lists, it uses the **position + key** heuristic:\n- If an item has the same key at a different position → React moves the DOM node.\n- If an item has a key that didn't exist before → React creates a new DOM node.\n- If a key disappears → React destroys the DOM node.\n\nWithout keys, React falls back to comparing by position only. If you delete item 0 from `[A, B, C]`, React thinks the new list `[B, C]` means item 0 changed from A to B, and item 1 changed from B to C — rather than understanding that A was deleted. This causes wrong state to be shown in the wrong row.\n\n### ⚠️ Why array index as key is dangerous\n```jsx\n{items.map((item, index) => <li key={index}>{item}</li>)}\n```\nIf you delete the first item, every subsequent item's index shifts. `index 1` now refers to what was `index 2`. React reuses DOM nodes that correspond to the old `index 1` — which may still have stale state (like a checked checkbox) from the deleted item. Always use a stable, unique identifier from your data.\n\n### When it's safe to use index as key\nOnly when all three are true:\n1. The list is never reordered, filtered, or sorted.\n2. Items are never deleted from the middle.\n3. Items have no independent state.\n\n### Challenge\n**Challenge:** The `TodoList` uses array index as the key. Try checking a checkbox and clicking Delete — the checked state stays on the wrong item! Fix this by using `item.id` as the key.\n\n### Hints\n* Change `key={index}` to `key={item.id}`.\n* You can also remove `index` from the `.map()` parameters entirely since you no longer need it.\n* The `item.id` values (`'t1'`, `'t2'`, `'t3'`) are stable strings — they don't change when items are deleted.\n\n**Solution:**\nRender the list with a stable item identifier such as `key={item.id}`. The key must describe identity across renders, not the current array position; this prevents local row state from moving to another item after insertions or deletions.\n\n\n### Example\n```jsx\nconst items = [{ id: 1, name: 'Apple' }, { id: 2, name: 'Banana' }];\n\nexport default function ShoppingList() {\n  return (\n    <ul>\n      {items.map(item => (\n        <li key={item.id}>{item.name}</li>\n      ))}\n    </ul>\n  );\n}\n```\n",
      "starterCode": "import { useState } from 'react';\n\nconst initialTodos = [\n  { id: 't1', text: 'Learn React' },\n  { id: 't2', text: 'Learn Vite' },\n  { id: 't3', text: 'Build an app' }\n];\n\nexport default function TodoList() {\n  const [todos, setTodos] = useState(initialTodos);\n\n  const deleteTodo = (idToDelete) => {\n    setTodos(todos.filter(t => t.id !== idToDelete));\n  };\n\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Todo List</h2>\n      <ul style={{ listStyle: 'none', padding: 0 }}>\n        {todos.map((item, index) => (\n          // 👉 Change this key prop!\n          <li key={index} style={{ padding: '8px 0', display: 'flex', gap: 8 }}>\n            <input type=\"checkbox\" />\n            <span>{item.text}</span>\n            <button onClick={() => deleteTodo(item.id)}>Delete</button>\n          </li>\n        ))}\n      </ul>\n    </div>\n  );\n}",
      "solutionCode": "import { useState } from 'react';\n\nconst initialTodos = [\n  { id: 't1', text: 'Learn React' },\n  { id: 't2', text: 'Learn Vite' },\n  { id: 't3', text: 'Build an app' }\n];\n\nexport default function TodoList() {\n  const [todos, setTodos] = useState(initialTodos);\n\n  const deleteTodo = (idToDelete) => {\n    setTodos(todos.filter(t => t.id !== idToDelete));\n  };\n\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Todo List</h2>\n      <ul style={{ listStyle: 'none', padding: 0 }}>\n        {todos.map((item) => (\n          <li key={item.id} style={{ padding: '8px 0', display: 'flex', gap: 8 }}>\n            <input type=\"checkbox\" />\n            <span>{item.text}</span>\n            <button onClick={() => deleteTodo(item.id)}>Delete</button>\n          </li>\n        ))}\n      </ul>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "const items = [{ id: 1, name: 'Apple' }, { id: 2, name: 'Banana' }];\n\nexport default function ShoppingList() {\n  return (\n    <ul>\n      {items.map(item => (\n        <li key={item.id}>{item.name}</li>\n      ))}\n    </ul>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              1
            ],
            "description": "The data array uses object IDs (`1`, `2`) that come from the data source. These are stable — they don't change when the list is reordered or filtered. This is the kind of identifier that makes a good `key`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6,
              7,
              8
            ],
            "description": "`.map()` transforms each data object into a JSX element. `key={item.id}` is attached to the outermost element returned from the callback — the `<li>`.\n\nReact stores this key internally in the Fiber node. On the next render, it compares the new list of keys to the previous list. If a key moves position, React moves the DOM node. If a key disappears, React unmounts that node and runs its cleanup. The `key` is never passed to your component as a prop — it's purely for React's internal tracking.\n\nThe exact text output on the screen will be:\n`• Apple`\n`• Banana`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useState } from 'react';\n\nconst initialTodos = [\n  { id: 't1', text: 'Learn React' },\n  { id: 't2', text: 'Learn Vite' },\n  { id: 't3', text: 'Build an app' }\n];\n\nexport default function TodoList() {\n  const [todos, setTodos] = useState(initialTodos);\n\n  const deleteTodo = (idToDelete) => {\n    setTodos(todos.filter(t => t.id !== idToDelete));\n  };\n\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Todo List</h2>\n      <ul style={{ listStyle: 'none', padding: 0 }}>\n        {todos.map((item) => (\n          <li key={item.id} style={{ padding: '8px 0', display: 'flex', gap: 8 }}>\n            <input type=\"checkbox\" />\n            <span>{item.text}</span>\n            <button onClick={() => deleteTodo(item.id)}>Delete</button>\n          </li>\n        ))}\n      </ul>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              20
            ],
            "description": "The bug: `key={index}` means that after deleting the first item (`t1`), the remaining items shift: `t2` moves to position 0, `t3` to position 1. React sees the keys `0, 1, 2` → `0, 1`. It thinks: 'Item at position 0 still exists — reuse its DOM node.' The DOM node for `t1` (potentially with a checked checkbox) is reused for `t2`'s data. The checkbox state doesn't belong to the data — it belongs to the DOM node — so it follows the wrong item.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              21
            ],
            "description": "Changing to `key={item.id}` anchors each DOM node to its data ID (`'t1'`, `'t2'`, `'t3'`). When `t1` is deleted, React sees that the key `'t1'` no longer exists in the list — it destroys that specific DOM node (including its checkbox state). `t2` and `t3` retain their DOM nodes intact. The checkbox that was on `t1` is gone with `t1`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              21,
              22,
              23,
              24,
              25
            ],
            "description": "The component renders correctly. Each todo item has its own stable DOM node anchored by ID.\n\nThe exact text output on the screen will be:\n`Todo List`\n`[Checkbox] Learn React [Button: Delete]`\n`[Checkbox] Learn Vite [Button: Delete]`\n`[Checkbox] Build an app [Button: Delete]`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why can't I use `Math.random()` as a key?",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ Generates a new random key on EVERY render\nitems.map(item => (\n  <li key={Math.random()}>{item.name}</li>\n));",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "`Math.random()` generates a different number on every render. React sees all-new keys every time the component re-renders (even for reasons unrelated to the list, like a parent state update). It concludes the entire list was replaced and rebuilds all DOM nodes from scratch."
              },
              {
                "highlightLines": [
                  3
                ],
                "description": "This destroys all component state inside list items, kills animations mid-flight, refocuses inputs, and creates a full DOM teardown on every render. It's arguably worse than no key at all. Use data-derived IDs or, if your data has no IDs, generate them *once* when the data is created — not during render."
              }
            ]
          }
        },
        {
          "title": "Where exactly does the `key` prop go?",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ INCORRECT — key is on the inner component, not the outermost element\nitems.map(item => (\n  <div>\n    <UserCard key={item.id} />\n  </div>\n));\n\n// ✅ CORRECT — key is on the outermost element returned by .map()\nitems.map(item => (\n  <div key={item.id}>\n    <UserCard />\n  </div>\n));",
            "steps": [
              {
                "highlightLines": [
                  4
                ],
                "description": "The `key` must be on the **outermost element returned from the `.map()` callback**. React tracks list items by what your callback returns — the first element it sees from each iteration."
              },
              {
                "highlightLines": [
                  10
                ],
                "description": "If your callback returns a `<div>` wrapping a `<UserCard>`, React tracks the `<div>` — put the `key` on the `<div>`. Putting `key` on the inner `<UserCard>` means the outer `<div>` has no key — React falls back to position-based tracking for the `<div>`, defeating the purpose."
              }
            ]
          }
        },
        {
          "title": "The `key` prop is never accessible inside the component",
          "type": "misconception",
          "walkthrough": {
            "code": "function ListItem({ id, key, text }) {\n  console.log(key); // undefined — always!\n  return <li>{text}</li>;\n}\n\n// Usage\nitems.map(item => <ListItem key={item.id} id={item.id} text={item.text} />);",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "`key` is a special reserved prop consumed exclusively by React's reconciler. It is never passed into your component's `props` object — `props.key` is always `undefined`."
              },
              {
                "highlightLines": [
                  7
                ],
                "description": "If you need the item's ID inside the component (e.g., to pass to a delete handler), pass it as a separate prop: `id={item.id}`. The `key` and `id` are separate — `key` is for React, `id` is for your component."
              }
            ]
          }
        }
      ]
    }
  ]
};
