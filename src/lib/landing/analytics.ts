import type { Goal } from "./calculator";
import type { ActivityLevel } from "@/lib/tdee/types";

/**
 * Privacy-conscious analytics for the landing-page calculator.
 *
 * Per Decision Log #11, payloads MUST NOT include calorie targets,
 * weight, height, age, or any other anthropometric/derived health
 * data — we track engagement direction only, not nutrition analytics
 * that could be reverse-engineered into health data.
 *
 * Fires via window.gtag (GA4) if loaded; no-ops in tests or when GA
 * hasn't loaded yet. Tests inject a stub through the analytics arg.
 */

type GtagFn = (
  command: "event",
  eventName: string,
  params?: Record<string, unknown>,
) => void;

export interface AnalyticsAdapter {
  track: (eventName: string, payload?: Record<string, unknown>) => void;
}

const browserAnalytics: AnalyticsAdapter = {
  track(eventName, payload) {
    if (typeof window === "undefined") return;
    const gtag = (window as unknown as { gtag?: GtagFn }).gtag;
    if (typeof gtag === "function") {
      gtag("event", eventName, payload);
    }
  },
};

// ---- Typed event helpers -------------------------------------------------

export function trackCalculatorStarted(
  adapter: AnalyticsAdapter = browserAnalytics,
): void {
  adapter.track("calculator_started");
}

export function trackCalculatorCompleted(
  payload: { goal: Goal; activityLevel: ActivityLevel },
  adapter: AnalyticsAdapter = browserAnalytics,
): void {
  // Intentionally narrow: ONLY goal and activityLevel. The payload object
  // is constructed inline so static review and the regression test in
  // InlineCalculator.test.tsx can verify no other keys leak in.
  adapter.track("calculator_completed", {
    goal: payload.goal,
    activityLevel: payload.activityLevel,
  });
}

export function trackCalculatorCtaClicked(
  payload: { which: "app" | "guide"; goal: Goal },
  adapter: AnalyticsAdapter = browserAnalytics,
): void {
  adapter.track("calculator_cta_clicked", {
    which: payload.which,
    goal: payload.goal,
  });
}
