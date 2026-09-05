"use client";

import { useState } from "react";
import { trackGenerateLead } from "@/lib/analytics";
import { createClient } from "@/lib/supabase/client";

type NewsletterSectionProps = {
  contentSlug?: string;
};

export default function NewsletterSection({
  contentSlug,
}: NewsletterSectionProps) {
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
      const supabase = createClient();
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

      trackGenerateLead({
        leadType: "newsletter",
        location: "blog_footer",
        contentSlug,
      });
      setSuccess(true);
      setEmail("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-5 py-16 md:px-8 md:py-24" aria-labelledby="newsletter-heading">
      <div className="relative mx-auto grid max-w-6xl items-center gap-8 overflow-hidden rounded-[28px] bg-foreground p-7 text-white shadow-ink-lg md:grid-cols-2 md:gap-14 md:p-12">
        <div
          className="pointer-events-none absolute -bottom-36 -right-28 h-[360px] w-[360px] rounded-full border-[60px] border-primary/20"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-3.5">
          <span className="text-xs font-bold uppercase tracking-[0.1em] text-primary">
            The Sunday Cue · free newsletter
          </span>
          <h2
            id="newsletter-heading"
            className="text-balance text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold leading-[1.05] tracking-[-0.025em]"
          >
            One useful guide a week.
            <br />
            No fluff.
          </h2>
          <p className="max-w-[440px] text-[15px] leading-relaxed text-white/70 text-pretty">
            A protein swap, a food ranking, or a tracking shortcut you can use
            before lunch — straight to your inbox every Sunday.
          </p>
          <p className="text-[13px] text-white/70">
            Read by <strong className="font-semibold text-white">500+</strong>{" "}
            people every week.
          </p>
        </div>

        <div className="relative flex flex-col gap-3">
          {success ? (
            <div className="flex items-center gap-3.5 rounded-2xl border border-primary/40 bg-primary/15 px-5 py-4">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-dark text-sm text-white"
                aria-hidden="true"
              >
                ✓
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] font-bold">You&apos;re subscribed!</span>
                <span className="text-[13px] text-white/80">
                  Your first guide lands on Sunday.
                </span>
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} suppressHydrationWarning className="flex flex-col gap-2.5">
              <div className="flex flex-col gap-2 rounded-2xl bg-surface p-1.5 sm:flex-row">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-12 min-w-0 flex-1 rounded-xl bg-transparent px-3.5 text-[15px] text-foreground placeholder:text-subtle focus:outline-none"
                  disabled={loading}
                  suppressHydrationWarning
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary-dark px-5 text-[15px] font-bold text-white shadow-coral transition-all hover:bg-primary-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                  suppressHydrationWarning
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Subscribing…</span>
                    </>
                  ) : (
                    <>
                      Subscribe
                      <span aria-hidden="true">→</span>
                    </>
                  )}
                </button>
              </div>
              {error ? (
                <p className="px-1.5 text-sm text-[#FFB4A8]" role="alert">
                  {error}
                </p>
              ) : (
                <p className="px-1.5 text-xs text-white/60">
                  No spam. One email a week. Unsubscribe in one tap.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
