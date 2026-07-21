"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import {
  configureSafeAnalyticsContext,
  GA_MEASUREMENT_ID,
  type BrowserGtag,
} from "@/lib/analytics-context";

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const [configReady, setConfigReady] = useState(false);
  const previousPageLocation = useRef<string | null>(null);
  const handleConfigReady = useCallback(() => setConfigReady(true), []);

  useEffect(() => {
    if (!configReady || !pathname) return;

    const gtag = (window as typeof window & { gtag?: BrowserGtag }).gtag;
    if (typeof gtag !== "function") return;

    const pageContext = configureSafeAnalyticsContext(
      gtag,
      previousPageLocation.current ?? undefined,
    );
    gtag("event", "page_view", {
      ...pageContext,
      page_path: pathname,
    });
    previousPageLocation.current = pageContext.page_location;
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
          window.gtag = function gtag(){window.dataLayer.push(arguments);};
          function sanitizeAnalyticsUrl(value) {
            if (!value) return '';
            try {
              var url = new URL(value);
              if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
              return url.origin + url.pathname;
            } catch {
              return '';
            }
          }
          var safePageContext = {
            page_location: sanitizeAnalyticsUrl(window.location.href),
            page_referrer: sanitizeAnalyticsUrl(document.referrer)
          };
          window.__calorieCueAnalyticsContext = safePageContext;
          window.gtag('js', new Date());
          window.gtag('set', safePageContext);
          window.gtag('config', '${GA_MEASUREMENT_ID}', {
            page_location: safePageContext.page_location,
            page_referrer: safePageContext.page_referrer,
            send_page_view: false
          });
        `}
      </Script>
    </>
  );
}
