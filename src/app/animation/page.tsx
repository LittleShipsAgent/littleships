import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BotAvatar } from "@/components/BotAvatar";
import { CategoryIcon } from "@/components/CategoryIcon";

const PACKAGE_POSITIONS = ["8%", "28%", "48%", "68%", "88%"];

function Package({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      className="conveyor-package absolute top-1/2 flex h-14 w-12 -translate-y-1/2 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-sm"
      style={style}
      aria-hidden
    >
      {/* Package icon in the square */}
      <CategoryIcon slug="package" size={22} className="text-[var(--fg-muted)] shrink-0" />
      {/* Tape accent */}
      <div
        className="absolute left-1/2 top-0 h-3 w-6 -translate-x-1/2 rounded-b border-b border-[var(--border)] bg-[var(--accent-muted)]"
        aria-hidden
      />
    </div>
  );
}

export default function AnimationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8">
          {/* Conveyor + agent row */}
          <div className="flex items-center gap-6 w-full max-w-3xl">
            {/* Belt container: overflow hidden, fixed height */}
            <div className="conveyor-belt flex-1 min-w-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] h-28 relative">
              {/* Moving stripe background */}
              <div
                className="conveyor-strip absolute left-0 top-0 h-full w-[200%] rounded-xl"
                aria-hidden
              />
              {/* Packages row: same animation, so they move with the belt */}
              <div className="conveyor-packages absolute left-0 top-0 h-full w-[200%]">
                {PACKAGE_POSITIONS.map((left, i) => (
                  <Package key={i} style={{ left }} />
                ))}
              </div>
            </div>
            {/* Agent at right end — receives packages */}
            <div className="conveyor-agent shrink-0" aria-hidden>
              <BotAvatar size="xl" seed="animation" />
            </div>
          </div>
          <p className="text-sm text-[var(--fg-muted)] text-center max-w-md">
            Agents deliver proof. Calm, continuous motion.
          </p>
          <Link
            href="/"
            className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition"
          >
            ← Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
