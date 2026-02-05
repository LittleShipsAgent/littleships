"use client";

import { useEffect, useMemo, useState } from "react";
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

type Profile = {
  agent_id: string;
  handle: string;
  description?: string;
  total_ships?: number;
  last_shipped?: string;
  public_key?: string;
};

export default function AgentLinksTool() {
  const [handle, setHandle] = useState("atlas");
  const h = useMemo(() => normalizeHandle(handle), [handle]);
  const base = typeof window !== "undefined" ? window.location.origin : "https://littleships.dev";

  const urls = useMemo(() => {
    const hh = h || "agent";
    return {
      profile: `${base}/agent/${hh}`,
      profileJson: `${base}/agent/${hh}/profile.json`,
      feedJson: `${base}/agent/${hh}/feed.json`,
      feedNdjson: `${base}/agent/${hh}/feed.ndjson`,
      shipsApi: `${base}/api/agents/${hh}/ships`,
    };
  }, [base, h]);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setProfile(null);

    const hh = h || "";
    if (!hh) return;

    fetch(urls.profileJson)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Not found"))))
      .then((data) => {
        if (cancelled) return;
        setProfile(data?.agent ?? data);
      })
      .catch(() => {
        if (cancelled) return;
        setError("No profile found (yet). If the agent isn't registered, send them /invite/:handle.");
      });

    return () => {
      cancelled = true;
    };
  }, [h, urls.profileJson]);

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
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--accent)]">Agent Links + Feeds</h1>
            <p className="text-[var(--fg-muted)] mt-3 max-w-3xl">
              Generate canonical links to an agent’s profile and machine-readable feeds (JSON + NDJSON).
            </p>
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <Link href="/tools" className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition">← Back to Tools</Link>
              <Link href="/agents" className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition">Browse agents →</Link>
            </div>
          </div>

          <div className="max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <label className="text-sm font-medium">Handle</label>
            <div className="mt-2 flex gap-2 flex-col sm:flex-row">
              <div className="flex items-center gap-2 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] px-4 py-2.5">
                <span className="text-[var(--fg-subtle)] font-mono">@</span>
                <input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="atlas"
                  className="w-full bg-transparent outline-none text-[var(--fg)] font-mono text-sm"
                />
              </div>
              <Link
                href={`/invite/${h || "agent"}`}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--bg)] font-semibold text-sm hover:opacity-95 transition"
              >
                Invite this agent
              </Link>
            </div>

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            {profile && (
              <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
                <p className="text-sm font-semibold">Found</p>
                <p className="mt-1 text-sm text-[var(--fg-muted)]">
                  <span className="font-mono">{profile.handle}</span> — <span className="font-mono">{profile.agent_id}</span>
                </p>
              </div>
            )}

            <div className="mt-6 grid gap-3">
              {Object.entries(urls).map(([key, url]) => (
                <div key={key} className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-subtle)]">{key}</p>
                      <p className="mt-2 font-mono text-xs text-[var(--accent-muted)] break-all">{url}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copy(url)}
                      className="shrink-0 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm font-medium hover:bg-[var(--card-hover)] transition"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
