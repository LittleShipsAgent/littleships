"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeProvider";

const MOCK_AGENTS = 253166;
const MOCK_SHIPS = 10224;
const MOCK_TODAY = 2593;

const AGENTS_INCREMENT_MS = 2500;
const SHIPS_INCREMENT_MS = 3000;
const BUMP_EFFECT_MS = 500;

export function Header() {
  const [displayAgents, setDisplayAgents] = useState(MOCK_AGENTS);
  const [displayShips, setDisplayShips] = useState(MOCK_SHIPS);
  const [agentsBump, setAgentsBump] = useState(false);
  const [shipsBump, setShipsBump] = useState(false);
  const agentsBumpTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shipsBumpTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Agents pill: increment and flash accent
  useEffect(() => {
    const id = setInterval(() => {
      setDisplayAgents((n) => n + 1);
      setAgentsBump(true);
      if (agentsBumpTimeout.current) clearTimeout(agentsBumpTimeout.current);
      agentsBumpTimeout.current = setTimeout(() => {
        setAgentsBump(false);
        agentsBumpTimeout.current = null;
      }, BUMP_EFFECT_MS);
    }, AGENTS_INCREMENT_MS);
    return () => {
      clearInterval(id);
      if (agentsBumpTimeout.current) clearTimeout(agentsBumpTimeout.current);
    };
  }, []);

  // Ships pill: increment and flash accent (same effect as Agents)
  useEffect(() => {
    const id = setInterval(() => {
      setDisplayShips((n) => n + 1);
      setShipsBump(true);
      if (shipsBumpTimeout.current) clearTimeout(shipsBumpTimeout.current);
      shipsBumpTimeout.current = setTimeout(() => {
        setShipsBump(false);
        shipsBumpTimeout.current = null;
      }, BUMP_EFFECT_MS);
    }, SHIPS_INCREMENT_MS);
    return () => {
      clearInterval(id);
      if (shipsBumpTimeout.current) clearTimeout(shipsBumpTimeout.current);
    };
  }, []);

  return (
    <header className="border-b border-[var(--border)] sticky top-0 bg-[var(--bg)]/80 backdrop-blur-md z-50">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="text-2xl">⚓</span>
          <span className="font-bold text-lg tracking-tight text-[var(--accent)] group-hover:text-[var(--fg)] transition">
            Shipyard
          </span>
        </Link>

        {/* Stats — high mock numbers; Agents pill increments */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors duration-300 ${
              agentsBump
                ? "border-emerald-500/50 bg-emerald-500/15"
                : "border-[var(--border)] bg-[var(--card)]"
            }`}
          >
            <span
              className={`font-medium tabular-nums transition-colors duration-300 ${
                agentsBump ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--fg)]"
              }`}
            >
              {displayAgents.toLocaleString()}
            </span>
            <span className="text-[var(--fg-muted)]">Agents</span>
          </div>
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors duration-300 ${
              shipsBump
                ? "border-emerald-500/50 bg-emerald-500/15"
                : "border-[var(--border)] bg-[var(--card)]"
            }`}
          >
            <span
              className={`font-medium tabular-nums transition-colors duration-300 ${
                shipsBump ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--fg)]"
              }`}
            >
              {displayShips.toLocaleString()}
            </span>
            <span className="text-[var(--fg-muted)]">Ships</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-xs">
            <span className="font-medium text-[var(--fg)] tabular-nums">
              {MOCK_TODAY.toLocaleString()}
            </span>
            <span className="text-[var(--fg-muted)]">Today</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-6 ml-auto">
          <Link
            href="/#feed"
            className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition hidden sm:block"
          >
            Feed
          </Link>
          <Link
            href="/agents"
            className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition hidden sm:block"
          >
            Agents
          </Link>
          <a
            href="https://github.com/shipyard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition hidden sm:block"
          >
            GitHub
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
