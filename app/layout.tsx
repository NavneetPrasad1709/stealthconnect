import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Montserrat } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ChatWidgetLazy } from "@/components/ChatWidgetLazy";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MotionProvider } from "@/components/MotionProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { FloatingConsultButtonLazy } from "@/components/FloatingConsultButtonLazy";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-montserrat",
  display: "swap",
});


export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://stealthconnect.ai"),
  title: {
    default: "StealthConnect AI — LinkedIn Contact Finder",
    template: "%s | StealthConnect AI",
  },
  description:
    "Find verified emails and direct phone numbers behind any LinkedIn profile in 30 minutes. Pay only per result — no subscription, no contracts. Trusted by 4,200+ sales teams.",
  keywords: [
    "linkedin contact finder",
    "email finder",
    "phone number finder",
    "b2b leads",
    "linkedin scraper",
    "sales prospecting",
    "contact enrichment",
    "lead generation",
    "verified contacts",
  ],
  authors: [{ name: "StealthConnect AI" }],
  creator: "StealthConnect AI",
  publisher: "StealthConnect AI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "StealthConnect AI — LinkedIn Contact Finder",
    description:
      "Find verified emails and direct phone numbers behind any LinkedIn profile in 30 minutes. Pay only per result.",
    type: "website",
    locale: "en_US",
    siteName: "StealthConnect AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "StealthConnect AI — LinkedIn Contact Finder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StealthConnect AI — LinkedIn Contact Finder",
    description:
      "Find verified emails and direct phone numbers behind any LinkedIn profile in 30 minutes.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: [{ url: "/icon.svg" }],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`scroll-smooth ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <body className="font-body antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <MotionProvider>
          {children}
          <SpeedInsights />
          <ChatWidgetLazy />
          <FloatingConsultButtonLazy />
          </MotionProvider>
          <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--elevated)",
              color: "var(--fg)",
              border: "1px solid var(--border-s)",
              borderRadius: "12px",
              fontSize: "14px",
              fontFamily: "var(--font-body)",
            },
          }}
        />
        </ThemeProvider>
      </body>
    </html>
  );
}
