import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import BlogPostCardEditorial from "@/components/blog/BlogPostCardEditorial";
import AppStoreButton from "@/components/AppStoreButton";
import { getAllPosts } from "@/lib/blog";
import TDEECalculatorClient from "./TDEECalculatorClient";

export const metadata: Metadata = {
  title: "Free TDEE Calculator — Calculate Your Daily Calorie Needs",
  description:
    "Calculate your Total Daily Energy Expenditure (TDEE) with our free calculator. Get your BMR, macros, and personalized calorie targets for weight loss or muscle gain.",
  keywords: [
    "TDEE calculator",
    "total daily energy expenditure calculator",
    "calorie calculator",
    "BMR calculator",
    "daily calorie needs",
    "how many calories do I need",
    "maintenance calories calculator",
    "macros for weight loss",
  ],
  alternates: {
    canonical: "https://caloriecue.app/tdee-calculator",
  },
  openGraph: {
    title: "Free TDEE Calculator — Calculate Your Daily Calorie Needs",
    description:
      "Calculate your Total Daily Energy Expenditure (TDEE) with our free calculator. Get your BMR, macros, and personalized calorie targets.",
    url: "https://caloriecue.app/tdee-calculator",
    siteName: "CalorieCue",
    type: "website",
    images: [
      {
        url: "https://caloriecue.app/blog/tdee-calculator-og.webp",
        width: 1200,
        height: 630,
        alt: "Free TDEE Calculator — Calculate Your Daily Calorie Needs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free TDEE Calculator | CalorieCue",
    description:
      "Calculate your TDEE, BMR, macros, and personalized calorie targets for weight loss or muscle gain.",
    images: [
      {
        url: "https://caloriecue.app/blog/tdee-calculator-og.webp",
        width: 1200,
        height: 630,
        alt: "Free TDEE Calculator — Calculate Your Daily Calorie Needs",
      },
    ],
  },
};

const webAppJsonLd = {
  "@type": "WebApplication",
  name: "CalorieCue TDEE Calculator",
  applicationCategory: "HealthApplication",
  operatingSystem: "Any",
  description:
    "Free online TDEE calculator that estimates your total daily energy expenditure, BMR, macronutrient breakdown, and personalized calorie goals.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  url: "https://caloriecue.app/tdee-calculator",
};

const faqJsonLd = {
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the most accurate BMR formula?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Mifflin-St Jeor equation is widely considered the most accurate for most people. If you know your body fat percentage, the Katch-McArdle formula can be more accurate because it accounts for lean body mass.",
      },
    },
    {
      "@type": "Question",
      name: "How many calories should I eat to lose weight?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A safe and sustainable calorie deficit is 500 calories below your TDEE, which results in approximately 1 pound (0.45 kg) of weight loss per week.",
      },
    },
    {
      "@type": "Question",
      name: "Should I eat back exercise calories?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Generally no, if your activity level already accounts for your exercise routine. Your TDEE calculation includes exercise based on the activity level you selected.",
      },
    },
    {
      "@type": "Question",
      name: "How accurate is a TDEE calculator?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "TDEE calculators provide an estimated starting point — typically within 10% of your actual expenditure. Use the calculator as a baseline, then adjust based on real-world results over 2-3 weeks.",
      },
    },
    {
      "@type": "Question",
      name: "What macronutrient ratio is best for weight loss?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "There's no single best ratio. A balanced split (30% protein, 35% carbs, 35% fat) works well for most people. The most important factor for weight loss is total calories, not the exact macro split.",
      },
    },
  ],
};

const breadcrumbJsonLd = {
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://caloriecue.app",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "TDEE Calculator",
      item: "https://caloriecue.app/tdee-calculator",
    },
  ],
};

const howToJsonLd = {
  "@type": "HowTo",
  name: "How to Calculate Your TDEE",
  description:
    "Use our free TDEE calculator to find your total daily energy expenditure in three simple steps.",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Enter your details",
      text: "Input your age, gender, weight, and height into the calculator.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Select your activity level",
      text: "Choose the activity level that best matches your weekly exercise and daily movement habits.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Get your results",
      text: "View your TDEE, BMR, BMI, macro breakdown, and personalized calorie goals.",
    },
  ],
};

const RELATED_SLUGS = [
  "how-to-calculate-calorie-deficit",
  "does-calorie-counting-work",
  "ai-calorie-tracking-guide",
];

export default function TDEECalculatorPage() {
  const allPosts = getAllPosts();
  const relatedPosts = RELATED_SLUGS
    .map((slug) => allPosts.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [webAppJsonLd, breadcrumbJsonLd, howToJsonLd],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            ...faqJsonLd,
          }),
        }}
      />
      <Navigation />
      <main className="bg-background">
        <TDEECalculatorClient />

        {/* Related guides */}
        {relatedPosts.length > 0 && (
          <section className="border-t border-border bg-surface">
            <div className="mx-auto flex max-w-6xl flex-col gap-9 px-5 py-20 md:px-8 md:py-28">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <h2 className="text-display text-foreground">Go deeper.</h2>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-primary-dark transition-colors hover:text-primary-700"
                >
                  All guides
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {relatedPosts.map((post, i) => (
                  <BlogPostCardEditorial key={post.slug} post={post} delay={i * 0.06} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="px-5 py-16 md:px-8 md:py-20">
          <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 overflow-hidden rounded-[28px] bg-primary-dark p-7 text-white sm:p-10 md:p-16">
            <div
              className="absolute -right-20 -top-20 h-[360px] w-[360px] rounded-full border-[60px] border-white/10"
              aria-hidden="true"
            />
            <h2 className="relative max-w-[640px] text-balance text-[clamp(2rem,4.2vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em]">
              You&apos;ve got the number. Now hit it.
            </h2>
            <p className="relative max-w-[480px] text-[17px] text-white/90">
              CalorieCue logs any meal from one photo in three seconds. Free on iOS.
            </p>
            <AppStoreButton variant="solid" location="calculator" className="relative whitespace-nowrap" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
