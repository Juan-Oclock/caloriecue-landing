import type { Metadata } from "next";
import { Navigation, Footer } from "@/components";
import { BlogListingClient } from "@/components/blog";
import { getAllPosts, getAllTags } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Tips, guides, and insights on nutrition tracking, healthy eating, and AI-powered calorie counting from the CalorieCue team.",
  keywords: [
    "calorie tracking blog",
    "nutrition tips",
    "healthy eating guides",
    "AI calorie counting",
    "weight loss tips",
    "meal tracking advice",
    "food logging",
    "diet and nutrition",
  ],
  alternates: {
    canonical: "https://caloriecue.app/blog",
  },
  openGraph: {
    title: "Blog | CalorieCue",
    description:
      "Tips, guides, and insights on nutrition tracking, healthy eating, and AI-powered calorie counting.",
    url: "https://caloriecue.app/blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | CalorieCue",
    description:
      "Tips, guides, and insights on nutrition tracking, healthy eating, and AI-powered calorie counting.",
  },
};

export default function BlogPage() {
  const allPosts = getAllPosts();
  const tags = getAllTags();

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "CalorieCue Blog",
    description:
      "Tips, guides, and insights on nutrition tracking, healthy eating, and AI-powered calorie counting.",
    url: "https://caloriecue.app/blog",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: allPosts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://caloriecue.app/blog/${post.slug}`,
        name: post.title,
        image: post.coverImage
          ? `https://caloriecue.app${post.coverImage}`
          : undefined,
      })),
    },
  };

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <BlogListingClient posts={allPosts} tags={tags} />
      <Footer />
    </main>
  );
}
