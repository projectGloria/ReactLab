import { useState } from 'react';

const initialTodos = [
  { id: 't1', text: 'Learn React' },
  { id: 't2', text: 'Learn Vite' },
  { id: 't3', text: 'Build an app' }
];

export default function TodoList() {
  const [todos, setTodos] = useState(initialTodos);

  const deleteTodo = (idToDelete) => {
    setTodos(todos.filter(t => t.id !== idToDelete));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Todo List</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map((item, index) => (
          // 👉 Change this key prop!
          <li key={index} style={{ padding: '8px 0', display: 'flex', gap: 8 }}>
            <input type="checkbox" />
            <span>{item.text}</span>
            <button onClick={() => deleteTodo(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
