"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SponsorOrderStatus = "pending_approval" | "active" | "rejected" | "canceled";

type SponsorCreative = {
  title: string;
  tagline: string;
  href: string;
  logo_text: string | null;
  logo_url: string | null;
  bg_color: string | null;
} | null;

type SponsorOrder = {
  id: string;
  created_at: string;
  purchaser_email: string | null;
  price_cents: number;
  slots_sold_at_purchase: number;
  stripe_subscription_id: string | null;
  status: SponsorOrderStatus;
  creative: SponsorCreative;
};

function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    cents / 100
  );
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

const TABS: Array<{ key: SponsorOrderStatus; label: string }> = [
  { key: "pending_approval", label: "Pending" },
  { key: "active", label: "Active" },
  { key: "rejected", label: "Rejected" },
  { key: "canceled", label: "Canceled" },
];

export function AdminSponsorsClient() {
  const [tab, setTab] = useState<SponsorOrderStatus>("pending_approval");
  const [orders, setOrders] = useState<SponsorOrder[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const hasInitialLoadCompleted = useRef(false);

  // Editable fields for approvals, keyed by order id.
  const [editByOrderId, setEditByOrderId] = useState<
    Record<
      string,
      {
        title: string;
        tagline: string;
        href: string;
        logoText: string;
        bgColor: string;
      }
    >
  >({});

  async function refresh(nextTab: SponsorOrderStatus = tab) {
    setErr(null);
    setOrders(null);

    const r = await fetch(`/api/admin/sponsors/orders/${nextTab}`, { cache: "no-store" });
    if (!r.ok) {
      setErr(await r.text());
      setOrders([]);
      return;
    }

    const j = await r.json();
    setOrders((j.orders ?? []) as SponsorOrder[]);
  }

  // Initial load: fetch pending first; if empty, default to active tab
  useEffect(() => {
    if (hasInitialLoadCompleted.current) return;
    let cancelled = false;
    fetch(`/api/admin/sponsors/orders/pending_approval`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(async (j: { orders?: SponsorOrder[] }) => {
        if (cancelled) return;
        const pending = j.orders ?? [];
        const initialTab: SponsorOrderStatus = pending.length > 0 ? "pending_approval" : "active";
        setTab(initialTab);
        setOrders(null);
        const r2 = await fetch(`/api/admin/sponsors/orders/${initialTab}`, { cache: "no-store" });
        if (cancelled) return;
        const j2 = r2.ok ? await r2.json() : { orders: [] };
        setOrders((j2.orders ?? []) as SponsorOrder[]);
        hasInitialLoadCompleted.current = true;
      })
      .catch(() => {
        if (!cancelled) {
          setTab("pending_approval");
          setOrders([]);
          hasInitialLoadCompleted.current = true;
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // When user changes tab, fetch that tab's data
  useEffect(() => {
    if (!hasInitialLoadCompleted.current) return;
    refresh(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // When we load pending orders, prefill edit state from submitted creative.
  useEffect(() => {
    if (!orders) return;
    if (tab !== "pending_approval") return;

    setEditByOrderId((curr) => {
      const next = { ...curr };
      for (const o of orders) {
        if (next[o.id]) continue;
        next[o.id] = {
          title: o.creative?.title ?? "",
          tagline: o.creative?.tagline ?? "",
          href: o.creative?.href ?? "",
          logoText: o.creative?.logo_text ?? "",
          bgColor: o.creative?.bg_color ?? "",
        };
      }
      return next;
    });
  }, [orders, tab]);

  async function approve(orderId: string) {
    setBusy(orderId);
    setErr(null);

    const fields = editByOrderId[orderId] ?? {
      title: "",
      tagline: "",
      href: "",
      logoText: "",
      bgColor: "",
    };

    const r = await fetch("/api/admin/sponsors/approve", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        orderId,
        creative: {
          title: fields.title.trim(),
          tagline: fields.tagline.trim(),
          href: fields.href.trim(),
          logoText: fields.logoText.trim() || null,
          bgColor: fields.bgColor.trim() || null,
        },
      }),
    });

    if (!r.ok) setErr(await r.text());
    await refresh(tab);
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
    await refresh(tab);
    setBusy(null);
  }

  const emptyText = useMemo(() => {
    switch (tab) {
      case "pending_approval":
        return "No pending sponsorship orders.";
      case "active":
        return "No active sponsors.";
      case "rejected":
        return "No rejected orders.";
      case "canceled":
        return "No canceled orders.";
    }
  }, [tab]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={
              tab === t.key
                ? "rounded-full bg-neutral-800 px-3 py-1.5 text-sm text-neutral-100"
                : "rounded-full bg-neutral-950 px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-200"
            }
          >
            {t.label}
          </button>
        ))}

        <button
          type="button"
          onClick={() => refresh(tab)}
          className="ml-auto rounded-full bg-neutral-950 px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-200"
        >
          Refresh
        </button>
      </div>

      {err && <div className="rounded border border-red-900 bg-red-950 p-3 text-sm">{err}</div>}

      {orders === null ? (
        <div className="text-sm text-neutral-400">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
          {emptyText}
        </div>
      ) : (
        orders.map((o) => {
          const editing = editByOrderId[o.id] ?? { title: "", tagline: "", href: "", logoText: "", bgColor: "" };

          return (
            <div key={o.id} className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide text-neutral-500">Order</div>
                  <div className="mt-1 font-mono text-xs text-neutral-300 break-all">{o.id}</div>
                  <div className="mt-2 text-sm text-neutral-300">
                    <span className="font-medium text-neutral-200">{money(o.price_cents)}</span>
                    <span className="text-neutral-500"> / mo</span>
                    <span className="text-neutral-600"> · </span>
                    <span className="text-neutral-400">Created {fmtDate(o.created_at)}</span>
                  </div>
                  {o.purchaser_email && <div className="mt-1 text-sm text-neutral-400">{o.purchaser_email}</div>}
                  {o.stripe_subscription_id && (
                    <div className="mt-1 font-mono text-xs text-neutral-600 break-all">sub: {o.stripe_subscription_id}</div>
                  )}
                </div>

                {tab !== "pending_approval" && o.creative && (
                  <div className="w-full sm:w-[340px] rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
                    <div className="text-xs uppercase tracking-wide text-neutral-500">Creative</div>
                    <div className="mt-2 text-sm text-neutral-200 font-medium">{o.creative.title}</div>
                    <div className="mt-1 text-sm text-neutral-400">{o.creative.tagline}</div>
                    <div className="mt-1 text-xs text-neutral-500 break-all">{o.creative.href}</div>
                  </div>
                )}
              </div>

              {tab === "pending_approval" && (
                <>
                  <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
                    <div className="text-xs uppercase tracking-wide text-neutral-500">Submitted draft</div>
                    {o.creative ? (
                      <div className="mt-2 text-sm text-neutral-300">
                        <div>
                          <span className="text-neutral-500">Title:</span> {o.creative.title}
                        </div>
                        <div>
                          <span className="text-neutral-500">Tagline:</span> {o.creative.tagline}
                        </div>
                        <div className="break-all">
                          <span className="text-neutral-500">URL:</span> {o.creative.href}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-neutral-500">No creative draft submitted yet.</div>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2">
                    <input
                      className="w-full rounded bg-neutral-900 px-3 py-2 text-sm"
                      placeholder="Title"
                      value={editing.title}
                      onChange={(e) =>
                        setEditByOrderId((m) => ({ ...m, [o.id]: { ...editing, title: e.target.value } }))
                      }
                    />
                    <input
                      className="w-full rounded bg-neutral-900 px-3 py-2 text-sm"
                      placeholder="Tagline"
                      value={editing.tagline}
                      onChange={(e) =>
                        setEditByOrderId((m) => ({ ...m, [o.id]: { ...editing, tagline: e.target.value } }))
                      }
                    />
                    <input
                      className="w-full rounded bg-neutral-900 px-3 py-2 text-sm"
                      placeholder="Href (https://…)"
                      value={editing.href}
                      onChange={(e) => setEditByOrderId((m) => ({ ...m, [o.id]: { ...editing, href: e.target.value } }))}
                    />
                    <input
                      className="w-full rounded bg-neutral-900 px-3 py-2 text-sm"
                      placeholder="Logo text (optional)"
                      value={editing.logoText}
                      onChange={(e) =>
                        setEditByOrderId((m) => ({ ...m, [o.id]: { ...editing, logoText: e.target.value } }))
                      }
                    />
                    <input
                      className="w-full rounded bg-neutral-900 px-3 py-2 text-sm"
                      placeholder="BG color (optional)"
                      value={editing.bgColor}
                      onChange={(e) =>
                        setEditByOrderId((m) => ({ ...m, [o.id]: { ...editing, bgColor: e.target.value } }))
                      }
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      className="rounded bg-emerald-700 px-3 py-2 text-sm font-medium hover:bg-emerald-600 disabled:opacity-50"
                      disabled={busy === o.id}
                      onClick={() => approve(o.id)}
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

                    <div className="ml-auto text-xs text-neutral-600 self-center">
                      Slots sold at purchase: {o.slots_sold_at_purchase}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
