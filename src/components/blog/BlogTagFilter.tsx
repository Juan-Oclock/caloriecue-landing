"use client";

import { useSearchParams, useRouter } from "next/navigation";

interface BlogTagFilterProps {
  tags: string[];
}

export default function BlogTagFilter({ tags }: BlogTagFilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTag = searchParams.get("tag") ?? "all";

  function handleTagClick(tag: string) {
    if (tag === "all") {
      router.push("/blog", { scroll: false });
    } else {
      router.push(`/blog?tag=${encodeURIComponent(tag)}`, { scroll: false });
    }
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={() => handleTagClick("all")}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          activeTag === "all"
            ? "bg-primary text-white"
            : "bg-muted text-muted-foreground hover:bg-gray-200"
        }`}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => handleTagClick(tag)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeTag === tag
              ? "bg-primary text-white"
              : "bg-muted text-muted-foreground hover:bg-gray-200"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
