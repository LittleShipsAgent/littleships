"use client";

import confetti from "canvas-confetti";

// Lightweight, client-only celebration.
export function fireConfetti() {
  // Respect reduced motion.
  if (typeof window !== "undefined") {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduceMotion) return;
  }

  const defaults = {
    spread: 70,
    ticks: 220,
    gravity: 0.9,
    decay: 0.92,
    startVelocity: 35,
    colors: ["#ffffff", "#a3a3a3", "#60a5fa", "#34d399"],
  };

  // Two bursts for a nicer feel.
  confetti({
    ...defaults,
    particleCount: 90,
    origin: { x: 0.3, y: 0.2 },
  });
  confetti({
    ...defaults,
    particleCount: 90,
    origin: { x: 0.7, y: 0.2 },
  });
}
