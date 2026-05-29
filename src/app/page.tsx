import dynamic from "next/dynamic";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FeatureCard from "@/components/FeatureCard";
import AppStoreButton from "@/components/AppStoreButton";
import FadeInCSS from "@/components/FadeInCSS";
import AnimatedCounter from "@/components/AnimatedCounter";
import ScanLineAnimation from "@/components/ScanLineAnimation";
const PricingSection = dynamic(() => import("@/components/PricingSection"));
const FAQSection = dynamic(() => import("@/components/FAQSection"));
const VideoPreview = dynamic(() => import("@/components/VideoPreview"));
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
    source: "App Store Review",
  },
  {
    author: "App Store User",
    text: "I really like this app because it’s very easy to navigate and user-friendly. Logging food is much easier, especially with the photo feature where the AI scans the food and automatically calculates the calories.",
    source: "App Store Review",
  },
  {
    author: "D.mercer",
    text: "Works exactly how I expected and is good with weight loss goals",
    source: "App Store Review",
  },
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
  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navigation />

      {/* Hero (Goal Selector) + Inline Calculator placeholder */}
      <HeroAndCalculatorFlow stats={stats} />

      {/* Social Proof Section */}
      <section className="py-14 md:py-16 px-4 bg-background border-y border-border">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 text-center">
            <FadeInCSS>
              <div className="text-3xl md:text-4xl font-bold text-foreground">
                <AnimatedCounter
                  target={stats.total_users}
                  suffix="+"
                  ariaLabel={`${stats.total_users.toLocaleString("en-US")}+ active users`}
                />
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Active Users
              </p>
            </FadeInCSS>

            <FadeInCSS delay={0.1}>
              <div className="text-3xl md:text-4xl font-bold text-foreground">
                <AnimatedCounter
                  target={stats.meals_scanned}
                  suffix="+"
                  ariaLabel={`${stats.meals_scanned.toLocaleString("en-US")}+ meals scanned`}
                />
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Meals Scanned
              </p>
            </FadeInCSS>

            <FadeInCSS delay={0.2}>
              <div className="text-3xl md:text-4xl font-bold text-foreground">
                <AnimatedCounter
                  target={stats.calories_logged}
                  suffix="+"
                  ariaLabel={`${stats.calories_logged.toLocaleString("en-US")}+ calories logged`}
                />
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Calories Logged
              </p>
            </FadeInCSS>

            <FadeInCSS delay={0.3}>
              <div className="text-3xl md:text-4xl font-bold text-foreground">
                {Number(stats.app_store_rating).toFixed(1)}
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                App Store Rating
              </p>
            </FadeInCSS>
          </div>
        </div>
      </section>

      {/* The Method — educational block (Guardrail 3 bridge moment in step 2) */}
      <Method />

      {/* Goal Pathways — guides curated per goal */}
      <GoalPathways />

      {/* Features Section - Bento Grid */}
      <section id="features" className="relative py-24 md:py-32 px-4 overflow-hidden">
        {/* Background mesh gradient */}
        <div className="absolute inset-0 mesh-bg -z-10" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-blue/5 rounded-full blur-[100px] -z-10" />

        <div className="max-w-6xl mx-auto">
          <FadeInCSS className="text-center mb-16">
            <span className="inline-block text-primary-dark font-medium text-sm mb-3 uppercase tracking-wider">
              Features
            </span>
            <h2 className="text-display-mobile md:text-display text-foreground mb-4">
              Everything you need to actually hit your goal
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to take control of your nutrition with
              intelligent assistance.
            </p>
          </FadeInCSS>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 lg:[grid-auto-rows:minmax(200px,auto)]">
            {/* Hero Card: No more guessing portion sizes - spans 2 cols, 2 rows on lg */}
            <FadeInCSS
              y={30}
              viewportMargin="-50px"
              className="md:col-span-2 lg:col-span-2 lg:row-span-2 group relative bg-gradient-to-br from-primary-50 via-white to-orange-50/30 rounded-3xl border border-primary-100/60 p-7 md:p-8 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              {/* Background decorations */}
              <div
                className="absolute -top-20 -right-20 w-60 h-60 bg-primary/[0.06] rounded-full blur-3xl"
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary-light/[0.04] rounded-full blur-2xl"
                aria-hidden="true"
              />

              <div className="relative h-full flex flex-col">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary-dark text-xs font-semibold px-3 py-1 rounded-full w-fit mb-5">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Core Feature
                </div>

                {/* Icon */}
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
                  <svg
                    className="w-7 h-7 text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>

                {/* Text */}
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                  No more guessing portion sizes
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base max-w-sm">
                  Snap a photo. Our AI identifies your food and tracks nutrition
                  in 3 seconds — so logging never feels like work.
                </p>

                {/* Camera viewfinder illustration */}
                <div className="flex-1 hidden lg:flex items-end justify-center pt-5">
                  <div className="relative w-44 h-36">
                    {/* Viewfinder corners */}
                    <div className="absolute inset-0">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/30 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/30 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/30 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/30 rounded-br-lg" />
                    </div>

                    {/* Center focus circle */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary/40" />
                      </div>
                    </div>

                    {/* Animated scan line */}
                    <ScanLineAnimation />

                    {/* Result chip */}
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-primary/20 rounded-full px-3.5 py-1 shadow-sm whitespace-nowrap">
                      <span className="text-[11px] font-medium text-primary-dark flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        350 cal detected
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInCSS>

            {/* AI Coach - spans 2 cols on lg */}
            <FeatureCard
              delay={0.1}
              className="lg:col-span-2"
              iconBg="bg-violet-50"
              iconColor="text-violet-500"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              }
              title="A nutritionist in your pocket for the tricky decisions"
              description="Get personalized nutrition advice and meal suggestions from your AI coach, always available to help."
            />

            {/* Packaged foods, one-tap accurate - 1x1 */}
            <FeatureCard
              delay={0.2}
              iconBg="bg-teal-50"
              iconColor="text-teal-500"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              }
              title="Packaged foods, one-tap accurate"
              description="Scan barcodes for instant nutrition data from our comprehensive food database."
            />

            {/* Stay on track even when eating out - 1x1 */}
            <FeatureCard
              delay={0.3}
              iconBg="bg-amber-50"
              iconColor="text-amber-500"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                  />
                </svg>
              }
              title="Stay on track even when eating out"
              description="Gentle reminders to log meals and stay on track throughout the day."
            />

            {/* Understand why your weight is changing - spans 2 cols on lg */}
            <FeatureCard
              delay={0.4}
              className="lg:col-span-2"
              iconBg="bg-blue-50"
              iconColor="text-blue-500"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
              title="Understand why your weight is changing"
              description="Track your calories, macros, weight, and see your progress over time with beautiful visualizations."
            />

            {/* Log meals before you forget - spans 2 cols on lg */}
            <FeatureCard
              delay={0.5}
              className="lg:col-span-2"
              iconBg="bg-emerald-50"
              iconColor="text-emerald-500"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              }
              title="Log meals before you forget"
              description="Log meals in seconds with natural language input. Just type what you ate and we'll handle the rest."
            />
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="py-20 md:py-28 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <FadeInCSS className="text-center mb-12">
            <span className="inline-block text-primary-dark font-medium text-sm mb-3 uppercase tracking-wider">
              Preview
            </span>
            <h2 className="text-display-mobile md:text-display text-foreground mb-4">
              What a normal day of tracking looks like
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Watch how easy it is to track your nutrition with CalorieCue.
            </p>
          </FadeInCSS>

          {/* Video */}
          <VideoPreview
            mp4Src="/caloriecue-calorie-counter-features.webm"
            webmSrc="/caloriecue-calorie-counter-features.webm"
          />
        </div>
      </section>

      {/* Results + Authority Section */}
      <ResultsAndAuthority reviews={APP_STORE_REVIEWS} />


      {/* Pricing Section */}
      <PricingSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-24 md:py-32 px-4 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-blue/5 -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -z-10" />

        <div className="max-w-3xl mx-auto text-center">
          <FadeInCSS>
            <span className="inline-block text-primary-dark font-medium text-sm mb-3 uppercase tracking-wider">
              Get Started
            </span>
            <h2 className="text-display-mobile md:text-display text-foreground mb-4">
              Pick your goal. We&apos;ll handle the math.
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
              Download now and start your journey to better nutrition today.
            </p>

            {/* Two paths in v1 — download or read the guides.
                TODO (v1.1): reintroduce a third path (deliver a
                personalized plan) once that flow is built. */}
            <div className="flex flex-col sm:flex-row sm:items-stretch justify-center gap-3 max-w-xl mx-auto">
              <AppStoreButton variant="hero" centered hideTagline className="w-full sm:w-auto [&>div]:w-full [&>div]:sm:w-auto [&>div]:h-full [&_a]:h-full [&_a>div]:h-full" />
              <a
                href="/blog"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-border bg-white text-foreground text-lg font-semibold hover:border-primary/40 hover:text-primary-dark transition-colors w-full sm:w-auto"
              >
                Browse the guides
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </FadeInCSS>
        </div>
      </section>

      <Footer />
    </main>
  );
}
