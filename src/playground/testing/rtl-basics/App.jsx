import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      {/* ❌ Bug: onClick passes the event object to setCount */}
      <button onClick={setCount}>Increment</button>
    </div>
  );
}
