// 👉 1. Import { ErrorBoundary } from 'react-error-boundary'

function BuggyComponent() {
  throw new Error("I crashed!");
  return <div>I will never render</div>;
}

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>My App</h1>
      {/* 👉 2. Wrap BuggyComponent in ErrorBoundary with a fallback prop */}
      <BuggyComponent />
    </div>
  );
}
