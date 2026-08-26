import { useState, useActionState } from 'react';

// A fake server action
async function submitAction(prevState, formData) {
  await new Promise(r => setTimeout(r, 1000));
  return { message: "Saved " + formData.get("email") };
}

export default function Newsletter() {
  // ❌ Manually tracking pending state is tedious!
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.target);
    const result = await submitAction(null, formData);
    setMessage(result.message);
    setIsPending(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" placeholder="Email" required />
      <button disabled={isPending}>
        {isPending ? "Subscribing..." : "Subscribe"}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
