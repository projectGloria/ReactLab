export default {
  "id": "typescript",
  "title": "TypeScript with React",
  "description": "Types for component contracts and state transitions.",
  "lessons": [
    {
      "id": "ts-props-hooks",
      "title": "Typing Props and Hooks",
      "content": "\n# Typing Props and Hooks\n\n### What is it?\n**Building on props and state:** Adding TypeScript guarantees compile-time validation for component properties, state types, and optional parameters, eliminating common runtime errors before code executes.\n\n> \ud83d\udca1 **Mental Model:** Think of a typed props interface like a shipping label with required fields: the courier (TypeScript) checks the label before the package ever leaves the building, catching a missing address (a missing prop) long before it would have failed at the doorstep (runtime).\n\n> ⚠️ **About the playground in this module.** The sandbox *transpiles* TypeScript — it strips the types and runs the JavaScript — but it does not **type-check**. Nothing in this module will underline an error for you, and a genuine type mistake will still render happily. The error messages quoted in these lessons are what your editor and `tsc` would show in a real project. Read them as the point of the exercise; the preview pane cannot produce them.\n\n### Why do we need it?\nTyping props and state explicitly ensures that you pass the right data to components and correctly handle state variables, preventing runtime errors (e.g. passing a string instead of a number, or forgetting a required prop).\n\n### How?\nDefine a `type` or `interface` for your component's props. For `useState`, provide a generic parameter if TypeScript cannot infer the type.\n\n### Syntax/Example\n```tsx\n// This defines a type for the props expected by the component\ntype UserProps = {\n  name: string;\n  age: number;\n  isStudent?: boolean; // The '?' makes this prop optional\n};\n\n// This returns a functional component strongly typed with UserProps\nfunction UserProfile({ name, age, isStudent = false }: UserProps) {\n  // This causes a type error if we try to access a non-existent prop\n  return <div>{name} is {age} years old.</div>;\n}\n```\n\n### Example\n```tsx\nimport { useState } from 'react';\n\ntype Props = {\n  name: string;\n  age?: number;\n};\n\nfunction UserProfile({ name, age }: Props) {\n  return <div>{name} is {age}</div>;\n}\n\nexport default function App() {\n  return <UserProfile name=\"John\" age={25} />;\n}\n```\n\n### Challenge and Solution\n**Challenge:** The `UserCard` component is missing types for its props and state. Add them!\n\n**Solution:** Define a `UserProps` type with `name: string`, `age: number`, and optional `email?: string`. Apply it to the `UserCard` function parameter: `function UserCard({ name, age, email }: UserProps)`. Add `useState<boolean>` for the `isExpanded` state.\n\n### Hints\n* Optional props are marked with a `?` before the colon (e.g., `email?: string`).\n* `useState<boolean>(false)` explicitly types the state as a boolean.\n",
      "starterCode": "import { useState } from 'react';\n\n// 👉 1. Define a UserProps type here\n\n// 👉 2. Apply the type to the function parameter\nfunction UserCard({ name, age, email }) {\n  // 👉 3. Add boolean generic to useState\n  const [isExpanded, setIsExpanded] = useState(false);\n\n  return (\n    <div style={{ border: '1px solid #ccc', padding: 16, borderRadius: 8 }}>\n      <h3>{name}</h3>\n      <p>Age: {age}</p>\n      <button onClick={() => setIsExpanded(e => !e)}>\n        {isExpanded ? 'Hide' : 'Show'} Details\n      </button>\n      {isExpanded && email && <p>Email: {email}</p>}\n    </div>\n  );\n}\n\nexport default function App() {\n  return (\n    <div style={{ padding: 20 }}>\n      <UserCard name=\"Alice\" age={30} email=\"alice@example.com\" />\n      <UserCard name=\"Bob\" age={25} />\n    </div>\n  );\n}",
      "solutionCode": "import { useState } from 'react';\n\ntype UserProps = {\n  name: string;\n  age: number;\n  email?: string;\n};\n\nfunction UserCard({ name, age, email }: UserProps) {\n  const [isExpanded, setIsExpanded] = useState<boolean>(false);\n\n  return (\n    <div style={{ border: '1px solid #ccc', padding: 16, borderRadius: 8 }}>\n      <h3>{name}</h3>\n      <p>Age: {age}</p>\n      <button onClick={() => setIsExpanded(e => !e)}>\n        {isExpanded ? 'Hide' : 'Show'} Details\n      </button>\n      {isExpanded && email && <p>Email: {email}</p>}\n    </div>\n  );\n}\n\nexport default function App() {\n  return (\n    <div style={{ padding: 20 }}>\n      <UserCard name=\"Alice\" age={30} email=\"alice@example.com\" />\n      <UserCard name=\"Bob\" age={25} />\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\ntype Props = {\n  name: string;\n  age?: number;\n};\n\nfunction UserProfile({ name, age }: Props) {\n  return <div>{name} is {age}</div>;\n}\n\nexport default function App() {\n  return <UserProfile name=\"John\" age={25} />;\n}",
        "steps": [
          {
            "highlightLines": [
              3,
              4,
              5,
              6
            ],
            "description": "We define a type `Props` with `name` (required) and `age` (optional).",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              8
            ],
            "description": "We apply the `Props` type to the `UserProfile` component's arguments.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              13
            ],
            "description": "When rendering `UserProfile`, TypeScript checks that we pass the required props.\n\nThe exact text output on the screen will be:\n`John is 25`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useState } from 'react';\n\ntype UserProps = {\n  name: string;\n  age: number;\n  email?: string;\n};\n\nfunction UserCard({ name, age, email }: UserProps) {\n  const [isExpanded, setIsExpanded] = useState<boolean>(false);\n\n  return (\n    <div style={{ border: '1px solid #ccc', padding: 16, borderRadius: 8 }}>\n      <h3>{name}</h3>\n      <p>Age: {age}</p>\n      <button onClick={() => setIsExpanded(e => !e)}>\n        {isExpanded ? 'Hide' : 'Show'} Details\n      </button>\n      {isExpanded && email && <p>Email: {email}</p>}\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3,
              4,
              5,
              6,
              7
            ],
            "description": "The `type` declaration describes the shape of the props object. TypeScript errors if you pass a `name` that is not a string, or forget a required prop. The `?` marks `email` as optional.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              9
            ],
            "description": "Applying the type with `: UserProps` validates every usage of this component across the entire codebase at compile time.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10
            ],
            "description": "The `useState<boolean>` generic is optional here (TypeScript infers it from `false`), but is required when the initial value is `null` or ambiguous, e.g., `useState<User | null>(null)`.\n\nThe exact text output on the screen will be:\n`Alice`\n`Age: 30`\n`[Button: Show Details]`\n`Bob`\n`Age: 25`\n`[Button: Show Details]`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Do I need to type `useState`?",
          "type": "misconception",
          "walkthrough": {
            "code": "// Unnecessary\nconst [name, setName] = useState<string>('Alice');\n\n// Required\nconst [user, setUser] = useState<User | null>(null);",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "TypeScript is incredibly smart. If you initialize state with a string like `'Alice'`, TS automatically infers that the state is a string. You don't need to specify it."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "However, if you initialize with `null` or `undefined`, TS can't guess what object will eventually be put in there. In that case, you MUST explicitly provide the type parameter."
              }
            ]
          }
        },
        {
          "title": "Why use `interface` instead of `type` for props?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "interface ButtonProps {\n  title: string;\n}\n\ntype InputProps = {\n  title: string;\n};",
            "steps": [
              {
                "highlightLines": [
                  1,
                  5
                ],
                "description": "For React props, they are 99% identical. However, `interface` has slightly better compiler performance and clearer error messages in massive codebases."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "Use `type` when you need complex unions (`'red' | 'blue'`), but stick to `interface` for standard component objects."
              }
            ]
          }
        },
        {
          "title": "How do I type the `children` prop?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "import { ReactNode } from 'react';\n\ninterface CardProps {\n  title: string;\n  children: ReactNode;\n}",
            "steps": [
              {
                "highlightLines": [
                  5
                ],
                "description": "While `JSX.Element` technically works, it's too strict (it forbids strings or arrays)."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "`ReactNode` is the universally correct type for `children`. It accepts everything React can legally render: JSX elements, strings, numbers, fragments, and arrays."
              }
            ]
          }
        },
        {
          "title": "ReactNode vs ReactElement vs JSX.Element",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// ReactNode: Accepts EVERYTHING (JSX, strings, numbers, booleans, null, fragments)\ntype ContainerProps = { children: React.ReactNode };\n\n// ReactElement: Accepts STRICTLY a single JSX tag (rejects raw text/numbers!)\ntype SlotProps = { icon: React.ReactElement };",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "Use `React.ReactNode` for almost all `children` props because it supports strings, numbers, arrays, and JSX elements."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "Use `React.ReactElement` only when you strictly require an instantiated JSX element object that can be cloned with `cloneElement`."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "ts-context-reducers",
      "title": "Typing Context and Reducers",
      "content": "\n# Typing Context and Reducers\n\n### What is it?\n**Building on useReducer and Context:** Discriminated unions make complex state transitions type-safe, guaranteeing that reducer actions and context values are handled exhaustively.\n\n> \ud83d\udca1 **Mental Model:** Think of a discriminated union like a form with a dropdown at the top that changes which fields appear below it: once you pick 'refund' instead of 'exchange', the form (TypeScript) knows exactly which fields are relevant and won't let you fill in ones that don't belong to that choice.\n\n### Why do we need it?\nThe secret to correctly-typed reducers is a **discriminated union** for the action type. It allows TypeScript to intelligently narrow down types within switch statements based on a common \"type\" field.\n\n### How?\nDefine a union type where each member has a specific literal `type` property. TypeScript uses this to infer the rest of the object.\n\n### Syntax/Example\n```tsx\n// This defines the strict shape of actions allowed in the reducer\ntype ActionType = \n  | { type: 'INCREMENT' }\n  | { type: 'DECREMENT' }\n  | { type: 'SET_COUNT'; payload: number };\n\ntype StateType = { count: number };\n\n// This defines a strictly typed reducer function\nfunction reducer(state: StateType, action: ActionType): StateType {\n  // This causes TypeScript to enforce exhaustive checking\n  switch (action.type) {\n    case 'INCREMENT': return { count: state.count + 1 };\n    case 'SET_COUNT': return { count: action.payload };\n    default: return state;\n  }\n}\n```\n\n### Example\n```tsx\nimport { useReducer } from 'react';\n\ntype Action = \n  | { type: 'increment' }\n  | { type: 'set', payload: number };\n\ntype State = { count: number };\n\nfunction reducer(state: State, action: Action) {\n  switch (action.type) {\n    case 'increment': return { count: state.count + 1 };\n    case 'set': return { count: action.payload };\n    default: return state;\n  }\n}\n\nexport default function App() {\n  const [state, dispatch] = useReducer(reducer, { count: 0 });\n  return (\n    <div>\n      Count: {state.count}\n      <button onClick={() => dispatch({ type: 'increment' })}>+</button>\n    </div>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** Add types to the provided Counter's state, actions, and reducer function.\n\n**Solution:** Define a `State` type: `{ count: number }`. Define a discriminated union `Action` type with `INCREMENT`, `DECREMENT`, and `SET` (with `payload: number`). Add parameter types and a return type to the `reducer` function (`state: State`, `action: Action`, and `: State`).\n\n### Hints\n* Notice that `INCREMENT` and `DECREMENT` actions don't have a `payload`, so they only need the `type` property in the union.\n",
      "starterCode": "import { useReducer } from 'react';\n\n// 👉 1. Define State type\n// 👉 2. Define Action discriminated union type\n\n// 👉 3. Add types to reducer parameters\nfunction reducer(state, action) {\n  switch (action.type) {\n    case 'INCREMENT': return { count: state.count + 1 };\n    case 'DECREMENT': return { count: state.count - 1 };\n    case 'SET': return { count: action.payload };\n    default: return state;\n  }\n}\n\nexport default function Counter() {\n  const [state, dispatch] = useReducer(reducer, { count: 0 });\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Count: {state.count}</h2>\n      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>\n      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>\n      <button onClick={() => dispatch({ type: 'SET', payload: 42 })}>Set to 42</button>\n    </div>\n  );\n}",
      "solutionCode": "import { useReducer } from 'react';\n\ntype State = { count: number };\n\ntype Action =\n  | { type: 'INCREMENT' }\n  | { type: 'DECREMENT' }\n  | { type: 'SET'; payload: number };\n\nfunction reducer(state: State, action: Action): State {\n  switch (action.type) {\n    case 'INCREMENT': return { count: state.count + 1 };\n    case 'DECREMENT': return { count: state.count - 1 };\n    case 'SET': return { count: action.payload };\n    default: return state;\n  }\n}\n\nexport default function Counter() {\n  const [state, dispatch] = useReducer(reducer, { count: 0 });\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Count: {state.count}</h2>\n      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>\n      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>\n      <button onClick={() => dispatch({ type: 'SET', payload: 42 })}>Set to 42</button>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useReducer } from 'react';\n\ntype Action = \n  | { type: 'increment' }\n  | { type: 'set', payload: number };\n\ntype State = { count: number };\n\nfunction reducer(state: State, action: Action) {\n  switch (action.type) {\n    case 'increment': return { count: state.count + 1 };\n    case 'set': return { count: action.payload };\n    default: return state;\n  }\n}\n\nexport default function App() {\n  const [state, dispatch] = useReducer(reducer, { count: 0 });\n  return (\n    <div>\n      Count: {state.count}\n      <button onClick={() => dispatch({ type: 'increment' })}>+</button>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3,
              4,
              5,
              7
            ],
            "description": "We define `Action` as a discriminated union and `State` as an object.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              9
            ],
            "description": "We apply these types to the `reducer` function.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              18
            ],
            "description": "When using `useReducer`, TypeScript infers `state` is of type `State` and `dispatch` only accepts `Action` objects.\n\nThe exact text output on the screen will be:\n`Count: 0`\n`[Button: +]`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "type Action =\n  | { type: 'INCREMENT' }\n  | { type: 'DECREMENT' }\n  | { type: 'SET'; payload: number };\n\nfunction reducer(state: State, action: Action): State {\n  switch (action.type) {\n    case 'SET': return { count: action.payload };\n  }\n}",
        "steps": [
          {
            "highlightLines": [
              1,
              2,
              3,
              4
            ],
            "description": "A discriminated union is the correct way to type actions. Each variant has a unique `type` literal. TypeScript narrows the type inside each switch case.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              8
            ],
            "description": "Inside `case 'SET'`, TypeScript knows `action.payload` exists and is a `number`. Accessing `.payload` in the INCREMENT case would be a compile-time error—no runtime surprises.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6
            ],
            "description": "The `: State` return type annotation ensures the reducer always returns the correct shape. Accidentally returning `undefined` is caught immediately at compile time.\n\nThe exact text output on the screen will be:\n`Count: 0`\n`[Button: +]`\n`[Button: -]`\n`[Button: Set to 42]`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Typing Reducer Actions",
          "type": "did-you-know",
          "walkthrough": {
            "code": "type Action = \n  | { type: 'INCREMENT' } \n  | { type: 'SET_USER', payload: User };",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2,
                  3
                ],
                "description": "The best way to type a reducer action is using a 'Discriminated Union'."
              },
              {
                "highlightLines": [
                  1,
                  2,
                  3
                ],
                "description": "By using the pipe `|` operator, TypeScript can perfectly narrow down the types. If you check `if (action.type === 'SET_USER')`, TS will automatically know that `action.payload` safely exists!"
              }
            ]
          }
        },
        {
          "title": "Why is Context strictly typed to `null`?",
          "type": "misconception",
          "walkthrough": {
            "code": "const AuthContext = createContext<User | null>(null);\n\nconst user = useContext(AuthContext);\nconsole.log(user.name); // TS Error: Object is possibly 'null'.",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "If a component tries to use Context but forgets to wrap itself in the `<Provider>`, React falls back to the default value (`null`)."
              },
              {
                "highlightLines": [
                  4
                ],
                "description": "TypeScript forces you to handle this catastrophe! You must either write an `if (!user)` check, or create a custom hook that throws an error if the context is null."
              }
            ]
          }
        },
        {
          "title": "Typing the Reducer State",
          "type": "did-you-know",
          "walkthrough": {
            "code": "interface AppState {\n  user: User | null;\n  theme: 'light' | 'dark';\n}\n\nfunction reducer(state: AppState, action: Action): AppState { ... }",
            "steps": [
              {
                "highlightLines": [
                  5
                ],
                "description": "Always explicitly type both the arguments AND the return value of your reducer function."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "This guarantees that if you accidentally try to return an object with a missing property (like forgetting to return the `user` when updating the `theme`), TypeScript will instantly yell at you!"
              }
            ]
          }
        },
        {
          "title": "Exhaustive Type Checking with assertNever in Reducers",
          "type": "pro-tip",
          "walkthrough": {
            "code": "function assertNever(x: never): never {\n  throw new Error(`Unhandled action: ${JSON.stringify(x)}`);\n}\n\nfunction reducer(state: State, action: Action): State {\n  switch (action.type) {\n    case 'INCREMENT': return { count: state.count + 1 };\n    default: return assertNever(action); // Compile error if an action is forgotten!\n  }\n}",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2,
                  3
                ],
                "description": "The `never` type represents values that can never occur. If your `switch` handles every action type in the union, TypeScript narrows `action` to `never` in `default`."
              },
              {
                "highlightLines": [
                  8
                ],
                "description": "If anyone adds a new action `{ type: 'DECREMENT' }` without adding a `case`, TypeScript immediately flags `assertNever(action)` with a compile error!"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "typescript-patterns",
      "title": "TS React Patterns",
      "content": "\n# TS React Patterns\n\n### What is it?\n**Building on typing fundamentals:** Advanced React patterns leverage generics, `ReactNode`, and `ComponentPropsWithoutRef` to build flexible, high-utility UI building blocks.\n\n> \ud83d\udca1 **Mental Model:** Think of a generic like a shipping container versus a plain cardboard box: `any` is a box with no label \u2014 nobody knows what's safe to assume is inside \u2014 while a generic is a container that keeps its label attached the whole way through, so everyone downstream still knows exactly what it's carrying.\n\n### Why do we need it?\nWriting custom types for every standard HTML attribute (`onClick`, `className`, etc.) is tedious. React provides built-in types to make this easier.\n\n### How?\n1. **Typing `useRef`:**\n```tsx\nconst inputRef = useRef<HTMLInputElement>(null);\nconst countRef = useRef<number>(0);\n```\n\n2. **Typing `children`:**\n```tsx\ntype CardProps = { children: React.ReactNode; };\n```\n\n3. **Generic hooks and components:**\n```tsx\nfunction useLocalStorage<T>(key: string, initialValue: T): [T, (v: T) => void] { /*...*/ }\n```\n\n4. **`ComponentPropsWithoutRef`:**\n```tsx\n// Automatically includes standard button props like onClick and disabled\ntype ButtonProps = React.ComponentPropsWithoutRef<'button'> & { variant?: 'primary' | 'secondary' };\n```\n\n### Syntax/Example\n```tsx\n// Using generics to allow our component to accept different types of items\ntype ListProps<T> = {\n  items: T[];\n  getKey: (item: T) => string | number;\n  renderItem: (item: T) => React.ReactNode;\n};\n\nfunction List<T>({ items, getKey, renderItem }: ListProps<T>) {\n  return <ul>{items.map((item) => <li key={getKey(item)}>{renderItem(item)}</li>)}</ul>;\n}\n```\n\nNote `getKey`. A generic list has no idea what identifies one of your items, so it cannot pick a stable key on its own — and falling back to the array index would reintroduce exactly the bug the Rendering Lists & Keys lesson covered. Asking the caller keeps the component generic *and* correct, and typing the parameter as `T` means the caller still gets full inference.\n\n### Example\n```tsx\nfunction GenericList<T>({ items, getKey, renderItem }: { items: T[], getKey: (item: T) => string | number, renderItem: (item: T) => React.ReactNode }) {\n  return (\n    <ul>\n      {items.map((item) => (\n        <li key={getKey(item)}>{renderItem(item)}</li>\n      ))}\n    </ul>\n  );\n}\n\nexport default function App() {\n  return (\n    <GenericList \n      items={[1, 2, 3]} \n      getKey={(num) => num} \n      renderItem={(num) => <strong>{num}</strong>} \n    />\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** Implement a generic `List<T>` component that takes an `items: T[]` array, a `getKey: (item: T) => string | number` function, and a `renderItem: (item: T) => React.ReactNode` function — then render a list of numbers and a list of strings with it.\n\n**Solution:** Define the function as `function List<T>({ items, getKey, renderItem }: { items: T[], getKey: (item: T) => string | number, renderItem: (item: T) => React.ReactNode })`. Map over `items` and return an `<li key={getKey(item)}>` for each, calling `renderItem(item)` inside.\n\n### Hints\n* `<T>` after the function name tells TypeScript this component takes a generic type parameter.\n* `React.ReactNode` is the standard type for anything that can be rendered in React (strings, numbers, JSX, arrays).\n* These lists hold primitives, so the item *is* its own identity — `getKey={item => item}` is all the caller needs here.\n",
      "starterCode": "import React from 'react';\n\n// 👉 1. Implement a generic List component here\n// It should take generic type T, and props:\n//   { items: T[], getKey: (item: T) => string | number, renderItem: (item: T) => React.ReactNode }\n\nexport default function App() {\n  return (\n    <div style={{ padding: 20 }}>\n      {/* 👉 2. Use the List component for a list of strings */}\n      <h3>Strings</h3>\n      {/* <List items={['Apple', 'Banana']} getKey={item => item} renderItem={item => <span>{item}</span>} /> */}\n      \n      {/* 👉 3. Use the List component for a list of numbers */}\n      <h3>Numbers</h3>\n      {/* <List items={[10, 20, 30]} getKey={item => item} renderItem={item => <strong>{item}</strong>} /> */}\n    </div>\n  );\n}",
      "solutionCode": "import React from 'react';\n\nfunction List<T>({ items, getKey, renderItem }: { items: T[], getKey: (item: T) => string | number, renderItem: (item: T) => React.ReactNode }) {\n  return <ul>{items.map((item) => <li key={getKey(item)}>{renderItem(item)}</li>)}</ul>;\n}\n\nexport default function App() {\n  return (\n    <div style={{ padding: 20 }}>\n      <h3>Strings</h3>\n      <List items={['Apple', 'Banana']} getKey={item => item} renderItem={item => <span>{item}</span>} />\n      \n      <h3>Numbers</h3>\n      <List items={[10, 20, 30]} getKey={item => item} renderItem={item => <strong>{item}</strong>} />\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "function GenericList<T>({ items, getKey, renderItem }: { items: T[], getKey: (item: T) => string | number, renderItem: (item: T) => React.ReactNode }) {\n  return (\n    <ul>\n      {items.map((item) => (\n        <li key={getKey(item)}>{renderItem(item)}</li>\n      ))}\n    </ul>\n  );\n}\n\nexport default function App() {\n  return (\n    <GenericList \n      items={[1, 2, 3]} \n      getKey={(num) => num} \n      renderItem={(num) => <strong>{num}</strong>} \n    />\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              1
            ],
            "description": "We define a generic `<T>` for the function, then use that one `T` across three props: `items: T[]`, `getKey: (item: T) => ...` and `renderItem: (item: T) => ...`. Pinning `T` once pins all three together.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              14
            ],
            "description": "When we pass an array of numbers `[1, 2, 3]`, TypeScript automatically infers that `T` is `number`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              5,
              15
            ],
            "description": "`getKey` is why this component does not fall back to `key={index}`. A generic list cannot know what identifies one of *your* items — only the caller does — so it asks, and because the parameter is typed `T` the caller gets full type safety while answering.\n\nIndex keys would have been the easy shortcut here, and the wrong one, for exactly the reasons the Rendering Lists & Keys lesson gave.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              16
            ],
            "description": "Because `T` was inferred as `number`, TypeScript knows `num` inside `renderItem` is a number too.\n\nThe exact text output on the screen will be:\n* `1`\n* `2`\n* `3`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import React from 'react';\n\nfunction List<T>({ items, getKey, renderItem }: { items: T[], getKey: (item: T) => string | number, renderItem: (item: T) => React.ReactNode }) {\n  return <ul>{items.map((item) => <li key={getKey(item)}>{renderItem(item)}</li>)}</ul>;\n}\n\nexport default function App() {\n  return (\n    <div style={{ padding: 20 }}>\n      <h3>Strings</h3>\n      <List items={['Apple', 'Banana']} getKey={item => item} renderItem={item => <span>{item}</span>} />\n      \n      <h3>Numbers</h3>\n      <List items={[10, 20, 30]} getKey={item => item} renderItem={item => <strong>{item}</strong>} />\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3
            ],
            "description": "We define a generic component `List<T>`. It accepts an array of `T`, a `getKey` function that turns one `T` into a stable key, and a `renderItem` function that turns one `T` into a `React.ReactNode`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              4
            ],
            "description": "We map over `items`, key each `<li>` with `getKey(item)`, and invoke `renderItem` for the contents. The key comes from the data rather than the array position, so the list survives reordering and deletion the way the Rendering Lists & Keys lesson required.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              11
            ],
            "description": "For the first list, TypeScript infers `T` as `string` from `['Apple', 'Banana']`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              14
            ],
            "description": "For the second list, it infers `T` as `number` from `[10, 20, 30]`. The `List` component is completely type-safe and highly reusable!\n\nThe exact text output on the screen will be:\n`Strings`\n* `Apple`\n* `Banana`\n`Numbers`\n* `10`\n* `20`\n* `30`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why use `ComponentProps`?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "import { ComponentProps } from 'react';\n\ntype ButtonProps = ComponentProps<'button'> & {\n  variant: 'primary' | 'secondary';\n};",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "If you are wrapping a native HTML button, you shouldn't have to manually type `onClick`, `disabled`, and `type`."
              },
              {
                "highlightLines": [
                  3
                ],
                "description": "`ComponentProps<'button'>` instantly extracts all 300+ standard HTML attributes so you can inherit them cleanly!"
              }
            ]
          }
        },
        {
          "title": "What is `React.FC` and why shouldn't I use it?",
          "type": "misconception",
          "walkthrough": {
            "code": "// Avoid this legacy pattern\nconst Button: React.FC<Props> = ({ children }) => <button>;\n\n// Just write normal functions\nfunction Button({ children }: Props) { return <button>; }",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "In older React versions, `React.FC` automatically injected the `children` prop into everything, even components that didn't accept children!"
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "This led to silent bugs. The React team explicitly recommends against using `React.FC` today. Just type the function arguments directly."
              }
            ]
          }
        },
        {
          "title": "What is `Omit` used for in component props?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "type NativeInput = ComponentProps<'input'>;\n\n// Steal all input props, but forbid 'type'!\ntype MyInputProps = Omit<NativeInput, 'type'> & {\n  variant: 'outline' | 'solid';\n};",
            "steps": [
              {
                "highlightLines": [
                  4
                ],
                "description": "If you build a custom `<EmailInput>` component, you probably want to force the `type` to always be `'email'`."
              },
              {
                "highlightLines": [
                  4
                ],
                "description": "By using `Omit<Props, 'type'>`, you remove that specific property from the allowed list, preventing other developers from accidentally passing `type='checkbox'` to your custom component!"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "polymorphic-components",
      "title": "Polymorphic Components",
      "content": "\n# Polymorphic Components\n\n### What is it?\n**Building on generic components:** A polymorphic component is a single React component that can dynamically render as different HTML tags or components (e.g. `button` or `a`) while keeping full type safety for element-specific props.\n\n> \ud83d\udca1 **Mental Model:** Think of a polymorphic component like a costume that adapts its accessories to whatever character you're dressing as: choose 'knight' and it hands you a sword prop; choose 'wizard' and the sword slot disappears in favor of a staff \u2014 the available props change based on which role you pick.\n\n### Why do we need it?\nSometimes a reusable `Button` component needs to act as a link (`<a href=\"...\">`) for accessibility and routing purposes, but look exactly like a button visually. If it renders an `<a>`, it should accept an `href`. If it renders a `<button>`, it should accept an `onClick` but reject an `href`.\n\n### How?\nYou can use the generic `<E extends React.ElementType>` pattern combined with `React.ComponentProps<E>` to dynamically type the component based on an `as` prop.\n\n### Syntax/Example\n```tsx\ntype TextProps<E extends React.ElementType> = {\n  as?: E;\n  color?: 'primary' | 'secondary';\n} & Omit<React.ComponentProps<E>, 'color'>;\n\n// We set a default of 'span'\nfunction Text<E extends React.ElementType = 'span'>({ as, color, ...rest }: TextProps<E>) {\n  const Component = as || 'span';\n  return <Component style={{ color: color === 'primary' ? 'blue' : 'gray' }} {...rest} />;\n}\n\nfunction Usage() {\n  return (\n    <>\n      {/* Valid: rendering as 'a' requires 'href' */}\n      <Text as=\"a\" href=\"/home\" color=\"primary\">Home</Text>\n\n      {/* Type Error! 'href' does not exist on 'span' */}\n      <Text href=\"/home\">Home</Text>\n    </>\n  );\n}\n```\n\n### Example\n```tsx\nimport React from 'react';\n\ntype BoxProps<E extends React.ElementType> = {\n  as?: E;\n  p?: number;\n} & React.ComponentProps<E>;\n\nfunction Box<E extends React.ElementType = 'div'>({ as, p = 0, ...rest }: BoxProps<E>) {\n  const Component = as || 'div';\n  return <Component style={{ padding: p * 4 }} {...rest} />;\n}\n\nexport default function App() {\n  return (\n    <>\n      <Box p={4}>I am a div</Box>\n      <Box as=\"section\" p={2} id=\"main\">I am a section</Box>\n    </>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** You have a `Button` component that currently only renders as a `<button>`. Make it polymorphic so it can optionally render as an `<a>` tag by providing an `as` prop.\n\n**Solution:** Add the generic type `E extends React.ElementType = 'button'` to `ButtonProps` and `Button`. Add `as?: E` to `ButtonProps`. Intersect with `React.ComponentProps<E>`. Destructure `as` in the component, defaulting to `'button'`. Capitalize it to `Component` and render `<Component {...rest}>{children}</Component>`.\n\n### Hints\n* Always assign the dynamic component to a capitalized variable (like `const Component = as || 'button';`) before using it in JSX. JSX requires custom components to be capitalized so it doesn't confuse them with HTML strings.\n",
      "starterCode": "import React from 'react';\n\n// 👉 1. Make this props type generic with <E extends React.ElementType>\ntype ButtonProps = {\n  variant?: 'primary' | 'secondary';\n  children: React.ReactNode;\n} & React.ComponentProps<'button'>; // 👉 2. Replace 'button' with E\n\n// 👉 3. Make the component generic\nfunction Button({ variant = 'primary', children, ...rest }: ButtonProps) {\n  // 👉 4. Determine the component to render (e.g. const Component = as || 'button')\n  return (\n    <button \n      style={{ background: variant === 'primary' ? 'blue' : 'gray', color: 'white', padding: 8, cursor: 'pointer', border: 'none' }}\n      {...rest}\n    >\n      {children}\n    </button>\n  );\n}\n\nexport default function App() {\n  return (\n    <div style={{ padding: 20, display: 'flex', gap: 10 }}>\n      <Button onClick={() => alert('Clicked!')}>Regular Button</Button>\n      {/* 👉 5. Pass as=\"a\" and an href to this Button */}\n      <Button variant=\"secondary\">Link Button</Button>\n    </div>\n  );\n}",
      "solutionCode": "import React from 'react';\n\ntype ButtonProps<E extends React.ElementType> = {\n  as?: E;\n  variant?: 'primary' | 'secondary';\n  children: React.ReactNode;\n} & React.ComponentProps<E>;\n\nfunction Button<E extends React.ElementType = 'button'>({ as, variant = 'primary', children, ...rest }: ButtonProps<E>) {\n  const Component = as || 'button';\n  return (\n    <Component \n      style={{ background: variant === 'primary' ? 'blue' : 'gray', color: 'white', padding: 8, cursor: 'pointer', border: 'none' }}\n      {...rest}\n    >\n      {children}\n    </Component>\n  );\n}\n\nexport default function App() {\n  return (\n    <div style={{ padding: 20, display: 'flex', gap: 10 }}>\n      <Button onClick={() => alert('Clicked!')}>Regular Button</Button>\n      <Button as=\"a\" href=\"#\" variant=\"secondary\">Link Button</Button>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import React from 'react';\n\ntype BoxProps<E extends React.ElementType> = {\n  as?: E;\n  p?: number;\n} & React.ComponentProps<E>;\n\nfunction Box<E extends React.ElementType = 'div'>({ as, p = 0, ...rest }: BoxProps<E>) {\n  const Component = as || 'div';\n  return <Component style={{ padding: p * 4 }} {...rest} />;\n}\n\nexport default function App() {\n  return (\n    <>\n      <Box p={4}>I am a div</Box>\n      <Box as=\"section\" p={2} id=\"main\">I am a section</Box>\n    </>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3,
              6
            ],
            "description": "`E` is a generic parameter standing for any valid React element type — `'div'`, `'a'`, or another component. `React.ComponentProps<E>` then borrows every prop that element accepts and intersects it with our own.\n\nSo `<Box as=\"a\">` gains `href` and `target` in autocomplete, and `<Box as=\"img\">` gains `src` and `alt`, from one declaration.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              9
            ],
            "description": "The `as` prop is read and defaulted, then assigned to a **capitalised** variable. That is not style — JSX treats a lowercase identifier as a literal HTML tag name, so `<as />` would render an `<as>` element. Only a capitalised name is looked up as a value.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10
            ],
            "description": "`<Component {...rest} />` renders whatever was chosen and forwards the remaining props. `as` and `p` were destructured out, so they never leak onto the DOM node — passing `p=\"4\"` down to a real `<div>` would draw a React warning about an unknown attribute.\n\nThe type is what makes the spread safe: `rest` is known to contain only props that `E` accepts.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              16,
              17
            ],
            "description": "Both calls are checked against different element types from the same component. Ask for `<Box as=\"section\" id=\"main\">` and `id` is valid; ask for `<Box as=\"section\" href=\"/x\">` and it is a compile error.\n\nWorth the complexity for a design-system primitive used everywhere. For a component with one caller, an `as` prop is a generic you are maintaining for nobody.\n\nThe exact text output on the screen will be:\n`I am a div`\n`I am a section`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "type ButtonProps<E extends React.ElementType> = {\n  as?: E;\n  variant?: 'primary' | 'secondary';\n  children: React.ReactNode;\n} & React.ComponentProps<E>;\n\nfunction Button<E extends React.ElementType = 'button'>({ as, variant = 'primary', children, ...rest }: ButtonProps<E>) {\n  const Component = as || 'button';\n  return (\n    <Component \n      style={{ background: variant === 'primary' ? 'blue' : 'gray', color: 'white', padding: 8, cursor: 'pointer', border: 'none' }}\n      {...rest}\n    >\n      {children}\n    </Component>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              1,
              2,
              5
            ],
            "description": "We make `ButtonProps` generic over `<E extends React.ElementType>` and add `as?: E` intersected with `React.ComponentProps<E>`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7,
              8
            ],
            "description": "We declare generic `Button<E = 'button'>` and resolve `const Component = as || 'button'` to dynamically pick the rendered element tag.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10,
              14
            ],
            "description": "We render `<Component {...rest}>{children}</Component>`, allowing the component to safely render as a `<button>` or `<a href=\"#\">` with complete prop type safety!",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why use React.ElementType?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "type PolymorphicProps<E extends React.ElementType> = {\n  as?: E;\n} & React.ComponentPropsWithoutRef<E>;",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "`React.ElementType` represents any valid JSX tag: native HTML elements like `'div'` or `'a'`, as well as custom React components like `<Link>`."
              },
              {
                "highlightLines": [
                  3
                ],
                "description": "Constraining `E extends React.ElementType` allows `ComponentPropsWithoutRef<E>` to dynamically extract the exact allowed HTML attributes for whatever tag you pass to `as`."
              }
            ]
          }
        },
        {
          "title": "When polymorphic components become an anti-pattern",
          "type": "pro-tip",
          "walkthrough": {
            "code": "// ❌ Complex polymorphic typing with forwardRef is 50+ lines of brittle type gymnastics\n// ✅ One modern library pattern: Radix UI 'asChild' / Slot pattern\n<Button asChild>\n  <a href=\"/dashboard\">Go to Dashboard</a>\n</Button>",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "While the `as` prop is classic, combining polymorphic components with `forwardRef` and generics requires very convoluted type definitions that frequently break autocomplete."
              },
              {
                "highlightLines": [
                  3,
                  4,
                  5
                ],
                "description": "Modern libraries like Radix UI and shadcn/ui recommend the `asChild` (Slot) pattern instead: the parent component merges its styles and event listeners directly onto its single child element without any type gymnastics."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "ts-diagnostics",
      "title": "Diagnosing TypeScript Errors",
      "content": "\n# Diagnosing TypeScript Errors\n\n### What is it?\n**Building on TypeScript in React:** Understanding how to decode TypeScript's compiler errors is one of the highest-leverage skills for writing production React code without friction.\n\n> \ud83d\udca1 **Mental Model:** Think of a TypeScript error message like a doctor's diagnosis versus just a symptom list: the red squiggle points at where it hurts, but reading the full message tells you what's actually wrong and what to check next, rather than just guessing from where it's pointing.\n\n### Why do we need it?\nTypeScript errors in React can look intimidating, with long nested generic messages. However, most React TS errors fall into a few predictable categories:\n1. **`Property 'X' does not exist on type 'never[]'`**: Initialized state with `useState([])` without providing a generic type parameter `useState<User[]>([])`.\n2. **`Type 'X' is not assignable to type 'Y'`**: Passing the wrong prop shape or missing a required field.\n3. **`Object is possibly 'null'`**: Reading a property from state initialized to `null` (e.g. `useState<User | null>(null)`) without an optional chain `user?.name` or guard.\n4. **`Type '(e: Event) => void' is not assignable`**: Using generic DOM `Event` instead of React's synthetic event `React.ChangeEvent<HTMLInputElement>`.\n\n### How?\nRead errors from the **bottom-most line** first (where the actual mismatch is explained). Always check:\n- Does `useState` need an explicit generic `<Type | null>`?\n- Is the event typed with `React.ChangeEvent<HTMLInputElement>` or `React.FormEvent`?\n- Are optional props properly guarded with optional chaining `?.`?\n\n### What the compiler actually prints\nThis sandbox transpiles TypeScript without type-checking it, so it will never show you these. This is what `tsc` reports for the three bugs in the challenge — read them as the exercise, because reading them is the skill:\n\n```javascript\n// Bug 1 — const [users, setUsers] = useState([]);\n//   users.map(...)\n//   ~~~~~~~~~~~~~\n// error TS2339: Property 'name' does not exist on type 'never'.\n\n// Bug 2 — const [currentUser, setCurrentUser] = useState(null);\n//   currentUser.name\n//   ~~~~~~~~~~~\n// error TS18047: 'currentUser' is possibly 'null'.\n\n// Bug 3 — const handleInputChange = (e) => { ... }\n//   (e) => ...\n//    ~\n// error TS7006: Parameter 'e' implicitly has an 'any' type.\n```\n\nEach error names the inference that went wrong — `never`, `null`, `any` — and the fix is always to tell TypeScript what you actually meant.\n\n### Syntax/Example\n```tsx\ninterface User {\n  id: string;\n  username: string;\n}\n\n// ❌ TS Error: 'never[]' - TS cannot guess what items will go in this array\n// const [users, setUsers] = useState([]);\n\n// ✅ Explicit generic solves the mystery\nconst [users, setUsers] = useState<User[]>([]);\n\n// ✅ Correct React synthetic event typing\nconst handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {\n  console.log(e.target.value);\n};\n```\n\n### Example\n```tsx\nimport { useState } from 'react';\n\ninterface Profile {\n  id: number;\n  bio: string;\n}\n\nexport default function App() {\n  // Typed generic state with union null\n  const [profile, setProfile] = useState<Profile | null>(null);\n  const [tags, setTags] = useState<string[]>([]);\n\n  const handleAddTag = (newTag: string) => {\n    setTags(prev => [...prev, newTag]);\n  };\n\n  return (\n    <div>\n      <h3>{profile?.bio ?? 'No bio yet'}</h3>\n      <p>Tags: {tags.join(', ')}</p>\n    </div>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** The provided `UserManager` component has 3 broken TypeScript errors: state initialized to empty array without generic, nullable user accessed without guard, and untyped input change handler. Fix all 3 errors!\n\n**Solution:** Add `<User[]>` generic to `useState([])`. In `handleInputChange`, type `e: React.ChangeEvent<HTMLInputElement>`. In rendering `currentUser`, use optional chaining `currentUser?.name` or a null guard.\n\n### Hints\n* If you initialize an empty array with `useState([])`, TypeScript infers `never[]`. Always specify `useState<MyType[]>([])`.\n* For HTML input events, use `React.ChangeEvent<HTMLInputElement>`.\n",
      "starterCode": "import { useState } from 'react';\n\ninterface User {\n  id: number;\n  name: string;\n  role: 'admin' | 'member';\n}\n\nexport default function UserManager() {\n  // ❌ Bug 1: TypeScript infers never[]! Fix by adding a generic type parameter\n  const [users, setUsers] = useState([]);\n  \n  // ❌ Bug 2: Union type for nullable active user\n  const [currentUser, setCurrentUser] = useState(null);\n  const [inputVal, setInputVal] = useState('');\n\n  // ❌ Bug 3: Type the event parameter with React.ChangeEvent\n  const handleInputChange = (e) => {\n    setInputVal(e.target.value);\n  };\n\n  const handleAddUser = () => {\n    if (!inputVal.trim()) return;\n    const newUser: User = {\n      id: Date.now(),\n      name: inputVal,\n      role: 'member'\n    };\n    setUsers(prev => [...prev, newUser]);\n    setCurrentUser(newUser);\n    setInputVal('');\n  };\n\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>User Directory</h2>\n      <input \n        value={inputVal} \n        onChange={handleInputChange} \n        placeholder=\"New user name...\" \n      />\n      <button onClick={handleAddUser}>Add Member</button>\n\n      {/* ❌ Notice how currentUser can be null safely with optional chaining */}\n      <p>Active user: {currentUser ? currentUser.name : 'None'}</p>\n\n      <ul>\n        {users.map(u => (\n          <li key={u.id}>{u.name} ({u.role})</li>\n        ))}\n      </ul>\n    </div>\n  );\n}",
      "solutionCode": "import { useState } from 'react';\n\ninterface User {\n  id: number;\n  name: string;\n  role: 'admin' | 'member';\n}\n\nexport default function UserManager() {\n  const [users, setUsers] = useState<User[]>([]);\n  const [currentUser, setCurrentUser] = useState<User | null>(null);\n  const [inputVal, setInputVal] = useState('');\n\n  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {\n    setInputVal(e.target.value);\n  };\n\n  const handleAddUser = () => {\n    if (!inputVal.trim()) return;\n    const newUser: User = {\n      id: Date.now(),\n      name: inputVal,\n      role: 'member'\n    };\n    setUsers(prev => [...prev, newUser]);\n    setCurrentUser(newUser);\n    setInputVal('');\n  };\n\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>User Directory</h2>\n      <input \n        value={inputVal} \n        onChange={handleInputChange} \n        placeholder=\"New user name...\" \n      />\n      <button onClick={handleAddUser}>Add Member</button>\n\n      <p>Active user: {currentUser ? currentUser.name : 'None'}</p>\n\n      <ul>\n        {users.map(u => (\n          <li key={u.id}>{u.name} ({u.role})</li>\n        ))}\n      </ul>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\ninterface Profile {\n  id: number;\n  bio: string;\n}\n\nexport default function App() {\n  // Typed generic state with union null\n  const [profile, setProfile] = useState<Profile | null>(null);\n  const [tags, setTags] = useState<string[]>([]);\n\n  const handleAddTag = (newTag: string) => {\n    setTags(prev => [...prev, newTag]);\n  };\n\n  return (\n    <div>\n      <h3>{profile?.bio ?? 'No bio yet'}</h3>\n      <p>Tags: {tags.join(', ')}</p>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              11
            ],
            "description": "The annotation on line 11 is there to prevent a specific, confusing error. `useState([])` infers the type from the initial value, and the type of an empty array literal is `never[]` — an array that can hold nothing.\n\nThe error then appears at the *first push*, reading \"Argument of type string is not assignable to parameter of type never\", which points at a line that is perfectly correct.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10
            ],
            "description": "Same shape, different symptom. `useState(null)` infers `null` and nothing else, so assigning a profile later is an error.\n\n`useState<Profile | null>(null)` says what is actually true: this slot holds a profile or nothing, and starts as nothing. Almost every \"not assignable to type null\" in a React codebase is this.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              19
            ],
            "description": "Declaring the union means the compiler now insists you handle both halves — it will not let you write `profile.bio` unguarded.\n\n`profile?.bio ?? 'No bio yet'` satisfies it. Note that `??` falls back only on `null` and `undefined`, unlike `||`, which also fires on `''` and `0` — the difference that silently replaces a legitimate empty bio with placeholder text.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              13,
              14
            ],
            "description": "Typing the parameter is what makes the updater below it safe: `[...prev, newTag]` is checked against `string[]`, so a mistyped value fails here rather than at the render that consumes it.\n\nThe habit this lesson is teaching: a TypeScript error usually reports where the contradiction became visible, not where it was introduced. Read the type it inferred, then find where it inferred it.\n\nThe exact text output on the screen will be:\n`No bio yet`\n`Tags: `",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "export default function UserManager() {\n  const [users, setUsers] = useState<User[]>([]);\n  const [currentUser, setCurrentUser] = useState<User | null>(null);\n  const [inputVal, setInputVal] = useState('');\n\n  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {\n    setInputVal(e.target.value);\n  };\n  // ...\n}",
        "steps": [
          {
            "highlightLines": [
              2,
              3
            ],
            "description": "We explicitly typed both the `users` list (`<User[]>`) and the `currentUser` (`<User | null>`).",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6
            ],
            "description": "We typed the event handler with `React.ChangeEvent<HTMLInputElement>`. All TypeScript diagnostics pass cleanly!\n\nThe exact text output on the screen will be:\n`User Directory`\n`Active user: None`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why does `useState([])` default to `never[]`?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "const [items, setItems] = useState([]);\nitems.push('test'); // TS Error: Argument of type 'string' is not assignable to parameter of type 'never'.",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "When you pass `[]` with no initial elements, TypeScript cannot infer what will go into the array."
              },
              {
                "highlightLines": [
                  2
                ],
                "description": "TS conservatively assigns `never[]` (an array that can never contain anything). Giving it an explicit generic like `useState<string[]>([])` immediately resolves the issue!"
              }
            ]
          }
        },
        {
          "title": "The Golden Rule of Reading React TS Errors",
          "type": "pro-tip",
          "walkthrough": {
            "code": "// Type 'string' is not assignable to type 'number'.\n// The expected type comes from property 'age' which is declared here on type 'IntrinsicAttributes & UserProps'",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "Always look at the FIRST and LAST lines of the error message. The middle lines are often just React component internal wrappers."
              },
              {
                "highlightLines": [
                  2
                ],
                "description": "The first line tells you what value you supplied vs what was expected. The last line tells you the exact property name ('age') that caused the mismatch!"
              }
            ]
          }
        }
      ]
    }
  ]
};
