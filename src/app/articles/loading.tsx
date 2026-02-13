import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrbsBackground } from "@/components/OrbsBackground";

export default function ArticlesLoading() {
  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col">
      <Header />
      <section className="flex-1 relative overflow-hidden bg-[var(--bg)]">
        <OrbsBackground />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[min(50vh,320px)] pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse 100% 80% at 50% 0%, var(--accent-muted) 0%, transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 flex gap-0 w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-12">
          <div className="hidden lg:block shrink-0 w-56 xl:w-64 pt-8 pr-6">
            <div className="h-4 w-24 bg-[var(--card)] rounded animate-pulse mb-4" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 w-full bg-[var(--card)] rounded animate-pulse" />
              ))}
            </div>
          </div>
          <div className="min-w-0 flex-1 max-w-4xl">
            <div className="h-9 w-48 bg-[var(--card)] rounded animate-pulse mb-4" />
            <div className="h-5 w-full max-w-xl bg-[var(--card)] rounded animate-pulse mb-10" />
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-[var(--card)] border border-[var(--border)] rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
