"use client";

import type { UnitSystem } from "@/lib/tdee/types";
import InputWithUnit from "../InputWithUnit";

interface StepMeasurementsProps {
  unitSystem: UnitSystem;
  age: string;
  weightLbs: string;
  weightKg: string;
  heightFeet: string;
  heightInches: string;
  heightCm: string;
  onFieldChange: (field: string, value: string) => void;
  onUnitChange: (u: UnitSystem) => void;
}

function UnitPill({
  options,
  active,
  onChange,
}: {
  options: [string, string];
  active: 0 | 1;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="inline-flex items-center bg-muted/50 rounded-full border border-border text-[11px] font-medium overflow-hidden"
    >
      <span
        className={`px-2 py-1 transition-all ${
          active === 0
            ? "bg-primary text-white"
            : "text-muted-foreground"
        }`}
      >
        {options[0]}
      </span>
      <span
        className={`px-2 py-1 transition-all ${
          active === 1
            ? "bg-primary text-white"
            : "text-muted-foreground"
        }`}
      >
        {options[1]}
      </span>
    </button>
  );
}

export default function StepMeasurements({
  unitSystem,
  age,
  weightLbs,
  weightKg,
  heightFeet,
  heightInches,
  heightCm,
  onFieldChange,
  onUnitChange,
}: StepMeasurementsProps) {
  const isImperial = unitSystem === "imperial";

  const toggle = () => {
    onUnitChange(isImperial ? "metric" : "imperial");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Age</label>
          <InputWithUnit
            value={age}
            onChange={(v) => onFieldChange("age", v)}
            placeholder="28"
            unit="yrs"
            min="1"
            max="120"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-muted-foreground">Weight</label>
            <UnitPill
              options={["lbs", "kg"]}
              active={isImperial ? 0 : 1}
              onChange={toggle}
            />
          </div>
          <InputWithUnit
            value={isImperial ? weightLbs : weightKg}
            onChange={(v) => onFieldChange(isImperial ? "weightLbs" : "weightKg", v)}
            placeholder={isImperial ? "180" : "82"}
            unit={isImperial ? "lbs" : "kg"}
            min="1"
            step="0.1"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-muted-foreground">Height</label>
          <UnitPill
            options={["ft/in", "cm"]}
            active={isImperial ? 0 : 1}
            onChange={toggle}
          />
        </div>
        {isImperial ? (
          <div className="grid grid-cols-2 gap-3">
            <InputWithUnit
              value={heightFeet}
              onChange={(v) => onFieldChange("heightFeet", v)}
              placeholder="5"
              unit="ft"
              min="1"
              max="8"
            />
            <InputWithUnit
              value={heightInches}
              onChange={(v) => onFieldChange("heightInches", v)}
              placeholder="10"
              unit="in"
              min="0"
              max="11"
            />
          </div>
        ) : (
          <InputWithUnit
            value={heightCm}
            onChange={(v) => onFieldChange("heightCm", v)}
            placeholder="178"
            unit="cm"
            min="1"
          />
        )}
      </div>
    </div>
  );
}
