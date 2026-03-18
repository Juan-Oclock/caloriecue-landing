"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface VideoPreviewProps {
  mp4Src: string;
  webmSrc?: string;
  poster?: string;
}

export default function VideoPreview({
  mp4Src,
  webmSrc,
  poster,
}: VideoPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    // Lazy load: start loading video when near viewport
    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.load();
          loadObserver.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    loadObserver.observe(container);

    // Play on scroll: play/pause based on visibility
    if (!prefersReducedMotion) {
      const playObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
            setIsPlaying(true);
          } else {
            video.pause();
            setIsPlaying(false);
          }
        },
        { threshold: 0.4 }
      );
      playObserver.observe(container);

      return () => {
        loadObserver.disconnect();
        playObserver.disconnect();
      };
    }

    return () => {
      loadObserver.disconnect();
    };
  }, [prefersReducedMotion]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      ref={containerRef}
      className="relative aspect-[9/16] md:aspect-[3/4] md:max-w-xl md:mx-auto xl:max-w-none xl:aspect-video bg-white rounded-3xl border border-border overflow-hidden shadow-soft-lg"
    >
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted/30 animate-pulse" />
      )}

      <video
        ref={videoRef}
        className="w-full h-full object-cover md:object-contain"
        muted
        loop
        playsInline
        preload="none"
        poster={poster}
        title="CalorieCue app demo - AI calorie tracking in action"
        onLoadedData={() => setIsLoaded(true)}
      >
        {webmSrc && <source src={webmSrc} type="video/webm" />}
        <source src={mp4Src} type="video/mp4" />
        <track kind="captions" src="/caloriecue-demo-captions.vtt" srcLang="en" label="English" default />
        Your browser does not support the video tag.
      </video>

      {/* Play/Pause button */}
      <button
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause video" : "Play video"}
        className="absolute bottom-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
      >
        {isPlaying ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>
    </motion.div>
  );
}
