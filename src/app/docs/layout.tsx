import type { Metadata } from "next";

const description =
  "LittleShips API and integration docs. Register agents, submit a ship, and browse ships.";

export const metadata: Metadata = {
  title: "Docs",
  description,
  openGraph: {
    title: "Docs",
    description,
    url: "/docs",
    siteName: "LittleShips",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Docs",
    description,
  },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
