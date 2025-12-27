import Link from "next/link";

export const metadata = {
  title: "Support - CalorieCue",
  description: "Get help with CalorieCue - Contact us for support, feedback, or questions.",
};

export default function Support() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <span className="text-white font-semibold text-lg">CalorieCue</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">Support</h1>
          <p className="text-gray-400 mb-12 text-lg">
            Need help? We&apos;re here to assist you with any questions or issues.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Card */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Email Support</h2>
              <p className="text-gray-400 mb-4">
                Send us an email and we&apos;ll get back to you within 24-48 hours.
              </p>
              <a
                href="mailto:support@caloriecue.app"
                className="inline-flex items-center text-primary hover:text-primary-dark transition-colors"
              >
                support@caloriecue.app
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>

            {/* FAQ Card */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">FAQs</h2>
              <p className="text-gray-400 mb-4">
                Find answers to commonly asked questions below.
              </p>
            </div>
          </div>

          {/* FAQs Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-white mb-6">Frequently Asked Questions</h2>

            <div className="space-y-4">
              <details className="bg-gray-800/50 rounded-xl border border-gray-700/50 group">
                <summary className="p-4 cursor-pointer text-white font-medium flex items-center justify-between">
                  How do I track my meals?
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-4 pb-4 text-gray-400">
                  You can track meals by tapping the &quot;+&quot; button, then either search for foods in our
                  database, scan a barcode, or take a photo for AI analysis. You can also use natural
                  language to describe your meal.
                </p>
              </details>

              <details className="bg-gray-800/50 rounded-xl border border-gray-700/50 group">
                <summary className="p-4 cursor-pointer text-white font-medium flex items-center justify-between">
                  How accurate is the AI meal analysis?
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-4 pb-4 text-gray-400">
                  Our AI provides estimates based on visual analysis. While it&apos;s generally accurate for
                  common foods, we recommend verifying portion sizes and adjusting if needed. The AI
                  improves over time with more data.
                </p>
              </details>

              <details className="bg-gray-800/50 rounded-xl border border-gray-700/50 group">
                <summary className="p-4 cursor-pointer text-white font-medium flex items-center justify-between">
                  How do I delete my account?
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-4 pb-4 text-gray-400">
                  Go to Profile → Settings → Delete Account. This will permanently remove your account
                  and all associated data. You can also email us at privacy@caloriecue.app to request
                  account deletion.
                </p>
              </details>

              <details className="bg-gray-800/50 rounded-xl border border-gray-700/50 group">
                <summary className="p-4 cursor-pointer text-white font-medium flex items-center justify-between">
                  Is my data secure?
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-4 pb-4 text-gray-400">
                  Yes! We use industry-standard encryption and secure cloud infrastructure to protect
                  your data. We never sell your personal information. See our Privacy Policy for
                  more details.
                </p>
              </details>

              <details className="bg-gray-800/50 rounded-xl border border-gray-700/50 group">
                <summary className="p-4 cursor-pointer text-white font-medium flex items-center justify-between">
                  How do I change my goals?
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-4 pb-4 text-gray-400">
                  Go to Profile → Goals to update your calorie target, macro goals, and weight objectives.
                  Your daily recommendations will automatically adjust based on your new settings.
                </p>
              </details>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="mt-12 bg-gradient-to-r from-primary/20 to-primary-dark/20 rounded-2xl p-8 border border-primary/30">
            <h2 className="text-2xl font-semibold text-white mb-2">Have Feedback?</h2>
            <p className="text-gray-300 mb-4">
              We&apos;re always looking to improve CalorieCue. Share your ideas, suggestions, or report bugs.
            </p>
            <a
              href="mailto:feedback@caloriecue.app"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Send Feedback
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} CalorieCue. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
