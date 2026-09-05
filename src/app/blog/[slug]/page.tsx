import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkUnwrapImages from "remark-unwrap-images";
import { Navigation, Footer } from "@/components";
import { TableOfContents, ShareButtons, RelatedPosts, NewsletterSection, BlogTldr, ReadingProgress, getMDXComponents } from "@/components/blog";
import TrackedAppStoreLink from "@/components/TrackedAppStoreLink";
import { AppleLogo } from "@/components/AppStoreButton";
import { getAllPosts, getPostBySlug, extractHeadings, GOAL_TAGS } from "@/lib/blog";
import { getTagMeta, primaryTag } from "@/lib/blog/tag-meta";

const APP_STORE_URL = "https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503";

/** Goal tags have their own listing pages; every other tag falls back to the Guides index. */
function tagHref(tag: string): string {
  return (GOAL_TAGS as string[]).includes(tag) ? `/blog/tag/${tag}` : "/blog";
}

function formatArticleDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.metaTitle ?? post.title,
    description: post.description,
    alternates: {
      canonical: `https://caloriecue.app/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `https://caloriecue.app/blog/${post.slug}`,
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: post.coverImage ?? `/blog/${post.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: post.coverImageAlt ?? post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [
        {
          url: post.coverImage ?? `/blog/${post.slug}/opengraph-image`,
          alt: post.coverImageAlt ?? post.title,
        },
      ],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const headings = extractHeadings(post.content);

  const { content } = await compileMDX({
    source: post.content,
    components: getMDXComponents(post.slug),
    options: { mdxOptions: { remarkPlugins: [remarkGfm, remarkUnwrapImages] } },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.dateModified ?? post.date,
    inLanguage: "en-US",
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "CalorieCue",
      logo: {
        "@type": "ImageObject",
        url: "https://caloriecue.app/app-icons/1024.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://caloriecue.app/blog/${post.slug}`,
    },
    image: {
      "@type": "ImageObject",
      url: post.coverImage
        ? `https://caloriecue.app${post.coverImage}`
        : `https://caloriecue.app/blog/${post.slug}/opengraph-image`,
      width: 1200,
      height: 630,
    },
    keywords: post.tags.join(", "),
    wordCount: post.content.trim().split(/\s+/).length,
  };

  const faqJsonLd = post.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }
    : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://caloriecue.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://caloriecue.app/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://caloriecue.app/blog/${post.slug}`,
      },
    ],
  };

  const primary = primaryTag(post.tags);
  const primaryLabel = primary ? getTagMeta(primary).label : null;
  const imagePosition =
    post.imagePosition === "top"
      ? "object-top"
      : post.imagePosition === "bottom"
        ? "object-bottom"
        : "object-center";

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <ReadingProgress />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* Article header */}
      <header className="px-5 pt-28 md:px-8 md:pt-36">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:gap-11">
          <div className="mx-auto flex w-full max-w-[820px] flex-col items-center gap-5 text-center">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center justify-center gap-2.5 text-[13px] text-subtle"
            >
              <Link
                href="/blog"
                className="font-semibold text-muted-foreground transition-colors hover:text-primary-dark"
              >
                Guides
              </Link>
              {primary && primaryLabel && (
                <>
                  <span aria-hidden="true">/</span>
                  <Link
                    href={tagHref(primary)}
                    className="font-semibold text-primary-dark transition-colors hover:text-primary-700"
                  >
                    {primaryLabel}
                  </Link>
                </>
              )}
            </nav>
            <h1 className="text-balance text-[clamp(2.125rem,4.6vw,3.75rem)] font-extrabold leading-[1.04] tracking-[-0.03em] text-foreground">
              {post.title}
            </h1>
            <p className="max-w-[640px] text-lg leading-[1.45] text-muted-foreground text-pretty md:text-xl">
              {post.description}
            </p>
          </div>

          {/* Hero image */}
          <div className="relative h-[clamp(240px,38vw,520px)] overflow-hidden rounded-[28px] bg-foreground shadow-[0_30px_70px_rgba(35,29,26,0.18)]">
            {post.coverImage ? (
              <>
                <Image
                  src={post.coverImage}
                  alt={post.coverImageAlt ?? post.title}
                  fill
                  priority
                  sizes="(max-width: 1200px) 100vw, 1120px"
                  quality={85}
                  className={`object-cover ${post.coverImageMobile ? "hidden md:block" : ""} ${imagePosition}`}
                />
                {post.coverImageMobile && (
                  <Image
                    src={post.coverImageMobile}
                    alt={post.coverImageAlt ?? post.title}
                    fill
                    priority
                    sizes="100vw"
                    quality={85}
                    className={`object-cover md:hidden ${imagePosition}`}
                  />
                )}
              </>
            ) : (
              <div className="absolute inset-0 bg-peach" aria-hidden="true" />
            )}
            <div
              className="absolute inset-0 bg-[linear-gradient(to_top,rgba(31,31,31,0.82)_0%,rgba(31,31,31,0.45)_40%,rgba(31,31,31,0)_75%)] md:bg-[linear-gradient(to_top,rgba(31,31,31,0.72)_0%,rgba(31,31,31,0.15)_45%,rgba(31,31,31,0)_70%)]"
              aria-hidden="true"
            />

            {post.imageCredit && (
              <div className="absolute right-4 top-3 z-10">
                {post.imageCreditUrl ? (
                  <a
                    href={post.imageCreditUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-white/60 transition-colors hover:text-white"
                  >
                    {post.imageCredit}
                  </a>
                ) : (
                  <span className="text-[10px] text-white/60">{post.imageCredit}</span>
                )}
              </div>
            )}

            <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-end justify-between gap-4 text-white sm:inset-x-6 sm:bottom-6 md:inset-x-8 md:bottom-7">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-dark text-[15px] font-extrabold"
                  aria-hidden="true"
                >
                  {post.author.charAt(0).toUpperCase()}
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[15px] font-bold">{post.author}</span>
                  <span className="text-[13px] text-white/80">
                    <time dateTime={post.date}>{formatArticleDate(post.date)}</time> ·{" "}
                    {post.readingTime} min read
                  </span>
                </span>
              </div>
              <ul className="flex flex-wrap gap-1.5" aria-label="Topics">
                {post.tags.slice(0, 3).map((tag) => (
                  <li key={tag}>
                    <Link
                      href={tagHref(tag)}
                      className="inline-block rounded-full border border-white/25 bg-white/15 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-primary-dark hover:border-primary-dark"
                    >
                      {getTagMeta(tag).label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </header>

      {/* Body + sidebar */}
      <section className="px-5 py-12 md:px-8 md:py-16">
        <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
          <article className="min-w-0 max-w-[720px] overflow-x-hidden">
            <BlogTldr
              body={post.tldr ?? post.description}
              utmContent={post.slug}
              readingTime={post.readingTime}
            />
            <TableOfContents headings={headings} variant="mobile" />
            <div className="prose-custom">{content}</div>

            <div className="mt-12 border-t border-border pt-7">
              <ShareButtons title={post.title} slug={post.slug} />
            </div>
          </article>

          {/* Sidebar (desktop only) */}
          <aside className="hidden flex-col gap-4 lg:sticky lg:top-24 lg:flex">
            <TableOfContents headings={headings} variant="desktop" />

            <TrackedAppStoreLink
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              location="blog_inline"
              contentSlug={post.slug}
              className="group flex flex-col gap-3 rounded-[18px] bg-foreground p-5 text-white transition-transform hover:-translate-y-0.5"
            >
              <Image
                src="/app-icons/80.png"
                alt=""
                width={40}
                height={40}
                className="rounded-[11px]"
              />
              <span className="text-[17px] font-extrabold leading-[1.2] tracking-[-0.015em]">
                Track any meal in 3 seconds — even the messy ones.
              </span>
              <span className="text-[13px] leading-relaxed text-white/70">
                Free on iOS. 4.9 ★ on the App Store.
              </span>
              <span className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[11px] bg-primary-dark text-sm font-bold transition-colors group-hover:bg-primary-700">
                <AppleLogo className="h-4 w-4" />
                Download free
              </span>
            </TrackedAppStoreLink>

            <Link
              href="/tdee-calculator"
              className="flex items-center justify-between gap-3 rounded-[18px] border border-border bg-surface px-5 py-4 text-foreground transition-colors hover:border-primary"
            >
              <span className="flex flex-col gap-0.5">
                <span className="text-xs font-bold uppercase tracking-[0.06em] text-primary-dark">
                  Free tool
                </span>
                <span className="text-[15px] font-bold">Find your daily calorie target</span>
              </span>
              <span className="text-lg text-subtle" aria-hidden="true">
                →
              </span>
            </Link>

            <figure className="flex flex-col gap-3 rounded-[18px] border border-border bg-surface p-5">
              <span className="text-[13px] tracking-[2px] text-primary" role="img" aria-label="5 out of 5 stars">
                ★★★★★
              </span>
              <blockquote className="text-[15px] leading-relaxed text-foreground text-pretty">
                “Logging food is much easier, especially with the photo feature where the AI
                scans the food and automatically calculates the calories.”
              </blockquote>
              <figcaption className="flex items-center gap-2.5 text-xs text-subtle">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-xs font-bold text-white"
                  aria-hidden="true"
                >
                  A
                </span>
                <span>
                  <strong className="font-semibold text-foreground">App Store review</strong> · 4.9 ★
                  average
                </span>
              </figcaption>
            </figure>
          </aside>
        </div>
      </section>

      <RelatedPosts currentSlug={post.slug} />
      <NewsletterSection contentSlug={post.slug} />
      <Footer />
    </main>
  );
}
