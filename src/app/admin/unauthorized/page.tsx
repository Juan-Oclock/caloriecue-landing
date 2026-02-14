import Link from 'next/link';
import { logout } from '../login/actions';

export default function AdminUnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        {/* Brand */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Calorie<span className="text-[#E05A3A]">Cue</span>
          </h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Your account does not have administrator access. If you believe this
            is a mistake, please contact the site owner.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-[#E05A3A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#c94e31] transition-colors"
            >
              Go to main site
            </Link>

            <form action={logout}>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
