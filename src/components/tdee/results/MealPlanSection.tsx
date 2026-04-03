"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import type { MacroBreakdownResult } from "@/lib/tdee/types";

const MealPlanCard = dynamic(() => import("../MealPlanCard"), { ssr: false });

const APP_STORE_URL = "https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503";

const stagger = (i: number) => ({
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.06 } },
});

interface MealPlanSectionProps {
  goalCal: number;
  macros: MacroBreakdownResult;
}

export default function MealPlanSection({ goalCal, macros }: MealPlanSectionProps) {
  return (
    <motion.div variants={stagger(5)} initial="hidden" animate="visible" className="space-y-3">
      <div className="px-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Example day at {goalCal.toLocaleString()} calories
        </p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">
          This is what a day <em>could</em> look like — but your real progress comes from tracking your actual meals.
        </p>
      </div>

      <MealPlanCard
        calories={goalCal}
        protein={macros.protein}
        carbs={macros.carbs}
        fat={macros.fat}
      />

      <div className="text-center">
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          Track your real meals and see remaining calories live
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>
    </motion.div>
  );
}
