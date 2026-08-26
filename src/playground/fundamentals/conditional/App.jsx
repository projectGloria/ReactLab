export default function App() {
  return <Dashboard isLoggedIn={false} />;
}

function Dashboard({ isLoggedIn }) {
  return (
    <div style={{ padding: 20 }}>
      {/* TODO: Use conditional rendering here */}
      <h1>Welcome back!</h1>
      <h1>Please log in.</h1>
    </div>
  );
}
