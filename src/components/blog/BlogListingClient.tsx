"use client";

import { useState, useMemo } from "react";
import FadeIn from "@/components/FadeIn";
import BlogSearchAndFilter from "./BlogSearchAndFilter";
import FeaturedPost from "./FeaturedPost";
import BlogPostCardOverlay from "./BlogPostCardOverlay";
import NewsletterSection from "./NewsletterSection";
import type { BlogPostMeta } from "@/lib/blog/types";

interface BlogListingClientProps {
  posts: BlogPostMeta[];
  tags: string[];
}

export default function BlogListingClient({
  posts,
  tags,
}: BlogListingClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("");

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

  const featuredPost = filteredPosts[0];
  const gridPosts = filteredPosts.slice(1);

  return (
    <>
      {/* Hero section */}
      <section className="pt-28 pb-12 md:pt-40 md:pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-10">
            <span className="inline-block text-primary font-medium text-sm mb-3 uppercase tracking-wider">
              Blog
            </span>
            <h1 className="text-display-mobile md:text-display text-foreground mb-4">
              Latest from the Blog
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tips, guides, and insights to help you eat smarter and track
              better.
            </p>
          </FadeIn>

          {/* Search and filter */}
          <FadeIn delay={0.1}>
            <BlogSearchAndFilter
              tags={tags}
              activeTag={activeTag}
              onTagChange={setActiveTag}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </FadeIn>
        </div>
      </section>

      {/* Posts section */}
      <section className="pb-20 md:pb-28 px-4">
        <div className="max-w-6xl mx-auto">
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
                }}
                className="mt-4 text-primary font-medium hover:underline"
              >
                Clear filters
              </button>
            </FadeIn>
          ) : (
            <div className="space-y-12">
              {/* Featured post */}
              {featuredPost && (
                <FadeIn delay={0.15}>
                  <FeaturedPost post={featuredPost} />
                </FadeIn>
              )}

              {/* Grid of overlay cards */}
              {gridPosts.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gridPosts.map((post, i) => (
                    <BlogPostCardOverlay
                      key={post.slug}
                      post={post}
                      delay={i * 0.08}
                    />
                  ))}
                </div>
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
