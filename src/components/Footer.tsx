import Link from "next/link";
import Image from "next/image";
import AppStoreButton from "@/components/AppStoreButton";
import { SOCIAL_LINKS } from "@/lib/social-links";

const SOCIAL_ICONS = {
  TikTok: (
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.3 0 .6.05.88.14v-3.5a6.34 6.34 0 0 0-.88-.06A6.33 6.33 0 0 0 4.5 19.6a6.33 6.33 0 0 0 11.32-3.93V8.68a8.25 8.25 0 0 0 4.82 1.55V6.8c-.35 0-.7-.04-1.05-.11Z" />
  ),
  Instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" />
    </>
  ),
  Facebook: (
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.9 3.77-3.9 1.09 0 2.23.19 2.23.19v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
  ),
  YouTube: (
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
  ),
};

const PRODUCT_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/tdee-calculator", label: "TDEE Calculator" },
  { href: "/blog", label: "Guides" },
];

const COMPANY_LINKS = [
  { href: "/support", label: "Support" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer role="contentinfo" className="bg-background border-t border-border">
      <div className="max-w-6xl mx-auto px-5 md:px-8 pt-12 md:pt-16 pb-7 flex flex-col gap-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] gap-8 lg:gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-4 min-w-0 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 text-foreground w-fit">
              <Image
                src="/app-icons/80.png"
                alt=""
                width={30}
                height={30}
                className="rounded-lg"
              />
              <span className="text-[17px] font-bold tracking-[-0.2px]">CalorieCue</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-[300px]">
              AI photo calorie tracker. One photo, three seconds, any cuisine.
              Free on iOS.
            </p>
            <AppStoreButton variant="solid" size="sm" location="footer" className="self-start" />
            <nav aria-label="Follow CalorieCue" className="flex flex-col gap-2 pt-1">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-subtle">
                Follow CalorieCue
              </span>
              <ul className="flex flex-wrap gap-2">
                {SOCIAL_LINKS.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`CalorieCue on ${link.name} (opens in a new tab)`}
                      title={link.name}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary-dark hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-dark focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true" focusable="false">
                        {SOCIAL_ICONS[link.name]}
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <nav aria-label="Product" className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-subtle">
              Product
            </span>
            <ul className="flex flex-col gap-2.5 text-sm">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-foreground hover:text-primary-dark transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company" className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-subtle">
              Company
            </span>
            <ul className="flex flex-col gap-2.5 text-sm">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-foreground hover:text-primary-dark transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-5 border-t border-border text-[13px] text-subtle">
          <span>&copy; {currentYear} CalorieCue. All rights reserved.</span>
          <span>
            Made in Manila · Proudly over-engineered by{" "}
            <a
              href="https://juan-oclock.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary-dark transition-colors"
            >
              Juan Oclock
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
