import { useState } from 'react';

const numbers = Array.from({ length: 100000 }, (_, i) => i + 1);

function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

export default function App() {
  const [theme, setTheme] = useState('light');
  const [limit, setLimit] = useState(10000);

  // ❌ This runs on every render, even when only 'theme' changes
  const primeCount = numbers.slice(0, limit).filter(isPrime).length;

  return (
    <div style={{ padding: 20, background: theme === 'dark' ? '#222' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}>
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        Toggle Theme (should be instant)
      </button>
      <input
        type="range" min={1000} max={100000} step={1000}
        value={limit} onChange={e => setLimit(Number(e.target.value))}
      />
      <p>Primes up to {limit}: {primeCount}</p>
    </div>
  );
}