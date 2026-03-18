import { ReactNode } from "react";
import FadeInCSS from "@/components/FadeInCSS";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
  iconBg?: string;
  iconColor?: string;
  className?: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
  iconBg,
  iconColor,
  className = "",
}: FeatureCardProps) {
  return (
    <FadeInCSS
      delay={delay}
      y={30}
      viewportMargin="-50px"
      className={`group relative bg-white rounded-2xl border border-border p-6 transition-all duration-300 hover:shadow-soft-lg hover:border-primary/20 hover:-translate-y-1 ${className}`}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative h-full">
        <div
          className={`w-12 h-12 ${iconBg || "bg-primary-50"} rounded-xl flex items-center justify-center mb-4 transition-colors duration-300`}
        >
          <div className={iconColor || "text-primary"}>{icon}</div>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </FadeInCSS>
  );
}
