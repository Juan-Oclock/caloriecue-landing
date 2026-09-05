"use client";

import TrackedAppStoreLink from "@/components/TrackedAppStoreLink";
import type { ReactNode } from "react";
import type { AppStoreClickLocation } from "@/lib/analytics";

const APP_STORE_URL = "https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503";

interface AppStoreButtonProps {
  /**
   * hero    — coral two-line "Download free on the / App Store" button
   * solid   — ink (near-black) one-line "Download on the App Store"
   * compact — small coral pill "Get the App"
   */
  variant?: "hero" | "solid" | "compact";
  /** Only used by the `solid` variant. */
  size?: "sm" | "md";
  centered?: boolean;
  hideTagline?: boolean;
  className?: string;
  /** When set, fires an `app_store_click` analytics event on click. */
  location?: AppStoreClickLocation;
}

export function AppleLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

function StoreAnchor({
  location,
  className,
  children,
}: {
  location?: AppStoreClickLocation;
  className: string;
  children: ReactNode;
}) {
  const sharedProps = {
    href: APP_STORE_URL,
    target: "_blank",
    rel: "noopener noreferrer",
    className,
  } as const;

  return location ? (
    <TrackedAppStoreLink {...sharedProps} location={location}>
      {children}
    </TrackedAppStoreLink>
  ) : (
    <a {...sharedProps}>{children}</a>
  );
}

export default function AppStoreButton({
  variant = "hero",
  size = "md",
  centered = false,
  hideTagline = false,
  className = "",
  location,
}: AppStoreButtonProps) {
  if (variant === "compact") {
    return (
      <StoreAnchor
        location={location}
        className={`inline-flex items-center gap-2 btn-primary text-sm py-2.5 px-5 hover:scale-[1.02] active:scale-[0.98] transition-transform ${className}`}
      >
        <AppleLogo className="w-4 h-4" />
        <span>Get the App</span>
      </StoreAnchor>
    );
  }

  if (variant === "solid") {
    const sizing =
      size === "sm"
        ? "h-11 px-4 rounded-xl text-sm gap-2.5"
        : "h-[54px] px-[22px] rounded-[14px] text-base gap-2.5";
    return (
      <StoreAnchor
        location={location}
        className={`inline-flex items-center justify-center font-bold bg-foreground text-white transition-colors hover:bg-black active:scale-[0.99] ${sizing} ${className}`}
      >
        <AppleLogo className={size === "sm" ? "w-[18px] h-[18px]" : "w-5 h-5"} />
        <span>Download on the App Store</span>
      </StoreAnchor>
    );
  }

  // hero — coral, two-line label. Fill uses the accessible coral so the
  // white label clears WCAG AA; the coral drop shadow keeps the glow.
  return (
    <div className={`flex flex-col ${centered ? "items-center" : "items-stretch sm:items-start"} gap-3 ${className}`}>
      <StoreAnchor
        location={location}
        className="group inline-flex items-center justify-center gap-3 h-14 px-6 rounded-[14px] bg-primary-dark text-white shadow-coral transition-all hover:bg-primary-700 hover:shadow-glow-lg active:scale-[0.99]"
      >
        <AppleLogo className="w-6 h-6" />
        <span className="flex flex-col leading-[1.05] text-left">
          <span className="text-[11px] font-medium opacity-85">Download free on the</span>
          <span className="text-base font-bold">App Store</span>
        </span>
      </StoreAnchor>

      {!hideTagline && (
        <p className="text-sm text-subtle">
          Free to download. Start tracking today.
        </p>
      )}
    </div>
  );
}
