import { useState, createContext, useContext } from 'react';

const ThemeContext = createContext('light');

function Navbar() {
  // ❌ Hardcoded theme!
  const theme = 'light';

  return (
    <div style={{ 
      padding: 20, 
      background: theme === 'dark' ? '#333' : '#eee',
      color: theme === 'dark' ? '#fff' : '#000'
    }}>
      My App Navbar
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext value={theme}>
      <Navbar />
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </ThemeContext>
  );
}
