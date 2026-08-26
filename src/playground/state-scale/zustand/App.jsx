import { create } from 'zustand';

// 1. Create a Zustand store with bears and increasePopulation
const useStore = create((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  // 👉 Add a 'fishes' state and 'addFish' action here
}));

function BearCounter() {
  const bears = useStore((state) => state.bears);
  return <h2>{bears} bears</h2>;
}

function FishCounter() {
  // 👉 2. Select ONLY the fishes state here!
  // const fishes = ???
  return <h2>0 fishes</h2>;
}

function Controls() {
  const increasePopulation = useStore((state) => state.increasePopulation);
  // 👉 3. Get the addFish action and attach it to the button!
  
  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <button onClick={increasePopulation}>Add Bear</button>
      <button>Add Fish</button>
    </div>
  );
}

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Zustand Zoo</h1>
      <BearCounter />
      <FishCounter />
      <Controls />
    </div>
  );
}