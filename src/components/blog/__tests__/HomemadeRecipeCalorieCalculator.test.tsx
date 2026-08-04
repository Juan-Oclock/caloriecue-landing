import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomemadeRecipeCalorieCalculator from "@/components/blog/HomemadeRecipeCalorieCalculator";

describe("HomemadeRecipeCalorieCalculator", () => {
  it("shows an auditable worked-recipe result by default", () => {
    render(<HomemadeRecipeCalorieCalculator />);

    const results = screen.getByRole("status");

    expect(within(results).getByText("1,700 calories")).toBeInTheDocument();
    expect(within(results).getAllByText("340 calories")).toHaveLength(2);
    expect(within(results).getByText("85 calories")).toBeInTheDocument();
    expect(screen.getByLabelText(/number of servings/i)).toHaveValue(5);
    expect(screen.getByLabelText(/finished recipe weight/i)).toHaveValue(2000);
    expect(screen.getByLabelText(/portion weight/i)).toHaveValue(400);
  });

  it("recalculates the recipe total and serving result as inputs change", async () => {
    const user = userEvent.setup();
    render(<HomemadeRecipeCalorieCalculator />);

    const firstCalories = screen.getByLabelText("Ingredient 1 calories");
    const servings = screen.getByLabelText(/number of servings/i);

    await user.clear(firstCalories);
    await user.type(firstCalories, "500");
    await user.clear(servings);
    await user.type(servings, "4");

    const results = screen.getByRole("status");
    expect(within(results).getByText("1,560 calories")).toBeInTheDocument();
    expect(within(results).getByText("390 calories")).toBeInTheDocument();
  });

  it("adds and removes ingredient rows", async () => {
    const user = userEvent.setup();
    render(<HomemadeRecipeCalorieCalculator />);

    expect(screen.getAllByRole("button", { name: /remove ingredient/i })).toHaveLength(5);

    await user.click(screen.getByRole("button", { name: /add ingredient/i }));
    expect(screen.getAllByRole("button", { name: /remove ingredient/i })).toHaveLength(6);
    expect(screen.getByLabelText("Ingredient 6 calories")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove ingredient 6" }));
    expect(screen.getAllByRole("button", { name: /remove ingredient/i })).toHaveLength(5);
  });

  it("clears safely without rendering invalid numeric output", async () => {
    const user = userEvent.setup();
    render(<HomemadeRecipeCalorieCalculator />);

    await user.click(screen.getByRole("button", { name: /^clear$/i }));

    const results = screen.getByRole("status");
    expect(within(results).getByText(/add ingredient calories to see results/i)).toBeInTheDocument();
    expect(results).not.toHaveTextContent("NaN");
    expect(results).not.toHaveTextContent("Infinity");
    expect(screen.getAllByLabelText(/ingredient \d+ calories/i)).toHaveLength(1);
    expect(screen.getByLabelText(/number of servings/i)).toHaveValue(null);
  });
});
