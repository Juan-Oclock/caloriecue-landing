import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CaloriesPerGramCalculator from "@/components/blog/CaloriesPerGramCalculator";

describe("CaloriesPerGramCalculator", () => {
  it("shows a useful worked-meal result by default", () => {
    render(<CaloriesPerGramCalculator />);

    expect(screen.getByRole("status")).toHaveTextContent("415 calories");
    expect(screen.getByLabelText(/protein grams/i)).toHaveValue(30);
    expect(screen.getByLabelText(/carbohydrate grams/i)).toHaveValue(40);
    expect(screen.getByLabelText(/fat grams/i)).toHaveValue(15);
  });

  it("loads the 199-calorie label example from a preset", async () => {
    const user = userEvent.setup();
    render(<CaloriesPerGramCalculator />);

    await user.click(screen.getByRole("button", { name: /label example/i }));

    expect(screen.getByRole("status")).toHaveTextContent("199 calories");
    expect(screen.getByText("40 cal")).toBeInTheDocument();
    expect(screen.getByText("96 cal")).toBeInTheDocument();
    expect(screen.getByText("63 cal")).toBeInTheDocument();
  });

  it("clears all values without producing an invalid result", async () => {
    const user = userEvent.setup();
    render(<CaloriesPerGramCalculator />);

    await user.click(screen.getByRole("button", { name: /^clear$/i }));

    expect(screen.getByRole("status")).toHaveTextContent("0 calories");
    expect(screen.getByLabelText(/alcohol grams/i)).toHaveValue(null);
  });
});
