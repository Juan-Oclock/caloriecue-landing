# Macro Tracking Cheat Sheet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish an SEO-focused macro tracking article with a six-page email-gated PDF, reliable Resend delivery, separate lead analytics, and verified CalorieCue conversion paths.

**Architecture:** Add a macro-specific content/data module, React PDF renderer, download route, email route, and client form while leaving the proven calorie-cheat-sheet pipeline unchanged. Expose the form through the existing MDX component registry, record new subscribers through the existing `generate_lead` event with a distinct lead type, and use the existing dynamic blog loader and structured-data pipeline for publication.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, MDX, `@react-pdf/renderer`, Resend, GA4 `gtag`, Vitest, Testing Library, Tailwind CSS, ImageGen, `sips`.

## Global Constraints

- Work only on `codex/macro-tracking-cheat-sheet`; never involve the long-lived `content/draft` branch.
- Preserve the existing calorie-cheat-sheet form and API behavior.
- The asset is five printable reference pages plus a cover: six physical PDF pages.
- Do not present `40/30/30` or another macro ratio as universally optimal.
- Use USDA FoodData Central for generic food values and primary federal/standards sources for factual nutrition claims.
- Give every food row one typed FoodData Central source record (FDC ID, exact description, data type, serving grams, per-100g macros, and preparation state), and derive displayed macros by scale-and-round. Use generic FNDDS FDC 2710745 for whey because the historical branded record is unavailable in the current official archive.
- Preparation state must be explicit where material: raw, cooked, drained, skinless, fat percentage, or added oil.
- Keep the new search intent separate from `/blog/how-to-count-macros` and `/blog/calorie-counting-cheat-sheet`.
- Fire `generate_lead` only when the backend returns `success: true` and `leadCreated: true`.
- Use the existing tracked App Store components; do not add untracked App Store links.
- Reuse the existing Resend audience ID and deployment-aware fallback-link behavior.
- Read at most 4,096 request bytes as unknown JSON; validate `{ email, website }`, cap normalized email at 254 characters, reject the honeypot, and fail closed without a trusted client IP.
- Use the service-role-only atomic Supabase limiter (IP 10/15 minutes; normalized email 3/hour) before PDF, contact, or email work. The keyed secret must contain at least 32 random bytes.
- Enforce one 12-second server budget. Rate limiting (1.5 seconds), PDF (5 seconds), contact resolution (1 second), and Resend (8 seconds) each use the smaller of their stage cap and the remaining request budget. The browser waits 15 seconds, preserving a three-second transport margin.
- Pass a deterministic, privacy-safe Resend idempotency key for every delivery. A provider deadline is `deliveryStatus: "uncertain"`; UI copy tells readers to check the inbox before retrying and never claims immediate failure or success.
- Do not stage or modify `public/social/facebook/`, `public/social/instagram/`, or `video/`.
- Do not push, merge, deploy, publish social assets, or create a carousel without explicit user approval.

## File responsibility map

- `src/lib/macro-cheat-sheet/data.ts`: typed, source-reviewed macro food and worked-meal data; no rendering or networking.
- `src/lib/macro-cheat-sheet/MacroCheatSheetDocument.tsx`: six-page React PDF layout, memoized renderer, and filename export.
- `src/lib/macro-cheat-sheet/delivery-budget.ts`: shared client/server deadline constants and absolute remaining-budget coordinator.
- `src/lib/macro-cheat-sheet/delivery-security.ts`: minimum-secret enforcement and delivery idempotency keys.
- `src/lib/macro-cheat-sheet/rate-limit.ts`: HMAC identity derivation and the bounded Supabase RPC call.
- `src/app/api/macro-cheat-sheet/pdf/route.ts`: cached PDF download response only.
- `src/app/api/macro-cheat-sheet-download/route.ts`: email validation, Resend contact resolution, attachment/fallback delivery, and response contract.
- `src/components/blog/MacroCheatSheetForm.tsx`: macro-specific email-gate UI and client analytics.
- `src/components/blog/MDXComponents.tsx`: makes `<MacroCheatSheetForm />` available to one MDX article.
- `src/lib/analytics.ts`: adds the typed `macro_cheat_sheet` lead value without changing event shape.
- `content/blog/macro-tracking-cheat-sheet.mdx`: article, SEO metadata, FAQs, forms, internal links, and tracked app CTA.
- `public/blog/macro-tracking-cheat-sheet.webp`: title-overlay-safe editorial cover image.
- `next.config.ts`: bundles PDF fonts/logo/mockup into both new serverless routes.
- `supabase/migrations/20260809233743_macro_cheat_sheet_rate_limits.sql`: private counters and atomic service-role RPC; apply before application rollout, never as part of local implementation.

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

export type FoodDataType = "SR Legacy" | "Foundation" | "Survey (FNDDS)";

export type FoodSource = {
  fdcId: number;
  description: string;
  dataType: FoodDataType;
  servingGrams: number;
  per100g: MacroTotals;
  preparationState: string;
};

export type MacroFood = MacroTotals & {
  name: string;
  serving: string;
  source: FoodSource;
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

Populate the exact food sets below from current official USDA FoodData Central archive records. Construct each row from its required `FoodSource`, calculate `servingGrams / 100`, and round the four scaled per-100g values; tests must reject hand-entered display macros that drift from that source record. Use generic Survey (FNDDS) FDC 2710745 for whey because the historical branded fixture is unavailable.

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
      language="en-US"
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

const pdfRenderCoordinator = createPdfRenderCoordinator({
  render: () => renderToBuffer(<MacroCheatSheetDocument />),
  timeoutMs: 5_000,
  circuitCooldownMs: 30_000,
});

export const renderMacroCheatSheetPdf = () => pdfRenderCoordinator.render();

export const MACRO_CHEAT_SHEET_PDF_FILENAME =
  "caloriecue-macro-tracking-cheat-sheet.pdf";
```

Implement all six private page components in the same module so their inputs match the calls above exactly. Add page bookmarks, and keep the HTML article as the accessible equivalent because React PDF 4.5.1 has no stable semantic-table tagging API. `MacroCoverPage` renders the approved title, subtitle, five content pills, brand mark, `caloriecue.app`, and `5 printable sheets + cover`. `MacroQuickStartPage` renders the 4/4/9 equation, four blank target fields, one gram-to-calorie worked example, and the protein-first workflow. `ProteinReferencePage` renders every `proteinFoods` row. `CarbFatReferencePage` renders all three supplied lists in named sections. `MealBuilderPage` renders the four-step framework, all three meal examples, and two blank repeatable-meal boxes. `MacroLogPage` renders seven day rows, four weekly-average fields, the consistency note, and the app CTA. Use reusable `MacroTable`, `PageHeader`, `Footer`, and `MacroTotalsRow` components inside this file. Show `P`, `C`, and `F` labels in addition to color so the document never relies on color alone. The protein-efficiency marker is defined as at least `0.10 g protein per kcal` and must be explained in the legend.

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
- Create: `src/lib/macro-cheat-sheet/delivery-budget.ts`
- Create: `src/lib/macro-cheat-sheet/delivery-security.ts`
- Create: `src/lib/macro-cheat-sheet/rate-limit.ts`
- Create: `src/lib/macro-cheat-sheet/__tests__/delivery-budget.test.ts`
- Create: `src/lib/macro-cheat-sheet/__tests__/rate-limit.test.ts`
- Create: `src/lib/supabase/service-role.ts`
- Create: `supabase/migrations/20260809233743_macro_cheat_sheet_rate_limits.sql`

**Interfaces:**
- Consumes: PDF renderer and filename from Task 1.
- Produces: `POST(req: NextRequest): Promise<NextResponse>` accepting bounded unknown JSON that validates to `{ email: string, website?: string }` and returning `{ success: true, leadCreated: boolean, deliveryMode: "attached" | "link_only" }`, an ordinary `{ error: string }`, or retryable `{ error: string, deliveryStatus: "uncertain" }` when provider completion cannot be confirmed.
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
  rateLimit: vi.fn(),
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

function request(email: unknown = "Reader@Example.com", headers = new Headers()) {
  const requestHeaders = new Headers(headers);
  requestHeaders.set("content-type", "application/json");
  requestHeaders.set("x-forwarded-for", "203.0.113.9");
  return new NextRequest(
    "https://caloriecue.app/api/macro-cheat-sheet-download",
    {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify({ email, website: "" }),
    },
  );
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
  expect.objectContaining({ idempotencyKey: expect.any(String) }),
);
```

Cover all of these cases with named tests:

1. malformed JSON, `null`, arrays, non-object roots, invalid email types/addresses, a filled honeypot, and email over 254 characters return `400` before downstream work;
2. a body over 4,096 bytes returns `413` before downstream work;
3. distributed IP/email limits return `429` plus `Retry-After`, while missing IP/secret, a short secret, RPC error, malformed RPC data, or limiter timeout fails closed with retryable `503`;
4. missing `RESEND_API_KEY` returns `500` before PDF or email work;
5. new/existing contact and contact failure/timeout behavior remain non-blocking and truthful;
6. attached and link-only delivery use distinct truthful subjects, bodies, payloads, and success modes, and email has no App Store URL;
7. forwarded origins accept only canonical production, configured Vercel hosts, or local development and reject hostile values;
8. cumulative near-limit stages stop at the one 12-second request budget;
9. a link-only Resend promise settling after its local deadline returns uncertain delivery, and an attached retry for the same normalized email supplies the exact same campaign/version HMAC key with no raw email;
10. client/server ordering proves 12 seconds server + 3 seconds transport margin = 15 seconds client.

- [ ] **Step 2: Run the route test and verify the missing-module failure**

Run: `npm run test:run -- src/app/api/macro-cheat-sheet-download/__tests__/route.test.ts`

Expected: FAIL because the macro delivery route does not exist.

- [ ] **Step 3: Implement the isolated, bounded macro email route**

Read the streaming body to a 4,096-byte maximum, parse it as `unknown`, then validate the root object, optional string honeypot, normalized email, maximum length, and trusted client IP. Consume the atomic Supabase RPC before PDF/contact/email work. Its migration stores only HMAC identities, forces RLS, revokes public/anon/authenticated privileges, grants the table and RPC only to `service_role`, and fixes the security-definer function's `search_path` to empty. `MACRO_CHEAT_SHEET_RATE_LIMIT_SECRET` must hold at least 32 random bytes.

Create one `ServerRequestBudget` at route entry. Body parsing cannot pass its absolute 12-second deadline; rate limiting, PDF rendering, contact resolution, and Resend receive `min(stage cap, remaining server time)` using caps of 1.5, 5, 1, and 8 seconds. This prevents independent sequential timers from exceeding the declared server maximum.

The email must state `five printable reference sheets plus a cover`, list the quick start, three food charts, meal builder, and seven-day log, and retain the deployment-aware download button. Attached delivery uses subject `Your Macro Tracking Cheat Sheet (PDF inside)` and includes the PDF. Render failure uses subject `Your Macro Tracking Cheat Sheet download link`, contains no attachment claim, and has no attachment payload. Neither email mode includes a direct App Store CTA; the tracked App Store conversion stays in the article.

Call the installed Resend SDK as `resend.emails.send(payload, { idempotencyKey })`. Derive a key from immutable campaign/version plus normalized email only with HMAC-SHA256 and the existing rate-limit secret. Do not include mutable attachment/link-only outcome: a timed-out link-only request may retry after the PDF renderer recovers, and both provider calls must deduplicate under one key. Keep the key stable across clock boundaries and let Resend's rolling 24-hour key retention define the retry window; it contains no raw email and remains within Resend's 256-character maximum. If Resend misses its local/remaining deadline, return retryable `503` plus `deliveryStatus: "uncertain"` and instruct the reader to check the inbox before retrying. Do not call or modify the calorie route.

- [ ] **Step 4: Run the macro and legacy delivery suites**

Run: `npm run test:run -- src/app/api/macro-cheat-sheet-download/__tests__/route.test.ts src/app/api/cheat-sheet-download/__tests__/route.test.ts src/lib/macro-cheat-sheet/__tests__/rate-limit.test.ts src/lib/macro-cheat-sheet/__tests__/delivery-budget.test.ts`

Expected: PASS for the new route and unchanged legacy route.

- [ ] **Step 5: Commit the email delivery flow**

```bash
git add src/app/api/macro-cheat-sheet-download/route.ts src/app/api/macro-cheat-sheet-download/__tests__/route.test.ts src/lib/macro-cheat-sheet/delivery-budget.ts src/lib/macro-cheat-sheet/delivery-security.ts src/lib/macro-cheat-sheet/rate-limit.ts src/lib/macro-cheat-sheet/__tests__/delivery-budget.test.ts src/lib/macro-cheat-sheet/__tests__/rate-limit.test.ts src/lib/supabase/service-role.ts supabase/migrations/20260809233743_macro_cheat_sheet_rate_limits.sql
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
    body: JSON.stringify({ email: "reader@example.com", website: "" }),
    signal: expect.any(AbortSignal),
  }),
);
expect(trackGenerateLead).toHaveBeenCalledWith({
  leadType: "macro_cheat_sheet",
  location: "cheat_sheet_form",
  contentSlug: "macro-tracking-cheat-sheet",
});
```

Also cover invalid input, repeat contact, failed backend request, malformed HTTP-200 payload, disabled/pending button, unique accessible IDs for two form instances, truthful attached/link-only success copy, backend `deliveryStatus: "uncertain"`, and a hung fetch that remains active through the 12-second server budget before aborting at 15 seconds with announced check-inbox guidance.

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
const controller = new AbortController();
await fetch("/api/macro-cheat-sheet-download", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: email.toLowerCase().trim(),
    website,
  }),
  signal: controller.signal,
});

trackGenerateLead({
  leadType: "macro_cheat_sheet",
  location: "cheat_sheet_form",
  contentSlug,
});
```

Race the fetch against `CLIENT_REQUEST_TIMEOUT_MS = 15_000`, three seconds beyond the server's absolute 12-second budget. Only a validated HTTP-200 success payload may set a delivery mode or fire analytics. Normalize any uncertain provider response or browser abort to `We could not confirm delivery. Check your inbox before retrying.` Visible form copy must accurately say `5 printable reference sheets plus a cover` and list protein, carbohydrate, fat, meal-builder, and seven-day-log content. Keep `No spam, ever. Unsubscribe anytime.`

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
    expect(post?.content.match(/<MacroCheatSheetForm \/>/g)).toHaveLength(2);
    expect(post?.content).toContain("<AppStoreLink />");
    for (const href of [
      "/blog/how-to-count-macros",
      "/blog/calories-per-gram",
      "/blog/protein-per-calorie",
      "/blog/calorie-counting-vs-macro-counting",
      "/blog/high-protein-low-calorie-foods",
      "/blog/high-protein-meals-under-500-calories",
      "/tdee-calculator",
    ]) {
      expect(post?.content).toContain(`](${href})`);
    }

    const firstForm = post?.content.indexOf("<MacroCheatSheetForm />") ?? -1;
    const previewHeading =
      post?.content.indexOf("## What Is Inside the Printable Macro Tracking Sheet?") ?? -1;
    const nextHeading =
      post?.content.indexOf("## How to Use a Protein, Carb and Fat Food List") ?? -1;
    expect(firstForm).toBeGreaterThan(previewHeading);
    expect(firstForm).toBeLessThan(nextHeading);
    expect(post?.content.trim().split(/\s+/).length).toBeGreaterThanOrEqual(2_000);
  });

  it("links adjacent guides to the distinct printable intent", () => {
    expect(getPostBySlug("how-to-count-macros")?.content).toContain(
      "[macro tracking cheat sheet](/blog/macro-tracking-cheat-sheet)",
    );
    expect(getPostBySlug("calorie-counting-cheat-sheet")?.content).toContain(
      "[macro tracking cheat sheet](/blog/macro-tracking-cheat-sheet)",
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

The article must include preview tables with at least eight protein foods, eight carbohydrate foods, six fat foods, and six mixed foods; use the same rounded values as `data.ts`. Explain the 4/4/9 rule with a citation to federal labeling guidance, link to USDA FoodData Central for the data policy, and include one authoritative source for population-level macronutrient ranges while explicitly stating that the article does not prescribe an individual ratio. Place the first `<MacroCheatSheetForm />` after the complete H2 2 preview and before H2 3 so the outline never jumps from the article H1 into the form's H3. Place the second form under H2 12. Keep the only article App Store conversion as the tracked React `<AppStoreLink />` after `Plan with the sheet; track with a photo.`; do not place an App Store URL in either email mode.

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
  src/lib/macro-cheat-sheet/__tests__/delivery-budget.test.ts \
  src/lib/macro-cheat-sheet/__tests__/rate-limit.test.ts \
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

Run: `npm run build`

Run: `npm run verify:static-routes`

Expected: all commands exit `0`; Next.js statically generates `/blog/macro-tracking-cheat-sheet` and both API routes compile for the Node runtime.

Release order is a separate, approval-gated operation: apply and verify `20260809233743_macro_cheat_sheet_rate_limits.sql` in the target Supabase environment first; then configure the same environment's Supabase URL, matching service-role key, minimum-32-random-byte limiter secret, and Resend key before deploying the application. Production is enabled by default. Preview/local remain disabled unless explicitly approved with their own isolated non-production Supabase projects and credentials—never Production service-role credentials. To roll back, redeploy the prior application first and retain the additive table/RPC until no deployed version calls it. Do not apply a remote migration or deploy while executing this local plan.

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
