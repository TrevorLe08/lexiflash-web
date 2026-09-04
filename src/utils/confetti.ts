import confetti from "canvas-confetti";

export function triggerConfetti(): void {
  // Fire celebratory fireworks / confetti burst
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#4257B2", "#23B26D", "#FFB703", "#FB8500", "#9B5DE5"],
  });

  // Secondary burst
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });
  }, 250);
}
