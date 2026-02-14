'use client';

import {
  ResponsiveContainer,
  LineChart,
  AreaChart,
  BarChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface TrendChartProps {
  data: any[];
  dataKey: string;
  xKey?: string;
  type?: 'line' | 'area' | 'bar';
  color?: string;
  height?: number;
  title?: string;
  formatValue?: (value: number) => string;
  formatXAxis?: (value: string) => string;
}

function defaultFormatX(value: string): string {
  if (!value) return '';
  const d = new Date(value + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TrendChart({
  data,
  dataKey,
  xKey = 'snapshot_date',
  type = 'area',
  color = '#E05A3A',
  height = 200,
  title,
  formatValue,
  formatXAxis = defaultFormatX,
}: TrendChartProps) {
  const chartProps = {
    data,
    margin: { top: 5, right: 5, left: 0, bottom: 5 },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any) => {
    const num = Number(value);
    if (formatValue) return [formatValue(num), title || dataKey];
    return [num.toLocaleString(), title || dataKey];
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const labelFormatter = (label: any) => formatXAxis(String(label));

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={xKey} tickFormatter={formatXAxis} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} width={45} />
            <Tooltip formatter={tooltipFormatter} labelFormatter={labelFormatter} />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={xKey} tickFormatter={formatXAxis} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} width={45} />
            <Tooltip formatter={tooltipFormatter} labelFormatter={labelFormatter} />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      default:
        return (
          <AreaChart {...chartProps}>
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={xKey} tickFormatter={formatXAxis} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} width={45} />
            <Tooltip formatter={tooltipFormatter} labelFormatter={labelFormatter} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${dataKey})`}
            />
          </AreaChart>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {title && <h3 className="text-sm font-medium text-gray-500 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
