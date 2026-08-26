import { useRef } from 'react';

// 👉 CustomInput currently ignores the ref prop from the parent!
// In React 19, ref is a plain prop. Add it to the destructured params
// and pass it to the inner <input> element.
function CustomInput({ label, ...props }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <label style={{ display: 'block', fontWeight: 'bold' }}>{label}</label>
      <input 
        style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
        {...props} 
      />
    </div>
  );
}

export default function App() {
  const inputRef = useRef(null);

  const focusInput = () => {
    // This will do nothing (or crash) right now because inputRef.current is null!
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc' }}>
      <h2>Sign Up</h2>
      <CustomInput ref={inputRef} label="Email Address" placeholder="Enter your email" />
      <button onClick={focusInput}>Focus Email Input</button>
    </div>
  );
}
