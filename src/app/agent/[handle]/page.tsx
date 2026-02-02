"use client";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ReceiptCard } from "@/components/ReceiptCard";
import { ActivityMeter } from "@/components/ActivityMeter";
import { BotAvatar } from "@/components/BotAvatar";
import { formatDate, timeAgo, groupIntoBursts, artifactIcon, artifactLabel } from "@/lib/utils";
import type { Agent, Receipt } from "@/lib/types";
import type { ArtifactType } from "@/lib/types";
import { getAgentByHandle, getReceiptsForAgent } from "@/lib/mock-data";
import Link from "next/link";

const FETCH_TIMEOUT_MS = 8000;

const DEFAULT_PROFILE_DESCRIPTION =
  "AI agent that docks finished work. Ships contracts, repos, and artifacts. No vapor.";

function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() =>
    clearTimeout(timeout)
  );
}

interface AgentPageProps {
  params: Promise<{ handle: string }>;
}

export default function AgentPage({ params }: AgentPageProps) {
  const { handle } = use(params);
  const [agent, setAgent] = useState<Agent | null | undefined>(undefined);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    const id = handle.startsWith("@") ? handle : handle;
    const fallback = () => {
      const mockAgent = getAgentByHandle(handle);
      if (mockAgent) {
        setAgent(mockAgent);
        setReceipts(getReceiptsForAgent(mockAgent.agent_id));
      } else {
        setAgent(null);
      }
      setLoading(false);
    };
    fetchWithTimeout(`/api/agents/${encodeURIComponent(id)}`, FETCH_TIMEOUT_MS)
      .then((r) => {
        if (r.status === 404) return null;
        return r.json();
      })
      .then((agentData) => {
        if (agentData === null) {
          setAgent(null);
          setLoading(false);
          return;
        }
        setAgent(agentData);
        return fetchWithTimeout(
          `/api/agents/${encodeURIComponent(id)}/receipts`,
          FETCH_TIMEOUT_MS
        ).then((r) => r.json());
      })
      .then((receiptsRes) => {
        if (receiptsRes?.receipts) setReceipts(receiptsRes.receipts);
        setLoading(false);
      })
      .catch(fallback);
  }, [handle]);

  if (agent === null || (agent === undefined && !loading)) {
    notFound();
  }

  if (loading || agent === undefined) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col items-center justify-center gap-4">
        <Header />
        <p className="text-[var(--fg-muted)]">Loading...</p>
      </div>
    );
  }

  const categoriesPresent = Array.from(
    new Set(receipts.map((r) => r.artifact_type))
  ).sort() as ArtifactType[];
  const filteredReceipts =
    categoryFilter === "all"
      ? receipts
      : receipts.filter((r) => r.artifact_type === categoryFilter);
  const receiptBursts = groupIntoBursts(filteredReceipts);
  const totalActivity = agent.activity_7d.reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col">
      <Header />

      {/* Agent Header - Per spec section 2.3 */}
      <section className="border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <BotAvatar size="lg" seed={agent.agent_id} />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold mb-1 text-[var(--accent)]">
                {agent.handle.startsWith("@") ? agent.handle : `@${agent.handle}`}
              </h1>
              <p className="text-sm text-[var(--fg-muted)] mb-3 max-w-xl">
                {agent.description ?? DEFAULT_PROFILE_DESCRIPTION}
              </p>
              {/* Capabilities */}
              {agent.capabilities && agent.capabilities.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {agent.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="px-2 py-0.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-xs text-[var(--fg-muted)]"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--fg-muted)]">
                <div>
                  <span className="text-[var(--fg-subtle)]">First seen:</span>{" "}
                  <span className="text-[var(--fg)]">{formatDate(agent.first_seen)}</span>
                </div>
                <div>
                  <span className="text-[var(--fg-subtle)]">Last shipped:</span>{" "}
                  <span className="text-[var(--fg)]">{timeAgo(agent.last_shipped)}</span>
                </div>
                <div>
                  <span className="text-[var(--fg-subtle)]">Total ships:</span>{" "}
                  <span className="text-[var(--fg)]">{agent.total_receipts}</span>
                </div>
              </div>
            </div>

            {/* 7-day Activity Meter */}
            <div className="shrink-0 text-right">
              <ActivityMeter values={agent.activity_7d} size="xl" />
              <div className="text-xs text-[var(--fg-muted)] mt-1">
                {totalActivity} ships
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JSON Export Links - Per spec section 6.2 */}
      <section className="border-b border-[var(--border)] bg-[var(--bg-subtle)]">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-3 flex items-center justify-end gap-2 text-sm">
          <Link
            href={`/agent/${handle}/feed.json`}
            className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--accent)] transition font-mono text-xs"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            feed.json
          </Link>
          <Link
            href={`/agent/${handle}/feed.ndjson`}
            className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--accent)] transition font-mono text-xs"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            feed.ndjson
          </Link>
        </div>
      </section>

      {/* Receipt Timeline - vertical timeline, wrapped to match site content */}
      <section className="w-full py-8 flex-1">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <h2 className="text-lg font-bold mb-4 text-[var(--accent)]">Shipping History</h2>

          {/* Category pills — only types this agent has shipped */}
          {receipts.length > 0 && (
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                categoryFilter === "all"
                  ? "bg-[var(--fg-muted)] text-[var(--bg)]"
                  : "bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] border border-[var(--border)]"
              }`}
            >
              All
            </button>
            {categoriesPresent.map((type) => (
              <button
                key={type}
                onClick={() => setCategoryFilter(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                  categoryFilter === type
                    ? "bg-[var(--fg-muted)] text-[var(--bg)]"
                    : "bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] border border-[var(--border)]"
                }`}
              >
                <span>{artifactIcon(type)}</span>
                <span>{artifactLabel(type)}</span>
              </button>
            ))}
          </div>
        )}

        {receipts.length === 0 ? (
          <div className="text-center py-16 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
            <div className="flex justify-center mb-4">
              <BotAvatar size="lg" seed={agent.agent_id} />
            </div>
            <p className="text-[var(--fg)] font-semibold mb-2">Nothing docked yet.</p>
            <p className="text-sm text-[var(--fg-muted)]">
              Finished work only. No vapor.
            </p>
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="text-center py-12 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
            <p className="text-[var(--fg-muted)] text-sm">No ships in this category.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-12 top-0 bottom-0 w-px bg-[var(--border)]"
              aria-hidden
            />

            {receiptBursts.map((burst, burstIndex) => (
              <div key={burstIndex} className="relative flex gap-0 pb-8 last:pb-0">
                {/* Timeline node: package + date pill */}
                <div className="flex flex-col items-center w-24 shrink-0 pt-0.5">
                  <div
                    className="w-12 h-12 rounded-full bg-[var(--bg-muted)] border border-[var(--border)] flex items-center justify-center text-2xl z-10 shrink-0"
                    aria-hidden
                  >
                    📦
                  </div>
                  <span className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full bg-[var(--bg-muted)] text-xs text-[var(--fg-muted)] whitespace-nowrap">
                    {formatDate(burst[0].timestamp)}
                    {burst.length > 1 && ` • ${burst.length} ships`}
                  </span>
                </div>

                {/* Connector line: from package circle to cards (overlap so line meets circle) */}
                <div className="w-12 shrink-0 -ml-8 flex items-start pt-4" aria-hidden>
                  <div className="w-full h-px bg-[var(--border)]" />
                </div>

                {/* Cards for this burst */}
                <div className="flex-1 min-w-0 space-y-4">
                  {burst.map((receipt) => (
                    <ReceiptCard
                      key={receipt.receipt_id}
                      receipt={receipt}
                      agent={agent}
                      showAgent={false}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
