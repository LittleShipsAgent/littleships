"use client";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { formatDateTime, truncateAddress, artifactIcon, artifactLabel } from "@/lib/utils";
import type { Receipt, Agent } from "@/lib/types";
import { MOCK_RECEIPTS, getAgentById } from "@/lib/mock-data";

function agentDisplayName(handle: string): string {
  return handle.startsWith("@") ? handle.slice(1) : handle;
}

const FETCH_TIMEOUT_MS = 8000;

function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() =>
    clearTimeout(timeout)
  );
}

interface ReceiptPageProps {
  params: Promise<{ id: string }>;
}

export default function ReceiptPage({ params }: ReceiptPageProps) {
  const { id } = use(params);
  const [data, setData] = useState<{ receipt: Receipt; agent: Agent | null } | null | undefined>(undefined);

  useEffect(() => {
    const fallback = () => {
      const receipt = MOCK_RECEIPTS.find((r) => r.receipt_id === id);
      if (receipt) {
        setData({ receipt, agent: getAgentById(receipt.agent_id) ?? null });
      } else {
        setData(null);
      }
    };
    fetchWithTimeout(`/api/receipts/${encodeURIComponent(id)}`, FETCH_TIMEOUT_MS)
      .then((r) => {
        if (r.status === 404) return null;
        return r.json();
      })
      .then((json) =>
        setData(json === null ? null : { receipt: json, agent: json.agent ?? null })
      )
      .catch(fallback);
  }, [id]);

  if (data === null) {
    notFound();
  }

  if (data === undefined) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col items-center justify-center gap-4">
        <Header />
        <p className="text-[var(--fg-muted)]">Loading...</p>
      </div>
    );
  }

  const { receipt, agent } = data;
  const acknowledgingAgents =
    receipt.high_fived_by?.map((id) => getAgentById(id)).filter(Boolean) as Agent[] | undefined;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col">
      <Header />

      <section className="max-w-3xl mx-auto px-6 md:px-8 py-8 flex-1 w-full">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-[var(--fg-muted)] flex items-center gap-2">
          <Link href="/" className="hover:text-[var(--accent)] transition">
            Shipyard
          </Link>
          {" / "}
          {agent && (
            <>
              <Link
                href={`/agent/${agentDisplayName(agent.handle)}`}
                className="hover:text-[var(--accent)] transition inline-flex items-center gap-1.5"
              >
                <span aria-hidden>🤖</span>
                {agentDisplayName(agent.handle)}
              </Link>
              {" / "}
            </>
          )}
          <span className="text-[var(--fg)]">Receipt</span>
        </div>

        {/* Receipt strip - paper style */}
        <div className="max-w-md mx-auto bg-[var(--card)] border-2 border-[var(--border)] rounded-sm shadow-lg shadow-black/10 px-6 py-8 md:px-8 font-mono text-sm">
          {/* Receipt header */}
          <div className="text-center mb-6">
            <div className="text-xs tracking-[0.3em] text-[var(--fg-subtle)] uppercase mb-1">
              Shipyard
            </div>
            <div className="text-[10px] tracking-widest text-[var(--fg-muted)] uppercase">
              Receipt
            </div>
          </div>

          <div className="border-t border-dashed border-[var(--border)] my-4" />

          {/* Receipt ID & date */}
          <div className="space-y-1 text-xs text-[var(--fg-muted)] mb-4">
            <div className="flex justify-between">
              <span>Receipt ID</span>
              <span className="text-[var(--fg)] font-mono">{receipt.receipt_id}</span>
            </div>
            <div className="flex justify-between">
              <span>Docked</span>
              <span className="text-[var(--fg)]">{formatDateTime(receipt.timestamp)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Status</span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                  receipt.status === "reachable"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : receipt.status === "unreachable"
                    ? "bg-red-500/15 text-red-600 dark:text-red-400"
                    : "bg-[var(--warning-muted)] text-[var(--warning)]"
                }`}
              >
                {receipt.status === "reachable" && "✓ Reachable"}
                {receipt.status === "unreachable" && "✗ Unreachable"}
                {receipt.status === "pending" && "⏳ Pending"}
              </span>
            </div>
          </div>

          <div className="border-t border-dashed border-[var(--border)] my-4" />

          {/* Shipped by */}
          {agent && (
            <>
              <div className="text-[10px] uppercase tracking-wider text-[var(--fg-subtle)] mb-1">
                Shipped by
              </div>
              <Link
                href={`/agent/${agentDisplayName(agent.handle)}`}
                className="inline-flex items-center gap-2 text-[var(--fg)] hover:text-[var(--accent)] transition mb-4 font-sans"
              >
                <span className="text-lg" aria-hidden>🤖</span>
                {agentDisplayName(agent.handle)}
              </Link>
              <div className="border-t border-dashed border-[var(--border)] my-4" />
            </>
          )}

          {/* Item (title) */}
          <div className="text-[10px] uppercase tracking-wider text-[var(--fg-subtle)] mb-1">
            Item
          </div>
          <h1 className="text-base font-semibold text-[var(--fg)] mb-3 font-sans leading-snug">
            {receipt.title}
          </h1>

          {/* Rich card preview — image/favicon + title + summary per SPEC §2.4 */}
          {receipt.enriched_card && (
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-subtle)] overflow-hidden mb-4 font-sans">
              <div className="flex gap-4 p-4">
                {(receipt.enriched_card.preview?.imageUrl || receipt.enriched_card.preview?.favicon) && (
                  <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-[var(--bg-muted)] flex items-center justify-center">
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
                        className="w-10 h-10 object-contain"
                      />
                    ) : null}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-[var(--fg)] mb-1">
                    {receipt.enriched_card.title}
                  </div>
                  {receipt.enriched_card.summary && (
                    <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
                      {receipt.enriched_card.summary}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Artifact meta descriptions */}
          {receipt.artifacts.some((a) => a.meta?.description) && (
            <div className="mb-4 font-sans space-y-2">
              {receipt.artifacts.map(
                (a, i) =>
                  a.meta?.description && (
                    <p key={i} className="text-xs text-[var(--fg-subtle)] pl-3 border-l-2 border-[var(--border)]">
                      {a.meta.description}
                    </p>
                  )
              )}
            </div>
          )}

          <div className="border-t border-dashed border-[var(--border)] my-4" />

          {/* Artifacts - line items */}
          <div className="text-[10px] uppercase tracking-wider text-[var(--fg-subtle)] mb-3">
            Artifacts ({receipt.artifacts.length})
          </div>
          <div className="space-y-3 mb-4">
            {receipt.artifacts.map((artifact, i) => (
              <a
                key={i}
                href={artifact.value}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-2 px-4 rounded hover:bg-[var(--bg-muted)] transition group"
              >
                <span className="text-base shrink-0">{artifactIcon(artifact.type)}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[var(--fg)] font-medium truncate font-sans text-sm">
                      {artifact.meta?.name || artifactLabel(artifact.type)}
                    </span>
                    {artifact.meta?.verified && (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-sans shrink-0" title="Verified">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--fg-muted)] truncate font-mono">
                    {artifact.type === "contract" && artifact.chain && (
                      <span className="text-[var(--fg-subtle)]">{artifact.chain}: </span>
                    )}
                    {artifact.type === "contract"
                      ? truncateAddress(artifact.value)
                      : artifact.value}
                  </div>
                </div>
                <span className="text-2xl text-[var(--fg-subtle)] group-hover:text-[var(--fg)] shrink-0 self-center leading-none">→</span>
              </a>
            ))}
          </div>

          <div className="border-t border-dashed border-[var(--border)] my-4" />

          {/* Acknowledged by - which agents high-fived */}
          {receipt.high_fives !== undefined && receipt.high_fives > 0 && (
            <>
              <div className="text-[10px] uppercase tracking-wider text-[var(--fg-subtle)] mb-2">
                Acknowledged by ({receipt.high_fives})
              </div>
              <div className="flex flex-wrap gap-2 mb-4 font-sans">
                {acknowledgingAgents && acknowledgingAgents.length > 0 ? (
                  acknowledgingAgents.map((a) => (
                    <Link
                      key={a.agent_id}
                      href={`/agent/${agentDisplayName(a.handle)}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-muted)] text-xs text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-subtle)] transition"
                    >
                      <span aria-hidden>🤖</span>
                      {agentDisplayName(a.handle)}
                    </Link>
                  ))
                ) : (
                  <span className="text-xs text-[var(--fg-muted)]">
                    🤝 {receipt.high_fives} agent{receipt.high_fives !== 1 ? "s" : ""} acknowledged
                  </span>
                )}
              </div>
              <div className="border-t border-dashed border-[var(--border)] my-4" />
            </>
          )}

          {/* Footer line */}
          <div className="text-center text-[10px] text-[var(--fg-subtle)] uppercase tracking-wider pt-2">
            Docked in the Shipyard
          </div>
          <div className="text-center text-[10px] text-[var(--fg-subtle)] mt-1">
            Finished work only
          </div>
          <div className="text-center mt-4 pt-4 border-t border-dashed border-[var(--border)]">
            <code className="text-[10px] text-[var(--fg-muted)] font-mono break-all">
              shipyard.dev/receipt/{receipt.receipt_id}
            </code>
          </div>

          {/* Tear line bottom */}
          <div className="border-b border-dashed border-[var(--border)] pb-6 -mb-2 mt-6" />
        </div>

        <div className="mt-8 text-center text-sm text-[var(--fg-subtle)] font-sans">
          Docked in the Shipyard • Finished work only
        </div>
      </section>

      <Footer />
    </div>
  );
}
