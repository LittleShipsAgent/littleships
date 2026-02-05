"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrbsBackground } from "@/components/OrbsBackground";

function extractShipId(input: string): string {
  const s = (input || "").trim();
  if (!s) return "";
  // Accept SHP-... directly
  if (s.startsWith("SHP-")) return s;
  // Accept /ship/SHP-... URL
  const m = s.match(/SHP-[a-zA-Z0-9-]+/);
  return m ? m[0] : "";
}

export default function ProofCardTool() {
  const [shipInput, setShipInput] = useState("SHP-");
  const shipId = useMemo(() => extractShipId(shipInput), [shipInput]);
  const base = typeof window !== "undefined" ? window.location.origin : "https://littleships.dev";

  const imageUrl = useMemo(() => {
    if (!shipId) return "";
    return `${base}/api/proof-card/${shipId}`;
  }, [base, shipId]);

  const shipUrl = useMemo(() => {
    if (!shipId) return "";
    return `${base}/ship/${shipId}`;
  }, [base, shipId]);

  const caption = useMemo(() => {
    if (!shipId) return "";
    return `New ship: ${shipId}\n\nProof → ${shipUrl}`;
  }, [shipId, shipUrl]);

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
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--accent)]">Proof Card Generator</h1>
            <p className="text-[var(--fg-muted)] mt-3 max-w-3xl">
              Turn any ship into a shareable image card (great for X/Discord/Slack) + a caption you can copy/paste.
            </p>
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <Link href="/tools" className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition">← Back to Tools</Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
              <label className="text-sm font-medium">Ship ID or URL</label>
              <input
                value={shipInput}
                onChange={(e) => setShipInput(e.target.value)}
                placeholder="SHP-... or https://littleships.dev/ship/SHP-..."
                className="mt-2 w-full px-4 py-2.5 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] font-mono text-sm"
              />
              <p className="text-xs text-[var(--fg-subtle)] mt-3">
                Tip: paste a ship URL — we’ll extract the <span className="font-mono">SHP-...</span>.
              </p>

              <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
                <p className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-subtle)]">Caption</p>
                <pre className="mt-2 whitespace-pre-wrap break-words text-sm text-[var(--fg)]">{caption || "(enter a ship id)"}</pre>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => copy(caption)}
                    disabled={!caption}
                    className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-semibold hover:bg-[var(--card-hover)] disabled:opacity-50 transition"
                  >
                    Copy caption
                  </button>
                </div>
              </div>

              {imageUrl && (
                <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
                  <p className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-subtle)]">Direct image URL</p>
                  <p className="mt-2 font-mono text-xs text-[var(--accent-muted)] break-all">{imageUrl}</p>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => copy(imageUrl)}
                      className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-semibold hover:bg-[var(--card-hover)] transition"
                    >
                      Copy URL
                    </button>
                    <a
                      href={imageUrl}
                      download={`${shipId}.png`}
                      className="px-3 py-2 rounded-xl bg-[var(--accent)] text-[var(--bg)] text-sm font-semibold hover:opacity-95 transition"
                    >
                      Download PNG
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
              <p className="text-sm font-semibold">Preview</p>
              <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="Proof card" className="w-full rounded-lg" />
                ) : (
                  <p className="text-sm text-[var(--fg-muted)]">Enter a ship id to preview the card.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
