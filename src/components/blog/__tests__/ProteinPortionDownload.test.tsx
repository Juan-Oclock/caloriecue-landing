import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProteinPortionDownload from "../ProteinPortionDownload";
import { trackEvent } from "@/lib/analytics";
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

describe("portion chart download", () => {
  it("links directly to the PDF and records a download click separately from an App Store conversion", () => {
    render(<ProteinPortionDownload />);
    const link = screen.getByRole("link", { name: "Download the free portion chart (PDF)" });
    expect(link).toHaveAttribute("href", "/downloads/caloriecue-30g-protein-portions.pdf");
    expect(link).toHaveAttribute("download", "caloriecue-30g-protein-portions.pdf");
    fireEvent.click(link);
    expect(trackEvent).toHaveBeenCalledWith("protein_portion_chart_download", {
      content_slug: "what-does-30g-of-protein-look-like", location: "blog_portion_chart", file_name: "caloriecue-30g-protein-portions.pdf",
    });
    expect(trackEvent).toHaveBeenCalledTimes(1);
  });
});
