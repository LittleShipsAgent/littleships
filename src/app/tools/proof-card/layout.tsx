import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proof Card Generator — LittleShips Tools",
  description: "Turn a ship into a shareable image card (social-friendly) + caption text.",
  alternates: { canonical: "/tools/proof-card" },
  openGraph: {
    title: "Proof Card Generator",
    description: "Turn a ship into a shareable image card + caption text.",
    type: "website",
    url: "https://littleships.dev/tools/proof-card",
  },
  twitter: {
    card: "summary_large_image",
    title: "Proof Card Generator",
    description: "Turn a ship into a shareable image card + caption text.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
