import { Navigation, Footer } from "@/components";

export const metadata = {
  title: "Terms of Service - CalorieCue",
  description: "CalorieCue Terms of Service - Terms and conditions for using our app.",
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-28 pb-16 px-4">
        <article className="max-w-3xl mx-auto prose-custom">
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: December 27, 2024</p>

          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By downloading, installing, or using CalorieCue (&quot;the App&quot;), you agree to be bound by these
              Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use the App.
            </p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>
              CalorieCue is a nutrition and calorie tracking application that helps users monitor their
              food intake, track macronutrients, set fitness goals, and receive AI-powered nutrition
              recommendations. The App is intended for informational and educational purposes only.
            </p>
          </section>

          <section>
            <h2>3. User Accounts</h2>
            <h3>3.1 Account Creation</h3>
            <p>
              To use certain features of the App, you must create an account. You may register using
              your email address or through third-party authentication services (Google, Apple).
            </p>

            <h3>3.2 Account Responsibilities</h3>
            <ul>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You must provide accurate and complete information during registration.</li>
              <li>You are responsible for all activities that occur under your account.</li>
              <li>You must notify us immediately of any unauthorized use of your account.</li>
            </ul>
          </section>

          <section>
            <h2>4. Acceptable Use</h2>
            <p>You agree NOT to:</p>
            <ul>
              <li>Use the App for any unlawful purpose or in violation of any laws.</li>
              <li>Attempt to gain unauthorized access to the App or its systems.</li>
              <li>Interfere with or disrupt the App&apos;s operation.</li>
              <li>Upload malicious code, viruses, or harmful content.</li>
              <li>Impersonate another person or entity.</li>
              <li>Collect or harvest data from other users without consent.</li>
              <li>Use the App to spam or send unsolicited communications.</li>
            </ul>
          </section>

          <section>
            <h2>5. Health Disclaimer</h2>
            <div className="my-4 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
              <strong className="text-yellow-500">Important:</strong> CalorieCue is NOT a substitute for
              professional medical advice, diagnosis, or treatment. The nutritional information,
              recommendations, and AI-generated suggestions provided by the App are for informational
              purposes only.
            </div>
            <ul>
              <li>Always consult a qualified healthcare provider before starting any diet or nutrition program.</li>
              <li>Do not disregard professional medical advice based on information from this App.</li>
              <li>Nutritional data may not be 100% accurate and should be used as estimates.</li>
              <li>AI recommendations are generated automatically and may not be suitable for everyone.</li>
            </ul>
          </section>

          <section>
            <h2>6. Intellectual Property</h2>
            <p>
              All content, features, and functionality of the App, including but not limited to text,
              graphics, logos, icons, images, and software, are the exclusive property of CalorieCue
              and are protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              You are granted a limited, non-exclusive, non-transferable license to use the App for
              personal, non-commercial purposes in accordance with these Terms.
            </p>
          </section>

          <section>
            <h2>7. User Content</h2>
            <p>
              You retain ownership of any content you submit to the App (e.g., food logs, photos).
              By submitting content, you grant us a non-exclusive, worldwide, royalty-free license
              to use, process, and store such content solely to provide and improve our services.
            </p>
          </section>

          <section>
            <h2>8. Third-Party Services</h2>
            <p>
              The App may integrate with third-party services (e.g., Google Sign-In, Apple Sign-In).
              Your use of these services is subject to their respective terms and privacy policies.
              We are not responsible for the practices of third-party services.
            </p>
          </section>

          <section>
            <h2>9. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, CALORIECUE AND ITS AFFILIATES SHALL NOT BE
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
              INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul>
              <li>Loss of profits, data, or goodwill</li>
              <li>Service interruption or computer damage</li>
              <li>Any damages resulting from reliance on nutritional information</li>
              <li>Any health-related consequences from using the App</li>
            </ul>
          </section>

          <section>
            <h2>10. Disclaimer of Warranties</h2>
            <p>
              THE APP IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
              EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED,
              ERROR-FREE, OR COMPLETELY SECURE.
            </p>
          </section>

          <section>
            <h2>11. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account and access to the App at
              any time, with or without cause, with or without notice. Upon termination, your
              right to use the App will immediately cease.
            </p>
          </section>

          <section>
            <h2>12. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. We will notify you of significant changes by
              posting the updated Terms in the App or on our website. Your continued use of the
              App after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2>13. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the
              jurisdiction in which CalorieCue operates, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2>14. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us:
            </p>
            <ul>
              <li>
                <strong>Email:</strong>{" "}
                <a href="mailto:legal@caloriecue.app">legal@caloriecue.app</a>
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
