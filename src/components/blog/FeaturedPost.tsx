"use client";

import Link from "next/link";
import Image from "next/image";
import type { BlogPostMeta } from "@/lib/blog/types";

interface FeaturedPostProps {
  post: BlogPostMeta;
}

function formatLongDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function FeaturedPost({ post }: FeaturedPostProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="grid overflow-hidden rounded-lg border border-border/80 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-card-hover lg:grid-cols-[1.12fr_0.88fr]">
        <div className="relative min-h-[260px] overflow-hidden bg-muted md:min-h-[360px]">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className={`object-cover transition-transform duration-500 group-hover:scale-105 ${post.imagePosition === "top" ? "object-top" : post.imagePosition === "bottom" ? "object-bottom" : "object-center"}`}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-accent-blue/10 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-primary/30"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          )}
          <span className="absolute left-5 top-5 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase text-white shadow-sm">
            Featured
          </span>
        </div>

        <div className="flex flex-col justify-center p-6 md:p-8 lg:p-10">
          <div className="mb-5 flex flex-wrap items-center gap-2 text-sm">
            {post.tags[0] && (
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary">
                {post.tags[0]}
              </span>
            )}
            <span className="text-muted-foreground">{formatLongDate(post.date)}</span>
            <span className="text-muted-foreground" aria-hidden="true">
              /
            </span>
            <span className="text-muted-foreground">
              {post.readingTime} min read
            </span>
          </div>

          <h2 className="text-3xl font-semibold leading-tight text-foreground transition-colors group-hover:text-primary md:text-4xl">
            {post.title}
          </h2>

          <p className="mt-4 max-w-prose text-base leading-relaxed text-muted-foreground line-clamp-3">
            {post.description}
          </p>

          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary">
                {post.author.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-foreground">
                {post.author}
              </span>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary transition-transform duration-300 group-hover:translate-x-1">
              Read Article
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
