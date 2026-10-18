# Cronometer vs MyFitnessPal — editorial and release notes

Prepared October 18, 2026. Review completed; user authorized committing and pushing the implementation. Production deployment status is separate from the local validation recorded below.

## Editorial approach

- Primary intent: “cronometer vs myfitnesspal” with a free-plan decision angle.
- Selected from the October 18 GSC/GA/Ahrefs content audit. Conversion potential is a hypothesis based on product-choice intent, not a promised conversion rate.
- Recommend around barcode lookup, protein targets, repeated meals and homemade recipes. Explicitly credit MyFitnessPal's free web-recipe import option.
- Documentation comparison, not a hands-on product test. No invented accuracy, speed, conversion or nutrient-database benchmarks.
- Dates and plan names are explicit. No regional subscription prices, exact nutrient counts, or unsupported feature availability assumptions.
- Nutrition calculations use fictional inputs and are marked as examples, not targets.
- CalorieCue's role as publisher and competing product is disclosed.

## Facts checked against official sources

Current source pages were reviewed using Chrome and web research on October 18, 2026. These are published-plan checks, not checks inside logged-in competitor accounts. Features can vary by app version, region and language.

| Source | Used to establish |
|---|---|
| [Cronometer plans](https://cronometer.com/gold/) | Basic barcode lookup, custom targets and detailed tracking; Gold photo logging and recipe importing |
| [Cronometer fixed targets](https://support.cronometer.com/hc/en-us/articles/33231653421588-Mobile-Fixed-Targets) | Entering macro targets in grams |
| [Cronometer logging shortcuts](https://cronometer.com/blog/log-food-fast/) | Free custom meals and copy/paste; do not confuse these with paid recurring scheduling |
| [Cronometer recipe importer](https://cronometer.com/blog/recipe-importer/) | URL recipe import requires Gold |
| [MyFitnessPal plans](https://support.myfitnesspal.com/hc/en-us/articles/34889191368077-The-difference-between-Free-Premium-and-Premium) | Free/Premium/Premium+ distinctions |
| [MyFitnessPal free guide](https://support.myfitnesspal.com/hc/en-us/articles/15457546881805-What-is-included-in-the-free-version) | Free calorie/macro logging, meals, recipes, Add From Web and percentage targets |
| [MyFitnessPal barcode guide](https://support.myfitnesspal.com/hc/en-us/articles/360032624771-How-to-use-the-Barcode-Scanner) | Barcode scanner requires Premium |
| [MyFitnessPal Premium features](https://support.myfitnesspal.com/hc/en-us/articles/360032625951-MyFitnessPal-Premium-features) | Direct gram goals, barcode and Meal Scan are paid features |
| [MyFitnessPal Meal Scan](https://support.myfitnesspal.com/hc/en-us/articles/360045761612-How-to-use-the-Meal-Scanner) | Premium requirement and platform/version/language restrictions |
| [CalorieCue pricing](https://caloriecue.app/#pricing) | Ongoing 3 free photo scans and 3 AI Coach messages per day; optional Premium |

## Assets

- Built-in image generation, new-image mode, opaque background; editorial illustration rather than product UI.
- Desktop: `public/blog/cronometer-vs-myfitnesspal.webp` (1200 × 630, matching the template's structured-data image dimensions).
- Mobile: `public/blog/cronometer-vs-myfitnesspal-mobile.webp` (768 × 512).
- Reused real CalorieCue dashboard via `BlogProductExample`, with its existing Premium-account caption.
- Descriptive cover alt text, responsive variants and Open Graph image use the existing blog template.

Generation prompt:

> Use case: ads-marketing. Asset type: editorial blog cover for CalorieCue's article 'Cronometer vs MyFitnessPal: Which Free Version Should You Choose?'. Create a polished warm editorial still-life illustration, landscape 1536x1024. Two substantial matte paper cards standing side-by-side on an ivory kitchen tabletop, left card apricot with the exact dark charcoal word 'Cronometer', right card soft muted blue with the exact dark charcoal word 'MyFitnessPal'. A small simple charcoal 'vs' between cards. In the foreground an attractive realistic bowl of yogurt with berries, a spoon, a plain small food carton with a simple decorative barcode, and a blank recipe notebook. Refined tactile 3D / studio-photography hybrid, soft daylight, gentle shadows, lots of breathing space. Warm cream background matches a premium nutrition editorial. Keep all lettering and focal objects inside the center 75% so a wide 16:9 crop works. No additional text, no numbers, no logos, no phones, no fake app screens, no health claims, no watermark. Brand names are plain typeset comparison labels, not official logos. Readable accurate spelling. This is an illustrative editorial scene, not evidence of product testing.

## Tracking and SEO

- Route: `/blog/cronometer-vs-myfitnesspal`.
- Contextual CTA uses the existing consent-aware tracking component, `location=blog_product_example`, `content_slug=cronometer-vs-myfitnesspal`.
- Apple campaign: `ct=blog-cronometer-mfp-v1`, existing provider token `pt=128187938`, `mt=8`.
- UTM values: `utm_source=blog`, `utm_medium=product_example`, `utm_campaign=blog_conversion_v1`, `utm_content=cronometer-vs-myfitnesspal`.
- Existing TL;DR and sidebar CTA measurement remains active. Apple campaign parameters above apply to the contextual product CTA.
- GA clicks are outbound intent, not installs. Verify installation attribution separately in App Store Connect after publication and sufficient qualifying traffic; this work does not establish live conversions.
- CTA remains hidden for `?src=app` readers through the existing shared component.
- Dedicated meta title/description, canonical, Article and six-question FAQ structured data through the existing template; automatic blog listing and sitemap inclusion.
- Incoming links added from best-free-calorie-counter-apps, cronometer-vs-fatsecret and fatsecret-vs-myfitnesspal.
- `published: true` makes the article available to the local renderer. It becomes public only if this change is deployed.

## Review checklist

- Targeted tracking, blog-loader and analytics tests: 33 passed.
- Production build, TypeScript/lint stage, static-route verification and prebuilt-PDF verification passed.
- Chrome desktop and 390 × 844 mobile review passed: cover, readable typography, horizontally scrollable table and contextual product CTA. No page-wide horizontal overflow; no browser console errors captured.
- Verified seven internal article destinations, both cover dimensions, canonical URL, BlogPosting/FAQ structured data and sitemap inclusion. Verified the client-rendered CTA's Apple/UTM parameters in Chrome.
- Local review screenshots (not versioned): `output/blog-research/cronometer-vs-myfitnesspal/desktop-review.jpg` and `mobile-cta.jpg`.
- Local production preview: http://127.0.0.1:3000/blog/cronometer-vs-myfitnesspal (server must remain running).
- Build emitted the existing stale Browserslist-data warning; it did not fail validation.
- User approved commit and push after reviewing the preview. No analytics-account configuration changes were made.
