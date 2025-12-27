"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface PhoneMockupProps {
  src?: string;
  alt?: string;
  className?: string;
  priority?: boolean;
}

export default function PhoneMockup({
  src,
  alt = "App screenshot",
  className = "",
  priority = false,
}: PhoneMockupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className={`relative ${className}`}
    >
      {/* Phone Frame */}
      <div className="relative mx-auto w-[280px] md:w-[320px]">
        {/* Outer frame */}
        <div className="relative bg-gradient-to-b from-zinc-700 to-zinc-900 rounded-[3rem] p-[3px] shadow-2xl">
          {/* Inner frame */}
          <div className="bg-black rounded-[2.8rem] p-[10px] relative overflow-hidden">
            {/* Dynamic Island */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-20" />

            {/* Screen */}
            <div className="relative bg-background rounded-[2.2rem] overflow-hidden aspect-[9/19.5]">
              {src ? (
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover"
                  priority={priority}
                />
              ) : (
                /* Placeholder gradient */
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-card to-muted flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-2xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 6v2m0 8v2M9 12H7m10 0h-2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p className="text-muted-foreground text-sm">App Preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full -z-10 opacity-50" />
      </div>
    </motion.div>
  );
}
