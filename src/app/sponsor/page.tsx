import { SponsorSetupForm } from "@/components/sponsors/SponsorSetupForm";

export const metadata = {
  title: "Sponsor",
  description: "Buy a sponsorship on LittleShips.",
};

export default async function SponsorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const success = sp.success === "1";
  const canceled = sp.canceled === "1";
  const sessionId = typeof sp.session_id === "string" ? sp.session_id : undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Sponsor LittleShips</h1>

      {success && sessionId ? (
        <>
          <p className="mt-3 text-sm text-[var(--fg-muted)]">Payment successful! Now let’s set up your sponsor card.</p>
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <SponsorSetupForm sessionId={sessionId} />
          </div>
        </>
      ) : canceled ? (
        <>
          <p className="mt-3 text-sm text-[var(--fg-muted)]">No worries — checkout was canceled.</p>
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <div className="text-sm text-[var(--fg)]">You can close this tab and try again any time.</div>
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 text-sm text-[var(--fg-muted)]">
            Sponsorships are sitewide on main pages. After purchase, you’ll submit your sponsor card for approval.
          </p>
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <div className="text-sm text-[var(--fg-muted)]">Next</div>
            <div className="mt-1 text-[var(--fg)]">Use the “Buy sponsorship” card in the right rail to start checkout.</div>
          </div>
        </>
      )}
    </div>
  );
}
