import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BlogPostCard from "@/components/blog/BlogPostCard";
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
            "@graph": [webAppJsonLd, faqJsonLd, breadcrumbJsonLd, howToJsonLd],
          }),
        }}
      />
      <Navigation />
      <main>
        <TDEECalculatorClient />

        {/* Related Blog Posts */}
        {relatedPosts.length > 0 && (
          <section className="px-4 pb-24 md:pb-32">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Related Articles
                </h2>
                <p className="text-muted-foreground">
                  Dive deeper into calorie tracking, nutrition, and weight management.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {relatedPosts.map((post, i) => (
                  <BlogPostCard key={post.slug} post={post} delay={i * 0.1} />
                ))}
              </div>
            </div>
          </section>
        )}
        {/* Image Attribution */}
        <div className="text-center pb-8">
          <a
            href="https://www.freepik.com/free-photo/calories-nutrition-food-exercise-concept_18134531.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground/70 transition-colors"
          >
            Image by rawpixel.com on Freepik
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
