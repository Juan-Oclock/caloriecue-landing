"use client";

import Link from "next/link";
import Image from "next/image";
import FadeIn from "@/components/FadeIn";
import type { BlogPostMeta } from "@/lib/blog/types";
import { getTagMeta, primaryTag } from "@/lib/blog/tag-meta";

interface BlogPostCardEditorialProps {
  post: BlogPostMeta;
  delay?: number;
}

function formatShortDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Guide card: featured image on top, topic badge + read time, title,
 * excerpt, date + "Read →". Every card carries an image — posts without a
 * cover fall back to a branded gradient so the grid never has holes.
 */
export default function BlogPostCardEditorial({
  post,
  delay = 0,
}: BlogPostCardEditorialProps) {
  const tag = primaryTag(post.tags);
  const meta = tag ? getTagMeta(tag) : null;

  return (
    <FadeIn y={20} delay={delay} viewportMargin="-60px" className="h-full">
      <Link href={`/blog/${post.slug}`} className="group block h-full">
        <article className="flex h-full flex-col overflow-hidden rounded-[20px] border border-border bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-card-hover">
          {/* Featured image */}
          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.coverImageAlt ?? post.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={`object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
                  post.imagePosition === "top"
                    ? "object-top"
                    : post.imagePosition === "bottom"
                      ? "object-bottom"
                      : "object-center"
                }`}
              />
            ) : (
              <div
                className="flex h-full items-center justify-center bg-peach"
                aria-hidden="true"
              >
                <Image
                  src="/app-icons/120.png"
                  alt=""
                  width={56}
                  height={56}
                  className="rounded-2xl opacity-80 shadow-soft"
                />
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-3 p-6">
            <div className="flex items-center justify-between gap-2.5">
              {meta ? (
                <span
                  className="rounded-full px-2.5 py-1 text-[11px] font-bold tracking-[0.04em]"
                  style={{ background: meta.bg, color: meta.fg }}
                >
                  {meta.label}
                </span>
              ) : (
                <span />
              )}
              <span className="whitespace-nowrap text-xs text-subtle">
                {post.readingTime} min
              </span>
            </div>

            <h3 className="text-[19px] font-bold leading-[1.25] tracking-[-0.015em] text-foreground text-balance transition-colors group-hover:text-primary-dark">
              {post.title}
            </h3>

            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground text-pretty">
              {post.description}
            </p>

            <div className="mt-auto flex items-center justify-between border-t border-[#EEE8E1] pt-3.5 text-xs text-subtle">
              <time dateTime={post.date}>{formatShortDate(post.date)}</time>
              <span className="inline-flex items-center gap-1 font-semibold text-primary-dark transition-transform duration-300 group-hover:translate-x-0.5">
                Read
                <span aria-hidden="true">→</span>
              </span>
            </div>
          </div>
        </article>
      </Link>
    </FadeIn>
  );
}
