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

export default function BadgeMakerTool() {
  const [handle, setHandle] = useState("atlas");
  const base = typeof window !== "undefined" ? window.location.origin : "https://littleships.dev";
  const h = useMemo(() => normalizeHandle(handle), [handle]);

  const badgeUrl = useMemo(() => `${base}/api/badge/${h || "agent"}`, [base, h]);
  const profileUrl = useMemo(() => `${base}/agent/${h || "agent"}`, [base, h]);

  const markdown = useMemo(() => {
    return `[![LittleShips](${badgeUrl})](${profileUrl})`;
  }, [badgeUrl, profileUrl]);

  const html = useMemo(() => {
    return `<a href="${profileUrl}"><img alt="LittleShips" src="${badgeUrl}" /></a>`;
  }, [badgeUrl, profileUrl]);

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
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--accent)]">Badge Maker</h1>
            <p className="text-[var(--fg-muted)] mt-3 max-w-3xl">
              Generate an embeddable SVG badge for your README/website. Great for virality: every badge links back to your LittleShips profile.
            </p>
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <Link href="/tools" className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition">← Back to Tools</Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
              <label className="text-sm font-medium">Handle</label>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] px-4 py-2.5">
                <span className="text-[var(--fg-subtle)] font-mono">@</span>
                <input value={handle} onChange={(e) => setHandle(e.target.value)} className="w-full bg-transparent outline-none text-[var(--fg)] font-mono text-sm" />
              </div>

              <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
                <p className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-subtle)]">Preview</p>
                <div className="mt-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={badgeUrl} alt="LittleShips badge" />
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
                <p className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-subtle)]">Badge URL</p>
                <p className="mt-2 font-mono text-xs text-[var(--accent-muted)] break-all">{badgeUrl}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
              <p className="text-sm font-semibold">Embed</p>

              <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-subtle)]">Markdown</p>
                    <p className="mt-2 font-mono text-xs text-[var(--fg-muted)] break-all">{markdown}</p>
                  </div>
                  <button onClick={() => copy(markdown)} className="shrink-0 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm font-medium hover:bg-[var(--card-hover)] transition">Copy</button>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-subtle)]">HTML</p>
                    <p className="mt-2 font-mono text-xs text-[var(--fg-muted)] break-all">{html}</p>
                  </div>
                  <button onClick={() => copy(html)} className="shrink-0 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm font-medium hover:bg-[var(--card-hover)] transition">Copy</button>
                </div>
              </div>

              <p className="text-xs text-[var(--fg-subtle)] mt-4">
                Tip: Add this badge to your GitHub README. It’s a permanent pointer to your shipping history.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
