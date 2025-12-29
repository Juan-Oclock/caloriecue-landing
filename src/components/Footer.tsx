import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 px-4 border-t border-border/50 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center gap-4">
          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/support"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Support
            </Link>
          </div>

          {/* Copyright & Credit */}
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
            <span>&copy; {currentYear} CalorieCue</span>
            <span className="hidden sm:inline">·</span>
            <span>
              Proudly over-engineered by{" "}
              <a
                href="https://juan-oclock.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Juan Oclock
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
