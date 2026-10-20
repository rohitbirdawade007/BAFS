"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield } from "lucide-react";

export default function TermsPage() {
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Terms and Conditions</h1>
          <p className="text-xs text-slate-500">Last updated: October 2026</p>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">1. Nature of Business</h2>
            <p>
              Birdawade Associates & Financial Services operates as a loan consultancy and Direct Selling Agent (DSA). We facilitate loan application submissions to authorized banks and Non-Banking Financial Companies (NBFCs). We are not a bank, lender, or credit-granting institution.
            </p>

            <h2 className="text-base font-bold text-slate-900">2. Loan Approval & Terms</h2>
            <p>
              The sanctioning of any credit facility, loan amount, interest rate, tenure, processing fee, and disbursement schedule is solely at the discretion of the respective lending institution. Birdawade Associates does not guarantee loan approval.
            </p>

            <h2 className="text-base font-bold text-slate-900">3. Consultancy Fees</h2>
            <p>
              Birdawade Associates does not collect any upfront service charges, advance commission, or processing fees from the borrower for loan consultancy. Any statutory processing fees or stamp duties are payable directly to the respective lending bank.
            </p>

            <h2 className="text-base font-bold text-slate-900">4. Information Accuracy</h2>
            <p>
              Borrowers agree to provide true, accurate, and complete information and supporting KYC documents. Submission of fraudulent documents is strictly prohibited under applicable Indian laws.
            </p>

            <h2 className="text-base font-bold text-slate-900">5. Office Contact & Inquiries</h2>
            <p>
              For legal, compliance, or loan consultancy inquiries, please contact:
              <br />
              <strong className="text-slate-900">Birdawade Associate and Financial Services</strong>
              <br />
              Principal / Owner: <strong>Dilip Birdawade</strong>
              <br />
              Address: Anant Chamber, Basement Gala No. 6, Mahavir Path, Baramati, Pune, Maharashtra 413102.
              <br />
              Helpline: <a href="tel:9623298281" className="text-blue-700 font-semibold hover:underline">9623298281</a> | Email: <a href="mailto:birdawadeassociate@gmail.com" className="text-blue-700 font-semibold hover:underline">birdawadeassociate@gmail.com</a>
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
