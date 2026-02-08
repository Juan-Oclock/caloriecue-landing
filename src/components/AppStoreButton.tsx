"use client";

import { motion, useReducedMotion } from "framer-motion";

const APP_STORE_URL = "https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503";

interface AppStoreButtonProps {
  variant?: "hero" | "compact";
  centered?: boolean;
  hideTagline?: boolean;
  className?: string;
}

// Floating particles component
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-primary/40 rounded-full"
          style={{
            left: `${15 + i * 15}%`,
            bottom: 0,
          }}
          animate={{
            y: [0, -80, -120],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2.5 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// Pulsing glow ring component
function GlowRing() {
  return (
    <>
      <motion.div
        className="absolute inset-0 rounded-xl bg-primary/20"
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -inset-1 rounded-2xl bg-primary/10"
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.2, 0.05, 0.2],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3,
        }}
      />
    </>
  );
}

// Apple logo SVG
function AppleLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

export default function AppStoreButton({ variant = "hero", centered = false, hideTagline = false, className = "" }: AppStoreButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  if (variant === "compact") {
    return (
      <motion.a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 btn-primary text-sm py-2.5 px-5 ${className}`}
        whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
      >
        <AppleLogo className="w-4 h-4" />
        <span>Get the App</span>
      </motion.a>
    );
  }

  // Hero variant with full effects
  return (
    <div className={`flex flex-col items-center ${centered ? "" : "lg:items-start"} gap-4 ${className}`}>
      {/* Main App Store Button */}
      <div className="relative">
        {/* Floating particles */}
        {!prefersReducedMotion && <FloatingParticles />}

        {/* Glow rings */}
        {!prefersReducedMotion && <GlowRing />}

        {/* The actual button */}
        <motion.a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
        >
          {/* App Store Badge - Official Black Style */}
          <div className="relative bg-black text-white px-6 py-3.5 rounded-xl flex items-center gap-3 shadow-lg hover:shadow-xl transition-shadow group">
            {/* Hover glow overlay */}
            <div className="absolute inset-0 rounded-xl bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />

            {/* Apple Logo */}
            <AppleLogo className="w-8 h-8 relative z-10" />

            {/* Text */}
            <div className="relative z-10 flex flex-col">
              <span className="text-[10px] uppercase tracking-wide opacity-90">Download on the</span>
              <span className="text-xl font-semibold -mt-0.5">App Store</span>
            </div>
          </div>
        </motion.a>
      </div>

      {/* Tagline */}
      {!hideTagline && (
        <motion.p
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-sm text-muted-foreground"
        >
          Free to download. Start tracking today.
        </motion.p>
      )}
    </div>
  );
}
