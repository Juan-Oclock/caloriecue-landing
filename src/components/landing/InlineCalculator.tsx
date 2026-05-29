"use client";

import { useEffect, useMemo, useState } from "react";
import type { Gender, ActivityLevel } from "@/lib/tdee/types";
import { ACTIVITY_LABELS } from "@/lib/tdee/constants";
import {
  getHomepageCalculatorResult,
  lbsToKg,
  kgToLbs,
  inchesToCm,
  cmToInches,
  type Goal,
  type HomepageCalculatorResult,
} from "@/lib/landing/calculator";
import {
  trackCalculatorStarted,
  trackCalculatorCompleted,
  trackCalculatorCtaClicked,
  type AnalyticsAdapter,
} from "@/lib/landing/analytics";
import { AuthorityPanel } from "./AuthorityPanel";

const APP_STORE_URL =
  "https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503";

export interface CalculatorCTA {
  label: string;
  href: string;
  variant: "primary" | "secondary";
  analyticsId: "app" | "guide";
}

export interface InlineCalculatorProps {
  selectedGoal?: Goal | null;
  /** Optional override (v1.1 will pass 3 CTAs to add "Email me my plan"). */
  ctas?: CalculatorCTA[];
  /** Test-only: inject a stub analytics adapter. */
  analytics?: AnalyticsAdapter;
}

interface InputState {
  gender: Gender;
  age: string;
  weightValue: string;
  weightUnit: "kg" | "lb";
  heightValue: string;
  heightUnit: "cm" | "in";
  activityLevel: ActivityLevel;
  goal: Goal;
}

const GOAL_OPTIONS: { goal: Goal; label: string; emoji: string }[] = [
  { goal: "lose-weight", label: "Lose Weight", emoji: "🔥" },
  { goal: "build-muscle", label: "Build Muscle", emoji: "💪" },
  { goal: "maintain", label: "Maintain", emoji: "⚖️" },
  { goal: "gain-weight", label: "Gain Weight", emoji: "📈" },
];

const ACTIVITY_OPTIONS: ActivityLevel[] = [
  "sedentary",
  "light",
  "moderate",
  "very_active",
  "extreme",
];

const INITIAL_STATE: InputState = {
  gender: "male",
  age: "",
  weightValue: "",
  weightUnit: "kg",
  heightValue: "",
  heightUnit: "cm",
  activityLevel: "moderate",
  goal: "lose-weight",
};

function inputToKg(value: string, unit: "kg" | "lb"): number {
  const n = parseFloat(value);
  if (!Number.isFinite(n)) return NaN;
  return unit === "lb" ? lbsToKg(n) : n;
}

function inputToCm(value: string, unit: "cm" | "in"): number {
  const n = parseFloat(value);
  if (!Number.isFinite(n)) return NaN;
  return unit === "in" ? inchesToCm(n) : n;
}

export function InlineCalculator({
  selectedGoal,
  ctas,
  analytics,
}: InlineCalculatorProps) {
  const [view, setView] = useState<"input" | "result">("input");
  const [inputs, setInputs] = useState<InputState>(() => ({
    ...INITIAL_STATE,
    goal: selectedGoal ?? INITIAL_STATE.goal,
  }));
  const [result, setResult] = useState<HomepageCalculatorResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasFiredStart, setHasFiredStart] = useState(false);

  // Sync goal when Hero's selection changes (only when in input state, so
  // we don't surprise the user mid-result with their result re-rendering).
  useEffect(() => {
    if (selectedGoal && view === "input") {
      setInputs((prev) => ({ ...prev, goal: selectedGoal }));
    }
  }, [selectedGoal, view]);

  function fireStartOnce() {
    if (!hasFiredStart) {
      trackCalculatorStarted(analytics);
      setHasFiredStart(true);
    }
  }

  function setField<K extends keyof InputState>(field: K, value: InputState[K]) {
    fireStartOnce();
    setInputs((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function toggleWeightUnit(next: "kg" | "lb") {
    if (next === inputs.weightUnit) return;
    const current = parseFloat(inputs.weightValue);
    let converted = "";
    if (Number.isFinite(current)) {
      const inKg = inputs.weightUnit === "lb" ? lbsToKg(current) : current;
      const inUnit = next === "lb" ? kgToLbs(inKg) : inKg;
      converted = String(Math.round(inUnit * 10) / 10);
    }
    setInputs((prev) => ({ ...prev, weightUnit: next, weightValue: converted }));
  }

  function toggleHeightUnit(next: "cm" | "in") {
    if (next === inputs.heightUnit) return;
    const current = parseFloat(inputs.heightValue);
    let converted = "";
    if (Number.isFinite(current)) {
      const inCm = inputs.heightUnit === "in" ? inchesToCm(current) : current;
      const inUnit = next === "in" ? cmToInches(inCm) : inCm;
      converted = String(Math.round(inUnit * 10) / 10);
    }
    setInputs((prev) => ({ ...prev, heightUnit: next, heightValue: converted }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const age = parseInt(inputs.age, 10);
    const weightKg = inputToKg(inputs.weightValue, inputs.weightUnit);
    const heightCm = inputToCm(inputs.heightValue, inputs.heightUnit);

    const errs: Record<string, string> = {};
    if (!age || age <= 0 || age > 120) errs.age = "Enter a valid age";
    if (!weightKg || weightKg <= 0) errs.weight = "Enter your weight";
    if (!heightCm || heightCm <= 0) errs.height = "Enter your height";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    const computed = getHomepageCalculatorResult({
      gender: inputs.gender,
      age,
      weightKg,
      heightCm,
      activityLevel: inputs.activityLevel,
      goal: inputs.goal,
    });
    setResult(computed);
    setView("result");
    trackCalculatorCompleted(
      { goal: inputs.goal, activityLevel: inputs.activityLevel },
      analytics,
    );
  }

  function handleRecalculate() {
    setView("input");
  }

  const effectiveCtas: CalculatorCTA[] = useMemo(() => {
    if (ctas) return ctas;
    return [
      {
        label: "Get the App — start tracking today",
        href: APP_STORE_URL,
        variant: "primary",
        analyticsId: "app",
      },
      {
        label: "Read the guide for my goal",
        href: `/blog/tag/${inputs.goal}`,
        variant: "secondary",
        analyticsId: "guide",
      },
    ];
  }, [ctas, inputs.goal]);

  return (
    <section
      id="calculator"
      className="scroll-mt-24 px-4 py-20 md:py-28 bg-gradient-to-b from-background via-primary-50/20 to-background"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary-dark px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
            Calculator
          </span>
          <h2 className="text-display-mobile md:text-display text-foreground mb-4">
            Find your starting number
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Your daily calorie target — and what to do with it.
          </p>
        </div>

        {/* Calculator + credibility panel side by side on desktop; the
            panel answers "can I trust this number?" right where the
            number appears. Stacks on mobile. */}
        <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:gap-8 lg:items-start">
          <div className="rounded-3xl border border-border/60 bg-white p-6 md:p-8 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] ring-1 ring-black/[0.02]">
            {view === "input" ? (
              <InputView
                inputs={inputs}
                errors={errors}
                setField={setField}
                toggleWeightUnit={toggleWeightUnit}
                toggleHeightUnit={toggleHeightUnit}
                onSubmit={handleSubmit}
              />
            ) : (
              <ResultView
                result={result!}
                ctas={effectiveCtas}
                onRecalculate={handleRecalculate}
                onCtaClick={(which) =>
                trackCalculatorCtaClicked({ which, goal: inputs.goal }, analytics)
              }
              />
            )}
          </div>

          <AuthorityPanel />
        </div>
      </div>
    </section>
  );
}

// ---- Input view ----------------------------------------------------------

interface InputViewProps {
  inputs: InputState;
  errors: Record<string, string>;
  setField: <K extends keyof InputState>(field: K, value: InputState[K]) => void;
  toggleWeightUnit: (next: "kg" | "lb") => void;
  toggleHeightUnit: (next: "cm" | "in") => void;
  onSubmit: (e: React.FormEvent) => void;
}

function InputView({
  inputs,
  errors,
  setField,
  toggleWeightUnit,
  toggleHeightUnit,
  onSubmit,
}: InputViewProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {/* Gender + Age — two-column row to reduce vertical length */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Gender
          </span>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Gender">
            {(["male", "female"] as Gender[]).map((g) => {
              const active = inputs.gender === g;
              return (
                <button
                  key={g}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setField("gender", g)}
                  className={`rounded-xl border-2 py-2.5 text-sm font-semibold transition-all ${
                    active
                      ? "border-primary bg-primary/10 text-primary-dark shadow-sm"
                      : "border-border bg-white text-foreground hover:border-primary/40 hover:bg-primary/[0.03]"
                  }`}
                >
                  {g === "male" ? "Male" : "Female"}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label
            htmlFor="calc-age"
            className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2"
          >
            Age
          </label>
          <input
            id="calc-age"
            type="number"
            inputMode="numeric"
            min={1}
            max={120}
            value={inputs.age}
            onChange={(e) => setField("age", e.target.value)}
            aria-invalid={Boolean(errors.age)}
            aria-describedby={errors.age ? "calc-age-error" : undefined}
            className={`w-full rounded-xl border-2 bg-white px-4 py-2.5 text-base text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-4 ${
              errors.age
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/15"
                : "border-border focus:border-primary focus:ring-primary/15"
            }`}
            placeholder="30"
          />
          {errors.age && (
            <p id="calc-age-error" className="mt-1.5 text-xs text-red-600">
              {errors.age}
            </p>
          )}
        </div>
      </div>

      {/* Weight + unit */}
      <div>
        <label
          htmlFor="calc-weight"
          className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2"
        >
          Weight
        </label>
        <div className="flex gap-2">
          <input
            id="calc-weight"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.1"
            value={inputs.weightValue}
            onChange={(e) => setField("weightValue", e.target.value)}
            aria-invalid={Boolean(errors.weight)}
            aria-describedby={errors.weight ? "calc-weight-error" : undefined}
            className={`flex-1 rounded-xl border-2 bg-white px-4 py-2.5 text-base text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-4 ${
              errors.weight
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/15"
                : "border-border focus:border-primary focus:ring-primary/15"
            }`}
            placeholder={inputs.weightUnit === "kg" ? "75" : "165"}
          />
          <UnitToggle
            label="Weight unit"
            options={["kg", "lb"]}
            value={inputs.weightUnit}
            onChange={(v) => toggleWeightUnit(v as "kg" | "lb")}
          />
        </div>
        {errors.weight && (
          <p id="calc-weight-error" className="mt-1.5 text-xs text-red-600">
            {errors.weight}
          </p>
        )}
      </div>

      {/* Height + unit */}
      <div>
        <label
          htmlFor="calc-height"
          className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2"
        >
          Height
        </label>
        <div className="flex gap-2">
          <input
            id="calc-height"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.1"
            value={inputs.heightValue}
            onChange={(e) => setField("heightValue", e.target.value)}
            aria-invalid={Boolean(errors.height)}
            aria-describedby={errors.height ? "calc-height-error" : undefined}
            className={`flex-1 rounded-xl border-2 bg-white px-4 py-2.5 text-base text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-4 ${
              errors.height
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/15"
                : "border-border focus:border-primary focus:ring-primary/15"
            }`}
            placeholder={inputs.heightUnit === "cm" ? "175" : "69"}
          />
          <UnitToggle
            label="Height unit"
            options={["cm", "in"]}
            value={inputs.heightUnit}
            onChange={(v) => toggleHeightUnit(v as "cm" | "in")}
          />
        </div>
        {errors.height && (
          <p id="calc-height-error" className="mt-1.5 text-xs text-red-600">
            {errors.height}
          </p>
        )}
      </div>

      {/* Activity level */}
      <div>
        <label
          htmlFor="calc-activity"
          className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2"
        >
          Activity level
        </label>
        <div className="relative">
          <select
            id="calc-activity"
            value={inputs.activityLevel}
            onChange={(e) => setField("activityLevel", e.target.value as ActivityLevel)}
            className="w-full appearance-none rounded-xl border-2 border-border bg-white px-4 py-2.5 pr-10 text-base text-foreground transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
          >
            {ACTIVITY_OPTIONS.map((level) => (
              <option key={level} value={level}>
                {ACTIVITY_LABELS[level].title} — {ACTIVITY_LABELS[level].description}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Goal */}
      <div>
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Goal
        </span>
        <div
          className="grid grid-cols-2 gap-2.5"
          role="group"
          aria-label="Goal"
        >
          {GOAL_OPTIONS.map(({ goal, label, emoji }) => {
            const active = inputs.goal === goal;
            return (
              <button
                key={goal}
                type="button"
                aria-pressed={active}
                onClick={() => setField("goal", goal)}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 py-3.5 text-sm font-semibold transition-all ${
                  active
                    ? "border-primary bg-primary/10 text-primary-dark shadow-sm"
                    : "border-border bg-white text-foreground hover:border-primary/40 hover:bg-primary/[0.03]"
                }`}
              >
                <span className="text-2xl leading-none" aria-hidden="true">
                  {emoji}
                </span>
                <span className="leading-tight">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="group relative mt-2 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary py-4 text-base font-semibold text-white shadow-md transition-all hover:bg-primary-dark hover:shadow-lg active:scale-[0.99]"
      >
        Find My Number
        <svg
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </form>
  );
}

interface UnitToggleProps {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}

function UnitToggle({ label, options, value, onChange }: UnitToggleProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex rounded-xl border border-border bg-muted/30 p-1"
    >
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt)}
            className={`min-w-[3rem] rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              active
                ? "bg-white text-primary-dark shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ---- Result view ---------------------------------------------------------

interface ResultViewProps {
  result: HomepageCalculatorResult;
  ctas: CalculatorCTA[];
  onRecalculate: () => void;
  onCtaClick: (which: "app" | "guide") => void;
}

function ResultView({ result, ctas, onRecalculate, onCtaClick }: ResultViewProps) {
  const [proteinLow, proteinHigh] = result.proteinRangeGrams;
  return (
    <div className="space-y-6">
      {/* Hero number */}
      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-dark mb-3">
          Your target
        </p>
        <p
          className="text-sm font-medium text-muted-foreground mb-1"
          aria-hidden="true"
        >
          about
        </p>
        <p className="leading-none">
          <span className="bg-gradient-to-br from-primary to-primary-dark bg-clip-text text-6xl md:text-7xl font-bold text-transparent tabular-nums">
            {result.dailyCalories.toLocaleString("en-US")}
          </span>
        </p>
        <p className="mt-2 text-sm font-medium text-muted-foreground">
          calories/day
        </p>
        <span className="sr-only">
          Your target: about {result.dailyCalories.toLocaleString("en-US")} calories per day
        </span>
      </div>

      {/* Metric cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard
          label="Protein"
          value={`${proteinLow}–${proteinHigh}`}
          unit="g/day"
        />
        <MetricCard
          label="Pace"
          value={result.goalPaceLabel.split(" ")[0]}
          unit={result.goalPaceLabel.split(" ").slice(1).join(" ")}
        />
        <MetricCard
          label="Maintenance"
          value={`~${result.maintenanceCalories.toLocaleString("en-US")}`}
          unit="cal/day"
        />
      </div>

      {/* Next step callout */}
      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] to-primary/[0.02] px-5 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15">
          <svg
            className="h-4 w-4 text-primary-dark"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-dark mb-1">
            Best next step
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            {result.nextStepText}
          </p>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-2.5">
        {ctas.map((cta) => (
          <a
            key={cta.label}
            href={cta.href}
            onClick={() => onCtaClick(cta.analyticsId)}
            className={
              cta.variant === "primary"
                ? "group inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-base font-semibold text-white shadow-md transition-all hover:bg-primary-dark hover:shadow-lg active:scale-[0.99]"
                : "group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary/25 bg-white py-3.5 text-base font-semibold text-primary-dark transition-all hover:border-primary/50 hover:bg-primary/[0.04]"
            }
          >
            {cta.label}
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        ))}
      </div>

      {/* Trust + power-user lines + recalculate */}
      <div className="space-y-3 border-t border-border/60 pt-5">
        <p className="text-xs text-muted-foreground leading-relaxed text-center">
          Your target is a starting point, not medical advice.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-muted-foreground">
          <a
            href="/tdee-calculator"
            className="inline-flex items-center gap-1 font-medium text-foreground/80 hover:text-foreground"
          >
            <span>Full TDEE calculator</span>
            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
          <span className="hidden sm:inline opacity-40" aria-hidden="true">·</span>
          <button
            type="button"
            onClick={onRecalculate}
            className="inline-flex items-center gap-1 font-medium text-foreground/80 hover:text-foreground"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Recalculate
          </button>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  unit: string;
}

function MetricCard({ label, value, unit }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3.5 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </p>
      <p className="text-lg font-bold text-foreground tabular-nums leading-tight">
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
        {unit}
      </p>
    </div>
  );
}
