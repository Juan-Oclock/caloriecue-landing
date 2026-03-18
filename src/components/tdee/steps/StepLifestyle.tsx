"use client";

import { motion } from "framer-motion";
import type { ActivityLevel } from "@/lib/tdee/types";
import { ACTIVITY_LABELS } from "@/lib/tdee/constants";
import InputWithUnit from "../InputWithUnit";

const ACTIVITY_OPTIONS: { key: ActivityLevel; multiplier: string }[] = [
  { key: "sedentary", multiplier: "x1.2" },
  { key: "light", multiplier: "x1.375" },
  { key: "moderate", multiplier: "x1.55" },
  { key: "very_active", multiplier: "x1.725" },
  { key: "extreme", multiplier: "x1.9" },
];

/* Activity icons */
function SedentaryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="4" rx="1" width="14" height="12" />
      <path d="M9 20h6" />
      <path d="M12 16v4" />
    </svg>
  );
}

function WalkingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13" cy="4" r="2" />
      <path d="M10 10l-1.5 5L12 18l1 4" />
      <path d="M13.5 6.5L16 10h2" />
      <path d="M10 10l-3 1" />
      <path d="M16 10l-3 6-2.5 0" />
    </svg>
  );
}

function DumbbellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5l11 11" />
      <path d="M21 3l-2.5 2.5" />
      <path d="M18.5 5.5l-2 2" />
      <path d="M5.5 16.5l-2 2" />
      <path d="M3 21l2.5-2.5" />
      <path d="M18.5 8.5l-2-2" />
      <path d="M7.5 17.5l-2-2" />
    </svg>
  );
}

function RunningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="14" cy="4" r="2" />
      <path d="M4 17l3-3 3 1 4-4" />
      <path d="M14 10l2-1 4 4" />
      <path d="M10 15l-2 6" />
      <path d="M14 10l-1 6h3" />
    </svg>
  );
}

function FireIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2c.5 3.5 4 6 4 10a6 6 0 01-12 0c0-4 3.5-6.5 4-10 1 2 3 3 4 0z" />
    </svg>
  );
}

const ACTIVITY_ICONS: Record<ActivityLevel, React.FC<{ className?: string }>> = {
  sedentary: SedentaryIcon,
  light: WalkingIcon,
  moderate: DumbbellIcon,
  very_active: RunningIcon,
  extreme: FireIcon,
};

interface StepLifestyleProps {
  bodyFatPercent: string;
  activityLevel: ActivityLevel;
  onFieldChange: (field: string, value: string) => void;
  onActivityChange: (a: ActivityLevel) => void;
}

export default function StepLifestyle({
  bodyFatPercent,
  activityLevel,
  onFieldChange,
  onActivityChange,
}: StepLifestyleProps) {
  return (
    <div className="space-y-5">
      {/* Body Fat % */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          Body Fat <span className="font-normal text-muted-foreground/60">(optional)</span>
        </label>
        <div className="max-w-[160px]">
          <InputWithUnit
            value={bodyFatPercent}
            onChange={(v) => onFieldChange("bodyFatPercent", v)}
            placeholder="18"
            unit="%"
            min="1"
            max="60"
            step="0.1"
          />
        </div>
      </div>

      {/* Activity Level */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-2.5">Activity Level</label>
        <div className="space-y-2">
          {ACTIVITY_OPTIONS.map(({ key, multiplier }) => {
            const info = ACTIVITY_LABELS[key];
            const isActive = activityLevel === key;
            const Icon = ACTIVITY_ICONS[key];
            return (
              <motion.button
                key={key}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => onActivityChange(key)}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all text-left ${
                  isActive
                    ? "bg-primary-50 ring-1 ring-primary/30"
                    : "hover:bg-muted/50"
                }`}
              >
                {/* Activity icon */}
                <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                {/* Text */}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground">
                    {info.title}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1.5">{info.description}</span>
                </div>
                {/* Multiplier */}
                <span className={`flex-shrink-0 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                  isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/70"
                }`}>
                  {multiplier}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
