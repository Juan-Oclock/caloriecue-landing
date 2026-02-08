"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import {
  Navigation,
  Footer,
  FeatureCard,
  PricingSection,
  AppStoreButton,
} from "@/components";
import { useRef, useEffect, useState } from "react";

function AnimatedCounter({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 md:pt-40 md:pb-32 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left: Content */}
            <div className="text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-hero-mobile md:text-hero text-foreground mb-6"
              >
                Snap a Photo.
                <br />
                <span className="text-gradient">Know Your Calories.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                Point your camera at any meal — CalorieCue&apos;s AI identifies
                your food and tracks nutrition in 3 seconds.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <AppStoreButton variant="hero" />
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-10 flex flex-wrap items-center gap-3 sm:gap-6 justify-center lg:justify-start text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Free to use</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>No ads</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Privacy first</span>
                </div>
              </motion.div>
            </div>

            {/* Right: Hero Image */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center lg:justify-end"
            >
              <div className="relative">
                {/* Layer 1: Ambient shadow */}
                <div
                  className="absolute inset-0 translate-x-4 translate-y-8 md:translate-x-10 md:translate-y-20 bg-black/10 blur-[30px] md:blur-[50px] rounded-[2.5rem]"
                  style={{ zIndex: 1 }}
                  aria-hidden="true"
                />
                {/* Layer 2: Mid shadow */}
                <div
                  className="absolute inset-0 translate-x-3 translate-y-6 md:translate-x-7 md:translate-y-14 bg-black/15 blur-[20px] md:blur-[35px] rounded-[2.5rem]"
                  style={{ zIndex: 2 }}
                  aria-hidden="true"
                />
                {/* Layer 3: Contact shadow */}
                <div
                  className="absolute inset-0 translate-x-2 translate-y-4 md:translate-x-4 md:translate-y-8 bg-black/20 blur-[12px] md:blur-[20px] rounded-[2.5rem]"
                  style={{ zIndex: 3 }}
                  aria-hidden="true"
                />
                <Image
                  src="/mockup-caloriecue.png"
                  alt="CalorieCue AI scanning a meal"
                  width={340}
                  height={680}
                  priority
                  className="relative z-10 w-[260px] md:w-[340px] h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-14 md:py-16 px-4 bg-background border-y border-border">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-3xl md:text-4xl font-bold text-foreground">
                <AnimatedCounter target={500} suffix="+" />
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Active Users
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-3xl md:text-4xl font-bold text-foreground">
                <AnimatedCounter target={1678} suffix="+" />
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Meals Scanned
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-3xl md:text-4xl font-bold text-foreground">
                <AnimatedCounter target={675946} suffix="+" />
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Calories Logged
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="text-3xl md:text-4xl font-bold text-foreground">
                5.0
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                App Store Rating
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Bento Grid */}
      <section className="relative py-24 md:py-32 px-4 overflow-hidden">
        {/* Background mesh gradient */}
        <div className="absolute inset-0 mesh-bg -z-10" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-blue/5 rounded-full blur-[100px] -z-10" />

        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-primary font-medium text-sm mb-3 uppercase tracking-wider">
              Features
            </span>
            <h2 className="text-display-mobile md:text-display text-foreground mb-4">
              Smart Features for Smart Tracking
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to take control of your nutrition with
              intelligent assistance.
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 lg:[grid-auto-rows:minmax(200px,auto)]">
            {/* Hero Card: AI Meal Scanning - spans 2 cols, 2 rows on lg */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className="md:col-span-2 lg:col-span-2 lg:row-span-2 group relative bg-gradient-to-br from-primary-50 via-white to-orange-50/30 rounded-3xl border border-primary-100/60 p-7 md:p-8 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              {/* Background decorations */}
              <div
                className="absolute -top-20 -right-20 w-60 h-60 bg-primary/[0.06] rounded-full blur-3xl"
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary-light/[0.04] rounded-full blur-2xl"
                aria-hidden="true"
              />

              <div className="relative h-full flex flex-col">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full w-fit mb-5">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Core Feature
                </div>

                {/* Icon */}
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
                  <svg
                    className="w-7 h-7 text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>

                {/* Text */}
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                  AI Meal Scanning
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base max-w-sm">
                  Point, snap, done. AI identifies your food and tracks calories
                  in 3 seconds. Works on any cuisine — from sushi to sinigang.
                </p>

                {/* Camera viewfinder illustration */}
                <div className="flex-1 hidden lg:flex items-end justify-center pt-5">
                  <div className="relative w-44 h-36">
                    {/* Viewfinder corners */}
                    <div className="absolute inset-0">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/30 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/30 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/30 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/30 rounded-br-lg" />
                    </div>

                    {/* Center focus circle */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary/40" />
                      </div>
                    </div>

                    {/* Animated scan line */}
                    <motion.div
                      className="absolute left-3 right-3 h-[1.5px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"
                      animate={{ top: ["15%", "85%", "15%"] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />

                    {/* Result chip */}
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-primary/20 rounded-full px-3.5 py-1 shadow-sm whitespace-nowrap">
                      <span className="text-[11px] font-medium text-primary flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        350 cal detected
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AI Coach - spans 2 cols on lg */}
            <FeatureCard
              delay={0.1}
              className="lg:col-span-2"
              iconBg="bg-violet-50"
              iconColor="text-violet-500"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              }
              title="AI Coach (Cue)"
              description="Get personalized nutrition advice and meal suggestions from your AI coach, always available to help."
            />

            {/* Barcode Scanner - 1x1 */}
            <FeatureCard
              delay={0.2}
              iconBg="bg-teal-50"
              iconColor="text-teal-500"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              }
              title="Barcode Scanner"
              description="Scan barcodes for instant nutrition data from our comprehensive food database."
            />

            {/* Smart Notifications - 1x1 */}
            <FeatureCard
              delay={0.3}
              iconBg="bg-amber-50"
              iconColor="text-amber-500"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                  />
                </svg>
              }
              title="Smart Notifications"
              description="Gentle reminders to log meals and stay on track throughout the day."
            />

            {/* Progress Tracking - spans 2 cols on lg */}
            <FeatureCard
              delay={0.4}
              className="lg:col-span-2"
              iconBg="bg-blue-50"
              iconColor="text-blue-500"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
              title="Progress Tracking"
              description="Track your calories, macros, weight, and see your progress over time with beautiful visualizations."
            />

            {/* Quick Logging - spans 2 cols on lg */}
            <FeatureCard
              delay={0.5}
              className="lg:col-span-2"
              iconBg="bg-emerald-50"
              iconColor="text-emerald-500"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              }
              title="Quick Logging"
              description="Log meals in seconds with natural language input. Just type what you ate and we'll handle the rest."
            />
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="py-20 md:py-28 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-block text-primary font-medium text-sm mb-3 uppercase tracking-wider">
              Preview
            </span>
            <h2 className="text-display-mobile md:text-display text-foreground mb-4">
              See It in Action
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Watch how easy it is to track your nutrition with CalorieCue.
            </p>
          </motion.div>

          {/* Video */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative aspect-[3/4] md:aspect-video bg-white rounded-3xl border border-border overflow-hidden shadow-soft-lg"
          >
            <video
              className="w-full h-full object-cover scale-[1.2] md:scale-100"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src="/see it in action.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 md:py-32 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-primary font-medium text-sm mb-3 uppercase tracking-wider">
              Reviews
            </span>
            <h2 className="text-display-mobile md:text-display text-foreground mb-4">
              Loved by Our Users
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              See what people are saying on the App Store.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
            {[
              {
                title: "Great app!",
                author: "BiggiAgile123",
                text: "I like that it\u2019s connected with Apple Health.",
              },
              {
                title: "I love it!",
                author: "Sol Maraiah",
                text: "Very seamless to use, friendly user and it only takes few seconds to load. No lag, app is way better than those in the market right now. Actual weight and est weight of the AI is pretty accurate.",
              },
              {
                title: "Simple and Convenient Food Tracker",
                author: "App Store User",
                text: "I really like this app because it\u2019s very easy to navigate and user-friendly. Logging food is much easier, especially with the photo feature where the AI scans the food and automatically calculates the calories.",
              },
            ].map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-background rounded-2xl border border-border p-6 md:p-7 flex flex-col"
              >
                {/* Stars */}
                <div className="flex gap-[2px] mb-5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-3.5 h-3.5 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Text */}
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {review.text}
                </p>

                {/* Author — bottom left */}
                <div className="flex items-center gap-3 mt-6">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {review.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-tight">
                      {review.author}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      App Store Review
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 md:py-32 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16 md:mb-20"
          >
            <span className="inline-block text-primary font-medium text-sm mb-3 uppercase tracking-wider">
              How It Works
            </span>
            <h2 className="text-display-mobile md:text-display text-foreground mb-4">
              Start in Three Steps
            </h2>
            <p className="text-muted-foreground text-lg">
              Begin your journey to better nutrition in minutes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10 md:gap-6 lg:gap-10">
            {[
              {
                step: "01",
                title: "Download & Open",
                description:
                  "Get CalorieCue free from the App Store and open the camera.",
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Scan Your Meal",
                description:
                  "Point your camera at any food — AI identifies it and estimates nutrition in 3 seconds.",
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Get Smart Insights",
                description:
                  "See calories, macros, and personalized coaching from your AI nutrition assistant.",
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                ),
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative text-center"
              >
                {/* Icon with step number badge */}
                <div className="relative inline-flex flex-col items-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    {item.icon}
                  </div>
                  {/* Step number badge */}
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-white border-2 border-primary flex items-center justify-center shadow-sm">
                    <span className="text-[10px] font-bold text-primary">
                      {item.step}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {item.description}
                </p>

                {/* Connector line (hidden on last item and mobile) */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-[58%] w-[84%] border-t-2 border-dashed border-primary/20" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <section className="py-24 md:py-32 px-4 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-blue/5 -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -z-10" />

        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-primary font-medium text-sm mb-3 uppercase tracking-wider">
              Get Started
            </span>
            <h2 className="text-display-mobile md:text-display text-foreground mb-4">
              Ready to Take Control?
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
              Download now and start your journey to better nutrition today.
            </p>

            <AppStoreButton variant="hero" centered />
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
