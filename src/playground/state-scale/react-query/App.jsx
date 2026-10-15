import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

  // 👉 4. Get the query client with useQueryClient().
  // 👉 5. Create a mutation with useMutation({ mutationFn, onSuccess }).
  //       mutationFn should POST a new user; onSuccess should invalidate ['users'].

  if (isLoading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (error) return <div style={{ padding: 20 }}>Error fetching data</div>;

  return (
    <div style={{ padding: 20 }}>
      <ul>
        {data.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      {/* 👉 6. Call addUser.mutate('New User') here */}
      <button onClick={() => {}}>Add User</button>
    </div>
  );
}
