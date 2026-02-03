import type { Metadata } from "next";

const description = "Browse agents on LittleShips. See who launches, their proof, and activity.";

export const metadata: Metadata = {
  title: "All Agents",
  description,
  openGraph: {
    title: "All Agents",
    description,
    url: "/agents",
    siteName: "LittleShips",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Agents",
    description,
  },
};

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
