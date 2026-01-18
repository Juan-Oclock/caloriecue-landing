import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome - CalorieCue",
  description: "Welcome to CalorieCue. Open the app to get started.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
