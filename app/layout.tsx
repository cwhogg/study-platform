import type { Metadata, Viewport } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Primary font - geometric sans for headlines and body
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

// Mono font - for data, numbers, code
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "N of One | Study Yourself. Measure What Matters.",
  description: "Design a clinical protocol. Collect your data. See what works for you. Your N of 1 study joins thousands of others to reveal what works for others.",
  keywords: ["n of 1", "self experiment", "personal science", "quantified self", "health data", "protocol", "clinical study"],
  authors: [{ name: "N of One" }],
  openGraph: {
    title: "N of One Platform. Study yourself.",
    description: "Design a clinical protocol. Collect your data. See what works for you.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`
          ${outfit.variable}
          ${jetbrainsMono.variable}
          antialiased
          min-h-screen
          min-h-dvh
          flex
          flex-col
        `}
      >
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
