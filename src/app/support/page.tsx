"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, Footer } from "@/components";

const faqs = [
  {
    question: "How do I track my meals?",
    answer: "You can track meals by tapping the \"+\" button, then either search for foods in our database, scan a barcode, or take a photo for AI analysis. You can also use natural language to describe your meal.",
  },
  {
    question: "How accurate is the AI meal analysis?",
    answer: "Our AI provides estimates based on visual analysis. While it's generally accurate for common foods, we recommend verifying portion sizes and adjusting if needed. The AI improves over time with more data.",
  },
  {
    question: "How do I delete my account?",
    answer: "Go to Profile → Settings → Delete Account. This will permanently remove your account and all associated data. You can also email us at privacy@caloriecue.app to request account deletion.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes! We use industry-standard encryption and secure cloud infrastructure to protect your data. We never sell your personal information. See our Privacy Policy for more details.",
  },
  {
    question: "How do I change my goals?",
    answer: "Go to Profile → Goals to update your calorie target, macro goals, and weight objectives. Your daily recommendations will automatically adjust based on your new settings.",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="card-hover cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground pr-4">{question}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-muted-foreground mt-4 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Support() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-foreground mb-4">Support</h1>
            <p className="text-muted-foreground text-lg">
              Need help? We&apos;re here to assist you with any questions or issues.
            </p>
          </motion.div>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="card-hover"
            >
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Email Support</h2>
              <p className="text-muted-foreground mb-4">
                Send us an email and we&apos;ll get back to you within 24-48 hours.
              </p>
              <a
                href="mailto:support@caloriecue.app"
                className="inline-flex items-center text-primary hover:text-primary-dark transition-colors font-medium"
              >
                support@caloriecue.app
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="card-hover"
            >
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">FAQs</h2>
              <p className="text-muted-foreground mb-4">
                Find answers to commonly asked questions below.
              </p>
            </motion.div>
          </div>

          {/* FAQs Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-semibold text-foreground mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </motion.div>

          {/* Feedback Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-primary-50 via-primary-50/50 to-transparent border border-primary-100"
          >
            <h2 className="text-2xl font-semibold text-foreground mb-2">Have Feedback?</h2>
            <p className="text-muted-foreground mb-6">
              We&apos;re always looking to improve CalorieCue. Share your ideas, suggestions, or report bugs.
            </p>
            <a
              href="mailto:feedback@caloriecue.app"
              className="btn-primary inline-flex"
            >
              Send Feedback
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
