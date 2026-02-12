import Link from "next/link";
import { requireAdminUser } from "@/lib/admin-auth";
import { AdminSponsorsClient } from "./AdminSponsorsClient";

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
