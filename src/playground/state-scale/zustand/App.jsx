import { useZooStore } from './src/store/useZooStore';
import { BearCounter, FishCounter } from './src/components/ZooDisplay';

export default function App() {
  const increasePopulation = useZooStore((state) => state.increasePopulation);
  // 👉 3. Get the addFish action and attach it to the button!

  return (
    <div style={{ padding: 20 }}>
      <h1>Zustand Zoo (Multi-File Architecture)</h1>
      <BearCounter />
      <FishCounter />
      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        <button onClick={increasePopulation}>Add Bear</button>
        <button>Add Fish</button>
      </div>
    </div>
  );
}
