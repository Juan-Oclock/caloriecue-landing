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
   * Live stat values for the trust badge. Sourced from the Supabase RPC
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
  hint: string;
}

const GOALS: GoalConfig[] = [
  { goal: "lose-weight", label: "Lose weight", hint: "Deficit, high protein" },
  { goal: "build-muscle", label: "Build muscle", hint: "Small surplus" },
  { goal: "maintain", label: "Maintain", hint: "Hold steady" },
  { goal: "gain-weight", label: "Gain weight", hint: "Steady surplus" },
];

/** Rounds down to a friendly "3,000+" style figure for the trust badge. */
export function formatPeopleCount(n: number): string {
  if (n >= 1_000_000) return `${Math.floor(n / 100_000) / 10}M+`;
  if (n >= 10_000) return `${Math.floor(n / 1_000).toLocaleString("en-US")},000+`;
  if (n >= 1_000) return `${(Math.floor(n / 100) * 100).toLocaleString("en-US")}+`;
  return `${n}+`;
}

function handleCalculatorClick(e: React.MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  const target = document.getElementById("calculator");
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Hero({ selectedGoal, onGoalSelect, stats }: HeroProps) {
  return (
    <section id="top" className="relative overflow-x-clip px-5 pt-28 md:px-8 md:pt-36 lg:pt-40">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
        {/* Left: content */}
        <div className="flex flex-col gap-7">
          {/* Trust badge */}
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-2.5 pr-3.5 text-[13px] font-medium text-muted-foreground">
            <span className="text-xs tracking-[1px] text-primary" aria-hidden="true">
              ★★★★★
            </span>
            <span>
              {stats.app_store_rating.toFixed(1)} on the App Store ·{" "}
              {formatPeopleCount(stats.total_users)} people tracking
            </span>
          </p>

          <h1 className="text-hero text-foreground text-balance">
            Pick your goal.
            <br />
            We&apos;ll do the <span className="text-primary-mid">math.</span>
          </h1>

          <p className="max-w-[520px] text-lg leading-[1.45] text-muted-foreground text-pretty md:text-xl">
            Lose, build, maintain, or gain — CalorieCue sets your daily calorie
            target, then logs every meal from a single photo. No typing, no
            portion guessing.
          </p>

          {/* Goal selector */}
          <div className="flex flex-col gap-2.5">
            <span
              id="hero-goal-label"
              className="text-xs font-semibold uppercase tracking-[0.08em] text-subtle"
            >
              What are you working toward?
            </span>
            <div
              className="grid max-w-[560px] grid-cols-2 gap-2"
              role="group"
              aria-label="Choose your goal"
              aria-describedby="hero-goal-label"
            >
              {GOALS.map(({ goal, label, hint }) => {
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
                    className={`flex flex-col items-start gap-1 rounded-xl border-[1.5px] px-3.5 py-3 text-left transition-all duration-150 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 ${
                      isSelected
                        ? "border-primary bg-primary-100 shadow-sm"
                        : "border-border-strong bg-surface hover:border-primary"
                    }`}
                  >
                    <span className="text-sm font-bold leading-tight text-foreground">
                      {label}
                    </span>
                    <span className="text-xs text-subtle">{hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch">
            <AppStoreButton variant="hero" hideTagline location="hero" />
            <a
              href="#calculator"
              onClick={handleCalculatorClick}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-border-strong px-5 text-base font-semibold text-foreground transition-colors hover:border-foreground"
            >
              Find my calorie target
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <p className="text-[13px] text-subtle">
            Free to start · 3 photo scans a day · No card required
          </p>
        </div>

        {/* Right: hero visual (Guardrail 2 — CalorieCue must be visible in the hero) */}
        <div className="relative flex min-h-[420px] items-end justify-center pb-14 sm:min-h-[520px] lg:min-h-[560px]">
          {/* Peach backdrop */}
          <div
            className="absolute inset-x-0 bottom-14 h-[78%] rounded-[32px] bg-peach"
            aria-hidden="true"
          />
          <Image
            src="/caloriecue-iphone-angle.webp"
            alt="CalorieCue calorie tracking app on iPhone showing the daily dashboard: calories remaining with a progress ring, protein, carbs and fat macros, and one-tap photo, scan, search and voice food logging"
            width={646}
            height={1426}
            priority
            sizes="(max-width: 640px) 68vw, 272px"
            className="relative z-10 h-auto w-[min(272px,68vw)] drop-shadow-[0_34px_44px_rgba(35,29,26,0.32)]"
          />

          {/* Floating proof cards */}
          <div
            className="absolute left-0 top-[56%] z-20 hidden items-center gap-2.5 rounded-[14px] border border-[#EEE8E1] bg-surface px-3.5 py-2.5 shadow-float sm:flex"
            aria-hidden="true"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#FFE4E8]">
              <span className="block h-3.5 w-3.5 rounded-full border-[3px] border-protein" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-xs text-subtle">Protein</span>
              <span className="text-[15px] font-bold font-rounded tabular-nums">128 / 111g</span>
            </span>
          </div>
          <div
            className="absolute right-0 top-0 z-20 hidden items-center gap-2.5 rounded-[14px] border border-[#EEE8E1] bg-surface px-3.5 py-2.5 shadow-float sm:flex"
            aria-hidden="true"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary-100 text-base font-extrabold text-primary-dark font-rounded">
              3s
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-xs text-subtle">Meal logged</span>
              <span className="text-[15px] font-bold">Garden salad · 412 kcal</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
