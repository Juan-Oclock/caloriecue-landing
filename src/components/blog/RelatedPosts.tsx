import Link from "next/link";
import { getRelatedPosts } from "@/lib/blog";
import BlogPostCardEditorial from "./BlogPostCardEditorial";

interface RelatedPostsProps {
  currentSlug: string;
}

export default function RelatedPosts({ currentSlug }: RelatedPostsProps) {
  const related = getRelatedPosts(currentSlug, 3);

  if (related.length === 0) return null;

  return (
    <section className="border-t border-border bg-surface" aria-labelledby="related-heading">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-16 md:px-8 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="related-heading" className="text-display text-foreground">
            Keep reading.
          </h2>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-primary-dark transition-colors hover:text-primary-700"
          >
            All guides
            <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {related.map((post, i) => (
            <BlogPostCardEditorial key={post.slug} post={post} delay={i * 0.06} />
          ))}
        </div>
      </div>
    </section>
  );
}
