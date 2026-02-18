import { Navigation, Footer } from "@/components";

export const metadata = {
  title: "Privacy Policy - CalorieCue",
  description: "CalorieCue Privacy Policy - Learn how we collect, use, and protect your data.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy | CalorieCue",
    description: "Learn how CalorieCue collects, uses, and protects your data.",
    url: "https://caloriecue.app/privacy",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | CalorieCue",
    description: "Learn how CalorieCue collects, uses, and protects your data.",
  },
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-28 pb-16 px-4">
        <article className="max-w-3xl mx-auto prose-custom">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 19, 2026</p>

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

            <h3>2.3 Voice Data</h3>
            <ul>
              <li>When using voice food logging, audio is temporarily processed to convert speech to text.</li>
              <li>Audio is not stored permanently; only the transcribed text is saved to your food diary.</li>
              <li>Voice processing occurs in real-time and recordings are discarded immediately after transcription.</li>
            </ul>

            <h3>2.4 Photo Data</h3>
            <ul>
              <li>Meal photos uploaded for AI analysis to estimate nutritional content.</li>
              <li>Photos may be processed through Google Gemini AI for food recognition.</li>
              <li>Photos are used to improve food recognition accuracy and provide personalized insights.</li>
            </ul>

            <h3>2.5 Offline Data</h3>
            <ul>
              <li>Barcode lookup data is cached locally on your device for offline access.</li>
              <li>Cached data is stored only on your device and is not transmitted to our servers.</li>
              <li>You can clear cached data at any time through the app settings.</li>
            </ul>

            <h3>2.6 Automatically Collected Information</h3>
            <ul>
              <li>Device information (device type, operating system)</li>
              <li>App usage data and analytics</li>
              <li>Crash reports and performance data</li>
            </ul>
          </section>

          <section>
            <h2>3. Apple Health Integration</h2>
            <p>
              CalorieCue integrates with Apple Health (HealthKit) to sync your nutrition and weight data.
              With your permission, we may read and write the following data types:
            </p>
            <ul>
              <li><strong>Dietary Energy:</strong> Calories consumed</li>
              <li><strong>Macronutrients:</strong> Protein, carbohydrates, fat</li>
              <li><strong>Micronutrients:</strong> Fiber, sugar, sodium</li>
              <li><strong>Body Mass:</strong> Weight</li>
            </ul>
            <p>
              This data is used to track your nutrition progress and provide personalized insights.
              HealthKit data is only accessed with your explicit permission and is stored locally on
              your device or securely synced to your CalorieCue account.
            </p>
            <div className="my-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
              <strong className="text-primary">Important:</strong> We do NOT sell or share your HealthKit
              data with third parties for advertising or marketing purposes.
            </div>
          </section>

          <section>
            <h2>4. Third-Party Services</h2>

            <h3>4.1 Infrastructure Services</h3>
            <p>We use the following services to operate our app:</p>
            <ul>
              <li>
                <strong>Supabase:</strong> Cloud database and authentication provider with enterprise-grade
                security for storing your account and nutrition data.
              </li>
              <li>
                <strong>Google Gemini AI:</strong> For analyzing meal photos and providing AI-powered food
                recognition and nutritional estimates.
              </li>
            </ul>

            <h3>4.2 Nutrition Data Sources</h3>
            <p>We use the following services to provide accurate nutrition information:</p>
            <ul>
              <li>
                <strong>USDA FoodData Central:</strong> U.S. Department of Agriculture food composition
                database (<a href="https://fdc.nal.usda.gov" target="_blank" rel="noopener noreferrer">fdc.nal.usda.gov</a>)
              </li>
              <li>
                <strong>CalorieNinjas:</strong> Restaurant and branded food nutrition data
                (<a href="https://calorieninjas.com" target="_blank" rel="noopener noreferrer">calorieninjas.com</a>)
              </li>
              <li>
                <strong>Open Food Facts:</strong> Open-source database of food products worldwide
                (<a href="https://openfoodfacts.org" target="_blank" rel="noopener noreferrer">openfoodfacts.org</a>)
              </li>
            </ul>
            <p>
              When you search for foods or scan barcodes, queries may be sent to these services to retrieve
              nutritional information. These queries include only the food name or barcode being searched—no
              personal information is shared with these services.
            </p>
          </section>

          <section>
            <h2>5. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul>
              <li>Provide and maintain our services</li>
              <li>Create and manage your account</li>
              <li>Track your nutrition and fitness progress</li>
              <li>Provide personalized recommendations and AI coaching</li>
              <li>Process voice recordings for food logging (converted to text only)</li>
              <li>Analyze meal photos for nutritional estimates using AI</li>
              <li>Cache barcode data locally for faster offline lookups</li>
              <li>Send you relevant notifications (with your consent)</li>
              <li>Improve and optimize our app</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2>6. Data Storage and Security</h2>
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
            <h2>7. Data Sharing and Disclosure</h2>
            <p>We do NOT sell your personal information. We may share your information only in the following circumstances:</p>
            <ul>
              <li><strong>Service Providers:</strong> With trusted third-party services that help us operate our app (e.g., cloud hosting, analytics).</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety.</li>
              <li><strong>With Your Consent:</strong> When you explicitly agree to share your data.</li>
            </ul>
          </section>

          <section>
            <h2>8. Your Rights and Choices</h2>
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
            <h2>9. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to
              provide our services. If you delete your account, we will delete your personal data within
              30 days, except where retention is required by law or for legitimate business purposes.
            </p>
          </section>

          <section>
            <h2>10. Children&apos;s Privacy</h2>
            <p>
              CalorieCue is not intended for children under 13 years of age. We do not knowingly collect
              personal information from children under 13. If we discover that we have collected personal
              information from a child under 13, we will delete it immediately.
            </p>
          </section>

          <section>
            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by
              posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. We
              encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          <section>
            <h2>12. Contact Us</h2>
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
