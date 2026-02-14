import Link from "next/link";
import { FadeIn } from "@/components";
import { BlogPostCard } from "@/components/blog";
import { getAllPosts } from "@/lib/blog";

export default function BlogPreview() {
  const posts = getAllPosts().slice(0, 3);

  if (posts.length === 0) return null;

  return (
    <section className="py-24 md:py-32 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-16">
          <span className="inline-block text-primary font-medium text-sm mb-3 uppercase tracking-wider">
            Blog
          </span>
          <h2 className="text-display-mobile md:text-display text-foreground mb-4">
            Latest from the Blog
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tips and insights to help you eat smarter and track better.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <BlogPostCard key={post.slug} post={post} delay={i * 0.1} />
          ))}
        </div>

        <FadeIn className="text-center mt-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
          >
            View All Posts
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
