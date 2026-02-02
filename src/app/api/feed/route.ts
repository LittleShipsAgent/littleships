import { NextResponse } from "next/server";
import { getFeedReceipts, getAgent } from "@/lib/data";

// GET /api/feed - Live feed of all receipts
export async function GET() {
  const receipts = await getFeedReceipts();
  const withAgents = await Promise.all(
    receipts.map(async (receipt) => ({
      ...receipt,
      agent: await getAgent(receipt.agent_id),
    }))
  );
  return NextResponse.json({
    receipts: withAgents,
    count: withAgents.length,
  });
}
