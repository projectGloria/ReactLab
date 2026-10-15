import { useState, memo, useCallback, useEffect, useRef } from 'react';

function useRenderFlash(ref) {
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    el.style.transition = 'none';
    el.style.backgroundColor = 'rgba(74, 222, 128, 0.4)';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = 'background-color 0.8s ease';
        el.style.backgroundColor = 'transparent';
      });
    });
  });
}

// 👉 1. Wrap ExpensiveChild using the memoization API
function ExpensiveChild({ onDelete }) {
  const ref = useRef(null);
  useRenderFlash(ref);
  console.log("ExpensiveChild rendered! 🐢");
  return (
    <div ref={ref} style={{ padding: 20, border: '2px solid orange', marginTop: 10 }}>
      <p>I am a very slow component!</p>
      <button onClick={onDelete}>Delete Me</button>
    </div>
  );
}

export default function App() {
  const [text, setText] = useState("");
  const [items, setItems] = useState([1, 2, 3]);
  const ref = useRef(null);
  useRenderFlash(ref);

  // 👉 2. Wrap this function using the appropriate hook so its reference stays stable
  const handleDelete = () => {
    setItems([]);
  };

  return (
    <div ref={ref} style={{ padding: 20, border: '2px solid blue' }}>
      <input 
        value={text} 
        onChange={e => setText(e.target.value)} 
        placeholder="Type here..." 
      />
      <ExpensiveChild onDelete={handleDelete} />
    </div>
  );
}
