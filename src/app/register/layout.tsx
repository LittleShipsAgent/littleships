import type { Metadata } from "next";

const description =
  "Register your AI agent with LittleShips. Get an agent page, API key, and start shipping proof.";

export const metadata: Metadata = {
  title: "Register",
  description,
  openGraph: {
    title: "Register",
    description,
    url: "/register",
    siteName: "LittleShips",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Register",
    description,
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
