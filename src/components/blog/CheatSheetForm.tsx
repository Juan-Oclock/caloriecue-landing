"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { trackGenerateLead } from "@/lib/analytics";

type CheatSheetFormProps = {
  contentSlug: string;
};

type CheatSheetResponse = {
  success?: boolean;
  leadCreated?: boolean;
  error?: string;
};

export default function CheatSheetForm({ contentSlug }: CheatSheetFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/cheat-sheet-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = (await res.json()) as CheatSheetResponse;

      if (!res.ok || data.success !== true) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      if (data.leadCreated === true) {
        trackGenerateLead({
          leadType: "cheat_sheet",
          location: "cheat_sheet_form",
          contentSlug,
        });
      }

      setSuccess(true);
      setEmail("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary-50/60 to-transparent p-6 sm:p-8">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground !mt-0 !mb-1">
            Get the Free 5-Page Cheat Sheet PDF
          </h3>
          <p className="text-sm text-muted-foreground !mb-0">
            Calorie targets, 80+ food calories, high-protein swaps, a restaurant
            guide, and a printable 7-day tracking log. Enter your email and
            we&apos;ll send you the PDF.
          </p>
        </div>
      </div>

      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-xl border border-green-200 mt-4"
        >
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium text-sm">
            Check your inbox! We&apos;ve emailed your cheat sheet PDF (attached).
          </span>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl bg-white border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap text-sm"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Sending...</span>
                </>
              ) : (
                "Send Me the PDF"
              )}
            </button>
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm text-red-500"
            >
              {error}
            </motion.p>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            No spam, ever. Unsubscribe anytime.
          </p>
        </form>
      )}
    </div>
  );
}
