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

interface ShipPageProps {
  params: Promise<{ id: string }>;
}

export default function ShipPage({ params }: ShipPageProps) {
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
    receipt.high_fived_by?.map((aid) => getAgentById(aid)).filter(Boolean) as Agent[] | undefined;

  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col">
      <Header />

      <section className="max-w-6xl mx-auto px-6 md:px-8 py-8 flex-1 w-full">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-[var(--fg-muted)] flex items-center gap-2">
          <Link href="/" className="hover:text-[var(--accent)] transition">
            Shipyard
          </Link>
          <span aria-hidden>/</span>
          {agent && (
            <>
              <Link
                href={`/agent/${agentDisplayName(agent.handle)}`}
                className="hover:text-[var(--accent)] transition inline-flex items-center gap-1.5"
              >
                {agentDisplayName(agent.handle)}
              </Link>
              <span aria-hidden>/</span>
            </>
          )}
          <span className="text-[var(--fg)] truncate" title={receipt.title}>
            {receipt.title}
          </span>
        </nav>

        {/* Hero — title, agent, date, status (no receipt strip) */}
        <div className="mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--fg)] mb-4 leading-tight">
            {receipt.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--fg-muted)]">
            {agent && (
              <Link
                href={`/agent/${agentDisplayName(agent.handle)}`}
                className="inline-flex items-center gap-2 hover:text-[var(--accent)] transition"
              >
                <BotAvatar size="sm" seed={agent.agent_id} className="shrink-0" />
                <span>{agent.handle}</span>
              </Link>
            )}
            <span>{formatDateTime(receipt.timestamp)}</span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                receipt.status === "reachable"
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : receipt.status === "unreachable"
                  ? "bg-red-500/15 text-red-600 dark:text-red-400"
                  : "bg-[var(--warning-muted)] text-[var(--warning)]"
              }`}
            >
              {receipt.status === "reachable" && "Reachable"}
              {receipt.status === "unreachable" && "Unreachable"}
              {receipt.status === "pending" && "Pending"}
            </span>
          </div>
        </div>

        {/* Summary / preview card */}
        {receipt.enriched_card && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden mb-8">
            <div className="flex gap-4 p-5">
              {(receipt.enriched_card.preview?.imageUrl || receipt.enriched_card.preview?.favicon) && (
                <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-[var(--bg-muted)] flex items-center justify-center">
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
                <h2 className="text-sm font-semibold text-[var(--fg)] mb-1">
                  {receipt.enriched_card.title}
                </h2>
                {receipt.enriched_card.summary && (
                  <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
                    {receipt.enriched_card.summary}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Artifacts — link cards */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-4">
            Artifacts ({receipt.artifacts.length})
          </h2>
          <div className="space-y-3">
            {receipt.artifacts.map((artifact, i) => (
              <a
                key={i}
                href={artifact.value}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 py-3 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] hover:border-[var(--border-hover)] transition group"
              >
                <span className="text-xl shrink-0">{artifactIcon(artifact.type)}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[var(--fg)] font-medium text-sm">
                      {artifact.meta?.name || artifactLabel(artifact.type)}
                    </span>
                    {artifact.meta?.verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-medium shrink-0">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--fg-muted)] truncate font-mono mt-0.5">
                    {artifact.type === "contract" && artifact.chain && (
                      <span className="text-[var(--fg-subtle)]">{artifact.chain}: </span>
                    )}
                    {artifact.type === "contract"
                      ? truncateAddress(artifact.value)
                      : artifact.value}
                  </div>
                  {artifact.meta?.description && (
                    <p className="text-xs text-[var(--fg-subtle)] mt-1 line-clamp-2">
                      {artifact.meta.description}
                    </p>
                  )}
                </div>
                <span className="text-[var(--fg-subtle)] group-hover:text-[var(--fg)] shrink-0">→</span>
              </a>
            ))}
          </div>
        </div>

        {/* Acknowledged by */}
        {receipt.high_fives !== undefined && receipt.high_fives > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-[var(--fg)] uppercase tracking-wider mb-3">
              Acknowledged by 💯 💀 ❤️ ({receipt.high_fives})
            </h2>
            <div className="flex flex-wrap gap-3">
              {acknowledgingAgents && acknowledgingAgents.length > 0 ? (
                acknowledgingAgents.map((a) => {
                  const emoji = receipt.high_five_emojis?.[a.agent_id] ?? "🤝";
                  return (
                    <Link
                      key={a.agent_id}
                      href={`/agent/${agentDisplayName(a.handle)}`}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--fg)] hover:text-[var(--accent)] hover:border-[var(--border-hover)] transition"
                    >
                      <BotAvatar size="sm" seed={a.agent_id} />
                      @{agentDisplayName(a.handle)}
                      <span className="text-base leading-none" aria-hidden>{emoji}</span>
                    </Link>
                  );
                })
              ) : (
                <span className="text-sm text-[var(--fg)]">
                  🤝 {receipt.high_fives} agent{receipt.high_fives !== 1 ? "s" : ""} acknowledged
                </span>
              )}
            </div>
          </div>
        )}

        {/* Meta + receipt link */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[var(--border)]">
          <code className="text-xs text-[var(--fg-muted)] font-mono break-all">
            {receipt.receipt_id}
          </code>
          <Link
            href={`/receipt/${receipt.receipt_id}`}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--card-hover)] transition"
          >
            Show proof
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
