import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "German Utility Bill Checker | UtilityCost-Checker for Expats",
  description: "Check if your German utility bills (Nebenkosten) are fair. Perfect for expats and international residents in Germany. Compare with 2025 data from all German cities. GDPR compliant.",
  keywords: [
    "German utility bills",
    "Nebenkosten checker",
    "expats Germany",
    "utility costs Germany",
    "German rental costs",
    "Betriebskosten analysis",
    "Germany living costs",
    "international residents Germany"
  ],
  openGraph: {
    title: "German Utility Bill Checker for Expats",
    description: "Check if your German utility bills are fair. Perfect for expats living in Germany.",
    type: "website",
    locale: "en_US",
    alternateLocale: "de_DE"
  },
  alternates: {
    languages: {
      'de': '/',
      'en': '/en'
    }
  }
};

export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}