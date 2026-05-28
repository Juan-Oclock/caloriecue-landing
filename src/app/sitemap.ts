import { MetadataRoute } from "next";
import { getAllPosts, GOAL_TAGS } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `https://caloriecue.app/blog/${post.slug}`,
    lastModified: new Date(post.dateModified ?? post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const goalTagEntries: MetadataRoute.Sitemap = GOAL_TAGS.map((tag) => ({
    url: `https://caloriecue.app/blog/tag/${tag}`,
    lastModified: posts.length > 0 ? new Date(posts[0].date) : new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    { url: "https://caloriecue.app", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://caloriecue.app/tdee-calculator", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://caloriecue.app/blog", lastModified: posts.length > 0 ? new Date(posts[0].date) : new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...goalTagEntries,
    ...blogEntries,
    { url: "https://caloriecue.app/support", lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: "https://caloriecue.app/privacy", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: "https://caloriecue.app/terms", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
}
