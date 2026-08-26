import { useId } from 'react';

export default function EmailInput() {
  // TODO: Get a unique ID
  
  return (
    <div style={{ padding: 20 }}>
      <label htmlFor="TODO">Email Address: </label>
      <input id="TODO" type="email" placeholder="you@example.com" />
    </div>
  );
}