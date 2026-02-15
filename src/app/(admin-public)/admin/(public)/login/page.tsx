"use client";

import { useEffect, useMemo, useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const nextPath = useMemo(() => {
    if (typeof window === "undefined") return "/admin";
    const sp = new URLSearchParams(window.location.search);
    return sp.get("next") || "/admin";
  }, []);

  useEffect(() => {
    document.title = "Admin login | LittleShips";
  }, []);

  async function doLogin() {
    setError(null);
    setBusy(true);

    const r = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!r.ok) {
      setError(await r.text());
      setBusy(false);
      return;
    }

    // middleware will allow /admin only once you're also in admin_users
    window.location.href = nextPath;
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    await doLogin();
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold">Admin login</h1>
      <p className="mt-2 text-sm text-neutral-400">Sign in with email + password.</p>

      <form onSubmit={login} className="mt-6 space-y-3">
        <input
          className="w-full rounded bg-neutral-900 px-3 py-2 text-sm"
          placeholder="you@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              doLogin();
            }
          }}
          type="email"
          required
          autoComplete="email"
        />
        <input
          className="w-full rounded bg-neutral-900 px-3 py-2 text-sm"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              doLogin();
            }
          }}
          type="password"
          required
          autoComplete="current-password"
        />
        <button
          className="w-full rounded bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-white"
          type="submit"
          disabled={busy}
        >
          Sign in
        </button>

        {error && <div className="text-sm text-red-400">{error}</div>}
      </form>
    </main>
  );
}
