"use client";

import { useReducer, FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import ResultsDashboard from "@/components/tdee/ResultsDashboard";
import type {
  Gender,
  UnitSystem,
  ActivityLevel,
  TDEEResults,
} from "@/lib/tdee/types";
import { ACTIVITY_LABELS } from "@/lib/tdee/constants";
import {
  calculateAll,
  lbsToKg,
  feetInchesToCm,
} from "@/lib/tdee/formulas";

// --- State ---
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
}

type Action =
  | { type: "SET_UNIT"; payload: UnitSystem }
  | { type: "SET_GENDER"; payload: Gender }
  | { type: "SET_ACTIVITY"; payload: ActivityLevel }
  | { type: "SET_FIELD"; field: string; value: string }
  | { type: "SET_RESULTS"; payload: { results: TDEEResults; weightKg: number; heightCm: number } }
  | { type: "CLEAR_RESULTS" };

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
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_UNIT":
      return { ...state, unitSystem: action.payload, results: null };
    case "SET_GENDER":
      return { ...state, gender: action.payload, results: null };
    case "SET_ACTIVITY":
      return { ...state, activityLevel: action.payload, results: null };
    case "SET_FIELD":
      return { ...state, [action.field]: action.value, results: null };
    case "SET_RESULTS":
      return { ...state, results: action.payload.results, computedWeightKg: action.payload.weightKg, computedHeightCm: action.payload.heightCm };
    case "CLEAR_RESULTS":
      return { ...state, results: null };
    default:
      return state;
  }
}

// --- Activity level config with multiplier labels ---
const ACTIVITY_CONFIG: { key: ActivityLevel; icon: React.ReactNode; multiplier: string }[] = [
  {
    key: "sedentary",
    multiplier: "x1.2",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
      </svg>
    ),
  },
  {
    key: "light",
    multiplier: "x1.375",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
  },
  {
    key: "moderate",
    multiplier: "x1.55",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    key: "very_active",
    multiplier: "x1.725",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
      </svg>
    ),
  },
  {
    key: "extreme",
    multiplier: "x1.9",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    ),
  },
];

// --- Step number badge ---
function StepBadge({ number }: { number: number }) {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
      {number}
    </span>
  );
}

// --- Input with unit suffix ---
function InputWithUnit({
  id,
  value,
  onChange,
  placeholder,
  unit,
  required = false,
  min,
  max,
  step,
}: {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  unit: string;
  required?: boolean;
  min?: string;
  max?: string;
  step?: string;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full pl-3.5 pr-11 py-2.5 rounded-xl border border-border bg-white text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/40"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground/70">
        {unit}
      </span>
    </div>
  );
}

// --- FAQ items ---
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
      "TDEE calculators provide a solid estimate \u2014 typically within 10% of your actual expenditure. However, individual factors like genetics, hormones, NEAT (non-exercise activity thermogenesis), and metabolic adaptation can cause variations. Use your calculated TDEE as a starting point, then adjust based on real-world results over 2-4 weeks.",
  },
  {
    question: "What macronutrient ratio is best for weight loss?",
    answer:
      "There is no single best ratio, but a balanced split of 30% protein, 35% carbs, and 35% fat works well for most people. Higher protein (40%) can help preserve muscle during a calorie deficit. The most important factor for weight loss is total calories, not the exact macro split.",
  },
];

export default function TDEECalculatorClient() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

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
      document.getElementById("tdee-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const isImperial = state.unitSystem === "imperial";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-32 pb-12 md:pt-40 md:pb-16 px-4 mesh-bg">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn trigger="onMount">
            <h1 className="text-hero-mobile md:text-hero text-foreground mb-4">
              TDEE <span className="text-gradient">Calculator</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Calculate your Total Daily Energy Expenditure to find out exactly how many
              calories you need each day to lose weight, build muscle, or maintain your physique.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Calculator Form */}
      <section className="px-4 pb-10 md:pb-12 -mt-2">
        <div className="max-w-2xl mx-auto">
          <FadeIn delay={0.1}>
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-elevated border border-border p-5 md:p-7">
              {/* Top row: Gender toggle + Unit toggle */}
              <div className="flex items-center justify-between mb-5">
                {/* Gender as a pill toggle */}
                <div className="inline-flex items-center bg-muted/50 p-0.5 rounded-full border border-border">
                  {(["male", "female"] as Gender[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => dispatch({ type: "SET_GENDER", payload: g })}
                      className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
                        state.gender === g
                          ? "bg-primary text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {g === "male" ? "Male" : "Female"}
                    </button>
                  ))}
                </div>
                {/* Unit toggle */}
                <div className="inline-flex items-center bg-muted/50 p-0.5 rounded-full border border-border">
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "SET_UNIT", payload: "imperial" })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isImperial ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Imperial
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "SET_UNIT", payload: "metric" })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      !isImperial ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Metric
                  </button>
                </div>
              </div>

              {/* Inputs — compact 2-col grid */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-4 mb-5">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Age</label>
                  <InputWithUnit value={state.age} onChange={(v) => dispatch({ type: "SET_FIELD", field: "age", value: v })} placeholder="28" unit="yrs" required min="1" max="120" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Weight</label>
                  <InputWithUnit value={isImperial ? state.weightLbs : state.weightKg} onChange={(v) => dispatch({ type: "SET_FIELD", field: isImperial ? "weightLbs" : "weightKg", value: v })} placeholder={isImperial ? "180" : "82"} unit={isImperial ? "lbs" : "kg"} required min="1" step="0.1" />
                </div>
                {isImperial ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Height</label>
                      <InputWithUnit value={state.heightFeet} onChange={(v) => dispatch({ type: "SET_FIELD", field: "heightFeet", value: v })} placeholder="5" unit="ft" required min="1" max="8" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">&nbsp;</label>
                      <InputWithUnit value={state.heightInches} onChange={(v) => dispatch({ type: "SET_FIELD", field: "heightInches", value: v })} placeholder="10" unit="in" min="0" max="11" />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Height</label>
                    <InputWithUnit value={state.heightCm} onChange={(v) => dispatch({ type: "SET_FIELD", field: "heightCm", value: v })} placeholder="178" unit="cm" required min="1" />
                  </div>
                )}
                <div className={isImperial ? "" : ""}>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Body Fat <span className="font-normal text-muted-foreground/60">(optional)</span></label>
                  <InputWithUnit value={state.bodyFatPercent} onChange={(v) => dispatch({ type: "SET_FIELD", field: "bodyFatPercent", value: v })} placeholder="18" unit="%" min="1" max="60" step="0.1" />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border my-5" />

              {/* Activity Level — compact stacked list */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-muted-foreground mb-2.5">Activity Level</label>
                <div className="space-y-1.5">
                  {ACTIVITY_CONFIG.map(({ key, multiplier }) => {
                    const info = ACTIVITY_LABELS[key];
                    const isActive = state.activityLevel === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => dispatch({ type: "SET_ACTIVITY", payload: key })}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                          isActive
                            ? "bg-primary-50 ring-1 ring-primary/30"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        {/* Radio dot */}
                        <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isActive ? "border-primary" : "border-gray-300"
                        }`}>
                          {isActive && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-medium ${isActive ? "text-foreground" : "text-foreground"}`}>
                            {info.title}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1.5">{info.description}</span>
                        </div>
                        {/* Multiplier */}
                        <span className={`flex-shrink-0 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                          isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/70"
                        }`}>
                          {multiplier}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Calculate Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-primary text-white font-semibold text-sm transition-all hover:bg-primary-dark active:scale-[0.99] shadow-soft hover:shadow-soft-lg"
              >
                Calculate My TDEE
              </button>
            </form>
          </FadeIn>
        </div>
      </section>

      {/* Results */}
      <AnimatePresence>
        {state.results && (
          <motion.section
            id="tdee-results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="px-4 pb-16 md:pb-20"
          >
            <div className="max-w-5xl mx-auto">
              <ResultsDashboard
                results={state.results}
                weightKg={state.computedWeightKg}
                heightCm={state.computedHeightCm}
                gender={state.gender}
                activityLevel={state.activityLevel}
                unitSystem={state.unitSystem}
              />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* CTA Banner */}
      <AnimatePresence>
        {state.results && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="px-4 pb-16 md:pb-20"
          >
            <div className="max-w-3xl mx-auto bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-8 md:p-10 text-center text-white shadow-glow">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                You burn ~{state.results.tdee.toLocaleString()} calories/day
              </h2>
              <p className="text-white/80 mb-6 max-w-lg mx-auto">
                Let CalorieCue track your intake automatically with AI-powered photo scanning.
                Hit your calorie goals without the manual logging.
              </p>
              <a
                href="https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors shadow-soft"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Download CalorieCue Free
              </a>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Educational Content */}
      <section className="px-4 pb-16 md:pb-20">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Understanding Your Results</h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FadeIn>
              <div className="bg-white rounded-2xl border border-border p-6 h-full">
                <h3 className="text-base font-semibold text-foreground mb-2">What is TDEE?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Total Daily Energy Expenditure (TDEE) is the total number of calories you burn each day. It combines your
                  Basal Metabolic Rate (BMR) &mdash; the energy your body uses at rest &mdash; with the calories burned through physical
                  activity, digestion, and daily movement. Understanding your TDEE is the single most important step in building
                  an effective nutrition plan.
                </p>
              </div>
            </FadeIn>

            <FadeIn>
              <div className="bg-white rounded-2xl border border-border p-6 h-full">
                <h3 className="text-base font-semibold text-foreground mb-2">How to Calculate TDEE</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Calculating your TDEE is a two-step process. First, estimate your BMR using a validated formula like the
                  Mifflin-St Jeor equation, which uses your age, weight, height, and gender. Then multiply your BMR by an
                  activity factor that reflects your lifestyle and exercise habits. The result is your estimated daily calorie burn.
                </p>
              </div>
            </FadeIn>

            <FadeIn>
              <div className="bg-white rounded-2xl border border-border p-6 h-full">
                <h3 className="text-base font-semibold text-foreground mb-2">BMR vs TDEE</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your BMR is the number of calories your body needs to perform basic life-sustaining functions &mdash; breathing,
                  blood circulation, cell production, and brain function. It typically accounts for 60-75% of your total daily
                  calorie expenditure. Your TDEE adds physical activity and the thermic effect of food on top of your BMR,
                  giving you a complete picture of your daily energy needs.
                </p>
              </div>
            </FadeIn>

            <FadeIn>
              <div className="bg-white rounded-2xl border border-border p-6 h-full">
                <h3 className="text-base font-semibold text-foreground mb-2">Activity Level Guide</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Choosing the right activity level is crucial for an accurate TDEE estimate. <strong>Sedentary</strong> means
                  desk work with minimal movement. <strong>Lightly active</strong> includes 1-3 days of light exercise per week.
                  <strong> Moderately active</strong> covers 3-5 days of moderate exercise. <strong>Very active</strong> means
                  hard exercise 6-7 days per week. <strong>Extra active</strong> combines intense daily exercise with a
                  physically demanding job. When in doubt, choose a lower level &mdash; it&apos;s better to underestimate and eat slightly
                  more than to overestimate your activity.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 pb-24 md:pb-32">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Common questions about TDEE, BMR, and calorie calculations.
              </p>
            </div>
          </FadeIn>

          <div className="space-y-3">
            {TDEE_FAQ.map((item, index) => {
              const isOpen = faqOpen === index;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-white rounded-3xl border border-border overflow-hidden"
                >
                  <button
                    onClick={() => setFaqOpen(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 p-6 text-left"
                  >
                    <span className="text-base font-semibold text-foreground">{item.question}</span>
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-300 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-6 text-muted-foreground leading-relaxed">{item.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
