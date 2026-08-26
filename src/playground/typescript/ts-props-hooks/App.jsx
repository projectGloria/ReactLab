import { useState } from 'react';

// 👉 1. Define a UserProps type here

// 👉 2. Apply the type to the function parameter
function UserCard({ name, age, email }) {
  // 👉 3. Add boolean generic to useState
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{ border: '1px solid #ccc', padding: 16, borderRadius: 8 }}>
      <h3>{name}</h3>
      <p>Age: {age}</p>
      <button onClick={() => setIsExpanded(e => !e)}>
        {isExpanded ? 'Hide' : 'Show'} Details
      </button>
      {isExpanded && email && <p>Email: {email}</p>}
    </div>
  );
}

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <UserCard name="Alice" age={30} email="alice@example.com" />
      <UserCard name="Bob" age={25} />
    </div>
  );
}