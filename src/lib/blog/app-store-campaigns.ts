// The first four links were generated in App Store Connect on 2026-09-19.
// The comparison campaigns reuse that verified provider token with unique ct values,
// following Apple's campaign-link guidance (checked 2026-10-09).
const campaignLinks: Record<string, string> = {
  "best-free-calorie-counter-apps": "https://apps.apple.com/app/apple-store/id6757112503?pt=128187938&ct=blog-free-apps-v1&mt=8",
  "protein-per-calorie": "https://apps.apple.com/app/apple-store/id6757112503?pt=128187938&ct=blog-protein-v1&mt=8",
  "calories-per-gram": "https://apps.apple.com/app/apple-store/id6757112503?pt=128187938&ct=blog-calories-gram-v1&mt=8",
  "calorie-counting-cheat-sheet": "https://apps.apple.com/app/apple-store/id6757112503?pt=128187938&ct=blog-cheat-sheet-v1&mt=8",
  "cronometer-vs-fatsecret": "https://apps.apple.com/app/apple-store/id6757112503?pt=128187938&ct=blog-cronometer-fatsecret-v1&mt=8",
  "cronometer-vs-myfitnesspal": "https://apps.apple.com/app/apple-store/id6757112503?pt=128187938&ct=blog-cronometer-mfp-v1&mt=8",
};

export function blogCampaignUrl(contentSlug: string, medium: string): string {
  const url = new URL(campaignLinks[contentSlug] ?? "https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503");
  url.searchParams.set("utm_source", "blog");
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_campaign", "blog_conversion_v1");
  url.searchParams.set("utm_content", contentSlug);
  return url.toString();
}
