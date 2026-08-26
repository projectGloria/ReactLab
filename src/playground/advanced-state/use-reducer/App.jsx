import { useReducer } from 'react';

function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    default:
      return state;
  }
}

export default function Counter() {
  // TODO: Use useReducer here

  return (
    <div style={{ padding: 20 }}>
      <h2>Count: 0</h2>
      <button>+</button>
      <button>-</button>
    </div>
  );
}