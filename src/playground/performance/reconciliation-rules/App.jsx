import { useState } from 'react';

function CounterA() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>A: {count}</button>;
}

function CounterB() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>B: {count}</button>;
}

function ProfileForm({ user }) {
  const [name, setName] = useState('');
  return (
    <div style={{ marginTop: 20, padding: 16, border: '1px solid #ccc' }}>
      <p>Editing: <strong>{user}</strong></p>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" />
    </div>
  );
}

export default function App() {
  const [showA, setShowA] = useState(true);
  const [selectedUser, setSelectedUser] = useState('alice');
  return (
    <div style={{ padding: 20 }}>
      <h2>Type-Switch Demo</h2>
      <button onClick={() => setShowA(s => !s)}>Toggle Counter</button>
      {showA ? <CounterA /> : <CounterB />}
      <h2 style={{ marginTop: 20 }}>Key Remount Demo</h2>
      <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
        <option value="alice">Alice</option>
        <option value="bob">Bob</option>
      </select>
      {/* 👉 Add key={selectedUser} to ProfileForm */}
      <ProfileForm user={selectedUser} />
    </div>
  );
}