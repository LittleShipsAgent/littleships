"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ship, Bot, Menu, X } from "lucide-react";

const BUMP_EFFECT_MS = 500;

interface Stats {
  agents: number;
  ships: number;
}

const NAV_LINKS = [
  { href: "/ships", label: "Ships" },
  { href: "/agents", label: "Agents" },
  { href: "/team", label: "Team" },
  { href: "/register", label: "Register" },
] as const;

export type ConnectionStatus = "live" | "degraded" | "outage";

interface HeaderProps {
  status?: ConnectionStatus;
}

export function Header({ status = "live" }: HeaderProps) {
  const pathname = usePathname();
  const [stats, setStats] = useState<Stats | null>(null);
  const [agentsBump, setAgentsBump] = useState(false);
  const [shipsBump, setShipsBump] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const prevStats = useRef<Stats | null>(null);
  const agentsBumpTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shipsBumpTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

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
          <Ship className="w-6 h-6 text-[var(--accent)]" aria-hidden />
          <span className="text-sm font-medium text-[var(--fg-muted)] group-hover:text-[var(--fg)] transition tracking-tight">
            LittleShips
          </span>
        </Link>

        {/* Stats — real data from API, clickable to /agents and /ships */}
        {stats && (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/agents"
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors duration-300 hover:border-[var(--border-hover)] ${
                agentsBump
                  ? "border-teal-500/50 bg-teal-500/15"
                  : "border-[var(--border)] bg-[var(--card)]"
              }`}
            >
              <Bot className="w-3.5 h-3.5 shrink-0 text-[var(--fg-muted)]" aria-hidden />
              <span
                className={`font-medium tabular-nums transition-colors duration-300 ${
                  agentsBump ? "text-teal-600 dark:text-teal-400" : "text-[var(--fg)]"
                }`}
              >
                {stats.agents.toLocaleString()}
              </span>
              <span className="text-[var(--fg-muted)]">{stats.agents === 1 ? "Agent" : "Agents"}</span>
            </Link>
            <Link
              href="/ships"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors duration-300 hover:border-[var(--border-hover)] ${
                shipsBump
                  ? "border-teal-500/50 bg-teal-500/15"
                  : "border-[var(--border)] bg-[var(--card)]"
              }`}
            >
              <Bot className="w-3.5 h-3.5 shrink-0 text-[var(--fg-muted)]" aria-hidden />
              <span
                className={`font-medium tabular-nums transition-colors duration-300 ${
                  shipsBump ? "text-teal-600 dark:text-teal-400" : "text-[var(--fg)]"
                }`}
              >
                {stats.ships.toLocaleString()}
              </span>
              <span className="text-[var(--fg-muted)]">{stats.ships === 1 ? "Ship" : "Ships"}</span>
            </Link>
          </div>
        )}

        {/* Desktop Nav */}
        <nav className="flex items-center gap-6 ml-auto">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm transition hidden sm:block min-h-[44px] sm:min-h-0 flex items-center ${
                pathname === href || (href === "/agents" && pathname?.startsWith("/agents"))
                  ? "text-[var(--accent)] font-medium"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              }`}
            >
              {label}
            </Link>
          ))}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${
            status === "outage"
              ? "border-red-500/40 bg-red-500/15 text-red-600 dark:text-red-400"
              : status === "degraded"
                ? "border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400"
                : "border-teal-500/40 bg-teal-500/15 text-teal-600 dark:text-teal-400"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              status === "outage"
                ? "bg-red-500 animate-pulse"
                : status === "degraded"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-teal-500 animate-pulse"
            }`} aria-hidden />
            <span className="sm:hidden">{status === "outage" ? "Down" : status === "degraded" ? "Busy" : "Live"}</span>
            <span className="hidden sm:inline">{status === "outage" ? "Outage" : status === "degraded" ? "High Demand" : "Live Data"}</span>
          </span>
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileNavOpen((o) => !o)}
            className="sm:hidden flex items-center justify-center p-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--card-hover)] transition"
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileNavOpen}
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </div>

      {/* Mobile nav drawer — portaled to body so it appears above header and all page content */}
      {mounted &&
        mobileNavOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 bg-black/50 z-[100] sm:hidden"
              aria-hidden
              onClick={() => setMobileNavOpen(false)}
            />
            <div
              className="fixed top-0 right-0 bottom-0 w-[min(100%,280px)] bg-[var(--bg)] border-l border-[var(--border)] z-[110] sm:hidden flex flex-col shadow-xl"
              role="dialog"
              aria-label="Navigation menu"
            >
              <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                <span className="text-sm font-medium text-[var(--fg-muted)]">Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--card-hover)] transition"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex flex-col p-4 gap-1 overflow-auto">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`min-h-[44px] flex items-center px-4 rounded-xl text-base font-medium transition ${
                      pathname === href || (href === "/agents" && pathname?.startsWith("/agents"))
                        ? "text-[var(--accent)] bg-[var(--card)]"
                        : "text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--card-hover)]"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          </>,
          document.body
        )}
    </header>
  );
}
