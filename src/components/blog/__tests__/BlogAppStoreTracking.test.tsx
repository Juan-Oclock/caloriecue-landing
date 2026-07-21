import type { ComponentPropsWithoutRef, ComponentType } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BlogTldr from "@/components/blog/BlogTldr";
import { getMDXComponents } from "@/components/blog/MDXComponents";
import { trackAppStoreClick } from "@/lib/analytics";

const navigation = vi.hoisted(() => ({ search: "" }));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(navigation.search),
}));

vi.mock("@/lib/analytics", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/analytics")>();
  return { ...actual, trackAppStoreClick: vi.fn() };
});

describe("blog App Store measurement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigation.search = "";
  });

  it("tracks the TL;DR CTA with its article slug and preserves its UTM URL", () => {
    render(
      <BlogTldr
        body="A concise answer."
        utmContent="protein-per-calorie"
      />,
    );

    const link = screen.getByRole("link", {
      name: "Download CalorieCue — Free",
    });
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("utm_medium=tldr_cta"),
    );
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("utm_content=protein-per-calorie"),
    );

    fireEvent.click(link);

    expect(trackAppStoreClick).toHaveBeenCalledWith({
      location: "blog_tldr",
      contentSlug: "protein-per-calorie",
    });
  });

  it("keeps the TL;DR CTA hidden for in-app readers", () => {
    navigation.search = "src=app";

    render(<BlogTldr body="A concise answer." utmContent="article" />);

    expect(
      screen.queryByRole("link", { name: "Download CalorieCue — Free" }),
    ).not.toBeInTheDocument();
  });

  it("tracks an inline MDX App Store CTA with the article slug", () => {
    const components = getMDXComponents("calories-in-food-list");
    const InlineAppStoreLink = components.AppStoreLink as ComponentType;
    render(<InlineAppStoreLink />);

    const link = screen.getByRole("link", { name: "Download CalorieCue" });
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("utm_medium=inline_cta"),
    );

    fireEvent.click(link);

    expect(trackAppStoreClick).toHaveBeenCalledWith({
      location: "blog_inline",
      contentSlug: "calories-in-food-list",
    });
  });

  it("tracks an ordinary Markdown App Store anchor and preserves its props", () => {
    const components = getMDXComponents("calories-in-popular-foods");
    const MarkdownLink = components.a as ComponentType<
      ComponentPropsWithoutRef<"a">
    >;
    const href =
      "https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503?utm_source=blog&utm_medium=article&utm_content=food-list";
    const suppliedClick = vi.fn();

    render(
      <MarkdownLink
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title="Get CalorieCue"
        className="published-cta"
        onClick={(event) => {
          event.preventDefault();
          suppliedClick();
        }}
      >
        Scan your meals with CalorieCue
      </MarkdownLink>,
    );

    const link = screen.getByRole("link", {
      name: "Scan your meals with CalorieCue",
    });
    expect(link).toHaveAttribute("href", href);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAttribute("title", "Get CalorieCue");
    expect(link).toHaveClass("published-cta");

    fireEvent.click(link);

    expect(trackAppStoreClick).toHaveBeenCalledWith({
      location: "blog_inline",
      contentSlug: "calories-in-popular-foods",
    });
    expect(suppliedClick).toHaveBeenCalledTimes(1);
  });

  it("keeps ordinary non-App-Store Markdown anchors untracked", () => {
    const components = getMDXComponents("calories-in-popular-foods");
    const MarkdownLink = components.a as ComponentType<
      ComponentPropsWithoutRef<"a">
    >;

    render(<MarkdownLink href="#articles">Read more articles</MarkdownLink>);
    fireEvent.click(screen.getByRole("link", { name: "Read more articles" }));

    expect(trackAppStoreClick).not.toHaveBeenCalled();
  });
});
