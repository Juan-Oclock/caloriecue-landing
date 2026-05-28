import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { BlogPost, BlogPostMeta, Heading } from "./types";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function computeReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  const posts = files
    .map((filename) => {
      const filePath = path.join(BLOG_DIR, filename);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      return {
        title: data.title,
        slug: filename.replace(/\.mdx$/, ""),
        description: data.description,
        date: data.date,
        dateModified: data.dateModified,
        author: data.author ?? "CalorieCue Team",
        coverImage: data.coverImage,
        coverImageMobile: data.coverImageMobile,
        imageCredit: data.imageCredit,
        imageCreditUrl: data.imageCreditUrl,
        imagePosition: data.imagePosition,
        tags: data.tags ?? [],
        published: data.published !== false,
        readingTime: computeReadingTime(content),
        faq: data.faq,
        tldr: data.tldr,
      } satisfies BlogPostMeta;
    })
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}

export function getPostsBySlugs(slugs: string[]): BlogPostMeta[] {
  const postsBySlug = new Map(getAllPosts().map((post) => [post.slug, post]));
  return slugs.flatMap((slug) => {
    const post = postsBySlug.get(slug);
    return post ? [post] : [];
  });
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  if (data.published === false) return null;

  return {
    title: data.title,
    slug,
    description: data.description,
    date: data.date,
    dateModified: data.dateModified,
    author: data.author ?? "CalorieCue Team",
    coverImage: data.coverImage,
    coverImageMobile: data.coverImageMobile,
    imageCredit: data.imageCredit,
    imageCreditUrl: data.imageCreditUrl,
    imagePosition: data.imagePosition,
    tags: data.tags ?? [],
    published: true,
    readingTime: computeReadingTime(content),
    faq: data.faq,
    tldr: data.tldr,
    content,
  };
}

export function getRelatedPosts(
  currentSlug: string,
  limit = 3
): BlogPostMeta[] {
  const all = getAllPosts();
  const current = all.find((p) => p.slug === currentSlug);
  if (!current) return all.filter((p) => p.slug !== currentSlug).slice(0, limit);

  return all
    .filter((p) => p.slug !== currentSlug)
    .map((post) => {
      const sharedTags = post.tags.filter((t) => current.tags.includes(t));
      return { post, score: sharedTags.length };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post);
}

/**
 * Goal-aligned tag slugs that drive the homepage goal pathways
 * section. Distinct from the broader content tag taxonomy
 * (`nutrition`, `protein`, `weight-loss`, etc.) — goal tags are
 * additive and posts may carry both.
 */
export type GoalTag = "lose-weight" | "build-muscle" | "maintain" | "gain-weight";

export const GOAL_TAGS: GoalTag[] = [
  "lose-weight",
  "build-muscle",
  "maintain",
  "gain-weight",
];

/**
 * Returns all published posts that include `tag` in their tags
 * array, sorted by date descending (most recent first), optionally
 * limited to the first N.
 */
export function getPostsByTag(tag: string, limit?: number): BlogPostMeta[] {
  const matches = getAllPosts().filter((post) => post.tags.includes(tag));
  return typeof limit === "number" ? matches.slice(0, limit) : matches;
}

/**
 * Curated pathway for a single goal: most recent N posts tagged
 * with that goal. Wraps `getPostsByTag` and constrains the tag
 * to the goal-tag union so callers can't pass arbitrary strings.
 */
export function getGoalPathway(goal: GoalTag, limit: number = 3): BlogPostMeta[] {
  return getPostsByTag(goal, limit);
}

export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tagSet = new Set<string>();
  posts.forEach((post) => post.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet).sort();
}

export function extractHeadings(content: string): Heading[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: Heading[] = [];
  const seenIds = new Map<string, number>();
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    let id = slugify(match[2].trim());
    const count = seenIds.get(id) || 0;
    seenIds.set(id, count + 1);
    if (count > 0) {
      id = `${id}-${count}`;
    }
    headings.push({
      level: match[1].length as 2 | 3,
      text: match[2].trim(),
      id,
    });
  }

  return headings;
}

export type { BlogPost, BlogPostMeta, Heading };
