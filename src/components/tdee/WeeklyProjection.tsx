"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { WeeklyDataPoint, UnitSystem } from "@/lib/tdee/types";
import { kgToLbs } from "@/lib/tdee/formulas";

interface WeeklyProjectionProps {
  data: WeeklyDataPoint[];
  unitSystem: UnitSystem;
}

export default function WeeklyProjection({ data, unitSystem }: WeeklyProjectionProps) {
  const displayData = data.map((d) => ({
    week: `W${d.week}`,
    weight:
      unitSystem === "imperial"
        ? Math.round(kgToLbs(d.weight) * 10) / 10
        : d.weight,
  }));

  const unit = unitSystem === "imperial" ? "lbs" : "kg";
  const weights = displayData.map((d) => d.weight);
  const minW = Math.floor(Math.min(...weights) - 2);
  const maxW = Math.ceil(Math.max(...weights) + 2);

  return (
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={displayData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E05A3A" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#E05A3A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            tickLine={false}
            axisLine={false}
            interval={2}
          />
          <YAxis
            domain={[minW, maxW]}
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: "10px",
              fontSize: "12px",
              padding: "6px 10px",
            }}
            formatter={(value) => [`${value} ${unit}`, "Weight"]}
          />
          <Area
            type="monotone"
            dataKey="weight"
            stroke="#E05A3A"
            strokeWidth={2}
            fill="url(#weightGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#E05A3A", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
