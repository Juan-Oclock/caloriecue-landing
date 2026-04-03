"use client";

import { motion } from "framer-motion";

const APP_STORE_URL = "https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503";

const stagger = (i: number) => ({
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.06 } },
});

const MOMENTUM_STEPS = [
  { label: "Awareness", desc: "Know exactly what you eat" },
  { label: "Control", desc: "Stay within your daily target" },
  { label: "Momentum", desc: "Build a streak that sticks" },
];

export default function UrgencyClose() {
  return (
    <motion.div variants={stagger(7)} initial="hidden" animate="visible" className="bg-white rounded-2xl border border-border px-6 py-6 text-center">
      <h3 className="text-lg font-bold text-foreground mb-1">Your progress starts today</h3>
      <p className="text-sm text-muted-foreground mb-5">
        Waiting doesn&apos;t help. Even one day of tracking gives you:
      </p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {MOMENTUM_STEPS.map((step, i) => (
          <div key={step.label} className="text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <span className="text-sm font-bold text-primary">{i + 1}</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{step.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
          </div>
        ))}
      </div>

      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
      >
        Start your first day now
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </a>
    </motion.div>
  );
}
