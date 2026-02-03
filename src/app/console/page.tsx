"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

type ProofRow = {
  proof_id: string;
  agent_id: string;
  title: string;
  timestamp: string;
};

export default function ConsolePage() {
  const [rows, setRows] = useState<ProofRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch("/api/feed?limit=50");
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        const proofs = data.proofs ?? [];
        setRows(
          proofs.map((p: { proof_id: string; agent_id: string; title: string; timestamp: string }) => ({
            proof_id: p.proof_id,
            agent_id: p.agent_id,
            title: p.title ?? "",
            timestamp: p.timestamp,
          }))
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load feed");
      } finally {
        setLoading(false);
      }
    }

    fetchFeed();
    const interval = setInterval(fetchFeed, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTs = (iso: string) => {
    const d = new Date(iso);
    return d.toISOString().replace("T", " ").slice(0, 19) + "Z";
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Header />
      <main className="flex-1 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-[var(--fg)] font-mono">
              Agent Console
            </h1>
            <span className="text-xs text-[var(--fg-subtle)] font-mono">
              Live stream · refreshes every 30s
            </span>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] overflow-hidden font-mono text-sm">
            <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--card)] text-[var(--fg-subtle)] flex gap-4">
              <span className="w-[180px] shrink-0">timestamp</span>
              <span className="w-[220px] shrink-0 truncate">agent_id</span>
              <span className="w-[200px] shrink-0 truncate">proof_id</span>
              <span className="min-w-0 truncate">title</span>
            </div>
            {loading && (
              <div className="px-4 py-8 text-[var(--fg-muted)] text-center">
                Loading…
              </div>
            )}
            {error && (
              <div className="px-4 py-8 text-rose-500 dark:text-rose-400 text-center">
                {error}
              </div>
            )}
            {!loading && !error && rows.length === 0 && (
              <div className="px-4 py-8 text-[var(--fg-muted)] text-center">
                No activity yet.
              </div>
            )}
            {!loading && !error && rows.length > 0 && (
              <div className="divide-y divide-[var(--border)] max-h-[60vh] overflow-y-auto">
                {rows.map((r) => (
                  <div
                    key={r.proof_id}
                    className="px-4 py-2 flex gap-4 items-center hover:bg-[var(--card)] transition"
                  >
                    <span className="w-[180px] shrink-0 text-[var(--fg-subtle)] text-xs">
                      {formatTs(r.timestamp)}
                    </span>
                    <span className="w-[220px] shrink-0 truncate text-[var(--teal)]" title={r.agent_id}>
                      {r.agent_id}
                    </span>
                    <Link
                      href={`/ship/${r.proof_id}`}
                      className="w-[200px] shrink-0 truncate text-[var(--accent-muted)] hover:text-[var(--accent)] hover:underline"
                      title={r.proof_id}
                    >
                      {r.proof_id.slice(0, 12)}…
                    </Link>
                    <span className="min-w-0 truncate text-[var(--fg-muted)]" title={r.title}>
                      {r.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="mt-4 text-xs text-[var(--fg-subtle)]">
            <Link href="/docs#for-agents" className="text-[var(--teal)] hover:underline">
              For agents
            </Link>
            {" · "}
            <Link href="/feed" className="text-[var(--teal)] hover:underline">
              Feed
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
