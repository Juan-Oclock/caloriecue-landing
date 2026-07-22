import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkUnwrapImages from "remark-unwrap-images";
import { Navigation, Footer, FadeIn } from "@/components";
import { TableOfContents, ShareButtons, RelatedPosts, NewsletterSection, BlogTldr, getMDXComponents } from "@/components/blog";
import { getAllPosts, getPostBySlug, extractHeadings } from "@/lib/blog";

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
    components: getMDXComponents(),
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

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

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

      {/* Hero Image Section */}
      <div className="relative w-full h-[350px] md:h-[450px] lg:h-[500px] mt-16 md:mt-20">
        {post.coverImage ? (
          <>
            <Image
              src={post.coverImage}
              alt={post.coverImageAlt ?? post.title}
              fill
              priority
              sizes="100vw"
              quality={85}
              className={`object-cover ${post.coverImageMobile ? "hidden md:block" : ""} ${post.imagePosition === "top" ? "object-top" : post.imagePosition === "bottom" ? "object-bottom" : "object-center"}`}
            />
            {post.coverImageMobile && (
              <Image
                src={post.coverImageMobile}
                alt={post.coverImageAlt ?? post.title}
                fill
                priority
                sizes="100vw"
                quality={85}
                className={`object-cover md:hidden ${post.imagePosition === "top" ? "object-top" : post.imagePosition === "bottom" ? "object-bottom" : "object-center"}`}
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-orange-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {post.imageCredit && (
          <div className="absolute top-2 right-3 z-10">
            {post.imageCreditUrl ? (
              <a
                href={post.imageCreditUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-white/40 hover:text-white/70 transition-colors"
              >
                {post.imageCredit}
              </a>
            ) : (
              <span className="text-[10px] text-white/40">{post.imageCredit}</span>
            )}
          </div>
        )}

        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-5xl mx-auto w-full px-4 pb-8 md:pb-12">
            <FadeIn>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors mb-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Blog
              </Link>

              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                <span className="font-medium text-white">{post.author}</span>
                <span aria-hidden="true">&middot;</span>
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
                <span aria-hidden="true">&middot;</span>
                <span className="inline-flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {post.readingTime} min read
                </span>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="py-12 md:py-16 px-4 overflow-x-hidden">
        <div className="max-w-5xl mx-auto">
          {/* Two-column layout */}
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Content */}
            <div className="lg:col-span-8 min-w-0">
              <BlogTldr body={post.tldr ?? post.description} utmContent={post.slug} />
              <TableOfContents headings={headings} variant="mobile" />
              <div className="prose-custom">{content}</div>

              {/* Share */}
              <div className="mt-10 pt-6 border-t border-border">
                <ShareButtons title={post.title} slug={post.slug} />
              </div>
            </div>

            {/* Sidebar TOC (desktop only) */}
            <aside className="hidden lg:block lg:col-span-4">
              <TableOfContents headings={headings} variant="desktop" />
            </aside>
          </div>

          {/* Related posts */}
          <RelatedPosts currentSlug={post.slug} />
        </div>
      </article>

      <NewsletterSection />
      <Footer />
    </main>
  );
}
