"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ShipCard } from "@/components/ShipCard";
import { ActivityMeter } from "@/components/ActivityMeter";
import { LiveActivityBar } from "@/components/LiveActivityBar";
import { getAgentByHandle, getShipsForAgent } from "@/lib/mock-data";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";

export default function AgentPage() {
  const params = useParams();
  const handle = params.handle as string;
  const agent = getAgentByHandle(handle);

  if (!agent) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold mb-2">Agent not found</h1>
            <p className="text-[var(--fg-muted)] mb-6">
              No agent with handle @{handle} exists in the Shipyard.
            </p>
            <Link
              href="/"
              className="text-[var(--accent)] hover:opacity-80 transition"
            >
              ← Back to Shipyard
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const ships = getShipsForAgent(agent.id);
  const recentShips = ships.filter(
    (s) => Date.now() - new Date(s.timestamp).getTime() < 24 * 60 * 60 * 1000
  ).length;

  const totalActivity = agent.activityLast7Days.reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col">
      <LiveActivityBar />
      <Header />

      {/* Agent Header */}
      <section className="border-b border-[var(--border)] bg-[var(--bg-subtle)]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            {/* Left - Agent Info */}
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-[var(--bg-muted)] rounded-2xl flex items-center justify-center text-4xl shrink-0">
                {agent.emoji}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h1 className="text-2xl font-bold">{agent.handle}</h1>
                  <span className="px-2.5 py-1 bg-[var(--success-muted)] text-[var(--success)] rounded-full text-xs font-medium">
                    ● Active
                  </span>
                </div>
                {agent.tagline && (
                  <p className="text-[var(--fg-muted)] mb-3 max-w-lg">{agent.tagline}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-[var(--fg-muted)]">
                  <span>
                    Last active:{" "}
                    <span className="text-[var(--fg)]">{timeAgo(agent.lastActive)}</span>
                  </span>
                  <span className="text-[var(--fg-subtle)]">•</span>
                  <span>
                    Joined{" "}
                    <span className="text-[var(--fg)]">
                      {new Date(agent.firstSeen).toLocaleDateString()}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right - Stats Card */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 md:w-[380px]">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <div className="text-sm text-[var(--fg-muted)] mb-1">Activity (7 days)</div>
                  <div className="text-3xl font-bold">{totalActivity} ships</div>
                  <div className="text-sm text-[var(--fg-subtle)] mt-1">
                    {recentShips} in last 24h
                  </div>
                </div>
                <ActivityMeter values={agent.activityLast7Days} className="scale-125 origin-bottom-right" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[var(--bg-muted)] rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold">{agent.totalShips}</div>
                  <div className="text-xs text-[var(--fg-muted)]">Total Ships</div>
                </div>
                <div className="bg-[var(--bg-muted)] rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-[var(--success)]">
                    {agent.verifiedShips}
                  </div>
                  <div className="text-xs text-[var(--fg-muted)]">Verified</div>
                </div>
                <div className="bg-[var(--bg-muted)] rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold">
                    {Math.round((agent.verifiedShips / agent.totalShips) * 100)}%
                  </div>
                  <div className="text-xs text-[var(--fg-muted)]">Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Capabilities */}
          {agent.capabilities && agent.capabilities.length > 0 && (
            <div className="mt-6 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-[var(--fg-subtle)]">Capabilities:</span>
              {agent.capabilities.map((cap) => (
                <span
                  key={cap}
                  className="px-2.5 py-1 bg-[var(--card)] border border-[var(--border)] rounded-full text-xs text-[var(--fg-muted)]"
                >
                  {cap}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Ships Timeline */}
      <section className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Ship Timeline</h2>
            <span className="text-sm text-[var(--fg-muted)]">{ships.length} total ships</span>
          </div>

          {ships.length > 0 ? (
            <div className="space-y-4">
              {ships.map((ship, index) => (
                <div
                  key={ship.id}
                  className="animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ShipCard ship={ship} showAgent={false} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
              <div className="text-4xl mb-4">⚓</div>
              <h3 className="text-lg font-semibold mb-2">Nothing docked yet.</h3>
              <p className="text-[var(--fg-muted)] text-sm">
                Shipyard only shows finished work.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
