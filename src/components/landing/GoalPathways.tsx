import Link from "next/link";
import FadeInCSS from "@/components/FadeInCSS";
import { getGoalPathway, type GoalTag } from "@/lib/blog";

interface PathwayConfig {
  goal: GoalTag;
  label: string;
  supportingCopy: string;
}

const PATHWAYS: PathwayConfig[] = [
  {
    goal: "lose-weight",
    label: "Lose weight",
    supportingCopy:
      "Cut without losing your sanity. Find your deficit, eat enough protein.",
  },
  {
    goal: "build-muscle",
    label: "Build muscle",
    supportingCopy: "Eat enough to grow. Hit protein. Train, recover, repeat.",
  },
  {
    goal: "maintain",
    label: "Maintain",
    supportingCopy: "Stay consistent and flexible without guessing.",
  },
  {
    goal: "gain-weight",
    label: "Gain weight",
    supportingCopy: "Eat more without eating worse.",
  },
];

const POSTS_PER_PATHWAY = 3;

export function GoalPathways() {
  return (
    <section
      id="guides"
      className="scroll-mt-20 border-y border-border bg-surface"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-20 md:px-8 md:py-28">
        <FadeInCSS className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex max-w-[560px] flex-col gap-3.5">
            <span className="eyebrow">Goal pathways</span>
            <h2 className="text-display text-foreground">Guides for your goal.</h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-primary-dark transition-colors hover:text-primary-700"
          >
            Browse all guides
            <span aria-hidden="true">→</span>
          </Link>
        </FadeInCSS>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PATHWAYS.map((pathway, i) => {
            const posts = getGoalPathway(pathway.goal, POSTS_PER_PATHWAY);
            return (
              <FadeInCSS
                key={pathway.goal}
                y={20}
                delay={i * 0.06}
                viewportMargin="-50px"
                className="h-full"
              >
                <article className="flex h-full flex-col gap-3.5 rounded-[20px] border border-border bg-background p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover">
                  <h3 className="text-lg font-bold text-foreground">
                    {pathway.label}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {pathway.supportingCopy}
                  </p>

                  {posts.length > 0 ? (
                    <ul className="flex flex-col gap-2 border-t border-border pt-3.5">
                      {posts.map((post) => (
                        <li key={post.slug}>
                          <Link
                            href={`/blog/${post.slug}`}
                            className="block text-sm font-medium leading-[1.4] text-foreground transition-colors hover:text-primary-dark"
                          >
                            {post.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="border-t border-border pt-3.5 text-sm italic text-subtle">
                      More guides coming soon.
                    </p>
                  )}

                  <div className="mt-auto pt-2">
                    <Link
                      href={`/blog/tag/${pathway.goal}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-dark transition-all hover:gap-2.5"
                    >
                      View all {pathway.label.toLowerCase()} guides
                      <span aria-hidden="true">→</span>
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
