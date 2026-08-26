import { useState } from 'react';

// 👉 Make this component accept a "render" function as a prop
function MouseTracker() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  return (
    <div 
      style={{ height: '300px', border: '1px solid #666', padding: '16px' }}
      onMouseMove={(e) => setPosition({ x: e.clientX, y: e.clientY })}
    >
      {/* Call the render prop here and pass the position object */}
      Mouse is moving...
    </div>
  );
}

export default function App() {
  return (
    <MouseTracker 
      // 👉 Pass a render prop that returns <h1>The mouse is at (x, y)</h1>
    />
  );
}
