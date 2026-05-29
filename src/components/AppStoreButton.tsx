"use client";

import {
  trackAppStoreClick,
  type AppStoreClickLocation,
} from "@/lib/landing/analytics";

const APP_STORE_URL = "https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503";

interface AppStoreButtonProps {
  variant?: "hero" | "compact";
  centered?: boolean;
  hideTagline?: boolean;
  className?: string;
  /** When set, fires an `app_store_click` analytics event on click. */
  location?: AppStoreClickLocation;
}

function AppleLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

export default function AppStoreButton({ variant = "hero", centered = false, hideTagline = false, className = "", location }: AppStoreButtonProps) {
  const handleClick = () => {
    if (location) trackAppStoreClick({ location });
  };

  if (variant === "compact") {
    return (
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={`inline-flex items-center gap-2 btn-primary text-sm py-2.5 px-5 hover:scale-[1.02] active:scale-[0.98] transition-transform ${className}`}
      >
        <AppleLogo className="w-4 h-4" />
        <span>Get the App</span>
      </a>
    );
  }

  return (
    <div className={`flex flex-col items-center ${centered ? "" : "lg:items-start"} gap-4 ${className}`}>
      <div className="relative">
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-primary/40 rounded-full animate-float-particle"
              style={{
                left: `${15 + i * 15}%`,
                bottom: 0,
                animationDuration: `${2.5 + i * 0.3}s`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
        </div>

        {/* Glow rings */}
        <div className="absolute inset-0 rounded-xl bg-primary/20 animate-glow-pulse" aria-hidden="true" />
        <div className="absolute -inset-1 rounded-2xl bg-primary/10 animate-glow-pulse-outer" aria-hidden="true" />

        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="relative block hover:scale-[1.03] active:scale-[0.98] transition-transform"
        >
          <div className="relative bg-black text-white px-6 py-3.5 rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-shadow group">
            <div className="absolute inset-0 rounded-xl bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
            <AppleLogo className="w-8 h-8 relative z-10" />
            <div className="relative z-10 flex flex-col">
              <span className="text-[10px] uppercase tracking-wide opacity-90">Download on the</span>
              <span className="text-xl font-semibold -mt-0.5">App Store</span>
            </div>
          </div>
        </a>
      </div>

      {!hideTagline && (
        <p className="text-sm text-muted-foreground">
          Free to download. Start tracking today.
        </p>
      )}
    </div>
  );
}
