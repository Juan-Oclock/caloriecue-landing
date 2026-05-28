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
        label: "Get the App — make tracking effortless",
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
      className="scroll-mt-24 px-4 py-20 md:py-28 bg-background"
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block text-primary-dark font-medium text-sm mb-3 uppercase tracking-wider">
            Calculator
          </span>
          <h2 className="text-display-mobile md:text-display text-foreground mb-4">
            Find your starting number
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Your daily calorie target — and what to do with it.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-white p-6 md:p-8 shadow-sm">
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
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {/* Gender */}
      <div>
        <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
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
                className={`rounded-xl border py-3 text-sm font-semibold transition-colors ${
                  active
                    ? "border-primary bg-primary/10 text-primary-dark"
                    : "border-border bg-white text-foreground hover:border-primary/30"
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
        <label
          htmlFor="calc-age"
          className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2"
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
          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="e.g. 30"
        />
        {errors.age && (
          <p id="calc-age-error" className="mt-1.5 text-xs text-red-600">
            {errors.age}
          </p>
        )}
      </div>

      {/* Weight + unit */}
      <div>
        <label
          htmlFor="calc-weight"
          className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2"
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
            className="flex-1 rounded-xl border border-border bg-white px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder={inputs.weightUnit === "kg" ? "e.g. 75" : "e.g. 165"}
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
          className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2"
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
            className="flex-1 rounded-xl border border-border bg-white px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder={inputs.heightUnit === "cm" ? "e.g. 175" : "e.g. 69"}
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
          className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2"
        >
          Activity level
        </label>
        <select
          id="calc-activity"
          value={inputs.activityLevel}
          onChange={(e) => setField("activityLevel", e.target.value as ActivityLevel)}
          className="w-full appearance-none rounded-xl border border-border bg-white px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {ACTIVITY_OPTIONS.map((level) => (
            <option key={level} value={level}>
              {ACTIVITY_LABELS[level].title} — {ACTIVITY_LABELS[level].description}
            </option>
          ))}
        </select>
      </div>

      {/* Goal */}
      <div>
        <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Goal
        </span>
        <div
          className="grid grid-cols-2 gap-2"
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
                className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-colors ${
                  active
                    ? "border-primary bg-primary/10 text-primary-dark"
                    : "border-border bg-white text-foreground hover:border-primary/30"
                }`}
              >
                <span aria-hidden="true">{emoji}</span>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full rounded-xl bg-primary py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
      >
        Find My Number
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
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-dark mb-2">
          Your target
        </p>
        <p className="text-3xl md:text-4xl font-bold text-foreground">
          about {result.dailyCalories.toLocaleString("en-US")} calories/day
        </p>
      </div>

      <dl className="rounded-2xl bg-muted/30 px-5 py-4 space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-sm text-muted-foreground">Protein</dt>
          <dd className="text-sm font-semibold text-foreground">
            {proteinLow}–{proteinHigh}g/day
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-sm text-muted-foreground">Goal pace</dt>
          <dd className="text-sm font-semibold text-foreground">
            {result.goalPaceLabel}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-sm text-muted-foreground">Maintenance estimate</dt>
          <dd className="text-sm font-semibold text-foreground">
            ~{result.maintenanceCalories.toLocaleString("en-US")} cal/day
          </dd>
        </div>
      </dl>

      <div className="rounded-2xl border border-primary/15 bg-primary/[0.04] px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-dark mb-1.5">
          Best next step
        </p>
        <p className="text-sm text-foreground leading-relaxed">
          {result.nextStepText}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {ctas.map((cta) => (
          <a
            key={cta.label}
            href={cta.href}
            onClick={() => onCtaClick(cta.analyticsId)}
            className={
              cta.variant === "primary"
                ? "inline-flex items-center justify-center rounded-xl bg-primary py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
                : "inline-flex items-center justify-center rounded-xl border border-primary/30 bg-white py-3.5 text-base font-semibold text-primary-dark transition-colors hover:border-primary/60 hover:bg-primary/5"
            }
          >
            {cta.label}
          </a>
        ))}
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed text-center">
        Based on standard TDEE formulas (Mifflin-St Jeor) and adjustable
        activity estimates. Your target is a starting point, not medical
        advice.{" "}
        <a
          href="/tdee-calculator#methodology"
          className="underline underline-offset-2 hover:text-foreground"
        >
          See full methodology
        </a>
        .
      </p>

      <p className="text-xs text-muted-foreground text-center">
        Want the detailed breakdown with multiple formulas?{" "}
        <a
          href="/tdee-calculator"
          className="underline underline-offset-2 hover:text-foreground"
        >
          See the full TDEE calculator →
        </a>
      </p>

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onRecalculate}
          className="text-sm font-medium text-muted-foreground hover:text-foreground underline underline-offset-2"
        >
          Recalculate
        </button>
      </div>
    </div>
  );
}
