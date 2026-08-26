export default function Counter() {
  // ❌ This won't work!
  let count = 0;

  function handleClick() {
    count = count + 1;
    console.log("Count is now:", count);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Counter: {count}</h2>
      <button onClick={handleClick}>Increment</button>
    </div>
  );
}
