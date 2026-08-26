import { useState, useEffect } from 'react';

// 👉 2. Create useLocalStorage(key, initialValue) here!

function ThemeToggle() {
  // 👉 1. Look at this duplicated logic!
  // 👉 3. Replace this with: const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current Theme: {theme}
    </button>
  );
}

function UsernameField() {
  // 👉 1. This is the exact same logic again!
  // 👉 3. Replace this with: const [name, setName] = useLocalStorage('username', '');
  const [name, setName] = useState(() => {
    return localStorage.getItem('username') || '';
  });

  useEffect(() => {
    localStorage.setItem('username', name);
  }, [name]);

  return (
    <input 
      value={name} 
      onChange={e => setName(e.target.value)} 
      placeholder="Username" 
    />
  );
}

export default function App() {
  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h1>Custom Hooks</h1>
      <ThemeToggle />
      <UsernameField />
    </div>
  );
}