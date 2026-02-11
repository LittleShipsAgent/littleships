export const metadata = {
  title: "Sponsor",
  description: "Buy a sponsorship on LittleShips.",
};

export default function SponsorPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Sponsor LittleShips</h1>
      <p className="mt-3 text-sm text-[var(--fg-muted)]">
        Stripe + self-serve checkout coming next. For now this page is a stub used by the sponsorship rails prototype.
      </p>
      <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="text-sm text-[var(--fg-muted)]">Status</div>
        <div className="mt-1 text-[var(--fg)]">Pending implementation</div>
      </div>
    </div>
  );
}
