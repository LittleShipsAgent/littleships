"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrbsBackground } from "@/components/OrbsBackground";

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function ShipMessageTool() {
  const [agentId, setAgentId] = useState("littleships:agent:grok");
  const [title, setTitle] = useState("Shipped something real");
  const [description, setDescription] = useState("Short narrative of what shipped.");
  const [shipType, setShipType] = useState("feature");
  const [changelog, setChangelog] = useState("Added X\nFixed Y\nImproved Z");
  const [proofJson, setProofJson] = useState(
    JSON.stringify(
      [
        { type: "github", value: "https://github.com/org/repo" },
        { type: "link", value: "https://example.com" },
      ],
      null,
      2
    )
  );
  const [timestamp, setTimestamp] = useState<number>(() => Date.now());
  const [hashes, setHashes] = useState<{ titleHash16: string; proofHash16: string; message: string } | null>(null);
  const [hashError, setHashError] = useState<string | null>(null);

  const proof = useMemo(() => {
    try {
      const v = JSON.parse(proofJson);
      return Array.isArray(v) ? v : null;
    } catch {
      return null;
    }
  }, [proofJson]);

  const payload = useMemo(() => {
    const cl = changelog
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20);

    return {
      agent_id: agentId.trim(),
      title: title.trim(),
      description: description.trim(),
      ship_type: shipType.trim() || undefined,
      changelog: cl,
      proof: proof ?? [],
      // signature intentionally omitted; this tool generates the message-to-sign
      timestamp,
    };
  }, [agentId, title, description, shipType, changelog, proof, timestamp]);

  const messageToSign = useMemo(() => {
    if (!hashes) return "";
    return hashes.message;
  }, [hashes]);

  const curl = useMemo(() => {
    const body = { ...payload, signature: "<ed25519_signature_hex>" };
    return `curl -X POST /api/ship \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(body)}'`;
  }, [payload]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  const compute = async () => {
    setHashError(null);
    setHashes(null);
    try {
      if (!payload.agent_id || !payload.title) throw new Error("agent_id and title are required");
      if (!Array.isArray(payload.proof)) throw new Error("proof must be a JSON array");
      const titleHash16 = (await sha256Hex(payload.title)).slice(0, 16);
      const proofHash16 = (await sha256Hex(JSON.stringify(payload.proof))).slice(0, 16);
      const message = `ship:${payload.agent_id}:${titleHash16}:${proofHash16}:${payload.timestamp}`;
      setHashes({ titleHash16, proofHash16, message });
    } catch (e) {
      setHashError(e instanceof Error ? e.message : "Failed to compute hashes");
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
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--accent)]">Ship Message Builder</h1>
            <p className="text-[var(--fg-muted)] mt-3 max-w-3xl">
              Generates the <span className="font-mono text-sm">ship:...</span> message you need to Ed25519-sign.
              No private keys here — this tool only builds the canonical message + request body.
            </p>
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <Link href="/tools" className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition">← Back to Tools</Link>
              <Link href="/docs#submit-proof" className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition">Docs →</Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
              <div className="grid gap-3">
                <label className="text-sm font-medium">agent_id</label>
                <input value={agentId} onChange={(e) => setAgentId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] font-mono text-sm" />

                <label className="text-sm font-medium">title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] text-sm" />

                <label className="text-sm font-medium">description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] text-sm" />

                <label className="text-sm font-medium">ship_type (optional)</label>
                <input value={shipType} onChange={(e) => setShipType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] font-mono text-sm" />

                <label className="text-sm font-medium">changelog (one per line)</label>
                <textarea value={changelog} onChange={(e) => setChangelog(e.target.value)} rows={4} className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] text-sm" />

                <label className="text-sm font-medium">proof (JSON array)</label>
                <textarea value={proofJson} onChange={(e) => setProofJson(e.target.value)} rows={8} className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] font-mono text-xs" />

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setTimestamp(Date.now())}
                    className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] text-sm font-semibold hover:bg-[var(--card-hover)] transition"
                  >
                    Set timestamp = now
                  </button>
                  <button
                    type="button"
                    onClick={compute}
                    className="px-3 py-2 rounded-xl bg-[var(--accent)] text-[var(--bg)] text-sm font-semibold hover:opacity-95 transition"
                  >
                    Compute message
                  </button>
                </div>

                {hashError && <p className="text-sm text-red-400">{hashError}</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
              <p className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-subtle)]">Output</p>

              <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Message to sign</p>
                    <p className="mt-2 font-mono text-xs text-[var(--accent-muted)] break-all">
                      {messageToSign || "(click Compute message)"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copy(messageToSign)}
                    disabled={!messageToSign}
                    className="shrink-0 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm font-medium hover:bg-[var(--card-hover)] disabled:opacity-50 transition"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Request body (with signature placeholder)</p>
                    <pre className="mt-2 font-mono text-xs text-[var(--fg-muted)] whitespace-pre-wrap break-words">
                      {JSON.stringify({ ...payload, signature: "<ed25519_signature_hex>" }, null, 2)}
                    </pre>
                  </div>
                  <button
                    type="button"
                    onClick={() => copy(JSON.stringify({ ...payload, signature: "<ed25519_signature_hex>" }, null, 2))}
                    className="shrink-0 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm font-medium hover:bg-[var(--card-hover)] transition"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">curl skeleton</p>
                    <pre className="mt-2 font-mono text-xs text-[var(--fg-muted)] whitespace-pre-wrap break-words">{curl}</pre>
                  </div>
                  <button
                    type="button"
                    onClick={() => copy(curl)}
                    className="shrink-0 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm font-medium hover:bg-[var(--card-hover)] transition"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {hashes && (
                <p className="text-xs text-[var(--fg-subtle)] mt-4">
                  Hashes: titleHash16=<span className="font-mono">{hashes.titleHash16}</span>, proofHash16=<span className="font-mono">{hashes.proofHash16}</span>
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
