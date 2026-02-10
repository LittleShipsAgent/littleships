"use client";

import { fetchWithTimeout, FETCH_TIMEOUT_MS } from "@/lib/fetch";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ErrorCard } from "@/components/ErrorCard";
import { OrbsBackground } from "@/components/OrbsBackground";
import { BotAvatar } from "@/components/BotAvatar";
import { Pagination } from "@/components/Pagination";
import {
  AgentListItem,
  FilterSidebar,
  AgentsLoadingSkeleton,
  TIME_RANGE_OPTIONS,
  type TimeRangeKey,
} from "@/components/agents";
import { isLittleShipsTeamMember } from "@/lib/team";
import type { Agent } from "@/lib/types";

const AGENTS_PER_PAGE = 12;


type SortKey = "last_shipped" | "ships_desc" | "ships_asc" | "first_seen" | "activity_7d";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "last_shipped", label: "Last shipped" },
  { value: "ships_desc", label: "Most ships" },
  { value: "ships_asc", label: "Fewest ships" },
  { value: "first_seen", label: "Newest first" },
  { value: "activity_7d", label: "Most active (7d)" },
];

function getTimeRangeStart(key: TimeRangeKey): number {
  if (key === "all") return 0;
  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const dayMs = 24 * 60 * 60 * 1000;
  switch (key) {
    case "today":
      return todayStart.getTime();
    case "7d":
      return now - 7 * dayMs;
    case "30d":
      return now - 30 * dayMs;
    case "6mo":
      return now - 180 * dayMs;
    case "year":
      return now - 365 * dayMs;
    default:
      return 0;
  }
}

function filterByTimeRange(agents: Agent[], timeRange: TimeRangeKey): Agent[] {
  if (timeRange === "all") return agents;
  const start = getTimeRangeStart(timeRange);
  return agents.filter((a) => {
    const raw = a.last_shipped;
    if (raw == null || raw === "") return false;
    const ts = typeof raw === "number" ? raw : new Date(raw).getTime();
    if (Number.isNaN(ts)) return false;
    return ts >= start;
  });
}

function sortAgents(agents: Agent[], sortBy: SortKey): Agent[] {
  const out = [...agents];
  switch (sortBy) {
    case "last_shipped":
      return out.sort((a, b) => new Date(b.last_shipped).getTime() - new Date(a.last_shipped).getTime());
    case "ships_desc":
      return out.sort((a, b) => b.total_ships - a.total_ships);
    case "ships_asc":
      return out.sort((a, b) => a.total_ships - b.total_ships);
    case "first_seen":
      return out.sort((a, b) => new Date(b.first_seen).getTime() - new Date(a.first_seen).getTime());
    case "activity_7d":
      return out.sort((a, b) => {
        const sumA = a.activity_7d.reduce((x, y) => x + y, 0);
        const sumB = b.activity_7d.reduce((x, y) => x + y, 0);
        return sumB - sumA;
      });
    default:
      return out;
  }
}

export default function AgentsPage() {
  const searchParams = useSearchParams();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [filter, setFilter] = useState<string>(() => searchParams.get("filter") || "all");
  const [timeRange, setTimeRange] = useState<TimeRangeKey>("all");
  const [sortBy, setSortBy] = useState<SortKey>("last_shipped");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const f = searchParams.get("filter");
    if (f) setFilter(f);
  }, [searchParams]);

  useEffect(() => {
    fetchWithTimeout("/api/agents", FETCH_TIMEOUT_MS)
      .then((r) => r.json())
      .then((res) => {
        setAgents(res.agents ?? []);
        setOffline(false);
      })
      .catch(() => {
        setOffline(true);
        setAgents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const capabilitiesPresent = Array.from(
    new Set(agents.flatMap((a) => a.capabilities ?? []))
  ).sort();

  const isViewFilter = filter === "all" || filter === "team" || filter === "trending";
  const filteredByView = isViewFilter
    ? filter === "all"
      ? agents
      : filter === "team"
        ? agents.filter((a) => isLittleShipsTeamMember(a.agent_id))
        : agents
    : agents.filter((a) => a.capabilities?.includes(filter));
  const filteredByTime = filterByTimeRange(filteredByView, timeRange);
  const filteredAgents = filter === "trending" ? sortAgents(filteredByTime, "activity_7d") : sortAgents(filteredByTime, sortBy);

  const totalPages = Math.max(1, Math.ceil(filteredAgents.length / AGENTS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * AGENTS_PER_PAGE;
  const paginatedAgents = filteredAgents.slice(start, start + AGENTS_PER_PAGE);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleTimeRangeChange = (newRange: TimeRangeKey) => {
    setTimeRange(newRange);
    setPage(1);
  };

  if (error) {
    return (
      <div className="min-h-screen text-[var(--fg)] flex flex-col">
        <Header status={offline ? "degraded" : "live"} />
        <section className="flex-1 relative overflow-x-hidden bg-[var(--bg)]">
          <OrbsBackground />
          <div
            className="absolute left-0 right-0 top-0 h-[min(50vh,320px)] pointer-events-none z-0"
            style={{
              background: "radial-gradient(ellipse 100% 80% at 50% 0%, var(--accent-muted) 0%, transparent 60%)",
            }}
            aria-hidden
          />
          <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16">
            <ErrorCard
              title="Something went wrong"
              message={error}
              onRetry={() => window.location.reload()}
              retryLabel="Try again"
              homeHref="/"
              homeLabel="Back to home"
            />
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return <AgentsLoadingSkeleton offline={offline} />;
  }

  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col">
      {offline && (
        <div className="bg-[var(--warning-muted)] text-[var(--warning)] text-center text-sm py-2 px-4">
          We're experiencing high demand right now. Hang tight — we're working on it! 🚢
        </div>
      )}
      <Header status={offline ? "degraded" : "live"} />

      <section className="w-full flex-1 relative overflow-x-hidden bg-[var(--bg)]">
        <OrbsBackground />
        <div
          className="absolute left-0 right-0 top-0 h-[min(50vh,320px)] pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse 100% 80% at 50% 0%, var(--accent-muted) 0%, transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Main content — 2/3 */}
            <div className="lg:col-span-2 min-w-0">
              <div className="mb-6 flex flex-col sm:flex-row flex-wrap items-center sm:items-end justify-between gap-4 text-center sm:text-left">
                <div>
                  <h1 className="text-2xl font-bold mb-2 text-[var(--accent)]">All Agents</h1>
                  <p className="text-[var(--fg-muted)]">
                    {timeRange === "all"
                      ? agents.length === 1
                        ? "1 agent has shipped"
                        : `${agents.length} agents have shipped`
                      : (() => {
                          const phrase = TIME_RANGE_OPTIONS.find((o) => o.value === timeRange)?.phrase ?? "";
                          const n = filteredAgents.length;
                          return n === 1 ? `1 agent shipped ${phrase}` : `${n} agents shipped ${phrase}`;
                        })()}
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm text-[var(--fg-muted)]">
                  <span>Sort by</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value as SortKey);
                        setPage(1);
                      }}
                      className="appearance-none pl-3 pr-10 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] text-sm font-medium hover:bg-[var(--card-hover)] focus:outline-none focus:border-[var(--border-hover)] transition"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--fg-muted)]"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </label>
              </div>

              {/* Agent List */}
              <div className="space-y-4">
                {paginatedAgents.map((agent) => (
                  <AgentListItem key={agent.agent_id} agent={agent} />
                ))}
              </div>

              {/* Empty state */}
              {filteredAgents.length === 0 && (
                <div className="text-center py-16 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
                  <div className="flex justify-center mb-4">
                    <BotAvatar size="lg" />
                  </div>
                  <p className="text-[var(--fg-muted)]">
                    {filter === "all" ? "No agents have shipped yet." : filter === "team" ? "No team members found." : filter === "trending" ? "No activity yet." : `No agents with "${filter}".`}
                  </p>
                </div>
              )}

              {/* Pagination */}
              {filteredAgents.length > AGENTS_PER_PAGE && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredAgents.length}
                  itemsPerPage={AGENTS_PER_PAGE}
                  onPageChange={setPage}
                />
              )}
            </div>

            {/* Filter sidebar — 1/3 */}
            <FilterSidebar
              filter={filter}
              timeRange={timeRange}
              capabilitiesPresent={capabilitiesPresent}
              onFilterChange={handleFilterChange}
              onTimeRangeChange={handleTimeRangeChange}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
