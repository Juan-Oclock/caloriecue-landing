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
  trackAppStoreClick,
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

const GOAL_OPTIONS: { goal: Goal; label: string }[] = [
  { goal: "lose-weight", label: "Lose weight" },
  { goal: "build-muscle", label: "Build muscle" },
  { goal: "maintain", label: "Maintain" },
  { goal: "gain-weight", label: "Gain weight" },
];

const GOAL_LABELS: Record<Goal, string> = Object.fromEntries(
  GOAL_OPTIONS.map((g) => [g.goal, g.label]),
) as Record<Goal, string>;

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
        label: "Get the App — track toward it",
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
      className="scroll-mt-20 px-5 py-20 md:px-8 md:py-28"
    >
      <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        {/* Left: why this number can be trusted — sticks while the form scrolls */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-24">
          <span className="eyebrow">Step one</span>
          <h2 className="text-display text-foreground text-balance">
            Find your starting number.
          </h2>
          <AuthorityPanel />
        </div>

        {/* Right: the calculator card */}
        <div className="rounded-3xl border border-border bg-surface p-5 shadow-card-lg sm:p-7 md:p-8">
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
              goalLabel={GOAL_LABELS[inputs.goal]}
              ctas={effectiveCtas}
              onRecalculate={handleRecalculate}
              onCtaClick={(which) => {
                trackCalculatorCtaClicked({ which, goal: inputs.goal }, analytics);
                if (which === "app") {
                  trackAppStoreClick({ location: "calculator" }, analytics);
                }
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}

// ---- Shared styles --------------------------------------------------------

const LABEL_CLASS = "block text-[13px] font-semibold text-muted-foreground mb-1.5";

function inputClass(hasError: boolean) {
  return `w-full h-11 rounded-[10px] border bg-white px-3.5 text-base text-foreground placeholder:text-subtle/60 transition-all focus:outline-none focus:ring-4 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
      : "border-border-strong focus:border-primary focus:ring-primary/15"
  }`;
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
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Sex */}
        <div>
          <span className={LABEL_CLASS}>Sex</span>
          <div
            className="grid grid-cols-2 overflow-hidden rounded-[10px] border border-border-strong bg-white"
            role="group"
            aria-label="Sex"
          >
            {(["male", "female"] as Gender[]).map((g) => {
              const active = inputs.gender === g;
              return (
                <button
                  key={g}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setField("gender", g)}
                  className={`h-[42px] text-sm font-semibold transition-colors ${
                    active
                      ? "bg-foreground text-white"
                      : "bg-white text-foreground hover:bg-muted"
                  }`}
                >
                  {g === "male" ? "Male" : "Female"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Age */}
        <div>
          <label htmlFor="calc-age" className={LABEL_CLASS}>
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
            className={inputClass(Boolean(errors.age))}
            placeholder="30"
          />
          {errors.age && (
            <p id="calc-age-error" className="mt-1.5 text-xs text-red-600">
              {errors.age}
            </p>
          )}
        </div>

        {/* Weight + unit */}
        <div>
          <label htmlFor="calc-weight" className={LABEL_CLASS}>
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
              className={`${inputClass(Boolean(errors.weight))} min-w-0 flex-1`}
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
          <label htmlFor="calc-height" className={LABEL_CLASS}>
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
              className={`${inputClass(Boolean(errors.height))} min-w-0 flex-1`}
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
      </div>

      {/* Activity level */}
      <div>
        <label htmlFor="calc-activity" className={LABEL_CLASS}>
          Activity level
        </label>
        <div className="relative">
          <select
            id="calc-activity"
            value={inputs.activityLevel}
            onChange={(e) => setField("activityLevel", e.target.value as ActivityLevel)}
            className="h-11 w-full appearance-none rounded-[10px] border border-border-strong bg-white px-3.5 pr-10 text-[15px] text-foreground transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
          >
            {ACTIVITY_OPTIONS.map((level) => (
              <option key={level} value={level}>
                {ACTIVITY_LABELS[level].title} — {ACTIVITY_LABELS[level].description}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
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
        <span className={LABEL_CLASS}>Goal</span>
        <div
          className="grid grid-cols-2 gap-1.5 sm:grid-cols-4"
          role="group"
          aria-label="Goal"
        >
          {GOAL_OPTIONS.map(({ goal, label }) => {
            const active = inputs.goal === goal;
            return (
              <button
                key={goal}
                type="button"
                aria-pressed={active}
                onClick={() => setField("goal", goal)}
                className={`h-10 rounded-[10px] border-[1.5px] px-2 text-[13px] font-semibold transition-all ${
                  active
                    ? "border-primary bg-primary-100 text-foreground"
                    : "border-border-strong bg-surface text-foreground hover:border-primary"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="group mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-dark text-base font-bold text-white shadow-coral transition-all hover:bg-primary-700 active:scale-[0.99]"
      >
        Find my number
        <span
          className="transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        >
          →
        </span>
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
      className="inline-flex h-11 shrink-0 items-center rounded-[10px] border border-border-strong bg-muted/60 p-1"
    >
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt)}
            className={`h-full min-w-[2.75rem] rounded-lg px-2.5 text-sm font-semibold transition-colors ${
              active
                ? "bg-white text-foreground shadow-sm"
                : "text-subtle hover:text-foreground"
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
  goalLabel: string;
  ctas: CalculatorCTA[];
  onRecalculate: () => void;
  onCtaClick: (which: "app" | "guide") => void;
}

function ResultView({ result, goalLabel, ctas, onRecalculate, onCtaClick }: ResultViewProps) {
  const [proteinLow, proteinHigh] = result.proteinRangeGrams;
  const calories = result.dailyCalories.toLocaleString("en-US");
  const maintenance = result.maintenanceCalories.toLocaleString("en-US");

  return (
    <div className="flex flex-col gap-5">
      {/* Hero number — dark panel */}
      <div className="flex flex-col gap-1 rounded-2xl bg-foreground p-5 text-white sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/70">
          <span>Your target</span>
          <span aria-hidden="true"> · {goalLabel}</span>
        </p>
        <p className="mt-1 flex items-baseline gap-2 leading-none" aria-hidden="true">
          <span className="text-sm font-medium text-white/70">about</span>
          <span className="text-[44px] font-extrabold tabular-nums font-rounded sm:text-[48px]">
            {calories}
          </span>
          <span className="text-base font-semibold text-white/70">kcal / day</span>
        </p>
        <p className="mt-1 text-[13px] text-white/70" aria-hidden="true">
          {result.goalPaceLabel} · maintenance {maintenance} kcal
        </p>
        <span className="sr-only">
          Your target: about {calories} calories per day for {goalLabel.toLowerCase()}.
          {" "}{result.goalPaceLabel}. Maintenance is about {maintenance} calories per day.
        </span>
      </div>

      {/* Metric cards row */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
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
          value={`~${maintenance}`}
          unit="kcal/day"
        />
      </div>

      {/* Next step callout */}
      <div className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary-50 px-4 py-3.5">
        <span
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-dark"
          aria-hidden="true"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <div>
          <p className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-primary-dark">
            Best next step
          </p>
          <p className="text-sm leading-relaxed text-foreground">
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
                ? "group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-dark px-4 text-base font-bold text-white shadow-coral transition-all hover:bg-primary-700 active:scale-[0.99]"
                : "group inline-flex h-12 items-center justify-center gap-2 rounded-xl border-[1.5px] border-border-strong bg-surface px-4 text-base font-semibold text-foreground transition-colors hover:border-foreground"
            }
          >
            {cta.label}
            <span className="transition-transform group-hover:translate-x-0.5" aria-hidden="true">
              →
            </span>
          </a>
        ))}
      </div>

      {/* Trust + power-user lines + recalculate */}
      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <p className="text-center text-xs leading-relaxed text-subtle">
          Your target is a starting point, not medical advice.
        </p>

        <div className="flex flex-col items-center justify-center gap-2 text-xs text-subtle sm:flex-row sm:gap-4">
          <a
            href="/tdee-calculator"
            className="inline-flex items-center gap-1 font-semibold text-foreground/80 hover:text-foreground"
          >
            Full TDEE calculator
            <span aria-hidden="true">→</span>
          </a>
          <span className="hidden opacity-40 sm:inline" aria-hidden="true">·</span>
          <button
            type="button"
            onClick={onRecalculate}
            className="inline-flex items-center gap-1 font-semibold text-foreground/80 hover:text-foreground"
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
    <div className="rounded-xl bg-background px-3.5 py-3">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-subtle">
        {label}
      </p>
      <p className="text-xl font-extrabold leading-tight tabular-nums text-foreground font-rounded">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] leading-tight text-subtle">{unit}</p>
    </div>
  );
}
