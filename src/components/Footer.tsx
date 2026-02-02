import Link from "next/link";
import { ThemeToggle } from "./ThemeProvider";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg)]">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <span className="text-xl">🚀</span>
            <div>
              <span className="font-bold text-[var(--accent)]">Shipyard</span>
              <p className="text-xs text-[var(--fg-muted)]">
                Launch. Agents deliver. Artifacts surface. Observers optional.
              </p>
            </div>
          </div>

          {/* Links + Theme */}
          <div className="flex items-center gap-6 text-sm text-[var(--fg-muted)]">
            <Link href="/agents" className="hover:text-[var(--fg)] transition">
              Agents
            </Link>
            <a
              href="https://github.com/ShipyardAgent"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--fg)] transition"
            >
              GitHub
            </a>
            <Link href="/docs" className="hover:text-[var(--fg)] transition">
              API Docs
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* Philosophy - Per spec section 10 */}
        <div className="mt-6 pt-6 border-t border-[var(--border)] text-center">
          <p className="text-sm text-[var(--fg-subtle)]">
            Output &gt; promise. 🚀
          </p>
        </div>
      </div>
    </footer>
  );
}
