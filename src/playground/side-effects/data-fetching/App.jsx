import { useState, useEffect } from 'react';

export default function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 👉 1. Use the effect hook to fetch data when the component mounts
  // 👉 2. Fetch from 'https://jsonplaceholder.typicode.com/users'
  // 👉 3. Update the state with data and loading status
  
  if (loading) return <div style={{ padding: 20 }}>Loading users...</div>;

  return (
    <ul style={{ padding: 20 }}>
      {users.map(u => (
        <li key={u.id} style={{ padding: '4px 0' }}>{u.name}</li>
      ))}
    </ul>
  );
}
