"use client";

import Script from "next/script";

export default function GoogleAnalytics({ nonce }: { nonce?: string }) {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-4E4N33E19T"
        strategy="lazyOnload"
        nonce={nonce}
      />
      <Script id="google-analytics" strategy="lazyOnload" nonce={nonce}>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-4E4N33E19T');
        `}
      </Script>
    </>
  );
}
