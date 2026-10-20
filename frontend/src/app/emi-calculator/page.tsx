"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield, Calculator, CheckCircle2, ChevronRight } from "lucide-react";
import EmiCalculator from "@/components/public/EmiCalculator";

export default function EmiCalculatorPage() {
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
            Apply for Loan
          </Link>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
              <Calculator className="w-3.5 h-3.5 text-teal-600" />
              Official Reducing Balance Formula
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Loan EMI & Repayment Calculator
            </h1>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
              Plan your finances accurately before applying. Calculate your equated monthly installments across personal, home, or business loans.
            </p>
          </div>

          <EmiCalculator />

          {/* Educational tips */}
          <div className="grid md:grid-cols-3 gap-6 pt-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-2">How EMI is Calculated</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Using the reducing balance formula: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">EMI = [P x R x (1+R)^N]/[(1+R)^N-1]</code>. Interest is charged only on outstanding balance each month.
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-2">Tips to Lower Your EMI</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Opt for a longer tenure to reduce monthly outgoing, or maintain a CIBIL score of 750+ to negotiate a lower interest rate with our partner lenders.
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-2">Prepayment Benefits</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Making partial prepayments directly reduces principal outstanding, drastically cutting total interest outflow over the loan period.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Birdawade Associates & Financial Services. All rights reserved.</p>
      </footer>
    </div>
  );
}
