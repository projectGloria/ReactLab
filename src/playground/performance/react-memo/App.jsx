import { useState, memo, useCallback } from 'react';

// 👉 1. Wrap ExpensiveChild using the memoization API
function ExpensiveChild({ onDelete }) {
  console.log("ExpensiveChild rendered! 👉");
  return (
    <div style={{ padding: 20, border: '2px solid orange', marginTop: 10 }}>
      <p>I am a very slow component!</p>
      <button onClick={onDelete}>Delete Me</button>
    </div>
  );
}

export default function App() {
  const [text, setText] = useState("");
  const [items, setItems] = useState([1, 2, 3]);

  // 👉 2. Wrap this function using the appropriate hook so its reference stays stable
  const handleDelete = () => {
    setItems([]);
  };

  return (
    <div style={{ padding: 20, border: '2px solid blue' }}>
      <input 
        value={text} 
        onChange={e => setText(e.target.value)} 
        placeholder="Type here..." 
      />
      <ExpensiveChild onDelete={handleDelete} />
    </div>
  );
}
