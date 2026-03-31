"use client";

import Link from "next/link";
import Image from "next/image";
import type { BlogPostMeta } from "@/lib/blog/types";

interface FeaturedPostProps {
  post: BlogPostMeta;
}

export default function FeaturedPost({ post }: FeaturedPostProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="grid md:grid-cols-2 rounded-2xl overflow-hidden border border-border bg-white transition-shadow duration-300 hover:shadow-soft-lg">
        {/* Cover image */}
        <div className="relative h-64 md:h-full min-h-[280px] overflow-hidden">
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
          {/* FEATURED badge */}
          <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-full">
            Featured
          </span>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 flex flex-col justify-center gap-4">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {post.tags[0] && (
              <span className="px-2.5 py-0.5 rounded-full bg-primary/8 text-primary text-xs font-medium">
                {post.tags[0]}
              </span>
            )}
            <span className="text-muted-foreground">
              {new Date(post.date + "T00:00:00Z").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
              })}
            </span>
            <span className="text-muted-foreground" aria-hidden="true">
              &middot;
            </span>
            <span className="text-muted-foreground">
              {post.readingTime} min read
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
            {post.title}
          </h2>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed line-clamp-3">
            {post.description}
          </p>

          {/* Author + CTA */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center">
                {post.author.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-foreground">
                {post.author}
              </span>
            </div>
            <span className="text-primary font-medium text-sm group-hover:underline">
              Read Article &rarr;
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
