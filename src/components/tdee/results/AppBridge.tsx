"use client";

import { motion } from "framer-motion";
import TrackedAppStoreLink from "@/components/TrackedAppStoreLink";

const APP_STORE_URL = "https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503";

const stagger = (i: number) => ({
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.06 } },
});

const BENEFITS = [
  {
    text: "Snap a photo, get instant calories",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  {
    text: "See your daily target and remaining budget",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    text: "Build a streak — consistency made visible",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2c.5 3.5 4 6 4 10a6 6 0 01-12 0c0-4 3.5-6.5 4-10 1 2 3 3 4 0z" />
      </svg>
    ),
  },
];

export default function AppBridge() {
  return (
    <motion.div
      variants={stagger(6)}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark rounded-3xl px-6 py-8 text-white shadow-glow"
    >
      {/* Decorative blobs */}
      <div aria-hidden="true" className="absolute top-0 left-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
      <div aria-hidden="true" className="absolute bottom-0 right-1/3 w-40 h-40 bg-white/5 rounded-full blur-2xl" />

      <div className="relative">
        <h3 className="text-xl font-bold mb-5">Why use CalorieCue?</h3>

        <ul className="space-y-3.5 mb-6">
          {BENEFITS.map((benefit) => (
            <li key={benefit.text} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                {benefit.icon}
              </div>
              <span className="text-sm font-medium text-white/90">{benefit.text}</span>
            </li>
          ))}
        </ul>

        <TrackedAppStoreLink
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          location="calculator"
          className="w-full flex items-center justify-center gap-2 bg-white text-primary font-semibold px-6 py-3.5 rounded-2xl hover:bg-white/90 transition-all active:scale-[0.99] shadow-soft text-sm"
        >
          Start tracking now
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </TrackedAppStoreLink>
      </div>
    </motion.div>
  );
}
