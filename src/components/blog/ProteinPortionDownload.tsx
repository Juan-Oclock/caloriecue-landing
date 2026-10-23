"use client";

import { trackEvent } from "@/lib/analytics";
import { PORTION_PDF, PORTION_SLUG } from "@/lib/protein-portions/data";

export default function ProteinPortionDownload() {
  return <aside className="my-8 rounded-2xl border border-primary/20 bg-primary-50 p-6">
    <h3 className="text-xl font-bold text-foreground">Keep the 30g protein portion chart</h3>
    <p className="mt-2 text-base leading-relaxed text-muted-foreground">One printable page with all eight portions, four meal combinations and source references. No email needed.</p>
    <a href={`/downloads/${PORTION_PDF}`} download={PORTION_PDF}
      onClick={() => trackEvent("protein_portion_chart_download", { content_slug: PORTION_SLUG, location: "blog_portion_chart", file_name: PORTION_PDF })}
      className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-primary-dark px-5 py-3 text-sm font-semibold !text-white !no-underline hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-dark">
      Download the free portion chart (PDF)
    </a>
  </aside>;
}
