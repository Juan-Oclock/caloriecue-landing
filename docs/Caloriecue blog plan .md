# CalorieCue Blog Feature — Agent Team Implementation Plan

## Project Overview

Add a full blogging system to the CalorieCue NextJS landing page using **MDX + Outstatic CMS**, while also auditing and improving the existing site's SEO foundation. The blog will live at `/blog` with individual posts at `/blog/[slug]`, and be featured on the landing page with a preview section.

---

## Current State Assessment

**Landing Page (caloriecue.app):**
- NextJS + Tailwind/Shadcn UI, deployed on Vercel
- Pages: `/`, `/privacy`, `/terms`, `/support`
- No blog, no sitemap.xml, no robots.txt visible
- No structured data (JSON-LD)
- Missing Open Graph / Twitter meta tags (needs audit)
- No canonical URLs set

---

## Phase 1: SEO Foundation Audit & Fix

**🤖 Agent: SEO Auditor**
**Role:** Audit the existing landing page and fix all SEO issues before adding the blog.

### Tasks:

1. **Determine NextJS version and router type**
   - Check `package.json` for NextJS version
   - Confirm if using App Router (`/app`) or Pages Router (`/pages`)
   - This determines the implementation approach for everything else

2. **Meta tags audit & fix**
   - Audit all existing pages for `<title>`, `<meta description>`, Open Graph tags, Twitter Card tags
   - Add/fix missing meta tags on every page
   - Ensure unique titles and descriptions per page
   - Add `<link rel="canonical">` to all pages

3. **Generate `sitemap.xml`**
   - Use `next-sitemap` package or NextJS built-in sitemap generation (App Router)
   - Include all existing pages: `/`, `/privacy`, `/terms`, `/support`
   - Configure to auto-include future `/blog/*` routes
   - Submit to Google Search Console

4. **Generate `robots.txt`**
   - Allow all crawlers
   - Point to sitemap location
   - Block any admin/API routes if applicable

5. **Add structured data (JSON-LD)**
   - Add `SoftwareApplication` schema to the homepage (for the app)
   - Add `Organization` schema
   - Add `FAQPage` schema for the FAQ section (this is a big SEO win — the FAQ content is already there)
   - Add `Review` schema for the testimonials section

6. **Performance & Core Web Vitals check**
   - Run Lighthouse audit
   - Check image optimization (already using `next/image` ✓)
   - Verify proper heading hierarchy (h1 → h2 → h3)
   - Check for missing `alt` tags on images

7. **Add Google Search Console verification**
   - Add verification meta tag or DNS record
   - Ensure site is indexed

### Deliverables:
- [ ] SEO audit report (list of issues found)
- [ ] All meta tags fixed across existing pages
- [ ] `sitemap.xml` auto-generating
- [ ] `robots.txt` in place
- [ ] JSON-LD structured data on homepage
- [ ] Lighthouse score report (before/after)

---

## Phase 2: Blog Infrastructure Setup

**🤖 Agent: Blog Architect**
**Role:** Set up the MDX blog system and Outstatic CMS integration.

### Tasks:

1. **Install and configure MDX support**
   - Install dependencies: `@next/mdx`, `gray-matter`, `next-mdx-remote` (or `contentlayer2` if App Router)
   - Configure `next.config.js` for MDX
   - Set up frontmatter schema for blog posts:
     ```yaml
     ---
     title: "Post Title"
     description: "SEO meta description"
     date: "2026-02-14"
     author: "CalorieCue Team"
     coverImage: "/blog/images/post-slug/cover.jpg"
     tags: ["nutrition", "calorie-tracking", "tips"]
     published: true
     ---
     ```

2. **Create blog directory structure**
   ```
   /content/
     /blog/
       /posts/
         my-first-post.mdx
       /images/
         /my-first-post/
           cover.jpg
   ```

3. **Set up Outstatic CMS**
   - Install Outstatic: `npm install outstatic`
   - Configure GitHub OAuth app for authentication
   - Set up `/admin` route (protected)
   - Configure content collections for "blog" posts
   - Set environment variables for Vercel:
     - `OST_GITHUB_ID`
     - `OST_GITHUB_SECRET`
     - `OST_TOKEN_SECRET`
     - `OST_REPO_SLUG`

4. **Create utility functions**
   - `getAllPosts()` — fetch all published posts, sorted by date
   - `getPostBySlug(slug)` — fetch single post with MDX content
   - `getRelatedPosts(tags, currentSlug)` — fetch related posts by tags
   - `getAllTags()` — get all unique tags for filtering

### Deliverables:
- [ ] MDX pipeline working (can render `.mdx` files as pages)
- [ ] Outstatic CMS accessible at `/admin`
- [ ] Content directory structure created
- [ ] Utility functions for fetching/filtering posts
- [ ] Environment variables documented for Vercel

---

## Phase 3: Blog Pages & Routes

**🤖 Agent: Blog Frontend Developer**
**Role:** Build all blog-related pages and components with Tailwind/Shadcn, matching the existing CalorieCue design system.

### Tasks:

1. **Create `/blog` listing page**
   - Grid/list of blog post cards (title, description, cover image, date, tags)
   - Pagination or "Load More" (start with showing all, add pagination when > 20 posts)
   - Tag filtering (clickable tags to filter posts)
   - SEO: unique `<title>`, meta description, Open Graph tags
   - Breadcrumbs: Home > Blog

2. **Create `/blog/[slug]` post page**
   - Render MDX content with styled components (headings, code blocks, images, blockquotes)
   - Post header: title, date, author, reading time, cover image
   - Table of Contents (auto-generated from headings) — sidebar on desktop, collapsible on mobile
   - Tags displayed and linked
   - "Related Posts" section at the bottom (based on shared tags)
   - Social sharing buttons (copy link, Twitter/X, Facebook)
   - SEO: dynamic `<title>`, meta description from frontmatter, Open Graph image from cover
   - Breadcrumbs: Home > Blog > Post Title
   - Add `BlogPosting` JSON-LD structured data

3. **Create MDX components library**
   - Styled versions of: `h1`-`h6`, `p`, `a`, `ul/ol`, `blockquote`, `code/pre`, `img`, `table`
   - Custom components: `<Callout>`, `<AppStoreButton>`, `<NutritionTip>`
   - All styled with Tailwind to match CalorieCue design

4. **Create blog preview section for landing page**
   - Add a "Latest from the Blog" section on the homepage (above the CTA / footer)
   - Show 3 most recent posts as cards
   - "View All Posts →" link to `/blog`
   - Matches existing landing page design language

5. **Mobile responsiveness**
   - Ensure all blog pages are fully responsive
   - Test on mobile viewport sizes
   - Blog cards: single column on mobile, 2-3 columns on desktop

### Deliverables:
- [ ] `/blog` listing page with tag filtering
- [ ] `/blog/[slug]` post page with full MDX rendering
- [ ] MDX component library
- [ ] Landing page blog preview section
- [ ] All pages responsive and matching CalorieCue design

---

## Phase 4: Blog SEO Optimization

**🤖 Agent: Blog SEO Specialist**
**Role:** Ensure every blog post and page is fully optimized for search engines.

### Tasks:

1. **Dynamic SEO for blog pages**
   - Auto-generate `<title>`: `{Post Title} | CalorieCue Blog`
   - Auto-generate `<meta description>` from frontmatter
   - Open Graph tags with cover image for rich social sharing
   - Twitter Card tags (large image summary)
   - Canonical URLs for all blog posts

2. **Update sitemap to include blog**
   - Auto-include all published `/blog/*` routes
   - Set appropriate `changefreq` and `priority`
   - Blog listing page: `weekly`, `0.8`
   - Blog posts: `monthly`, `0.6`

3. **Add RSS feed**
   - Generate `/feed.xml` (RSS 2.0)
   - Include in `<head>` as `<link rel="alternate" type="application/rss+xml">`
   - Auto-update when new posts are published

4. **Internal linking strategy**
   - Ensure blog posts link back to relevant app features
   - Blog listing linked from main navigation
   - Footer link to blog

5. **Add blog to navigation**
   - Add "Blog" link to the main header navigation
   - Add "Blog" link to the footer

### Deliverables:
- [ ] Dynamic SEO meta tags on all blog pages
- [ ] Sitemap updated with blog routes
- [ ] RSS feed at `/feed.xml`
- [ ] Blog added to site navigation (header + footer)
- [ ] Internal linking strategy documented

---

## Phase 5: Content & Testing

**🤖 Agent: QA & Content Tester**
**Role:** End-to-end testing and creation of seed content.

### Tasks:

1. **Create 2-3 seed blog posts**
   - Write placeholder/real posts to test the full pipeline:
     - "How AI is Changing Calorie Tracking" (educational)
     - "5 Tips for Accurate Meal Photo Scanning" (tips, product-related)
     - "CalorieCue vs Manual Calorie Counting" (comparison, SEO-targeted)
   - Each post should have: cover image, tags, proper frontmatter

2. **End-to-end testing**
   - Verify Outstatic CMS: create a post → appears on `/blog`
   - Verify MDX rendering: all components render correctly
   - Verify SEO: check meta tags, Open Graph preview (use ogimage.dev or similar)
   - Verify sitemap includes new blog posts
   - Verify RSS feed includes new posts
   - Verify landing page shows latest posts
   - Test on mobile (Safari iOS, Chrome Android)

3. **Performance testing**
   - Run Lighthouse on `/blog` and `/blog/[slug]`
   - Ensure blog pages score 90+ on all Lighthouse categories
   - Check that images are optimized (use `next/image` for blog images)

4. **Accessibility check**
   - Proper heading hierarchy in blog posts
   - Alt text on all images
   - Keyboard navigation works
   - Color contrast meets WCAG AA

### Deliverables:
- [ ] 2-3 seed blog posts published
- [ ] QA test report (all pages, all viewports)
- [ ] Lighthouse scores for blog pages
- [ ] Accessibility audit passed

---

## Agent Assignment Summary

| Phase | Agent Name | Key Responsibility |
|-------|-----------|-------------------|
| 1 | **SEO Auditor** | Audit & fix existing site SEO foundation |
| 2 | **Blog Architect** | Set up MDX + Outstatic infrastructure |
| 3 | **Blog Frontend Developer** | Build all blog UI pages & components |
| 4 | **Blog SEO Specialist** | Blog-specific SEO, sitemap, RSS |
| 5 | **QA & Content Tester** | Testing, seed content, performance |

### Execution Order & Dependencies

```
Phase 1 (SEO Auditor)
  ↓
Phase 2 (Blog Architect)      ← depends on Phase 1 (needs to know router type)
  ↓
Phase 3 (Blog Frontend Dev)   ← depends on Phase 2 (needs MDX pipeline)
  ↓  runs in parallel with ↓
Phase 4 (Blog SEO Specialist) ← depends on Phase 2 + 3
  ↓
Phase 5 (QA & Content Tester) ← depends on all above
```

**Note:** Phases 3 and 4 can run partially in parallel since the SEO specialist can start on sitemap/RSS/navigation while the frontend developer is building pages.

---

## Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Content format | MDX | React components in markdown, free, version-controlled |
| CMS | Outstatic | Free, built for NextJS, GUI editor, commits to repo |
| Hosting | Vercel (existing) | Already deployed, auto-deploys on push |
| Image optimization | `next/image` | Already used on landing page |
| Styling | Tailwind + Shadcn | Match existing design system |
| Sitemap | `next-sitemap` or built-in | Depends on NextJS version / router |

---

## Estimated Timeline

| Phase | Duration | Notes |
|-------|----------|-------|
| Phase 1 | 1–2 sessions | Mostly audit + config changes |
| Phase 2 | 1–2 sessions | Package installs + Outstatic setup |
| Phase 3 | 2–3 sessions | Biggest chunk — all the UI work |
| Phase 4 | 1 session | Mostly config and auto-generation |
| Phase 5 | 1 session | Testing + seed content |
| **Total** | **6–9 sessions** | |

---

## First Blog Post Ideas (SEO-Targeted)

Once the system is live, here are high-value topics for your 2x/week cadence:

1. "How to Count Calories Without a Food Scale" — high search volume
2. "AI Calorie Tracking: How Accurate Is It?" — positions CalorieCue
3. "Filipino Food Calorie Guide: Sinigang, Adobo & More" — niche + local SEO
4. "Photo vs Barcode: Which Calorie Tracking Method Is More Accurate?"
5. "How to Start Calorie Tracking (Beginner's Guide)" — top of funnel
6. "CalorieCue vs MyFitnessPal: What's Different?" — comparison SEO