"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  Phone,
  MessageCircle,
  Building2,
  CheckCircle2,
  Shield,
  Search,
  Users,
  ChevronRight,
  ExternalLink,
  Award,
  Clock,
} from "lucide-react";

interface RegionalDesk {
  id: string;
  name: string;
  role: string;
  region: string;
  leadDistrict: string;
  allDistricts: string[];
  phone: string;
  email: string;
  specialization: string[];
  disbursed: string;
  experience: string;
  avatar: string;
}

const REGIONAL_DESKS: RegionalDesk[] = [
  {
    id: "pune",
    name: "Rajesh Shinde",
    role: "Senior Consultant & Head of Desk",
    region: "Pune & Western Maharashtra",
    leadDistrict: "Pune",
    allDistricts: ["Pune", "Satara", "Kolhapur", "Sangli", "Solapur"],
    phone: "9623298281",
    email: "rajesh.shinde@birdawade.com",
    specialization: ["Home Loan Balance Transfer", "Business Working Capital", "Machinery Loans"],
    disbursed: "₹45+ Crores",
    experience: "12+ Years Banking",
    avatar: "RS",
  },
  {
    id: "mumbai",
    name: "Amit Patil",
    role: "Regional Lead & Senior Advisor",
    region: "Mumbai, Thane & Konkan",
    leadDistrict: "Mumbai Suburban",
    allDistricts: ["Mumbai City", "Mumbai Suburban", "Thane", "Palghar", "Raigad", "Ratnagiri", "Sindhudurg"],
    phone: "9822100001",
    email: "amit.patil@birdawade.com",
    specialization: ["High-Ticket LAP (up to ₹25 Cr)", "Corporate Business Loans", "NRI Home Loans"],
    disbursed: "₹65+ Crores",
    experience: "14+ Years Banking",
    avatar: "AP",
  },
  {
    id: "nashik",
    name: "Snehal Deshmukh",
    role: "Regional Lead & Agro-Commercial Specialist",
    region: "Nashik & North Maharashtra",
    leadDistrict: "Nashik",
    allDistricts: ["Nashik", "Ahmednagar", "Jalgaon", "Dhule", "Nandurbar"],
    phone: "9822100002",
    email: "snehal.d@birdawade.com",
    specialization: ["Agri-Business & Cold Storage Loans", "Industrial SME Finance", "Doctor & CA Loans"],
    disbursed: "₹38+ Crores",
    experience: "10+ Years Banking",
    avatar: "SD",
  },
  {
    id: "marathwada",
    name: "Sagar Jadhav",
    role: "Regional Lead & MSME Coordinator",
    region: "Marathwada & Vidarbha",
    leadDistrict: "Chhatrapati Sambhajinagar",
    allDistricts: [
      "Chhatrapati Sambhajinagar",
      "Nagpur",
      "Jalna",
      "Nanded",
      "Latur",
      "Beed",
      "Amravati",
      "Akola",
      "Chandrapur",
      "Parbhani",
      "Dharashiv",
      "Hingoli",
      "Washim",
      "Bhandara",
      "Wardha",
      "Gondia",
      "Gadchiroli",
      "Yavatmal",
    ],
    phone: "9822100003",
    email: "sagar.j@birdawade.com",
    specialization: ["MSME CGTMSE Scheme Loans", "Manufacturing Plant Loans", "Personal Loans"],
    disbursed: "₹32+ Crores",
    experience: "9+ Years Banking",
    avatar: "SJ",
  },
];

const MAHARASHTRA_DIVISIONS = [
  {
    division: "Pune Division",
    districts: ["Pune", "Satara", "Kolhapur", "Sangli", "Solapur"],
    deskOfficer: "Rajesh Shinde",
    deskPhone: "+91 96232 98281",
  },
  {
    division: "Konkan Division",
    districts: ["Mumbai City", "Mumbai Suburban", "Thane", "Palghar", "Raigad", "Ratnagiri", "Sindhudurg"],
    deskOfficer: "Amit Patil",
    deskPhone: "+91 98221 00001",
  },
  {
    division: "Nashik Division",
    districts: ["Nashik", "Ahmednagar", "Jalgaon", "Dhule", "Nandurbar"],
    deskOfficer: "Snehal Deshmukh",
    deskPhone: "+91 98221 00002",
  },
  {
    division: "Chh. Sambhajinagar Division",
    districts: ["Chh. Sambhajinagar", "Jalna", "Parbhani", "Hingoli", "Nanded", "Beed", "Latur", "Dharashiv"],
    deskOfficer: "Sagar Jadhav",
    deskPhone: "+91 98221 00003",
  },
  {
    division: "Vidarbha & Nagpur Division",
    districts: ["Nagpur", "Amravati", "Akola", "Buldhana", "Washim", "Yavatmal", "Wardha", "Bhandara", "Gondia", "Chandrapur", "Gadchiroli"],
    deskOfficer: "Sagar Jadhav",
    deskPhone: "+91 98221 00003",
  },
];

export default function RegionalDesksPage() {
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [searchDistrict, setSearchDistrict] = useState<string>("");

  const filteredDesks = REGIONAL_DESKS.filter((desk) => {
    const matchRegion = selectedRegion === "ALL" || desk.id === selectedRegion;
    const matchSearch =
      searchDistrict === "" ||
      desk.allDistricts.some((d) => d.toLowerCase().includes(searchDistrict.toLowerCase())) ||
      desk.name.toLowerCase().includes(searchDistrict.toLowerCase()) ||
      desk.region.toLowerCase().includes(searchDistrict.toLowerCase());
    return matchRegion && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Header */}
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
          <div className="flex items-center gap-2">
            <Link
              href="/consultants/login"
              className="py-2 px-3.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span>Consultant Login</span>
            </Link>
            <Link
              href="/portal/login"
              className="py-2 px-3.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Customer Portal
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-teal-50 text-teal-800 border border-teal-200">
            <MapPin size={13} className="text-teal-600" />
            <span>Statewide Network • All 36 Districts of Maharashtra</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Regional Loan Consultant Desks
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Connect directly with your assigned senior loan consultant. We provide doorstep document collection, policy comparison across 35+ banks, and zero upfront consultation fees throughout Maharashtra.
          </p>

          {/* District Quick Search Bar */}
          <div className="pt-2 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchDistrict}
                onChange={(e) => setSearchDistrict(e.target.value)}
                placeholder="Search your district (e.g. Pune, Nagpur, Nashik, Kolhapur)..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-xs"
              />
            </div>
          </div>

          {/* Region Filter Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              { id: "ALL", label: "All 36 Districts" },
              { id: "pune", label: "Pune & Western Maharashtra" },
              { id: "mumbai", label: "Mumbai & Konkan" },
              { id: "nashik", label: "Nashik & North Maharashtra" },
              { id: "marathwada", label: "Marathwada & Vidarbha" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedRegion(tab.id)}
                className={`py-1.5 px-3.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedRegion === tab.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Regional Desk Consultant Cards ─────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {filteredDesks.map((desk) => (
            <div
              key={desk.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-7 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-5">
                {/* Desk Officer Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      {desk.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-lg text-slate-900 leading-tight">
                          {desk.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active Desk
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-teal-700">{desk.role}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Award size={12} className="text-amber-500" />
                        <span>{desk.experience} • {desk.disbursed} Disbursed</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Region & Coverage Districts */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <MapPin size={14} className="text-blue-700 shrink-0" />
                    <span>{desk.region}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {desk.allDistricts.map((district) => (
                      <span
                        key={district}
                        className={`text-[11px] px-2.5 py-0.5 rounded-lg border font-medium ${
                          district === desk.leadDistrict
                            ? "bg-blue-100 text-blue-900 border-blue-200 font-bold"
                            : "bg-white text-slate-600 border-slate-200"
                        }`}
                      >
                        {district}
                        {district === desk.leadDistrict && " (Lead)"}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Specializations */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-700">Specializations:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {desk.specialization.map((spec) => (
                      <span
                        key={spec}
                        className="text-[11px] bg-teal-50 border border-teal-200 text-teal-800 px-2.5 py-0.5 rounded-md font-medium"
                      >
                        ✓ {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Service Promise */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    <span>Doorstep Pickup</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    <span>Zero Upfront Fee</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    <span>35+ Bank Comparison</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    <span>Direct Branch Tie-ups</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Direct Call & Direct WhatsApp */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <a
                  href={`tel:+91${desk.phone}`}
                  className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <Phone size={14} className="text-teal-300" />
                  <span>Call Desk</span>
                </a>
                <a
                  href={`https://wa.me/91${desk.phone}?text=Hi%20${encodeURIComponent(
                    desk.name
                  )}%2C%20I%20would%20like%20to%20enquire%20about%20a%20loan%20in%20${encodeURIComponent(
                    desk.leadDistrict
                  )}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp</span>
                </a>
                <Link
                  href="/#enquiry"
                  className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-xl transition-colors"
                  title="Submit Online Enquiry"
                >
                  Apply
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* ── All 36 Maharashtra Districts Directory Table ────────────────── */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Maharashtra 36 Districts Coverage Matrix
              </h2>
              <p className="text-xs text-slate-500">
                Find your district and corresponding regional desk contact for immediate loan sanction assistance
              </p>
            </div>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 self-start sm:self-auto">
              100% Maharashtra Covered
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Administrative Division</th>
                  <th className="py-3 px-4">Districts Covered</th>
                  <th className="py-3 px-4">Regional Desk Officer</th>
                  <th className="py-3 px-4 text-right">Desk Hotline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {MAHARASHTRA_DIVISIONS.map((div) => (
                  <tr key={div.division} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <Building2 size={14} className="text-blue-600" />
                      <span>{div.division}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex flex-wrap gap-1">
                        {div.districts.map((d) => (
                          <span key={d} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                            {d}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-semibold">{div.deskOfficer}</td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`tel:${div.deskPhone.replace(/\s+/g, "")}`}
                        className="font-bold text-blue-700 hover:text-blue-900 font-mono inline-flex items-center gap-1 hover:underline"
                      >
                        <Phone size={11} />
                        <span>{div.deskPhone}</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Direct Callback CTA Banner */}
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-10 shadow-xl border border-blue-900/50 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Need Doorstep Consultation in Your District?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Our regional representative will meet you at your home or workplace with full rate charts and documentation assistance.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/#enquiry"
              className="py-3 px-6 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 shadow-lg hover:shadow-teal-400/30 transition-all flex items-center gap-2"
            >
              <span>Book Appointment</span>
              <ChevronRight size={16} />
            </Link>
            <a
              href="tel:+919623298281"
              className="py-3 px-5 rounded-xl font-bold text-xs sm:text-sm bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all flex items-center gap-2"
            >
              <Phone size={14} />
              <span>Call Head Office</span>
            </a>
          </div>
        </div>

        {/* Consultant Staff Login Callout */}
        <div className="max-w-5xl mx-auto rounded-2xl bg-white border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                Are you an Appointed BAFS Regional Consultant or Field Officer?
              </div>
              <div className="text-[11px] text-slate-500">
                Log in to update applicant files, review bank sanction letters, and track monthly quotas.
              </div>
            </div>
          </div>
          <Link
            href="/consultants/login"
            className="py-2.5 px-5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            <span>Consultant Portal Sign In</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Birdawade Associates & Financial Services. All rights reserved.</p>
      </footer>
    </div>
  );
}
