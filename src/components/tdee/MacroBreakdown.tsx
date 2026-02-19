"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { MacroBreakdownResult, MacroPlan } from "@/lib/tdee/types";
import { MACRO_PRESETS } from "@/lib/tdee/constants";

const MACRO_COLORS = {
  protein: "#E05C7A",
  carbs: "#3B82F6",
  fat: "#F59E0B",
};

interface MacroBreakdownProps {
  macros: MacroBreakdownResult;
  totalCalories: number;
  activePlan: MacroPlan;
  onPlanChange: (plan: MacroPlan) => void;
}

const plans: MacroPlan[] = ["balanced", "low_carb", "high_carb"];

export default function MacroBreakdown({
  macros,
  totalCalories,
  activePlan,
  onPlanChange,
}: MacroBreakdownProps) {
  const chartData = [
    { name: "Protein", value: macros.proteinCalories, color: MACRO_COLORS.protein },
    { name: "Carbs", value: macros.carbsCalories, color: MACRO_COLORS.carbs },
    { name: "Fat", value: macros.fatCalories, color: MACRO_COLORS.fat },
  ];

  const macroItems = [
    { label: "Protein", grams: macros.protein, color: MACRO_COLORS.protein },
    { label: "Carbs", grams: macros.carbs, color: MACRO_COLORS.carbs },
    { label: "Fat", grams: macros.fat, color: MACRO_COLORS.fat },
  ];

  return (
    <div>
      {/* Plan tabs */}
      <div className="inline-flex items-center bg-muted/50 p-0.5 rounded-full border border-border mb-5">
        {plans.map((plan) => (
          <button
            key={plan}
            onClick={() => onPlanChange(plan)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activePlan === plan
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {MACRO_PRESETS[plan].label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-7">
        {/* Donut chart */}
        <div className="w-[140px] h-[140px] relative flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={44}
                outerRadius={64}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-bold text-foreground">{totalCalories}</span>
            <span className="text-[11px] text-muted-foreground">cal</span>
          </div>
        </div>

        {/* Macro list */}
        <div className="flex-1 space-y-4">
          {macroItems.map((m) => (
            <div key={m.label} className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
              <span className="text-sm text-muted-foreground w-14">{m.label}</span>
              <span className="text-base font-semibold text-foreground">{m.grams}g</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
