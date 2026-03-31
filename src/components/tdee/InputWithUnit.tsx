"use client";

interface InputWithUnitProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  unit: string;
  required?: boolean;
  min?: string;
  max?: string;
  step?: string;
}

export default function InputWithUnit({
  id,
  value,
  onChange,
  placeholder,
  unit,
  required = false,
  min,
  max,
  step,
}: InputWithUnitProps) {
  return (
    <div className="relative">
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full pl-3.5 pr-11 py-2.5 rounded-xl border border-border bg-white text-foreground text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/40"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground">
        {unit}
      </span>
    </div>
  );
}
