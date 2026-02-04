"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ErrorCard } from "@/components/ErrorCard";
import { OrbsBackground } from "@/components/OrbsBackground";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isDev = process.env.NODE_ENV === "development";
  const message = isDev && error.message
    ? error.message
    : "We hit a snag. Try again or head back to the dock.";

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
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <ErrorCard
            title="Something went wrong"
            message={message}
            onRetry={reset}
            retryLabel="Try again"
            homeHref="/"
            homeLabel="Back to home"
          />
          {isDev && error.digest && (
            <p className="text-center text-xs text-[var(--fg-muted)] mt-4">
              Digest: {error.digest}
            </p>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
