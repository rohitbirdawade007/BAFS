"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Shield,
  Lock,
  Phone,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  KeyRound,
  UserCheck,
} from "lucide-react";

export default function CustomerPortalLoginPage() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState("");
  const [refId, setRefId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNumber.length === 10) {
      setSubmitted(true);
      // Pre-fill demo OTP if testing with demo mobile
      if (mobileNumber === "9623298281" || mobileNumber === "9876543210") {
        setOtp("123456");
      }
    }
  };

  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/portal/dashboard");
    }, 600);
  };

  const handleInstantDemoLogin = () => {
    setLoading(true);
    setMobileNumber("9623298281");
    setRefId("BAFS-2026-8891");
    setTimeout(() => {
      router.push("/portal/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex flex-col justify-between text-white">
      {/* Header */}
      <header className="p-6">
        <div className="container max-w-4xl flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Main Website</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-amber-400/50 shrink-0 bg-slate-950">
              <Image src="/bafs-logo.jpg" alt="BAFS Logo" fill className="object-cover" />
            </div>
            <span className="font-bold text-sm tracking-tight">Birdawade Customer Portal</span>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="container max-w-md mx-auto px-4 py-8">
        <div className="bg-white text-slate-900 rounded-3xl p-7 sm:p-8 shadow-2xl border border-slate-100">
          <div className="text-center mb-6">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg border-2 border-amber-400/50 mx-auto mb-3 bg-slate-950">
              <Image src="/bafs-logo.jpg" alt="BAFS Seal" fill className="object-cover" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Track Loan Application
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Check live bank underwriting status, sanction letters, and consultant notes.
            </p>
          </div>

          {/* 🌟 1-Click Demo Login Box */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Demo Account Credentials
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Live Preview
              </span>
            </div>
            <div className="text-xs text-slate-600 space-y-1 mb-3">
              <div className="flex justify-between">
                <span>Demo Mobile:</span>
                <span className="font-mono font-bold text-slate-900">9623298281</span>
              </div>
              <div className="flex justify-between">
                <span>Ref Number:</span>
                <span className="font-mono font-bold text-slate-900">BAFS-2026-8891</span>
              </div>
              <div className="flex justify-between">
                <span>Demo OTP:</span>
                <span className="font-mono font-bold text-slate-900">123456</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleInstantDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              <span>{loading ? "Logging into Portal..." : "⚡ 1-Click Instant Demo Login"}</span>
            </button>
          </div>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] text-slate-400 uppercase font-semibold">Or enter mobile</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {submitted ? (
            <div className="text-center py-2 space-y-4 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Verification OTP Sent</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Enter 6-digit OTP sent to <span className="font-mono font-bold text-slate-900">+91 {mobileNumber}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="pt-2 space-y-3">
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center text-xl tracking-widest font-mono py-2.5 border-2 border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{loading ? "Verifying & Loading..." : "Verify OTP & Open Dashboard"}</span>
                </button>
              </form>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-[11px] text-blue-600 hover:underline pt-1 block mx-auto font-medium"
              >
                ← Change mobile number
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 font-mono">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9623298281"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-12 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Application Reference ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. BAFS-2026-8891"
                  value={refId}
                  onChange={(e) => setRefId(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono uppercase"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Request Login OTP</span>
                <ArrowRight size={14} />
              </button>

              <div className="text-center pt-2">
                <Link href="/#enquiry" className="text-xs text-blue-700 hover:underline font-semibold">
                  New borrower? Submit a free enquiry →
                </Link>
              </div>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-teal-600" />
            <span>256-bit Encrypted Customer Portal • Serving All Over Maharashtra</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Birdawade Associates & Financial Services. All rights reserved.</p>
      </footer>
    </div>
  );
}
