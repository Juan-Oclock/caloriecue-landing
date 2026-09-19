"use client";

import { useSearchParams } from "next/navigation";
import TrackedAppStoreLink from "@/components/TrackedAppStoreLink";
import { blogCampaignUrl } from "@/lib/blog/app-store-campaigns";

export default function CheatSheetNextStep({ contentSlug }: { contentSlug: string }) {
  const search = useSearchParams();
  if (search.get("src") === "app") return null;
  return (
    <div className="mt-5 border-t border-border pt-5">
      <h4 className="text-lg font-semibold text-foreground">Put your cheat sheet into practice</h4>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Keep the PDF as a reference, then try logging your next meal in CalorieCue. Start with 3 free photo scans per day; review the estimate before saving. Premium is optional.</p>
      <TrackedAppStoreLink href={blogCampaignUrl(contentSlug, "cheat_sheet_success")} location="blog_cheat_sheet_success" contentSlug={contentSlug} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary-dark px-5 py-3 text-center text-sm font-semibold !text-white !no-underline hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-dark">Try CalorieCue free on iPhone</TrackedAppStoreLink>
    </div>
  );
}
