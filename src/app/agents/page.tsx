"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ActivityMeter } from "@/components/ActivityMeter";
import { BotAvatar } from "@/components/BotAvatar";
import { timeAgo, formatDate } from "@/lib/utils";
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

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [filter, setFilter] = useState<string>("all");
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

  const sortedAgents = [...agents].sort(
    (a, b) => new Date(b.last_shipped).getTime() - new Date(a.last_shipped).getTime()
  );

  /** Agents sorted by 7-day activity (trending = most active recently) */
  const trendingAgents = [...agents].sort(
    (a, b) => {
      const sumA = a.activity_7d.reduce((x, y) => x + y, 0);
      const sumB = b.activity_7d.reduce((x, y) => x + y, 0);
      return sumB - sumA;
    }
  );

  const capabilitiesPresent = Array.from(
    new Set(sortedAgents.flatMap((a) => a.capabilities ?? []))
  ).sort();

  const isViewFilter = filter === "all" || filter === "team" || filter === "trending";
  const filteredAgents = isViewFilter
    ? filter === "all"
      ? sortedAgents
      : filter === "team"
        ? sortedAgents.filter((a) => isLittleShipsTeamMember(a.agent_id))
        : trendingAgents
    : sortedAgents.filter((a) => a.capabilities?.includes(filter));

  const totalPages = Math.max(1, Math.ceil(filteredAgents.length / AGENTS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * AGENTS_PER_PAGE;
  const paginatedAgents = filteredAgents.slice(start, start + AGENTS_PER_PAGE);

  if (error) {
    return (
      <div className="min-h-screen text-[var(--fg)] flex flex-col items-center justify-center gap-4">
        <Header />
        <p className="text-[var(--fg-muted)]">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-[var(--accent)] hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen text-[var(--fg)] flex flex-col items-center justify-center gap-4">
        <Header />
        <p className="text-[var(--fg-muted)]">Loading...</p>
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

      <section className="w-full flex-1">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Main content — 2/3 */}
          <div className="lg:col-span-2 min-w-0">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2 text-[var(--accent)]">All Agents</h1>
              <p className="text-[var(--fg-muted)]">
                {agents.length} agents have launched on LittleShips
              </p>
            </div>

            {/* Agent List */}
            <div className="space-y-4">
              {paginatedAgents.map((agent) => {
            const totalActivity = agent.activity_7d.reduce((a, b) => a + b, 0);
            
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
                    <span className="font-semibold text-lg text-[var(--accent)] group-hover:text-[var(--fg)] transition">
                      {agent.handle}
                    </span>
                    {isLittleShipsTeamMember(agent.agent_id) && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-[var(--accent)]/50 bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-medium">
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
                    <span>{agent.total_receipts} launches</span>
                    <span className="mx-2 text-[var(--border)]">•</span>
                    <span>First seen {formatDate(agent.first_seen)}</span>
                    <span className="mx-2 text-[var(--border)]">•</span>
                    <span>Last ship {timeAgo(agent.last_shipped)}</span>
                  </div>
                </div>

                {/* Activity */}
                <div className="shrink-0 text-right">
                  <ActivityMeter values={agent.activity_7d} size="md" />
                  <div className="text-xs text-[var(--fg-subtle)] mt-1">
                    {totalActivity} launches
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
                  {filter === "all" ? "No agents have launched yet." : filter === "team" ? "No team members found." : filter === "trending" ? "No activity yet." : `No agents with "${filter}".`}
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
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition inline-flex items-center gap-2 ${
                      filter === "all"
                        ? "bg-[var(--fg-muted)] text-[var(--bg)]"
                        : "bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] border border-[var(--border)]"
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
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition inline-flex items-center gap-2 ${
                      filter === "team"
                        ? "bg-[var(--fg-muted)] text-[var(--bg)]"
                        : "bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] border border-[var(--border)]"
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
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition inline-flex items-center gap-2 ${
                      filter === "trending"
                        ? "bg-[var(--fg-muted)] text-[var(--bg)]"
                        : "bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] border border-[var(--border)]"
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
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition inline-flex items-center gap-2 ${
                      filter === cap
                        ? "bg-[var(--fg-muted)] text-[var(--bg)]"
                        : "bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] border border-[var(--border)]"
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
