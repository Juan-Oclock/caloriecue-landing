import { getRelatedPosts } from "@/lib/blog";
import BlogPostCard from "./BlogPostCard";

interface RelatedPostsProps {
  currentSlug: string;
}

export default function RelatedPosts({ currentSlug }: RelatedPostsProps) {
  const related = getRelatedPosts(currentSlug, 3);

  if (related.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-border">
      <h2 className="text-2xl font-semibold text-foreground mb-8">
        Related Articles
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {related.map((post, i) => (
          <BlogPostCard key={post.slug} post={post} delay={i * 0.1} />
        ))}
      </div>
    </section>
  );
}
