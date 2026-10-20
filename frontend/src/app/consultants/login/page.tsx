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
  Building2,
  Briefcase,
  Users,
  MapPin,
  TrendingUp,
  FileCheck2,
  HelpCircle,
  Mail,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";

interface DemoConsultant {
  id: string;
  name: string;
  role: string;
  region: string;
  mobile: string;
  email: string;
  badgeColor: string;
}

const DEMO_CONSULTANTS: DemoConsultant[] = [
  {
    id: "CNS-001",
    name: "Rajesh Shinde",
    role: "Senior Consultant & Head of Desk",
    region: "Pune & Western Maharashtra",
    mobile: "9623298281",
    email: "rajesh.shinde@birdawade.com",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    id: "CNS-002",
    name: "Amit Patil",
    role: "Regional Lead & Senior Advisor",
    region: "Mumbai, Thane & Konkan",
    mobile: "9822100001",
    email: "amit.patil@birdawade.com",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    id: "CNS-003",
    name: "Snehal Deshmukh",
    role: "Agro-Commercial Specialist",
    region: "Nashik & North Maharashtra",
    mobile: "9822100002",
    email: "snehal.d@birdawade.com",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  {
    id: "CNS-004",
    name: "Sagar Jadhav",
    role: "Regional Lead & MSME Coordinator",
    region: "Marathwada & Vidarbha",
    mobile: "9822100003",
    email: "sagar.j@birdawade.com",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
  },
];

export default function ConsultantLoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<"otp" | "password">("otp");
  const [consultantIdOrEmail, setConsultantIdOrEmail] = useState("rajesh.shinde@birdawade.com");
  const [password, setPassword] = useState("Consultant@2026");
  const [mobileNumber, setMobileNumber] = useState("9623298281");
  const [submittedOtp, setSubmittedOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<DemoConsultant>(DEMO_CONSULTANTS[0]);

  // Fast demo selector
  const selectDemoProfile = (consultant: DemoConsultant) => {
    setSelectedConsultant(consultant);
    setMobileNumber(consultant.mobile);
    setConsultantIdOrEmail(consultant.email);
    setPassword("Consultant@2026");
    setSubmittedOtp(false);
    setOtp("");
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNumber.length === 10) {
      setSubmittedOtp(true);
      setOtp("789012");
    }
  };

  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      // Redirect to admin CRM dashboard filtered to consultant's operations
      router.push(`/admin/dashboard?view=consultant&consultantId=${selectedConsultant.id}`);
    }, 600);
  };

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push(`/admin/dashboard?view=consultant&consultantId=${selectedConsultant.id}`);
    }, 600);
  };

  const handle1ClickDemoAccess = (consultant: DemoConsultant) => {
    selectDemoProfile(consultant);
    setLoading(true);
    setTimeout(() => {
      router.push(`/admin/dashboard?view=consultant&consultantId=${consultant.id}`);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 flex flex-col justify-between text-white selection:bg-teal-500 selection:text-white">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <header className="p-4 sm:p-6 border-b border-white/5 backdrop-blur-md">
        <div className="container max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/consultants"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Regional Desks Directory</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-amber-400/50 shrink-0 bg-slate-950 shadow-sm">
              <Image src="/bafs-logo.jpg" alt="BAFS Logo" fill className="object-cover" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-bold text-xs tracking-tight text-white leading-tight">
                Birdawade Associates
              </div>
              <div className="text-[10px] text-teal-400 font-semibold tracking-wider uppercase">
                Loan Consultant Portal
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/portal/login"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              Borrower Portal
            </Link>
            <Link
              href="/admin/login"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 transition-colors"
            >
              Super Admin
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Login Container ──────────────────────────────────── */}
      <main className="container max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Context, Features & Active Consultant Stats */}
          <div className="lg:col-span-5 space-y-6 text-slate-300">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Briefcase size={12} />
                <span>Authorized Field Staff &amp; DSA Partners</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                Loan Consultant &amp; Regional Desk Login
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Single sign-on for BAFS authorized loan advisors across all 36 districts of Maharashtra. Manage loan applications, track underwriter queries, and monitor disbursement commissions.
              </p>
            </div>

            {/* Quick feature highlights */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-3 backdrop-blur-sm">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp size={14} className="text-teal-400" />
                <span>Consultant Workspace Capabilities</span>
              </div>
              <ul className="text-xs space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <BadgeCheck size={15} className="text-teal-400 shrink-0 mt-0.5" />
                  <span>Real-time loan lead assignment &amp; applicant verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <BadgeCheck size={15} className="text-teal-400 shrink-0 mt-0.5" />
                  <span>Instant multi-bank eligibility check (35+ partner banks)</span>
                </li>
                <li className="flex items-start gap-2">
                  <BadgeCheck size={15} className="text-teal-400 shrink-0 mt-0.5" />
                  <span>Doorstep document collection tracking &amp; status logs</span>
                </li>
                <li className="flex items-start gap-2">
                  <BadgeCheck size={15} className="text-teal-400 shrink-0 mt-0.5" />
                  <span>Target quota progress &amp; payout commission ledgers</span>
                </li>
              </ul>
            </div>

            {/* Regional Desks Coverage Badge */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-900/20 via-blue-900/20 to-slate-900/40 border border-teal-500/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Statewide Maharashtra Network</div>
                <div className="text-[11px] text-slate-400">
                  Pune, Mumbai, Nashik, Sambhajinagar, Vidarbha &amp; Kolhapur Desks
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login Card */}
          <div className="lg:col-span-7">
            <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Sign In to Desk
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authorized Loan Officer Authentication
                  </p>
                </div>
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-amber-400/40 bg-slate-950 shrink-0">
                  <Image src="/bafs-logo.jpg" alt="BAFS Seal" fill className="object-cover" />
                </div>
              </div>

              {/* 🌟 1-Click Demo Profiles (For Instant Testing) */}
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 border border-teal-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-teal-950 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    Quick 1-Click Demo Logins
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    4 Regional Desks
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
                  Click any desk officer below to test instant authentication with live regional data:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {DEMO_CONSULTANTS.map((c) => {
                    const isSelected = selectedConsultant.id === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => selectDemoProfile(c)}
                        className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-white border-teal-600 shadow-sm ring-2 ring-teal-500/20"
                            : "bg-white/80 border-slate-200/90 hover:bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {c.name}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold">
                            {c.id}
                          </span>
                        </div>
                        <div className="text-[10px] text-teal-700 font-semibold truncate mt-0.5">
                          {c.region.split("&")[0]}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-1">
                          <Phone size={9} />
                          <span>+91 {c.mobile}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => handle1ClickDemoAccess(selectedConsultant)}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-700 via-teal-800 to-blue-800 hover:from-teal-800 hover:to-blue-900 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>
                    {loading
                      ? `Authenticating as ${selectedConsultant.name}...`
                      : `⚡ Instant 1-Click Access as ${selectedConsultant.name}`}
                  </span>
                </button>
              </div>

              {/* Login Method Toggle Tabs */}
              <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("otp");
                    setSubmittedOtp(false);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    loginMethod === "otp"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Phone size={13} />
                  <span>Mobile OTP (Field 2FA)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod("password")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    loginMethod === "password"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Lock size={13} />
                  <span>Staff ID &amp; Password</span>
                </button>
              </div>

              {/* ── Form: OTP Flow ── */}
              {loginMethod === "otp" && (
                <>
                  {submittedOtp ? (
                    <div className="text-center py-2 space-y-4 animate-fade-in">
                      <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mx-auto shadow-xs">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          Consultant 2FA OTP Dispatched
                        </h3>
                        <p className="text-xs text-slate-600 mt-1">
                          Enter 6-digit authentication token sent to{" "}
                          <span className="font-mono font-bold text-slate-900">
                            +91 {mobileNumber}
                          </span>
                        </p>
                      </div>

                      <form onSubmit={handleVerifyOtp} className="pt-2 space-y-3">
                        <input
                          type="text"
                          maxLength={6}
                          required
                          placeholder="789012"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full text-center text-xl tracking-widest font-mono py-2.5 border-2 border-teal-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-bold text-slate-900 bg-white"
                        />
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <KeyRound className="w-4 h-4" />
                          <span>
                            {loading
                              ? "Verifying Token..."
                              : `Open ${selectedConsultant.name}'s Desk`}
                          </span>
                        </button>
                      </form>

                      <button
                        type="button"
                        onClick={() => setSubmittedOtp(false)}
                        className="text-[11px] text-teal-700 hover:underline pt-1 block mx-auto font-medium cursor-pointer"
                      >
                        ← Change registered mobile number
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Registered Consultant Mobile Number <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 font-mono">
                            +91
                          </span>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            placeholder="9623298281"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                            className="w-full pl-12 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Must match the mobile registered in BAFS HR/Consultant Registry.
                        </p>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                      >
                        <span>Send Consultant Security Code</span>
                        <ArrowRight size={14} />
                      </button>
                    </form>
                  )}
                </>
              )}

              {/* ── Form: Password Flow ── */}
              {loginMethod === "password" && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Consultant Staff ID or Official Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={consultantIdOrEmail}
                        onChange={(e) => setConsultantIdOrEmail(e.target.value)}
                        placeholder="CNS-001 or rajesh.shinde@birdawade.com"
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Password / Access Key <span className="text-rose-500">*</span>
                      </label>
                      <a
                        href="tel:+919623298281"
                        className="text-[10px] text-teal-700 hover:underline font-medium"
                      >
                        Forgot password? Contact Desk
                      </a>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    <span>
                      {loading
                        ? "Verifying Credentials..."
                        : `Sign In to ${selectedConsultant.name}'s Desk`}
                    </span>
                    <ArrowRight size={14} />
                  </button>
                </form>
              )}

              {/* Portal Switcher & Help Info */}
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Looking for other portals?</span>
                  <div className="flex gap-3">
                    <Link
                      href="/portal/login"
                      className="text-blue-700 hover:underline font-semibold"
                    >
                      Borrower Login →
                    </Link>
                    <Link
                      href="/admin/login"
                      className="text-amber-700 hover:underline font-semibold"
                    >
                      Admin CRM →
                    </Link>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-50">
                  <Shield className="w-3.5 h-3.5 text-teal-600" />
                  <span>Authorized Field Consultants • Role: LOAN_CONSULTANT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="p-6 text-center text-xs text-slate-400 border-t border-white/5 backdrop-blur-md">
        <p>
          © {new Date().getFullYear()} Birdawade Associates &amp; Financial Services. Regional Consultant Network (Pune, Mumbai, Nashik, Sambhajinagar &amp; all Maharashtra).
        </p>
      </footer>
    </div>
  );
}
