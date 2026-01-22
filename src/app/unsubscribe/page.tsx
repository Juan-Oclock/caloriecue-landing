"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Navigation, Footer } from "@/components";

type UnsubscribeState = "loading" | "success" | "error" | "invalid";

const EDGE_FUNCTION_URL = "https://bxhgpvkkeyguovvyqsft.supabase.co/functions/v1/unsubscribe";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");
  const [state, setState] = useState<UnsubscribeState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function processUnsubscribe() {
      // Client-side validation: token should be base64 of email without padding
      if (!email || !token) {
        setState("invalid");
        return;
      }

      const expectedToken = btoa(email).replace(/=/g, "");
      if (token !== expectedToken) {
        setState("invalid");
        return;
      }

      // Call the edge function to process unsubscribe
      try {
        const response = await fetch(
          `${EDGE_FUNCTION_URL}?email=${encodeURIComponent(email)}&token=${token}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          setState("success");
        } else {
          const data = await response.json().catch(() => ({}));
          setState("error");
          setErrorMessage(data.error || "Something went wrong. Please try again.");
        }
      } catch {
        setState("error");
        setErrorMessage("Network error. Please check your connection and try again.");
      }
    }

    processUnsubscribe();
  }, [email, token]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-28 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card p-12 text-center"
          >
            {state === "loading" && (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-6 border-4 border-primary border-t-transparent rounded-full"
                />
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                  Processing...
                </h1>
                <p className="text-muted-foreground">
                  Please wait while we process your request.
                </p>
              </>
            )}

            {state === "success" && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5, bounce: 0.5 }}
                  className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
                >
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                  You&apos;ve been unsubscribed
                </h1>
                <p className="text-muted-foreground mb-6">
                  You will no longer receive emails from CalorieCue.
                </p>
                <a
                  href="https://caloriecue.app"
                  className="btn-primary inline-flex"
                >
                  Return to CalorieCue
                </a>
              </>
            )}

            {state === "error" && (
              <>
                <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                  Something went wrong
                </h1>
                <p className="text-muted-foreground mb-6">
                  {errorMessage || "We couldn't process your unsubscribe request. Please try again."}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary inline-flex"
                >
                  Try Again
                </button>
              </>
            )}

            {state === "invalid" && (
              <>
                <div className="w-20 h-20 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                  Invalid unsubscribe link
                </h1>
                <p className="text-muted-foreground mb-6">
                  This unsubscribe link is invalid or has expired. Please contact support@caloriecue.app for assistance.
                </p>
                <a
                  href="mailto:support@caloriecue.app"
                  className="btn-primary inline-flex"
                >
                  Contact Support
                </a>
              </>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-28 pb-16 px-4">
          <div className="max-w-lg mx-auto">
            <div className="card p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
