import "./globals.css";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import FacebookPixel from "@/components/FacebookPixel";
import JsonLd, { localBusinessSchema, websiteSchema, breadcrumbSchema } from "@/components/JsonLd";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-inter", // Re-using variable name to limit CSS changes
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

/* ─── Global Metadata (Next.js App Router) ─────────────────── */
export const metadata = {
  metadataBase: new URL("https://languageacademy.com.bd"),

  title: {
    default: "Best PTE Coaching Centre Dhaka | PTE Practice Online & IELTS",
    template: "%s | Language Academy",
  },
  description:
    "Language Academy is the best PTE coaching centre in Dhaka. We offer comprehensive PTE courses, unlimited PTE practice online, expert IELTS preparation, and study abroad services.",
  keywords: [
    "best PTE coaching",
    "PTE coaching centre Dhaka",
    "PTE practice online",
    "online PTE course",
    "PTE course",
    "IELTS",
    "study abroad",
    "PTE centre",
    "IELTS coaching Dhaka",
    "PTE mock test",
    "study abroad Bangladesh",
    "PTE classes near me",
  ],

  authors: [{ name: "Language Academy Bangladesh", url: "https://languageacademy.com.bd" }],
  creator: "Language Academy Bangladesh",
  publisher: "Language Academy Bangladesh",

  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },

  icons: {
    icon: [{ url: "/logo.webp", type: "image/webp" }],
    shortcut: ["/logo.webp"],
    apple: [{ url: "/logo.webp", type: "image/webp" }],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Language Academy",
  },

  alternates: {
    canonical: "https://languageacademy.com.bd",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://languageacademy.com.bd",
    siteName: "Language Academy",
    title: "Best PTE Coaching Centre Dhaka | PTE Practice Online & IELTS",
    description:
      "Language Academy is the best PTE coaching centre in Dhaka. We offer comprehensive PTE courses, unlimited PTE practice online, expert IELTS preparation, and study abroad services.",
    images: [
      {
        url: "/hero_banner.webp",
        width: 1200,
        height: 630,
        alt: "Language Academy - Best PTE Coaching Centre Dhaka",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Best PTE Coaching Centre Dhaka | PTE Practice Online & IELTS",
    description:
      "Language Academy is the best PTE coaching centre in Dhaka. We offer comprehensive PTE courses, unlimited PTE practice online, expert IELTS preparation, and study abroad services.",
    images: ["/hero_banner.webp"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  category: "education",
  classification: "Language School",

  other: {
    "geo.region": "BD-13",
    "geo.placename": "Dhaka, Bangladesh",
    "geo.position": "23.7461;90.3742",
    "ICBM": "23.7461, 90.3742",
    "rating": "General",
    "revisit-after": "7 days",
    "DC.title": "Best PTE Coaching Centre in Dhaka — Language Academy Bangladesh",
    "DC.creator": "Language Academy Bangladesh",
    "DC.subject": "PTE Coaching, PTE Practice Online, IELTS Preparation, Study Abroad, Dhaka Bangladesh",
  },
};

export const viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${outfit.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.facebook.com" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* ── Structured Data for AI + Search Engines ─── */}
        <JsonLd data={localBusinessSchema()} />
        <JsonLd data={websiteSchema()} />
        <JsonLd data={breadcrumbSchema([
          { name: "Home", url: "https://languageacademy.com.bd" },
        ])} />
      </head>
      <body className={`${jakarta.className} bg-background text-foreground`}>
        <div className="page-shell flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 pt-[124px] md:pt-[138px]">{children}</main>
          <Footer />
        </div>
        <WhatsAppButton />
        <FacebookPixel />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
