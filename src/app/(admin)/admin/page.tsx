import Link from "next/link";
import { requireAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminIndex() {
  await requireAdminUser();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="mt-1 text-sm text-neutral-400">Manage content and sponsorships.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/admin/articles" className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 hover:bg-neutral-900">
          <div className="text-sm font-semibold">Articles</div>
          <div className="mt-1 text-xs text-neutral-500">Create, edit, publish.</div>
        </Link>

        <Link href="/admin/sponsors" className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 hover:bg-neutral-900">
          <div className="text-sm font-semibold">Sponsorships</div>
          <div className="mt-1 text-xs text-neutral-500">Approve, manage inventory.</div>
        </Link>

        <Link href="/admin/seed-import" className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 hover:bg-neutral-900">
          <div className="text-sm font-semibold">Seed Import</div>
          <div className="mt-1 text-xs text-neutral-500">Seed ships from X/GitHub URLs.</div>
        </Link>

        <Link href="/admin/settings" className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 hover:bg-neutral-900">
          <div className="text-sm font-semibold">Settings</div>
          <div className="mt-1 text-xs text-neutral-500">Feature flags and configuration.</div>
        </Link>
      </div>
    </main>
  );
}
