'use client';

import { useState, useCallback } from 'react';

interface RefreshButtonProps {
  onRefresh: () => Promise<{ success: boolean; error?: string }>;
}

export default function RefreshButton({ onRefresh }: RefreshButtonProps) {
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleClick = useCallback(async () => {
    if (loading || cooldown) return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await onRefresh();
      if (result.success) {
        setMessage({ type: 'success', text: 'Snapshot triggered' });
        setCooldown(true);
        setTimeout(() => setCooldown(false), 60000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  }, [loading, cooldown, onRefresh]);

  return (
    <div className="flex items-center gap-2">
      {message && (
        <span className={`text-xs ${message.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
          {message.text}
        </span>
      )}
      <button
        onClick={handleClick}
        disabled={loading || cooldown}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
          />
        </svg>
        {cooldown ? 'Wait 60s' : loading ? 'Running...' : 'Refresh'}
      </button>
    </div>
  );
}
