"use client";

import { useState } from "react";
import type { Goal } from "@/lib/landing/calculator";
import { Hero, type HeroProps } from "./Hero";
import { InlineCalculator } from "./InlineCalculator";

interface HeroAndCalculatorFlowProps {
  stats: HeroProps["stats"];
}

/**
 * Client wrapper holding `selectedGoal` state shared between Hero and
 * InlineCalculator. Per Decision Log #8: no React Context — a wrapping
 * component has smaller surface area than a global provider and is
 * sufficient until a third sibling needs the state.
 */
export function HeroAndCalculatorFlow({ stats }: HeroAndCalculatorFlowProps) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  return (
    <>
      <Hero
        selectedGoal={selectedGoal}
        onGoalSelect={setSelectedGoal}
        stats={stats}
      />
      <InlineCalculator selectedGoal={selectedGoal} />
    </>
  );
}
