"use client";

import { useState } from "react";
import { motion } from "framer-motion";

// Pricing data
const PRICING = {
  monthly: {
    current: "$2.99",
    original: "$3.99",
    period: "month",
  },
  yearly: {
    current: "$14.99",
    original: "$19.99",
    period: "year",
  },
};

const FREE_FEATURES = [
  { text: "5 barcode scans per day", included: true },
  { text: "3 days diary history", included: true },
  { text: "Basic meal tracking", included: true },
  { text: "AI Coach (Cue)", included: false },
  { text: "Insights & Analytics", included: false },
  { text: "AI Meal Analysis", included: false },
];

const PREMIUM_FEATURES = [
  { text: "Unlimited barcode scans", included: true },
  { text: "Full diary history", included: true },
  { text: "AI Coach (Cue)", included: true },
  { text: "Insights & Analytics", included: true },
  { text: "Personalized Meal Plans", included: true },
  { text: "AI Meal Analysis", included: true },
  { text: "Custom Recipes", included: true },
  { text: "Achievements & Streaks", included: true },
];

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  const currentPricing = isYearly ? PRICING.yearly : PRICING.monthly;

  return (
    <section id="pricing" className="py-20 md:py-28 px-4 bg-background">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-primary font-medium text-sm mb-3 uppercase tracking-wider">
            Pricing
          </span>
          <h2 className="text-display-mobile md:text-display text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Start free and upgrade when you&apos;re ready for more.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-muted/50 p-1 sm:p-1.5 rounded-full border border-border">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-3 sm:px-5 py-2 rounded-full text-sm font-medium transition-all ${
                !isYearly
                  ? "bg-white text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-3 sm:px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 ${
                isYearly
                  ? "bg-white text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
              <span className="bg-green-100 text-green-700 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full">
                -58%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {/* Free Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="relative bg-white rounded-2xl border border-border p-6 md:p-8 transition-all duration-300 hover:shadow-soft-lg"
          >
            {/* Card Content */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">Free</h3>
              <p className="text-muted-foreground text-sm">Get started with the basics</p>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl md:text-5xl font-bold text-foreground">$0</span>
                <span className="text-muted-foreground">/forever</span>
              </div>
            </div>

            {/* CTA Button */}
            <a
              href="#waitlist"
              className="block w-full py-3 px-6 rounded-xl border-2 border-border text-foreground font-semibold text-center hover:bg-muted/50 transition-colors"
            >
              Join Waitlist
            </a>

            {/* Features */}
            <ul className="mt-8 space-y-3">
              {FREE_FEATURES.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  {feature.included ? (
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-muted-foreground/50 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span
                    className={`text-sm ${
                      feature.included ? "text-foreground" : "text-muted-foreground line-through"
                    }`}
                  >
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Premium Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="relative bg-white rounded-2xl border-2 border-primary p-6 md:p-8 transition-all duration-300 hover:shadow-soft-lg"
            style={{
              boxShadow: "0 0 40px -10px rgba(224, 90, 58, 0.2)",
            }}
          >
            {/* Most Popular Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-white px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap">
                Most Popular
              </span>
            </div>

            {/* Card Content */}
            <div className="mb-6 mt-2">
              <h3 className="text-xl font-semibold text-foreground mb-2">Premium</h3>
              <p className="text-muted-foreground text-sm">Unlock all features</p>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-4xl md:text-5xl font-bold text-foreground">
                  {currentPricing.current}
                </span>
                <span className="text-muted-foreground line-through text-lg">
                  {currentPricing.original}
                </span>
                <span className="text-muted-foreground">/{currentPricing.period}</span>
              </div>
              {isYearly && (
                <p className="text-sm text-muted-foreground mt-2">
                  That&apos;s just $1.25/month
                </p>
              )}
            </div>

            {/* CTA Button */}
            <a
              href="#waitlist"
              className="block w-full py-3 px-6 rounded-xl bg-primary text-white font-semibold text-center hover:bg-primary/90 transition-colors shadow-soft"
            >
              Join Waitlist
            </a>

            {/* Trial Text */}
            <p className="text-xs text-muted-foreground text-center mt-3">
              7-day free trial at launch
            </p>

            {/* Features */}
            <ul className="mt-6 space-y-3">
              {PREMIUM_FEATURES.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-foreground">{feature.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
