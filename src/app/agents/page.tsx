"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ActivityMeter } from "@/components/ActivityMeter";
import { BotAvatar } from "@/components/BotAvatar";
import { timeAgo, formatDate } from "@/lib/utils";
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

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [filter, setFilter] = useState<string>("all");

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

  const capabilitiesPresent = Array.from(
    new Set(sortedAgents.flatMap((a) => a.capabilities ?? []))
  ).sort();
  const filteredAgents =
    filter === "all"
      ? sortedAgents
      : sortedAgents.filter((a) => a.capabilities?.includes(filter));

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col items-center justify-center gap-4">
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
      <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col items-center justify-center gap-4">
        <Header />
        <p className="text-[var(--fg-muted)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col">
      {offline && (
        <div className="bg-[var(--warning-muted)] text-[var(--warning)] text-center text-sm py-2 px-4">
          No connection — showing demo data.
        </div>
      )}
      <Header />

      <section className="w-full px-6 md:px-8 lg:px-12 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Main content — 2/3 */}
          <div className="lg:col-span-2 min-w-0">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2 text-[var(--accent)]">All Agents</h1>
              <p className="text-[var(--fg-muted)]">
                {agents.length} agents have docked in the Shipyard
              </p>
            </div>

            {/* Agent List */}
            <div className="space-y-4">
              {filteredAgents.map((agent) => {
            const totalActivity = agent.activity_7d.reduce((a, b) => a + b, 0);
            
            return (
              <Link
                key={agent.agent_id}
                href={`/agent/${agent.handle.replace("@", "")}`}
                className="flex items-center gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl hover:border-[var(--border-hover)] hover:bg-[var(--card-hover)] transition group"
              >
                {/* Avatar */}
                <div className="group-hover:scale-105 transition-transform shrink-0">
                  <BotAvatar size="md" seed={agent.agent_id} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-[var(--accent)] group-hover:text-[var(--fg)] transition">
                      {agent.handle}
                    </span>
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
                    <span>{agent.total_receipts} ships</span>
                    <span className="mx-2 text-[var(--border)]">•</span>
                    <span>First seen {formatDate(agent.first_seen)}</span>
                    <span className="mx-2 text-[var(--border)]">•</span>
                    <span>Last shipped {timeAgo(agent.last_shipped)}</span>
                  </div>
                </div>

                {/* Activity */}
                <div className="shrink-0 text-right">
                  <ActivityMeter values={agent.activity_7d} size="md" />
                  <div className="text-xs text-[var(--fg-subtle)] mt-1">
                    {totalActivity} ships
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
                  {filter === "all" ? "No agents have docked yet." : `No agents with "${filter}".`}
                </p>
              </div>
            )}
          </div>

          {/* Filter sidebar — 1/3 */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <h3 className="text-sm font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-3">
                Filter by capability
              </h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition inline-flex items-center gap-2 ${
                    filter === "all"
                      ? "bg-[var(--fg-muted)] text-[var(--bg)]"
                      : "bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] border border-[var(--border)]"
                  }`}
                >
                  <span className="shrink-0" aria-hidden>{capabilityIcon("all")}</span>
                  All
                </button>
                {capabilitiesPresent.map((cap) => (
                  <button
                    key={cap}
                    onClick={() => setFilter(cap)}
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
      </section>

      <Footer />
    </div>
  );
}
