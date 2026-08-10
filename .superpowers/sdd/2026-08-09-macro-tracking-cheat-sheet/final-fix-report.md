# Final whole-branch hardening report

Date: 2026-08-10 (Asia/Manila)

Status: **DONE.** The final hardening brief was implemented and verified in the isolated `codex/macro-tracking-cheat-sheet` worktree from sealed base `dd60fbacffbe57d839f7ed4ebe4724252509c8e0`.

## Scope and local commits

- `601e482` — `fix: audit macro reference data and PDF rendering`
- `a4790ec` — `fix: harden macro cheat sheet delivery`
- The design/plan update and this report are in this file's containing documentation commit; its exact hash is recorded in the final handoff rather than made self-referential here.
- No push, merge, PR, deployment, production email, remote Supabase migration, or publication was performed. `content/draft` was not involved.

## USDA FoodData Central audit

Only official FoodData Central downloadable archives were used:

- `https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_json_2018-04.zip`
- `https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_foundation_food_json_2026-04-30.zip` (with the 2024-04-18 foundation archive retained as a cross-check)
- `https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_survey_food_json_2024-10-31.zip`
- The official 2021-04-28 CSV and 2021-10-28 JSON branded archives were checked only to resolve the historical whey citation.

The audit covered every unique source record used by the published tables, not only the four reviewer examples. Coverage by table:

- Protein records: FDC `171477`, `171496`, `172851`, `171794`, `168635`, `168250`, `334194`, `171990`, `175177`, `175180`, `175168`, `173424`, `172183`, `330137`, `170903`, `328841`, `171269`, `2710745`, `172475`, `174272`, `168147`, `172421`, `173735`, `168411`, and `2707451`.
- Carbohydrate records: FDC `168878`, `168875`, `173904`, `168917`, `170030`, `168483`, `172688`, `175051`, `2707823`, `169737`, `169700`, `173757`, `173735`, `173944`, `171688`, `171711`, `169999`, `170105`, and `173913`.
- Fat records: FDC `171413`, `173410`, `171705`, `170567`, `170187`, `172430`, `172470`, `170554`, `169414`, `170189`, `171009`, `173414`, and `170273`.
- Mixed-food rows reuse the exact canonical objects rather than restating numbers. Worked meals use those audited rounded values plus the previously verified broccoli record FDC `169967`.

Every `MacroFood` now carries a typed source contract with FDC ID, exact description, data type, serving grams, per-100-g calories/P/C/F, and preparation state. Production values are always computed as `Math.round(per100g * servingGrams / 100)`. Tests assert that contract and calculation for every published row.

### Corrected source-to-serving results

The following table records all confirmed scaling/state corrections. `Per 100 g` and `Rounded serving` are `kcal / protein / carbohydrate / fat`.

| Food | FDC | Serving g | Per 100 g | Rounded serving |
|---|---:|---:|---|---|
| Turkey breast | 171496 | 113.398 | 147 / 30.1 / 0 / 2.08 | 167 / 34 / 0 / 2 |
| Ground turkey, 93% | 172851 | 113.398 | 213 / 27.1 / 0 / 11.6 | 242 / 31 / 0 / 13 |
| Ground beef, 90% | 171794 | 113.398 | 230 / 28.4 / 0 / 12 | 261 / 32 / 0 / 14 |
| Top sirloin | 168635 | 113.398 | 188 / 30.3 / 0 / 6.55 | 213 / 34 / 0 / 7 |
| Pork tenderloin | 168250 | 113.398 | 143 / 26.2 / 0 / 3.51 | 162 / 30 / 0 / 4 |
| Light tuna | 334194 | 113.398 | 90 / 19 / 0.08 / 0.94 | 102 / 22 / 0 / 1 |
| Pacific cod | 171990 | 113.398 | 85 / 18.7 / 0 / 0.5 | 96 / 21 / 0 / 1 |
| Shrimp | 175180 | 113.398 | 99 / 24 / 0.2 / 0.28 | 112 / 27 / 0 / 0 |
| Greek yogurt, nonfat | 330137 | 227 | 61 / 10.3 / 3.64 / 0.37 | 138 / 23 / 8 / 1 |
| Greek yogurt, lowfat | 170903 | 227 | 73 / 9.95 / 3.94 / 1.92 | 166 / 23 / 9 / 4 |
| Cottage cheese, 2% | 328841 | 220 | 84 / 11 / 4.31 / 2.3 | 185 / 24 / 9 / 5 |
| Generic protein powder, NFS | 2710745 | 31 | 352 / 78.1 / 6.25 / 1.56 | 109 / 24 / 2 / 0 |
| Firm tofu | 172475 | 113.398 | 144 / 17.3 / 2.78 / 8.72 | 163 / 20 / 3 / 10 |
| Tempeh | 174272 | 113.398 | 192 / 20.3 / 7.64 / 10.8 | 218 / 23 / 9 / 12 |
| Textured vegetable protein | 2707451 | 48 | 366 / 51.1 / 32.9 / 3.33 | 176 / 25 / 16 / 2 |
| White potato | 170030 | 173 | 95 / 2.63 / 21.4 / 0.13 | 164 / 5 / 37 / 0 |
| Plain bagel | 175051 | 105 | 275 / 10.5 / 53.4 / 1.6 | 289 / 11 / 56 / 2 |
| Corn tortilla | 2707823 | 52 | 218 / 5.7 / 44.6 / 2.85 | 113 / 3 / 23 / 1 |
| Green peas | 170105 | 160 | 78 / 5.15 / 14.3 / 0.27 | 125 / 8 / 23 / 0 |
| Puffed wheat cereal | 173913 | 12 | 364 / 14.7 / 79.6 / 1.2 | 44 / 2 / 10 / 0 |
| Avocado | 171705 | 100.5 | 160 / 2 / 8.53 / 14.7 | 161 / 2 / 9 / 15 |
| Walnuts | 170187 | 28.35 | 654 / 15.2 / 13.7 / 65.2 | 185 / 4 / 4 / 18 |
| Chia seeds | 170554 | 28 | 486 / 16.5 / 42.1 / 30.7 | 136 / 5 / 12 / 9 |
| Flaxseed | 169414 | 14 | 534 / 18.3 / 28.9 / 42.2 | 75 / 3 / 4 / 6 |
| Cheddar | 173414 | 28.35 | 403 / 22.9 / 3.37 / 33.3 | 114 / 6 / 1 / 9 |

Reviewer examples are therefore locked exactly as follows:

- Tofu FDC `172475`, 4 oz: `163 kcal / 20 P / 3 C / 10 F`.
- Tuna FDC `334194`, 4 oz: `102 / 22 / 0 / 1`.
- TVP FDC `2707451`, 48 g: `176 / 25 / 16 / 2`.
- Tempeh FDC `174272`, 4 oz: `218 / 23 / 9 / 12`, visibly labeled `USDA preparation unspecified` rather than cooked.

The historical branded whey FDC `1844993` description was found in the official 2021 archive, but a reproducible current nutrient record was unavailable. After a bounded archive search, it was replaced instead of guessed: current generic Survey (FNDDS) FDC `2710745`, `Nutritional powder mix, protein, NFS`, one 31 g scoop, yields `109 / 24 / 2 / 0`. A dedicated exact provenance fixture protects that choice.

The article previews and shared PDF now agree. Final worked meal totals are:

- Greek-yogurt breakfast: `442 / 31 / 62 / 8`.
- Chicken-rice lunch/dinner: `487 / 43 / 56 / 10`.
- Cottage-cheese snack: `376 / 28 / 38 / 13`.

## Supabase-backed abuse control

The Supabase skill was followed before implementation. Current official references checked on 2026-08-09/10 included the Supabase changelog, database RLS guidance, API security guidance, and JavaScript RPC reference:

- `https://supabase.com/changelog`
- `https://supabase.com/docs/guides/database/postgres/row-level-security`
- `https://supabase.com/docs/guides/api/securing-your-api`
- `https://supabase.com/docs/reference/javascript/rpc`

Migration `supabase/migrations/20260809233743_macro_cheat_sheet_rate_limits.sql` was generated with `supabase migration new`; it was never applied remotely.

Design and security properties:

- One fixed-window table keyed only by `(bucket_type, key_hash, window_start)`; no raw email or IP is stored.
- Server-side domain-separated HMAC-SHA256 keys use `MACRO_CHEAT_SHEET_RATE_LIMIT_SECRET`.
- Fixed limits are 10/IP/900 seconds and 3/normalized-email/3,600 seconds.
- RLS and FORCE RLS are enabled; public, anon, and authenticated privileges are revoked; only `service_role` can access the table or RPC.
- The RPC is `SECURITY INVOKER`, uses fixed `search_path = ''`, validates all arguments, sorts two advisory transaction locks to prevent deadlock, checks both buckets atomically, and returns a bounded retry interval.
- An indexed opportunistic deletion removes windows older than two days.
- The server client disables auth persistence, refresh, and URL-session detection. The service key never enters client code.
- The application gives the RPC 1.5 seconds and fails closed on absent secret/config, Supabase error, malformed result, or deadline.

Fresh isolated validation used local image `public.ecr.aws/supabase/postgres:17.6.1.104`; the disposable container was removed afterward. Evidence:

- `anon` and `authenticated`: table access `false`, RPC execute `false`.
- `service_role`: table access `true`, RPC execute `true`, `rolbypassrls=true`.
- Table `relrowsecurity=true`, `relforcerowsecurity=true`.
- Function `prosecdef=false` and `proconfig={"search_path=\"\""}`.
- With IP limit 2 and email limit 3, sequential results were `allowed=true`, `allowed=true`, then `allowed=false` with `retry_after_seconds=735` at that instant.
- Stored rows were exactly one `email` and one `ip` row, each key length 64 and count 2.
- A seeded three-day-old row was removed; `expired_rows_remaining=0`.

## Endpoint, fallback, and deadlines

The public POST route now:

- rejects `Content-Length` or streamed bodies above 4,096 bytes with `413`;
- parses bounded text into `unknown`, returning `400` for malformed JSON, `null`, arrays, non-object roots, invalid email types, invalid addresses, email over 254 characters, or a filled honeypot;
- normalizes email exactly once with trim/lowercase;
- selects the first valid bounded IP from Vercel-forwarded, forwarded-for, then real-IP headers and fails closed with retryable `503` if none exists;
- performs rate limiting before PDF, contact, or Resend work;
- returns `429` plus the database `Retry-After` when either window is exhausted;
- gives PDF rendering 5 seconds, Resend 8 seconds, and the browser request 10 seconds;
- returns `deliveryMode: "attached" | "link_only"` only after Resend accepts delivery;
- uses attachment-specific subject/body only when a PDF exists, and a link-only subject/body with no attachment claim when rendering fails;
- contains no direct untracked App Store CTA in email. The article's existing tracked React CTA remains unchanged.

The PDF coordinator caches successful output, shares one underlying in-flight render, applies per-caller deadlines, opens a 30-second circuit after timeout/failure, observes late rejection, and never starts a parallel renderer while the original render is unresolved. If that render eventually succeeds, it fills the cache and recovers callers.

The form serializes the already-normalized address, sends the honeypot, aborts after 10 seconds, restores enabled controls, announces an exact retry message, rejects malformed successful payloads, and branches truthful attached/link-only success copy.

## TDD evidence

RED evidence captured during this wave:

- The new PDF deadline/recovery suite first failed because `pdf-render-coordinator` did not exist.
- The new distributed limiter suite first failed because `rate-limit` did not exist.
- The initial hardened route/form run produced 20 failures out of 48 tests against the old unbounded/unthrottled behavior.
- The final generic whey fixture was added first and failed 2 of 29 macro/PDF tests against the named EAS row; after switching to FDC `2710745`, the file passed 29/29.

Fresh final gates on the committed implementation:

1. Required focused matrix: **9 files passed, 126 tests passed**. It covered macro data/PDF, limiter, PDF route, macro email route, legacy email route, macro form, legacy form, analytics, and blog.
2. Full suite: **43 files passed, 331 tests passed**. jsdom printed its known informational `Not implemented: navigation to another Document`; there were no failed tests.
3. `npm run verify:seo-guides`: exit 0, `SEO guide verification passed.`
4. `npm run build`: exit 0; compiled and type-checked, generated **94/94** pages including `/blog/macro-tracking-cheat-sheet`, and built both macro API routes.
5. `npm run verify:static-routes` after the production build: exit 0; verified `/`, `/blog`, `/tdee-calculator`, and `/blog/feed.xml`, with `/blog/[slug]` fallback disabled. A pre-build invocation correctly reported the absent production prerender manifest; rebuilding restored it, with no source fix required.
6. `git diff --check`: no output.

Build advisories only: Next inferred the parent workspace root because both the original checkout and worktree contain lockfiles, and it emitted the existing edge-runtime/static-generation advisory. `npm install` restored the interrupted worktree's dependencies without changing package manifests and reported 13 existing dependency advisories; no broad `npm audit fix` was attempted.

## Final PDF evidence

The post-audit PDF was regenerated from the production server on approved port 3001 and saved outside the repository at:

`/tmp/caloriecue-macro-final-pdf/caloriecue-macro-tracking-cheat-sheet.pdf`

Observed properties:

- 330,987 bytes; 6 pages; US Letter 612 × 792 pt; PDF 1.3; unencrypted.
- `language="en-US"`; outline/bookmark titles for Cover, Macro quick start, Protein food reference, Carb/fat/mixed reference, Meal builder, and Seven-day macro log.
- no JavaScript, no suspect content, no forms.
- `Tagged: no`: `@react-pdf/renderer` 4.5.1 has no stable semantic-table tagging API used safely here. The HTML article preserves the core reference as accessible headings and real tables.

`pdftotext -layout` confirmed the new whey `109/24/2/0`, tofu `163/20/3/10`, tuna `102/22/0/1`, TVP `176/25/16/2`, tempeh `218/23/9/12` with the unspecified-preparation label, all additional corrected rows, and meal totals `442/31/62/8`, `487/43/56/10`, and `376/28/38/13`.

All six pages were freshly rendered at 144 dpi and visually inspected at original resolution. The cover, quick start, 25-row protein table, two-column carb/fat reference plus mixed cards, three meal cards/write-in areas, and seven-day log were legible and unclipped. No blank imagery, overflow, repeated headings, truncated row, or unreadable footer/CTA was found. Poppler emitted only its sandbox Fontconfig cache-directory warning; glyphs rendered correctly.

## Chrome desktop/mobile evidence

Real Chrome QA was completed on `http://localhost:3001/blog/macro-tracking-cheat-sheet`; port 3000 was never operated. Chrome was finalized after QA and was not reopened.

- Desktop 1376 × 768: correct cover crop, one H1, two macro forms, seven article tables, expected form placement after the `What Is Inside...` H2 section, and no framework overlay.
- Rendered title: `Macro Tracking Cheat Sheet: Free PDF | CalorieCue`.
- Canonical: `https://caloriecue.app/blog/macro-tracking-cheat-sheet`.
- Meta description exactly matched frontmatter.
- JSON-LD included `BlogPosting`, three-item `BreadcrumbList`, and six-question `FAQPage` alongside site-level data.
- Inline App Store URL contained `utm_source=blog&utm_medium=inline_cta&utm_content=app_store_link`.
- Invalid-only interaction submitted `not-an-email`, produced the exact accessible alert, and generated no POST/email.
- Mobile 390 × 844: document scroll width stayed 382 px; all seven table wrappers had horizontal overflow. A real scroll on the first table moved `scrollLeft` from 0 to 300 (maximum 371), proving all columns remain reachable without page-level overflow.
- Chrome console had zero errors. The only two warnings were the existing forward-looking Next.js notice that image quality 85 must be listed under `images.qualities` in Next 16.

The later generic whey change affects only the expanded PDF protein table, not any browser-visible article preview row. The final PDF was regenerated and reinspected after that change.

No valid address was entered and no production email was sent.

## Preservation and remaining limitations

- The agent-created `supabase/.temp/` artifact was inspected, found empty, and removed. No task-generated database container or port-3001 server remains.
- The original checkout still contains exactly its three preserved user-owned untracked directories: `public/social/facebook/`, `public/social/instagram/`, and `video/`.
- No known feature failure remains.
- Deferred limitations are limited to React PDF's missing stable semantic tagging, the existing Next 16 image-quality warning, the build workspace-root/edge advisories, and the 13 pre-existing npm dependency advisories. Live Resend delivery and remote migration application were intentionally not exercised.
