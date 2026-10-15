export default {
  "id": "ts-fundamentals",
  "title": "TypeScript Fundamentals",
  "description": "The language itself, before pointing it at React.",
  "icon": "FileType2",
  "lessons": [
    {
      "id": "ts-annotations",
      "title": "Annotations and Inference",
      "content": "\n# Annotations and Inference\n\n### What is it?\nTypeScript is JavaScript plus a description of what each value is allowed to be. An **annotation** states that description by hand — `const count: number = 0` — and **inference** is TypeScript working it out from the value you already assigned.\n\n> 💡 **Mental Model:** Types are labels on shipping crates. They change nothing about what is inside; they exist so someone can be told, before the truck leaves, that a crate marked *fragile* got loaded under one marked *anvil*.\n\n### Why do we need it?\nPlain JavaScript reports a mistake at the moment the wrong value is used — in a browser, in front of a user, possibly months after the mistake was written. TypeScript reports the same mistake while you are typing it. Nothing else about your program changes: the types are deleted before the code ever runs.\n\nThat deletion is worth stating plainly, because it is the source of most early confusion. There is no runtime type checking here. A `: string` annotation does not stop a JSON response from handing you a number — it only stops *your own code* from claiming that it will.\n\n### How?\nAn annotation is a colon and a type after the name:\n\n- Primitives: `string`, `number`, `boolean`, and (rarely written by hand) `null` and `undefined`.\n- Arrays: `string[]` — an array whose every element is a string.\n- Functions: annotate each parameter, and the return type when it is worth stating.\n\nThen, crucially, **stop**. `const version = 2` is already `number`; writing `const version: number = 2` adds characters and no information. The house rule in most codebases is: annotate what crosses a boundary — function parameters, exported values, empty containers — and let inference handle the rest.\n\n### Syntax/Example\n```tsx\nconst title: string = 'ReactLab';   // annotated, but needlessly\nconst version = 2;                  // inferred as number\nconst tags: string[] = [];          // annotated, and necessarily: [] alone is never[]\n\nfunction shout(text: string): string {\n  return text.toUpperCase();\n}\n```\n\n### Example\n```tsx\nimport { useState } from 'react';\n\n// Annotated, because an empty-looking literal gives TypeScript nothing to go on.\nconst currencies: string[] = ['USD', 'EUR', 'GBP'];\n\n// The return type is inferred as number. Writing ': number' would add nothing.\nfunction toCents(amount: number) {\n  return Math.round(amount * 100);\n}\n\nexport default function App() {\n  // useState infers number from the initial value, 0.\n  const [amount, setAmount] = useState(0);\n  const [currency, setCurrency] = useState(currencies[0]);\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 8, justifyItems: 'start' }}>\n      <input\n        type=\"number\"\n        value={amount}\n        onChange={(e) => setAmount(Number(e.target.value))}\n      />\n      <select value={currency} onChange={(e) => setCurrency(e.target.value)}>\n        {currencies.map((code) => <option key={code}>{code}</option>)}\n      </select>\n      <p>{toCents(amount)} cents in {currency}</p>\n    </div>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** This file is valid JavaScript and unchecked TypeScript. Annotate `labels` as an array of strings, annotate both parameters of `format` along with its return type — and deliberately leave the `useState` call alone, because it already knows.\n\n**Solution:** Write `const labels: string[] = [];` and `function format(price: number, label: string): string {`. The state line stays exactly as it is: `useState(0)` infers `number`, and `useState<number>(0)` would only repeat it.\n\n### Hints\n* An empty array literal is the one container that inference cannot help with — with nothing inside, there is nothing to generalise from.\n* `price.toFixed(2)` is the clue for the second annotation: only a number has `toFixed`.\n* If an annotation would simply restate the value on the same line, leave it out.\n",
      "starterCode": "import { useState } from 'react';\n\n// 👉 1. Annotate labels as an array of strings\nconst labels = [];\n\n// 👉 2. Annotate both parameters and the return type of format\nfunction format(price, label) {\n  return label + ': $' + price.toFixed(2);\n}\n\nexport default function App() {\n  // 👉 3. Leave this alone: useState already infers number from 0\n  const [price, setPrice] = useState(0);\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 8, justifyItems: 'start' }}>\n      <input type=\"number\" value={price} onChange={(e) => setPrice(Number(e.target.value))} />\n      <p>{format(price, 'Total')}</p>\n      <p>{labels.length} labels</p>\n    </div>\n  );\n}",
      "solutionCode": "import { useState } from 'react';\n\nconst labels: string[] = [];\n\nfunction format(price: number, label: string): string {\n  return label + ': $' + price.toFixed(2);\n}\n\nexport default function App() {\n  const [price, setPrice] = useState(0);\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 8, justifyItems: 'start' }}>\n      <input type=\"number\" value={price} onChange={(e) => setPrice(Number(e.target.value))} />\n      <p>{format(price, 'Total')}</p>\n      <p>{labels.length} labels</p>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\n// Annotated, because an empty-looking literal gives TypeScript nothing to go on.\nconst currencies: string[] = ['USD', 'EUR', 'GBP'];\n\n// The return type is inferred as number. Writing ': number' would add nothing.\nfunction toCents(amount: number) {\n  return Math.round(amount * 100);\n}\n\nexport default function App() {\n  // useState infers number from the initial value, 0.\n  const [amount, setAmount] = useState(0);\n  const [currency, setCurrency] = useState(currencies[0]);\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 8, justifyItems: 'start' }}>\n      <input\n        type=\"number\"\n        value={amount}\n        onChange={(e) => setAmount(Number(e.target.value))}\n      />\n      <select value={currency} onChange={(e) => setCurrency(e.target.value)}>\n        {currencies.map((code) => <option key={code}>{code}</option>)}\n      </select>\n      <p>{toCents(amount)} cents in {currency}</p>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3,
              4
            ],
            "description": "A colon and a type after the name. `string[]` means \"an array whose every element is a string\" — the brackets are part of the type, not part of the value.\n\nThis one is annotated rather than inferred because the annotation is doing real work further down: it is what makes `currencies[0]` a string instead of anything at all.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6,
              7,
              8,
              9
            ],
            "description": "Parameters are annotated; the return type is not. TypeScript reads `Math.round(...)` and concludes `number` on its own.\n\nThe asymmetry is deliberate. A parameter is a promise to callers, so it gets stated explicitly. A return value is a fact about the body, so it can usually be read off.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              12,
              13,
              14
            ],
            "description": "`useState(0)` gives back a `number` and a setter that only accepts numbers — none of which was written down. Inference reaches through generic functions like this one.\n\nAn explicit `useState<number>(0)` would compile identically and say nothing new. The type argument earns its place only when the initial value is *not* representative — an empty array, or `null`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              26
            ],
            "description": "Everything here is erased before the browser sees it. The build strips every annotation and ships plain JavaScript, which is why a TypeScript mistake costs nothing at runtime and catches nothing at runtime either.\n\nThe exact text output on the screen will be:\n`0 cents in USD`\n\nchanging as you type in the number field.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useState } from 'react';\n\nconst labels: string[] = [];\n\nfunction format(price: number, label: string): string {\n  return label + ': $' + price.toFixed(2);\n}\n\nexport default function App() {\n  const [price, setPrice] = useState(0);\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 8, justifyItems: 'start' }}>\n      <input type=\"number\" value={price} onChange={(e) => setPrice(Number(e.target.value))} />\n      <p>{format(price, 'Total')}</p>\n      <p>{labels.length} labels</p>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3
            ],
            "description": "Without the annotation, `[]` is inferred as `never[]` — an array that can never hold anything — so pushing a string into it later would be rejected. The empty container is the case where inference genuinely needs help.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              5
            ],
            "description": "Both parameters are annotated, and the return type is stated too. `format` is called from elsewhere in the file, so its signature is the contract; annotating it is what lets a wrong call be reported at the call site rather than inside the body.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10
            ],
            "description": "And this line is untouched on purpose. `useState(0)` already produces `number`, so an annotation here would be a second copy of a fact that is already written down — the same duplication the `state-or-derived` lesson argues against, applied to types.\n\nThe exact text output on the screen will be:\n`Total: $0.00`\n`0 labels`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Types vanish at build time",
          "type": "misconception",
          "walkthrough": {
            "code": "// What you write\nfunction toCents(amount: number) {\n  return Math.round(amount * 100);\n}\n\n// What the browser runs\nfunction toCents(amount) {\n  return Math.round(amount * 100);\n}",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "The annotation exists for the compiler and your editor. It is not compiled into a check."
              },
              {
                "highlightLines": [
                  7
                ],
                "description": "This is the shipped output. So a value arriving from `fetch`, `JSON.parse`, or a form input can still be anything at all — validate it at that boundary, because the type system will not."
              }
            ]
          }
        },
        {
          "title": "When an annotation earns its place",
          "type": "did-you-know",
          "walkthrough": {
            "code": "const version = 2;            // redundant to annotate\nconst tags: string[] = [];     // necessary: [] alone is never[]\nlet reply: string | null = null; // necessary: null alone is just null",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "The value says everything. Annotating it is duplication, and duplication is something to maintain."
              },
              {
                "highlightLines": [
                  2,
                  3
                ],
                "description": "An empty array and a bare `null` show nothing about what will eventually live there. These are the two cases where the annotation is the only source of the information."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "ts-narrowing",
      "title": "Unions, Literals & Narrowing",
      "content": "\n# Unions, Literals & Narrowing\n\n### What is it?\nA **union** is a type built out of alternatives: `string | number` means \"one of these two\". A **literal type** is a type with exactly one value in it — `'loading'` is a type that only the string `'loading'` satisfies. Put them together and you get the single most useful thing TypeScript offers a React app: a state that can only ever be one of four named things.\n\n**Narrowing** is what happens next. Once you check which alternative you have, TypeScript follows the check and treats the value as that alternative for the rest of the branch.\n\n> 💡 **Mental Model:** A union is a set of keys on a ring, and narrowing is the moment you try one in the lock. Before the check you are holding \"some key\"; inside the `if`, you are holding a specific one, and the compiler knows which.\n\n### Why do we need it?\nMost React state is not really a string. `status: string` admits `'loadng'`, `''`, and `'banana'` — a typo becomes a silently unreachable branch. `status: 'idle' | 'loading' | 'success' | 'error'` admits exactly four values, autocompletes all four, and rejects the typo at the keystroke.\n\nIt also replaces the boolean pile. `isLoading` plus `isError` plus `isDone` is eight combinations, of which four are nonsense you now have to reason about. One union is four states, all of them meaningful.\n\n### How?\nWrite the alternatives with `|`. Then check before you use:\n\n- `typeof value === 'string'` narrows primitives.\n- `value === 'loading'` narrows a literal union, in an `if` or a `switch`.\n- `value !== null` narrows away null and undefined.\n- `'name' in value` narrows object shapes by asking whether a key exists.\n\nThe rule to internalise: you may only use the parts that *every* member of the union has, until you have narrowed. That is not an obstacle — it is the check that the value has actually been handled.\n\n### Syntax/Example\n```tsx\ntype Status = 'idle' | 'loading' | 'success' | 'error';\n\nlet status: Status = 'idle';\n// status = 'loadng';  // rejected: not one of the four\n\nfunction render(value: string | number) {\n  // value.toUpperCase() here would be rejected -- a number has no toUpperCase\n  if (typeof value === 'string') return value.toUpperCase();\n  return value.toFixed(2);\n}\n```\n\n### Example\n```tsx\nimport { useState } from 'react';\n\ntype Status = 'idle' | 'loading' | 'success' | 'error';\n\nfunction label(status: Status) {\n  switch (status) {\n    case 'idle': return 'Ready when you are';\n    case 'loading': return 'Working...';\n    case 'success': return 'Done';\n    case 'error': return 'Something went wrong';\n  }\n}\n\nfunction show(value: string | number) {\n  // Inside this branch, TypeScript knows value is a string.\n  if (typeof value === 'string') return value.toUpperCase();\n  // And here, by elimination, that it is a number.\n  return value.toFixed(2);\n}\n\nexport default function App() {\n  const [status, setStatus] = useState<Status>('idle');\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 8, justifyItems: 'start' }}>\n      <p>{label(status)}</p>\n      <button onClick={() => setStatus('loading')}>Start</button>\n      <button onClick={() => setStatus('success')}>Finish</button>\n      <p>{show('hello')} / {show(3.14159)}</p>\n    </div>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** This one is broken at runtime, not just loosely typed — `show(3.14159)` calls `toUpperCase` on a number and throws. Fix all three: make `Status` a union of its four literal values, narrow inside `show` with `typeof`, and give `useState` the `Status` type.\n\n**Solution:** `type Status = 'idle' | 'loading' | 'success' | 'error';`. In `show`, guard with `if (typeof value === 'string') return value.toUpperCase();` and return `value.toFixed(2)` below it. Then `useState<Status>('idle')`.\n\nThe crash is the argument for the lesson: the union was there in the parameter type all along, and the only thing missing was the check that respects it.\n\n### Hints\n* The four literals are already in the file — every `setStatus` call names one.\n* `useState('idle')` on its own infers the type `string`, not `Status`, because a mutable variable is widened. The explicit type argument is what pins it.\n* After the `if` returns, TypeScript already knows the remaining value is a number. No `else` is needed.\n",
      "starterCode": "import { useState } from 'react';\n\n// 👉 1. Replace this with a union of the four literal strings the app uses\ntype Status = string;\n\n// 👉 2. Narrow with typeof so both kinds of value are handled\nfunction show(value: string | number) {\n  return value.toUpperCase();\n}\n\nexport default function App() {\n  // 👉 3. Tell useState the state is a Status\n  const [status, setStatus] = useState('idle');\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 8, justifyItems: 'start' }}>\n      <p>Status: {status}</p>\n      <button onClick={() => setStatus('loading')}>Start</button>\n      <button onClick={() => setStatus('success')}>Finish</button>\n      <p>{show('hello')} / {show(3.14159)}</p>\n    </div>\n  );\n}",
      "solutionCode": "import { useState } from 'react';\n\ntype Status = 'idle' | 'loading' | 'success' | 'error';\n\nfunction show(value: string | number) {\n  if (typeof value === 'string') return value.toUpperCase();\n  return value.toFixed(2);\n}\n\nexport default function App() {\n  const [status, setStatus] = useState<Status>('idle');\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 8, justifyItems: 'start' }}>\n      <p>Status: {status}</p>\n      <button onClick={() => setStatus('loading')}>Start</button>\n      <button onClick={() => setStatus('success')}>Finish</button>\n      <p>{show('hello')} / {show(3.14159)}</p>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\ntype Status = 'idle' | 'loading' | 'success' | 'error';\n\nfunction label(status: Status) {\n  switch (status) {\n    case 'idle': return 'Ready when you are';\n    case 'loading': return 'Working...';\n    case 'success': return 'Done';\n    case 'error': return 'Something went wrong';\n  }\n}\n\nfunction show(value: string | number) {\n  // Inside this branch, TypeScript knows value is a string.\n  if (typeof value === 'string') return value.toUpperCase();\n  // And here, by elimination, that it is a number.\n  return value.toFixed(2);\n}\n\nexport default function App() {\n  const [status, setStatus] = useState<Status>('idle');\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 8, justifyItems: 'start' }}>\n      <p>{label(status)}</p>\n      <button onClick={() => setStatus('loading')}>Start</button>\n      <button onClick={() => setStatus('success')}>Finish</button>\n      <p>{show('hello')} / {show(3.14159)}</p>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3
            ],
            "description": "Four literal types joined by `|`. `Status` is not \"a string\" — it is a set with exactly four members, and nothing else satisfies it.\n\nThis single line is what turns a typo from a silent dead branch into an error at the moment you type it.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              5,
              6,
              11
            ],
            "description": "`switch` narrows a literal union case by case. Inside `case 'idle'`, `status` is the type `'idle'` and nothing else.\n\nNotice there is no `default`. Because the four cases cover the union exactly, TypeScript can see that every path returns — and if a fifth status is added to `Status` later, this function stops type-checking until the new case is written.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              15,
              16,
              18
            ],
            "description": "`typeof value === 'string'` is an ordinary JavaScript check that TypeScript reads as a type narrowing. Inside the branch, `.toUpperCase()` is available; after it, `.toFixed()` is.\n\nBefore the check neither is, because a union only offers what all its members share.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              22
            ],
            "description": "`useState<Status>` pins the state to the union. Without the type argument, `'idle'` widens to `string` and the four-value guarantee is gone.\n\nThe exact text output on the screen will be:\n`Ready when you are`\n`HELLO / 3.14`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useState } from 'react';\n\ntype Status = 'idle' | 'loading' | 'success' | 'error';\n\nfunction show(value: string | number) {\n  if (typeof value === 'string') return value.toUpperCase();\n  return value.toFixed(2);\n}\n\nexport default function App() {\n  const [status, setStatus] = useState<Status>('idle');\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 8, justifyItems: 'start' }}>\n      <p>Status: {status}</p>\n      <button onClick={() => setStatus('loading')}>Start</button>\n      <button onClick={() => setStatus('success')}>Finish</button>\n      <p>{show('hello')} / {show(3.14159)}</p>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3
            ],
            "description": "`type Status = string` permitted every string in existence. The union permits four, which is the actual number of states this component has.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              5,
              6,
              7
            ],
            "description": "The crash is gone because the number now takes the second path. `typeof` is the narrowing here: a plain JavaScript check that the compiler follows.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              11
            ],
            "description": "The explicit type argument is what stops `'idle'` widening to `string`. With it, `setStatus('finished')` is rejected; without it, it is accepted and silently does nothing useful.\n\nThe exact text output on the screen will be:\n`Status: idle`\n`HELLO / 3.14`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "One union beats three booleans",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Eight combinations, four of them nonsense\nconst [isLoading, setLoading] = useState(false);\nconst [isError, setError] = useState(false);\nconst [isDone, setDone] = useState(false);\n\n// Four states, all of them real\nconst [status, setStatus] = useState<Status>('idle');",
            "steps": [
              {
                "highlightLines": [
                  2,
                  3,
                  4
                ],
                "description": "Three booleans is eight states. What does \"loading and error and done\" mean? Nothing — but the code has to survive it being true."
              },
              {
                "highlightLines": [
                  7
                ],
                "description": "A union makes the impossible combinations unrepresentable, which is cheaper than handling them. This is the same reasoning as `state-or-derived`, applied to the shape of the state rather than its quantity."
              }
            ]
          }
        },
        {
          "title": "A literal in a let is not a literal",
          "type": "misconception",
          "walkthrough": {
            "code": "const mode = 'dark';   // type: 'dark'\nlet theme = 'dark';    // type: string\n\nconst [status, setStatus] = useState('idle');        // string\nconst [status2, setStatus2] = useState<Status>('idle'); // Status",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2
                ],
                "description": "`const` cannot be reassigned, so TypeScript keeps the exact literal type. `let` can, so it widens to `string` — which is usually what you want, and occasionally exactly what you do not."
              },
              {
                "highlightLines": [
                  4,
                  5
                ],
                "description": "State is mutable, so the same widening happens inside `useState`. When the state is a literal union, the type argument is not optional decoration — it is the only thing holding the union in place."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "ts-object-types",
      "title": "Object Types, Optional & Readonly",
      "content": "\n# Object Types, Optional & Readonly\n\n### What is it?\nAlmost everything a React app moves around is an object: props, state, a row from an API, a form draft. An **object type** writes that shape down — which keys exist, what each one holds, which are allowed to be missing, and which must never be reassigned.\n\n> 💡 **Mental Model:** An object type is the form, not the filled-in copy. It says which boxes exist and what belongs in each; `?` marks a box you may leave blank, and `readonly` marks one printed in ink.\n\n### Why do we need it?\n`user.emial` is not a crash. It is `undefined`, rendered as nothing, and discovered by a user. An object type turns that typo into a red underline, and — just as valuable day to day — turns `user.` into a list of what is actually there.\n\n### How?\nTwo spellings, one job:\n\n```tsx\ninterface Book {\n  readonly id: number;\n  title: string;\n  year?: number;\n}\n\ntype BookAlias = {\n  readonly id: number;\n  title: string;\n  year?: number;\n};\n```\n\nFor describing an object, these are interchangeable. The differences that survive contact with a real codebase are narrow:\n\n- `type` can name things that are not objects — unions, literals, functions, tuples. `interface` cannot.\n- `interface` supports declaration merging: two declarations of the same name combine. This is what lets a library's types be extended from outside, and it is also a foot-gun in ordinary application code.\n\nA common house rule is `interface` for object shapes and `type` for everything else. Pick one convention and hold it; the argument is much smaller than the volume of writing about it suggests.\n\nThe two modifiers matter more:\n\n- `year?: number` means the key may be absent. Reading it gives `number | undefined`, so you are forced to handle the absence — which is the point.\n- `readonly id: number` means assignment to it is rejected after construction. It is a compile-time rule only; nothing freezes at runtime.\n\n### Syntax/Example\n```tsx\ninterface Contact {\n  readonly id: number;\n  name: string;\n  phone?: string;\n}\n\nconst c: Contact = { id: 1, name: 'Ada' };\n// c.id = 2;                     // rejected: readonly\n// c.phone.trim();               // rejected: possibly undefined\nc.phone?.trim();                 // fine\n```\n\n### Example\n```tsx\nimport { useState } from 'react';\n\ninterface Book {\n  readonly id: number;\n  title: string;\n  author: string;\n  year?: number;\n}\n\nconst library: Book[] = [\n  { id: 1, title: 'The Pragmatic Programmer', author: 'Hunt & Thomas', year: 1999 },\n  { id: 2, title: 'A Philosophy of Software Design', author: 'Ousterhout' },\n];\n\nexport default function App() {\n  const [selectedId, setSelectedId] = useState(library[0].id);\n  const selected = library.find((book) => book.id === selectedId);\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 8, justifyItems: 'start' }}>\n      {library.map((book) => (\n        <button key={book.id} onClick={() => setSelectedId(book.id)}>{book.title}</button>\n      ))}\n      <p>{selected?.author}</p>\n      <p>{selected?.year ? 'Published ' + selected.year : 'Year unknown'}</p>\n    </div>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** Write down the shape this component is already using. Declare a `Contact` with a `readonly` `id`, a `name` and `email`, and an optional `phone`; annotate the `contacts` array with it; and type the selection state as `Contact | null`.\n\n**Solution:** Declare `interface Contact { readonly id: number; name: string; email: string; phone?: string; }`, then `const contacts: Contact[] = [...]` and `useState<Contact | null>(null)`.\n\n`useState(null)` on its own infers the type `null` — a state that can only ever be null — so `setSelected(contact)` is rejected. The union in the type argument is what makes the state actually usable.\n\n### Hints\n* The second contact has no `phone`. That is what makes it optional rather than merely sometimes-empty.\n* `selected?.phone ?? 'No phone on file'` already assumes the optional key; the type is what makes that assumption checkable.\n* `readonly` goes before the key name, `?` goes after it.\n",
      "starterCode": "import { useState } from 'react';\n\n// 👉 1. show a Contact: a readonly id (number), a name and an email\n//       (both string), and an optional phone (string)\n\n// 👉 2. Annotate this array as Contact[]\nconst contacts = [\n  { id: 1, name: 'Ada', email: 'ada@example.com', phone: '555-0100' },\n  { id: 2, name: 'Linus', email: 'linus@example.com' },\n];\n\nexport default function App() {\n  // 👉 3. Annotate this state as Contact | null\n  const [selected, setSelected] = useState(null);\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 8, justifyItems: 'start' }}>\n      {contacts.map((contact) => (\n        <button key={contact.id} onClick={() => setSelected(contact)}>{contact.name}</button>\n      ))}\n      <p>{selected ? selected.email : 'Nobody selected'}</p>\n      <p>{selected?.phone ?? 'No phone on file'}</p>\n    </div>\n  );\n}",
      "solutionCode": "import { useState } from 'react';\n\ninterface Contact {\n  readonly id: number;\n  name: string;\n  email: string;\n  phone?: string;\n}\n\nconst contacts: Contact[] = [\n  { id: 1, name: 'Ada', email: 'ada@example.com', phone: '555-0100' },\n  { id: 2, name: 'Linus', email: 'linus@example.com' },\n];\n\nexport default function App() {\n  const [selected, setSelected] = useState<Contact | null>(null);\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 8, justifyItems: 'start' }}>\n      {contacts.map((contact) => (\n        <button key={contact.id} onClick={() => setSelected(contact)}>{contact.name}</button>\n      ))}\n      <p>{selected ? selected.email : 'Nobody selected'}</p>\n      <p>{selected?.phone ?? 'No phone on file'}</p>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\ninterface Book {\n  readonly id: number;\n  title: string;\n  author: string;\n  year?: number;\n}\n\nconst library: Book[] = [\n  { id: 1, title: 'The Pragmatic Programmer', author: 'Hunt & Thomas', year: 1999 },\n  { id: 2, title: 'A Philosophy of Software Design', author: 'Ousterhout' },\n];\n\nexport default function App() {\n  const [selectedId, setSelectedId] = useState(library[0].id);\n  const selected = library.find((book) => book.id === selectedId);\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 8, justifyItems: 'start' }}>\n      {library.map((book) => (\n        <button key={book.id} onClick={() => setSelectedId(book.id)}>{book.title}</button>\n      ))}\n      <p>{selected?.author}</p>\n      <p>{selected?.year ? 'Published ' + selected.year : 'Year unknown'}</p>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3,
              4,
              8
            ],
            "description": "Four keys, four rules. `readonly id` may be read but never reassigned; `title` and `author` are required strings; `year?` may be missing entirely.\n\nAn object missing `title` is not a `Book`. An object missing `year` still is.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10,
              11,
              12
            ],
            "description": "`Book[]` applies the shape to every element. The second entry has no `year`, and that is accepted precisely because `year` was marked optional — remove the `?` and this line stops compiling.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              17,
              23
            ],
            "description": "`find` returns `Book | undefined`, because nothing guarantees a match. That is why `selected?.author` needs the `?.` — TypeScript will not let the possibility be ignored.\n\nThis is the everyday shape of working with object types: the type tells you where the holes are, and the syntax makes you acknowledge them.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              24
            ],
            "description": "The optional key is handled explicitly, and the fallback covers the book that has no year.\n\nThe exact text output on the screen will be:\n`Hunt & Thomas`\n`Published 1999`\n\nswitching to `Ousterhout` and `Year unknown` on the second button.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useState } from 'react';\n\ninterface Contact {\n  readonly id: number;\n  name: string;\n  email: string;\n  phone?: string;\n}\n\nconst contacts: Contact[] = [\n  { id: 1, name: 'Ada', email: 'ada@example.com', phone: '555-0100' },\n  { id: 2, name: 'Linus', email: 'linus@example.com' },\n];\n\nexport default function App() {\n  const [selected, setSelected] = useState<Contact | null>(null);\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 8, justifyItems: 'start' }}>\n      {contacts.map((contact) => (\n        <button key={contact.id} onClick={() => setSelected(contact)}>{contact.name}</button>\n      ))}\n      <p>{selected ? selected.email : 'Nobody selected'}</p>\n      <p>{selected?.phone ?? 'No phone on file'}</p>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3,
              4,
              7
            ],
            "description": "The shape the component was already relying on, written down. `readonly` on `id` says the identity is fixed once the contact exists; `phone?` says the second contact is still a valid contact without one.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10
            ],
            "description": "Annotating the array is what makes the shape enforced rather than merely inferred. Add a contact with `emial` spelled that way and this line is now where the error appears.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              16
            ],
            "description": "`useState(null)` alone infers the type `null`, so nothing could ever be selected. `Contact | null` is the state this component actually has: a contact, or nobody yet.\n\nThe exact text output on the screen will be:\n`Nobody selected`\n`No phone on file`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "interface or type?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "interface Props { title: string }\ntype PropsAlias = { title: string };\n\ntype Status = 'idle' | 'done';   // interface cannot express this\ninterface Props { subtitle: string } // merges with the first declaration",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2
                ],
                "description": "For an object shape these are equivalent. Almost every argument you will read about choosing between them is about the two lines below, not these."
              },
              {
                "highlightLines": [
                  4,
                  5
                ],
                "description": "Only `type` can name a union. Only `interface` merges across declarations — useful for extending a library's types from outside, and a quiet source of confusion inside an app. Pick a convention, write it down, move on."
              }
            ]
          }
        },
        {
          "title": "readonly is not frozen",
          "type": "misconception",
          "walkthrough": {
            "code": "interface Contact { readonly id: number }\n\nconst c: Contact = { id: 1 };\n// c.id = 2;              // rejected by the compiler\n\n(c as any).id = 2;        // compiles, and runs\nObject.freeze(c);         // the runtime version",
            "steps": [
              {
                "highlightLines": [
                  4
                ],
                "description": "`readonly` is a compile-time rule. It stops the assignment you write by hand, which is most of them."
              },
              {
                "highlightLines": [
                  6,
                  7
                ],
                "description": "It survives nothing at runtime. An assertion, a JSON round trip, or a third-party library will mutate the object happily. If you need the guarantee to hold while the program runs, that is `Object.freeze`, not a type."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "ts-generics",
      "title": "Generics from First Principles",
      "content": "\n# Generics from First Principles\n\n### What is it?\nA **generic** is a function or type with a parameter that is itself a type. `function first<T>(items: T[]): T | undefined` does not say what `T` is; it says that whatever you pass in as the element type comes back out as the return type. The caller supplies `T`, usually without noticing.\n\n> 💡 **Mental Model:** A normal parameter is a hole you drop a value into. A type parameter is a hole you drop a *type* into — and the signature is a promise about how the holes line up.\n\n### Why do we need it?\nWrite a helper that works for any array and you immediately face a bad trade. Type it for strings and it only works on strings. Type it with `any` and it works on everything, at the cost of the caller learning nothing: `firstAny(names)` gives back `any`, `any.toUpperCase()` is allowed, `any.toFixed()` is allowed, and `any.nonsense()` is allowed too.\n\nA generic is the third option. One implementation, full information preserved at every call site.\n\nYou have been using them since your first React lesson: `useState<number>` is a generic function, `Array<string>` is a generic type, and `Promise<Response>` is what `fetch` returns.\n\n### How?\nDeclare the parameter in angle brackets, then use it like any other type:\n\n- `function first<T>(items: T[]): T | undefined` — one parameter, used twice.\n- `function pair<A, B>(a: A, b: B): [A, B]` — two parameters, independent.\n- `function longest<T extends { length: number }>(a: T, b: T): T` — **constrained**: `T` can be anything *that has a length*, which is what makes `a.length` legal inside the body.\n\nThe constraint is the part most people skip and then need. Without `extends`, a type parameter is completely opaque inside the function — you cannot read a property off it, because nothing guarantees the property exists. `extends` says what the minimum is, and the caller still keeps the specific type on the way out.\n\nOne syntax note: in a `.tsx` file, `<T>` at the start of an arrow function is ambiguous with JSX. Function declarations, as used here, have no such problem.\n\n### Syntax/Example\n```tsx\nfunction identity<T>(value: T): T {\n  return value;\n}\n\nconst a = identity('hello');  // a is string\nconst b = identity(42);       // b is number\n\nfunction sizeOf<T extends { length: number }>(value: T): number {\n  return value.length;        // legal only because of the constraint\n}\n```\n\n### Example\n```tsx\nimport { useState } from 'react';\n\n// Without a type parameter, this has to return something. 'any' returns nothing.\nfunction firstAny(items: any[]): any {\n  return items[0];\n}\n\n// A type parameter is a variable for a type: whatever goes in comes back out.\nfunction first<T>(items: T[]): T | undefined {\n  return items[0];\n}\n\nconst names = ['Ada', 'Grace', 'Linus'];\nconst years = [1815, 1906, 1969];\n\nexport default function App() {\n  const [showYears, setShowYears] = useState(false);\n\n  // name is string | undefined. year is number | undefined. Both survived.\n  const name = first(names);\n  const year = first(years);\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 8, justifyItems: 'start' }}>\n      <button onClick={() => setShowYears((v) => !v)}>Toggle</button>\n      <p>{showYears ? year : name?.toUpperCase()}</p>\n      <p>firstAny gives back: {String(firstAny(names))}</p>\n    </div>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** Both helpers are typed with `any`, which works and tells the caller nothing. Make `last` generic over the element type, and make `longest` generic with a constraint so that reading `.length` inside it is actually justified.\n\n**Solution:** `function last<T>(items: T[]): T | undefined`, and `function longest<T extends { length: number }>(a: T, b: T): T`. No `any` should remain in the file.\n\n### Hints\n* `last` needs exactly one type parameter, used in the parameter type and again in the return type. That reuse is the whole mechanism.\n* Return `T | undefined`, not `T` — an empty array has no last element, and the type should say so.\n* Inside `longest`, `a.length` is rejected until the constraint exists. That rejection is the constraint explaining what it is for.\n",
      "starterCode": "import { useState } from 'react';\n\n// 👉 1. Make this generic: one type parameter T, items is T[],\n//       and the return type is T | undefined\nfunction last(items: any[]): any {\n  return items[items.length - 1];\n}\n\n// 👉 2. Make this generic too, constrained so only values with a\n//       .length are accepted: T extends { length: number }\nfunction longest(a: any, b: any): any {\n  return a.length >= b.length ? a : b;\n}\n\nconst names = ['Ada', 'Grace', 'Linus'];\nconst years = [1815, 1906, 1969];\n\nexport default function App() {\n  const [useYears, setUseYears] = useState(false);\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 8, justifyItems: 'start' }}>\n      <button onClick={() => setUseYears((v) => !v)}>Toggle list</button>\n      <p>Last item: {useYears ? last(years) : last(names)}</p>\n      <p>Longer word: {longest('generics', 'types')}</p>\n    </div>\n  );\n}",
      "solutionCode": "import { useState } from 'react';\n\nfunction last<T>(items: T[]): T | undefined {\n  return items[items.length - 1];\n}\n\nfunction longest<T extends { length: number }>(a: T, b: T): T {\n  return a.length >= b.length ? a : b;\n}\n\nconst names = ['Ada', 'Grace', 'Linus'];\nconst years = [1815, 1906, 1969];\n\nexport default function App() {\n  const [useYears, setUseYears] = useState(false);\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 8, justifyItems: 'start' }}>\n      <button onClick={() => setUseYears((v) => !v)}>Toggle list</button>\n      <p>Last item: {useYears ? last(years) : last(names)}</p>\n      <p>Longer word: {longest('generics', 'types')}</p>\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\n// Without a type parameter, this has to return something. 'any' returns nothing.\nfunction firstAny(items: any[]): any {\n  return items[0];\n}\n\n// A type parameter is a variable for a type: whatever goes in comes back out.\nfunction first<T>(items: T[]): T | undefined {\n  return items[0];\n}\n\nconst names = ['Ada', 'Grace', 'Linus'];\nconst years = [1815, 1906, 1969];\n\nexport default function App() {\n  const [showYears, setShowYears] = useState(false);\n\n  // name is string | undefined. year is number | undefined. Both survived.\n  const name = first(names);\n  const year = first(years);\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 8, justifyItems: 'start' }}>\n      <button onClick={() => setShowYears((v) => !v)}>Toggle</button>\n      <p>{showYears ? year : name?.toUpperCase()}</p>\n      <p>firstAny gives back: {String(firstAny(names))}</p>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3,
              4,
              5,
              6
            ],
            "description": "`any[]` in, `any` out. This compiles, runs, and is useless to the caller: the result accepts every method name in existence, including the misspelled ones.\n\n`any` is not \"a type I have not decided yet\". It is an instruction to stop checking.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              8,
              9,
              10,
              11
            ],
            "description": "`T` is a variable that holds a type. It appears twice — once in the parameter, once in the return — and that repetition is the entire promise: the element type of what you pass in is the type you get back.\n\n`| undefined` is honest about the empty-array case rather than pretending it cannot happen.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              19,
              20,
              21
            ],
            "description": "Neither call names a type. TypeScript reads `names` as `string[]`, concludes `T` is `string`, and gives back `string | undefined` — then does the same independently for `years`.\n\nOne implementation, two fully-typed call sites, nothing written down twice.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              26,
              27
            ],
            "description": "`name?.toUpperCase()` is allowed because `name` is a string; the `?.` is there because it might be undefined. Both facts came from the generic.\n\nThe exact text output on the screen will be:\n`ADA`\n`firstAny gives back: Ada`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useState } from 'react';\n\nfunction last<T>(items: T[]): T | undefined {\n  return items[items.length - 1];\n}\n\nfunction longest<T extends { length: number }>(a: T, b: T): T {\n  return a.length >= b.length ? a : b;\n}\n\nconst names = ['Ada', 'Grace', 'Linus'];\nconst years = [1815, 1906, 1969];\n\nexport default function App() {\n  const [useYears, setUseYears] = useState(false);\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 8, justifyItems: 'start' }}>\n      <button onClick={() => setUseYears((v) => !v)}>Toggle list</button>\n      <p>Last item: {useYears ? last(years) : last(names)}</p>\n      <p>Longer word: {longest('generics', 'types')}</p>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3
            ],
            "description": "`T` is introduced in the angle brackets and then used twice. `last(years)` now returns `number | undefined` and `last(names)` returns `string | undefined`, from the same four lines of code.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7
            ],
            "description": "The constraint is what makes `a.length` legal on the next line. An unconstrained `T` could be a number, and a number has no length — so TypeScript refuses to guess.\n\nNote what the constraint does *not* do: it does not flatten `T` down to `{ length: number }`. Pass two strings and you still get a string back.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              21,
              22
            ],
            "description": "Both call sites are unchanged, which is the point — the improvement is entirely in what the compiler now knows about them.\n\nThe exact text output on the screen will be:\n`Last item: Linus`\n`Longer word: generics`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "You have been using generics all along",
          "type": "did-you-know",
          "walkthrough": {
            "code": "const [count, setCount] = useState<number>(0);\nconst items: Array<string> = [];\nconst res: Promise<Response> = fetch('/api');",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "`useState` is a generic function. The type argument is usually inferred from the initial value, which is why you rarely write it."
              },
              {
                "highlightLines": [
                  2,
                  3
                ],
                "description": "`Array<string>` is exactly `string[]`, and `Promise<Response>` is what `fetch` promises to hand you. Generics are not an advanced corner of the language — they are how the standard library is written."
              }
            ]
          }
        },
        {
          "title": "A constraint keeps the specific type",
          "type": "misconception",
          "walkthrough": {
            "code": "// Not generic: the caller loses the specific type\nfunction sizeOf(value: { length: number }): number { return value.length }\nconst s = sizeOf('hello');    // fine, but nothing about 'hello' survives\n\n// Generic and constrained: the specific type comes back out\nfunction biggest<T extends { length: number }>(a: T, b: T): T { return a.length >= b.length ? a : b }\nconst w = biggest('generics', 'types');   // w is string",
            "steps": [
              {
                "highlightLines": [
                  2,
                  3
                ],
                "description": "A plain parameter type is enough when the function only reads from the value and returns something else. Constraints are not needed here."
              },
              {
                "highlightLines": [
                  6,
                  7
                ],
                "description": "The moment the value comes back out, the difference matters. `T extends { length: number }` demands a length *and* remembers that `w` is a string, which a plain `{ length: number }` return type would have thrown away."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "ts-strictness",
      "title": "Strict Mode, unknown vs any",
      "content": "\n# Strict Mode, unknown vs any\n\n### What is it?\n`strict` in `tsconfig.json` is a single switch that turns on the checks that make TypeScript worth running. The two that change daily work are `noImplicitAny` — an unannotated parameter is an error rather than a silent `any` — and `strictNullChecks`, which stops `null` and `undefined` from being assignable to everything.\n\n`any` and `unknown` are the two ways of saying \"I do not know what this is\". They behave in opposite ways, and choosing between them is the single highest-leverage TypeScript habit.\n\n> 💡 **Mental Model:** `any` is a hall pass — the checker waves the value through and everything it touches downstream. `unknown` is a sealed box: you may carry it anywhere, and you may not open it until you have proved what is inside.\n\n### Why do we need it?\nWithout `strict`, a large share of a codebase quietly types itself as `any` and the compiler agrees with everything. Teams that adopt it late discover thousands of errors that were always true and never reported.\n\nAnd `any` does not stay where you put it. One `any` at a boundary — a `JSON.parse`, an untyped library, a cast written to silence an error — spreads to every value derived from it. The checking does not fail loudly; it just stops.\n\n### How?\nTurn `strict` on, then keep three habits:\n\n1. **Use `unknown` at every boundary.** Data from `fetch`, `JSON.parse`, `localStorage` or a message event is genuinely unknown. Typing it `unknown` forces the check that was always necessary.\n2. **Narrow with a type guard.** `function isSettings(value: unknown): value is Settings` is a normal function returning a boolean, plus a `value is T` return annotation that tells TypeScript what a `true` result proves. Inside the `if`, the value is `Settings`.\n3. **Treat `as` as a promise, not a check.** `response as User` performs no verification at all; it asserts, and if you are wrong the failure surfaces somewhere else entirely. The same goes for the non-null `!`.\n\nA type guard is doing real runtime work — the `typeof`, the `!== null`, the `in` checks all execute. That is exactly why it is trustworthy in a way an assertion is not. For anything larger than a couple of fields, a schema validator earns its place, and the principle is unchanged.\n\n### Syntax/Example\n```tsx\nconst a: any = JSON.parse(text);\na.whatever.at.all;          // accepted, and will throw at runtime\n\nconst u: unknown = JSON.parse(text);\n// u.whatever;              // rejected: nothing is known about u\n\nfunction isUser(value: unknown): value is { id: number } {\n  return typeof value === 'object' && value !== null && 'id' in value;\n}\n\nif (isUser(u)) {\n  u.id;                     // fine: narrowed by the guard\n}\n```\n\n### Example\n```tsx\nimport { useState } from 'react';\n\n// JSON.parse returns any, which switches checking off for everything it touches.\n// Annotating the result as unknown switches it back on.\nconst raw: unknown = JSON.parse('{\"name\":\"Ada\",\"age\":36}');\n\nfunction isPerson(value: unknown): value is { name: string; age: number } {\n  return (\n    typeof value === 'object' &&\n    value !== null &&\n    'name' in value &&\n    'age' in value\n  );\n}\n\nexport default function App() {\n  const [shown, setShown] = useState(false);\n\n  // Before this check, nothing at all can be read off raw. That is the point.\n  const person = isPerson(raw) ? raw : null;\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 8, justifyItems: 'start' }}>\n      <button onClick={() => setShown((v) => !v)}>{shown ? 'Hide' : 'Show'}</button>\n      {shown && <p>{person ? person.name + ' is ' + person.age : 'Not a person'}</p>}\n    </div>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** `stored` is annotated `any`, so every property read below is unchecked — including a misspelled one. Change the annotation to `unknown`, write an `isSettings` type guard, and narrow through it before reading. No `any` should be left in the file.\n\n**Solution:** `const stored: unknown = JSON.parse(...)`, then `function isSettings(value: unknown): value is Settings` checking `typeof value === 'object'`, `value !== null`, and that both keys are present with `in`. Finally `const settings = isSettings(stored) ? stored : null;`.\n\n### Hints\n* The `value is Settings` return annotation is what makes the function a guard rather than an ordinary boolean check.\n* `typeof null === 'object'` in JavaScript, which is why the explicit `value !== null` is not redundant.\n* Reach for `as` only when you genuinely know something the compiler cannot — and treat every use as a small unpaid debt.\n",
      "starterCode": "import { useState } from 'react';\n\ninterface Settings {\n  theme: string;\n  fontSize: number;\n}\n\n// 👉 1. Change this annotation from any to unknown\nconst stored: any = JSON.parse('{\"theme\":\"dark\",\"fontSize\":14}');\n\n// 👉 2. Write a type guard: isSettings(value: unknown): value is Settings\n\nexport default function App() {\n  const [open, setOpen] = useState(false);\n\n  // 👉 3. Narrow stored through the guard before reading it\n  const settings = stored;\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 8, justifyItems: 'start' }}>\n      <button onClick={() => setOpen((v) => !v)}>Toggle</button>\n      {open && <p>{settings ? settings.theme + ' / ' + settings.fontSize : 'No settings found'}</p>}\n    </div>\n  );\n}",
      "solutionCode": "import { useState } from 'react';\n\ninterface Settings {\n  theme: string;\n  fontSize: number;\n}\n\nconst stored: unknown = JSON.parse('{\"theme\":\"dark\",\"fontSize\":14}');\n\nfunction isSettings(value: unknown): value is Settings {\n  return (\n    typeof value === 'object' &&\n    value !== null &&\n    'theme' in value &&\n    'fontSize' in value\n  );\n}\n\nexport default function App() {\n  const [open, setOpen] = useState(false);\n\n  const settings = isSettings(stored) ? stored : null;\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 8, justifyItems: 'start' }}>\n      <button onClick={() => setOpen((v) => !v)}>Toggle</button>\n      {open && <p>{settings ? settings.theme + ' / ' + settings.fontSize : 'No settings found'}</p>}\n    </div>\n  );\n}",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\n// JSON.parse returns any, which switches checking off for everything it touches.\n// Annotating the result as unknown switches it back on.\nconst raw: unknown = JSON.parse('{\"name\":\"Ada\",\"age\":36}');\n\nfunction isPerson(value: unknown): value is { name: string; age: number } {\n  return (\n    typeof value === 'object' &&\n    value !== null &&\n    'name' in value &&\n    'age' in value\n  );\n}\n\nexport default function App() {\n  const [shown, setShown] = useState(false);\n\n  // Before this check, nothing at all can be read off raw. That is the point.\n  const person = isPerson(raw) ? raw : null;\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 8, justifyItems: 'start' }}>\n      <button onClick={() => setShown((v) => !v)}>{shown ? 'Hide' : 'Show'}</button>\n      {shown && <p>{person ? person.name + ' is ' + person.age : 'Not a person'}</p>}\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3,
              4,
              5
            ],
            "description": "`JSON.parse` is typed as returning `any` — the standard library genuinely cannot know better. Annotating the result as `unknown` is a deliberate downgrade of your own privileges, and it is the whole trick.\n\n`any` would let every line below compile. `unknown` lets none of them, until they earn it.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7,
              8,
              12,
              13
            ],
            "description": "A type guard is an ordinary function returning a boolean. The `value is { ... }` return annotation is what makes it special: it tells TypeScript what a `true` result has proved.\n\nEvery check inside it actually runs. That is the difference between this and an assertion — the guarantee is paid for.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10
            ],
            "description": "`typeof null === 'object'` is a forty-year-old JavaScript quirk, so the null check is load-bearing rather than defensive padding. Without it, `'name' in value` would be reached with `value` as `null` and throw.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              19,
              20,
              25
            ],
            "description": "After the guard, `person` is either a fully-typed object or `null`, and `person.name` is finally readable. Nothing about `raw` was assumed anywhere.\n\nThe exact text output on the screen will be:\n`Ada is 36`\n\nonce the button is pressed.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useState } from 'react';\n\ninterface Settings {\n  theme: string;\n  fontSize: number;\n}\n\nconst stored: unknown = JSON.parse('{\"theme\":\"dark\",\"fontSize\":14}');\n\nfunction isSettings(value: unknown): value is Settings {\n  return (\n    typeof value === 'object' &&\n    value !== null &&\n    'theme' in value &&\n    'fontSize' in value\n  );\n}\n\nexport default function App() {\n  const [open, setOpen] = useState(false);\n\n  const settings = isSettings(stored) ? stored : null;\n\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 8, justifyItems: 'start' }}>\n      <button onClick={() => setOpen((v) => !v)}>Toggle</button>\n      {open && <p>{settings ? settings.theme + ' / ' + settings.fontSize : 'No settings found'}</p>}\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              8
            ],
            "description": "`any` to `unknown`. Every read below breaks immediately, which is the point — those reads were always unchecked and the annotation was hiding it.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10,
              14,
              15
            ],
            "description": "The guard proves what the reads assume: an object, not null, with both keys present. The `value is Settings` annotation is what converts that proof into knowledge the compiler will use.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              22
            ],
            "description": "One line applies it. `settings` is now `Settings | null`, so the ternary below is not defensive style — it is the only way the type permits the value to be read.\n\nThe exact text output on the screen will be:\n`dark / 14`\n\nonce the button is pressed.",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "any spreads; unknown contains",
          "type": "misconception",
          "walkthrough": {
            "code": "const data: any = JSON.parse(text);\nconst name = data.user.name;   // any\nconst upper = name.toUpperCase();  // any -- still unchecked\n\nconst safe: unknown = JSON.parse(text);\n// const n = safe.user;         // rejected right here",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2,
                  3
                ],
                "description": "Every value derived from an `any` is also `any`. One annotation at the top of a file can switch off checking for a whole module without a single warning."
              },
              {
                "highlightLines": [
                  5,
                  6
                ],
                "description": "`unknown` fails at the boundary instead of propagating past it. The error is inconvenient exactly once, at the place where the check actually belonged."
              }
            ]
          }
        },
        {
          "title": "as is an assertion, not a check",
          "type": "misconception",
          "walkthrough": {
            "code": "const user = (await res.json()) as User;\nuser.name.trim();   // compiles. Throws if the server sent something else.\n\nfunction isUser(value: unknown): value is User {\n  return typeof value === 'object' && value !== null && 'name' in value;\n}",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2
                ],
                "description": "`as` generates no code. It is you telling the compiler to stop asking — and the compiler complies, all the way to the runtime error."
              },
              {
                "highlightLines": [
                  4,
                  5
                ],
                "description": "A guard runs. It costs a few comparisons and it means the type is true rather than asserted. Use `as` where you genuinely know more than the compiler can; use a guard wherever the data came from outside your program."
              }
            ]
          }
        }
      ]
    }
  ]
};
