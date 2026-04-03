"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

const stagger = (i: number) => ({
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.06 } },
});

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

interface GoalSelectorProps {
  goals: { key: "cut" | "maintain" | "bulk"; label: string; cal: number; rate: string }[];
  goal: "cut" | "maintain" | "bulk";
  onGoalChange: (g: "cut" | "maintain" | "bulk") => void;
  calorieOffset: number;
  onCalorieOffsetChange: (val: number) => void;
}

export default function GoalSelector({ goals, goal, onGoalChange, calorieOffset, onCalorieOffsetChange }: GoalSelectorProps) {
  const rafRef = useRef(0);
  const sliderPercent = ((calorieOffset - 100) / (1000 - 100)) * 100;

  return (
    <motion.div variants={stagger(1)} initial="hidden" animate="visible" className="bg-white rounded-2xl border border-border px-6 py-5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Daily Calorie Goal</p>
      <div className="grid grid-cols-3 gap-3">
        {goals.map((g) => {
          const GoalIcon = GOAL_ICONS[g.key];
          return (
            <button
              key={g.key}
              onClick={() => onGoalChange(g.key)}
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
              onChange={(e) => {
                const val = Number(e.target.value);
                cancelAnimationFrame(rafRef.current);
                rafRef.current = requestAnimationFrame(() => onCalorieOffsetChange(val));
              }}
              className="relative w-full h-2 bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent"
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground">
            <span>100</span>
            <span>250</span>
            <span>500</span>
            <span>750</span>
            <span>1000</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
