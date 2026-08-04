"use client";

import { useMemo, useState } from "react";

type IngredientRow = {
  id: number;
  name: string;
  calories: string;
};

type YieldInputs = {
  servings: string;
  finishedWeight: string;
  portionWeight: string;
};

const EXAMPLE_INGREDIENTS: IngredientRow[] = [
  { id: 1, name: "Ground turkey", calories: "640" },
  { id: 2, name: "Kidney beans", calories: "420" },
  { id: 3, name: "Crushed tomatoes", calories: "180" },
  { id: 4, name: "Olive oil", calories: "120" },
  { id: 5, name: "Onion, corn, and peppers", calories: "340" },
];

const EXAMPLE_YIELD: YieldInputs = {
  servings: "5",
  finishedWeight: "2000",
  portionWeight: "400",
};

const EMPTY_INGREDIENT: IngredientRow = { id: 1, name: "", calories: "" };
const EMPTY_YIELD: YieldInputs = {
  servings: "",
  finishedWeight: "",
  portionWeight: "",
};

function parsePositiveNumber(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function formatCalories(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${Math.round(value).toLocaleString("en-US")} calories`;
}

export default function HomemadeRecipeCalorieCalculator() {
  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    EXAMPLE_INGREDIENTS,
  );
  const [yieldInputs, setYieldInputs] = useState<YieldInputs>(EXAMPLE_YIELD);

  const totals = useMemo(() => {
    const totalCalories = ingredients.reduce(
      (sum, ingredient) => sum + parsePositiveNumber(ingredient.calories),
      0,
    );
    const servings = parsePositiveNumber(yieldInputs.servings);
    const finishedWeight = parsePositiveNumber(yieldInputs.finishedWeight);
    const portionWeight = parsePositiveNumber(yieldInputs.portionWeight);

    return {
      totalCalories,
      perServing:
        totalCalories > 0 && servings > 0 ? totalCalories / servings : null,
      perHundredGrams:
        totalCalories > 0 && finishedWeight > 0
          ? (totalCalories / finishedWeight) * 100
          : null,
      portionCalories:
        totalCalories > 0 && finishedWeight > 0 && portionWeight > 0
          ? (totalCalories / finishedWeight) * portionWeight
          : null,
    };
  }, [ingredients, yieldInputs]);

  function updateIngredient(
    id: number,
    field: "name" | "calories",
    value: string,
  ) {
    setIngredients((current) =>
      current.map((ingredient) =>
        ingredient.id === id ? { ...ingredient, [field]: value } : ingredient,
      ),
    );
  }

  function addIngredient() {
    setIngredients((current) => {
      const nextId = Math.max(0, ...current.map((ingredient) => ingredient.id)) + 1;
      return [...current, { id: nextId, name: "", calories: "" }];
    });
  }

  function removeIngredient(id: number) {
    setIngredients((current) => {
      if (current.length === 1) return current;
      return current.filter((ingredient) => ingredient.id !== id);
    });
  }

  function loadExample() {
    setIngredients(EXAMPLE_INGREDIENTS.map((ingredient) => ({ ...ingredient })));
    setYieldInputs(EXAMPLE_YIELD);
  }

  function clearCalculator() {
    setIngredients([{ ...EMPTY_INGREDIENT }]);
    setYieldInputs(EMPTY_YIELD);
  }

  return (
    <section
      aria-label="Homemade recipe calorie calculator"
      className="not-prose my-10 overflow-hidden rounded-3xl border border-[#E8DDD5] bg-[#FBF8F3] shadow-[0_24px_70px_rgba(69,49,36,0.10)]"
    >
      <div className="relative overflow-hidden border-b border-[#E8DDD5] bg-white px-5 py-6 sm:px-8">
        <div
          aria-hidden="true"
          className="absolute -right-12 -top-16 h-36 w-36 rounded-full bg-primary/10 blur-2xl"
        />
        <div className="relative flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-black text-white shadow-sm">
            +
          </span>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-primary-dark">
              Interactive recipe worksheet
            </p>
            <h2 className="m-0 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Homemade Food Calorie Calculator
            </h2>
            <p className="mb-0 mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Enter the calories for every edible ingredient, then divide the
              finished recipe by servings or by weight. The example below is a
              five-serving turkey and bean chili.
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark">
              Step 1
            </p>
            <h3 className="m-0 mt-1 text-lg font-extrabold text-foreground">
              Add every ingredient
            </h3>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            Use the total amount added
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#E8DDD5] bg-white">
          <div className="hidden grid-cols-[minmax(0,1fr)_9rem_2.5rem] gap-3 border-b border-[#EFE6DF] bg-[#FFF9F5] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground sm:grid">
            <span>Ingredient</span>
            <span>Calories added</span>
            <span className="sr-only">Actions</span>
          </div>

          <div className="divide-y divide-[#EFE6DF]">
            {ingredients.map((ingredient, index) => (
              <div
                key={ingredient.id}
                className="grid gap-3 px-3 py-3 sm:grid-cols-[minmax(0,1fr)_9rem_2.5rem] sm:items-center sm:px-4"
              >
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-2 text-xs font-bold text-muted-foreground sm:sr-only">
                    Ingredient {index + 1} name
                  </span>
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FFF0E9] text-xs font-black text-primary-dark"
                    >
                      {index + 1}
                    </span>
                    <input
                      aria-label={`Ingredient ${index + 1} name`}
                      type="text"
                      placeholder="Ingredient name"
                      value={ingredient.name}
                      onChange={(event) =>
                        updateIngredient(ingredient.id, "name", event.target.value)
                      }
                      className="min-w-0 flex-1 rounded-xl border border-border bg-[#FCFCFA] px-3 py-2.5 text-sm font-semibold text-foreground outline-none transition placeholder:font-normal focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-muted-foreground sm:sr-only">
                    Ingredient {index + 1} calories
                  </span>
                  <div className="relative">
                    <input
                      aria-label={`Ingredient ${index + 1} calories`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="1"
                      placeholder="0"
                      value={ingredient.calories}
                      onChange={(event) =>
                        updateIngredient(
                          ingredient.id,
                          "calories",
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-border bg-[#FCFCFA] py-2.5 pl-3 pr-10 text-sm font-extrabold text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-muted-foreground">
                      cal
                    </span>
                  </div>
                </label>

                <button
                  type="button"
                  aria-label={`Remove ingredient ${index + 1}`}
                  title={`Remove ingredient ${index + 1}`}
                  disabled={ingredients.length === 1}
                  onClick={() => removeIngredient(ingredient.id)}
                  className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-transparent text-lg text-muted-foreground transition hover:border-[#F3D6CA] hover:bg-[#FFF5F1] hover:text-primary-dark disabled:cursor-not-allowed disabled:opacity-30 sm:w-10"
                >
                  <span aria-hidden="true">×</span>
                  <span className="ml-2 text-xs font-bold sm:sr-only">Remove</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addIngredient}
            className="rounded-full border border-primary/30 bg-white px-4 py-2 text-sm font-bold text-primary-dark transition hover:border-primary hover:bg-primary/5"
          >
            + Add ingredient
          </button>
          <button
            type="button"
            onClick={loadExample}
            className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-primary/5"
          >
            Load example
          </button>
          <button
            type="button"
            onClick={clearCalculator}
            className="rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-black/5 hover:text-foreground"
          >
            Clear
          </button>
        </div>

        <div className="mt-7">
          <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark">
            Step 2
          </p>
          <h3 className="m-0 mt-1 text-lg font-extrabold text-foreground">
            Describe the finished recipe
          </h3>
          <p className="mb-4 mt-1 text-sm leading-relaxed text-muted-foreground">
            Servings gives a quick split. Finished and portion weights give a
            more precise answer when portions are uneven.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="rounded-2xl border border-[#E8DDD5] bg-white p-4 shadow-sm focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10">
              <span className="mb-2 block text-sm font-bold text-foreground">
                Number of servings
              </span>
              <input
                aria-label="Number of servings"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                placeholder="e.g. 5"
                value={yieldInputs.servings}
                onChange={(event) =>
                  setYieldInputs((current) => ({
                    ...current,
                    servings: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-border bg-[#FCFCFA] px-3 py-2.5 text-lg font-extrabold text-foreground outline-none focus:border-primary"
              />
            </label>

            <label className="rounded-2xl border border-[#E8DDD5] bg-white p-4 shadow-sm focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10">
              <span className="mb-2 block text-sm font-bold text-foreground">
                Finished recipe weight
              </span>
              <div className="relative">
                <input
                  aria-label="Finished recipe weight in grams"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  placeholder="e.g. 2000"
                  value={yieldInputs.finishedWeight}
                  onChange={(event) =>
                    setYieldInputs((current) => ({
                      ...current,
                      finishedWeight: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-border bg-[#FCFCFA] py-2.5 pl-3 pr-9 text-lg font-extrabold text-foreground outline-none focus:border-primary"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-bold text-muted-foreground">
                  g
                </span>
              </div>
            </label>

            <label className="rounded-2xl border border-[#E8DDD5] bg-white p-4 shadow-sm focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10">
              <span className="mb-2 block text-sm font-bold text-foreground">
                Portion weight
              </span>
              <div className="relative">
                <input
                  aria-label="Portion weight in grams"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  placeholder="e.g. 400"
                  value={yieldInputs.portionWeight}
                  onChange={(event) =>
                    setYieldInputs((current) => ({
                      ...current,
                      portionWeight: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-border bg-[#FCFCFA] py-2.5 pl-3 pr-9 text-lg font-extrabold text-foreground outline-none focus:border-primary"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-bold text-muted-foreground">
                  g
                </span>
              </div>
            </label>
          </div>
        </div>

        <div
          role="status"
          aria-live="polite"
          className="mt-7 overflow-hidden rounded-3xl bg-[#241F1B] text-white shadow-lg"
        >
          <div className="border-b border-white/10 px-5 py-5 sm:px-7">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#F6A88E]">
              Recipe result
            </p>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="m-0 text-sm font-semibold text-white/55">
                  Total recipe
                </p>
                <p className="m-0 mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                  {formatCalories(
                    totals.totalCalories > 0 ? totals.totalCalories : null,
                  )}
                </p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/65">
                Updates as you type
              </span>
            </div>
          </div>

          <div className="grid gap-px bg-white/10 sm:grid-cols-3">
            <div className="bg-[#241F1B] px-5 py-5">
              <p className="m-0 text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                Per serving
              </p>
              <p className="m-0 mt-2 text-2xl font-black">
                {formatCalories(totals.perServing)}
              </p>
            </div>
            <div className="bg-[#241F1B] px-5 py-5">
              <p className="m-0 text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                Per 100 grams
              </p>
              <p className="m-0 mt-2 text-2xl font-black">
                {formatCalories(totals.perHundredGrams)}
              </p>
            </div>
            <div className="bg-[#241F1B] px-5 py-5">
              <p className="m-0 text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                Your portion
              </p>
              <p className="m-0 mt-2 text-2xl font-black">
                {formatCalories(totals.portionCalories)}
              </p>
            </div>
          </div>

          <p className="mb-0 px-5 py-4 text-xs leading-relaxed text-white/50 sm:px-7">
            {totals.totalCalories > 0
              ? "For the best estimate, include oils, sauces, toppings, and every other edible ingredient."
              : "Add ingredient calories to see results. Enter servings or weights for the yield calculations."}
          </p>
        </div>
      </div>
    </section>
  );
}
