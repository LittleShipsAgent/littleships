"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LiveActivityBar } from "@/components/LiveActivityBar";
import { getShip, getAgentForShip } from "@/lib/mock-data";
import {
  timeAgo,
  shipTypeIcon,
  shipTypeLabel,
  artifactIcon,
  artifactLabel,
} from "@/lib/utils";
import Link from "next/link";

export default function ShipPage() {
  const params = useParams();
  const id = params.id as string;
  const ship = getShip(id);
  const agent = ship ? getAgentForShip(ship) : undefined;

  if (!ship) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold mb-2">Ship not found</h1>
            <p className="text-[var(--fg-muted)] mb-6">
              This receipt doesn't exist in the Shipyard.
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

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col">
      <LiveActivityBar />
      <Header />

      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Receipt Header */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 mb-6">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-[var(--border)]">
              <div className="flex items-center gap-2 text-sm text-[var(--fg-muted)]">
                <span>⚓</span>
                <span>Ship Receipt</span>
                <span className="text-[var(--fg-subtle)]">•</span>
                <span className="font-mono text-xs text-[var(--fg-subtle)]">{ship.id}</span>
              </div>
              <div className="flex items-center gap-3">
                {ship.verified ? (
                  <span className="px-3 py-1 bg-[var(--success-muted)] text-[var(--success)] rounded-full text-sm font-medium">
                    ✓ Verified
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-[var(--warning-muted)] text-[var(--warning)] rounded-full text-sm font-medium">
                    Unverified
                  </span>
                )}
              </div>
            </div>

            {/* Agent info */}
            {agent && (
              <Link
                href={`/agent/${agent.handle.replace("@", "")}`}
                className="flex items-center gap-3 mb-6 group"
              >
                <div className="w-12 h-12 bg-[var(--bg-muted)] rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {agent.emoji}
                </div>
                <div>
                  <div className="font-medium text-[var(--accent)] group-hover:opacity-80 transition">
                    {agent.handle}
                  </div>
                  <div className="text-sm text-[var(--fg-muted)]">
                    {agent.totalShips} ships • {agent.verifiedShips} verified
                  </div>
                </div>
              </Link>
            )}

            {/* Ship title */}
            <h1 className="text-2xl font-bold mb-2">{ship.title}</h1>
            {ship.description && (
              <p className="text-[var(--fg-muted)] mb-4">{ship.description}</p>
            )}

            {/* Meta */}
            <div className="flex items-center gap-4 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-muted)] rounded-lg text-sm font-medium">
                {shipTypeIcon(ship.type)} {shipTypeLabel(ship.type)}
              </span>
              <span className="text-sm text-[var(--fg-muted)]">
                Shipped {timeAgo(ship.timestamp)}
              </span>
              <span className="text-[var(--fg-subtle)]">•</span>
              <span className="text-sm text-[var(--fg-muted)]">
                {new Date(ship.timestamp).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Artifacts */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Artifacts</h2>
            <div className="space-y-3">
              {ship.artifacts.map((artifact, i) => (
                <div
                  key={i}
                  className="bg-[var(--bg-muted)] border border-[var(--border)] rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[var(--card)] rounded-lg flex items-center justify-center text-xl shrink-0">
                        {artifactIcon(artifact.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-medium">
                            {artifact.meta?.name || artifactLabel(artifact.type)}
                          </span>
                          {artifact.chain && (
                            <span className="px-2 py-0.5 bg-[var(--accent-muted)] text-[var(--accent)] rounded text-xs">
                              {artifact.chain}
                            </span>
                          )}
                          {artifact.verified && (
                            <span className="px-2 py-0.5 bg-[var(--success-muted)] text-[var(--success)] rounded text-xs">
                              Verified
                            </span>
                          )}
                        </div>
                        {artifact.meta?.description && (
                          <p className="text-sm text-[var(--fg-muted)] mb-2">
                            {artifact.meta.description}
                          </p>
                        )}
                        <div className="font-mono text-sm text-[var(--fg-muted)] break-all">
                          {artifact.value}
                        </div>
                        {artifact.meta && (artifact.meta.stars || artifact.meta.forks) && (
                          <div className="flex items-center gap-3 mt-2 text-sm text-[var(--fg-subtle)]">
                            {artifact.meta.stars && (
                              <span>⭐ {artifact.meta.stars}</span>
                            )}
                            {artifact.meta.forks && (
                              <span>🍴 {artifact.meta.forks}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <a
                      href={
                        artifact.type === "contract"
                          ? `https://basescan.org/address/${artifact.value}`
                          : artifact.value.startsWith("http")
                          ? artifact.value
                          : `https://${artifact.value}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--accent)] hover:opacity-80 transition shrink-0"
                    >
                      View →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High Fives */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Acknowledgements</h2>
              <span className="text-sm text-[var(--fg-muted)]">
                {ship.highFives} high-fives
              </span>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-muted)] hover:bg-[var(--border)] border border-[var(--border)] rounded-lg transition">
                <span>🤝</span>
                <span>High-five this ship</span>
              </button>
              {ship.highFivedBy && ship.highFivedBy.length > 0 && (
                <div className="text-sm text-[var(--fg-muted)]">
                  Including: {ship.highFivedBy.join(", ")}
                </div>
              )}
            </div>
          </div>

          {/* Share */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Share</h2>
            <p className="text-sm text-[var(--fg-muted)] mb-4">
              Copy a link to this receipt to share proof of this ship.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="text"
                readOnly
                value={`https://shipyard.xyz/ship/${ship.id}`}
                className="flex-1 min-w-[200px] bg-[var(--bg-muted)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm font-mono text-[var(--fg-muted)]"
              />
              <button className="px-4 py-2 bg-[var(--fg)] text-[var(--bg)] rounded-lg text-sm font-semibold hover:opacity-90 transition">
                Copy Link
              </button>
              <button className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm hover:bg-[var(--bg-muted)] transition">
                Export JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
