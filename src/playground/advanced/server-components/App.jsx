// 👉 2. Add the 'use client'; directive to the very top of this file!

import { useState } from 'react';

export default function Counter() {
  // 👉 1. This component uses client interactivity (useState and onClick)!
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: 20 }}>
      <h1>Interactive Counter</h1>
      <p>Current count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}