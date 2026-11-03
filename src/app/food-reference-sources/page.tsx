import type { Metadata } from "next";
import { Navigation, Footer } from "@/components";
import sourceAudit from "../../../assets/ebooks/calorie-counting-guide/food-reference-audit.json";

export const metadata: Metadata = {
  title: "Food Reference Sources",
  description:
    "Sources, serving weights, and calorie estimates for the 80 foods in CalorieCue’s calorie counting guide.",
  alternates: { canonical: "https://caloriecue.app/food-reference-sources" },
};

type SourceRow = {
  name: string;
  serving: string;
  calories: string;
  grams?: number;
  fdc_id?: number;
  source_description: string;
  source_url: string;
};

const rows: SourceRow[] = sourceAudit;
const csvUrl = "/downloads/caloriecue-food-reference-sources.csv?download=1";

export default function FoodReferenceSources() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6">
        <a
          href="/blog/calorie-counting-cheat-sheet"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Back to the calorie counting guide
        </a>
        <header className="mt-7 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Calorie Counting Made Simple
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Food reference sources
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            The serving details and sources behind the guide’s 80 food entries.
            Browse them below, or download the spreadsheet to keep a copy.
          </p>
          <a
            href={csvUrl}
            download="caloriecue-food-reference-sources.csv"
            className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Download CSV
          </a>
          <p className="mt-3 text-sm text-muted-foreground">
            80 entries · CSV spreadsheet · Reviewed November 3, 2026
          </p>
        </header>

        <section
          aria-labelledby="reference-notes"
          className="mt-9 rounded-2xl border border-border bg-card p-5 sm:p-6"
        >
          <h2 id="reference-notes" className="font-semibold">
            How to read these estimates
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground">
            These are representative portions, not universal values or recommended
            amounts. Most entries use USDA FoodData Central; four use a documented
            recipe estimate or package-label example. Calories are rounded for
            quick reference. Brands, recipes, and preparation can change the
            numbers, so use your own product’s label when available.
          </p>
          <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground">
            Reference weights are edible portions used in the calculation. Meat
            and fish weights are cooked, except ground meats marked raw; tuna is
            drained. Drinks use U.S. fluid ounces. Open an entry’s reference details
            for its specific food description or calculation.
          </p>
        </section>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <caption className="sr-only">
              All 80 guide entries with serving sizes, calories, reference weights,
              and links to their sources.
            </caption>
            <thead className="bg-secondary">
              <tr>
                {["Food", "Listed serving", "Calories", "Reference weight", "Source"].map(
                  (heading) => (
                    <th key={heading} scope="col" className="px-4 py-4 font-semibold">
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.name}>
                  <th scope="row" className="px-4 py-4 align-top font-medium">
                    {row.name}
                  </th>
                  <td className="whitespace-nowrap px-4 py-4 align-top">{row.serving}</td>
                  <td className="whitespace-nowrap px-4 py-4 align-top">{row.calories} kcal</td>
                  <td className="whitespace-nowrap px-4 py-4 align-top">
                    {row.grams !== undefined ? `${row.grams} g` : "See details"}
                  </td>
                  <td className="max-w-sm px-4 py-4 align-top">
                    <a href={row.source_url} className="font-medium text-primary underline underline-offset-2">
                      {row.fdc_id ? `USDA FDC ${row.fdc_id}` : "Label / recipe source"}
                    </a>
                    <details className="mt-2 text-muted-foreground">
                      <summary className="cursor-pointer text-xs">Reference details</summary>
                      <p className="mt-2 text-xs leading-relaxed">{row.source_description}</p>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
}
