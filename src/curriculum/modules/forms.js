export default {
  "id": "forms",
  "title": "Forms",
  "description": "Working with user input and validation",
  "icon": "Edit3",
  "lessons": [
    {
      "id": "controlled-inputs",
      "title": "Controlled Form Inputs",
      "content": "\n# Controlled Form Inputs\n\n### What is it?\n**Building on state and events:** We combine `value` props and `onChange` handlers to create **Controlled Components**—inputs whose values are entirely driven and owned by React state.\n\n> \ud83d\udca1 **Mental Model:** Think of a controlled input like a teleprompter: the screen (input) never decides what to display on its own — it only ever shows exactly what the script (state) currently says, and the moment the script changes, so does the screen.\n\n### Why do we need it?\nBy default, HTML `<input>` elements maintain their own internal state. In React, we want our component's state to be the \"single source of truth\". This makes it trivial to validate data, manipulate user input on the fly (e.g. phone number formatting), or send clean state payloads to an API.\n\n### How?\nWe bind the input's `value` prop directly to a React state variable, and update that state variable inside the `onChange` event.\n\n### Syntax/Example\n```jsx\nconst [text, setText] = useState('');\n\n// Binding the value and onChange handler\n<input value={text} onChange={(e) => setText(e.target.value)} />\n```\n\n### Example\n```jsx\nimport { useState } from 'react';\n\nfunction NameInput() {\n  const [name, setName] = useState('');\n  return (\n    <div>\n      <p>Hello, {name}!</p>\n      <input\n        value={name}\n        onChange={(e) => setName(e.target.value)}\n        placeholder=\"Enter your name\"\n      />\n    </div>\n  );\n}\n\nexport default NameInput;\n```\n\n### Challenge and Solution\n**Challenge:** The signup form currently has two uncontrolled inputs. Convert them to controlled components!\n\n**Solution:** Create two state variables (`name` and `email`). Bind the `value` of the first input to `{name}` and its `onChange` to `e => setName(e.target.value)`. Do the same for the email input in `SignupForm.jsx`.\n\n### Hints\n* You need to import `useState` and create two separate state hooks.\n* `e.target.value` gets the current text directly from the DOM event when the user types.\n",
      "starterCode": "import { useState } from 'react';\n\nexport default function SignupForm() {\n  // 👉 2. Create name and email state variables here!\n\n  const handleSubmit = (e) => {\n    e.preventDefault();\n    // In a real app, you'd send the state to an API here\n    alert(\"Submitted!\");\n  };\n\n  return (\n    <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300 }}>\n      <h3>Sign Up</h3>\n      \n      {/* 👉 3. Bind value and onChange for name */}\n      <input \n        type=\"text\" \n        placeholder=\"Name\" \n      />\n      \n      {/* 👉 4. Bind value and onChange for email */}\n      <input \n        type=\"email\" \n        placeholder=\"Email\" \n      />\n      \n      <button type=\"submit\">Submit</button>\n    </form>\n  );\n}",
      "solutionCode": "import { useState } from 'react';\n\nexport default function SignupForm() {\n  const [name, setName] = useState('');\n  const [email, setEmail] = useState('');\n\n  const handleSubmit = (e) => {\n    e.preventDefault();\n    alert(\"Submitted!\");\n  };\n\n  return (\n    <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300 }}>\n      <h3>Sign Up</h3>\n      \n      <input \n        type=\"text\" \n        value={name}\n        onChange={(e) => setName(e.target.value)}\n        placeholder=\"Name\" \n      />\n      \n      <input \n        type=\"email\" \n        value={email}\n        onChange={(e) => setEmail(e.target.value)}\n        placeholder=\"Email\" \n      />\n      \n      <button type=\"submit\">Submit</button>\n    </form>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\nfunction NameInput() {\n  const [name, setName] = useState('');\n  return (\n    <div>\n      <p>Hello, {name}!</p>\n      <input\n        value={name}\n        onChange={(e) => setName(e.target.value)}\n        placeholder=\"Enter your name\"\n      />\n    </div>\n  );\n}\n\nexport default NameInput;",
        "steps": [
          {
            "highlightLines": [
              4
            ],
            "description": "One piece of state, starting as an empty string. This is about to become the single source of truth for what the input displays.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              9
            ],
            "description": "The input's `value` prop is set from state, which is what makes this input **controlled**. It can no longer show anything except what `name` currently holds — the DOM is not allowed its own opinion about its contents.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10
            ],
            "description": "That would make the input read-only on its own, so `onChange` closes the loop: the user types, React reads `e.target.value`, state updates, the component re-renders, and the new `value` reaches the DOM.\n\nEvery keystroke makes that whole round trip. It feels instant, and it is why the `<p>` above can stay in step with the field for free.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7
            ],
            "description": "Type into the field and the greeting updates on the same keystroke, because both read the same state.\n\nBefore typing, the exact text output on the screen will be:\n`Hello, !`\n`[Input: Enter your name]`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useState } from 'react';\n\nexport default function SignupForm() {\n  const [name, setName] = useState('');\n  const [email, setEmail] = useState('');\n\n  const handleSubmit = (e) => {\n    e.preventDefault();\n    alert(\"Submitted!\");\n  };\n\n  return (\n    <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300 }}>\n      <h3>Sign Up</h3>\n      \n      <input \n        type=\"text\" \n        value={name}\n        onChange={(e) => setName(e.target.value)}\n        placeholder=\"Name\" \n      />\n      \n      <input \n        type=\"email\" \n        value={email}\n        onChange={(e) => setEmail(e.target.value)}\n        placeholder=\"Email\" \n      />\n      \n      <button type=\"submit\">Submit</button>\n    </form>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              4,
              5
            ],
            "description": "First, we create two separate state variables to hold our form data: `name` and `email`.\nThey both start as empty strings.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              18,
              19
            ],
            "description": "Next, we focus on the name input.\nBy explicitly setting the `value` prop, React overrides the browser's default behavior. The input will always display exactly what is in the `name` state variable.\n\nWhen the user types, the `onChange` event fires. We push the new raw value back into our state using `setName`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              25,
              26
            ],
            "description": "We do the exact same thing for the email input, binding it to the `email` and `setEmail` state.\n\nNow React has full control over both inputs!",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31
            ],
            "description": "The component renders smoothly.\n\nThe exact text output on the screen will be:\n`Sign Up`\n`[Input: Name]`\n`[Input: Email]`\n`[Button: Submit]`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why is my input frozen and un-typable?",
          "type": "misconception",
          "walkthrough": {
            "code": "const [name, setName] = useState('Alice');\n\n// This input is frozen!\n<input value={name} />",
            "steps": [
              {
                "highlightLines": [
                  4
                ],
                "description": "When you provide a `value` prop without an `onChange` handler, React strictly locks the input to that value. It physically prevents the user from typing."
              },
              {
                "highlightLines": [
                  1
                ],
                "description": "To fix it, you must add `onChange={(e) => setName(e.target.value)}` to feed the keystrokes back into the state."
              }
            ]
          }
        },
        {
          "title": "React Hook Form & Zod: Library Trade-offs",
          "type": "did-you-know",
          "walkthrough": {
            "code": "import { useForm } from 'react-hook-form';\nimport { zodResolver } from '@hookform/resolvers/zod';\nimport { z } from 'zod';\n\nconst schema = z.object({\n  email: z.string().email(),\n  age: z.number().min(18)\n});\n\nconst { register, handleSubmit } = useForm({\n  resolver: zodResolver(schema)\n});",
            "steps": [
              {
                "highlightLines": [
                  5,
                  6,
                  7,
                  8
                ],
                "description": "In production, managing 20 different `useState` setters and manual error strings gets cumbersome."
              },
              {
                "highlightLines": [
                  10,
                  11,
                  12
                ],
                "description": "Libraries like `react-hook-form` use uncontrolled inputs under the hood for zero-re-render performance, paired with `zod` schema validation for complete end-to-end type safety!"
              }
            ]
          }
        },
        {
          "title": "Why does my cursor jump to the end of the input?",
          "type": "misconception",
          "walkthrough": {
            "code": "const [text, setText] = useState('abc');\n// You type in the middle of the word...\n<input value={text.toUpperCase()} onChange={...} />",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "If you modify the input value (like forcing uppercase) during the render cycle, React loses track of where the user's text cursor was."
              },
              {
                "highlightLines": [
                  3
                ],
                "description": "When React repaints the input with the forced uppercase string, the browser automatically shoves the cursor to the very end of the box, ruining the typing experience!"
              }
            ]
          }
        },
        {
          "title": "Controlled Inputs vs React 19 Form Actions",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// 1. Live Validation / Masking: Controlled State\n<input value={phone} onChange={e => setPhone(formatPhone(e.target.value))} />\n\n// 2. Submission & Mutation: React 19 Actions\n<form action={saveProfile}><input name=\"phone\" /></form>",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "Controlled inputs remain essential when you need real-time input masking, live autocomplete suggestions, or dynamic disabled states based on character count."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "For standard form submission and API mutations without live keystroke validation, React 19 Actions and native FormData eliminate controlled state boilerplate completely!"
              }
            ]
          }
        },
        {
          "title": "Feel the difference: an uncontrolled version of this exact form",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Controlled: React holds the value, re-renders on every keystroke\nfunction ControlledForm() {\n  const [name, setName] = useState('');\n  return <input value={name} onChange={e => setName(e.target.value)} />;\n}\n\n// Uncontrolled: the DOM holds the value, React reads it only when asked\nfunction UncontrolledForm() {\n  const inputRef = useRef(null);\n  function handleSubmit(e) {\n    e.preventDefault();\n    alert('Submitted: ' + inputRef.current.value);\n  }\n  return (\n    <form onSubmit={handleSubmit}>\n      <input ref={inputRef} defaultValue=\"\" />\n      <button type=\"submit\">Submit</button>\n    </form>\n  );\n}",
            "steps": [
              {
                "highlightLines": [2, 3, 4],
                "description": "The controlled version re-renders `ControlledForm` on every single keystroke — `value` is always in sync with React state, which is exactly what live validation, character counters, or input masking need."
              },
              {
                "highlightLines": [8, 9, 10, 11, 12, 13, 14, 15, 16],
                "description": "The uncontrolled version never re-renders while typing. The DOM input manages its own value the normal browser way; React only reaches in and reads `inputRef.current.value` at the one moment it actually needs it — on submit. `defaultValue` sets the *initial* value only, unlike `value`, which would fight the DOM for control on every keystroke."
              },
              {
                "highlightLines": [],
                "description": "This is the same trade-off `react-hook-form` makes internally, mentioned in this lesson's library card above: for a large form with no live-validation needs, uncontrolled inputs avoid a re-render per keystroke entirely. The cost is that you lose the ability to react to each change as it happens — reach for controlled inputs the moment you need that."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "form-controls",
      "title": "Select, Checkbox & Radio Inputs",
      "content": "\n# Select, Checkbox & Radio Inputs\n\n### What is it?\n**Building on controlled text inputs:** Not all form inputs use `value` and text strings. Checkboxes use boolean `checked` attributes, `<select>` elements control dropdown options, and radio buttons represent mutually exclusive choices in a group.\n\n> \ud83d\udca1 **Mental Model:** Think of these form controls like light switches versus dimmer knobs: a checkbox is a simple on/off switch, a radio group is a bank of switches where only one can be on, and a select is a dial that snaps to one labeled position \u2014 React just needs to know which position is currently selected.\n\n### Why do we need it?\nReal applications involve diverse input types. A common beginner bug is reading `e.target.value` on a checkbox (which returns string `\"on\"` instead of a boolean!), or forgetting to bind `checked` to state.\n\n### How?\n- **Checkboxes:** Use `checked={isSubscribed}` and read `e.target.checked` in `onChange`.\n- **Select Dropdowns:** Put `value={selectedRole}` and `onChange={e => setSelectedRole(e.target.value)}` directly on the `<select>` tag (not on the `<option>` tags).\n- **Radio Groups:** Give each radio input the same `name` attribute, set `checked={plan === 'pro'}`, and update state with `onChange={() => setPlan('pro')}`.\n\n### Syntax/Example\n```jsx\nfunction Controls({ agree, setAgree, role, setRole }) {\n  return (\n    <>\n      {/* Checkbox: checked + e.target.checked */}\n      <input\n        type=\"checkbox\"\n        checked={agree}\n        onChange={e => setAgree(e.target.checked)}\n      />\n\n      {/* Select dropdown: value on the select itself */}\n      <select value={role} onChange={e => setRole(e.target.value)}>\n        <option value=\"user\">User</option>\n        <option value=\"admin\">Admin</option>\n      </select>\n    </>\n  );\n}\n```\n\n### Example\n```jsx\nimport { useState } from 'react';\n\nfunction PreferencesForm() {\n  const [newsletter, setNewsletter] = useState(false);\n  const [theme, setTheme] = useState('dark');\n\n  return (\n    <div style={{ padding: 20 }}>\n      <label>\n        <input\n          type=\"checkbox\"\n          checked={newsletter}\n          onChange={e => setNewsletter(e.target.checked)}\n        />\n        Subscribe to newsletter\n      </label>\n      <br /><br />\n      <label>\n        Theme:\n        <select value={theme} onChange={e => setTheme(e.target.value)}>\n          <option value=\"light\">Light</option>\n          <option value=\"dark\">Dark</option>\n        </select>\n      </label>\n      <p>Theme: {theme} | Subscribed: {newsletter ? 'Yes' : 'No'}</p>\n    </div>\n  );\n}\n\nexport default PreferencesForm;\n```\n\n### Challenge and Solution\n**Challenge:** Wire up the settings form! The checkbox for terms agreement and the select dropdown for role are currently uncontrolled. Add state variables for `agree` (boolean) and `role` (string), bind their props, and update them on change.\n\n**Solution:** Create `const [agree, setAgree] = useState(false);` and `const [role, setRole] = useState('member');`. Bind `<input type=\"checkbox\" checked={agree} onChange={e => setAgree(e.target.checked)} />` and `<select value={role} onChange={e => setRole(e.target.value)}>`. Disable the submit button when `!agree`.\n\n### Hints\n* For checkboxes: ALWAYS use `checked` instead of `value`, and read `e.target.checked`.\n* For `<select>`: place `value` and `onChange` on the `<select>` tag itself, not individual `<option>` elements.\n",
      "starterCode": "import { useState } from 'react';\n\nexport default function SettingsForm() {\n  // 👉 1. Declare state for agree (boolean) and role (string)\n\n  return (\n    <form onSubmit={e => { e.preventDefault(); alert('Saved!'); }} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 }}>\n      <h3>Account Settings</h3>\n\n      <label>\n        Account Role:\n        {/* 👉 2. Bind value and onChange on select */}\n        <select style={{ marginLeft: 8 }}>\n          <option value=\"member\">Member</option>\n          <option value=\"admin\">Admin</option>\n          <option value=\"owner\">Owner</option>\n        </select>\n      </label>\n\n      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>\n        {/* 👉 3. Bind checked and onChange on checkbox */}\n        <input type=\"checkbox\" />\n        I agree to the terms of service\n      </label>\n\n      {/* 👉 4. Disable button unless agree is true */}\n      <button type=\"submit\">Save Settings</button>\n    </form>\n  );\n}",
      "solutionCode": "import { useState } from 'react';\n\nexport default function SettingsForm() {\n  const [agree, setAgree] = useState(false);\n  const [role, setRole] = useState('member');\n\n  return (\n    <form onSubmit={e => { e.preventDefault(); alert('Saved!'); }} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 }}>\n      <h3>Account Settings</h3>\n\n      <label>\n        Account Role:\n        <select value={role} onChange={e => setRole(e.target.value)} style={{ marginLeft: 8 }}>\n          <option value=\"member\">Member</option>\n          <option value=\"admin\">Admin</option>\n          <option value=\"owner\">Owner</option>\n        </select>\n      </label>\n\n      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>\n        <input \n          type=\"checkbox\" \n          checked={agree} \n          onChange={e => setAgree(e.target.checked)} \n        />\n        I agree to the terms of service\n      </label>\n\n      <button type=\"submit\" disabled={!agree}>Save Settings</button>\n    </form>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\nfunction PreferencesForm() {\n  const [newsletter, setNewsletter] = useState(false);\n  const [theme, setTheme] = useState('dark');\n\n  return (\n    <div style={{ padding: 20 }}>\n      <label>\n        <input\n          type=\"checkbox\"\n          checked={newsletter}\n          onChange={e => setNewsletter(e.target.checked)}\n        />\n        Subscribe to newsletter\n      </label>\n      <br /><br />\n      <label>\n        Theme:\n        <select value={theme} onChange={e => setTheme(e.target.value)}>\n          <option value=\"light\">Light</option>\n          <option value=\"dark\">Dark</option>\n        </select>\n      </label>\n      <p>Theme: {theme} | Subscribed: {newsletter ? 'Yes' : 'No'}</p>\n    </div>\n  );\n}\n\nexport default PreferencesForm;",
        "steps": [
          {
            "highlightLines": [
              4,
              12,
              13
            ],
            "description": "A checkbox is controlled through `checked`, not `value`, and the handler reads `e.target.checked` — a boolean — rather than `e.target.value`.\n\nReaching for `e.target.value` on a checkbox is the classic mistake here: it returns the string `\"on\"` regardless of whether the box is ticked.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              5,
              20
            ],
            "description": "A `<select>` is controlled by putting `value` on the **select itself**, not by marking one `<option>` as `selected`. React finds the matching option and selects it for you.\n\nThis is one of the places React deliberately departs from the HTML API, and it is worth knowing rather than discovering.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              25
            ],
            "description": "Both controls feed ordinary state, so reading their current values is just reading variables — no DOM queries anywhere.\n\nThe exact text output on the screen will be:\n`[Checkbox: unticked] Subscribe to newsletter`\n`Theme: [Select: Dark]`\n`Theme: dark | Subscribed: No`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "const [agree, setAgree] = useState(false);\nconst [role, setRole] = useState('member');\n\n<select value={role} onChange={e => setRole(e.target.value)}>\n  <option value=\"member\">Member</option>\n  <option value=\"admin\">Admin</option>\n</select>\n\n<input \n  type=\"checkbox\" \n  checked={agree} \n  onChange={e => setAgree(e.target.checked)} \n/>\n<button type=\"submit\" disabled={!agree}>Save Settings</button>",
        "steps": [
          {
            "highlightLines": [
              1,
              2
            ],
            "description": "We initialize `agree` as boolean `false` and `role` as string `'member'`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              4
            ],
            "description": "We bind the `<select>` to `role` state with `onChange={e => setRole(e.target.value)}`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              11,
              12,
              14
            ],
            "description": "We bind `checked={agree}` and `onChange={e => setAgree(e.target.checked)}`, and disable the submit button until agreed.",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why does e.target.value on checkbox return 'on'?",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ Bug: 'on' is always truthy in JavaScript!\nconst handleChange = (e) => {\n  setChecked(e.target.value); // returns 'on' even when unchecked!\n};\n\n// ✅ Correct\nconst handleCorrectChange = (e) => {\n  setChecked(e.target.checked); // returns true or false\n};",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "In HTML standards, an `<input type=\"checkbox\">` returns the string `'on'` for its `value` attribute regardless of whether it is checked or not!"
              },
              {
                "highlightLines": [
                  8
                ],
                "description": "Always read `e.target.checked` for checkboxes to get a true boolean `true` or `false`."
              }
            ]
          }
        },
        {
          "title": "Do I put 'selected' attribute on <option>?",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ HTML way (Avoid in React)\n<select>\n  <option selected={role === 'admin'}>Admin</option>\n</select>\n\n// ✅ React way\n<select value={role} onChange={e => setRole(e.target.value)}>\n  <option value=\"admin\">Admin</option>\n</select>",
            "steps": [
              {
                "highlightLines": [
                  3
                ],
                "description": "In plain HTML, you put `selected` on the `<option>`. In React, this is an anti-pattern."
              },
              {
                "highlightLines": [
                  7
                ],
                "description": "React simplifies this by allowing a single `value` prop on the parent `<select>` element, keeping state binding clean and centralized."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "form-validation",
      "title": "Client-Side Validation",
      "content": "\n# Client-Side Validation\n\n### What is it?\n**Building on controlled inputs:** Validating user input instantly on the client side before sending it to the server.\n\n> 💡 **Mental Model:** Think of client-side validation like a doorman politely stopping you before you walk into the wrong building — it's helpful and saves you a trip, but the real security check (server-side validation) still happens once you're actually let in.\n\n### Why do we need it?\nClient-side validation provides immediate feedback to the user, improving the user experience and preventing bad data from being submitted unnecessarily.\n\n### How?\nBecause controlled components re-render on state changes, we can calculate validation errors on the fly during the render cycle. We can then use these errors to conditionally display messages or disable the submit button.\n\n### Syntax/Example\n```jsx\nfunction SubmitButton({ password }) {\n  const isInvalid = password.length < 8;\n\n  return (\n    <button disabled={isInvalid}>Submit</button>\n  );\n}\n```\n\n### Example\n```jsx\nimport { useState } from 'react';\n\nfunction AgeForm() {\n  const [age, setAge] = useState('');\n  const error = age && age < 18 ? 'Must be 18 or older' : '';\n\n  return (\n    <div>\n      <input type=\"number\" value={age} onChange={e => setAge(e.target.value)} />\n      {error && <span style={{color: 'red'}}>{error}</span>}\n    </div>\n  );\n}\n\nexport default AgeForm;\n```\n\n### Challenge and Solution\n**Challenge:** The form has an `error` state variable, but it's not being shown. Conditionally render it, and also conditionally disable the submit button if the inputs are invalid.\n\n**Solution:** Add `{error && <span>...</span>}` to conditionally render the error in `SignupForm.jsx`. Create a variable `const isInvalid = !name || !email.includes('@');` and add `disabled={isInvalid}` to the submit button.\n\n### Hints\n* You can use the logical AND operator `&&` to render an element only if a condition is true.\n* The HTML `<button>` element has a standard `disabled` attribute that you can bind to a boolean variable.\n",
      "starterCode": "import { useState } from 'react';\n\nexport default function SignupForm() {\n  const [name, setName] = useState('');\n  const [email, setEmail] = useState('');\n  const [error, setError] = useState('');\n\n  const handleSubmit = (e) => {\n    e.preventDefault();\n    if (!name || !email.includes('@')) {\n      setError('Please provide a valid name and email.');\n      return;\n    }\n    setError('');\n    alert(\"Submitted!\");\n  };\n\n  return (\n    <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300 }}>\n      <h3>Sign Up</h3>\n      \n      {/* 👉 2. Conditionally render the error here if one exists! */}\n      <span style={{ color: 'red', fontSize: '0.9em' }}>{error}</span>\n\n      <input \n        value={name}\n        onChange={e => setName(e.target.value)}\n        placeholder=\"Name\" \n      />\n      \n      <input \n        value={email}\n        onChange={e => setEmail(e.target.value)}\n        placeholder=\"Email\" \n      />\n      \n      {/* 👉 3. Disable this button if validation fails */}\n      <button type=\"submit\">Submit</button>\n    </form>\n  );\n}",
      "solutionCode": "import { useState } from 'react';\n\nexport default function SignupForm() {\n  const [name, setName] = useState('');\n  const [email, setEmail] = useState('');\n  const [error, setError] = useState('');\n\n  const handleSubmit = (e) => {\n    e.preventDefault();\n    if (!name || !email.includes('@')) {\n      setError('Please provide a valid name and email.');\n      return;\n    }\n    setError('');\n    alert(\"Submitted!\");\n  };\n\n  const isInvalid = !name || !email.includes('@');\n\n  return (\n    <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300 }}>\n      <h3>Sign Up</h3>\n      \n      {error && <span style={{ color: 'red', fontSize: '0.9em' }}>{error}</span>}\n\n      <input \n        value={name}\n        onChange={e => setName(e.target.value)}\n        placeholder=\"Name\" \n      />\n      \n      <input \n        value={email}\n        onChange={e => setEmail(e.target.value)}\n        placeholder=\"Email\" \n      />\n      \n      <button type=\"submit\" disabled={isInvalid}>Submit</button>\n    </form>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\nfunction AgeForm() {\n  const [age, setAge] = useState('');\n  const error = age && age < 18 ? 'Must be 18 or older' : '';\n\n  return (\n    <div>\n      <input type=\"number\" value={age} onChange={e => setAge(e.target.value)} />\n      {error && <span style={{color: 'red'}}>{error}</span>}\n    </div>\n  );\n}\n\nexport default AgeForm;",
        "steps": [
          {
            "highlightLines": [
              5
            ],
            "description": "We derive our validation error directly during the render cycle.\nIf the age exists and is less than 18, we set an error string. Otherwise, we set it to an empty string.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10
            ],
            "description": "We use the logical AND (`&&`) operator to conditionally render the error span.\nIf `error` is an empty string (falsy), nothing renders!\n\nThe exact text output on the screen will be:\n`[Input]`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useState } from 'react';\n\nexport default function SignupForm() {\n  const [name, setName] = useState('');\n  const [email, setEmail] = useState('');\n  const [error, setError] = useState('');\n\n  const handleSubmit = (e) => {\n    e.preventDefault();\n    if (!name || !email.includes('@')) {\n      setError('Please provide a valid name and email.');\n      return;\n    }\n    setError('');\n    alert(\"Submitted!\");\n  };\n\n  const isInvalid = !name || !email.includes('@');\n\n  return (\n    <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300 }}>\n      <h3>Sign Up</h3>\n      \n      {error && <span style={{ color: 'red', fontSize: '0.9em' }}>{error}</span>}\n\n      <input \n        value={name}\n        onChange={e => setName(e.target.value)}\n        placeholder=\"Name\" \n      />\n      \n      <input \n        value={email}\n        onChange={e => setEmail(e.target.value)}\n        placeholder=\"Email\" \n      />\n      \n      <button type=\"submit\" disabled={isInvalid}>Submit</button>\n    </form>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              18
            ],
            "description": "First, we declare a variable `isInvalid` right in the component body.\nBecause React re-renders the component on every keystroke, we can calculate our validation rules on the fly during the render cycle.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              38
            ],
            "description": "Next, we use our `isInvalid` boolean to control the submit button.\nBy binding the native `disabled` attribute to this variable, we completely lock down the form submission until the rules are met.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              24
            ],
            "description": "Finally, we handle the error message.\nWe use logical AND (`&&`) to render the error span only if the `error` string is set by the form submission logic.\n\nNotice how we combine both real-time validation (disabling the button) and post-submit validation (showing the error text)!",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39
            ],
            "description": "The component renders smoothly.\n\nThe exact text output on the screen will be:\n`Sign Up`\n`[Input: Name]`\n`[Input: Email]`\n`[Button: Submit]`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Should I validate on every keystroke?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "<input \n  onChange={e => {\n    setValue(e.target.value);\n    validate(e.target.value); // Might be annoying!\n  }}\n/>",
            "steps": [
              {
                "highlightLines": [
                  4
                ],
                "description": "Validating on every keystroke can annoy users by showing big red errors before they even finish typing."
              },
              {
                "highlightLines": [
                  4
                ],
                "description": "A better pattern is to validate `onBlur` (when they click away from the input) or wait until they click Submit."
              }
            ]
          }
        },
        {
          "title": "Can I just rely on HTML5 validation?",
          "type": "misconception",
          "walkthrough": {
            "code": "<form>\n  <input type=\"email\" required />\n  <button type=\"submit\">Go</button>\n</form>",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "HTML5 validation (`required`, `type='email'`) is fantastic for basic, built-in browser checks. But it has serious limits."
              },
              {
                "highlightLines": [
                  2
                ],
                "description": "You cannot easily style the default browser tooltips, you can't run asynchronous checks (like 'is this username taken?'), and the behavior varies across browsers. Real-world apps almost always use custom JS validation."
              }
            ]
          }
        },
        {
          "title": "Preventing the dreaded page reload",
          "type": "misconception",
          "walkthrough": {
            "code": "function onSubmit(e) {\n  e.preventDefault();\n  // process form...\n}",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "HTML forms have a default behavior built in since the 1990s: when submitted, they immediately refresh the page and append the data to the URL."
              },
              {
                "highlightLines": [
                  2
                ],
                "description": "In a React Single Page Application, this wipes out all your memory and state. You MUST call `e.preventDefault()` as the very first line of any form submission handler!"
              }
            ]
          }
        },
        {
          "title": "UX Best Practice: Instant Error Clearing on Keystroke",
          "type": "did-you-know",
          "walkthrough": {
            "code": "const handleChange = (e) => {\n  const val = e.target.value;\n  setPassword(val);\n  if (error && val.length >= 6) {\n    setError(''); // Clear error as soon as user fixes it!\n  }\n};",
            "steps": [
              {
                "highlightLines": [
                  4,
                  5
                ],
                "description": "Once an error is displayed, clearing it immediately when the user meets the requirements provides instant, rewarding positive feedback."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "per-field-validation",
      "title": "Per-Field Errors & onBlur Validation",
      "content": "\n# Per-Field Errors & onBlur Validation\n\n### What is it?\n**Building on form controls and validation:** Rather than a single global error banner or annoying instant errors on every keystroke, professional forms track **per-field errors** and a **`touched`** state to show validation messages when a user blurs (leaves) an input.\n\n> 💡 **Mental Model:** Think of per-field validation like airport security lanes: each traveler (field) gets checked individually and told exactly what's wrong with their own bag — nobody has to wait for the whole terminal to be inspected before finding out their laptop wasn't out.\n\n### Why do we need it?\nShowing a red error *while* a user is still typing their email is frustrating UX. Validating `onBlur` (when focus leaves the input) or displaying errors only for touched fields gives a polished, user-friendly experience.\n\n### How?\n1. Store form fields in an object: `const [values, setValues] = useState({ email: '', password: '' });`\n2. Store touched state: `const [touched, setTouched] = useState({});`\n3. Derive errors during render: `const errors = { email: !values.email.includes('@') ? 'Invalid email' : '' };`\n4. Display error only if `touched.email && errors.email`.\n\n### Syntax/Example\n```jsx\n<input \n  value={values.email}\n  onChange={e => setValues({ ...values, email: e.target.value })}\n  onBlur={() => setTouched({ ...touched, email: true })}\n/>\n{touched.email && errors.email && <span className=\"error\">{errors.email}</span>}\n```\n\n### Example\n```jsx\nimport { useState } from 'react';\n\nexport default function LoginForm() {\n  const [values, setValues] = useState({ email: '', password: '' });\n  const [touched, setTouched] = useState({});\n\n  const errors = {\n    email: !values.email ? 'Email required' : !values.email.includes('@') ? 'Invalid email' : '',\n    password: !values.password ? 'Password required' : values.password.length < 6 ? 'Min 6 chars' : ''\n  };\n\n  return (\n    <div style={{ padding: 20 }}>\n      <div>\n        <input\n          value={values.email}\n          onChange={e => setValues(v => ({ ...v, email: e.target.value }))}\n          onBlur={() => setTouched(t => ({ ...t, email: true }))}\n          placeholder=\"Email\"\n        />\n        {touched.email && errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}\n      </div>\n      <div>\n        <input\n          type=\"password\"\n          value={values.password}\n          onChange={e => setValues(v => ({ ...v, password: e.target.value }))}\n          onBlur={() => setTouched(t => ({ ...t, password: true }))}\n          placeholder=\"Password\"\n        />\n        {touched.password && errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}\n      </div>\n    </div>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** Implement the touched and per-field error pattern for the password field! Currently password shows errors immediately. Update it to only show `errors.password` when `touched.password` is true, and set `touched.password = true` on `onBlur`.\n\n**Solution:** Add `onBlur={() => setTouched(t => ({ ...t, password: true }))}` to the password `<input>`. Render the error conditionally with `{touched.password && errors.password && <span style={{ color: 'red' }}>{errors.password}</span>}`.\n\n### Hints\n* `onBlur` fires when the input loses focus (the user clicks outside or tabs away).\n* Use `{touched[fieldName] && errors[fieldName] && <span>...</span>}` to avoid yelling at the user before they finish interacting with the field.\n",
      "starterCode": "import { useState } from 'react';\n\nexport default function RegistrationForm() {\n  const [values, setValues] = useState({ email: '', password: '' });\n  const [touched, setTouched] = useState({});\n\n  const errors = {\n    email: !values.email.includes('@') ? 'Valid email is required.' : '',\n    password: values.password.length < 6 ? 'Password must be at least 6 characters.' : ''\n  };\n\n  const handleBlur = (field) => {\n    setTouched(prev => ({ ...prev, [field]: true }));\n  };\n\n  return (\n    <form onSubmit={e => e.preventDefault()} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 }}>\n      <h3>Register</h3>\n\n      <div>\n        <input \n          value={values.email} \n          onChange={e => setValues(v => ({ ...v, email: e.target.value }))}\n          onBlur={() => handleBlur('email')}\n          placeholder=\"Email\"\n        />\n        {touched.email && errors.email && <span style={{ color: 'red', fontSize: '0.85rem', display: 'block' }}>{errors.email}</span>}\n      </div>\n\n      <div>\n        {/* 👉 1. Add onBlur handler to password input */}\n        <input \n          type=\"password\"\n          value={values.password} \n          onChange={e => setValues(v => ({ ...v, password: e.target.value }))}\n          placeholder=\"Password\"\n        />\n        {/* 👉 2. Show error ONLY when touched.password AND errors.password exist */}\n        <span style={{ color: 'red', fontSize: '0.85rem', display: 'block' }}>{errors.password}</span>\n      </div>\n\n      <button type=\"submit\">Create Account</button>\n    </form>\n  );\n}",
      "solutionCode": "import { useState } from 'react';\n\nexport default function RegistrationForm() {\n  const [values, setValues] = useState({ email: '', password: '' });\n  const [touched, setTouched] = useState({});\n\n  const errors = {\n    email: !values.email.includes('@') ? 'Valid email is required.' : '',\n    password: values.password.length < 6 ? 'Password must be at least 6 characters.' : ''\n  };\n\n  const handleBlur = (field) => {\n    setTouched(prev => ({ ...prev, [field]: true }));\n  };\n\n  return (\n    <form onSubmit={e => e.preventDefault()} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 }}>\n      <h3>Register</h3>\n\n      <div>\n        <input \n          value={values.email} \n          onChange={e => setValues(v => ({ ...v, email: e.target.value }))}\n          onBlur={() => handleBlur('email')}\n          placeholder=\"Email\"\n        />\n        {touched.email && errors.email && <span style={{ color: 'red', fontSize: '0.85rem', display: 'block' }}>{errors.email}</span>}\n      </div>\n\n      <div>\n        <input \n          type=\"password\"\n          value={values.password} \n          onChange={e => setValues(v => ({ ...v, password: e.target.value }))}\n          onBlur={() => handleBlur('password')}\n          placeholder=\"Password\"\n        />\n        {touched.password && errors.password && <span style={{ color: 'red', fontSize: '0.85rem', display: 'block' }}>{errors.password}</span>}\n      </div>\n\n      <button type=\"submit\">Create Account</button>\n    </form>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\nexport default function LoginForm() {\n  const [values, setValues] = useState({ email: '', password: '' });\n  const [touched, setTouched] = useState({});\n\n  const errors = {\n    email: !values.email ? 'Email required' : !values.email.includes('@') ? 'Invalid email' : '',\n    password: !values.password ? 'Password required' : values.password.length < 6 ? 'Min 6 chars' : ''\n  };\n\n  return (\n    <div style={{ padding: 20 }}>\n      <div>\n        <input\n          value={values.email}\n          onChange={e => setValues(v => ({ ...v, email: e.target.value }))}\n          onBlur={() => setTouched(t => ({ ...t, email: true }))}\n          placeholder=\"Email\"\n        />\n        {touched.email && errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}\n      </div>\n      <div>\n        <input\n          type=\"password\"\n          value={values.password}\n          onChange={e => setValues(v => ({ ...v, password: e.target.value }))}\n          onBlur={() => setTouched(t => ({ ...t, password: true }))}\n          placeholder=\"Password\"\n        />\n        {touched.password && errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}\n      </div>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              7,
              8,
              9,
              10
            ],
            "description": "The errors are **derived during render** from the current values, not stored in their own state. There is nothing to keep in sync and nothing that can go stale — recompute, and the answer is right by construction.\n\nStoring errors in state instead means every code path that changes a value has to remember to revalidate. Most bugs in hand-rolled forms live in the paths that forgot.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              5,
              18,
              28
            ],
            "description": "`touched` is real state, and it is a different question from `errors`: not \"is this field valid\" but \"has the user finished with this field yet\".\n\n`onBlur` answers it. Leaving a field marks it touched, and each field is tracked separately — which is what makes the errors per-field rather than per-form.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              21,
              31
            ],
            "description": "`touched.email && errors.email && ...` is the whole point of the pattern. An empty form is invalid from the first render, but shouting \"Email required\" at someone who has not typed anything yet is hostile.\n\nSo validity is computed immediately and *displayed* only once the user has been given a chance. Click into the email field, then click out of it, and the message appears.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              13,
              33
            ],
            "description": "Both fields follow the same shape, so adding a third is mechanical rather than a redesign.\n\nOn first render nothing has been touched, so the exact text output on the screen will be:\n`[Input: Email]`\n`[Input: Password]`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "const handleBlur = (field) => {\n  setTouched(prev => ({ ...prev, [field]: true }));\n};\n\n<input \n  type=\"password\"\n  value={values.password} \n  onChange={e => setValues(v => ({ ...v, password: e.target.value }))}\n  onBlur={() => handleBlur('password')}\n  placeholder=\"Password\"\n/>\n{touched.password && errors.password && <span style={{ color: 'red' }}>{errors.password}</span>}",
        "steps": [
          {
            "highlightLines": [
              1,
              2,
              3
            ],
            "description": "We use a helper `handleBlur('password')` to mark the password field as visited.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              9
            ],
            "description": "We attach `onBlur={() => handleBlur('password')}` to the password input.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              12
            ],
            "description": "We conditionally render the error with `{touched.password && errors.password && ...}`.",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why is derived errors better than setErrors in useState?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// ❌ Redundant state synchronization\nconst [errors, setErrors] = useState({});\nuseEffect(() => {\n  setErrors(validate(values));\n}, [values]);\n\n// ✅ Derived state during render (0 extra renders!)\nconst errors = validate(values);",
            "steps": [
              {
                "highlightLines": [
                  2,
                  3,
                  4
                ],
                "description": "Storing errors in `useState` and updating them in `useEffect` causes laggy out-of-sync frames and extra re-renders."
              },
              {
                "highlightLines": [
                  7
                ],
                "description": "Since `values` triggers a re-render anyway, computing `errors` directly in the component body during render is instantaneous and zero-cost!"
              }
            ]
          }
        },
        {
          "title": "Accessible Form Validation with ARIA Attributes",
          "type": "did-you-know",
          "walkthrough": {
            "code": "<input\n  id=\"email\"\n  value={email}\n  aria-invalid={!!errors.email}\n  aria-describedby={errors.email ? 'email-err' : undefined}\n/>\n{errors.email && <p id=\"email-err\" role=\"alert\">{errors.email}</p>}",
            "steps": [
              {
                "highlightLines": [
                  4,
                  5
                ],
                "description": "`aria-invalid` informs screen readers whether the input is valid, while `aria-describedby` links the input directly to the error message text."
              },
              {
                "highlightLines": [
                  7
                ],
                "description": "Adding `role='alert'` causes assistive technologies to announce the validation error immediately when it appears."
              }
            ]
          }
        }
      ]
    }
  ]
};
