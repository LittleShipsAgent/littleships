import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { getDb } from "@/lib/db/client";
import { insertShip, insertAgent, getAgent } from "@/lib/data";
import type { Ship } from "@/lib/types";

function extractBullets(text: string): string[] {
  const lines = (text || "").split(/\r?\n/).map((l) => l.trim());
  const out: string[] = [];
  for (const l of lines) {
    const m = l.match(/^(?:[-*•]|\d+\.)\s+(.*)$/);
    if (m && m[1]) out.push(m[1]);
  }
  return out.filter(Boolean).slice(0, 20);
}

function extractUrls(text: string): string[] {
  const re = /https?:\/\/[^\s)\]}]+/g;
  const m = text.match(re) ?? [];
  return [...new Set(m.map((s) => s.replace(/[\.,;]+$/, "")))];
}

function inferProofTypeFromUrl(url: string): Ship["proof_type"] {
  if (url.includes("github.com")) return "github";
  return "link";
}

function choosePrimaryProofType(urls: string[]): Ship["proof_type"] {
  // Prefer github if any github proof exists. Otherwise fall back to first URL inference.
  if (urls.some((u) => u.includes("github.com"))) return "github";
  return inferProofTypeFromUrl(urls[0] ?? "");
}

export async function POST(req: Request) {
  await requireAdminUser();
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 500 });

  const body = (await req.json()) as {
    kind: "x_assisted";
    url: string;
    text?: string;
    links?: string[];
    handle?: string; // optional override
  };

  if (body.kind !== "x_assisted") {
    return NextResponse.json({ error: "Unsupported kind" }, { status: 400 });
  }

  const xUrl = String(body.url || "").trim();
  if (!xUrl.startsWith("https://x.com/")) {
    return NextResponse.json({ error: "Expected x.com status URL" }, { status: 400 });
  }

  const tweetIdMatch = xUrl.match(/\/status\/(\d+)/);
  const tweetId = tweetIdMatch?.[1];
  if (!tweetId) return NextResponse.json({ error: "Could not parse tweet id" }, { status: 400 });

  const inputText = String(body.text || "").trim();
  if (!inputText) {
    return NextResponse.json({ error: "Paste tweet/thread text (X fetch may be blocked)." }, { status: 400 });
  }
  const urlLinks = Array.isArray(body.links) ? body.links : [];
  const bullets = extractBullets(inputText);
  const extracted = [...extractUrls(inputText), ...urlLinks];
  const links = [...new Set([xUrl, ...extracted])];

  // Create import run
  const { data: run, error: runErr } = await db
    .from("seed_import_runs")
    .insert({ source_type: "x", source_url: xUrl, input_text: inputText || null, input_json: { links }, status: "pending" })
    .select("*")
    .single();
  if (runErr || !run) return NextResponse.json({ error: runErr?.message ?? "Failed to create run" }, { status: 500 });

  // Resolve agent handle
  const handle = (body.handle ? body.handle : "@openclaw").trim();
  const existing = await getAgent(handle);
  let agentId = existing?.agent_id;

  if (!agentId) {
    // Create an unclaimed seeded agent (DB-first)
    const created = await insertAgent({
      agent_id: `seed:${handle.replace(/^@/, "")}`,
      handle,
      description: "Seeded profile (unclaimed)",
      x_profile: handle,
      capabilities: [],
    });
    agentId = created.agent_id;

    // Mark provenance on agents table (best-effort; if column missing, ignore)
    try {
      await db
        .from("agents")
        .update({ claim_status: "unclaimed", source_type: "x", source_ref: `x:handle:${handle.toLowerCase()}`, seeded_import_run_id: run.id })
        .eq("agent_id", agentId);
    } catch {
      // ignore
    }
  }

  // Create seeded ship (idempotent). If it already exists, return existing ship_id.
  // Create seeded ship (idempotent + refreshable).
  const sourceRef = `x:status:${tweetId}`;
  const now = new Date().toISOString();
  const proofItems = links.map((u) => ({ type: inferProofTypeFromUrl(u), value: u }));

  // Title heuristics: prefer first non-empty line, but keep it short and meaningful.
  const firstLine = inputText.split("
").map((l) => l.trim()).find(Boolean) ?? "Update";
  const title = firstLine.length > 140 ? firstLine.slice(0, 140) + "…" : firstLine;

  const ship: Ship = {
    ship_id: "", // ignored; insertShip generates
    agent_id: agentId!,
    title,
    description: inputText,
    changelog: bullets.length ? bullets : inputText.split(/?
/).map((l) => l.trim()).filter(Boolean).slice(0, 8),
    proof_type: choosePrimaryProofType(links),
    proof: proofItems,
    timestamp: now,
    status: "reachable",
  };

  const { data: existingShip } = await db
    .from("ships")
    .select("ship_id")
    .eq("source_type", "x")
    .eq("source_ref", sourceRef)
    .maybeSingle();
  if (existingShip?.ship_id) {
    // Update the existing seeded ship in-place (idempotent + refreshable).
    const row = {
      title: ship.title,
      description: ship.description ?? null,
      changelog: ship.changelog ?? null,
      proof_type: ship.proof_type,
      proof: ship.proof,
      timestamp: ship.timestamp,
      status: ship.status,
      seeded_import_run_id: run.id,
      seeded_at: new Date().toISOString(),
    };
    await db.from("ships").update(row).eq("ship_id", existingShip.ship_id);
    await db.from("seed_import_runs").update({ status: "applied", applied_at: new Date().toISOString() }).eq("id", run.id);
    return NextResponse.json({ ok: true, run_id: run.id, ship_id: existingShip.ship_id, agent_id: agentId, updated: true });
  }
  const now = new Date().toISOString();
  const proofItems = links.map((u) => ({ type: inferProofTypeFromUrl(u), value: u }));

  // Title heuristics: prefer first non-empty line, but keep it short and meaningful.
  const firstLine = inputText.split("\n").map((l) => l.trim()).find(Boolean) ?? "Update";
  const title = firstLine.length > 140 ? firstLine.slice(0, 140) + "…" : firstLine;

  const ship: Ship = {
    ship_id: "", // ignored; insertShip generates
    agent_id: agentId!,
    title,
    description: inputText,
    changelog: bullets.length ? bullets : inputText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(0, 8),
    proof_type: choosePrimaryProofType(links),
    proof: proofItems,
    timestamp: now,
    status: "reachable",
  };

  // Insert via insertShip, then tag seeded columns directly.
  const inserted = await insertShip(ship);
  await db
    .from("ships")
    .update({
      source_type: "x",
      source_ref: sourceRef,
      seeded_import_run_id: run.id,
      seeded_at: new Date().toISOString(),
    })
    .eq("ship_id", inserted.ship_id);

  await db.from("seed_import_runs").update({ status: "applied", applied_at: new Date().toISOString() }).eq("id", run.id);

  return NextResponse.json({ ok: true, run_id: run.id, ship_id: inserted.ship_id, agent_id: agentId });
}
