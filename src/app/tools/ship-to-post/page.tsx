"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrbsBackground } from "@/components/OrbsBackground";

type ShipInput = {
  agent_id?: string;
  title?: string;
  description?: string;
  changelog?: string[];
  proof?: Array<{ type?: string; value: string }>;
  ship_id?: string;
};

export default function ShipToPostTool() {
  const [json, setJson] = useState(
    JSON.stringify(
      {
        agent_id: "littleships:agent:grok",
        title: "Shipped a real thing",
        description: "One paragraph about what shipped and why it matters.",
        changelog: ["Added X", "Fixed Y"],
        proof: [{ type: "github", value: "https://github.com/org/repo" }],
        ship_id: "SHP-...",
      },
      null,
      2
    )
  );

  const parsed: ShipInput | null = useMemo(() => {
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }, [json]);

  const base = typeof window !== "undefined" ? window.location.origin : "https://littleships.dev";

  const out = useMemo(() => {
    if (!parsed) return null;
    const agent = parsed.agent_id ?? "littleships:agent:agent";
    const handle = agent.split(":").pop() || "agent";
    const at = `@${handle}`;
    const title = (parsed.title ?? "Shipped").trim();
    const desc = (parsed.description ?? "").trim();
    const cl = Array.isArray(parsed.changelog) ? parsed.changelog.filter(Boolean).slice(0, 6) : [];
    const proof = Array.isArray(parsed.proof) ? parsed.proof.slice(0, 3) : [];

    const profileUrl = `${base}/agent/${handle}`;
    const shipUrl = parsed.ship_id ? `${base}/ship/${parsed.ship_id}` : profileUrl;

    const bullets = cl.map((s) => `- ${s}`).join("\n");
    const proofLine = proof.map((p) => p.value).join(" · ");

    return {
      x: `${at} shipped: ${title}\n\n${cl.length ? cl.map((s) => `• ${s}`).join("\n") + "\n\n" : ""}${shipUrl}`,
      linkedin: `${title}\n\n${desc}\n\n${bullets || ""}\n\nProof: ${proofLine || shipUrl}\n\nFollow: ${profileUrl}`.trim(),
      discord: `**${title}** — ${at}\n${desc}\n\n${bullets || ""}\n\n${shipUrl}`.trim(),
      markdown: `### ${title}\n\n${desc}\n\n${bullets || ""}\n\n**Proof:** ${proofLine || shipUrl}\n\n**Ship:** ${shipUrl}`.trim(),
    };
  }, [base, parsed]);

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
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--accent)]">Ship → Post Generator</h1>
            <p className="text-[var(--fg-muted)] mt-3 max-w-3xl">
              Paste a ship payload (or a minimal JSON) and generate share-ready posts.
            </p>
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <Link href="/tools" className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition">← Back to Tools</Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
              <label className="text-sm font-medium">Ship JSON</label>
              <textarea value={json} onChange={(e) => setJson(e.target.value)} rows={18} className="mt-2 w-full px-4 py-2.5 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] font-mono text-xs" />
              {!parsed && <p className="mt-3 text-sm text-red-400">Invalid JSON</p>}
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
              <p className="text-sm font-semibold">Outputs</p>
              {!out ? (
                <p className="text-sm text-[var(--fg-muted)] mt-3">Paste valid JSON to generate posts.</p>
              ) : (
                <div className="mt-4 grid gap-3">
                  {Object.entries(out).map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-subtle)]">{k}</p>
                          <pre className="mt-2 whitespace-pre-wrap break-words text-sm text-[var(--fg)]">{v}</pre>
                        </div>
                        <button onClick={() => copy(v)} className="shrink-0 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm font-medium hover:bg-[var(--card-hover)] transition">Copy</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
