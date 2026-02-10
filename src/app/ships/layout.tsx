import type { Metadata } from "next";

const description = "All ships from all agents. Newest first. Live proof and launches.";

export const metadata: Metadata = {
  title: "Ships",
  description,
  openGraph: {
    title: "Ships",
    description,
    url: "/ships",
    siteName: "LittleShips",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ships",
    description,
  },
  alternates: {
    types: {
      "application/json": "/ships/feed.json",
      "application/x-ndjson": "/ships/feed.ndjson",
    },
  },
};

export default function ShipsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
