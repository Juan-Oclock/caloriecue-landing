"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TrackedAppStoreLink from "@/components/TrackedAppStoreLink";

interface MealItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Meal {
  label: string;
  items: MealItem[];
}

interface MealPlanData {
  meals: Meal[];
}

interface MealPlanCardProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const DIET_OPTIONS = [
  { key: "standard", label: "Standard" },
  { key: "high_protein", label: "High Protein" },
  { key: "vegetarian", label: "Vegetarian" },
  { key: "keto", label: "Keto" },
];

const MEAL_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Breakfast: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4" />
      <path d="M5.64 5.64l2.83 2.83" />
      <path d="M18.36 5.64l-2.83 2.83" />
      <path d="M2 14h4" />
      <path d="M18 14h4" />
      <path d="M6 14a6 6 0 0112 0" />
    </svg>
  ),
  Lunch: ({ className }) => (
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
  ),
  Dinner: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  ),
  Snacks: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M18 15l.75 2.25L21 18l-2.25.75L18 21l-.75-2.25L15 18l2.25-.75L18 15z" />
    </svg>
  ),
};

function getCacheKey(calories: number, preference: string) {
  return `mealplan_${calories}_${preference}`;
}

export default function MealPlanCard({ calories, protein, carbs, fat }: MealPlanCardProps) {
  const [preference, setPreference] = useState("standard");
  const [mealPlan, setMealPlan] = useState<MealPlanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (pref: string, forceRegenerate = false) => {
    const cacheKey = getCacheKey(calories, pref);

    // Check localStorage cache
    if (!forceRegenerate) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          setMealPlan(JSON.parse(cached));
          return;
        }
      } catch {}
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calories,
          protein,
          carbs,
          fat,
          meals: ["Breakfast", "Lunch", "Dinner", "Snacks"],
          preference: pref,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate");

      const data: MealPlanData = await res.json();
      setMealPlan(data);

      // Cache in localStorage
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch {}
    } catch {
      setError("Could not generate meal plan. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [calories, protein, carbs, fat]);

  const handleGenerate = () => generate(preference);
  const handleRegenerate = () => generate(preference, true);

  const handlePreferenceChange = (pref: string) => {
    setPreference(pref);
    if (mealPlan) {
      // Auto-regenerate when switching preference if already generated
      generate(pref);
    }
  };

  // Calculate totals from plan
  const totals = mealPlan?.meals.reduce(
    (acc, meal) => {
      meal.items.forEach((item) => {
        acc.calories += item.calories;
        acc.protein += item.protein;
        acc.carbs += item.carbs;
        acc.fat += item.fat;
      });
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="bg-white rounded-2xl border border-border px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Meal Plan</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">{calories} cal &middot; {protein}g P &middot; {carbs}g C &middot; {fat}g F</p>
        </div>
        {mealPlan && (
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors disabled:opacity-50"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
            </svg>
            Regenerate
          </button>
        )}
      </div>

      {/* Diet preference pills */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {DIET_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => handlePreferenceChange(opt.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              preference === opt.key
                ? "bg-primary text-white"
                : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Generate button (initial state) */}
      {!mealPlan && !loading && (
        <button
          onClick={handleGenerate}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.99] shadow-soft flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
          </svg>
          Generate My Meal Plan
        </button>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Creating your personalized meal plan...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="text-center py-6">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button
            onClick={handleGenerate}
            className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Meal plan results */}
      <AnimatePresence mode="wait">
        {mealPlan && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {mealPlan.meals.map((meal) => {
              const MealIcon = MEAL_ICONS[meal.label];
              const mealCals = meal.items.reduce((s, i) => s + i.calories, 0);

              return (
                <div key={meal.label} className="border border-border/60 rounded-xl overflow-hidden">
                  {/* Meal header */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30">
                    <span className="text-sm font-semibold text-foreground inline-flex items-center gap-1.5">
                      {MealIcon && <MealIcon className="w-4 h-4 text-muted-foreground/50" />}
                      {meal.label}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">{mealCals} cal</span>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-border/40">
                    {meal.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between px-4 py-2.5">
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-foreground">{item.name}</span>
                          <span className="text-xs text-muted-foreground/60 ml-1.5">{item.portion}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-shrink-0 ml-3">
                          <span>{item.calories} cal</span>
                          <span className="text-protein/80">{item.protein}P</span>
                          <span className="text-carbs/80">{item.carbs}C</span>
                          <span className="text-fat/80">{item.fat}F</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Totals row */}
            {totals && (
              <div className="flex items-center justify-between px-4 py-3 bg-primary-50 rounded-xl">
                <span className="text-sm font-semibold text-foreground">Daily Total</span>
                <div className="flex items-center gap-3 text-xs font-medium">
                  <span className="text-foreground">{totals.calories} cal</span>
                  <span className="text-protein">{totals.protein}g P</span>
                  <span className="text-carbs">{totals.carbs}g C</span>
                  <span className="text-fat">{totals.fat}g F</span>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="text-center pt-2 pb-1">
              <p className="text-xs text-muted-foreground/60">
                Track your real meals in{" "}
                <TrackedAppStoreLink
                  href="https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503"
                  target="_blank"
                  rel="noopener noreferrer"
                  location="calculator"
                  className="text-primary font-medium hover:text-primary-dark transition-colors"
                >
                  CalorieCue
                </TrackedAppStoreLink>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
