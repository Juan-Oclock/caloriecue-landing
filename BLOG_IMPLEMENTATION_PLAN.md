# Blog Implementation Plan for CalorieCue Landing Page

## Overview
Add a full-featured blog using **Outstatic** - a CMS built specifically for Next.js that stores content as markdown in your GitHub repo.

**Why Outstatic:**
- No database needed
- Built-in admin dashboard at `/outstatic`
- Content stored in GitHub (version controlled)
- Free and open-source
- Native Next.js 15 App Router support

---

## 1. Installation

```bash
npm install outstatic
```

---

## 2. File Structure to Create

### Outstatic Admin (CMS Dashboard)

```
src/app/
├── (cms)/                              # Route group for CMS
│   ├── layout.tsx                      # Isolated layout for admin
│   └── outstatic/
│       └── [[...ost]]/
│           └── page.tsx                # Admin dashboard
├── api/
│   └── outstatic/
│       └── [[...ost]]/
│           └── route.ts                # API handler
```

### Blog Frontend

```
src/app/
├── blog/
│   ├── page.tsx                        # Blog listing
│   └── [slug]/
│       └── page.tsx                    # Individual post
```

### New Components

```
src/components/
├── blog/
│   ├── index.ts
│   ├── BlogCard.tsx                    # Post preview card
│   ├── BlogGrid.tsx                    # Grid layout
│   └── MarkdownRenderer.tsx            # Render post content
```

---

## 3. Environment Variables

Add to `.env.local`:

```
OST_GITHUB_ID=your_github_oauth_app_id
OST_GITHUB_SECRET=your_github_oauth_app_secret
OST_REPO_SLUG=caloriecue-landing
```

---

## 4. GitHub OAuth Setup

1. Go to GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App
2. Fill in:
   - **Application name**: CalorieCue Blog CMS
   - **Homepage URL**: `http://localhost:3000/`
   - **Authorization callback URL**: `http://localhost:3000/api/outstatic/callback`
3. Copy Client ID → `OST_GITHUB_ID`
4. Generate Client Secret → `OST_GITHUB_SECRET`

For production, create a separate OAuth app with your production URL.

---

## 5. Implementation Steps

### Step 1: Install Outstatic
- [ ] Run `npm install outstatic`
- [ ] Install markdown renderer: `npm install react-markdown remark-gfm`

### Step 2: Create CMS Admin Routes
- [ ] Create `/src/app/(cms)/layout.tsx` - Isolated layout for admin
- [ ] Create `/src/app/(cms)/outstatic/[[...ost]]/page.tsx` - Dashboard
- [ ] Create `/src/app/api/outstatic/[[...ost]]/route.ts` - API handler

### Step 3: Set Up Environment Variables
- [ ] Create GitHub OAuth App
- [ ] Add environment variables to `.env.local`
- [ ] Test admin access at `http://localhost:3000/outstatic`

### Step 4: Create Blog Collection in Outstatic
- [ ] Log into Outstatic dashboard
- [ ] Create "posts" collection with fields:
  - title, slug, publishedAt, coverImage, excerpt, content, author

### Step 5: Build Blog Frontend Components
- [ ] Create `BlogCard.tsx` component
- [ ] Create `BlogGrid.tsx` component
- [ ] Create `MarkdownRenderer.tsx` using react-markdown

### Step 6: Create Blog Listing Page (`/blog`)
- [ ] Create `/src/app/blog/page.tsx`
- [ ] Fetch posts using `getDocuments('posts', fields)`
- [ ] Display posts in grid layout
- [ ] Add SEO metadata

### Step 7: Create Individual Post Page (`/blog/[slug]`)
- [ ] Create `/src/app/blog/[slug]/page.tsx`
- [ ] Fetch post using `getDocumentBySlug()`
- [ ] Render markdown content
- [ ] Add `generateMetadata()` for dynamic SEO
- [ ] Add `generateStaticParams()` for static generation

### Step 8: Update Navigation
- [ ] Add "Blog" link to Navigation.tsx
- [ ] Add blog link to Footer.tsx

### Step 9: Style Blog Pages
- [ ] Match existing design patterns (cards, colors, animations)
- [ ] Add blog-specific prose styles to globals.css

---

## 6. Key Code Snippets

### CMS Layout (`/src/app/(cms)/layout.tsx`)
```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body id="outstatic">{children}</body>
    </html>
  )
}
```

### CMS Dashboard (`/src/app/(cms)/outstatic/[[...ost]]/page.tsx`)
```tsx
import 'outstatic/outstatic.css'
import { Outstatic } from 'outstatic'
import { OstClient } from 'outstatic/client'

export default async function Page(props: { params: Promise<{ ost: string[] }> }) {
  const params = await props.params
  const ostData = await Outstatic()
  return <OstClient ostData={ostData} params={params} />
}
```

### API Route (`/src/app/api/outstatic/[[...ost]]/route.ts`)
```tsx
import { OutstaticApi } from 'outstatic'

export const GET = OutstaticApi.GET
export const POST = OutstaticApi.POST
```

### Fetching Posts (`/src/app/blog/page.tsx`)
```tsx
import { getDocuments } from 'outstatic/server'

export default async function BlogPage() {
  const posts = await getDocuments('posts', [
    'title', 'slug', 'publishedAt', 'coverImage', 'excerpt', 'author'
  ])

  return (
    // Render posts grid
  )
}
```

### Fetching Single Post (`/src/app/blog/[slug]/page.tsx`)
```tsx
import { getDocumentBySlug, getDocuments } from 'outstatic/server'

export async function generateStaticParams() {
  const posts = await getDocuments('posts', ['slug'])
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }) {
  const post = await getDocumentBySlug('posts', params.slug, ['title', 'excerpt', 'coverImage'])
  return {
    title: post?.title,
    description: post?.excerpt,
    openGraph: { images: post?.coverImage ? [post.coverImage] : [] }
  }
}

export default async function Post({ params }) {
  const post = await getDocumentBySlug('posts', params.slug, [
    'title', 'publishedAt', 'content', 'coverImage', 'author'
  ])
  // Render post with MarkdownRenderer
}
```

---

## 7. Files to Modify

| File | Changes |
|------|---------|
| `/src/components/Navigation.tsx` | Add "Blog" nav link |
| `/src/components/Footer.tsx` | Add blog footer link |
| `/src/app/globals.css` | Add blog prose styles |
| `/.env.local` | Add GitHub OAuth credentials |
| `/.gitignore` | Ensure `.env.local` is ignored |

---

## 8. Content Storage

Outstatic stores content in your repo at:
```
outstatic/
└── content/
    └── posts/
        ├── my-first-post.md
        └── another-post.md
```

Each markdown file contains frontmatter + content. Changes are automatically committed to your GitHub repo.

---

## 9. Features Included

- **Admin Dashboard**: Visual editor at `/outstatic`
- **Markdown Editor**: WYSIWYG with slash commands
- **Image Upload**: Stores in repo, fetched from GitHub
- **Collections**: Organize content types (posts, pages, etc.)
- **Version Control**: All content changes tracked in Git
- **SEO**: Dynamic metadata generation
- **Static Generation**: Posts pre-rendered at build time

---

## 10. Optional Enhancements (Future)

- Categories/tags via Outstatic custom fields
- Newsletter signup (reuse existing Supabase waitlist)
- Related posts based on tags
- Search functionality
- RSS feed generation

---

## Alternative Options Considered

If Outstatic doesn't meet your needs, here are alternatives:

| CMS | Type | Best For | Complexity |
|-----|------|----------|------------|
| **Outstatic** | Git-based | Next.js developers | Low |
| **Sanity** | Headless CMS | Flexible content | Medium |
| **TinaCMS** | Git-based | Visual editing | Low-Medium |
| **ButterCMS** | SaaS | Simplest setup | Very Low |
| **Supabase** | Database | Full control | High |

---

## Sources

- [Outstatic Documentation](https://outstatic.com/)
- [Getting Started with Next.js](https://outstatic.com/docs/getting-started-with-next-js)
- [Fetching Data](https://outstatic.com/docs/fetching-data)
- [Environment Variables](https://outstatic.com/docs/environment-variables)
