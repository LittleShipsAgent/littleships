"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrbsBackground } from "@/components/OrbsBackground";

export function ShipLoadingSkeleton() {
  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col">
      <Header />
      <section className="flex-1 relative overflow-hidden bg-[var(--bg)]">
        <OrbsBackground />
        <div
          className="absolute left-0 right-0 top-0 h-[min(50vh,320px)] pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse 100% 80% at 50% 0%, var(--accent-muted) 0%, transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-8 w-full animate-pulse">
          {/* Breadcrumb skeleton */}
          <nav className="mb-8 flex items-center gap-2 text-sm">
            <span className="h-4 w-16 rounded bg-[var(--card-hover)]" aria-hidden />
            <span className="text-[var(--fg-subtle)]">/</span>
            <span className="h-4 w-24 rounded bg-[var(--card-hover)]" aria-hidden />
            <span className="text-[var(--fg-subtle)]">/</span>
            <span className="h-4 flex-1 max-w-xs rounded bg-[var(--card-hover)]" aria-hidden />
          </nav>

          {/* Ship type + title skeleton */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-2">
              <span className="h-5 w-5 rounded bg-[var(--card-hover)]" aria-hidden />
              <span className="h-4 w-20 rounded bg-[var(--card-hover)]" aria-hidden />
            </span>
            <div className="h-8 w-3/4 max-w-md rounded bg-[var(--card-hover)] mt-3" aria-hidden />
            <div className="h-8 w-1/2 max-w-sm rounded bg-[var(--card-hover)] mt-2" aria-hidden />
          </div>

          {/* Meta row skeleton */}
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <span className="h-8 w-8 rounded-full bg-[var(--card-hover)] shrink-0" aria-hidden />
            <span className="h-4 w-28 rounded bg-[var(--card-hover)]" aria-hidden />
            <span className="h-4 w-32 rounded bg-[var(--card-hover)]" aria-hidden />
            <span className="h-6 w-20 rounded-full bg-[var(--card-hover)]" aria-hidden />
          </div>

          {/* Description block skeleton */}
          <div className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="h-4 w-24 rounded bg-[var(--card-hover)] mb-3" aria-hidden />
            <div className="h-4 w-full rounded bg-[var(--card-hover)] mb-2" aria-hidden />
            <div className="h-4 w-4/5 rounded bg-[var(--card-hover)]" aria-hidden />
          </div>

          {/* Changelog skeleton */}
          <div className="mb-8">
            <div className="h-4 w-20 rounded bg-[var(--card-hover)] mb-3" aria-hidden />
            <ul className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 pl-6">
              {[1, 2, 3].map((i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--card-hover)] mt-1.5" aria-hidden />
                  <span className="h-4 flex-1 rounded bg-[var(--card-hover)]" aria-hidden />
                </li>
              ))}
            </ul>
          </div>

          {/* Proof list skeleton */}
          <div className="mb-8">
            <div className="h-4 w-28 rounded bg-[var(--card-hover)] mb-4" aria-hidden />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 py-3 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)]"
                >
                  <span className="h-6 w-6 rounded bg-[var(--card-hover)] shrink-0" aria-hidden />
                  <div className="flex-1 min-w-0 space-y-2">
                    <span className="block h-4 w-40 rounded bg-[var(--card-hover)]" aria-hidden />
                    <span className="block h-3 w-full max-w-xs rounded bg-[var(--card-hover)]" aria-hidden />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer area skeleton */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[var(--border)]">
            <span className="h-4 w-48 rounded bg-[var(--card-hover)]" aria-hidden />
            <span className="h-10 w-28 rounded-lg bg-[var(--card-hover)]" aria-hidden />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
