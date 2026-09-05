"use client";

import { useState, type ReactNode } from "react";
import type { Goal } from "@/lib/landing/calculator";
import { Hero, type HeroProps } from "./Hero";
import { InlineCalculator } from "./InlineCalculator";

interface HeroAndCalculatorFlowProps {
  stats: HeroProps["stats"];
  /**
   * Optional content rendered between the Hero and the calculator (the
   * social-proof stats strip on the homepage). Passed from the Server
   * Component page so the strip itself stays server-rendered.
   */
  children?: ReactNode;
}

/**
 * Client wrapper holding `selectedGoal` state shared between Hero and
 * InlineCalculator. Per Decision Log #8: no React Context — a wrapping
 * component has smaller surface area than a global provider and is
 * sufficient until a third sibling needs the state.
 */
export function HeroAndCalculatorFlow({ stats, children }: HeroAndCalculatorFlowProps) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  return (
    <>
      <Hero
        selectedGoal={selectedGoal}
        onGoalSelect={setSelectedGoal}
        stats={stats}
      />
      {children}
      <InlineCalculator selectedGoal={selectedGoal} />
    </>
  );
}
