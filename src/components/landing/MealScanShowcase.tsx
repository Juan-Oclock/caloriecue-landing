"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface Bubble {
  label: string;
  value: string;
  unit: string;
  emoji: string;
  /** Tailwind position utilities placing the bubble around the plate. */
  position: string;
  /** Bigger treatment for the headline Calories bubble. */
  primary?: boolean;
  /** Stagger order for the pop-in (ms), applied after the scan finishes. */
  delay: number;
}

// Values match the reference scan overlay.
const BUBBLES: Bubble[] = [
  {
    label: "Calories",
    value: "482",
    unit: "kcal",
    emoji: "🔥",
    position: "top-1 left-1/2 -translate-x-1/2",
    primary: true,
    delay: 0,
  },
  {
    label: "Protein",
    value: "24",
    unit: "g",
    emoji: "💪",
    position: "top-[38%] right-1",
    delay: 140,
  },
  {
    label: "Carbs",
    value: "35",
    unit: "g",
    emoji: "🌾",
    position: "bottom-2 left-1/2 -translate-x-1/2",
    delay: 280,
  },
  {
    label: "Fat",
    value: "28",
    unit: "g",
    emoji: "🥑",
    position: "top-[38%] left-1",
    delay: 420,
  },
];

/** Scan-line sweep duration, then how long the bubbles hold before re-scanning. */
const SCAN_MS = 2000;
const HOLD_MS = 3800;

type Phase = "scan" | "show";

/**
 * Core Feature visual: the real meal photo with a scan line sweeping over it,
 * then calorie + macro bubbles popping in — mirroring what the app shows
 * after a scan. It loops:
 *   1. ~2s: a prominent scan line sweeps across the plate (bubbles hidden).
 *   2. The line fades out and the bubbles pop in, staggered, and hold ~3.8s.
 *   3. Bubbles fade out and it scans again.
 *
 * The loop only runs while the card is on screen, and prefers-reduced-motion
 * skips the motion entirely (bubbles shown statically).
 */
export function MealScanShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("scan");
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);

  // Detect reduced motion once; if set, show the bubbles statically.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      setPhase("show");
    }
  }, []);

  // Pause the loop when the card scrolls out of view.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "-10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Drive the scan → show → scan loop.
  useEffect(() => {
    if (reduced || !inView) return;
    const isScan = phase === "scan";
    const timer = setTimeout(
      () => setPhase(isScan ? "show" : "scan"),
      isScan ? SCAN_MS : HOLD_MS,
    );
    return () => clearTimeout(timer);
  }, [phase, inView, reduced]);

  const showing = phase === "show";

  return (
    <div ref={ref} className="relative w-full max-w-[290px] aspect-square">
      {/* Meal photo */}
      <Image
        src="/sample-meal.webp"
        alt="A plate of grilled chicken, corn, spinach salad, avocado and red onion being analyzed by CalorieCue"
        fill
        sizes="290px"
        className="rounded-2xl object-cover"
      />

      {/* Viewfinder corners */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-2 left-2 h-7 w-7 rounded-tl-lg border-t-2 border-l-2 border-primary" />
        <div className="absolute top-2 right-2 h-7 w-7 rounded-tr-lg border-t-2 border-r-2 border-primary" />
        <div className="absolute bottom-2 left-2 h-7 w-7 rounded-bl-lg border-b-2 border-l-2 border-primary" />
        <div className="absolute bottom-2 right-2 h-7 w-7 rounded-br-lg border-b-2 border-r-2 border-primary" />
      </div>

      {/* Prominent sweeping scan line — visible only during the scan phase */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
          !reduced && !showing ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="scan-line absolute left-1 right-1 h-1 rounded-full bg-gradient-to-r from-primary/0 via-white to-primary/0 shadow-[0_0_20px_6px_rgba(224,90,58,0.9),0_0_3px_1px_rgba(0,0,0,0.35)]" />
      </div>

      {/* Calorie + macro bubbles, popping in after each scan */}
      {BUBBLES.map((b) => (
        <div
          key={b.label}
          style={{ transitionDelay: showing && !reduced ? `${b.delay}ms` : "0ms" }}
          className={`absolute ${b.position} flex flex-col items-center justify-center rounded-full bg-white text-center shadow-lg shadow-black/10 ring-1 ring-black/[0.04] ${
            b.primary ? "h-[4.5rem] w-[4.5rem]" : "h-16 w-16"
          } ${reduced ? "" : "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"} ${
            showing ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <span className="text-sm leading-none" aria-hidden="true">
            {b.emoji}
          </span>
          <span className="mt-0.5 font-bold leading-none text-foreground">
            <span className={b.primary ? "text-lg" : "text-base"}>{b.value}</span>
            <span className="ml-0.5 text-[10px] font-semibold text-muted-foreground">
              {b.unit}
            </span>
          </span>
          <span className="text-[10px] font-medium leading-none text-muted-foreground">
            {b.label}
          </span>
        </div>
      ))}
    </div>
  );
}
