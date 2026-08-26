export default {
  "id": "js-fundamentals",
  "title": "JS Fundamentals",
  "description": "Refresh essential JavaScript concepts before diving deeper into React.",
  "icon": "Terminal",
  "lessons": [
    {
      "id": "js-variables",
      "title": "Variables & Scope",
      "content": "\n# Variables & Scope\n\n### What is it?\nIn modern JavaScript, **`const`** and **`let`** are block-scoped variable declarations that replaced the legacy `var` keyword.\n* **`const`**: The variable identifier cannot be **reassigned** to point to a different value. (The value itself can still be mutated — see the Insights below.)\n* **`let`**: Can be reassigned, but is strictly contained within its enclosing block `{ ... }`. It doesn't leak out.\n\n> 💡 **Mental Model:** Think of `const` as writing something on a whiteboard with a permanent marker. You can erase and redraw what's *on* the whiteboard (mutate properties), but you can't swap it for a different whiteboard (reassign). `let` is a pencil on the same whiteboard — you can erase and rewrite the whole thing. `var` is a whiteboard with no wall to attach to — it floats up to whatever room it's in (the function), causing chaos.\n\n### Why does JavaScript work this way?\nThe old `var` keyword is **function-scoped** and gets **hoisted**. This means a `var` declared inside an `if` block is actually accessible *everywhere* in the enclosing function — even before the line it's declared on. This caused a notorious category of bugs, especially in loops:\n```javascript\n// With var: i is ONE shared variable. By the time any setTimeout fires, the loop is done and i === 3.\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100); // Logs: 3, 3, 3\n}\n\n// With let: each loop iteration creates a BRAND NEW binding for j.\nfor (let j = 0; j < 3; j++) {\n  setTimeout(() => console.log(j), 100); // Logs: 0, 1, 2\n}\n```\n`let` and `const` fix this by respecting block boundaries — the `{}` braces become meaningful walls.\n\n### How?\n1. **Default to `const` for everything.** If ESLint or TypeScript complains, switch to `let`.\n2. Use **`let`** only when you genuinely need to reassign (loop counters, accumulator patterns).\n3. **Never use `var`** in modern React code.\n\n### 🔗 React Connection\nIn React you will almost never write `let` inside a component body. Here's why:\n```javascript\nconst [count, setCount] = useState(0);\n```\nThe `count` variable is declared with `const`. You aren't *reassigning* it — React destroys the current function call and invokes it again fresh on the next render, creating a *new* `const count` with the updated value. The old `count` constant is simply discarded. State updates are function calls, not variable mutations.\n\n### Syntax/Example\n```javascript\n// const prevents variable reassignment\nconst MAX_USERS = 100;\n\n// let permits reassignment within its block\nlet currentUser = \"Alice\";\ncurrentUser = \"Bob\";\n```\n\n### Example\n```jsx\nexport default function VariableExample() {\n  const title = \"Const cannot be reassigned\";\n  let counter = 0;\n  \n  // We can reassign let:\n  counter = 5;\n  \n  return (\n    <div>\n      <h2>{title}</h2>\n      <p>Count is: {counter}</p> \n    </div>\n  );\n}\n```\n\n### Challenge\n**Challenge:** The component below uses `const` where it should use `let` (because the value is reassigned), and uses `var` where it should use `let` (causing scope leakage). Fix both issues so the component runs without errors and follows correct scoping.\n\n### Hints\n* If a variable's value is reassigned anywhere in the code, it cannot be `const`.\n* `var` inside an `if (true) {}` block **shares** scope with the outer variable of the same name — change it to `let` to create a separate block-scoped binding.\n* The inner `let role` will shadow the outer `let role` safely — they live in different scope blocks.\n\n**Solution:**\nUse `const` for bindings that should not be reassigned and `let` only when the binding itself must change. Keep the variable in the smallest scope that needs it, and remember that a `const` object can still have mutable properties—immutability is a separate decision.\n",
      "starterCode": "export default function UserProfile() {\n  const username = \"ReactLearner\";\n  // We want to update the username, so const is wrong here!\n  username = \"ReactPro\";\n  \n  var role = \"Admin\";\n  if (true) {\n    var role = \"User\"; // This overwrites the outer 'role' due to var scoping!\n  }\n\n  return (\n    <div>\n      <h2>{username}</h2>\n      <p>Role: {role}</p>\n    </div>\n  );\n}",
      "solutionCode": "export default function UserProfile() {\n  let username = \"ReactLearner\";\n  username = \"ReactPro\";\n  \n  let role = \"Admin\";\n  if (true) {\n    let role = \"User\"; // Block scoped, doesn't affect outer role\n  }\n\n  return (\n    <div>\n      <h2>{username}</h2>\n      <p>Role: {role}</p>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "export default function VariableExample() {\n  const title = \"Const cannot be reassigned\";\n  let counter = 0;\n  \n  // We can reassign let:\n  counter = 5;\n  \n  return (\n    <div>\n      <h2>{title}</h2>\n      <p>Count is: {counter}</p> \n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              2,
              3
            ],
            "description": "`title` is declared with `const` because it will never change — it's just a display label. `counter` is declared with `let` because we intend to reassign it on the very next line.\n\nChoosing `const` vs `let` isn't just style — it communicates your intent to every developer who reads this code.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6
            ],
            "description": "Because `counter` was declared with `let`, the reassignment `counter = 5` works perfectly. If we had written `const counter = 0`, JavaScript would throw a `TypeError: Assignment to constant variable` and the whole component would crash before rendering.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              9,
              10,
              11,
              12
            ],
            "description": "The component renders both values to the screen.\n\nThe exact text output on the screen will be:\n`Const cannot be reassigned`\n`Count is: 5`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "export default function UserProfile() {\n  let username = \"ReactLearner\";\n  username = \"ReactPro\";\n  \n  let role = \"Admin\";\n  if (true) {\n    let role = \"User\"; // Block scoped, doesn't affect outer role\n  }\n\n  return (\n    <div>\n      <h2>{username}</h2>\n      <p>Role: {role}</p>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              2,
              3
            ],
            "description": "The `username` variable is immediately reassigned from `'ReactLearner'` to `'ReactPro'`. Since we're reassigning the variable itself (not just mutating its contents), `const` is illegal here — only `let` allows reassignment.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              5,
              6,
              7,
              8
            ],
            "description": "This is the critical block scoping fix. Both `var role` declarations shared the same function scope — the inner one silently *overwrote* the outer one. Every `var` became one variable.\n\nBy changing both to `let`, the inner `let role = 'User'` lives exclusively inside the `if {}` block. The outer `let role = 'Admin'` is a completely separate variable in a different scope. The `if` block closes, and `role` outside still holds `'Admin'`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10,
              11,
              12,
              13
            ],
            "description": "The component renders. Because the inner `let role` was block-scoped, the outer `role` still holds `'Admin'`.\n\nThe exact text output on the screen will be:\n`ReactPro`\n`Role: Admin`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Wait, isn't `const` supposed to be completely unchangeable?",
          "type": "misconception",
          "walkthrough": {
            "code": "const user = { name: 'Alice' };\nuser.name = 'Bob'; // Perfectly legal!\n\nconst items = [1, 2, 3];\nitems.push(4);    // Also legal!\n\nconsole.log(user.name); // 'Bob'\nconsole.log(items);     // [1, 2, 3, 4]",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "`const` only prevents **reassignment** — you cannot point `user` at a different object. But JavaScript objects and arrays are stored by reference, and `const` only locks the reference itself, not the object that reference points to. You are free to mutate the object's internal properties."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "This is why, in React, you must treat state as immutable *by convention*, not because JavaScript enforces it. `const todos = [...]` followed by `todos.push(newItem)` will mutate the array in memory without React knowing — and the UI will silently not update. Always create a new array: `setTodos([...todos, newItem])`."
              }
            ]
          }
        },
        {
          "title": "The Temporal Dead Zone (TDZ): Why accessing `let` before its declaration crashes",
          "type": "misconception",
          "walkthrough": {
            "code": "console.log(myVar); // undefined (not a crash!)\nvar myVar = 1;\n\nconsole.log(myLet); // ReferenceError: Cannot access before initialization\nlet myLet = 2;",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2
                ],
                "description": "`var` is **hoisted** to the top of its enclosing function. JavaScript secretly creates the variable before any code runs, but sets its value to `undefined`. So reading it before its declaration gives you `undefined` instead of crashing — a silent bug factory."
              },
              {
                "highlightLines": [
                  4,
                  5
                ],
                "description": "`let` and `const` are also technically hoisted, but they enter a **Temporal Dead Zone (TDZ)** from the start of the block until the actual declaration line. Accessing them in the TDZ throws a hard `ReferenceError`. This is intentional — it forces you to declare variables before using them, catching a whole class of bugs at runtime."
              }
            ]
          }
        },
        {
          "title": "The Classic Loop Closure Bug: var vs let",
          "type": "did-you-know",
          "walkthrough": {
            "code": "for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}\n// Logs: 3, 3, 3\n\nfor (let j = 0; j < 3; j++) {\n  setTimeout(() => console.log(j), 100);\n}\n// Logs: 0, 1, 2",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2,
                  3
                ],
                "description": "With `var`, there is exactly **one** `i` variable for the entire loop. All three arrow functions inside `setTimeout` capture the same `i` via closure. By the time any timer fires (100ms later), the loop has already finished and `i` has been incremented to `3`. Every function sees `3`."
              },
              {
                "highlightLines": [
                  6,
                  7,
                  8
                ],
                "description": "With `let`, each iteration of the loop creates a **brand new, independent** `j` binding. Each arrow function closes over its own unique `j`. When the timers fire, each function sees its own private snapshot: 0, 1, or 2. This is the power of block scoping."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "js-arrow-functions",
      "title": "Arrow Functions",
      "content": "\n# Arrow Functions\n\n### What is it?\nArrow functions (`() => expression`) are a concise syntax for writing function expressions. They have two important differences from regular functions: a **shorter syntax**, and **no `this` binding of their own** (they inherit `this` from the surrounding lexical scope).\n\n> \ud83d\udca1 **Mental Model:** Think of a regular function like an employee who checks the badge of whoever is currently in the room (whatever calls them decides their `this`), while an arrow function is an employee who always carries their own permanent badge from home, no matter which room they walk into.\n\n### Why does JavaScript work this way?\nIn the early days of JavaScript, the `this` keyword was a constant source of confusion because its value depended entirely on *how* a function was called, not where it was defined. This made it nearly impossible to use inside callbacks. Arrow functions solve this permanently by capturing `this` at the point of definition — they never have their own.\n\n### How?\n1. Replace `function(args) { return expr; }` with `(args) => expr` (implicit return for single expressions).\n2. For multi-line bodies, keep the `{}` and explicit `return`.\n3. **Critical trap:** When implicitly returning an **object literal**, wrap it in parentheses `() => ({ id: 1 })` — otherwise `{}` is parsed as a function body block, returning `undefined`.\n\n### 🔗 React Connection\nEvery event handler you write in React will be an arrow function:\n```jsx\n<button onClick={() => setCount(c => c + 1)}>Increment</button>\n```\nArrow functions work here for three reasons:\n1. **No `this` needed** — React functional components don't use `this` at all.\n2. **Inline readability** — short arrow functions keep the event binding and the action on the same line.\n3. **Closures** — the arrow function closes over `count` and `setCount`, so it always has access to the current render's values.\n\nCompare how unreadable the old syntax is:\n```jsx\n// Old syntax in class components\n<button onClick={function () { this.setState({ count: this.state.count + 1 }); }}>\n  Increment\n</button>\n```\n\n### Syntax/Example\n```javascript\n// Traditional function\nconst addTraditional = function(a, b) {\n  return a + b;\n};\n\n// Arrow function with implicit return\nconst addArrow = (a, b) => a + b;\n\n// Implicit object return (requires parentheses)\nconst makeUser = (name) => ({ name, active: true });\n```\n\n### Challenge\n**Challenge:** The code below uses old-style `function` expressions for a helper and an event handler. Refactor both to use modern arrow function syntax. The helper `formatName` should use an implicit return.\n\n### Hints\n* Remove the `function` keyword and add `=>` after the parameters.\n* For an implicit return, remove the `{}` braces and the `return` keyword entirely.\n* An inline `onClick` arrow function looks like `onClick={() => alert('...')}`.\n\n**Solution:**\nRewrite the function as an arrow function with the same parameters. Use an implicit return for a single expression, and add parentheses around an object literal so JavaScript does not interpret the braces as a function body.\n\n\n### Example\n```jsx\nexport default function ArrowExample() {\n  const formatName = (first, last) => `${first} ${last}`;\n  \n  return (\n    <div>\n      <h2>{formatName(\"Jane\", \"Doe\")}</h2>\n      <button onClick={() => alert(\"Hello!\")}>Say Hello</button>\n    </div>\n  );\n}\n```\n",
      "starterCode": "const formatName = function(firstName, lastName) {\n  return firstName + \" \" + lastName;\n};\n\nexport default function WelcomeBanner() {\n  return (\n    <div>\n      <h1>Welcome, {formatName(\"John\", \"Doe\")}!</h1>\n      <button onClick={function() { alert(\"Clicked!\"); }}>\n        Click me\n      </button>\n    </div>\n  );\n}",
      "solutionCode": "const formatName = (firstName, lastName) => firstName + \" \" + lastName;\n\nexport default function WelcomeBanner() {\n  return (\n    <div>\n      <h1>Welcome, {formatName(\"John\", \"Doe\")}!</h1>\n      <button onClick={() => alert(\"Clicked!\")}>\n        Click me\n      </button>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "export default function ArrowExample() {\n  const formatName = (first, last) => `${first} ${last}`;\n  \n  return (\n    <div>\n      <h2>{formatName(\"Jane\", \"Doe\")}</h2>\n      <button onClick={() => alert(\"Hello!\")}>Say Hello</button>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              2
            ],
            "description": "`formatName` uses an **implicit return** — no `{}` braces, no `return` keyword. When an arrow function body is a single expression, JavaScript automatically returns whatever that expression evaluates to. This is one of the most common patterns in React: transforming props into display strings.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7
            ],
            "description": "The `onClick` handler is an inline arrow function `() => alert('Hello!')`. It has zero parameters because we don't need the click event object here. React stores this function reference and calls it later when the user clicks — the arrow function creates a closure over any variables in scope at the time it's defined.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              5,
              8
            ],
            "description": "The component renders. `formatName('Jane', 'Doe')` is called during render and returns `'Jane Doe'`.\n\nThe exact text output on the screen will be:\n`Jane Doe`\n`[Button: Say Hello]`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "const formatName = (firstName, lastName) => firstName + \" \" + lastName;\n\nexport default function WelcomeBanner() {\n  return (\n    <div>\n      <h1>Welcome, {formatName(\"John\", \"Doe\")}!</h1>\n      <button onClick={() => alert(\"Clicked!\")}>\n        Click me\n      </button>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              1
            ],
            "description": "We convert `formatName` to an arrow function with an implicit return. The old code was: `function(firstName, lastName) { return firstName + ' ' + lastName; }`. The new code is: `(firstName, lastName) => firstName + ' ' + lastName`.\n\nSame behavior, zero boilerplate. The expression after `=>` is the return value.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7
            ],
            "description": "The `onClick` handler changes from `function() { alert('Clicked!'); }` to `() => alert('Clicked!')`. Since `alert(...)` is a single expression, the implicit return form works perfectly. React treats both identically — but the arrow form is shorter and more readable in JSX attributes.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6,
              8,
              9
            ],
            "description": "The component renders cleanly.\n\nThe exact text output on the screen will be:\n`Welcome, John Doe!`\n`[Button: Click me]`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why is my arrow function returning `undefined`?",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ INCORRECT — JS thinks {} is a function body!\nconst getUser = () => { name: 'Alice' };\nconsole.log(getUser()); // undefined\n\n// ✅ CORRECT — Parentheses tell JS it's an object\nconst getUser = () => ({ name: 'Alice' });\nconsole.log(getUser()); // { name: 'Alice' }",
            "steps": [
              {
                "highlightLines": [
                  2,
                  3
                ],
                "description": "JavaScript's parser sees `=> {` and immediately assumes the `{}` is the start of a function body block, not an object literal. The label `name: 'Alice'` inside is legal JavaScript syntax (a label followed by a string), so it doesn't throw — it just returns `undefined` because there's no `return` statement. This is a completely silent bug."
              },
              {
                "highlightLines": [
                  6,
                  7
                ],
                "description": "Wrapping the object in parentheses `({ ... })` forces the parser to treat the `{}` as an expression (an object literal) rather than a statement (a block). You'll write this constantly in React when using `.map()` with an arrow function that returns JSX or objects:\n```jsx\nitems.map(item => ({ id: item.id, label: item.name }))\n```"
              }
            ]
          }
        },
        {
          "title": "Arrow functions and `this`: why React components don't need `.bind(this)`",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Old class component — manual binding required\nclass Button extends React.Component {\n  constructor() {\n    super();\n    this.handleClick = this.handleClick.bind(this); // Painful!\n  }\n  handleClick() {\n    console.log(this.state.count); // 'this' only works because of .bind()\n  }\n}\n\n// Modern function component — no 'this' at all\nfunction Button() {\n  const [count, setCount] = useState(0);\n  const handleClick = () => setCount(c => c + 1); // Just works!\n}",
            "steps": [
              {
                "highlightLines": [
                  4,
                  5,
                  6,
                  7,
                  8
                ],
                "description": "In class components, every event handler that accessed `this.state` or `this.setState` had to be manually bound in the constructor, otherwise `this` would be `undefined` when the event fired. This was one of the most common sources of beginner bugs in React's early years."
              },
              {
                "highlightLines": [
                  14,
                  15
                ],
                "description": "In function components, there is no `this` at all. Arrow functions capture variables from their closure — `count` and `setCount` are just regular variables in scope. This is why modern React code is dramatically simpler to write and reason about."
              }
            ]
          }
        },
        {
          "title": "The Implicit Object Return Trap in Array Methods",
          "type": "misconception",
          "walkthrough": {
            "code": "const users = [{ id: 1, name: 'Alice' }];\n\n// ❌ Returns [undefined] — {} is parsed as a function body\nconst ids = users.map(u => { id: u.id });\n\n// ✅ Returns [{ id: 1 }] — () forces object expression\nconst ids = users.map(u => ({ id: u.id }));",
            "steps": [
              {
                "highlightLines": [
                  4
                ],
                "description": "This exact mistake comes up constantly in React when building lists. `users.map(u => { id: u.id })` looks like it should create `{ id: 1 }` objects — but the `{}` is parsed as a function body, so the arrow function runs without returning anything."
              },
              {
                "highlightLines": [
                  7
                ],
                "description": "Adding `()` around the object literal `({ id: u.id })` fixes it. This is the correct pattern whenever you want to `.map()` an array into an array of objects. You'll see this frequently in React when transforming API data."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "js-template-literals",
      "title": "Template Literals",
      "content": "\n# Template Literals\n\n### What is it?\nTemplate literals are strings wrapped in backticks (`` ` ``) instead of quotes. They allow you to embed any JavaScript expression directly inside the string using `${expression}` syntax, and they preserve newlines.\n\n> \ud83d\udca1 **Mental Model:** Think of template literals like a fill-in-the-blank invitation card: instead of taping separate pieces of paper together to spell out a sentence (string concatenation), you write the whole sentence once and just drop values into the blanks.\n\n### Why does JavaScript work this way?\nBefore template literals, building dynamic strings required concatenation with `+`, which was brittle and hard to read — especially when mixing variables, spaces, and special characters. Template literals solve this by making the string the primary object and letting expressions flow naturally within it.\n\n### How?\nReplace `'...'` or `\"...\"` with `` `...` ``. Wherever you want a value, type `${` followed by any valid JavaScript expression, then `}`.\n\n### 🔗 React Connection\nJSX's `{expression}` syntax inside tags is the JSX equivalent of template literal `${expression}` — they both evaluate a JavaScript expression and inject the result. You'll use template literals constantly for:\n```jsx\n// Dynamic class names\n<div className={`card ${isActive ? 'card--active' : ''}`}>Card</div>;\n\n// Dynamic URLs\nfetch(`/api/users/${userId}/posts`);\n\n// Debug messages\nconsole.log(`Rendered with count: ${count}`);\n```\n\n### Syntax/Example\n```javascript\nconst name = \"World\";\n\n// Old string concatenation\nconst oldMessage = \"Hello, \" + name + \"!\"; // \"Hello, World!\"\n\n// Modern template literal\nconst newMessage = `Hello, ${name}!`; // \"Hello, World!\"\n```\n\n### Challenge\n**Challenge:** The code uses messy `+` concatenation to build the `message` string. Refactor it into a single, clean template literal.\n\n### Hints\n* Wrap the entire string in backticks `` ` ``. Remove the `+` operators and quote fragments.\n* Insert each variable using `${variableName}` exactly where it belongs in the sentence.\n* You don't need to add extra spaces around the `${}` — just write the sentence naturally.\n\n**Solution:**\nUse a template literal with backticks and interpolate expressions with `${...}`. This keeps the value readable and avoids manual string concatenation while preserving the distinction between the string and the JavaScript expression.\n\n\n### Example\n```jsx\nexport default function Greeting() {\n  const name = \"Alice\";\n  const greeting = `Hello, ${name}! Welcome to our React app.`;\n  \n  return (\n    <div>\n      <h2>{greeting}</h2>\n    </div>\n  );\n}\n```\n",
      "starterCode": "export default function Invoice() {\n  const amount = 150.00;\n  const currency = \"USD\";\n  const user = \"Jane\";\n\n  const message = \"Hello \" + user + \", your total is \" + amount + \" \" + currency + \".\";\n\n  return (\n    <div className=\"invoice\">\n      <p>{message}</p>\n    </div>\n  );\n}",
      "solutionCode": "export default function Invoice() {\n  const amount = 150.00;\n  const currency = \"USD\";\n  const user = \"Jane\";\n\n  const message = `Hello ${user}, your total is ${amount} ${currency}.`;\n\n  return (\n    <div className=\"invoice\">\n      <p>{message}</p>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "export default function Greeting() {\n  const name = \"Alice\";\n  const greeting = `Hello, ${name}! Welcome to our React app.`;\n  \n  return (\n    <div>\n      <h2>{greeting}</h2>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              2
            ],
            "description": "`name` is a plain string variable. There's nothing React-specific happening yet — this is pure JavaScript.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              3
            ],
            "description": "The backtick `` ` `` opens a template literal. `${name}` is an **interpolation slot** — JavaScript evaluates the expression inside (just `name` here, which is `'Alice'`) and splices the result into the string at that position.\n\nThe `${}` can hold any valid JS expression: `${user.firstName.toUpperCase()}`, `${price * 1.2}`, `${isAdmin ? 'Admin' : 'User'}`. The result is always converted to a string and inserted.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6,
              7
            ],
            "description": "In JSX, `{greeting}` is React's equivalent of template literal interpolation — it evaluates the expression and renders the result.\n\nThe exact text output on the screen will be:\n`Hello, Alice! Welcome to our React app.`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "export default function Invoice() {\n  const amount = 150.00;\n  const currency = \"USD\";\n  const user = \"Jane\";\n\n  const message = `Hello ${user}, your total is ${amount} ${currency}.`;\n\n  return (\n    <div className=\"invoice\">\n      <p>{message}</p>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              2,
              3,
              4
            ],
            "description": "Three variables hold our invoice data. Nothing special yet — just `const` declarations.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6
            ],
            "description": "The old code was `\"Hello \" + user + \", your total is \" + amount + \" \" + currency + \".\"` — seven string fragments joined by six `+` operators, with manually managed spaces.\n\nThe new code writes the sentence naturally and drops each variable into a `${}` slot. JavaScript evaluates `${user}` → `'Jane'`, `${amount}` → `150`, `${currency}` → `'USD'` and stitches them together at the correct positions.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              9,
              10,
              11
            ],
            "description": "The component renders the formatted string.\n\nThe exact text output on the screen will be:\n`Hello Jane, your total is 150 USD.`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Can I run full JavaScript expressions inside `${}`?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "const price = 10;\nconst tax = 0.2;\n\n// Math inside the template\nconsole.log(`Total: $${(price + price * tax).toFixed(2)}`);\n// Output: 'Total: $12.00'\n\n// Ternary inside the template\nconst label = `Status: ${isOnline ? 'Active' : 'Offline'}`;",
            "steps": [
              {
                "highlightLines": [
                  5
                ],
                "description": "The `${}` slot accepts any valid JavaScript expression — math, function calls, method chaining, ternary operators, even other template literals. `.toFixed(2)` rounds to 2 decimal places and returns a string. The `$` before `${...}` here is just a plain, literal dollar sign — only `${` triggers interpolation, so a lone `$` never needs escaping. If you ever need a literal `$` immediately followed by `{` without triggering interpolation, escape it as `\\$`, e.g. `Price: \\${100}` prints `Price: ${100}` instead of trying to evaluate `100`."
              },
              {
                "highlightLines": [
                  9
                ],
                "description": "Ternaries inside template literals are extremely common in React for building dynamic class names and attribute strings. This pattern avoids ugly string concatenation when composing conditional CSS classes."
              }
            ]
          }
        },
        {
          "title": "Multi-line strings without escape sequences",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Old way: Needs '\\n' escape sequence\nconst oldMsg = \"Line 1\\nLine 2\\nLine 3\";\n\n// Template literal: preserves actual newlines\nconst newMsg = `Line 1\nLine 2\nLine 3`;",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "With regular strings, newlines require the `\\n` escape sequence — invisible characters that are easy to forget or misplace."
              },
              {
                "highlightLines": [
                  5,
                  6,
                  7
                ],
                "description": "Template literals preserve actual newlines in your source code. This is useful for building multi-line error messages, SQL queries, or HTML strings. In React, this is less common since JSX handles multi-line markup, but it's invaluable in utility functions and tests."
              }
            ]
          }
        },
        {
          "title": "What is a Tagged Template? (How `styled-components` works)",
          "type": "did-you-know",
          "walkthrough": {
            "code": "import styled from 'styled-components';\n\n// This is a tagged template — calling a function without parentheses!\nconst Button = styled.button`\n  background: ${props => props.primary ? 'blue' : 'white'};\n  padding: 0.5rem 1rem;\n`;",
            "steps": [
              {
                "highlightLines": [
                  4
                ],
                "description": "If you place a function name directly before a template literal, JavaScript calls that function and passes it the string parts and interpolated values as separate arguments. This is called a **tagged template**."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "Libraries like `styled-components` and `graphql-tag` rely entirely on this. `styled.button` is just a function, and the template literal calls it with the CSS string. The `${props => props.primary ? 'blue' : 'white'}` slot passes an actual function — not a string — so `styled-components` can call it with component props at render time."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "js-destructuring",
      "title": "Destructuring",
      "content": "\n# Destructuring\n\n### What is it?\nDestructuring is a JavaScript syntax that lets you **unpack** values from arrays or properties from objects into distinct variables in a single line.\n\n> 💡 **Mental Model:** Destructuring is like a mail sorting machine. The object/array goes in on the right. The machine scans for specific labeled slots (for objects) or positions (for arrays) and deposits each extracted value into the matching named variable on the left. Everything else is ignored.\n\n### Why does JavaScript work this way?\nBefore destructuring, accessing nested data required repetitive dot-notation: `props.user.name`, `props.user.age`, `props.user.role`. This makes it unclear at a glance which properties a function actually uses. Destructuring makes the contract explicit — you can see exactly what data is extracted from what source.\n\n### How?\n**Object destructuring:** Use `{}` on the left. Variable names must match property names (or you can rename them).\n**Array destructuring:** Use `[]` on the left. Positions, not names, determine what you get.\n\n### 🔗 React Connection\nDestructuring is *everywhere* in React:\n```jsx\n// 1. Destructuring hook return values (array destructuring)\nconst [count, setCount] = useState(0);\n\n// 2. Destructuring props in function signature (object destructuring)\nfunction UserCard({ name, age, role = 'Member' }) {\n  return <p>{name} ({age}) - {role}</p>;\n}\n\n// 3. Destructuring API responses (object destructuring)\nconst { data, isLoading, error } = useQuery({ queryKey: ['users'] });\n\n// 4. Destructuring context values\nconst { user, signOut } = useContext(AuthContext);\n```\nEvery time you call `useState`, you're using array destructuring. The reason for the naming convention `[count, setCount]` rather than `[data, setter]` is that array destructuring lets you choose the variable names freely — `useState` just returns a 2-element array in a fixed order.\n\n### Syntax/Example\n```javascript\nconst person = { name: \"Bob\", age: 30 };\nconst colors = [\"red\", \"blue\"];\n\n// Object Destructuring\nconst { name, age } = person;\n\n// Array Destructuring\nconst [primary, secondary] = colors;\n```\n\n### Challenge\n**Challenge:** The code uses verbose dot-notation and bracket-notation to extract data from `book`. Refactor it to use object destructuring for `title` and `author`, and array destructuring for `tag1` and `tag2`.\n\n### Hints\n* For the object: `const { title, author } = book;` — the property names must match exactly.\n* For the array: `const [tag1, tag2] = book.tags;` — you're extracting from `book.tags`, not `book`.\n* Order matters in array destructuring — `tag1` gets index 0, `tag2` gets index 1.\n\n**Solution:**\nDestructure the values at the point where they are used, giving each variable a clear name. For nested or optional data, provide a safe default and keep the fallback visible rather than hiding it in a later conditional.\n\n\n### Example\n```jsx\nexport default function Profile() {\n  const user = { username: \"Alice\", level: 5 };\n  const tools = [\"React\", \"JavaScript\"];\n\n  const { username, level } = user; \n  const [firstTool, secondTool] = tools; \n\n  return (\n    <div>\n      <p>{username} is level {level}.</p>\n      <p>They use {firstTool} and {secondTool}.</p>\n    </div>\n  );\n}\n```\n",
      "starterCode": "export default function BookDetails() {\n  const book = {\n    title: \"The Great React\",\n    author: \"Code Master\",\n    tags: [\"frontend\", \"web\", \"ui\"]\n  };\n\n  const title = book.title;\n  const author = book.author;\n  const tag1 = book.tags[0];\n  const tag2 = book.tags[1];\n\n  return (\n    <div>\n      <h2>{title} by {author}</h2>\n      <p>Tags: {tag1}, {tag2}</p>\n    </div>\n  );\n}",
      "solutionCode": "export default function BookDetails() {\n  const book = {\n    title: \"The Great React\",\n    author: \"Code Master\",\n    tags: [\"frontend\", \"web\", \"ui\"]\n  };\n\n  const { title, author } = book;\n  const [tag1, tag2] = book.tags;\n\n  return (\n    <div>\n      <h2>{title} by {author}</h2>\n      <p>Tags: {tag1}, {tag2}</p>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "export default function Profile() {\n  const user = { username: \"Alice\", level: 5 };\n  const tools = [\"React\", \"JavaScript\"];\n\n  const { username, level } = user; \n  const [firstTool, secondTool] = tools; \n\n  return (\n    <div>\n      <p>{username} is level {level}.</p>\n      <p>They use {firstTool} and {secondTool}.</p>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              2,
              3
            ],
            "description": "We have a `user` object and a `tools` array. Without destructuring, accessing these would require `user.username`, `user.level`, `tools[0]`, `tools[1]`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              5
            ],
            "description": "`const { username, level } = user` is **object destructuring**. JavaScript looks inside `user` for properties named exactly `username` and `level`, extracts their values, and creates two standalone variables with those same names.\n\nThis is identical to writing:\n```javascript\nconst username = user.username;\nconst level = user.level;\n```\nbut in one line, making it immediately clear which properties you're interested in.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6
            ],
            "description": "`const [firstTool, secondTool] = tools` is **array destructuring**. Unlike objects, arrays are positional — `firstTool` gets index 0, `secondTool` gets index 1. You choose the variable names freely.\n\nThis is why `useState` works the way it does: `const [count, setCount] = useState(0)`. The hook returns a 2-element array and you name the slots whatever makes sense.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              9,
              10,
              11,
              12
            ],
            "description": "The component renders using our cleanly destructured variables.\n\nThe exact text output on the screen will be:\n`Alice is level 5.`\n`They use React and JavaScript.`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "export default function BookDetails() {\n  const book = {\n    title: \"The Great React\",\n    author: \"Code Master\",\n    tags: [\"frontend\", \"web\", \"ui\"]\n  };\n\n  const { title, author } = book;\n  const [tag1, tag2] = book.tags;\n\n  return (\n    <div>\n      <h2>{title} by {author}</h2>\n      <p>Tags: {tag1}, {tag2}</p>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              2,
              3,
              4,
              5,
              6
            ],
            "description": "Our `book` object has two string properties (`title`, `author`) and one array property (`tags`). The original code extracted these with repetitive `book.title`, `book.author`, `book.tags[0]`, `book.tags[1]`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              8
            ],
            "description": "`const { title, author } = book` replaces two lines with one. The `{}` on the left is the destructuring pattern — JavaScript looks inside the right-hand object for properties matching those names and creates local variables for them. The four old assignment lines become two lines that are self-documenting.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              9
            ],
            "description": "`const [tag1, tag2] = book.tags` replaces two more lines. Array destructuring reads the array by position: `tag1` = index 0 (`'frontend'`), `tag2` = index 1 (`'web'`). The third element `'ui'` is simply skipped.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              12,
              13,
              14
            ],
            "description": "The component renders with clean, readable variable names instead of repeated `book.tags[0]` references.\n\nThe exact text output on the screen will be:\n`The Great React by Code Master`\n`Tags: frontend, web`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "How destructuring works in function parameters (props!)",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Without destructuring: verbose\nfunction UserCard(props) {\n  return <h1>{props.name} — {props.role}</h1>;\n}\n\n// With parameter destructuring: clean and self-documenting\nfunction UserCard({ name, role = 'Member' }) {\n  return <h1>{name} — {role}</h1>;\n}",
            "steps": [
              {
                "highlightLines": [
                  2,
                  3
                ],
                "description": "Without destructuring, you must prefix every prop access with `props.`. In a component with 10 props, this becomes extremely noisy and hides which props the component actually uses."
              },
              {
                "highlightLines": [
                  7,
                  8
                ],
                "description": "Destructuring in the parameter list (`{ name, role }`) does two things at once: it extracts the values *and* documents the component's interface. You can see at a glance what data the component needs. The `= 'Member'` is a **default value** — if `role` is `undefined` (not passed by the parent), it falls back to `'Member'` automatically."
              }
            ]
          }
        },
        {
          "title": "Can I rename variables while destructuring?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// API returns ugly property names\nconst response = { u: 'Alice', a: 25, r: 'admin' };\n\n// Rename during destructuring: { originalName: newName }\nconst { u: username, a: age, r: role } = response;\n\nconsole.log(username); // 'Alice'\nconsole.log(age);      // 25",
            "steps": [
              {
                "highlightLines": [
                  5
                ],
                "description": "The `: newName` syntax renames a property during destructuring. `u: username` means: \"find the property named `u`, but create a variable named `username`\". The original property name `u` doesn't become a variable — only `username` does. This is incredibly useful when working with APIs that return abbreviated or unclear property names."
              }
            ]
          }
        },
        {
          "title": "Skipping elements in array destructuring",
          "type": "did-you-know",
          "walkthrough": {
            "code": "const rgb = [255, 128, 0];\n\n// Skip the second value (green channel)\nconst [red, , blue] = rgb;\n\nconsole.log(red);  // 255\nconsole.log(blue); // 0",
            "steps": [
              {
                "highlightLines": [
                  4
                ],
                "description": "An empty slot (just a comma with no variable name) tells destructuring to skip that position entirely. The `,,` in `[red, , blue]` skips index 1. This pattern is uncommon but appears in React when a hook returns multiple values and you only need certain ones — though it's usually cleaner to use object destructuring for that case."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "js-spread-rest",
      "title": "Spread & Rest Operators",
      "content": "\n# Spread & Rest Operators\n\n### What is it?\nBoth use three dots `...`. **Spread** unpacks elements from an array or properties from an object into another array or object. **Rest** does the opposite — it collects remaining elements into an array.\n\n> 💡 **Mental Model:** Spread is like tipping a bag of marbles onto a table — the marbles (values) spread out individually. Rest is like sweeping remaining marbles off the table back *into* a bag. Same gesture, opposite direction.\n\n### Why does JavaScript work this way?\nReact requires immutable state updates — you cannot modify an existing array or object and expect React to detect the change. You must create a **new reference**. The spread operator is the most concise and readable way to copy a structure while adding or overriding specific values.\n\n### 🔗 React Connection\nSpread is the backbone of all state updates involving objects and arrays:\n```javascript\n// Adding to an array (never use .push on state!)\nsetItems(prev => [...prev, newItem]);\n\n// Removing from an array\nsetItems(prev => prev.filter(item => item.id !== idToRemove));\n\n// Updating one field in an object (never mutate directly!)\nsetUser(prev => ({ ...prev, name: newName }));\n\n// Merging form field changes\nsetForm(prev => ({ ...prev, [e.target.name]: e.target.value }));\n```\nWithout spread, you'd have to manually copy every property before changing one — error-prone and verbose.\n\n### How?\n* **Arrays:** `[...oldArray, newItem]` creates a new array with all old items plus `newItem` at the end.\n* **Objects:** `{ ...oldObject, newProp: value }` creates a new object with all old props, plus `newProp` overriding or adding.\n* **Order matters for objects:** properties later in the spread override earlier ones of the same name.\n\n### Syntax/Example\n```javascript\nconst colors = [\"red\", \"blue\"];\nconst newColors = [...colors, \"green\"]; // [\"red\", \"blue\", \"green\"]\n\nconst user = { name: \"Ali\", age: 25 };\nconst updatedUser = { ...user, age: 26, admin: true };\n// { name: \"Ali\", age: 26, admin: true }\n```\n\n### Challenge\n**Challenge:** Replace the `.concat()` call with array spread, and replace `Object.assign()` with object spread.\n\n### Hints\n* Array spread syntax: `[...oldArray, newItem]`.\n* Object spread syntax: `{ ...oldObject, keyToOverride: newValue }`.\n* The spread always comes first in the object so the later properties can override it.\n\n**Solution:**\nUse object or array spread to create a new value that preserves the existing data, then override the field or append the item you need. Use rest parameters when a function should collect an arbitrary number of remaining arguments.\n\n\n### Example\n```jsx\nexport default function SpreadDemo() {\n  const arr1 = [1, 2];\n  const arr2 = [...arr1, 3, 4];\n\n  const user = { name: \"Ali\", age: 25 };\n  const updatedUser = { ...user, age: 26 };\n\n  const sum = (...numbers) => numbers.reduce((total, n) => total + n, 0);\n\n  return (\n    <div>\n      <p>Array: {arr2.join(\", \")}</p>\n      <p>Updated Age: {updatedUser.age}</p>\n      <p>Sum of {arr2.length} numbers: {sum(...arr2)}</p>\n    </div>\n  );\n}\n```\n",
      "starterCode": "export default function Settings() {\n  const baseColors = [\"red\", \"blue\"];\n  const allColors = baseColors.concat([\"green\"]); \n\n  const profile = { name: \"Sam\", theme: \"light\" };\n  const updatedProfile = Object.assign({}, profile, { theme: \"dark\" });\n\n  return (\n    <div>\n      <p>Colors: {allColors.join(\", \")}</p>\n      <p>Theme: {updatedProfile.theme}</p>\n    </div>\n  );\n}",
      "solutionCode": "export default function Settings() {\n  const baseColors = [\"red\", \"blue\"];\n  const allColors = [...baseColors, \"green\"];\n\n  const profile = { name: \"Sam\", theme: \"light\" };\n  const updatedProfile = { ...profile, theme: \"dark\" };\n\n  return (\n    <div>\n      <p>Colors: {allColors.join(\", \")}</p>\n      <p>Theme: {updatedProfile.theme}</p>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "export default function SpreadDemo() {\n  const arr1 = [1, 2];\n  const arr2 = [...arr1, 3, 4];\n\n  const user = { name: \"Ali\", age: 25 };\n  const updatedUser = { ...user, age: 26 };\n\n  const sum = (...numbers) => numbers.reduce((total, n) => total + n, 0);\n\n  return (\n    <div>\n      <p>Array: {arr2.join(\", \")}</p>\n      <p>Updated Age: {updatedUser.age}</p>\n      <p>Sum of {arr2.length} numbers: {sum(...arr2)}</p>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              2,
              3
            ],
            "description": "`[...arr1, 3, 4]` creates a **brand new array**. The spread unpacks `arr1`'s elements (1, 2) as if you typed them individually, then 3 and 4 are appended. `arr1` is never touched. This is crucial in React — mutating `arr1` with `push` would change it in memory without creating a new reference, so React wouldn't detect the change and the UI wouldn't update.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              5,
              6
            ],
            "description": "`{ ...user, age: 26 }` creates a **brand new object**. The spread copies all of `user`'s properties into it. Then `age: 26` is processed — since it appears *after* the spread, it overwrites the `age: 25` that was just copied. `name: 'Ali'` is preserved because we didn't override it.\n\nResult: `{ name: 'Ali', age: 26 }`. The original `user` object is completely unchanged.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              8,
              14
            ],
            "description": "The same three dots, used the other way round. In `(...numbers)` the dots are **rest**: they collect however many arguments `sum` is called with into a single array named `numbers`. In `sum(...arr2)` on line 14 they are **spread**: they unpack `arr2`'s four elements back into four separate arguments.\n\nWhich one you get depends on position, not on the syntax. Dots in a parameter list collect; dots in a call, an array literal, or an object literal spread out.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              11,
              15
            ],
            "description": "The component renders the new values.\n\nThe exact text output on the screen will be:\n`Array: 1, 2, 3, 4`\n`Updated Age: 26`\n`Sum of 4 numbers: 10`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "export default function Settings() {\n  const baseColors = [\"red\", \"blue\"];\n  const allColors = [...baseColors, \"green\"];\n\n  const profile = { name: \"Sam\", theme: \"light\" };\n  const updatedProfile = { ...profile, theme: \"dark\" };\n\n  return (\n    <div>\n      <p>Colors: {allColors.join(\", \")}</p>\n      <p>Theme: {updatedProfile.theme}</p>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              2,
              3
            ],
            "description": "`baseColors.concat(['green'])` works but is verbose. `[...baseColors, 'green']` is equivalent and more idiomatic. Both create a new array — neither mutates `baseColors`. The spread version reads naturally: 'give me everything in `baseColors`, then `green`'.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              5,
              6
            ],
            "description": "`Object.assign({}, profile, { theme: 'dark' })` was the old pattern for object copying. The spread version `{ ...profile, theme: 'dark' }` is equivalent and far more readable. The empty `{}` target that `Object.assign` required is now implicit — the `{}` is the new object being built.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              8,
              13
            ],
            "description": "The component renders with both copies applied.\n\nThe exact text output on the screen will be:\n`Colors: red, blue, green`\n`Theme: dark`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why does spreading an object with nested objects still share references?",
          "type": "misconception",
          "walkthrough": {
            "code": "const original = { a: 1, b: { c: 2 } };\nconst copy = { ...original };\n\n// Changing a top-level property is safe\ncopy.a = 99;\nconsole.log(original.a); // Still 1 ✅\n\n// Changing a nested object property affects the original!\ncopy.b.c = 99;\nconsole.log(original.b.c); // 99 ❌",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "Spread creates a **shallow copy** — it copies the top-level keys by value, but for nested objects and arrays, it copies the *reference* (the memory address), not the nested object itself. So `copy.b` and `original.b` point to the *same object in memory*."
              },
              {
                "highlightLines": [
                  9,
                  10
                ],
                "description": "Mutating `copy.b.c` mutates the shared object that both `copy.b` and `original.b` point to. This is the #1 cause of mysterious React state bugs. To fix it, you must spread nested objects too: `{ ...original, b: { ...original.b, c: 99 } }`. Each level that changes needs its own spread."
              }
            ]
          }
        },
        {
          "title": "Rest parameters: collecting 'the rest' of arguments",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Rest in function parameters\nfunction sum(first, ...rest) {\n  return first + rest.reduce((acc, n) => acc + n, 0);\n}\nsum(1, 2, 3, 4); // 10\n\n// Rest in object destructuring (common in React prop forwarding)\nfunction Button({ onClick, children, ...rest }) {\n  return <button onClick={onClick} {...rest}>{children}</button>;\n}",
            "steps": [
              {
                "highlightLines": [
                  2,
                  3
                ],
                "description": "In function parameters, `...rest` gathers all arguments after the explicitly named ones into an array. `sum(1, 2, 3, 4)` gives `first = 1` and `rest = [2, 3, 4]`. The rest parameter must always be last — you can't have parameters after `...rest`."
              },
              {
                "highlightLines": [
                  8,
                  9
                ],
                "description": "In object destructuring, `...rest` collects all remaining properties that weren't explicitly named into a new object. In React, this is the standard pattern for **prop forwarding** — you extract the props you need (`onClick`, `children`), and pass everything else (`className`, `disabled`, `aria-label`) down to the underlying DOM element using `{...rest}`."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "js-array-methods",
      "title": "Array Methods",
      "content": "\n# Array Methods (.map, .filter, .reduce)\n\n### What is it?\n`Array.prototype.map()`, `filter()`, and `reduce()` are **pure** higher-order functions that transform arrays without modifying the original.\n* **`.map(fn)`** — applies `fn` to every element and returns a new array of the same length with the results.\n* **`.filter(fn)`** — keeps only elements where `fn` returns `true`, returning a new (shorter) array.\n* **`.reduce(fn, initial)`** — accumulates all elements into a single value.\n\n> 💡 **Mental Model:** Think of `.map()` as a factory assembly line — every item on the conveyor belt (input array) goes through the same machine (your function) and comes out transformed (output array). `.filter()` is a quality inspector — some items pass, some are rejected. The line length can change.\n\n### Why does React use these instead of `for` loops?\nReact renders are **pure functions** — given the same state, they must produce the same JSX. Imperative `for` loops with `push()` are stateful and require mutation. Functional methods like `.map()` and `.filter()` return new arrays without side effects, making them safe to call during render. They're also more readable — the intent (transform, filter) is expressed in the method name itself.\n\n### 🔗 React Connection\nThese three methods are the heart of React list rendering and derived state:\n```jsx\n// Rendering a list: .map() turns data into JSX\n{users.map(user => <UserCard key={user.id} user={user} />)}\n\n// Filtering displayed items: never mutate state, derive it\nconst activeUsers = users.filter(u => u.active);\n\n// Removing an item from state: filter out by id\nsetItems(prev => prev.filter(item => item.id !== idToDelete));\n\n// Computing a total: .reduce() for aggregations\nconst total = cart.reduce((sum, item) => sum + item.price, 0);\n```\n\n### Syntax/Example\n```javascript\nconst doubled = [1, 2, 3].map(n => n * 2);     // [2, 4, 6]\nconst evens   = [1, 2, 3].filter(n => n % 2 === 0); // [2]\nconst sum     = [1, 2, 3].reduce((acc, n) => acc + n, 0); // 6\n```\n\n### Challenge\n**Challenge:** Replace the imperative `for` loop with a chained `.filter()` and `.map()` to show only active users as `<li>` elements.\n\n### Hints\n* Chain `.filter()` first to select only active users, then `.map()` to transform them into JSX.\n* `.filter()` takes a function that returns `true` (keep) or `false` (discard).\n* Don't forget `key={user.id}` on the outermost element returned from `.map()`.\n\n**Solution:**\nChoose the method that describes the intention: `map` transforms every item, `filter` keeps matching items, `find` returns one match, and `reduce` combines values. Return the new array instead of mutating the original input.\n\n\n### Example\n```jsx\nexport default function ScoreBoard() {\n  const scores = [\n    { id: 1, player: \"Ada\", points: 42 },\n    { id: 2, player: \"Linus\", points: 17 },\n    { id: 3, player: \"Grace\", points: 88 }\n  ];\n\n  const total = scores.reduce((sum, score) => sum + score.points, 0);\n\n  return (\n    <div>\n      <h2>Above 20 points</h2>\n      <ul>\n        {scores\n          .filter(score => score.points > 20)\n          .map(score => (\n            <li key={score.id}>{score.player}: {score.points}</li>\n          ))}\n      </ul>\n      <p>Total across all players: {total}</p>\n    </div>\n  );\n}\n```\n",
      "starterCode": "export default function UserList() {\n  const users = [\n    { id: 1, name: \"Alice\", active: true },\n    { id: 2, name: \"Bob\", active: false },\n    { id: 3, name: \"Charlie\", active: true }\n  ];\n\n  let elements = [];\n  for (let i = 0; i < users.length; i++) {\n    if (users[i].active) {\n      elements.push(<li key={users[i].id}>{users[i].name}</li>);\n    }\n  }\n\n  return (\n    <div>\n      <h2>Active Users</h2>\n      <ul>{elements}</ul>\n    </div>\n  );\n}",
      "solutionCode": "export default function UserList() {\n  const users = [\n    { id: 1, name: \"Alice\", active: true },\n    { id: 2, name: \"Bob\", active: false },\n    { id: 3, name: \"Charlie\", active: true }\n  ];\n\n  return (\n    <div>\n      <h2>Active Users</h2>\n      <ul>\n        {users\n          .filter(user => user.active)\n          .map(user => (\n            <li key={user.id}>{user.name}</li>\n          ))}\n      </ul>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "export default function ScoreBoard() {\n  const scores = [\n    { id: 1, player: \"Ada\", points: 42 },\n    { id: 2, player: \"Linus\", points: 17 },\n    { id: 3, player: \"Grace\", points: 88 }\n  ];\n\n  const total = scores.reduce((sum, score) => sum + score.points, 0);\n\n  return (\n    <div>\n      <h2>Above 20 points</h2>\n      <ul>\n        {scores\n          .filter(score => score.points > 20)\n          .map(score => (\n            <li key={score.id}>{score.player}: {score.points}</li>\n          ))}\n      </ul>\n      <p>Total across all players: {total}</p>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              2,
              3,
              4,
              5,
              6
            ],
            "description": "An array of objects — our raw data. In a real app this would arrive from an API and live in state. Note that each entry carries its own `id`; that matters two steps from now.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              8
            ],
            "description": "`.reduce((sum, score) => sum + score.points, 0)` collapses the whole array into a single value. `sum` starts at the initial value `0` and carries the running total from one element to the next: 0 → 42 → 59 → 147.\n\nThis is what separates `.reduce()` from the other two — `.map()` and `.filter()` always hand you back an array, while `.reduce()` returns whatever you accumulated, which here is one number.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              14,
              15,
              16,
              17,
              18
            ],
            "description": "`.filter(score => score.points > 20)` keeps only the entries whose callback returns `true`, so Ada and Grace survive and Linus on 17 does not. `.map()` then turns each survivor into a `<li>` element, and the chain ends as an array of React elements — which JSX renders directly.\n\n`key={score.id}` is required. React uses it to match array items to DOM nodes across re-renders; without it you get a warning now and real rendering bugs once the list changes.\n\nNeither method touches `scores`. Both return new arrays, which is exactly why they are safe to call during render.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              12,
              20
            ],
            "description": "React renders the filtered list, then the total underneath it.\n\nThe exact text output on the screen will be:\n`Above 20 points`\n`• Ada: 42`\n`• Grace: 88`\n`Total across all players: 147`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "export default function UserList() {\n  const users = [\n    { id: 1, name: \"Alice\", active: true },\n    { id: 2, name: \"Bob\", active: false },\n    { id: 3, name: \"Charlie\", active: true }\n  ];\n\n  return (\n    <div>\n      <h2>Active Users</h2>\n      <ul>\n        {users\n          .filter(user => user.active)\n          .map(user => (\n            <li key={user.id}>{user.name}</li>\n          ))}\n      </ul>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              2,
              3,
              4,
              5,
              6
            ],
            "description": "Three user objects with an `active` boolean flag. The old code used a `for` loop with `push()` — this requires a mutable `elements` array as a staging area, which is an imperative pattern React doesn't need.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              12,
              13
            ],
            "description": "`.filter(user => user.active)` creates a new array containing only Alice and Charlie. Bob (`active: false`) is excluded. The callback returns a boolean — `true` to keep, `false` to drop. The original `users` array is untouched.\n\nIntermediate result: `[{ id: 1, name: 'Alice' }, { id: 3, name: 'Charlie' }]`",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              14,
              15,
              16
            ],
            "description": "`.map()` is chained directly onto the filtered array. For each remaining user, we produce a `<li>` JSX element with `key={user.id}`. The `user.id` from the data (1, 3) is a stable, unique identifier — exactly what React needs to efficiently update the list.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              9,
              10,
              11,
              17,
              18,
              19
            ],
            "description": "The component renders the filtered, transformed list.\n\nThe exact text output on the screen will be:\n`Active Users`\n`• Alice`\n`• Charlie`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "`.map()` vs `.forEach()` — why React uses `.map()`",
          "type": "misconception",
          "walkthrough": {
            "code": "const items = ['a', 'b', 'c'];\n\n// forEach: returns undefined — cannot be used inside JSX\nconst result1 = items.forEach(item => <li>{item}</li>);\nconsole.log(result1); // undefined\n\n// map: returns a new array — perfect for JSX\nconst result2 = items.map(item => <li>{item}</li>);\nconsole.log(result2); // [<li>, <li>, <li>]",
            "steps": [
              {
                "highlightLines": [
                  4,
                  5
                ],
                "description": "`.forEach()` calls your function for side effects — it always returns `undefined`. If you try `{items.forEach(...)}` in JSX, React renders nothing. This is a very common beginner mistake."
              },
              {
                "highlightLines": [
                  8,
                  9
                ],
                "description": "`.map()` returns a new array containing whatever your function returned for each element. Since JSX can render arrays of React elements, `{items.map(...)}` works perfectly as a JSX expression. `.map()` is the right tool whenever you want to transform data into renderable output."
              }
            ]
          }
        },
        {
          "title": "Chaining `.filter()` before `.map()` for performance",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Less efficient: maps all 1000 items, then discards 900\nconst result = items\n  .map(item => expensiveTransform(item))\n  .filter(item => item.isValid);\n\n// More efficient: discards 900 first, then maps only 100\nconst result = items\n  .filter(item => item.isValid)\n  .map(item => expensiveTransform(item));",
            "steps": [
              {
                "highlightLines": [
                  3,
                  4
                ],
                "description": "If you `.map()` first and then `.filter()`, you run `expensiveTransform` on every single item, then throw most of the results away. This wastes computation proportional to the number of filtered-out items."
              },
              {
                "highlightLines": [
                  8,
                  9
                ],
                "description": "Filtering first discards unwanted items cheaply (no transformation cost), then maps only the survivors. Always put `.filter()` before `.map()` when your filter condition doesn't depend on the transformed data. React's render function may run frequently, so small efficiency gains compound."
              }
            ]
          }
        },
        {
          "title": "`.find()` vs `.filter()` — when you want one item vs many",
          "type": "did-you-know",
          "walkthrough": {
            "code": "const users = [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}];\n\n// find: stops at first match, returns the ITEM (or undefined)\nconst alice = users.find(u => u.id === 1);\nconsole.log(alice); // { id: 1, name: 'Alice' }\n\n// filter: scans all, returns an ARRAY of matches\nconst admins = users.filter(u => u.admin);\nconsole.log(admins); // []",
            "steps": [
              {
                "highlightLines": [
                  4,
                  5
                ],
                "description": "`.find()` returns the first matching **element** directly — not an array. It stops scanning as soon as it finds a match. Use this when looking up a specific item by ID (e.g., `selectedItem = items.find(i => i.id === selectedId)`)."
              },
              {
                "highlightLines": [
                  8,
                  9
                ],
                "description": "`.filter()` always scans the entire array and always returns an **array** — even if only one item matches, you get `[item]`, not `item`. Use `.filter()` when you expect multiple matches, or when you're building a derived list (like `activeItems`)."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "js-ternary",
      "title": "Ternary Operator",
      "content": "\n# Ternary Operator\n\n### What is it?\nThe ternary operator is JavaScript's only three-part **expression**: `condition ? valueIfTrue : valueIfFalse`. It always produces a value, which is what makes it fundamentally different from an `if` statement.\n\n> 💡 **Mental Model:** Think of the ternary as a coin flip with predetermined outcomes: you ask a yes/no question (`condition ?`), and it gives you back one of two prizes depending on the answer (`: value1 : value2`). The key word is \"gives you back\" — it's an expression, not an action.\n\n### Why does JSX require expressions, not statements?\nJSX's `{}` interpolation slots only accept **expressions** — things that evaluate to a value. An `if` statement doesn't produce a value; it *controls program flow*. That's why you can't write `{if (condition) { <A /> }}` inside JSX. The ternary operator is an expression, so it works perfectly inside `{}`.\n\n### ⚠️ The `0 && <Component />` Trap\nMany developers use `&&` for conditional rendering: `{count && <Badge />}`. **Warning:** In JavaScript, `0` is falsy. `0 && <Badge />` evaluates to `0`, and React renders the number `0` on your page!\n\nAlways use an explicit boolean check:\n```jsx\n{count > 0 && <Badge />}       // ✅ Safe\n{Boolean(count) && <Badge />}  // ✅ Safe\n{count ? <Badge /> : null}     // ✅ Most explicit\n```\n\n### 🔗 React Connection\nThe ternary is React's **primary conditional rendering tool**:\n```jsx\nfunction Example({ isLoggedIn, isActive, data }) {\n  return (\n    <>\n      {/* Show different content based on auth state */}\n      {isLoggedIn ? <Dashboard /> : <LoginPage />}\n\n      {/* Dynamic CSS classes */}\n      <div className={`btn ${isActive ? 'btn--active' : 'btn--default'}`}>Save</div>\n\n      {/* Fallback content */}\n      {data ? <DataTable data={data} /> : <EmptyState />}\n    </>\n  );\n}\n```\n\n### Syntax/Example\n```javascript\nconst score = 85;\nconst status = score >= 50 ? \"Passed\" : \"Failed\";\n```\n\n### Challenge\n**Challenge:** The component uses an `if/else` block with mutated `let` variables to set `text` and `className`. Refactor it to use inline ternary operators directly in the JSX, eliminating the `let` variables.\n\n### Hints\n* `className` can use a ternary inside a template literal: `` className={`banner ${isOnline ? 'success' : 'error'}`} ``.\n* The text content can also be a ternary: `{isOnline ? 'System Online' : 'System Offline'}`.\n\n**Solution:**\nReplace the duplicated output with one conditional expression whose true branch is the first UI and whose false branch is the second UI. Keep the condition readable; if it needs several nested branches, use an early return or extract a component.\n\n\n### Example\n```jsx\nexport default function ProfileBanner() {\n  const isLoggedIn = true;\n\n  return (\n    <div className=\"banner\">\n      {isLoggedIn ? (\n        <p>Welcome back, user!</p>\n      ) : (\n        <button>Please Login</button>\n      )}\n    </div>\n  );\n}\n```\n",
      "starterCode": "export default function StatusBanner() {\n  const isOnline = true;\n  let text;\n  let className;\n  \n  if (isOnline) {\n    text = \"System Online\";\n    className = \"success\";\n  } else {\n    text = \"System Offline\";\n    className = \"error\";\n  }\n\n  return (\n    <div className={`banner ${className}`}>\n      {text}\n    </div>\n  );\n}",
      "solutionCode": "export default function StatusBanner() {\n  const isOnline = true;\n\n  return (\n    <div className={`banner ${isOnline ? \"success\" : \"error\"}`}>\n      {isOnline ? \"System Online\" : \"System Offline\"}\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "export default function ProfileBanner() {\n  const isLoggedIn = true;\n\n  return (\n    <div className=\"banner\">\n      {isLoggedIn ? (\n        <p>Welcome back, user!</p>\n      ) : (\n        <button>Please Login</button>\n      )}\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              2
            ],
            "description": "`isLoggedIn` is a boolean. In a real app, this would come from an auth state hook: `const { isLoggedIn } = useContext(AuthContext)` or `const [isLoggedIn] = useState(false)`.",
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
            "description": "The ternary sits inside JSX's `{}` interpolation. JavaScript evaluates `isLoggedIn` (which is `true`), returns the **first expression** (the `<p>` element), and React renders it. The second expression (the `<button>`) is never evaluated or rendered.\n\nWhen `isLoggedIn` becomes `false` (e.g., after logout), React re-renders and this time renders the `<button>` instead — completely replacing the `<p>` in the DOM.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              5,
              11
            ],
            "description": "The component renders the logged-in view.\n\nThe exact text output on the screen will be:\n`Welcome back, user!`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "export default function StatusBanner() {\n  const isOnline = true;\n\n  return (\n    <div className={`banner ${isOnline ? \"success\" : \"error\"}`}>\n      {isOnline ? \"System Online\" : \"System Offline\"}\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              2
            ],
            "description": "Our condition is `isOnline`. The old code required `let text` and `let className` as staging variables, plus an `if/else` block to populate them before the `return`. This means we're using mutable state where immutable expressions would work fine.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              5
            ],
            "description": "The `className` attribute uses a template literal with an embedded ternary. `isOnline ? 'success' : 'error'` evaluates to `'success'`, so the final class string is `'banner success'`. Template literals + ternaries for dynamic class names is an extremely common React pattern.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6
            ],
            "description": "The text content is a direct ternary. Since `isOnline` is `true`, it evaluates to `'System Online'`. React renders this string as a text node inside the `<div>`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              4,
              7
            ],
            "description": "The component renders cleanly with zero `let` variables, zero `if` blocks, and zero mutation.\n\nThe exact text output on the screen will be:\n`System Online`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why can't I use `if` inside JSX?",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ SyntaxError: 'if' is a statement, not an expression\nreturn (\n  <div>\n    {if (isLoggedIn) { <Profile /> }}\n  </div>\n);\n\n// ✅ Use ternary: it's an expression that produces a value\nreturn (\n  <div>\n    {isLoggedIn ? <Profile /> : null}\n  </div>\n);",
            "steps": [
              {
                "highlightLines": [
                  4
                ],
                "description": "The `{}` slots in JSX are **expression slots** — they expect JavaScript that evaluates to a renderable value (string, number, JSX, array, `null`, `undefined`, `false`). The `if` statement doesn't produce a value — it controls which code runs. So it's syntactically illegal here."
              },
              {
                "highlightLines": [
                  10
                ],
                "description": "The ternary is an expression — it evaluates to `<Profile />` or `null`. React renders `null`, `undefined`, and `false` as nothing (they produce no DOM output), making them perfect fallback values for the 'else' branch when you don't want to render anything."
              }
            ]
          }
        },
        {
          "title": "The '0 &&' gotcha that renders a 0 on screen",
          "type": "misconception",
          "walkthrough": {
            "code": "const unreadCount = 0;\n\n// ❌ Renders the number '0' visibly on screen!\nreturn <div>{unreadCount && <Badge count={unreadCount} />}</div>;\n\n// ✅ Explicit comparison — renders nothing when 0\nreturn <div>{unreadCount > 0 && <Badge count={unreadCount} />}</div>;",
            "steps": [
              {
                "highlightLines": [
                  4
                ],
                "description": "JavaScript's `&&` operator returns one of its operands, not necessarily a boolean. `0 && <Badge />` evaluates to `0` because `0` is falsy — the `&&` short-circuits and returns the left side. React receives the number `0` and renders it as a text node. You'll see a stray `0` appear on the page."
              },
              {
                "highlightLines": [
                  7
                ],
                "description": "`unreadCount > 0` is a comparison that always produces `true` or `false`. `false && <Badge />` evaluates to `false`, which React renders as nothing. Now the condition is safe for any numeric value, including `0`."
              }
            ]
          }
        },
        {
          "title": "When to use `&&` vs ternary in React",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Use && when there's no 'else' (show or nothing)\n{isLoading && <Spinner />}\n\n// Use ternary when you have two alternatives\n{isLoading ? <Spinner /> : <DataTable data={data} />}\n\n// Use early return for complex guard clauses\nfunction Component({ data }) {\n  if (!data) return <EmptyState />;\n  return <DataTable data={data} />;\n}",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "`&&` is the shortest syntax when you only need show-or-nothing behavior. But always ensure the left side is a boolean or has been explicitly converted (using `> 0`, `Boolean()`, or `!!`)."
              },
              {
                "highlightLines": [
                  5,
                  9,
                  10,
                  11
                ],
                "description": "A ternary makes both branches explicit and readable. For complex logic with multiple conditions, an early `return` at the top of the component is often cleaner than a deeply nested ternary — it reads like a guard clause rather than a conditional expression."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "js-promises",
      "title": "Promises & async/await",
      "content": "\n# Promises & async/await\n\n### What is it?\nA **Promise** represents the eventual result of an asynchronous operation — it's either *pending*, *fulfilled* (with a value), or *rejected* (with an error). **`async/await`** is syntax sugar over Promises that lets you write async code in a synchronous, readable style.\n\n> 💡 **Mental Model:** Think of a Promise as a restaurant table buzzer. When you order food, you get a buzzer (a Promise). The kitchen is working (pending). When it's done, the buzzer goes off (fulfills) and you collect your food (the resolved value). If something burns (rejects), you're notified too. Meanwhile, you don't stand frozen at the counter — you sit down and do other things (the main thread keeps running).\n\n### Why does JavaScript work this way?\nJavaScript runs on a single thread. If a network request took 2 seconds and blocked the thread, the entire UI would freeze — no clicks, no animations, nothing. The **event loop** allows async operations to happen outside the thread. Promises provide a structured way to say \"when this operation finishes, here's what to do next\" without blocking.\n\n### How?\n1. Mark a function as `async` — it can now use `await` inside.\n2. Put `await` before any Promise-returning call — execution pauses *inside that function* (not the whole app) until the Promise resolves.\n3. Always wrap in `try/catch` or chain `.catch()` to handle errors.\n\n### 🔗 React Connection — The Critical Rule\n**`useEffect` callbacks cannot be `async`**. This is one of the most confusing rules in React. Here's why:\n\n`useEffect` expects its callback to return either `undefined` or a **cleanup function**. An `async` function *always returns a Promise* — not a cleanup function. If you make the effect callback `async`, React receives a Promise where it expected `undefined` or a function, and cleanup never runs correctly.\n\n```javascript\n// ❌ WRONG: async effect callback returns a Promise\nuseEffect(async () => {\n  const data = await fetchData();\n  setData(data);\n}, []);\n\n// ✅ CORRECT: inner async function keeps the callback synchronous\nuseEffect(() => {\n  async function loadData() {\n    const data = await fetchData();\n    setData(data);\n  }\n  loadData();\n}, []);\n```\nThis is why you'll always see this pattern in React codebases.\n\n### Syntax/Example\n```javascript\n// Old .then() chain\nfetch(url)\n  .then(response => response.json())\n  .then(data => console.log(data));\n\n// Modern async/await\nasync function getData() {\n  const response = await fetch(url);\n  const data = await response.json();\n  console.log(data);\n}\n```\n\n### Challenge\n**Challenge:** The `fetchData` function uses the old `.then()` chain. Refactor it to use `async/await` with explicit `await` on both `fetch()` and `.json()`.\n\n### Hints\n* Add `async` before `function fetchData()`.\n* Replace `.then(res => res.json()).then(data => setTodo(data.title))` with two separate `await` lines.\n* You need `await` twice: once for the network response, once for parsing JSON (both are async operations).\n\n**Solution:**\nReturn the Promise chain or use `async`/`await` inside a `try`/`catch`. Handle the rejected case explicitly, and remember that `await` pauses the asynchronous function—it does not block the browser thread.\n\n\n### Example\n```jsx\nimport { useState } from \"react\";\n\nexport default function DataDisplay() {\n  const [data, setData] = useState(\"No data yet\");\n\n  async function fetchMessage() {\n    // We simulate a fake API call with a Promise\n    const fakeResponse = await new Promise(resolve => \n      setTimeout(() => resolve(\"Hello from the server!\"), 1000)\n    );\n    setData(fakeResponse);\n  }\n\n  return (\n    <div>\n      <h2>{data}</h2>\n      <button onClick={fetchMessage}>Fetch Data</button>\n    </div>\n  );\n}\n```\n",
      "starterCode": "import { useState } from \"react\";\n\nexport default function TodoFetcher() {\n  const [todo, setTodo] = useState(null);\n\n  function fetchData() {\n    fetch('https://jsonplaceholder.typicode.com/todos/1')\n      .then(res => res.json())\n      .then(data => setTodo(data.title));\n  }\n\n  return (\n    <div>\n      <h2>Todo: {todo ? todo : \"Not loaded\"}</h2>\n      <button onClick={fetchData}>Fetch Todo</button>\n    </div>\n  );\n}",
      "solutionCode": "import { useState } from \"react\";\n\nexport default function TodoFetcher() {\n  const [todo, setTodo] = useState(null);\n\n  async function fetchData() {\n    const res = await fetch('https://jsonplaceholder.typicode.com/todos/1');\n    const data = await res.json();\n    setTodo(data.title);\n  }\n\n  return (\n    <div>\n      <h2>Todo: {todo ? todo : \"Not loaded\"}</h2>\n      <button onClick={fetchData}>Fetch Todo</button>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useState } from \"react\";\n\nexport default function DataDisplay() {\n  const [data, setData] = useState(\"No data yet\");\n\n  async function fetchMessage() {\n    // We simulate a fake API call with a Promise\n    const fakeResponse = await new Promise(resolve => \n      setTimeout(() => resolve(\"Hello from the server!\"), 1000)\n    );\n    setData(fakeResponse);\n  }\n\n  return (\n    <div>\n      <h2>{data}</h2>\n      <button onClick={fetchMessage}>Fetch Data</button>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              6
            ],
            "description": "The `async` keyword transforms this function: it can now use `await` inside, and it will always return a Promise. Passing an `async` function to `onClick` is safe because React doesn't care what event handlers return — it ignores the returned Promise.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              8,
              9,
              10
            ],
            "description": "`await` pauses execution *of this function only* — the rest of your React app keeps running, animations keep animating, and the browser remains responsive. After 1000ms, the Promise resolves with `'Hello from the server!'` and execution resumes on the next line, binding that value to `fakeResponse`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              11,
              15,
              16
            ],
            "description": "`setData(fakeResponse)` triggers a React re-render with the new value. The `<h2>` updates from `'No data yet'` to `'Hello from the server!'`.\n\nThe exact text output on the screen will be:\n`Hello from the server!`\n`[Button: Fetch Data]`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useState } from \"react\";\n\nexport default function TodoFetcher() {\n  const [todo, setTodo] = useState(null);\n\n  async function fetchData() {\n    const res = await fetch('https://jsonplaceholder.typicode.com/todos/1');\n    const data = await res.json();\n    setTodo(data.title);\n  }\n\n  return (\n    <div>\n      <h2>Todo: {todo ? todo : \"Not loaded\"}</h2>\n      <button onClick={fetchData}>Fetch Todo</button>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              6
            ],
            "description": "We add `async` to the function declaration. Without this keyword, `await` inside the function would cause a syntax error. The `async` keyword is the signal to the JavaScript engine that this function participates in the Promise system.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7
            ],
            "description": "`await fetch(url)` replaces the first `.then(res => ...)`. `fetch()` returns a Promise that resolves to a `Response` object when the network request completes. `await` unwraps that Promise and gives us the `Response` directly in `res`.\n\nThe line reads exactly like synchronous code, but JavaScript knows to pause here and resume when the network comes back.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              8
            ],
            "description": "`await res.json()` replaces the second `.then(data => ...)`. Parsing JSON from a network response is *also* asynchronous (it reads the body stream). `await` handles that Promise too, giving us the parsed JavaScript object in `data`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              9,
              14,
              15,
              16
            ],
            "description": "`setTodo(data.title)` triggers a re-render with the fetched string.\n\nThe exact text output on the screen will be:\n`Todo: delectus aut autem`\n`[Button: Fetch Todo]`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why can't `useEffect` callbacks be `async`?",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ WRONG: async callback returns a Promise — not a cleanup function!\nuseEffect(async () => {\n  const data = await fetchUser();\n  setUser(data);\n}, []);\n\n// ✅ CORRECT: keep the outer callback synchronous\nuseEffect(() => {\n  async function loadUser() {\n    const data = await fetchUser();\n    setUser(data);\n  }\n  loadUser(); // Call the async function, don't await it\n}, []);",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "React uses the return value of your `useEffect` callback as a **cleanup function** — React calls it when the component unmounts or the effect re-runs. An `async` function *always returns a Promise*, never a plain function. So React receives a Promise where it expects `undefined` or a cleanup function."
              },
              {
                "highlightLines": [
                  8,
                  9,
                  10,
                  11,
                  12,
                  13
                ],
                "description": "The fix: define an inner `async` function and call it immediately. The outer callback is synchronous (returns nothing), satisfying React's expectation. The inner async function does the work. If you need cleanup, add a flag or AbortController to prevent calling `setUser` after the component unmounts (a common race condition)."
              }
            ]
          }
        },
        {
          "title": "Race conditions: the silent danger of async data fetching in React",
          "type": "misconception",
          "walkthrough": {
            "code": "useEffect(() => {\n  let cancelled = false; // Cancellation flag\n  \n  async function load() {\n    const data = await fetchUser(userId);\n    if (!cancelled) setUser(data); // Only update if still relevant\n  }\n  load();\n  \n  return () => { cancelled = true; }; // Cleanup: mark as stale\n}, [userId]);",
            "steps": [
              {
                "highlightLines": [
                  5
                ],
                "description": "If `userId` changes quickly (user clicks through profiles rapidly), multiple fetch requests fly out simultaneously. The slowest one could return *after* a newer one, setting stale data as the current user. This is a **race condition** and it's invisible — no errors, just wrong data on screen."
              },
              {
                "highlightLines": [
                  6,
                  10
                ],
                "description": "A cancellation flag fixes this. The cleanup function sets `cancelled = true` when the component re-renders with a new `userId`. When the stale fetch returns, the `if (!cancelled)` check prevents it from calling `setUser`. The modern alternative is `AbortController` which actually cancels the network request."
              }
            ]
          }
        },
        {
          "title": "Why does `async function` always return a Promise?",
          "type": "misconception",
          "walkthrough": {
            "code": "async function getData() {\n  return 'Hello';\n}\n\nconsole.log(getData());        // Promise { 'Hello' }\nconsole.log(await getData());  // 'Hello'",
            "steps": [
              {
                "highlightLines": [
                  1,
                  5
                ],
                "description": "The `async` keyword wraps the return value in `Promise.resolve()` automatically. Even if you `return 'Hello'` (a plain string), the caller receives a Promise that resolves to `'Hello'`. This is why async functions must be called with `await` or `.then()` to access their return value."
              },
              {
                "highlightLines": [
                  6
                ],
                "description": "`await getData()` unwraps the Promise and gives you the raw string `'Hello'`. This is why the async/await pattern is so clean — you write `return value` inside async functions and read it directly with `await` on the outside, as if it were synchronous."
              }
            ]
          }
        }
      ]
    }
  ]
};
