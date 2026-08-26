import confetti from 'canvas-confetti';

// Small burst for a single lesson/challenge completion.
export function celebrateLesson() {
  confetti({
    particleCount: 90,
    spread: 70,
    startVelocity: 35,
    origin: { y: 0.65 },
    colors: ['#f97316', '#22c55e', '#3b82f6', '#eab308'],
    zIndex: 4000,
  });
}

// Bigger, two-sided burst for finishing an entire module.
export function celebrateModule() {
  const end = Date.now() + 600;
  const colors = ['#f97316', '#22c55e', '#3b82f6', '#eab308'];

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 60,
      startVelocity: 45,
      origin: { x: 0, y: 0.7 },
      colors,
      zIndex: 4000,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 60,
      startVelocity: 45,
      origin: { x: 1, y: 0.7 },
      colors,
      zIndex: 4000,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
