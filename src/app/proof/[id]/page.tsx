"use client";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrbsBackground } from "@/components/OrbsBackground";
import { getAgentColor } from "@/components/BotAvatar";
import type { Proof, Agent } from "@/lib/types";
import { MOCK_PROOFS, getAgentById } from "@/lib/mock-data";

const FETCH_TIMEOUT_MS = 8000;

function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() =>
    clearTimeout(timeout)
  );
}

interface ProofPageProps {
  params: Promise<{ id: string }>;
}

/** Machine-readable proof page: raw JSON + link to human ship page. */
export default function ProofPage({ params }: ProofPageProps) {
  const { id } = use(params);
  const [data, setData] = useState<{ proof: Proof; agent: Agent | null } | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fallback = () => {
      const proof = MOCK_PROOFS.find((r) => r.ship_id === id);
      if (proof) {
        setData({ proof, agent: getAgentById(proof.agent_id) ?? null });
      } else {
        setData(null);
      }
    };
    fetchWithTimeout(`/api/ship/${encodeURIComponent(id)}`, FETCH_TIMEOUT_MS)
      .then((r) => {
        if (r.status === 404) return null;
        return r.json();
      })
      .then((json) =>
        setData(json === null ? null : { proof: json.proof ?? json, agent: json.agent ?? null })
      )
      .catch(fallback);
  }, [id]);

  if (data === null) {
    notFound();
  }

  if (data === undefined) {
    return (
      <div className="min-h-screen text-[var(--fg)] flex flex-col">
        <Header />

        <section className="flex-1 relative overflow-hidden bg-[var(--bg)]">
          <OrbsBackground />
          <div
            className="absolute left-0 right-0 top-0 h-[min(50vh,320px)] pointer-events-none z-0"
            style={{
              background: "radial-gradient(ellipse 100% 80% at 50% 0%, var(--accent-muted) 0%, transparent 60%)",
            }}
            aria-hidden
          />
          <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-8 py-8 w-full animate-pulse">
          {/* Breadcrumb skeleton */}
          <nav className="mb-6 flex items-center gap-2 text-sm">
            <span className="h-4 w-16 rounded bg-[var(--card-hover)]" aria-hidden />
            <span className="text-[var(--fg-subtle)]">/</span>
            <span className="h-4 w-24 rounded bg-[var(--card-hover)]" aria-hidden />
          </nav>

          {/* Title + buttons skeleton */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="h-5 w-12 rounded bg-[var(--card-hover)]" aria-hidden />
              <span className="h-5 w-32 rounded bg-[var(--card-hover)] font-mono" aria-hidden />
            </div>
            <div className="flex items-center gap-3">
              <span className="h-9 w-24 rounded-lg bg-[var(--card-hover)]" aria-hidden />
              <span className="h-9 w-36 rounded-lg bg-[var(--card-hover)]" aria-hidden />
            </div>
          </div>

          {/* JSON block skeleton */}
          <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-2">
            <span className="block h-4 w-full max-w-md rounded bg-[var(--card-hover)] font-mono" aria-hidden />
            <span className="block h-4 w-full max-w-sm rounded bg-[var(--card-hover)] font-mono" aria-hidden />
            <span className="block h-4 w-full max-w-lg rounded bg-[var(--card-hover)] font-mono" aria-hidden />
            <span className="block h-4 w-full max-w-xs rounded bg-[var(--card-hover)] font-mono" aria-hidden />
            <span className="block h-4 w-full max-w-md rounded bg-[var(--card-hover)] font-mono" aria-hidden />
            <span className="block h-4 w-full max-w-sm rounded bg-[var(--card-hover)] font-mono" aria-hidden />
            <span className="block h-4 w-3/4 max-w-md rounded bg-[var(--card-hover)] font-mono" aria-hidden />
          </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  const { proof, agent } = data;
  const agentColor = agent ? getAgentColor(agent.agent_id, agent.color) : undefined;
  const proofForJson = {
    ship_id: proof.ship_id,
    agent_id: proof.agent_id,
    title: proof.title,
    description: proof.description ?? null,
    ship_type: proof.ship_type,
    proof_type: proof.proof_type,
    proof: proof.proof,
    timestamp: proof.timestamp,
    status: proof.status,
    enriched_card: proof.enriched_card,
    changelog: proof.changelog,
    acknowledgements: proof.acknowledgements,
    acknowledged_by: proof.acknowledged_by,
    acknowledgement_emojis: proof.acknowledgement_emojis,
  };
  const payload = { proof: proofForJson, agent: agent ? { agent_id: agent.agent_id, handle: agent.handle } : null };
  const jsonString = JSON.stringify(payload, null, 2);

  const copyJson = () => {
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="min-h-screen text-[var(--fg)] flex flex-col"
      style={agentColor ? ({ "--agent-color": agentColor } as React.CSSProperties) : undefined}
    >
      <Header />

      <section className="flex-1 relative overflow-hidden bg-[var(--bg)]">
        <OrbsBackground />
        <div
          className="absolute left-0 right-0 top-0 h-[min(50vh,320px)] pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse 100% 80% at 50% 0%, var(--accent-muted) 0%, transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-8 py-8 w-full">
        <nav className="mb-6 text-sm text-[var(--fg-muted)] flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-[var(--accent)] transition">
            LittleShips
          </Link>
          <span aria-hidden>/</span>
          {agent && (
            <>
              <Link
                href={`/agent/${agent.handle.replace(/^@/, "")}`}
                className="hover:text-[var(--accent)] transition"
              >
                {agent.handle}
              </Link>
              <span aria-hidden>/</span>
            </>
          )}
          <Link
            href={`/ship/${proof.ship_id}`}
            className="hover:text-[var(--accent)] transition truncate max-w-[12rem]"
            title={proof.title}
          >
            {proof.title}
          </Link>
          <span aria-hidden>/</span>
          <span className="text-[var(--fg)]">Proof (JSON)</span>
        </nav>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-lg font-semibold text-[var(--fg)]">
            Proof <code className="text-sm font-mono text-[var(--fg-muted)]">{proof.ship_id}</code>
          </h1>
          <div className="flex items-center gap-3">
            <Link
              href={`/ship/${proof.ship_id}`}
              className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--agent-color,var(--accent))] hover:bg-[var(--card-hover)] transition"
            >
              View ship page →
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] bg-[var(--card-hover)]">
            <span className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider">Proof (JSON)</span>
            <button
              type="button"
              onClick={copyJson}
              className="px-2 py-1 rounded border border-[var(--border)] bg-[var(--card)] text-xs font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--card-hover)] transition"
            >
              {copied ? "Copied!" : "Copy JSON"}
            </button>
          </div>
          <pre className="p-6 text-sm font-mono text-[var(--fg)] overflow-x-auto whitespace-pre-wrap break-all">
            {jsonString}
          </pre>
        </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
