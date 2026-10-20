"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Building2,
  Car,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Home,
  Landmark,
  Menu,
  Phone,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  X,
  Zap,
  CheckCircle2,
  Star,
  Award,
  Clock,
  ArrowUpRight,
  MessageCircle,
  CreditCard,
  BarChart3,
} from "lucide-react";
import EnquiryForm from "@/components/public/EnquiryForm";
import EmiCalculator from "@/components/public/EmiCalculator";
import CibilScoreChecker from "@/components/public/CibilScoreChecker";

const LOAN_PRODUCTS = [
  {
    icon: Wallet,
    image: "/images/loans/personal-loan.jpg",
    label: "Personal Loan",
    href: "/loans#personal",
    rate: "From 10.49% p.a.",
    maxAmount: "Up to ₹40 Lakhs",
    tenure: "Up to 5 Years",
    tag: "Instant Disbursal",
    color: "#3b5bdb",
    bg: "#eef2ff",
    desc: "Unsecured finance for emergency, wedding, travel, medical or debt consolidation.",
  },
  {
    icon: Building2,
    image: "/images/loans/business-loan.jpg",
    label: "Business Loan",
    href: "/loans#business",
    rate: "From 11.99% p.a.",
    maxAmount: "Up to ₹2 Crores",
    tenure: "Up to 7 Years",
    tag: "Working Capital",
    color: "#0d9488",
    bg: "#f0fdfa",
    desc: "Collateral-free business expansion, machinery purchase and operational capital.",
  },
  {
    icon: Home,
    image: "/images/loans/home-loan.jpg",
    label: "Home Loan",
    href: "/loans#home",
    rate: "From 8.40% p.a.",
    maxAmount: "Up to ₹10 Crores",
    tenure: "Up to 30 Years",
    tag: "Lowest Rates",
    color: "#e67700",
    bg: "#fff9db",
    desc: "New purchase, resale, plot construction and low-rate home loan balance transfer.",
  },
  {
    icon: Landmark,
    image: "/images/loans/property-loan.jpg",
    label: "Loan Against Property",
    href: "/loans#lap",
    rate: "From 9.25% p.a.",
    maxAmount: "Up to ₹5 Crores",
    tenure: "Up to 15 Years",
    tag: "High Value",
    color: "#c92a2a",
    bg: "#fff5f5",
    desc: "Unlock the commercial or residential property value for major funding needs.",
  },
  {
    icon: Car,
    image: "/images/loans/vehicle-loan.jpg",
    label: "Vehicle Loan",
    href: "/loans#vehicle",
    rate: "From 8.75% p.a.",
    maxAmount: "100% On-road",
    tenure: "Up to 7 Years",
    tag: "Fast Approval",
    color: "#1c7ed6",
    bg: "#e7f5ff",
    desc: "Competitive financing for new and pre-owned personal and commercial vehicles.",
  },
  {
    icon: GraduationCap,
    image: "/images/loans/education-loan.jpg",
    label: "Education Loan",
    href: "/loans#education",
    rate: "From 9.00% p.a.",
    maxAmount: "Up to ₹1.5 Crores",
    tenure: "Up to 15 Years",
    tag: "India & Abroad",
    color: "#2f9e44",
    bg: "#ebfbee",
    desc: "Comprehensive funding covering tuition, living expenses and moratorium support.",
  },
  {
    icon: Sparkles,
    image: "/images/loans/gold-loan.jpg",
    label: "Gold Loan",
    href: "/loans#gold",
    rate: "From 8.90% p.a.",
    maxAmount: "Up to ₹50 Lakhs",
    tenure: "Up to 36 Months",
    tag: "30-Min Disbursal",
    color: "#b7791f",
    bg: "#fffbeb",
    desc: "Immediate liquidity against gold ornaments with minimal documentation.",
  },
  {
    icon: TrendingUp,
    image: "/images/loans/machinery-loan.jpg",
    label: "Machinery & Equipment",
    href: "/loans#machinery",
    rate: "From 10.75% p.a.",
    maxAmount: "Up to ₹3 Crores",
    tenure: "Up to 7 Years",
    tag: "MSME Special",
    color: "#6366f1",
    bg: "#eef2ff",
    desc: "Specialized asset financing for manufacturing, healthcare and tech businesses.",
  },
];

/* ── Bank Partner Logos with verified CDN favicons & crisp vector SVGs ──────── */
interface BankPartner {
  name: string;
  logo?: string;
  svgType?: "sbi" | "federal" | "pnb" | "smfg";
  color: string;
  abbr: string;
}

const BANK_PARTNERS: BankPartner[] = [
  { name: "HDFC Bank", logo: "https://www.google.com/s2/favicons?domain=hdfcbank.com&sz=64", color: "#004B87", abbr: "HDFC" },
  { name: "State Bank of India", svgType: "sbi", color: "#0080c6", abbr: "SBI" },
  { name: "ICICI Bank", logo: "https://www.google.com/s2/favicons?domain=icicibank.com&sz=64", color: "#F37022", abbr: "ICICI" },
  { name: "Axis Bank", logo: "https://www.google.com/s2/favicons?domain=axisbank.com&sz=64", color: "#97144D", abbr: "AXIS" },
  { name: "Kotak Mahindra", logo: "https://www.google.com/s2/favicons?domain=kotak.com&sz=64", color: "#ED1C24", abbr: "KMB" },
  { name: "Bajaj Finserv", logo: "https://www.google.com/s2/favicons?domain=bajajfinserv.in&sz=64", color: "#00529B", abbr: "BAJAJ" },
  { name: "Tata Capital", logo: "https://www.google.com/s2/favicons?domain=tatacapital.com&sz=64", color: "#486AAE", abbr: "TATA" },
  { name: "PNB Housing", svgType: "pnb", color: "#A20000", abbr: "PNB" },
  { name: "Bank of Baroda", logo: "https://www.google.com/s2/favicons?domain=bankofbaroda.com&sz=64", color: "#F26522", abbr: "BOB" },
  { name: "IndusInd Bank", logo: "https://www.google.com/s2/favicons?domain=indusind.com&sz=64", color: "#8B1A2D", abbr: "IIB" },
  { name: "Yes Bank", logo: "https://www.google.com/s2/favicons?domain=yesbank.in&sz=64", color: "#0066B3", abbr: "YES" },
  { name: "IDFC First", logo: "https://www.google.com/s2/favicons?domain=idfcfirstbank.com&sz=64", color: "#9C1D26", abbr: "IDFC" },
  { name: "Federal Bank", svgType: "federal", color: "#003976", abbr: "FED" },
  { name: "Aditya Birla", logo: "https://www.google.com/s2/favicons?domain=adityabirlacapital.com&sz=64", color: "#ED1C24", abbr: "ABCL" },
  { name: "L&T Finance", logo: "https://www.google.com/s2/favicons?domain=ltfs.com&sz=64", color: "#005DAA", abbr: "L&T" },
  { name: "SMFG India Credit", svgType: "smfg", color: "#007934", abbr: "SMFG" },
];


const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Submit Quick Enquiry",
    desc: "Provide basic loan requirements in 60 seconds online. Zero initial paperwork and no impact on your credit score.",
    image: "/images/process-step-1.jpg",
    badge: "60-Sec Apply",
    highlight: "Digital & Paperless",
    icon: Zap,
  },
  {
    step: "02",
    title: "Loan Eligibility Match",
    desc: "Our senior consultant scans 35+ partner bank underwriting policies to locate your highest eligibility and lowest interest rates.",
    image: "/images/process-step-2.jpg",
    badge: "35+ Bank Scan",
    highlight: "Best Rate Discovery",
    icon: Users,
  },
  {
    step: "03",
    title: "Document Verification",
    desc: "Doorstep document pickup or swift digital upload. Dedicated advisor ensures 100% compliance before bank submission.",
    image: "/images/process-step-3.jpg",
    badge: "Doorstep / Digital",
    highlight: "Dedicated Manager",
    icon: Shield,
  },
  {
    step: "04",
    title: "Sanction & Disbursal",
    desc: "Track real-time approval stages in your customer portal until loan funds are directly disbursed to your bank account.",
    image: "/images/process-step-4.jpg",
    badge: "Fast Sanction",
    highlight: "Direct Bank Disbursal",
    icon: TrendingUp,
  },
];

const TESTIMONIALS = [
  {
    name: "Sachin Kulkarni",
    role: "IT Consultant, Pune",
    loan: "Home Loan • ₹65 Lakhs",
    rating: 5,
    text: "Birdawade Associates helped me transfer my home loan from 9.4% to 8.45%, saving me over ₹8 Lakhs in interest. Completely hassle-free guidance throughout!",
  },
  {
    name: "Dr. Ananya Deshmukh",
    role: "Clinic Director, Pimpri",
    loan: "Business Loan • ₹25 Lakhs",
    rating: 5,
    text: "Got our clinic expansion loan sanctioned within 4 business days. The team knows exactly which bank policies fit healthcare professionals.",
  },
  {
    name: "Manoj Gaikwad",
    role: "Auto Ancillary Owner, Chakan",
    loan: "Machinery Loan • ₹45 Lakhs",
    rating: 5,
    text: "Professional, transparent and zero surprise commissions. They clearly explained all processing fees before application submission.",
  },
];

const FAQS = [
  {
    q: "Is Birdawade Associates a direct lender or bank?",
    a: "No. Birdawade Associates & Financial Services is an authorized Loan Consultancy and Direct Selling Agent (DSA). We partner with leading RBI-regulated banks and NBFCs to match borrowers with the most suitable lending institutions.",
  },
  {
    q: "Are your consultancy services free for loan applicants?",
    a: "Yes! Our loan consultation, eligibility assessment, and product comparison are completely free for applicants. We receive commission directly from authorized partner lenders upon successful loan disbursement.",
  },
  {
    q: "What is the minimum CIBIL score required for a loan?",
    a: "A CIBIL score of 700+ is generally preferred for prime bank interest rates. However, we also facilitate loans with NBFC partners who consider profiles with lower CIBIL scores or past settlement history on a case-by-case basis.",
  },
  {
    q: "How accurate is the EMI calculator on your website?",
    a: "The calculator uses the official reducing-balance financial formula utilized across all Indian banks. While highly accurate for estimates, the actual final EMI depends on bank processing fees, stamp duty, insurance, and exact interest rate sanctioned.",
  },
  {
    q: "What documents are required to apply?",
    a: "Basic requirements include PAN Card, Aadhaar Card, 6 months bank statement, and income proof (last 3 salary slips for salaried, or 2 years ITR and GST returns for business owners). Your dedicated advisor will provide a tailored checklist.",
  },
  {
    q: "Can I track my application status online?",
    a: "Yes. Once your enquiry is logged, you receive a unique Reference ID. You can also log into our Customer Portal to view stage-by-stage updates, lender submissions, and sanction letters.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200/80 last:border-0 transition-colors">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group cursor-pointer"
        aria-expanded={open}
      >
        <span className="font-semibold text-slate-800 text-sm md:text-base group-hover:text-blue-700 transition-colors pr-4">
          {q}
        </span>
        <div
          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            open ? "bg-blue-100 text-blue-700 rotate-180" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
          }`}
        >
          <ChevronDown size={16} />
        </div>
      </button>
      {open && (
        <div className="pb-5 text-slate-600 text-xs md:text-sm leading-relaxed animate-fade-in pl-1">
          {a}
        </div>
      )}
    </div>
  );
}

/* ── Bank Logo Card component ────────────────────────────────────────────── */
function BankLogoCard({ bank }: { bank: BankPartner }) {
  const [imgFailed, setImgFailed] = useState(false);

  const renderLogo = () => {
    if (bank.svgType === "sbi") {
      return (
        <svg viewBox="0 0 100 100" className="w-8 h-8" aria-label="State Bank of India">
          <circle cx="50" cy="50" r="46" fill="#0080c6" />
          <circle cx="50" cy="50" r="15" fill="#ffffff" />
          <rect x="46" y="50" width="8" height="34" fill="#ffffff" />
        </svg>
      );
    }
    if (bank.svgType === "federal") {
      return (
        <svg viewBox="0 0 100 100" className="w-8 h-8" aria-label="Federal Bank">
          <rect width="100" height="100" rx="16" fill="#003976" />
          <path d="M26 28 L43 28 L43 72 L26 72 Z M57 28 L74 28 L74 72 L57 72 Z" fill="#F8B133" />
          <path d="M43 45 L57 45 L57 55 L43 55 Z" fill="#F8B133" />
        </svg>
      );
    }
    if (bank.svgType === "pnb") {
      return (
        <svg viewBox="0 0 100 100" className="w-8 h-8" aria-label="PNB Housing">
          <circle cx="50" cy="50" r="46" fill="#A20000" />
          <circle cx="50" cy="50" r="32" fill="none" stroke="#FDB913" strokeWidth="6" />
          <text x="50" y="58" textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="900" fontFamily="sans-serif">PNB</text>
        </svg>
      );
    }
    if (bank.svgType === "smfg") {
      return (
        <svg viewBox="0 0 100 100" className="w-8 h-8" aria-label="SMFG India Credit">
          <rect width="100" height="100" rx="16" fill="#007934" />
          <path d="M25 70 Q50 22 75 70" fill="none" stroke="#FDB913" strokeWidth="10" strokeLinecap="round" />
          <circle cx="50" cy="38" r="10" fill="#FDB913" />
        </svg>
      );
    }
    if (imgFailed || !bank.logo) {
      return (
        <span
          className="font-extrabold text-xs tracking-tight leading-none"
          style={{ color: bank.color }}
        >
          {bank.abbr}
        </span>
      );
    }
    return (
      <img
        src={bank.logo}
        alt={bank.name}
        className="w-8 h-8 object-contain"
        loading="lazy"
        onError={() => setImgFailed(true)}
      />
    );
  };

  return (
    <div className="flex flex-col items-center gap-2.5 px-5 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 hover:border-white/25 transition-all duration-300 shrink-0 group min-w-[120px]">
      <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-md overflow-hidden group-hover:scale-110 transition-transform">
        {renderLogo()}
      </div>
      <span className="text-[11px] font-semibold text-white/90 text-center whitespace-nowrap leading-tight">
        {bank.name}
      </span>
    </div>
  );
}


function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="container">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg border-2 border-amber-400/50 ring-2 ring-amber-400/20 group-hover:scale-105 transition-transform shrink-0 bg-slate-950">
              <Image
                src="/bafs-logo.jpg"
                alt="Birdawade Associates & Financial Services Logo"
                fill
                sizes="48px"
                className="object-cover"
                priority
              />
            </div>
            <div>
              <div className="font-extrabold text-sm md:text-base text-slate-900 tracking-tight leading-tight group-hover:text-blue-900 transition-colors">
                Birdawade Associates
              </div>
              <div className="text-[11px] text-teal-600 font-semibold tracking-wider uppercase">
                Financial Services • All Over Maharashtra
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/loans"
              className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded-lg transition-all"
            >
              Loan Products
            </Link>
            <a
              href="#calculator"
              className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded-lg transition-all"
            >
              EMI Calculator
            </a>
            <a
              href="#cibil-score"
              className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded-lg transition-all flex items-center gap-1.5"
            >
              <BarChart3 size={14} className="text-emerald-600" />
              Check CIBIL
            </a>
            <Link
              href="/consultants"
              className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded-lg transition-all flex items-center gap-1.5"
            >
              <Building2 size={14} className="text-blue-600" />
              Regional Desks
            </Link>
            <Link
              href="/about"
              className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded-lg transition-all"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded-lg transition-all"
            >
              Contact
            </Link>
            <Link
              href="/faq"
              className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded-lg transition-all"
            >
              FAQ
            </Link>
          </nav>

          {/* CTA Row */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:+919623298281"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 transition-colors"
            >
              <Phone size={13} className="text-teal-600" />
              <span>+91 96232 98281</span>
            </a>
            <Link
              href="/portal/login"
              className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 shadow-sm transition-all"
            >
              Customer Portal
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-5 py-4 space-y-2 animate-fade-in shadow-xl">
          {[
            { href: "/loans", label: "Loan Products" },
            { href: "/consultants", label: "🏢 Regional Loan Consultant Desks" },
            { href: "/#calculator", label: "EMI Calculator" },
            { href: "/#cibil-score", label: "🔍 Check CIBIL Score" },
            { href: "/about", label: "About Us" },
            { href: "/contact", label: "Contact Us" },
            { href: "/faq", label: "Frequently Asked Questions" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-2.5 px-3 rounded-lg font-semibold text-slate-800 hover:text-blue-700 hover:bg-slate-50"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <a
              href="tel:+919623298281"
              className="flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
            >
              <Phone size={14} className="text-teal-600" />
              <span>Call Advisory Desk: +91 96232 98281</span>
            </a>
            <Link
              href="/portal/login"
              className="block text-center py-2.5 rounded-xl text-xs font-bold text-white bg-blue-900"
              onClick={() => setMobileOpen(false)}
            >
              Customer Portal Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        {/* ── Hero Section with Maharashtra Financial Skyline Background ── */}
        <section className="relative overflow-hidden bg-slate-950 text-white pt-12 pb-20 lg:pt-16 lg:pb-28">
          {/* Background Image Visual with Cinematic Blend */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src="/images/hero-bg.jpg"
              alt="Maharashtra Financial District Skyline"
              className="w-full h-full object-cover object-center opacity-55 scale-105 filter saturate-125 contrast-115"
            />
            {/* Multi-layered gradient scrims to keep text crystal-clear and form crisp */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/80" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/75" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/30 via-transparent to-transparent" />
          </div>

          {/* Glowing ambient background spots */}
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/25 rounded-full blur-3xl pointer-events-none z-[1]" />
          <div className="absolute bottom-10 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none z-[1]" />

          {/* Delicate grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none z-[1]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "36px 36px",
            }}
          />

          <div className="container relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Headlines & Trust Metrics */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide bg-white/10 text-teal-300 border border-white/15 backdrop-blur-md">
                  <div className="relative w-5 h-5 rounded-full overflow-hidden border border-amber-300/60 shrink-0">
                    <Image src="/bafs-logo.jpg" alt="BAFS Logo" fill sizes="20px" className="object-cover" />
                  </div>
                  Authorized Loan Consultancy &amp; DSA • All Over Maharashtra
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
                  Get The Best Loan.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-300 to-sky-300">
                    All Over Maharashtra.
                  </span>
                  <br />
                  Zero Upfront Fees.
                </h1>

                <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                  Birdawade Associates connects salaried professionals, doctors, and business owners across all 36 districts of Maharashtra — including Pune, Mumbai, Thane, Navi Mumbai, Nashik, Chhatrapati Sambhajinagar, Nagpur, Kolhapur, and beyond — with 35+ authorized banks and NBFCs. Doorstep service and 100% free consultation.
                </p>

                {/* Hero CTAs */}
                <div className="flex flex-wrap items-center gap-3.5 pt-1">
                  <a
                    href="#enquiry"
                    className="py-3 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all flex items-center gap-2"
                  >
                    <span>Check Loan Eligibility</span>
                    <ChevronRight size={18} />
                  </a>
                  <a
                    href="#cibil-score"
                    className="py-3 px-5 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/15 border border-white/20 text-white backdrop-blur-md transition-all flex items-center gap-2"
                  >
                    <CreditCard size={16} className="text-amber-300" />
                    <span>Check CIBIL Score</span>
                  </a>
                  <a
                    href="#calculator"
                    className="py-3 px-5 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/15 border border-white/20 text-white backdrop-blur-md transition-all flex items-center gap-2"
                  >
                    <span>Calculate EMI</span>
                  </a>
                </div>

                {/* Key Numbers Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10">
                  <div>
                    <div className="text-2xl font-extrabold text-white font-mono">₹150+ Cr</div>
                    <div className="text-xs text-slate-400">Total Disbursed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-teal-300 font-mono">35+</div>
                    <div className="text-xs text-slate-400">Bank Partners</div>
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-white font-mono">36 Districts</div>
                    <div className="text-xs text-slate-400">All Over Maharashtra</div>
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-emerald-300 font-mono">4.9 / 5</div>
                    <div className="text-xs text-slate-400">Client Rating</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Enquiry Form Card */}
              <div id="enquiry" className="lg:col-span-5">
                <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 text-slate-900 relative">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-md border-2 border-amber-400/50 ring-1 ring-amber-400/20 shrink-0 bg-slate-950">
                        <Image src="/bafs-logo.jpg" alt="BAFS Gold Seal" fill sizes="48px" className="object-cover" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                          Instant Loan Consultation
                        </h2>
                        <p className="text-xs text-slate-500">
                          Get customized quotes from top banks across Maharashtra
                        </p>
                      </div>
                    </div>
                    <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 uppercase tracking-wider shrink-0">
                      Free Service
                    </span>
                  </div>

                  {/* Render the redesigned enquiry form */}
                  <EnquiryForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Partner Banks Scrolling Marquee with Logos ───────────────────── */}
        <section className="py-6 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-y border-slate-800 overflow-hidden">
          <div className="container mb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-teal-400" />
                Authorized Lending Partners
              </span>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:block">
                35+ RBI-Regulated Banks & NBFCs
              </span>
            </div>
          </div>

          {/* Infinite Scrolling Marquee */}
          <div className="relative">
            {/* Gradient fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

            <div className="overflow-hidden">
              <div className="marquee-track">
                {/* Double the logos for seamless loop */}
                {[...BANK_PARTNERS, ...BANK_PARTNERS].map((bank, i) => (
                  <BankLogoCard key={`${bank.name}-${i}`} bank={bank} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Maharashtra-Wide Coverage Banner ──────────────────────────── */}
        <section className="py-5 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white border-b border-blue-900/40">
          <div className="container">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-center lg:text-left">
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-teal-400/20 text-teal-300 flex items-center justify-center font-bold">
                  📍
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white flex items-center gap-2 justify-center lg:justify-start">
                    <span>Our Services Are Available All Over Maharashtra</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-400/20 text-teal-300 border border-teal-400/30">
                      36 Districts
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">Doorstep & Digital Document Processing Anywhere in Maharashtra</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
                {[
                  "Pune",
                  "Mumbai",
                  "Thane",
                  "Navi Mumbai",
                  "Nashik",
                  "Chh. Sambhajinagar",
                  "Nagpur",
                  "Kolhapur",
                  "Solapur",
                  "Satara",
                  "Sangli",
                  "Ahmednagar",
                  "Jalgaon",
                  "Amravati",
                  "Nanded",
                ].map((city) => (
                  <span
                    key={city}
                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-[11px] font-medium"
                  >
                    {city}
                  </span>
                ))}
                <span className="px-2.5 py-1 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-300 text-[11px] font-bold">
                  + All 36 Districts
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Loan Products Grid ────────────────────────────────────────── */}
        <section className="section bg-slate-50/70" id="loans">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200/80 inline-block mb-3">
                Tailored Financing
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                Loan Products We Facilitate
              </h2>
              <p className="text-slate-600 text-sm md:text-base">
                Whether you need urgent emergency funds, working capital for business, or your dream home mortgage, we find the lender with the lowest interest and highest eligibility.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {LOAN_PRODUCTS.map((product) => {
                const Icon = product.icon;
                return (
                  <div
                    key={product.label}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {/* ── Product Photographic Visual Banner ──────────────── */}
                      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                        <img
                          src={product.image}
                          alt={product.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        {/* Soft gradient bottom scrim for smooth visual transition */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent pointer-events-none" />

                        {/* Floating tag badge */}
                        <span
                          className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-md border border-white/40"
                          style={{ background: "rgba(255, 255, 255, 0.95)", color: product.color }}
                        >
                          {product.tag}
                        </span>

                        {/* Feature badge bottom left */}
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg backdrop-blur-md bg-black/40 border border-white/20 text-white text-[11px] font-medium">
                          <Icon size={13} className="text-teal-300" />
                          <span>{product.tenure}</span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 pb-2">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-1.5">
                          {product.label}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                          {product.desc}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Interest Rate:</span>
                          <span className="font-bold text-slate-800">{product.rate}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Max Amount:</span>
                          <span className="font-semibold text-teal-700">{product.maxAmount}</span>
                        </div>
                        <a
                          href="#enquiry"
                          className="w-full mt-2 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs hover:shadow-md"
                          style={{ background: product.bg, color: product.color }}
                        >
                          <span>Apply for {product.label}</span>
                          <ArrowUpRight size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Check CIBIL Score Section ──────────────────────────────────── */}
        <section className="section bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 border-y border-slate-200/80" id="cibil-score">
          <div className="container">
            <div className="grid lg:grid-cols-12 gap-10 items-start">
              {/* Left info column */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/80 inline-block mb-3">
                    <CreditCard size={12} className="inline mr-1.5 -mt-0.5" />
                    Credit Health
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                    Check Your CIBIL Score
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                      Instantly & Free
                    </span>
                  </h2>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Your CIBIL score is the key to unlocking the best interest rates and highest loan amounts.
                    Check your estimated credit score in 30 seconds — no impact on your credit profile.
                  </p>
                </div>

                {/* Benefits grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Shield, label: "100% Secure", desc: "256-bit SSL encrypted" },
                    { icon: Zap, label: "Instant Result", desc: "Score in 30 seconds" },
                    { icon: CheckCircle2, label: "No Impact", desc: "Soft check only" },
                    { icon: BarChart3, label: "Detailed Report", desc: "Factor breakdown" },
                  ].map((b) => {
                    const BIcon = b.icon;
                    return (
                      <div key={b.label} className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                        <BIcon size={18} className="text-blue-600 mb-2" />
                        <div className="text-xs font-bold text-slate-800">{b.label}</div>
                        <div className="text-[11px] text-slate-500">{b.desc}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Score range guide */}
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Score Range Guide</h4>
                  <div className="space-y-2">
                    {[
                      { range: "800-900", label: "Excellent", color: "#059669", desc: "Best rates available" },
                      { range: "750-799", label: "Very Good", color: "#10b981", desc: "Most banks approve" },
                      { range: "650-749", label: "Good", color: "#3b82f6", desc: "Standard rates" },
                      { range: "550-649", label: "Fair", color: "#f59e0b", desc: "NBFC options" },
                      { range: "300-549", label: "Poor", color: "#ef4444", desc: "Limited options" },
                    ].map((s) => (
                      <div key={s.range} className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                        <span className="text-xs font-bold text-slate-700 w-16">{s.range}</span>
                        <span className="text-xs font-semibold" style={{ color: s.color }}>{s.label}</span>
                        <span className="text-[11px] text-slate-400 ml-auto">{s.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right CIBIL Checker card */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 relative overflow-hidden">
                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-bl-full pointer-events-none" />

                  <CibilScoreChecker />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Interactive Live EMI Calculator Section ──────────────────── */}
        <section className="section bg-white border-y border-slate-200/80" id="calculator">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200/80 inline-block mb-3">
                Financial Planning
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                Calculate Your Monthly Loan EMI
              </h2>
              <p className="text-slate-600 text-sm">
                Adjust the loan amount, interest rate, and tenure sliders below to instantly see your repayment schedule and interest outflow.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <EmiCalculator />
            </div>
          </div>
        </section>

        {/* ── 4-Step How It Works with Visuals & Background ────────────── */}
        <section className="section relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 text-white border-y border-slate-800">
          {/* Background Ambient Glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Delicate grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="container relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold text-teal-300 uppercase tracking-widest bg-teal-500/10 px-3.5 py-1.5 rounded-full border border-teal-500/30 inline-block mb-3 backdrop-blur-md">
                Simple &amp; Transparent
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                How Our Loan Process Works
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                From initial assessment to bank account disbursal, our dedicated advisors manage all the legwork for you.
              </p>
            </div>

            <div className="relative">
              {/* Connecting roadmap dashed line for desktop */}
              <div className="hidden lg:block absolute top-20 left-[12%] right-[12%] h-0.5 border-t-2 border-dashed border-teal-400/25 pointer-events-none z-0" />

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                {HOW_IT_WORKS.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.step}
                      className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-white/10 hover:border-teal-400/40 shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1.5 transition-all duration-300 group overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        {/* Process Step Visual Image */}
                        <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                          <img
                            src={step.image}
                            alt={step.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          {/* Bottom gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent pointer-events-none" />

                          {/* Floating Step Number */}
                          <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-teal-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg">
                            {step.step}
                          </div>

                          {/* Floating Feature Badge */}
                          <div className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md bg-black/60 border border-white/20 text-teal-300 shadow-sm">
                            {step.badge}
                          </div>

                          {/* Step Icon Badge */}
                          <div className="absolute bottom-3 left-3 w-7 h-7 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-teal-300">
                            <Icon size={14} />
                          </div>
                        </div>

                        {/* Text Content */}
                        <div className="p-5 pb-3">
                          <h4 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors mb-2">
                            {step.title}
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </div>

                      {/* Bottom highlight pill */}
                      <div className="p-5 pt-0">
                        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-teal-300 font-semibold">
                          <span>{step.highlight}</span>
                          <span className="text-slate-500 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── Why Choose Birdawade Associates + Disclosure ──────────────── */}
        <section className="section bg-white">
          <div className="container">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="text-xs font-bold text-teal-700 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200/80 inline-block mb-3">
                    Why Borrowers Trust Us
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Professional Advisory.
                    <br />
                    No Pressure, No Hidden Costs.
                  </h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                      <Shield className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Transparent DSA Process</h4>
                    <p className="text-xs text-slate-500">
                      We operate under verified DSA arrangements with full fee transparency. Zero surprise charges.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
                    <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
                      <Users className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Dedicated Loan Manager</h4>
                    <p className="text-xs text-slate-500">
                      A single experienced consultant handles your application from file preparation to disbursal.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                      <Clock className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Fast Turnaround Time</h4>
                    <p className="text-xs text-slate-500">
                      Direct branch manager relationships ensure your files are picked up and cleared expeditiously.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Real-Time Online Tracking</h4>
                    <p className="text-xs text-slate-500">
                      Login to your portal anytime to check bank submission stages and documentation approvals.
                    </p>
                  </div>
                </div>
              </div>

              {/* Regulatory Disclosure Card */}
              <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-7 border border-slate-800 shadow-xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-teal-300 mb-4">
                  <Shield size={14} />
                  Regulatory Disclosure
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Important Borrower Notice</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Birdawade Associates & Financial Services is an independent loan consultancy and authorized Direct Selling Agent (DSA). We are not a bank, NBFC, or credit-granting institution.
                </p>

                <div className="space-y-2.5 text-xs text-slate-300 border-t border-white/10 pt-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>Final credit underwriting and sanction terms are decided solely by the lending institution.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>Interest rates and eligibility depend on borrower profile, credit bureau score, and bank policy.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>We do not charge any upfront file fees or commission to borrowers for consultancy.</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span>Pune Jurisdiction</span>
                  <Link href="/terms" className="text-teal-400 hover:underline">
                    View Complete Terms →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonials Section ──────────────────────────────────────── */}
        <section className="section bg-slate-50/70 border-t border-slate-200/80">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80 inline-block mb-3">
                Client Testimonials
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                Trusted by 10,000+ Borrowers
              </h2>
              <p className="text-slate-600 text-sm">
                Read how our loan advisors helped borrowers across Maharashtra secure the financing they needed.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.name}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 text-amber-400 mb-3">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} size={16} fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-4">
                      &ldquo;{t.text}&rdquo;
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{t.name}</div>
                      <div className="text-[11px] text-slate-500">{t.role}</div>
                    </div>
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                      {t.loan}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Frequently Asked Questions ─────────────────────────────────── */}
        <section className="section bg-white" id="faq">
          <div className="container-sm">
            <div className="text-center mb-10">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200/80 inline-block mb-3">
                Help & Clarifications
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-600 text-sm">
                Have questions before applying? Here is everything you need to know.
              </p>
            </div>

            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              {FAQS.map((faq) => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>

            <div className="text-center mt-6">
              <Link
                href="/faq"
                className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 hover:underline"
              >
                <span>Read all loan questions and documentation guides</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Ready to Get Started Bottom Banner ────────────────────────── */}
        <section className="section bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white">
          <div className="container-sm text-center">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Ready to Secure Your Loan with Lowest Rates?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
              Speak with a certified loan advisor today. Zero upfront fees, 100% confidential consultation, and doorstep service all over Maharashtra.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="#enquiry"
                className="py-3.5 px-7 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 shadow-lg hover:shadow-teal-400/30 transition-all flex items-center gap-2"
              >
                <span>Apply for Loan Now</span>
                <ChevronRight size={18} />
              </a>
              <a
                href="tel:+919623298281"
                className="py-3.5 px-6 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all flex items-center gap-2"
              >
                <Phone size={16} />
                <span>Call +91 96232 98281</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900">
        <div className="container py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-md border-2 border-amber-400/40 ring-1 ring-amber-400/30 shrink-0 bg-slate-950">
                  <Image
                    src="/bafs-logo.jpg"
                    alt="Birdawade Associates Logo"
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="font-extrabold text-white text-sm block">Birdawade Associates</span>
                  <span className="text-[11px] text-teal-400 font-semibold uppercase tracking-wider block">Financial Services</span>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed mb-3">
                Authorized loan consultancy and Direct Selling Agent serving all over Maharashtra. Helping borrowers find optimal loan products since 2016.
              </p>
              <div className="text-[11px] text-teal-400 font-semibold">
                RBI Compliant DSA Partner
              </div>
            </div>

            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
                Loan Products
              </h4>
              <ul className="space-y-2">
                {LOAN_PRODUCTS.slice(0, 5).map((p) => (
                  <li key={p.href}>
                    <Link href="/loans" className="hover:text-white transition-colors">
                      {p.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2">
                {[
                  { href: "/about", label: "About Us" },
                  { href: "/#calculator", label: "EMI Calculator" },
                  { href: "/#cibil-score", label: "Check CIBIL Score" },
                  { href: "/consultants", label: "Regional Desks Directory" },
                  { href: "/consultants/login", label: "Consultant Desk Login" },
                  { href: "/portal/login", label: "Customer Portal Login" },
                  { href: "/admin/login", label: "Admin CRM Portal" },
                  { href: "/contact", label: "Contact Us" },
                  { href: "/faq", label: "Frequently Asked Questions" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
                Head Office & Contact
              </h4>
              <p className="text-slate-200 font-semibold mb-1 text-xs">
                Birdawade Associate and Financial Services
              </p>
              <p className="text-slate-400 text-[11px] mb-2.5 leading-relaxed">
                <span className="text-slate-300">Founder & Principal:</span> Dilip Birdawade
                <br />
                Anant Chamber, Basement Gala No. 6,
                <br />
                Mahavir Path, Baramati, Pune,
                <br />
                Maharashtra 413102.
              </p>
              <p className="text-slate-300">
                Phone:{" "}
                <a href="tel:+919623298281" className="hover:text-teal-300 transition-colors font-medium">
                  +91 96232 98281
                </a>
              </p>
              <p className="text-slate-300">
                Email:{" "}
                <a href="mailto:birdawadeassociate@gmail.com" className="hover:text-teal-300 transition-colors font-medium">
                  birdawadeassociate@gmail.com
                </a>
              </p>

              <div className="mt-4 pt-3 border-t border-slate-900">
                <Link href="/terms" className="text-slate-400 hover:text-white mr-3">
                  Terms
                </Link>
                <Link href="/privacy" className="text-slate-400 hover:text-white">
                  Privacy
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-400">
            <p>© {new Date().getFullYear()} Birdawade Associates & Financial Services. All rights reserved.</p>
            <p>Direct Selling Agent. Not an NBFC or banking institution. Approvals subject to lender policies.</p>
          </div>
        </div>
      </footer>

      {/* ── Floating WhatsApp Quick Contact Button ─────────────────────── */}
      <a
        href="https://wa.me/919623298281?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20a%20loan%20with%20Birdawade%20Associates."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all border-2 border-white"
      >
        <MessageCircle size={24} />
      </a>
    </>
  );
}
