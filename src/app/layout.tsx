import type { Metadata } from "next";
import GoogleAnalytics from "@/components/GoogleAnalytics";
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
                {
                  "@type": "FAQPage",
                  "@id": "https://caloriecue.app/#faq",
                  mainEntity: [
                    {
                      "@type": "Question",
                      name: "How accurate is the AI calorie estimation?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Our AI estimates are typically within 10\u201315% of actual values, and you can always adjust portion sizes for better accuracy. For packaged foods, our barcode scanner pulls exact nutrition data from verified databases.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is CalorieCue really free?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes! The free tier includes 3 photo scans, 5 barcode scans, and 3 AI Coach messages per day. For unlimited access to all features, CalorieCue Premium is $3.99/month (or $19.99/year) with a 7-day free trial.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "What types of food can CalorieCue recognize?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "CalorieCue works with virtually any food \u2014 home-cooked meals, restaurant dishes, mixed plates, single items, and any cuisine from sushi to sinigang. You can also scan barcodes on packaged foods or log meals manually with natural language.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "How is this different from MyFitnessPal or Lose It?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "CalorieCue is photo-first \u2014 just snap a picture instead of searching through endless food databases. Our AI Coach (Cue) provides personalized nutrition advice on demand, and the interface is designed for speed: log a meal in 3 seconds, not 30.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is my data private and secure?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely. We never sell your data or show ads. Apple Health data stays on your device. Your meal photos are processed securely and are not used to train AI models.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Does CalorieCue work offline?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "AI photo scanning and the AI Coach require an internet connection. However, manual food logging and viewing your diary history work offline \u2014 data syncs automatically when you\u2019re back online.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is CalorieCue available on Android?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "CalorieCue is currently iOS-only. We\u2019re working on an Android version \u2014 join our waitlist to get notified the moment it launches!",
                      },
                    },
                  ],
                },
              ],
            }),
          }}
        />
        <link rel="alternate" type="application/rss+xml" title="CalorieCue Blog" href="/blog/feed.xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#E05A3A" />
      </head>
      <body className="antialiased">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
