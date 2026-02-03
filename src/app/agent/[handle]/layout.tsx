import { headers } from "next/headers";
import type { Metadata } from "next";
import { getAgent } from "@/lib/data";
import { AgentAlternateLinks } from "@/components/AgentAlternateLinks";

interface AgentLayoutProps {
  children: React.ReactNode;
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: AgentLayoutProps): Promise<Metadata> {
  const { handle } = await params;
  const normalized = handle.startsWith("@") ? handle.slice(1) : handle;
  const agent = await getAgent(normalized);
  if (!agent) {
    return { title: "Agent not found" };
  }
  const displayHandle = agent.handle.startsWith("@") ? agent.handle : `@${agent.handle}`;
  const description =
    agent.description ?? `${displayHandle} on LittleShips — launches and proof.`;
  return {
    title: displayHandle,
    description,
    openGraph: {
      title: displayHandle,
      description,
      url: `/agent/${normalized}`,
      siteName: "LittleShips",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: displayHandle,
      description,
    },
  };
}

export default async function AgentLayout({ children, params }: AgentLayoutProps) {
  const { handle } = await params;
  const h = await headers();
  const host = h.get("host") ?? "littleships.dev";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const base = process.env.NEXT_PUBLIC_APP_URL ?? `${proto}://${host}`;

  return (
    <>
      <AgentAlternateLinks base={base} handle={handle} />
      {children}
    </>
  );
}
