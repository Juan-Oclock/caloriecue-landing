# Macro Tracking Cheat Sheet Article and PDF Design

**Date:** 2026-08-09  
**Status:** Approved by user  
**Primary outcome:** Publish a search-focused macro reference article with a genuinely useful, email-gated printable PDF that grows CalorieCue's subscriber list and creates a natural path to app downloads.

## Why this article now

The latest analytics review shows two complementary strengths. Protein and calorie-reference posts generate the most organic reach, while downloadable tools and app-comparison pages generate disproportionately more key events. In the latest 28-day Google Analytics window, the calorie-counting cheat sheet produced 57 key events from 126 active users, and the free calorie-counter comparison produced 45 from 183. Together they accounted for 102 of the 176 key events in the Google organic landing-page report.

The selected topic combines those signals. It extends the protein/macronutrient cluster with a reusable reference tool and follows the proven email-gated conversion pattern of the existing calorie cheat sheet.

## Search ownership and cannibalization guardrails

- **Slug:** `macro-tracking-cheat-sheet`
- **H1/title:** `Macro Tracking Cheat Sheet: Protein, Carb and Fat Foods (Free PDF)`
- **Meta title:** store `Macro Tracking Cheat Sheet: Free PDF` in frontmatter; the root Next.js title template renders `Macro Tracking Cheat Sheet: Free PDF | CalorieCue` in the document.
- **Primary query:** `macro tracking cheat sheet`
- **Secondary queries:** `macro cheat sheet`, `macro food list`, `macronutrient food list`, `protein carbs and fats food list`, `printable macro tracker`, `macro chart`
- **Search intent:** informational reference plus downloadable tool.
- **Intent owned by this page:** identifying protein-, carbohydrate-, and fat-dominant foods; translating macro targets into practical servings and meals; and downloading a printable macro reference and log.
- **Intent explicitly not owned:** teaching macro counting from first principles, prescribing an individualized macro ratio, calculating TDEE, comparing calorie counting with macro counting, or listing only the highest-protein foods.
- **Canonical:** use the existing automatic self-canonical at `https://caloriecue.app/blog/macro-tracking-cheat-sheet`.
- **Cannibalization control:** keep `/blog/how-to-count-macros` as the full beginner tutorial and add a contextual link to the printable tool. Keep `/blog/calorie-counting-cheat-sheet` focused on calorie targets, portions, restaurant estimates, and calorie logging. The new article must not reuse the existing macro guide's step-by-step calculation narrative or the calorie cheat sheet's general food-calorie tables.

## Approaches considered

### 1. Food-reference chart only

This would be highly scannable and easy to print, but it would leave readers with the same practical problem: knowing the numbers without knowing how to combine them into meals.

### 2. Macro-planning workbook only

This would help a reader set targets and plan a week, but it would be used once rather than repeatedly referenced, saved, or shared. It would also overlap more heavily with the existing macro beginner guide.

### 3. Focused hybrid — selected

Lead with reusable protein, carbohydrate, and fat food charts, then show how to use those charts in a meal-building framework and printable weekly log. This preserves search value, creates a useful lead magnet, and gives CalorieCue a natural role: use the sheet to plan and the app to track.

## Editorial position

The article's clear answer is: **you do not need to classify every food as only protein, carbs, or fat. Use its dominant macro to build the meal, count all of its macros when tracking, and prioritize protein before filling the remaining calories with carbohydrates and fats that fit your preferences.**

The writing should remain practical, direct, and non-dogmatic. It must not present `40/30/30` or any other ratio as universally optimal. Examples are examples, not prescriptions. Readers with medical conditions, pregnancy, eating-disorder history, or clinician-directed nutrition plans should be told to use their professional target rather than a generic worksheet.

## Article design

Target length is roughly 2,000–2,600 words. The page should answer the query quickly, preview enough of the resource to establish trust, and avoid withholding the core answer behind the email form.

1. **Direct answer and TL;DR:** define the three energy-providing macros and the 4/4/9 calorie rule in a compact box.
2. **What the printable contains:** show the five usable sheets and place the first email form after the complete preview but before the next H2, so the article H1 never jumps directly into the form's H3.
3. **How to use a macro food list:** explain dominant macro versus complete macro profile, serving-state consistency, and why mixed foods belong in more than one column.
4. **Protein foods:** preview a concise table with serving, calories, protein, carbs, and fat; link to the protein-per-calorie chart for deeper ranking.
5. **Carbohydrate foods:** preview common whole-food and convenience options with realistic servings, fiber context, and preparation caveats.
6. **Fat foods:** preview calorie-dense fats with measured servings and call out oils, dressings, nuts, cheese, avocado, and fatty fish.
7. **Mixed foods:** explain eggs, dairy, legumes, tofu, salmon, nuts, and composite meals so the sheet does not teach false single-macro categories.
8. **Build a meal from the sheet:** use a protein anchor, add a carbohydrate based on activity/preferences, add measured fat, then add produce. Include three worked meals with transparent macro totals.
9. **Use your own macro target:** show how to fill in targets supplied by CalorieCue, a dietitian, coach, or another trusted method. Link to the TDEE calculator and existing macro guide rather than duplicating their calculation sections.
10. **Common mistakes:** double-counting mixed foods, switching raw and cooked values, treating vegetables as free, ignoring oils and sauces, and chasing exact daily perfection.
11. **Second download opportunity and CalorieCue CTA:** repeat the email form near the end, then use the tracked App Store component with the message `Plan with the sheet; track with a photo.`
12. **FAQ:** food classification, net versus total carbs, raw versus cooked values, flexible targets, whether macro tracking is required for weight loss, and what is included in the PDF.

## Printable PDF design

The deliverable is **five printable reference pages plus a cover** (six physical PDF pages). Marketing copy must describe that accurately and must not call it a five-page PDF.

### Cover

- CalorieCue branding and the title `Macro Tracking Cheat Sheet`
- Subtitle: `Protein, carb and fat food lists, meal-building examples, and a printable 7-day macro log`
- Pills for `Protein foods`, `Carb foods`, `Fat foods`, `Meal builder`, and `7-day log`

### Printable page 1 — Macro quick start

- The 4/4/9 rule: protein and carbohydrates provide about 4 kcal per gram; fat provides about 9 kcal per gram.
- Blank fields for calorie, protein, carbohydrate, and fat targets.
- One clearly labeled worked example that converts grams into calories and reconciles the daily total.
- A short `protein first, preferences second` workflow without prescribing one ratio.
- A note that alcohol supplies energy but is not one of the three tracked food macros in this sheet.

### Printable page 2 — Protein food chart

- Roughly 24–30 protein-dominant foods across poultry, seafood, meat, dairy, eggs, plant foods, and protein powders.
- Columns: food, preparation/serving, calories, protein, carbohydrates, and fat.
- A small visual marker for especially efficient protein sources, using a defined threshold rather than subjective labels.
- A note that brand, fat percentage, and preparation change the values.

### Printable page 3 — Carb and fat food charts

- Two compact sections: carbohydrate-dominant foods and fat-dominant foods.
- Realistic household servings rather than only 100-gram laboratory portions.
- Columns: food, preparation/serving, calories, protein, carbohydrates, and fat.
- A `mixed foods` strip for beans, whole eggs, Greek yogurt, salmon, tofu, nuts, and other foods that should not be treated as a single macro.

### Printable page 4 — Meal builder and smart swaps

- Four-step meal builder: protein anchor, carbohydrate, measured fat, produce/volume.
- Three worked meals: breakfast, lunch/dinner, and snack, each with auditable totals.
- Macro-focused swaps that preserve the meal's purpose, such as higher-protein dairy or a measured-fat alternative, without labeling foods as morally good or bad.
- Space for the reader to write two repeatable meals and their totals.

### Printable page 5 — Seven-day macro log

- Rows for Monday through Sunday.
- Columns for calories, protein, carbohydrates, fat, and a short notes field.
- Weekly average fields for all four totals.
- A compact reminder that weekly consistency matters more than hitting every gram exactly.
- CalorieCue CTA with the existing app mockup when available.

## Data and source policy

- Use USDA FoodData Central as the primary source for generic food-composition values.
- Use FDA or federal nutrition-label guidance for the calorie-per-gram rule and label interpretation.
- Use an authoritative nutrition reference for acceptable macronutrient distribution ranges only as background; do not turn those population ranges into individualized targets.
- Every food entry must specify its preparation state where it materially affects the values: raw, cooked, drained, skinless, fat percentage, or prepared with added oil.
- Every published food row carries reproducible FoodData Central metadata: FDC ID, exact USDA description, data type, serving grams, per-100g calories/P/C/F, and preparation state. Displayed values are derived by scaling and rounding that metadata.
- Round values for quick-reference use and include a visible note that brands and preparation methods vary.
- Avoid medical claims, promises about body-composition outcomes, and false precision.
- Verify every external link before publication and prefer primary sources over commercial nutrition blogs.

## Conversion and email flow

The new asset matches the existing calorie cheat sheet's conversion model while remaining operationally isolated from it.

1. The reader submits a validated email through `MacroCheatSheetForm`.
2. The client normalizes the address once, includes an empty honeypot field, and posts bounded JSON to `/api/macro-cheat-sheet-download` with a 15-second browser deadline.
3. The Node route validates a bounded unknown body, derives a trusted client IP, and atomically consumes HMAC-keyed IP and normalized-email windows through a service-role-only Supabase RPC before doing any PDF, contact, or email work.
4. One 12-second server request budget starts before body parsing. The rate-limit, PDF, contact, and Resend stages each receive the smaller of their own cap and the remaining request time, leaving a three-second client transport margin after the server's declared maximum.
5. The route attempts to render and attach the macro PDF, sends a branded Resend email, and adds a new address to the existing audience.
6. Every send uses Resend's supported `idempotencyKey` option. The key is an HMAC-SHA256 digest of immutable campaign/version plus normalized email only; attachment outcome is deliberately excluded, so a late link-only attempt and an attached retry deduplicate under the same key. It is stable across clock boundaries, contains no raw email, remains below Resend's 256-character limit, and uses the existing server-only rate-limit secret. Resend's rolling 24-hour idempotency retention defines the retry window and permits a fresh delivery after expiry without a fragile application-side time-bucket boundary.
7. Attached delivery includes both the attachment and a deployment-aware fallback link to `/api/macro-cheat-sheet/pdf`; render failure sends a truthfully titled link-only email.
8. The successful response includes `deliveryMode: "attached" | "link_only"`, and the form branches its success copy accordingly only after Resend accepts the email.
9. If Resend has not settled before its local/remaining deadline, the route returns retryable `503` with `deliveryStatus: "uncertain"`; the form tells the reader to check the inbox before retrying instead of claiming failure or success.
10. If the address was newly added to the audience, the client records `generate_lead` with `lead_type: macro_cheat_sheet`, `location: cheat_sheet_form`, and `content_slug: macro-tracking-cheat-sheet`.
11. The article's App Store links continue to use the existing tracked `app_store_click` behavior and blog content slug. Email contains no direct, untracked App Store CTA.

The existing calorie-cheat-sheet form and API routes remain unchanged. The second lead magnet will use its own renderer, form, routes, email copy, and tests. A larger shared lead-magnet framework is deferred until a third asset makes that abstraction worthwhile.

## Failure handling

- Malformed, non-object, or invalid JSON and invalid/missing email return `400`; over-limit bodies return `413` before downstream work.
- The Supabase-backed limiter uses 10 requests per IP per 15 minutes and 3 per normalized email per hour. A limit returns `429` plus `Retry-After`; missing IP, a secret shorter than 32 bytes, configuration/database failure, or a 1.5-second limiter timeout fails closed with retryable `503`.
- Missing Resend configuration returns `500` without exposing environment details.
- Contact lookup/creation remains non-blocking and time-bounded so newsletter enrollment cannot delay email delivery.
- PDF calls have a five-second deadline, preserve one shared underlying render, and use a 30-second circuit cooldown so a hang cannot fan out into parallel renders. If attachment rendering fails or times out, send a subject/body that promise only the fallback download link.
- The complete server request has a 12-second absolute budget. Rate limiting (1.5 seconds), PDF rendering (5 seconds), contact resolution (1 second), and Resend (8 seconds) are all capped again by the remaining server time, so sequential near-limit stages cannot exceed that total.
- A Resend deadline returns retryable `503` with an uncertain-delivery contract. A deterministic, privacy-safe idempotency key prevents a late provider success plus same-window retry from sending twice. The client waits 15 seconds, then aborts with the same announced check-inbox guidance; it cannot expire before the 12-second server maximum plus the explicit three-second transport margin.
- If email delivery fails, do not display success and do not fire the lead event.
- The PDF download route returns a stable filename, `Content-Type: application/pdf`, inline disposition, and cache headers appropriate for static content.
- Successful PDF rendering is memoized per warm server instance. The PDF declares `en-US` and page bookmarks; `@react-pdf/renderer` 4.5.1 does not expose stable semantic tagging primitives, so the HTML article remains the accessible version of the core reference tables.

## Metadata and structured data

- **Title:** `Macro Tracking Cheat Sheet: Protein, Carb and Fat Foods (Free PDF)`
- **Meta title:** raw frontmatter `Macro Tracking Cheat Sheet: Free PDF`; rendered document title `Macro Tracking Cheat Sheet: Free PDF | CalorieCue` via the root layout template.
- **Meta description:** `Download a free macro tracking cheat sheet with protein, carb and fat food lists, meal-building examples, portion sizes and a printable 7-day log.`
- **Date:** use the publication date at implementation time.
- **Tags:** `macro-tracking`, `nutrition`, `reference`, `printable`, `tools`, `protein`, `beginner`
- Include a concise `tldr`, descriptive `coverImageAlt`, and six FAQs so the existing BlogPosting, BreadcrumbList, and FAQPage generators remain complete.
- Featured image target: `public/blog/macro-tracking-cheat-sheet.webp`, 1376 × 768, with a warm editorial flat-lay of a color-coded printed macro sheet surrounded by representative protein, carbohydrate, and fat foods. The image should contain no generated headline text and should leave quiet space for the site's title overlay.

## Internal links

The new article should link to existing pages that own adjacent intents:

- `/blog/how-to-count-macros`
- `/blog/calorie-counting-vs-macro-counting`
- `/blog/calories-per-gram`
- `/blog/protein-per-calorie`
- `/blog/high-protein-low-calorie-foods`
- `/blog/high-protein-meals-under-500-calories`
- `/tdee-calculator`

Add one contextual link from `/blog/how-to-count-macros` to the new printable, and one from `/blog/calorie-counting-cheat-sheet` where it distinguishes calorie tracking from macro tracking. Do not rewrite either article's primary title, H1, or meta description.

## Files expected to change after implementation approval

- `content/blog/macro-tracking-cheat-sheet.mdx`
- `content/blog/how-to-count-macros.mdx`
- `content/blog/calorie-counting-cheat-sheet.mdx`
- `src/components/blog/MacroCheatSheetForm.tsx`
- `src/components/blog/__tests__/MacroCheatSheetForm.test.tsx`
- `src/components/blog/MDXComponents.tsx`
- `src/lib/analytics.ts`
- `src/lib/macro-cheat-sheet/data.ts`
- `src/lib/macro-cheat-sheet/MacroCheatSheetDocument.tsx`
- `src/lib/macro-cheat-sheet/delivery-budget.ts`
- `src/lib/macro-cheat-sheet/delivery-security.ts`
- `src/lib/macro-cheat-sheet/rate-limit.ts`
- `src/app/api/macro-cheat-sheet-download/route.ts`
- `src/app/api/macro-cheat-sheet-download/__tests__/route.test.ts`
- `src/app/api/macro-cheat-sheet/pdf/route.ts`
- `supabase/migrations/20260809233743_macro_cheat_sheet_rate_limits.sql`
- `.env.example`
- `docs/admin-deployment.md`
- `public/blog/macro-tracking-cheat-sheet.webp`

Existing CalorieCue logo, brand colors, and app mockup assets may be reused. Social carousel production remains out of scope until the article is implemented and approved.

## Test and verification strategy

Implementation will follow test-driven development for the new behavior.

- Component tests: invalid email, pending state, API error, successful delivery, macro-specific copy, correct endpoint, and analytics only when `leadCreated` is true.
- API tests: bounded parsing, normalization, validation, rate limiting, missing configuration, existing/new contact behavior, attachment filename, truthful link-only fallback, deployment-aware download URL, cumulative near-limit stage delays, late Resend settlement, and deterministic privacy-safe retry keys.
- Component/contract tests prove the 15-second client deadline stays beyond the 12-second server budget plus transport margin and that uncertain delivery never claims success or immediate failure.
- PDF tests: renderer returns a non-empty buffer with a PDF signature, filename is stable, and the download route sets correct headers.
- Content tests: unique slug/title intent, required metadata, FAQ frontmatter, the macro form component, tracked App Store CTA, and all expected internal links.
- Run focused tests first, then the full test suite and `npm run build`.
- Render the PDF and inspect every page for clipping, repeated headings, unreadable table density, incorrect totals, text overflow, and color-only meaning.
- Inspect the article at mobile and desktop widths; verify the canonical, title, description, cover alt text, BlogPosting schema, FAQ schema, email workflow, repeat-download URL, internal links, external links, and tracked App Store destination.

## Deployment and repository constraints

- Apply `supabase/migrations/20260809233743_macro_cheat_sheet_rate_limits.sql` before deploying code that invokes its RPC. Production is the only enabled delivery environment by default. Any explicitly approved Preview/local enablement requires its own matching non-production Supabase URL, service-role key, minimum-32-random-byte limiter secret, and test Resend key; Production privileged credentials must never be reused outside Production.
- Release gates are the focused delivery matrix, full suite, SEO verifier, static-route verifier, and production build. Roll back application code first while retaining the additive migration; remove the RPC/table only through a later reviewed migration after no deployed code depends on it.
- Work on `codex/macro-tracking-cheat-sheet` and stage only files related to this feature.
- Existing untracked social and video directories are user-owned and remain out of scope.
- Do not merge, rebase, cherry-pick, clean up, or otherwise involve the long-lived `content/draft` branch.
- Do not publish, merge, push, or deploy without explicit user approval beyond the design-commit requirement of the brainstorming workflow.
