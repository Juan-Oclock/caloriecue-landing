"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import TrackedAppStoreLink from "@/components/TrackedAppStoreLink";
import { AppleLogo } from "@/components/AppStoreButton";

type BlogTldrProps = {
  body?: string;
  utmContent: string;
  /** Full-article reading time, shown next to the "30-second read" note. */
  readingTime?: number;
};

const APP_STORE_URL = "https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503";

const CTA_CLASS =
  "inline-flex h-12 w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-xl bg-primary-dark px-5 text-[15px] font-bold text-white !no-underline shadow-coral transition-colors hover:bg-primary-700 sm:w-fit";

function CtaBody({ href, utmContent }: { href: string; utmContent: string }) {
  return (
    <>
      <p className="text-sm leading-relaxed text-white/70">
        Track any meal in 3 seconds, even the messy ones.
      </p>
      <TrackedAppStoreLink
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        location="blog_tldr"
        contentSlug={utmContent}
        className={CTA_CLASS}
      >
        <AppleLogo className="h-[18px] w-[18px]" />
        Download CalorieCue — Free
      </TrackedAppStoreLink>
    </>
  );
}

function TldrCta({ utmContent }: { utmContent: string }) {
  const searchParams = useSearchParams();
  const isInApp = searchParams.get("src") === "app";

  if (isInApp) return null;

  const href = `${APP_STORE_URL}?utm_source=blog&utm_medium=tldr_cta&utm_content=${encodeURIComponent(utmContent)}`;
  return <CtaBody href={href} utmContent={utmContent} />;
}

export default function BlogTldr({ body, utmContent, readingTime }: BlogTldrProps) {
  if (!body) return null;

  const fallbackHref = `${APP_STORE_URL}?utm_source=blog&utm_medium=tldr_cta&utm_content=${encodeURIComponent(utmContent)}`;

  return (
    <aside
      aria-label="TL;DR summary"
      className="mb-8 grid overflow-hidden rounded-[20px] bg-foreground text-white shadow-ink-lg md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
    >
      <div className="flex flex-col justify-between gap-3 bg-primary-dark p-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-white/85">TL;DR</h2>
        <p className="text-balance text-[clamp(1.125rem,1.6vw,1.375rem)] font-extrabold leading-[1.2] tracking-[-0.02em]">
          {body}
        </p>
        <span className="text-xs text-white/80">
          30-second read{readingTime ? ` · ${readingTime} min in full` : ""}
        </span>
      </div>
      <div className="flex flex-col justify-center gap-4 p-6">
        <Suspense fallback={<CtaBody href={fallbackHref} utmContent={utmContent} />}>
          <TldrCta utmContent={utmContent} />
        </Suspense>
      </div>
    </aside>
  );
}
