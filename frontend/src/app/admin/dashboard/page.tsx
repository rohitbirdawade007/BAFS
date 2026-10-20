"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import {
  Building2,
  Users,
  Wallet,
  Landmark,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Download,
  Phone,
  MessageCircle,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  LogOut,
  Bell,
  MapPin,
  IndianRupee,
  Shield,
  Layers,
  BarChart3,
  ExternalLink,
  X,
  Check,
  Send,
  Eye,
  Edit,
  DollarSign,
  PieChart,
  CheckSquare,
  FileSpreadsheet,
  Printer,
  Award,
  Calculator,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  FileCheck,
  HelpCircle,
  Briefcase,
  Share2,
  Trash2,
  UserPlus,
  Mail,
  Edit3,
} from "lucide-react";

interface DocItem {
  name: string;
  status: "VERIFIED" | "PENDING" | "REJECTED";
  updatedAt: string;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  category: "HOME" | "BUSINESS" | "LAP" | "PERSONAL" | "VEHICLE";
  amount: number;
  district: string;
  consultant: string;
  status: "NEW" | "ASSIGNED" | "UNDERWRITING" | "SANCTIONED" | "DISBURSED";
  bank: string;
  date: string;
  income: number;
  cibil: number;
  source: string;
  interestRate?: number;
  tenureYears?: number;
  documents: DocItem[];
  notes: string[];
}

export interface ConsultantMember {
  id: string;
  name: string;
  role: string;
  region: string;
  districts: string[];
  activeFiles: number;
  disbursed: string;
  phone: string;
  email: string;
  monthlyTargetAmount: number;
  currentAchievementAmount: number;
  status: "ACTIVE" | "ON_LEAVE" | "INACTIVE";
}

const INITIAL_CONSULTANTS: ConsultantMember[] = [
  {
    id: "CNS-001",
    name: "Rajesh Shinde",
    role: "Senior Consultant",
    region: "Pune & Western Maharashtra",
    districts: ["Pune", "Satara", "Kolhapur", "Solapur", "Sangli"],
    activeFiles: 18,
    disbursed: "₹4.20 Cr",
    phone: "9623298281",
    email: "rajesh.shinde@birdawade.com",
    monthlyTargetAmount: 50000000,
    currentAchievementAmount: 42000000,
    status: "ACTIVE",
  },
  {
    id: "CNS-002",
    name: "Amit Patil",
    role: "Regional Lead",
    region: "Mumbai, Thane & Konkan",
    districts: ["Mumbai City", "Mumbai Suburban", "Thane", "Palghar", "Raigad"],
    activeFiles: 14,
    disbursed: "₹3.80 Cr",
    phone: "9822100001",
    email: "amit.patil@birdawade.com",
    monthlyTargetAmount: 40000000,
    currentAchievementAmount: 38000000,
    status: "ACTIVE",
  },
  {
    id: "CNS-003",
    name: "Snehal Deshmukh",
    role: "Senior Advisor",
    region: "Nashik & North Maharashtra",
    districts: ["Nashik", "Ahmednagar", "Jalgaon", "Dhule", "Nandurbar"],
    activeFiles: 11,
    disbursed: "₹2.90 Cr",
    phone: "9822100002",
    email: "snehal.d@birdawade.com",
    monthlyTargetAmount: 35000000,
    currentAchievementAmount: 29000000,
    status: "ACTIVE",
  },
  {
    id: "CNS-004",
    name: "Sagar Jadhav",
    role: "Regional Lead",
    region: "Marathwada & Vidarbha",
    districts: ["Chh. Sambhajinagar", "Jalna", "Nagpur", "Amravati", "Nanded"],
    activeFiles: 9,
    disbursed: "₹2.10 Cr",
    phone: "9822100003",
    email: "sagar.j@birdawade.com",
    monthlyTargetAmount: 30000000,
    currentAchievementAmount: 21000000,
    status: "ACTIVE",
  },
];

const INITIAL_LEADS: Lead[] = [
  {
    id: "BAFS-2026-8891",
    name: "Sachin Kulkarni",
    phone: "9623298281",
    category: "HOME",
    amount: 6500000,
    district: "Pune",
    consultant: "Rajesh Shinde",
    status: "UNDERWRITING",
    bank: "HDFC Bank",
    date: "19 Oct 2026",
    income: 185000,
    cibil: 772,
    source: "Website Enquiry",
    interestRate: 8.45,
    tenureYears: 20,
    documents: [
      { name: "PAN & Aadhaar Card", status: "VERIFIED", updatedAt: "16 Oct 2026" },
      { name: "Last 3 Months Salary Slips", status: "VERIFIED", updatedAt: "16 Oct 2026" },
      { name: "6 Months Bank Statement", status: "VERIFIED", updatedAt: "17 Oct 2026" },
      { name: "Property Title & Index II Search", status: "VERIFIED", updatedAt: "18 Oct 2026" },
      { name: "Seller Agreement & Draft", status: "PENDING", updatedAt: "19 Oct 2026" },
    ],
    notes: [
      "15 Oct: Initial consultation logged. Home loan balance transfer requirement.",
      "17 Oct: Property search & Index II deeds verified by legal officer.",
      "19 Oct: File submitted to HDFC Bank credit committee for 8.45% rate sanction.",
    ],
  },
  {
    id: "BAFS-2026-8890",
    name: "Dr. Ananya Deshmukh",
    phone: "9822154320",
    category: "BUSINESS",
    amount: 2500000,
    district: "Mumbai",
    consultant: "Amit Patil",
    status: "SANCTIONED",
    bank: "ICICI Bank",
    date: "19 Oct 2026",
    income: 260000,
    cibil: 790,
    source: "WhatsApp Direct",
    interestRate: 11.25,
    tenureYears: 5,
    documents: [
      { name: "Doctor Registration Certificate", status: "VERIFIED", updatedAt: "16 Oct 2026" },
      { name: "2 Years Audited ITR & CA Balance Sheet", status: "VERIFIED", updatedAt: "17 Oct 2026" },
      { name: "Clinic Lease Agreement", status: "VERIFIED", updatedAt: "17 Oct 2026" },
      { name: "Bank Statement (12 Months)", status: "VERIFIED", updatedAt: "18 Oct 2026" },
    ],
    notes: [
      "16 Oct: Clinic equipment purchase expansion enquiry.",
      "18 Oct: ICICI Bank issued formal sanction letter @ 11.25% p.a.",
      "19 Oct: Sanction note generated for client review.",
    ],
  },
  {
    id: "BAFS-2026-8889",
    name: "Manoj Gaikwad",
    phone: "9422319800",
    category: "LAP",
    amount: 4500000,
    district: "Nashik",
    consultant: "Snehal Deshmukh",
    status: "ASSIGNED",
    bank: "Axis Bank",
    date: "18 Oct 2026",
    income: 140000,
    cibil: 715,
    source: "Regional DSA Referral",
    interestRate: 9.75,
    tenureYears: 15,
    documents: [
      { name: "PAN & Aadhaar Card", status: "VERIFIED", updatedAt: "18 Oct 2026" },
      { name: "MIDC Industrial Gala 7/12 Extract", status: "PENDING", updatedAt: "18 Oct 2026" },
      { name: "Last 2 Years GST Returns", status: "VERIFIED", updatedAt: "18 Oct 2026" },
      { name: "Current Account Statement", status: "PENDING", updatedAt: "18 Oct 2026" },
    ],
    notes: [
      "18 Oct: Mortgage against industrial gala in Ambad MIDC. Valuation scheduled.",
    ],
  },
  {
    id: "BAFS-2026-8888",
    name: "Vikas Patil",
    phone: "9860123456",
    category: "PERSONAL",
    amount: 800000,
    district: "Kolhapur",
    consultant: "Rajesh Shinde",
    status: "NEW",
    bank: "Bajaj Finserv",
    date: "18 Oct 2026",
    income: 65000,
    cibil: 740,
    source: "Website Enquiry",
    interestRate: 10.99,
    tenureYears: 4,
    documents: [
      { name: "PAN Card", status: "VERIFIED", updatedAt: "18 Oct 2026" },
      { name: "Aadhaar Card", status: "VERIFIED", updatedAt: "18 Oct 2026" },
      { name: "Salary Slips (3 Months)", status: "PENDING", updatedAt: "18 Oct 2026" },
      { name: "Bank Statement (Net Banking PDF)", status: "PENDING", updatedAt: "18 Oct 2026" },
    ],
    notes: [
      "18 Oct: Emergency medical financing requirement. Urgent 24-hr turnaround requested.",
    ],
  },
  {
    id: "BAFS-2026-8887",
    name: "Prashant Shinde",
    phone: "9730554433",
    category: "BUSINESS",
    amount: 5000000,
    district: "Chh. Sambhajinagar",
    consultant: "Sagar Jadhav",
    status: "UNDERWRITING",
    bank: "Kotak Mahindra",
    date: "17 Oct 2026",
    income: 320000,
    cibil: 755,
    source: "Branch Walk-in",
    interestRate: 11.5,
    tenureYears: 5,
    documents: [
      { name: "GST Registration Certificate", status: "VERIFIED", updatedAt: "17 Oct 2026" },
      { name: "Audited Financials (3 Yrs)", status: "VERIFIED", updatedAt: "17 Oct 2026" },
      { name: "Business Bank Statements (12 Mo)", status: "VERIFIED", updatedAt: "17 Oct 2026" },
      { name: "Ownership Proof of Business Premises", status: "VERIFIED", updatedAt: "18 Oct 2026" },
    ],
    notes: [
      "17 Oct: 2 Years audited balance sheet and GST returns verified. In underwriting.",
    ],
  },
  {
    id: "BAFS-2026-8886",
    name: "Sunita More",
    phone: "9921443322",
    category: "HOME",
    amount: 3800000,
    district: "Thane",
    consultant: "Amit Patil",
    status: "DISBURSED",
    bank: "State Bank of India",
    date: "16 Oct 2026",
    income: 110000,
    cibil: 765,
    source: "Website Enquiry",
    interestRate: 8.5,
    tenureYears: 25,
    documents: [
      { name: "KYC Documents", status: "VERIFIED", updatedAt: "14 Oct 2026" },
      { name: "Salary Slips & Form 16", status: "VERIFIED", updatedAt: "14 Oct 2026" },
      { name: "Builder NOC & Allotment Letter", status: "VERIFIED", updatedAt: "15 Oct 2026" },
      { name: "Tirupati Heights Thane Disbursal Note", status: "VERIFIED", updatedAt: "16 Oct 2026" },
    ],
    notes: [
      "16 Oct: Disbursal completed via SBI Thane branch. Commission invoice generated.",
    ],
  },
  {
    id: "BAFS-2026-8885",
    name: "Ganesh Kadam",
    phone: "9850667788",
    category: "VEHICLE",
    amount: 1400000,
    district: "Solapur",
    consultant: "Sagar Jadhav",
    status: "SANCTIONED",
    bank: "HDFC Bank",
    date: "16 Oct 2026",
    income: 95000,
    cibil: 728,
    source: "WhatsApp Direct",
    interestRate: 8.9,
    tenureYears: 5,
    documents: [
      { name: "PAN & Aadhaar", status: "VERIFIED", updatedAt: "15 Oct 2026" },
      { name: "6-Month Bank Statement", status: "VERIFIED", updatedAt: "15 Oct 2026" },
      { name: "Dealership Proforma Invoice", status: "VERIFIED", updatedAt: "16 Oct 2026" },
    ],
    notes: [
      "16 Oct: Commercial vehicle sanction letter issued. Delivery order released.",
    ],
  },
  {
    id: "BAFS-2026-8884",
    name: "Rohit Jadhav",
    phone: "9823998877",
    category: "PERSONAL",
    amount: 500000,
    district: "Satara",
    consultant: "Rajesh Shinde",
    status: "NEW",
    bank: "Tata Capital",
    date: "15 Oct 2026",
    income: 48000,
    cibil: 710,
    source: "Google Search",
    interestRate: 11.2,
    tenureYears: 3,
    documents: [
      { name: "Salary Slips (3 Months)", status: "VERIFIED", updatedAt: "15 Oct 2026" },
      { name: "Aadhaar / Address Proof", status: "PENDING", updatedAt: "15 Oct 2026" },
    ],
    notes: ["15 Oct: Salary slip received for last 3 months."],
  },
];

const MAHARASHTRA_DISTRICT_STATS = [
  { region: "Western Maharashtra", district: "Pune", files: 124, sanctioned: "₹48.5 Cr", disbursed: "₹38.2 Cr", approval: "92%", leadConsultant: "Rajesh Shinde" },
  { region: "Mumbai Metropolitan", district: "Mumbai City & Suburban", files: 98, sanctioned: "₹42.0 Cr", disbursed: "₹34.5 Cr", approval: "89%", leadConsultant: "Amit Patil" },
  { region: "Mumbai Metropolitan", district: "Thane & Navi Mumbai", files: 86, sanctioned: "₹36.8 Cr", disbursed: "₹28.4 Cr", approval: "91%", leadConsultant: "Amit Patil" },
  { region: "North Maharashtra", district: "Nashik", files: 58, sanctioned: "₹22.5 Cr", disbursed: "₹18.0 Cr", approval: "88%", leadConsultant: "Snehal Deshmukh" },
  { region: "Marathwada", district: "Chhatrapati Sambhajinagar", files: 46, sanctioned: "₹18.2 Cr", disbursed: "₹14.6 Cr", approval: "86%", leadConsultant: "Sagar Jadhav" },
  { region: "Western Maharashtra", district: "Kolhapur", files: 42, sanctioned: "₹16.5 Cr", disbursed: "₹13.2 Cr", approval: "90%", leadConsultant: "Rajesh Shinde" },
  { region: "Vidarbha", district: "Nagpur", files: 38, sanctioned: "₹15.2 Cr", disbursed: "₹11.8 Cr", approval: "87%", leadConsultant: "Sagar Jadhav" },
  { region: "Western Maharashtra", district: "Solapur", files: 34, sanctioned: "₹12.8 Cr", disbursed: "₹9.9 Cr", approval: "85%", leadConsultant: "Rajesh Shinde" },
  { region: "Western Maharashtra", district: "Satara", files: 29, sanctioned: "₹11.0 Cr", disbursed: "₹8.8 Cr", approval: "89%", leadConsultant: "Rajesh Shinde" },
  { region: "North Maharashtra", district: "Ahmednagar", files: 26, sanctioned: "₹9.8 Cr", disbursed: "₹7.4 Cr", approval: "84%", leadConsultant: "Snehal Deshmukh" },
  { region: "Western Maharashtra", district: "Sangli", files: 24, sanctioned: "₹9.2 Cr", disbursed: "₹7.1 Cr", approval: "88%", leadConsultant: "Rajesh Shinde" },
  { region: "North Maharashtra", district: "Jalgaon & Dhule", files: 22, sanctioned: "₹8.4 Cr", disbursed: "₹6.5 Cr", approval: "83%", leadConsultant: "Snehal Deshmukh" },
];

const LENDER_RATES = [
  { bank: "HDFC Bank", homeRate: "8.40% - 8.95%", bizRate: "10.50% - 13.00%", lapRate: "9.25% - 11.50%", maxLtv: "90%", minCibil: 750, tatDays: "3 Days", dsaCommission: "1.45%" },
  { bank: "ICICI Bank", homeRate: "8.45% - 9.10%", bizRate: "10.75% - 13.50%", lapRate: "9.40% - 11.80%", maxLtv: "85%", minCibil: 740, tatDays: "3.5 Days", dsaCommission: "1.50%" },
  { bank: "State Bank of India (SBI)", homeRate: "8.35% - 8.85%", bizRate: "10.25% - 12.50%", lapRate: "8.95% - 10.75%", maxLtv: "90%", minCibil: 750, tatDays: "5 Days", dsaCommission: "0.95%" },
  { bank: "Kotak Mahindra Bank", homeRate: "8.50% - 9.15%", bizRate: "11.00% - 14.00%", lapRate: "9.50% - 12.00%", maxLtv: "85%", minCibil: 730, tatDays: "3 Days", dsaCommission: "1.60%" },
  { bank: "Axis Bank", homeRate: "8.55% - 9.20%", bizRate: "11.25% - 14.25%", lapRate: "9.60% - 12.25%", maxLtv: "85%", minCibil: 720, tatDays: "4 Days", dsaCommission: "1.55%" },
  { bank: "Bajaj Finserv", homeRate: "8.75% - 9.60%", bizRate: "12.00% - 16.00%", lapRate: "10.25% - 13.50%", maxLtv: "80%", minCibil: 700, tatDays: "24-48 Hrs", dsaCommission: "1.85%" },
  { bank: "Tata Capital", homeRate: "8.70% - 9.50%", bizRate: "11.75% - 15.50%", lapRate: "10.00% - 13.00%", maxLtv: "80%", minCibil: 710, tatDays: "2 Days", dsaCommission: "1.75%" },
];

export default function AdminDashboardPage() {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [consultants, setConsultants] = useState<ConsultantMember[]>(INITIAL_CONSULTANTS);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("ALL");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("ALL");
  const [districtFilter, setDistrictFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<
    "leads" | "lenders" | "commissions" | "analytics" | "team" | "eligibility"
  >("leads");

  // Multi-select bulk state
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Selected lead for detail drawer
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newNoteText, setNewNoteText] = useState("");

  // Sanction Letter Modal state
  const [sanctionLetterLead, setSanctionLetterLead] = useState<Lead | null>(null);

  // Consultant Management Modals State
  const [isConsultantModalOpen, setIsConsultantModalOpen] = useState(false);
  const [editingConsultant, setEditingConsultant] = useState<ConsultantMember | null>(null);
  const [deletingConsultant, setDeletingConsultant] = useState<ConsultantMember | null>(null);

  // Consultant Form State
  const [formConsultantName, setFormConsultantName] = useState("");
  const [formConsultantRole, setFormConsultantRole] = useState("Regional Consultant");
  const [formConsultantRegion, setFormConsultantRegion] = useState("Pune & Western Maharashtra");
  const [formConsultantPhone, setFormConsultantPhone] = useState("");
  const [formConsultantEmail, setFormConsultantEmail] = useState("");
  const [formConsultantTarget, setFormConsultantTarget] = useState("35000000");
  const [formConsultantDistricts, setFormConsultantDistricts] = useState("Pune, Satara");
  const [formConsultantStatus, setFormConsultantStatus] = useState<ConsultantMember["status"]>("ACTIVE");

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // New Lead Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadCategory, setNewLeadCategory] = useState<Lead["category"]>("PERSONAL");
  const [newLeadAmount, setNewLeadAmount] = useState("");
  const [newLeadDistrict, setNewLeadDistrict] = useState("Pune");
  const [newLeadConsultant, setNewLeadConsultant] = useState(consultants[0]?.name || "Rajesh Shinde");

  // Underwriter Eligibility Calculator State
  const [calcIncome, setCalcIncome] = useState<number>(120000);
  const [calcObligations, setCalcObligations] = useState<number>(15000);
  const [calcCibil, setCalcCibil] = useState<number>(760);
  const [calcCategory, setCalcCategory] = useState<string>("HOME");

  // Open Add Consultant Modal
  const handleOpenAddConsultant = () => {
    setEditingConsultant(null);
    setFormConsultantName("");
    setFormConsultantRole("Regional Consultant");
    setFormConsultantRegion("Pune & Western Maharashtra");
    setFormConsultantPhone("");
    setFormConsultantEmail("");
    setFormConsultantTarget("35000000");
    setFormConsultantDistricts("Pune, Satara, Kolhapur");
    setFormConsultantStatus("ACTIVE");
    setIsConsultantModalOpen(true);
  };

  // Open Edit Consultant Modal
  const handleOpenEditConsultant = (member: ConsultantMember) => {
    setEditingConsultant(member);
    setFormConsultantName(member.name);
    setFormConsultantRole(member.role);
    setFormConsultantRegion(member.region);
    setFormConsultantPhone(member.phone);
    setFormConsultantEmail(member.email);
    setFormConsultantTarget(member.monthlyTargetAmount.toString());
    setFormConsultantDistricts(member.districts.join(", "));
    setFormConsultantStatus(member.status);
    setIsConsultantModalOpen(true);
  };

  // Save Consultant (Add or Edit)
  const handleSaveConsultant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formConsultantName.trim() || !formConsultantPhone.trim()) {
      showToast("Please enter consultant name and contact number");
      return;
    }

    const districtList = formConsultantDistricts
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    const targetNum = Number(formConsultantTarget) || 30000000;

    if (editingConsultant) {
      // Modify existing consultant
      setConsultants((prev) =>
        prev.map((c) =>
          c.id === editingConsultant.id
            ? {
                ...c,
                name: formConsultantName.trim(),
                role: formConsultantRole.trim(),
                region: formConsultantRegion.trim(),
                districts: districtList,
                phone: formConsultantPhone.trim(),
                email: formConsultantEmail.trim() || `${formConsultantName.toLowerCase().replace(/\s+/g, ".")}@birdawade.com`,
                monthlyTargetAmount: targetNum,
                status: formConsultantStatus,
              }
            : c
        )
      );
      showToast(`Updated consultant desk: ${formConsultantName}`);
    } else {
      // Add new consultant
      const newId = `CNS-00${consultants.length + 1}`;
      const newMember: ConsultantMember = {
        id: newId,
        name: formConsultantName.trim(),
        role: formConsultantRole.trim(),
        region: formConsultantRegion.trim(),
        districts: districtList.length > 0 ? districtList : ["Maharashtra Region"],
        activeFiles: 0,
        disbursed: "₹0.00 Cr",
        phone: formConsultantPhone.trim(),
        email: formConsultantEmail.trim() || `${formConsultantName.toLowerCase().replace(/\s+/g, ".")}@birdawade.com`,
        monthlyTargetAmount: targetNum,
        currentAchievementAmount: 0,
        status: formConsultantStatus,
      };

      setConsultants([...consultants, newMember]);
      showToast(`Added new consultant desk officer: ${newMember.name}`);
    }

    setIsConsultantModalOpen(false);
  };

  // Confirm and Remove Consultant
  const handleConfirmDeleteConsultant = () => {
    if (!deletingConsultant) return;
    const name = deletingConsultant.name;
    setConsultants((prev) => prev.filter((c) => c.id !== deletingConsultant.id));
    setDeletingConsultant(null);
    showToast(`Removed consultant desk: ${name}`);
  };

  // Live filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchStatus =
        activeStatusFilter === "ALL" || lead.status === activeStatusFilter;
      const matchCategory =
        activeCategoryFilter === "ALL" || lead.category === activeCategoryFilter;
      const matchDistrict =
        districtFilter === "ALL" || lead.district === districtFilter;
      const matchSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery) ||
        lead.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.consultant.toLowerCase().includes(searchQuery.toLowerCase());

      return matchStatus && matchCategory && matchDistrict && matchSearch;
    });
  }, [leads, activeStatusFilter, activeCategoryFilter, districtFilter, searchQuery]);

  // Bulk row selection helpers
  const isAllSelected =
    filteredLeads.length > 0 &&
    filteredLeads.every((l) => selectedLeadIds.includes(l.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = (newStatus: Lead["status"]) => {
    if (selectedLeadIds.length === 0) return;
    setLeads((prev) =>
      prev.map((l) =>
        selectedLeadIds.includes(l.id) ? { ...l, status: newStatus } : l
      )
    );
    showToast(`Updated ${selectedLeadIds.length} selected files to ${newStatus}`);
    setSelectedLeadIds([]);
  };

  const handleBulkAssignConsultant = (consultant: string) => {
    if (selectedLeadIds.length === 0) return;
    setLeads((prev) =>
      prev.map((l) =>
        selectedLeadIds.includes(l.id) ? { ...l, consultant } : l
      )
    );
    showToast(`Assigned ${selectedLeadIds.length} files to ${consultant}`);
    setSelectedLeadIds([]);
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadPhone) return;

    const newId = `BAFS-2026-${Math.floor(8892 + Math.random() * 100)}`;
    const created: Lead = {
      id: newId,
      name: newLeadName.trim(),
      phone: newLeadPhone.trim(),
      category: newLeadCategory,
      amount: Number(newLeadAmount) || 1000000,
      district: newLeadDistrict,
      consultant: newLeadConsultant,
      status: "NEW",
      bank: "Under Evaluation",
      date: "Today",
      income: 85000,
      cibil: 730,
      source: "Branch Walk-in",
      interestRate: 9.5,
      tenureYears: 10,
      documents: [
        { name: "PAN Card", status: "PENDING", updatedAt: "Today" },
        { name: "Aadhaar Card", status: "PENDING", updatedAt: "Today" },
        { name: "Bank Statements (6 Months)", status: "PENDING", updatedAt: "Today" },
        { name: "Income Proof", status: "PENDING", updatedAt: "Today" },
      ],
      notes: [`Today: Manually logged by Admin for ${newLeadDistrict} desk.`],
    };

    setLeads([created, ...leads]);
    setIsModalOpen(false);
    setNewLeadName("");
    setNewLeadPhone("");
    setNewLeadAmount("");
    showToast(`Successfully created lead ${newId} for ${created.name}`);
  };

  const handleStatusChange = (leadId: string, newStatus: Lead["status"]) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    if (selectedLead?.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    showToast(`Updated ${leadId} status to ${newStatus}`);
  };

  const handleDocStatusToggle = (docName: string) => {
    if (!selectedLead) return;
    const nextStatusMap: Record<DocItem["status"], DocItem["status"]> = {
      PENDING: "VERIFIED",
      VERIFIED: "REJECTED",
      REJECTED: "PENDING",
    };

    const updatedDocs = selectedLead.documents.map((d) => {
      if (d.name === docName) {
        return {
          ...d,
          status: nextStatusMap[d.status],
          updatedAt: "Today",
        };
      }
      return d;
    });

    const updatedLead = { ...selectedLead, documents: updatedDocs };
    setSelectedLead(updatedLead);
    setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? updatedLead : l)));
    showToast(`Toggled ${docName} status`);
  };

  const handleSendWhatsAppDocReminder = () => {
    if (!selectedLead) return;
    const pendingDocs = selectedLead.documents.filter((d) => d.status !== "VERIFIED");
    const docList =
      pendingDocs.length > 0
        ? pendingDocs.map((d, i) => `${i + 1}. ${d.name}`).join("%0A")
        : "all initial KYC documents";

    const text = `Hello ${encodeURIComponent(
      selectedLead.name
    )}, this is Birdawade Associates & Financial Services (BAFS).%0A%0AFor processing your ${
      selectedLead.category
    } Loan application (${selectedLead.id}), please submit the following required documents:%0A${docList}%0A%0AYou can reply here with clear PDFs/photos. Thank you!`;

    window.open(`https://wa.me/91${selectedLead.phone}?text=${text}`, "_blank");
    showToast("Opened WhatsApp document reminder message");
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedLead) return;

    const timestamp =
      "Today, " +
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const fullNote = `${timestamp}: ${newNoteText.trim()}`;

    const updated = {
      ...selectedLead,
      notes: [...selectedLead.notes, fullNote],
    };

    setSelectedLead(updated);
    setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? updated : l)));
    setNewNoteText("");
    showToast("Consultant note added to dossier");
  };

  const handleExportCSV = () => {
    const leadsToExport =
      selectedLeadIds.length > 0
        ? leads.filter((l) => selectedLeadIds.includes(l.id))
        : filteredLeads;

    const headers = [
      "Application ID",
      "Customer Name",
      "Mobile",
      "District",
      "Category",
      "Requested Amount",
      "Assigned Consultant",
      "Lender Bank",
      "CIBIL Score",
      "Status",
      "Lead Source",
      "Date",
    ];

    const rows = leadsToExport.map((l) => [
      l.id,
      `"${l.name}"`,
      l.phone,
      `"${l.district}"`,
      l.category,
      l.amount,
      `"${l.consultant}"`,
      `"${l.bank}"`,
      l.cibil,
      l.status,
      `"${l.source}"`,
      l.date,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BAFS_Maharashtra_Leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${leadsToExport.length} leads to CSV`);
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Eligibility Calculation Logic (FOIR 50%-60%)
  const eligibilityResults = useMemo(() => {
    const foirMultiplier = calcCibil >= 750 ? 0.6 : 0.5;
    const maxPermissibleEmi = Math.max(0, calcIncome * foirMultiplier - calcObligations);
    const tenureMonths = calcCategory === "HOME" ? 240 : calcCategory === "LAP" ? 180 : 60;
    const ratePerMonth = (calcCategory === "HOME" ? 8.45 : calcCategory === "LAP" ? 9.5 : 12.0) / (12 * 100);

    const maxLoan =
      maxPermissibleEmi > 0
        ? Math.round(
            (maxPermissibleEmi * (1 - Math.pow(1 + ratePerMonth, -tenureMonths))) /
              ratePerMonth
          )
        : 0;

    return {
      maxPermissibleEmi,
      maxLoan,
      tenureMonths,
      ratePercent: (ratePerMonth * 12 * 100).toFixed(2),
      tier: calcCibil >= 750 ? "Prime High-Eligibility" : calcCibil >= 700 ? "Standard Eligibility" : "Sub-prime / Co-applicant Required",
    };
  }, [calcIncome, calcObligations, calcCibil, calcCategory]);

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-800">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-64 bg-slate-950 text-white shrink-0 hidden lg:flex flex-col justify-between border-r border-slate-800">
        <div>
          {/* Logo Brand Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg border-2 border-amber-400/50 shrink-0 bg-slate-900">
              <Image src="/bafs-logo.jpg" alt="BAFS Logo" fill sizes="40px" className="object-cover" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white tracking-tight leading-tight">
                Birdawade Associates
              </div>
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                Executive Admin &amp; CRM
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs">
            <button
              onClick={() => setActiveSection("leads")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activeSection === "leads"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Users size={16} />
                <span>Leads &amp; Pipeline</span>
              </div>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-mono">
                {leads.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSection("eligibility")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activeSection === "eligibility"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Calculator size={16} />
              <span>Eligibility &amp; Rates</span>
            </button>

            <button
              onClick={() => setActiveSection("lenders")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activeSection === "lenders"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Landmark size={16} />
              <span>Bank Partners (35+)</span>
            </button>

            <button
              onClick={() => setActiveSection("commissions")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activeSection === "commissions"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <DollarSign size={16} />
              <span>DSA Payouts &amp; Split</span>
            </button>

            <button
              onClick={() => setActiveSection("analytics")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activeSection === "analytics"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <BarChart3 size={16} />
              <span>Statewide Analytics</span>
            </button>

            <button
              onClick={() => setActiveSection("team")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activeSection === "team"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 size={16} />
                <span>Consultant Desks</span>
              </div>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-mono">
                {consultants.length}
              </span>
            </button>

            <div className="pt-4 pb-1 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Statewide Coverage
            </div>

            <div className="px-3 py-2.5 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 text-teal-400 font-bold">
                <MapPin size={12} />
                <span>All Over Maharashtra</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Covering all 36 districts from Pune Head Office &amp; regional desks.
              </p>
            </div>
          </nav>
        </div>

        {/* User Info & Public Site Link */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center text-xs">
              DB
            </div>
            <div>
              <div className="text-xs font-bold text-white">Dilip Birdawade</div>
              <div className="text-[10px] text-slate-400">Owner &amp; Principal</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href="/"
              target="_blank"
              className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink size={12} />
              <span>Public Website</span>
            </Link>

            <Link
              href="/admin/login"
              className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
              title="Logout"
            >
              <LogOut size={14} />
            </Link>
          </div>
        </div>
      </aside>

      {/* ── Main Dashboard Workspace ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-4">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              {activeSection === "leads" && "Maharashtra Loan Operations & CRM"}
              {activeSection === "eligibility" && "Underwriter Loan Eligibility & Rate Matrix"}
              {activeSection === "lenders" && "Bank Partners & Sanction Terms"}
              {activeSection === "commissions" && "DSA Commission Ledger & Payouts"}
              {activeSection === "analytics" && "Statewide Loan Analytics & Funnel"}
              {activeSection === "team" && "Regional Consultant Desks (Directory & Quota)"}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Pipeline Active
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {activeSection === "team" ? (
              <button
                type="button"
                onClick={handleOpenAddConsultant}
                className="py-2 px-3.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus size={14} />
                <span>Add Consultant</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Export Current Filtered Leads"
                >
                  <FileSpreadsheet size={14} className="text-emerald-700" />
                  <span className="hidden sm:inline">
                    Export {selectedLeadIds.length > 0 ? `Selected (${selectedLeadIds.length})` : "CSV"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="py-2 px-3.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>New Lead</span>
                </button>
              </>
            )}

            <Link
              href="/admin/login"
              className="lg:hidden p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              <LogOut size={16} />
            </Link>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="p-6 space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Active Loan Pipeline
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-blue-900 font-mono">
                  ₹18.45 Cr
                </div>
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-3 flex items-center gap-1">
                <TrendingUp size={13} />
                <span>+18.4% MoM across Maharashtra</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Disbursed This Month
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
                  ₹6.20 Cr
                </div>
              </div>
              <div className="text-[11px] text-slate-500 font-semibold mt-3">
                48 Successful Disbursals (36 Districts)
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Active Regional Desks
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                  {consultants.length} Desks
                </div>
              </div>
              <div className="text-[11px] text-blue-700 font-semibold mt-3">
                {consultants.filter(c => c.status === "ACTIVE").length} Officers On Duty
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  DSA Payouts Accrued
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 font-mono">
                  ₹9.45 Lakhs
                </div>
              </div>
              <div className="text-[11px] text-amber-800 font-semibold mt-3">
                Avg. Commission Rate: 1.52%
              </div>
            </div>
          </div>

          {/* ── Active Section 1: Leads & Pipeline ──────────────────────── */}
          {activeSection === "leads" && (
            <div className="space-y-4">
              {/* Quick Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "ALL", label: "All Enquiries", count: leads.length },
                  { id: "NEW", label: "New Leads", count: leads.filter((l) => l.status === "NEW").length },
                  { id: "ASSIGNED", label: "Assigned", count: leads.filter((l) => l.status === "ASSIGNED").length },
                  { id: "UNDERWRITING", label: "Underwriting", count: leads.filter((l) => l.status === "UNDERWRITING").length },
                  { id: "SANCTIONED", label: "Sanctioned", count: leads.filter((l) => l.status === "SANCTIONED").length },
                  { id: "DISBURSED", label: "Disbursed", count: leads.filter((l) => l.status === "DISBURSED").length },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setActiveStatusFilter(pill.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeStatusFilter === pill.id
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span>{pill.label}</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
                      {pill.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Floating Batch Actions Bar (Shows when items are checked) */}
              {selectedLeadIds.length > 0 && (
                <div className="bg-blue-900 text-white p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg animate-fade-in text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold font-mono">
                      {selectedLeadIds.length} Selected
                    </span>
                    <span className="font-semibold text-blue-100 hidden sm:inline">
                      Bulk actions applied to selected loan files
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleBulkStatusChange(e.target.value as Lead["status"]);
                      }}
                      defaultValue=""
                      className="px-2.5 py-1.5 rounded-xl bg-blue-950 text-white border border-blue-700 font-semibold text-xs cursor-pointer"
                    >
                      <option value="" disabled>Move Status...</option>
                      <option value="NEW">Set NEW</option>
                      <option value="ASSIGNED">Set ASSIGNED</option>
                      <option value="UNDERWRITING">Set UNDERWRITING</option>
                      <option value="SANCTIONED">Set SANCTIONED</option>
                      <option value="DISBURSED">Set DISBURSED</option>
                    </select>

                    <select
                      onChange={(e) => {
                        if (e.target.value) handleBulkAssignConsultant(e.target.value);
                      }}
                      defaultValue=""
                      className="px-2.5 py-1.5 rounded-xl bg-blue-950 text-white border border-blue-700 font-semibold text-xs cursor-pointer"
                    >
                      <option value="" disabled>Assign Desk Officer...</option>
                      {consultants.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.region.split("&")[0].trim()})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleExportCSV}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Export CSV
                    </button>

                    <button
                      onClick={() => setSelectedLeadIds([])}
                      className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-800 rounded-lg cursor-pointer"
                      title="Clear Selection"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Table Controls Bar */}
                <div className="p-4 sm:p-5 border-b border-slate-200 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
                  {/* Search box */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search applicant name, phone, ref, district, consultant..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* District Filter */}
                    <select
                      value={districtFilter}
                      onChange={(e) => setDistrictFilter(e.target.value)}
                      className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-semibold text-slate-700 cursor-pointer"
                    >
                      <option value="ALL">All Districts (Maharashtra)</option>
                      <option value="Pune">Pune</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Thane">Thane</option>
                      <option value="Nashik">Nashik</option>
                      <option value="Chh. Sambhajinagar">Chh. Sambhajinagar</option>
                      <option value="Kolhapur">Kolhapur</option>
                      <option value="Solapur">Solapur</option>
                      <option value="Satara">Satara</option>
                    </select>

                    {/* Loan Category */}
                    <select
                      value={activeCategoryFilter}
                      onChange={(e) => setActiveCategoryFilter(e.target.value)}
                      className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-semibold text-slate-700 cursor-pointer"
                    >
                      <option value="ALL">All Categories</option>
                      <option value="HOME">Home Loan</option>
                      <option value="BUSINESS">Business Loan</option>
                      <option value="PERSONAL">Personal Loan</option>
                      <option value="LAP">Loan Against Property</option>
                      <option value="VEHICLE">Vehicle Loan</option>
                    </select>
                  </div>
                </div>

                {/* CRM Leads Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-3 w-8">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={toggleSelectAll}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </th>
                        <th className="py-3 px-4">Ref &amp; Date</th>
                        <th className="py-3 px-4">Applicant Profile</th>
                        <th className="py-3 px-4">District</th>
                        <th className="py-3 px-4">Loan Requirement</th>
                        <th className="py-3 px-4">Lender / Desk</th>
                        <th className="py-3 px-4">CIBIL &amp; Docs</th>
                        <th className="py-3 px-4">Stage / Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLeads.map((lead) => {
                        const isChecked = selectedLeadIds.includes(lead.id);
                        const verifiedDocsCount = lead.documents.filter(
                          (d) => d.status === "VERIFIED"
                        ).length;

                        return (
                          <tr
                            key={lead.id}
                            className={`transition-colors group cursor-pointer ${
                              isChecked
                                ? "bg-blue-50/70"
                                : "hover:bg-blue-50/40"
                            }`}
                            onClick={() => setSelectedLead(lead)}
                          >
                            <td
                              className="py-3.5 px-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelectRow(lead.id);
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSelectRow(lead.id)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            </td>

                            <td className="py-3.5 px-4 font-mono">
                              <span className="font-bold text-blue-900 block group-hover:text-blue-700">
                                {lead.id}
                              </span>
                              <span className="text-[10px] text-slate-400">{lead.date}</span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-bold text-slate-900 block">{lead.name}</span>
                              <span className="text-slate-500 font-mono">+91 {lead.phone}</span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                                <MapPin size={12} className="text-teal-600" />
                                {lead.district}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-extrabold text-slate-900 block font-mono">
                                {formatINR(lead.amount)}
                              </span>
                              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                                {lead.category} LOAN
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-slate-800 block">{lead.bank}</span>
                              <span className="text-[10px] text-slate-500">By {lead.consultant}</span>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className={`font-mono font-bold text-xs ${
                                  lead.cibil >= 750 ? "text-emerald-700" : lead.cibil >= 700 ? "text-blue-700" : "text-amber-700"
                                }`}>
                                  {lead.cibil}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                                  {verifiedDocsCount}/{lead.documents.length} Docs
                                </span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                              <select
                                value={lead.status}
                                onChange={(e) =>
                                  handleStatusChange(lead.id, e.target.value as Lead["status"])
                                }
                                className={`px-2 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                                  lead.status === "NEW"
                                    ? "bg-blue-50 text-blue-800 border-blue-200"
                                    : lead.status === "ASSIGNED"
                                    ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                                    : lead.status === "UNDERWRITING"
                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                    : lead.status === "SANCTIONED"
                                    ? "bg-teal-50 text-teal-800 border-teal-200"
                                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                                }`}
                              >
                                <option value="NEW">NEW</option>
                                <option value="ASSIGNED">ASSIGNED</option>
                                <option value="UNDERWRITING">UNDERWRITING</option>
                                <option value="SANCTIONED">SANCTIONED</option>
                                <option value="DISBURSED">DISBURSED</option>
                              </select>
                            </td>

                            <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                {(lead.status === "SANCTIONED" || lead.status === "DISBURSED") && (
                                  <button
                                    onClick={() => setSanctionLetterLead(lead)}
                                    className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg transition-colors cursor-pointer"
                                    title="View & Print Sanction Letter"
                                  >
                                    <Printer size={14} />
                                  </button>
                                )}

                                <button
                                  onClick={() => setSelectedLead(lead)}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                                  title="View Dossier & Checklist"
                                >
                                  <Eye size={14} />
                                </button>

                                <a
                                  href={`https://wa.me/91${lead.phone}?text=Hello%20${encodeURIComponent(
                                    lead.name
                                  )}%2C%20Birdawade%20Associates%20is%20processing%20your%20loan%20file%20${lead.id}.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                                  title="Chat on WhatsApp"
                                >
                                  <MessageCircle size={14} />
                                </a>

                                <a
                                  href={`tel:+91${lead.phone}`}
                                  className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                                  title="Call Applicant"
                                >
                                  <Phone size={14} />
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Showing {filteredLeads.length} of {leads.length} Active Enquiries • Serving All Over Maharashtra (36 Districts)
                  </span>
                  <span>Select rows for batch status updates or CSV export</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Active Section 2: Underwriter Eligibility & Rate Matrix ── */}
          {activeSection === "eligibility" && (
            <div className="space-y-6">
              {/* Eligibility Calculator Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Calculator className="text-blue-600" size={18} />
                      <span>FOIR &amp; Underwriter Loan Eligibility Matrix</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Standard banking Fixed Obligation to Income Ratio (50%-60% FOIR) calculator across empaneled lenders
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-full self-start">
                    Underwriting Tool (Maharashtra Desks)
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Inputs */}
                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>Net Monthly In-Hand Income:</span>
                        <span className="font-mono text-blue-900 font-bold">{formatINR(calcIncome)}</span>
                      </div>
                      <input
                        type="range"
                        min={25000}
                        max={600000}
                        step={5000}
                        value={calcIncome}
                        onChange={(e) => setCalcIncome(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>Existing Monthly Loan Obligations / EMIs:</span>
                        <span className="font-mono text-slate-800 font-bold">{formatINR(calcObligations)}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={200000}
                        step={2000}
                        value={calcObligations}
                        onChange={(e) => setCalcObligations(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>Applicant Bureau Score (CIBIL):</span>
                        <span className={`font-mono font-bold ${
                          calcCibil >= 750 ? "text-emerald-700" : "text-amber-700"
                        }`}>{calcCibil}</span>
                      </div>
                      <input
                        type="range"
                        min={600}
                        max={850}
                        step={5}
                        value={calcCibil}
                        onChange={(e) => setCalcCibil(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {["HOME", "LAP", "BUSINESS"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCalcCategory(cat)}
                          className={`py-2 px-3 rounded-xl font-bold text-xs border transition-colors cursor-pointer ${
                            calcCategory === cat
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {cat} Loan
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calculated Output Display */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[11px] font-bold text-teal-400 uppercase tracking-widest">
                          Max Sanction Limit
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-200">
                          {eligibilityResults.tier}
                        </span>
                      </div>

                      <div className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
                        {formatINR(eligibilityResults.maxLoan)}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Based on {calcCategory === "HOME" ? "20-Year" : calcCategory === "LAP" ? "15-Year" : "5-Year"} tenure @ {eligibilityResults.ratePercent}% benchmark rate.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white/5 p-2.5 rounded-xl">
                        <span className="text-slate-400 block text-[10px]">Max Allowed EMI:</span>
                        <span className="font-mono font-bold text-white text-sm">
                          {formatINR(eligibilityResults.maxPermissibleEmi)}/mo
                        </span>
                      </div>
                      <div className="bg-white/5 p-2.5 rounded-xl">
                        <span className="text-slate-400 block text-[10px]">Recommended Match:</span>
                        <span className="font-bold text-teal-300 text-sm">
                          {calcCategory === "HOME" ? "HDFC / SBI Bank" : "ICICI / Kotak"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Bank Rate Matrix Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      Top 7 Empaneled Banks &amp; Rate Card (Maharashtra Region)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Live underwriter benchmarks for LTV, Minimum CIBIL, and Processing TAT
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Updated October 2026
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Lender Name</th>
                        <th className="py-3 px-4">Home Loan Rate</th>
                        <th className="py-3 px-4">LAP Rate</th>
                        <th className="py-3 px-4">Business Loan</th>
                        <th className="py-3 px-4">Max LTV</th>
                        <th className="py-3 px-4">Min CIBIL</th>
                        <th className="py-3 px-4">Sanction TAT</th>
                        <th className="py-3 px-4 text-right">DSA Payout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {LENDER_RATES.map((l) => (
                        <tr key={l.bank} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{l.bank}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-900">{l.homeRate}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-700">{l.lapRate}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-700">{l.bizRate}</td>
                          <td className="py-3.5 px-4 font-bold text-teal-800">{l.maxLtv}</td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">{l.minCibil}+</td>
                          <td className="py-3.5 px-4">
                            <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold text-[10px]">
                              {l.tatDays}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-700">
                            {l.dsaCommission}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Active Section 3: Bank Partners ─────────────────────────── */}
          {activeSection === "lenders" && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Authorized Bank &amp; NBFC Tie-up Performance
                  </h3>
                  <p className="text-xs text-slate-500">
                    Lending panel metrics, sanctioned volumes, and turnaround times across Maharashtra
                  </p>
                </div>
                <span className="text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full">
                  35+ Active Empaneled Lenders
                </span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    bank: "HDFC Bank",
                    type: "Prime Private Bank",
                    sanctioned: "₹7.80 Cr",
                    disbursed: "₹4.50 Cr",
                    files: 42,
                    tat: "3.2 Days",
                    commission: "1.45%",
                    focus: "Home & Business Loans",
                  },
                  {
                    bank: "ICICI Bank",
                    type: "Prime Private Bank",
                    sanctioned: "₹5.40 Cr",
                    disbursed: "₹3.20 Cr",
                    files: 35,
                    tat: "3.8 Days",
                    commission: "1.50%",
                    focus: "Home & Doctor Loans",
                  },
                  {
                    bank: "State Bank of India",
                    type: "Public Sector Bank",
                    sanctioned: "₹4.60 Cr",
                    disbursed: "₹2.90 Cr",
                    files: 28,
                    tat: "5.1 Days",
                    commission: "0.95%",
                    focus: "Home Loan Transfers",
                  },
                  {
                    bank: "Kotak Mahindra Bank",
                    type: "Private Bank",
                    sanctioned: "₹3.10 Cr",
                    disbursed: "₹1.95 Cr",
                    files: 22,
                    tat: "3.5 Days",
                    commission: "1.60%",
                    focus: "Unsecured Business",
                  },
                  {
                    bank: "Bajaj Finserv",
                    type: "NBFC / Instant",
                    sanctioned: "₹2.40 Cr",
                    disbursed: "₹1.80 Cr",
                    files: 26,
                    tat: "1.8 Days",
                    commission: "1.85%",
                    focus: "Instant Personal",
                  },
                  {
                    bank: "Tata Capital",
                    type: "NBFC",
                    sanctioned: "₹1.85 Cr",
                    disbursed: "₹1.25 Cr",
                    files: 18,
                    tat: "2.4 Days",
                    commission: "1.75%",
                    focus: "Personal & MSME",
                  },
                ].map((partner) => (
                  <div
                    key={partner.bank}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{partner.bank}</h4>
                        <span className="text-[10px] text-slate-400">{partner.type}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                        TAT: {partner.tat}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs py-2 border-y border-slate-200/80">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Sanctioned Volume:</span>
                        <span className="font-bold text-slate-900 font-mono">{partner.sanctioned}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Disbursed Amount:</span>
                        <span className="font-bold text-emerald-700 font-mono">{partner.disbursed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">DSA Commission:</span>
                        <span className="font-bold text-blue-700">{partner.commission}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Key Product Focus:</span>
                        <span className="text-slate-700 font-medium">{partner.focus}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 flex justify-between items-center">
                      <span>Active Files: <strong className="text-slate-800">{partner.files}</strong></span>
                      <span className="text-emerald-700 font-semibold text-[10px]">● Empaneled DSA</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Active Section 4: DSA Commission & Payouts ─────────────── */}
          {activeSection === "commissions" && (
            <div className="space-y-6">
              {/* Top Commission Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase">Gross Accrued Commission</span>
                  <div className="text-3xl font-extrabold text-amber-700 font-mono mt-1">₹9,45,200</div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Calculated on ₹6.20 Cr Disbursed</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase">Received from Lenders</span>
                  <div className="text-3xl font-extrabold text-emerald-700 font-mono mt-1">₹6,80,500</div>
                  <span className="text-[11px] text-emerald-600 mt-1 block">72% Cleared into BAFS Account</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase">Consultant Incentive Share</span>
                  <div className="text-3xl font-extrabold text-blue-700 font-mono mt-1">₹3,78,080</div>
                  <span className="text-[11px] text-blue-600 mt-1 block">Allocated to Active Regional Desks</span>
                </div>
              </div>

              {/* Commission Ledger Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-200">
                  <h3 className="font-extrabold text-sm text-slate-900">Disbursed File Commission Ledger</h3>
                  <p className="text-xs text-slate-500">File-level commission reconciliation with partner banks</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Ref Number</th>
                        <th className="py-3 px-4">Borrower Name</th>
                        <th className="py-3 px-4">Lender Bank</th>
                        <th className="py-3 px-4">Disbursed Capital</th>
                        <th className="py-3 px-4">DSA %</th>
                        <th className="py-3 px-4">Gross Payout</th>
                        <th className="py-3 px-4">Desk Incentive</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {[
                        { id: "BAFS-2026-8886", name: "Sunita More", bank: "State Bank of India", amount: 3800000, rate: 0.95, payout: 36100, incentive: 14440, status: "PAID" },
                        { id: "BAFS-2026-8880", name: "Kunal Shinde", bank: "HDFC Bank", amount: 5000000, rate: 1.45, payout: 72500, incentive: 29000, status: "PAID" },
                        { id: "BAFS-2026-8878", name: "Nitin Patil", bank: "Bajaj Finserv", amount: 1500000, rate: 1.85, payout: 27750, incentive: 11100, status: "PAID" },
                        { id: "BAFS-2026-8874", name: "Suresh Chavan", bank: "ICICI Bank", amount: 4200000, rate: 1.50, payout: 63000, incentive: 25200, status: "PROCESSING" },
                      ].map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-3.5 px-4 font-bold text-blue-900">{item.id}</td>
                          <td className="py-3.5 px-4 font-sans font-medium text-slate-800">{item.name}</td>
                          <td className="py-3.5 px-4 font-sans text-slate-700">{item.bank}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">{formatINR(item.amount)}</td>
                          <td className="py-3.5 px-4 text-blue-700 font-bold">{item.rate}%</td>
                          <td className="py-3.5 px-4 font-bold text-emerald-800">{formatINR(item.payout)}</td>
                          <td className="py-3.5 px-4 text-slate-600">{formatINR(item.incentive)}</td>
                          <td className="py-3.5 px-4 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === "PAID" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Active Section 5: Statewide Analytics & Maharashtra Matrix ── */}
          {activeSection === "analytics" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Conversion Funnel */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-900">Maharashtra Application Funnel</h3>
                  <div className="space-y-3 pt-2">
                    {[
                      { stage: "1. Enquiries Received", count: 342, percent: 100, color: "bg-blue-600" },
                      { stage: "2. KYC & Income Verified", count: 268, percent: 78.3, color: "bg-indigo-600" },
                      { stage: "3. Submitted to Bank Panel", count: 164, percent: 48.0, color: "bg-amber-600" },
                      { stage: "4. Sanction Letters Issued", count: 122, percent: 35.6, color: "bg-teal-600" },
                      { stage: "5. Loan Capital Disbursed", count: 96, percent: 28.1, color: "bg-emerald-600" },
                    ].map((step) => (
                      <div key={step.stage}>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-700">{step.stage}</span>
                          <span className="text-slate-900 font-mono">
                            {step.count} Files ({step.percent}%)
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`${step.color} h-full transition-all duration-500`}
                            style={{ width: `${step.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lead Acquisition Channels */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-900">Lead Acquisition Channels (ROI)</h3>
                  <div className="space-y-3 pt-2">
                    {[
                      { channel: "Website Direct Enquiry", leads: 142, share: 41.5, color: "bg-blue-600", roi: "High" },
                      { channel: "WhatsApp Helpline (+91 96232 98281)", leads: 96, share: 28.0, color: "bg-emerald-600", roi: "Very High" },
                      { channel: "Regional DSA & CA Referrals", leads: 62, share: 18.1, color: "bg-indigo-600", roi: "Medium" },
                      { channel: "Walk-in & Direct Branches", leads: 42, share: 12.4, color: "bg-amber-600", roi: "Standard" },
                    ].map((ch) => (
                      <div key={ch.channel}>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-700">{ch.channel}</span>
                          <span className="text-slate-900 font-mono font-bold">
                            {ch.leads} ({ch.share}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`${ch.color} h-full transition-all duration-500`}
                            style={{ width: `${ch.share}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* All 36 Maharashtra Districts Operations Matrix */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      Maharashtra District Performance Matrix (36 Districts Coverage)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Disbursal volumes, approval ratios, and managing consultants across Maharashtra territories
                    </p>
                  </div>
                  <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 self-start">
                    100% State Coverage
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Region</th>
                        <th className="py-3 px-4">District Hub</th>
                        <th className="py-3 px-4">Active Files</th>
                        <th className="py-3 px-4">Sanctioned Vol</th>
                        <th className="py-3 px-4">Disbursed Vol</th>
                        <th className="py-3 px-4">Approval Rate</th>
                        <th className="py-3 px-4 text-right">Lead Desk Officer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {MAHARASHTRA_DISTRICT_STATS.map((d) => (
                        <tr key={d.district} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-600">{d.region}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                            <MapPin size={13} className="text-teal-600" />
                            <span>{d.district}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-900">{d.files}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-800 font-semibold">{d.sanctioned}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{d.disbursed}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {d.approval}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                            {d.leadConsultant}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Active Section 6: Consultant Desks (CRUD Enabled) ────────── */}
          {activeSection === "team" && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Building2 className="text-blue-600" size={18} />
                    <span>Regional Loan Consultant Desks (36 Maharashtra Districts)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage consultant directory, regional assignments, contact channels, and monthly loan disbursal quotas
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddConsultant}
                  className="py-2 px-3.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <UserPlus size={14} />
                  <span>Add New Consultant</span>
                </button>
              </div>

              {/* Consultant Cards Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {consultants.map((member) => {
                  const percentAchieved = Math.min(
                    100,
                    Math.round(
                      (member.currentAchievementAmount / member.monthlyTargetAmount) * 100
                    )
                  );

                  return (
                    <div
                      key={member.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                    >
                      <div>
                        {/* Member Card Top */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                              {member.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                                {member.name}
                              </h4>
                              <div className="text-[10px] text-teal-600 font-semibold">{member.role}</div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              member.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800"
                                : member.status === "ON_LEAVE"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {member.status.replace("_", " ")}
                          </span>
                        </div>

                        {/* Region & Assigned Territory */}
                        <div className="mt-3 text-xs space-y-1.5">
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            <MapPin size={12} className="text-teal-600 shrink-0" />
                            <span className="truncate">{member.region}</span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {member.districts.slice(0, 3).map((d) => (
                              <span
                                key={d}
                                className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium"
                              >
                                {d}
                              </span>
                            ))}
                            {member.districts.length > 3 && (
                              <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                                +{member.districts.length - 3}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Contact details */}
                        <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] space-y-1 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Phone size={11} className="text-blue-600" />
                            <span className="font-mono text-slate-800">+91 {member.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Mail size={11} className="text-slate-400" />
                            <span className="truncate text-slate-600">{member.email}</span>
                          </div>
                        </div>

                        {/* Quota & Target Progress Bar */}
                        <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1.5">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">Disbursed:</span>
                            <span className="font-bold text-emerald-700 font-mono">{member.disbursed}</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Monthly Target:</span>
                            <span className="font-mono font-medium text-slate-700">
                              {formatINR(member.monthlyTargetAmount)}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full transition-all"
                              style={{ width: `${percentAchieved}%` }}
                            />
                          </div>
                          <div className="text-[10px] font-semibold text-blue-700 text-right">
                            {percentAchieved}% Quota Achieved
                          </div>
                        </div>
                      </div>

                      {/* Card Action Controls: Modify & Remove */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <a
                            href={`tel:+91${member.phone}`}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                            title="Call Consultant"
                          >
                            <Phone size={13} />
                          </a>
                          <a
                            href={`https://wa.me/91${member.phone}?text=Hello%20${encodeURIComponent(
                              member.name
                            )}%2C%20BAFS%20Head%20Office%20update.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="WhatsApp Consultant"
                          >
                            <MessageCircle size={13} />
                          </a>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditConsultant(member)}
                            className="py-1 px-2 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Edit3 size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingConsultant(member)}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors cursor-pointer"
                            title="Delete Consultant"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Slide-Over Drawer: Detailed Applicant Dossier & Document Checklist */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end animate-fade-in">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-10 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {selectedLead.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">{selectedLead.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-mono text-teal-300">{selectedLead.id}</span>
                    <span>•</span>
                    <span>{selectedLead.district}, Maharashtra</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-6">
              {/* Quick Communication Bar */}
              <div className="flex items-center gap-2">
                <a
                  href={`tel:+91${selectedLead.phone}`}
                  className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone size={14} />
                  <span>Call +91 {selectedLead.phone}</span>
                </a>
                <a
                  href={`https://wa.me/91${selectedLead.phone}?text=Hello%20${encodeURIComponent(
                    selectedLead.name
                  )}%2C%20Birdawade%20Associates%20is%20processing%20your%20loan%20file%20${selectedLead.id}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp</span>
                </a>
                {(selectedLead.status === "SANCTIONED" || selectedLead.status === "DISBURSED") && (
                  <button
                    onClick={() => setSanctionLetterLead(selectedLead)}
                    className="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer size={14} />
                    <span>Sanction Note</span>
                  </button>
                )}
              </div>

              {/* Status Selector Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">Current Pipeline Status:</span>
                  <select
                    value={selectedLead.status}
                    onChange={(e) =>
                      handleStatusChange(selectedLead.id, e.target.value as Lead["status"])
                    }
                    className="font-bold text-xs px-2.5 py-1 rounded-lg border border-slate-300 bg-white cursor-pointer"
                  >
                    <option value="NEW">NEW ENQUIRY</option>
                    <option value="ASSIGNED">ASSIGNED TO DESK</option>
                    <option value="UNDERWRITING">IN UNDERWRITING</option>
                    <option value="SANCTIONED">SANCTIONED</option>
                    <option value="DISBURSED">DISBURSED</option>
                  </select>
                </div>
              </div>

              {/* Financial & Profile Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Financial Profile</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <span className="text-slate-400 block text-[11px]">Requested Loan:</span>
                    <span className="text-base font-extrabold text-blue-900 font-mono">
                      {formatINR(selectedLead.amount)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <span className="text-slate-400 block text-[11px]">Loan Category:</span>
                    <span className="text-sm font-bold text-slate-800">{selectedLead.category} LOAN</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <span className="text-slate-400 block text-[11px]">Monthly Income:</span>
                    <span className="text-sm font-bold text-slate-800 font-mono">
                      {formatINR(selectedLead.income)}/mo
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <span className="text-slate-400 block text-[11px]">Bureau Score (CIBIL):</span>
                    <span className="text-sm font-bold text-emerald-700 font-mono">
                      {selectedLead.cibil} (Prime)
                    </span>
                  </div>
                </div>
              </div>

              {/* Document Verification Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Document Checklist ({selectedLead.documents.length})
                  </h4>
                  <button
                    onClick={handleSendWhatsAppDocReminder}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Share2 size={12} />
                    <span>WhatsApp Doc Request</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedLead.documents.map((doc) => (
                    <div
                      key={doc.name}
                      onClick={() => handleDocStatusToggle(doc.name)}
                      className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer group"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-xs text-slate-800 group-hover:text-blue-700">
                          {doc.name}
                        </div>
                        <div className="text-[10px] text-slate-400">Status verified: {doc.updatedAt}</div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          doc.status === "VERIFIED"
                            ? "bg-emerald-100 text-emerald-800"
                            : doc.status === "REJECTED"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                  ))}
                  <p className="text-[10px] text-slate-400 italic">
                    Tip: Click any document row to cycle status (Pending → Verified → Rejected).
                  </p>
                </div>
              </div>

              {/* Bank & Consultant Allocation */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Allocation &amp; Submission</h4>
                <div className="p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned Consultant:</span>
                    <span className="font-bold text-slate-900">{selectedLead.consultant}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lead District:</span>
                    <span className="font-bold text-slate-900">{selectedLead.district}, Maharashtra</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Lender Panel:</span>
                    <span className="font-bold text-blue-700">{selectedLead.bank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Acquisition Source:</span>
                    <span className="font-medium text-slate-700">{selectedLead.source}</span>
                  </div>
                </div>
              </div>

              {/* Notes Stream & Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Consultant Notes &amp; Activity Log ({selectedLead.notes.length})
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedLead.notes.map((note, nIdx) => (
                    <div key={nIdx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                      {note}
                    </div>
                  ))}
                </div>

                {/* Add new note */}
                <form onSubmit={handleAddNote} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add internal consultant note..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-mono">{selectedLead.id}</span>
              <button
                onClick={() => setSelectedLead(null)}
                className="py-1.5 px-4 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Official Sanction Letter View & Print Preview ─────── */}
      {sanctionLetterLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto animate-fade-in">
            {/* Header with Print and Close */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                Formal Loan Sanction Advice
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print Advice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSanctionLetterLead(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Official Letterhead */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-5 text-slate-800 font-sans">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-md border-2 border-amber-400">
                    <Image src="/bafs-logo.jpg" alt="BAFS Logo" fill sizes="48px" className="object-cover" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      BIRDAWADE ASSOCIATES &amp; FINANCIAL SERVICES
                    </h2>
                    <p className="text-[10px] text-slate-500">
                      Empaneled Loan Distribution &amp; Banking Advisory • Head Office: Pune, Maharashtra
                    </p>
                  </div>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-500">
                  <div>Ref: {sanctionLetterLead.id}</div>
                  <div>Date: {sanctionLetterLead.date}</div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600">To,</p>
                <p className="text-sm font-bold text-slate-900">{sanctionLetterLead.name}</p>
                <p className="text-xs text-slate-600">Mobile: +91 {sanctionLetterLead.phone}</p>
                <p className="text-xs text-slate-600">{sanctionLetterLead.district}, Maharashtra</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-xs text-blue-900 uppercase tracking-wider">
                  Subject: In-Principle Loan Sanction for {sanctionLetterLead.category} Loan
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  We are pleased to communicate that based on credit committee appraisal, your loan application has been sanctioned through our partner bank, <strong>{sanctionLetterLead.bank}</strong>, under the following terms:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Sanctioned Amount</span>
                    <span className="font-mono font-bold text-slate-900">{formatINR(sanctionLetterLead.amount)}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Interest Rate</span>
                    <span className="font-mono font-bold text-blue-900">{sanctionLetterLead.interestRate ?? 8.45}% p.a.</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Tenure</span>
                    <span className="font-bold text-slate-900">{sanctionLetterLead.tenureYears ?? 20} Years</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Lending Partner</span>
                    <span className="font-bold text-emerald-800">{sanctionLetterLead.bank}</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 space-y-1">
                <p>1. This sanction is valid for 60 calendar days from the date of issue.</p>
                <p>2. Disbursal subject to final legal &amp; technical property valuation clearance.</p>
                <p>3. Consultant in charge: {sanctionLetterLead.consultant} (Pune Head Office).</p>
              </div>

              <div className="flex justify-between items-end pt-4 border-t border-slate-200">
                <div className="text-[10px] text-slate-400">
                  Birdawade Associates • Authorized Lending Desk
                </div>
                <div className="text-right">
                  <div className="font-serif font-bold text-slate-800 text-xs italic">Dilip Birdawade</div>
                  <div className="text-[10px] text-slate-500">Authorized Signatory • Birdawade Associate and Financial Services</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Add / Modify Consultant Member ─────────────────────── */}
      {isConsultantModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Building2 className="text-blue-600" size={18} />
                <span>{editingConsultant ? "Modify Consultant Desk" : "Add New Consultant Desk"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsConsultantModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveConsultant} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Consultant Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Mane"
                  value={formConsultantName}
                  onChange={(e) => setFormConsultantName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Designation / Role
                  </label>
                  <select
                    value={formConsultantRole}
                    onChange={(e) => setFormConsultantRole(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="Senior Consultant">Senior Consultant</option>
                    <option value="Regional Lead">Regional Lead</option>
                    <option value="Senior Advisor">Senior Advisor</option>
                    <option value="Credit Underwriter">Credit Underwriter</option>
                    <option value="District Coordinator">District Coordinator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formConsultantStatus}
                    onChange={(e) =>
                      setFormConsultantStatus(e.target.value as ConsultantMember["status"])
                    }
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="ON_LEAVE">ON LEAVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Primary Region
                </label>
                <select
                  value={formConsultantRegion}
                  onChange={(e) => setFormConsultantRegion(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="Pune & Western Maharashtra">Pune &amp; Western Maharashtra</option>
                  <option value="Mumbai, Thane & Konkan">Mumbai, Thane &amp; Konkan</option>
                  <option value="Nashik & North Maharashtra">Nashik &amp; North Maharashtra</option>
                  <option value="Marathwada & Vidarbha">Marathwada &amp; Vidarbha</option>
                  <option value="Kolhapur, Sangli & Satara">Kolhapur, Sangli &amp; Satara</option>
                  <option value="Nagpur & Eastern Vidarbha">Nagpur &amp; Eastern Vidarbha</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Covered Maharashtra Districts (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pune, Satara, Kolhapur"
                  value={formConsultantDistricts}
                  onChange={(e) => setFormConsultantDistricts(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98XXXXXXXX"
                    value={formConsultantPhone}
                    onChange={(e) => setFormConsultantPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Monthly Quota (₹)
                  </label>
                  <input
                    type="number"
                    step="1000000"
                    placeholder="e.g. 40000000"
                    value={formConsultantTarget}
                    onChange={(e) => setFormConsultantTarget(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. consultant@birdawade.com"
                  value={formConsultantEmail}
                  onChange={(e) => setFormConsultantEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsConsultantModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {editingConsultant ? "Update Desk" : "Save Consultant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Confirm Delete Consultant ──────────────────────────── */}
      {deletingConsultant && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-fade-in text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 size={22} />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Remove Consultant Desk?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong>{deletingConsultant.name}</strong> ({deletingConsultant.region})? Existing loan pipeline files assigned to this desk will need to be reallocated.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingConsultant(null)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteConsultant}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Add New Offline / Walk-in Lead ────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                Log New Loan Enquiry
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Applicant Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deepak Pawar"
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="98XXXXXXXX"
                  value={newLeadPhone}
                  onChange={(e) => setNewLeadPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Loan Category
                  </label>
                  <select
                    value={newLeadCategory}
                    onChange={(e) => setNewLeadCategory(e.target.value as Lead["category"])}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="PERSONAL">Personal Loan</option>
                    <option value="HOME">Home Loan</option>
                    <option value="BUSINESS">Business Loan</option>
                    <option value="LAP">Loan Against Property</option>
                    <option value="VEHICLE">Vehicle Loan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    District (Maharashtra)
                  </label>
                  <select
                    value={newLeadDistrict}
                    onChange={(e) => setNewLeadDistrict(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="Pune">Pune</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Thane">Thane</option>
                    <option value="Nashik">Nashik</option>
                    <option value="Chh. Sambhajinagar">Chh. Sambhajinagar</option>
                    <option value="Kolhapur">Kolhapur</option>
                    <option value="Solapur">Solapur</option>
                    <option value="Satara">Satara</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Requested Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2500000"
                  value={newLeadAmount}
                  onChange={(e) => setNewLeadAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assign Consultant Desk
                </label>
                <select
                  value={newLeadConsultant}
                  onChange={(e) => setNewLeadConsultant(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none cursor-pointer"
                >
                  {consultants.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.region.split("&")[0].trim()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Toast Notification Pop-up ─────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-slide-up text-xs font-semibold">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
