import dynamic from "next/dynamic";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FeatureCard from "@/components/FeatureCard";
import AppStoreButton from "@/components/AppStoreButton";
import FadeInCSS from "@/components/FadeInCSS";
import AnimatedCounter from "@/components/AnimatedCounter";
import { MealScanShowcase } from "@/components/landing/MealScanShowcase";
const PricingSection = dynamic(() => import("@/components/PricingSection"));
const FAQSection = dynamic(() => import("@/components/FAQSection"));
import { GoalPathways } from "@/components/landing/GoalPathways";
import { HeroAndCalculatorFlow } from "@/components/landing/HeroAndCalculatorFlow";
import { Method } from "@/components/landing/Method";
import { ResultsAndAuthority } from "@/components/landing/ResultsAndAuthority";
import { buildFaqPageJsonLd } from "@/lib/faq-data";

const softwareAppJsonLd = {
  "@context": "https://schema.org",
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
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: 5.0,
    reviewCount: 3,
    bestRating: 5,
    worstRating: 1,
  },
  downloadUrl:
    "https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503",
};

// FAQ structured data is derived from the single shared FAQ source
// (src/lib/faq-data.ts) so the visible accordion and the SEO schema can
// never drift apart.
const faqJsonLd = buildFaqPageJsonLd();

export const revalidate = 3600; // Revalidate stats every hour

// Verbatim App Store reviews. Keep in sync with aggregateRating.reviewCount
// in softwareAppJsonLd above.
const APP_STORE_REVIEWS = [
  {
    author: "Sol Maraiah",
    text: "Very seamless to use, friendly user and it only takes few seconds to load. No lag, app is way better than those in the market right now. Actual weight and est weight of the AI is pretty accurate.",
    source: "App Store review",
  },
  {
    author: "App Store User",
    text: "I really like this app because it’s very easy to navigate and user-friendly. Logging food is much easier, especially with the photo feature where the AI scans the food and automatically calculates the calories.",
    source: "App Store review",
  },
  {
    author: "D.mercer",
    text: "Works exactly how I expected and is good with weight loss goals",
    source: "App Store review",
  },
];

// Secondary feature tiles. The scan hero card above them carries the
// "Core feature" story; these cover the rest of the product.
const FEATURES = [
  {
    glyph: "AI",
    title: "A nutritionist in your pocket",
    description:
      "Ask the AI coach about the tricky decisions — what to order, how to hit protein, what to swap.",
  },
  {
    glyph: "|||",
    title: "Packaged foods, one tap",
    description: "Scan a barcode for exact nutrition from a verified database.",
  },
  {
    glyph: "Aa",
    title: "Log before you forget",
    description:
      "Type “two eggs and toast” — natural language handles the rest.",
  },
  {
    glyph: "↗",
    title: "Understand why weight moves",
    description:
      "Calories, macros and weight trends on one chart, so you can see cause and effect.",
  },
  {
    glyph: "⏰",
    title: "Stay on track eating out",
    description:
      "Gentle, calorie-aware reminders that know what you have left for the day.",
  },
  {
    glyph: "♥",
    title: "Syncs with Apple Health",
    description:
      "Weight, workouts and steps flow in automatically, so your target adjusts to what you actually burned.",
  },
];

const MACRO_TILES = [
  { value: "482", label: "kcal", bg: "bg-background", color: "text-foreground" },
  { value: "24g", label: "protein", bg: "bg-[#FFE4E8]", color: "text-protein" },
  { value: "35g", label: "carbs", bg: "bg-[#DBEAFE]", color: "text-carbs" },
  { value: "28g", label: "fat", bg: "bg-[#FFF5D1]", color: "text-fat" },
];

const FALLBACK_STATS = { total_users: 2990, meals_scanned: 17314, calories_logged: 2875630, app_store_rating: 4.9 };

async function getLandingStats() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return FALLBACK_STATS;

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/get_landing_page_stats`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return FALLBACK_STATS;
    const data = await res.json();
    if (!data || !data.total_users) return FALLBACK_STATS;
    return data as typeof FALLBACK_STATS;
  } catch {
    return FALLBACK_STATS;
  }
}

export default async function Home() {
  const stats = await getLandingStats();

  const statItems = [
    { value: stats.total_users, suffix: "+", label: "Active users", aria: `${stats.total_users.toLocaleString("en-US")}+ active users` },
    { value: stats.meals_scanned, suffix: "+", label: "Meals scanned", aria: `${stats.meals_scanned.toLocaleString("en-US")}+ meals scanned` },
    { value: stats.calories_logged, suffix: "+", label: "Calories logged", aria: `${stats.calories_logged.toLocaleString("en-US")}+ calories logged` },
  ];

  return (
    <main className="min-h-screen bg-background overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navigation />

      {/* Hero (Goal Selector) → Stats strip → Inline Calculator.
          The strip is passed as a child so it stays server-rendered while
          sitting between the two client siblings that share goal state. */}
      <HeroAndCalculatorFlow stats={stats}>
        {/* Social Proof Section */}
        <section
          aria-label="CalorieCue by the numbers"
          className="border-y border-border bg-surface"
        >
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-7 md:grid-cols-4 md:px-8">
            {statItems.map((item, i) => (
              <FadeInCSS key={item.label} delay={i * 0.08} className="flex flex-col gap-1">
                <span className="text-[clamp(1.625rem,2.6vw,2.125rem)] font-extrabold tracking-[-0.02em] tabular-nums text-foreground font-rounded">
                  <AnimatedCounter target={item.value} suffix={item.suffix} ariaLabel={item.aria} />
                </span>
                <span className="text-sm text-subtle">{item.label}</span>
              </FadeInCSS>
            ))}
            <FadeInCSS delay={0.24} className="flex flex-col gap-1">
              <span className="text-[clamp(1.625rem,2.6vw,2.125rem)] font-extrabold tracking-[-0.02em] tabular-nums text-foreground font-rounded">
                {Number(stats.app_store_rating).toFixed(1)}{" "}
                <span className="text-primary" aria-hidden="true">★</span>
              </span>
              <span className="text-sm text-subtle">App Store rating</span>
            </FadeInCSS>
          </div>
        </section>
      </HeroAndCalculatorFlow>

      {/* The Method — educational block (Guardrail 3 bridge moment in step 2) */}
      <Method />

      {/* Features Section */}
      <section id="features" className="scroll-mt-20 px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto flex max-w-6xl flex-col gap-12">
          <FadeInCSS className="flex max-w-[640px] flex-col gap-3.5">
            <span className="eyebrow">Features</span>
            <h2 className="text-display text-foreground text-balance">
              Logging that never feels like work.
            </h2>
          </FadeInCSS>

          {/* Core feature card: copy + live scan demo */}
          <FadeInCSS
            y={30}
            viewportMargin="-50px"
            className="grid overflow-hidden rounded-3xl border border-border bg-surface md:grid-cols-2"
          >
            <div className="flex flex-col justify-center gap-4 p-7 md:p-10">
              <span className="w-fit rounded-full bg-primary-100 px-2.5 py-1 text-xs font-bold text-primary-dark">
                Core feature
              </span>
              <h3 className="text-[clamp(1.625rem,2.6vw,2.125rem)] font-extrabold leading-[1.1] tracking-[-0.02em] text-foreground text-balance">
                Snap it. Logged in 3 seconds.
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground text-pretty">
                One photo. The AI names the food, sizes the portion and files
                calories and macros to your diary — any cuisine, 500+ and
                counting.
              </p>
              <ul className="mt-2 grid grid-cols-4 gap-2" aria-label="Example scan result">
                {MACRO_TILES.map((tile) => (
                  <li key={tile.label} className={`flex flex-col gap-0.5 rounded-xl p-3 ${tile.bg}`}>
                    <span className={`text-xl font-extrabold tabular-nums font-rounded ${tile.color}`}>
                      {tile.value}
                    </span>
                    <span className="text-[11px] text-subtle">{tile.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <MealScanShowcase />
          </FadeInCSS>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <FeatureCard
                key={feature.title}
                delay={i * 0.06}
                glyph={feature.glyph}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Goal Pathways — guides curated per goal */}
      <GoalPathways />

      {/* Results + Authority Section */}
      <ResultsAndAuthority reviews={APP_STORE_REVIEWS} />

      {/* Pricing Section */}
      <PricingSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <FadeInCSS className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 overflow-hidden rounded-[28px] bg-primary-dark p-7 text-white sm:p-10 md:p-16">
          <div
            className="absolute -right-20 -top-20 h-[360px] w-[360px] rounded-full border-[60px] border-white/10"
            aria-hidden="true"
          />
          <h2 className="relative max-w-[620px] text-balance text-[clamp(2rem,4.2vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em]">
            Pick your goal. We&apos;ll handle the math.
          </h2>
          <p className="relative max-w-[480px] text-[17px] text-white/90">
            Free on iOS. Your first scan takes three seconds.
          </p>

          {/* Two paths in v1 — download or read the guides.
              TODO (v1.1): reintroduce a third path (deliver a
              personalized plan) once that flow is built. */}
          <div className="relative flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <AppStoreButton variant="solid" location="final_cta" className="w-full whitespace-nowrap sm:w-auto" />
            <Link
              href="/blog"
              className="inline-flex h-[54px] items-center justify-center rounded-[14px] border-[1.5px] border-white/60 px-5 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              Browse the guides
            </Link>
          </div>
        </FadeInCSS>
      </section>

      <Footer />
    </main>
  );
}
