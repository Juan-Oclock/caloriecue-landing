"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface Bubble {
  label: string;
  value: string;
  unit?: string;
  /** Text colour class for the value. */
  color: string;
  /** Tailwind position utilities placing the bubble in a corner. */
  position: string;
  /** Stagger order for the pop-in (ms), applied after the scan finishes. */
  delay: number;
}

// Values match the reference scan overlay.
const BUBBLES: Bubble[] = [
  { label: "Calories", value: "482", unit: "kcal", color: "text-foreground", position: "left-[34px] top-[34px]", delay: 0 },
  { label: "Protein", value: "24g", color: "text-protein", position: "right-[34px] top-[34px]", delay: 140 },
  { label: "Carbs", value: "35g", color: "text-carbs", position: "left-[34px] bottom-[34px]", delay: 280 },
  { label: "Fat", value: "28g", color: "text-fat", position: "right-[34px] bottom-[34px]", delay: 420 },
];

/** Scan-line sweep duration, then how long the bubbles hold before re-scanning. */
const SCAN_MS = 2200;
const HOLD_MS = 3800;

type Phase = "scan" | "show";

/**
 * Core Feature visual: a real meal photo with coral viewfinder corners, a
 * glowing scan line sweeping over it, then calorie + macro bubbles popping
 * into the four corners — mirroring what the app shows after a scan.
 *
 * Loops while on screen (IntersectionObserver pauses it off-screen), and
 * prefers-reduced-motion skips the motion entirely (results shown statically).
 *
 * Fills whatever box it is placed in — give the parent a height.
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
      { threshold: 0.2 },
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
    <div
      ref={ref}
      className="relative h-full min-h-[340px] w-full overflow-hidden bg-[#F1EBE3]"
    >
      {/* Meal photo */}
      <Image
        src="/food-scan-meal.webp"
        alt="A plate of grilled chicken, rice, corn, spinach salad, cucumber and avocado being analyzed by CalorieCue"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />
      {/* Soft vignette so the bubbles read against the photo */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(241,235,227,0)_45%,rgba(241,235,227,0.55)_100%)]"
        aria-hidden="true"
      />

      {/* Viewfinder corners */}
      <div className="pointer-events-none absolute inset-[22px]" aria-hidden="true">
        <span className="absolute left-0 top-0 h-[26px] w-[26px] rounded-tl-md border-l-[3px] border-t-[3px] border-primary" />
        <span className="absolute right-0 top-0 h-[26px] w-[26px] rounded-tr-md border-r-[3px] border-t-[3px] border-primary" />
        <span className="absolute bottom-0 left-0 h-[26px] w-[26px] rounded-bl-md border-b-[3px] border-l-[3px] border-primary" />
        <span className="absolute bottom-0 right-0 h-[26px] w-[26px] rounded-br-md border-b-[3px] border-r-[3px] border-primary" />
      </div>

      {/* Glowing scan line — one sweep per scan phase */}
      {!reduced && !showing && (
        <div
          key={`sweep-${inView}`}
          className="cc-scan-sweep pointer-events-none absolute left-[30px] right-[30px] h-[3px] rounded-sm bg-[linear-gradient(90deg,rgba(239,105,57,0),#fff_30%,#EF6939_50%,#fff_70%,rgba(239,105,57,0))] shadow-[0_0_18px_4px_rgba(239,105,57,0.55),0_0_40px_8px_rgba(239,105,57,0.25)]"
          aria-hidden="true"
        />
      )}

      {/* Calorie + macro bubbles, popping in after each scan */}
      {showing && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {BUBBLES.map((b) => (
            <div
              key={b.label}
              style={{ animationDelay: reduced ? "0ms" : `${b.delay}ms` }}
              className={`${reduced ? "" : "cc-pop"} absolute ${b.position} flex items-baseline gap-1.5 rounded-xl border border-[#EEE8E1] bg-surface px-3 py-2 shadow-[0_8px_24px_rgba(35,29,26,0.16)]`}
            >
              <span className={`text-[17px] font-extrabold leading-none font-rounded ${b.color}`}>
                {b.value}
              </span>
              {b.unit && (
                <span className="text-[11px] font-semibold text-subtle">{b.unit}</span>
              )}
              <span className="ml-0.5 text-[11px] font-semibold text-subtle">{b.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Screen-reader summary of the demo result */}
      <span className="sr-only">
        Example scan result: 482 kcal, 24 g protein, 35 g carbs, 28 g fat.
      </span>
    </div>
  );
}
