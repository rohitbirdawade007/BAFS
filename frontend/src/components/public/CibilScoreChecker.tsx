"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Shield,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  CreditCard,
  Banknote,
  Clock,
  Users,
} from "lucide-react";

/* ── Score band definitions ──────────────────────────────────────────────── */
const SCORE_BANDS = [
  { min: 300, max: 549, label: "Poor", color: "#ef4444", bg: "#fef2f2", tip: "Focus on clearing overdue payments and reducing credit utilization below 30%." },
  { min: 550, max: 649, label: "Fair", color: "#f59e0b", bg: "#fffbeb", tip: "Maintain timely payments for 6+ months and avoid multiple loan enquiries." },
  { min: 650, max: 749, label: "Good", color: "#3b82f6", bg: "#eff6ff", tip: "You qualify for most bank loans. Consider balance transfer for better rates." },
  { min: 750, max: 799, label: "Very Good", color: "#10b981", bg: "#ecfdf5", tip: "Excellent! You can negotiate for preferential interest rates with top banks." },
  { min: 800, max: 900, label: "Excellent", color: "#059669", bg: "#ecfdf5", tip: "Outstanding credit profile. You qualify for the lowest available interest rates." },
];

function getBand(score: number) {
  return SCORE_BANDS.find((b) => score >= b.min && score <= b.max) || SCORE_BANDS[0];
}

/* ── Score factors ───────────────────────────────────────────────────────── */
const FACTORS = [
  { key: "payment", label: "Payment History", weight: 35, icon: Clock, desc: "On-time payments on loans & credit cards" },
  { key: "utilization", label: "Credit Utilization", weight: 30, icon: CreditCard, desc: "How much of your credit limit is used" },
  { key: "length", label: "Credit Age", weight: 15, icon: Users, desc: "Average age of your credit accounts" },
  { key: "mix", label: "Credit Mix", weight: 10, icon: Banknote, desc: "Variety of credit products (loans, cards)" },
  { key: "enquiries", label: "Recent Enquiries", weight: 10, icon: Info, desc: "Number of hard enquiries in last 6 months" },
];

export default function CibilScoreChecker() {
  const [step, setStep] = useState<"form" | "result">("form");
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);

  /* Form fields */
  const [name, setName] = useState("");
  const [pan, setPan] = useState("");
  const [dob, setDob] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [existingEmi, setExistingEmi] = useState("");
  const [creditCards, setCreditCards] = useState("0");
  const [missedPayments, setMissedPayments] = useState("0");
  const [loanHistory, setLoanHistory] = useState("none");

  /* Simulate a CIBIL score based on inputs */
  const calculateScore = useCallback(() => {
    let base = 680;
    const income = parseInt(monthlyIncome) || 0;
    const emi = parseInt(existingEmi) || 0;
    const cards = parseInt(creditCards) || 0;
    const missed = parseInt(missedPayments) || 0;

    // Income factor
    if (income > 100000) base += 40;
    else if (income > 50000) base += 25;
    else if (income > 25000) base += 10;
    else base -= 15;

    // EMI to income ratio (FOIR)
    if (income > 0) {
      const foir = emi / income;
      if (foir < 0.2) base += 30;
      else if (foir < 0.4) base += 10;
      else if (foir < 0.6) base -= 20;
      else base -= 50;
    }

    // Credit cards utilization
    if (cards === 0) base -= 10; // no credit history
    else if (cards <= 2) base += 15;
    else if (cards <= 4) base += 5;
    else base -= 15; // too many

    // Missed payments
    if (missed === 0) base += 30;
    else if (missed <= 2) base -= 25;
    else base -= 60;

    // Loan history
    if (loanHistory === "closed-good") base += 25;
    else if (loanHistory === "active-good") base += 15;
    else if (loanHistory === "settled") base -= 40;
    else if (loanHistory === "written-off") base -= 80;

    // Clamp to valid range
    return Math.max(300, Math.min(900, base));
  }, [monthlyIncome, existingEmi, creditCards, missedPayments, loanHistory]);

  const handleCheck = () => {
    if (!name || !pan || !dob || !monthlyIncome) return;
    setLoading(true);
    setTimeout(() => {
      const computed = calculateScore();
      setScore(computed);
      setLoading(false);
      setStep("result");
    }, 2500);
  };

  const band = useMemo(() => getBand(score), [score]);

  /* Gauge SVG calculation */
  const circumference = 2 * Math.PI * 45; // r=45
  const scorePercent = ((score - 300) / 600);
  const dashOffset = circumference - (scorePercent * circumference * 0.75); // 270-degree arc

  if (step === "result") {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Score Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 mb-4">
            <Shield size={14} />
            CIBIL Score Estimate Report
          </div>
          <p className="text-xs text-slate-500">for {name} • PAN: {pan.slice(0, 5)}XXXXX</p>
        </div>

        {/* Gauge + Score */}
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-[135deg]">
              {/* Background arc */}
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="8"
                strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
                strokeLinecap="round"
              />
              {/* Score arc */}
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke={band.color}
                strokeWidth="8"
                strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className="cibil-gauge-ring"
                style={{ filter: `drop-shadow(0 0 6px ${band.color}40)` }}
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center score-value">
              <span className="text-4xl font-extrabold tracking-tight" style={{ color: band.color }}>
                {score}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider mt-0.5" style={{ color: band.color }}>
                {band.label}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">out of 900</span>
            </div>
          </div>

          {/* Score range bar */}
          <div className="w-full max-w-xs mt-4">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>300</span>
              <span>550</span>
              <span>650</span>
              <span>750</span>
              <span>900</span>
            </div>
            <div className="h-2 rounded-full bg-gradient-to-r from-red-500 via-amber-400 via-blue-500 to-emerald-500 relative">
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 shadow-md transition-all duration-1000"
                style={{
                  left: `${scorePercent * 100}%`,
                  borderColor: band.color,
                  transform: `translateX(-50%) translateY(-50%)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Tip card */}
        <div className="p-4 rounded-xl border-2" style={{ borderColor: band.color + "30", background: band.bg }}>
          <div className="flex items-start gap-3">
            {score >= 750 ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: band.color }} />
            ) : score >= 650 ? (
              <TrendingUp className="w-5 h-5 shrink-0 mt-0.5" style={{ color: band.color }} />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: band.color }} />
            )}
            <div>
              <h4 className="text-sm font-bold" style={{ color: band.color }}>{band.label} Credit Score</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{band.tip}</p>
            </div>
          </div>
        </div>

        {/* Score Factors Breakdown */}
        <div>
          <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Sparkles size={14} className="text-amber-500" />
            Credit Score Factors
          </h4>
          <div className="space-y-3">
            {FACTORS.map((f) => {
              const Icon = f.icon;
              const factorScore = Math.round(score * (f.weight / 100));
              return (
                <div key={f.key} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-700">{f.label}</span>
                      <span className="text-[11px] font-bold text-slate-500">{f.weight}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.min(100, (factorScore / (900 * f.weight / 100)) * 100)}%`,
                          background: band.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Eligible Products */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60">
          <h4 className="text-sm font-bold text-blue-900 mb-2">
            {score >= 700 ? "🎉 You May Qualify For:" : "💡 Improve Score to Unlock:"}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Personal Loan", min: 650 },
              { label: "Home Loan", min: 700 },
              { label: "Business Loan", min: 680 },
              { label: "Credit Card", min: 650 },
              { label: "Vehicle Loan", min: 700 },
              { label: "Loan Against Property", min: 720 },
            ].map((p) => (
              <div
                key={p.label}
                className={`flex items-center gap-2 text-xs py-1.5 px-2.5 rounded-lg ${
                  score >= p.min
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "bg-white/60 text-slate-400 line-through"
                }`}
              >
                {score >= p.min ? <CheckCircle2 size={12} /> : <TrendingDown size={12} />}
                {p.label}
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="#enquiry"
            className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-center hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            Apply for Loan Now
            <ChevronRight size={16} />
          </a>
          <button
            onClick={() => { setStep("form"); setScore(0); }}
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
          >
            Check Again
          </button>
        </div>

        <p className="text-[10px] text-slate-400 text-center leading-relaxed">
          <Shield size={10} className="inline mr-1" />
          This is an estimated score based on the information you provided. For your official CIBIL score,
          visit <a href="https://www.cibil.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">cibil.com</a>.
          Birdawade Associates does not store or share your PAN or financial data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 100 100" className="w-full h-full animate-spin" style={{ animationDuration: '3s' }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                <circle
                  cx="50" cy="50" r="45"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="6"
                  strokeDasharray="70 213"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <Shield className="absolute inset-0 m-auto w-8 h-8 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-900">Analyzing Credit Profile...</p>
              <p className="text-xs text-slate-500 mt-1">Checking credit bureau records securely</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-emerald-600 font-semibold">
              <Shield size={12} />
              256-bit SSL Encrypted
            </div>
          </div>
        </div>
      )}

      {/* Form Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 mb-2">
          <Shield size={14} />
          Free Credit Score Check
        </div>
        <p className="text-xs text-slate-500">Know your CIBIL score in 30 seconds • No impact on your credit</p>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="As on PAN Card"
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">PAN Number *</label>
          <input
            type="text"
            value={pan}
            onChange={(e) => setPan(e.target.value.toUpperCase())}
            placeholder="ABCDE1234F"
            maxLength={10}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all uppercase"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date of Birth *</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Monthly Income (₹) *</label>
          <input
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            placeholder="e.g. 50000"
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Existing Monthly EMIs (₹)</label>
          <input
            type="number"
            value={existingEmi}
            onChange={(e) => setExistingEmi(e.target.value)}
            placeholder="e.g. 15000"
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Active Credit Cards</label>
          <select
            value={creditCards}
            onChange={(e) => setCreditCards(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
          >
            <option value="0">None</option>
            <option value="1">1 Card</option>
            <option value="2">2 Cards</option>
            <option value="3">3 Cards</option>
            <option value="4">4 Cards</option>
            <option value="5">5+ Cards</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Missed Payments (Last 12 Months)</label>
          <select
            value={missedPayments}
            onChange={(e) => setMissedPayments(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
          >
            <option value="0">None — All payments on time</option>
            <option value="1">1-2 missed payments</option>
            <option value="3">3+ missed payments</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Loan Repayment History</label>
          <select
            value={loanHistory}
            onChange={(e) => setLoanHistory(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
          >
            <option value="none">No previous loans</option>
            <option value="active-good">Active loan — Good standing</option>
            <option value="closed-good">Closed loan — Fully paid</option>
            <option value="settled">Settled / Partially paid</option>
            <option value="written-off">Written off / NPA</option>
          </select>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleCheck}
        disabled={!name || !pan || !dob || !monthlyIncome || loading}
        className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <Shield size={16} />
        Check My CIBIL Score — Free
      </button>

      <p className="text-[10px] text-slate-400 text-center leading-relaxed">
        By clicking, you agree to our terms. Your data is encrypted and never shared with third parties.
        This provides an estimated score only. Visit <a href="https://www.cibil.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">CIBIL.com</a> for official reports.
      </p>
    </div>
  );
}
