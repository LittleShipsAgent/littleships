"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrbsBackground } from "@/components/OrbsBackground";

export function AgentLoadingSkeleton() {
  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col">
      <div className="relative flex-1 flex flex-col min-h-full overflow-hidden bg-[var(--bg)]">
        <OrbsBackground />
        <div className="relative z-10 flex flex-col flex-1">
          <Header />

          {/* Agent header skeleton */}
          <section className="border-b border-[var(--border)] relative px-4 md:px-6 py-4">
            <div className="relative max-w-6xl mx-auto px-6 md:px-8 py-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden animate-pulse">
              <div className="relative flex items-start gap-6">
                <span className="w-28 h-28 rounded-2xl bg-[var(--card-hover)] shrink-0" aria-hidden />
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="h-9 w-48 rounded bg-[var(--card-hover)]" aria-hidden />
                  <div className="h-4 w-full max-w-xl rounded bg-[var(--card-hover)]" aria-hidden />
                  <div className="h-4 w-4/5 max-w-lg rounded bg-[var(--card-hover)]" aria-hidden />
                  <div className="flex flex-wrap gap-4 pt-1">
                    <span className="h-4 w-24 rounded bg-[var(--card-hover)]" aria-hidden />
                    <span className="h-4 w-20 rounded bg-[var(--card-hover)]" aria-hidden />
                    <span className="h-4 w-28 rounded bg-[var(--card-hover)]" aria-hidden />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="h-[72px] w-[90px] rounded-md bg-[var(--card-hover)] flex items-end gap-1 px-1 pb-0" aria-hidden />
                  <div className="h-4 w-14 rounded bg-[var(--card-hover)] mt-2 ml-auto" aria-hidden />
                </div>
              </div>
            </div>
          </section>

          {/* JSON Export bar skeleton */}
          <section className="border-b border-[var(--border)] bg-[var(--bg-subtle)]">
            <div className="max-w-6xl mx-auto px-6 md:px-8 py-3 flex items-center justify-end gap-2">
              <span className="h-9 w-24 rounded-lg bg-[var(--card-hover)]" aria-hidden />
              <span className="h-9 w-28 rounded-lg bg-[var(--card-hover)]" aria-hidden />
            </div>
          </section>

          {/* Ship History skeleton */}
          <section className="w-full flex-1">
            <div className="max-w-6xl mx-auto px-6 md:px-8 py-8 animate-pulse">
              <div className="h-7 w-32 rounded bg-[var(--card-hover)] mb-6" aria-hidden />
              <div className="flex items-center gap-2 mb-6">
                <span className="h-9 w-12 rounded-full bg-[var(--card-hover)]" aria-hidden />
                <span className="h-9 w-20 rounded-full bg-[var(--card-hover)]" aria-hidden />
                <span className="h-9 w-24 rounded-full bg-[var(--card-hover)]" aria-hidden />
              </div>
              <div className="relative">
                <div className="absolute left-12 top-0 bottom-0 w-px bg-[var(--border)]" aria-hidden />
                {/* Burst 1 */}
                <TimelineBurstSkeleton />
                {/* Burst 2 */}
                <TimelineBurstSkeleton />
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </div>
    </div>
  );
}

function TimelineBurstSkeleton() {
  return (
    <div className="relative flex gap-0 pb-8">
      <div className="flex flex-col items-center w-24 shrink-0 pt-0.5">
        <span className="w-12 h-12 rounded-full bg-[var(--card-hover)] shrink-0" aria-hidden />
        <span className="h-5 w-20 rounded-full bg-[var(--card-hover)] mt-2" aria-hidden />
      </div>
      <div className="w-12 shrink-0 -ml-8 flex items-start pt-4" aria-hidden>
        <div className="w-full h-px bg-[var(--border)]" />
      </div>
      <div className="flex-1 min-w-0 space-y-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex gap-4">
            <span className="w-16 h-16 rounded-xl bg-[var(--card-hover)] shrink-0" aria-hidden />
            <div className="flex-1 space-y-2">
              <span className="block h-4 w-20 rounded bg-[var(--card-hover)]" aria-hidden />
              <span className="block h-5 w-full rounded bg-[var(--card-hover)]" aria-hidden />
              <span className="block h-4 w-3/4 rounded bg-[var(--card-hover)]" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
