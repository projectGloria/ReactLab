import { useState, useTransition } from 'react';

// A massive, slow-to-render list of 10,000 items
const items = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);

export default function App() {
  // Two pieces of state from one keystroke, and they are NOT equally urgent.
  const [text, setText] = useState('');      // what the input shows — must be instant
  const [filter, setFilter] = useState('');  // what the list uses — can lag behind

  // 👉 1. Call useTransition here

  const handleChange = (e) => {
    setText(e.target.value);
    // 👉 2. Mark ONLY the list update as non-urgent, by wrapping it in startTransition
    setFilter(e.target.value);
  };

  const filteredItems = items.filter(item => item.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div style={{ padding: 20 }}>
      <input type="text" value={text} onChange={handleChange} placeholder="Filter items..." />
      
      {/* 👉 3. Render " Updating..." here if isPending is true */}
      
      <ul>
        {filteredItems.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
