import { Navigation, Footer } from "@/components";

export const metadata = {
  title: "Privacy Policy - CalorieCue",
  description: "CalorieCue Privacy Policy - Learn how we collect, use, and protect your data.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-28 pb-16 px-4">
        <article className="max-w-3xl mx-auto prose-custom">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: December 27, 2024</p>

          <section>
            <h2>1. Introduction</h2>
            <p>
              Welcome to CalorieCue (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy
              and ensuring the security of your personal information. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you use our mobile application
              and related services.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>

            <h3>2.1 Information You Provide</h3>
            <ul>
              <li><strong>Account Information:</strong> When you create an account, we collect your email address and name (if provided).</li>
              <li><strong>Profile Information:</strong> Height, weight, age, gender, activity level, and fitness goals.</li>
              <li><strong>Food & Nutrition Data:</strong> Meals logged, foods tracked, calorie and macro information.</li>
              <li><strong>Health Data:</strong> Weight logs, progress data, and nutrition goals.</li>
            </ul>

            <h3>2.2 Information from Third-Party Authentication</h3>
            <p>When you sign in using Google or Apple:</p>
            <ul>
              <li><strong>Google Sign-In:</strong> We receive your email address, name, and profile picture (if available). We use Google&apos;s OAuth 2.0 for authentication only.</li>
              <li><strong>Apple Sign-In:</strong> We receive your email address (or a private relay email) and name (if you choose to share it).</li>
            </ul>
            <div className="my-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
              <strong className="text-primary">Important:</strong> We do NOT sell, share, or transfer your Google user data to any third parties.
              Your authentication data is used solely to identify your account and provide our services.
            </div>

            <h3>2.3 Automatically Collected Information</h3>
            <ul>
              <li>Device information (device type, operating system)</li>
              <li>App usage data and analytics</li>
              <li>Crash reports and performance data</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul>
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
            <h2>4. Data Storage and Security</h2>
            <p>
              Your data is stored securely using Supabase, a trusted cloud database provider with
              enterprise-grade security. We implement appropriate technical and organizational measures
              to protect your personal information, including:
            </p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication protocols</li>
              <li>Regular security assessments</li>
              <li>Access controls and monitoring</li>
            </ul>
          </section>

          <section>
            <h2>5. Data Sharing and Disclosure</h2>
            <p>We do NOT sell your personal information. We may share your information only in the following circumstances:</p>
            <ul>
              <li><strong>Service Providers:</strong> With trusted third-party services that help us operate our app (e.g., cloud hosting, analytics).</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety.</li>
              <li><strong>With Your Consent:</strong> When you explicitly agree to share your data.</li>
            </ul>
          </section>

          <section>
            <h2>6. Your Rights and Choices</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal data.</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information.</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated data.</li>
              <li><strong>Data Portability:</strong> Export your data in a portable format.</li>
              <li><strong>Opt-out:</strong> Disable notifications or withdraw consent at any time.</li>
            </ul>
            <p>
              To exercise these rights, please contact us at{" "}
              <a href="mailto:privacy@caloriecue.app">privacy@caloriecue.app</a>
            </p>
          </section>

          <section>
            <h2>7. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to
              provide our services. If you delete your account, we will delete your personal data within
              30 days, except where retention is required by law or for legitimate business purposes.
            </p>
          </section>

          <section>
            <h2>8. Children&apos;s Privacy</h2>
            <p>
              CalorieCue is not intended for children under 13 years of age. We do not knowingly collect
              personal information from children under 13. If we discover that we have collected personal
              information from a child under 13, we will delete it immediately.
            </p>
          </section>

          <section>
            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by
              posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. We
              encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          <section>
            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <ul>
              <li>
                <strong>Email:</strong>{" "}
                <a href="mailto:privacy@caloriecue.app">privacy@caloriecue.app</a>
              </li>
              <li>
                <strong>Website:</strong>{" "}
                <a href="https://caloriecue.app">https://caloriecue.app</a>
              </li>
            </ul>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
