import { EXTENDED_LESSON_ENHANCEMENTS } from './lessonEnhancementsExtended.js';

const append = (markdown) => `\n\n${markdown.trim()}\n`;

const BASE_LESSON_ENHANCEMENTS = {
  'jsx-intro': {
    markdown: append(`## Build a correct JSX mental model

### Learning objective
By the end of this lesson, you should be able to write JSX that follows JavaScript expression rules, explain why JSX becomes element-creation calls, and diagnose the most common syntax mistakes without memorizing a list of arbitrary rules.

### The decision rule
Inside JSX, use JavaScript expressions inside braces. Use a JavaScript statement outside the returned markup when the work needs multiple steps, a declaration, or control flow. JSX is a description of the UI tree; it is not a second programming language.

### Why the rules exist
React needs a predictable tree of elements and values. 'className' maps to the DOM property React manages, self-closing tags make the tree unambiguous, and one parent wrapper gives the return value one root. These rules are consequences of the element tree—not style preferences.

### Common mistake
Do not put statements such as 'if' directly inside braces. Compute the value before the return, use a conditional expression for a small choice, or extract a component when the branch becomes difficult to read.

### Check yourself
Explain how '<Greeting name={user.name} />' differs from '<Greeting name="user.name" />'. A good answer distinguishes a JavaScript expression from a literal string.`),
  },
  components: {
    markdown: append(`## Design components around responsibilities

### Learning objective
Given a UI, you should be able to choose component boundaries that make ownership, data flow, and reuse easier to reason about.

### A practical decomposition routine
First describe the visible regions of the UI. Then identify repeated structures. Next decide which region owns each piece of state. Finally define the smallest prop contract that lets a child render or request an action without knowing the parent’s implementation.

### What makes a boundary useful
A component boundary is useful when the part has a clear responsibility, a stable input/output contract, or a reason to change independently. Splitting a component only because it is long can create indirection without improving understanding.

### Composition over configuration overload
Prefer children and small render props when a reusable shell should accept custom content. If a component has many boolean props that describe unrelated variants, its responsibility may be too broad.

### Common mistake
Do not move state into a child merely because the child displays it. Keep state in the closest common owner of every consumer, then pass values down and callbacks up.`),
  },
  props: {
    markdown: append(`## Props are a one-way data-flow contract

### Learning objective
You should be able to identify the owner of a value, pass data downward, and design a callback that lets a child request a change without mutating the prop.

### The communication pattern
The parent owns the value. The child receives the current value as a prop. If the child needs a change, the parent passes a callback. The child calls the callback with the smallest useful argument, and the parent updates state before rendering the new value downward.

### When prop drilling is a signal
A few levels of props are normal and often clearer than global state. Consider Context or a different component boundary when unrelated intermediate components must forward the same data only to reach a distant consumer.

### Common mistake
Never treat a prop object as a local copy that the child is allowed to mutate. If a child needs editable local draft state, make that choice explicit and define how the draft is committed back to the owner.

### Design prompt
For a remove button, prefer 'onRemove(itemId)' over passing an entire state setter. The callback communicates the child’s intent while keeping state-transition policy in the owner.`),
  },
  state: {
    markdown: append(`## State is a render snapshot, not a mutable variable

### Learning objective
You should be able to predict what a render sees, choose between a direct update and a functional updater, and update object or array state without losing unrelated data.

### The render timeline
A render calls the component function and produces a snapshot of values. An event handler closes over that snapshot. Calling a setter requests another render; it does not rewrite the constants from the current render. This is why logging immediately after a setter often shows the previous value.

### Choosing the updater form
Use 'setCount(nextValue)' when the next value does not depend on the previous value. Use 'setCount(previous => previous + 1)' when multiple updates may be queued or when the calculation depends on prior state.

### Object and array state
State replacement is shallow at the state-variable level: React does not merge object fields for you. Create a new object or array, preserve what should remain, and change only the intended field or item.

### Common mistake
Do not store a value that can be calculated from current props or state unless you have a strong reason. Redundant state creates synchronization work and can produce temporary inconsistent renders.`),
  },
  'use-effect': {
    markdown: append(`## Effects synchronize with external systems

### Learning objective
You should be able to classify logic as render-time calculation, event handling, or external synchronization, then implement only the kind of logic that belongs in an Effect.

### The three-way classification
If a value can be calculated from current props and state, calculate it during render. If a user action directly caused the work, put it in the event handler. Use an Effect when React must synchronize with something outside React, such as a timer, subscription, DOM API, browser storage, or network connection.

### Why cleanup matters
An Effect may establish a resource that must be stopped. Return cleanup that removes the listener, clears the timer, disconnects the subscription, or aborts the request. Cleanup runs before the Effect re-synchronizes and when the component leaves the tree.

### What not to use an Effect for
Do not use an Effect merely to derive 'fullName', filter an array, or respond to a click. Those operations either belong in render or in the event handler. Extra Effects add render passes and synchronization points that learners must now debug.

### Diagnostic question
Ask: “What external system is this Effect synchronizing with?” If the answer is “none,” first try a normal expression or event handler.`),
  },
  'use-effect-deps': {
    markdown: append(`## Dependency arrays describe synchronization inputs

### Learning objective
You should be able to explain why an Effect re-runs, identify the values it reads from the component, and avoid treating the dependency array as a performance knob.

### The key idea
The dependency array is a declaration of which reactive values the synchronization uses. When one changes, React must re-run cleanup and establish the external relationship again. It is not a list of values you can omit to silence a warning.

### A safe debugging sequence
List every prop, state value, and reactive function read by the Effect. For each one, ask whether the external system should be updated when it changes. If that produces an unwanted loop, fix the design or move derived logic out of the Effect rather than hiding the dependency.

### Common mistake
An empty dependency array does not mean “run once forever.” It means “this synchronization does not depend on reactive values.” If it reads changing values, an empty array can preserve stale data.`),
  },
  'lists-and-keys': {
    markdown: append(`## Keys preserve or intentionally reset identity

### Learning objective
You should be able to choose a stable key, predict when component state is preserved, and use a changed key intentionally when a fresh instance is required.

### What a key means
A key identifies a logical item among siblings across renders. It should come from the item’s stable identity, not from its current position. With the right key, inserting, deleting, or reordering items does not attach one row’s local state to another item.

### When an index key is acceptable
An index key is only safe when the list is static, never reordered, never filtered, and never has stateful children. In interactive application code, stable item IDs are normally the safer default.

### Intentional reset
Keys are not only for arrays. Rendering a form with 'key={profile.id}' tells React that a different profile should receive a fresh form state. The same identity mechanism can preserve state or reset it depending on the key.

### Debugging prompt
If a checkbox appears to move to the wrong row after deletion, inspect identity first. Do not start by blaming the checkbox component.`),
  },
  'use-memo': {
    markdown: append(`## Memoization is an evidence-based optimization

### Learning objective
You should be able to distinguish a correct performance optimization from a premature wrapper and explain what work is actually being skipped.

### Start with measurement
First make the component correct, then identify a measurable slow calculation or an avoidable child re-render. 'useMemo' caches a calculation between renders when its dependencies are unchanged; it does not make arbitrary code faster and it does not replace good state ownership.

### What to ask before using it
What calculation is expensive? How often does it run? Which dependency changes cause the cache to invalidate? Is the comparison and memory cost smaller than recomputing the value? If you cannot answer these questions, keep the simpler code.

### Common mistake
Do not add 'useMemo' to every filtered array or primitive expression. Teach learners to measure, explain the bottleneck, and verify that the optimization changes the relevant render behavior.`),
  },
};

export const LESSON_ENHANCEMENTS = { ...BASE_LESSON_ENHANCEMENTS, ...EXTENDED_LESSON_ENHANCEMENTS };
export default LESSON_ENHANCEMENTS;
