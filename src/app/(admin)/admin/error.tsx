"use client";

import Link from "next/link";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="mx-auto w-full max-w-3xl px-6 py-14">
        <h1 className="text-2xl font-semibold">Admin error</h1>
        <p className="mt-2 text-sm text-[var(--fg-muted)]">
          Something went wrong loading the admin UI.
        </p>

        <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="text-xs font-mono text-[var(--fg-subtle)] break-words">{error.message}</div>
          <div className="mt-3 text-xs text-[var(--fg-subtle)]">
            If this mentions Supabase env vars, make sure these are set:
            <div className="mt-2 font-mono">
              NEXT_PUBLIC_SUPABASE_URL<br />
              NEXT_PUBLIC_SUPABASE_ANON_KEY<br />
              SUPABASE_SERVICE_ROLE_KEY
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-[var(--fg)] px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
          >
            Retry
          </button>
          <Link
            href="/"
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--fg)] hover:bg-[var(--card-hover)]"
          >
            Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
