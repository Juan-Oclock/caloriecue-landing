import Image from "next/image";
import Link from "next/link";
import FadeInCSS from "@/components/FadeInCSS";

interface MethodStep {
  when: string;
  title: string;
  body: string;
  action: string;
  href: string;
  /** When true, this step is the "bridge moment" introducing the app
   *  (Guardrail 3). */
  bridge?: boolean;
}

const METHOD_STEPS: MethodStep[] = [
  {
    when: "Day 1",
    title: "Know your number",
    body: "Use the calculator to find your daily calorie target and protein range. Takes a minute — and it’s the only setup you’ll do.",
    action: "Find my number",
    href: "#calculator",
  },
  {
    when: "Every meal",
    title: "Track without burning out",
    body: "Logging fatigue is why people quit. With CalorieCue a meal is one photo and three seconds — so the habit survives a busy week.",
    action: "See how scanning works",
    href: "#features",
    bridge: true,
  },
  {
    when: "Every Sunday",
    title: "Trust weekly averages",
    body: "One high day doesn’t ruin a week. Your 7-day average is the only number that matters, and Insights puts it front and centre.",
    action: "Why averages beat perfect days",
    href: "/blog/why-your-weight-fluctuates-daily",
  },
  {
    when: "Weeks 2–3",
    title: "Adjust on evidence, not emotion",
    body: "Check the scale and your progress photos. Stalled? Move the target about 100 kcal and reassess. Adaptive TDEE does the math for you.",
    action: "Read the adjustment guide",
    href: "/blog/how-to-break-weight-loss-plateau",
  },
];

export function Method() {
  return (
    <section
      id="method"
      className="scroll-mt-20 bg-foreground text-white"
    >
      <div className="mx-auto grid max-w-6xl items-start gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-2 lg:gap-20">
        {/* Left: intro + image card */}
        <div className="flex flex-col gap-8 self-stretch">
          <FadeInCSS className="flex flex-col gap-5">
            <span className="text-xs font-bold uppercase tracking-[0.1em] text-primary">
              The method
            </span>
            <h2 className="text-balance text-[clamp(2.125rem,4vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em]">
              Four habits.
              <br />
              That&apos;s the whole system.
            </h2>
            <p className="max-w-[420px] text-[17px] leading-[1.5] text-white/70 text-pretty">
              What separates people who hit their number on purpose from people
              who try and quit. Nothing here is clever — it&apos;s just
              repeatable.
            </p>
            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-[28px] font-extrabold tracking-[-0.02em] font-rounded">
                  3 sec
                </span>
                <span className="text-[13px] text-white/70">per meal logged</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[28px] font-extrabold tracking-[-0.02em] font-rounded">
                  7 days
                </span>
                <span className="text-[13px] text-white/70">
                  the only average that matters
                </span>
              </div>
            </div>
          </FadeInCSS>

          {/* Step-one image card */}
          <FadeInCSS
            delay={0.1}
            className="relative flex min-h-[300px] flex-1 flex-col justify-between gap-6 overflow-hidden rounded-[20px] border border-primary/30 bg-foreground p-6"
          >
            <Image
              src="/calorie-target-meal.webp"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-[62%_50%]"
            />
            <div
              className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(35,29,26,0.55)_0%,rgba(35,29,26,0.05)_30%,rgba(35,29,26,0.35)_55%,rgba(35,29,26,0.94)_100%)]"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_24px_rgba(35,29,26,0.6)]"
              aria-hidden="true"
            />
            <div className="relative flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
                Start with step one
              </span>
              <span className="text-xs text-white/80">30 seconds</span>
            </div>
            <div className="relative flex flex-col gap-3.5">
              <p className="text-balance text-[clamp(1.375rem,2.2vw,1.75rem)] font-extrabold leading-[1.12] tracking-[-0.02em] [text-shadow:0_2px_12px_rgba(0,0,0,0.4)]">
                Get your daily calorie target before your next meal.
              </p>
              <a
                href="#calculator"
                className="inline-flex h-[46px] w-fit items-center gap-1.5 rounded-xl bg-primary-dark px-[18px] text-sm font-bold text-white transition-colors hover:bg-primary-700"
              >
                Open the calculator
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </FadeInCSS>
        </div>

        {/* Right: the four steps */}
        <ol className="flex flex-col">
          {METHOD_STEPS.map((step, i) => {
            const isLast = i === METHOD_STEPS.length - 1;
            const isExternalPage = step.href.startsWith("/");
            const ActionTag = isExternalPage ? Link : "a";
            return (
              <FadeInCSS
                key={step.title}
                as="li"
                y={20}
                delay={i * 0.06}
                viewportMargin="-50px"
                className="relative grid grid-cols-[56px_minmax(0,1fr)] gap-4 border-t border-white/10 py-7 md:grid-cols-[64px_minmax(0,1fr)] md:gap-5"
              >
                <div className="flex flex-col items-center gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] text-[15px] font-extrabold font-rounded ${
                      step.bridge || i === 0
                        ? "bg-primary text-foreground"
                        : "bg-white/[0.08] text-primary"
                    }`}
                    aria-hidden="true"
                  >
                    0{i + 1}
                  </span>
                  {!isLast && (
                    <span
                      className="w-px flex-1 bg-gradient-to-b from-white/20 to-white/0"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="flex min-w-0 flex-col gap-2.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-bold leading-[1.2] tracking-[-0.015em]">
                      {step.title}
                    </h3>
                    <span className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.06em] text-white/70">
                      {step.when}
                    </span>
                  </div>
                  <p className="text-base leading-[1.55] text-white/70 text-pretty">
                    {step.body}
                  </p>
                  <ActionTag
                    href={step.href}
                    className="mt-1 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-2 text-[13px] font-semibold text-white transition-colors hover:border-primary hover:bg-primary hover:text-foreground"
                  >
                    {step.action}
                    <span aria-hidden="true">→</span>
                  </ActionTag>
                </div>
              </FadeInCSS>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
