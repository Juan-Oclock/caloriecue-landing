"use client";

import Link from "next/link";
import Image from "next/image";
import FadeIn from "@/components/FadeIn";
import type { BlogPostMeta } from "@/lib/blog/types";

interface BlogPostCardOverlayProps {
  post: BlogPostMeta;
  delay?: number;
}

export default function BlogPostCardOverlay({
  post,
  delay = 0,
}: BlogPostCardOverlayProps) {
  return (
    <FadeIn y={30} delay={delay} viewportMargin="-50px">
      <Link href={`/blog/${post.slug}`} className="group block">
        <article className="relative h-72 md:h-80 lg:h-96 rounded-2xl overflow-hidden">
          {/* Background image */}
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-transform duration-500 group-hover:scale-105 ${post.imagePosition === "top" ? "object-top" : post.imagePosition === "bottom" ? "object-bottom" : "object-center"}`}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-accent-blue/20 transition-transform duration-500 group-hover:scale-105" />
          )}

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

          {/* Category badge - top left */}
          {post.tags[0] && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
              {post.tags[0]}
            </span>
          )}

          {/* Content overlay - bottom */}
          <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col gap-3">
            {/* Title */}
            <h3 className="text-lg md:text-xl font-bold text-white leading-snug line-clamp-2">
              {post.title}
            </h3>

            {/* Description */}
            <p className="text-white/70 text-sm leading-relaxed line-clamp-2">
              {post.description}
            </p>

            {/* Bottom meta row */}
            <div className="flex items-center justify-between pt-3 border-t border-white/20">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/20 text-white font-semibold text-xs flex items-center justify-center">
                  {post.author.charAt(0).toUpperCase()}
                </div>
                <span className="text-white/80 text-sm">{post.author}</span>
              </div>
              <div className="flex items-center gap-3 text-white/60 text-xs">
                <time dateTime={post.date}>
                  {new Date(post.date + "T00:00:00Z").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    timeZone: "UTC",
                  })}
                </time>
                <span>{post.readingTime} min</span>
                <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
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
          </div>
        </article>
      </Link>
    </FadeIn>
  );
}
