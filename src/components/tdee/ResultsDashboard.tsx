"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import AnimatedCounter from "@/components/AnimatedCounter";
import type { TDEEResults, MacroPlan, UnitSystem, Gender, ActivityLevel } from "@/lib/tdee/types";
import { calculateMacros, calculateWeeklyProjection, getBMICategory, calculateIdealWeight, calculateActivityBreakdown, kgToLbs } from "@/lib/tdee/formulas";
import { MEAL_SPLIT, BMI_CATEGORIES } from "@/lib/tdee/constants";

const MacroBreakdown = dynamic(() => import("./MacroBreakdown"), { ssr: false });
const WeeklyProjection = dynamic(() => import("./WeeklyProjection"), { ssr: false });
const MealPlanCard = dynamic(() => import("./MealPlanCard"), { ssr: false });

interface ResultsDashboardProps {
  results: TDEEResults;
  weightKg: number;
  heightCm: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  unitSystem: UnitSystem;
  onRecalculate?: () => void;
}

const stagger = (i: number) => ({
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.06 } },
});

/* Meal icons */
function SunriseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4" />
      <path d="M5.64 5.64l2.83 2.83" />
      <path d="M18.36 5.64l-2.83 2.83" />
      <path d="M2 14h4" />
      <path d="M18 14h4" />
      <path d="M6 14a6 6 0 0112 0" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M4.93 19.07l1.41-1.41" />
      <path d="M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M18 15l.75 2.25L21 18l-2.25.75L18 21l-.75-2.25L15 18l2.25-.75L18 15z" />
    </svg>
  );
}

const MEAL_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Breakfast: SunriseIcon,
  Lunch: SunIcon,
  Dinner: MoonIcon,
  Snacks: SparklesIcon,
};

/* Goal arrow icons */
function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="M19 12l-7 7-7-7" />
    </svg>
  );
}

function EqualsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 9h14" />
      <path d="M5 15h14" />
    </svg>
  );
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </svg>
  );
}

const GOAL_ICONS: Record<string, React.FC<{ className?: string }>> = {
  cut: ArrowDownIcon,
  maintain: EqualsIcon,
  bulk: ArrowUpIcon,
};

export default function ResultsDashboard({ results, weightKg, heightCm, gender, activityLevel, unitSystem, onRecalculate }: ResultsDashboardProps) {
  const [macroPlan, setMacroPlan] = useState<MacroPlan>("balanced");
  const [goal, setGoal] = useState<"cut" | "maintain" | "bulk">("cut");
  const [calorieOffset, setCalorieOffset] = useState(500);

  const goalCal =
    goal === "cut"
      ? results.tdee - calorieOffset
      : goal === "bulk"
        ? results.tdee + calorieOffset
        : results.tdee;

  const macros = calculateMacros(goalCal, macroPlan);
  const projection = calculateWeeklyProjection(weightKg, results.tdee, goalCal, 12);
  const bmiInfo = getBMICategory(results.bmi);
  const idealWeight = calculateIdealWeight(heightCm, gender);
  const activityBreakdown = calculateActivityBreakdown(results.bmr.mifflinStJeor, activityLevel);

  // 1 lb ≈ 3500 cal → weekly change = offset / 500 lbs/wk
  const weeklyLbs = Math.round((calorieOffset / 500) * 10) / 10;
  const weeklyKg = Math.round(weeklyLbs * 0.4536 * 100) / 100;

  const formatRate = (sign: string) =>
    unitSystem === "imperial" ? `${sign}${weeklyLbs} lb/wk` : `${sign}${weeklyKg} kg/wk`;

  const goals: { key: typeof goal; label: string; cal: number; rate: string }[] = [
    { key: "cut", label: "Lose", cal: results.tdee - calorieOffset, rate: formatRate("-") },
    { key: "maintain", label: "Maintain", cal: results.tdee, rate: "" },
    { key: "bulk", label: "Gain", cal: results.tdee + calorieOffset, rate: formatRate("+") },
  ];

  // Slider percentage for filled track
  const sliderPercent = ((calorieOffset - 100) / (1000 - 100)) * 100;

  return (
    <div className="space-y-4">
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

      {/* TDEE hero card */}
      <motion.div id="tdee-hero" variants={stagger(0)} initial="hidden" animate="visible" className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark rounded-3xl px-6 py-6 text-white scroll-mt-20 shadow-glow">
        {/* Decorative blob */}
        <div aria-hidden="true" className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        <div className="relative">
          <p className="text-xs font-medium text-white/70 uppercase tracking-wider">Your TDEE</p>
          <div className="text-5xl md:text-6xl font-bold tracking-tight mt-1">
            <AnimatedCounter target={results.tdee} />
          </div>
          <p className="text-sm text-white/60 mt-1">Total Daily Energy Expenditure &middot; cal/day</p>
        </div>
      </motion.div>

      {/* BMR + BMI row */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div variants={stagger(1)} initial="hidden" animate="visible" className="bg-white rounded-2xl border border-border px-6 py-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">BMR</p>
          <div className="text-3xl font-bold text-foreground mt-1">
            <AnimatedCounter target={results.bmr.mifflinStJeor} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">at rest</p>
        </motion.div>

        <motion.div variants={stagger(2)} initial="hidden" animate="visible" className="bg-white rounded-2xl border border-border px-6 py-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">BMI</p>
          <div className="flex items-baseline gap-2 mt-1 flex-wrap">
            <span className="text-3xl font-bold text-foreground">{results.bmi}</span>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${bmiInfo.bg} ${bmiInfo.color}`}>{bmiInfo.label}</span>
          </div>
          {/* BMI visual scale */}
          <div className="mt-3">
            {/* Category labels */}
            <div className="flex text-[10px] text-muted-foreground/60 mb-1">
              <span className="flex-[18.5] text-center">Underweight</span>
              <span className="flex-[6.5] text-center">Normal</span>
              <span className="flex-[5] text-center">Over</span>
              <span className="flex-[10] text-center">Obese</span>
            </div>
            <div className="flex h-2.5 rounded-full overflow-hidden">
              <div className="bg-blue-400 flex-[18.5]" />
              <div className="bg-green-400 flex-[6.5]" />
              <div className="bg-amber-400 flex-[5]" />
              <div className="bg-red-400 flex-[10]" />
            </div>
            <div className="relative h-3 mt-0.5">
              <div
                className="absolute -translate-x-1/2"
                style={{ left: `${Math.min(Math.max((results.bmi / 40) * 100, 2), 98)}%` }}
              >
                <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[6px] border-transparent border-b-primary mx-auto" />
              </div>
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground/60 -mt-0.5">
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>40</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Row 2: Goal selector — inline pill buttons */}
      <motion.div variants={stagger(3)} initial="hidden" animate="visible" className="bg-white rounded-2xl border border-border px-6 py-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Daily Calorie Goal</p>
        <div className="grid grid-cols-3 gap-3">
          {goals.map((g) => {
            const GoalIcon = GOAL_ICONS[g.key];
            return (
              <button
                key={g.key}
                onClick={() => setGoal(g.key)}
                className={`rounded-xl py-3.5 px-4 text-center transition-all ${
                  goal === g.key
                    ? "bg-primary-50 ring-1 ring-primary/30"
                    : "bg-muted/40 hover:bg-muted/70"
                }`}
              >
                <GoalIcon className={`w-5 h-5 mx-auto mb-1.5 ${goal === g.key ? "text-primary" : "text-muted-foreground/50"}`} />
                <div className={`text-xl font-bold ${goal === g.key ? "text-primary" : "text-foreground"}`}>{g.cal}</div>
                <div className="text-xs text-muted-foreground leading-tight mt-0.5">{g.label}</div>
                {g.rate && <div className="text-[11px] text-primary/70 font-medium mt-1">{g.rate}</div>}
              </button>
            );
          })}
        </div>

        {/* Custom calorie offset slider */}
        {goal !== "maintain" && (
          <div className="mt-5 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">
                Calorie {goal === "cut" ? "Deficit" : "Surplus"}
              </span>
              <span className="text-sm font-semibold text-foreground">
                {goal === "cut" ? "-" : "+"}{calorieOffset} cal/day
              </span>
            </div>
            <div className="relative">
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 bg-muted rounded-full pointer-events-none">
                <div
                  className="h-full bg-primary/20 rounded-full transition-all"
                  style={{ width: `${sliderPercent}%` }}
                />
              </div>
              <input
                type="range"
                min={100}
                max={1000}
                step={50}
                value={calorieOffset}
                onChange={(e) => setCalorieOffset(Number(e.target.value))}
                className="relative w-full h-2 bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent"
              />
            </div>
            <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground/60">
              <span>100</span>
              <span>250</span>
              <span>500</span>
              <span>750</span>
              <span>1000</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Row 3: Macros + Meals side by side */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div variants={stagger(4)} initial="hidden" animate="visible" className="md:col-span-3 bg-white rounded-2xl border border-border px-6 py-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Macros</p>
          <MacroBreakdown macros={macros} totalCalories={goalCal} activePlan={macroPlan} onPlanChange={setMacroPlan} />
        </motion.div>

        <motion.div variants={stagger(5)} initial="hidden" animate="visible" className="md:col-span-2 bg-white rounded-2xl border border-border px-6 py-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Meal Split</p>
          <div className="space-y-4">
            {MEAL_SPLIT.map((meal) => {
              const cal = Math.round(goalCal * (meal.percent / 100));
              const MealIcon = MEAL_ICONS[meal.label];
              return (
                <div key={meal.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-foreground inline-flex items-center gap-1.5">
                      {MealIcon && <MealIcon className="w-3.5 h-3.5 text-muted-foreground/50" />}
                      {meal.label}
                    </span>
                    <span className="text-muted-foreground">{cal}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/60 rounded-full" style={{ width: `${meal.percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Row 3b: AI Meal Plan */}
      <motion.div variants={stagger(5.5)} initial="hidden" animate="visible">
        <MealPlanCard
          calories={goalCal}
          protein={macros.protein}
          carbs={macros.carbs}
          fat={macros.fat}
        />
      </motion.div>

      {/* Row 4: Weight projection */}
      <motion.div variants={stagger(6)} initial="hidden" animate="visible" className="bg-white rounded-2xl border border-border px-6 py-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">12-Week Projection</p>
          <span className="text-xs text-muted-foreground">
            {goalCal} cal/day
          </span>
        </div>
        <WeeklyProjection data={projection} unitSystem={unitSystem} />
      </motion.div>

      {/* Row 5: BMR comparison — compact inline */}
      <motion.div variants={stagger(7)} initial="hidden" animate="visible" className="bg-white rounded-2xl border border-border px-6 py-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Formula Comparison</p>
        <div className="space-y-0">
          {[
            { name: "Mifflin-St Jeor", bmr: results.bmr.mifflinStJeor, primary: true },
            { name: "Harris-Benedict", bmr: results.bmr.harrisBenedict, primary: false },
            ...(results.bmr.katchMcArdle !== null
              ? [{ name: "Katch-McArdle", bmr: results.bmr.katchMcArdle, primary: false }]
              : []),
          ].map((row) => {
            const tdee = Math.round(row.bmr * (results.tdee / results.bmr.mifflinStJeor));
            return (
              <div key={row.name} className={`flex items-center justify-between py-3 border-b border-border/50 last:border-0 ${row.primary ? "border-l-2 border-l-primary pl-3" : ""}`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-sm text-foreground">{row.name}</span>
                  {row.primary && (
                    <span className="text-[10px] font-semibold text-primary bg-primary-50 px-2 py-0.5 rounded">default</span>
                  )}
                </div>
                <div className="flex items-center gap-5 text-sm">
                  <span className="text-muted-foreground">BMR <span className="font-semibold text-foreground">{row.bmr}</span></span>
                  <span className="text-muted-foreground">TDEE <span className="font-semibold text-foreground">{tdee}</span></span>
                </div>
              </div>
            );
          })}
        </div>
        {results.bmr.katchMcArdle === null && (
          <p className="text-[11px] text-muted-foreground/60 mt-3">Add body fat % for Katch-McArdle</p>
        )}
      </motion.div>

      {/* Row 6: Ideal Weight + Activity Level side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={stagger(8)} initial="hidden" animate="visible" className="bg-white rounded-2xl border border-border px-6 py-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Ideal Weight</p>
          <div className="space-y-0">
            {idealWeight.map((iw) => {
              const displayWeight = unitSystem === "imperial"
                ? `${Math.round(kgToLbs(iw.weightKg))} lbs`
                : `${iw.weightKg} kg`;
              return (
                <div key={iw.formula} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{iw.formula}</span>
                    <span className="text-[10px] text-muted-foreground/60">{iw.year}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{displayWeight}</span>
                </div>
              );
            })}
          </div>
          {(() => {
            const minIdeal = Math.min(...idealWeight.map(w => w.weightKg));
            const maxIdeal = Math.max(...idealWeight.map(w => w.weightKg));
            const diffMin = weightKg - maxIdeal;
            const diffMax = weightKg - minIdeal;
            const isAbove = diffMin > 0;
            const isBelow = diffMax < 0;

            const formatWeight = (kg: number) =>
              unitSystem === "imperial" ? `${Math.round(kgToLbs(kg))} lbs` : `${kg} kg`;
            const formatDiff = (kg: number) =>
              unitSystem === "imperial" ? `${Math.round(kgToLbs(Math.abs(kg)))} lbs` : `${Math.round(Math.abs(kg))} kg`;

            return (
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground/60">
                    Ideal range: {formatWeight(minIdeal)}–{formatWeight(maxIdeal)}
                  </span>
                  {isAbove && (
                    <span className="text-[11px] font-medium text-amber-600">
                      {formatDiff(diffMin)}–{formatDiff(diffMax)} above
                    </span>
                  )}
                  {isBelow && (
                    <span className="text-[11px] font-medium text-blue-600">
                      {formatDiff(diffMax)}–{formatDiff(diffMin)} below
                    </span>
                  )}
                  {!isAbove && !isBelow && (
                    <span className="text-[11px] font-medium text-green-600">Within range</span>
                  )}
                </div>
              </div>
            );
          })()}
        </motion.div>

        <motion.div variants={stagger(9)} initial="hidden" animate="visible" className="bg-white rounded-2xl border border-border px-6 py-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Activity Levels</p>
          <div className="space-y-0">
            {activityBreakdown.map((item) => (
              <div key={item.level} className={`flex items-center justify-between py-2.5 border-b border-border/50 last:border-0 ${item.active ? "" : ""}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${item.active ? "text-primary font-medium" : "text-foreground"}`}>{item.label}</span>
                  {item.active && (
                    <span className="text-[10px] font-semibold text-primary bg-primary-50 px-2 py-0.5 rounded">you</span>
                  )}
                </div>
                <span className={`text-sm font-semibold ${item.active ? "text-primary" : "text-foreground"}`}>
                  {item.calories.toLocaleString()} cal
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
