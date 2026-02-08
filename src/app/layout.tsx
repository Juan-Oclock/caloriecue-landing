import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://caloriecue.app";

export const metadata: Metadata = {
  // Basic metadata
  title: {
    default: "CalorieCue — AI Photo Calorie Tracker",
    template: "%s | CalorieCue",
  },
  description:
    "Snap a photo of any meal and get instant calorie and macro tracking. Works on any cuisine. Free on iOS.",
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
    title: "CalorieCue — AI Photo Calorie Tracker",
    description:
      "Snap a photo of any meal and get instant calorie and macro tracking. Works on any cuisine. Free on iOS.",
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
    title: "CalorieCue — AI Photo Calorie Tracker",
    description:
      "Snap a photo of any meal and get instant calorie and macro tracking. Works on any cuisine. Free on iOS.",
    images: ["/twitter-image"],
    creator: "@caloriecue",
  },

  // App Links
  appLinks: {
    ios: {
      url: "https://apps.apple.com/app/caloriecue",
      app_store_id: "6757112503",
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
    "apple-itunes-app": "app-id=6757112503",
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
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-4E4N33E19T"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-4E4N33E19T');
            `,
          }}
        />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://caloriecue.app/#website",
                  url: "https://caloriecue.app",
                  name: "CalorieCue",
                  description:
                    "AI-powered calorie tracking app with smart meal analysis and personalized nutrition insights.",
                  publisher: { "@id": "https://caloriecue.app/#organization" },
                },
                {
                  "@type": "Organization",
                  "@id": "https://caloriecue.app/#organization",
                  name: "CalorieCue",
                  url: "https://caloriecue.app",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://caloriecue.app/app-icons/1024.png",
                  },
                  sameAs: [],
                },
                {
                  "@type": "SoftwareApplication",
                  name: "CalorieCue",
                  operatingSystem: "iOS",
                  applicationCategory: "HealthApplication",
                  description:
                    "Every Bite in Sight, Every Day Done Right. AI-powered calorie tracking app with smart meal analysis, personalized nutrition insights, and effortless food logging.",
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD",
                  },
                  downloadUrl:
                    "https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503",
                },
              ],
            }),
          }}
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#E05A3A" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
