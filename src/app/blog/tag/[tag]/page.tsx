import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navigation, Footer } from "@/components";
import { BlogPostCardEditorial } from "@/components/blog";
import { GOAL_TAGS, getPostsByTag, type GoalTag } from "@/lib/blog";

interface PageProps {
  params: Promise<{ tag: string }>;
}

const GOAL_META: Record<
  GoalTag,
  { label: string; emoji: string; intro: string; description: string }
> = {
  "lose-weight": {
    label: "Lose Weight",
    emoji: "🔥",
    intro:
      "Cut without losing your sanity. Find your deficit, eat enough protein, and track what actually works.",
    description:
      "Guides on building a calorie deficit, tracking what you eat, and losing weight without burning out — from the CalorieCue team.",
  },
  "build-muscle": {
    label: "Build Muscle",
    emoji: "💪",
    intro:
      "Eat enough to grow, hit your protein targets, and train consistently.",
    description:
      "Practical guides on protein intake, calorie surplus, and tracking food for muscle gain — from the CalorieCue team.",
  },
  maintain: {
    label: "Maintain",
    emoji: "⚖️",
    intro:
      "Stay consistent, eat with flexibility, and keep your progress without guessing.",
    description:
      "Guides on weight maintenance, flexible tracking, and long-term consistency — from the CalorieCue team.",
  },
  "gain-weight": {
    label: "Gain Weight",
    emoji: "📈",
    intro:
      "Eat more without eating worse. Calorie-dense whole foods that actually work.",
    description:
      "Guides on healthy weight gain, eating in a surplus, and calorie-dense food choices — from the CalorieCue team.",
  },
};

function isGoalTag(value: string): value is GoalTag {
  return (GOAL_TAGS as string[]).includes(value);
}

export function generateStaticParams() {
  return GOAL_TAGS.map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  if (!isGoalTag(tag)) {
    return { title: "Not found" };
  }
  const meta = GOAL_META[tag];
  const title = `${meta.label} guides`;
  const url = `https://caloriecue.app/blog/tag/${tag}`;
  return {
    title,
    description: meta.description,
    alternates: { canonical: url },
    robots: { index: false, follow: true },
    openGraph: {
      title: `${title} | CalorieCue`,
      description: meta.description,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | CalorieCue`,
      description: meta.description,
    },
  };
}

export default async function BlogTagPage({ params }: PageProps) {
  const { tag } = await params;
  if (!isGoalTag(tag)) notFound();

  const meta = GOAL_META[tag];
  const posts = getPostsByTag(tag);

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <section className="px-5 pt-28 pb-8 md:px-8 md:pt-36 md:pb-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-4">
          <Link
            href="/blog"
            className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primary-dark transition-colors hover:text-primary-700"
          >
            <span aria-hidden="true">←</span>
            All guides
          </Link>
          <span className="eyebrow">
            Goal pathway · {posts.length} {posts.length === 1 ? "guide" : "guides"}
          </span>
          <h1 className="text-hero text-foreground text-balance">
            {meta.label} guides
          </h1>
          <p className="max-w-[640px] text-lg leading-[1.45] text-muted-foreground text-pretty md:text-xl">
            {meta.intro}
          </p>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto max-w-6xl">
          {posts.length === 0 ? (
            <p className="rounded-[20px] border border-dashed border-border-strong bg-surface px-6 py-12 text-center text-muted-foreground">
              No guides for this goal yet — check back soon, or{" "}
              <Link href="/blog" className="font-semibold text-primary-dark underline underline-offset-2 hover:text-primary-700">
                browse all guides
              </Link>
              .
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => (
                <BlogPostCardEditorial key={post.slug} post={post} delay={Math.min(i, 5) * 0.05} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
