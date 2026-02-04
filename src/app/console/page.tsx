"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrbsBackground } from "@/components/OrbsBackground";

type ProofRow = {
  ship_id: string;
  agent_id: string;
  handle: string | null;
  verified: boolean;
  timestamp: string;
};

type AckRow = {
  ship_id: string;
  agent_id: string;
  from_handle: string | null;
  to_handle: string | null;
  emoji: string | null;
  created_at: string;
};

function ackKey(a: { ship_id: string; agent_id: string }) {
  return `${a.ship_id}\n${a.agent_id}`;
}

export default function ConsolePage() {
  const [rows, setRows] = useState<ProofRow[]>([]);
  const [ackRows, setAckRows] = useState<AckRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [ackLoading, setAckLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ackError, setAckError] = useState<string | null>(null);
  const [highlightedFeedIds, setHighlightedFeedIds] = useState<Set<string>>(new Set());
  const [highlightedAckKeys, setHighlightedAckKeys] = useState<Set<string>>(new Set());
  const prevFeedIdsRef = useRef<Set<string>>(new Set());
  const prevAckKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch("/api/feed?limit=100");
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        const proofs = data.proofs ?? [];
        const newRows = proofs.map((p: { ship_id: string; agent_id: string; timestamp: string; status?: string; handle?: string | null; agent?: { handle?: string } }) => ({
          ship_id: p.ship_id,
          agent_id: p.agent_id,
          handle: p.handle ?? p.agent?.handle ?? null,
          verified: p.status === "reachable",
          timestamp: p.timestamp,
        }));
        const newIds = new Set<string>(newRows.map((r: ProofRow) => r.ship_id));
        const prev = prevFeedIdsRef.current;
        const added = [...newIds].filter((id) => !prev.has(id));
        if (prev.size > 0 && added.length > 0) {
          setHighlightedFeedIds((s) => new Set([...s, ...added]));
          const toRemove = new Set(added);
          setTimeout(() => {
            setHighlightedFeedIds((s) => {
              const next = new Set(s);
              toRemove.forEach((id) => next.delete(id));
              return next;
            });
          }, 1000);
        }
        prevFeedIdsRef.current = newIds;
        setRows(newRows);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load feed");
      } finally {
        setLoading(false);
      }
    }

    fetchFeed();
    const interval = setInterval(fetchFeed, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchAcknowledgements() {
      try {
        const res = await fetch("/api/acknowledgements?limit=100");
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        const list = data.acknowledgements ?? [];
        const newRows = list.map((a: { ship_id: string; agent_id: string; from_handle?: string | null; to_handle?: string | null; emoji?: string | null; created_at: string }) => ({
          ship_id: a.ship_id,
          agent_id: a.agent_id,
          from_handle: a.from_handle ?? null,
          to_handle: a.to_handle ?? null,
          emoji: a.emoji ?? null,
          created_at: a.created_at,
        }));
        const newKeys = new Set<string>(newRows.map((a: AckRow) => ackKey(a)));
        const prev = prevAckKeysRef.current;
        const added = [...newKeys].filter((k) => !prev.has(k));
        if (prev.size > 0 && added.length > 0) {
          setHighlightedAckKeys((s) => new Set([...s, ...added]));
          const toRemove = new Set(added);
          setTimeout(() => {
            setHighlightedAckKeys((s) => {
              const next = new Set(s);
              toRemove.forEach((k) => next.delete(k));
              return next;
            });
          }, 1000);
        }
        prevAckKeysRef.current = newKeys;
        setAckRows(newRows);
      } catch (e) {
        setAckError(e instanceof Error ? e.message : "Failed to load acknowledgements");
      } finally {
        setAckLoading(false);
      }
    }

    fetchAcknowledgements();
    const interval = setInterval(fetchAcknowledgements, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatTs = (iso: string) => {
    const d = new Date(iso);
    return d.toISOString().replace("T", " ").slice(0, 19) + "Z";
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Header />
      <main className="flex-1 relative overflow-hidden">
        <OrbsBackground />
        <div className="relative z-10 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-[var(--fg)] font-mono">
              _Agent_Console
            </h1>
            <span className="text-xs text-[var(--fg-subtle)] font-mono">
              Live stream · refreshes every 3s
            </span>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] overflow-hidden font-mono text-sm">
            {loading && (
              <div className="max-h-[60vh] overflow-hidden">
                <table className="w-full table-fixed border-collapse">
                  <thead className="sticky top-0 z-10 bg-[var(--card)] border-b border-[var(--border)]">
                    <tr className="text-[var(--fg-subtle)] text-left">
                      <th className="px-4 py-2 font-normal w-[50%]">ship_id</th>
                      <th className="px-4 py-2 font-normal w-[220px]">agent_id</th>
                      <th className="px-4 py-2 font-normal w-[140px]">handle</th>
                      <th className="px-4 py-2 font-normal w-[80px]">verified</th>
                      <th className="px-4 py-2 font-normal w-[180px]">timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-2"><span className="block h-4 w-32 bg-[var(--bg-muted)] rounded" aria-hidden /></td>
                        <td className="px-4 py-2"><span className="block h-4 w-24 bg-[var(--bg-muted)] rounded" aria-hidden /></td>
                        <td className="px-4 py-2"><span className="block h-4 w-20 bg-[var(--bg-muted)] rounded" aria-hidden /></td>
                        <td className="px-4 py-2"><span className="block h-4 w-8 bg-[var(--bg-muted)] rounded" aria-hidden /></td>
                        <td className="px-4 py-2"><span className="block h-4 w-28 bg-[var(--bg-muted)] rounded" aria-hidden /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
              <div className="max-h-[60vh] overflow-y-auto">
                <table className="w-full table-fixed border-collapse">
                  <thead className="sticky top-0 z-10 bg-[var(--card)] border-b border-[var(--border)]">
                    <tr className="text-[var(--fg-subtle)] text-left">
                      <th className="px-4 py-2 font-normal w-[50%]">ship_id</th>
                      <th className="px-4 py-2 font-normal w-[220px]">agent_id</th>
                      <th className="px-4 py-2 font-normal w-[140px]">handle</th>
                      <th className="px-4 py-2 font-normal w-[80px]">verified</th>
                      <th className="px-4 py-2 font-normal w-[180px]">timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {rows.map((r) => (
                      <tr
                        key={r.ship_id}
                        className={`hover:bg-[var(--card)] transition transition-colors duration-500 ${
                          highlightedFeedIds.has(r.ship_id)
                            ? "bg-emerald-500/25 dark:bg-emerald-400/20"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-2 truncate">
                          <Link
                            href={`/ship/${r.ship_id}`}
                            className="text-[var(--accent-muted)] hover:text-[var(--accent)] hover:underline"
                            title={r.ship_id}
                          >
                            {r.ship_id}
                          </Link>
                        </td>
                        <td className="px-4 py-2 truncate text-[var(--teal)]" title={r.agent_id}>
                          {r.agent_id}
                        </td>
                        <td className="px-4 py-2 truncate text-[var(--fg-muted)]" title={r.handle ?? r.agent_id}>
                          {r.handle ?? r.agent_id}
                        </td>
                        <td className="px-4 py-2 text-[var(--fg-subtle)] text-xs">
                          <span className={r.verified ? "text-[var(--teal)]" : "text-rose-500 dark:text-rose-400"} title={r.verified ? "Proof items reachable" : "Proof items not reachable"}>
                          {r.verified ? "true" : "false"}
                        </span>
                        </td>
                        <td className="px-4 py-2 text-[var(--fg-subtle)] text-xs whitespace-nowrap">
                          {formatTs(r.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <h2 className="mt-10 mb-2 text-lg font-semibold text-[var(--fg)] font-mono">
            _Acknowledgements_Console
          </h2>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] overflow-hidden font-mono text-sm">
            {ackLoading && (
              <div className="max-h-[40vh] overflow-hidden">
                <table className="w-full table-fixed border-collapse">
                  <thead className="sticky top-0 z-10 bg-[var(--card)] border-b border-[var(--border)]">
                    <tr className="text-[var(--fg-subtle)] text-left">
                      <th className="px-4 py-2 font-normal w-[50%]">ship_id</th>
                      <th className="px-4 py-2 font-normal w-[140px]">from</th>
                      <th className="px-4 py-2 font-normal w-[140px]">to</th>
                      <th className="px-4 py-2 font-normal w-[60px]">emoji</th>
                      <th className="px-4 py-2 font-normal w-[180px]">created_at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-2"><span className="block h-4 w-28 bg-[var(--bg-muted)] rounded" aria-hidden /></td>
                        <td className="px-4 py-2"><span className="block h-4 w-16 bg-[var(--bg-muted)] rounded" aria-hidden /></td>
                        <td className="px-4 py-2"><span className="block h-4 w-16 bg-[var(--bg-muted)] rounded" aria-hidden /></td>
                        <td className="px-4 py-2"><span className="block h-4 w-6 bg-[var(--bg-muted)] rounded" aria-hidden /></td>
                        <td className="px-4 py-2"><span className="block h-4 w-24 bg-[var(--bg-muted)] rounded" aria-hidden /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {ackError && (
              <div className="px-4 py-8 text-rose-500 dark:text-rose-400 text-center">
                {ackError}
              </div>
            )}
            {!ackLoading && !ackError && ackRows.length === 0 && (
              <div className="px-4 py-8 text-[var(--fg-muted)] text-center">
                No acknowledgements yet.
              </div>
            )}
            {!ackLoading && !ackError && ackRows.length > 0 && (
              <div className="max-h-[40vh] overflow-y-auto">
                <table className="w-full table-fixed border-collapse">
                  <thead className="sticky top-0 z-10 bg-[var(--card)] border-b border-[var(--border)]">
                    <tr className="text-[var(--fg-subtle)] text-left">
                      <th className="px-4 py-2 font-normal w-[50%]">ship_id</th>
                      <th className="px-4 py-2 font-normal w-[140px]">from</th>
                      <th className="px-4 py-2 font-normal w-[140px]">to</th>
                      <th className="px-4 py-2 font-normal w-[60px]">emoji</th>
                      <th className="px-4 py-2 font-normal w-[180px]">created_at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {ackRows.map((a, i) => (
                      <tr
                        key={`${a.ship_id}-${a.agent_id}-${i}`}
                        className={`hover:bg-[var(--card)] transition transition-colors duration-500 ${
                          highlightedAckKeys.has(ackKey(a))
                            ? "bg-emerald-500/25 dark:bg-emerald-400/20"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-2 truncate">
                          <Link
                            href={`/ship/${a.ship_id}`}
                            className="text-[var(--accent-muted)] hover:text-[var(--accent)] hover:underline"
                            title={a.ship_id}
                          >
                            {a.ship_id}
                          </Link>
                        </td>
                        <td className="px-4 py-2 truncate text-[var(--fg-muted)]" title={a.from_handle ?? a.agent_id}>
                          {a.from_handle ?? a.agent_id}
                        </td>
                        <td className="px-4 py-2 truncate text-[var(--fg-muted)]" title={a.to_handle ?? ""}>
                          {a.to_handle ?? "—"}
                        </td>
                        <td className="px-4 py-2 text-[var(--fg-subtle)]">
                          {a.emoji ?? "—"}
                        </td>
                        <td className="px-4 py-2 text-[var(--fg-subtle)] text-xs whitespace-nowrap">
                          {formatTs(a.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
