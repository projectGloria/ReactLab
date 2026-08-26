import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 20 }}>
        <nav style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 10 }}>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
        
        {/* 👉 Add your routing components here! */}
        <p>Your routes go here</p>
      </div>
    </BrowserRouter>
  );
}
