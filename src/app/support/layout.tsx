import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Get help with CalorieCue. Find answers to frequently asked questions, contact our support team, or send feedback.",
  alternates: {
    canonical: "https://caloriecue.app/support",
  },
  openGraph: {
    title: "Support | CalorieCue",
    description:
      "Get help with CalorieCue. Find answers to FAQs or contact our support team.",
    url: "https://caloriecue.app/support",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Support | CalorieCue",
    description:
      "Get help with CalorieCue. Find answers to FAQs or contact our support team.",
  },
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
