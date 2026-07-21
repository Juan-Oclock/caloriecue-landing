import type { ComponentProps } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GoogleAnalytics from "@/components/GoogleAnalytics";

type MockScriptProps = ComponentProps<"script"> & {
  strategy?: string;
};

vi.mock("next/script", () => ({
  default: ({ strategy, ...props }: MockScriptProps) => (
    <script data-strategy={strategy} {...props} />
  ),
}));

describe("GoogleAnalytics", () => {
  it("loads both GA scripts after hydration instead of waiting for idle", () => {
    const { container } = render(<GoogleAnalytics />);
    const scripts = Array.from(container.querySelectorAll("script"));

    expect(scripts).toHaveLength(2);
    expect(scripts.every((script) => script.dataset.strategy === "afterInteractive"))
      .toBe(true);
    expect(container.innerHTML).toContain("G-4E4N33E19T");
  });
});
