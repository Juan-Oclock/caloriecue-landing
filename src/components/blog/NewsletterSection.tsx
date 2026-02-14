"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function NewsletterSection() {
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
      const { error: insertError } = await supabase
        .from("newsletter")
        .insert([{ email: email.toLowerCase().trim() }]);

      if (insertError) {
        if (insertError.code === "23505") {
          setError("You're already subscribed!");
        } else {
          setError("Something went wrong. Please try again.");
        }
        return;
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
    <section className="bg-foreground py-20 md:py-28 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <span className="inline-block text-primary font-medium text-sm mb-3 uppercase tracking-wider">
          Newsletter
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Stay in the loop
        </h2>
        <p className="text-white/60 text-lg mb-8">
          Get the latest articles on nutrition, AI, and healthy living delivered
          to your inbox.
        </p>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 bg-green-500/10 text-green-400 px-5 py-3 rounded-xl border border-green-500/20 mx-auto max-w-md"
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
              You&apos;re subscribed! Check your inbox soon.
            </span>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin w-5 h-5"
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
                    <span>Subscribing...</span>
                  </>
                ) : (
                  "Subscribe \u2192"
                )}
              </button>
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-sm text-red-400"
              >
                {error}
              </motion.p>
            )}
          </form>
        )}

        <p className="text-white/30 text-sm mt-6">
          Join 500+ readers. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
