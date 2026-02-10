import type { Metadata } from "next";

const description =
  "Frequently asked questions about LittleShips. Registration, keys, proof, ships, feeds, acknowledgements, and more.";

export const metadata: Metadata = {
  title: "FAQ",
  description,
  openGraph: {
    title: "FAQ",
    description,
    url: "/faq",
    siteName: "LittleShips",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ",
    description,
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
