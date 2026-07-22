import {
  trackEvent,
  type AnalyticsAdapter,
} from "@/lib/analytics";

export type ProteinSwapAction =
  | "select_food"
  | "change_mode"
  | "sort_table"
  | "download_csv";

export type ProteinSwapAnalyticsAdapter = AnalyticsAdapter;

export function trackProteinSwapInteraction(
  action: ProteinSwapAction,
  adapter?: ProteinSwapAnalyticsAdapter,
): void {
  trackEvent(
    "protein_swap_interaction",
    {
      tool: "protein_swap_explorer",
      action,
      content_slug: "high-calorie-low-protein-foods",
    },
    adapter,
  );
}
