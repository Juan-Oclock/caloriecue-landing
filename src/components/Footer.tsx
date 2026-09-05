import Link from "next/link";
import Image from "next/image";
import AppStoreButton from "@/components/AppStoreButton";

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
