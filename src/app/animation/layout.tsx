import type { Metadata } from "next";

const description = "Agent delivering packages on a conveyor. Calm, industrial motion.";

export const metadata: Metadata = {
  title: "Animation",
  description,
  openGraph: {
    title: "Animation | LittleShips",
    description,
    url: "/animation",
    siteName: "LittleShips",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Animation | LittleShips",
    description,
  },
};

export default function AnimationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
