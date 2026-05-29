"use client";

import Image from "next/image";
import AppStoreButton from "@/components/AppStoreButton";
import type { Goal } from "@/lib/landing/calculator";
import { trackHeroGoalSelected } from "@/lib/landing/analytics";

export interface HeroProps {
  selectedGoal: Goal | null;
  /**
   * Called when the user taps a goal card. Tapping the currently-selected
   * card is a no-op (we don't deselect, since an empty mid-flow state is
   * awkward); switching to a different goal updates the selection.
   */
  onGoalSelect: (goal: Goal) => void;
  /**
   * Live stat values for the trust strip. Sourced from the Supabase RPC
   * on the server and threaded down via HeroAndCalculatorFlow.
   */
  stats: {
    total_users: number;
    meals_scanned: number;
    app_store_rating: number;
  };
}

interface GoalConfig {
  goal: Goal;
  label: string;
  emoji: string;
}

const GOALS: GoalConfig[] = [
  { goal: "lose-weight", label: "Lose Weight", emoji: "🔥" },
  { goal: "build-muscle", label: "Build Muscle", emoji: "💪" },
  { goal: "maintain", label: "Maintain", emoji: "⚖️" },
  { goal: "gain-weight", label: "Gain Weight", emoji: "📈" },
];

const GOAL_PATHS: Record<Goal, string[]> = {
  "lose-weight": [
    "Calculate your calorie deficit",
    "Track meals without guessing",
    "Monitor weekly progress",
    "Adjust when weight loss stalls",
  ],
  "build-muscle": [
    "Calculate your calorie surplus",
    "Hit your daily protein target",
    "Train consistently and track recovery",
    "Adjust as you grow",
  ],
  maintain: [
    "Find your maintenance calories",
    "Track flexibly, not perfectly",
    "Watch weekly averages, not daily spikes",
    "Adjust seasonally as life changes",
  ],
  "gain-weight": [
    "Calculate your calorie surplus",
    "Eat enough — even when you're not hungry",
    "Track to hit your number, not exceed it",
    "Adjust if the scale isn't moving",
  ],
};

function formatCompactCount(n: number): string {
  if (n >= 1_000_000) {
    const millions = n / 1_000_000;
    return `${millions >= 10 ? Math.round(millions) : millions.toFixed(1)}M+`;
  }
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k+`;
  return `${n}+`;
}

function handleStartClick(e: React.MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  const target = document.getElementById("calculator");
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Hero({ selectedGoal, onGoalSelect, stats }: HeroProps) {
  const path = selectedGoal ? GOAL_PATHS[selectedGoal] : null;

  return (
    <section className="relative pt-28 pb-16 md:pt-40 md:pb-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* Left: content */}
          <div className="text-center lg:text-left">
            <h1 className="text-hero-mobile md:text-hero text-foreground mb-5">
              Track calories for the{" "}
              <span className="text-gradient">goal you&apos;re working toward.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Lose weight, build muscle, maintain, or gain weight with a clear
              calorie target and faster meal tracking.
            </p>

            {/* Interactive prompt */}
            <p className="text-sm font-medium text-foreground mb-4">
              What&apos;s your goal?
            </p>

            {/* Goal cards: 2x2 on mobile, 4x1 on lg */}
            <div
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 max-w-xl mx-auto lg:mx-0"
              role="group"
              aria-label="Choose your goal"
            >
              {GOALS.map(({ goal, label, emoji }) => {
                const isSelected = selectedGoal === goal;
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => {
                      if (!isSelected) {
                        trackHeroGoalSelected({ goal });
                        onGoalSelect(goal);
                      }
                    }}
                    aria-pressed={isSelected}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border px-3 py-4 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary-dark shadow-sm"
                        : "border-border bg-white text-foreground hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {emoji}
                    </span>
                    <span className="leading-tight">{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Personalized path reveal */}
            {path && (
              <div
                className="mb-8 rounded-2xl border border-primary/15 bg-primary/[0.03] px-5 py-4 max-w-xl mx-auto lg:mx-0 text-left"
                aria-live="polite"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-primary-dark mb-3">
                  Your path
                </p>
                <ol className="space-y-2">
                  {path.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary-dark">
                        {i + 1}
                      </span>
                      <span className="leading-snug">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* CTAs — sm:items-stretch ensures both buttons match the
                taller AppStoreButton's height (its 2-line text stack
                makes it taller than a single-line CTA). */}
            <div className="grid grid-cols-1 sm:flex sm:flex-row sm:items-stretch gap-3 max-w-xl mx-auto lg:mx-0">
              <a
                href="#calculator"
                onClick={handleStartClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary-dark text-white text-lg font-semibold hover:bg-primary-700 transition-colors shadow-sm w-full sm:w-auto"
              >
                Start With My Goal
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </a>
              <AppStoreButton variant="hero" hideTagline location="hero" className="w-full sm:w-auto [&>div]:w-full [&>div]:sm:w-auto [&>div]:h-full [&_a]:h-full [&_a>div]:h-full" />
            </div>

            {/* Trust strip */}
            <p className="mt-8 text-xs text-muted-foreground text-center lg:text-left">
              Trusted by {formatCompactCount(stats.total_users)} people ·{" "}
              {formatCompactCount(stats.meals_scanned)} meals tracked ·{" "}
              {stats.app_store_rating.toFixed(1)} ★ on the App Store
            </p>
          </div>

          {/* Right: hero visual (Guardrail 2 — CalorieCue must be visible in the hero) */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div
                className="absolute inset-0 translate-x-4 translate-y-8 md:translate-x-10 md:translate-y-20 bg-black/10 blur-[30px] md:blur-[50px] rounded-[2.5rem]"
                style={{ zIndex: 1 }}
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 translate-x-3 translate-y-6 md:translate-x-7 md:translate-y-14 bg-black/15 blur-[20px] md:blur-[35px] rounded-[2.5rem]"
                style={{ zIndex: 2 }}
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 translate-x-2 translate-y-4 md:translate-x-4 md:translate-y-8 bg-black/20 blur-[12px] md:blur-[20px] rounded-[2.5rem]"
                style={{ zIndex: 3 }}
                aria-hidden="true"
              />
              <Image
                src="/caloriecue-app-home.webp"
                alt="CalorieCue calorie tracking app on iPhone showing the daily dashboard: calories remaining with a progress ring, protein, carbs and fat macros, and one-tap photo, scan, search and voice food logging"
                width={340}
                height={694}
                priority
                sizes="(max-width: 768px) 260px, 340px"
                className="relative z-10 w-[260px] md:w-[340px] h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
