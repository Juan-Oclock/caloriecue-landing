import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TrackedAppStoreLink from "@/components/TrackedAppStoreLink";
import { trackAppStoreClick } from "@/lib/analytics";

vi.mock("@/lib/analytics", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/analytics")>();
  return { ...actual, trackAppStoreClick: vi.fn() };
});

describe("TrackedAppStoreLink", () => {
  beforeEach(() => vi.clearAllMocks());

  it("tracks the allow-listed placement and slug while preserving link props", () => {
    render(
      <TrackedAppStoreLink
        href="https://apps.apple.com/example?utm_source=blog"
        target="_blank"
        rel="noopener noreferrer"
        location="blog_inline"
        contentSlug="protein-per-calorie"
      >
        Download CalorieCue
      </TrackedAppStoreLink>,
    );

    const link = screen.getByRole("link", { name: "Download CalorieCue" });
    expect(link).toHaveAttribute(
      "href",
      "https://apps.apple.com/example?utm_source=blog",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");

    fireEvent.click(link);

    expect(trackAppStoreClick).toHaveBeenCalledTimes(1);
    expect(trackAppStoreClick).toHaveBeenCalledWith({
      location: "blog_inline",
      contentSlug: "protein-per-calorie",
    });
  });

  it("preserves a caller click handler", () => {
    const onClick = vi.fn((event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });

    render(
      <TrackedAppStoreLink
        href="https://apps.apple.com/example"
        location="nav"
        onClick={onClick}
      >
        Get the App
      </TrackedAppStoreLink>,
    );

    fireEvent.click(screen.getByRole("link", { name: "Get the App" }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(trackAppStoreClick).toHaveBeenCalledWith({
      location: "nav",
      contentSlug: undefined,
    });
  });
});
