"use client";

import type { Goal } from "@/lib/landing/calculator";

interface CalculatorCTA {
  label: string;
  href: string;
  variant: "primary" | "secondary";
  analyticsId: string;
}

export interface InlineCalculatorProps {
  /**
   * Selected goal from HeroAndCalculatorFlow. Pre-fills the goal control
   * once Feature 4 ships. Currently displayed inside the placeholder so
   * upstream prop-flow can be verified end-to-end.
   */
  selectedGoal?: Goal | null;
  /**
   * CTAs shown in the result state. v1 default is two CTAs; v1.1 will
   * pass three when "Email me my plan" lands. Accepted as an array so
   * the v1.1 addition is purely additive — no refactor required.
   */
  ctas?: CalculatorCTA[];
}

/**
 * Feature 3 stub. Establishes the `#calculator` scroll target the hero's
 * primary CTA scrolls to, and the prop contract used by
 * HeroAndCalculatorFlow. Feature 4 replaces the body with the real
 * input → result two-state calculator UI.
 */
export function InlineCalculator({ selectedGoal }: InlineCalculatorProps) {
  return (
    <section
      id="calculator"
      className="scroll-mt-24 px-4 py-20 md:py-28 bg-background"
    >
      <div className="max-w-2xl mx-auto text-center">
        <span className="inline-block text-primary-dark font-medium text-sm mb-3 uppercase tracking-wider">
          Calculator
        </span>
        <h2 className="text-display-mobile md:text-display text-foreground mb-4">
          Find your starting number
        </h2>
        <p className="text-muted-foreground text-lg">
          Calculator coming soon{selectedGoal ? ` — pre-filled for ${selectedGoal.replace("-", " ")}` : ""}.
        </p>
        {/* Test hook: surfaces the prop value so HeroAndCalculatorFlow's
            state flow can be verified without depending on the final UI. */}
        <span data-testid="calculator-selected-goal" className="sr-only">
          {selectedGoal ?? "none"}
        </span>
      </div>
    </section>
  );
}
