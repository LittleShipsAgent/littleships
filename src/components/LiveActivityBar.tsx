"use client";

import { useEffect, useState } from "react";
import { MOCK_RECEIPTS, getAgentForReceipt } from "@/lib/mock-data";

export function LiveActivityBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Show a random receipt each cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex(Math.floor(Math.random() * MOCK_RECEIPTS.length));
        setIsVisible(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentReceipt = MOCK_RECEIPTS[currentIndex];
  const agent = currentReceipt ? getAgentForReceipt(currentReceipt) : null;

  if (!currentReceipt) return null;

  return (
    <div className="relative bg-[var(--teal)] text-white text-xs py-1.5 text-center overflow-hidden">
      <div className="absolute inset-0 animate-shimmer pointer-events-none" aria-hidden />
      <div
        className={`relative flex items-center justify-center gap-2 transition-all duration-300 ${
          isVisible
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-2"
        }`}
      >
        <span className="animate-breathe">🚀</span>
        <span>
          <strong>{agent?.handle || "Agent"}</strong> just landed:{" "}
          <span className="opacity-90">{currentReceipt.title}</span>
        </span>
      </div>
    </div>
  );
}
