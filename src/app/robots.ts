import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/auth/", "/welcome", "/unsubscribe"] },
    sitemap: "https://caloriecue.app/sitemap.xml",
  };
}
