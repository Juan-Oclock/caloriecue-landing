"use client";

import { useMemo, useRef, useState } from "react";
import {
  PROTEIN_EFFICIENCY_FOODS,
  caloriesPer10gProtein,
  filterFoods,
  proteinPer100Calories,
  sameCaloriesProtein,
  sameProteinCalories,
  serializeProteinFoodsCsv,
  sortFoods,
  type ProteinEfficiencyCategory,
  type ProteinEfficiencyFood,
  type ProteinSortKey,
  type SortDirection,
} from "@/lib/blog/protein-efficiency";
import {
  trackProteinSwapInteraction,
  type ProteinSwapAction,
  type ProteinSwapAnalyticsAdapter,
} from "@/lib/blog/protein-swap-analytics";

type ComparisonMode = "same-calories" | "same-protein";

const CATEGORIES: Array<{ value: ProteinEfficiencyCategory | "all"; label: string }> = [
  { value: "all", label: "All foods" },
  { value: "snack", label: "Nuts, seeds & snacks" },
  { value: "breakfast", label: "Breakfast" },
  { value: "dairy", label: "Dairy" },
  { value: "plant", label: "Plant foods" },
  { value: "convenience", label: "Convenience & lean swaps" },
];

const round1 = (value: number) => Math.round(value * 10) / 10;
const formatCalories = (value: number) => String(Math.round(value));
const formatProtein = (value: number) => round1(value).toFixed(1);

function foodById(id: string): ProteinEfficiencyFood {
  return PROTEIN_EFFICIENCY_FOODS.find((food) => food.id === id) ?? PROTEIN_EFFICIENCY_FOODS[0];
}

function FoodSummaryCard({ food }: { food: ProteinEfficiencyFood }) {
  const proteinCost = caloriesPer10gProtein(food);

  return (
    <article className="rounded-2xl border border-border/70 bg-[#fcfcfa] p-4 shadow-[0_1px_0_rgb(15_23_42_/_0.03)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Serving snapshot</p>
      <h3 className="mt-1 text-base font-extrabold tracking-tight text-foreground">{food.name}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{food.serving}</p>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Calories</dt>
          <dd className="mt-0.5 font-bold text-foreground">{formatCalories(food.calories)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Protein</dt>
          <dd className="mt-0.5 font-bold text-foreground">{formatProtein(food.proteinGrams)} g</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Per 100 cal</dt>
          <dd className="mt-0.5 font-bold text-foreground">{formatProtein(proteinPer100Calories(food))} g</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Protein Cost</dt>
          <dd className="mt-0.5 font-bold text-foreground">
            {proteinCost === null ? "Not meaningful" : `${Math.round(proteinCost)} cal`}
          </dd>
        </div>
      </dl>
    </article>
  );
}

export default function ProteinSwapExplorer({
  analytics,
}: {
  analytics?: ProteinSwapAnalyticsAdapter;
} = {}) {
  const [selectedId, setSelectedId] = useState("peanut-butter");
  const selected = foodById(selectedId);
  const [comparisonId, setComparisonId] = useState(selected.swapTargetId);
  const comparison = foodById(comparisonId);
  const [mode, setMode] = useState<ComparisonMode>("same-calories");
  const [category, setCategory] = useState<ProteinEfficiencyCategory | "all">("all");
  const [sortKey, setSortKey] = useState<ProteinSortKey>("proteinCost");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const tracked = useRef(false);

  const trackOnce = (action: ProteinSwapAction) => {
    if (tracked.current) return;
    tracked.current = true;
    try {
      trackProteinSwapInteraction(action, analytics);
    } catch {
      // Analytics is optional; interaction and download behavior must remain available.
    }
  };

  const visibleFoods = useMemo(
    () => sortFoods(filterFoods(PROTEIN_EFFICIENCY_FOODS, category), sortKey, sortDirection),
    [category, sortDirection, sortKey],
  );

  const comparisonProtein = sameCaloriesProtein(selected, comparison);
  const comparisonCalories = sameProteinCalories(selected, comparison);
  const sameCaloriesDifference = comparisonProtein - selected.proteinGrams;
  const sameProteinDifference = comparisonCalories === null ? null : selected.calories - comparisonCalories;
  const selectedVisualValue = mode === "same-calories" ? selected.proteinGrams : selected.calories;
  const comparisonVisualValue = mode === "same-calories" ? comparisonProtein : comparisonCalories ?? 0;
  const visualMax = Math.max(selectedVisualValue, comparisonVisualValue, 1);

  const result = mode === "same-calories"
    ? `At ${formatCalories(selected.calories)} calories, ${comparison.name} provides ${formatProtein(comparisonProtein)} g of protein versus ${formatProtein(selected.proteinGrams)} g from ${selected.name} — ${formatProtein(Math.abs(sameCaloriesDifference))} g ${sameCaloriesDifference >= 0 ? "more" : "less"} protein.`
    : comparisonCalories === null
      ? `${comparison.name} is not a meaningful protein source for this comparison.`
      : `To get ${formatProtein(selected.proteinGrams)} g of protein, ${comparison.name} takes about ${formatCalories(comparisonCalories)} calories versus ${formatCalories(selected.calories)} calories from ${selected.name} — ${formatCalories(Math.abs(sameProteinDifference ?? 0))} ${Number(sameProteinDifference) >= 0 ? "fewer" : "more"} calories.`;

  const handleSelectedFood = (id: string) => {
    const next = foodById(id);
    setSelectedId(next.id);
    setComparisonId(next.swapTargetId);
    trackOnce("select_food");
  };

  const handleDownload = () => {
    trackOnce("download_csv");
    let objectUrl: string | null = null;
    try {
      const blob = new Blob([serializeProteinFoodsCsv(PROTEIN_EFFICIENCY_FOODS)], {
        type: "text/csv;charset=utf-8",
      });
      objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = "caloriecue-protein-cost-foods.csv";
      anchor.click();
      setDownloadError(null);
    } catch {
      setDownloadError("The CSV could not be downloaded. The table is still available below.");
    } finally {
      if (objectUrl !== null) URL.revokeObjectURL(objectUrl);
    }
  };

  return (
    <section
      aria-labelledby="protein-swap-title"
      className="my-10 overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
    >
      <header className="border-b border-border/70 bg-[#fcfcfa] px-4 py-5 sm:px-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Interactive nutrition lab</p>
        <h2 id="protein-swap-title" className="mt-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Protein Swap Explorer
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Compare representative USDA values at the same calories or the same protein. Protein Cost means calories needed to obtain 10 g of protein—not overall food quality.
        </p>
      </header>

      <div className="p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-foreground" htmlFor="protein-current-food">
            Current food
            <select
              id="protein-current-food"
              value={selectedId}
              onChange={(event) => handleSelectedFood(event.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-white px-3 py-3 text-base font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {PROTEIN_EFFICIENCY_FOODS.map((food) => <option key={food.id} value={food.id}>{food.name}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold text-foreground" htmlFor="protein-comparison-food">
            Compare with
            <select
              id="protein-comparison-food"
              value={comparisonId}
              onChange={(event) => { setComparisonId(event.target.value); trackOnce("select_food"); }}
              className="mt-2 w-full rounded-xl border border-border bg-white px-3 py-3 text-base font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {PROTEIN_EFFICIENCY_FOODS.filter((food) => food.id !== selectedId).map((food) => <option key={food.id} value={food.id}>{food.name}</option>)}
            </select>
          </label>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-bold text-foreground">Comparison mode</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["same-calories", "same-protein"] as const).map((value) => (
              <label
                key={value}
                className="cursor-pointer rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground transition has-[:checked]:border-primary has-[:checked]:bg-primary-50"
              >
                <input
                  type="radio"
                  name="protein-comparison-mode"
                  value={value}
                  checked={mode === value}
                  onChange={() => { setMode(value); trackOnce("change_mode"); }}
                  className="mr-2 accent-primary"
                />
                {value === "same-calories" ? "Same calories" : "Same protein"}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <FoodSummaryCard food={selected} />
          <FoodSummaryCard food={comparison} />
        </div>

        <p role="status" aria-live="polite" className="mt-4 rounded-xl border-l-4 border-primary bg-primary-50 p-4 text-sm font-semibold leading-6 text-foreground">
          {result}
        </p>

        <div aria-label="Visual comparison of the selected foods" className="mt-4 rounded-xl border border-border bg-[#fcfcfa] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">At a glance</p>
          <div className="mt-3 space-y-3">
            {[
              { name: selected.name, value: selectedVisualValue, tone: "bg-slate-500" },
              { name: comparison.name, value: comparisonVisualValue, tone: "bg-primary" },
            ].map((item) => (
              <div key={item.name}>
                <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                  <span className="font-bold text-foreground">{item.name}</span>
                  <span className="shrink-0 font-semibold text-muted-foreground">{mode === "same-calories" ? formatProtein(item.value) : formatCalories(item.value)} {mode === "same-calories" ? "g protein" : "calories"}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                  <div className={`h-full rounded-full ${item.tone}`} style={{ width: `${Math.max((item.value / visualMax) * 100, 2)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {mode === "same-calories" ? "Longer means more protein at equal calories." : "Shorter means fewer calories for equal protein."}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <label className="text-sm font-bold text-foreground" htmlFor="protein-category">
              Food category
              <select
                id="protein-category"
                value={category}
                onChange={(event) => setCategory(event.target.value as ProteinEfficiencyCategory | "all")}
                className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold text-foreground" htmlFor="protein-sort">
              Sort foods by
              <select
                id="protein-sort"
                value={sortKey}
                onChange={(event) => { setSortKey(event.target.value as ProteinSortKey); trackOnce("sort_table"); }}
                className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="proteinCost">Protein Cost</option>
                <option value="proteinPer100Calories">Protein per 100 calories</option>
                <option value="calories">Calories per serving</option>
                <option value="proteinGrams">Protein per serving</option>
              </select>
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setSortDirection((value) => value === "asc" ? "desc" : "asc"); trackOnce("sort_table"); }}
              aria-label={`Sort ${sortDirection === "asc" ? "descending" : "ascending"}`}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-bold text-foreground outline-none transition hover:border-primary/50 hover:bg-primary-50 focus:ring-2 focus:ring-primary/20"
            >
              {sortDirection === "asc" ? "↑" : "↓"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white outline-none transition hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Download CSV
            </button>
          </div>
        </div>

        {downloadError && <p role="alert" className="mt-3 text-sm text-red-700">{downloadError}</p>}

        <div className="mt-4 max-w-full overflow-x-auto rounded-xl border border-border" tabIndex={0} aria-label="Scrollable 30-food protein cost table">
          <table className="min-w-[760px] border-collapse text-left text-sm">
            <caption className="sr-only">Thirty foods ranked by protein cost using representative USDA serving values</caption>
            <thead className="bg-muted">
              <tr>
                <th scope="col" className="p-3">Food</th>
                <th scope="col" className="p-3">Serving</th>
                <th scope="col" className="p-3">Calories</th>
                <th scope="col" className="p-3">Protein</th>
                <th scope="col" className="p-3">Protein / 100 cal</th>
                <th scope="col" className="p-3">Protein Cost</th>
                <th scope="col" className="p-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {visibleFoods.map((food) => {
                const proteinCost = caloriesPer10gProtein(food);
                return (
                  <tr key={food.id} className="border-t border-border align-top">
                    <th scope="row" className="p-3 font-semibold text-foreground">{food.name}</th>
                    <td className="p-3 text-foreground/85">{food.serving}</td>
                    <td className="p-3 text-foreground/85">{formatCalories(food.calories)}</td>
                    <td className="p-3 text-foreground/85">{formatProtein(food.proteinGrams)} g</td>
                    <td className="p-3 text-foreground/85">{formatProtein(proteinPer100Calories(food))} g</td>
                    <td className="p-3 text-foreground/85">{proteinCost === null ? "Not a meaningful protein source" : `${Math.round(proteinCost)} cal`}</td>
                    <td className="p-3">
                      <a href={food.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                        {food.sourceLabel.replace("USDA FoodData Central — ", "")}
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Representative values vary by brand, preparation, and serving. Use the linked USDA descriptions to inspect the source assumptions.
        </p>
      </div>
    </section>
  );
}
