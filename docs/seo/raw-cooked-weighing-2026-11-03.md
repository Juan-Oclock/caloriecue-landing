# Raw-versus-cooked weighing guide

Created November 3, 2026 after the user approved the topic and requested article creation.

- Title: Should You Weigh Food Raw or Cooked? A Practical Tracking Guide
- Intended URL: `/blog/weigh-food-raw-or-cooked`
- Status: complete unpublished draft (`published: false`).
- Primary query: `weigh food raw or cooked`.
- Supporting intent: cooked rice versus dry weight, pasta serving basis, cooked chicken logging, batch portions.
- Approximately 2,140 words, three tables, six FAQ metadata entries, and eight contextual internal links. Existing template supplies structured metadata when published.
- Keep the focus on the weighing decision. Existing chicken/shrimp tables own food-specific nutrition; the homemade-food page owns the full recipe calculator.

## Evidence and calculations

Four food records were extracted from the official USDA SR Legacy April 2018 CSV archive already downloaded during the ebook audit. `output/blog-research/raw-cooked/usda-reference-values.json` retains IDs, descriptions, publication dates and kcal/100g values. These are historical reference averages, not new measurements.

The rice records are 168877 (raw, 365 kcal/100g) and 168878 (cooked, 130). Chicken records are 171077 (raw skinless boneless breast, 120) and 171477 (roasted breast meat only, 165). The article explicitly avoids treating these separate records as paired cooking experiments.

USDA's cooking-yield report and Food Buying Guide support the explanation of moisture/fat changes and variable yields. FDA label guidance supports scaling calories to the stated serving. Sources are linked in context and in the article's source list.

All batch weights, the 200-calorie/56g pasta label, mixed-dish calories and the 75% yield are labeled teaching assumptions. No kitchen experiment or real label testing is claimed. Oil retention, discarded drippings, draining, uneven ingredient distribution and edible weight are addressed.

Run `python3 output/blog-research/raw-cooked/verify-calculations.py` to reproduce 13 displayed calorie calculations and two yield calculations. Results are in `calculation-audit.json`.

## Artwork and review

Original cover generated with the built-in imagegen tool, then resized/encoded using Sharp: `public/blog/weigh-food-raw-or-cooked.webp` (1200 × 630, approximately 140 KB). The full prompt is in `output/blog-research/raw-cooked/featured-image-prompt.md`. Alt text and article disclosure identify the image as illustrative, not a portion measurement.

The draft compiles through the existing MDX plugins. A standalone reading preview reuses the established draft-preview approach, without analytics. It is not the full production template. Rebuild it with:

`TSX_TSCONFIG_PATH=scripts/tsconfig.pdfs.json node --import tsx output/blog-research/raw-cooked/render-preview.mts`

Serve with `python3 output/blog-research/raw-cooked/serve-preview.py` at `http://127.0.0.1:3083/`.

Verified: desktop and 390px mobile reading preview; cover loads; tables scroll inside their containers without page-wide horizontal overflow; all eight internal article targets exist. `npm run build` and its static-route/PDF checks pass. Draft is excluded from the public article routes. No public publication or newsletter sending performed.

## On publication

Set the publication date to the release date and `published: true`. Add contextual incoming links from the chicken guide's weighing section, the homemade-food guide's raw/cooked FAQ discussion and the 2,000-calorie article's portion notes. Check the actual production article, sitemap, feed and metadata after enabling it. Use the existing tracked AppStoreLink; measure outbound clicks separately from installs.
