'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface DonutSegment {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  centerLabel?: string;
  centerValue?: string;
  height?: number;
  title?: string;
}

export default function DonutChart({
  segments,
  centerLabel,
  centerValue,
  height = 260,
  title,
}: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const displayValue = centerValue ?? total.toLocaleString();
  const displayLabel = centerLabel ?? 'Total';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLabel = (props: any) => {
    const { cx, cy } = props;
    return (
      <g>
        <text x={cx} y={cy - 8} textAnchor="middle" className="fill-gray-900 text-lg font-bold">
          {displayValue}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" className="fill-gray-500 text-xs">
          {displayLabel}
        </text>
      </g>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const legendFormatter = (value: any) => {
    const segment = segments.find((s) => s.name === value);
    return (
      <span className="text-sm text-gray-700">
        {value}: {segment?.value.toLocaleString() ?? 0}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {title && <h3 className="text-sm font-medium text-gray-500 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={segments}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
            strokeWidth={0}
            labelLine={false}
            label={renderLabel}
          >
            {segments.map((segment, index) => (
              <Cell key={`cell-${index}`} fill={segment.color} />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            formatter={legendFormatter}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
