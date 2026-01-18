import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email - CalorieCue",
  description: "Email verification for CalorieCue.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
