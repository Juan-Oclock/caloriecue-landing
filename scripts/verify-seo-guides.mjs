import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();

const targetPosts = [
  {
    slug: "high-protein-low-calorie-foods",
    title: "Foods High in Protein and Low in Calories: 40 Best Options Ranked",
    description:
      "The best foods high in protein and low in calories, ranked with calories, protein, serving sizes, and protein per 100 calories.",
    quickAnswer:
      "The best foods high in protein and low in calories are shrimp, tuna canned in water, cod, egg whites, whey protein, chicken breast, turkey jerky, pork tenderloin, fat-free Greek yogurt, and low-fat cottage cheese.",
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
      "The best AI calorie tracker app is the one you will use daily: prioritize fast photo logging, verified nutrition data, simple editing, barcode scanning, and a clean calorie-and-macro view over feature bloat. CalorieCue is strongest for fast AI photo logging, Cronometer wins on verified nutrition data, MyFitnessPal wins on database size, and FatSecret is the best no-cost option.",
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

const blogPage = readText("src/app/blog/page.tsx");
assert(
  blogPage.includes("FEATURED_GUIDE_SLUGS"),
  "Blog page should define curated featured guide slugs"
);
assert(
  blogPage.includes("featuredGuides"),
  "Blog page should pass featured guides into BlogListingClient"
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
    blogPage.includes(post.slug),
    `Blog page should feature ${post.slug}`
  );
  assert(
    blogListing.includes(post.slug) || blogListing.includes("featuredGuides"),
    `BlogListingClient should surface ${post.slug}`
  );
}

console.log("SEO guide verification passed.");
