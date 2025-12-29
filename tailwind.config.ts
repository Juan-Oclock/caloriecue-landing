import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary coral/orange theme - slightly refined for light mode
        primary: {
          DEFAULT: "#E05A3A",
          dark: "#C74B2E",
          light: "#FF7F5C",
          50: "#FFF5F2",
          100: "#FFE8E2",
          200: "#FFD1C5",
          500: "#E05A3A",
          600: "#C74B2E",
        },
        // Light theme colors
        background: "#FAFAFA",
        surface: "#FFFFFF",
        card: "#FFFFFF",
        foreground: "#1A1A1A",
        muted: {
          DEFAULT: "#F5F5F5",
          foreground: "#6B7280",
        },
        border: "#E5E7EB",
        // Accent colors for visual interest
        accent: {
          blue: "#3B82F6",
          purple: "#8B5CF6",
          teal: "#14B8A6",
        },
        // Macro colors (kept for app consistency)
        protein: "#E05C7A",
        carbs: "#3B82F6",
        fat: "#F59E0B",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: {
        "hero": ["4rem", { lineHeight: "1.05", fontWeight: "700", letterSpacing: "-0.02em" }],
        "hero-mobile": ["2.75rem", { lineHeight: "1.1", fontWeight: "700", letterSpacing: "-0.02em" }],
        "display": ["3rem", { lineHeight: "1.1", fontWeight: "600", letterSpacing: "-0.02em" }],
        "display-mobile": ["2rem", { lineHeight: "1.15", fontWeight: "600", letterSpacing: "-0.01em" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        "soft": "0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 16px -4px rgba(0, 0, 0, 0.08)",
        "soft-lg": "0 4px 12px -2px rgba(0, 0, 0, 0.06), 0 8px 24px -4px rgba(0, 0, 0, 0.1)",
        "glow": "0 0 40px -10px rgba(224, 90, 58, 0.25)",
        "glow-lg": "0 0 60px -15px rgba(224, 90, 58, 0.35)",
        "card": "0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.04)",
        "card-hover": "0 4px 8px rgba(0, 0, 0, 0.04), 0 12px 32px rgba(0, 0, 0, 0.08)",
        "elevated": "0 8px 30px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.1)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-subtle": "linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 50%, #FAFAFA 100%)",
        "hero-gradient": "linear-gradient(135deg, #E05A3A 0%, #FF7F5C 100%)",
        "mesh-light": "radial-gradient(at 40% 20%, hsla(16, 79%, 58%, 0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(27, 100%, 65%, 0.06) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355, 85%, 65%, 0.04) 0px, transparent 50%)",
      },
    },
  },
  plugins: [],
};

export default config;
