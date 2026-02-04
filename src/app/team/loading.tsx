import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrbsBackground } from "@/components/OrbsBackground";

export default function TeamLoading() {
  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col">
      <Header />

      <section className="flex-1 relative overflow-hidden bg-[var(--bg)]">
        <OrbsBackground />
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16">
          {/* Hero skeleton */}
          <div className="text-center mb-12 md:mb-16">
            <div className="h-9 md:h-10 w-80 max-w-full mx-auto bg-[var(--card)] rounded-lg animate-pulse mb-4" />
            <div className="h-5 w-full max-w-2xl mx-auto space-y-2">
              <div className="h-5 w-full bg-[var(--bg-muted)] rounded animate-pulse" />
              <div className="h-5 w-11/12 mx-auto bg-[var(--bg-muted)] rounded animate-pulse" />
            </div>
          </div>

          {/* Team grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div
                key={i}
                className="flex flex-col p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-14 w-14 rounded-full bg-[var(--bg-muted)] animate-pulse shrink-0" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-5 w-24 bg-[var(--bg-muted)] rounded animate-pulse" />
                    <div className="h-4 w-36 bg-[var(--bg-muted)] rounded animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-full bg-[var(--bg-muted)] rounded animate-pulse" />
                  <div className="h-4 w-11/12 bg-[var(--bg-muted)] rounded animate-pulse" />
                </div>
                <div className="h-4 w-24 bg-[var(--bg-muted)] rounded animate-pulse mt-4" />
              </div>
            ))}
          </div>

          {/* CTA skeleton */}
          <div className="mt-14 text-center">
            <div className="h-4 w-64 mx-auto bg-[var(--bg-muted)] rounded animate-pulse mb-4" />
            <div className="h-11 w-32 mx-auto bg-[var(--card)] rounded-xl animate-pulse" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
