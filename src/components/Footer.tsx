import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-16 px-4 border-t border-border bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/CalorieCue - App Icons/80.png"
                alt="CalorieCue"
                width={36}
                height={36}
                className="rounded-xl shadow-soft transition-transform group-hover:scale-105"
              />
              <span className="text-foreground font-semibold text-lg">CalorieCue</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Every Bite in Sight, Every Day Done Right
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/support"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Support
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-muted-foreground text-sm">
            &copy; {currentYear} CalorieCue. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
