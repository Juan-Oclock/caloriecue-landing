"use client";

import Link from "next/link";
import Image from "next/image";
import FadeIn from "@/components/FadeIn";
import type { BlogPostMeta } from "@/lib/blog/types";

interface BlogPostCardProps {
  post: BlogPostMeta;
  delay?: number;
}

export default function BlogPostCard({ post, delay = 0 }: BlogPostCardProps) {
  return (
    <FadeIn y={30} delay={delay} viewportMargin="-50px">
      <Link href={`/blog/${post.slug}`} className="group block h-full">
        <article className="h-full bg-white rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1 hover:border-gray-200">
          {/* Cover image or gradient fallback */}
          <div className="relative h-48 overflow-hidden">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 via-primary/5 to-accent-blue/10 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-primary/30"
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
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col gap-3">
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/8 text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h3 className="text-lg font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {post.description}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-2">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
              <span aria-hidden="true">&middot;</span>
              <span>{post.readingTime} min read</span>
            </div>
          </div>
        </article>
      </Link>
    </FadeIn>
  );
}
