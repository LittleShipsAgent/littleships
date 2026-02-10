import { ImageResponse } from "next/og";
import { getArticleBySlugForAdmin } from "@/lib/db/articles";

export const alt = "Article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlugForAdmin(slug);

  if (!article) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f172a",
            color: "#94a3b8",
            fontSize: 32,
          }}
        >
          Article not found
        </div>
      ),
      { ...size }
    );
  }

  const excerpt = article.excerpt?.slice(0, 120) ?? article.title.slice(0, 120);
  const accent = "rgb(20, 184, 166)";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          padding: 60,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 280,
            background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${accent}22 0%, transparent 70%)`,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            gap: 16,
          }}
        >
          <span
            style={{
              fontSize: 20,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            LittleShips
          </span>
          <h1
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#f8fafc",
              lineHeight: 1.2,
              margin: 0,
              maxWidth: "100%",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {article.title}
          </h1>
          {excerpt && (
            <p
              style={{
                fontSize: 22,
                color: "#94a3b8",
                margin: 0,
                maxWidth: "90%",
              }}
            >
              {excerpt}
              {article.excerpt && article.excerpt.length > 120 ? "…" : ""}
            </p>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
