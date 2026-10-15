export default {
  "id": "react-server",
  "title": "Server Components & Actions",
  "description": "The server/client boundary, form Actions, and optimistic UI.",
  "icon": "Server",
  "lessons": [
    {
      "id": "server-components",
      "title": "Server Components Intro",
      "content": "\n# Server Components Intro\n\n### What is it?\n**Building on client single page applications:** **React Server Components (RSC)** execute exclusively on the server at request or build time, reading databases directly with zero client JavaScript bundle cost.\n\n> 💡 **Mental Model:** Think of Server Components like a restaurant's kitchen versus its dining room: the kitchen (server) prepares the dish once and sends out the finished plate — it doesn't need salt shakers or napkin holders (client interactivity), those only live out in the dining room (Client Components).\n\n### Why do we need it?\nHistorically, all React components ran in the browser. This meant your users had to download large JavaScript bundles, and components had to make slow API requests over the network to fetch data from the server.\n\n### How?\nServer Components have zero impact on bundle size, and they can read directly from your database without an API layer! By default in modern frameworks like Next.js, **all components are Server Components**. Because Server Components never reach the browser, they **cannot** use interactivity (`onClick`, `onChange`) or client hooks (`useState`, `useEffect`). If a component needs interactivity, you must explicitly mark it as a **Client Component** by adding the `'use client'` directive to the very top of the file.\n\n### Syntax/Example\n```jsx\n// This causes the file to be treated as a Client Component,\n// allowing the use of interactive hooks like useState and useEffect\n\"use client\";\n\nimport { useState } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(count + 1)}>\n      Clicked {count} times\n    </button>\n  );\n}\n```\n\n### Example\n```jsx\n'use client';\n\nimport { useState } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>{count}</button>;\n}\n```\n\n### Challenge and Solution\n**Challenge:** *(Note: Sandpack runs entirely in your browser, so we are simulating the framework enforcement here!)* The `Counter` component below uses `useState` and an `onClick` handler. Mark this file as a Client Component.\n\n**Solution:** Add `'use client';` to the very top of the file.\n\n### Hints\n* **The Boundary Model:** The `\"use client\"` directive does not mean \"render on the client\"—it creates a **boundary** where everything below it is bundled into the client JS and hydrated in the browser. \n",
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
                "description": "Importing a module from a `'use client'` file pulls that module across the boundary with it — whatever it was written as, it is now client code and will be bundled and shipped to the browser. If it was a Server Component doing server work (reading a database, touching the filesystem, using a secret), the build fails with a \"this only works in a Server Component\" error; if it was harmless, it silently becomes part of your client bundle, which is its own kind of wrong."
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
      "title": "Actions API",
      "content": "\n# Async Forms with Actions\n\n### What is it?\n**Building on forms and event handlers:** React 19 **Actions** standardize asynchronous form submissions and mutations, replacing manual `onSubmit` handlers, `e.preventDefault()`, and custom `isPending` state tracking.\n\n> 💡 **Mental Model:** Think of the Actions API like a hotel concierge desk: you hand in one request (submit) and the concierge handles showing you a \\\"working on it\\\" status, then either a confirmation or an apology — you don't have to personally track and display each step yourself.\n\n### Why do we need it?\nFor live validation (like character counters), controlled inputs are still perfect. But for handling asynchronous form submission, manually tracking `isPending` state, catching errors, and calling `e.preventDefault()` is incredibly tedious boilerplate.\n\n### How?\nThe Actions family of hooks (`useActionState`, `useFormStatus`, `useOptimistic`) handles pending states, error handling, and optimistic UI automatically when you pass a function to the `<form action={...}>` prop.\n\n### Syntax/Example\n```jsx\nfunction UpdateProfile() {\n  async function action(formData) {\n    const name = formData.get('name');\n    await fetch('https://jsonplaceholder.typicode.com/users', { method: 'POST', body: JSON.stringify({name}) });\n  }\n\n  return (\n    <form action={action}>\n      <input name=\"name\" />\n      <button type=\"submit\">Update</button>\n    </form>\n  );\n}\n```\n\n### Example\n```jsx\nimport { useActionState } from 'react';\n\nasync function submitAction(prevState, formData) {\n  await new Promise(r => setTimeout(r, 1000));\n  return { message: \"Saved \" + formData.get(\"email\") };\n}\n\nfunction App() {\n  const [state, formAction, isPending] = useActionState(submitAction, null);\n  return (\n    <form action={formAction}>\n      <input name=\"email\" />\n      <button disabled={isPending}>{isPending ? \"Loading...\" : \"Submit\"}</button>\n      {state?.message && <p>{state.message}</p>}\n    </form>\n  );\n}\n\nexport default App;\n```\n\n### Challenge and Solution\n**Challenge:** Refactor the manual loading state in `Newsletter` to use `useActionState`.\n\n**Solution:** Add `const [state, formAction, isPending] = useActionState(submitAction, null);`. Remove `handleSubmit`, `isPending`, and `message` states. Change `<form onSubmit={...}>` to `<form action={formAction}>`. Replace `message` with `state?.message`.\n\n### Hints\n* **FormData:** Notice how the action function receives `formData`. You don't need to manually read `e.target` anymore. Just call `formData.get(\"inputName\")`!\n",
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
                "highlightLines": [
                  2,
                  3,
                  4,
                  8,
                  9,
                  10
                ],
                "description": "An action function can return failure the same way it returns success — as a value in the state object, not by throwing. Both a validation failure (bad input) and a caught exception (the request itself failing) resolve to the same shape: `{ message, error }`, with only one of the two ever set."
              },
              {
                "highlightLines": [
                  17
                ],
                "description": "The component reads `state.error` exactly the way it reads `state.message` — there's no separate error-handling code path, no try/catch in the component itself. `useActionState` doesn't distinguish success from failure for you; the action function's return value is the single source of truth for what to render."
              },
              {
                "highlightLines": [],
                "description": "This matters together with `useOptimistic`: if an action optimistically shows success immediately and then the action actually fails, returning an error from the action is what lets the UI roll back and explain what happened, instead of leaving the optimistic (wrong) state on screen forever."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "use-optimistic",
      "title": "Optimistic UI",
      "content": "\n# Optimistic UI with useOptimistic\n\n### What is it?\n**Building on Actions and state updates:** **`useOptimistic`** is a React 19 hook that lets you speculatively update the UI while a background mutation is in-flight, automatically rolling back if the request fails.\n\n> 💡 **Mental Model:** Think of optimistic UI like a barista calling out your name for a coffee before it's fully poured — it feels instant, but if the machine jams, they have to walk back and correct what they told you.\n\n### Why do we need it?\nIf a user clicks \"Like\", they shouldn't have to wait 2 seconds for the server to respond before the heart icon turns red. If the UI feels sluggish, users think your app is slow.\n\n### How?\nUpdate the UI immediately as if the action succeeded, then revert/replace with the real result when the server responds. This is the canonical pattern for any mutation (delete, like, add) in a connected app.\n\n### Syntax/Example\n```javascript\nconst [optimisticState, addOptimistic] = useOptimistic(\n  state,\n  // updateFn\n  (currentState, optimisticValue) => {\n    // merge and return new state with optimistic value\n    return [...currentState, optimisticValue];\n  }\n);\n```\n\n### Example\n```jsx\nimport { useState, useOptimistic } from 'react';\n\nfunction App() {\n  const [messages, setMessages] = useState(['Hello']);\n  const [optimisticMessages, addOptimisticMessage] = useOptimistic(\n    messages,\n    (state, newMsg) => [...state, newMsg]\n  );\n\n  async function action(formData) {\n    const msg = formData.get('msg');\n    addOptimisticMessage(msg + ' (sending...)');\n    await new Promise(r => setTimeout(r, 1000));\n    setMessages(prev => [...prev, msg]);\n  }\n\n  return (\n    <form action={action}>\n      {optimisticMessages.map((m, i) => <div key={i}>{m}</div>)}\n      <input name=\"msg\" />\n      <button>Send</button>\n    </form>\n  );\n}\n\nexport default App;\n```\n\n### Challenge and Solution\n**Challenge:** The starter code is missing the `useOptimistic` call. Add it so clicking a todo updates immediately without waiting 1.5 seconds.\n\n**Solution:** Add `const [optimisticTodos, toggleOptimistic] = useOptimistic(todos, (current, id) => current.map(t => t.id === id ? { ...t, done: !t.done } : t));` to `TodoList`. In `handleToggle`, call `toggleOptimistic(id)` before `await formAction(formData);`. Render `optimisticTodos` instead of `todos`.\n\n### Hints\n* **Automated Rollback:** If the server action throws an error, `useOptimistic` automatically reverts the state back to the \"real\" state when the action completes. You never need to write manual rollback logic!\n",
      "starterCode": "import { useState, useActionState } from 'react';\n\nconst initialTodos = [\n  { id: 1, text: 'Learn React', done: false },\n  { id: 2, text: 'Build something', done: false },\n];\n\nasync function toggleTodoAction(prevState, formData) {\n  const id = Number(formData.get('id'));\n  await new Promise(r => setTimeout(r, 1500));\n  return prevState.map(t => t.id === id ? { ...t, done: !t.done } : t);\n}\n\nexport default function TodoList() {\n  const [todos, formAction] = useActionState(toggleTodoAction, initialTodos);\n\n  async function handleToggle(formData) {\n    await formAction(formData);\n  }\n\n  return (\n    <ul style={{ padding: 20 }}>\n      {todos.map(todo => (\n        <li key={todo.id} style={{ opacity: todo.done ? 0.5 : 1 }}>\n          <form action={handleToggle}>\n            <input type=\"hidden\" name=\"id\" value={todo.id} />\n            <button type=\"submit\">\n              {todo.done ? '✓' : '○'} {todo.text}\n            </button>\n          </form>\n        </li>\n      ))}\n    </ul>\n  );\n}",
      "solutionCode": "import { useOptimistic, useActionState } from 'react';\n\nconst initialTodos = [\n  { id: 1, text: 'Learn React', done: false },\n  { id: 2, text: 'Build something', done: false },\n];\n\nasync function toggleTodoAction(prevState, formData) {\n  const id = Number(formData.get('id'));\n  await new Promise(r => setTimeout(r, 1500));\n  return prevState.map(t => t.id === id ? { ...t, done: !t.done } : t);\n}\n\nexport default function TodoList() {\n  const [todos, formAction] = useActionState(toggleTodoAction, initialTodos);\n  const [optimisticTodos, toggleOptimistic] = useOptimistic(\n    todos,\n    (current, id) => current.map(t => t.id === id ? { ...t, done: !t.done } : t)\n  );\n\n  async function handleToggle(formData) {\n    const id = Number(formData.get('id'));\n    toggleOptimistic(id);\n    await formAction(formData);\n  }\n\n  return (\n    <ul style={{ padding: 20 }}>\n      {optimisticTodos.map(todo => (\n        <li key={todo.id} style={{ opacity: todo.done ? 0.5 : 1 }}>\n          <form action={handleToggle}>\n            <input type=\"hidden\" name=\"id\" value={todo.id} />\n            <button type=\"submit\">\n              {todo.done ? '✓' : '○'} {todo.text}\n            </button>\n          </form>\n        </li>\n      ))}\n    </ul>\n  );\n}",
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
        "code": "export default function TodoList() {\n  const [todos, formAction] = useActionState(toggleTodoAction, initialTodos);\n  const [optimisticTodos, toggleOptimistic] = useOptimistic(\n    todos,\n    (current, id) => current.map(t => t.id === id ? { ...t, done: !t.done } : t)\n  );\n\n  async function handleToggle(formData) {\n    const id = Number(formData.get('id'));\n    toggleOptimistic(id);\n    await formAction(formData);\n  }\n\n  return (\n    <ul style={{ padding: 20 }}>\n      {optimisticTodos.map(todo => (\n        <li key={todo.id}>\n        {/* ... */}\n        </li>\n      ))}\n    </ul>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3,
              4,
              5,
              6
            ],
            "description": "`useOptimistic` takes two arguments: the real state to fall back to — the `todos` from `useActionState` — and a function describing how to apply one pending change on top of it.\n\nThat second argument is the whole design. It is a reducer, not a setter: it never touches `todos`, it produces a temporary view over it.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              9,
              10
            ],
            "description": "The handler passes only the *thing that changed* — the id — and the update function turns that into the new list. Calling it applies the change immediately, before the 1.5-second action has done anything.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              16
            ],
            "description": "We render `optimisticTodos` instead of `todos`. Now the UI reacts instantly, and when the action settles React drops the optimistic layer and falls back to the authoritative list.\n\nThe exact text output on the screen will be:\n`○ Learn React`\n`○ Build something`",
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
