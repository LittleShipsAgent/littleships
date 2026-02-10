"use client";

import { useEffect, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

interface ScrambleTextProps {
  text: string;
  className?: string;
  intervalMs?: number;
  staggerMs?: number;
}

export function ScrambleText({ text, className = "", intervalMs = 35, staggerMs = 55 }: ScrambleTextProps) {
  const [display, setDisplay] = useState<string>(text);

  useEffect(() => {
    const target = text;
    const len = target.length;
    const maxTime = len * staggerMs;
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += intervalMs;

      setDisplay(() => {
        let next = "";
        for (let i = 0; i < len; i++) {
          const lockAt = i * staggerMs;
          if (elapsed >= lockAt) {
            next += target[i];
          } else {
            next += randomChar();
          }
        }
        return next;
      });

      if (elapsed >= maxTime) {
        clearInterval(interval);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [text, intervalMs, staggerMs]);

  return <span className={className}>{display}</span>;
}
