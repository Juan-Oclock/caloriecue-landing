import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog";

export const alt = "CalorieCue Blog Post";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const title = post?.title ?? "CalorieCue Blog";
  const tags = post?.tags ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(224, 90, 58, 0.1)",
            filter: "blur(80px)",
          }}
        />

        {/* Top: Logo + Blog label */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg, #E05A3A 0%, #FF7F5C 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 6v2M12 16v2M9 12H7M17 12h-2" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontSize: 22, fontWeight: 600, color: "#1A1A1A" }}>
            CalorieCue
          </span>
          <span style={{ fontSize: 16, color: "#6B7280", marginLeft: 8 }}>
            Blog
          </span>
        </div>

        {/* Middle: Title */}
        <div
          style={{
            fontSize: title.length > 60 ? 42 : 52,
            fontWeight: 700,
            color: "#1A1A1A",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            maxWidth: "90%",
          }}
        >
          {title}
        </div>

        {/* Bottom: Tags */}
        <div style={{ display: "flex", gap: 10 }}>
          {tags.slice(0, 4).map((tag) => (
            <div
              key={tag}
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#E05A3A",
                background: "rgba(224, 90, 58, 0.08)",
                padding: "6px 16px",
                borderRadius: 20,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
