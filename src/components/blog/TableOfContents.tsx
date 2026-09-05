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
      <details className="mb-8 rounded-[18px] border border-border bg-surface p-5 lg:hidden">
        <summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.08em] text-subtle">
          On this page
        </summary>
        <ul className="mt-3 flex flex-col gap-0.5">
          {headings.map(({ id, text, level }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={`block rounded-lg px-2.5 py-1.5 text-sm leading-snug text-muted-foreground transition-colors hover:bg-background hover:text-foreground ${
                  level === 3 ? "pl-6" : ""
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
    <nav
      className="flex flex-col gap-3 rounded-[18px] border border-border bg-surface p-5"
      aria-label="Table of contents"
    >
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-subtle">
        On this page
      </p>
      <ul className="-mx-2.5 flex flex-col gap-0.5">
        {headings.map(({ id, text, level }) => {
          const active = activeId === id;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={active ? "location" : undefined}
                className={`block rounded-lg px-2.5 py-[7px] text-sm leading-[1.35] transition-colors ${
                  level === 3 ? "pl-6" : ""
                } ${
                  active
                    ? "bg-primary-100 font-bold text-foreground"
                    : "font-medium text-muted-foreground hover:bg-background hover:text-foreground"
                }`}
              >
                {text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
