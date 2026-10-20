"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, ChevronDown, HelpCircle, Phone, Search } from "lucide-react";

const FAQ_SECTIONS = [
  {
    category: "General & Consultancy",
    questions: [
      {
        q: "What role does Birdawade Associates play in my loan?",
        a: "We are an authorized Direct Selling Agent (DSA) and loan consultancy firm. We assess your profile against the credit norms of 35+ partner banks & NBFCs, prepare your application dossier, and follow up directly with branch credit managers to secure approvals and speedy disbursals.",
      },
      {
        q: "Do you charge any upfront service fees?",
        a: "No! We do not charge borrowers any upfront fees or registration costs. Our consultation is 100% free for applicants. We receive commission payouts directly from partner lending institutions upon successful loan disbursal.",
      },
      {
        q: "Can I apply if my CIBIL score is below 700?",
        a: "Yes. While prime banks typically mandate a 700+ score for lowest interest brackets, we work with specialized NBFCs and fintech lenders who evaluate banking transactions, business revenue, and repayment capacity rather than pure credit bureau score alone.",
      },
    ],
  },
  {
    category: "Home & Property Loans",
    questions: [
      {
        q: "Can I transfer my existing home loan to a lower interest rate?",
        a: "Yes! Home loan balance transfers are one of our core specialties. We help eligible borrowers switch lenders to reduce interest rates by up to 1.0% to 1.5% p.a., with optional top-up funds for personal or business needs.",
      },
      {
        q: "What property types are eligible for Loan Against Property (LAP)?",
        a: "Residential apartments, independent bungalows, commercial offices, industrial galas, and freehold approved plots can all be pledged as collateral, provided title documents and municipal approvals are clear.",
      },
    ],
  },
  {
    category: "Business & MSME Loans",
    questions: [
      {
        q: "What is the minimum business vintage required for an unsecured loan?",
        a: "Most partner lenders seek at least 2 to 3 years of operational history with GST registrations and active current account banking. However, select fintech partners consider businesses with 1+ year vintage.",
      },
      {
        q: "Are manufacturing and machinery loans available?",
        a: "Yes, we facilitate equipment and machinery financing with specialized MSME subsidies and CGTMSE scheme backing for eligible small businesses.",
      },
    ],
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
            <span className="font-bold text-sm text-slate-900 hidden sm:inline">Birdawade Associates</span>
          </div>
          <Link href="/#enquiry" className="py-2 px-3.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold">
            Apply Now
          </Link>
        </div>
      </header>

      <main className="container py-12 max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            Knowledge Base
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Everything you need to know about loan eligibility, documentation, interest rates, and the DSA process.
          </p>
        </div>

        <div className="space-y-8">
          {FAQ_SECTIONS.map((sec, secIdx) => (
            <div key={sec.category} className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                {sec.category}
              </h2>
              <div className="divide-y divide-slate-100">
                {sec.questions.map((q, qIdx) => {
                  const id = `${secIdx}-${qIdx}`;
                  const isOpen = !!openItems[id];
                  return (
                    <div key={q.q} className="py-3.5">
                      <button
                        onClick={() => toggle(id)}
                        className="w-full flex items-center justify-between text-left group cursor-pointer"
                      >
                        <span className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors pr-4">
                          {q.q}
                        </span>
                        <ChevronDown
                          size={16}
                          className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180 text-blue-600" : ""}`}
                        />
                      </button>
                      {isOpen && (
                        <p className="pt-3 text-xs sm:text-sm text-slate-600 leading-relaxed animate-fade-in">
                          {q.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions Box */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 text-center space-y-4">
          <h3 className="text-lg font-bold">Still have specific loan questions?</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Our certified loan consultants are available for free 1-on-1 phone consultations for borrowers all over Maharashtra.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <a
              href="tel:+919623298281"
              className="py-2.5 px-5 bg-white text-slate-900 font-bold rounded-xl text-xs hover:bg-slate-100 transition-colors inline-flex items-center gap-2"
            >
              <Phone size={14} className="text-blue-700" />
              <span>Call +91 96232 98281</span>
            </a>
            <Link
              href="/#enquiry"
              className="py-2.5 px-5 bg-teal-400 text-slate-950 font-bold rounded-xl text-xs hover:bg-teal-300 transition-colors"
            >
              Request Free Callback
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Birdawade Associates & Financial Services. All rights reserved.</p>
      </footer>
    </div>
  );
}
