"use client";

import { motion } from "framer-motion";

const stagger = (i: number) => ({
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.06 } },
});

const HABITS = [
  "Track daily",
  "Stay close to your target",
  "Keep going",
];

export default function HabitPriming() {
  return (
    <motion.div variants={stagger(4)} initial="hidden" animate="visible" className="bg-white rounded-2xl border border-border border-t-2 border-t-primary px-6 py-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center">
          <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2c.5 3.5 4 6 4 10a6 6 0 01-12 0c0-4 3.5-6.5 4-10 1 2 3 3 4 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-foreground">Consistency &gt; Perfection</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        You don&apos;t need to be perfect. You just need to:
      </p>

      <ul className="space-y-2 mb-5">
        {HABITS.map((habit) => (
          <li key={habit} className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-medium text-foreground">{habit}</span>
          </li>
        ))}
      </ul>

      <div className="bg-muted/30 rounded-xl px-4 py-3 border border-border/50">
        <p className="text-sm text-foreground italic text-center">
          &ldquo;If you track it, you can improve it.&rdquo;
        </p>
      </div>
    </motion.div>
  );
}
