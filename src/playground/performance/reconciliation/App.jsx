import { useState, useEffect, useRef } from 'react';

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

function Child() {
  const ref = useRef(null);
  useRenderFlash(ref);
  console.log("Child rendered!");
  return <div ref={ref} style={{ padding: 20, border: '2px solid blue', borderRadius: 8, margin: 10 }}>I am a child component</div>;
}

export default function App() {
  const [text, setText] = useState("");
  const ref = useRef(null);
  useRenderFlash(ref);
  console.log("App rendered!");

  return (
    <div ref={ref} style={{ padding: 20, border: '2px solid red', borderRadius: 8 }}>
      <h2>Parent Component</h2>
      <input 
        value={text} 
        onChange={e => setText(e.target.value)} 
        placeholder="Type here..." 
      />
      <Child />
    </div>
  );
}
