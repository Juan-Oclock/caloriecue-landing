"use client";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
            i < currentStep
              ? "bg-primary"
              : i === currentStep
                ? "bg-primary/50"
                : "bg-muted/60"
          }`}
        />
      ))}
    </div>
  );
}
