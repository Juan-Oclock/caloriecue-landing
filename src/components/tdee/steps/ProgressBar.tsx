"use client";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_LABELS = ["Basics", "Measurements", "Lifestyle"];

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <div className="flex items-center justify-between">
      {Array.from({ length: totalSteps }, (_, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        const isFuture = i > currentStep;

        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary text-white"
                    : isCurrent
                      ? "bg-white text-primary border-2 border-primary ring-2 ring-primary/20"
                      : "bg-muted text-muted-foreground/60 border border-border"
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-[11px] font-medium transition-colors duration-300 ${
                  isCompleted
                    ? "text-primary"
                    : isCurrent
                      ? "text-foreground"
                      : "text-muted-foreground/50"
                }`}
              >
                {STEP_LABELS[i]}
              </span>
            </div>

            {/* Connecting line */}
            {i < totalSteps - 1 && (
              <div className="flex-1 mx-2 mb-5">
                <div className="h-0.5 rounded-full transition-colors duration-300">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      i < currentStep ? "bg-primary" : "bg-border"
                    }`}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
