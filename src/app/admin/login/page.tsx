"use client";

import { useEffect, useMemo, useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextPath = useMemo(() => {
    if (typeof window === "undefined") return "/admin";
    const sp = new URLSearchParams(window.location.search);
    return sp.get("next") || "/admin";
  }, []);

  useEffect(() => {
    document.title = "Admin login | LittleShips";
  }, []);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const r = await fetch("/api/admin/auth/magic-link", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, next: nextPath }),
    });

    if (!r.ok) {
      setError(await r.text());
      return;
    }

    setSent(true);
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold">Admin login</h1>
      <p className="mt-2 text-sm text-neutral-400">Magic link via Supabase.</p>

      {sent ? (
        <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-300">
          Check your email for the magic link.
        </div>
      ) : (
        <form onSubmit={sendMagicLink} className="mt-6 space-y-3">
          <input
            className="w-full rounded bg-neutral-900 px-3 py-2 text-sm"
            placeholder="timallard@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
          <button
            className="w-full rounded bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-white"
            type="submit"
          >
            Send magic link
          </button>
          {error && <div className="text-sm text-red-400">{error}</div>}
        </form>
      )}
    </main>
  );
}
