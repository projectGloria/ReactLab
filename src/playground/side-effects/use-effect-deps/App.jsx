import { useState, useEffect } from 'react';

export default function App() {
  const [id, setId] = useState(1);
  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => setId(id + 1)}>Next Profile</button>
      <Profile userId={id} />
    </div>
  );
}

function Profile({ userId }) {
  const [data, setData] = useState("Loading...");

  // ❌ Missing dependency array!
  useEffect(() => {
    setData("Loading...");
    setTimeout(() => {
      setData("Data for user " + userId);
    }, 500);
  }); 

  return <h3>{data}</h3>;
}
