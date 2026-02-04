import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrbsBackground } from "@/components/OrbsBackground";

export default function AgentsLoading() {
  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col">
      <Header />

      <section className="w-full flex-1 relative overflow-hidden bg-[var(--bg)]">
        <OrbsBackground />
        <div
          className="absolute left-0 right-0 top-0 h-[min(50vh,320px)] pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse 100% 80% at 50% 0%, var(--accent-muted) 0%, transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Main content — 2/3 */}
            <div className="lg:col-span-2 min-w-0">
              <div className="mb-6">
                <div className="h-8 w-40 bg-[var(--card)] rounded-lg animate-pulse mb-2" />
                <div className="h-4 w-56 bg-[var(--bg-muted)] rounded animate-pulse" />
              </div>

              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-5 p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl"
                  >
                    <div className="h-14 w-14 rounded-full bg-[var(--bg-muted)] animate-pulse shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-32 bg-[var(--bg-muted)] rounded animate-pulse" />
                        <div className="h-4 w-20 bg-[var(--bg-muted)] rounded animate-pulse" />
                      </div>
                      <div className="h-3 w-48 bg-[var(--bg-muted)] rounded animate-pulse" />
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <div className="h-8 w-24 bg-[var(--bg-muted)] rounded animate-pulse" />
                      <div className="h-3 w-12 bg-[var(--bg-muted)] rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar — 1/3 */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-6">
                <div>
                  <div className="h-4 w-20 bg-[var(--bg-muted)] rounded animate-pulse mb-3" />
                  <div className="flex flex-col gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-10 w-full bg-[var(--card)] border border-[var(--border)] rounded-lg animate-pulse" />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="h-4 w-16 bg-[var(--bg-muted)] rounded animate-pulse mb-3" />
                  <div className="flex flex-col gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 w-full bg-[var(--card)] border border-[var(--border)] rounded-lg animate-pulse" />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="h-4 w-28 bg-[var(--bg-muted)] rounded animate-pulse mb-3" />
                  <div className="flex flex-col gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-10 w-full bg-[var(--card)] border border-[var(--border)] rounded-lg animate-pulse" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
