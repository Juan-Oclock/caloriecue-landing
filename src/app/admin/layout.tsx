import type { Metadata } from 'next';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: {
    default: 'Admin',
    template: '%s | CalorieCue Admin',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get('x-nonce') ?? '';

  return (
    <>
      <script
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `if(window.trustedTypes&&trustedTypes.createPolicy&&!trustedTypes.defaultPolicy){trustedTypes.createPolicy('default',{createHTML:s=>s,createScriptURL:s=>s,createScript:s=>s})}`,
        }}
      />
      {children}
    </>
  );
}
