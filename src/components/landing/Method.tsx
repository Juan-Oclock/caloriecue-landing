import FadeInCSS from "@/components/FadeInCSS";

interface MethodStep {
  title: string;
  body: string;
  /** When true, this step is the "bridge moment" introducing the app
   *  (Guardrail 3) — visually emphasized to land naturally. */
  bridge?: boolean;
}

const METHOD_STEPS: MethodStep[] = [
  {
    title: "Know your number",
    body: "Use the calculator above to find your daily calorie target and protein range. ✓ (Just did this.)",
  },
  {
    title: "Track what you eat — accurately, without burning out",
    body: "The reason most people quit tracking is logging fatigue. With CalorieCue, a meal takes one photo and three seconds — no typing, no portion guessing.",
    bridge: true,
  },
  {
    title: "Use weekly averages, not perfect days",
    body: "One high day doesn't ruin a week. Your average over 7 days is what matters.",
  },
  {
    title: "Adjust based on progress, not emotion",
    body: "After 2–3 weeks of consistent tracking, check the scale and your photos. If progress has stalled, adjust by ~100 calories and reassess.",
  },
];

export function Method() {
  return (
    <section
      id="method"
      className="scroll-mt-24 px-4 py-20 md:py-28 bg-white"
    >
      <div className="max-w-3xl mx-auto">
        <FadeInCSS className="text-center mb-12 md:mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary-dark px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-4">
            The Method
          </span>
          <h2 className="text-display-mobile md:text-display text-foreground mb-4">
            How to actually hit your number
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Four habits that separate people who lose, gain, or maintain on
            purpose from people who try and quit.
          </p>
        </FadeInCSS>

        <ol className="space-y-4 md:space-y-5">
          {METHOD_STEPS.map((step, i) => (
            <FadeInCSS
              key={step.title}
              as="li"
              y={20}
              viewportMargin="-50px"
              className={`relative flex gap-5 rounded-2xl border p-5 md:p-6 transition-colors ${
                step.bridge
                  ? "border-primary/25 bg-gradient-to-br from-primary/[0.06] to-primary/[0.02] shadow-sm"
                  : "border-border/60 bg-white hover:border-primary/20"
              }`}
            >
              <div
                className={`flex h-10 w-10 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl text-base font-bold tabular-nums ${
                  step.bridge
                    ? "bg-primary-dark text-white shadow-md shadow-primary/25"
                    : "bg-primary/10 text-primary-dark"
                }`}
                aria-hidden="true"
              >
                {i + 1}
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-1.5 leading-snug">
                  {step.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {step.body}
                </p>
              </div>
            </FadeInCSS>
          ))}
        </ol>

        <FadeInCSS className="text-center mt-10 md:mt-12">
          <p className="text-sm text-muted-foreground">
            Want deeper reading on your specific goal?{" "}
            <a
              href="#guides"
              className="font-semibold text-primary-dark underline underline-offset-2 hover:text-primary"
            >
              See the guides below ↓
            </a>
          </p>
        </FadeInCSS>
      </div>
    </section>
  );
}
