"use client";

import { useState } from "react";
import FadeInCSS from "@/components/FadeInCSS";
import TrackedAppStoreLink from "@/components/TrackedAppStoreLink";

const APP_STORE_URL =
  "https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503";

// Pricing data
const PRICING = {
  monthly: {
    price: "$3.99",
    per: "/month",
    note: "Intro offer: $2.99 for your first month",
  },
  yearly: {
    price: "$19.99",
    per: "/year",
    note: "That’s $1.67 a month · intro offer $14.99 for your first year",
  },
};

const FREE_FEATURES = [
  "3 meal scans per day",
  "3 AI Coach messages per day",
  "3 days of diary history",
  "Limited insights",
];

const PREMIUM_FEATURES = [
  "Unlimited photo scans",
  "Unlimited barcodes",
  "Voice logging",
  "Meal planning",
  "Full diary history",
  "Insights & analytics",
  "AI Nutrition Coach",
  "Achievements",
];

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const plan = isYearly ? PRICING.yearly : PRICING.monthly;

  return (
    <section id="pricing" className="scroll-mt-20 border-y border-border bg-surface">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-5 py-20 text-center md:px-8 md:py-28">
        {/* Section Header */}
        <FadeInCSS className="flex max-w-[600px] flex-col items-center gap-3.5">
          <span className="eyebrow">Pricing</span>
          <h2 className="text-display text-foreground text-balance">
            Start free. Upgrade when it earns it.
          </h2>
          <p className="text-base text-muted-foreground">
            Every premium plan includes a 7-day free trial.
          </p>
        </FadeInCSS>

        {/* Billing Toggle */}
        <FadeInCSS delay={0.05}>
          <div
            className="inline-flex rounded-xl border border-border bg-background p-1"
            role="group"
            aria-label="Billing period"
          >
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              aria-pressed={!isYearly}
              className={`h-[38px] rounded-[9px] px-[18px] text-sm font-semibold text-foreground transition-all ${
                !isYearly ? "bg-surface shadow-[0_1px_3px_rgba(35,29,26,0.12)]" : "hover:text-primary-dark"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              aria-pressed={isYearly}
              className={`inline-flex h-[38px] items-center gap-2 rounded-[9px] px-[18px] text-sm font-semibold text-foreground transition-all ${
                isYearly ? "bg-surface shadow-[0_1px_3px_rgba(35,29,26,0.12)]" : "hover:text-primary-dark"
              }`}
            >
              Yearly
              <span className="rounded-full bg-primary-dark px-[7px] py-0.5 text-[11px] font-bold text-white">
                −58%
              </span>
            </button>
          </div>
        </FadeInCSS>

        {/* Pricing Cards Grid */}
        <div className="grid w-full gap-4 text-left md:grid-cols-2">
          {/* Free Card */}
          <FadeInCSS
            y={24}
            viewportMargin="-50px"
            className="flex flex-col gap-5 rounded-3xl border border-border bg-background p-7 md:p-8"
          >
            <div className="flex flex-col gap-1.5">
              <h3 className="text-sm font-bold text-subtle">Free</h3>
              <p className="text-[44px] font-extrabold leading-none tracking-[-0.03em] tabular-nums font-rounded text-foreground">
                $0
              </p>
              <p className="text-sm text-subtle">forever</p>
            </div>

            <TrackedAppStoreLink
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              location="pricing"
              className="flex h-12 items-center justify-center rounded-xl border-[1.5px] border-foreground font-bold text-foreground transition-colors hover:bg-foreground hover:text-white"
            >
              Download free
            </TrackedAppStoreLink>

            <ul className="flex flex-col gap-2.5 text-[15px] text-muted-foreground">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <CheckIcon className="mt-[3px] h-4 w-4 shrink-0 text-primary-dark" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </FadeInCSS>

          {/* Premium Card */}
          <FadeInCSS
            y={24}
            delay={0.08}
            viewportMargin="-50px"
            className="relative flex flex-col gap-5 rounded-3xl bg-foreground p-7 text-white shadow-ink-lg md:p-8"
          >
            <span className="absolute -top-3 left-8 rounded-full bg-primary-dark px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-white">
              Most popular
            </span>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-sm font-bold text-white/70">Premium</h3>
              <p className="text-[44px] font-extrabold leading-none tracking-[-0.03em] tabular-nums font-rounded">
                {plan.price}
                <span className="text-base font-semibold text-white/70">{plan.per}</span>
              </p>
              <p className="text-sm text-white/70">{plan.note}</p>
            </div>

            <TrackedAppStoreLink
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              location="pricing"
              className="flex h-12 items-center justify-center rounded-xl bg-primary-dark font-bold text-white transition-colors hover:bg-primary-700"
            >
              Start 7-day free trial
            </TrackedAppStoreLink>

            <ul className="grid grid-cols-1 gap-2.5 text-[15px] text-white/85 sm:grid-cols-2">
              {PREMIUM_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <CheckIcon className="mt-[3px] h-4 w-4 shrink-0 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </FadeInCSS>
        </div>
      </div>
    </section>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
