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
        // Coral brand scale (Landing A — Goal First design system).
        primary: {
          // Vibrant coral for accents, tints, badges, gradients and large
          // display text. NOT for body-size text on light backgrounds.
          DEFAULT: "#EF6939",
          // Accessible coral (WCAG AA 4.5:1 on white/sand): the fill for
          // white-text buttons and the colour for small coral text.
          dark: "#BC4527",
          // Mid coral — hover state for coral fills; passes 3:1 for
          // large display text on the sand background.
          mid: "#D95A2C",
          light: "#F58A62",
          50: "#FDF6F1",
          100: "#FBE3D7",
          200: "#F6CDB9",
          500: "#EF6939",
          600: "#BC4527",
          700: "#9E3A20",
        },
        // Warm neutral surfaces
        background: "#F5F1EC",
        surface: "#FDFCFB",
        card: "#FDFCFB",
        foreground: "#231D1A",
        muted: {
          DEFAULT: "#EEE8E1",
          foreground: "#5E544D",
        },
        // Tertiary text (labels, meta). Darkened from the design's #8A7F76
        // so 12–14px text still clears WCAG AA on the sand background.
        subtle: "#6F655C",
        border: {
          DEFAULT: "#E5DED5",
          strong: "#D9D2C9",
        },
        // Accent colors for visual interest
        accent: {
          blue: "#367EE2",
          purple: "#7A3FA6",
          teal: "#14B8A6",
        },
        // Macro colors (kept for app consistency)
        protein: "#E03E59",
        carbs: "#367EE2",
        fat: "#F59F0A",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "SF Pro Display",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        rounded: [
          "-apple-system",
          "SF Pro Rounded",
          "ui-rounded",
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        // Fluid display scale. The -mobile aliases are kept so existing
        // `text-display-mobile md:text-display` call sites keep working.
        hero: ["clamp(2.5rem, 5.2vw, 4.25rem)", { lineHeight: "1.02", fontWeight: "800", letterSpacing: "-0.03em" }],
        "hero-mobile": ["clamp(2.5rem, 5.2vw, 4.25rem)", { lineHeight: "1.02", fontWeight: "800", letterSpacing: "-0.03em" }],
        display: ["clamp(2rem, 3.6vw, 3rem)", { lineHeight: "1.05", fontWeight: "800", letterSpacing: "-0.025em" }],
        "display-mobile": ["clamp(2rem, 3.6vw, 3rem)", { lineHeight: "1.05", fontWeight: "800", letterSpacing: "-0.025em" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "1.75rem",
        "5xl": "2rem",
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgba(35, 29, 26, 0.05), 0 4px 16px -4px rgba(35, 29, 26, 0.08)",
        "soft-lg": "0 4px 12px -2px rgba(35, 29, 26, 0.06), 0 8px 24px -4px rgba(35, 29, 26, 0.1)",
        glow: "0 0 40px -10px rgba(239, 105, 57, 0.25)",
        "glow-lg": "0 0 60px -15px rgba(239, 105, 57, 0.35)",
        card: "0 1px 3px rgba(35, 29, 26, 0.04), 0 4px 12px rgba(35, 29, 26, 0.04)",
        "card-hover": "0 4px 8px rgba(35, 29, 26, 0.04), 0 12px 32px rgba(35, 29, 26, 0.08)",
        "card-lg": "0 20px 50px rgba(35, 29, 26, 0.08)",
        float: "0 10px 30px rgba(35, 29, 26, 0.14)",
        elevated: "0 8px 30px rgba(35, 29, 26, 0.08), 0 0 1px rgba(35, 29, 26, 0.1)",
        "ink-lg": "0 24px 60px rgba(35, 29, 26, 0.22)",
        coral: "0 10px 24px rgba(239, 105, 57, 0.28)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
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
        "gradient-subtle": "linear-gradient(135deg, #F5F1EC 0%, #EEE8E1 50%, #F5F1EC 100%)",
        "hero-gradient": "linear-gradient(135deg, #EF6939 0%, #F58A62 100%)",
        "peach": "linear-gradient(160deg, #FBE3D7 0%, #F6CDB9 100%)",
        "mesh-light": "radial-gradient(at 40% 20%, hsla(19, 85%, 58%, 0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(27, 100%, 65%, 0.06) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355, 85%, 65%, 0.04) 0px, transparent 50%)",
      },
    },
  },
  plugins: [],
};

export default config;
