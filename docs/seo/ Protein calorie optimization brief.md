# Optimization Brief: Convert High-Impression / Low-Click Protein–Calorie Pages

**Owner:** CalorieCue (caloriecue.app blog — Next.js / MDX)
**Goal:** Two existing posts are pulling thousands of Search Console impressions at near-zero clicks. The likely cause is **keyword cannibalization** (both pages target overlapping "protein + calories + foods" queries) plus weak CTR signals. This pass splits them into distinct search intents and optimizes each to convert impressions into clicks. **No new pages.**

## The data (last 3 months, GSC)

These two posts are showing for the following queries but barely getting clicks:

| Query | Impressions | Clicks | Should be owned by |
|---|---|---|---|
| foods high in protein low in calories | 3,218 | 0 | Post A (#23) |
| high protein low calorie foods | 961 | 2 | Post A (#23) |
| low calorie high protein foods | 234 | 0 | Post A (#23) |
| low calorie high protein | 184 | 0 | Post A (#23) |
| low calorie protein / protein rich foods / protein sources | ~80–108 each | 0 | Post A (#23) |
| what is a good protein to calorie ratio | 188 | 0 | Post B (#44) |
| protein per calorie chart | 142 | 5 | Post B (#44) |
| highest protein per calorie foods | 81 | 0 | Post B (#44) |
| protein to calorie ratio / protein per calorie | 74 each | 1 | Post B (#44) |
| highest protein to calorie ratio | 73 | 0 | Post B (#44) |
| best / highest protein to calorie ratio (foods) | 47–68 each | 1 | Post B (#44) |

**Reading:** "high protein low calorie **foods**" = list intent (people want a list of foods). "protein per calorie / protein-to-calorie **ratio**" = concept/ranking intent (people want the metric, the chart, and what counts as "good"). Right now both posts compete for both. Separate them.

---

## Step 0 — Read before editing

1. Locate the two source files by slug:
   - **Post A (#23):** `/blog/high-protein-low-calorie-foods`
   - **Post B (#44):** `/blog/protein-per-calorie`
2. Note each post's current: title tag, meta description, H1, heading structure, any tables/lists, any FAQ section, and any existing JSON-LD schema.
3. Read one or two other recent posts to match the repo's existing conventions for frontmatter fields, MDX components (tables, callouts, FAQ, image embeds), and schema. **Follow existing patterns** rather than introducing new ones.
4. **Do not change either slug/URL** (preserves ranking equity). Do not delete content that's currently ranking — restructure and augment.

---

## Step 1 — Resolve the cannibalization (do this first, it frames everything)

- **Post A (#23) primary keyword:** `high protein low calorie foods` (+ the "foods high in protein low in calories" / "low calorie high protein foods" family). It is the **foods list**.
- **Post B (#44) primary keyword:** `protein per calorie` / `protein to calorie ratio` (+ "what is a good protein to calorie ratio", "protein per calorie chart"). It is the **ratio concept + ranking**.
- Each post's intro (first 1–2 sentences) must state its scope explicitly so intent is unambiguous, e.g.:
  - A: "Here are the best high-protein, low-calorie foods, with exact protein and calories per serving."
  - B: "Protein per calorie is the efficiency metric for hitting your protein goal — here's what a good ratio looks like and the foods that rank highest."
- **Reciprocal internal links** (exact anchors):
  - In A, link to B with anchor: *"ranked by protein-per-calorie ratio"*
  - In B, link to A with anchor: *"the full list of high-protein, low-calorie foods"*
- Keep the lanes separate: do **not** make "protein per calorie" the primary target on A, and do **not** make "high protein low calorie foods" the primary target on B, even though they share vocabulary.

---

## Step 2 — Optimize Post A (#23, the foods list)

**Title tag** (replace; ≤ ~58 chars, lead with the dominant query phrasing):
- Primary: `40 High-Protein, Low-Calorie Foods (Ranked, 2026)`
- Acceptable alt: `Foods High in Protein and Low in Calories: 40 Best`

**Meta description** (replace; ≤ ~155 chars):
`The 40 best high-protein, low-calorie foods, ranked by protein per calorie — with exact grams and calories per serving. Build a leaner plate, fast.`

**Content changes (in priority order):**
1. Keep the intro to 2–3 sentences, then immediately add an H2 **"Foods high in protein and low in calories"** followed by a **scannable ranked table** (above the fold): columns `Food | Protein (g) | Calories | Protein per 100 cal`, top ~15–20 foods. **Build this table from the foods already in the post** — reformat existing content; verify any values that look off against USDA. This table is the featured-snippet and intent magnet.
2. Add a short **"Top 10 at a glance"** ordered list right after the intro, before the full table (targets the list-style snippet): `Food — Xg protein, Y cal`.
3. Expand/add an **FAQ** with concise answers (target People Also Ask + AI citations):
   - "What foods are high in protein and low in calories?"
   - "What is the highest protein, lowest calorie food?"
   - "What are good high-protein, low-calorie snacks?"
4. **Schema:** ensure `Article` with `dateModified`; add `FAQPage` for the FAQ; add `ItemList` for the ranked list if the repo's schema setup supports it.
5. **Internal links out:** to Post B (anchor above), to `/blog/track-protein-without-weighing`, `/blog/high-protein-low-calorie-grocery-list`, `/blog/best-sources-of-protein`.
6. Add a visible **"Updated June 2026"** line and bump `dateModified` in frontmatter (freshness signal).

---

## Step 3 — Optimize Post B (#44, the ratio concept)

**Title tag** (replace; lead with "protein per calorie chart" — it's the one query already earning clicks):
- Primary: `Protein Per Calorie Chart: Foods With the Best Ratio`
- Acceptable alt: `Protein-to-Calorie Ratio: Chart + Best Foods (2026)`

**Meta description** (replace; ≤ ~155 chars):
`What's a good protein-to-calorie ratio? See the chart ranking foods by protein per calorie, plus the highest-ratio foods to hit your protein goal.`

**Content changes (in priority order):**
1. Add a **prominent protein-per-calorie chart near the top** — this directly serves "protein per calorie chart" (142 impressions, already clicking). **Reuse `asset-2-protein-per-100-calories.svg`** (the protein-per-100-calories bar chart already produced for the Track Protein post) or generate an equivalent in the same brand style. Give it a descriptive alt attribute.
2. Add an H2 **"What is a good protein-to-calorie ratio?"** with a concise, snippet-style answer in the first paragraph beneath it (targets the 188-impression question + AI citation). Use a concrete benchmark, e.g.: the leanest proteins deliver roughly **20 g of protein per 100 calories — about 80% of their calories from protein**; as a rule of thumb, a food is "high protein per calorie" when it gives **~1 g of protein per 10 calories or better.**
3. Add/refresh a **ranked table of foods by protein per calorie** (`Food | Protein per 100 cal | Protein (g) | Calories`).
4. **FAQ:**
   - "What is a good protein-to-calorie ratio?"
   - "What food has the highest protein per calorie?"
   - "How do you calculate protein per calorie?" (show: protein grams ÷ calories × 100)
5. **Schema:** `Article` (+ `dateModified`), `FAQPage`, and treat the chart as an `ImageObject`; `ItemList` for the rankings if supported.
6. **Internal links out:** to Post A (anchor above), to `/blog/track-protein-without-weighing`, `/blog/high-protein-low-calorie-grocery-list`.
7. Visible **"Updated June 2026"** + bump `dateModified`.

---

## Step 4 — Site-wide authority flow

Add internal links **pointing to** #23 and #44 from high-traffic pages, so authority flows in and lifts their positions (position is the main reason impressions aren't converting):
- `/blog/calories-in-food-list` (currently the #1 page) → link to both.
- `/blog/calorie-counting-cheat-sheet` → link to both.
- `/blog/track-protein-without-weighing` → already links to both; confirm.
- Homepage or relevant pillar, if there's a natural placement.

Use descriptive, varied anchors (not "click here") that match the target intent.

---

## Step 5 — Trigger recrawl + verify

1. After deploy, run **GSC URL Inspection → Request Indexing** for both URLs (and any page where internal links changed substantially) so Google re-crawls quickly.
2. **Re-pull GSC in 2–4 weeks** and compare **average position and CTR** for these specific queries:
   - `foods high in protein low in calories` (3,218 imp)
   - `high protein low calorie foods` (961 imp)
   - `what is a good protein to calorie ratio` (188 imp)
   - `protein per calorie chart` (142 imp)
3. Interpreting results:
   - Position climbing toward top-3 **and** CTR rising off ~0% = working.
   - Position improves but CTR stays flat = iterate the title/meta only.
   - Position doesn't move = needs more content depth/internal links, or the SERP is AI-Overview-dominated (in which case treat as an authority signal, not a click target).

---

## Guardrails (do NOT)

- Don't change slugs/URLs. If ever unavoidable, 301-redirect the old URL.
- Don't create new pages for these queries — that re-creates the cannibalization this pass is fixing.
- Don't keyword-stuff titles, H1s, or body. Keep everything natural and readable.
- Don't strip content that's currently ranking — restructure and add to it.
- Match the repo's existing frontmatter, components, and schema conventions.

---

## Optional — backlog for a second pass (not this one)

Same high-impression / low-click pattern, lower priority:
- `/blog/best-calorie-tracker-app` (#11) — "best ai calorie tracker" = 280 imp / 0 clicks (commercial; title/meta + position).
- `/blog/high-protein-low-calorie-grocery-list` (#38) — check against "calorie counting grocery list" (4,340 imp); decide optimize-vs-new-pillar separately.
- "how to track calories" (112,403 imp / 0 clicks) — AI-Overview-dominated; treat as brand/authority, not a click target. Don't spend effort chasing the click.