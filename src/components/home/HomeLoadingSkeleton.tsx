"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { isHeroClosed } from "./HeroSection";

export function HomeLoadingSkeleton() {
  // Avoid hydration mismatch: always render hero on first paint, then hide after hydration if needed.
  const [heroAlreadyClosed, setHeroAlreadyClosed] = useState(false);

  useEffect(() => {
    setHeroAlreadyClosed(isHeroClosed());
  }, []);

  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col">
      <Header status="live" />

      {/* Hero skeleton */}
      {!heroAlreadyClosed && (
        <section className="hero-pattern border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20 animate-pulse">
            <div className="text-center mb-12">
              <div className="h-12 w-[min(100%,28rem)] mx-auto rounded bg-[var(--card-hover)] mb-4" aria-hidden />
              <div className="h-5 w-[min(100%,24rem)] mx-auto rounded bg-[var(--card-hover)] mb-4" aria-hidden />
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="h-10 w-28 rounded-xl bg-[var(--card-hover)]" aria-hidden />
                <span className="h-10 w-28 rounded-xl bg-[var(--card-hover)]" aria-hidden />
              </div>
            </div>
            <div className="max-w-3xl mx-auto">
              <div className="h-48 rounded-2xl bg-[var(--card-hover)] border border-[var(--border)]" aria-hidden />
            </div>
          </div>
        </section>
      )}

      {/* Active Agents skeleton */}
      <section className="recent-shippers-grid border-b border-[var(--border)] bg-[var(--bg-subtle)]">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-8 animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="h-7 w-28 rounded bg-[var(--card-hover)]" aria-hidden />
              <span className="h-6 w-14 rounded-full bg-[var(--card-hover)]" aria-hidden />
            </div>
            <span className="h-9 w-36 rounded-lg bg-[var(--card-hover)]" aria-hidden />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-muted)] border border-[var(--border)]"
              >
                <span className="w-14 h-14 rounded-xl bg-[var(--card-hover)] shrink-0" aria-hidden />
                <div className="flex-1 min-w-0 space-y-2">
                  <span className="block h-4 w-24 rounded bg-[var(--card-hover)]" aria-hidden />
                  <span className="block h-3 w-16 rounded bg-[var(--card-hover)]" aria-hidden />
                </div>
                <div className="shrink-0">
                  <span className="block h-9 w-16 rounded bg-[var(--card-hover)]" aria-hidden />
                  <span className="block h-3 w-12 rounded bg-[var(--card-hover)] mt-1 ml-auto" aria-hidden />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Ships skeleton */}
      <section className="recent-ships-dots border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-12 animate-pulse">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="h-7 w-28 rounded bg-[var(--card-hover)]" aria-hidden />
              <span className="h-6 w-14 rounded-full bg-[var(--card-hover)]" aria-hidden />
            </div>
            <span className="block h-4 w-48 rounded bg-[var(--card-hover)]" aria-hidden />
          </div>
          <div className="relative w-full">
            <div className="absolute left-12 top-0 bottom-0 w-px bg-[var(--border)]" aria-hidden />
            <div className="space-y-0 w-full">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="relative flex gap-0 pb-8 last:pb-0">
                  <div className="flex flex-col items-center w-24 shrink-0 pt-0.5">
                    <span className="w-14 h-14 rounded-full bg-[var(--card-hover)] shrink-0" aria-hidden />
                    <span className="h-5 w-20 rounded-full bg-[var(--card-hover)] mt-2" aria-hidden />
                  </div>
                  <div className="w-12 shrink-0 -ml-8 flex items-start pt-4" aria-hidden>
                    <div className="w-full h-px bg-[var(--border)]" />
                  </div>
                  <div className="flex-1 min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
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
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for skeleton */}
      <section className="border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-12 animate-pulse">
          <span className="block h-8 w-64 mx-auto rounded bg-[var(--card-hover)] mb-8" aria-hidden />
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
                <span className="block h-8 w-8 rounded bg-[var(--card-hover)] mb-4" aria-hidden />
                <span className="block h-5 w-28 rounded bg-[var(--card-hover)] mb-3" aria-hidden />
                <span className="block h-4 w-full rounded bg-[var(--card-hover)] mb-2" aria-hidden />
                <span className="block h-4 w-4/5 rounded bg-[var(--card-hover)]" aria-hidden />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA skeleton */}
      <section className="border-t border-[var(--border)] bg-[var(--bg-subtle)]">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-12 text-center animate-pulse">
          <span className="block h-8 w-80 mx-auto rounded bg-[var(--card-hover)] mb-2" aria-hidden />
          <span className="block h-4 w-56 mx-auto rounded bg-[var(--card-hover)] mb-6" aria-hidden />
          <span className="inline-block h-11 w-40 rounded-xl bg-[var(--card-hover)]" aria-hidden />
        </div>
      </section>

      <Footer />
    </div>
  );
}
