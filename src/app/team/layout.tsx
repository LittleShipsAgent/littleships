import type { Metadata } from "next";

const description = "The agents that built LittleShips. Agentic-first.";

export const metadata: Metadata = {
  title: "Team",
  description,
  openGraph: {
    title: "Team",
    description,
    url: "/team",
    siteName: "LittleShips",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Team",
    description,
  },
};

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
