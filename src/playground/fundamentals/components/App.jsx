export default function App() {
  return (
    <div className="app-container">
      <h1>Our Team</h1>
      
      <div className="profile">
        <img src="https://picsum.photos/id/10/50/50" style={{ borderRadius: '50%' }} />
        <h3>Jane Doe</h3>
        <p>Software Engineer</p>
      </div>

      <div className="profile">
        <img src="https://picsum.photos/id/20/50/50" style={{ borderRadius: '50%' }} />
        <h3>John Smith</h3>
        <p>Product Manager</p>
      </div>
    </div>
  );
}
