import { useState, lazy, Suspense } from 'react';

// Mocking a component that takes 2 seconds to download over the network
const HeavyChart = lazy(() => new Promise(resolve => {
  setTimeout(() => resolve({ 
    default: () => <div style={{ padding: 20, background: 'yellow' }}>📊 Huge Chart Loaded!</div> 
  }), 2000);
}));

export default function App() {
  const [showChart, setShowChart] = useState(false);

  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>
      <button onClick={() => setShowChart(true)}>Load Chart</button>
      
      <div style={{ marginTop: 20 }}>
        {showChart && (
          /* 👉 Wrap this HeavyChart in a boundary component for lazy loading! */
          <HeavyChart data={[10, 20, 30]} />
        )}
      </div>
    </div>
  );
}
