"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type VerificationState = "loading" | "success" | "error";
type AuthType = "signup" | "recovery" | "magiclink" | "email_change";

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<VerificationState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [authType, setAuthType] = useState<AuthType>("signup");
  const [tokenHashForApp, setTokenHashForApp] = useState<string>("");

  useEffect(() => {
    const verifyToken = async () => {
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type") as AuthType;

      if (!tokenHash || !type) {
        setState("error");
        setErrorMessage("Invalid verification link. Please request a new one.");
        return;
      }

      setAuthType(type);
      setTokenHashForApp(tokenHash);

      // For password recovery, DON'T verify server-side
      // Pass the token to the app and let it handle verification
      if (type === "recovery") {
        setState("success");
        return;
      }

      // For other types (signup, email_change, etc.), verify server-side
      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type === "signup" ? "email" : type,
        });

        if (error) {
          setState("error");
          setErrorMessage(error.message || "Verification failed. The link may have expired.");
        } else {
          setState("success");
        }
      } catch {
        setState("error");
        setErrorMessage("Something went wrong. Please try again.");
      }
    };

    verifyToken();
  }, [searchParams]);

  const getSuccessMessage = () => {
    switch (authType) {
      case "signup":
        return {
          title: "Email Verified!",
          subtitle: "Your account is ready. Open the app to get started.",
        };
      case "recovery":
        return {
          title: "Password Reset Ready",
          subtitle: "Open the app to set your new password.",
        };
      case "magiclink":
        return {
          title: "Sign In Successful",
          subtitle: "Open the app to continue.",
        };
      case "email_change":
        return {
          title: "Email Updated!",
          subtitle: "Your email has been changed successfully.",
        };
      default:
        return {
          title: "Verification Complete",
          subtitle: "Open the app to continue.",
        };
    }
  };

  const handleOpenApp = () => {
    // Try to open the app using custom URL scheme
    // For recovery, pass the token_hash so the app can verify it
    if (authType === "recovery" && tokenHashForApp) {
      window.location.href = `caloriecue://auth-callback?token_hash=${tokenHashForApp}&type=${authType}`;
    } else {
      window.location.href = `caloriecue://auth-callback?verified=true&type=${authType}`;
    }
  };

  const successMessage = getSuccessMessage();

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
          <AnimatePresence mode="wait">
            {/* Loading State */}
            {state === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <motion.div
                    className="absolute inset-0 border-4 border-primary-100 rounded-full"
                  />
                  <motion.div
                    className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Verifying...
                </h3>
                <p className="text-muted-foreground">
                  Please wait while we verify your email.
                </p>
              </motion.div>
            )}

            {/* Success State */}
            {state === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-4"
              >
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
                  {successMessage.title}
                </h3>
                <p className="text-muted-foreground mb-8">
                  {successMessage.subtitle}
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
              </motion.div>
            )}

            {/* Error State */}
            {state === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-4"
              >
                {/* Animated X */}
                <div className="w-20 h-20 mx-auto mb-6 relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    className="absolute inset-0 bg-red-100 rounded-full"
                  />
                  <motion.svg
                    className="absolute inset-0 w-20 h-20 text-red-500 p-5"
                    viewBox="0 0 24 24"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.path
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      d="M6 6l12 12"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    />
                    <motion.path
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      d="M18 6l-12 12"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    />
                  </motion.svg>
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Verification Failed
                </h3>
                <p className="text-muted-foreground mb-8">
                  {errorMessage}
                </p>

                <a
                  href="mailto:support@caloriecue.app"
                  className="w-full btn-secondary inline-flex justify-center items-center text-lg py-4"
                >
                  Contact Support
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>
              </motion.div>
            )}
          </AnimatePresence>
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

// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 relative">
          <div className="absolute inset-0 border-4 border-primary-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
        </div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
