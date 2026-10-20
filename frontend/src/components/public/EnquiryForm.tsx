"use client";

import { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Phone,
  IndianRupee,
  Briefcase,
  MapPin,
  ShieldCheck,
  Copy,
  Check,
  Send,
} from "lucide-react";

export default function EnquiryForm() {
  const [formData, setFormData] = useState({
    full_name: "",
    mobile_number: "",
    loan_category: "PERSONAL",
    requested_amount: "",
    employment_type: "SALARIED",
    monthly_income: "",
    city: "Maharashtra",
    privacy_consent: false,
  });

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{
    reference_number: string;
    message: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.privacy_consent) {
      setErrorMsg("Please accept the terms and privacy policy to continue.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.mobile_number.trim())) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        full_name: formData.full_name.trim(),
        mobile_number: formData.mobile_number.trim(),
        loan_category: formData.loan_category,
        privacy_consent: true,
        marketing_consent: false,
      };

      if (formData.city) payload.city = formData.city.trim();
      if (formData.employment_type) payload.employment_type = formData.employment_type;
      if (formData.requested_amount) payload.requested_amount = Number(formData.requested_amount);
      if (formData.monthly_income) payload.monthly_income = Number(formData.monthly_income);

      const res = await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Unable to submit enquiry. Please try again.");
      }

      setSuccessData({
        reference_number: data.reference_number || "REF-" + Math.floor(100000 + Math.random() * 900000),
        message: data.message || "Your loan enquiry has been registered successfully with Birdawade Associates.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyRefNumber = () => {
    if (successData?.reference_number) {
      navigator.clipboard.writeText(successData.reference_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (successData) {
    return (
      <div className="py-6 px-2 text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Application Received!</h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">
            {successData.message}
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-4 max-w-xs mx-auto">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1">
            Application Reference Number
          </span>
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg font-mono font-bold text-blue-900 tracking-wide">
              {successData.reference_number}
            </span>
            <button
              type="button"
              onClick={copyRefNumber}
              className="p-1.5 rounded-md hover:bg-white text-slate-500 hover:text-blue-700 transition-colors"
              title="Copy Reference ID"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1 text-xs text-slate-500 max-w-xs mx-auto">
          <p className="flex items-center justify-center gap-1.5 font-medium text-slate-700">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            Assigned to Maharashtra Loan Advisory Desk
          </p>
          <p>Our loan advisor will contact you within 24 business hours.</p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              setSuccessData(null);
              setFormData({
                full_name: "",
                mobile_number: "",
                loan_category: "PERSONAL",
                requested_amount: "",
                employment_type: "SALARIED",
                monthly_income: "",
                city: "Maharashtra",
                privacy_consent: false,
              });
            }}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-4"
          >
            Submit another application
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {errorMsg && (
        <div className="flex items-start gap-2.5 p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <span className="leading-snug">{errorMsg}</span>
        </div>
      )}

      {/* Full Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Full Name <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <User className="w-4 h-4" />
          </div>
          <input
            type="text"
            required
            placeholder="e.g. Rahul Sharma"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Mobile Number */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Mobile Number <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-xs font-bold text-slate-500 font-mono">+91</span>
          </div>
          <input
            type="tel"
            required
            maxLength={10}
            placeholder="9876543210"
            value={formData.mobile_number}
            onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value.replace(/\D/g, "") })}
            className="w-full pl-12 pr-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-mono placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Loan Category & Employment Type */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Loan Category <span className="text-rose-500">*</span>
          </label>
          <select
            value={formData.loan_category}
            onChange={(e) => setFormData({ ...formData, loan_category: e.target.value })}
            className="w-full px-2.5 py-2 text-xs md:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-slate-800 font-medium"
          >
            <option value="PERSONAL">Personal Loan</option>
            <option value="BUSINESS">Business Loan</option>
            <option value="HOME">Home Loan</option>
            <option value="LAP">Loan Against Property</option>
            <option value="VEHICLE">Vehicle Loan</option>
            <option value="EDUCATION">Education Loan</option>
            <option value="GOLD">Gold Loan</option>
            <option value="OTHER">Other Loan</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Employment Type
          </label>
          <select
            value={formData.employment_type}
            onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
            className="w-full px-2.5 py-2 text-xs md:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-slate-800 font-medium"
          >
            <option value="SALARIED">Salaried</option>
            <option value="SELF_EMPLOYED">Self Employed</option>
            <option value="BUSINESS_OWNER">Business Owner</option>
            <option value="SELF_EMPLOYED_PROFESSIONAL">Doctor / CA / Lawyer</option>
          </select>
        </div>
      </div>

      {/* Requested Amount & Monthly Income */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Required Amount (₹)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
            <input
              type="number"
              placeholder="e.g. 500000"
              value={formData.requested_amount}
              onChange={(e) => setFormData({ ...formData, requested_amount: e.target.value })}
              className="w-full pl-7 pr-2.5 py-2 text-xs md:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-mono placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Monthly Income (₹)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
            <input
              type="number"
              placeholder="e.g. 75000"
              value={formData.monthly_income}
              onChange={(e) => setFormData({ ...formData, monthly_income: e.target.value })}
              className="w-full pl-7 pr-2.5 py-2 text-xs md:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-mono placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* City */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          City / District <span className="text-teal-600 font-normal">(All over Maharashtra)</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <MapPin className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="e.g. Pune, Mumbai, Nashik, Sambhajinagar, Kolhapur..."
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Privacy Consent Checkbox */}
      <div className="pt-1">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.privacy_consent}
            onChange={(e) => setFormData({ ...formData, privacy_consent: e.target.checked })}
            className="mt-0.5 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 accent-blue-600 shrink-0"
          />
          <span className="text-[11px] text-slate-500 leading-tight">
            I agree to the{" "}
            <a href="/terms" className="text-blue-600 hover:underline">
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
            . I authorize Birdawade Associates to contact me for loan consultation.
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-slate-950 font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed mt-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
            <span>Submitting Application...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4 text-slate-900" />
            <span>Request Free Loan Consultation</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
        <span>100% Confidential & Free Consultation</span>
      </div>
    </form>
  );
}
