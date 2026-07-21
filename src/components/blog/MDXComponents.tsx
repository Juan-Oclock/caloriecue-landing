import Image from "next/image";
import Link from "next/link";
import { slugify } from "@/lib/blog";
import type { MDXComponents as MDXComponentsType } from "mdx/types";
import React, { type ReactNode } from "react";
import CheatSheetForm from "./CheatSheetForm";
import ProteinPerCalorieCalculator from "./ProteinPerCalorieCalculator";
import CaloriesPerGramCalculator from "./CaloriesPerGramCalculator";
import TrackedAppStoreLink from "@/components/TrackedAppStoreLink";

function getTextContent(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(getTextContent).join("");
  if (children && typeof children === "object" && "props" in children) {
    return getTextContent((children as React.ReactElement<{ children?: ReactNode }>).props.children);
  }
  return "";
}

function Callout({
  type = "info",
  children,
}: {
  type?: "info" | "tip" | "warning";
  children: ReactNode;
}) {
  const styles = {
    info: "border-l-primary bg-gradient-to-r from-primary-50/80 to-transparent shadow-primary-100/50",
    tip: "border-l-primary-light bg-gradient-to-r from-primary-50/80 to-transparent shadow-primary-100/50",
    warning: "border-l-primary-dark bg-gradient-to-r from-primary-50/80 to-transparent shadow-primary-100/50",
  };

  const iconBgStyles = {
    info: "bg-primary-100 text-primary",
    tip: "bg-primary-100 text-primary-light",
    warning: "bg-primary-100 text-primary-dark",
  };

  const icons = {
    info: (
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBgStyles[type]}`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ),
    tip: (
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBgStyles[type]}`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
    ),
    warning: (
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBgStyles[type]}`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
    ),
  };

  return (
    <div className={`rounded-xl border-l-4 border border-border/40 p-5 my-8 flex gap-4 shadow-sm ${styles[type]}`}>
      {icons[type]}
      <div className="text-sm leading-relaxed text-foreground/85 [&>p]:mb-0 [&_strong]:text-foreground">{children}</div>
    </div>
  );
}

function BlogImage({
  src,
  alt,
  caption,
  width = 1376,
  height = 768,
}: {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}) {
  return (
    <figure className="my-8">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 720px, 800px"
        className="rounded-xl w-full h-auto"
      />
      {caption && (
        <figcaption className="text-center text-sm text-muted-foreground mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function AppStoreLink({ contentSlug }: { contentSlug: string }) {
  return (
    <TrackedAppStoreLink
      href="https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503?utm_source=blog&utm_medium=inline_cta&utm_content=app_store_link"
      target="_blank"
      rel="noopener noreferrer"
      location="blog_inline"
      contentSlug={contentSlug}
      className="inline-flex items-center gap-2 btn-primary !text-white text-sm py-2.5 px-5 !no-underline my-4"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
      Download CalorieCue
    </TrackedAppStoreLink>
  );
}

export function getMDXComponents(contentSlug: string): MDXComponentsType {
  const seenIds = new Map<string, number>();

  function uniqueId(text: string): string {
    let id = slugify(text);
    const count = seenIds.get(id) || 0;
    seenIds.set(id, count + 1);
    if (count > 0) {
      id = `${id}-${count}`;
    }
    return id;
  }

  return {
    h2: ({ children }) => {
      const text = getTextContent(children);
      const id = uniqueId(text);
      return (
        <h2 id={id} className="text-2xl font-semibold text-foreground mb-4 mt-10 scroll-mt-28">
          {children}
        </h2>
      );
    },
    h3: ({ children }) => {
      const text = getTextContent(children);
      const id = uniqueId(text);
      return (
        <h3 id={id} className="text-xl font-semibold text-foreground mb-3 mt-8 scroll-mt-28">
          {children}
        </h3>
      );
    },
    p: ({ children }) => (
      <p className="mb-4 leading-relaxed text-foreground/90">{children}</p>
    ),
    a: ({ href, children }) => (
      <Link
        href={href ?? "#"}
        className="text-primary hover:text-primary-dark underline underline-offset-2"
      >
        {children}
      </Link>
    ),
    ul: ({ children }) => (
      <ul className="mb-4 pl-6 space-y-2 list-disc">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-4 pl-6 space-y-2 list-decimal">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed text-foreground/90">{children}</li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary/30 pl-4 my-6 italic text-muted-foreground">
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 my-6 overflow-x-auto text-sm leading-relaxed">
        {children}
      </pre>
    ),
    img: ({ src, alt, title }) => {
      // Caption: prefer an explicit markdown title (`![alt](src "caption")`) so
      // the displayed caption can stay distinct from descriptive SEO alt text.
      // Falls back to alt when no title is given, so existing posts are unchanged.
      const caption = title ?? alt;
      return (
        <figure className="my-6">
          <Image
            src={src ?? ""}
            alt={alt ?? ""}
            width={800}
            height={450}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 720px, 800px"
            className="rounded-xl w-full h-auto"
          />
          {caption && (
            <figcaption className="text-center text-sm text-muted-foreground mt-2">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    },
    hr: () => <hr className="my-8 border-border" />,
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-6">
        <table className="text-sm border-collapse w-max">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-border bg-muted px-4 py-2 text-left font-semibold text-foreground" style={{ whiteSpace: 'nowrap' }}>
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-border px-4 py-2 text-foreground/90" style={{ whiteSpace: 'nowrap' }}>
        {children}
      </td>
    ),
    Callout,
    AppStoreLink: () => <AppStoreLink contentSlug={contentSlug} />,
    BlogImage,
    CheatSheetForm: () => <CheatSheetForm contentSlug={contentSlug} />,
    ProteinPerCalorieCalculator,
    CaloriesPerGramCalculator,
  };
}
