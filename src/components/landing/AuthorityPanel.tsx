const AUTHORITY_POINTS = [
  "Our calorie targets use the Mifflin-St Jeor equation, the most validated BMR formula in clinical use today.",
  "Estimates are typically within 10–15% of actual values — we tell you that upfront, and let you adjust portions when needed.",
  "We don’t claim medical accuracy. We give you a starting point and the tools to adjust as you learn what works for your body.",
];

const NUMBER_SHAPERS = [
  "Your age, weight, height, and sex set your baseline burn (BMR).",
  "Your activity level scales that into daily calories (TDEE).",
  "Your goal adjusts the target up or down from there.",
];

/**
 * Credibility panel shown beside the inline calculator — the moment a
 * user sees their number is when the "can I trust this?" question lands,
 * so the methodology lives right next to the result.
 *
 * Flex column with the methodology link pinned to the bottom so the panel
 * fills the calculator's height (the grid stretches both columns) without
 * leaving the content stranded at the top.
 *
 * Honest framing only; no fake credentials. The methodology link and the
 * no-RD guardrail are covered by AuthorityPanel.test.tsx.
 */
export function AuthorityPanel({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex h-full flex-col rounded-3xl border border-border bg-white p-7 md:p-8 ${className}`}
    >
      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-5 text-center">
        Built on validated science
      </h3>
      <div className="space-y-4 text-muted-foreground leading-relaxed text-sm md:text-base">
        {AUTHORITY_POINTS.map((point) => (
          <p key={point}>{point}</p>
        ))}
      </div>

      {/* What goes into the number — mirrors the calculator's inputs */}
      <div className="mt-6 pt-6 border-t border-border/60">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-dark mb-3">
          What shapes your number
        </p>
        <ul className="space-y-2.5">
          {NUMBER_SHAPERS.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed"
            >
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto pt-7 text-center">
        <a
          href="/tdee-calculator#methodology"
          className="inline-flex items-center gap-1 font-semibold text-primary-dark underline underline-offset-2 hover:text-primary"
        >
          See our methodology →
        </a>
      </div>

      {/* TODO: When an RD reviewer is confirmed, add a small badge here:
          <ReviewedBy name="..." credentials="..." photoUrl="..." /> */}
    </div>
  );
}
