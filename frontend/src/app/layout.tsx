import type { Metadata } from "next";
import Link from "next/link";
import { Dancing_Script, Playfair_Display, Source_Sans_3 } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollToTopOnNavigate } from "@/components/ScrollToTopOnNavigate";
import { siteMetadata } from "@/lib/seo";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${dancingScript.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans text-foreground">
        <Link href="/" className="skip-link">
          Skip to main content
        </Link>
        <AppProviders>
          <ScrollToTopOnNavigate />
          {children}
        </AppProviders>
        <ScrollToTop />
      </body>
    </html>
  );
}
