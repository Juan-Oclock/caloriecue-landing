"use client";

import { motion } from "framer-motion";
import TrackedAppStoreLink from "@/components/TrackedAppStoreLink";

const APP_STORE_URL = "https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503";

const stagger = (i: number) => ({
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.06 } },
});

interface ImmediateActionCTAProps {
  goalCal: number;
}

const BENEFITS = [
  "See how many calories you have left today",
  "Stay within your daily target",
  "Build a consistent tracking routine",
];

export default function ImmediateActionCTA({ goalCal }: ImmediateActionCTAProps) {
  return (
    <motion.div variants={stagger(2)} initial="hidden" animate="visible" className="bg-white rounded-2xl border border-border px-6 py-6">
      <h3 className="text-lg font-bold text-foreground mb-1">Start today — not tomorrow</h3>
      <p className="text-sm text-muted-foreground mb-5">
        Most people don&apos;t fail because of the plan. They fail because they don&apos;t track consistently.
      </p>

      <ul className="space-y-3 mb-6">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2.5">
            <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-foreground">{benefit}</span>
          </li>
        ))}
      </ul>

      <TrackedAppStoreLink
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        location="calculator"
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-white font-semibold text-sm transition-all hover:bg-primary-dark active:scale-[0.99] shadow-soft hover:shadow-soft-lg"
      >
        Start tracking your calories
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </TrackedAppStoreLink>
    </motion.div>
  );
}
