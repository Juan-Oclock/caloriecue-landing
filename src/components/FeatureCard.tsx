import { ReactNode } from "react";
import FadeInCSS from "@/components/FadeInCSS";

interface FeatureCardProps {
  /** Short glyph or icon rendered in the coral tile (e.g. "AI", "Aa", an SVG). */
  glyph: ReactNode;
  title: string;
  description: string;
  delay?: number;
  className?: string;
}

export default function FeatureCard({
  glyph,
  title,
  description,
  delay = 0,
  className = "",
}: FeatureCardProps) {
  return (
    <FadeInCSS
      delay={delay}
      y={24}
      viewportMargin="-50px"
      className={`group flex flex-col gap-3 rounded-[20px] border border-border bg-surface p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover ${className}`}
    >
      <span
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-sm font-extrabold text-primary-dark font-rounded"
        aria-hidden="true"
      >
        {glyph}
      </span>
      <h3 className="text-[19px] font-bold leading-[1.25] tracking-[-0.01em] text-foreground">
        {title}
      </h3>
      <p className="text-[15px] leading-relaxed text-muted-foreground text-pretty">
        {description}
      </p>
    </FadeInCSS>
  );
}
