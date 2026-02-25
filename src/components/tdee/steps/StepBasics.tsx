"use client";

import { motion } from "framer-motion";
import type { Gender } from "@/lib/tdee/types";

interface StepBasicsProps {
  gender: Gender;
  onGenderChange: (g: Gender) => void;
}

export default function StepBasics({ gender, onGenderChange }: StepBasicsProps) {
  return (
    <div className="space-y-8">
      {/* Gender */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-3">Gender</label>
        <div className="inline-flex items-center bg-muted/50 p-1 rounded-full border border-border">
          {(["male", "female"] as Gender[]).map((g) => (
            <motion.button
              key={g}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => onGenderChange(g)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                gender === g
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {g === "male" ? "Male" : "Female"}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
