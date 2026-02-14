'use client';

import { useState, useTransition, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [ready, setReady] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    // If token_hash is in the URL, verify it directly to establish a session
    if (tokenHash && type === 'recovery') {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
        .then(({ error }) => {
          if (error) {
            setError('Reset link expired or invalid. Please request a new one.');
          } else {
            setReady(true);
          }
        });
      return;
    }

    // Fallback: check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      }
    });

    // Also listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setReady(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth, searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    startTransition(async () => {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/admin'), 2000);
    });
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Password updated</h2>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Set new password
          </h2>

          {!ready && (
            <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
              Verifying reset link... If this persists, request a new reset link.
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                New password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                disabled={isPending || !ready}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#E05A3A] focus:ring-2 focus:ring-[#E05A3A]/20 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                disabled={isPending || !ready}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#E05A3A] focus:ring-2 focus:ring-[#E05A3A]/20 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || !ready}
              className="w-full rounded-lg bg-[#E05A3A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#c94e31] focus:outline-none focus:ring-2 focus:ring-[#E05A3A]/20 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
