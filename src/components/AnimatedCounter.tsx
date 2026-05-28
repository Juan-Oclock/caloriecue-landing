"use client";

import { useRef, useEffect, useState } from "react";

export default function AnimatedCounter({
  target,
  suffix = "",
  ariaLabel,
}: {
  target: number;
  suffix?: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView || !ref.current) return;
    const el = ref.current;
    const startValue = Math.floor(target * 0.7);
    const duration = 1500;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = Math.floor(startValue + (target - startValue) * eased);
      el.textContent = current.toLocaleString("en-US") + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [isInView, target, suffix]);

  return (
    <span ref={ref} aria-label={ariaLabel}>
      {target.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
