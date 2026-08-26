import { useState, useEffect } from 'react';

// A massive, slow-to-render list of 10,000 items
const items = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);

// 👉 1-4. Create useDebounce(value, delay) here!

export default function App() {
  const [filter, setFilter] = useState('');
  
  // 👉 5. Call useDebounce(filter, 500) and use its return value to filter the items
  
  // Notice how laggy typing feels because it filters 10,000 items on EVERY keystroke!
  const filteredItems = items.filter(item => item.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div style={{ padding: 20 }}>
      <input 
        type="text" 
        value={filter}
        onChange={e => setFilter(e.target.value)} 
        placeholder="Search..." 
      />
      <ul>
        {filteredItems.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}