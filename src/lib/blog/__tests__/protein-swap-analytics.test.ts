import { describe, expect, it, vi } from "vitest";
import {
  trackProteinSwapInteraction,
  type ProteinSwapAnalyticsAdapter,
} from "@/lib/blog/protein-swap-analytics";

describe("trackProteinSwapInteraction", () => {
  it("emits only the approved diagnostic fields", () => {
    const track = vi.fn();
    const adapter: ProteinSwapAnalyticsAdapter = { track };

    trackProteinSwapInteraction("select_food", adapter);

    expect(track).toHaveBeenCalledTimes(1);
    const [eventName, payload] = track.mock.calls[0];
    expect(eventName).toBe("protein_swap_interaction");
    expect(payload).toEqual({
      tool: "protein_swap_explorer",
      action: "select_food",
      content_slug: "high-calorie-low-protein-foods",
    });
    expect(Object.keys(payload).sort()).toEqual(["action", "content_slug", "tool"]);
  });
});
