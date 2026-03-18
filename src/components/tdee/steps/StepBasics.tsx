"use client";

import { motion } from "framer-motion";
import type { Gender } from "@/lib/tdee/types";

interface StepBasicsProps {
  gender: Gender;
  onGenderChange: (g: Gender) => void;
}

const GENDER_OPTIONS: { key: Gender; label: string }[] = [
  { key: "male", label: "Male" },
  { key: "female", label: "Female" },
];

/* Male silhouette icon */
function MaleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3" />
      <path d="M12 8v8" />
      <path d="M9 21l3-5 3 5" />
      <path d="M8 13h8" />
    </svg>
  );
}

/* Female silhouette icon */
function FemaleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3" />
      <path d="M12 8v4" />
      <path d="M9 12c0 0-1.5 3-1.5 5s1 4 4.5 4 4.5-2 4.5-4-1.5-5-1.5-5H9z" />
      <path d="M8 13h8" />
    </svg>
  );
}

export default function StepBasics({ gender, onGenderChange }: StepBasicsProps) {
  return (
    <div className="space-y-5">
      {/* Gender */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-3">Gender</label>
        <div className="grid grid-cols-2 gap-3">
          {GENDER_OPTIONS.map(({ key, label }) => {
            const isActive = gender === key;
            const Icon = key === "male" ? MaleIcon : FemaleIcon;
            return (
              <motion.button
                key={key}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => onGenderChange(key)}
                className={`flex flex-col items-center gap-3 rounded-2xl py-5 px-4 border transition-all ${
                  isActive
                    ? "bg-primary-50 border-primary/30 shadow-soft"
                    : "bg-muted/30 border-border hover:bg-muted/50"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                    isActive ? "bg-primary/10" : "bg-muted"
                  }`}
                >
                  <Icon
                    className={`w-7 h-7 transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <span
                  className={`text-sm font-semibold transition-colors ${
                    isActive ? "text-primary" : "text-foreground"
                  }`}
                >
                  {label}
                </span>
              </motion.button>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground/60 mt-3 text-center">
          Used to calibrate BMR formulas that differ by biological sex.
        </p>
      </div>
    </div>
  );
}
