"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type BlogTldrProps = {
  body?: string;
  utmContent: string;
};

const APP_STORE_URL = "https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503";

function TldrCta({ utmContent }: { utmContent: string }) {
  const searchParams = useSearchParams();
  const isInApp = searchParams.get("src") === "app";

  if (isInApp) return null;

  const href = `${APP_STORE_URL}?utm_source=blog&utm_medium=tldr_cta&utm_content=${encodeURIComponent(utmContent)}`;
  return (
    <>
      <p className="mt-3 text-sm italic text-foreground/60">
        Track any meal in 3 seconds, even the messy ones.
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 btn-primary !text-white !no-underline w-full sm:w-auto justify-center inline-flex items-center min-h-[44px] px-6"
      >
        Download CalorieCue — Free
      </a>
    </>
  );
}

export default function BlogTldr({ body, utmContent }: BlogTldrProps) {
  if (!body) return null;

  const fallbackHref = `${APP_STORE_URL}?utm_source=blog&utm_medium=tldr_cta&utm_content=${encodeURIComponent(utmContent)}`;

  return (
    <aside
      aria-label="TL;DR summary"
      className="rounded-xl border border-border/60 bg-primary-50/40 p-5 sm:p-6 mb-8 shadow-sm"
    >
      <h2 className="text-sm font-bold uppercase tracking-wider text-primary mb-2">
        TL;DR
      </h2>
      <p className="text-base text-foreground/85 leading-relaxed">{body}</p>
      <Suspense
        fallback={
          <>
            <p className="mt-3 text-sm italic text-foreground/60">
              Track any meal in 3 seconds, even the messy ones.
            </p>
            <a
              href={fallbackHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 btn-primary !text-white !no-underline w-full sm:w-auto justify-center inline-flex items-center min-h-[44px] px-6"
            >
              Download CalorieCue — Free
            </a>
          </>
        }
      >
        <TldrCta utmContent={utmContent} />
      </Suspense>
    </aside>
  );
}
