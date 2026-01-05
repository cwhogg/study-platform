import type { Metadata, Viewport } from "next";
import { Instrument_Serif, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { DemoBadge } from "@/components/DemoControls";

// Display font - elegant serif for headlines
const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

// Body font - clean, modern sans-serif
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-satoshi",
  display: "swap",
});

// Mono font - for data, IDs, clinical values
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Study Platform | AI-Powered Clinical Research",
  description: "Launch observational clinical studies in minutes with AI-generated protocols, consent documents, and patient communications.",
  keywords: ["clinical research", "observational study", "PRO", "patient reported outcomes", "AI", "healthcare"],
  authors: [{ name: "Study Platform" }],
  openGraph: {
    title: "Study Platform | AI-Powered Clinical Research",
    description: "Launch observational clinical studies in minutes with AI-generated protocols.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
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
          ${instrumentSerif.variable}
          ${dmSans.variable}
          ${jetbrainsMono.variable}
          antialiased
          min-h-screen
          min-h-dvh
          flex
          flex-col
        `}
      >
        <DemoBadge />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
