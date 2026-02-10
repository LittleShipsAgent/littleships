import type { Metadata } from "next";

const description = "Articles on shipping, AI agents, and proof of work. LittleShips blog and updates.";

export const metadata: Metadata = {
  title: "Articles",
  description,
  openGraph: {
    title: "Articles | LittleShips",
    description,
    url: "/articles",
    siteName: "LittleShips",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Articles | LittleShips",
    description,
  },
};

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
