"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQ_ITEMS = [
  {
    question: "How accurate is the AI calorie estimation?",
    answer:
      "Our AI estimates are typically within 10\u201315% of actual values, and you can always adjust portion sizes for better accuracy. For packaged foods, our barcode scanner pulls exact nutrition data from verified databases.",
  },
  {
    question: "Is CalorieCue really free?",
    answer:
      "Yes! The free tier includes 3 photo scans, 5 barcode scans, and 3 AI Coach messages per day. For unlimited access to all features, CalorieCue Premium is $3.99/month (or $19.99/year) with a 7-day free trial.",
  },
  {
    question: "What types of food can CalorieCue recognize?",
    answer:
      "CalorieCue works with virtually any food \u2014 home-cooked meals, restaurant dishes, mixed plates, single items, and any cuisine from sushi to sinigang. You can also scan barcodes on packaged foods or log meals manually with natural language.",
  },
  {
    question: "How is this different from MyFitnessPal or Lose It?",
    answer:
      "CalorieCue is photo-first \u2014 just snap a picture instead of searching through endless food databases. Our AI Coach (Cue) provides personalized nutrition advice on demand, and the interface is designed for speed: log a meal in 3 seconds, not 30.",
  },
  {
    question: "Is my data private and secure?",
    answer:
      "Absolutely. We never sell your data or show ads. Apple Health data stays on your device. Your meal photos are processed securely and are not used to train AI models. Read our full privacy policy for details.",
  },
  {
    question: "Does CalorieCue work offline?",
    answer:
      "AI photo scanning and the AI Coach require an internet connection. However, manual food logging and viewing your diary history work offline \u2014 data syncs automatically when you\u2019re back online.",
  },
  {
    question: "Is CalorieCue available on Android?",
    answer:
      "CalorieCue is currently iOS-only. We\u2019re working on an Android version \u2014 join our waitlist to get notified the moment it launches!",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 md:py-32 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-primary font-medium text-sm mb-3 uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="text-display-mobile md:text-display text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know about CalorieCue.
          </p>
        </motion.div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-background rounded-3xl border border-border overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left"
                >
                  <span className="text-base font-semibold text-foreground">
                    {item.question}
                  </span>
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    <svg
                      className="w-4 h-4 text-primary"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 text-muted-foreground leading-relaxed">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
