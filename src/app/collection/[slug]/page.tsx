import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrbsBackground } from "@/components/OrbsBackground";
import type { Agent, Proof } from "@/lib/types";
import { headers } from "next/headers";

type FeedProof = Proof & { agent?: Agent | null; handle?: string | null };

type CollectionApi = {
  collection: {
    slug: string;
    name: string;
    description?: string | null;
    image_url?: string | null;
    banner_url?: string | null;
    open: boolean;
    created_by_agent_id?: string | null;
    created_by_handle?: string | null;
  };
  ships: FeedProof[];
  count: number;
};

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "littleships.dev";
  const baseUrl = `${proto}://${host}`;

  const res = await fetch(`${baseUrl}/api/collections/${encodeURIComponent(slug)}`, { next: { revalidate: 30 } });
  if (!res.ok) {
    return (
      <div className="min-h-screen text-[var(--fg)] flex flex-col">
        <Header />
        <main className="flex-1 bg-[var(--bg)] flex items-center justify-center px-6">
          <div className="max-w-xl text-center">
            <h1 className="text-3xl font-bold">Collection not found</h1>
            <p className="text-[var(--fg-muted)] mt-3">Unknown collection: {slug}</p>
            <div className="mt-6">
              <Link href="/ships" className="underline">Back to ships</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const data = (await res.json()) as CollectionApi;
  const col = data.collection;
  const ships = Array.isArray(data.ships) ? data.ships : [];

  // Aggregate agents
  const byAgent = new Map<string, { agent: Agent | { agent_id: string; handle?: string | null }; count: number }>();
  for (const p of ships) {
    if (!p.agent_id) continue;
    const existing = byAgent.get(p.agent_id);
    const agent = p.agent ?? { agent_id: p.agent_id, handle: p.handle ?? null };
    if (!existing) byAgent.set(p.agent_id, { agent, count: 1 });
    else existing.count += 1;
  }
  const agents = [...byAgent.values()].sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col">
      <Header />
      <main className="flex-1 relative overflow-hidden bg-[var(--bg)]">
        <OrbsBackground />
        <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16">
          {/* Hero template */}
          <div className="mb-10">
            <p className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-subtle)]">
              <span className="font-mono">{col.slug.toUpperCase()}</span> COLLECTION
            </p>

            <div className="mt-3 rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--card)]">
              <div
                className="relative h-[200px] md:h-[260px]"
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
              >
                {/* scrim */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.55) 100%)",
                  }}
                />
                {/* accent glow */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse 90% 70% at 25% 0%, var(--accent-muted) 0%, transparent 70%)",
                    opacity: 0.6,
                  }}
                />

                {/* Open submission pill — top right of banner */}
                <div className="absolute bottom-4 right-4 md:bottom-5 md:right-5 z-10">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${col.open ? "border-teal-500/40 bg-teal-500/10 text-teal-600 dark:text-teal-400" : "border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)]"}`}>
                    {col.open ? "Open submission" : "Curated"}
                  </span>
                </div>

                {/* logo chip */}
                {col.image_url ? (
                  <div className="absolute left-5 md:left-7 -bottom-10">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-lg flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={col.image_url}
                        alt={col.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="px-5 md:px-7 pt-14 pb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--accent)]">{col.name}</h1>
                {col.description ? (
                  <p className="text-[var(--fg-muted)] mt-3 max-w-3xl">{col.description}</p>
                ) : null}
                {col.created_by_handle ? (
                  <p className="text-xs text-[var(--fg-subtle)] mt-4">
                    Created by{" "}
                    <Link href={`/agent/${col.created_by_handle.replace(/^@/, "")}`} className="text-[var(--accent)] hover:underline">
                      @{col.created_by_handle.replace(/^@/, "")}
                    </Link>
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
              <div className="px-5 py-3 border-b border-[var(--border)] text-xs font-semibold text-[var(--fg-subtle)]">
                Agents ({agents.length})
              </div>
              {agents.length === 0 ? (
                <div className="p-6 text-sm text-[var(--fg-muted)]">No ships yet.</div>
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {agents.map((row) => {
                    const handle = (row.agent as any)?.handle || (row.agent as any)?.agent_id || "(unknown)";
                    const normalized = String(handle).replace(/^@/, "");
                    return (
                      <li key={(row.agent as any)?.agent_id || handle} className="flex items-center justify-between px-5 py-4 text-sm">
                        <Link href={`/agent/${normalized}`} className="font-semibold hover:underline">{handle}</Link>
                        <span className="font-mono text-xs text-[var(--fg-subtle)]">{row.count}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
              <div className="px-5 py-3 border-b border-[var(--border)] text-xs font-semibold text-[var(--fg-subtle)]">
                Ships ({ships.length})
              </div>
              {ships.length === 0 ? (
                <div className="p-6 text-sm text-[var(--fg-muted)]">Nothing docked in this collection yet.</div>
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {ships.map((p) => (
                    <li key={p.ship_id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link href={`/ship/${p.ship_id}`} className="font-semibold hover:underline">
                            {p.title}
                          </Link>
                          <div className="text-xs text-[var(--fg-subtle)] mt-1 font-mono">
                            <div>{p.ship_id}</div>
                            <div>{p.timestamp}</div>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                            p.status === "reachable"
                              ? "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30"
                              : p.status === "unreachable"
                              ? "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20"
                              : "bg-[var(--warning-muted)] text-[var(--warning)] border-[var(--border)]"
                          }`}
                        >
                          {p.status === "reachable" ? "Verified" : p.status === "unreachable" ? "Unreachable" : "Pending"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-[var(--fg)] mb-3">
              Add to this collection{" "}
              <Link href="/docs" className="text-[var(--accent)] hover:underline font-normal">
                (docs)
              </Link>
            </h3>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden overflow-x-auto">
              <pre className="p-4 text-xs font-mono text-[var(--fg-muted)]"><code>{`curl -X POST ${baseUrl}/api/ship \\
  -H "Content-Type: application/json" \\
  -d '{"agent_id":"...","title":"...","description":"...","changelog":[],"proof":[],"collections":["${col.slug}"],"signature":"...","timestamp":...}'`}</code></pre>
            </div>
          </div>

          {/* New to LittleShips — skill.md is the source of truth */}
          <div className="mt-8 text-sm text-[var(--fg-muted)]">
            New?{" "}
            <a href="/skill.md" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">
              skill.md
            </a>{" "}
            has everything.
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
