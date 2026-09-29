"use client";

import { useState } from "react";
import styles from "./EggComparison.module.css";

// USDA SR Legacy 171287 and 172183, per 100 g; large egg = 50 g,
// large white = 33 g. Calculate before rounding display values.
function eggNutrition(whole: number, whites: number) {
  return {
    calories: whole * 0.5 * 143 + whites * 0.33 * 52,
    protein: whole * 0.5 * 12.56 + whites * 0.33 * 10.9,
  };
}

const PORTIONS = [
  { label: "2 whole eggs", whole: 2, whites: 0, note: "Keep both yolks", ...eggNutrition(2, 0) },
  { label: "1 egg + 3 whites", whole: 1, whites: 3, note: "A little of both", ...eggNutrition(1, 3) },
  { label: "6 egg whites", whole: 0, whites: 6, note: "Whites only", ...eggNutrition(0, 6) },
];

function EggPlate({ whole, whites }: { whole: number; whites: number }) {
  const count = whole + whites;
  return (
    <svg viewBox="0 0 180 150" className={`${styles.plate} mx-auto h-28 w-36`} aria-hidden="true">
      <ellipse cx="90" cy="78" rx="75" ry="62" fill="#e5dfd1" />
      <ellipse cx="90" cy="73" rx="75" ry="62" fill="#fffdf7" stroke="#ded5c1" />
      <ellipse cx="90" cy="73" rx="61" ry="48" fill="none" stroke="#eee7d9" />
      {Array.from({ length: count }, (_, i) => {
        const angle = i / count * Math.PI * 2 - Math.PI / 2;
        const radius = count === 2 ? 27 : 34;
        const x = 90 + Math.cos(angle) * radius;
        const y = 73 + Math.sin(angle) * radius * 0.8;
        return <g key={i} transform={`translate(${x} ${y}) rotate(${i * 21 - 15})`}>
          <ellipse rx="20" ry="25" fill="#fff" stroke="#d8d3c6" strokeWidth="1.5" />
          {i < whole && <><circle cy="4" r="12" fill="#e7a925" /><ellipse cx="-3" cy="1" rx="4" ry="3" fill="#f6cf60" /></>}
        </g>;
      })}
    </svg>
  );
}

export default function EggComparison() {
  const [metric, setMetric] = useState<"calories" | "protein">("calories");
  const [selected, setSelected] = useState(1);
  const portion = PORTIONS[selected];
  const calorieDifference = Math.round(portion.calories - PORTIONS[0].calories);
  const proteinDifference = portion.protein - PORTIONS[0].protein;

  return (
    <section aria-label="Egg portion comparison" className={`${styles.panel} not-prose my-10`}>
      <div className="p-5 pb-0 sm:p-8 sm:pb-0">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#52654a]">The breakfast comparison</p>
        <h3 className="m-0 font-serif text-3xl leading-tight sm:text-4xl">Same ingredient. Different balance.</h3>
        <p className="mb-5 mt-3 max-w-xl text-sm leading-relaxed text-[#625c50]">Choose a portion. Switch the bars to see calories or protein on the same scale.</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="group" aria-label="Compare nutrient" className="inline-flex rounded-full border border-[#d9d1bf] bg-white p-1">
            {(["calories", "protein"] as const).map(value => <button key={value} type="button" aria-pressed={metric === value} onClick={() => setMetric(value)} className={`${styles.control} min-h-11 rounded-full px-5 text-sm font-semibold ${metric === value ? "bg-[#305a42] text-white" : "text-[#4a493d]"}`}>{value === "calories" ? "Calories" : "Protein"}</button>)}
          </div>
          <span className="text-xs text-[#625c50]">Bar scale: 0–{metric === "calories" ? "150 calories" : "25 g protein"}</span>
        </div>
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-8">
        {PORTIONS.map((item, index) => <button key={item.label} type="button" aria-pressed={selected === index} aria-label={`Select ${item.label}`} onClick={() => setSelected(index)} className={`${styles.choice} rounded-2xl border-2 p-4 text-left ${selected === index ? "border-[#305a42] bg-[#eef2e7]" : "border-[#e5dfd2] bg-[#fffdf8]"}`}>
          <EggPlate whole={item.whole} whites={item.whites} />
          <span className="mt-2 block text-base font-bold">{item.label}</span>
          <span className="mt-1 block text-xs text-[#625c50]">{item.note}</span>
          <span className="mb-2 mt-5 block font-serif text-3xl tabular-nums">{metric === "calories" ? Math.round(item.calories) : item.protein.toFixed(1)}<span className="ml-1 font-sans text-xs">{metric === "calories" ? "cal" : "g protein"}</span></span>
          <span aria-hidden="true" className="block h-2.5 overflow-hidden rounded-full bg-[#e5dfd2]"><span className={`${styles.bar} block h-full rounded-full ${metric === "calories" ? "bg-[#b67a17]" : "bg-[#305a42]"}`} style={{ width: `${item[metric] / (metric === "calories" ? 150 : 25) * 100}%` }} /></span>
          <span className="mt-3 block text-xs tabular-nums text-[#625c50]">{Math.round(item.calories)} cal · {item.protein.toFixed(1)} g protein</span>
        </button>)}
      </div>
      <div className="border-t border-[#dfd8c8] bg-[#fffdf8] px-5 py-5 sm:px-8">
        <p role="status" aria-live="polite" aria-atomic="true" className="m-0 text-sm leading-relaxed"><strong>{portion.label}: {Math.round(portion.calories)} calories · {portion.protein.toFixed(1)} g protein.</strong>{selected === 0 ? " This is the reference portion." : ` Compared with 2 whole eggs: ${Math.abs(calorieDifference)} fewer calories and ${proteinDifference.toFixed(1)} g more protein.`}</p>
        <p className="mb-0 mt-2 text-xs leading-relaxed text-[#625c50]">USDA raw-ingredient estimates; no oil, milk or sides. Large whole egg: 50 g edible portion. Large white: 33 g. Illustrations show counts, not measured food volume. These portions are examples, not targets.</p>
      </div>
    </section>
  );
}

export function EggCookingFat() {
  const [oilGrams, setOilGrams] = useState(0);
  const base = eggNutrition(2, 0);
  const oilCalories = oilGrams * 9;
  return (
    <section aria-label="Egg cooking oil comparison" className={`${styles.panel} not-prose my-10 p-5 sm:p-8`}>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#52654a]">What the pan adds</p>
      <h3 className="m-0 font-serif text-3xl leading-tight">The eggs stay the same.</h3>
      <p className="mb-5 mt-3 text-sm leading-relaxed text-[#625c50]">Start with two large eggs. Add an amount of oil eaten with the portion.</p>
      <div role="group" aria-label="Oil in your portion" className="mb-6 flex flex-wrap gap-2">
        {[0, 5, 10].map(value => <button key={value} type="button" aria-pressed={oilGrams === value} onClick={() => setOilGrams(value)} className={`${styles.control} min-h-11 rounded-full border px-4 text-sm font-semibold ${oilGrams === value ? "border-[#305a42] bg-[#305a42] text-white" : "border-[#d9d1bf] bg-white text-[#4a493d]"}`}>{value === 0 ? "No added oil" : `${value} g oil`}</button>)}
      </div>
      <p role="status" aria-live="polite" aria-atomic="true" className="m-0 font-serif text-4xl tabular-nums">{base.calories + oilCalories} <span className="font-sans text-sm">calories total · {base.protein.toFixed(1)} g protein</span></p>
      <div aria-hidden="true" className="mb-3 mt-5 flex h-10 overflow-hidden rounded-lg bg-[#e5dfd2]">
        <div className="flex h-full shrink-0 items-center justify-center bg-[#305a42] text-xs font-bold text-white" style={{ width: `${143 / 250 * 100}%` }}>Eggs: 143</div>
        <div className={`${styles.oil} flex h-full shrink-0 items-center justify-center overflow-hidden whitespace-nowrap bg-[#e5b748] text-xs font-bold text-[#302d25]`} style={{ width: `${oilCalories / 250 * 100}%` }}>{oilCalories > 0 ? `+${oilCalories}` : ""}</div>
      </div>
      <div className="flex justify-between text-xs text-[#625c50]"><span>0 calories</span><span>250 calories</span></div>
      <p className="mb-0 mt-5 text-xs leading-relaxed text-[#625c50]">Illustrative oil calculation: 9 calories per gram of fat; use your oil’s label for product-specific values. Assumes all selected oil is eaten with this portion. Oil adds no protein. Butter contains water too, so do not apply this formula to butter’s total weight.</p>
    </section>
  );
}
