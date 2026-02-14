'use client';

import Link from 'next/link';

export default function AdminDashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-6">
          An error occurred while loading the admin dashboard. Please try again.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-lg bg-[#E05A3A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#c94e31] transition-colors"
          >
            Try again
          </button>
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
