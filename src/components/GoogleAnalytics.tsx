"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

const GA_MEASUREMENT_ID = "G-4E4N33E19T";

type Gtag = (
  command: "event",
  eventName: "page_view",
  fields: {
    page_location: string;
    page_path: string;
    page_referrer: string;
  },
) => void;

function sanitizeReferrer(referrer: string): string {
  if (!referrer) return "";

  try {
    const url = new URL(referrer);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return `${url.origin}${url.pathname}`;
  } catch {
    return "";
  }
}

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const [configReady, setConfigReady] = useState(false);
  const handleConfigReady = useCallback(() => setConfigReady(true), []);

  useEffect(() => {
    if (!configReady || !pathname) return;

    const gtag = (window as typeof window & { gtag?: Gtag }).gtag;
    if (typeof gtag !== "function") return;

    gtag("event", "page_view", {
      page_location: `${window.location.origin}${pathname}`,
      page_path: pathname,
      page_referrer: sanitizeReferrer(document.referrer),
    });
  }, [configReady, pathname]);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        onReady={handleConfigReady}
      >
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
