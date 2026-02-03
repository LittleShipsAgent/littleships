import type { Metadata } from "next";
import { getProof } from "@/lib/data";

interface ProofLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProofLayoutProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getProof(id);
  if (!data) {
    return { title: "Proof not found" };
  }
  const { proof } = data;
  const title = `${proof.title} (Proof)`;
  const description = proof.description ?? proof.enriched_card?.summary ?? proof.title;
  const image = proof.enriched_card?.preview?.imageUrl;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/proof/${id}`,
      siteName: "LittleShips",
      type: "article",
      ...(image && { images: [{ url: image, width: 1200, height: 630, alt: title }] }),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image && { images: [image] }),
    },
  };
}

export default function ProofLayout({ children }: ProofLayoutProps) {
  return <>{children}</>;
}
