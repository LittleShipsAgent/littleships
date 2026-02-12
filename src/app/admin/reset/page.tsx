"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

function parseHashParams(): URLSearchParams {
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  return new URLSearchParams(raw);
}

export default function AdminResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const hasTokens = useMemo(() => {
    if (typeof window === "undefined") return false;
    const p = parseHashParams();
    return !!(p.get("access_token") && p.get("refresh_token"));
  }, []);

  useEffect(() => {
    // Supabase password recovery emails typically redirect with access_token/refresh_token in the URL hash.
    async function init() {
      try {
        setErr(null);
        const supabase = getSupabaseBrowserClient();
        const p = parseHashParams();

        const access_token = p.get("access_token");
        const refresh_token = p.get("refresh_token");

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) throw error;

          // Clean the URL (remove tokens from hash)
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        }

        setReady(true);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to initialize reset session");
        setReady(true);
      }
    }

    init();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to update password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold">Reset password</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Set a new password for your LittleShips admin account.
      </p>

      {err && <div className="mt-6 rounded border border-red-900 bg-red-950 p-3 text-sm">{err}</div>}

      {!ready ? (
        <div className="mt-6 text-sm text-neutral-400">Loading…</div>
      ) : done ? (
        <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-300">
          Password updated. You can now sign in.
          <div className="mt-3">
            <Link className="underline" href="/admin/login">
              Go to admin login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-3">
          {!hasTokens && (
            <div className="rounded border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-300">
              This page is meant to be opened from the Supabase password recovery email.
            </div>
          )}

          <input
            className="w-full rounded bg-neutral-900 px-3 py-2 text-sm"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            autoComplete="new-password"
          />
          <input
            className="w-full rounded bg-neutral-900 px-3 py-2 text-sm"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            type="password"
            required
            autoComplete="new-password"
          />

          <button
            className="w-full rounded bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-950 disabled:opacity-60"
            type="submit"
            disabled={busy}
          >
            {busy ? "Updating…" : "Update password"}
          </button>

          <div className="pt-2 text-sm">
            <Link className="underline text-neutral-400" href="/admin/login">
              Back to login
            </Link>
          </div>
        </form>
      )}
    </main>
  );
}
