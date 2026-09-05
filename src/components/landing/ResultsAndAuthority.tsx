import FadeInCSS from "@/components/FadeInCSS";

export interface Review {
  author: string;
  text: string;
  source: string;
}

export function ResultsAndAuthority({ reviews }: { reviews: Review[] }) {
  return (
    <section className="px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <FadeInCSS className="flex max-w-[600px] flex-col gap-3.5">
          <span className="eyebrow">Reviews</span>
          <h2 className="text-display text-foreground">Real people. Real results.</h2>
        </FadeInCSS>

        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map((review, index) => (
            <FadeInCSS
              key={`${review.author}-${index}`}
              as="figure"
              y={24}
              delay={index * 0.08}
              viewportMargin="-50px"
              className="flex flex-col gap-[18px] rounded-[20px] border border-border bg-surface p-7"
            >
              <span
                className="text-sm tracking-[2px] text-primary"
                aria-label="5 out of 5 stars"
                role="img"
              >
                ★★★★★
              </span>

              <blockquote className="text-base leading-[1.55] text-foreground text-pretty before:content-['“'] after:content-['”']">
                <p className="inline">{review.text}</p>
              </blockquote>

              <figcaption className="mt-auto flex items-center gap-2.5">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-bold text-white"
                  aria-hidden="true"
                >
                  {review.author.charAt(0).toUpperCase()}
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-foreground">
                    {review.author}
                  </span>
                  <span className="text-xs text-subtle">{review.source}</span>
                </span>
              </figcaption>
            </FadeInCSS>
          ))}
        </div>
      </div>
    </section>
  );
}
