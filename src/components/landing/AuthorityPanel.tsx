const NUMBER_SHAPERS = [
  "Age, weight, height and sex set your baseline burn (BMR).",
  "Activity level scales that into daily calories (TDEE).",
  "Your goal nudges the target up or down from there.",
];

/**
 * Credibility copy shown beside the inline calculator — the moment a
 * user sees their number is when the "can I trust this?" question lands,
 * so the methodology lives right next to the result.
 *
 * Honest framing only; no fake credentials. The methodology link and the
 * no-RD guardrail are covered by AuthorityPanel.test.tsx.
 */
export function AuthorityPanel({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col gap-5 ${className}`}>
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-bold text-foreground">
          Built on validated science
        </h3>
        <p className="text-[17px] leading-[1.5] text-muted-foreground text-pretty">
          Mifflin-St Jeor — the most validated BMR formula in clinical use.
          Estimates land within 10–15% of reality, and the app adjusts as you
          log.
        </p>
      </div>

      {/* What goes into the number — mirrors the calculator's inputs */}
      <ol className="flex flex-col gap-2.5 text-[15px] text-muted-foreground">
        {NUMBER_SHAPERS.map((item, i) => (
          <li key={item} className="flex gap-3 leading-relaxed">
            <span className="shrink-0 font-bold tabular-nums text-primary-dark font-rounded">
              0{i + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>

      <p className="text-sm leading-relaxed text-subtle">
        A starting point, not medical advice — adjust as you learn what works
        for your body.
      </p>

      <a
        href="/tdee-calculator#methodology"
        className="inline-flex w-fit items-center gap-1.5 text-[15px] font-semibold text-primary-dark transition-colors hover:text-primary-700"
      >
        See the methodology
        <span aria-hidden="true">→</span>
      </a>

      {/* TODO: When an RD reviewer is confirmed, add a small badge here:
          <ReviewedBy name="..." credentials="..." photoUrl="..." /> */}
    </div>
  );
}
