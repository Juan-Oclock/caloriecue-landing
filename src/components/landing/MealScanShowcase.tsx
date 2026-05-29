"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ScanLineAnimation from "@/components/ScanLineAnimation";

interface Bubble {
  label: string;
  value: string;
  unit: string;
  emoji: string;
  /** Tailwind position utilities placing the bubble around the plate. */
  position: string;
  /** Bigger treatment for the headline Calories bubble. */
  primary?: boolean;
  /** Stagger order for the pop-in (ms). */
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
    delay: 120,
  },
  {
    label: "Protein",
    value: "24",
    unit: "g",
    emoji: "💪",
    position: "top-[38%] right-1",
    delay: 260,
  },
  {
    label: "Carbs",
    value: "35",
    unit: "g",
    emoji: "🌾",
    position: "bottom-2 left-1/2 -translate-x-1/2",
    delay: 400,
  },
  {
    label: "Fat",
    value: "28",
    unit: "g",
    emoji: "🥑",
    position: "top-[38%] left-1",
    delay: 540,
  },
];

/**
 * Core Feature visual: the real meal photo with the scan line sweeping over
 * it, then calorie + macro bubbles popping in — mirroring what the app shows
 * after a scan. Bubbles reveal once when the card scrolls into view (and
 * appear instantly, no motion, when prefers-reduced-motion is set).
 */
export function MealScanShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      setActive(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { rootMargin: "-10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

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

      {/* Sweeping scan line (the original animation) */}
      <ScanLineAnimation />

      {/* Calorie + macro bubbles, popping in on reveal */}
      {BUBBLES.map((b) => (
        <div
          key={b.label}
          style={{ transitionDelay: reduced ? "0ms" : `${b.delay}ms` }}
          className={`absolute ${b.position} flex flex-col items-center justify-center rounded-full bg-white text-center shadow-lg shadow-black/10 ring-1 ring-black/[0.04] ${
            b.primary ? "h-[4.5rem] w-[4.5rem]" : "h-16 w-16"
          } ${reduced ? "" : "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"} ${
            active ? "scale-100 opacity-100" : "scale-50 opacity-0"
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
