"use client";

import Link from "next/link";
import { useContext, createContext, useState, useEffect } from "react";

// Safe theme hook that works even without provider
function useSafeTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("shipyard-theme") as "dark" | "light" | null;
    if (stored) {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("shipyard-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return { theme, toggleTheme, mounted };
}

export function Header() {
  const { theme, toggleTheme, mounted } = useSafeTheme();

  return (
    <header className="border-b border-[var(--border)] sticky top-0 bg-[var(--bg)]/90 backdrop-blur-md z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <span className="text-2xl">⚓</span>
          <span className="text-xl font-bold tracking-tight">Shipyard</span>
        </Link>
        <nav className="flex items-center gap-4 md:gap-6">
          <Link
            href="/"
            className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition"
          >
            Ships
          </Link>
          <Link
            href="/agents"
            className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition"
          >
            Agents
          </Link>
          <Link
            href="/api-docs"
            className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition hidden md:block"
          >
            API
          </Link>
          
          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--card)] hover:bg-[var(--card-hover)] border border-[var(--border)] transition"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          )}

          <button className="bg-[var(--fg)] text-[var(--bg)] px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition">
            Ship Your Work
          </button>
        </nav>
      </div>
    </header>
  );
}
