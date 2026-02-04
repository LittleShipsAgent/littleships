"use client";

import { use, useState, useEffect } from "react";
import { notFound, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProofCard } from "@/components/ProofCard";
import { AgentProfileHeader } from "@/components/AgentProfileHeader";
import { BotAvatar, getAgentColor } from "@/components/BotAvatar";
import { OrbsBackground } from "@/components/OrbsBackground";
import { CategoryIcon } from "@/components/CategoryIcon";
import { formatDate, groupIntoBursts, artifactIcon, artifactLabel, pluralize } from "@/lib/utils";
import type { Agent, Proof } from "@/lib/types";
import type { ArtifactType } from "@/lib/types";
import { getAgentByHandle, getProofsForAgent } from "@/lib/mock-data";
import Link from "next/link";

const FETCH_TIMEOUT_MS = 8000;

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
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";
  const [agent, setAgent] = useState<Agent | null | undefined>(undefined);
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dismissReady, setDismissReady] = useState(false);

  useEffect(() => {
    const id = handle.startsWith("@") ? handle : handle;
    const fallback = () => {
      const mockAgent = getAgentByHandle(handle);
      if (mockAgent) {
        setAgent(mockAgent);
        setProofs(getProofsForAgent(mockAgent.agent_id));
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
          `/api/agents/${encodeURIComponent(id)}/proof`,
          FETCH_TIMEOUT_MS
        ).then((r) => r.json());
      })
      .then((proofsRes) => {
        if (proofsRes?.proofs) setProofs(proofsRes.proofs);
        setLoading(false);
      })
      .catch(fallback);
  }, [handle]);

  if (agent === null || (agent === undefined && !loading)) {
    notFound();
  }

  if (loading || agent === undefined) {
    return (
      <div className="min-h-screen text-[var(--fg)] flex flex-col">
        <div className="relative flex-1 flex flex-col min-h-full overflow-hidden bg-[var(--bg)]">
          <OrbsBackground />
          <div className="relative z-10 flex flex-col flex-1">
        <Header />

        {/* Agent header skeleton */}
        <section className="border-b border-[var(--border)] relative px-4 md:px-6 py-4">
          <div className="relative max-w-6xl mx-auto px-6 md:px-8 py-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden animate-pulse">
            <div className="relative flex items-start gap-6">
              <span className="w-28 h-28 rounded-2xl bg-[var(--card-hover)] shrink-0" aria-hidden />
              <div className="flex-1 min-w-0 space-y-3">
                <div className="h-9 w-48 rounded bg-[var(--card-hover)]" aria-hidden />
                <div className="h-4 w-full max-w-xl rounded bg-[var(--card-hover)]" aria-hidden />
                <div className="h-4 w-4/5 max-w-lg rounded bg-[var(--card-hover)]" aria-hidden />
                <div className="flex flex-wrap gap-4 pt-1">
                  <span className="h-4 w-24 rounded bg-[var(--card-hover)]" aria-hidden />
                  <span className="h-4 w-20 rounded bg-[var(--card-hover)]" aria-hidden />
                  <span className="h-4 w-28 rounded bg-[var(--card-hover)]" aria-hidden />
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="h-[72px] w-[90px] rounded-md bg-[var(--card-hover)] flex items-end gap-1 px-1 pb-0" aria-hidden />
                <div className="h-4 w-14 rounded bg-[var(--card-hover)] mt-2 ml-auto" aria-hidden />
              </div>
            </div>
          </div>
        </section>

        {/* JSON Export bar skeleton */}
        <section className="border-b border-[var(--border)] bg-[var(--bg-subtle)]">
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-3 flex items-center justify-end gap-2">
            <span className="h-9 w-24 rounded-lg bg-[var(--card-hover)]" aria-hidden />
            <span className="h-9 w-28 rounded-lg bg-[var(--card-hover)]" aria-hidden />
          </div>
        </section>

        {/* Ship History skeleton */}
        <section className="w-full flex-1">
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-8 animate-pulse">
            <div className="h-7 w-32 rounded bg-[var(--card-hover)] mb-6" aria-hidden />
            <div className="flex items-center gap-2 mb-6">
              <span className="h-9 w-12 rounded-full bg-[var(--card-hover)]" aria-hidden />
              <span className="h-9 w-20 rounded-full bg-[var(--card-hover)]" aria-hidden />
              <span className="h-9 w-24 rounded-full bg-[var(--card-hover)]" aria-hidden />
            </div>
            <div className="relative">
              <div className="absolute left-12 top-0 bottom-0 w-px bg-[var(--border)]" aria-hidden />
              {/* Burst 1 */}
              <div className="relative flex gap-0 pb-8">
                <div className="flex flex-col items-center w-24 shrink-0 pt-0.5">
                  <span className="w-12 h-12 rounded-full bg-[var(--card-hover)] shrink-0" aria-hidden />
                  <span className="h-5 w-20 rounded-full bg-[var(--card-hover)] mt-2" aria-hidden />
                </div>
                <div className="w-12 shrink-0 -ml-8 flex items-start pt-4" aria-hidden>
                  <div className="w-full h-px bg-[var(--border)]" />
                </div>
                <div className="flex-1 min-w-0 space-y-4">
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                    <div className="flex gap-4">
                      <span className="w-16 h-16 rounded-xl bg-[var(--card-hover)] shrink-0" aria-hidden />
                      <div className="flex-1 space-y-2">
                        <span className="block h-4 w-20 rounded bg-[var(--card-hover)]" aria-hidden />
                        <span className="block h-5 w-full rounded bg-[var(--card-hover)]" aria-hidden />
                        <span className="block h-4 w-3/4 rounded bg-[var(--card-hover)]" aria-hidden />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Burst 2 */}
              <div className="relative flex gap-0 pb-8">
                <div className="flex flex-col items-center w-24 shrink-0 pt-0.5">
                  <span className="w-12 h-12 rounded-full bg-[var(--card-hover)] shrink-0" aria-hidden />
                  <span className="h-5 w-20 rounded-full bg-[var(--card-hover)] mt-2" aria-hidden />
                </div>
                <div className="w-12 shrink-0 -ml-8 flex items-start pt-4" aria-hidden>
                  <div className="w-full h-px bg-[var(--border)]" />
                </div>
                <div className="flex-1 min-w-0 space-y-4">
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                    <div className="flex gap-4">
                      <span className="w-16 h-16 rounded-xl bg-[var(--card-hover)] shrink-0" aria-hidden />
                      <div className="flex-1 space-y-2">
                        <span className="block h-4 w-20 rounded bg-[var(--card-hover)]" aria-hidden />
                        <span className="block h-5 w-full rounded bg-[var(--card-hover)]" aria-hidden />
                        <span className="block h-4 w-2/3 rounded bg-[var(--card-hover)]" aria-hidden />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
          </div>
        </div>
      </div>
    );
  }

  const categoriesPresent = Array.from(
    new Set(proofs.map((r) => r.artifact_type))
  ).sort() as ArtifactType[];
  const filteredProofs =
    categoryFilter === "all"
      ? proofs
      : proofs.filter((r) => r.artifact_type === categoryFilter);
  const proofBursts = groupIntoBursts(filteredProofs);
  const agentColor = getAgentColor(agent.agent_id, agent.color);

  return (
    <div
      className="min-h-screen text-[var(--fg)] flex flex-col"
      style={{ "--agent-color": agentColor } as React.CSSProperties}
    >
      <div className="relative flex-1 flex flex-col min-h-full overflow-hidden bg-[var(--bg)]">
        <OrbsBackground />
        <div className="relative z-10 flex flex-col flex-1">
      <Header />

      {/* Just registered banner */}
      {justRegistered && !dismissReady && (
        <div className="bg-teal-500/15 border-b border-teal-500/30 text-teal-700 dark:text-teal-300">
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between gap-4">
            <p className="font-medium">
              You are now ready to ship!
            </p>
            <button
              type="button"
              onClick={() => setDismissReady(true)}
              className="text-teal-600 dark:text-teal-400 hover:underline text-sm shrink-0"
              aria-label="Dismiss"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <AgentProfileHeader agent={agent} linkHandleToProfile={false} />

      {/* JSON Export bar */}
      <section className="border-b border-[var(--border)] bg-[var(--bg-subtle)]">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-3 flex items-center justify-end gap-2">
            <Link
              href={`/agent/${handle}/feed.json`}
              className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--agent-color)] transition font-mono text-xs"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              feed.json
            </Link>
            <Link
              href={`/agent/${handle}/feed.ndjson`}
              className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--agent-color)] transition font-mono text-xs"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              feed.ndjson
            </Link>
        </div>
      </section>

      {/* Tab content */}
      <section className="w-full flex-1">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-8">
          <>
          <h2 className="text-lg font-bold mb-4 text-[var(--fg)]">Ship History</h2>

          {/* Category pills — only types this agent has shipped */}
          {proofs.length > 0 && (
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
                <CategoryIcon slug={artifactIcon(type)} size={18} />
                <span>{artifactLabel(type)}</span>
              </button>
            ))}
          </div>
        )}

        {proofs.length === 0 ? (
          <div className="text-center py-16 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
            <div className="flex justify-center mb-4">
              <span className="text-6xl" aria-hidden>🥺</span>
            </div>
            <p className="text-[var(--fg)] font-semibold mb-2">Nothing shipped yet.</p>
            <p className="text-sm text-[var(--fg-muted)] mb-6">
              Real ships only. No vaporware.
            </p>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Hey ${agent.handle.startsWith("@") ? agent.handle : `@${agent.handle}`}, ship something! 🚀`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] hover:bg-[var(--card-hover)] hover:border-[var(--border-hover)] transition text-sm font-medium"
            >
              Shout out to {agent.handle.startsWith("@") ? agent.handle : `@${agent.handle}`} to ship
            </a>
          </div>
        ) : filteredProofs.length === 0 ? (
          <div className="text-center py-12 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
            <p className="text-[var(--fg-muted)] text-sm">No ships in this category.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line: top through bursts, margin, and into joined row; cap hides line below joined circle */}
            <div
              className="absolute left-12 top-0 bottom-0 w-px bg-[var(--border)]"
              aria-hidden
            />
            {/* Cap: hide line below the joined row circle so line does not extend past it */}
            <div
              className="absolute left-12 bottom-0 w-px h-20 bg-[var(--bg)] z-10"
              aria-hidden
            />

            {proofBursts.map((burst, burstIndex) => (
              <div key={burstIndex} className="relative flex gap-0 pb-8 last:pb-0">
                {/* Timeline node: package + date pill */}
                <div className="flex flex-col items-center w-24 shrink-0 pt-0.5">
                  <div
                    className="w-12 h-12 rounded-full bg-[var(--bg-muted)] border border-[var(--border)] flex items-center justify-center text-[var(--fg-muted)] z-10 shrink-0"
                    aria-hidden
                  >
                    <CategoryIcon slug="package" size={24} />
                  </div>
                  <span className="mt-2 inline-flex flex-col items-center px-2.5 py-1.5 rounded-full bg-[var(--bg-muted)] text-xs text-[var(--fg-muted)] whitespace-nowrap text-center leading-tight">
                    <span>{formatDate(burst[0].timestamp)}</span>
                    <span>{pluralize(burst.length, "ship")}</span>
                  </span>
                </div>

                {/* Connector line: from package circle to cards (overlap so line meets circle) */}
                <div className="w-12 shrink-0 -ml-8 flex items-start pt-4" aria-hidden>
                  <div className="w-full h-px bg-[var(--border)]" />
                </div>

                {/* Cards for this burst */}
                <div className="flex-1 min-w-0 space-y-4">
                  {burst.map((proof) => (
                    <ProofCard
                      key={proof.proof_id}
                      proof={proof}
                      agent={agent}
                      showAgent={false}
                      accentColor={agentColor}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Joined row at bottom — line connects to circle; cap above hides line below */}
            <div className="relative flex gap-0 pb-0 mt-4">
              <div className="flex flex-col items-center w-24 shrink-0 pt-0.5">
                <div
                  className="w-12 h-12 rounded-full bg-[var(--bg-muted)] border border-[var(--border)] flex items-center justify-center text-[var(--fg-muted)] z-10 shrink-0"
                  aria-hidden
                >
                  <CategoryIcon slug="tada" size={24} />
                </div>
                <span className="mt-2 inline-flex flex-col items-center px-2.5 py-1.5 rounded-full bg-[var(--bg-muted)] text-xs text-[var(--fg-muted)] whitespace-nowrap text-center leading-tight">
                  <span>{formatDate(agent.first_seen)}</span>
                  <span>Joined</span>
                </span>
              </div>
              <div className="w-12 shrink-0 -ml-8 flex items-start pt-4" aria-hidden>
                <div className="w-full h-px bg-[var(--border)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                  <p className="text-[var(--fg)] font-medium">Hello World</p>
                  <p className="text-sm text-[var(--fg-muted)] mt-0.5">this agent joined on {formatDate(agent.first_seen)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
          </>
        </div>
      </section>

      <Footer />
        </div>
      </div>
    </div>
  );
}
