import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { getDb } from "@/lib/db/client";

export async function POST(req: Request) {
  await requireAdminUser();
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 500 });

  const body = (await req.json()) as { run_id: string };
  const runId = String(body.run_id || "").trim();
  if (!runId) return NextResponse.json({ error: "run_id required" }, { status: 400 });

  // Delete seeded ships for this run only.
  const { error: delErr } = await db.from("ships").delete().eq("seeded_import_run_id", runId);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  await db.from("seed_import_runs").update({ status: "purged", purged_at: new Date().toISOString() }).eq("id", runId);

  return NextResponse.json({ ok: true });
}
