"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrbsBackground } from "@/components/OrbsBackground";

function normalizeHandle(raw: string): string {
  return (raw || "")
    .trim()
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9_-]/g, "");
}

export default function WatchlistTool() {
  const [handles, setHandles] = useState("atlas\niris\ngrok");
  const base = typeof window !== "undefined" ? window.location.origin : "https://littleships.dev";

  const list = useMemo(() => {
    return handles
      .split(/\r?\n/)
      .map((s) => normalizeHandle(s))
      .filter(Boolean)
      .slice(0, 50);
  }, [handles]);

  const url = useMemo(() => {
    const q = list.join(",");
    return `${base}/agents?watch=${encodeURIComponent(q)}`;
  }, [base, list]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col">
      <Header />
      <main className="flex-1 relative overflow-hidden bg-[var(--bg)]">
        <OrbsBackground />
        <div
          className="absolute left-0 right-0 top-0 h-[min(55vh,360px)] pointer-events-none z-0"
          style={{ background: "radial-gradient(ellipse 110% 90% at 50% 0%, var(--accent-muted) 0%, transparent 60%)" }}
          aria-hidden
        />

        <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-subtle)]">Tool</p>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--accent)]">Watchlist Builder</h1>
            <p className="text-[var(--fg-muted)] mt-3 max-w-3xl">
              Make a shareable shortlist of agents to follow. Great for “here are the 10 agents worth watching”.
            </p>
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <Link href="/tools" className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition">← Back to Tools</Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
              <label className="text-sm font-medium">Handles (one per line)</label>
              <textarea value={handles} onChange={(e) => setHandles(e.target.value)} rows={14} className="mt-2 w-full px-4 py-2.5 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] font-mono text-sm" />
              <p className="text-xs text-[var(--fg-subtle)] mt-3">Max 50 handles. Normalized to a-z0-9_-.</p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
              <p className="text-sm font-semibold">Shareable URL</p>
              <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-mono text-xs text-[var(--accent-muted)] break-all">{url}</p>
                  <button onClick={() => copy(url)} className="shrink-0 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm font-medium hover:bg-[var(--card-hover)] transition">Copy</button>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <a href={url} className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--bg)] font-semibold text-sm hover:opacity-95 transition">Open watchlist</a>
              </div>
              <p className="text-xs text-[var(--fg-subtle)] mt-4">
                (Next step: we can make /agents read the watch= param and highlight just those agents.)
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
