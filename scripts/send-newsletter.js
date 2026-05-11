#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const matter = require("gray-matter");
const { Resend } = require("resend");

// ─── Config ────────────────────────────────────────────────────────────────
const AUDIENCE_ID = "511ab1c1-5a5c-4b58-9d22-8bf8aaf2e912";
const BLOG_DIR = path.join(process.cwd(), "content/blog");
const BASE_URL = "https://caloriecue.app";
const APP_STORE_URL =
  "https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503";

// ─── Load .env.local ───────────────────────────────────────────────────────
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const match = line.match(/^([^#=\s][^=]*)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

// ─── Arg validation ────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const testIndex = args.indexOf("--test");
const testEmail = testIndex !== -1 ? args[testIndex + 1] : null;
const slug = args.find((a) => !a.startsWith("--") && a !== testEmail);

if (!slug) {
  console.error("Usage: node scripts/send-newsletter.js <slug> [--test <email>]");
  console.error("Example: node scripts/send-newsletter.js how-to-eat-more-protein");
  console.error("Example: node scripts/send-newsletter.js how-to-eat-more-protein --test you@gmail.com");
  process.exit(1);
}

if (testIndex !== -1 && !testEmail) {
  console.error("Error: --test requires an email address.");
  process.exit(1);
}

if (!process.env.RESEND_API_KEY) {
  console.error("Error: RESEND_API_KEY is not set in .env.local or environment.");
  process.exit(1);
}

// ─── Blog helpers ──────────────────────────────────────────────────────────
function readPost(postSlug) {
  const filePath = path.join(BLOG_DIR, `${postSlug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const { data } = matter(fs.readFileSync(filePath, "utf-8"));
  if (data.published === false) return null;
  return { slug: postSlug, ...data, tags: data.tags ?? [] };
}

function getAllPosts() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => readPost(f.replace(/\.mdx$/, "")))
    .filter(Boolean)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getRelatedPosts(currentSlug, allPosts, limit = 3) {
  const current = allPosts.find((p) => p.slug === currentSlug);
  const others = allPosts.filter((p) => p.slug !== currentSlug);
  if (!current) return others.slice(0, limit);
  return others
    .map((p) => ({ post: p, score: p.tags.filter((t) => current.tags.includes(t)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.post);
}

// ─── Email HTML builder ────────────────────────────────────────────────────
function buildEmailHtml(post, relatedPosts) {
  const coverImg = post.coverImage
    ? `<img src="${BASE_URL}${post.coverImage}" alt="${post.title}" style="width:100%;border-radius:8px;margin-bottom:24px;">`
    : "";

  const relatedLinks = relatedPosts
    .map(
      (p) =>
        `<li style="margin-bottom:10px;"><a href="${BASE_URL}/blog/${p.slug}" style="color:#E05A3A;text-decoration:none;font-size:14px;">→ ${p.title}</a></li>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#E05A3A,#FF7F5C);padding:40px 24px;text-align:center;">
      <h1 style="color:#ffffff;font-size:22px;margin:0 0 8px 0;">New on the Blog</h1>
      <p style="color:rgba(255,255,255,0.9);font-size:14px;margin:0;">Fresh tips to help you reach your goals</p>
    </div>

    <div style="padding:32px 24px;">

      ${coverImg}

      <!-- Featured post -->
      <h2 style="font-size:20px;color:#1a1a1a;margin:0 0 12px 0;">${post.title}</h2>
      <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 24px 0;">${post.description}</p>

      <!-- Primary CTA -->
      <div style="text-align:center;margin:32px 0;">
        <a href="${BASE_URL}/blog/${post.slug}" style="display:inline-block;background:#E05A3A;color:#ffffff;font-weight:600;font-size:16px;padding:14px 32px;border-radius:10px;text-decoration:none;">Read the Article →</a>
      </div>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">

      <!-- Related posts -->
      <h3 style="font-size:16px;color:#1a1a1a;margin:0 0 16px 0;">You might also like</h3>
      <ul style="padding-left:0;list-style:none;margin:0 0 32px 0;">
        ${relatedLinks}
      </ul>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">

      <!-- App CTA -->
      <div style="text-align:center;">
        <p style="font-size:14px;color:#333;font-weight:600;margin:0 0 8px 0;">Track calories in 3 seconds</p>
        <p style="font-size:13px;color:#666;margin:0 0 16px 0;">Snap a photo. Get instant calories &amp; macros. Done.</p>
        <a href="${APP_STORE_URL}" style="display:inline-block;background:#1a1a1a;color:#ffffff;font-weight:600;font-size:14px;padding:10px 24px;border-radius:8px;text-decoration:none;">Download CalorieCue</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color:#f9f9f9;padding:16px 24px 80px 24px;text-align:center;">
      <p style="font-size:11px;color:#999;margin:0 0 8px 0;">CalorieCue — AI Photo Calorie Tracker &bull; caloriecue.app</p>
      <p style="font-size:11px;color:#999;margin:0;"><a href="{{unsubscribe_url}}" style="color:#999;text-decoration:underline;">Unsubscribe</a></p>
    </div>

  </div>
</body>
</html>`;
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const allPosts = getAllPosts();
  const post = readPost(slug);

  if (!post) {
    console.error(`Error: No published post found for slug "${slug}"`);
    console.error(`Available slugs:\n${allPosts.map((p) => `  ${p.slug}`).join("\n")}`);
    process.exit(1);
  }

  const relatedPosts = getRelatedPosts(slug, allPosts);
  const html = buildEmailHtml(post, relatedPosts);
  const fullSubject = `New article: ${post.title}`;
  const subject = fullSubject.length > 70 ? fullSubject.slice(0, 67) + "..." : fullSubject;

  console.log(`\nCreating Resend Broadcast draft for: "${post.title}"`);
  console.log(`  Subject: ${subject}`);
  console.log(`  Related posts: ${relatedPosts.map((p) => p.title).join(", ") || "none"}`);

  const resend = new Resend(process.env.RESEND_API_KEY);

  if (testEmail) {
    console.log(`\nSending test email to ${testEmail}...`);
    const { error } = await resend.emails.send({
      from: "CalorieCue <hello@track.caloriecue.app>",
      replyTo: "support@caloriecue.app",
      to: testEmail,
      subject: `[TEST] ${subject}`,
      html,
    });
    if (error) {
      console.error("\nResend API error:", error);
      process.exit(1);
    }
    console.log(`✓ Test email sent to ${testEmail}`);
    return;
  }

  const { data, error } = await resend.broadcasts.create({
    audienceId: AUDIENCE_ID,
    from: "CalorieCue <hello@track.caloriecue.app>",
    replyTo: "support@caloriecue.app",
    name: post.title.length > 70 ? post.title.slice(0, 67) + "..." : post.title,
    subject,
    html,
  });

  if (error) {
    console.error("\nResend API error:", error);
    process.exit(1);
  }

  console.log(`\n✓ Draft broadcast created! ID: ${data.id}`);
  console.log(`  Review and send at: https://resend.com/broadcasts/${data.id}`);
}

main().catch((err) => {
  console.error("Unexpected error:", err.message);
  process.exit(1);
});
