"use client";

import Link from "next/link";
import Image from "next/image";
import type { BlogPostMeta } from "@/lib/blog/types";
import { getTagMeta, primaryTag } from "@/lib/blog/tag-meta";

interface FeaturedPostProps {
  post: BlogPostMeta;
  /** Extra label after the topic, e.g. "Free PDF". */
  kicker?: string;
}

function formatLongDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function FeaturedPost({ post, kicker }: FeaturedPostProps) {
  const tag = primaryTag(post.tags);
  const tagLabel = tag ? getTagMeta(tag).label : null;

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="grid overflow-hidden rounded-3xl bg-foreground text-white shadow-ink-lg transition-transform duration-300 hover:-translate-y-0.5 md:grid-cols-2">
        <div className="relative min-h-[240px] md:min-h-[320px]">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.coverImageAlt ?? post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className={`object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
                post.imagePosition === "top"
                  ? "object-top"
                  : post.imagePosition === "bottom"
                    ? "object-bottom"
                    : "object-center"
              }`}
            />
          ) : (
            <div className="h-full w-full bg-peach" aria-hidden="true" />
          )}
          {/* Fade into the ink panel on desktop, downwards on mobile */}
          <div
            className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(35,29,26,0)_55%,#231D1A_100%)] md:bg-[linear-gradient(to_right,rgba(35,29,26,0)_60%,#231D1A_100%)]"
            aria-hidden="true"
          />
          <span className="absolute left-5 top-5 rounded-full bg-primary-dark px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-white">
            Featured
          </span>
        </div>

        <div className="flex flex-col justify-center gap-4 p-7 md:p-11">
          {(tagLabel || kicker) && (
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
              {[tagLabel, kicker].filter(Boolean).join(" · ")}
            </span>
          )}
          <h2 className="text-balance text-[clamp(1.625rem,2.8vw,2.25rem)] font-extrabold leading-[1.1] tracking-[-0.02em]">
            {post.title}
          </h2>
          <p className="text-base leading-relaxed text-white/70 text-pretty line-clamp-3">
            {post.description}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <span className="text-[13px] text-white/70">
              {formatLongDate(post.date)} · {post.readingTime} min read
            </span>
            <span className="inline-flex h-[42px] items-center gap-1.5 rounded-xl bg-primary-dark px-[18px] text-sm font-bold text-white transition-colors group-hover:bg-primary-700">
              Read the guide
              <span aria-hidden="true">→</span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
