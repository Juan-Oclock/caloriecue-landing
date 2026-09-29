import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EggComparison, { EggCookingFat } from "../EggComparison";

describe("egg nutrition graphics", () => {
  it("compares the mixed portion with two eggs using unrounded nutrient inputs", async () => {
    const user = userEvent.setup();
    render(<EggComparison />);
    expect(screen.getByRole("status")).toHaveTextContent("123 calories · 17.1 g protein");
    expect(screen.getByRole("status")).toHaveTextContent("20 fewer calories and 4.5 g more protein");
    await user.click(screen.getByRole("button", { name: "Select 6 egg whites" }));
    expect(screen.getByRole("status")).toHaveTextContent("103 calories · 21.6 g protein");
    expect(screen.getByRole("status")).toHaveTextContent("40 fewer calories and 9.0 g more protein");
    await user.click(screen.getByRole("button", { name: "Select 2 whole eggs" }));
    expect(screen.getByRole("status")).toHaveTextContent("143 calories · 12.6 g protein");
    expect(screen.getByRole("status")).not.toHaveTextContent("fewer calories");
  });

  it("changes the chart's unit without changing the selected food portion", async () => {
    const user = userEvent.setup();
    render(<EggComparison />);
    await user.click(screen.getByRole("button", { name: "Protein", exact: true }));
    expect(screen.getByText("Bar scale: 0–25 g protein")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Protein", exact: true })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Select 1 egg + 3 whites" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("status")).toHaveTextContent("123 calories · 17.1 g protein");
  });

  it("adds and removes oil calories while keeping egg protein constant", async () => {
    const user = userEvent.setup();
    render(<EggCookingFat />);
    expect(screen.getByRole("status")).toHaveTextContent("143 calories total · 12.6 g protein");
    await user.click(screen.getByRole("button", { name: "5 g oil", exact: true }));
    expect(screen.getByRole("status")).toHaveTextContent("188 calories total · 12.6 g protein");
    await user.click(screen.getByRole("button", { name: "10 g oil", exact: true }));
    expect(screen.getByRole("status")).toHaveTextContent("233 calories total · 12.6 g protein");
    await user.click(screen.getByRole("button", { name: "No added oil" }));
    expect(screen.getByRole("status")).toHaveTextContent("143 calories total · 12.6 g protein");
  });
});
