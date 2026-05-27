"use client";

interface BlogSearchAndFilterProps {
  tags: string[];
  visibleTags?: string[];
  activeTag: string;
  onTagChange: (tag: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultCount?: number;
}

export default function BlogSearchAndFilter({
  tags,
  visibleTags,
  activeTag,
  onTagChange,
  searchQuery,
  onSearchChange,
  resultCount,
}: BlogSearchAndFilterProps) {
  const displayTags = visibleTags ?? tags;

  return (
    <div className="rounded-lg border border-border/80 bg-white/90 p-4 shadow-card backdrop-blur md:p-5">
      {/* Search input */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <svg
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search calories, protein, meal prep..."
            className="w-full rounded-lg border border-border bg-muted/40 py-4 pl-12 pr-12 text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {typeof resultCount === "number" && (
          <div className="shrink-0 rounded-lg bg-primary-50 px-4 py-3 text-sm font-semibold text-primary">
            {resultCount} {resultCount === 1 ? "guide" : "guides"}
          </div>
        )}
      </div>

      {/* Topic filter pills */}
      {displayTags.length > 0 && (
        <div className="relative mt-4 border-t border-border/70 pt-4">
          <div className="pointer-events-none absolute bottom-0 right-0 top-4 z-10 w-8 bg-gradient-to-l from-white to-transparent md:hidden" />
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:justify-center md:overflow-visible md:px-0 md:pb-0 scrollbar-hide">
            <button
              type="button"
              onClick={() => onTagChange("")}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                activeTag === ""
                  ? "bg-foreground text-white shadow-sm"
                  : "border border-border bg-white text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              All
            </button>
            {displayTags.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => onTagChange(tag)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  activeTag === tag
                    ? "bg-primary text-white shadow-sm"
                    : "border border-border bg-white text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTag && !displayTags.includes(activeTag) && (
        <button
          type="button"
          onClick={() => onTagChange("")}
          className="mt-4 text-sm font-semibold text-primary hover:text-primary-dark"
        >
          Clear hidden topic filter
        </button>
      )}
    </div>
  );
}
