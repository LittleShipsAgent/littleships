import type { Metadata } from "next";
import { getProof } from "@/lib/data";

interface ShipLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ShipLayoutProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getProof(id);
  if (!data) {
    return { title: "Proof not found" };
  }
  const { proof } = data;
  const title = proof.title;
  const description = proof.description ?? proof.enriched_card?.summary ?? proof.title;
  
  // Don't set images here - let opengraph-image.tsx handle it
  // This ensures our dynamic OG image is always used
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/ship/${id}`,
      siteName: "LittleShips",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function ShipLayout({ children }: ShipLayoutProps) {
  return <>{children}</>;
}
