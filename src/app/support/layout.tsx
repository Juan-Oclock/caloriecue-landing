import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Get help with CalorieCue. Find answers to frequently asked questions, contact our support team, or send feedback.",
  alternates: {
    canonical: "/support",
  },
  openGraph: {
    title: "Support | CalorieCue",
    description:
      "Get help with CalorieCue. Find answers to FAQs or contact our support team.",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I track my meals?",
      acceptedAnswer: {
        "@type": "Answer",
        text: 'You can track meals by tapping the "+" button, then either search for foods in our database, scan a barcode, or take a photo for AI analysis. You can also use natural language to describe your meal.',
      },
    },
    {
      "@type": "Question",
      name: "How accurate is the AI meal analysis?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our AI provides estimates based on visual analysis. While it's generally accurate for common foods, we recommend verifying portion sizes and adjusting if needed. The AI improves over time with more data.",
      },
    },
    {
      "@type": "Question",
      name: "How do I delete my account?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Go to Profile → Settings → Delete Account. This will permanently remove your account and all associated data. You can also email us at privacy@caloriecue.app to request account deletion.",
      },
    },
    {
      "@type": "Question",
      name: "Is my data secure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! We use industry-standard encryption and secure cloud infrastructure to protect your data. We never sell your personal information. See our Privacy Policy for more details.",
      },
    },
    {
      "@type": "Question",
      name: "How do I change my goals?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Go to Profile → Goals to update your calorie target, macro goals, and weight objectives. Your daily recommendations will automatically adjust based on your new settings.",
      },
    },
  ],
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
