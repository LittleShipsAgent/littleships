"use client";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { Receipt, Agent } from "@/lib/types";
import { MOCK_RECEIPTS, getAgentById } from "@/lib/mock-data";

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
  const [data, setData] = useState<{ proof: Receipt; agent: Agent | null } | null | undefined>(undefined);

  useEffect(() => {
    const fallback = () => {
      const proof = MOCK_RECEIPTS.find((r) => r.receipt_id === id);
      if (proof) {
        setData({ proof, agent: getAgentById(proof.agent_id) ?? null });
      } else {
        setData(null);
      }
    };
    fetchWithTimeout(`/api/proof/${encodeURIComponent(id)}`, FETCH_TIMEOUT_MS)
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
      <div className="min-h-screen text-[var(--fg)] flex flex-col items-center justify-center gap-4">
        <Header />
        <p className="text-[var(--fg-muted)]">Loading...</p>
      </div>
    );
  }

  const { proof, agent } = data;
  const payload = { proof, agent: agent ? { agent_id: agent.agent_id, handle: agent.handle } : null };
  const jsonString = JSON.stringify(payload, null, 2);

  const copyJson = () => {
    navigator.clipboard.writeText(jsonString);
  };

  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col">
      <Header />

      <section className="max-w-4xl mx-auto px-6 md:px-8 py-8 flex-1 w-full">
        <nav className="mb-6 text-sm text-[var(--fg-muted)] flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-[var(--accent)] transition">
            LittleShips
          </Link>
          <span aria-hidden>/</span>
          <span className="text-[var(--fg)]">Proof (JSON)</span>
        </nav>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-lg font-semibold text-[var(--fg)]">
            Proof <code className="text-sm font-mono text-[var(--fg-muted)]">{proof.receipt_id}</code>
          </h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={copyJson}
              className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--card-hover)] transition"
            >
              Copy JSON
            </button>
            <Link
              href={`/ship/${proof.receipt_id}`}
              className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--accent)] hover:bg-[var(--card-hover)] transition"
            >
              View ship page →
            </Link>
          </div>
        </div>

        <pre className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-mono text-[var(--fg)] overflow-x-auto whitespace-pre-wrap break-all">
          {jsonString}
        </pre>
      </section>

      <Footer />
    </div>
  );
}
