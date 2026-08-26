import { useState } from 'react';

export default function Timer() {
  const [seconds, setSeconds] = useState(0);

  // ❌ This is a bug! It creates a new interval on every render!
  const intervalId = setInterval(() => {
    setSeconds(s => s + 1);
  }, 1000);

  return (
    <div style={{ padding: 20 }}>
      <h2>Time: {seconds}s</h2>
    </div>
  );
}
