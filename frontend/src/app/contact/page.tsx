"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Phone, Mail, Clock, MessageCircle, Send } from "lucide-react";
import EnquiryForm from "@/components/public/EnquiryForm";

export default function ContactPage() {
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
          <Link href="/portal/login" className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold">
            Customer Portal
          </Link>
        </div>
      </header>

      <main className="container py-12 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Contact Our Loan Advisory Team
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Have a question about an existing application or want to discuss a new loan? We are here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Office Information</h3>
              
              <div className="flex items-start gap-3 text-xs sm:text-sm">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Head Office</div>
                  <div className="text-[11px] font-bold text-blue-700 mb-0.5">Birdawade Associate and Financial Services</div>
                  <div className="text-slate-500 leading-relaxed text-xs">
                    Owner: <span className="font-semibold text-slate-800">Dilip Birdawade</span><br />
                    Anant Chamber, Basement Gala No. 6,<br />
                    Mahavir Path, Baramati, Pune,<br />
                    Maharashtra 413102.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs sm:text-sm">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Direct Helpline</div>
                  <a href="tel:+919623298281" className="text-blue-700 hover:underline font-mono font-bold">
                    +91 96232 98281
                  </a>
                  <div className="text-[11px] text-teal-600 font-medium">Mon - Sat (9:30 AM - 7:00 PM)</div>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs sm:text-sm">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Official Email</div>
                  <a href="mailto:birdawadeassociate@gmail.com" className="text-blue-700 hover:underline font-medium text-xs break-all">
                    birdawadeassociate@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Box */}
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 text-emerald-950 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm">Instant WhatsApp Support</div>
                <div className="text-xs text-emerald-800">Chat directly with a loan advisor</div>
              </div>
              <a
                href="https://wa.me/919623298281"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Start Chat
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Send Loan Enquiry</h2>
            <p className="text-xs text-slate-500 mb-6">Our senior advisor will contact you with eligible options anywhere in Maharashtra.</p>
            <EnquiryForm />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Birdawade Associates & Financial Services. All rights reserved.</p>
      </footer>
    </div>
  );
}
