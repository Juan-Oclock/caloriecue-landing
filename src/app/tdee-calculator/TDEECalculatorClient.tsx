"use client";

import { useReducer, FormEvent, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import ResultsPage from "@/components/tdee/ResultsPage";
import ProgressBar from "@/components/tdee/steps/ProgressBar";
import StepBasics from "@/components/tdee/steps/StepBasics";
import StepMeasurements from "@/components/tdee/steps/StepMeasurements";
import StepLifestyle from "@/components/tdee/steps/StepLifestyle";
import type {
  Gender,
  UnitSystem,
  ActivityLevel,
  TDEEResults,
} from "@/lib/tdee/types";
import {
  calculateAll,
  lbsToKg,
  kgToLbs,
  feetInchesToCm,
  cmToFeetInches,
} from "@/lib/tdee/formulas";

// --- Step config ---
const STEPS = [
  { title: "Let\u2019s get started", subtitle: "Just the basics \u2014 takes 30 seconds" },
  { title: "Your measurements", subtitle: "We\u2019ll use this to calculate your BMR" },
  { title: "Your lifestyle", subtitle: "Almost done!" },
];

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
  currentStep: number;
  direction: number;
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
  direction: 1,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_UNIT": {
      const next: State = { ...state, unitSystem: action.payload, results: null };

      if (action.payload === "metric" && state.unitSystem === "imperial") {
        // Imperial → Metric: convert lbs→kg, ft+in→cm
        const lbs = parseFloat(state.weightLbs);
        if (lbs) next.weightKg = String(Math.round(lbsToKg(lbs) * 10) / 10);
        const ft = parseInt(state.heightFeet);
        if (ft) {
          const inches = parseInt(state.heightInches) || 0;
          next.heightCm = String(Math.round(feetInchesToCm(ft, inches)));
        }
      } else if (action.payload === "imperial" && state.unitSystem === "metric") {
        // Metric → Imperial: convert kg→lbs, cm→ft+in
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
      return { ...state, results: null, currentStep: 0, direction: -1 };
    case "NEXT_STEP":
      return { ...state, currentStep: Math.min(state.currentStep + 1, 2), direction: 1 };
    case "PREV_STEP":
      return { ...state, currentStep: Math.max(state.currentStep - 1, 0), direction: -1 };
    case "GO_TO_STEP":
      return {
        ...state,
        currentStep: action.payload,
        direction: action.payload > state.currentStep ? 1 : -1,
      };
    default:
      return state;
  }
}

// --- Step validation ---
function isStepValid(state: State, step: number): boolean {
  switch (step) {
    case 0:
      return true;
    case 1: {
      const age = parseInt(state.age);
      if (!age || age < 1 || age > 120) return false;
      if (state.unitSystem === "imperial") {
        const weightLbs = parseFloat(state.weightLbs);
        const feet = parseInt(state.heightFeet);
        if (!weightLbs || weightLbs <= 0 || !feet || feet <= 0) return false;
      } else {
        const weightKg = parseFloat(state.weightKg);
        const heightCm = parseFloat(state.heightCm);
        if (!weightKg || weightKg <= 0 || !heightCm || heightCm <= 0) return false;
      }
      return true;
    }
    case 2:
      return true;
    default:
      return true;
  }
}

// --- Animation variants ---
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

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

// --- Educational card config ---
const EDU_CARDS = [
  {
    title: "What is TDEE?",
    body: "Total Daily Energy Expenditure (TDEE) is the total number of calories you burn each day. It combines your Basal Metabolic Rate (BMR) \u2014 the energy your body uses at rest \u2014 with the calories burned through physical activity, digestion, and daily movement. Understanding your TDEE is the single most important step in building an effective nutrition plan.",
    iconBg: "bg-primary-50",
    iconColor: "text-primary",
    borderColor: "border-t-primary",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2c.5 3.5 4 6 4 10a6 6 0 01-12 0c0-4 3.5-6.5 4-10 1 2 3 3 4 0z" />
      </svg>
    ),
  },
  {
    title: "How to Calculate TDEE",
    body: "Calculating your TDEE is a two-step process. First, estimate your BMR using a validated formula like the Mifflin-St Jeor equation, which uses your age, weight, height, and gender. Then multiply your BMR by an activity factor that reflects your lifestyle and exercise habits. The result is your estimated daily calorie burn.",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    borderColor: "border-t-blue-500",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M8 6h8" />
        <path d="M8 10h8" />
        <path d="M8 14h4" />
        <circle cx="15" cy="17" r="2" />
      </svg>
    ),
  },
  {
    title: "BMR vs TDEE",
    body: "Your BMR is the number of calories your body needs to perform basic life-sustaining functions \u2014 breathing, blood circulation, cell production, and brain function. It typically accounts for 60-75% of your total daily calorie expenditure. Your TDEE adds physical activity and the thermic effect of food on top of your BMR, giving you a complete picture of your daily energy needs.",
    iconBg: "bg-teal-50",
    iconColor: "text-teal-500",
    borderColor: "border-t-teal-500",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10" />
        <path d="M12 20V4" />
        <path d="M6 20v-6" />
      </svg>
    ),
  },
  {
    title: "Activity Level Guide",
    body: "Choosing the right activity level is crucial for an accurate TDEE estimate. Sedentary means desk work with minimal movement. Lightly active includes 1-3 days of light exercise per week. Moderately active covers 3-5 days of moderate exercise. Very active means hard exercise 6-7 days per week. Extra active combines intense daily exercise with a physically demanding job. When in doubt, choose a lower level \u2014 it\u2019s better to underestimate and eat slightly more than to overestimate your activity.",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    borderColor: "border-t-amber-500",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="14" cy="4" r="2" />
        <path d="M4 17l3-3 3 1 4-4" />
        <path d="M14 10l2-1 4 4" />
        <path d="M10 15l-2 6" />
        <path d="M14 10l-1 6h3" />
      </svg>
    ),
  },
];

export default function TDEECalculatorClient() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const canProceed = isStepValid(state, state.currentStep);

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
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
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

  const handleFieldChange = (field: string, value: string) => {
    dispatch({ type: "SET_FIELD", field, value });
  };

  const handleRecalculate = () => {
    dispatch({ type: "CLEAR_RESULTS" });
    setTimeout(() => {
      document.getElementById("tdee-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Hero */}
      <section className="relative overflow-hidden pt-24 pb-10 md:pt-32 md:pb-14 px-4 mesh-bg">
        {/* Decorative blobs */}
        <div aria-hidden="true" className="absolute top-10 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div aria-hidden="true" className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent-blue/5 rounded-full blur-3xl" />

        <div className="relative max-w-2xl mx-auto text-center">
          {/* Fire icon */}
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50 mb-4">
            <svg className="w-5 h-5 text-primary animate-pulse-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2c.5 3.5 4 6 4 10a6 6 0 01-12 0c0-4 3.5-6.5 4-10 1 2 3 3 4 0z" />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            TDEE <span className="text-gradient">Calculator</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            Calculate your Total Daily Energy Expenditure using science-backed formulas. Free, instant, and comprehensive.
          </p>

          {/* Trust pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            {["Science-backed formulas", "Instant results", "100% free"].map((pill) => (
              <span key={pill} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-white/80 border border-border rounded-full px-3 py-1.5">
                <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {pill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Step Form */}
      {!state.results && (
        <section id="tdee-form" className="px-4 py-8 md:py-12">
          <div className="max-w-lg md:max-w-xl mx-auto">
            <FadeIn trigger="onMount">
              <form onSubmit={handleSubmit} className="w-full bg-white rounded-3xl shadow-elevated border border-border p-7 md:p-9">
                {/* Progress Bar */}
                <ProgressBar currentStep={state.currentStep} totalSteps={3} />

                {/* Step Header + Content */}
                <AnimatePresence mode="wait" custom={state.direction}>
                  <motion.div
                    key={state.currentStep}
                    custom={state.direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                  >
                    {/* Step Header */}
                    <div className="mt-6 mb-5">
                      <h2 className="text-lg font-semibold text-foreground">{STEPS[state.currentStep].title}</h2>
                      <p className="text-sm text-muted-foreground">{STEPS[state.currentStep].subtitle}</p>
                    </div>

                    {/* Step Content */}
                    {state.currentStep === 0 && (
                      <StepBasics
                        gender={state.gender}
                        onGenderChange={(g) => dispatch({ type: "SET_GENDER", payload: g })}
                      />
                    )}
                    {state.currentStep === 1 && (
                      <StepMeasurements
                        unitSystem={state.unitSystem}
                        age={state.age}
                        weightLbs={state.weightLbs}
                        weightKg={state.weightKg}
                        heightFeet={state.heightFeet}
                        heightInches={state.heightInches}
                        heightCm={state.heightCm}
                        onFieldChange={handleFieldChange}
                        onUnitChange={(u) => dispatch({ type: "SET_UNIT", payload: u })}
                      />
                    )}
                    {state.currentStep === 2 && (
                      <StepLifestyle
                        bodyFatPercent={state.bodyFatPercent}
                        activityLevel={state.activityLevel}
                        onFieldChange={handleFieldChange}
                        onActivityChange={(a) => dispatch({ type: "SET_ACTIVITY", payload: a })}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="mt-6">
                  {state.currentStep === 0 ? (
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-2xl bg-primary text-white font-semibold text-sm transition-all hover:bg-primary-dark active:scale-[0.99] shadow-soft hover:shadow-soft-lg"
                    >
                      Continue
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => dispatch({ type: "PREV_STEP" })}
                        className="px-4 py-3.5 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all border border-border"
                      >
                        &larr; Back
                      </button>
                      <button
                        type="submit"
                        disabled={!canProceed}
                        className={`flex-1 py-3.5 rounded-2xl font-semibold text-sm transition-all shadow-soft hover:shadow-soft-lg ${
                          canProceed
                            ? "bg-primary text-white hover:bg-primary-dark active:scale-[0.99]"
                            : "bg-primary/40 text-white/70 cursor-not-allowed"
                        }`}
                      >
                        {state.currentStep === 2 ? "Calculate My TDEE" : "Continue"}
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </FadeIn>
          </div>
        </section>
      )}

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
              <ResultsPage
                results={state.results}
                weightKg={state.computedWeightKg}
                heightCm={state.computedHeightCm}
                gender={state.gender}
                activityLevel={state.activityLevel}
                unitSystem={state.unitSystem}
                onRecalculate={handleRecalculate}
              />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Educational Content */}
      <section id="methodology" className="scroll-mt-24 px-4 pb-16 md:pb-20">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Understanding Your Results</h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EDU_CARDS.map((card) => (
              <FadeIn key={card.title}>
                <div className={`bg-white rounded-2xl border border-border border-t-2 ${card.borderColor} p-6 h-full hover:shadow-soft hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300`}>
                  <div className={`w-10 h-10 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center mb-3`}>
                    {card.icon}
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 pb-24 md:pb-32">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="text-center mb-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-dark mb-2 block">FAQ</span>
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
                  className={`bg-white rounded-3xl border overflow-hidden transition-all duration-300 ${
                    isOpen ? "border-primary/20 shadow-soft" : "border-border"
                  }`}
                >
                  <button
                    onClick={() => setFaqOpen(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 p-6 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors ${
                        isOpen ? "bg-primary/10 text-primary" : "bg-primary/5 text-primary"
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-base font-semibold text-foreground">{item.question}</span>
                    </div>
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
                  <div
                    className="grid transition-[grid-template-rows,opacity] duration-300 ease-in-out"
                    style={{
                      gridTemplateRows: isOpen ? "1fr" : "0fr",
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 pl-15 text-muted-foreground leading-relaxed">{item.answer}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
