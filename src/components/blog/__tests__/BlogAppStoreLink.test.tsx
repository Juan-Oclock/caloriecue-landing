import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

const { trackAppStoreClick } = vi.hoisted(() => ({
  trackAppStoreClick: vi.fn(),
}));
vi.mock("@/lib/landing/analytics", () => ({ trackAppStoreClick }));

import BlogAppStoreLink from "@/components/blog/BlogAppStoreLink";

describe("BlogAppStoreLink", () => {
  it("keeps UTM attribution and emits the established blog App Store event", () => {
    render(<BlogAppStoreLink />);
    const link = screen.getByRole("link", { name: /download caloriecue/i });
    expect(link).toHaveAttribute("href", expect.stringContaining("utm_medium=inline_cta"));
    fireEvent.click(link);
    expect(trackAppStoreClick).toHaveBeenCalledWith({ location: "blog" });
  });
});
