// Generated in CalorieCue's App Store Connect campaign builder on 2026-09-19.
const campaignLinks: Record<string, string> = {
  "best-free-calorie-counter-apps": "https://apps.apple.com/app/apple-store/id6757112503?pt=128187938&ct=blog-free-apps-v1&mt=8",
  "protein-per-calorie": "https://apps.apple.com/app/apple-store/id6757112503?pt=128187938&ct=blog-protein-v1&mt=8",
  "calories-per-gram": "https://apps.apple.com/app/apple-store/id6757112503?pt=128187938&ct=blog-calories-gram-v1&mt=8",
  "calorie-counting-cheat-sheet": "https://apps.apple.com/app/apple-store/id6757112503?pt=128187938&ct=blog-cheat-sheet-v1&mt=8",
};

export function blogCampaignUrl(contentSlug: string, medium: string): string {
  const url = new URL(campaignLinks[contentSlug] ?? "https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503");
  url.searchParams.set("utm_source", "blog");
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_campaign", "blog_conversion_v1");
  url.searchParams.set("utm_content", contentSlug);
  return url.toString();
}
