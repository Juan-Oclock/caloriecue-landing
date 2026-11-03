"use client";

import { Suspense, useId, useState } from "react";
import CheatSheetNextStep from "./CheatSheetNextStep";
import { motion } from "framer-motion";
import { trackEvent, trackGenerateLead } from "@/lib/analytics";

type CheatSheetFormProps = {
  contentSlug: string;
};

type CheatSheetResponse = {
  success?: boolean;
  leadCreated?: boolean;
  error?: string;
};

export default function CheatSheetForm({ contentSlug }: CheatSheetFormProps) {
  const [mode, setMode] = useState<"instant" | "email">("instant");
  const modeName = useId();
  const emailId = useId();
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
    <section className="my-8 overflow-hidden rounded-3xl border border-[#F2D4C5] bg-[#FFFAF6] p-5 shadow-sm sm:p-7" aria-label="Free calorie counting cheat sheet">
      <div className="grid gap-6 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-7 lg:grid-cols-[175px_minmax(0,1fr)]">
        <div aria-hidden="true" className="hidden sm:flex aspect-[175/294] w-full self-start flex-col overflow-hidden rounded-xl border border-[#E9D7C9] bg-[#FFFDF9] shadow-lg">
          <div className="flex flex-1 flex-col p-4">
            <span className="text-xs font-bold text-primary-dark">CalorieCue</span>
            <span className="mt-4 text-[20px] font-bold leading-tight text-foreground">Calorie Counting<br />Cheat Sheet</span>
            <span className="mt-2 text-[10px] leading-relaxed text-muted-foreground">A practical guide to calories and portions.</span>
          </div>
          <div className="h-28 bg-cover bg-center" style={{ backgroundImage: "url('/cheat-sheet/cover-food.jpg')" }} />
        </div>
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FCE8DC] text-primary-dark" aria-hidden="true">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 3h8l4 4v14H6z" strokeLinejoin="round"/><path d="M14 3v5h4M9 14h6M9 17h6" strokeLinecap="round"/></svg>
            </span>
            <div>
              <h3 className="!m-0 !text-xl !font-bold !leading-tight">Your free calorie cheat sheet</h3>
              <p className="!mb-0 !mt-1 text-sm text-muted-foreground">A practical guide to calories, portions, and everyday foods.</p>
            </div>
          </div>
          <fieldset className="mt-5 space-y-2.5" disabled={loading}>
            <legend className="sr-only">Choose how to get your PDF</legend>
            {([
              { value: "instant", title: "Download instantly", description: "Get the PDF now — no email needed" },
              { value: "email", title: "Send to my email", description: "Keep a copy in your inbox" },
            ] as const).map((option) => (
              <label key={option.value} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition-colors ${mode === option.value ? "border-primary-dark bg-[#FCECE3]" : "border-[#E8DCD4] bg-white hover:border-primary-dark/50"}`}>
                <input type="radio" name={modeName} value={option.value} checked={mode === option.value} onChange={() => setMode(option.value)} className="h-4 w-4 shrink-0 accent-[#BC4527]" />
                <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FCE8DC] text-primary-dark">
                  {option.value === "instant" ? <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 3h8l4 4v14H6z" strokeLinejoin="round"/><path d="M14 3v5h4M12 11v6m-3-3 3 3 3-3" strokeLinecap="round" strokeLinejoin="round"/></svg> : <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </span>
                <span className="min-w-0"><span className="block text-sm font-bold text-foreground">{option.title}</span><span className="block text-xs text-muted-foreground">{option.description}</span></span>
              </label>
            ))}
          </fieldset>
          {mode === "instant" ? (
            <a href="/downloads/caloriecue-cheat-sheet.pdf" download onClick={() => trackEvent("cheat_sheet_download", { content_slug: contentSlug, location: "cheat_sheet_form" })} className="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-primary-dark px-5 py-3 text-sm font-bold !text-white !no-underline hover:bg-primary-700 hover:!text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-dark">Download PDF instantly</a>
          ) : success ? (
            <>
              <motion.div role="status" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">Check your inbox! We&apos;ve emailed your cheat sheet PDF (attached).</motion.div>
              <Suspense fallback={null}><CheatSheetNextStep contentSlug={contentSlug} /></Suspense>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4">
              <label htmlFor={emailId} className="mb-1.5 block text-sm font-semibold text-foreground">Email address</label>
              <input id={emailId} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" disabled={loading} />
              <button type="submit" disabled={loading} className="mt-3 flex min-h-12 w-full items-center justify-center rounded-xl bg-primary-dark px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70">{loading ? "Sending..." : "Send Me the PDF"}</button>
              {error && <motion.p role="alert" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="!mb-0 !mt-3 text-sm text-red-600">{error}</motion.p>}
              <p className="!mb-0 !mt-3 text-xs text-muted-foreground">No spam, ever. Unsubscribe anytime.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
