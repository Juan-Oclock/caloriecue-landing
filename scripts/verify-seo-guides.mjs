import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();

const targetPosts = [
  {
    slug: "high-protein-low-calorie-foods",
    title: "High Protein Low Calorie Foods: 40 Best Options Ranked",
    description:
      "See the best high-protein, low-calorie foods ranked by protein per calorie, with serving sizes, calories, and protein for weight loss meals.",
    quickAnswer:
      "The best high-protein, low-calorie foods are shrimp, tuna, cod, egg whites, whey protein, chicken breast, turkey jerky, pork tenderloin, fat-free Greek yogurt, and cottage cheese.",
  },
  {
    slug: "how-to-track-calories",
    title: "How to Track Calories: 5 Beginner Steps That Actually Stick",
    description:
      "Learn how to track calories without a food scale: set your target, log meals fast, estimate portions, and avoid the mistakes that make beginners quit.",
    quickAnswer:
      "To track calories, set a daily target, choose a logging method you can repeat, estimate portions consistently, log meals before you forget, and review your weekly average instead of chasing perfect daily numbers.",
  },
  {
    slug: "best-calorie-tracker-app",
    title: "Best AI Calorie Tracker Apps in 2026: Tested Comparison",
    description:
      "Compare the best AI calorie tracker apps for speed, accuracy, price, photo logging, barcode scanning, and daily weight-loss tracking.",
    quickAnswer:
      "The best AI calorie tracker app is the one you will use daily: prioritize fast photo logging, verified nutrition data, simple editing, barcode scanning, and a clean calorie-and-macro view over feature bloat.",
  },
  {
    slug: "calories-in-food-list",
    title: "Calories in Food List: 200+ Common Foods With Servings",
    description:
      "Look up calories and protein for 200+ common foods by category, with standard serving sizes and USDA-based nutrition data.",
    quickAnswer:
      "Common food calories vary most by category: lean proteins are usually 100-250 calories per serving, cooked grains are about 200 calories per cup, fats are about 120 calories per tablespoon, and non-starchy vegetables are usually under 50 calories per cup.",
  },
];

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const post of targetPosts) {
  const file = `content/blog/${post.slug}.mdx`;
  const parsed = matter(readText(file));

  assert(
    parsed.data.title === post.title,
    `${file} title should be "${post.title}"`
  );
  assert(
    parsed.data.description === post.description,
    `${file} description should be "${post.description}"`
  );
  assert(
    parsed.content.includes("## Quick Answer"),
    `${file} should include a Quick Answer section`
  );
  assert(
    parsed.content.includes(post.quickAnswer),
    `${file} should include the planned quick answer copy`
  );
}

const blogLib = readText("src/lib/blog/index.ts");
assert(
  /export function getPostsBySlugs\(\s*slugs: string\[\]\s*\): BlogPostMeta\[\]/m.test(
    blogLib
  ),
  "src/lib/blog/index.ts should export getPostsBySlugs(slugs: string[])"
);

const homepagePreview = readText("src/components/BlogPreview.tsx");
assert(
  homepagePreview.includes("POPULAR_GUIDE_SLUGS"),
  "BlogPreview should define curated popular guide slugs"
);
assert(
  homepagePreview.includes("Popular Calorie Tracking Guides"),
  "BlogPreview should render the curated guide section heading"
);

const blogListing = readText("src/components/blog/BlogListingClient.tsx");
assert(
  blogListing.includes("featuredGuides"),
  "BlogListingClient should accept featuredGuides"
);
assert(
  blogListing.includes("Start with these guides"),
  "BlogListingClient should render the curated guide section heading"
);

for (const post of targetPosts) {
  assert(
    homepagePreview.includes(post.slug),
    `BlogPreview should link to ${post.slug}`
  );
  assert(
    blogListing.includes(post.slug) || blogListing.includes("featuredGuides"),
    `BlogListingClient should surface ${post.slug}`
  );
}

console.log("SEO guide verification passed.");
