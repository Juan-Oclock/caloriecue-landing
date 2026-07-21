export const GA_MEASUREMENT_ID = "G-4E4N33E19T";

export type AnalyticsPageContext = {
  page_location: string;
  page_referrer: string;
};

type AnalyticsConfig = AnalyticsPageContext & {
  send_page_view: false;
};

export interface BrowserGtag {
  (command: "set", fields: AnalyticsPageContext): void;
  (
    command: "config",
    measurementId: typeof GA_MEASUREMENT_ID,
    fields: AnalyticsConfig,
  ): void;
  (
    command: "event",
    eventName: string,
    fields?: Record<string, unknown>,
  ): void;
}

type AnalyticsWindow = typeof window & {
  __calorieCueAnalyticsContext?: AnalyticsPageContext;
};

export function sanitizeAnalyticsUrl(value: string): string {
  if (!value) return "";

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return `${url.origin}${url.pathname}`;
  } catch {
    return "";
  }
}

export function configureSafeAnalyticsContext(
  gtag: BrowserGtag,
  pageReferrer?: string,
): AnalyticsPageContext {
  const analyticsWindow = window as AnalyticsWindow;
  const pageLocation = sanitizeAnalyticsUrl(window.location.href);
  const storedContext = analyticsWindow.__calorieCueAnalyticsContext;
  const storedLocation = sanitizeAnalyticsUrl(
    storedContext?.page_location ?? "",
  );
  const storedReferrer = sanitizeAnalyticsUrl(
    storedContext?.page_referrer ?? "",
  );
  const safeReferrer =
    pageReferrer !== undefined
      ? sanitizeAnalyticsUrl(pageReferrer)
      : storedLocation
        ? storedLocation === pageLocation
          ? storedReferrer
          : storedLocation
        : sanitizeAnalyticsUrl(document.referrer);
  const context = {
    page_location: pageLocation,
    page_referrer: safeReferrer,
  };

  analyticsWindow.__calorieCueAnalyticsContext = context;

  // Config-scoped fields outrank global fields in gtag. Refresh both scopes so
  // neither custom nor automatic events can fall back to a query-bearing URL.
  gtag("set", context);
  gtag("config", GA_MEASUREMENT_ID, {
    ...context,
    send_page_view: false,
  });

  return context;
}
