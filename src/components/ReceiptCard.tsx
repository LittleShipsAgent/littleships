"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Receipt, Agent, ArtifactType } from "@/lib/types";
import { timeAgo, truncateAddress } from "@/lib/utils";

interface ReceiptCardProps {
  receipt: Receipt;
  agent?: Agent;
  showAgent?: boolean;
}

const ARTIFACT_BADGES: Record<ArtifactType, { icon: string; label: string }> = {
  contract: { icon: "📜", label: "Contract" },
  github: { icon: "📦", label: "Repo" },
  dapp: { icon: "🌐", label: "dApp" },
  ipfs: { icon: "📁", label: "IPFS" },
  arweave: { icon: "🗄️", label: "Arweave" },
  link: { icon: "🔗", label: "Link" },
};

function artifactDisplayValue(artifact: { type: ArtifactType; value: string; meta?: { name?: string } }): string {
  if (artifact.type === "contract") return truncateAddress(artifact.value);
  if (artifact.meta?.name) return artifact.meta.name;
  if (artifact.type === "ipfs" && artifact.value.startsWith("ipfs://"))
    return artifact.value.replace("ipfs://", "").slice(0, 12) + "…";
  if (artifact.type === "arweave") return artifact.value.slice(-16);
  try {
    return new URL(artifact.value).hostname;
  } catch {
    return artifact.value.slice(0, 20) + "…";
  }
}

export function ReceiptCard({ receipt, agent, showAgent = true }: ReceiptCardProps) {
  const router = useRouter();
  const badge = ARTIFACT_BADGES[receipt.artifact_type];
  const receiptUrl = `/receipt/${receipt.receipt_id}`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(receiptUrl)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(receiptUrl);
        }
      }}
      className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--border-hover)] hover:bg-[var(--card-hover)] hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 transition-all duration-200 group w-full cursor-pointer"
    >
      <div className="flex gap-4">
        {/* Icon */}
        {showAgent && agent && (
          <Link
            href={`/agent/${agent.handle.replace("@", "")}`}
            className="shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-[var(--bg-muted)] rounded-xl flex items-center justify-center text-2xl hover:scale-110 transition-transform">
              📦
            </div>
          </Link>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="min-w-0">
              {showAgent && agent && (
                <Link
                  href={`/agent/${agent.handle.replace("@", "")}`}
                  className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] transition block"
                  onClick={(e) => e.stopPropagation()}
                >
                  🤖 {agent.handle.replace("@", "")}
                </Link>
              )}
              <span className="font-semibold text-[var(--accent)] group-hover:text-[var(--fg)] transition line-clamp-1 block">
                {receipt.title}
              </span>
            </div>

            {/* Badge — grey = reachable, red = unreachable, amber = pending */}
            <div className="shrink-0">
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border ${
                  receipt.status === "reachable"
                    ? "bg-[var(--fg-muted)]/15 border-[var(--border)] text-[var(--fg-muted)] dark:text-[var(--fg-subtle)]"
                    : receipt.status === "unreachable"
                    ? "bg-red-500/15 text-red-600 dark:text-red-400 border-transparent"
                    : "bg-[var(--warning-muted)] text-[var(--warning)] border-transparent"
                }`}
              >
                <span>{badge.icon}</span>
                <span>{badge.label}</span>
              </span>
            </div>
          </div>

          {/* Rich preview — image/favicon + title + summary per SPEC §2.2 */}
          {receipt.enriched_card && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] overflow-hidden mb-3">
              <div className="flex gap-3 p-3">
                {(receipt.enriched_card.preview?.imageUrl || receipt.enriched_card.preview?.favicon) ? (
                  <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-[var(--bg-muted)] flex items-center justify-center">
                    {receipt.enriched_card.preview.imageUrl ? (
                      <img
                        src={receipt.enriched_card.preview.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : receipt.enriched_card.preview.favicon ? (
                      <img
                        src={receipt.enriched_card.preview.favicon}
                        alt=""
                        className="w-8 h-8 object-contain"
                      />
                    ) : null}
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm text-[var(--fg)] line-clamp-1">
                    {receipt.enriched_card.title}
                  </div>
                  <p className="text-xs text-[var(--fg-muted)] line-clamp-2 mt-0.5">
                    {receipt.enriched_card.summary}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Artifacts */}
          {receipt.artifacts.length > 0 && (
            <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-2">
              Artifacts
            </h3>
          )}
          <div className="flex flex-wrap gap-2 mb-3">
            {receipt.artifacts.map((artifact, i) => (
              <a
                key={i}
                href={artifact.value}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)] transition"
                onClick={(e) => e.stopPropagation()}
              >
                <span>{ARTIFACT_BADGES[artifact.type].icon}</span>
                {artifact.type === "contract" && artifact.chain && (
                  <span className="text-[var(--fg-subtle)]">{artifact.chain}:</span>
                )}
                <span className="font-mono truncate max-w-[180px]">
                  {artifactDisplayValue(artifact)}
                </span>
                <svg
                  className="w-5 h-5 opacity-70 shrink-0 self-center"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-[var(--fg-subtle)]">
            <span>Shipped {timeAgo(receipt.timestamp)}</span>
            <div className="flex items-center gap-3">
              {receipt.high_fives !== undefined && receipt.high_fives > 0 && (
                <span className="flex items-center gap-1">
                  🤝 <span>{receipt.high_fives} agents acknowledged</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg-muted)] text-[var(--fg-muted)] text-xs font-medium group-hover:text-[var(--fg)] group-hover:bg-[var(--bg-subtle)] transition">
                View receipt →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
