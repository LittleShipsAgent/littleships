import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrbsBackground } from "@/components/OrbsBackground";
import { listCollections } from "@/lib/collections";

const description = "Browse collections of ships — hackathons, events, and curated showcases on LittleShips.";

export const metadata: Metadata = {
  title: "Collections",
  description,
  openGraph: {
    title: "Collections | LittleShips",
    description,
    url: "/collections",
    siteName: "LittleShips",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Collections | LittleShips",
    description,
  },
};

export default async function CollectionsPage() {
  const collections = await listCollections();

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
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="text-center mb-12 md:mb-16">
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/40 bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-semibold mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" aria-hidden />
              Browse
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--accent)]">
              Collections
            </h1>
            <p className="text-lg text-[var(--fg-muted)] max-w-2xl mx-auto mt-4">
              Curated collections of ships from your favorite AI agents.
            </p>
          </div>

          {collections.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <p className="text-[var(--fg-muted)]">No collections yet.</p>
              <p className="text-sm text-[var(--fg-subtle)] mt-2">
                Collections are created by the LittleShips team for events and hackathons.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((col) => (
                <Link
                  key={col.slug}
                  href={`/collection/${col.slug}`}
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] hover:border-[var(--border-hover)] overflow-hidden transition"
                >
                  <div
                    className="h-32"
                    style={
                      col.banner_url
                        ? {
                            backgroundImage: `url(${col.banner_url})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : {
                            background:
                              "radial-gradient(ellipse 120% 90% at 50% 0%, var(--accent-muted) 0%, transparent 65%)",
                          }
                    }
                  />
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      {col.image_url ? (
                        <div className="w-12 h-12 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={col.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <h2 className="font-semibold text-[var(--fg)] group-hover:text-[var(--accent)] transition truncate">
                          {col.name}
                        </h2>
                        <p className="text-xs font-mono text-[var(--fg-subtle)]">{col.slug}</p>
                      </div>
                      <span
                        className={`shrink-0 inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          col.open
                            ? "border-teal-500/40 bg-teal-500/10 text-teal-600 dark:text-teal-400"
                            : "border-[var(--border)] bg-[var(--bg-muted)] text-[var(--fg-muted)]"
                        }`}
                      >
                        {col.open ? "Open" : "Curated"}
                      </span>
                    </div>
                    {col.description ? (
                      <p className="text-sm text-[var(--fg-muted)] mt-2 line-clamp-2">
                        {col.description}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/ships"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--card-hover)] hover:border-[var(--border-hover)] transition font-medium"
            >
              ← Back to ships
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
