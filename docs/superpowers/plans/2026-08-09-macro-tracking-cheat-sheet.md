# Macro Tracking Cheat Sheet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish an SEO-focused macro tracking article with a six-page email-gated PDF, reliable Resend delivery, separate lead analytics, and verified CalorieCue conversion paths.

**Architecture:** Add a macro-specific content/data module, React PDF renderer, download route, email route, and client form while leaving the proven calorie-cheat-sheet pipeline unchanged. Expose the form through the existing MDX component registry, record new subscribers through the existing `generate_lead` event with a distinct lead type, and use the existing dynamic blog loader and structured-data pipeline for publication.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, MDX, `@react-pdf/renderer`, Resend, GA4 `gtag`, Vitest, Testing Library, Tailwind CSS, ImageGen, `sips`.

## Final hardening addendum (2026-08-10)

This addendum supersedes the earlier illustrative snippets where they differ:

- Food rows use one typed FoodData Central source contract (FDC ID, exact description, data type, serving grams, per-100g macros, and preparation state), with published macros derived by scale-and-round. The official archive audit replaces the unavailable historical branded whey fixture with the current generic FNDDS record FDC 2710745.
- The public mail route reads at most 4,096 bytes as unknown JSON, validates `{ email, website }`, caps normalized email at 254 characters, rejects the honeypot, and fails closed when no valid forwarded client IP is available.
- A generated Supabase migration owns HMAC-only fixed-window counters and an atomic service-role-only RPC: IP 10/15 minutes and normalized email 3/hour. RLS is enabled, public/anon/authenticated privileges are revoked, and the RPC has an empty fixed `search_path`. No remote migration is part of this plan.
- Deadlines are 1.5 seconds for rate limiting, 5 seconds for each PDF caller with a shared render and 30-second circuit cooldown, 8 seconds for Resend, and 10 seconds for the browser fetch. Retryable service failures return `503` and `Retry-After`; exhausted limits return `429` and `Retry-After`.
- Success is `{ success: true, leadCreated, deliveryMode: "attached" | "link_only" }`. Link-only subject/body/UI copy never claims an attachment. Email has no untracked App Store CTA; the article keeps its tracked React CTA.
- The first form belongs after the `What Is Inside the Printable Macro Tracking Sheet?` preview (before the next H2), and the second remains in the download section. This avoids an H1-to-form-H3 outline jump.
- Frontmatter stores `metaTitle: "Macro Tracking Cheat Sheet: Free PDF"`; the root layout's `%s | CalorieCue` template produces the rendered browser title.
- The PDF declares `en-US` and page bookmarks. React PDF 4.5.1 does not provide a stable semantic-tagging API for these tables, so the HTML article is the accessible equivalent.

## Global Constraints

- Work only on `codex/macro-tracking-cheat-sheet`; never involve the long-lived `content/draft` branch.
- Preserve the existing calorie-cheat-sheet form and API behavior.
- The asset is five printable reference pages plus a cover: six physical PDF pages.
- Do not present `40/30/30` or another macro ratio as universally optimal.
- Use USDA FoodData Central for generic food values and primary federal/standards sources for factual nutrition claims.
- Preparation state must be explicit where material: raw, cooked, drained, skinless, fat percentage, or added oil.
- Keep the new search intent separate from `/blog/how-to-count-macros` and `/blog/calorie-counting-cheat-sheet`.
- Fire `generate_lead` only when the backend returns `success: true` and `leadCreated: true`.
- Use the existing tracked App Store components; do not add untracked App Store links.
- Reuse the existing Resend audience ID and deployment-aware fallback-link behavior.
- Do not stage or modify `public/social/facebook/`, `public/social/instagram/`, or `video/`.
- Do not push, merge, deploy, publish social assets, or create a carousel without explicit user approval.

## File responsibility map

- `src/lib/macro-cheat-sheet/data.ts`: typed, source-reviewed macro food and worked-meal data; no rendering or networking.
- `src/lib/macro-cheat-sheet/MacroCheatSheetDocument.tsx`: six-page React PDF layout, memoized renderer, and filename export.
- `src/app/api/macro-cheat-sheet/pdf/route.ts`: cached PDF download response only.
- `src/app/api/macro-cheat-sheet-download/route.ts`: email validation, Resend contact resolution, attachment/fallback delivery, and response contract.
- `src/components/blog/MacroCheatSheetForm.tsx`: macro-specific email-gate UI and client analytics.
- `src/components/blog/MDXComponents.tsx`: makes `<MacroCheatSheetForm />` available to one MDX article.
- `src/lib/analytics.ts`: adds the typed `macro_cheat_sheet` lead value without changing event shape.
- `content/blog/macro-tracking-cheat-sheet.mdx`: article, SEO metadata, FAQs, forms, internal links, and tracked app CTA.
- `public/blog/macro-tracking-cheat-sheet.webp`: title-overlay-safe editorial cover image.
- `next.config.ts`: bundles PDF fonts/logo/mockup into both new serverless routes.

---

### Task 1: Macro reference data and six-page PDF renderer

**Files:**
- Create: `src/lib/macro-cheat-sheet/data.ts`
- Create: `src/lib/macro-cheat-sheet/MacroCheatSheetDocument.tsx`
- Create: `src/lib/macro-cheat-sheet/__tests__/MacroCheatSheetDocument.test.tsx`
- Reuse: `src/lib/cheat-sheet/assets.ts`

**Interfaces:**
- Produces: `MacroFood`, `MealExample`, `proteinFoods`, `carbFoods`, `fatFoods`, `mixedFoods`, `mealExamples`, `logDays`, and `sumMacros()` from `data.ts`.
- Produces: `renderMacroCheatSheetPdf(): Promise<Buffer>` and `MACRO_CHEAT_SHEET_PDF_FILENAME = "caloriecue-macro-tracking-cheat-sheet.pdf"` from the document module.
- Depends on: `registerFonts()` and `publicAsset()` from `@/lib/cheat-sheet/assets`.

- [ ] **Step 1: Write failing data-integrity and renderer tests**

```tsx
import { describe, expect, it } from "vitest";
import {
  carbFoods,
  fatFoods,
  mealExamples,
  mixedFoods,
  proteinFoods,
  sumMacros,
} from "@/lib/macro-cheat-sheet/data";
import {
  MACRO_CHEAT_SHEET_PDF_FILENAME,
  renderMacroCheatSheetPdf,
} from "@/lib/macro-cheat-sheet/MacroCheatSheetDocument";

describe("macro cheat sheet data", () => {
  it("contains substantial, positive, preparation-specific food lists", () => {
    expect(proteinFoods.length).toBeGreaterThanOrEqual(24);
    expect(carbFoods.length).toBeGreaterThanOrEqual(18);
    expect(fatFoods.length).toBeGreaterThanOrEqual(12);
    expect(mixedFoods.length).toBeGreaterThanOrEqual(8);
    for (const food of [...proteinFoods, ...carbFoods, ...fatFoods, ...mixedFoods]) {
      expect(food.name.trim()).not.toBe("");
      expect(food.serving.trim()).not.toBe("");
      expect(food.calories).toBeGreaterThan(0);
      expect(food.protein).toBeGreaterThanOrEqual(0);
      expect(food.carbs).toBeGreaterThanOrEqual(0);
      expect(food.fat).toBeGreaterThanOrEqual(0);
    }
  });

  it("keeps worked meal totals auditable", () => {
    for (const meal of mealExamples) {
      expect(sumMacros(meal.items.map((item) => item.macros))).toEqual(meal.total);
    }
  });
});

describe("MacroCheatSheetDocument", () => {
  it("renders a PDF buffer with the stable filename", async () => {
    const buffer = await renderMacroCheatSheetPdf();
    expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
    expect(buffer.length).toBeGreaterThan(20_000);
    expect(MACRO_CHEAT_SHEET_PDF_FILENAME).toBe(
      "caloriecue-macro-tracking-cheat-sheet.pdf",
    );
  }, 20_000);
});
```

- [ ] **Step 2: Run the focused test and verify the missing-module failure**

Run: `npm run test:run -- src/lib/macro-cheat-sheet/__tests__/MacroCheatSheetDocument.test.tsx`

Expected: FAIL because `@/lib/macro-cheat-sheet/data` and `MacroCheatSheetDocument` do not exist.

- [ ] **Step 3: Implement the typed food and meal data**

```ts
export type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type MacroFood = MacroTotals & {
  name: string;
  serving: string;
  note?: string;
};

export type MealItem = {
  name: string;
  macros: MacroTotals;
};

export type MealExample = {
  name: string;
  items: MealItem[];
  total: MacroTotals;
};

export function sumMacros(values: MacroTotals[]): MacroTotals {
  return values.reduce(
    (total, value) => ({
      calories: total.calories + value.calories,
      protein: total.protein + value.protein,
      carbs: total.carbs + value.carbs,
      fat: total.fat + value.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export const logDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
```

Populate the exact food sets below with rounded values verified against USDA FoodData Central. Record the selected FoodData Central description/FDC ID in a source comment beside each logical group so later reviewers can reproduce the lookup.

- Protein: chicken breast, turkey breast, 93% lean ground turkey, 90% lean beef, sirloin, pork tenderloin, tuna in water, cod, tilapia, shrimp, salmon, whole egg, egg whites, nonfat Greek yogurt, 2% Greek yogurt, low-fat cottage cheese, skim milk, whey isolate, firm tofu, tempeh, seitan, lentils, black beans, edamame, and textured vegetable protein.
- Carbohydrate: white rice, brown rice, oats, quinoa, potato, sweet potato, whole-wheat bread, bagel, corn tortilla, pasta, couscous, chickpeas, black beans, banana, apple, berries, corn, peas, and cereal.
- Fat: olive oil, butter, avocado, almonds, walnuts, peanuts, peanut butter, chia seeds, flaxseed, tahini, mayonnaise, cheddar, and dark chocolate.
- Mixed foods: whole eggs, salmon, tofu, tempeh, lentils, black beans, Greek yogurt, cottage cheese, almonds, peanut butter, chia seeds, and edamame.

Create exactly three worked examples—Greek-yogurt breakfast, chicken-rice lunch/dinner, and cottage-cheese snack—and derive each `total` with `sumMacros()` rather than duplicating arithmetic.

- [ ] **Step 4: Implement the six-page React PDF document**

Use `Document`, `Page`, `View`, `Text`, `Image`, `StyleSheet`, and `renderToBuffer` from `@react-pdf/renderer`. Register Inter through the existing asset helper. Keep a warm-instance buffer cache.

```tsx
registerFonts();

const logo = publicAsset("caloriecue_logo.png") ?? publicAsset("app-icons/1024.png");
const appMockup = publicAsset("mockup-caloriecue.png");

export function MacroCheatSheetDocument() {
  return (
    <Document
      title="Macro Tracking Cheat Sheet"
      author="CalorieCue"
      subject="Protein, carbohydrate and fat food reference with macro log"
    >
      <MacroCoverPage logo={logo} />
      <MacroQuickStartPage />
      <ProteinReferencePage foods={proteinFoods} />
      <CarbFatReferencePage
        carbFoods={carbFoods}
        fatFoods={fatFoods}
        mixedFoods={mixedFoods}
      />
      <MealBuilderPage meals={mealExamples} />
      <MacroLogPage days={logDays} appMockup={appMockup} />
    </Document>
  );
}

let cachedBuffer: Buffer | null = null;

export async function renderMacroCheatSheetPdf(): Promise<Buffer> {
  if (!cachedBuffer) {
    cachedBuffer = await renderToBuffer(<MacroCheatSheetDocument />);
  }
  return cachedBuffer;
}

export const MACRO_CHEAT_SHEET_PDF_FILENAME =
  "caloriecue-macro-tracking-cheat-sheet.pdf";
```

Implement all six private page components in the same module so their inputs match the calls above exactly. `MacroCoverPage` renders the approved title, subtitle, five content pills, brand mark, `caloriecue.app`, and `5 printable sheets + cover`. `MacroQuickStartPage` renders the 4/4/9 equation, four blank target fields, one gram-to-calorie worked example, and the protein-first workflow. `ProteinReferencePage` renders every `proteinFoods` row. `CarbFatReferencePage` renders all three supplied lists in named sections. `MealBuilderPage` renders the four-step framework, all three meal examples, and two blank repeatable-meal boxes. `MacroLogPage` renders seven day rows, four weekly-average fields, the consistency note, and the app CTA. Use reusable `MacroTable`, `PageHeader`, `Footer`, and `MacroTotalsRow` components inside this file. Show `P`, `C`, and `F` labels in addition to color so the document never relies on color alone. The protein-efficiency marker is defined as at least `0.10 g protein per kcal` and must be explained in the legend.

- [ ] **Step 5: Run the focused test and verify it passes**

Run: `npm run test:run -- src/lib/macro-cheat-sheet/__tests__/MacroCheatSheetDocument.test.tsx`

Expected: PASS with one data suite and one PDF-renderer suite.

- [ ] **Step 6: Commit the independently renderable PDF**

```bash
git add src/lib/macro-cheat-sheet/data.ts src/lib/macro-cheat-sheet/MacroCheatSheetDocument.tsx src/lib/macro-cheat-sheet/__tests__/MacroCheatSheetDocument.test.tsx
git commit -m "feat: add macro cheat sheet PDF"
```

---

### Task 2: PDF download route and production asset tracing

**Files:**
- Create: `src/app/api/macro-cheat-sheet/pdf/route.ts`
- Create: `src/app/api/macro-cheat-sheet/pdf/__tests__/route.test.ts`
- Modify: `next.config.ts`

**Interfaces:**
- Consumes: `renderMacroCheatSheetPdf()` and `MACRO_CHEAT_SHEET_PDF_FILENAME` from Task 1.
- Produces: `GET(): Promise<Response>` at `/api/macro-cheat-sheet/pdf`.

- [ ] **Step 1: Write failing route tests**

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/macro-cheat-sheet/pdf/route";

const renderPdf = vi.hoisted(() => vi.fn());

vi.mock("@/lib/macro-cheat-sheet/MacroCheatSheetDocument", () => ({
  renderMacroCheatSheetPdf: renderPdf,
  MACRO_CHEAT_SHEET_PDF_FILENAME: "caloriecue-macro-tracking-cheat-sheet.pdf",
}));

describe("GET /api/macro-cheat-sheet/pdf", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a cacheable inline PDF with a stable filename", async () => {
    renderPdf.mockResolvedValue(Buffer.from("%PDF-macro"));
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("content-disposition")).toContain(
      'inline; filename="caloriecue-macro-tracking-cheat-sheet.pdf"',
    );
    expect(response.headers.get("cache-control")).toBe(
      "public, max-age=3600, s-maxage=86400",
    );
  });

  it("returns 500 when rendering fails", async () => {
    renderPdf.mockRejectedValue(new Error("render failed"));
    expect((await GET()).status).toBe(500);
  });
});
```

- [ ] **Step 2: Run the test and verify the missing-route failure**

Run: `npm run test:run -- src/app/api/macro-cheat-sheet/pdf/__tests__/route.test.ts`

Expected: FAIL because the new route does not exist.

- [ ] **Step 3: Implement the Node download route**

```ts
import {
  MACRO_CHEAT_SHEET_PDF_FILENAME,
  renderMacroCheatSheetPdf,
} from "@/lib/macro-cheat-sheet/MacroCheatSheetDocument";

export const runtime = "nodejs";

export async function GET() {
  try {
    const buffer = await renderMacroCheatSheetPdf();
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${MACRO_CHEAT_SHEET_PDF_FILENAME}"`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("Macro cheat sheet PDF generation error:", error);
    return new Response("Failed to generate PDF", { status: 500 });
  }
}
```

- [ ] **Step 4: Add asset tracing for both macro PDF routes**

Add these exact `outputFileTracingIncludes` entries to `next.config.ts`:

```ts
"/api/macro-cheat-sheet/pdf": [
  "./public/fonts/**",
  "./public/caloriecue_logo.png",
  "./public/app-icons/1024.png",
  "./public/mockup-caloriecue.png",
],
"/api/macro-cheat-sheet-download": [
  "./public/fonts/**",
  "./public/caloriecue_logo.png",
  "./public/app-icons/1024.png",
  "./public/mockup-caloriecue.png",
],
```

- [ ] **Step 5: Run focused tests and build-time type checking**

Run: `npm run test:run -- src/app/api/macro-cheat-sheet/pdf/__tests__/route.test.ts src/lib/macro-cheat-sheet/__tests__/MacroCheatSheetDocument.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit the download surface**

```bash
git add src/app/api/macro-cheat-sheet/pdf/route.ts src/app/api/macro-cheat-sheet/pdf/__tests__/route.test.ts next.config.ts
git commit -m "feat: serve macro cheat sheet PDF"
```

---

### Task 3: Email-gated Resend delivery

**Files:**
- Create: `src/app/api/macro-cheat-sheet-download/route.ts`
- Create: `src/app/api/macro-cheat-sheet-download/__tests__/route.test.ts`

**Interfaces:**
- Consumes: PDF renderer and filename from Task 1.
- Produces: `POST(req: NextRequest): Promise<NextResponse>` accepting bounded unknown JSON that validates to `{ email: string, website?: string }` and returning `{ success: true, leadCreated: boolean, deliveryMode: "attached" | "link_only" }` or `{ error: string }`.
- Uses: the existing Resend audience ID `511ab1c1-5a5c-4b58-9d22-8bf8aaf2e912`.

- [ ] **Step 1: Write failing API tests with explicit Resend and PDF mocks**

Use this setup in `route.test.ts`:

```ts
import type { NextRequest } from "next/server";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/macro-cheat-sheet-download/route";

const mocks = vi.hoisted(() => ({
  contactGet: vi.fn(),
  contactCreate: vi.fn(),
  emailSend: vi.fn(),
  renderPdf: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: vi.fn(function ResendMock() {
    return {
      contacts: { get: mocks.contactGet, create: mocks.contactCreate },
      emails: { send: mocks.emailSend },
    };
  }),
}));

vi.mock("@/lib/macro-cheat-sheet/MacroCheatSheetDocument", () => ({
  MACRO_CHEAT_SHEET_PDF_FILENAME: "caloriecue-macro-tracking-cheat-sheet.pdf",
  renderMacroCheatSheetPdf: mocks.renderPdf,
}));

function request(email = "Reader@Example.com", headers = new Headers()) {
  return {
    json: vi.fn().mockResolvedValue({ email }),
    headers,
    nextUrl: new URL("https://caloriecue.app/api/macro-cheat-sheet-download"),
  } as unknown as NextRequest;
}
```

Assert macro-specific delivery with:

```ts
expect(mocks.emailSend).toHaveBeenCalledWith(
  expect.objectContaining({
    from: "CalorieCue <hello@track.caloriecue.app>",
    to: "reader@example.com",
    subject: "Your Macro Tracking Cheat Sheet (PDF inside)",
    attachments: [
      expect.objectContaining({
        filename: "caloriecue-macro-tracking-cheat-sheet.pdf",
      }),
    ],
  }),
);
```

Cover all of these cases with named tests:

1. invalid email returns `400`;
2. missing `RESEND_API_KEY` returns `500`;
3. new contact returns `leadCreated: true`;
4. existing contact returns `leadCreated: false`;
5. contact creation error/rejection still sends and returns `false`;
6. unresolved contact lookup times out after `1_000` ms and still sends;
7. email delivery begins before contact resolution finishes;
8. PDF render failure sends a link-only email;
9. Resend delivery failure returns `500` and never claims success;
10. `x-forwarded-host` and `x-forwarded-proto` produce the correct preview download URL.

- [ ] **Step 2: Run the route test and verify the missing-module failure**

Run: `npm run test:run -- src/app/api/macro-cheat-sheet-download/__tests__/route.test.ts`

Expected: FAIL because the macro delivery route does not exist.

- [ ] **Step 3: Implement the isolated macro email route**

Follow the concurrency and timeout behavior in the existing calorie route exactly. Use these macro-specific constants and copy:

```ts
const AUDIENCE_ID = "511ab1c1-5a5c-4b58-9d22-8bf8aaf2e912";
const CONTACT_RESOLUTION_TIMEOUT_MS = 1_000;
const PRODUCTION_URL = "https://caloriecue.app";
const APP_STORE_URL =
  "https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503";

const downloadUrl = `${getBaseUrl(req)}/api/macro-cheat-sheet/pdf`;
```

The email must state `five printable reference sheets plus a cover`, list the quick start, three food charts, meal builder, and seven-day log, attach the PDF when rendering succeeds, and retain the deployment-aware download button. The plain-text fallback must include the same download URL. Do not call or modify the calorie route.

- [ ] **Step 4: Run the macro and legacy delivery suites**

Run: `npm run test:run -- src/app/api/macro-cheat-sheet-download/__tests__/route.test.ts src/app/api/cheat-sheet-download/__tests__/route.test.ts`

Expected: PASS for the new route and unchanged legacy route.

- [ ] **Step 5: Commit the email delivery flow**

```bash
git add src/app/api/macro-cheat-sheet-download/route.ts src/app/api/macro-cheat-sheet-download/__tests__/route.test.ts
git commit -m "feat: email macro cheat sheet leads"
```

---

### Task 4: Macro form, MDX exposure, and typed lead analytics

**Files:**
- Create: `src/components/blog/MacroCheatSheetForm.tsx`
- Create: `src/components/blog/__tests__/MacroCheatSheetForm.test.tsx`
- Modify: `src/components/blog/MDXComponents.tsx`
- Modify: `src/lib/analytics.ts`
- Modify: `src/lib/__tests__/analytics.test.ts`

**Interfaces:**
- Produces: `MacroCheatSheetForm({ contentSlug }: { contentSlug: string })`.
- Consumes: `trackGenerateLead()` with `leadType: "macro_cheat_sheet"`.
- Produces: `getMDXComponents(slug).MacroCheatSheetForm` for MDX.

- [ ] **Step 1: Extend the analytics contract test before the type change**

Add a test to `src/lib/__tests__/analytics.test.ts`:

```ts
it("emits a distinct macro cheat sheet lead", () => {
  const track = vi.fn();
  trackGenerateLead(
    {
      leadType: "macro_cheat_sheet",
      location: "cheat_sheet_form",
      contentSlug: "macro-tracking-cheat-sheet",
    },
    { track },
  );
  expect(track).toHaveBeenCalledWith("generate_lead", {
    lead_type: "macro_cheat_sheet",
    location: "cheat_sheet_form",
    content_slug: "macro-tracking-cheat-sheet",
  });
});
```

- [ ] **Step 2: Write failing macro form tests**

Use `userEvent`, a `fetchMock`, and the existing analytics module mock. Define a local `submit(email)` helper that types into `Enter your email` and submits the closest form. The success test must assert:

```tsx
const components = getMDXComponents("macro-tracking-cheat-sheet");
const Form = components.MacroCheatSheetForm as ComponentType;
render(<Form />);

expect(screen.getByText(/macro tracking cheat sheet/i)).toBeInTheDocument();
expect(fetchMock).toHaveBeenCalledWith(
  "/api/macro-cheat-sheet-download",
  expect.objectContaining({
    method: "POST",
    body: JSON.stringify({ email: "reader@example.com" }),
  }),
);
expect(trackGenerateLead).toHaveBeenCalledWith({
  leadType: "macro_cheat_sheet",
  location: "cheat_sheet_form",
  contentSlug: "macro-tracking-cheat-sheet",
});
```

Also cover invalid input, repeat contact, failed backend request, malformed HTTP-200 payload, disabled/pending button, and `Check your inbox` success copy.

- [ ] **Step 3: Run the focused tests and verify failures**

Run: `npm run test:run -- src/components/blog/__tests__/MacroCheatSheetForm.test.tsx src/lib/__tests__/analytics.test.ts`

Expected: FAIL because the component/MDX key and lead type do not exist.

- [ ] **Step 4: Add the lead type and implement the form**

Change the analytics union without altering the event payload:

```ts
export type LeadType = "newsletter" | "cheat_sheet" | "macro_cheat_sheet";
```

Implement the form with the same state and validation contract as `CheatSheetForm`, but use:

```tsx
await fetch("/api/macro-cheat-sheet-download", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: email.toLowerCase().trim() }),
});

trackGenerateLead({
  leadType: "macro_cheat_sheet",
  location: "cheat_sheet_form",
  contentSlug,
});
```

Visible form copy must accurately say `5 printable reference sheets plus a cover` and list protein, carbohydrate, fat, meal-builder, and seven-day-log content. Keep `No spam, ever. Unsubscribe anytime.`

- [ ] **Step 5: Register the component in MDX**

```tsx
import MacroCheatSheetForm from "./MacroCheatSheetForm";

// inside getMDXComponents(contentSlug)
MacroCheatSheetForm: () => (
  <MacroCheatSheetForm contentSlug={contentSlug} />
),
```

- [ ] **Step 6: Run new and legacy form/analytics tests**

Run: `npm run test:run -- src/components/blog/__tests__/MacroCheatSheetForm.test.tsx src/components/blog/__tests__/CheatSheetForm.test.tsx src/lib/__tests__/analytics.test.ts`

Expected: PASS with no legacy behavior changes.

- [ ] **Step 7: Commit the client conversion surface**

```bash
git add src/components/blog/MacroCheatSheetForm.tsx src/components/blog/__tests__/MacroCheatSheetForm.test.tsx src/components/blog/MDXComponents.tsx src/lib/analytics.ts src/lib/__tests__/analytics.test.ts
git commit -m "feat: add macro cheat sheet lead form"
```

---

### Task 5: SEO article, FAQs, and cannibalization-safe internal links

**Files:**
- Create: `content/blog/macro-tracking-cheat-sheet.mdx`
- Modify: `content/blog/how-to-count-macros.mdx`
- Modify: `content/blog/calorie-counting-cheat-sheet.mdx`
- Modify: `src/lib/blog/__tests__/blog.test.ts`

**Interfaces:**
- Consumes: `<MacroCheatSheetForm />` and `<AppStoreLink />` from Task 4.
- Produces: statically generated `/blog/macro-tracking-cheat-sheet` with BlogPosting, BreadcrumbList, and FAQPage JSON-LD through the existing blog route.

- [ ] **Step 1: Write the failing content contract test**

```ts
describe("macro tracking cheat sheet", () => {
  it("owns printable macro-food-list intent without duplicating the tutorial", () => {
    const post = getPostBySlug("macro-tracking-cheat-sheet");
    expect(post).toBeDefined();
    expect(post?.title).toBe(
      "Macro Tracking Cheat Sheet: Protein, Carb and Fat Foods (Free PDF)",
    );
    expect(post?.metaTitle).toBe(
      "Macro Tracking Cheat Sheet: Free PDF",
    );
    expect(post?.description.length).toBeLessThanOrEqual(160);
    expect(post?.tags).toContain("macro-tracking");
    expect(post?.faq).toHaveLength(6);
    expect(post?.content).toContain("<MacroCheatSheetForm />");
    expect(post?.content).toContain("<AppStoreLink />");
    expect(post?.content).toContain("/blog/how-to-count-macros");
    expect(post?.content).toContain("/blog/calories-per-gram");
    expect(post?.content).toContain("/blog/protein-per-calorie");
    expect(post?.content).toContain("/tdee-calculator");
    expect(post?.content.trim().split(/\s+/).length).toBeGreaterThanOrEqual(2_000);
  });

  it("links adjacent guides to the distinct printable intent", () => {
    expect(getPostBySlug("how-to-count-macros")?.content).toContain(
      "/blog/macro-tracking-cheat-sheet",
    );
    expect(getPostBySlug("calorie-counting-cheat-sheet")?.content).toContain(
      "/blog/macro-tracking-cheat-sheet",
    );
  });
});
```

- [ ] **Step 2: Run the content test and verify the missing-post failure**

Run: `npm run test:run -- src/lib/blog/__tests__/blog.test.ts`

Expected: FAIL because the slug does not exist.

- [ ] **Step 3: Create the exact frontmatter and opening**

```mdx
---
title: "Macro Tracking Cheat Sheet: Protein, Carb and Fat Foods (Free PDF)"
metaTitle: "Macro Tracking Cheat Sheet: Free PDF"
description: "Download a free macro tracking cheat sheet with protein, carb and fat food lists, meal-building examples, portion sizes and a printable 7-day log."
date: "2026-08-09"
author: "CalorieCue Team"
coverImage: "/blog/macro-tracking-cheat-sheet.webp"
coverImageAlt: "Printed macro tracking sheets with color-coded protein, carbohydrate and fat food lists beside chicken, rice, avocado and yogurt"
tags:
  - macro-tracking
  - nutrition
  - reference
  - printable
  - tools
  - protein
  - beginner
published: true
tldr: "Use a food's dominant macro to build your plate, but count its complete protein, carbohydrate and fat profile when you track it. Protein and carbs provide about 4 calories per gram, while fat provides about 9. Download the printable sheet for food lists, meal examples and a seven-day macro log."
faq:
  - question: "What foods count as protein, carbs, and fat?"
    answer: "Chicken breast, fish, lean meat, egg whites and low-fat dairy are protein-dominant; grains, potatoes, fruit and bread are carbohydrate-dominant; oils, butter, avocado, nuts and seeds are fat-dominant. Most foods contain more than one macro, so classify them by their dominant macro when planning but track their complete values."
  - question: "Do I need to hit my macros exactly every day?"
    answer: "No. Macro targets are planning ranges, not a daily pass-fail test. Prioritize a consistent calorie and protein pattern, then review weekly averages rather than forcing every day to land on the exact gram."
  - question: "Should I track total carbs or net carbs?"
    answer: "Use the value your chosen tracking method defines consistently. Nutrition labels show total carbohydrate; net carbs are a separate calculation often used for low-carbohydrate diets. This sheet uses total carbohydrate so its values match standard food-composition data."
  - question: "Should macro values be measured raw or cooked?"
    answer: "Use the same preparation state as the source entry. Raw and cooked weights are not interchangeable because cooking changes water content. The sheet labels preparation state wherever the difference is material."
  - question: "Do I need to track macros to lose weight?"
    answer: "No. A calorie deficit can produce weight loss without detailed macro tracking. Macros are most useful when you want more control over protein intake, meal composition, fullness or athletic performance."
  - question: "What is included in the free macro cheat sheet PDF?"
    answer: "Five printable reference sheets plus a cover: a macro quick start, protein foods, carbohydrate and fat foods, a meal builder with worked examples, and a seven-day macro log with weekly averages."
---

Protein, carbohydrates, and fat are not three separate food kingdoms. Most foods contain a mix of all three. The practical move is to use a food's **dominant macro** when building a meal, then count its complete macro profile when you track it.

This macro tracking cheat sheet turns that idea into a printable system: common foods with realistic servings, a simple meal builder, and a seven-day log you can use without rebuilding the math every morning.

<MacroCheatSheetForm />
```

- [ ] **Step 4: Write the complete article around the approved editorial structure**

Use these exact H2s in this order:

1. `Macro Cheat Sheet: The Quick Answer`
2. `What Is Inside the Printable Macro Tracking Sheet?`
3. `How to Use a Protein, Carb and Fat Food List`
4. `Protein Foods: Build the Meal Around These`
5. `Carbohydrate Foods: Match the Serving to the Day`
6. `Fat Foods: Measure the Small Portions That Add Up Fast`
7. `Mixed Foods: Why One Food Can Count Toward Two Macros`
8. `How to Build a Meal From Your Macro Targets`
9. `Three Worked Macro-Friendly Meals`
10. `How to Use Your Own Macro Target`
11. `Six Macro Tracking Mistakes to Avoid`
12. `Download the Macro Tracking Cheat Sheet`
13. `Frequently Asked Questions`
14. `The Bottom Line`

The article must include preview tables with at least eight protein foods, eight carbohydrate foods, six fat foods, and six mixed foods; use the same rounded values as `data.ts`. Explain the 4/4/9 rule with a citation to federal labeling guidance, link to USDA FoodData Central for the data policy, and include one authoritative source for population-level macronutrient ranges while explicitly stating that the article does not prescribe an individual ratio. Place a second `<MacroCheatSheetForm />` under H2 12 and one `<AppStoreLink />` after the message `Plan with the sheet; track with a photo.`

- [ ] **Step 5: Add contextual links from adjacent posts**

In `how-to-count-macros.mdx`, add this sentence after the first complete worked example:

```md
If you want the food lists and weekly log beside you while you do this, download the [macro tracking cheat sheet](/blog/macro-tracking-cheat-sheet); this guide explains the method, while the printable is the day-to-day reference.
```

In `calorie-counting-cheat-sheet.mdx`, add this sentence where the article discusses calorie versus macro tracking:

```md
If you also track protein, carbohydrates, and fat, use the separate [macro tracking cheat sheet](/blog/macro-tracking-cheat-sheet); the calorie PDF stays focused on energy, portions, restaurants, and the daily calorie log.
```

- [ ] **Step 6: Verify external sources before retaining them**

Open and verify the final URLs using primary sources only:

- `https://fdc.nal.usda.gov/`
- `https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-101/subpart-A/section-101.9`
- `https://nap.nationalacademies.org/catalog/10490/dietary-reference-intakes-for-energy-carbohydrate-fiber-fat-fatty-acids-cholesterol-protein-and-amino-acids`

If an exact claim is not directly supported, rewrite the claim instead of replacing it with a commercial blog citation.

- [ ] **Step 7: Run content and SEO verification**

Run: `npm run test:run -- src/lib/blog/__tests__/blog.test.ts`

Run: `npm run verify:seo-guides`

Run: `npm run verify:static-routes`

Expected: all PASS; the new slug appears in the static route output and no duplicate-intent rule fails.

- [ ] **Step 8: Commit the complete article cluster**

```bash
git add content/blog/macro-tracking-cheat-sheet.mdx content/blog/how-to-count-macros.mdx content/blog/calorie-counting-cheat-sheet.mdx src/lib/blog/__tests__/blog.test.ts
git commit -m "feat: add macro tracking cheat sheet article"
```

---

### Task 6: Editorial cover image

**Files:**
- Create: `public/blog/macro-tracking-cheat-sheet.webp`

**Interfaces:**
- Consumed by: `coverImage` and Open Graph metadata in Task 5.
- Produces: 1376 × 768 WebP image without embedded headline text.

- [ ] **Step 1: Invoke the imagegen skill and generate the source image**

Use this exact prompt:

```text
Create a premium editorial website hero image, 16:9 landscape. Warm overhead flat-lay on a soft ivory stone surface: a beautifully designed color-coded printed macro tracking worksheet in the center, with clean columns and abstract lines but no readable words or numbers. Surround it with a restrained selection of real foods representing macros: sliced grilled chicken breast and nonfat Greek yogurt for protein, cooked rice and berries for carbohydrates, avocado and a small dish of olive oil for fat. Add a coral-orange pen and a subtle corner of a smartphone showing an indistinct food-tracking interface. Natural window light, warm ivory and CalorieCue coral palette, subtle shadows, sophisticated nutrition editorial photography, realistic food texture, uncluttered composition. Leave calm negative space across the upper center for a website title overlay. No headline, no logos, no watermarks, no gibberish text, no hands, no people.
```

- [ ] **Step 2: Inspect the generated image before conversion**

Reject and regenerate if the worksheet contains prominent gibberish, food is malformed, the phone is blank or dominant, the title-overlay zone is busy, or the image looks like generic stock photography.

- [ ] **Step 3: Convert and size the approved asset**

Use `sips` to create a 1376 × 768 WebP at `public/blog/macro-tracking-cheat-sheet.webp`. Verify:

Run: `sips -g pixelWidth -g pixelHeight -g format public/blog/macro-tracking-cheat-sheet.webp`

Expected: width `1376`, height `768`, format `webp`.

- [ ] **Step 4: Commit the cover asset**

```bash
git add public/blog/macro-tracking-cheat-sheet.webp
git commit -m "feat: add macro cheat sheet cover"
```

---

### Task 7: Integrated verification and visual QA

**Files:**
- Verify all files from Tasks 1–6.
- Modify only a feature file when a verification failure proves a correction is necessary.

**Interfaces:**
- Consumes: complete article, forms, routes, PDF, analytics, and image.
- Produces: evidence that the feature builds and works without regressing the existing cheat sheet.

- [ ] **Step 1: Run focused feature tests**

Run:

```bash
npm run test:run -- \
  src/lib/macro-cheat-sheet/__tests__/MacroCheatSheetDocument.test.tsx \
  src/app/api/macro-cheat-sheet/pdf/__tests__/route.test.ts \
  src/app/api/macro-cheat-sheet-download/__tests__/route.test.ts \
  src/components/blog/__tests__/MacroCheatSheetForm.test.tsx \
  src/lib/__tests__/analytics.test.ts \
  src/lib/blog/__tests__/blog.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run the full automated quality gate**

Run: `npm run test:run`

Run: `npm run verify:seo-guides`

Run: `npm run verify:static-routes`

Run: `npm run build`

Expected: all commands exit `0`; Next.js statically generates `/blog/macro-tracking-cheat-sheet` and both API routes compile for the Node runtime.

- [ ] **Step 3: Download and visually inspect the actual PDF**

Start `npm run dev -- --port 3001`, then save `http://localhost:3001/api/macro-cheat-sheet/pdf` to `/tmp/caloriecue-macro-tracking-cheat-sheet.pdf`. Use the PDF inspection skill to render and inspect all six pages. Port 3000 remains untouched for the unrelated Taqvo service. Confirm:

- exactly six pages;
- no clipped rows, repeated headings, blank images, or overflow;
- food values and meal totals match `data.ts`;
- P/C/F labels make color meaning redundant;
- form and log writing areas remain usable when printed;
- cover/footer copy says five printable sheets plus a cover;
- app CTA and page numbering are readable.

- [ ] **Step 4: Inspect the rendered article at desktop and mobile widths**

Open `http://localhost:3001/blog/macro-tracking-cheat-sheet` with the Chrome workflow. Verify the 1376 × 768 cover crop, one H1, table horizontal behavior, both form instances, callouts, tracked App Store link, FAQs, and absence of hydration/console errors at desktop and mobile breakpoints.

- [ ] **Step 5: Test both form response branches without sending production email**

Use component/API tests as the authoritative proof for Resend behavior. In the local page, submit only if a non-production test Resend key and a user-authorized destination are configured. Otherwise verify invalid-email behavior in the UI and do not transmit an address.

- [ ] **Step 6: Inspect SEO and analytics output**

Confirm in rendered HTML:

- self-canonical `https://caloriecue.app/blog/macro-tracking-cheat-sheet`;
- title and meta description from frontmatter;
- BlogPosting, BreadcrumbList, and six-question FAQPage JSON-LD;
- cover alt text;
- `generate_lead` payload uses `macro_cheat_sheet` only for a new contact response;
- `app_store_click` includes `content_slug: macro-tracking-cheat-sheet`.

- [ ] **Step 7: Confirm repository cleanliness and unrelated-file preservation**

Run: `git status --short`

Expected: the only untracked entries remain the user-owned `public/social/facebook/`, `public/social/instagram/`, and `video/`; no implementation files remain unstaged or uncommitted. Do not add those directories.

---

## Final handoff

Report:

- article path and local URL;
- PDF route and attachment filename;
- focused/full test totals;
- build result;
- source-link verification result;
- article and PDF visual-QA findings;
- commits created;
- any intentionally deferred work, especially carousel, publishing, push, merge, or deployment.
