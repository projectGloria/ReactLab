const messages = {
  // JS Fundamentals
  'js-variables': {
    title: "Don't let this slide! 🛑",
    message: "Variables are the foundation of everything you'll build. Reassign your priorities, dive into this challenge, and prove your scope is limitless!"
  },
  'js-arrow-functions': {
    title: "Point Yourself in the Right Direction 🏹",
    message: "Don't let your skills lose their 'this' binding. Write the arrow function, drop the boilerplate, and earn your checkmark."
  },
  'js-template-literals': {
    title: "String Things Together! 🧵",
    message: "Concatenation is so 2014. Interpolate some effort into this challenge, wrap it in backticks, and make it dynamic!"
  },
  'js-destructuring': {
    title: "Unpack Your Potential 📦",
    message: "Why carry the whole object when you only need one property? Destructure this problem and grab that checkmark."
  },
  'js-spread-rest': {
    title: "Spread Your Wings 🦅",
    message: "You can't afford to rest on this one. Spread your newfound knowledge into the editor and crush the challenge!"
  },
  'js-array-methods': {
    title: "Map Your Own Destiny 🗺️",
    message: "Don't filter out the hard work. Map over your doubts, reduce your errors, and return a solid solution!"
  },
  'js-ternary': {
    title: "To Be Or Not To Be? 🤔",
    message: "Will you skip this challenge? `true ? 'No way' : 'Never'`. Dive in and write some concise conditions!"
  },
  'js-promises': {
    title: "I Promise It's Worth It 🤞",
    message: "Don't leave your skills in a pending state. Await your moment of clarity, resolve the challenge, and avoid the catch block!"
  },

  // Fundamentals
  'jsx-intro': {
    title: "Tags and Brackets and Babel, Oh My! 🦁",
    message: "HTML inside JS? It's magic, but it takes practice. Don't leave your tags unclosed—get in there and write some JSX!"
  },
  'components': {
    title: "Be Reusable ♻️",
    message: "Are you really going to repeat yourself? Build a solid component, export it with pride, and earn this checkmark!"
  },
  'props': {
    title: "Pass the Parcel 🎁",
    message: "A component without props is like a function without arguments. Pass down some data and prove you understand the flow!"
  },
  'state': {
    title: "State of Emergency! 🚨",
    message: "React is nothing without State. If you skip this, your knowledge will remain static forever. Trigger a re-render in your brain and tackle the challenge!"
  },
  'events': {
    title: "Handle It! 🥊",
    message: "Users will click, type, and drag. Are you going to ignore them? Attach that event listener and take control!"
  },
  'conditional': {
    title: "Choose Your Path 🛤️",
    message: "If you try, you render success. If you skip, you render nothing. Write the condition and prove you belong here!"
  },
  'lists-and-keys': {
    title: "Unlock the Keys 🔑",
    message: "React needs keys, and you need practice. Don't let your arrays go unmapped—give every item its unique identity!"
  },

  // Forms
  'controlled-inputs': {
    title: "Take Control 🎮",
    message: "Don't let the DOM dictate your data. Bind that input to your state and become the single source of truth!"
  },
  'form-controls': {
    title: "Check All The Boxes ✅",
    message: "Dropdowns, checkboxes, and radios need precision. Bind checked and value properly and handle every form control with ease!"
  },
  'form-validation': {
    title: "Check Yourself 🛂",
    message: "Invalid data is the enemy. Write those validation rules, stop the bad submissions, and keep the state pure!"
  },
  'per-field-validation': {
    title: "Touch and Go 🎯",
    message: "Nobody likes screaming error messages on pristine forms. Track touched state onBlur and deliver world-class UX!"
  },

  // Side Effects
  'use-effect': {
    title: "Side Effects Expected 🧪",
    message: "It's time to synchronize with reality. Skipping this challenge will cause infinite loops in your career. Write the dependency array and conquer this!"
  },
  'use-effect-deps': {
    title: "Depend On Yourself 🪢",
    message: "Forget a dependency, and you'll be looking at stale data forever. Analyze your variables, fill that array, and earn the checkmark!"
  },
  'use-layout-effect': {
    title: "Paint It Black 🎨",
    message: "Flickering UIs are unacceptable! Block the browser paint, measure the DOM, and make it smooth. Get to it!"
  },
  'data-fetching': {
    title: "Fetch or Die 🐶",
    message: "The data is out there waiting for you. Make the network request, handle the loading state, and bring it home!"
  },
  'diagnostic-stale-closure': {
    title: "Stale Mate ♟️",
    message: "You're trapped in the past with a stale closure. The only way back to the present is to fix the dependencies. Do it!"
  },
  'diagnostic-missing-cleanup': {
    title: "Clean Your Room! 🧹",
    message: "Memory leaks are a developer's worst nightmare. Write that cleanup function before you crash the browser!"
  },

  // Advanced State
  'use-ref': {
    title: "Keep Your References 📚",
    message: "Need to remember something without re-rendering? Don't skip this—grab that DOM node and prove your mastery of refs!"
  },
  'use-reducer': {
    title: "Reduce to Ashes 🔥",
    message: "When state gets complex, useState won't save you. Dispatch an action, write the switch statement, and tame the chaos!"
  },
  'use-memo': {
    title: "Memoize This 🧠",
    message: "Why calculate it twice? Use your brain's cache, wrap that expensive function, and optimize your app's performance!"
  },
  'use-id': {
    title: "Identity Crisis 🆔",
    message: "Don't hardcode those IDs. Let React handle the uniqueness. Link your labels and inputs the right way!"
  },

  // Sharing State
  'use-context': {
    title: "Read the Context 📖",
    message: "Prop drilling is exhausting. Lift that state into a Context Provider and consume it like a pro. Don't skip the foundation of global state!"
  },

  // Custom Hooks
  'use-local-storage': {
    title: "Hooked on React 🪝",
    message: "Why rely on built-in hooks when you can make your own? Extract that logic, abstract the complexity, and build your own custom hook!"
  },
  'use-debounce': {
    title: "Hold Your Horses! ⏱️",
    message: "Typing too fast? Rate-limit your logic. Build the debounce hook and prove you can control time itself!"
  },

  // Intermediate
  'composition': {
    title: "Think of the Children! 👶",
    message: "Don't hardcode everything inside the component. Use the `children` prop, compose your UI, and unlock true reusability!"
  },
  'render-props': {
    title: "Function as a Child? 🤯",
    message: "It's a weird pattern, but a powerful one. Pass a function, return some JSX, and master the render prop pattern!"
  },
  'error-boundaries': {
    title: "Brace for Impact 💥",
    message: "Errors happen. Are you going to let the whole app crash? Build the boundary, catch the error, and fail gracefully!"
  },
  'portals': {
    title: "Think Outside the Root 🌀",
    message: "Trapped by overflow hidden? Teleport your DOM nodes with Portals. Step through to the other side and finish the challenge!"
  },
  'compound-components': {
    title: "Better Together 🤝",
    message: "Tabs without TabPanels are just buttons. Use context, connect the pieces, and build an elegant compound component!"
  },
  'forward-ref': {
    title: "Pass It Forward 🏈",
    message: "Custom components need refs too. Don't drop the ball—wrap it in forwardRef and pass it down to the DOM!"
  },

  // Performance
  'reconciliation': {
    title: "The Diffing Algorithm 🤖",
    message: "Understand how React thinks. Write the code, learn the rules, and stop fighting against the virtual DOM!"
  },
  'reconciliation-rules': {
    title: "Key to Success 🗝️",
    message: "Don't use array indexes for keys! Prove you know how to safely mount and unmount components by completing this task."
  },
  'react-memo': {
    title: "Stop Overreacting ✋",
    message: "Not every prop change requires a re-render. Memoize your component, prevent wasted cycles, and make it snappy!"
  },
  'code-splitting': {
    title: "Divide and Conquer ✂️",
    message: "Why load the whole app at once? Use lazy loading, set up your Suspense fallback, and shave seconds off your load time!"
  },
  'diagnostic-object-identity': {
    title: "Mistaken Identity 🕵️‍♂️",
    message: "{} !== {}. Object references are tricky. Fix the stability issue, stop the unnecessary renders, and earn that checkmark!"
  },

  // Routing
  'react-router': {
    title: "Take the Scenic Route 🛣️",
    message: "A single page app is boring without URLs. Set up your browser router and navigate your way to success!"
  },
  'nested-routes': {
    title: "Inception 🪆",
    message: "Routes inside routes inside routes. Drop the `<Outlet />`, build your layouts, and master nested routing!"
  },
  'use-navigate': {
    title: "Take the Wheel 🏎️",
    message: "Don't rely on users clicking links. Take programmatic control of the URL and navigate them exactly where they need to go!"
  },

  // State Scale
  'zustand': {
    title: "Bear With Me 🐻",
    message: "Context is great, but Zustand is a powerhouse. Build the global store, hook it up, and manage state like a boss."
  },
  'react-query': {
    title: "Cache Me Outside 💸",
    message: "Stop putting server state in useState! Let React Query handle the caching, loading, and retries. Give it a shot!"
  },

  // Advanced
  'suspense': {
    title: "The Suspense is Killing Me! 🫣",
    message: "Don't leave your users staring at a blank screen. Wrap your data fetching in Suspense and show a beautiful fallback!"
  },
  'transitions': {
    title: "Smooth Operator 🧊",
    message: "Heavy updates shouldn't freeze the UI. Wrap it in a transition, keep the input responsive, and prove you know concurrent React!"
  },
  'server-components': {
    title: "To the Server! 🚀",
    message: "The future is here. Send less JavaScript to the client. Prove you know the difference between server and client components!"
  },
  'actions-api': {
    title: "Action Stations 🎬",
    message: "Forms just got a massive upgrade in React 19. Don't rely on old `onSubmit` patterns. Use actions and manage that pending state!"
  },
  'use-optimistic': {
    title: "Glass Half Full 🥛",
    message: "Assume success! Update the UI immediately, worry about the server later. Build the optimistic update and delight your users!"
  },

  // TypeScript
  'ts-props-hooks': {
    title: "Type It Out ⌨️",
    message: "Any type is not an option here. Define your interfaces, type your props, and let the compiler catch your mistakes!"
  },
  'ts-context-reducers': {
    title: "Discriminate Your Unions 🛡️",
    message: "A reducer without types is a ticking time bomb. Use a discriminated union, narrow your types, and make it bulletproof!"
  },
  'typescript-patterns': {
    title: "Generic Greatness <T> 🧬",
    message: "Don't copy-paste components just to change the type. Use generics, build reusable structures, and prove you're a TypeScript master!"
  },
  'polymorphic-components': {
    title: "Shape Shifter 🦎",
    message: "Buttons that can be links without losing type safety! Master the ElementType pattern and elevate your UI toolkit!"
  },
  'ts-diagnostics': {
    title: "Error Whisperer 🩺",
    message: "Never fear a wall of red TypeScript squiggly lines again. Decode generic type errors like a seasoned senior engineer!"
  },

  // Testing
  'rtl-basics': {
    title: "Test Your Might 🥋",
    message: "If it's not tested, it's broken. Query the DOM, simulate user events, and assert your component works as expected!"
  },
  'testing-async': {
    title: "Wait For It... ⏳",
    message: "Async testing is tricky. Use `findBy`, wait for the element to appear, and prove your components can handle asynchronous reality!"
  },
  'testing-custom-hooks': {
    title: "Hook, Line, and Sinker 🎣",
    message: "Test hook state updates in pure isolation with renderHook and act. Your reusable logic is now battle-tested!"
  },
  'mocking-modules': {
    title: "Master of Disguise 🥸",
    message: "Don't let third-party SDKs sabotage your tests. Mock entire modules with vi.mock and keep your test suite lightning fast!"
  },
  'msw-api-mocking': {
    title: "Service Worker Sorcery 🧙‍♂️",
    message: "Intercept network traffic seamlessly at the HTTP boundary. Your API tests are now clean, resilient, and bulletproof!"
  }
};

export default messages;
