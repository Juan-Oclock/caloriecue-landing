const AUTHORITY_POINTS = [
  "Our calorie targets use the Mifflin-St Jeor equation, the most validated BMR formula in clinical use today.",
  "Estimates are typically within 10–15% of actual values — we tell you that upfront, and let you adjust portions when needed.",
  "We don’t claim medical accuracy. We give you a starting point and the tools to adjust as you learn what works for your body.",
];

/**
 * Credibility panel shown beside the inline calculator — the moment a
 * user sees their number is when the "can I trust this?" question lands,
 * so the methodology lives right next to the result.
 *
 * Honest framing only; no fake credentials. The methodology link and the
 * no-RD guardrail are covered by AuthorityPanel.test.tsx.
 */
export function AuthorityPanel({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-3xl border border-border bg-white p-7 md:p-8 ${className}`}
    >
      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-5 text-center">
        Built on validated science
      </h3>
      <div className="space-y-4 text-muted-foreground leading-relaxed text-sm md:text-base">
        {AUTHORITY_POINTS.map((point) => (
          <p key={point}>{point}</p>
        ))}
      </div>
      <div className="mt-7 text-center">
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
