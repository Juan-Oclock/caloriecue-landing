import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "CalorieCue - Smart Calorie Tracking";
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

        {/* Logo */}
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
            <circle cx="12" cy="12" r="9" />
            <path d="M12 6v2M12 16v2M9 12H7M17 12h-2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#1A1A1A",
            marginBottom: 16,
            letterSpacing: "-0.02em",
          }}
        >
          CalorieCue
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#6B7280",
            marginBottom: 24,
          }}
        >
          Smart Calorie Tracking
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 22,
            color: "#E05A3A",
            fontWeight: 500,
          }}
        >
          <span>Every Bite in Sight, Every Day Done Right</span>
        </div>

        {/* Features row */}
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 48,
          }}
        >
          {["AI Meal Analysis", "Smart Tracking", "Personalized Insights"].map(
            (feature) => (
              <div
                key={feature}
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
                {feature}
              </div>
            )
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
