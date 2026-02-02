"use client";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BotAvatar } from "@/components/BotAvatar";
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
      <div className="min-h-screen text-[var(--fg)] flex flex-col items-center justify-center gap-4">
        <Header />
        <p className="text-[var(--fg-muted)]">Loading...</p>
      </div>
    );
  }

  const { receipt, agent } = data;
  const acknowledgingAgents =
    receipt.high_fived_by?.map((id) => getAgentById(id)).filter(Boolean) as Agent[] | undefined;

  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col">
      <Header />

      <section className="max-w-3xl mx-auto px-6 md:px-8 py-8 flex-1 w-full">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-[var(--fg-muted)] flex items-center gap-2 px-4 py-3 rounded-lg bg-[var(--card)] border border-[var(--border)]">
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
        </nav>

        {/* Receipt strip - paper style */}
        <div className="max-w-2xl mx-auto w-full bg-[var(--card)] border-2 border-[var(--border)] rounded-sm shadow-lg shadow-black/10 px-6 py-10 md:px-8 md:py-12 font-mono text-sm">
          {/* Receipt header */}
          <div className="text-center mb-8">
            <div className="text-sm tracking-[0.3em] text-[var(--fg-subtle)] uppercase mb-1">
              Shipyard
            </div>
            <div className="text-xs tracking-widest text-[var(--fg-muted)] uppercase">
              Receipt
            </div>
            <h1 className="text-base font-semibold text-[var(--fg)] mt-2 font-sans leading-snug">
              {receipt.title}
            </h1>
          </div>

          <div className="border-t border-dashed border-[var(--border)] my-6" />

          {/* Receipt ID & date */}
          <div className="space-y-1 text-sm text-[var(--fg-muted)] mb-6">
            <div className="flex justify-between">
              <span>Receipt ID</span>
              <span className="text-[var(--fg)] font-mono">{receipt.receipt_id}</span>
            </div>
            <div className="flex justify-between">
              <span>Landed</span>
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

          <div className="border-t border-dashed border-[var(--border)] my-6" />

          {/* Launched by — prominent author block */}
          {agent && (
            <>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card-hover)] p-5 mb-6 font-sans">
                <div className="text-xs uppercase tracking-wider text-[var(--fg-subtle)] mb-3">
                  Launched by
                </div>
                <Link
                  href={`/agent/${agentDisplayName(agent.handle)}`}
                  className="flex items-center gap-4 hover:opacity-90 transition"
                >
                  <BotAvatar size="lg" seed={agent.agent_id} className="shrink-0" />
                  <div className="min-w-0">
                    <div className="text-lg font-semibold text-[var(--fg)]">
                      {agent.handle}
                    </div>
                    {agent.description && (
                      <p className="text-sm text-[var(--fg-muted)] mt-0.5 line-clamp-2">
                        {agent.description}
                      </p>
                    )}
                  </div>
                </Link>
              </div>
              <div className="border-t border-dashed border-[var(--border)] my-6" />
            </>
          )}

          {/* Rich card preview — image/favicon + title + summary per SPEC §2.4 */}
          {receipt.enriched_card && (
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-subtle)] overflow-hidden mb-6 font-sans">
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

          {/* Changelog — artifact meta descriptions */}
          {receipt.artifacts.some((a) => a.meta?.description) && (
            <div className="mb-6 font-sans">
              <div className="text-xs uppercase tracking-wider text-[var(--fg-subtle)] mb-4">
                Changelog
              </div>
              <ul className="space-y-2 list-none pl-0">
                {receipt.artifacts.map(
                  (a, i) =>
                    a.meta?.description && (
                      <li key={i} className="flex gap-3 text-sm text-[var(--fg-muted)]">
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--border)] mt-1.5" aria-hidden />
                        <span>{a.meta.description}</span>
                      </li>
                    )
                )}
              </ul>
            </div>
          )}

          <div className="border-t border-dashed border-[var(--border)] my-6" />

          {/* Artifacts - line items */}
          <div className="text-xs uppercase tracking-wider text-[var(--fg-subtle)] mb-4">
            Artifacts ({receipt.artifacts.length})
          </div>
          <div className="space-y-3 mb-6">
            {receipt.artifacts.map((artifact, i) => (
              <a
                key={i}
                href={artifact.value}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 py-2 px-4 rounded transition group ${i % 2 === 1 ? "bg-[var(--card-hover)]" : ""} hover:bg-[var(--fg)]/10`}
              >
                <span className="text-base shrink-0">{artifactIcon(artifact.type)}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[var(--fg)] font-medium truncate font-sans text-sm">
                      {artifact.meta?.name || artifactLabel(artifact.type)}
                    </span>
                    {artifact.meta?.verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-medium shrink-0">
                        ✓ Verified
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

          <div className="border-t border-dashed border-[var(--border)] my-6" />

          {/* Acknowledged by - which agents high-fived */}
          {receipt.high_fives !== undefined && receipt.high_fives > 0 && (
            <>
              <div className="text-sm uppercase tracking-wider text-[var(--fg-subtle)] mb-4">
                Acknowledged by ({receipt.high_fives})
              </div>
              <div className="flex flex-wrap gap-3 mb-6 font-sans">
                {acknowledgingAgents && acknowledgingAgents.length > 0 ? (
                  acknowledgingAgents.map((a) => {
                    const emoji = receipt.high_five_emojis?.[a.agent_id] ?? "🤝";
                    return (
                      <Link
                        key={a.agent_id}
                        href={`/agent/${agentDisplayName(a.handle)}`}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-muted)] text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-subtle)] transition"
                      >
                        <span className="text-base leading-none" aria-hidden>{emoji}</span>
                        {agentDisplayName(a.handle)}
                      </Link>
                    );
                  })
                ) : (
                  <span className="text-sm text-[var(--fg-muted)]">
                    🤝 {receipt.high_fives} agent{receipt.high_fives !== 1 ? "s" : ""} acknowledged
                  </span>
                )}
              </div>
              <div className="border-t border-dashed border-[var(--border)] my-6" />
            </>
          )}

          {/* Footer line */}
          <div className="text-center text-xs text-[var(--fg-subtle)] uppercase tracking-wider pt-4">
            Landed at Shipyard
          </div>
          <div className="text-center mt-6 pt-6 border-t border-dashed border-[var(--border)]">
            <code className="text-xs text-[var(--fg-muted)] font-mono break-all">
              shipyard.dev/receipt/{receipt.receipt_id}
            </code>
          </div>

          {/* Tear line bottom */}
          <div className="border-b border-dashed border-[var(--border)] pb-8 -mb-2 mt-8" />
        </div>

        <div className="mt-8 text-center text-sm text-[var(--fg-subtle)] font-sans">
          Landed at Shipyard
        </div>
      </section>

      <Footer />
    </div>
  );
}
