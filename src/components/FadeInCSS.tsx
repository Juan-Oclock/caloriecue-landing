"use client";

import {
  useRef,
  useEffect,
  useState,
  ReactNode,
  ElementType,
  Ref,
  type TransitionEvent as ReactTransitionEvent,
} from "react";

interface FadeInCSSProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  viewportMargin?: string;
  /** Element to render. Defaults to "div"; pass e.g. "li" to keep valid
   *  list semantics when fading list items. */
  as?: ElementType;
}

export default function FadeInCSS({
  children,
  delay = 0,
  y = 20,
  className = "",
  viewportMargin = "0px",
  as: Tag = "div",
}: FadeInCSSProps) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasTransitioned, setHasTransitioned] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: viewportMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [viewportMargin]);

  return (
    <Tag
      ref={ref as Ref<HTMLElement>}
      className={className}
      style={
        hasTransitioned
          ? undefined
          : {
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : `translateY(${y}px)`,
              transition: `opacity 0.5s ease-out ${delay}s, transform 0.5s ease-out ${delay}s`,
            }
      }
      onTransitionEnd={(e: ReactTransitionEvent) => {
        if (e.target === e.currentTarget) setHasTransitioned(true);
      }}
    >
      {children}
    </Tag>
  );
}
