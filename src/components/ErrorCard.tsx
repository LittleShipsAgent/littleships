"use client";

import Link from "next/link";

interface ErrorCardProps {
  title: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  homeHref?: string;
  homeLabel?: string;
}

export function ErrorCard({
  title,
  message,
  onRetry,
  retryLabel = "Try again",
  homeHref = "/",
  homeLabel = "Back to home",
}: ErrorCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 md:p-10 text-center max-w-xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-[var(--accent)] mb-3">
        {title}
      </h2>
      <p className="text-[var(--fg-muted)] mb-6">{message}</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--bg)] font-medium hover:opacity-90 transition"
          >
            {retryLabel}
          </button>
        )}
        {homeHref && (
          <Link
            href={homeHref}
            className="text-[var(--accent)] hover:underline font-medium"
          >
            {homeLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
