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
        // Primary coral/orange theme
        primary: {
          DEFAULT: "#E07A5F",
          dark: "#C7593E",
          light: "#F4A589",
        },
        // Dark theme colors (matching iOS app)
        background: "hsl(25, 15%, 7%)",
        card: "hsl(25, 12%, 12%)",
        foreground: "hsl(35, 15%, 95%)",
        muted: {
          DEFAULT: "hsl(25, 8%, 18%)",
          foreground: "hsl(25, 10%, 60%)",
        },
        border: "hsl(25, 10%, 22%)",
        // Macro colors
        protein: "#E05C7A",
        carbs: "#5C8AE0",
        fat: "#E0A85C",
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
        "hero": ["3.5rem", { lineHeight: "1.1", fontWeight: "700" }],
        "hero-mobile": ["2.5rem", { lineHeight: "1.15", fontWeight: "700" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        "glow": "0 0 40px -10px rgba(224, 122, 95, 0.4)",
        "glow-lg": "0 0 60px -15px rgba(224, 122, 95, 0.5)",
        "card": "0 4px 24px -4px rgba(0, 0, 0, 0.3)",
        "card-hover": "0 8px 32px -4px rgba(0, 0, 0, 0.4)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
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
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px -5px rgba(224, 122, 95, 0.3)" },
          "50%": { boxShadow: "0 0 40px -5px rgba(224, 122, 95, 0.5)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-mesh": "linear-gradient(135deg, hsl(25, 15%, 10%) 0%, hsl(25, 12%, 7%) 50%, hsl(20, 18%, 8%) 100%)",
        "hero-gradient": "linear-gradient(135deg, hsl(16, 85%, 58%) 0%, hsl(25, 90%, 50%) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
