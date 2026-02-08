"use client";

import { motion } from "framer-motion";

export default function ScanLineAnimation() {
  return (
    <motion.div
      className="absolute left-3 right-3 h-[1.5px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      animate={{ top: ["15%", "85%", "15%"] }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}
