"use client";

import { motion } from "framer-motion";
import type { UnitSystem } from "@/lib/tdee/types";

const stagger = (i: number) => ({
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.06 } },
});

interface OutcomeContextProps {
  goal: "cut" | "maintain" | "bulk";
  weeklyRate: string;
  unitSystem: UnitSystem;
}

export default function OutcomeContext({ goal, weeklyRate }: OutcomeContextProps) {
  const positiveOutcomes = goal === "cut"
    ? [
        "You\u2019ll stay in a calorie deficit",
        "You\u2019ll lose weight gradually and sustainably",
        "You\u2019ll build a habit that compounds over time",
      ]
    : goal === "bulk"
      ? [
          "You\u2019ll be in a controlled calorie surplus",
          "You\u2019ll gain muscle more effectively",
          "You\u2019ll track progress and adjust as needed",
        ]
      : [
          "You\u2019ll maintain your current weight",
          "You\u2019ll stay aware of your intake",
          "You\u2019ll build a sustainable routine",
        ];

  const negativeOutcomes = [
    "Your intake becomes inconsistent",
    "Progress slows or stops entirely",
    "Results become unpredictable",
  ];

  return (
    <motion.div variants={stagger(3)} initial="hidden" animate="visible">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Positive */}
        <div className="bg-green-50 rounded-2xl border border-green-200 px-6 py-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-green-800">If you follow this</p>
          </div>
          <ul className="space-y-2">
            {positiveOutcomes.map((item) => (
              <li key={item} className="text-sm text-green-700 flex items-start gap-2">
                <span className="text-green-400 mt-1.5 flex-shrink-0">&#8226;</span>
                {item}
              </li>
            ))}
          </ul>
          {weeklyRate && (
            <p className="text-xs text-green-600 font-medium mt-3 pt-3 border-t border-green-200">
              Expected rate: {weeklyRate}
            </p>
          )}
        </div>

        {/* Negative */}
        <div className="bg-amber-50 rounded-2xl border border-amber-200 px-6 py-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-amber-800">If you don&apos;t</p>
          </div>
          <ul className="space-y-2">
            {negativeOutcomes.map((item) => (
              <li key={item} className="text-sm text-amber-700 flex items-start gap-2">
                <span className="text-amber-400 mt-1.5 flex-shrink-0">&#8226;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
