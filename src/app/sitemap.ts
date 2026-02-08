import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://caloriecue.app", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://caloriecue.app/support", lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: "https://caloriecue.app/privacy", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: "https://caloriecue.app/terms", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
}
