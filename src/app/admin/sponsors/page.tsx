import Link from "next/link";
import { requireAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminSponsorsPage() {
  await requireAdminUser();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Admin · Sponsorships</h1>
        <p className="mt-1 text-sm text-neutral-400">Review pending sponsorships and approve them to go live.</p>
      </div>

      <AdminSponsorsClient />

      <div className="mt-10 text-sm text-neutral-500">
        <Link className="underline" href="/">Back to site</Link>
      </div>
    </main>
  );
}

function AdminSponsorsClient() {
  // Client component (inline) to keep file count down.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const React = require("react") as typeof import("react");
  const { useEffect, useState } = React;

  type Pending = {
    id: string;
    created_at: string;
    purchaser_email: string | null;
    price_cents: number;
    slots_sold_at_purchase: number;
  };

  const [pending, setPending] = useState<Pending[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  function money(cents: number) {
    return `$${(cents / 100).toFixed(0)}`;
  }

  async function refresh() {
    setErr(null);
    const r = await fetch("/api/admin/sponsors/pending");
    if (!r.ok) {
      setErr(await r.text());
      setPending([]);
      return;
    }
    const j = await r.json();
    setPending(j.pending ?? []);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function approve(orderId: string, creative: any) {
    setBusy(orderId);
    setErr(null);
    const r = await fetch("/api/admin/sponsors/approve", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderId, creative }),
    });
    if (!r.ok) setErr(await r.text());
    await refresh();
    setBusy(null);
  }

  async function reject(orderId: string) {
    setBusy(orderId);
    setErr(null);
    const r = await fetch("/api/admin/sponsors/reject", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    if (!r.ok) setErr(await r.text());
    await refresh();
    setBusy(null);
  }

  if (pending === null) {
    return <div className="text-sm text-neutral-400">Loading…</div>;
  }

  return (
    <div className="space-y-4">
      {err && <div className="rounded border border-red-900 bg-red-950 p-3 text-sm">{err}</div>}

      {pending.length === 0 ? (
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
          No pending sponsorship orders.
        </div>
      ) : (
        pending.map((o) => (
          <div key={o.id} className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-sm text-neutral-400">Order</div>
                <div className="font-mono text-xs text-neutral-300">{o.id}</div>
              </div>
              <div className="text-right text-sm text-neutral-300">
                <div>
                  {money(o.price_cents)} / mo · slotsSold@purchase {o.slots_sold_at_purchase}
                </div>
                {o.purchaser_email && <div className="text-neutral-500">{o.purchaser_email}</div>}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2">
              <input className="w-full rounded bg-neutral-900 px-3 py-2 text-sm" placeholder="Title" id={`t-${o.id}`} />
              <input className="w-full rounded bg-neutral-900 px-3 py-2 text-sm" placeholder="Tagline" id={`g-${o.id}`} />
              <input className="w-full rounded bg-neutral-900 px-3 py-2 text-sm" placeholder="Href (https://…)" id={`h-${o.id}`} />
              <input className="w-full rounded bg-neutral-900 px-3 py-2 text-sm" placeholder="Logo text (optional)" id={`l-${o.id}`} />
              <input className="w-full rounded bg-neutral-900 px-3 py-2 text-sm" placeholder="BG color (optional)" id={`b-${o.id}`} />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                className="rounded bg-emerald-700 px-3 py-2 text-sm font-medium hover:bg-emerald-600 disabled:opacity-50"
                disabled={busy === o.id}
                onClick={() => {
                  const title = (document.getElementById(`t-${o.id}`) as HTMLInputElement)?.value?.trim();
                  const tagline = (document.getElementById(`g-${o.id}`) as HTMLInputElement)?.value?.trim();
                  const href = (document.getElementById(`h-${o.id}`) as HTMLInputElement)?.value?.trim();
                  const logoText = (document.getElementById(`l-${o.id}`) as HTMLInputElement)?.value?.trim();
                  const bgColor = (document.getElementById(`b-${o.id}`) as HTMLInputElement)?.value?.trim();
                  approve(o.id, { title, tagline, href, logoText, bgColor });
                }}
              >
                Approve & publish
              </button>

              <button
                className="rounded bg-neutral-800 px-3 py-2 text-sm font-medium hover:bg-neutral-700 disabled:opacity-50"
                disabled={busy === o.id}
                onClick={() => reject(o.id)}
              >
                Reject (cancel sub)
              </button>

              <button
                className="ml-auto rounded bg-neutral-900 px-3 py-2 text-sm hover:bg-neutral-800"
                disabled={busy === o.id}
                onClick={() => refresh()}
              >
                Refresh
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
