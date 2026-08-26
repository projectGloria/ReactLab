export default function App() {
  return (
    <Dialog 
      title="Warning" 
      message="Are you sure you want to delete this?" 
    />
  );
}

function Dialog({ title, message }) {
  return (
    <div style={{ border: '2px solid red', padding: '20px', borderRadius: '8px' }}>
      <h2>{title}</h2>
      <hr />
      {/* 👉 Refactor this to render children instead of message */}
      <p>{message}</p>
    </div>
  );
}
