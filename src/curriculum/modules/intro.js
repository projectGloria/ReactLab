export default {
  "id": "intro",
  "title": "Getting Started",
  "description": "What React is for, and how a React project is put together.",
  "icon": "Compass",
  "lessons": [
    {
      "id": "what-is-react",
      "title": "What Problem React Solves",
      "content": "\n# What Problem React Solves\n\n### What is it?\nReact is a JavaScript library for building user interfaces. That sentence is true but unhelpful on its own, so here is the useful version: **React exists so that you never have to update the screen by hand.**\n\nYou describe what the screen should look like for a given set of data. When the data changes, React works out what to change in the page. You do not write the update instructions.\n\n> 💡 **Mental Model:** Writing a page by hand is like keeping a whiteboard in sync with a notebook. Every time you change the notebook, you must remember to walk over and redraw the whiteboard. React is a person who watches the notebook and redraws the whiteboard for you — you only ever edit the notebook.\n\n### Why this matters before you write any React\nWithout React, the browser gives you tools to change the page one instruction at a time: create an element, set its text, attach a listener. This works. The problem is that **your data and your screen are two separate copies of the same truth**, and keeping two copies in agreement is a job that grows with every feature.\n\nLook at the example below. There is one number and one line of text showing it. Already there are two places that must agree, and one function whose only purpose is to copy the first into the second. Add a second button and you have three places. Add a filter, a total, and a \"last updated\" label, and you have a dozen — and every one of them breaks silently when you forget a line.\n\nSilently is the important word. Nothing throws an error. The screen simply shows a number that is no longer true.\n\n### How React changes the shape of the problem\nReact removes the copying step. Instead of writing *\"when the count changes, find the label and set its text\"*, you write *\"the label shows the count\"* — once — and React re-runs that description whenever the count changes.\n\nThat is the whole idea. Everything else in this course is detail:\n1. **A way to describe the screen** — JSX, which you meet in the next module.\n2. **A way to hold data that changes** — state.\n3. **A way to react when it changes** — React re-running your description.\n\n### A note on this lesson's playground\nThe code below is plain browser JavaScript, not React, so there is no preview to run — it is here to be read. From the next lesson onward the playground runs your code.\n\n### Example\n```js\nlet count = 0;\n\nconst label = document.createElement('p');\nconst button = document.createElement('button');\nbutton.textContent = 'Add one';\n\nfunction render() {\n  label.textContent = 'Count: ' + count;\n}\n\nbutton.addEventListener('click', () => {\n  count = count + 1;\n  render();\n});\n\nrender();\ndocument.body.append(label, button);\n```\n\n### Challenge\n**Challenge:** A **Reset** button has been added. Clicking it sets `count` back to `0`, but the screen keeps showing the old number. Fix it so that resetting updates the display too.\n\nThis is the bug React is designed to make impossible.\n\n### Hints\n* The data and the screen are separate. Changing `count` does not change the text.\n* Look at what the **Add one** handler does after it changes `count`.\n* The reset handler is missing exactly one line.\n\n**Solution:**\nCall `render()` after changing `count`, exactly as the add handler does. Notice what this costs: every single place that changes the data must remember to call `render()`, and nothing warns you when one forgets. In React you will never write this line, because describing the screen and updating it are no longer two separate jobs.\n",
      "starterCode": "let count = 0;\n\nconst label = document.createElement('p');\nconst addButton = document.createElement('button');\nconst resetButton = document.createElement('button');\naddButton.textContent = 'Add one';\nresetButton.textContent = 'Reset';\n\nfunction render() {\n  label.textContent = 'Count: ' + count;\n}\n\naddButton.addEventListener('click', () => {\n  count = count + 1;\n  render();\n});\n\nresetButton.addEventListener('click', () => {\n  count = 0;\n  // The number on screen does not change. Why?\n});\n\nrender();\ndocument.body.append(label, addButton, resetButton);",
      "solutionCode": "let count = 0;\n\nconst label = document.createElement('p');\nconst addButton = document.createElement('button');\nconst resetButton = document.createElement('button');\naddButton.textContent = 'Add one';\nresetButton.textContent = 'Reset';\n\nfunction render() {\n  label.textContent = 'Count: ' + count;\n}\n\naddButton.addEventListener('click', () => {\n  count = count + 1;\n  render();\n});\n\nresetButton.addEventListener('click', () => {\n  count = 0;\n  render();\n});\n\nrender();\ndocument.body.append(label, addButton, resetButton);",
      "exampleWalkthrough": {
        "code": "let count = 0;\n\nconst label = document.createElement('p');\nconst button = document.createElement('button');\nbutton.textContent = 'Add one';\n\nfunction render() {\n  label.textContent = 'Count: ' + count;\n}\n\nbutton.addEventListener('click', () => {\n  count = count + 1;\n  render();\n});\n\nrender();\ndocument.body.append(label, button);",
        "steps": [
          {
            "highlightLines": [
              1
            ],
            "description": "This is the data — the only thing that is actually true. Everything on screen is a copy of it, and copies can fall out of date.",
            "stateSnapshot": {
              "count": 0
            }
          },
          {
            "highlightLines": [
              3,
              4,
              5
            ],
            "description": "Two elements are created by hand. Nothing is on the page yet; these exist only in memory until the last line attaches them.",
            "stateSnapshot": {
              "count": 0
            }
          },
          {
            "highlightLines": [
              7,
              8,
              9
            ],
            "description": "`render` is the copying step. Its entire job is to take the value of `count` and write it into the label. In React, this function is the part that disappears.",
            "stateSnapshot": {
              "count": 0
            }
          },
          {
            "highlightLines": [
              11,
              12,
              13
            ],
            "description": "Here is the cost. Line 12 changes the data. Line 13 updates the screen. They are two separate instructions, and **nothing connects them** — if you delete line 13 the code still runs, still counts, and silently shows the wrong number.",
            "stateSnapshot": {
              "count": 1
            }
          },
          {
            "highlightLines": [
              16,
              17
            ],
            "description": "The first `render()` paints the initial value, then both elements are attached to the page.\n\nThe screen shows:\n`Count: 0`\nand a button reading `Add one`.",
            "stateSnapshot": {
              "count": 0
            }
          }
        ]
      },
      "walkthrough": {
        "code": "let count = 0;\n\nconst label = document.createElement('p');\nconst addButton = document.createElement('button');\nconst resetButton = document.createElement('button');\naddButton.textContent = 'Add one';\nresetButton.textContent = 'Reset';\n\nfunction render() {\n  label.textContent = 'Count: ' + count;\n}\n\naddButton.addEventListener('click', () => {\n  count = count + 1;\n  render();\n});\n\nresetButton.addEventListener('click', () => {\n  count = 0;\n  render();\n});\n\nrender();\ndocument.body.append(label, addButton, resetButton);",
        "steps": [
          {
            "highlightLines": [
              14,
              15,
              16,
              17
            ],
            "description": "The add handler is the model to copy: change the data, then update the screen. Two steps, every time.",
            "stateSnapshot": {
              "count": 1
            }
          },
          {
            "highlightLines": [
              19,
              20,
              21,
              22
            ],
            "description": "The reset handler sets `count` to `0` and now calls `render()` too. Before this fix the data said `0` while the label still said `7` — no error, no warning, just a screen that lied.",
            "stateSnapshot": {
              "count": 0
            }
          },
          {
            "highlightLines": [
              23,
              24
            ],
            "description": "Count up a few times, then reset: the label now follows.\n\nThe lesson is in what you had to remember. Every future button that touches `count` carries the same obligation, and the compiler will never remind you.",
            "stateSnapshot": {
              "count": 0
            }
          }
        ]
      },
      "insights": [
        {
          "title": "Is React a framework or a library?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// React gives you this:\nconst ui = describeScreen(data);\n\n// It does not give you:\n//   routing        (which URL shows what)\n//   data fetching  (talking to a server)\n//   forms, styling, build tooling",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2
                ],
                "description": "React handles one job: turning data into a description of the screen, and keeping the screen in step with it. That narrow focus is why it is usually called a library rather than a framework."
              },
              {
                "highlightLines": [
                  4,
                  5,
                  6,
                  7
                ],
                "description": "Everything else is a separate choice you make. That is why this course later covers routing and server state as their own modules with their own tools — they are not part of React, and treating them as if they were is a common source of confusion."
              }
            ]
          }
        },
        {
          "title": "Why not just use the browser directly?",
          "type": "misconception",
          "walkthrough": {
            "code": "// One value, one place on screen: manual is fine.\nlabel.textContent = 'Count: ' + count;\n\n// Now the same value feeds four places:\nheader.textContent = count + ' items';\nbadge.hidden = count === 0;\ntotal.textContent = (count * price).toFixed(2);\nemptyState.hidden = count > 0;",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2
                ],
                "description": "For a single value in a single place, hand-written DOM code is genuinely simpler than React. Reaching for a library here would be overkill, and plenty of pages are built exactly this way."
              },
              {
                "highlightLines": [
                  4,
                  5,
                  6,
                  7,
                  8
                ],
                "description": "The difficulty is not any one line — each is easy. It is that all four must be updated together, from every place that can change `count`, forever. The number of things to remember grows with features, and forgetting one produces a wrong screen rather than a crash. React trades this growing obligation for a fixed one: describe the screen once."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "modules-and-imports",
      "title": "Imports, Exports & Project Shape",
      "content": "\n# Imports, Exports & Project Shape\n\n### What is it?\nA React application is not one long file. It is many small files, each of which **exports** something, and **imports** what it needs from the others. You will see this line at the top of almost every lesson in this course:\n\n```javascript\nimport { useState } from 'react';\n```\n\nThis lesson explains what that line actually does, so it stops being noise you skip over.\n\n> 💡 **Mental Model:** A file is a workshop with a serving hatch. Everything inside is private by default. `export` puts something on the hatch where other files can collect it. `import` is walking to another workshop's hatch and taking what is on it.\n\n### The two kinds of export\n**Named exports** — as many per file as you like, collected by their exact name in braces:\n```javascript\n// money.js\nexport const CURRENCY = 'USD';\nexport function formatPrice(n) { /* ... */ }\n\n// somewhere else, the collecting side:\n//   import { CURRENCY, formatPrice } from './money.js';\n```\n\n**A default export** — at most one per file, and the importing file chooses its name:\n```javascript\n// Button.js\nexport default function Button() { /* ... */ }\n\n// somewhere else — all three lines below import this same function:\n//   import Button from './Button.js';\n//   import MyButton from './Button.js';\n//   import AnythingAtAll from './Button.js';\n```\n\nA file can have both. That is exactly what `import React, { useState } from 'react'` is doing: `React` is the default export, `useState` is a named one.\n\n### Where does 'react' come from?\nNotice the difference between these two:\n```javascript\nimport Button from './Button.js';  // a path -> a file you wrote\nimport { useState } from 'react';  // a bare name -> an installed package\n```\nA path starting with `./` or `../` points at your own file. A bare name is a **package**: third-party code downloaded into a folder called `node_modules` by a package manager, usually `npm`.\n\nOn your own machine, a React project is created and started from a terminal in four steps:\n\n1. `npm create vite@latest my-app -- --template react` — generate the project folder.\n2. `cd my-app` — move into it.\n3. `npm install` — download the packages.\n4. `npm run dev` — start the development server.\n\n`npm install` reads `package.json`, downloads React and everything else listed there into `node_modules`, and from then on `import ... from 'react'` resolves. You do not need to run any of this to take the course — this app already provides the environment — but when you open your own project, this is the shape you will find:\n\n```javascript\n// my-app/\n//   package.json        the list of packages this project needs\n//   node_modules/       the downloaded packages (never edited by hand)\n//   index.html          the single page the app is served from\n//   src/\n//     main.jsx          the entry point: finds a DOM node and hands it to React\n//     App.jsx           your top-level component\n```\n\n### Example\n```js\nexport const COURSE_NAME = 'ReactLab';\n\nfunction buildGreeting(name) {\n  return 'Hello, ' + name + '! Welcome to ' + COURSE_NAME + '.';\n}\n\nexport default function App() {\n  return buildGreeting('Ada');\n}\n```\n\n### Challenge\n**Challenge:** This file defines everything it needs, but exports nothing — so no other file can use it, and the app has no component to render. Add the two exports: make `CURRENCY` a named export, and `App` the default export.\n\n### Hints\n* A named export is the keyword `export` placed in front of an existing declaration.\n* There can be only one default export per file, and `App` is the thing another file wants to render.\n* You are adding words, not moving lines.\n\n**Solution:**\nPut `export` in front of `const CURRENCY` so other files can import it by name, and `export default` in front of `function App` so the entry point can import it under any name it likes. `formatPrice` stays unexported — it is used only inside this file, and leaving it private is the point of having a hatch at all.\n",
      "starterCode": "const CURRENCY = 'USD';\n\nfunction formatPrice(amount) {\n  return amount.toFixed(2) + ' ' + CURRENCY;\n}\n\nfunction App() {\n  return formatPrice(19.5);\n}",
      "solutionCode": "export const CURRENCY = 'USD';\n\nfunction formatPrice(amount) {\n  return amount.toFixed(2) + ' ' + CURRENCY;\n}\n\nexport default function App() {\n  return formatPrice(19.5);\n}",
      "exampleWalkthrough": {
        "code": "export const COURSE_NAME = 'ReactLab';\n\nfunction buildGreeting(name) {\n  return 'Hello, ' + name + '! Welcome to ' + COURSE_NAME + '.';\n}\n\nexport default function App() {\n  return buildGreeting('Ada');\n}",
        "steps": [
          {
            "highlightLines": [
              1
            ],
            "description": "A **named export**. Another file collects it with `import { COURSE_NAME } from './App.js'` — the braces and the exact spelling are both required."
          },
          {
            "highlightLines": [
              3,
              4,
              5
            ],
            "description": "`buildGreeting` has no `export` in front of it, so it is private to this file. It can be used freely here and is invisible everywhere else. Private is the default; exporting is the deliberate act."
          },
          {
            "highlightLines": [
              7,
              8,
              9
            ],
            "description": "The **default export**. There can be at most one per file, and the importing file names it: `import App from './App.js'` and `import Root from './App.js'` both collect this same function.\n\nThis one returns a plain string rather than markup, which React renders as text. From the next module on, this is where JSX goes.\n\nThe screen shows:\n`Hello, Ada! Welcome to ReactLab.`"
          }
        ]
      },
      "walkthrough": {
        "code": "export const CURRENCY = 'USD';\n\nfunction formatPrice(amount) {\n  return amount.toFixed(2) + ' ' + CURRENCY;\n}\n\nexport default function App() {\n  return formatPrice(19.5);\n}",
        "steps": [
          {
            "highlightLines": [
              1
            ],
            "description": "`export` in front of the existing `const` makes `CURRENCY` collectable by name. The declaration itself is unchanged — nothing moved, one word was added."
          },
          {
            "highlightLines": [
              3,
              4,
              5
            ],
            "description": "`formatPrice` is deliberately left unexported. It is an internal detail of this file, and keeping it private means you can rename or rewrite it later without breaking anyone else."
          },
          {
            "highlightLines": [
              7,
              8,
              9
            ],
            "description": "`export default` marks `App` as this file's main offering, so the entry point can render it.\n\nThe screen shows:\n`19.50 USD`"
          }
        ]
      },
      "insights": [
        {
          "title": "Why does `import { useState }` use braces, but `import React` does not?",
          "type": "misconception",
          "walkthrough": {
            "code": "import React, { useState } from 'react';\n//     ^^^^^   ^^^^^^^^^^\n//     default  named\n\n// The braces are not an object. They are a collection list.\nconst { useState } = require('react'); // NOT the same thing",
            "steps": [
              {
                "highlightLines": [
                  1,
                  2,
                  3
                ],
                "description": "One import statement can collect both kinds at once. `React` before the comma is the default export — you could rename it. `useState` inside the braces is a named export and must be spelled exactly."
              },
              {
                "highlightLines": [
                  5,
                  6
                ],
                "description": "The braces look like destructuring, and reading them that way works often enough to be dangerous. They are separate syntax, resolved before your code runs — which is why you cannot import conditionally inside an `if` block, and why a typo in a named import fails at build time rather than at runtime."
              }
            ]
          }
        }
      ]
    }
  ]
};
