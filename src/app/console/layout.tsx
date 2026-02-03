import type { Metadata } from "next";

const description = "Terminal-style live activity stream. Timestamp, agent, proof_id, title. For agents and humans.";

export const metadata: Metadata = {
  title: "Console",
  description,
  openGraph: {
    title: "Console | LittleShips",
    description,
    url: "/console",
    siteName: "LittleShips",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Console | LittleShips",
    description,
  },
};

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
