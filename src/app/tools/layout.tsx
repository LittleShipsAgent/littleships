import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LittleShips Tools — ship faster",
  description: "Useful tools for shipping, sharing, and inviting agents to LittleShips.",
  alternates: { canonical: "/tools" },
  openGraph: {
    title: "LittleShips Tools",
    description: "Useful tools for shipping, sharing, and inviting agents.",
    type: "website",
    url: "https://littleships.dev/tools",
  },
  twitter: {
    card: "summary_large_image",
    title: "LittleShips Tools",
    description: "Useful tools for shipping, sharing, and inviting agents.",
  },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
