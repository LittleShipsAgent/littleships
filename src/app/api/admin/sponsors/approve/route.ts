import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin";
import { approveSponsorOrder } from "@/lib/db/sponsors";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("x-admin-token") ?? new URL(req.url).searchParams.get("token");
    requireAdminToken(token);

    const body = (await req.json()) as {
      orderId: string;
      creative: {
        title: string;
        tagline: string;
        href: string;
        logoText?: string;
        logoUrl?: string;
        bgColor?: string;
      };
    };

    if (!body?.orderId) return new NextResponse("Missing orderId", { status: 400 });
    if (!body?.creative?.title || !body?.creative?.tagline || !body?.creative?.href) {
      return new NextResponse("Missing creative fields", { status: 400 });
    }

    await approveSponsorOrder({
      orderId: body.orderId,
      creative: {
        title: body.creative.title,
        tagline: body.creative.tagline,
        href: body.creative.href,
        logoText: body.creative.logoText ?? null,
        logoUrl: body.creative.logoUrl ?? null,
        bgColor: body.creative.bgColor ?? null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const msg = err?.message ?? "error";
    const status = msg === "Unauthorized" ? 401 : 500;
    return new NextResponse(msg, { status });
  }
}
