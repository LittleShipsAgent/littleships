import { redirect } from "next/navigation";

// Alias route: /tag/<tag> -> /event/<slug>
export default async function TagAliasPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  redirect(`/event/${encodeURIComponent(tag)}`);
}
