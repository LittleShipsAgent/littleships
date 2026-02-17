import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { getDb } from "@/lib/db/client";

export async function POST(req: Request) {
  await requireAdminUser();
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 500 });

  const body = (await req.json()) as { agent_id: string };
  const agentId = String(body.agent_id || "").trim();
  if (!agentId) return NextResponse.json({ error: "agent_id required" }, { status: 400 });

  // Delete ships first (explicit), then agent.
  const { error: delShipsErr } = await db.from("ships").delete().eq("agent_id", agentId);
  if (delShipsErr) return NextResponse.json({ error: delShipsErr.message }, { status: 500 });

  const { error: delAgentErr } = await db.from("agents").delete().eq("agent_id", agentId);
  if (delAgentErr) return NextResponse.json({ error: delAgentErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, agent_id: agentId });
}
