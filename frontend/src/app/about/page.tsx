"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield, Users, Award, CheckCircle2, ChevronRight, MapPin, Phone, Mail } from "lucide-react";

export default function AboutPage() {
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
            Contact Us
          </Link>
        </div>
      </header>

      <main className="container py-12 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            About Our Firm
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Birdawade Associates & Financial Services
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
            Trusted loan consultancy and Direct Selling Agent (DSA) serving all over Maharashtra. Headquartered in Pune and guiding families, salaried professionals, and entrepreneurs across all 36 districts since 2016.
          </p>
        </div>

        {/* Leadership & Corporate Office */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
            <div>
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Leadership
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">Principal Leadership & Management</h2>
            </div>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 self-start sm:self-auto">
              Authorised DSA & Loan Advisory
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-md">
                  DB
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 leading-tight">Dilip Birdawade</h3>
                  <div className="text-xs font-semibold text-blue-700">Owner & Principal Consultant</div>
                  <div className="text-[11px] text-slate-500 font-medium">Birdawade Associate and Financial Services</div>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                Under Dilip Birdawade&apos;s visionary stewardship, the consultancy has facilitated over ₹150+ Crores in sanctions across 35+ prime banking partners, upholding deep client trust and ethical lending counsel all over Maharashtra.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">Registered Office:</div>
              <div className="flex items-start gap-2.5 text-slate-700">
                <MapPin size={15} className="text-blue-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Birdawade Associate and Financial Services</strong><br />
                  Anant Chamber, Basement Gala No. 6,<br />
                  Mahavir Path, Baramati, Pune,<br />
                  Maharashtra 413102.
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 pt-1 border-t border-slate-200">
                <Phone size={14} className="text-teal-600 shrink-0" />
                <a href="tel:+919623298281" className="font-mono font-bold text-blue-700 hover:underline">
                  +91 96232 98281
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Mail size={14} className="text-indigo-600 shrink-0" />
                <a href="mailto:birdawadeassociate@gmail.com" className="font-medium text-blue-700 hover:underline break-all">
                  birdawadeassociate@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Mission and Vision */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Our Mission</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To democratize access to transparent, fair, and customized financing for every eligible borrower across Maharashtra, removing confusion and hidden charges from the lending process.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Our Commitment</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We uphold strict adherence to Reserve Bank of India (RBI) Direct Selling Agent compliance standards, customer data confidentiality, and 100% upfront transparency in all lender agreements.
            </p>
          </div>
        </div>

        {/* Key Milestones */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Our Track Record at a Glance</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-2xl font-extrabold text-blue-900 font-mono">₹150+ Cr</div>
              <div className="text-xs text-slate-500 mt-1">Total Loan Disbursals</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-2xl font-extrabold text-teal-700 font-mono">35+</div>
              <div className="text-xs text-slate-500 mt-1">Bank & NBFC Tie-ups</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-2xl font-extrabold text-indigo-700 font-mono">10,000+</div>
              <div className="text-xs text-slate-500 mt-1">Applications Assisted</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-2xl font-extrabold text-emerald-700 font-mono">8+ Years</div>
              <div className="text-xs text-slate-500 mt-1">Industry Experience</div>
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
