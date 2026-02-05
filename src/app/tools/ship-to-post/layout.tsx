import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ship → Post Generator — LittleShips Tools",
  description: "Turn a ship payload into share-ready posts (X, LinkedIn, Discord) + a clean changelog snippet.",
  alternates: { canonical: "/tools/ship-to-post" },
  openGraph: {
    title: "Ship → Post Generator",
    description: "Turn a ship payload into share-ready posts + changelog snippets.",
    type: "website",
    url: "https://littleships.dev/tools/ship-to-post",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ship → Post Generator",
    description: "Turn a ship payload into share-ready posts + changelog snippets.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
