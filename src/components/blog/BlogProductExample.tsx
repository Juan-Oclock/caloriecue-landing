"use client";

import Image from "next/image";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TrackedAppStoreLink from "@/components/TrackedAppStoreLink";
import { blogCampaignUrl } from "@/lib/blog/app-store-campaigns";

type Props = { contentSlug: string; variant?: "protein" | "free" | "macros" };

function Download({ contentSlug, variant }: Props) {
  const search = useSearchParams();
  if (search.get("src") === "app") return null;
  return (
    <TrackedAppStoreLink
      href={blogCampaignUrl(contentSlug, "product_example")}
      location="blog_product_example"
      contentSlug={contentSlug}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary-dark px-5 py-3 text-center text-sm font-semibold !text-white !no-underline hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-dark"
    >
      {variant === "free" ? "Try CalorieCue free on iPhone" : "Track your meal’s calories and protein"}
    </TrackedAppStoreLink>
  );
}

export default function BlogProductExample({ contentSlug, variant = "protein" }: Props) {
  return (
    <aside aria-label="CalorieCue app example" className="my-8 grid items-center gap-6 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-[minmax(0,1fr)_180px] sm:p-7">
      <div>
        <h3 className="mb-3 text-xl font-bold leading-tight text-foreground">
          {variant === "free" ? "What you get free with CalorieCue" : variant === "macros" ? "Save the meal behind the numbers" : "Log the whole meal, then check your protein"}
        </h3>
        {variant === "free" ? (
          <>
            <p className="text-[16px] leading-relaxed text-[#3C342F]">The ongoing free tier includes 3 photo meal scans and 3 AI Coach messages per day. You can try photo logging without starting a paid subscription.</p>
            <p className="mt-3 text-[16px] leading-relaxed text-[#3C342F]">Premium adds unlimited photo and barcode scans, voice logging, and full diary history. A Premium trial is separate from the free tier; check eligibility, renewal terms, and your local price before subscribing.</p>
          </>
        ) : variant === "macros" ? (
          <>
            <p className="text-[16px] leading-relaxed text-[#3C342F]">The calculator checks known macros. At lunch, you may have a mixed plate with no label to enter. CalorieCue can use a meal photo to suggest a calorie and macro estimate.</p>
            <p className="mt-3 text-[16px] leading-relaxed text-[#3C342F]">Review the foods and portions, add any hidden oil or sauce, then save the corrected meal to your daily totals. The app screen shows where those logged calories and macros appear. A photo estimate is a starting point, not a precise measurement.</p>
            <p className="mt-3 text-sm text-muted-foreground">Try 3 free photo scans per day. Premium is optional.</p>
          </>
        ) : (
          <>
            <p className="text-[16px] leading-relaxed text-[#3C342F]">Picked chicken from the chart? Your lunch may also include rice, vegetables, and dressing. Try a photo of the complete plate in CalorieCue, then check the suggested foods and portions before saving.</p>
            <p className="mt-3 text-[16px] leading-relaxed text-[#3C342F]">Add any oil or sauce the photo missed. Your saved meal contributes to the calorie and protein totals shown on the daily dashboard. Use those totals to review the whole meal; foods with less protein can still contribute.</p>
            <p className="mt-3 text-sm text-muted-foreground">Start with 3 free photo scans per day. Premium is optional.</p>
          </>
        )}
        <Suspense fallback={null}><Download contentSlug={contentSlug} variant={variant} /></Suspense>
        <a href="/#pricing" className="mt-3 block text-sm text-primary-dark underline underline-offset-4">Compare free and Premium features</a>
      </div>
      <figure className="mx-auto w-[180px] max-w-full">
        <Image src="/caloriecue-app-home.webp" alt="CalorieCue daily dashboard showing logged calories and protein, carbohydrate, and fat totals." width={752} height={1544} sizes="180px" className="h-auto w-full" />
        <figcaption className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">Actual app screen from a Premium account. Shown totals and targets are one person’s example, not recommendations.</figcaption>
      </figure>
    </aside>
  );
}
