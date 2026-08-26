import { Suspense } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useSuspenseQuery } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ padding: 20 }}>
        <h1>User Directory</h1>
        {/* 👉 2. Wrap <UserList /> in a <Suspense> boundary */}
        {/* 👉 3. Provide a fallback UI to the boundary */}
        <UserList />
      </div>
    </QueryClientProvider>
  );
}

function UserList() {
  // 👉 1. Change useQuery to useSuspenseQuery
  const { data } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('https://jsonplaceholder.typicode.com/users').then(res => res.json())
  });

  return (
    <ul>
      {data?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}