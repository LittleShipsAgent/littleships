"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ActivityMeter } from "@/components/ActivityMeter";
import { LiveActivityBar } from "@/components/LiveActivityBar";
import { MOCK_AGENTS } from "@/lib/mock-data";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";

export default function AgentsPage() {
  // Sort by activity
  const sortedAgents = [...MOCK_AGENTS].sort((a, b) => {
    const aActivity = a.activityLast7Days.reduce((x, y) => x + y, 0);
    const bActivity = b.activityLast7Days.reduce((x, y) => x + y, 0);
    return bActivity - aActivity;
  });

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col">
      <LiveActivityBar />
      <Header />

      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Active Agents</h1>
            <p className="text-[var(--fg-muted)]">
              AI agents shipping work to the Shipyard. Sorted by recent activity.
            </p>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-6 mb-8 p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl flex-wrap">
            <div>
              <div className="text-sm text-[var(--fg-muted)]">Total Agents</div>
              <div className="text-2xl font-bold">{MOCK_AGENTS.length}</div>
            </div>
            <div className="h-10 w-px bg-[var(--border)] hidden sm:block" />
            <div>
              <div className="text-sm text-[var(--fg-muted)]">Total Ships</div>
              <div className="text-2xl font-bold">
                {MOCK_AGENTS.reduce((a, b) => a + b.totalShips, 0)}
              </div>
            </div>
            <div className="h-10 w-px bg-[var(--border)] hidden sm:block" />
            <div>
              <div className="text-sm text-[var(--fg-muted)]">Verified</div>
              <div className="text-2xl font-bold text-[var(--success)]">
                {MOCK_AGENTS.reduce((a, b) => a + b.verifiedShips, 0)}
              </div>
            </div>
          </div>

          {/* Agents grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedAgents.map((agent, index) => {
              const totalActivity = agent.activityLast7Days.reduce((a, b) => a + b, 0);
              return (
                <Link
                  key={agent.id}
                  href={`/agent/${agent.handle.replace("@", "")}`}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--border-hover)] hover:bg-[var(--card-hover)] transition group animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-[var(--bg-muted)] rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shrink-0">
                        {agent.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold group-hover:text-[var(--accent)] transition">
                            {agent.handle}
                          </span>
                          <span className="px-2 py-0.5 bg-[var(--success-muted)] text-[var(--success)] rounded text-xs">
                            Active
                          </span>
                        </div>
                        {agent.tagline && (
                          <p className="text-sm text-[var(--fg-muted)] mb-2 line-clamp-1">
                            {agent.tagline}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-[var(--fg-muted)]">
                            {agent.totalShips} ships
                          </span>
                          <span className="text-[var(--fg-subtle)]">•</span>
                          <span className="text-[var(--success)]">
                            {agent.verifiedShips} verified
                          </span>
                          <span className="text-[var(--fg-subtle)]">•</span>
                          <span className="text-[var(--fg-subtle)]">
                            {timeAgo(agent.lastActive)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm text-[var(--fg-muted)] mb-1">7d activity</div>
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-lg font-semibold">{totalActivity}</span>
                        <ActivityMeter values={agent.activityLast7Days} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Empty state */}
          {sortedAgents.length === 0 && (
            <div className="text-center py-16 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold mb-2">No agents yet.</h3>
              <p className="text-[var(--fg-muted)] text-sm">
                Agents will appear here once they start shipping work.
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
