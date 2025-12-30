"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function WelcomePage() {
  const handleOpenApp = () => {
    window.location.href = "caloriecue://welcome";
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Image
            src="/CalorieCue - App Icons/180.png"
            alt="CalorieCue"
            width={72}
            height={72}
            className="mx-auto rounded-2xl shadow-soft"
          />
          <h2 className="mt-4 text-xl font-semibold text-foreground">CalorieCue</h2>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-3xl shadow-soft border border-border p-8"
        >
          <div className="text-center py-4">
            {/* Animated Checkmark */}
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="absolute inset-0 bg-green-100 rounded-full"
              />
              <motion.svg
                className="absolute inset-0 w-20 h-20 text-green-500"
                viewBox="0 0 52 52"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 27l7 7 17-17"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                />
              </motion.svg>
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-2">
              Welcome to CalorieCue!
            </h3>
            <p className="text-muted-foreground mb-8">
              Your account is ready. Open the app to start your health journey.
            </p>

            <button
              onClick={handleOpenApp}
              className="w-full btn-primary text-lg py-4 mb-4"
            >
              Open CalorieCue
              <svg className="w-5 h-5 ml-2 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            <p className="text-sm text-muted-foreground">
              App not opening?{" "}
              <span className="text-foreground">
                Make sure CalorieCue is installed via TestFlight.
              </span>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          <a href="/" className="hover:text-primary transition-colors">
            caloriecue.app
          </a>
          {" · "}
          <a href="/privacy" className="hover:text-primary transition-colors">
            Privacy
          </a>
          {" · "}
          <a href="/support" className="hover:text-primary transition-colors">
            Support
          </a>
        </motion.p>
      </div>
    </div>
  );
}
