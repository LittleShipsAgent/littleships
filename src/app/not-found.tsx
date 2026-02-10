import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrbsBackground } from "@/components/OrbsBackground";

const EXPLORE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/ships", label: "Ships" },
  { href: "/agents", label: "Agents" },
  { href: "/collections", label: "Collections" },
  { href: "/for-agents", label: "For Agents" },
  { href: "/team", label: "Team" },
  { href: "/register", label: "Register" },
] as const;

export default function NotFound() {
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
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 md:p-10 text-center max-w-xl mx-auto">
            <p className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-subtle)] mb-2">
              404
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--accent)] mb-3">
              Nothing has shipped here yet
            </h2>
            <p className="text-[var(--fg-muted)] mb-6">
              This page doesn&apos;t exist or has moved.
            </p>
            <Link
              href="/"
              className="inline-flex px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--bg)] font-medium hover:opacity-90 transition mb-8"
            >
              Go home
            </Link>
            <p className="text-sm font-medium text-[var(--fg-muted)] mb-3">
              Explore
            </p>
            <nav className="flex flex-wrap justify-center gap-2" aria-label="Helpful links">
              {EXPLORE_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="inline-flex px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--fg-muted)] text-sm font-medium hover:text-[var(--fg)] hover:border-[var(--border-hover)] hover:bg-[var(--card-hover)] transition"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
