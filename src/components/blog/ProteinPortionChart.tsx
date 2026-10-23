import { mealBases, mealTotals, nutrients, portionFoods, proteinLabel, sourceUrl } from "@/lib/protein-portions/data";

export default function ProteinPortionChart() {
  return <section aria-label="Eight food portions providing about 30 grams of protein" className="my-8">
    <p className="mb-4 text-sm text-muted-foreground">Each bar compares food weight, not volume. Portions provide approximately 30g protein; numbers are estimates.</p>
    <div className="grid gap-4 sm:grid-cols-2">
      {portionFoods.map((food) => {
        const totals = nutrients(food.id, food.grams);
        return <article key={food.id} className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-start justify-between gap-3"><h3 className="text-lg font-bold leading-tight text-foreground">{food.name}</h3>{food.plant && <span className="shrink-0 rounded-full bg-[#EEF2E5] px-2 py-1 text-xs font-semibold text-[#455238]">Plant-based</span>}</div>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">{food.grams}g <span className="text-sm font-normal text-muted-foreground">/ {(food.grams / 28.349523125).toFixed(1)} oz</span></p>
          <div aria-hidden="true" className="my-3 h-2 overflow-hidden rounded-full bg-[#EEE8E1]"><div className={`h-full rounded-full ${food.plant ? "bg-[#7D8A60]" : "bg-primary"}`} style={{ width: `${food.grams / 335 * 100}%` }} /></div>
          <p className="text-sm font-semibold text-foreground">{proteinLabel(totals.protein)}g protein · {Math.round(totals.calories)} kcal</p>
          <p className="mt-2 text-sm leading-relaxed text-[#3C342F]">{food.cue}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{food.state}. <a className="underline underline-offset-2" href={sourceUrl(food.fdcId)}>USDA source</a></p>
        </article>;
      })}
    </div>
  </section>;
}

export function ProteinPortionMeals() {
  return <div className="my-8 grid gap-4 sm:grid-cols-2">{mealBases.map((meal) => {
    const total = mealTotals(meal);
    return <article key={meal.name} className="rounded-2xl border border-border bg-[#FCFAF7] p-5">
      <h3 className="text-lg font-bold text-foreground">{meal.name}</h3>
      <p className="mt-2 text-base leading-relaxed text-[#3C342F]">{meal.description}.</p>
      <p className="mt-3 text-sm font-semibold text-primary-dark">{proteinLabel(total.protein)}g protein · {Math.round(total.calories)} kcal</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Protein base only. Add and log your vegetables, starches, oil, sauces or toppings separately.</p>
    </article>;
  })}</div>;
}
