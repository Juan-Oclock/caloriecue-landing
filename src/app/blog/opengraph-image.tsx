import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "CalorieCue Blog — Nutrition Tips, Guides & Insights";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
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
        <div
          style={{
            position: "absolute",
            bottom: -50,
            left: -50,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.08)",
            filter: "blur(60px)",
          }}
        />

        {/* Blog icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: 28,
            background: "linear-gradient(135deg, #E05A3A 0%, #FF7F5C 100%)",
            marginBottom: 32,
            boxShadow: "0 8px 32px rgba(224, 90, 58, 0.3)",
          }}
        >
          <svg
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            <line x1="8" y1="7" x2="16" y2="7" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "#1A1A1A",
            marginBottom: 16,
            letterSpacing: "-0.02em",
          }}
        >
          CalorieCue Blog
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#6B7280",
            marginBottom: 24,
          }}
        >
          Nutrition Tips, Guides & Insights
        </div>

        {/* Topics row */}
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 48,
          }}
        >
          {["Calorie Tracking", "Healthy Eating", "Weight Management"].map(
            (topic) => (
              <div
                key={topic}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 18,
                  color: "#6B7280",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#E05A3A",
                  }}
                />
                {topic}
              </div>
            )
          )}
        </div>

        {/* Branding */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            fontSize: 18,
            color: "#E05A3A",
            fontWeight: 500,
          }}
        >
          caloriecue.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
