import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: {
    default: "Birdawade Associates & Financial Services | Loan Consultancy",
    template: "%s | Birdawade Associates",
  },
  description:
    "Birdawade Associates & Financial Services — trusted loan consultancy & authorized DSA serving all over Maharashtra (Pune, Mumbai, Nashik, Sambhajinagar, Nagpur, Kolhapur & all districts). Expert guidance for personal, home, and business loans.",
  keywords: [
    "loan consultancy Maharashtra",
    "DSA agent Maharashtra",
    "personal loan Maharashtra",
    "home loan Pune Mumbai",
    "business loan Maharashtra",
    "loan eligibility",
    "Birdawade Associates",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "Birdawade Associates & Financial Services",
    locale: "en_IN",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${plusJakarta.variable}`}>
      <head>
        <meta name="theme-color" content="#1e3a8a" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
