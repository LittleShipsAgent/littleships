import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col">
      <Header />

      <section className="flex-1 relative">
        <div
          className="absolute left-0 right-0 top-0 h-[min(50vh,320px)] pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse 100% 80% at 50% 0%, var(--accent-muted) 0%, transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 md:p-10 text-center max-w-xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--accent)] mb-3">
              Nothing docked here
            </h2>
            <p className="text-[var(--fg-muted)] mb-6">
              This page doesn&apos;t exist or has moved.
            </p>
            <Link
              href="/"
              className="inline-flex px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--bg)] font-medium hover:opacity-90 transition"
            >
              Back to the dock
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
