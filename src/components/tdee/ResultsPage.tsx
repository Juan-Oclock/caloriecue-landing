"use client";

import { useState, useMemo } from "react";
import type { TDEEResults, MacroPlan, UnitSystem, Gender, ActivityLevel } from "@/lib/tdee/types";
import { calculateMacros, calculateWeeklyProjection, getBMICategory, calculateIdealWeight, calculateActivityBreakdown } from "@/lib/tdee/formulas";

import HeroResult from "./results/HeroResult";
import GoalSelector from "./results/GoalSelector";
import ImmediateActionCTA from "./results/ImmediateActionCTA";
import OutcomeContext from "./results/OutcomeContext";
import HabitPriming from "./results/HabitPriming";
import MealPlanSection from "./results/MealPlanSection";
import AppBridge from "./results/AppBridge";
import UrgencyClose from "./results/UrgencyClose";
import DetailedMetrics from "./results/DetailedMetrics";

interface ResultsPageProps {
  results: TDEEResults;
  weightKg: number;
  heightCm: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  unitSystem: UnitSystem;
  onRecalculate?: () => void;
}

export default function ResultsPage({ results, weightKg, heightCm, gender, activityLevel, unitSystem, onRecalculate }: ResultsPageProps) {
  const [macroPlan, setMacroPlan] = useState<MacroPlan>("balanced");
  const [goal, setGoal] = useState<"cut" | "maintain" | "bulk">("cut");
  const [calorieOffset, setCalorieOffset] = useState(500);

  const goalCal =
    goal === "cut"
      ? results.tdee - calorieOffset
      : goal === "bulk"
        ? results.tdee + calorieOffset
        : results.tdee;

  const macros = useMemo(() => calculateMacros(goalCal, macroPlan), [goalCal, macroPlan]);
  const projection = useMemo(() => calculateWeeklyProjection(weightKg, results.tdee, goalCal, 12), [weightKg, results.tdee, goalCal]);
  const bmiInfo = useMemo(() => getBMICategory(results.bmi), [results.bmi]);
  const idealWeight = useMemo(() => calculateIdealWeight(heightCm, gender), [heightCm, gender]);
  const activityBreakdown = useMemo(() => calculateActivityBreakdown(results.bmr.mifflinStJeor, activityLevel), [results.bmr.mifflinStJeor, activityLevel]);

  const weeklyLbs = Math.round((calorieOffset / 500) * 10) / 10;
  const weeklyKg = Math.round(weeklyLbs * 0.4536 * 100) / 100;

  const formatRate = (sign: string) =>
    unitSystem === "imperial" ? `${sign}${weeklyLbs} lb/wk` : `${sign}${weeklyKg} kg/wk`;

  const goals: { key: typeof goal; label: string; cal: number; rate: string }[] = [
    { key: "cut", label: "Lose", cal: results.tdee - calorieOffset, rate: formatRate("-") },
    { key: "maintain", label: "Maintain", cal: results.tdee, rate: "" },
    { key: "bulk", label: "Gain", cal: results.tdee + calorieOffset, rate: formatRate("+") },
  ];

  const weeklyRate = goal === "cut"
    ? formatRate("-")
    : goal === "bulk"
      ? formatRate("+")
      : "";

  return (
    <div className="space-y-5">
      {/* Recalculate button */}
      {onRecalculate && (
        <button
          onClick={onRecalculate}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
          </svg>
          Recalculate
        </button>
      )}

      {/* Section 1: Hero Result */}
      <div className="max-w-3xl mx-auto">
        <HeroResult tdee={results.tdee} goalCal={goalCal} goal={goal} />
      </div>

      {/* Section 2: Goal Selector */}
      <div className="max-w-3xl mx-auto">
        <GoalSelector
          goals={goals}
          goal={goal}
          onGoalChange={setGoal}
          calorieOffset={calorieOffset}
          onCalorieOffsetChange={setCalorieOffset}
        />
      </div>

      {/* Conversion sections — narrower on desktop for readability */}
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Section 3: Immediate Action CTA */}
        <ImmediateActionCTA goalCal={goalCal} />

        {/* Section 4: Outcome Context */}
        <OutcomeContext goal={goal} weeklyRate={weeklyRate} unitSystem={unitSystem} />

        {/* Section 5: Habit Priming */}
        <HabitPriming />

        {/* Section 6: Meal Plan */}
        <MealPlanSection goalCal={goalCal} macros={macros} />

        {/* Section 7: App Bridge */}
        <AppBridge />

        {/* Section 8: Urgency Close */}
        <UrgencyClose />
      </div>

      {/* Section 9: Detailed Metrics */}
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
        unitSystem={unitSystem}
        weightKg={weightKg}
      />
    </div>
  );
}
