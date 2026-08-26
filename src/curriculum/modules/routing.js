export default {
  "id": "routing",
  "title": "Routing & App Structure",
  "lessons": [
    {
      "id": "react-router",
      "title": "React Router Basics",
      "dependencies": {
        "react-router-dom": "^7.1.1"
      },
      "content": "\n# Client-Side Routing\n\n### What is it?\n**Building on Single Page Applications:** Instead of requesting fresh HTML pages from the server on every link click, client-side routing synchronizes the browser URL with rendered React component trees.\n\n> \ud83d\udca1 **Mental Model:** Think of a router Link like an usher inside a theater versus buying a whole new ticket at the box office: clicking Link walks you to a new seat inside the same building (app shell), while a full page reload is like leaving and re-entering the theater from scratch.\n\n### Why do we need it?\nReact Router is a widely used routing library for React applications; the important skill is understanding URL state and routing boundaries, not declaring a single universal library standard.\n\n### How?\nCore Components:\n- **`<BrowserRouter>`**: Wraps your app and connects it to the browser's URL.\n- **`<Routes>`**: Looks at the URL and decides which `<Route>` to show.\n- **`<Route>`**: Maps a specific URL path to a React component.\n- **`<Link>`**: Used instead of `<a href>` to navigate without refreshing the page.\n\n### Syntax/Example\n```jsx\nimport { BrowserRouter, Routes, Route } from 'react-router-dom';\n\nfunction App() {\n  // This causes the browser's URL to sync with the React components\n  return (\n    <BrowserRouter>\n      <Routes>\n        {/* This causes Home to render when the URL is exactly '/' */}\n        <Route path=\"/\" element={<Home />} />\n        {/* This causes Profile to render for URLs like '/profile/123' */}\n        <Route path=\"/profile/:id\" element={<Profile />} />\n      </Routes>\n    </BrowserRouter>\n  );\n}\n```\n\n### Example\n```jsx\nimport { BrowserRouter, Routes, Route, Link } from 'react-router-dom';\n\nfunction Home() {\n  return <h2>Home</h2>;\n}\n\nfunction About() {\n  return <h2>About</h2>;\n}\n\nexport default function App() {\n  return (\n    <BrowserRouter>\n      <nav style={{ display: 'flex', gap: 12, padding: 20 }}>\n        <Link to=\"/\">Home</Link>\n        <Link to=\"/about\">About</Link>\n      </nav>\n      <Routes>\n        <Route path=\"/\" element={<Home />} />\n        <Route path=\"/about\" element={<About />} />\n      </Routes>\n    </BrowserRouter>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** This app has two pages: Home and About, but the routing is broken! Under the `<nav>`, add a `<Routes>` block. Inside `<Routes>`, add two `<Route>` elements: One for `path=\"/\"` rendering `<Home />`, and one for `path=\"/about\"` rendering `<About />`.\n\n**Solution:** Add `<Routes>` with `<Route path=\"/\" element={<Home />} />` and `<Route path=\"/about\" element={<About />} />` under `<nav>` in `App.jsx`.\n\n### Hints\n* **The 404 Route and Hooks:** Every app needs a catch-all route for 404s: `<Route path=\"*\" element={<NotFound />} />`. You will also frequently use `useParams` to read dynamic URLs (like `/users/:id`) and `useLocation` to read query strings.\n",
      "starterCode": {
        "/App.jsx": "import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';\nimport Home from './pages/Home';\nimport About from './pages/About';\n\nexport default function App() {\n  return (\n    <BrowserRouter>\n      <div style={{ padding: 20 }}>\n        <nav style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 10 }}>\n          <Link to=\"/\">Home</Link>\n          <Link to=\"/about\">About</Link>\n        </nav>\n        \n        {/* 👉 Add your routing components here! */}\n        <p>Your routes go here</p>\n      </div>\n    </BrowserRouter>\n  );\n}\n",
        "/pages/Home.jsx": "export default function Home() {\n  return <h2>Home Page 🏠</h2>;\n}",
        "/pages/About.jsx": "export default function About() {\n  return <h2>About Us ℹ️</h2>;\n}"
      },
      "solutionCode": {
        "/App.jsx": "import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';\nimport Home from './pages/Home';\nimport About from './pages/About';\n\nexport default function App() {\n  return (\n    <BrowserRouter>\n      <div style={{ padding: 20 }}>\n        <nav style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 10 }}>\n          <Link to=\"/\">Home</Link>\n          <Link to=\"/about\">About</Link>\n        </nav>\n        \n        <Routes>\n          <Route path=\"/\" element={<Home />} />\n          <Route path=\"/about\" element={<About />} />\n        </Routes>\n      </div>\n    </BrowserRouter>\n  );\n}\n",
        "/pages/Home.jsx": "export default function Home() {\n  return <h2>Home Page 🏠</h2>;\n}",
        "/pages/About.jsx": "export default function About() {\n  return <h2>About Us ℹ️</h2>;\n}"
      },
      "exampleWalkthrough": {
        "code": "import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';\n\nfunction Home() {\n  return <h2>Home</h2>;\n}\n\nfunction About() {\n  return <h2>About</h2>;\n}\n\nexport default function App() {\n  return (\n    <BrowserRouter>\n      <nav style={{ display: 'flex', gap: 12, padding: 20 }}>\n        <Link to=\"/\">Home</Link>\n        <Link to=\"/about\">About</Link>\n      </nav>\n      <Routes>\n        <Route path=\"/\" element={<Home />} />\n        <Route path=\"/about\" element={<About />} />\n      </Routes>\n    </BrowserRouter>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              13,
              22
            ],
            "description": "`BrowserRouter` connects the app to the browser's History API and supplies the routing context everything below it depends on.\n\nIt has to be an ancestor of every router hook and component you use. A `<Routes>` or a `useNavigate()` outside it throws at runtime — which is the single most common way a first router setup fails.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              18,
              21
            ],
            "description": "`Routes` looks at the current URL and renders the best-matching `Route` — not the first one that matches, but the most specific. `/about` beats `/*`, and a static segment beats a dynamic `:id`, regardless of the order you wrote them in.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              15,
              16
            ],
            "description": "`Link` renders a real `<a>` with a real `href`, so middle-click and \"open in new tab\" work — but it intercepts the plain click and updates history instead of reloading.\n\nUse a plain `<a>` and the whole app tears down and boots again. That is the difference this component exists for.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              19,
              20
            ],
            "description": "Click **About** and only the matched element changes. The `<nav>` is outside `<Routes>`, so it is never re-mounted, and any state it held survives the navigation.\n\nThe exact text output on the screen will be:\n`Home  About`\n`Home`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "export default function App() {\n  return (\n    <BrowserRouter>\n      <div style={{ padding: 20 }}>\n        <nav style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 10 }}>\n          <Link to=\"/\">Home</Link>\n          <Link to=\"/about\">About</Link>\n        </nav>\n        \n        <Routes>\n          <Route path=\"/\" element={<Home />} />\n          <Route path=\"/about\" element={<About />} />\n        </Routes>\n      </div>\n    </BrowserRouter>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              10,
              13
            ],
            "description": "We added the `<Routes>` component, which acts as a switch based on the URL.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              11
            ],
            "description": "When the URL is exactly `/`, the `<Home />` component renders.\n\nThe exact text output on the screen will be:\n`Home About`\n`Home Page 🏠`",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              12
            ],
            "description": "If we navigate to `/about`, `<About />` renders instead, instantly swapping the content!",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Why use `<Link>` instead of `<a href>`?",
          "type": "misconception",
          "walkthrough": {
            "code": "// BAD: Triggers full page reload\n<a href=\"/about\">About</a>\n\n// GOOD: Intercepts and routes client-side\n<Link to=\"/about\">About</Link>",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "Standard `<a>` tags force the browser to make a hard network request to the server, throwing away all your React state and forcing a total reload."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "`<Link>` intercepts the click, prevents the default behavior, and updates the URL using the History API while keeping your React app alive and snappy."
              }
            ]
          }
        },
        {
          "title": "Why does the back button still work in SPAs?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "window.history.pushState({}, '', '/new-url');",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "React Router leverages the HTML5 History API. It uses `pushState` to change the URL bar without triggering a network request."
              },
              {
                "highlightLines": [
                  1
                ],
                "description": "This hooks directly into the browser's native back/forward stack, making your single-page app feel completely native to the user."
              }
            ]
          }
        },
        {
          "title": "Why is my 404 page rendering underneath everything?",
          "type": "misconception",
          "walkthrough": {
            "code": "<Routes>\n  <Route path=\"/\" element={<Home />} />\n  <Route path=\"/about\" element={<About />} />\n  <Route path=\"*\" element={<NotFound />} />\n</Routes>",
            "steps": [
              {
                "highlightLines": [
                  4
                ],
                "description": "In React Router (v6 and later), the order of `<Route>` components doesn't actually matter. The router is smart enough to rank them by specificity."
              },
              {
                "highlightLines": [
                  4
                ],
                "description": "The `*` (splat) route has the absolute lowest specificity. It will only ever render if literally no other route string in the entire tree matched the URL."
              }
            ]
          }
        },
        {
          "title": "URL State: useParams vs useSearchParams",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Dynamic path param: /users/:id -> /users/42\nconst { id } = useParams(); // '42'\n\n// Query string params: /search?query=react&sort=desc\nconst [searchParams, setSearchParams] = useSearchParams();\nconst query = searchParams.get('query'); // 'react'",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "`useParams` reads dynamic path segments declared with a colon `:id` in your route configuration."
              },
              {
                "highlightLines": [
                  5,
                  6
                ],
                "description": "`useSearchParams` reads and mutates URL query parameters (`?query=react`), keeping filter states shareable and bookmarkable."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "nested-routes",
      "title": "Nested Routes",
      "dependencies": {
        "react-router-dom": "^7.1.1"
      },
      "content": "\n# Nested Routes & Outlets\n\n### What is it?\n**Building on React Router:** In React Router, you can **nest** routes inside each other. The parent route renders a persistent layout and uses an **`<Outlet />`** to inject matching child components.\n\n> \ud83d\udca1 **Mental Model:** Think of nested routes like a picture-in-picture TV: the outer show (parent layout) keeps playing in the background while a smaller inset (the matched child route) changes what's showing inside it.\n\n### Why do we need it?\nOften, you want a persistent layout (like a sidebar or navigation bar) that stays on the screen while the content inside it changes.\n\n### How?\nYou nest `<Route>` inside another `<Route>` in the router configuration. In the parent component, you render `<Outlet />` where the child should appear.\n\n### Syntax/Example\n```jsx\nimport { Outlet, Link } from 'react-router-dom';\n\n// This is the parent layout component\nfunction DashboardLayout() {\n  return (\n    <div className=\"layout\">\n      <nav>\n        {/* This causes a navigation event without a full page refresh */}\n        <Link to=\"/dashboard/settings\">Settings</Link>\n      </nav>\n      <main>\n        {/* This causes the matching child route component to render here */}\n        <Outlet />\n      </main>\n    </div>\n  );\n}\n```\n\n### Example\n```jsx\nimport { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';\n\nfunction DashboardLayout() {\n  return (\n    <div style={{ padding: 20 }}>\n      <nav style={{ display: 'flex', gap: 12 }}>\n        <Link to=\"/\">Overview</Link>\n        <Link to=\"/profile\">Profile</Link>\n      </nav>\n      <hr />\n      <Outlet />\n    </div>\n  );\n}\n\nfunction Overview() {\n  return <h2>Overview</h2>;\n}\n\nfunction Profile() {\n  return <h2>Profile</h2>;\n}\n\nexport default function App() {\n  return (\n    <BrowserRouter>\n      <Routes>\n        <Route path=\"/\" element={<DashboardLayout />}>\n          <Route index element={<Overview />} />\n          <Route path=\"profile\" element={<Profile />} />\n        </Route>\n      </Routes>\n    </BrowserRouter>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** Our `Dashboard` acts as a layout with a sidebar. If you click \"Profile\", the URL changes, but the profile content doesn't appear! Open `/pages/Dashboard.jsx`. Import `Outlet` from `react-router-dom`. Render `<Outlet />` inside the `<main>` element to display the nested child routes.\n\n**Solution:** Import `Outlet` and add `<Outlet />` inside `<main>` in `Dashboard.jsx`.\n\n### Hints\n* **Nesting:** Make sure you imported `Outlet` correctly.\n",
      "starterCode": {
        "/App.jsx": "import { BrowserRouter, Routes, Route } from 'react-router-dom';\nimport Dashboard from './pages/Dashboard';\n\nfunction Profile() { return <h3>Profile Settings 👤</h3>; }\nfunction Billing() { return <h3>Billing Info 💳</h3>; }\n\nexport default function App() {\n  return (\n    <BrowserRouter>\n      <Routes>\n        <Route path=\"/\" element={<Dashboard />}>\n          <Route path=\"profile\" element={<Profile />} />\n          <Route path=\"billing\" element={<Billing />} />\n        </Route>\n      </Routes>\n    </BrowserRouter>\n  );\n}\n",
        "/pages/Dashboard.jsx": "import { Link } from 'react-router-dom';\n\nexport default function Dashboard() {\n  return (\n    <div style={{ display: 'flex', gap: 20, padding: 20 }}>\n      <nav style={{ display: 'flex', flexDirection: 'column', gap: 10, borderRight: '1px solid #ccc', paddingRight: 20 }}>\n        <h2 style={{ margin: 0, marginBottom: 10 }}>Dashboard</h2>\n        <Link to=\"/profile\">Profile</Link>\n        <Link to=\"/billing\">Billing</Link>\n      </nav>\n      \n      <main style={{ padding: 20 }}>\n        {/* 👉 The nested route content should appear here! Render the nested child component */}\n        <p>Select a tab from the sidebar.</p>\n      </main>\n    </div>\n  );\n}\n"
      },
      "solutionCode": {
        "/App.jsx": "import { BrowserRouter, Routes, Route } from 'react-router-dom';\nimport Dashboard from './pages/Dashboard';\n\nfunction Profile() { return <h3>Profile Settings 👤</h3>; }\nfunction Billing() { return <h3>Billing Info 💳</h3>; }\n\nexport default function App() {\n  return (\n    <BrowserRouter>\n      <Routes>\n        <Route path=\"/\" element={<Dashboard />}>\n          <Route path=\"profile\" element={<Profile />} />\n          <Route path=\"billing\" element={<Billing />} />\n        </Route>\n      </Routes>\n    </BrowserRouter>\n  );\n}\n",
        "/pages/Dashboard.jsx": "import { Link, Outlet } from 'react-router-dom';\n\nexport default function Dashboard() {\n  return (\n    <div style={{ display: 'flex', gap: 20, padding: 20 }}>\n      <nav style={{ display: 'flex', flexDirection: 'column', gap: 10, borderRight: '1px solid #ccc', paddingRight: 20 }}>\n        <h2 style={{ margin: 0, marginBottom: 10 }}>Dashboard</h2>\n        <Link to=\"/profile\">Profile</Link>\n        <Link to=\"/billing\">Billing</Link>\n      </nav>\n      \n      <main style={{ padding: 20 }}>\n        <Outlet />\n      </main>\n    </div>\n  );\n}\n"
      },
      "exampleWalkthrough": {
        "code": "import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';\n\nfunction DashboardLayout() {\n  return (\n    <div style={{ padding: 20 }}>\n      <nav style={{ display: 'flex', gap: 12 }}>\n        <Link to=\"/\">Overview</Link>\n        <Link to=\"/profile\">Profile</Link>\n      </nav>\n      <hr />\n      <Outlet />\n    </div>\n  );\n}\n\nfunction Overview() {\n  return <h2>Overview</h2>;\n}\n\nfunction Profile() {\n  return <h2>Profile</h2>;\n}\n\nexport default function App() {\n  return (\n    <BrowserRouter>\n      <Routes>\n        <Route path=\"/\" element={<DashboardLayout />}>\n          <Route index element={<Overview />} />\n          <Route path=\"profile\" element={<Profile />} />\n        </Route>\n      </Routes>\n    </BrowserRouter>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              28,
              31
            ],
            "description": "The child routes are written *inside* the parent `Route` rather than beside it. That nesting is the whole declaration — it says these URLs render within that layout.\n\nChild paths are relative, which is why line 30 is `profile` and not `/profile`. It resolves against the parent, giving `/profile`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              3,
              11
            ],
            "description": "On a match, React Router renders the parent element first and the child inside it. `<Outlet />` is the slot that says where.\n\nA layout with no `<Outlet />` renders as a layout with nothing in it — the child matched and had nowhere to go. That is the second-most common nested-routing bug, after forgetting the router itself.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              29,
              30
            ],
            "description": "`index` marks the child to render when the URL matches the parent exactly, with nothing after it. It is the answer to \"what fills the outlet at `/`\".\n\nWithout an index route, `/` renders the layout and leaves the outlet empty.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              7,
              8
            ],
            "description": "Click between the two links. The nav and the `<hr />` above the outlet never unmount — only the outlet's contents swap.\n\nThat persistence is the point of nesting rather than repeating the layout in every route. Scroll position, focus, and any state inside the layout all survive.\n\nThe exact text output on the screen will be:\n`Overview  Profile`\n`Overview`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { Link, Outlet } from 'react-router-dom';\n\nexport default function Dashboard() {\n  return (\n    <div style={{ display: 'flex', gap: 20, padding: 20 }}>\n      <nav style={{ display: 'flex', flexDirection: 'column', gap: 10, borderRight: '1px solid #ccc', paddingRight: 20 }}>\n        <h2 style={{ margin: 0, marginBottom: 10 }}>Dashboard</h2>\n        <Link to=\"/profile\">Profile</Link>\n        <Link to=\"/billing\">Billing</Link>\n      </nav>\n      \n      <main style={{ padding: 20 }}>\n        <Outlet />\n      </main>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              1,
              13
            ],
            "description": "We imported `Outlet` and placed it inside the `<main>` element.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              13
            ],
            "description": "Now, when the URL matches a nested route (like `/profile`), React Router injects the `<Profile />` component precisely where `<Outlet />` is located!\n\nThe exact text output on the screen will be:\n`Dashboard`\n`Profile`\n`Billing`\n(And if on /profile, `Profile Settings 👤`)",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "What exactly is an `<Outlet />`?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "function DashboardLayout() {\n  return (\n    <div className=\"flex\">\n      <Sidebar />\n      <Outlet />\n    </div>\n  );\n}",
            "steps": [
              {
                "highlightLines": [
                  5
                ],
                "description": "`<Outlet />` is simply a placeholder. It tells React Router exactly where to render the child routes."
              },
              {
                "highlightLines": [
                  2,
                  3,
                  4,
                  5,
                  6,
                  7
                ],
                "description": "This allows you to wrap consistent UI (like sidebars and navbars) around dynamic sub-pages effortlessly!"
              }
            ]
          }
        },
        {
          "title": "What is an Index Route?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "<Route path=\"/dashboard\" element={<DashboardLayout />}>\n  <Route index element={<DashboardHome />} />\n  <Route path=\"settings\" element={<Settings />} />\n</Route>",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "When a user navigates to exactly `/dashboard`, the `<Outlet />` inside the layout is empty!"
              },
              {
                "highlightLines": [
                  2
                ],
                "description": "An `index` route fills that empty space. It acts as the default child component to render when no other sub-paths match."
              }
            ]
          }
        },
        {
          "title": "Can I fetch data based on the route layout?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "const router = createBrowserRouter([\n  {\n    path: \"/team\",\n    element: <TeamLayout />,\n    loader: async () => fetch('/api/team')\n  }\n]);",
            "steps": [
              {
                "highlightLines": [
                  5
                ],
                "description": "Yes! Using React Router's new Data API (`createBrowserRouter`), you can attach a `loader` function directly to the route definition."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "React Router will start fetching the data the exact millisecond the user clicks the link, entirely eliminating the waterfall delays of standard `useEffect` fetching."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "use-navigate",
      "title": "Programmatic Routing",
      "content": "\n# Programmatic Navigation with useNavigate\n\n### What is it?\n**Building on declarative Link routing:** While `<Link>` is used for user clicks, the **`useNavigate`** hook allows you to redirect users programmatically in response to code events (such as form submission or authentication).\n\n> \ud83d\udca1 **Mental Model:** Think of useNavigate like a taxi you call after finishing an errand, versus a Link which is more like a signposted walking path \u2014 you take the path when the user is choosing where to go, and you call the taxi when code itself decides it's time to leave.\n\n### Why do we need it?\nWhile `<Link>` is great for declarative navigation (like clicking a menu item), sometimes you need to navigate *programmatically*—for example, redirecting a user after a form submits successfully.\n\n### How?\nCall `useNavigate()` to get the `navigate` function, then call `navigate('/path')`.\n\n### Syntax/Example\n```jsx\nimport { useNavigate } from 'react-router-dom';\n\nfunction Login() {\n  // This returns a function that can imperatively change the route\n  const navigate = useNavigate();\n\n  const handleLogin = async () => {\n    await performLogin();\n    // This causes the user to be redirected to the dashboard \n    // after a successful login\n    navigate('/dashboard');\n  };\n\n  return <button onClick={handleLogin}>Log In</button>;\n}\n```\n\n### Example\n```jsx\nimport { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';\n\nfunction Login() {\n  const navigate = useNavigate();\n\n  const handleLogin = (e) => {\n    e.preventDefault();\n    navigate('/dashboard');\n  };\n\n  return (\n    <form onSubmit={handleLogin} style={{ padding: 20 }}>\n      <h2>Login</h2>\n      <button type=\"submit\">Log In</button>\n    </form>\n  );\n}\n\nfunction Dashboard() {\n  const navigate = useNavigate();\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Dashboard</h2>\n      <button onClick={() => navigate(-1)}>Go back</button>\n    </div>\n  );\n}\n\nexport default function App() {\n  return (\n    <BrowserRouter>\n      <Routes>\n        <Route path=\"/\" element={<Login />} />\n        <Route path=\"/dashboard\" element={<Dashboard />} />\n      </Routes>\n    </BrowserRouter>\n  );\n}\n```\n\n### Challenge and Solution\n**Challenge:** Implement a login redirect. Import `useNavigate` from `react-router-dom`. Get the navigate function by calling the hook. Inside `handleLogin`, call `navigate('/dashboard')` to redirect the user.\n\n**Solution:** Import `useNavigate`. Add `const navigate = useNavigate();` inside `Login`. Call `navigate('/dashboard');` inside `handleLogin`.\n\n### Hints\n* **Advanced Navigation:** `navigate(-1)` acts like the browser's back button. `navigate('/path', { replace: true })` replaces the current history entry (essential for login redirects so users can't click back to the login page). The `useLocation` hook is frequently paired with `useNavigate` to read the current URL or query parameters.\n",
      "dependencies": {
        "react-router-dom": "^7.1.1"
      },
      "starterCode": {
        "/App.jsx": "import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';\nimport Login from './Login';\nimport Dashboard from './Dashboard';\n\nexport default function App() {\n  return (\n    <BrowserRouter>\n      <div style={{ padding: 20 }}>\n        <Routes>\n          <Route path=\"/\" element={<Login />} />\n          <Route path=\"/dashboard\" element={<Dashboard />} />\n        </Routes>\n      </div>\n    </BrowserRouter>\n  );\n}",
        "/Login.jsx": "// TODO: Import useNavigate\n\nexport default function Login() {\n  // TODO: Get navigate function\n\n  const handleLogin = (e) => {\n    e.preventDefault();\n    // Simulate API call...\n    console.log(\"Logged in!\");\n    // TODO: Redirect to /dashboard\n  };\n\n  return (\n    <form onSubmit={handleLogin}>\n      <h2>Login</h2>\n      <button type=\"submit\">Log In</button>\n    </form>\n  );\n}",
        "/Dashboard.jsx": "export default function Dashboard() {\n  return <h2>Welcome to your Dashboard!</h2>;\n}"
      },
      "solutionCode": {
        "/App.jsx": "import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';\nimport Login from './Login';\nimport Dashboard from './Dashboard';\n\nexport default function App() {\n  return (\n    <BrowserRouter>\n      <div style={{ padding: 20 }}>\n        <Routes>\n          <Route path=\"/\" element={<Login />} />\n          <Route path=\"/dashboard\" element={<Dashboard />} />\n        </Routes>\n      </div>\n    </BrowserRouter>\n  );\n}",
        "/Login.jsx": "import { useNavigate } from 'react-router-dom';\n\nexport default function Login() {\n  const navigate = useNavigate();\n\n  const handleLogin = (e) => {\n    e.preventDefault();\n    // Simulate API call...\n    console.log(\"Logged in!\");\n    navigate('/dashboard');\n  };\n\n  return (\n    <form onSubmit={handleLogin}>\n      <h2>Login</h2>\n      <button type=\"submit\">Log In</button>\n    </form>\n  );\n}",
        "/Dashboard.jsx": "export default function Dashboard() {\n  return <h2>Welcome to your Dashboard!</h2>;\n}"
      },
      "exampleWalkthrough": {
        "code": "import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';\n\nfunction Login() {\n  const navigate = useNavigate();\n\n  const handleLogin = (e) => {\n    e.preventDefault();\n    navigate('/dashboard');\n  };\n\n  return (\n    <form onSubmit={handleLogin} style={{ padding: 20 }}>\n      <h2>Login</h2>\n      <button type=\"submit\">Log In</button>\n    </form>\n  );\n}\n\nfunction Dashboard() {\n  const navigate = useNavigate();\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Dashboard</h2>\n      <button onClick={() => navigate(-1)}>Go back</button>\n    </div>\n  );\n}\n\nexport default function App() {\n  return (\n    <BrowserRouter>\n      <Routes>\n        <Route path=\"/\" element={<Login />} />\n        <Route path=\"/dashboard\" element={<Dashboard />} />\n      </Routes>\n    </BrowserRouter>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              4
            ],
            "description": "`useNavigate` returns a function that pushes a new entry onto the history stack. Like every router hook it only works inside the router, which is why the whole app is wired up below rather than left implied.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              6,
              7,
              8
            ],
            "description": "This is the case a `<Link>` cannot cover: the navigation has to happen *after* something else finishes. Submit the form, let the work complete, then move.\n\nThe order matters. `navigate` is not asynchronous and does not wait — putting it before an `await` sends the user away while the request is still in flight.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              24
            ],
            "description": "`navigate(-1)` goes back one entry, exactly like the browser's back button; `navigate(1)` goes forward. `navigate('/dashboard', { replace: true })` swaps the current entry instead of adding one, which is what you want after a login so that Back does not return to the form.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              12,
              14
            ],
            "description": "Reach for `<Link>` first. It is a real anchor, so it is keyboard-navigable, middle-clickable, and readable by a screen reader as a link — none of which a button calling `navigate` gives you for free.\n\n`useNavigate` is for the navigations that are a consequence of something, not a thing the user clicked.\n\nThe exact text output on the screen will be:\n`Login`\n`[Button: Log In]`",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "import { useNavigate } from 'react-router-dom';\n\nexport default function Login() {\n  const navigate = useNavigate();\n\n  const handleLogin = (e) => {\n    e.preventDefault();\n    // Simulate API call...\n    console.log(\"Logged in!\");\n    navigate('/dashboard');\n  };\n\n  return (\n    <form onSubmit={handleLogin}>\n      <h2>Login</h2>\n      <button type=\"submit\">Log In</button>\n    </form>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              4
            ],
            "description": "We initialize `navigate` by calling `useNavigate()`.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10
            ],
            "description": "After a successful login, we imperatively redirect the user to `/dashboard`!\n\nThe exact text output on the screen will be:\n`Welcome to your Dashboard!`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Can I navigate outside of React?",
          "type": "misconception",
          "walkthrough": {
            "code": "import { useNavigate } from 'react-router-dom';\n\naxios.interceptors.response.use(res => res, err => {\n  if (err.status === 401) {\n    const navigate = useNavigate(); // ERROR!\n    navigate('/login');\n  }\n});",
            "steps": [
              {
                "highlightLines": [
                  5
                ],
                "description": "Hooks can ONLY be called inside React component functions."
              },
              {
                "highlightLines": [
                  2
                ],
                "description": "If you are deep in a vanilla JavaScript file (like an Axios interceptor) and need to redirect the user, you cannot use `useNavigate`. You must use `window.location.href = '/login'`."
              }
            ]
          }
        },
        {
          "title": "Can I pass hidden data when navigating?",
          "type": "did-you-know",
          "walkthrough": {
            "code": "navigate('/checkout', { state: { cartTotal: 50 } });\n\n// In the checkout component:\nconst { state } = useLocation();",
            "steps": [
              {
                "highlightLines": [
                  1
                ],
                "description": "Yes! The `state` option allows you to pass JSON data securely between routes in memory."
              },
              {
                "highlightLines": [
                  1,
                  4
                ],
                "description": "This data doesn't show up in the URL bar, making it perfect for passing transient UI state (like \"success messages\" or previous scroll positions)."
              }
            ]
          }
        },
        {
          "title": "Replacing history vs Pushing history",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Adds a new entry to the back stack\nnavigate('/success');\n\n// Replaces the current entry in the stack\nnavigate('/success', { replace: true });",
            "steps": [
              {
                "highlightLines": [
                  2
                ],
                "description": "Normally, `navigate` pushes a new page onto the browser's history stack. The user can click the 'Back' button to return."
              },
              {
                "highlightLines": [
                  5
                ],
                "description": "If a user submits a checkout form, you should use `{ replace: true }`. This overwrites the checkout page in history so if they click 'Back', they don't accidentally re-submit their credit card!"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "router-loaders",
      "title": "Data Loading with Router Loaders",
      "dependencies": {
        "react-router-dom": "^7.1.1"
      },
      "content": "\n# Data Loading with Router Loaders\n\n### What is it?\n**Building on React Router and the `data-fetching` lesson's waterfall problem:** A **loader** is a function you attach to a route that fetches its data *before* the route's component ever renders. Instead of your component rendering empty, painting, then starting a fetch (the `useEffect` waterfall pattern), the router starts the fetch first and only renders the component once the data is ready.\n\n> 💡 **Mental Model:** Think of the difference like ordering food two ways: the `useEffect` version seats you at the table first and only then walks to the kitchen to place your order (you stare at an empty table — the loading state — while it cooks). A loader phones the order in *before* you're seated, so by the time you sit down, the food is already coming.\n\n### Why do we need it?\nThe `data-fetching` lesson covered this trade-off honestly: fetching inside `useEffect` always produces a loading state, because the fetch can't start until after the component has already rendered once. For a single component that's a minor cost. For a whole page — or worse, several nested components each fetching after their parent renders — it produces a fetch waterfall, where requests fire one after another instead of all at once.\n\n### How?\nLoaders require the **data router** API (`createBrowserRouter` + `<RouterProvider>`) instead of the declarative `<BrowserRouter>/<Routes>/<Route>` API from the earlier lessons in this module — only the data router knows how to run a loader before rendering a route. Attach a `loader` function to a route, and read its result inside the component with `useLoaderData()`.\n\n### Syntax/Example\n```jsx\nimport { createBrowserRouter, RouterProvider, useLoaderData } from 'react-router-dom';\n\n// This causes the fetch to start before Profile ever renders\nasync function profileLoader() {\n  const res = await fetch('/api/profile');\n  return res.json();\n}\n\nfunction Profile() {\n  // This returns the already-resolved data — no loading state needed here\n  const profile = useLoaderData();\n  return <h2>{profile.name}</h2>;\n}\n\nconst router = createBrowserRouter([\n  { path: '/profile', element: <Profile />, loader: profileLoader },\n]);\n\nfunction App() {\n  return <RouterProvider router={router} />;\n}\n```\n\n### Example\n```jsx\nimport { createBrowserRouter, RouterProvider, useLoaderData } from 'react-router-dom';\n\nasync function userLoader() {\n  const res = await fetch('https://jsonplaceholder.typicode.com/users/1');\n  return res.json();\n}\n\nfunction UserPage() {\n  const user = useLoaderData();\n  return <h2>{user.name}</h2>;\n}\n\nconst router = createBrowserRouter([\n  { path: '/', element: <UserPage />, loader: userLoader },\n]);\n\nfunction App() {\n  return <RouterProvider router={router} />;\n}\n\nexport default App;\n```\n\n### Challenge and Solution\n**Challenge:** `Profile` currently fetches its user with the `useEffect` waterfall pattern — it renders \"Loading...\" first, then fetches. Give the route a `loader` that fetches the user, and refactor `Profile` to read it with `useLoaderData()` instead of `useState`/`useEffect`.\n\n**Solution:** In `App.jsx`, define `async function profileLoader() { const res = await fetch('https://jsonplaceholder.typicode.com/users/1'); return res.json(); }` and attach it as `loader: profileLoader` on the route. In `Profile.jsx`, replace the `useState`/`useEffect` fetch with `const user = useLoaderData();` and delete the loading check entirely.\n\n### Hints\n* The data router API replaces `<BrowserRouter>` with `createBrowserRouter([...])` + `<RouterProvider router={router} />` — you no longer render `<Routes>`/`<Route>` as JSX; routes are a plain array of objects instead.\n* A loader can be `async` and just `return` its data directly — React Router awaits it and hands the result to `useLoaderData()`.\n* Once a route has a loader, its component never needs its own `isLoading` state for that data — by the time it renders, the data is already there.\n",
      "starterCode": {
        "/App.jsx": "import { createBrowserRouter, RouterProvider } from 'react-router-dom';\nimport Profile from './Profile';\n\n// 👉 1. Define an async profileLoader function that fetches\n//       'https://jsonplaceholder.typicode.com/users/1' and returns the JSON.\n\nconst router = createBrowserRouter([\n  // 👉 2. Attach it to this route with a `loader` property.\n  { path: '/', element: <Profile /> },\n]);\n\nexport default function App() {\n  return <RouterProvider router={router} />;\n}",
        "/Profile.jsx": "import { useState, useEffect } from 'react';\n\n// 👉 3. Replace this whole waterfall pattern with useLoaderData().\nexport default function Profile() {\n  const [user, setUser] = useState(null);\n\n  useEffect(() => {\n    fetch('https://jsonplaceholder.typicode.com/users/1')\n      .then(res => res.json())\n      .then(setUser);\n  }, []);\n\n  if (!user) return <p>Loading...</p>;\n  return <h2>{user.name}</h2>;\n}"
      },
      "solutionCode": {
        "/App.jsx": "import { createBrowserRouter, RouterProvider } from 'react-router-dom';\nimport Profile from './Profile';\n\nasync function profileLoader() {\n  const res = await fetch('https://jsonplaceholder.typicode.com/users/1');\n  return res.json();\n}\n\nconst router = createBrowserRouter([\n  { path: '/', element: <Profile />, loader: profileLoader },\n]);\n\nexport default function App() {\n  return <RouterProvider router={router} />;\n}",
        "/Profile.jsx": "import { useLoaderData } from 'react-router-dom';\n\nexport default function Profile() {\n  const user = useLoaderData();\n  return <h2>{user.name}</h2>;\n}"
      },
      "exampleWalkthrough": {
        "code": "import { createBrowserRouter, RouterProvider, useLoaderData } from 'react-router-dom';\n\nasync function userLoader() {\n  const res = await fetch('https://jsonplaceholder.typicode.com/users/1');\n  return res.json();\n}\n\nfunction UserPage() {\n  const user = useLoaderData();\n  return <h2>{user.name}</h2>;\n}\n\nconst router = createBrowserRouter([\n  { path: '/', element: <UserPage />, loader: userLoader },\n]);\n\nfunction App() {\n  return <RouterProvider router={router} />;\n}\n\nexport default App;",
        "steps": [
          {
            "highlightLines": [
              3,
              4,
              5,
              6
            ],
            "description": "`userLoader` is a plain async function outside any component. Its only job is to fetch what the route needs and return it.\n\nBeing outside the component is what makes the rest possible: React Router can call it before deciding to render anything.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              13,
              14,
              15
            ],
            "description": "The loader is attached to the route as data, next to `path` and `element`. React Router calls it the moment navigation to that route begins — not when the component mounts.\n\nThat single move is what removes the waterfall. With `useEffect` fetching, the component must render before the request can start; here the request and the code-splitting can happen at once.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              8,
              9,
              10
            ],
            "description": "By the time `UserPage` renders, the data has resolved. `useLoaderData()` just reads it.\n\nCount what is missing: no `isLoading`, no `error` state, no empty first render, no `user &&` guard before every field. The component only ever runs in the state where its data exists.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              17,
              18
            ],
            "description": "`RouterProvider` replaces `<BrowserRouter>` for this style — the routes are a data structure passed in rather than JSX rendered out, which is what lets the router inspect them before rendering.\n\nThe exact text output on the screen will be:\n`Leanne Graham`\n\nwith no loading flicker before it, because the router waited.",
            "stateSnapshot": {}
          }
        ]
      },
      "walkthrough": {
        "code": "async function profileLoader() {\n  const res = await fetch('https://jsonplaceholder.typicode.com/users/1');\n  return res.json();\n}\n\nconst router = createBrowserRouter([\n  { path: '/', element: <Profile />, loader: profileLoader },\n]);\n\n// Profile.jsx\nfunction Profile() {\n  const user = useLoaderData();\n  return <h2>{user.name}</h2>;\n}",
        "steps": [
          {
            "highlightLines": [1, 2, 3, 4],
            "description": "The fetch that used to live inside `Profile`'s `useEffect` moved out into `profileLoader`, a standalone function the router calls directly — it's no longer tied to a component's render lifecycle at all.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [6, 7, 8],
            "description": "The route definition now carries `loader: profileLoader`. This is what tells React Router to run the loader *before* navigating to this route completes.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [10, 11, 12, 13],
            "description": "`Profile` shrank from nine lines (state, effect, loading check) to two. `useLoaderData()` returns the already-resolved user directly — there's no moment where `Profile` renders with `user` still `null`, so the loading check isn't just simplified, it's gone entirely.\n\nThe exact text output on the screen will be:\n`Leanne Graham`",
            "stateSnapshot": {}
          }
        ]
      },
      "insights": [
        {
          "title": "Loaders run in parallel automatically — this is the waterfall fix",
          "type": "did-you-know",
          "walkthrough": {
            "code": "// Nested routes, each with their own loader:\nconst router = createBrowserRouter([\n  {\n    path: '/dashboard',\n    element: <Dashboard />,\n    loader: dashboardLoader,\n    children: [\n      { path: 'stats', element: <Stats />, loader: statsLoader },\n    ],\n  },\n]);\n// dashboardLoader and statsLoader both start running\n// as soon as navigation begins — NOT one after another.",
            "steps": [
              {
                "highlightLines": [4, 5, 6, 7, 8],
                "description": "This is the direct fix for the nested-Suspense waterfall problem covered in the Modern React module: React Router kicks off every matched route's loader for a given navigation at the same time, not one after another as each component renders."
              },
              {
                "highlightLines": [9, 10],
                "description": "Two nested routes with two loaders fetch in parallel by default — you get the parallel-fetching benefit automatically, without needing something like `useSuspenseQueries` to opt into it by hand."
              }
            ]
          }
        },
        {
          "title": "Actions are the write-side counterpart to loaders",
          "type": "did-you-know",
          "walkthrough": {
            "code": "async function createIssueAction({ request }) {\n  const formData = await request.formData();\n  await fetch('/api/issues', { method: 'POST', body: formData });\n  return redirect('/issues');\n}\n\nconst router = createBrowserRouter([\n  { path: '/issues/new', element: <NewIssue />, action: createIssueAction },\n]);\n\n// In NewIssue.jsx — a plain <Form>, no onSubmit handler needed:\n<Form method=\"post\"><input name=\"title\" /><button>Create</button></Form>",
            "steps": [
              {
                "highlightLines": [1, 2, 3, 4],
                "description": "Just as a `loader` handles GET-style data fetching for a route, an `action` handles form submissions and mutations — POST/PUT/DELETE — for that same route."
              },
              {
                "highlightLines": [7, 8, 9],
                "description": "The action is attached to the route the same way the loader is. React Router's own `<Form>` component (not the plain HTML `<form>`) automatically calls the matching route's action on submit."
              },
              {
                "highlightLines": [11, 12],
                "description": "Notice there's no `onSubmit` handler, no `useState` for pending status, and no manual `fetch` call in the component at all — this is the same declarative shift `useActionState` brings to plain forms (Modern React module), applied at the routing layer instead of the component layer."
              }
            ]
          }
        },
        {
          "title": "This is a different setup than <BrowserRouter>, not just new hooks",
          "type": "misconception",
          "walkthrough": {
            "code": "// ❌ Declarative API — no loader support\n<BrowserRouter>\n  <Routes>\n    <Route path=\"/\" element={<Profile />} />\n  </Routes>\n</BrowserRouter>\n\n// ✅ Data router API — required for loader/action\nconst router = createBrowserRouter([\n  { path: '/', element: <Profile />, loader: profileLoader },\n]);\n<RouterProvider router={router} />",
            "steps": [
              {
                "highlightLines": [2, 3, 4, 5],
                "description": "The `<BrowserRouter>`/`<Routes>`/`<Route>` API from the earlier lessons in this module is still completely valid React Router — but it has no concept of loaders or actions. Adding a `loader` prop to a `<Route>` written this way silently does nothing."
              },
              {
                "highlightLines": [8, 9, 10, 11],
                "description": "Loaders and actions require routes defined as a plain array of objects passed to `createBrowserRouter`, rendered via `<RouterProvider>` instead of `<BrowserRouter>`. This is a routing architecture decision to make early in a real project, not a drop-in addition to an existing `<Routes>` tree."
              }
            ]
          }
        }
      ]
    }
  ]
};
