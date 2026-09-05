"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import { AppleLogo } from "@/components/AppStoreButton";
import TrackedAppStoreLink from "@/components/TrackedAppStoreLink";
import FeaturedPost from "./FeaturedPost";
import BlogPostCardEditorial from "./BlogPostCardEditorial";
import NewsletterSection from "./NewsletterSection";
import type { BlogPostMeta } from "@/lib/blog/types";
import { CURATED_TOPICS, getTagMeta } from "@/lib/blog/tag-meta";

const APP_STORE_URL =
  "https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503";

const PAGE_SIZE = 9;

interface BlogListingClientProps {
  posts: BlogPostMeta[];
  /** Post pinned to the featured card on the unfiltered first page. */
  featuredPost: BlogPostMeta | null;
  /** Extra kicker shown after the topic on the featured card. */
  featuredKicker?: string;
}

export default function BlogListingClient({
  posts,
  featuredPost,
  featuredKicker,
}: BlogListingClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [shown, setShown] = useState(PAGE_SIZE);

  const query = searchQuery.trim().toLowerCase();
  const isFiltering = Boolean(activeTag || query);

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return counts;
  }, [posts]);

  const pills = useMemo(
    () => CURATED_TOPICS.filter((topic) => (tagCounts.get(topic) ?? 0) > 0),
    [tagCounts],
  );

  const filteredPosts = useMemo(() => {
    let result = posts;
    // The featured post is pulled out of the grid only on the unfiltered view.
    if (!isFiltering && featuredPost) {
      result = result.filter((p) => p.slug !== featuredPost.slug);
    }
    if (activeTag) {
      result = result.filter((p) => p.tags.includes(activeTag));
    }
    if (query) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query),
      );
    }
    return result;
  }, [posts, activeTag, query, isFiltering, featuredPost]);

  const visiblePosts = filteredPosts.slice(0, shown);
  const hasMore = filteredPosts.length > shown;

  const handleTagChange = useCallback((tag: string) => {
    setActiveTag(tag);
    setShown(PAGE_SIZE);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setShown(PAGE_SIZE);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setActiveTag("");
    setShown(PAGE_SIZE);
  }, []);

  const listHeading = query
    ? "Search results"
    : activeTag
      ? getTagMeta(activeTag).label
      : "Latest guides";

  return (
    <>
      {/* Hero + featured */}
      <section className="px-5 pt-28 md:px-8 md:pt-36">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:gap-12">
          <FadeIn className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex max-w-[640px] flex-col gap-4">
              <span className="eyebrow">
                Guides · {posts.length} articles
              </span>
              <h1 className="text-hero text-foreground text-balance">
                Nutrition, without the homework.
              </h1>
              <p className="text-lg leading-[1.45] text-muted-foreground text-pretty md:text-xl">
                Evidence-led guides on protein, calorie tracking, grocery lists
                and food rankings — written to be used, not just read.
              </p>
            </div>

            <label className="flex h-12 w-full items-center gap-2.5 rounded-[14px] border border-border-strong bg-surface px-4 transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15 sm:w-[320px]">
              <svg
                className="h-4 w-4 shrink-0 text-subtle"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <span className="sr-only">Search guides</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search guides"
                className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground placeholder:text-subtle focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-subtle transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Clear search"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </label>
          </FadeIn>

          {!isFiltering && featuredPost && (
            <FadeIn delay={0.1}>
              <FeaturedPost post={featuredPost} kicker={featuredKicker} />
            </FadeIn>
          )}
        </div>
      </section>

      {/* Filter + grid */}
      <section className="px-5 pb-16 pt-8 md:px-8 md:pb-24 md:pt-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-7">
          {/* Sticky topic pills */}
          <div className="sticky top-16 z-20 -mx-5 border-b border-border bg-background/90 px-5 py-3.5 backdrop-blur-xl md:-mx-8 md:px-8">
            <div
              className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide"
              role="group"
              aria-label="Filter guides by topic"
            >
              <TagPill
                label="All"
                count={posts.length}
                active={activeTag === ""}
                onClick={() => handleTagChange("")}
              />
              {pills.map((topic) => (
                <TagPill
                  key={topic}
                  label={getTagMeta(topic).label}
                  count={tagCounts.get(topic) ?? 0}
                  active={activeTag === topic}
                  onClick={() => handleTagChange(topic)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="text-[clamp(1.5rem,2.6vw,2rem)] font-extrabold tracking-[-0.02em] text-foreground">
              {listHeading}
            </h2>
            <span className="text-sm text-subtle" aria-live="polite">
              {filteredPosts.length} {filteredPosts.length === 1 ? "guide" : "guides"}
            </span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-border-strong bg-surface px-6 py-12 text-center">
              <p className="text-[17px] font-bold text-foreground">
                No guides match
                {query ? ` “${searchQuery.trim()}”` : ""}
                {activeTag ? ` in ${getTagMeta(activeTag).label}` : ""}.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="h-9 rounded-[10px] border-[1.5px] border-border-strong px-3.5 text-[13px] font-semibold text-foreground transition-colors hover:border-foreground"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {visiblePosts.map((post, i) => (
                  <BlogPostCardEditorial
                    key={post.slug}
                    post={post}
                    delay={Math.min(i % PAGE_SIZE, 5) * 0.05}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="flex flex-col items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShown((n) => n + PAGE_SIZE)}
                    className="h-[50px] rounded-[14px] border-[1.5px] border-foreground px-7 text-[15px] font-bold text-foreground transition-colors hover:bg-foreground hover:text-white"
                  >
                    Show more guides
                  </button>
                  <span className="text-[13px] text-subtle">
                    Showing {visiblePosts.length} of {filteredPosts.length}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Tools strip */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-7 px-5 py-14 md:px-8 md:py-20">
          <FadeIn className="flex max-w-[640px] flex-col gap-3">
            <span className="eyebrow">Free tools</span>
            <h2 className="text-balance text-[clamp(1.625rem,2.8vw,2.25rem)] font-extrabold leading-[1.1] tracking-[-0.02em] text-foreground">
              Reading is step one. Numbers are step two.
            </h2>
          </FadeIn>
          <div className="grid gap-4 md:grid-cols-2">
            <FadeIn delay={0.05} className="h-full">
              <Link
                href="/tdee-calculator"
                className="group flex h-full flex-col gap-2.5 rounded-[20px] bg-foreground p-6 text-white transition-transform duration-300 hover:-translate-y-0.5"
              >
                <span className="text-xs font-bold uppercase tracking-[0.06em] text-primary">
                  Calculator
                </span>
                <span className="text-xl font-extrabold tracking-[-0.015em]">
                  TDEE &amp; macro calculator
                </span>
                <span className="text-sm leading-relaxed text-white/70">
                  BMR, maintenance calories, goal targets and a macro split in 30
                  seconds.
                </span>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-primary transition-transform group-hover:translate-x-0.5">
                  Find my number
                  <span aria-hidden="true">→</span>
                </span>
              </Link>
            </FadeIn>
            <FadeIn delay={0.1} className="h-full">
              <TrackedAppStoreLink
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                location="blog_inline"
                className="group flex h-full flex-col gap-2.5 rounded-[20px] bg-primary-dark p-6 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-700"
              >
                <span className="text-xs font-bold uppercase tracking-[0.06em] text-white/85">
                  iOS app
                </span>
                <span className="text-xl font-extrabold tracking-[-0.015em]">
                  Log any meal from a photo
                </span>
                <span className="text-sm leading-relaxed text-white/90">
                  Three seconds per meal. Free to start, no card required.
                </span>
                <span className="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-bold">
                  <AppleLogo className="h-[18px] w-[18px]" />
                  Download free
                  <span aria-hidden="true">→</span>
                </span>
              </TrackedAppStoreLink>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSection />
    </>
  );
}

function TagPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-[13px] font-semibold transition-colors ${
        active
          ? "border-foreground bg-foreground text-white"
          : "border-border-strong bg-surface text-foreground hover:border-foreground"
      }`}
    >
      {label}
      <span className={`text-[11px] font-semibold ${active ? "text-white/70" : "text-subtle"}`}>
        {count}
      </span>
    </button>
  );
}
