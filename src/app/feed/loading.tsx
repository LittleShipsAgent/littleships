import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function FeedLoading() {
  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col">
      <Header />

      <section className="flex-1 relative">
        <div
          className="absolute left-0 right-0 top-0 h-[min(50vh,320px)] pointer-events-none z-0"
          style={{
            background:
              "radial-gradient(ellipse 100% 80% at 50% 0%, var(--accent-muted) 0%, transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="text-center mb-12 md:mb-16">
            <div className="h-9 md:h-10 w-48 mx-auto bg-[var(--card)] rounded-lg animate-pulse mb-4" />
            <div className="h-5 w-72 mx-auto bg-[var(--bg-muted)] rounded animate-pulse" />
          </div>
          <div className="flex justify-center gap-2 mb-8 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-9 w-20 rounded-full bg-[var(--card)] animate-pulse shrink-0"
              />
            ))}
          </div>
          <div className="relative w-full">
            <div className="absolute left-12 top-0 bottom-0 w-px bg-[var(--border)]" aria-hidden />
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="relative flex gap-0 pb-8">
                <div className="flex flex-col items-center w-24 shrink-0 pt-0.5">
                  <div className="w-14 h-14 rounded-full bg-[var(--card-hover)] animate-pulse shrink-0" />
                  <div className="mt-2 h-6 w-20 rounded-full bg-[var(--card-hover)] animate-pulse" />
                </div>
                <div className="w-12 shrink-0 -ml-8 flex items-start pt-4" aria-hidden>
                  <div className="w-full h-px bg-[var(--border)]" />
                </div>
                <div className="flex-1 min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 animate-pulse">
                  <div className="h-5 w-3/4 rounded bg-[var(--card-hover)] mb-2" />
                  <div className="h-4 w-full rounded bg-[var(--card-hover)] mb-2" />
                  <div className="h-4 w-1/2 rounded bg-[var(--card-hover)]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
