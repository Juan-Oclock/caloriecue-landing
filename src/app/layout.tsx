import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CalorieCue - Smart Calorie Tracking",
  description: "Every Bite in Sight, Every Day Done Right. Simple tracking that keeps your nutrition on point, every day.",
  keywords: ["calorie tracker", "nutrition", "diet", "health", "fitness", "meal tracking"],
  authors: [{ name: "CalorieCue" }],
  openGraph: {
    title: "CalorieCue - Smart Calorie Tracking",
    description: "Every Bite in Sight, Every Day Done Right.",
    url: "https://caloriecue.app",
    siteName: "CalorieCue",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
