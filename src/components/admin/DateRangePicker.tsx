'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const presets = [
  { label: '7d', value: '7' },
  { label: '30d', value: '30' },
  { label: '90d', value: '90' },
  { label: 'All', value: 'all' },
];

export default function DateRangePicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get('range') || '30';

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === '30') {
      params.delete('range');
    } else {
      params.set('range', value);
    }
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ''}`);
  };

  return (
    <div className="flex items-center rounded-lg border border-gray-200 bg-white p-0.5">
      {presets.map((preset) => (
        <button
          key={preset.value}
          onClick={() => handleSelect(preset.value)}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            current === preset.value
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
