function UserProfile() {
  return (
    <div className="profile">
      <h3>Jane Doe</h3>
      <p>Software Engineer</p>
    </div>
  );
}

export default function App() {
  return (
    <div className="app-container">
      <h1>Our Team</h1>
      <UserProfile />
      <UserProfile />
    </div>
  );
}
