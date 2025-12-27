import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 px-4 border-t border-border/50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 6v2m0 8v2M9 12H7m10 0h-2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-foreground font-semibold">CalorieCue</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Every Bite in Sight, Every Day Done Right
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/support"
              className="text-muted-foreground hover:text-foreground transition-colors"
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
