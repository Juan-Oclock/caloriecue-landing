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
  const hasCustomWidth = className.includes("w-[");

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className={`relative ${className}`}
    >
      {/* Phone Frame */}
      <div className={`relative mx-auto ${hasCustomWidth ? "w-full" : "w-[280px] md:w-[320px]"}`}>
        {/* Outer frame - sleek titanium look */}
        <div className="relative bg-gradient-to-b from-gray-200 via-gray-300 to-gray-400 rounded-[3rem] p-[3px] shadow-elevated">
          {/* Inner frame */}
          <div className="bg-gray-900 rounded-[2.8rem] p-[10px] relative overflow-hidden">
            {/* Dynamic Island */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-20" />

            {/* Screen */}
            <div className="relative bg-white rounded-[2.2rem] overflow-hidden aspect-[9/19.5]">
              {src ? (
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover"
                  priority={priority}
                />
              ) : (
                /* Placeholder - Light theme app preview */
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white flex flex-col">
                  {/* Status bar */}
                  <div className="h-12 flex items-center justify-center pt-8">
                    <div className="w-16 h-1 bg-gray-200 rounded-full" />
                  </div>

                  {/* App content preview */}
                  <div className="flex-1 p-4 pt-8 flex flex-col items-center">
                    {/* Logo */}
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center mb-4 shadow-soft">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 6v2m0 8v2M9 12H7m10 0h-2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-xs font-medium">CalorieCue</p>

                    {/* Fake UI elements */}
                    <div className="w-full mt-6 space-y-3">
                      <div className="h-10 bg-gray-100 rounded-xl" />
                      <div className="h-24 bg-primary-50 rounded-xl border border-primary-100 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">1,847</p>
                          <p className="text-xs text-muted-foreground">calories today</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 h-16 bg-gray-100 rounded-xl" />
                        <div className="flex-1 h-16 bg-gray-100 rounded-xl" />
                        <div className="flex-1 h-16 bg-gray-100 rounded-xl" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subtle glow effect */}
        <div className="absolute -inset-8 bg-primary/10 blur-3xl rounded-full -z-10 opacity-60" />
      </div>
    </motion.div>
  );
}
