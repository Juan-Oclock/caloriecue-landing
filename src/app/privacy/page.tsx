import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - CalorieCue",
  description: "CalorieCue Privacy Policy - Learn how we collect, use, and protect your data.",
};

export default function PrivacyPolicy() {
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
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms
            </Link>
            <Link href="/support" className="text-gray-400 hover:text-white text-sm transition-colors">
              Support
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="pt-24 pb-16 px-4">
        <article className="max-w-4xl mx-auto prose prose-invert prose-gray">
          <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-400 mb-8">Last updated: December 27, 2024</p>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
              <p>
                Welcome to CalorieCue (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy
                and ensuring the security of your personal information. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you use our mobile application
                and related services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> When you create an account, we collect your email address and name (if provided).</li>
                <li><strong>Profile Information:</strong> Height, weight, age, gender, activity level, and fitness goals.</li>
                <li><strong>Food & Nutrition Data:</strong> Meals logged, foods tracked, calorie and macro information.</li>
                <li><strong>Health Data:</strong> Weight logs, progress data, and nutrition goals.</li>
              </ul>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">2.2 Information from Third-Party Authentication</h3>
              <p>When you sign in using Google or Apple:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Google Sign-In:</strong> We receive your email address, name, and profile picture (if available). We use Google&apos;s OAuth 2.0 for authentication only.</li>
                <li><strong>Apple Sign-In:</strong> We receive your email address (or a private relay email) and name (if you choose to share it).</li>
              </ul>
              <p className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <strong className="text-white">Important:</strong> We do NOT sell, share, or transfer your Google user data to any third parties.
                Your authentication data is used solely to identify your account and provide our services.
              </p>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">2.3 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Device information (device type, operating system)</li>
                <li>App usage data and analytics</li>
                <li>Crash reports and performance data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
              <p>We use the collected information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and maintain our services</li>
                <li>Create and manage your account</li>
                <li>Track your nutrition and fitness progress</li>
                <li>Provide personalized recommendations and AI coaching</li>
                <li>Send you relevant notifications (with your consent)</li>
                <li>Improve and optimize our app</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Data Storage and Security</h2>
              <p>
                Your data is stored securely using Supabase, a trusted cloud database provider with
                enterprise-grade security. We implement appropriate technical and organizational measures
                to protect your personal information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication protocols</li>
                <li>Regular security assessments</li>
                <li>Access controls and monitoring</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Data Sharing and Disclosure</h2>
              <p>We do NOT sell your personal information. We may share your information only in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Providers:</strong> With trusted third-party services that help us operate our app (e.g., cloud hosting, analytics).</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety.</li>
                <li><strong>With Your Consent:</strong> When you explicitly agree to share your data.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights and Choices</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data.</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information.</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data.</li>
                <li><strong>Data Portability:</strong> Export your data in a portable format.</li>
                <li><strong>Opt-out:</strong> Disable notifications or withdraw consent at any time.</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at{" "}
                <a href="mailto:privacy@caloriecue.app" className="text-primary hover:underline">
                  privacy@caloriecue.app
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Data Retention</h2>
              <p>
                We retain your personal information for as long as your account is active or as needed to
                provide our services. If you delete your account, we will delete your personal data within
                30 days, except where retention is required by law or for legitimate business purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Children&apos;s Privacy</h2>
              <p>
                CalorieCue is not intended for children under 13 years of age. We do not knowingly collect
                personal information from children under 13. If we discover that we have collected personal
                information from a child under 13, we will delete it immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by
                posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. We
                encourage you to review this Privacy Policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <ul className="list-none pl-0 mt-4 space-y-2">
                <li>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:privacy@caloriecue.app" className="text-primary hover:underline">
                    privacy@caloriecue.app
                  </a>
                </li>
                <li>
                  <strong>Website:</strong>{" "}
                  <a href="https://caloriecue.app" className="text-primary hover:underline">
                    https://caloriecue.app
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </article>
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
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/support" className="text-gray-400 hover:text-white transition-colors">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
