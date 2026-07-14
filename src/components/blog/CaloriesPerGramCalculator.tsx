"use client";

import { useMemo, useState } from "react";
import {
  calculateMacroCalories,
  type MacroGramInput,
} from "@/lib/blog/calories-per-gram";

type InputState = Record<keyof MacroGramInput, string>;

const DEFAULT_INPUTS: InputState = {
  protein: "30",
  carbs: "40",
  fat: "15",
  alcohol: "",
};

const PRESETS: Array<{ label: string; values: InputState }> = [
  { label: "Balanced meal", values: DEFAULT_INPUTS },
  {
    label: "High-protein meal",
    values: { protein: "45", carbs: "30", fat: "10", alcohol: "" },
  },
  {
    label: "Label example",
    values: { protein: "10", carbs: "24", fat: "7", alcohol: "" },
  },
];

const FIELDS: Array<{
  key: keyof MacroGramInput;
  label: string;
  factor: number;
  accent: string;
  tint: string;
}> = [
  {
    key: "protein",
    label: "Protein",
    factor: 4,
    accent: "#E05A3A",
    tint: "#FFF1EC",
  },
  {
    key: "carbs",
    label: "Carbohydrate",
    factor: 4,
    accent: "#D3932F",
    tint: "#FFF8E8",
  },
  {
    key: "fat",
    label: "Fat",
    factor: 9,
    accent: "#4E8064",
    tint: "#EEF7F1",
  },
  {
    key: "alcohol",
    label: "Alcohol",
    factor: 7,
    accent: "#7A668F",
    tint: "#F5F0F8",
  },
];

function parseGrams(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function formatCalories(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export default function CaloriesPerGramCalculator() {
  const [inputs, setInputs] = useState<InputState>(DEFAULT_INPUTS);

  const grams = useMemo<MacroGramInput>(
    () => ({
      protein: parseGrams(inputs.protein),
      carbs: parseGrams(inputs.carbs),
      fat: parseGrams(inputs.fat),
      alcohol: parseGrams(inputs.alcohol),
    }),
    [inputs],
  );

  const result = useMemo(() => calculateMacroCalories(grams), [grams]);
  const nonZeroSources = FIELDS.filter((field) => result[field.key] > 0);

  return (
    <section
      aria-label="Macro calorie calculator"
      className="not-prose my-10 overflow-hidden rounded-3xl border border-border/70 bg-[#FAFAF8] shadow-[0_20px_60px_rgba(38,31,27,0.08)]"
    >
      <div className="border-b border-border/60 bg-white px-5 py-6 sm:px-8">
        <div className="mb-2 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-lg font-black text-primary">
            ×
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Interactive tool
            </p>
            <h2 className="m-0 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Macro Calorie Calculator
            </h2>
          </div>
        </div>
        <p className="m-0 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Enter the grams from a food label, recipe, meal, or daily macro target.
          The result updates automatically using 4-4-9-7.
        </p>
      </div>

      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <label
              key={field.key}
              className="block rounded-2xl border border-border/60 bg-white p-4 shadow-sm transition focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10"
            >
              <span className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-foreground">
                  {field.label} grams
                </span>
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-extrabold"
                  style={{ color: field.accent, backgroundColor: field.tint }}
                >
                  × {field.factor}
                </span>
              </span>
              <input
                aria-label={`${field.label} grams`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                placeholder="0"
                value={inputs[field.key]}
                onChange={(event) =>
                  setInputs((current) => ({
                    ...current,
                    [field.key]: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-border bg-[#FCFCFA] px-4 py-3 text-xl font-extrabold text-foreground outline-none transition focus:border-primary"
              />
            </label>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2" aria-label="Calculator presets">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setInputs(preset.values)}
              className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/50 hover:bg-primary/5"
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() =>
              setInputs({ protein: "", carbs: "", fat: "", alcohol: "" })
            }
            className="rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-black/5 hover:text-foreground"
          >
            Clear
          </button>
        </div>

        <div className="mt-7 rounded-3xl bg-[#201C19] px-5 py-6 text-white sm:px-7">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-white/55">
                Estimated total
              </p>
              <p role="status" aria-live="polite" className="m-0 text-4xl font-black tracking-tight sm:text-5xl">
                {formatCalories(result.total)} calories
              </p>
            </div>
            <p className="m-0 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/70">
              General estimate before label rounding
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {FIELDS.map((field) => {
              const calories = result[field.key];
              const share = result.total > 0 ? (calories / result.total) * 100 : 0;
              return (
                <div key={field.key} className="rounded-2xl bg-white/[0.06] p-4">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-white/75">{field.label}</span>
                    <span className="font-extrabold text-white">
                      {formatCalories(calories)} cal
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-[width] duration-300"
                      style={{
                        width: `${share}%`,
                        backgroundColor: field.accent,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mb-0 mt-4 text-xs leading-relaxed text-white/50">
            {nonZeroSources.length === 0
              ? "Enter at least one gram value to calculate calories."
              : "A packaged-food label may differ slightly because manufacturers calculate from unrounded values and may use different factors for fiber or sugar alcohols."}
          </p>
        </div>
      </div>
    </section>
  );
}
