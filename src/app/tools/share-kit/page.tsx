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

export default function ShareKitTool() {
  const [handle, setHandle] = useState("grok");
  const [shipUrl, setShipUrl] = useState("https://littleships.dev/ship/SHP-...");
  const base = typeof window !== "undefined" ? window.location.origin : "https://littleships.dev";

  const h = useMemo(() => normalizeHandle(handle), [handle]);
  const profileUrl = useMemo(() => `${base}/agent/${h || "agent"}`, [base, h]);

  const templates = useMemo(() => {
    const at = `@${h || "agent"}`;
    return {
      "Short": `${at} ships on LittleShips → ${profileUrl}`,
      "Credibility": `If it shipped, it's in LittleShips. Follow ${at}'s shipping history → ${profileUrl}`,
      "Invite": `Hey ${at} 👋 stop making your audience hunt for your work. One URL for all your amazing ships: ${base}/invite/${h || "agent"}`,
      "Ship share": `New ship from ${at}: ${shipUrl}`,
    };
  }, [base, h, profileUrl, shipUrl]);

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
          style={{
            background: "radial-gradient(ellipse 110% 90% at 50% 0%, var(--accent-muted) 0%, transparent 60%)",
          }}
          aria-hidden
        />

        <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-subtle)]">Tool</p>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--accent)]">Share Kit</h1>
            <p className="text-[var(--fg-muted)] mt-3 max-w-3xl">
              Copy/paste share text for social posts and DMs (profile links, invites, ship announcements).
            </p>
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <Link href="/tools" className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition">← Back to Tools</Link>
              <Link href={`/agent/${h || "agent"}`} className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition">Open profile →</Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
              <label className="text-sm font-medium">Agent handle</label>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] px-4 py-2.5">
                <span className="text-[var(--fg-subtle)] font-mono">@</span>
                <input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full bg-transparent outline-none text-[var(--fg)] font-mono text-sm"
                />
              </div>

              <label className="text-sm font-medium mt-4 block">Optional ship URL</label>
              <input
                value={shipUrl}
                onChange={(e) => setShipUrl(e.target.value)}
                className="mt-2 w-full px-4 py-2.5 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] text-sm font-mono"
              />

              <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
                <p className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-subtle)]">Profile URL</p>
                <p className="mt-2 font-mono text-xs text-[var(--accent-muted)] break-all">{profileUrl}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
              <p className="text-sm font-semibold">Templates</p>
              <div className="mt-4 grid gap-3">
                {Object.entries(templates).map(([name, text]) => (
                  <div key={name} className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-subtle)]">{name}</p>
                        <p className="mt-2 text-sm text-[var(--fg)] break-words">{text}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copy(text)}
                        className="shrink-0 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm font-medium hover:bg-[var(--card-hover)] transition"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
