"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, ChevronRight, Wallet, Building2, Home, Landmark, Car, GraduationCap, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";

const PRODUCTS = [
  {
    id: "personal",
    title: "Personal Loan",
    image: "/images/loans/personal-loan.jpg",
    icon: Wallet,
    rate: "From 10.49% p.a.",
    maxAmount: "Up to ₹40 Lakhs",
    tenure: "12 to 60 Months",
    desc: "Unsecured instant credit for travel, family wedding, medical treatment, home renovation, or consolidating high-cost debts.",
    features: [
      "No collateral or security needed",
      "Instant sanction within 24 - 48 hours",
      "Minimal documentation for salaried employees",
      "Flexible repayment tenures up to 5 years",
    ],
    documents: ["PAN & Aadhaar Card", "Last 3 months salary slips", "6 months bank statement", "Current address proof"],
  },
  {
    id: "business",
    title: "Business Loan",
    image: "/images/loans/business-loan.jpg",
    icon: Building2,
    rate: "From 11.99% p.a.",
    maxAmount: "Up to ₹2 Crores",
    tenure: "1 to 7 Years",
    desc: "Customized collateral-free business funding for working capital, business expansion, inventory buildup, and invoice financing.",
    features: [
      "Unsecured working capital limits",
      "Overdraft (OD) and Cash Credit (CC) options",
      "Fast sanction with minimal balance sheet friction",
      "Customized repayment matching business cash flow",
    ],
    documents: ["PAN of Promoter & Entity", "GST Returns (12 Months)", "2 Years ITR & Audited Financials", "12 Months Banking"],
  },
  {
    id: "home",
    title: "Home Loan",
    image: "/images/loans/home-loan.jpg",
    icon: Home,
    rate: "From 8.40% p.a.",
    maxAmount: "Up to ₹10 Crores",
    tenure: "Up to 30 Years",
    desc: "Financing for ready-to-move flats, under-construction apartments, self-construction on owned plots, and high-saving balance transfers.",
    features: [
      "Lowest market interest rates",
      "Up to 90% property value financing",
      "Balance transfer with top-up loan options",
      "PMAY subsidy assistance for eligible buyers",
    ],
    documents: ["KYC documents", "Income proof / ITR", "Allotment letter / Sale agreement", "Chain of property title deeds"],
  },
  {
    id: "lap",
    title: "Loan Against Property (LAP)",
    image: "/images/loans/property-loan.jpg",
    icon: Landmark,
    rate: "From 9.25% p.a.",
    maxAmount: "Up to ₹5 Crores",
    tenure: "Up to 15 Years",
    desc: "Leverage your self-occupied or rented residential, commercial, or industrial property to access substantial long-term funding.",
    features: [
      "Substantially lower interest rates than personal loans",
      "High sanction amounts up to 65% of property market value",
      "Long repayment tenure keeping EMIs affordable",
      "Retain ownership and continuous use of your property",
    ],
    documents: ["Property deed & approved plan", "Latest tax receipts", "Income proof / Financials", "6 months banking statements"],
  },
  {
    id: "vehicle",
    title: "Vehicle Loan",
    image: "/images/loans/vehicle-loan.jpg",
    icon: Car,
    rate: "From 8.75% p.a.",
    maxAmount: "100% On-road",
    tenure: "Up to 7 Years",
    desc: "Competitive financing for brand new and pre-owned personal cars, commercial vehicles, and fleet expansion.",
    features: [
      "Up to 100% on-road funding on select models",
      "Quick approval with minimal paperwork",
      "Attractive tie-ups with leading automobile dealerships",
      "Flexible repayment schemes with low EMIs",
    ],
    documents: ["PAN & Aadhaar Card", "Income proof / Salary slips", "Vehicle quotation/proforma invoice", "Bank statement"],
  },
  {
    id: "education",
    title: "Education Loan",
    image: "/images/loans/education-loan.jpg",
    icon: GraduationCap,
    rate: "From 9.00% p.a.",
    maxAmount: "Up to ₹1.5 Crores",
    tenure: "Up to 15 Years",
    desc: "Comprehensive funding covering college tuition, hostel living expenses, laptop, and travel for studies in India and abroad.",
    features: [
      "Covers 100% of education expenses",
      "Moratorium period: Study period + 6-12 months",
      "Tax benefits under Section 80E on interest paid",
      "Fast sanction letters for visa processing",
    ],
    documents: ["Admission letter from university", "Fee schedule", "Academic marksheet", "Co-applicant income proofs"],
  },
  {
    id: "gold",
    title: "Gold Loan",
    image: "/images/loans/gold-loan.jpg",
    icon: Sparkles,
    rate: "From 8.90% p.a.",
    maxAmount: "Up to ₹50 Lakhs",
    tenure: "Up to 36 Months",
    desc: "Immediate liquidity against your gold jewelry with zero income proof and same-day instant cash/bank transfer disbursal.",
    features: [
      "Disbursal in as fast as 30 minutes",
      "Highest per-gram valuation for 18k - 24k gold",
      "Bullet repayment and EMI repayment choices",
      "Bank vault storage with 100% complimentary insurance",
    ],
    documents: ["PAN Card", "Aadhaar / Passport for KYC", "Gold ornaments for weighing"],
  },
  {
    id: "machinery",
    title: "Machinery & Equipment Loan",
    image: "/images/loans/machinery-loan.jpg",
    icon: TrendingUp,
    rate: "From 10.75% p.a.",
    maxAmount: "Up to ₹3 Crores",
    tenure: "Up to 7 Years",
    desc: "Specialized equipment financing for manufacturing units, CNC workshops, diagnostic labs, and MSME automation.",
    features: [
      "Funding up to 85% of machinery invoice value",
      "Subsidies under government MSME schemes where eligible",
      "Structured repayments matching production ramp-up",
      "Fast-track processing for industrial borrowers",
    ],
    documents: ["Machinery proforma invoice", "GST returns", "2 years audited balance sheets", "Bank statements"],
  },
];

export default function LoansPage() {
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

      <main className="container py-12 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            All Loan Products
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Find the Right Loan for Your Needs
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Compare terms across 35+ partner banks and NBFCs. We guide you to the highest eligibility and lowest interest rates.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {PRODUCTS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
                <div>
                  {/* Photo Visual Banner */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent pointer-events-none" />
                    
                    {/* Rate badge floating top right */}
                    <div className="absolute top-3 right-3 backdrop-blur-md bg-white/95 px-3 py-1 rounded-full shadow-md border border-white/40">
                      <div className="text-[10px] text-slate-500 font-semibold leading-none">Starting Rate</div>
                      <div className="text-xs font-extrabold text-teal-700 leading-tight font-mono">{p.rate}</div>
                    </div>

                    {/* Max amount floating bottom left */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-lg backdrop-blur-md bg-black/50 border border-white/20 text-white text-xs font-semibold">
                      <Icon size={14} className="text-teal-300" />
                      <span>{p.maxAmount}</span>
                    </div>
                  </div>

                  <div className="p-6 pb-2">
                    <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">{p.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">{p.desc}</p>
                  </div>

                  <div className="px-6 space-y-1.5 mb-4">
                    <div className="text-xs font-semibold text-slate-700 mb-1">Key Advantages:</div>
                    {p.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="px-6 mb-4">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Documents:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {p.documents.map((doc) => (
                          <span key={doc} className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-0">
                  <Link
                    href="/#enquiry"
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-blue-900 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Check Eligibility for {p.title}</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Birdawade Associates & Financial Services. All rights reserved.</p>
      </footer>
    </div>
  );
}
