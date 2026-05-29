"use client";

import { useEffect, useRef } from "react";

/**
 * Looping, muted, real meal-scan clip for the Core Feature card.
 *
 * - Lazy: nothing loads until the card nears the viewport (preload="none"
 *   + IntersectionObserver), so it never costs mobile data above the fold.
 * - Accessible: respects prefers-reduced-motion by leaving the poster
 *   frame in place instead of autoplaying.
 */
export function ScanVideo({ className = "" }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return; // leave the poster showing, don't autoplay

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      poster="/meal-scanning-poster.webp"
      muted
      loop
      playsInline
      preload="none"
      aria-label="Real-time AI meal scan in the CalorieCue app: a plate of food is identified with its calories and macros"
    >
      <source src="/meal-scanning.webm" type="video/webm" />
      <source src="/meal-scanning.mp4" type="video/mp4" />
    </video>
  );
}
