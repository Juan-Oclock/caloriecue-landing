import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const SITE_URL = "https://caloriecue.app";
const STATIC_LAST_MODIFIED = {
  home: new Date("2026-07-06T00:00:00.000Z"),
  tdeeCalculator: new Date("2026-07-02T00:00:00.000Z"),
  support: new Date("2026-06-01T00:00:00.000Z"),
  privacy: new Date("2026-06-01T00:00:00.000Z"),
  terms: new Date("2026-06-01T00:00:00.000Z"),
};

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.dateModified ?? post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Posts are sorted by publication date, so a refresh of an older guide
  // may be newer than the first post in the list.
  const latestPostDate = posts.length > 0
    ? new Date(Math.max(...posts.map((post) => new Date(post.dateModified ?? post.date).getTime())))
    : STATIC_LAST_MODIFIED.home;

  return [
    { url: SITE_URL, lastModified: STATIC_LAST_MODIFIED.home, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/tdee-calculator`, lastModified: STATIC_LAST_MODIFIED.tdeeCalculator, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: latestPostDate, changeFrequency: "weekly", priority: 0.8 },
    ...blogEntries,
    { url: `${SITE_URL}/support`, lastModified: STATIC_LAST_MODIFIED.support, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/privacy`, lastModified: STATIC_LAST_MODIFIED.privacy, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/terms`, lastModified: STATIC_LAST_MODIFIED.terms, changeFrequency: "monthly", priority: 0.5 },
  ];
}
