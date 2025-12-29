"use client";

import { motion } from "framer-motion";
import { Navigation, Footer, FeatureCard, PhoneMockup } from "@/components";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 md:pt-40 md:pb-32 px-4 overflow-hidden">
        {/* Background mesh gradient */}
        <div className="absolute inset-0 mesh-bg -z-10" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-blue/5 rounded-full blur-[100px] -z-10" />

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left: Content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-primary-50 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 border border-primary-100"
              >
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Now available on iOS
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-hero-mobile md:text-hero text-foreground mb-6"
              >
                Every Bite in Sight,{" "}
                <span className="text-gradient">Every Day Done Right</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                Simple tracking that keeps your nutrition on point, every day.
                AI-powered meal analysis, smart suggestions, and effortless logging.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                id="download"
              >
                <a
                  href="#"
                  className="inline-flex items-center gap-3 bg-foreground text-white px-6 py-4 rounded-2xl font-semibold hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-elevated"
                >
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs opacity-80">Download on the</div>
                    <div className="text-base font-semibold -mt-0.5">App Store</div>
                  </div>
                </a>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-10 flex items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Free to use</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No ads</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Privacy first</span>
                </div>
              </motion.div>
            </div>

            {/* Right: Phone Mockup */}
            <div className="flex justify-center lg:justify-end">
              <PhoneMockup alt="CalorieCue App" priority />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Bento Grid Style */}
      <section className="py-20 md:py-28 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-primary font-medium text-sm mb-3 uppercase tracking-wider">Features</span>
            <h2 className="text-display-mobile md:text-display text-foreground mb-4">
              Smart Features for Smart Tracking
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to take control of your nutrition with intelligent assistance.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              delay={0}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              title="AI Meal Analysis"
              description="Snap a photo of your meal and let AI instantly analyze the nutritional content with impressive accuracy."
            />

            <FeatureCard
              delay={0.1}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              }
              title="AI Coach (Cue)"
              description="Get personalized nutrition advice and meal suggestions from your AI coach, always available to help."
            />

            <FeatureCard
              delay={0.2}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              title="Progress Tracking"
              description="Track your calories, macros, weight, and see your progress over time with beautiful visualizations."
            />

            <FeatureCard
              delay={0.3}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              }
              title="Barcode Scanner"
              description="Quickly log packaged foods by scanning barcodes. Access our comprehensive food database instantly."
            />

            <FeatureCard
              delay={0.4}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              }
              title="Smart Notifications"
              description="Get gentle reminders to log meals and stay on track with your nutrition goals throughout the day."
            />

            <FeatureCard
              delay={0.5}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
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
            <span className="inline-block text-primary font-medium text-sm mb-3 uppercase tracking-wider">Preview</span>
            <h2 className="text-display-mobile md:text-display text-foreground mb-4">
              See It in Action
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Watch how easy it is to track your nutrition with CalorieCue.
            </p>
          </motion.div>

          {/* Video Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative aspect-video bg-white rounded-3xl border border-border overflow-hidden shadow-soft-lg"
          >
            {/* Placeholder content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 hover:bg-primary/15 transition-colors cursor-pointer group">
                <svg className="w-10 h-10 text-primary ml-1 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-muted-foreground font-medium">Video coming soon</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-28 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-primary font-medium text-sm mb-3 uppercase tracking-wider">How It Works</span>
            <h2 className="text-display-mobile md:text-display text-foreground mb-4">
              Start in Three Steps
            </h2>
            <p className="text-muted-foreground text-lg">
              Begin your journey to better nutrition in minutes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Download & Sign Up",
                description: "Get CalorieCue from the App Store and create your account in seconds.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Log Your Meals",
                description: "Snap a photo, scan a barcode, or describe what you ate. AI does the rest.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Track & Improve",
                description: "Watch your progress and get personalized insights from your AI coach.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative text-center"
              >
                {/* Step number */}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-50 mb-5">
                  <span className="text-primary">{item.icon}</span>
                </div>

                {/* Content */}
                <div className="text-sm font-medium text-primary mb-2">Step {item.step}</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>

                {/* Connector line (hidden on last item and mobile) */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-[2px] bg-border" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
            <span className="inline-block text-primary font-medium text-sm mb-3 uppercase tracking-wider">Get Started</span>
            <h2 className="text-display-mobile md:text-display text-foreground mb-4">
              Ready to Take Control?
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
              Join thousands of users who are already tracking smarter, not harder.
              Download CalorieCue today and start your journey.
            </p>

            <a
              href="#"
              className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl font-semibold hover:bg-primary-dark transition-all hover:scale-[1.02] active:scale-[0.98] shadow-soft-lg"
            >
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Download for Free
            </a>

            {/* App Store badge alternative */}
            <p className="mt-6 text-sm text-muted-foreground">
              Available for iOS 16.0 and later
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
