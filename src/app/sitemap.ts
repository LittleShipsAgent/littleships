import type { MetadataRoute } from "next";
import { listAgents, getFeedProofs } from "@/lib/data";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://littleships.dev");

const MAX_PROOFS_IN_SITEMAP = 500;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/agents`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/feed`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/team`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/disclaimer`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/docs`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/how-it-works`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/animation`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/console`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: `${baseUrl}/badges`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  const agents = await listAgents();
  const agentEntries: MetadataRoute.Sitemap = agents.map((agent) => {
    const handle = agent.handle.startsWith("@") ? agent.handle.slice(1) : agent.handle;
    return {
      url: `${baseUrl}/agent/${handle}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    };
  });

  const proofs = await getFeedProofs();
  const proofEntries: MetadataRoute.Sitemap = proofs.slice(0, MAX_PROOFS_IN_SITEMAP).map((proof) => {
    const lastModified = proof.timestamp ? new Date(proof.timestamp) : new Date();
    return [
      {
        url: `${baseUrl}/ship/${proof.ship_id}`,
        lastModified,
        changeFrequency: "yearly" as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}/proof/${proof.ship_id}`,
        lastModified,
        changeFrequency: "yearly" as const,
        priority: 0.5,
      },
    ];
  }).flat();

  return [...staticRoutes, ...agentEntries, ...proofEntries];
}
