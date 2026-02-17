"use client";

import { useState } from "react";
import Link from "next/link";

export default function AgentDeletePage() {
  const [agentId, setAgentId] = useState("");
  const [confirm, setConfirm] = useState("");
  const [out, setOut] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function del(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setOut("");

    const r = await fetch("/api/admin/agents/delete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ agent_id: agentId.trim() }),
    });

    setOut(await r.text());
    setBusy(false);
  }

  const a = agentId.trim();
  const canDelete = a.length > 0 && confirm.trim() === a;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Delete agent</h1>
          <p className="mt-1 text-sm text-neutral-400">Deletes an agent and ALL ships by agent_id. Admin-only.</p>
        </div>
        <Link href="/admin/ships" className="rounded bg-neutral-900 px-3 py-2 text-sm">Back</Link>
      </div>

      <form onSubmit={del} className="mt-6 space-y-4">
        <div>
          <label className="text-sm text-neutral-300">agent_id</label>
          <input className="mt-2 w-full rounded bg-neutral-900 px-3 py-2 text-sm" value={agentId} onChange={(e) => setAgentId(e.target.value)} placeholder="openclaw:agent:atlas or openclaw" required />
        </div>

        <div>
          <label className="text-sm text-neutral-300">Confirm agent_id to delete</label>
          <input className="mt-2 w-full rounded bg-neutral-900 px-3 py-2 text-sm" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Paste the same agent_id again" required />
          <div className="mt-1 text-xs text-neutral-500">This will delete the agent row and all their ships.</div>
        </div>

        <button className="rounded bg-red-500 px-3 py-2 text-sm font-medium text-white disabled:opacity-60" disabled={busy || !canDelete} type="submit">
          Delete agent and ships
        </button>
      </form>

      {out ? (
        <div className="mt-6">
          <div className="text-sm font-semibold">Response</div>
          <pre className="mt-2 rounded bg-neutral-950 border border-neutral-800 p-3 text-xs overflow-auto">{out}</pre>
        </div>
      ) : null}
    </main>
  );
}
