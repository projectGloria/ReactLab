import { useState } from 'react';
import { createPortal } from 'react-dom';

function Modal({ children, onClose }) {
  const modalUI = (
    <div style={{
      position: 'absolute', top: '50px', left: '50px',
      background: 'white', color: 'black', padding: '20px',
      boxShadow: '0 0 10px rgba(0,0,0,0.5)'
    }}>
      {children}
      <br/><button onClick={onClose}>Close</button>
    </div>
  );

  // 👉 Return modalUI wrapped in createPortal, targeting document.body
  return modalUI;
}

export default function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ height: '150px', overflow: 'hidden', border: '2px solid gray' }}>
      <h1>My App</h1>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      
      {isOpen && (
        <Modal onClose={() => setIsOpen(false)}>
          <h2>I am a Modal!</h2>
          <p>If I am not in a portal, I am trapped by overflow: hidden!</p>
        </Modal>
      )}
    </div>
  );
}
