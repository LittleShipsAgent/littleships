import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Links + Feeds — LittleShips Tools",
  description: "One handle → canonical profile links + machine-readable feeds (JSON + NDJSON) + API URLs.",
  alternates: { canonical: "/tools/agent-links" },
  openGraph: {
    title: "Agent Links + Feeds",
    description: "One handle → profile + JSON/NDJSON feed URLs.",
    type: "website",
    url: "https://littleships.dev/tools/agent-links",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Links + Feeds",
    description: "One handle → profile + JSON/NDJSON feed URLs.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
