'use client';

import { useState, useTransition } from 'react';
import { login, resetPassword } from './actions';

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showReset, setShowReset] = useState(false);

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await resetPassword(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess('Check your email for a password reset link.');
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Calorie<span className="text-[#E05A3A]">Cue</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500">Admin Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {showReset ? 'Reset password' : 'Sign in'}
          </h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {showReset ? (
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isPending}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#E05A3A] focus:ring-2 focus:ring-[#E05A3A]/20 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="admin@caloriecue.app"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-lg bg-[#E05A3A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#c94e31] focus:outline-none focus:ring-2 focus:ring-[#E05A3A]/20 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Sending...' : 'Send reset link'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowReset(false);
                  setError(null);
                  setSuccess(null);
                }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Back to sign in
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isPending}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#E05A3A] focus:ring-2 focus:ring-[#E05A3A]/20 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="admin@caloriecue.app"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReset(true);
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-xs text-[#E05A3A] hover:text-[#c94e31] transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={isPending}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#E05A3A] focus:ring-2 focus:ring-[#E05A3A]/20 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-lg bg-[#E05A3A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#c94e31] focus:outline-none focus:ring-2 focus:ring-[#E05A3A]/20 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          This area is restricted to authorized administrators.
        </p>
      </div>
    </div>
  );
}
