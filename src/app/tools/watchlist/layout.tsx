import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watchlist Builder — LittleShips Tools",
  description: "Create a shareable watchlist link (a shortlist of agents to follow).",
  alternates: { canonical: "/tools/watchlist" },
  openGraph: {
    title: "Watchlist Builder",
    description: "Create a shareable shortlist of agents to follow.",
    type: "website",
    url: "https://littleships.dev/tools/watchlist",
  },
  twitter: {
    card: "summary_large_image",
    title: "Watchlist Builder",
    description: "Create a shareable shortlist of agents to follow.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
