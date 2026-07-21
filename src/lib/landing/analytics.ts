import type { Goal } from "./calculator";
import type { ActivityLevel } from "@/lib/tdee/types";
import {
  trackEvent,
  type AnalyticsAdapter,
} from "@/lib/analytics";

export {
  trackAppStoreClick,
} from "@/lib/analytics";
export type {
  AnalyticsAdapter,
  AppStoreClickLocation,
} from "@/lib/analytics";

/**
 * Privacy-conscious analytics for the landing-page calculator.
 *
 * Payloads MUST NOT include calorie targets, weight, height, age, or any
 * anthropometric or derived health data. The shared transport silently no-ops
 * when GA is unavailable and isolates analytics failures from product behavior.
 */

export function trackCalculatorStarted(
  adapter?: AnalyticsAdapter,
): void {
  trackEvent("calculator_started", undefined, adapter);
}

export function trackCalculatorCompleted(
  payload: { goal: Goal; activityLevel: ActivityLevel },
  adapter?: AnalyticsAdapter,
): void {
  trackEvent(
    "calculator_completed",
    {
      goal: payload.goal,
      activityLevel: payload.activityLevel,
    },
    adapter,
  );
}

export function trackCalculatorCtaClicked(
  payload: { which: "app" | "guide"; goal: Goal },
  adapter?: AnalyticsAdapter,
): void {
  trackEvent(
    "calculator_cta_clicked",
    {
      which: payload.which,
      goal: payload.goal,
    },
    adapter,
  );
}

export function trackHeroGoalSelected(
  payload: { goal: Goal },
  adapter?: AnalyticsAdapter,
): void {
  trackEvent("hero_goal_selected", { goal: payload.goal }, adapter);
}
