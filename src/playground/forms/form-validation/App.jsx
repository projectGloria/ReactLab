import { useState } from 'react';

export default function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email.includes('@')) {
      setError('Please provide a valid name and email.');
      return;
    }
    setError('');
    alert("Submitted!");
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300 }}>
      <h3>Sign Up</h3>
      
      {/* 👉 2. Conditionally render the error here if one exists! */}
      <span style={{ color: 'red', fontSize: '0.9em' }}>{error}</span>

      <input 
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Name" 
      />
      
      <input 
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email" 
      />
      
      {/* 👉 3. Disable this button if validation fails */}
      <button type="submit">Submit</button>
    </form>
  );
}