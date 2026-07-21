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

export function trackEvent(
  eventName: string,
  payload?: Record<string, unknown>,
  adapter: AnalyticsAdapter = browserAnalytics,
): void {
  try {
    if (payload === undefined) {
      adapter.track(eventName);
      return;
    }
    adapter.track(eventName, payload);
  } catch {
    // Analytics is observational and must never affect product behavior.
  }
}

export type LeadType = "newsletter" | "cheat_sheet";
export type LeadLocation = "blog_footer" | "cheat_sheet_form";

export interface GenerateLeadInput {
  leadType: LeadType;
  location: LeadLocation;
  contentSlug?: string;
}

export type AppStoreClickLocation =
  | "hero"
  | "final_cta"
  | "nav"
  | "pricing"
  | "calculator"
  | "blog_tldr"
  | "blog_inline";

export interface AppStoreClickInput {
  location: AppStoreClickLocation;
  contentSlug?: string;
}

export function trackGenerateLead(
  input: GenerateLeadInput,
  adapter?: AnalyticsAdapter,
): void {
  trackEvent(
    "generate_lead",
    {
      lead_type: input.leadType,
      location: input.location,
      ...(input.contentSlug ? { content_slug: input.contentSlug } : {}),
    },
    adapter,
  );
}

export function trackAppStoreClick(
  input: AppStoreClickInput,
  adapter?: AnalyticsAdapter,
): void {
  trackEvent(
    "app_store_click",
    {
      location: input.location,
      ...(input.contentSlug ? { content_slug: input.contentSlug } : {}),
    },
    adapter,
  );
}
