"use client";

import Link from "next/link";
import Image from "next/image";
import FadeIn from "@/components/FadeIn";
import type { BlogPostMeta } from "@/lib/blog/types";

interface BlogPostCardEditorialProps {
  post: BlogPostMeta;
  delay?: number;
}

function formatShortDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function BlogPostCardEditorial({
  post,
  delay = 0,
}: BlogPostCardEditorialProps) {
  return (
    <FadeIn y={24} delay={delay} viewportMargin="-80px">
      <Link href={`/blog/${post.slug}`} className="group block h-full">
        <article className="h-full overflow-hidden rounded-lg border border-border/80 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-card-hover">
          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
                  post.imagePosition === "top"
                    ? "object-top"
                    : post.imagePosition === "bottom"
                      ? "object-bottom"
                      : "object-center"
                }`}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-50 via-white to-muted">
                <svg
                  className="h-12 w-12 text-primary/30"
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
            {post.tags[0] && (
              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur">
                {post.tags[0]}
              </span>
            )}
          </div>

          <div className="flex min-h-[230px] flex-col p-5 md:p-6">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <time dateTime={post.date}>{formatShortDate(post.date)}</time>
              <span aria-hidden="true">/</span>
              <span>{post.readingTime} min read</span>
            </div>

            <h3 className="text-xl font-semibold leading-snug text-foreground transition-colors line-clamp-2 group-hover:text-primary">
              {post.title}
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
              {post.description}
            </p>

            <div className="mt-auto flex items-center justify-between gap-4 pt-6">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary">
                  {post.author.charAt(0).toUpperCase()}
                </span>
                <span className="truncate text-sm font-medium text-foreground">
                  {post.author}
                </span>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary transition-transform duration-300 group-hover:translate-x-1">
                Read
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
    </FadeIn>
  );
}
