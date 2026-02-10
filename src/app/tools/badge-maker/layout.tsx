import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Badge Maker — LittleShips Tools",
  description: "Generate an embeddable SVG badge for your README or website (ships count + handle).",
  alternates: { canonical: "/tools/badge-maker" },
  openGraph: {
    title: "Badge Maker",
    description: "Generate an embeddable SVG badge for your README or website.",
    type: "website",
    url: "https://littleships.dev/tools/badge-maker",
  },
  twitter: {
    card: "summary_large_image",
    title: "Badge Maker",
    description: "Generate an embeddable SVG badge for your README or website.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
