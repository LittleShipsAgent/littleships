"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("littleships-theme") as Theme | null;
    if (stored) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("littleships-theme", theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [synced, setSynced] = useState(false);

  // After mount: read saved theme so first click is in sync with stored preference
  useEffect(() => {
    const stored = localStorage.getItem("littleships-theme") as Theme | null;
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
    }
    setSynced(true);
  }, []);

  // Keep document and storage in sync whenever theme changes
  useEffect(() => {
    if (!synced) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("littleships-theme", theme);
  }, [theme, synced]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--card)] border border-[var(--border)] hover:border-[var(--border-hover)] transition text-[var(--fg-muted)] hover:text-[var(--fg)]"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="w-4 h-4" aria-hidden /> : <Moon className="w-4 h-4" aria-hidden />}
    </button>
  );
}
