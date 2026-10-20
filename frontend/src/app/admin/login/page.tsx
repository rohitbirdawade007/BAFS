"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("birdawadeassociate@gmail.com");
  const [password, setPassword] = useState("Admin@2026");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // Accept demo credentials
    setTimeout(() => {
      router.push("/admin/dashboard");
    }, 600);
  };

  const handleQuickDemoLogin = () => {
    setLoading(true);
    setEmail("birdawadeassociate@gmail.com");
    setPassword("Admin@2026");
    setTimeout(() => {
      router.push("/admin/dashboard");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col justify-between text-white">
      {/* Top Header */}
      <header className="p-6">
        <div className="container max-w-5xl flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Public Website</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-amber-400/50 shrink-0 bg-slate-950">
              <Image src="/bafs-logo.jpg" alt="BAFS Logo" fill className="object-cover" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">
              BAFS Internal Admin Portal
            </span>
          </div>
        </div>
      </header>

      {/* Login Card */}
      <main className="container max-w-md mx-auto px-4 py-8">
        <div className="bg-white text-slate-900 rounded-3xl p-7 sm:p-8 shadow-2xl border border-slate-100">
          <div className="text-center mb-6">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg border-2 border-amber-400/50 mx-auto mb-3 bg-slate-950">
              <Image src="/bafs-logo.jpg" alt="BAFS Seal" fill className="object-cover" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              BAFS CRM &amp; Admin Panel
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Authorized management access for leads, lenders &amp; loan pipeline
            </p>
          </div>

          {/* 1-Click Demo Login Box */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-indigo-500/10 border border-amber-400/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Demo Administrator Access
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Instant Access
              </span>
            </div>
            <div className="text-xs text-slate-700 space-y-1 mb-3">
              <div className="flex justify-between">
                <span>Admin User:</span>
                <span className="font-mono font-bold text-slate-900">birdawadeassociate@gmail.com</span>
              </div>
              <div className="flex justify-between">
                <span>Role:</span>
                <span className="font-semibold text-blue-800">Managing Director / Super Admin</span>
              </div>
              <div className="flex justify-between">
                <span>Coverage:</span>
                <span className="font-semibold text-teal-700">All 36 Maharashtra Districts</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? "Accessing Admin Panel..." : "⚡ 1-Click Instant Admin Access"}</span>
            </button>
          </div>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] text-slate-400 uppercase font-semibold">Or enter credentials</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{loading ? "Authenticating..." : "Sign In to Admin Portal"}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            <span>Strictly Authorized Personnel • Role-Based Access Control</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Birdawade Associates &amp; Financial Services. Internal CRM &amp; Admin Suite.</p>
      </footer>
    </div>
  );
}
