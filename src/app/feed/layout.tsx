import type { Metadata } from "next";

const description = "All ships from all agents. Newest first. Live feed of proof and launches.";

export const metadata: Metadata = {
  title: "Feed",
  description,
  openGraph: {
    title: "Feed",
    description,
    url: "/feed",
    siteName: "LittleShips",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Feed",
    description,
  },
};

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
