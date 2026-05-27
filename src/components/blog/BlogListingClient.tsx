"use client";

import { useState, useMemo, useCallback } from "react";
import FadeIn from "@/components/FadeIn";
import BlogSearchAndFilter from "./BlogSearchAndFilter";
import FeaturedPost from "./FeaturedPost";
import BlogPostCardEditorial from "./BlogPostCardEditorial";
import NewsletterSection from "./NewsletterSection";
import type { BlogPostMeta } from "@/lib/blog/types";

const POSTS_PER_PAGE = 10;
const CURATED_TOPICS = [
  "protein",
  "weight-loss",
  "calorie-tracking",
  "nutrition",
  "ozempic",
  "grocery-list",
  "meal-prep",
  "tools",
];

interface BlogListingClientProps {
  posts: BlogPostMeta[];
  tags: string[];
  featuredGuides: BlogPostMeta[];
}

export default function BlogListingClient({
  posts,
  tags,
  featuredGuides,
}: BlogListingClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const visibleTags = useMemo(
    () => CURATED_TOPICS.filter((topic) => tags.includes(topic)),
    [tags]
  );

  const filteredPosts = useMemo(() => {
    let result = posts;

    if (activeTag) {
      result = result.filter((p) => p.tags.includes(activeTag));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [posts, activeTag, searchQuery]);

  const GRID_PER_PAGE = POSTS_PER_PAGE - 1; // 9 grid posts per page
  const remaining = Math.max(filteredPosts.length - POSTS_PER_PAGE, 0);
  const totalPages =
    filteredPosts.length <= POSTS_PER_PAGE
      ? 1
      : 1 + Math.ceil(remaining / GRID_PER_PAGE);

  const startIndex =
    currentPage === 1
      ? 0
      : POSTS_PER_PAGE + (currentPage - 2) * GRID_PER_PAGE;
  const pageSize = currentPage === 1 ? POSTS_PER_PAGE : GRID_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + pageSize);

  const showFeatured = currentPage === 1;
  const showFeaturedGuides =
    currentPage === 1 &&
    !activeTag &&
    !searchQuery.trim() &&
    featuredGuides.length > 0;
  const featuredPost = showFeatured ? paginatedPosts[0] : null;
  const gridPosts = showFeatured ? paginatedPosts.slice(1) : paginatedPosts;

  const handleTagChange = useCallback((tag: string) => {
    setActiveTag(tag);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary-50/80 via-white to-background px-4 pb-8 pt-28 md:pb-10 md:pt-36">
        <div className="mx-auto max-w-6xl">
          <FadeIn className="mb-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <span className="mb-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold uppercase text-primary shadow-sm ring-1 ring-primary/10">
                Blog
              </span>
              <h1 className="max-w-3xl text-display-mobile text-foreground md:text-display">
                Latest from the Blog
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                Evidence-led guides for choosing better meals, hitting protein
                goals, and making calorie tracking feel less like homework.
              </p>
            </div>
            <div className="rounded-lg border border-border/70 bg-white/80 p-5 shadow-card backdrop-blur">
              <p className="text-sm font-semibold text-foreground">
                High-signal nutrition topics.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Protein, calorie tracking, GLP-1 meals, grocery lists, and
                practical food rankings in one focused index.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <BlogSearchAndFilter
              tags={tags}
              visibleTags={visibleTags}
              activeTag={activeTag}
              onTagChange={handleTagChange}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              resultCount={filteredPosts.length}
            />
          </FadeIn>
        </div>
      </section>

      <section className="px-4 pb-14 pt-8 md:pb-20 md:pt-10">
        <div className="mx-auto max-w-6xl">
          {showFeaturedGuides && (
            <FadeIn className="mb-12 md:mb-14">
              <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-primary">
                    Popular guides
                  </span>
                  <h2 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">
                    Start with these guides
                  </h2>
                </div>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-right">
                  These pages are already earning search impressions. They cover
                  the fastest paths into calorie tracking, food calories,
                  protein choices, and app comparison.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {featuredGuides.map((post, i) => (
                  <BlogPostCardEditorial
                    key={post.slug}
                    post={post}
                    delay={i * 0.08}
                  />
                ))}
              </div>
            </FadeIn>
          )}

          {filteredPosts.length === 0 ? (
            <FadeIn className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>
              <p className="text-muted-foreground text-lg">
                No posts found
                {activeTag ? ` for "${activeTag}"` : ""}
                {searchQuery ? ` matching "${searchQuery}"` : ""}.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveTag("");
                  setCurrentPage(1);
                }}
                className="mt-4 text-primary font-medium hover:underline"
              >
                Clear filters
              </button>
            </FadeIn>
          ) : (
            <div className="space-y-12 md:space-y-14">
              {featuredPost && (
                <FadeIn delay={0.15}>
                  <FeaturedPost post={featuredPost} />
                </FadeIn>
              )}

              {gridPosts.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {gridPosts.map((post, i) => (
                    <BlogPostCardEditorial
                      key={post.slug}
                      post={post}
                      delay={i * 0.08}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <FadeIn>
                  <nav
                    aria-label="Blog pagination"
                    className="flex flex-wrap items-center justify-center gap-2 pt-2"
                  >
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`h-10 w-10 rounded-full text-sm font-semibold transition-colors ${
                            page === currentPage
                              ? "bg-primary text-white shadow-sm"
                              : "border border-border bg-white text-foreground hover:bg-muted"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </nav>
                </FadeIn>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSection />
    </>
  );
}
