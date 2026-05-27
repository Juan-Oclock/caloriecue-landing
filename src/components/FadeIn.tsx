"use client";

import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  trigger?: "onMount" | "inView";
  className?: string;
  viewportMargin?: string;
}

export default function FadeIn({
  children,
  delay = 0,
  y = 20,
  duration = 0.5,
  trigger = "inView",
  className,
  viewportMargin,
}: FadeInProps) {
  const [canAnimate, setCanAnimate] = useState(false);

  useEffect(() => {
    setCanAnimate(true);
  }, []);

  if (!canAnimate) {
    return <div className={className}>{children}</div>;
  }

  if (trigger === "onMount") {
    return (
      <motion.div
        initial={{ opacity: 0, y }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration, delay }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: viewportMargin }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
