'use client';

import { useState, useMemo } from 'react';

interface Column {
  key: string;
  label: string;
  format?: 'number' | 'currency' | 'percent';
}

interface DataTableProps {
  columns: Column[];
  rows: Record<string, string | number>[];
  title?: string;
}

function formatCell(value: string | number, format?: string): string {
  if (value === null || value === undefined) return '—';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num) && typeof value === 'string') return value;

  switch (format) {
    case 'currency':
      return `$${(num / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'percent':
      return `${num.toFixed(1)}%`;
    case 'number':
      return num.toLocaleString('en-US');
    default:
      return typeof value === 'number' ? value.toLocaleString('en-US') : String(value);
  }
}

export default function DataTable({ columns, rows, title }: DataTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      const numA = typeof aVal === 'number' ? aVal : parseFloat(String(aVal));
      const numB = typeof bVal === 'number' ? bVal : parseFloat(String(bVal));
      if (!isNaN(numA) && !isNaN(numB)) {
        return sortDir === 'asc' ? numA - numB : numB - numA;
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {title && (
        <div className="px-5 pt-5 pb-2">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer select-none hover:text-gray-700 transition-colors"
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      <svg
                        className={`w-3 h-3 transition-transform ${sortDir === 'asc' ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-gray-50 hover:bg-gray-50/50 ${
                  i % 2 === 1 ? 'bg-gray-50/30' : ''
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-gray-700">
                    {formatCell(row[col.key], col.format)}
                  </td>
                ))}
              </tr>
            ))}
            {sortedRows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
