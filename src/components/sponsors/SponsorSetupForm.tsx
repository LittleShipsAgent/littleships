"use client";

import { useState } from "react";

export type SponsorCreativeDraft = {
  name: string;
  tagline: string;
  url: string;
  logoUrl?: string;
  bgColor?: string;
};

const PALETTE = [
  "#0b1220",
  "#0f172a",
  "#111827",
  "#0b2a2a",
  "#1f2937",
  "#312e81",
  "#3b0764",
  "#2a1020",
];

export function SponsorSetupForm({ sessionId }: { sessionId: string }) {
  const [draft, setDraft] = useState<SponsorCreativeDraft>({
    name: "",
    tagline: "",
    url: "",
    logoUrl: "",
    bgColor: PALETTE[1],
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="w-full">
      <div className="space-y-4">
        <div>
          <label className="text-sm text-[var(--fg-muted)]">Company/Product Name *</label>
          <input
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm"
            placeholder="e.g., Supabase"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm text-[var(--fg-muted)]">Tagline *</label>
          <input
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm"
            placeholder="e.g., The Postgres database for developers"
            value={draft.tagline}
            onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm text-[var(--fg-muted)]">Website URL *</label>
          <input
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm"
            placeholder="https://example.com"
            value={draft.url}
            onChange={(e) => setDraft({ ...draft, url: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm text-[var(--fg-muted)]">Icon/Logo URL (optional)</label>
          <input
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm"
            placeholder="https://example.com/logo.png"
            value={draft.logoUrl ?? ""}
            onChange={(e) => setDraft({ ...draft, logoUrl: e.target.value })}
          />
          <div className="mt-1 text-xs text-[var(--fg-subtle)]">Square image recommended.</div>
        </div>

        <div>
          <label className="text-sm text-[var(--fg-muted)]">Background color</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setDraft({ ...draft, bgColor: c })}
                className="h-7 w-7 rounded-md border"
                style={{ backgroundColor: c, borderColor: draft.bgColor === c ? "var(--fg)" : "var(--border)" }}
                aria-label={`Pick ${c}`}
              />
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            disabled={status === "saving"}
            onClick={async () => {
              setStatus("saving");
              setError(null);
              try {
                const res = await fetch("/api/sponsor/creative", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ sessionId, ...draft }),
                });
                if (!res.ok) {
                  const text = await res.text();
                  throw new Error(text || `HTTP ${res.status}`);
                }
                setStatus("saved");
              } catch (e: any) {
                setStatus("error");
                setError(e?.message ?? "Failed to save");
              }
            }}
            className="w-full rounded-xl bg-[var(--fg)] px-4 py-3 text-center text-sm font-semibold text-black hover:opacity-90 disabled:opacity-60"
          >
            {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : "Submit for approval"}
          </button>
          <p className="mt-3 text-xs text-[var(--fg-subtle)]">
            You’ve paid successfully. Your sponsorship is now <span className="font-semibold">pending approval</span> (typically within 1 business day).
          </p>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
