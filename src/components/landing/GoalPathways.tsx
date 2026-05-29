import Link from "next/link";
import FadeInCSS from "@/components/FadeInCSS";
import { getGoalPathway, type GoalTag } from "@/lib/blog";

interface PathwayConfig {
  goal: GoalTag;
  label: string;
  supportingCopy: string;
  /** Per-goal accent — replaces the old emoji as the visual identifier.
   *  Full class strings so Tailwind's JIT keeps them. */
  accentBar: string;
  accentDot: string;
  accentGlow: string;
}

const PATHWAYS: PathwayConfig[] = [
  {
    goal: "lose-weight",
    label: "Lose Weight",
    supportingCopy:
      "Cut without losing your sanity. Find your deficit, eat enough protein, and track what works.",
    accentBar: "bg-primary",
    accentDot: "bg-primary",
    accentGlow: "bg-primary/25",
  },
  {
    goal: "build-muscle",
    label: "Build Muscle",
    supportingCopy:
      "Eat enough to grow. Hit your protein targets. Train, recover, repeat.",
    accentBar: "bg-accent-blue",
    accentDot: "bg-accent-blue",
    accentGlow: "bg-accent-blue/25",
  },
  {
    goal: "maintain",
    label: "Maintain",
    supportingCopy:
      "Stay consistent, eat with flexibility, and keep your progress without guessing.",
    accentBar: "bg-accent-teal",
    accentDot: "bg-accent-teal",
    accentGlow: "bg-accent-teal/25",
  },
  {
    goal: "gain-weight",
    label: "Gain Weight",
    supportingCopy:
      "Eat more without eating worse. Calorie-dense whole foods that actually work.",
    accentBar: "bg-accent-purple",
    accentDot: "bg-accent-purple",
    accentGlow: "bg-accent-purple/25",
  },
];

const POSTS_PER_PATHWAY = 3;

export function GoalPathways() {
  return (
    <section
      id="guides"
      className="scroll-mt-24 py-20 md:py-28 px-4 bg-background"
    >
      <div className="max-w-6xl mx-auto">
        <FadeInCSS className="text-center mb-12 md:mb-16">
          <span className="inline-block text-primary-dark font-medium text-sm mb-3 uppercase tracking-wider">
            Goal Pathways
          </span>
          <h2 className="text-display-mobile md:text-display text-foreground mb-4">
            Guides for your goal
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Pick the path that matches what you&apos;re working toward.
          </p>
        </FadeInCSS>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5">
          {PATHWAYS.map((pathway, i) => {
            const posts = getGoalPathway(pathway.goal, POSTS_PER_PATHWAY);
            return (
              <FadeInCSS
                key={pathway.goal}
                y={20}
                viewportMargin="-50px"
                className="h-full"
              >
                <article
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.18)]"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* Accent corner glow on hover */}
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${pathway.accentGlow}`}
                  />

                  {/* Accent bar — the per-goal identifier (replaces the icon) */}
                  <span
                    aria-hidden="true"
                    className={`mb-6 block h-1.5 w-10 rounded-full ${pathway.accentBar}`}
                  />

                  <h3 className="text-2xl font-bold tracking-tight text-foreground">
                    {pathway.label}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {pathway.supportingCopy}
                  </p>

                  {posts.length > 0 ? (
                    <ul className="mt-6 flex flex-col gap-3">
                      {posts.map((post) => (
                        <li key={post.slug}>
                          <Link
                            href={`/blog/${post.slug}`}
                            className="group/link flex items-start gap-2.5 text-sm text-foreground transition-colors hover:text-primary-dark"
                          >
                            <span
                              aria-hidden="true"
                              className={`mt-[7px] inline-block h-1.5 w-1.5 shrink-0 rounded-full ${pathway.accentDot}`}
                            />
                            <span className="leading-snug underline-offset-2 group-hover/link:underline">
                              {post.title}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-6 text-sm italic text-muted-foreground">
                      More guides coming soon.
                    </p>
                  )}

                  <div className="mt-auto border-t border-border/60 pt-5">
                    <Link
                      href={`/blog/tag/${pathway.goal}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-dark transition-all hover:gap-2.5"
                    >
                      View all {pathway.label.toLowerCase()} guides
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </article>
              </FadeInCSS>
            );
          })}
        </div>
      </div>
    </section>
  );
}
