import { useState } from 'react';

export default function FocusForm() {
  const [text, setText] = useState('');
  
  function handleFocusClick() {
    // ❌ We don't have a way to access the input DOM node yet!
  }

  return (
    <div style={{ padding: 20 }}>
      <input 
        value={text} 
        onChange={e => setText(e.target.value)} 
        placeholder="Type here..."
      />
      <button onClick={handleFocusClick}>Focus the input</button>
    </div>
  );
}
