import Link from "next/link";
import FadeInCSS from "@/components/FadeInCSS";
import { getGoalPathway, type GoalTag } from "@/lib/blog";

interface PathwayConfig {
  goal: GoalTag;
  label: string;
  emoji: string;
  supportingCopy: string;
}

const PATHWAYS: PathwayConfig[] = [
  {
    goal: "lose-weight",
    label: "Lose Weight",
    emoji: "🔥",
    supportingCopy:
      "Cut without losing your sanity. Find your deficit, eat enough protein, and track what works.",
  },
  {
    goal: "build-muscle",
    label: "Build Muscle",
    emoji: "💪",
    supportingCopy:
      "Eat enough to grow. Hit your protein targets. Train, recover, repeat.",
  },
  {
    goal: "maintain",
    label: "Maintain",
    emoji: "⚖️",
    supportingCopy:
      "Stay consistent, eat with flexibility, and keep your progress without guessing.",
  },
  {
    goal: "gain-weight",
    label: "Gain Weight",
    emoji: "📈",
    supportingCopy:
      "Eat more without eating worse. Calorie-dense whole foods that actually work.",
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
                <div
                  className="flex h-full flex-col rounded-2xl border border-border bg-white p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-soft"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-3xl" aria-hidden="true">
                      {pathway.emoji}
                    </span>
                    <h3 className="text-lg font-bold text-foreground">
                      {pathway.label}
                    </h3>
                  </div>

                  <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                    {pathway.supportingCopy}
                  </p>

                  {posts.length > 0 ? (
                    <ul className="mb-5 flex flex-1 flex-col gap-2.5">
                      {posts.map((post) => (
                        <li key={post.slug}>
                          <Link
                            href={`/blog/${post.slug}`}
                            className="group flex items-start gap-2 text-sm text-foreground hover:text-primary-dark transition-colors"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40 group-hover:bg-primary"
                            />
                            <span className="leading-snug underline-offset-2 group-hover:underline">
                              {post.title}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mb-5 flex-1 text-sm italic text-muted-foreground">
                      More guides coming soon.
                    </p>
                  )}

                  <Link
                    href={`/blog/tag/${pathway.goal}`}
                    className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary-dark hover:gap-2 transition-all"
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
              </FadeInCSS>
            );
          })}
        </div>
      </div>
    </section>
  );
}
