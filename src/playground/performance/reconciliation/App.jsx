import { useState } from 'react';

function Child() {
  console.log("Child rendered!");
  return <div style={{ padding: 20, border: '2px solid blue' }}>I am a child component</div>;
}

export default function App() {
  const [text, setText] = useState("");
  console.log("App rendered!");

  return (
    <div style={{ padding: 20, border: '2px solid red' }}>
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
