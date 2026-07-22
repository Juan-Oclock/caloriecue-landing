import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProteinSwapExplorer from "@/components/blog/ProteinSwapExplorer";
import type { ProteinSwapAnalyticsAdapter } from "@/lib/blog/protein-swap-analytics";

describe("ProteinSwapExplorer", () => {
  it("renders the default comparison and all 30 rows without interaction", () => {
    render(<ProteinSwapExplorer />);
    expect(screen.getByRole("heading", { name: /protein swap explorer/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/current food/i)).toHaveValue("peanut-butter");
    expect(screen.getByLabelText(/compare with/i)).toHaveValue("greek-yogurt-nonfat");
    expect(screen.getByRole("status")).toHaveTextContent(/32\.5 g of protein/i);
    expect(screen.getByLabelText(/visual comparison/i)).toBeInTheDocument();
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(31);
  });

  it("updates the plain-language result in both modes", async () => {
    const user = userEvent.setup();
    render(<ProteinSwapExplorer />);
    await user.click(screen.getByRole("radio", { name: /same protein/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/about 46 calories/i);
    expect(screen.getByRole("status")).toHaveTextContent(/142 fewer calories/i);
  });

  it("changes the recommended comparison when the current food changes", async () => {
    const user = userEvent.setup();
    render(<ProteinSwapExplorer />);
    await user.selectOptions(screen.getByLabelText(/current food/i), "cheddar");
    expect(screen.getByLabelText(/compare with/i)).toHaveValue("cottage-cheese-lowfat");
  });

  it("rounds reader-facing calories and protein values without changing the canonical data", async () => {
    const user = userEvent.setup();
    render(<ProteinSwapExplorer />);

    await user.selectOptions(screen.getByLabelText(/current food/i), "bacon");
    expect(screen.getByRole("status")).toHaveTextContent(/at 112 calories/i);
    await user.click(screen.getByRole("radio", { name: /same protein/i }));
    expect(screen.getByLabelText(/visual comparison/i)).toHaveTextContent(/112 calories/i);
    expect(screen.getByRole("table")).not.toHaveTextContent("112.32");
    expect(screen.queryByText("112.32")).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/current food/i), "cheddar");
    expect(screen.getByRole("status")).toHaveTextContent(/to get 6\.5 g of protein/i);
  });

  it("filters and sorts the semantic table", async () => {
    const user = userEvent.setup();
    render(<ProteinSwapExplorer />);
    await user.selectOptions(screen.getByLabelText(/food category/i), "dairy");
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(6);
    await user.selectOptions(screen.getByLabelText(/sort foods by/i), "proteinGrams");
    expect(screen.getByRole("button", { name: /sort ascending/i })).toBeInTheDocument();
  });

  it("downloads the canonical CSV after an explicit click", async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.fn(() => "blob:protein-csv");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    render(<ProteinSwapExplorer />);

    await user.click(screen.getByRole("button", { name: /download csv/i }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:protein-csv");
    click.mockRestore();
  });

  it("revokes the CSV object URL when the download click fails", async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.fn(() => "blob:failed-protein-csv");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {
      throw new Error("download blocked");
    });
    render(<ProteinSwapExplorer />);

    await user.click(screen.getByRole("button", { name: /download csv/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/csv could not be downloaded/i);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:failed-protein-csv");
    click.mockRestore();
  });

  it("emits only one privacy-safe event for the first tracked interaction", async () => {
    const user = userEvent.setup();
    const track = vi.fn();
    const analytics: ProteinSwapAnalyticsAdapter = { track };
    render(<ProteinSwapExplorer analytics={analytics} />);

    await user.selectOptions(screen.getByLabelText(/current food/i), "cheddar");
    await user.click(screen.getByRole("radio", { name: /same protein/i }));
    await user.selectOptions(screen.getByLabelText(/sort foods by/i), "calories");

    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith("protein_swap_interaction", {
      tool: "protein_swap_explorer",
      action: "select_food",
      content_slug: "high-calorie-low-protein-foods",
    });
    expect(JSON.stringify(track.mock.calls)).not.toMatch(/peanut|cheddar|188|proteinGrams/);
  });

  it("keeps CSV download and later interactions available when download analytics throws", async () => {
    const user = userEvent.setup();
    const track = vi.fn(() => {
      throw new Error("analytics unavailable");
    });
    const analytics: ProteinSwapAnalyticsAdapter = { track };
    const createObjectURL = vi.fn(() => "blob:protein-csv");
    const revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectURL });
    render(<ProteinSwapExplorer analytics={analytics} />);

    await user.click(screen.getByRole("button", { name: /download csv/i }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:protein-csv");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(consoleError).not.toHaveBeenCalled();

    await user.selectOptions(screen.getByLabelText(/current food/i), "cheddar");
    await user.click(screen.getByRole("radio", { name: /same protein/i }));

    expect(screen.getByLabelText(/current food/i)).toHaveValue("cheddar");
    expect(screen.getByRole("radio", { name: /same protein/i })).toBeChecked();
    expect(track).toHaveBeenCalledTimes(1);
    click.mockRestore();
    consoleError.mockRestore();
  });
});
