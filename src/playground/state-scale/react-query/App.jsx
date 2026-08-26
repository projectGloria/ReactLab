import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserList />
    </QueryClientProvider>
  );
}

function UserList() {
  // 👉 1. Call useQuery hook here instead of these hardcoded variables.
  // 👉 2. Set queryKey to ['users']
  // 👉 3. Set queryFn to fetch the JSONPlaceholder URL and return the parsed JSON.
  
  const isLoading = true; // Replace me!
  const error = null;     // Replace me!
  const data = [];        // Replace me!

  if (isLoading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (error) return <div style={{ padding: 20 }}>Error fetching data</div>;

  return (
    <ul style={{ padding: 20 }}>
      {data.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}