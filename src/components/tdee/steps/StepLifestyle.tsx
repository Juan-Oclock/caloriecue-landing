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
        <div className="space-y-1.5">
          {ACTIVITY_OPTIONS.map(({ key, multiplier }) => {
            const info = ACTIVITY_LABELS[key];
            const isActive = activityLevel === key;
            return (
              <motion.button
                key={key}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => onActivityChange(key)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left ${
                  isActive
                    ? "bg-primary-50 ring-1 ring-primary/30"
                    : "hover:bg-muted/50"
                }`}
              >
                {/* Radio dot */}
                <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  isActive ? "border-primary" : "border-gray-300"
                }`}>
                  {isActive && <div className="w-2 h-2 rounded-full bg-primary" />}
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
