import { useState } from 'react';

export default function SignupForm() {
  // 👉 2. Create name and email state variables here!

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you'd send the state to an API here
    alert("Submitted!");
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300 }}>
      <h3>Sign Up</h3>
      
      {/* 👉 3. Bind value and onChange for name */}
      <input 
        type="text" 
        placeholder="Name" 
      />
      
      {/* 👉 4. Bind value and onChange for email */}
      <input 
        type="email" 
        placeholder="Email" 
      />
      
      <button type="submit">Submit</button>
    </form>
  );
}