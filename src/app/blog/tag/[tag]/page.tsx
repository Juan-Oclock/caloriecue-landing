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

      <section className="pt-28 pb-10 md:pt-36 md:pb-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-4xl mb-3" aria-hidden="true">
            {meta.emoji}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            {meta.label} guides
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            {meta.intro}
          </p>
          <p className="mt-6 text-sm text-muted-foreground">
            <Link href="/blog" className="underline underline-offset-2 hover:text-foreground">
              ← All guides
            </Link>
          </p>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              No guides for this goal yet — check back soon, or{" "}
              <Link href="/blog" className="underline underline-offset-2 hover:text-foreground">
                browse all guides
              </Link>
              .
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {posts.map((post, i) => (
                <BlogPostCardEditorial key={post.slug} post={post} delay={i * 0.05} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
