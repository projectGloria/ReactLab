const append = (markdown) => `\n\n${markdown.trim()}\n`;

export const EXTENDED_LESSON_ENHANCEMENTS = {
  'use-ref': {
    markdown: append(`## Decide between state and refs
### Learning objective
You should be able to explain why a ref survives renders without causing a new render, and choose it only for imperative or non-visual values.
### The decision rule
If changing the value should change what the user sees, use state. If the value is a DOM handle, timer ID, previous value, or mutable instance detail that should not trigger a render, a ref may be appropriate.
### Common mistake
Do not read a ref during render and expect React to update the screen when it changes. A ref stores information; it does not describe the UI.`),
  },
  suspense: {
    markdown: append(`## Treat loading as a boundary
### Learning objective
You should be able to separate loading boundaries from error boundaries and choose a fallback that preserves useful context.
### The decision rule
Suspense answers “what should this subtree show while it is not ready?” Error handling answers “what should this subtree show when it fails?” They are different states and deserve different UI.
### Transfer prompt
When a page contains a navigation shell and a slow detail panel, place the boundary around the detail panel so the shell remains usable.`),
  },
  'use-local-storage': {
    markdown: append(`## Design a custom hook as a small API
### Learning objective
You should be able to identify the state, synchronization, serialization, and fallback responsibilities inside a persistent-storage hook.
### The decision rule
A custom hook should hide the mechanism while exposing a small, predictable API. The component should not need to know when storage is read, how values are serialized, or how malformed data is recovered.
### Common mistake
Do not assume browser storage is always available or always valid. Treat reading and parsing as fallible operations.`),
  },
  'controlled-inputs': {
    markdown: append(`## Make the form state explicit
### Learning objective
You should be able to trace a controlled input from user event to state update to rendered value.
### The decision rule
The input displays the value from React state, and the change handler is the only path that updates that state. This makes validation, conditional controls, and submission data observable in one place.
### Debugging question
If typing appears impossible, inspect whether the value prop is controlled but the change handler fails to update the state.`),
  },
  composition: {
    markdown: append(`## Use composition to keep variation outside the component
### Learning objective
You should be able to decide whether a component should own a visual detail or receive it through children or a render prop.
### The decision rule
A reusable component should own stable structure and behavior. The parent should supply content that varies by screen or use case.
### Common mistake
Do not create a prop for every possible child fragment when children or composition can express the relationship more clearly.`),
  },
  'react-memo': {
    markdown: append(`## Optimize identity only when identity is the problem
### Learning objective
You should be able to explain how memoization interacts with prop identity and why profiling comes before optimization.
### The decision rule
Memoization can skip work only when the relevant props are stable and the child would otherwise do meaningful work. A new object or function created on every render can defeat the optimization.
### Common mistake
Do not use memoization to hide an incorrect data-flow design. First make the component correct and measure the bottleneck.`),
  },
  'react-router': {
    markdown: append(`## Connect URL, route, and UI
### Learning objective
You should be able to describe the URL as part of application state and identify which route should render for a given path.
### The decision rule
Use declarative links for user-selected destinations. Use programmatic navigation after a completed action such as saving a form. Keep route parameters meaningful and validate data derived from them.
### Transfer prompt
For a detail page, the route identifies which record to load; the fetched record remains separate server state.`),
  },
  'use-context': {
    markdown: append(`## Use context for shared access, not invisible ownership
### Learning objective
You should be able to identify when context reduces prop threading and when it would make dependencies harder to see.
### The decision rule
Context is useful for values many descendants need, such as theme, locale, or an authenticated user. Keep rapidly changing or narrowly used state local when possible.
### Common mistake
Do not put every value in one global context. Split providers or use focused selectors when unrelated consumers should not update together.`),
  },
  zustand: {
    markdown: append(`## Keep a global store intentionally small
### Learning objective
You should be able to separate local UI state, shared client state, and remote server state.
### The decision rule
A global store is justified when multiple distant parts of the UI need the same client-owned state. It should expose focused actions and selectors, while request caching belongs to a server-state solution.
### Design question
Ask which component owns the meaning of a state change before moving the state into a store.`),
  },
  'rtl-basics': {
    markdown: append(`## Test behavior at the user boundary
### Learning objective
You should be able to choose queries and assertions that describe what a user can see, hear, or operate.
### The decision rule
Prefer accessible roles, names, labels, and visible text over implementation classes or private state. A test should fail when behavior regresses, not when internal markup is refactored.
### Transfer prompt
If a button is hard to query by its role and name, that may reveal an accessibility problem rather than a testing problem.`),
  },
  'ts-props-hooks': {
    markdown: append(`## Treat types as boundary documentation
### Learning objective
You should be able to model required props, optional props, callbacks, and hook return values so incorrect usage is caught near the caller.
### The decision rule
Make the public contract precise first. Use optional properties only when omission has a meaningful default, and type callbacks according to the data the component actually emits.
### Common mistake
Do not use a broad any type to silence a boundary error; it removes the information that makes the component safer to reuse.`),
  },
  'use-effect-deps': {
    markdown: append(`## Let dependencies describe synchronization inputs
### Learning objective
You should be able to explain why an Effect re-runs and how to fix a dependency loop without suppressing the rule.
### The decision rule
An Effect should synchronize an external system with the values it reads. Every value that changes the synchronization belongs in the dependency model, while derived calculations should usually remain in render.
### Debugging question
When an Effect loops, ask whether it is setting state that could be derived directly or whether a changing object/function identity needs to be stabilized or removed from the design.`),
  },
  'js-array-methods': {
    markdown: append(`## Choose array methods by intent
### Learning objective
You should be able to predict the shape of the result returned by map, filter, find, and reduce.
### The decision rule
Map preserves the number of items while transforming them. Filter may remove items. Find returns one item or undefined. Reduce accumulates one result. Naming the desired result before choosing the method prevents accidental nested arrays or discarded values.
### Transfer prompt
Describe the result shape before writing the callback; then choose the method whose contract already matches that shape.`),
  },
};
