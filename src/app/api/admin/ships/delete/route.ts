import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { getDb } from "@/lib/db/client";

export async function POST(req: Request) {
  await requireAdminUser();
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 500 });

  const body = (await req.json()) as { ship_id: string };
  const shipId = String(body.ship_id || "").trim();
  if (!shipId) return NextResponse.json({ error: "ship_id required" }, { status: 400 });

  const { error: delErr } = await db.from("ships").delete().eq("ship_id", shipId);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, ship_id: shipId });
}
