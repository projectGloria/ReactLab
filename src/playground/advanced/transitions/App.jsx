import { useState, useTransition } from 'react';

// A massive, slow-to-render list of 10,000 items
const items = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);

export default function App() {
  const [filter, setFilter] = useState('');
  
  // 👉 1. Call useTransition here

  const handleChange = (e) => {
    // 👉 2. Wrap this urgent state update in startTransition!
    setFilter(e.target.value);
  };

  const filteredItems = items.filter(item => item.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div style={{ padding: 20 }}>
      <input type="text" onChange={handleChange} placeholder="Filter items..." />
      
      {/* 👉 3. Render " Updating..." here if isPending is true */}
      
      <ul>
        {filteredItems.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}