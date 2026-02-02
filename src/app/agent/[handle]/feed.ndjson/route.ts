import { NextResponse } from "next/server";
import { getAgent, getReceiptsByAgent } from "@/lib/data";
import { artifactIcon, artifactLabel } from "@/lib/utils";
import type { Receipt } from "@/lib/types";

// GET /agent/:handle/feed.ndjson - NDJSON export of agent proof (with pills and icons)
function withPillsAndIcons(receipt: Receipt) {
  return {
    ...receipt,
    artifact_type_icon: artifactIcon(receipt.artifact_type),
    artifact_type_label: artifactLabel(receipt.artifact_type),
    artifacts: receipt.artifacts.map((a) => ({
      ...a,
      type_icon: artifactIcon(a.type),
      type_label: artifactLabel(a.type),
    })),
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const agent = await getAgent(handle);

  if (!agent) {
    return NextResponse.json(
      { error: "Agent not found" },
      { status: 404 }
    );
  }

  const receipts = await getReceiptsByAgent(agent.agent_id);
  const receiptsWithPills = receipts.map(withPillsAndIcons);

  const lines = receiptsWithPills.map((receipt) => JSON.stringify(receipt)).join("\n");

  return new NextResponse(lines, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Content-Disposition": `attachment; filename="${handle.replace("@", "")}-proof.ndjson"`,
    },
  });
}
