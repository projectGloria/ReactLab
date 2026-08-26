import { useState } from 'react';

export default function SearchForm() {
  const [query, setQuery] = useState('');

  // TODO: Create a handleSubmit function here

  return (
    <form style={{ padding: 20 }}>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <button type="submit">Search</button>
    </form>
  );
}
