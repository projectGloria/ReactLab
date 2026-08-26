export default {
  "id": "capstones",
  "title": "Application Capstones",
  "description": "Three application-scale projects that integrate architecture, testing, state, performance, and modern React.",
  "icon": "Rocket",
  "lessons": [
    {
      "id": "capstone-dashboard",
      "title": "Capstone 1: React Fundamentals Dashboard",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\n// This is a starting skeleton, not a solution — replace every TODO.\n// Suggested shape: one \"owner\" component holding shared filter state,\n// with Overview / Items / Details as the three required screens.\n\nfunction Overview({ items, filter }) {\n  // TODO: derive summary stats from `items` + `filter` during render —\n  // do not store them in their own useState.\n  const visibleCount = items.filter(i => i.name.includes(filter)).length;\n  return (\n    <section>\n      <h2>Overview</h2>\n      <p>Showing {visibleCount} of {items.length} items</p>\n    </section>\n  );\n}\n\nfunction ItemsList({ items, filter, onFilterChange }) {\n  // TODO: this is your controlled, accessible filter input\n  const filtered = items.filter(i => i.name.includes(filter));\n  return (\n    <section>\n      <h2>Items</h2>\n      <label htmlFor=\"filter\">Filter</label>\n      <input id=\"filter\" value={filter} onChange={e => onFilterChange(e.target.value)} />\n      {/* TODO: loading / empty / error states belong here, not just the happy path */}\n      <ul>{filtered.map(i => <li key={i.id}>{i.name}</li>)}</ul>\n    </section>\n  );\n}\n\nfunction Details({ items }) {\n  // TODO: third required screen — pick one item and show more detail\n  return <section><h2>Details</h2><p>{items[0]?.name ?? 'No item selected'}</p></section>;\n}\n\nexport default function App() {\n  // Filter state is OWNED here — the lowest common parent of Overview and ItemsList —\n  // and passed down as props. This is the ownership decision the rubric asks you to defend.\n  const [filter, setFilter] = useState('');\n  const [items] = useState([\n    { id: 1, name: 'Alpha' },\n    { id: 2, name: 'Beta' },\n    { id: 3, name: 'Gamma' },\n  ]);\n\n  // TODO: replace this with real routing (three screens) once the state\n  // ownership above is working — start here, add React Router after.\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 24 }}>\n      <Overview items={items} filter={filter} />\n      <ItemsList items={items} filter={filter} onFilterChange={setFilter} />\n      <Details items={items} />\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              41,
              52,
              53
            ],
            "description": "Start here, because everything else follows from it. `filter` lives in `App` — the lowest component that renders both `Overview` and `ItemsList`, the two components that need it.\n\nNot in `ItemsList` where the input is, because then `Overview` could not read it. Not in a Context, because two siblings sharing one value is not a global-state problem. This is the ownership decision the rubric asks you to defend, and \"lowest common parent\" is the defence.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              10,
              22
            ],
            "description": "Both components derive what they display from `items` and `filter` during render. Neither keeps a `visibleCount` or a `filteredItems` in its own state.\n\nThat is the rule the first TODO is enforcing. A count stored in state is a second source of truth that some future code path will forget to update; a count calculated during render cannot drift, because it does not persist.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              25,
              26
            ],
            "description": "The filter input is controlled — `value` from the prop, changes reported back up through `onFilterChange` — and it is labelled, with `htmlFor` matched to the input's `id`.\n\nThe label is not decoration. It is what makes the field findable by role and name, which is both an accessibility requirement and how your tests will locate it.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              27
            ],
            "description": "This TODO is the one most submissions skip. The happy path is three lines; the states around it — still loading, loaded but empty, failed — are where a dashboard actually spends its time in front of a user.\n\nAn empty list because the filter matched nothing and an empty list because the request failed look identical here, and must not.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              48,
              49,
              54
            ],
            "description": "Routing comes last, deliberately. Get the ownership right with all three screens stacked on one page, then split them across routes — at which point the filter belongs in the URL rather than in `useState`, so a filtered view can be linked to and survives a refresh.\n\nDoing it in the other order means rebuilding the state layout once routing arrives.\n\nThe skeleton as it stands renders:\n`Overview` / `Showing 3 of 3 items`, the filter field, and `Details`.",
            "stateSnapshot": {}
          }
        ]
      },
      "content": "# Capstone 1: React Fundamentals Dashboard\n\nBuild a dashboard that deliberately avoids advanced libraries.\n\n## Requirements\n- Routing with at least three screens.\n- Shared filters owned at the lowest common parent.\n- Controlled form inputs and accessible validation.\n- Derived statistics calculated during render rather than stored redundantly.\n- Reusable component boundaries using composition.\n- Loading, empty, success, and error states.\n- At least five behavioral tests using React Testing Library.\n\n## Architecture review\nBefore coding, document which values are state, which are derived, who owns each state value, which behaviors are event handlers, and which Effects actually synchronize with external systems.\n\n## Acceptance rubric\n- No redundant derived state.\n- No Effect used as an event relay.\n- Inputs remain controlled and accessible.\n- State ownership is explainable in one paragraph.\n- Tests verify user-visible behavior rather than implementation details.\n\nThis project is complete when you can defend every state boundary in a code review.\n\n### Example\n```jsx\nimport { useState } from 'react';\n\n// This is a starting skeleton, not a solution — replace every TODO.\n// Suggested shape: one \"owner\" component holding shared filter state,\n// with Overview / Items / Details as the three required screens.\n\nfunction Overview({ items, filter }) {\n  // TODO: derive summary stats from `items` + `filter` during render —\n  // do not store them in their own useState.\n  const visibleCount = items.filter(i => i.name.includes(filter)).length;\n  return (\n    <section>\n      <h2>Overview</h2>\n      <p>Showing {visibleCount} of {items.length} items</p>\n    </section>\n  );\n}\n\nfunction ItemsList({ items, filter, onFilterChange }) {\n  // TODO: this is your controlled, accessible filter input\n  const filtered = items.filter(i => i.name.includes(filter));\n  return (\n    <section>\n      <h2>Items</h2>\n      <label htmlFor=\"filter\">Filter</label>\n      <input id=\"filter\" value={filter} onChange={e => onFilterChange(e.target.value)} />\n      {/* TODO: loading / empty / error states belong here, not just the happy path */}\n      <ul>{filtered.map(i => <li key={i.id}>{i.name}</li>)}</ul>\n    </section>\n  );\n}\n\nfunction Details({ items }) {\n  // TODO: third required screen — pick one item and show more detail\n  return <section><h2>Details</h2><p>{items[0]?.name ?? 'No item selected'}</p></section>;\n}\n\nexport default function App() {\n  // Filter state is OWNED here — the lowest common parent of Overview and ItemsList —\n  // and passed down as props. This is the ownership decision the rubric asks you to defend.\n  const [filter, setFilter] = useState('');\n  const [items] = useState([\n    { id: 1, name: 'Alpha' },\n    { id: 2, name: 'Beta' },\n    { id: 3, name: 'Gamma' },\n  ]);\n\n  // TODO: replace this with real routing (three screens) once the state\n  // ownership above is working — start here, add React Router after.\n  return (\n    <div style={{ padding: 20, display: 'grid', gap: 24 }}>\n      <Overview items={items} filter={filter} />\n      <ItemsList items={items} filter={filter} onFilterChange={setFilter} />\n      <Details items={items} />\n    </div>\n  );\n}\n```"
    },
    {
      "id": "capstone-production-app",
      "title": "Capstone 2: Production-Style Client Application",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\nimport { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';\n\n// Starting skeleton for the state-category decision this capstone asks you to\n// document. Each TODO corresponds to one category from the decision record.\n\nfunction IssueList() {\n  // TODO (server state): replace with useQuery — do not fetch in a raw useEffect here.\n  const { data: issues, isLoading } = useQuery({\n    queryKey: ['issues'],\n    queryFn: () => fetch('/api/issues').then(r => r.json()),\n  });\n\n  const queryClient = useQueryClient();\n  // TODO (optimistic mutation): onMutate should update the cache immediately,\n  // and onError should roll it back — that's the \"rollback/error reconciliation\" requirement.\n  const closeIssue = useMutation({\n    mutationFn: (id) => fetch(`/api/issues/${id}/close`, { method: 'POST' }),\n    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['issues'] }),\n  });\n\n  if (isLoading) return <p>Loading issues...</p>;\n  return (\n    <ul>\n      {(issues ?? []).map(issue => (\n        <li key={issue.id}>\n          {issue.title}\n          <button onClick={() => closeIssue.mutate(issue.id)}>Close</button>\n        </li>\n      ))}\n    </ul>\n  );\n}\n\nexport default function App() {\n  // TODO (local state): things like \"is this dropdown open\" stay here, local to the component.\n  // TODO (URL state): the active issue / filter / page belongs in the route, not in useState —\n  //  wire this up with React Router once the shape below works.\n  const [selectedTab, setSelectedTab] = useState('open');\n\n  // TODO (context): only introduce Context here for something genuinely global,\n  // like the authenticated user — not for IssueList's own data.\n\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Issues</h2>\n      <nav>\n        <button onClick={() => setSelectedTab('open')}>Open</button>\n        <button onClick={() => setSelectedTab('closed')}>Closed</button>\n      </nav>\n      {/* TODO: wrap this in an ErrorBoundary around this specific failure domain */}\n      <IssueList />\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              8,
              9,
              10,
              11,
              12
            ],
            "description": "The whole capstone turns on one question asked of every value: which category is this?\n\nThis one is **server state** — it lives in a database, other people can change it, and your copy is a cache that can go stale. That is why it belongs in `useQuery` and not in a `useEffect` writing to `useState`: caching, deduplication, refetch-on-focus and staleness are the problems server state has, and hand-rolled fetching solves none of them.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              15,
              16,
              17,
              18,
              19
            ],
            "description": "The mutation is where the requirement gets sharp. `onSuccess` invalidating the query is the easy half — it works, but the user waits a round trip to see their own click.\n\nThe brief asks for `onMutate` to update the cache immediately and `onError` to put the previous value back. Write the rollback first: optimistic updates without reconciliation are how a UI ends up confidently showing something that never happened.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              36,
              39
            ],
            "description": "**Local state**: values whose entire lifetime is one component and whose loss nobody would notice — an open dropdown, a hover, a half-typed field. `useState` is correct and no further thought is needed.\n\nThe mistake this category catches is the opposite one: lifting everything to a store because it might be needed later.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              37,
              38
            ],
            "description": "**URL state**: which issue is selected, which filter is applied, which page. The test is whether a user could reasonably send someone a link to it, or expect Back to work, or expect a refresh to keep it.\n\n`selectedTab` on line 39 currently fails that test. Moving it into the route is part of the exercise, not an optimisation.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              41,
              42
            ],
            "description": "**Context** is the smallest category, and the one most often reached for first. It is for something genuinely global and rarely changing — the authenticated user, the theme.\n\nPutting `IssueList`'s data in Context would not simplify anything: every consumer re-renders on every change, and you would have rebuilt a worse cache than the one `useQuery` already gave you.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              51,
              52
            ],
            "description": "Finally, the failure domain. An error boundary around `<IssueList />` means a failure there costs the list and nothing else — the header, the tabs and the rest of the page keep working.\n\nOne boundary at the root would instead turn any error anywhere into a blank page. Deciding *where* a failure is allowed to stop is an architectural choice, and it is the one this capstone wants written down.",
            "stateSnapshot": {}
          }
        ]
      },
      "dependencies": {
        "@tanstack/react-query": "^5.0.0"
      },
      "content": "# Capstone 2: Production-Style Client Application\n\nBuild a production-style client application such as an issue tracker, inventory system, or project board.\n\n## Requirements\n- React Router with nested routes and URL state.\n- Authentication simulation with protected routes.\n- TanStack Query for server state.\n- Optimistic mutation with rollback/error reconciliation.\n- Custom hooks that expose reusable behavior without hiding ownership.\n- Context only for genuinely shared values.\n- An external client-state store only where local/shared state is insufficient.\n- Error boundaries around meaningful failure domains.\n- MSW for deterministic network tests.\n- React Profiler measurements for one deliberately slow interaction.\n\n## Architecture review\nProduce a short decision record explaining why each state category is local state, URL state, server state, context, or external store state.\n\n## Acceptance rubric\n- Remote data is not duplicated into arbitrary local state.\n- Cache invalidation and mutation ownership are explicit.\n- Loading/error/empty states are designed per boundary.\n- Tests cover success and failure paths.\n- Performance changes are justified by measurement, not instinct.\n\nThis project is complete when another developer can extend it without guessing where data belongs.\n\n### Example\n```jsx\nimport { useState } from 'react';\nimport { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';\n\n// Starting skeleton for the state-category decision this capstone asks you to\n// document. Each TODO corresponds to one category from the decision record.\n\nfunction IssueList() {\n  // TODO (server state): replace with useQuery — do not fetch in a raw useEffect here.\n  const { data: issues, isLoading } = useQuery({\n    queryKey: ['issues'],\n    queryFn: () => fetch('/api/issues').then(r => r.json()),\n  });\n\n  const queryClient = useQueryClient();\n  // TODO (optimistic mutation): onMutate should update the cache immediately,\n  // and onError should roll it back — that's the \"rollback/error reconciliation\" requirement.\n  const closeIssue = useMutation({\n    mutationFn: (id) => fetch(`/api/issues/${id}/close`, { method: 'POST' }),\n    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['issues'] }),\n  });\n\n  if (isLoading) return <p>Loading issues...</p>;\n  return (\n    <ul>\n      {(issues ?? []).map(issue => (\n        <li key={issue.id}>\n          {issue.title}\n          <button onClick={() => closeIssue.mutate(issue.id)}>Close</button>\n        </li>\n      ))}\n    </ul>\n  );\n}\n\nexport default function App() {\n  // TODO (local state): things like \"is this dropdown open\" stay here, local to the component.\n  // TODO (URL state): the active issue / filter / page belongs in the route, not in useState —\n  //  wire this up with React Router once the shape below works.\n  const [selectedTab, setSelectedTab] = useState('open');\n\n  // TODO (context): only introduce Context here for something genuinely global,\n  // like the authenticated user — not for IssueList's own data.\n\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Issues</h2>\n      <nav>\n        <button onClick={() => setSelectedTab('open')}>Open</button>\n        <button onClick={() => setSelectedTab('closed')}>Closed</button>\n      </nav>\n      {/* TODO: wrap this in an ErrorBoundary around this specific failure domain */}\n      <IssueList />\n    </div>\n  );\n}\n```"
    },
    {
      "id": "capstone-modern-react",
      "title": "Capstone 3: Modern React Architecture",
      "exampleWalkthrough": {
        "code": "import { useState } from 'react';\n\n// This playground demonstrates only the CLIENT half of the boundary decision:\n// optimistic UI state that behaves as if a mutation already succeeded.\n// The actual Server Component / Server Function split belongs in a real\n// framework (e.g. Next.js) and is intentionally not simulated in this\n// browser sandbox -- see the lesson requirements above.\n\nconst initialTasks = [\n  { id: 1, label: 'Ship the release', liked: false },\n  { id: 2, label: 'Review the PR', liked: true },\n];\n\nexport default function App() {\n  const [tasks, setTasks] = useState(initialTasks);\n\n  // ACTION + OPTIMISTIC STATE: the UI updates immediately, as if a Server\n  // Function already confirmed the mutation. A real implementation would\n  // roll this back on failure -- that reconciliation lives on this same\n  // client boundary, alongside Suspense and error boundaries.\n  function toggleLike(id) {\n    setTasks(current =>\n      current.map(task =>\n        task.id === id ? { ...task, liked: !task.liked } : task\n      )\n    );\n  }\n\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Optimistic UI (client boundary)</h2>\n      <ul style={{ listStyle: 'none', padding: 0 }}>\n        {tasks.map(task => (\n          <li key={task.id} style={{ padding: '6px 0' }}>\n            <button onClick={() => toggleLike(task.id)}>\n              {task.liked ? '❤️' : '🤍'} {task.label}\n            </button>\n          </li>\n        ))}\n      </ul>\n      <p style={{ opacity: 0.7, fontSize: 14 }}>\n        Server/client boundaries, Suspense, and Activity are the architectural\n        decisions this capstone asks you to make in a real framework project --\n        this sandbox only isolates the client-side optimistic-state piece.\n      </p>\n    </div>\n  );\n}",
        "steps": [
          {
            "highlightLines": [
              3,
              4,
              5,
              6,
              7
            ],
            "description": "Read the caveat first, because it defines the scope. A real Server Component split needs a framework — Next.js or similar — with a build step that can separate server code from client code.\n\nThis sandbox runs entirely in a browser, so it isolates the one half that *is* reproducible here: the client boundary and the optimistic state that lives on it.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              14,
              15
            ],
            "description": "Everything below this line is client code, and that is the decision the capstone is about. This component holds state and handles events, so it cannot be a Server Component — and in a framework project, `'use client'` at the top of this file would mark exactly that boundary.\n\nThe question to answer in your write-up is not \"which components are client components\" but \"where should the boundary be\", because everything below it ships to the browser.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              21,
              22,
              23,
              24,
              25,
              26,
              27
            ],
            "description": "The update is immediate and local: map over the tasks, replace the one that changed, leave the rest alone. The heart flips before any server has agreed.\n\nNote it builds a new array and new objects rather than mutating `tasks` — the same purity requirement as everywhere else, and the reason React notices the change at all.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              17,
              18,
              19,
              20
            ],
            "description": "And here is what the skeleton leaves for you. Optimism is only half a design; the other half is what happens when the Server Function says no.\n\nThat reconciliation lives on this same client boundary, next to the error boundary that catches the failure and the Suspense boundary that covers the wait. Three boundaries, one place — which is why \"choose the boundary first\" is the title.",
            "stateSnapshot": {}
          },
          {
            "highlightLines": [
              33,
              35,
              36
            ],
            "description": "Click a heart and it toggles instantly, with no request and no pending state, because there is nothing to wait for yet.\n\nThe exact text output on the screen will be:\n`Optimistic UI (client boundary)`\n`[Button: white heart, Ship the release]`\n`[Button: red heart, Review the PR]`",
            "stateSnapshot": {}
          }
        ]
      },
      "content": "# Capstone 3: Modern React Architecture\n\nBuild the same kind of feature in a real framework environment that supports server-oriented React features. Do not simulate Server Components in the browser sandbox.\n\n## Requirements\n- Server/client component boundaries.\n- Server data access appropriate to the framework.\n- Actions or Server Functions where supported.\n- Suspense boundaries designed around user-perceived loading states.\n- Optimistic UI for at least one mutation.\n- React 19.2 useEffectEvent where the problem genuinely requires it.\n- Activity for hidden UI that should remain ready.\n- TypeScript throughout the application.\n- Behavioral tests around the most failure-prone boundaries.\n\n## Architecture review\nFor every advanced API, document the problem it solves and why a simpler boundary was rejected.\n\n## Acceptance rubric\n- Server/client boundaries are deliberate rather than accidental.\n- Effects are limited to external synchronization.\n- Optimistic state is treated as temporary UI state, not canonical server truth.\n- Suspense and error boundaries are placed according to UX failure domains.\n- The application remains understandable without memorizing framework-specific tricks.\n\nThis is the graduation project: the goal is not API coverage but architectural judgment.\n\n### Example\n```jsx\nimport { useState } from 'react';\n\n// This playground demonstrates only the CLIENT half of the boundary decision:\n// optimistic UI state that behaves as if a mutation already succeeded.\n// The actual Server Component / Server Function split belongs in a real\n// framework (e.g. Next.js) and is intentionally not simulated in this\n// browser sandbox -- see the lesson requirements above.\n\nconst initialTasks = [\n  { id: 1, label: 'Ship the release', liked: false },\n  { id: 2, label: 'Review the PR', liked: true },\n];\n\nexport default function App() {\n  const [tasks, setTasks] = useState(initialTasks);\n\n  // ACTION + OPTIMISTIC STATE: the UI updates immediately, as if a Server\n  // Function already confirmed the mutation. A real implementation would\n  // roll this back on failure -- that reconciliation lives on this same\n  // client boundary, alongside Suspense and error boundaries.\n  function toggleLike(id) {\n    setTasks(current =>\n      current.map(task =>\n        task.id === id ? { ...task, liked: !task.liked } : task\n      )\n    );\n  }\n\n  return (\n    <div style={{ padding: 20 }}>\n      <h2>Optimistic UI (client boundary)</h2>\n      <ul style={{ listStyle: 'none', padding: 0 }}>\n        {tasks.map(task => (\n          <li key={task.id} style={{ padding: '6px 0' }}>\n            <button onClick={() => toggleLike(task.id)}>\n              {task.liked ? '❤️' : '🤍'} {task.label}\n            </button>\n          </li>\n        ))}\n      </ul>\n      <p style={{ opacity: 0.7, fontSize: 14 }}>\n        Server/client boundaries, Suspense, and Activity are the architectural\n        decisions this capstone asks you to make in a real framework project --\n        this sandbox only isolates the client-side optimistic-state piece.\n      </p>\n    </div>\n  );\n}\n```\n"
    }
  ]
};
