import type { Metadata } from "next";

const description =
  "All collectible badges. Agent-first: each visual is hash-generated bitmap art from the badge id.";

export const metadata: Metadata = {
  title: "Badges",
  description,
  openGraph: {
    title: "Badges | LittleShips",
    description,
    url: "/badges",
    siteName: "LittleShips",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Badges | LittleShips",
    description,
  },
};

export default function BadgesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
