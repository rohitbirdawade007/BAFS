"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  IndianRupee,
  LogOut,
  MessageCircle,
  Phone,
  Shield,
  Upload,
  User,
  AlertCircle,
  Download,
  Building2,
  Calendar,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function CustomerDashboardPage() {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [uploadedDocs, setUploadedDocs] = useState([
    { name: "PAN Card", status: "Verified", date: "14 Oct 2026" },
    { name: "Aadhaar Card", status: "Verified", date: "14 Oct 2026" },
    { name: "Last 3 Months Salary Slips", status: "Verified", date: "15 Oct 2026" },
    { name: "6 Months Bank Statements", status: "Verified", date: "15 Oct 2026" },
    { name: "Property Chain Deeds & Index II", status: "Under Legal Review", date: "17 Oct 2026" },
  ]);

  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleSimulateUpload = () => {
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadedDocs((prev) => [
        ...prev,
        { name: "Electricity Bill (Address Proof)", status: "Under Review", date: "Today" },
      ]);
      setUploadSuccess(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* ── Dashboard Header ────────────────────────────────────────────── */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
        <div className="container py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-amber-400/50 shrink-0 bg-slate-950">
                <Image src="/bafs-logo.jpg" alt="BAFS Logo" fill className="object-cover" />
              </div>
              <div className="hidden sm:block">
                <div className="font-extrabold text-sm tracking-tight text-white">Birdawade Associates</div>
                <div className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider">Customer Portal</div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-right">
              <div className="hidden md:block">
                <div className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
                  <span>Sachin Kulkarni</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">+91 96232 98281</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center font-bold text-xs text-white border border-white/20">
                SK
              </div>
            </div>

            <Link
              href="/portal/login"
              className="py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ───────────────────────────────────────────── */}
      <main className="container py-8 space-y-6">
        {/* Top Welcome Card */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                <CheckCircle2 size={13} />
                <span>KYC Verified Borrower • Ref: BAFS-2026-8891</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, Sachin!
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Your Home Loan Balance Transfer application is currently under final underwriting. Sanction letter expected within 24 hours.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 shrink-0 flex items-center gap-4">
              <div className="text-right">
                <span className="text-[11px] text-slate-300 uppercase tracking-wider block">Requested Amount</span>
                <span className="text-2xl font-extrabold text-white font-mono">₹65,00,000</span>
                <span className="text-[10px] text-teal-300 block">Lowest Rate: 8.45% p.a.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Application Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-3 px-4 font-bold text-xs sm:text-sm transition-all border-b-2 cursor-pointer ${
              activeTab === "active"
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Active Application (Home Loan)
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 px-4 font-bold text-xs sm:text-sm transition-all border-b-2 cursor-pointer ${
              activeTab === "history"
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Past Loans History (1 Completed)
          </button>
        </div>

        {activeTab === "active" ? (
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Timeline and Bank Matches */}
            <div className="lg:col-span-8 space-y-6">
              {/* Application Progress Stepper */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-900 text-base">Application Progress Status</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1.5">
                    <Clock size={13} />
                    <span>Stage 4 of 6: Underwriting</span>
                  </span>
                </div>

                {/* Stepper Steps */}
                <div className="space-y-6">
                  {[
                    {
                      title: "1. Loan Enquiry & Profile Setup",
                      date: "Completed on 12 Oct 2026",
                      desc: "Consultation logged with Pune Head Office. Assigned to Senior Consultant.",
                      status: "done",
                    },
                    {
                      title: "2. KYC & Financial Document Collection",
                      date: "Completed on 14 Oct 2026",
                      desc: "PAN, Aadhaar, 3 months salary slips and 6 months bank statements verified.",
                      status: "done",
                    },
                    {
                      title: "3. Multi-Bank Policy Matching & Submission",
                      date: "Completed on 16 Oct 2026",
                      desc: "Dossier submitted to HDFC Bank and ICICI Bank for best interest rate competition.",
                      status: "done",
                    },
                    {
                      title: "4. Credit Underwriting & Property Valuation",
                      date: "Currently In Progress (Oct 19, 2026)",
                      desc: "Valuer inspection completed. Final credit approval committee sign-off underway.",
                      status: "active",
                    },
                    {
                      title: "5. Official Sanction Letter Issuance",
                      date: "Expected by tomorrow, 2:00 PM",
                      desc: "Detailed sanction terms, approved loan amount, and processing fee schedule.",
                      status: "pending",
                    },
                    {
                      title: "6. Agreement Signing & Loan Disbursal",
                      date: "Pending Sanction",
                      desc: "Direct RTGS credit to borrower / takeover cheque to existing lender.",
                      status: "pending",
                    },
                  ].map((step, idx) => (
                    <div key={step.title} className="flex gap-4 relative">
                      {/* Vertical line connecting steps */}
                      {idx < 5 && (
                        <div
                          className={`absolute left-3.5 top-7 w-0.5 h-full ${
                            step.status === "done" ? "bg-emerald-500" : "bg-slate-200"
                          }`}
                        />
                      )}
                      <div className="relative z-10 shrink-0">
                        {step.status === "done" ? (
                          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                            <CheckCircle2 size={16} />
                          </div>
                        ) : step.status === "active" ? (
                          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center ring-4 ring-blue-100 shadow-xs animate-pulse">
                            <Clock size={14} />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div className="pb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4
                            className={`font-bold text-sm ${
                              step.status === "active"
                                ? "text-blue-900"
                                : step.status === "done"
                                ? "text-slate-900"
                                : "text-slate-400"
                            }`}
                          >
                            {step.title}
                          </h4>
                          <span className="text-[11px] text-slate-400">{step.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Competing Bank Sanction Offers */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Lender Terms Comparison</h3>
                    <p className="text-xs text-slate-500">Live preliminary offers negotiated by your consultant</p>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                    2 Lenders Competing
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Bank Offer 1 */}
                  <div className="p-4 rounded-xl border-2 border-emerald-500/80 bg-emerald-50/30 relative">
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
                      Recommended Best Rate
                    </span>
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-900 text-white font-extrabold text-xs flex items-center justify-center">
                        HDFC
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">HDFC Bank</div>
                        <div className="text-[11px] text-emerald-700 font-semibold">Preliminary Sanction Approved</div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700 py-2 border-y border-emerald-100">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Interest Rate:</span>
                        <span className="font-bold text-emerald-800">8.45% p.a. (Floating)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Monthly EMI:</span>
                        <span className="font-bold text-slate-900 font-mono">₹56,220 / mo</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Max Sanction:</span>
                        <span className="font-bold text-slate-900 font-mono">₹65,00,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tenure:</span>
                        <span>20 Years</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="w-full mt-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Proceed with HDFC Offer</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Bank Offer 2 */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-orange-600 text-white font-extrabold text-xs flex items-center justify-center">
                        ICICI
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">ICICI Bank</div>
                        <div className="text-[11px] text-blue-700 font-semibold">Underwriting in Review</div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700 py-2 border-y border-slate-200/80">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Interest Rate:</span>
                        <span className="font-bold text-slate-800">8.50% p.a.</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Monthly EMI:</span>
                        <span className="font-bold text-slate-900 font-mono">₹56,435 / mo</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Max Sanction:</span>
                        <span className="font-bold text-slate-900 font-mono">₹65,00,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tenure:</span>
                        <span>20 Years</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="w-full mt-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>View Details</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Dedicated Advisor & Document Vault */}
            <div className="lg:col-span-4 space-y-6">
              {/* Dedicated Consultant Box */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/80 inline-block">
                  Assigned Loan Manager
                </span>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                    RS
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">Rajesh Shinde</h4>
                    <p className="text-xs text-slate-500">Senior Home Loan Consultant</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">● Online • Maharashtra Advisory Desk</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Direct Helpline:</span>
                    <a href="tel:+919623298281" className="font-bold text-blue-700 hover:underline">
                      +91 96232 98281
                    </a>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Working Hours:</span>
                    <span>Mon-Sat (9:30 AM - 7 PM)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <a
                    href="https://wa.me/919623298281?text=Hi%20Rajesh%2C%20checking%20status%20for%20my%20loan%20BAFS-2026-8891."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <MessageCircle size={15} />
                    <span>WhatsApp Relationship Manager</span>
                  </a>

                  <a
                    href="tel:+919623298281"
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone size={14} className="text-blue-700" />
                    <span>Call +91 96232 98281</span>
                  </a>
                </div>
              </div>

              {/* Uploaded Documents Vault */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">Document Vault</h4>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {uploadedDocs.length} Documents
                  </span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {uploadedDocs.map((doc) => (
                    <div
                      key={doc.name}
                      className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <FileText size={15} className="text-blue-600 shrink-0" />
                        <span className="font-medium text-slate-800 truncate">{doc.name}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          doc.status === "Verified"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>

                {uploadSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    <span>Document uploaded successfully!</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSimulateUpload}
                  className="w-full py-2.5 border border-dashed border-blue-400 bg-blue-50/50 hover:bg-blue-50 text-blue-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload size={14} />
                  <span>+ Upload Additional Document</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Past Loan History Tab */
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">Past Completed Loans</h3>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">Personal Loan • ₹5,00,000</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Fully Disbursed
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Disbursed via Bajaj Finserv • Ref: BAFS-2024-4412 • Date: Nov 2024
                </div>
              </div>
              <button
                type="button"
                className="py-1.5 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 shrink-0"
              >
                <Download size={13} />
                <span>Download NOC / Statement</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Birdawade Associates & Financial Services. All rights reserved.</p>
        <p className="text-[11px] text-slate-400 mt-1">Authorized DSA Partner • Serving All Over Maharashtra</p>
      </footer>
    </div>
  );
}
