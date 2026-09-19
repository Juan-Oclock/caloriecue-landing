# Blog conversion rollout

Prepared September 19, 2026. Release date: pending publication.

Stage one covers best-free-calorie-counter-apps and protein-per-calorie. Keep the warm-dark TLDR release (commit b027d09, September 19) separate in the change log. These contextual examples are an additional intervention, not a randomized experiment.

## Baseline already collected

GA August 22–September 18 versus July 25–August 21: total users 3,028 versus 2,306; users with app_store_click 327 versus 305; calculated click-user share 10.80% versus 13.23%. These are sitewide figures, not article-specific or iPhone-specific baselines.

GSC August 20–September 16: protein-per-calorie 326 clicks; best-free-calorie-counter-apps 301 clicks. GSC clicks are not the denominator for GA conversion rates.

## GA reporting

The new buttons emit the existing app_store_click event with location=blog_product_example and the actual content_slug. Existing TLDR and inline placements remain separately identifiable. GA already collects device category and operating system; no extra personal identifiers are needed.

Verified September 19: location was already registered as event-scoped “App Store Location” (May 29). Created event-scoped “Article slug” for content_slug. Custom dimensions are not retroactive.

Created [Blog conversions — articles and placements](https://analytics.google.com/analytics/web/?authuser=2#/analysis/a371088901p519900934/edit/QiYFgW1QTH2qx2HK2I3EJQ). Article readers → clicks has page-path rows, event-name columns, Total users, and filters for /blog/ and page_view or app_store_click. The iOS readers → clicks tab adds Operating system exactly matches iOS. Use each article's page_view user count as the denominator and app_store_click user count as the numerator. Do not divide click event counts by users or use the total-row percentage as a per-article conversion rate. iOS includes iPad; it is not an iPhone-only filter.

All-device baseline, August 22–September 18: free-app article 580 readers / 118 clickers (20.34%); protein article 496 / 19 (3.83%); cheat sheet 275 / 92 (33.45%); calories-per-gram 220 / 12 (5.45%). These include all App Store placements on each page, not only the new offers. The new offers have not been published yet.

iOS baseline for the same period: free-app article 301 readers / 66 clickers (21.93%); protein article 210 / 7 (3.33%); cheat sheet 52 / 20 (38.46%); calories-per-gram 82 / 6 (7.32%). Small click counts mean short-term percentage swings are noisy.

Capture the available pre-release article/device baseline, then compare equal 28-day periods after publication. Record visitors, click users, click-user share, and attributed downloads. Low counts and changing traffic mix limit causal conclusions; these before/after results are directional.

## Official App Store campaigns

New links include utm_source=blog, utm_medium=product_example, utm_campaign=blog_conversion_v1, and utm_content=<article slug>. These distinguish URLs but DO NOT establish App Store download attribution.

Generated and verified in CalorieCue's App Store Connect campaign builder September 19. Provider token: 128187938, media type: 8, app: 6757112503. Campaigns: blog-free-apps-v1, blog-protein-v1, blog-calories-gram-v1, blog-cheat-sheet-v1. Exact generated links are recorded in src/lib/blog/app-store-campaigns.ts. New product-example and post-delivery links now preserve Apple's pt/ct/mt parameters alongside the UTM tags. Existing TLDR/sidebar/inline links are outside this campaign wiring, so Apple campaign totals measure the new offers, not all article downloads.

Apple's generator states a campaign appears only after installs by at least five individual Apple Accounts. An absent campaign is not proof of zero installs. Downloads are Apple-reported campaign attribution, not a person-level join with GA users. Campaign reporting starts after these website changes are published and qualifying installs occur.

## Continued rollout

At the user's request to continue, the local implementation now also includes a calories-per-gram product example and a calorie-counting-cheat-sheet offer shown only after successful PDF delivery. The latter emits app_store_click with location=blog_cheat_sheet_success and the article slug, and uses utm_medium=cheat_sheet_success. Both offers hide their App Store links for src=app readers. Record the actual publication date for each article; if released together, evaluate them as one rollout rather than attributing change to separate stages.

Diary-history limits currently differ between website copy and local app constants, so the new copy deliberately makes no numeric diary-history claim. GA dimensions and the report are live; website changes and campaign links remain local pending publication.
