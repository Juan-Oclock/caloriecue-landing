"use client";

import { useReducer, useState, useMemo, useCallback, type FormEvent } from "react";
import FadeInCSS from "@/components/FadeInCSS";
import TrackedAppStoreLink from "@/components/TrackedAppStoreLink";
import { AppleLogo } from "@/components/AppStoreButton";
import DetailedMetrics from "@/components/tdee/results/DetailedMetrics";
import MealPlanSection from "@/components/tdee/results/MealPlanSection";
import type {
  Gender,
  UnitSystem,
  ActivityLevel,
  MacroPlan,
  TDEEResults,
} from "@/lib/tdee/types";
import { ACTIVITY_LABELS, ACTIVITY_MULTIPLIERS, MACRO_PRESETS } from "@/lib/tdee/constants";
import {
  calculateAll,
  calculateMacros,
  calculateWeeklyProjection,
  getBMICategory,
  calculateIdealWeight,
  calculateActivityBreakdown,
  lbsToKg,
  kgToLbs,
  feetInchesToCm,
  cmToFeetInches,
} from "@/lib/tdee/formulas";

const APP_STORE_URL =
  "https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503";

// --- Step config ---------------------------------------------------------

const STEP_TABS = [
  { label: "Basics", sub: "Sex & age" },
  { label: "Measurements", sub: "Weight & height" },
  { label: "Lifestyle", sub: "Activity level" },
];

const ACTIVITY_OPTIONS: ActivityLevel[] = [
  "sedentary",
  "light",
  "moderate",
  "very_active",
  "extreme",
];

type GoalId = "fastcut" | "cut" | "maintain" | "lean" | "bulk";

const GOALS: { id: GoalId; label: string; adj: number; rate: string }[] = [
  { id: "fastcut", label: "Fast cut", adj: -750, rate: "≈ 0.7 kg (1.5 lb) / week" },
  { id: "cut", label: "Lose weight", adj: -500, rate: "≈ 0.45 kg (1 lb) / week" },
  { id: "maintain", label: "Maintain", adj: 0, rate: "Hold current weight" },
  { id: "lean", label: "Lean bulk", adj: 250, rate: "≈ 0.25 kg (0.5 lb) / week" },
  { id: "bulk", label: "Gain weight", adj: 500, rate: "≈ 0.45 kg (1 lb) / week" },
];

const MACRO_PLANS: MacroPlan[] = ["balanced", "low_carb", "high_carb"];

const MIN_CALORIES = 1200;

// --- State ---------------------------------------------------------------

interface State {
  unitSystem: UnitSystem;
  gender: Gender;
  age: string;
  weightLbs: string;
  weightKg: string;
  heightFeet: string;
  heightInches: string;
  heightCm: string;
  bodyFatPercent: string;
  activityLevel: ActivityLevel;
  results: TDEEResults | null;
  computedWeightKg: number;
  computedHeightCm: number;
  currentStep: number;
}

type Action =
  | { type: "SET_UNIT"; payload: UnitSystem }
  | { type: "SET_GENDER"; payload: Gender }
  | { type: "SET_ACTIVITY"; payload: ActivityLevel }
  | { type: "SET_FIELD"; field: string; value: string }
  | { type: "SET_RESULTS"; payload: { results: TDEEResults; weightKg: number; heightCm: number } }
  | { type: "CLEAR_RESULTS" }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "GO_TO_STEP"; payload: number };

const initialState: State = {
  unitSystem: "imperial",
  gender: "male",
  age: "",
  weightLbs: "",
  weightKg: "",
  heightFeet: "",
  heightInches: "",
  heightCm: "",
  bodyFatPercent: "",
  activityLevel: "moderate",
  results: null,
  computedWeightKg: 0,
  computedHeightCm: 0,
  currentStep: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_UNIT": {
      const next: State = { ...state, unitSystem: action.payload, results: null };

      if (action.payload === "metric" && state.unitSystem === "imperial") {
        const lbs = parseFloat(state.weightLbs);
        if (lbs) next.weightKg = String(Math.round(lbsToKg(lbs) * 10) / 10);
        const ft = parseInt(state.heightFeet);
        if (ft) {
          const inches = parseInt(state.heightInches) || 0;
          next.heightCm = String(Math.round(feetInchesToCm(ft, inches)));
        }
      } else if (action.payload === "imperial" && state.unitSystem === "metric") {
        const kg = parseFloat(state.weightKg);
        if (kg) next.weightLbs = String(Math.round(kgToLbs(kg) * 10) / 10);
        const cm = parseFloat(state.heightCm);
        if (cm) {
          const { feet, inches } = cmToFeetInches(cm);
          next.heightFeet = String(feet);
          next.heightInches = String(inches);
        }
      }

      return next;
    }
    case "SET_GENDER":
      return { ...state, gender: action.payload, results: null };
    case "SET_ACTIVITY":
      return { ...state, activityLevel: action.payload, results: null };
    case "SET_FIELD":
      return { ...state, [action.field]: action.value, results: null };
    case "SET_RESULTS":
      return {
        ...state,
        results: action.payload.results,
        computedWeightKg: action.payload.weightKg,
        computedHeightCm: action.payload.heightCm,
      };
    case "CLEAR_RESULTS":
      return { ...state, results: null, currentStep: 0 };
    case "NEXT_STEP":
      return { ...state, currentStep: Math.min(state.currentStep + 1, 2) };
    case "PREV_STEP":
      return { ...state, currentStep: Math.max(state.currentStep - 1, 0) };
    case "GO_TO_STEP":
      return { ...state, currentStep: action.payload };
    default:
      return state;
  }
}

// --- Validation -----------------------------------------------------------

function isAgeValid(state: State): boolean {
  const age = parseInt(state.age);
  return Boolean(age) && age >= 1 && age <= 120;
}

function areMeasurementsValid(state: State): boolean {
  if (state.unitSystem === "imperial") {
    const weightLbs = parseFloat(state.weightLbs);
    const feet = parseInt(state.heightFeet);
    return Boolean(weightLbs) && weightLbs > 0 && Boolean(feet) && feet > 0;
  }
  const weightKg = parseFloat(state.weightKg);
  const heightCm = parseFloat(state.heightCm);
  return Boolean(weightKg) && weightKg > 0 && Boolean(heightCm) && heightCm > 0;
}

function isStepValid(state: State, step: number): boolean {
  switch (step) {
    case 0:
      return isAgeValid(state);
    case 1:
      return areMeasurementsValid(state);
    default:
      return true;
  }
}

// --- Copy -----------------------------------------------------------------

const TDEE_FAQ = [
  {
    question: "What is the most accurate BMR formula?",
    answer:
      "The Mifflin-St Jeor equation is considered the most accurate for most people and is our default formula. The Katch-McArdle formula can be more accurate if you know your body fat percentage, as it accounts for lean body mass. We show results from multiple formulas so you can compare.",
  },
  {
    question: "How many calories should I eat to lose weight?",
    answer:
      "A common recommendation is to eat 500 calories below your TDEE, which creates a deficit of approximately 1 pound (0.45 kg) of weight loss per week. This is considered a safe and sustainable rate. Larger deficits can lead to muscle loss and metabolic adaptation.",
  },
  {
    question: "Should I eat back exercise calories?",
    answer:
      "It depends on your goals and how your activity level is already factored in. If you selected an activity level that includes your exercise, eating back exercise calories could lead to overcounting. If you chose a lower activity level and do extra workouts, you may want to eat back a portion (about 50-75%) of those calories.",
  },
  {
    question: "How accurate is a TDEE calculator?",
    answer:
      "TDEE calculators provide a solid estimate — typically within 10% of your actual expenditure. However, individual factors like genetics, hormones, NEAT (non-exercise activity thermogenesis), and metabolic adaptation can cause variations. Use your calculated TDEE as a starting point, then adjust based on real-world results over 2-4 weeks.",
  },
  {
    question: "What macronutrient ratio is best for weight loss?",
    answer:
      "There is no single best ratio, but a balanced split of 30% protein, 35% carbs, and 35% fat works well for most people. Higher protein (40%) can help preserve muscle during a calorie deficit. The most important factor for weight loss is total calories, not the exact macro split.",
  },
];

const EXPLAINERS = [
  {
    title: "What is TDEE?",
    body: "Total Daily Energy Expenditure is everything you burn in a day: your resting metabolism plus movement, exercise and digestion. It’s the single number a nutrition plan is built around.",
  },
  {
    title: "How it’s calculated",
    body: "Estimate BMR from age, weight, height and sex with Mifflin-St Jeor, then multiply by an activity factor between 1.2 and 1.9. That product is your maintenance calories.",
  },
  {
    title: "BMR vs TDEE",
    body: "BMR is what your body needs at complete rest — breathing, circulation, brain function — typically 60–75% of the total. TDEE stacks activity and the thermic effect of food on top.",
  },
  {
    title: "Choosing an activity level",
    body: "Sedentary is desk work. Lightly active is 1–3 light sessions a week; moderate is 3–5; very active is hard training 6–7 days. Unsure? Go one level lower and eat slightly more if you stall.",
  },
];

// --- Shared styles --------------------------------------------------------

const INPUT_CLASS =
  "h-[52px] w-full rounded-xl border border-border-strong bg-white px-4 text-lg font-semibold text-foreground placeholder:font-medium placeholder:text-subtle/60 transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15";
const LABEL_CLASS = "flex flex-col gap-2 text-[13px] font-semibold text-muted-foreground";
const PRIMARY_BTN =
  "inline-flex h-[54px] items-center justify-center gap-2 rounded-[14px] bg-foreground px-5 text-base font-bold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-foreground";
const BACK_BTN =
  "inline-flex h-[54px] items-center justify-center rounded-[14px] border-[1.5px] border-border-strong px-5 text-base font-semibold text-foreground transition-colors hover:border-foreground";

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

// --- Component ------------------------------------------------------------

export default function TDEECalculatorClient() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [goal, setGoal] = useState<GoalId>("cut");
  const [macroPlan, setMacroPlan] = useState<MacroPlan>("balanced");
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const canProceed = isStepValid(state, state.currentStep);
  const showResults = state.results !== null;

  const calculate = useCallback(() => {
    const age = parseInt(state.age);
    if (!age || age < 1 || age > 120) return;

    let weightKg: number;
    let heightCm: number;

    if (state.unitSystem === "imperial") {
      const weightLbs = parseFloat(state.weightLbs);
      const feet = parseInt(state.heightFeet);
      const inches = parseInt(state.heightInches) || 0;
      if (!weightLbs || !feet) return;
      weightKg = lbsToKg(weightLbs);
      heightCm = feetInchesToCm(feet, inches);
    } else {
      weightKg = parseFloat(state.weightKg);
      heightCm = parseFloat(state.heightCm);
      if (!weightKg || !heightCm) return;
    }

    const bodyFat = state.bodyFatPercent ? parseFloat(state.bodyFatPercent) : null;
    const results = calculateAll(weightKg, heightCm, age, state.gender, state.activityLevel, bodyFat);
    dispatch({ type: "SET_RESULTS", payload: { results, weightKg, heightCm } });

    setTimeout(() => {
      document.getElementById("tdee-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, [state]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canProceed) return;
    if (state.currentStep < 2) {
      dispatch({ type: "NEXT_STEP" });
    } else {
      calculate();
    }
  };

  const setField = (field: string, value: string) =>
    dispatch({ type: "SET_FIELD", field, value });

  const handleRecalculate = () => {
    dispatch({ type: "CLEAR_RESULTS" });
    setTimeout(() => {
      document.getElementById("tdee-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  // --- Derived results ----------------------------------------------------
  const results = state.results;
  const currentGoal = GOALS.find((g) => g.id === goal)!;
  const goalCal = results ? Math.max(MIN_CALORIES, results.tdee + currentGoal.adj) : 0;
  const macros = useMemo(
    () => (results ? calculateMacros(goalCal, macroPlan) : null),
    [results, goalCal, macroPlan],
  );
  const projection = useMemo(
    () => (results ? calculateWeeklyProjection(state.computedWeightKg, results.tdee, goalCal, 12) : []),
    [results, state.computedWeightKg, goalCal],
  );
  const bmiInfo = useMemo(() => (results ? getBMICategory(results.bmi) : null), [results]);
  const idealWeight = useMemo(
    () => (results ? calculateIdealWeight(state.computedHeightCm, state.gender) : []),
    [results, state.computedHeightCm, state.gender],
  );
  const activityBreakdown = useMemo(
    () => (results ? calculateActivityBreakdown(results.bmr.mifflinStJeor, state.activityLevel) : []),
    [results, state.activityLevel],
  );
  const preset = MACRO_PRESETS[macroPlan];

  const summary = results
    ? `${state.gender === "male" ? "Male" : "Female"}, ${state.age} · ${
        state.unitSystem === "metric"
          ? `${state.weightKg} kg · ${state.heightCm} cm`
          : `${state.weightLbs} lb · ${state.heightFeet}'${state.heightInches || 0}"`
      } · ${ACTIVITY_LABELS[state.activityLevel].title.toLowerCase()}`
    : "";

  const isImperial = state.unitSystem === "imperial";

  return (
    <div className="bg-background">
      {/* Hero + calculator */}
      <section className="px-5 pt-28 pb-12 md:px-8 md:pt-36 md:pb-20">
        <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
          {/* Left: intro (sticky on desktop) */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-24">
            <span className="eyebrow">Free TDEE calculator</span>
            <h1 className="text-hero text-foreground text-balance">
              How many calories do you actually burn?
            </h1>
            <p className="max-w-[480px] text-lg leading-[1.45] text-muted-foreground text-pretty md:text-xl">
              Your BMR, maintenance calories, goal targets and macros — from the
              Mifflin-St Jeor equation, the most validated formula in clinical
              use. Thirty seconds, no email.
            </p>
            <ul className="flex flex-wrap gap-5 text-sm text-muted-foreground">
              {["Three validated formulas", "Instant results", "100% free"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>

            {showResults && (
              <FadeInCSS className="flex flex-col gap-3.5 rounded-[20px] border border-border bg-surface p-[22px]">
                <span className="text-xs font-bold uppercase tracking-[0.08em] text-subtle">
                  Then what?
                </span>
                <p className="text-[15px] leading-relaxed text-muted-foreground">
                  A number is only useful if you can hit it. CalorieCue logs a meal
                  from one photo in three seconds, so you actually stay under it.
                </p>
                <TrackedAppStoreLink
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  location="calculator"
                  className="inline-flex h-12 w-fit items-center gap-2.5 rounded-xl bg-primary-dark px-5 text-[15px] font-bold text-white shadow-coral transition-colors hover:bg-primary-700"
                >
                  <AppleLogo className="h-5 w-5" />
                  Track toward {fmt(goalCal)} kcal — free
                </TrackedAppStoreLink>
              </FadeInCSS>
            )}
          </div>

          {/* Right: the card */}
          <div
            id="tdee-form"
            className="scroll-mt-24 overflow-hidden rounded-3xl border border-border bg-surface shadow-card-lg"
          >
            {/* Stepper */}
            <div
              className="grid grid-cols-3 border-b border-border"
              role="tablist"
              aria-label="Calculator steps"
            >
              {STEP_TABS.map((tab, i) => {
                const active = !showResults && state.currentStep === i;
                const done = showResults || state.currentStep > i;
                const reachable = showResults || i <= state.currentStep || isStepValid(state, i - 1);
                return (
                  <button
                    key={tab.label}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    disabled={!reachable && !done}
                    onClick={() => {
                      if (showResults) dispatch({ type: "CLEAR_RESULTS" });
                      dispatch({ type: "GO_TO_STEP", payload: i });
                    }}
                    className={`-mb-px flex min-w-0 items-center gap-2.5 overflow-hidden border-b-2 px-3.5 py-4 text-left transition-colors disabled:cursor-not-allowed sm:px-4 ${
                      active ? "border-primary bg-background" : "border-transparent hover:bg-background/60"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        active || done ? "bg-primary-dark text-white" : "bg-muted text-subtle"
                      }`}
                      aria-hidden="true"
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-[13px] font-bold text-foreground">{tab.label}</span>
                      <span className="hidden truncate text-[11px] text-subtle sm:block">{tab.sub}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-[22px] p-5 sm:p-7 md:p-8">
              {!showResults ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-[22px]" noValidate>
                  {/* Step 1 — Basics */}
                  {state.currentStep === 0 && (
                    <>
                      <StepHeading title="Let’s get started" sub="Just the basics — takes 30 seconds." />
                      <div className="flex flex-col gap-2">
                        <span className="text-[13px] font-semibold text-muted-foreground">Sex</span>
                        <div className="grid grid-cols-2 gap-2.5" role="group" aria-label="Sex">
                          {(["male", "female"] as Gender[]).map((g) => {
                            const active = state.gender === g;
                            return (
                              <button
                                key={g}
                                type="button"
                                aria-pressed={active}
                                onClick={() => dispatch({ type: "SET_GENDER", payload: g })}
                                className={`h-14 rounded-[14px] border-[1.5px] text-base font-bold text-foreground transition-colors ${
                                  active
                                    ? "border-primary bg-primary-100"
                                    : "border-border-strong bg-white hover:border-primary"
                                }`}
                              >
                                {g === "male" ? "Male" : "Female"}
                              </button>
                            );
                          })}
                        </div>
                        <span className="text-[13px] text-subtle">
                          Used to calibrate BMR formulas that differ by biological sex.
                        </span>
                      </div>
                      <label className={LABEL_CLASS}>
                        <span>Age</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={120}
                          value={state.age}
                          onChange={(e) => setField("age", e.target.value)}
                          placeholder="30"
                          className={INPUT_CLASS}
                          autoFocus
                        />
                      </label>
                      <button type="submit" disabled={!canProceed} className={PRIMARY_BTN}>
                        Continue <span aria-hidden="true">→</span>
                      </button>
                    </>
                  )}

                  {/* Step 2 — Measurements */}
                  {state.currentStep === 1 && (
                    <>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <StepHeading title="Your measurements" sub="Weight and height set your baseline burn." />
                        <div
                          className="inline-flex shrink-0 rounded-[10px] border border-border bg-background p-[3px]"
                          role="group"
                          aria-label="Units"
                        >
                          {(
                            [
                              ["metric", "kg · cm"],
                              ["imperial", "lb · ft"],
                            ] as [UnitSystem, string][]
                          ).map(([unit, label]) => {
                            const active = state.unitSystem === unit;
                            return (
                              <button
                                key={unit}
                                type="button"
                                aria-pressed={active}
                                onClick={() => dispatch({ type: "SET_UNIT", payload: unit })}
                                className={`h-8 rounded-[7px] px-3 text-[13px] font-semibold transition-colors ${
                                  active ? "bg-foreground text-white" : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <label className={LABEL_CLASS}>
                          <span className="whitespace-nowrap">Weight ({isImperial ? "lb" : "kg"})</span>
                          <input
                            type="number"
                            inputMode="decimal"
                            min={1}
                            step="0.1"
                            value={isImperial ? state.weightLbs : state.weightKg}
                            onChange={(e) => setField(isImperial ? "weightLbs" : "weightKg", e.target.value)}
                            placeholder={isImperial ? "165" : "75"}
                            className={INPUT_CLASS}
                          />
                        </label>
                        {isImperial ? (
                          <div className={LABEL_CLASS}>
                            <span className="whitespace-nowrap">Height (ft · in)</span>
                            <div className="grid grid-cols-2 gap-2">
                              <label className="sr-only" htmlFor="tdee-height-ft">Feet</label>
                              <input
                                id="tdee-height-ft"
                                type="number"
                                inputMode="numeric"
                                min={1}
                                max={8}
                                value={state.heightFeet}
                                onChange={(e) => setField("heightFeet", e.target.value)}
                                placeholder="5"
                                className={INPUT_CLASS}
                              />
                              <label className="sr-only" htmlFor="tdee-height-in">Inches</label>
                              <input
                                id="tdee-height-in"
                                type="number"
                                inputMode="numeric"
                                min={0}
                                max={11}
                                value={state.heightInches}
                                onChange={(e) => setField("heightInches", e.target.value)}
                                placeholder="9"
                                className={INPUT_CLASS}
                              />
                            </div>
                          </div>
                        ) : (
                          <label className={LABEL_CLASS}>
                            <span className="whitespace-nowrap">Height (cm)</span>
                            <input
                              type="number"
                              inputMode="decimal"
                              min={1}
                              value={state.heightCm}
                              onChange={(e) => setField("heightCm", e.target.value)}
                              placeholder="175"
                              className={INPUT_CLASS}
                            />
                          </label>
                        )}
                      </div>

                      <label className={LABEL_CLASS}>
                        <span>
                          Body fat %{" "}
                          <span className="font-normal text-subtle">— optional, unlocks Katch-McArdle</span>
                        </span>
                        <input
                          type="number"
                          inputMode="decimal"
                          min={1}
                          max={60}
                          step="0.1"
                          value={state.bodyFatPercent}
                          onChange={(e) => setField("bodyFatPercent", e.target.value)}
                          placeholder="e.g. 22"
                          className={INPUT_CLASS}
                        />
                      </label>

                      <div className="flex gap-2.5">
                        <button type="button" onClick={() => dispatch({ type: "PREV_STEP" })} className={BACK_BTN}>
                          Back
                        </button>
                        <button type="submit" disabled={!canProceed} className={`${PRIMARY_BTN} flex-1`}>
                          Continue <span aria-hidden="true">→</span>
                        </button>
                      </div>
                    </>
                  )}

                  {/* Step 3 — Lifestyle */}
                  {state.currentStep === 2 && (
                    <>
                      <StepHeading
                        title="Your lifestyle"
                        sub="When in doubt, pick the lower level — underestimating beats overestimating."
                      />
                      <div className="flex flex-col gap-2" role="group" aria-label="Activity level">
                        {ACTIVITY_OPTIONS.map((level) => {
                          const info = ACTIVITY_LABELS[level];
                          const active = state.activityLevel === level;
                          return (
                            <button
                              key={level}
                              type="button"
                              aria-pressed={active}
                              onClick={() => dispatch({ type: "SET_ACTIVITY", payload: level })}
                              className={`flex items-center justify-between gap-3.5 rounded-[14px] border-[1.5px] px-4 py-3.5 text-left transition-colors ${
                                active
                                  ? "border-primary bg-primary-100"
                                  : "border-border-strong bg-white hover:border-primary"
                              }`}
                            >
                              <span className="flex flex-col gap-0.5">
                                <span className="text-[15px] font-bold text-foreground">{info.title}</span>
                                <span className="text-[13px] text-subtle">{info.description}</span>
                              </span>
                              <span className="shrink-0 text-[13px] font-bold tabular-nums text-primary-dark font-rounded">
                                ×{ACTIVITY_MULTIPLIERS[level]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex gap-2.5">
                        <button type="button" onClick={() => dispatch({ type: "PREV_STEP" })} className={BACK_BTN}>
                          Back
                        </button>
                        <button
                          type="submit"
                          className="inline-flex h-[54px] flex-1 items-center justify-center gap-2 rounded-[14px] bg-primary-dark text-base font-bold text-white shadow-coral transition-colors hover:bg-primary-700"
                        >
                          Show my numbers <span aria-hidden="true">→</span>
                        </button>
                      </div>
                    </>
                  )}
                </form>
              ) : (
                results && macros && (
                  <div id="tdee-results" className="flex flex-col gap-[22px]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <StepHeading title="Your numbers" sub={summary} />
                      <button
                        type="button"
                        onClick={handleRecalculate}
                        className="h-9 shrink-0 rounded-[10px] border-[1.5px] border-border-strong px-3.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                      >
                        Edit inputs
                      </button>
                    </div>

                    {/* BMR + TDEE */}
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <div className="flex flex-col gap-1 rounded-2xl bg-background p-[18px]">
                        <span className="text-xs font-semibold text-subtle">BMR · at rest</span>
                        <span className="text-[30px] font-extrabold leading-none tracking-[-0.02em] tabular-nums font-rounded text-foreground">
                          {fmt(results.bmr.mifflinStJeor)}
                        </span>
                        <span className="text-xs text-subtle">kcal / day</span>
                      </div>
                      <div className="flex flex-col gap-1 rounded-2xl bg-foreground p-[18px] text-white">
                        <span className="text-xs font-semibold text-white/70">TDEE · maintenance</span>
                        <span className="text-[30px] font-extrabold leading-none tracking-[-0.02em] tabular-nums font-rounded">
                          {fmt(results.tdee)}
                        </span>
                        <span className="text-xs text-white/70">kcal / day</span>
                      </div>
                    </div>

                    {/* Goal picker */}
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[13px] font-semibold text-muted-foreground">Pick a goal</span>
                        <span className="text-xs text-subtle">{currentGoal.rate}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5" role="group" aria-label="Goal">
                        {GOALS.map((g) => {
                          const active = goal === g.id;
                          return (
                            <button
                              key={g.id}
                              type="button"
                              aria-pressed={active}
                              onClick={() => setGoal(g.id)}
                              className={`flex flex-col items-start gap-1 rounded-xl border-[1.5px] p-3 text-left transition-colors ${
                                active
                                  ? "border-primary bg-primary-100"
                                  : "border-border-strong bg-white hover:border-primary"
                              }`}
                            >
                              <span className="text-xs font-bold text-foreground">{g.label}</span>
                              <span className="text-[17px] font-extrabold tabular-nums tracking-[-0.01em] font-rounded text-foreground">
                                {fmt(Math.max(MIN_CALORIES, results.tdee + g.adj))}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Daily target + macros */}
                    <div className="flex flex-col gap-4 rounded-[18px] bg-primary-dark p-[22px] text-white">
                      <div className="flex flex-wrap items-end justify-between gap-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/85">
                            Daily target · {currentGoal.label}
                          </span>
                          <span className="text-[44px] font-extrabold leading-none tracking-[-0.03em] tabular-nums font-rounded">
                            {fmt(goalCal)}{" "}
                            <span className="text-[15px] font-semibold opacity-85">kcal</span>
                          </span>
                        </div>
                        <div className="inline-flex rounded-[9px] bg-black/20 p-[3px]" role="group" aria-label="Macro split">
                          {MACRO_PLANS.map((plan) => {
                            const active = macroPlan === plan;
                            return (
                              <button
                                key={plan}
                                type="button"
                                aria-pressed={active}
                                onClick={() => setMacroPlan(plan)}
                                className={`h-7 rounded-md px-2.5 text-xs font-semibold transition-colors ${
                                  active ? "bg-white text-primary-dark" : "text-white/90 hover:text-white"
                                }`}
                              >
                                {MACRO_PRESETS[plan].label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <MacroTile label="Protein" pct={preset.protein} grams={macros.protein} dot="bg-[#FFB3C1]" />
                        <MacroTile label="Carbs" pct={preset.carbs} grams={macros.carbs} dot="bg-[#BFD7FF]" />
                        <MacroTile label="Fat" pct={preset.fat} grams={macros.fat} dot="bg-[#FFE7A3]" />
                      </div>
                      <div className="flex h-2 overflow-hidden rounded bg-black/15" aria-hidden="true">
                        <span className="bg-[#FFB3C1]" style={{ width: `${preset.protein}%` }} />
                        <span className="bg-[#BFD7FF]" style={{ width: `${preset.carbs}%` }} />
                        <span className="bg-[#FFE7A3]" style={{ width: `${preset.fat}%` }} />
                      </div>
                    </div>

                    {/* Formula comparison */}
                    <details className="rounded-[14px] border border-border px-4">
                      <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                        Compare BMR formulas
                        <span className="font-normal text-subtle">3 methods</span>
                      </summary>
                      <div className="flex flex-col border-t border-border">
                        {[
                          { name: "Mifflin-St Jeor", note: "Default · most validated", value: results.bmr.mifflinStJeor, highlight: true },
                          { name: "Harris-Benedict (revised)", note: "Classic 1984 revision", value: results.bmr.harrisBenedict, highlight: false },
                          {
                            name: "Katch-McArdle",
                            note: results.bmr.katchMcArdle !== null ? "Uses your lean mass" : "Add body fat % to unlock",
                            value: results.bmr.katchMcArdle,
                            highlight: false,
                          },
                        ].map((row) => (
                          <div
                            key={row.name}
                            className="flex items-center justify-between gap-3 border-b border-[#EEE8E1] py-3 text-sm last:border-b-0"
                          >
                            <span className="flex flex-col">
                              <span className="font-semibold text-foreground">{row.name}</span>
                              <span className="text-xs text-subtle">{row.note}</span>
                            </span>
                            <span
                              className={`whitespace-nowrap font-extrabold tabular-nums font-rounded ${
                                row.value === null ? "text-subtle" : row.highlight ? "text-primary-dark" : "text-foreground"
                              }`}
                            >
                              {row.value === null ? "—" : `${fmt(row.value)} kcal`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>

                    <p className="text-xs leading-relaxed text-subtle">
                      Estimates are typically within 10–15% of actual expenditure. Use this as a
                      starting point, track for 2–3 weeks, then adjust by ~100 kcal based on
                      results. Not medical advice.
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Full breakdown — the deeper dashboard, only once there are results */}
      {results && macros && bmiInfo && (
        <section className="px-5 pb-16 md:px-8 md:pb-24" aria-labelledby="breakdown-heading">
          <div className="mx-auto flex max-w-6xl flex-col gap-8">
            <FadeInCSS className="flex max-w-[640px] flex-col gap-3">
              <span className="eyebrow">Full breakdown</span>
              <h2 id="breakdown-heading" className="text-display text-foreground text-balance">
                Your numbers, in detail.
              </h2>
              <p className="text-base text-muted-foreground">
                BMI, macros, meal split, a 12-week projection and an example day at{" "}
                {fmt(goalCal)} kcal.
              </p>
            </FadeInCSS>
            <div className="flex flex-col gap-5">
              <DetailedMetrics
                results={results}
                goalCal={goalCal}
                macros={macros}
                macroPlan={macroPlan}
                onMacroPlanChange={setMacroPlan}
                projection={projection}
                bmiInfo={bmiInfo}
                idealWeight={idealWeight}
                activityBreakdown={activityBreakdown}
                unitSystem={state.unitSystem}
                weightKg={state.computedWeightKg}
              />
              <MealPlanSection goalCal={goalCal} macros={macros} />
            </div>
          </div>
        </section>
      )}

      {/* Understanding your results */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-11 px-5 py-20 md:px-8 md:py-28">
          <FadeInCSS className="flex max-w-[640px] flex-col gap-3.5">
            <span className="eyebrow">Understanding your results</span>
            <h2 className="text-display text-foreground text-balance">What the numbers mean.</h2>
          </FadeInCSS>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {EXPLAINERS.map((ex, i) => (
              <FadeInCSS
                key={ex.title}
                delay={i * 0.06}
                y={20}
                viewportMargin="-50px"
                className="flex flex-col gap-3 rounded-[20px] border border-border bg-background p-7"
              >
                <span className="text-[13px] font-bold tabular-nums text-primary-dark font-rounded">
                  0{i + 1}
                </span>
                <h3 className="text-xl font-bold leading-[1.2] tracking-[-0.01em] text-foreground">
                  {ex.title}
                </h3>
                <p className="text-[15px] leading-[1.55] text-muted-foreground text-pretty">{ex.body}</p>
              </FadeInCSS>
            ))}
          </div>

          <div id="methodology" className="scroll-mt-24">
          <FadeInCSS className="grid gap-6 rounded-[20px] bg-foreground p-7 text-white md:grid-cols-2 md:gap-8 md:p-8">
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-primary">Methodology</span>
              <h3 className="text-[22px] font-extrabold tracking-[-0.02em]">
                Mifflin-St Jeor, then an activity multiplier.
              </h3>
              <p className="text-[15px] leading-relaxed text-white/70">
                Our default and the ADA-recommended BMR formula. We also show Harris-Benedict
                (revised) and Katch-McArdle when body fat is known.
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-[14px] border border-white/10 bg-white/[0.06] px-[18px] py-4 font-mono text-[13px] leading-[1.7] text-white/90">
              <span><span className="text-primary">Men</span>&nbsp;&nbsp;BMR = 10·kg + 6.25·cm − 5·age + 5</span>
              <span><span className="text-primary">Women</span> BMR = 10·kg + 6.25·cm − 5·age − 161</span>
              <span><span className="text-primary">TDEE</span>&nbsp;&nbsp;= BMR × activity (1.2 – 1.9)</span>
            </div>
          </FadeInCSS>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto flex max-w-3xl flex-col gap-9">
          <FadeInCSS className="flex flex-col gap-3.5">
            <span className="eyebrow">FAQ</span>
            <h2 className="text-display text-foreground">Common questions.</h2>
          </FadeInCSS>
          <FadeInCSS delay={0.05} className="flex flex-col border-t border-border">
            {TDEE_FAQ.map((item, index) => {
              const isOpen = faqOpen === index;
              const panelId = `tdee-faq-panel-${index}`;
              const buttonId = `tdee-faq-button-${index}`;
              return (
                <div key={item.question} className="border-b border-border">
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      onClick={() => setFaqOpen(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left text-[17px] font-semibold text-foreground transition-colors hover:text-primary-dark"
                    >
                      <span>{item.question}</span>
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center text-primary-dark transition-transform duration-300 ${
                          isOpen ? "rotate-45" : ""
                        }`}
                        aria-hidden="true"
                      >
                        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </span>
                    </button>
                  </h3>
                  <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen} className="pb-5 pr-10">
                    <p className="text-[15px] leading-[1.6] text-muted-foreground text-pretty">{item.answer}</p>
                  </div>
                </div>
              );
            })}
          </FadeInCSS>
        </div>
      </section>
    </div>
  );
}

// --- Small pieces ---------------------------------------------------------

function StepHeading({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-foreground">{title}</h2>
      <p className="text-[15px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function MacroTile({ label, pct, grams, dot }: { label: string; pct: number; grams: number; dot: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-white/[0.14] p-3">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white/90">
        <span className={`h-[7px] w-[7px] rounded-full ${dot}`} aria-hidden="true" />
        {label} · {pct}%
      </span>
      <span className="text-[22px] font-extrabold tabular-nums font-rounded">{grams}g</span>
    </div>
  );
}
