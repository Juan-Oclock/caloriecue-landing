"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "@/components/AnimatedCounter";

const stagger = (i: number) => ({
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.06 } },
});

interface HeroResultProps {
  tdee: number;
  goalCal: number;
  goal: "cut" | "maintain" | "bulk";
}

export default function HeroResult({ tdee, goalCal, goal }: HeroResultProps) {
  const goalLabel = goal === "cut" ? "lose weight" : goal === "bulk" ? "gain weight" : "maintain your weight";

  return (
    <motion.div
      id="tdee-hero"
      variants={stagger(0)}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark rounded-3xl px-6 py-8 md:py-10 text-white scroll-mt-20 shadow-glow"
    >
      {/* Decorative blobs */}
      <div aria-hidden="true" className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

      <div className="relative text-center">
        <p className="text-xs font-medium text-white/70 uppercase tracking-wider mb-1">Your TDEE</p>
        <div className="text-5xl md:text-6xl font-bold tracking-tight">
          <AnimatedCounter target={tdee} />
        </div>
        <p className="text-sm text-white/60 mt-1">calories burned per day</p>

        {/* Goal-adjusted target */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-white/70 text-sm mb-1">To {goalLabel}:</p>
          <div className="text-3xl md:text-4xl font-bold tracking-tight">
            Eat ~<AnimatedCounter target={goalCal} /> cal/day
          </div>
        </div>

        {/* Warning badge */}
        <div className="mt-5 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
          <svg className="w-4 h-4 text-amber-300 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span className="text-xs font-medium text-white/90">This is your daily target — not a one-time number</span>
        </div>
      </div>
    </motion.div>
  );
}
