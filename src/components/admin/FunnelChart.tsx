'use client';

interface FunnelStep {
  label: string;
  value: number;
}

interface FunnelChartProps {
  steps: FunnelStep[];
  title?: string;
}

export default function FunnelChart({ steps, title }: FunnelChartProps) {
  if (steps.length === 0) return null;

  const maxValue = steps[0].value || 1;

  // Coral (#E05A3A) to blue (#3B82F6) gradient stops
  const colors = [
    '#E05A3A',
    '#C7504B',
    '#A94F5E',
    '#8B4F71',
    '#6D4E84',
    '#4F4E97',
    '#3B82F6',
  ];

  function getColor(index: number): string {
    const ratio = steps.length <= 1 ? 0 : index / (steps.length - 1);
    const colorIndex = Math.round(ratio * (colors.length - 1));
    return colors[colorIndex];
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {title && <h3 className="text-sm font-medium text-gray-500 mb-4">{title}</h3>}
      <div className="space-y-3">
        {steps.map((step, i) => {
          const widthPercent = Math.max((step.value / maxValue) * 100, 12);
          const conversionToNext =
            i < steps.length - 1 && step.value > 0
              ? ((steps[i + 1].value / step.value) * 100).toFixed(1)
              : null;
          const overallConversion =
            i > 0 && maxValue > 0
              ? ((step.value / maxValue) * 100).toFixed(1)
              : null;

          return (
            <div key={step.label} className="flex items-center gap-3">
              <div className="flex-1">
                <div
                  className="relative rounded-lg px-4 py-2.5 transition-all"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: getColor(i),
                    minWidth: '120px',
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-white text-sm font-medium truncate">{step.label}</span>
                    <span className="text-white text-sm font-bold whitespace-nowrap">
                      {step.value.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-24 text-right flex-shrink-0">
                {conversionToNext && (
                  <span className="text-xs text-gray-500">
                    {conversionToNext}% &rarr;
                  </span>
                )}
                {overallConversion && !conversionToNext && (
                  <span className="text-xs text-gray-400">
                    {overallConversion}% total
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
