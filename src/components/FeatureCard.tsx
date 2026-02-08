"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
  iconBg?: string;
  iconColor?: string;
  className?: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
  iconBg,
  iconColor,
  className = "",
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`group relative bg-white rounded-2xl border border-border p-6 transition-all duration-300 hover:shadow-soft-lg hover:border-primary/20 ${className}`}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative h-full">
        {/* Icon */}
        <div
          className={`w-12 h-12 ${iconBg || "bg-primary-50"} rounded-xl flex items-center justify-center mb-4 transition-colors duration-300`}
        >
          <div className={iconColor || "text-primary"}>{icon}</div>
        </div>

        {/* Text */}
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
