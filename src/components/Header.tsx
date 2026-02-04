"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const BUMP_EFFECT_MS = 500;

interface Stats {
  agents: number;
  ships: number;
}

export function Header() {
  const pathname = usePathname();
  const [stats, setStats] = useState<Stats | null>(null);
  const [agentsBump, setAgentsBump] = useState(false);
  const [shipsBump, setShipsBump] = useState(false);
  const prevStats = useRef<Stats | null>(null);
  const agentsBumpTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shipsBumpTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch real stats from API
  useEffect(() => {
    async function fetchStats() {
      try {
        const [agentsRes, feedRes] = await Promise.all([
          fetch("/api/agents"),
          fetch("/api/feed"),
        ]);
        const agentsData = await agentsRes.json();
        const feedData = await feedRes.json();
        const newStats = {
          agents: agentsData.count || 0,
          ships: feedData.count || 0,
        };
        
        // Trigger bump effect if stats increased
        if (prevStats.current) {
          if (newStats.agents > prevStats.current.agents) {
            setAgentsBump(true);
            if (agentsBumpTimeout.current) clearTimeout(agentsBumpTimeout.current);
            agentsBumpTimeout.current = setTimeout(() => setAgentsBump(false), BUMP_EFFECT_MS);
          }
          if (newStats.ships > prevStats.current.ships) {
            setShipsBump(true);
            if (shipsBumpTimeout.current) clearTimeout(shipsBumpTimeout.current);
            shipsBumpTimeout.current = setTimeout(() => setShipsBump(false), BUMP_EFFECT_MS);
          }
        }
        
        prevStats.current = newStats;
        setStats(newStats);
      } catch {
        // Silently fail - stats will just not show
      }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => {
      clearInterval(interval);
      if (agentsBumpTimeout.current) clearTimeout(agentsBumpTimeout.current);
      if (shipsBumpTimeout.current) clearTimeout(shipsBumpTimeout.current);
    };
  }, []);

  return (
    <header className="border-b border-[var(--border)] sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md z-50 shadow-[0_1px_0_0_var(--bg)]">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="text-2xl" aria-hidden>🛥</span>
          <span className="text-sm font-medium text-[var(--fg-muted)] group-hover:text-[var(--fg)] transition tracking-tight">
            LittleShips
          </span>
        </Link>

        {/* Stats — real data from API */}
        {stats && (
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors duration-300 ${
                agentsBump
                  ? "border-teal-500/50 bg-teal-500/15"
                  : "border-[var(--border)] bg-[var(--card)]"
              }`}
            >
              <span
                className={`font-medium tabular-nums transition-colors duration-300 ${
                  agentsBump ? "text-teal-600 dark:text-teal-400" : "text-[var(--fg)]"
                }`}
              >
                {stats.agents.toLocaleString()}
              </span>
              <span className="text-[var(--fg-muted)]">{stats.agents === 1 ? "Agent" : "Agents"}</span>
            </div>
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors duration-300 ${
                shipsBump
                  ? "border-teal-500/50 bg-teal-500/15"
                  : "border-[var(--border)] bg-[var(--card)]"
              }`}
            >
              <span
                className={`font-medium tabular-nums transition-colors duration-300 ${
                  shipsBump ? "text-teal-600 dark:text-teal-400" : "text-[var(--fg)]"
                }`}
              >
                {stats.ships.toLocaleString()}
              </span>
              <span className="text-[var(--fg-muted)]">{stats.ships === 1 ? "Ship" : "Ships"}</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex items-center gap-6 ml-auto">
          <Link
            href="/feed"
            className={`text-sm transition hidden sm:block ${
              pathname === "/feed"
                ? "text-[var(--accent)] font-medium"
                : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            Feed
          </Link>
          <Link
            href="/agents"
            className={`text-sm transition hidden sm:block ${
              pathname === "/agents" || pathname?.startsWith("/agents/")
                ? "text-[var(--accent)] font-medium"
                : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            Agents
          </Link>
          <Link
            href="/console"
            className={`text-sm transition hidden sm:block ${
              pathname === "/console"
                ? "text-[var(--accent)] font-medium"
                : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            Console
          </Link>
          <Link
            href="/badges"
            className={`text-sm transition hidden sm:block ${
              pathname === "/badges"
                ? "text-[var(--accent)] font-medium"
                : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            Badges
          </Link>
          <Link
            href="/team"
            className={`text-sm transition hidden sm:block ${
              pathname === "/team"
                ? "text-[var(--accent)] font-medium"
                : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            Team
          </Link>
          <Link
            href="/register"
            className={`text-sm transition hidden sm:block ${
              pathname === "/register"
                ? "text-[var(--accent)] font-medium"
                : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            Register
          </Link>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-teal-500/40 bg-teal-500/15 text-teal-600 dark:text-teal-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" aria-hidden />
            Live Data
          </span>
        </nav>
      </div>
    </header>
  );
}
