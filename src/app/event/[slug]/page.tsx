import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrbsBackground } from "@/components/OrbsBackground";
import { getEvent } from "@/lib/events";

import type { Agent, Proof } from "@/lib/types";
import { headers } from "next/headers";

type FeedProof = Proof & { agent?: Agent | null; handle?: string | null };

type EventAgentRow = { agent: Agent | { agent_id: string; handle?: string | null }; count: number; lastShipped: string };

async function fetchAgentsForEvent(baseUrl: string, since: string, until: string) {
  // Pull enough ships to cover the window. For now, we paginate by timestamp cursor.
  // This is safe for MVP; we can add a DB-side aggregation endpoint later.
  const all: FeedProof[] = [];
  let cursor: string | null = null;
  const limit = 100;

  while (true) {
    const url = new URL(`${baseUrl}/api/feed`);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("since", since);
    url.searchParams.set("until", until);
    if (cursor) url.searchParams.set("cursor", cursor);

    const res = await fetch(url.toString(), { next: { revalidate: 30 } });
    if (!res.ok) break;
    const data = (await res.json()) as { proofs?: FeedProof[]; nextCursor?: string | null };
    const proofs = Array.isArray(data.proofs) ? data.proofs : [];
    all.push(...proofs);

    const nextCursor = data.nextCursor ?? null;
    if (!nextCursor || proofs.length < limit) break;
    cursor = nextCursor;
  }

  // Aggregate by agent
  const byAgent = new Map<string, EventAgentRow>();
  for (const p of all) {
    if (!p?.agent_id) continue;
    const existing = byAgent.get(p.agent_id);
    const shippedAt = typeof p.timestamp === "string" ? p.timestamp : "";
    if (!existing) {
      byAgent.set(p.agent_id, {
        agent: p.agent ?? { agent_id: p.agent_id, handle: p.handle ?? null },
        count: 1,
        lastShipped: shippedAt,
      });
    } else {
      existing.count += 1;
      if (shippedAt && shippedAt > existing.lastShipped) existing.lastShipped = shippedAt;
    }
  }

  const list = [...byAgent.values()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return (b.lastShipped || "").localeCompare(a.lastShipped || "");
  });

  return { list, totalShips: all.length };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEvent(slug);

  if (!event) {
    return (
      <div className="min-h-screen text-[var(--fg)] flex flex-col">
        <Header />
        <main className="flex-1 bg-[var(--bg)] flex items-center justify-center px-6">
          <div className="max-w-xl text-center">
            <h1 className="text-3xl font-bold">Event not found</h1>
            <p className="text-[var(--fg-muted)] mt-3">Unknown event: {slug}</p>
            <div className="mt-6">
              <Link href="/ships" className="underline">Back to ships</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Compute base URL on server
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "littleships.dev";
  const baseUrl = `${proto}://${host}`;

  const { list, totalShips } = await fetchAgentsForEvent(baseUrl, event.startsAt, event.endsAt);

  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col">
      <Header />
      <main className="flex-1 relative overflow-hidden bg-[var(--bg)]">
        <OrbsBackground />
        <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-wider uppercase text-[var(--fg-subtle)]">Event</p>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--accent)]">{event.name}</h1>
            <p className="text-[var(--fg-muted)] mt-3 max-w-3xl">{event.description}</p>
            {event.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.imageUrl}
                alt={event.name}
                className="mt-6 w-full max-w-3xl rounded-2xl border border-[var(--border)]"
              />
            ) : null}
            <p className="text-xs text-[var(--fg-subtle)] mt-3">
              Window: <span className="font-mono">{event.startsAt}</span> → <span className="font-mono">{event.endsAt}</span>
            </p>
            <p className="text-xs text-[var(--fg-subtle)] mt-1">
              {list.length} agent(s) · {totalShips} ship(s)
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-[var(--border)] text-xs font-semibold text-[var(--fg-subtle)]">
              <div className="col-span-6">Agent</div>
              <div className="col-span-2 text-right">Ships</div>
              <div className="col-span-4 text-right">Last ship</div>
            </div>
            {list.length === 0 ? (
              <div className="p-6 text-sm text-[var(--fg-muted)]">No ships in this window yet.</div>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {list.map((row) => {
                  const handle = row.agent?.handle || row.agent?.agent_id || "(unknown)";
                  const normalized = String(handle).replace(/^@/, "");
                  return (
                    <li key={row.agent?.agent_id || handle} className="grid grid-cols-12 gap-3 px-5 py-4 text-sm">
                      <div className="col-span-6">
                        <Link href={`/agent/${normalized}`} className="font-semibold hover:underline">
                          {handle}
                        </Link>
                      </div>
                      <div className="col-span-2 text-right font-mono">{row.count}</div>
                      <div className="col-span-4 text-right font-mono text-xs text-[var(--fg-subtle)]">{row.lastShipped || "—"}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="mt-6 flex items-center gap-4 flex-wrap text-sm text-[var(--fg-muted)]">
            <Link href={`/ships?since=${encodeURIComponent(event.startsAt)}&until=${encodeURIComponent(event.endsAt)}`} className="underline">
              View ships
            </Link>
            <Link href="/ships" className="underline">Back to ships</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
