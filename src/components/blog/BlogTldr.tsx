"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AppleLogo } from "@/components/AppStoreButton";
import TrackedAppStoreLink from "@/components/TrackedAppStoreLink";

type BlogTldrProps = {
  body?: string;
  utmContent: string;
  /** Full-article reading time, available on the summary reading-time label. */
  readingTime?: number;
};

const APP_STORE_URL = "https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503";

const CTA_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[9px] bg-[#F4DFCF] px-4 py-3 text-[13px] font-semibold text-[#38281F] transition-colors hover:bg-[#FBEBDD] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F4DFCF] motion-reduce:transition-none";

function CtaBody({ href, utmContent }: { href: string; utmContent: string }) {
  return (
    <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-[#55483F] pt-5 sm:flex-row sm:items-center">
      <p className="text-[13px] leading-normal text-[#C6B9B0]">
        Track any meal in 3 seconds,<br />even the messy ones.
      </p>
      <TrackedAppStoreLink
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        location="blog_tldr"
        contentSlug={utmContent}
        className={CTA_CLASS}
      >
        <AppleLogo className="h-4 w-4 shrink-0" />
        Download CalorieCue — Free
      </TrackedAppStoreLink>
    </div>
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
      className="mb-8 overflow-hidden rounded-[20px] bg-[#29231F] p-[22px] text-[#FFF9F3] shadow-[0_12px_28px_#29231f10] sm:p-[30px]"
    >
      <div>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <h2 className="text-[21px] font-bold tracking-[-0.03em] sm:text-[22px]">The short version</h2>
          <span className="text-xs text-[#C6B9B0]" title={readingTime ? `${readingTime}-minute full guide` : undefined}>30-second read</span>
        </div>
        <p className="max-w-prose break-words text-[17px] font-normal leading-[1.65] text-[#F3EAE2] sm:text-lg">
          {body}
        </p>
      </div>
      <Suspense fallback={<CtaBody href={fallbackHref} utmContent={utmContent} />}>
        <TldrCta utmContent={utmContent} />
      </Suspense>
    </aside>
  );
}
