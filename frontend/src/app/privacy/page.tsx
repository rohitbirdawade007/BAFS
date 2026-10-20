"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-amber-400/40 shrink-0 bg-slate-950">
              <Image src="/bafs-logo.jpg" alt="BAFS Logo" fill className="object-cover" />
            </div>
            <span className="font-bold text-sm text-slate-900">Birdawade Associates</span>
          </div>
        </div>
      </header>

      <main className="container py-12 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
          <p className="text-xs text-slate-500">Last updated: October 2026</p>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">1. Information Collection</h2>
            <p>
              When you submit a loan enquiry or application on our website, we collect your name, contact information, loan requirement, estimated income, and city. This information is collected solely to evaluate your loan eligibility with partner banks.
            </p>

            <h2 className="text-base font-bold text-slate-900">2. Usage and Sharing</h2>
            <p>
              Your contact details and financial information will only be shared with authorized partner banks and NBFCs for credit assessment. We never sell, rent, or lease your personal data to unauthorized third-party marketing companies.
            </p>

            <h2 className="text-base font-bold text-slate-900">3. Data Security</h2>
            <p>
              We implement industry-standard 256-bit encryption protocols to protect your submitted documents and sensitive financial profile against unauthorized access, loss, or disclosure.
            </p>

            <h2 className="text-base font-bold text-slate-900">4. Contacting Us</h2>
            <p>
              If you have questions regarding this Privacy Policy or wish to revoke your consent, please email us at{" "}
              <a href="mailto:birdawadeassociate@gmail.com" className="font-semibold text-blue-700 hover:underline">
                birdawadeassociate@gmail.com
              </a>{" "}
              or write to our registered office: Birdawade Associate and Financial Services, Anant Chamber, Basement Gala No. 6, Mahavir Path, Baramati, Pune, Maharashtra 413102.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Birdawade Associates & Financial Services. All rights reserved.</p>
      </footer>
    </div>
  );
}
