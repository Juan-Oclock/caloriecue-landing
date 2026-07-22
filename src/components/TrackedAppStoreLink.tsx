"use client";

import type { ComponentPropsWithoutRef, MouseEventHandler } from "react";
import {
  trackAppStoreClick,
  type AppStoreClickLocation,
} from "@/lib/analytics";

type TrackedAppStoreLinkProps = ComponentPropsWithoutRef<"a"> & {
  location: AppStoreClickLocation;
  contentSlug?: string;
};

export default function TrackedAppStoreLink({
  location,
  contentSlug,
  onClick,
  ...anchorProps
}: TrackedAppStoreLinkProps) {
  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    trackAppStoreClick({ location, contentSlug });
    onClick?.(event);
  };

  return <a {...anchorProps} onClick={handleClick} />;
}
