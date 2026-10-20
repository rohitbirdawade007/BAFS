"use client";

import { useState, useMemo } from "react";
import { Calculator, ArrowRight, CheckCircle2, Percent, IndianRupee, Calendar } from "lucide-react";

interface EmiCalculatorProps {
  initialAmount?: number;
  initialRate?: number;
  initialTenureYears?: number;
  onApply?: (amount: number, tenure: number, rate: number) => void;
  showTitle?: boolean;
}

export default function EmiCalculator({
  initialAmount = 1500000,
  initialRate = 9.5,
  initialTenureYears = 5,
  onApply,
  showTitle = false,
}: EmiCalculatorProps) {
  const [loanAmount, setLoanAmount] = useState<number>(initialAmount);
  const [interestRate, setInterestRate] = useState<number>(initialRate);
  const [tenureYears, setTenureYears] = useState<number>(initialTenureYears);

  // EMI Formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
  const calculation = useMemo(() => {
    const P = loanAmount;
    const r = interestRate / 12 / 100; // monthly rate
    const n = tenureYears * 12; // total months

    if (r === 0 || n === 0) {
      const emi = P / (n || 1);
      return {
        monthlyEmi: Math.round(emi),
        totalInterest: 0,
        totalPayment: P,
        principalPercent: 100,
        interestPercent: 0,
      };
    }

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    const principalPercent = Math.max(0, Math.min(100, (P / totalPayment) * 100));
    const interestPercent = 100 - principalPercent;

    return {
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      principalPercent: Math.round(principalPercent),
      interestPercent: Math.round(interestPercent),
    };
  }, [loanAmount, interestRate, tenureYears]);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleApplyClick = () => {
    if (onApply) {
      onApply(loanAmount, tenureYears, interestRate);
    } else {
      const el = document.getElementById("enquiry");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden">
      {showTitle && (
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-400/20 text-teal-300 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Interactive Loan EMI Calculator</h3>
              <p className="text-xs text-slate-300">
                Instantly compute your monthly EMI, total interest, and repayment schedule
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 md:p-8 grid md:grid-cols-12 gap-8 items-center">
        {/* Sliders Side */}
        <div className="md:col-span-7 space-y-6">
          {/* Loan Amount */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-blue-600" />
                Loan Amount
              </label>
              <div className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-900 font-bold rounded-lg text-sm font-mono">
                {formatINR(loanAmount)}
              </div>
            </div>
            <input
              type="range"
              min={100000}
              max={10000000}
              step={50000}
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="accent-blue-700 w-full"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>₹1 Lakh</span>
              <span>₹50 Lakhs</span>
              <span>₹1 Crore</span>
            </div>
            {/* Quick buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {[500000, 1000000, 2500000, 5000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setLoanAmount(amt)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                    loanAmount === amt
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {amt >= 10000000 ? `₹${amt / 10000000} Cr` : `₹${amt / 100000} Lakh`}
                </button>
              ))}
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-teal-600" />
                Interest Rate (p.a.)
              </label>
              <div className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-900 font-bold rounded-lg text-sm font-mono">
                {interestRate.toFixed(1)}%
              </div>
            </div>
            <input
              type="range"
              min={6.5}
              max={24.0}
              step={0.1}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="accent-teal-600 w-full"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>6.5%</span>
              <span>15%</span>
              <span>24%</span>
            </div>
            {/* Rate Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {[
                { label: "Home (8.5%)", rate: 8.5 },
                { label: "Personal (10.5%)", rate: 10.5 },
                { label: "Business (12.5%)", rate: 12.5 },
                { label: "Vehicle (9.0%)", rate: 9.0 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setInterestRate(p.rate)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                    interestRate === p.rate
                      ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tenure */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Loan Tenure
              </label>
              <div className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold rounded-lg text-sm font-mono">
                {tenureYears} Years ({tenureYears * 12} Mos)
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="accent-indigo-600 w-full"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>1 Year</span>
              <span>15 Years</span>
              <span>30 Years</span>
            </div>
            {/* Tenure presets */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {[1, 3, 5, 7, 10, 15, 20].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setTenureYears(yr)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                    tenureYears === yr
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {yr} {yr === 1 ? "Yr" : "Yrs"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100/80 rounded-2xl p-6 border border-slate-200">
          <div className="text-center pb-5 border-b border-slate-200">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Estimated Monthly EMI
            </span>
            <div className="text-3xl lg:text-4xl font-extrabold text-blue-900 mt-1 tracking-tight font-mono">
              {formatINR(calculation.monthlyEmi)}
              <span className="text-sm font-normal text-slate-600">/mo</span>
            </div>
            <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Reducing Balance Method
            </div>
          </div>

          <div className="py-4 space-y-3 text-sm">
            <div className="flex justify-between items-center text-slate-600">
              <span>Principal Amount:</span>
              <span className="font-semibold text-slate-900 font-mono">{formatINR(loanAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Total Interest Payable:</span>
              <span className="font-semibold text-teal-700 font-mono">{formatINR(calculation.totalInterest)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-800 font-bold pt-2 border-t border-slate-200">
              <span>Total Amount Payable:</span>
              <span className="text-blue-900 font-mono">{formatINR(calculation.totalPayment)}</span>
            </div>
          </div>

          {/* Visual Percentage Breakdown Bar */}
          <div className="mt-2 pt-2">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                Principal ({calculation.principalPercent}%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block"></span>
                Interest ({calculation.interestPercent}%)
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${calculation.principalPercent}%` }}
              />
              <div
                className="bg-teal-500 h-full transition-all duration-300"
                style={{ width: `${calculation.interestPercent}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleApplyClick}
            className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Apply for this Loan</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <p className="text-[11px] text-slate-500 text-center mt-2.5">
            *Indicative estimate. Final terms set by partner banks/NBFCs.
          </p>
        </div>
      </div>
    </div>
  );
}
