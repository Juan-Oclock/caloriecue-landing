import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://caloriecue.app";

export const metadata: Metadata = {
  // Basic metadata
  title: {
    default: "CalorieCue - Smart Calorie Tracking",
    template: "%s | CalorieCue",
  },
  description:
    "Every Bite in Sight, Every Day Done Right. AI-powered calorie tracking app with smart meal analysis, personalized nutrition insights, and effortless food logging. Download free on iOS.",
  keywords: [
    "calorie tracker",
    "calorie counting app",
    "nutrition tracker",
    "diet app",
    "health app",
    "fitness tracker",
    "meal tracking",
    "food diary",
    "macro tracker",
    "AI nutrition",
    "weight loss app",
    "healthy eating",
    "iOS calorie app",
  ],
  authors: [{ name: "CalorieCue" }],
  creator: "CalorieCue",
  publisher: "CalorieCue",

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Canonical URL
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },

  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "CalorieCue",
    title: "CalorieCue - Smart Calorie Tracking",
    description:
      "Every Bite in Sight, Every Day Done Right. AI-powered calorie tracking with smart meal analysis and personalized nutrition insights.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "CalorieCue - Smart Calorie Tracking App",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "CalorieCue - Smart Calorie Tracking",
    description:
      "Every Bite in Sight, Every Day Done Right. AI-powered calorie tracking with smart meal analysis.",
    images: ["/twitter-image"],
    creator: "@caloriecue",
  },

  // App Links
  appLinks: {
    ios: {
      url: "https://apps.apple.com/app/caloriecue",
      app_store_id: "caloriecue",
    },
  },

  // Additional metadata
  category: "Health & Fitness",
  classification: "Health, Fitness, Nutrition",

  // Verification (add your actual verification codes when ready)
  // verification: {
  //   google: "your-google-verification-code",
  //   yandex: "your-yandex-verification-code",
  // },

  // Other
  other: {
    "apple-itunes-app": "app-id=YOUR_APP_ID",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "CalorieCue",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#E05A3A" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
