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
  description: "Design a protocol. Collect your data. See your results. Your N of 1 study joins thousands of others to reveal what actually works.",
  keywords: ["n of 1", "self experiment", "personal science", "quantified self", "health data", "protocol", "clinical study"],
  authors: [{ name: "N of One" }],
  openGraph: {
    title: "N of One | Study Yourself",
    description: "Design a protocol. Collect your data. See your results.",
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
