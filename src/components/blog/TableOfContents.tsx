"use client";

import { useState, useEffect } from "react";
import type { Heading } from "@/lib/blog/types";

interface TableOfContentsProps {
  headings: Heading[];
  variant?: "mobile" | "desktop";
}

export default function TableOfContents({ headings, variant = "desktop" }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-100px 0px -66% 0px" }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  if (variant === "mobile") {
    return (
      <details className="lg:hidden mb-8 bg-muted/50 rounded-xl p-4 border border-border">
        <summary className="text-sm font-semibold text-foreground cursor-pointer">
          Table of Contents
        </summary>
        <ul className="mt-3 space-y-1.5 pl-4 border-l border-border">
          {headings.map(({ id, text, level }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={`block text-sm text-muted-foreground hover:text-primary transition-colors py-0.5 ${
                  level === 3 ? "pl-3" : ""
                }`}
              >
                {text}
              </a>
            </li>
          ))}
        </ul>
      </details>
    );
  }

  return (
    <nav className="sticky top-28" aria-label="Table of contents">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        On this page
      </p>
      <ul className="space-y-1.5 border-l border-border pl-4">
        {headings.map(({ id, text, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`block text-sm transition-colors leading-snug py-0.5 ${
                level === 3 ? "pl-3" : ""
              } ${
                activeId === id
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
