import { useState } from 'react';

const ALL_ITEMS = Array.from({ length: 5000 }, (_, i) => `Product ${i + 1}`);

function expensiveFilter(items, query) {
  console.log("Running expensive filter...");
  let startTime = performance.now();
  while (performance.now() - startTime < 300) { /* Artificial delay */ }
  return items.filter(item => item.toLowerCase().includes(query.toLowerCase()));
}

export default function App() {
  const [query, setQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // ❌ Runs on EVERY render—even when toggling dark mode!
  const filtered = expensiveFilter(ALL_ITEMS, query);

  return (
    <div style={{ padding: 20, background: darkMode ? "#222" : "#fff", color: darkMode ? "#fff" : "#000" }}>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search products..."
      />
      <button onClick={() => setDarkMode(d => !d)}>Toggle Dark Mode</button>
      <p>{filtered.length} products found</p>
    </div>
  );
}
