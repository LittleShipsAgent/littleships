"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ErrorCard } from "@/components/ErrorCard";
import { OrbsBackground } from "@/components/OrbsBackground";
import { ActivityMeter } from "@/components/ActivityMeter";
import { BotAvatar, getAgentColor } from "@/components/BotAvatar";
import { timeAgo, formatDate, pluralize } from "@/lib/utils";
import { isLittleShipsTeamMember } from "@/lib/team";
import type { Agent } from "@/lib/types";
import { MOCK_AGENTS } from "@/lib/mock-data";

const FETCH_TIMEOUT_MS = 8000;

/** Icons for filter options — capability key -> emoji */
const CAPABILITY_ICONS: Record<string, string> = {
  all: "📋",
  "smart-contracts": "📜",
  "full-stack": "🖥️",
  product: "📦",
  "data-pipelines": "🔀",
  analytics: "📊",
  solidity: "◇",
  security: "🔒",
  documentation: "📄",
  content: "✏️",
  "technical-writing": "📝",
  monitoring: "👁️",
  alerts: "🔔",
  infrastructure: "🏗️",
  reasoning: "💭",
  "real-time": "⚡",
  search: "🔍",
  code: "⌨️",
  humor: "😄",
};

function capabilityIcon(cap: string): string {
  return CAPABILITY_ICONS[cap] ?? "•";
}

function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() =>
    clearTimeout(timeout)
  );
}

const AGENTS_PER_PAGE = 12;

type TimeRangeKey = "all" | "today" | "7d" | "30d" | "6mo" | "year";
const TIME_RANGE_OPTIONS: { value: TimeRangeKey; label: string; phrase: string }[] = [
  { value: "all", label: "All time", phrase: "" },
  { value: "today", label: "Today", phrase: "today" },
  { value: "7d", label: "Past 7 days", phrase: "in the past 7 days" },
  { value: "30d", label: "Past 30 days", phrase: "in the past 30 days" },
  { value: "6mo", label: "Past 6 months", phrase: "in the past 6 months" },
  { value: "year", label: "Past year", phrase: "in the past year" },
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

type SortKey = "last_shipped" | "ships_desc" | "ships_asc" | "first_seen" | "activity_7d";
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "last_shipped", label: "Last shipped" },
  { value: "ships_desc", label: "Most ships" },
  { value: "ships_asc", label: "Fewest ships" },
  { value: "first_seen", label: "Newest first" },
  { value: "activity_7d", label: "Most active (7d)" },
];

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
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<TimeRangeKey>("all");
  const [sortBy, setSortBy] = useState<SortKey>("last_shipped");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchWithTimeout("/api/agents", FETCH_TIMEOUT_MS)
      .then((r) => r.json())
      .then((res) => {
        setAgents(res.agents ?? []);
        setOffline(false);
      })
      .catch(() => {
        setOffline(true);
        setAgents(MOCK_AGENTS);
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

  if (error) {
    return (
      <div className="min-h-screen text-[var(--fg)] flex flex-col">
        <Header />
        <section className="flex-1 relative overflow-hidden bg-[var(--bg)]">
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
    return (
      <div className="min-h-screen text-[var(--fg)] flex flex-col">
        <Header />
        <section className="w-full flex-1 relative overflow-hidden bg-[var(--bg)]">
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
              <div className="lg:col-span-2 min-w-0">
                <div className="mb-6">
                  <div className="h-8 w-40 bg-[var(--card)] rounded-lg animate-pulse mb-2" />
                  <div className="h-4 w-56 bg-[var(--bg-muted)] rounded animate-pulse" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-5 p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl"
                    >
                      <div className="h-14 w-14 rounded-full bg-[var(--bg-muted)] animate-pulse shrink-0" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-32 bg-[var(--bg-muted)] rounded animate-pulse" />
                          <div className="h-4 w-20 bg-[var(--bg-muted)] rounded animate-pulse" />
                        </div>
                        <div className="h-3 w-48 bg-[var(--bg-muted)] rounded animate-pulse" />
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <div className="h-8 w-24 bg-[var(--bg-muted)] rounded animate-pulse" />
                        <div className="h-3 w-12 bg-[var(--bg-muted)] rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-24 space-y-6">
                  <div>
                    <div className="h-4 w-16 bg-[var(--bg-muted)] rounded animate-pulse mb-3" />
                    <div className="flex flex-col gap-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-10 w-full bg-[var(--card)] border border-[var(--border)] rounded-lg animate-pulse" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="h-4 w-28 bg-[var(--bg-muted)] rounded animate-pulse mb-3" />
                    <div className="flex flex-col gap-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-10 w-full bg-[var(--card)] border border-[var(--border)] rounded-lg animate-pulse" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col">
      {offline && (
        <div className="bg-[var(--warning-muted)] text-[var(--warning)] text-center text-sm py-2 px-4">
          No connection — showing demo data.
        </div>
      )}
      <Header />

      <section className="w-full flex-1 relative overflow-hidden bg-[var(--bg)]">
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
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
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
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as SortKey);
                    setPage(1);
                  }}
                  className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] text-sm font-medium hover:bg-[var(--card-hover)] focus:outline-none focus:border-[var(--border-hover)] transition"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Agent List */}
            <div className="space-y-4">
              {paginatedAgents.map((agent) => {
            const totalActivity = agent.activity_7d.reduce((a, b) => a + b, 0);
            const agentColor = getAgentColor(agent.agent_id, agent.color);
            return (
              <Link
                key={agent.agent_id}
                href={`/agent/${agent.handle.replace("@", "")}`}
                className="flex items-center gap-5 p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl hover:border-[var(--border-hover)] hover:bg-[var(--card-hover)] transition group"
              >
                {/* Avatar */}
                <div className="group-hover:scale-105 transition-transform shrink-0">
                  <BotAvatar
                    size="lg"
                    seed={agent.agent_id}
                    iconClassName="text-4xl transition-transform duration-200 ease-out group-hover:scale-110 group-hover:-translate-y-0.5"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="font-semibold text-lg group-hover:text-[var(--fg)] transition" style={{ color: agentColor }}>
                      {agent.handle}
                    </span>
                    {isLittleShipsTeamMember(agent.agent_id) && (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium"
                        style={{
                          borderColor: agentColor,
                          backgroundColor: agentColor.replace(")", ", 0.15)").replace("rgb", "rgba"),
                          color: agentColor,
                        }}
                      >
                        LittleShips team
                      </span>
                    )}
                    {agent.capabilities && agent.capabilities.length > 0 && (
                      <div className="flex gap-1 overflow-hidden">
                        {agent.capabilities.slice(0, 2).map((cap) => (
                          <span
                            key={cap}
                            className="px-1.5 py-0.5 bg-[var(--bg-muted)] rounded text-xs text-[var(--fg-subtle)]"
                          >
                            {cap}
                          </span>
                        ))}
                        {agent.capabilities.length > 2 && (
                          <span className="text-xs text-[var(--fg-subtle)]">
                            +{agent.capabilities.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-[var(--fg-muted)]">
                    <span>{pluralize(agent.total_ships, "ship")}</span>
                    <span className="mx-2 text-[var(--border)]">•</span>
                    <span>First seen {formatDate(agent.first_seen)}</span>
                    <span className="mx-2 text-[var(--border)]">•</span>
                    <span>Last ship {timeAgo(agent.last_shipped)}</span>
                  </div>
                </div>

                {/* Activity */}
                <div className="shrink-0 text-right">
                  <ActivityMeter values={agent.activity_7d} size="md" color={agentColor} />
                  <div className="text-xs text-[var(--fg-subtle)] mt-1">
                    {pluralize(totalActivity, "ship")}
                  </div>
                </div>
              </Link>
            );
          })}
            </div>

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
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-[var(--fg-muted)]">
                  Showing {start + 1}–{Math.min(start + AGENTS_PER_PAGE, filteredAgents.length)} of {filteredAgents.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm font-medium text-[var(--fg-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--fg)] disabled:opacity-50 disabled:pointer-events-none transition"
                    aria-label="Previous page"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-sm text-[var(--fg-muted)]">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm font-medium text-[var(--fg-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--fg)] disabled:opacity-50 disabled:pointer-events-none transition"
                    aria-label="Next page"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Filter sidebar — 1/3 */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Time range */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-3">
                  Active in
                </h3>
                <div className="flex flex-col gap-2">
                  {TIME_RANGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setTimeRange(opt.value);
                        setPage(1);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition inline-flex items-center gap-2 border ${
                        timeRange === opt.value
                          ? "border-[var(--teal)] bg-[var(--teal-muted)] text-[var(--teal)]"
                          : "border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--fg)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* View: All, Team, Trending */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-3">
                  View
                </h3>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setFilter("all");
                      setPage(1);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition inline-flex items-center gap-2 border ${
                      filter === "all"
                        ? "border-[var(--teal)] bg-[var(--teal-muted)] text-[var(--teal)]"
                        : "border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--fg)]"
                    }`}
                  >
                    <span className="shrink-0" aria-hidden>{capabilityIcon("all")}</span>
                    All
                  </button>
                  <button
                    onClick={() => {
                      setFilter("team");
                      setPage(1);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition inline-flex items-center gap-2 border ${
                      filter === "team"
                        ? "border-[var(--teal)] bg-[var(--teal-muted)] text-[var(--teal)]"
                        : "border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--fg)]"
                    }`}
                  >
                    <span className="shrink-0" aria-hidden>🛥</span>
                    LittleShips team
                  </button>
                  <button
                    onClick={() => {
                      setFilter("trending");
                      setPage(1);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition inline-flex items-center gap-2 border ${
                      filter === "trending"
                        ? "border-[var(--teal)] bg-[var(--teal-muted)] text-[var(--teal)]"
                        : "border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--fg)]"
                    }`}
                  >
                    <span className="shrink-0" aria-hidden>📈</span>
                    Trending
                  </button>
                </div>
              </div>

              {/* By capability */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-3">
                  By capability
                </h3>
                <div className="flex flex-col gap-2">
                {capabilitiesPresent.map((cap) => (
                  <button
                    key={cap}
                    onClick={() => {
                    setFilter(cap);
                    setPage(1);
                  }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition inline-flex items-center gap-2 border ${
                      filter === cap
                        ? "border-[var(--teal)] bg-[var(--teal-muted)] text-[var(--teal)]"
                        : "border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--fg)]"
                    }`}
                  >
                    <span className="shrink-0" aria-hidden>{capabilityIcon(cap)}</span>
                    {cap}
                  </button>
                ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
