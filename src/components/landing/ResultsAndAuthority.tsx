import FadeInCSS from "@/components/FadeInCSS";

export interface Review {
  author: string;
  text: string;
  source: string;
}

export function ResultsAndAuthority({ reviews }: { reviews: Review[] }) {
  return (
    <section className="py-24 md:py-32 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <FadeInCSS className="text-center mb-16">
          <span className="inline-block text-primary-dark font-medium text-sm mb-3 uppercase tracking-wider">
            Reviews
          </span>
          <h2 className="text-display-mobile md:text-display text-foreground mb-4">
            Real people, real results
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See what people are saying on the App Store.
          </p>
        </FadeInCSS>

        <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
          {reviews.map((review, index) => (
            <FadeInCSS
              key={`${review.author}-${index}`}
              y={30}
              delay={index * 0.1}
              viewportMargin="-50px"
              className="bg-background rounded-2xl border border-border p-6 md:p-7 flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-[2px] mb-5">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-3.5 h-3.5 text-amber-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Text */}
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {review.text}
              </p>

              {/* Author — bottom left */}
              <div className="flex items-center gap-3 mt-6">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {review.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    {review.author}
                  </p>
                  <p className="text-xs text-muted-foreground">{review.source}</p>
                </div>
              </div>
            </FadeInCSS>
          ))}
        </div>
      </div>
    </section>
  );
}
