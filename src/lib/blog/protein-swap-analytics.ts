export type ProteinSwapAction =
  | "select_food"
  | "change_mode"
  | "sort_table"
  | "download_csv";

type GtagFn = (
  command: "event",
  eventName: string,
  params?: Record<string, unknown>,
) => void;

export interface ProteinSwapAnalyticsAdapter {
  track: (eventName: string, payload: Record<string, string>) => void;
}

const browserAnalytics: ProteinSwapAnalyticsAdapter = {
  track(eventName, payload) {
    if (typeof window === "undefined") return;
    const gtag = (window as unknown as { gtag?: GtagFn }).gtag;
    if (typeof gtag === "function") gtag("event", eventName, payload);
  },
};

export function trackProteinSwapInteraction(
  action: ProteinSwapAction,
  adapter: ProteinSwapAnalyticsAdapter = browserAnalytics,
): void {
  adapter.track("protein_swap_interaction", {
    tool: "protein_swap_explorer",
    action,
    content_slug: "high-calorie-low-protein-foods",
  });
}
