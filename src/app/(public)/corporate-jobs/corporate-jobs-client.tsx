"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ExternalLink,
  Briefcase,
  Clock,
  ChevronDown,
  ChevronUp,
  Globe,
  Users,
  Crown,
  Lock,
  MapPin,
  Wifi,
  Filter,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import type { HiringProfile, HiringPost } from "@/types";

type Platform = {
  name: string;
  color: string;
  logo: string;
  getUrl: (role: string, days: string) => string;
};

const MAIN_PLATFORMS: Platform[] = [
  {
    name: "LinkedIn",
    color: "bg-[#0077B5]",
    logo: "in",
    getUrl: (role, days) => {
      const daysMap: Record<string, string> = { "1": "r86400", "3": "r259200", "7": "r604800", "30": "r2592000" };
      return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(role)}&f_TPR=${daysMap[days] || "r259200"}&f_WT=2`;
    },
  },
  {
    name: "Glassdoor",
    color: "bg-[#0caa41]",
    logo: "G",
    getUrl: (role, days) =>
      `https://www.glassdoor.co.in/Job/jobs.htm?sc.keyword=${encodeURIComponent(role)}&fromAge=${days}`,
  },
  {
    name: "Naukri",
    color: "bg-[#2c64f0]",
    logo: "N",
    getUrl: (role, days) =>
      `https://www.naukri.com/${encodeURIComponent(role.toLowerCase().replace(/\s+/g, "-"))}-jobs?jobAge=${days}`,
  },
  {
    name: "Indeed",
    color: "bg-[#003A9B]",
    logo: "I",
    getUrl: (role, days) =>
      `https://in.indeed.com/jobs?q=${encodeURIComponent(role)}&fromage=${days}`,
  },
];

const MORE_PLATFORMS: Platform[] = [
  {
    name: "Greenhouse",
    color: "bg-[#24a47f]",
    logo: "GH",
    getUrl: (role, days) => {
      const tbsMap: Record<string, string> = { "1": "qdr:d", "3": "qdr:d3", "7": "qdr:w", "30": "qdr:m" };
      return `https://www.google.com/search?q=${encodeURIComponent(`"${role}" site:greenhouse.io`)}&tbs=${tbsMap[days] || "qdr:d3"}`;
    },
  },
  {
    name: "Lever",
    color: "bg-[#1d2f54]",
    logo: "L",
    getUrl: (role, days) => {
      const tbsMap: Record<string, string> = { "1": "qdr:d", "3": "qdr:d3", "7": "qdr:w", "30": "qdr:m" };
      return `https://www.google.com/search?q=${encodeURIComponent(`"${role}" site:lever.co`)}&tbs=${tbsMap[days] || "qdr:d3"}`;
    },
  },
  {
    name: "Ashby",
    color: "bg-[#5c2d91]",
    logo: "A",
    getUrl: (role, days) => {
      const tbsMap: Record<string, string> = { "1": "qdr:d", "3": "qdr:d3", "7": "qdr:w", "30": "qdr:m" };
      return `https://www.google.com/search?q=${encodeURIComponent(`"${role}" site:ashbyhq.com`)}&tbs=${tbsMap[days] || "qdr:d3"}`;
    },
  },
  {
    name: "Remote Rocketship",
    color: "bg-[#e85d04]",
    logo: "RR",
    getUrl: (role) => `https://www.remoterocketship.com/?jobTitle=${encodeURIComponent(role)}&page=1&sort=DateAdded`,
  },
  {
    name: "Wellfound",
    color: "bg-[#0a66c2]",
    logo: "W",
    getUrl: (role, days) => {
      const tbsMap: Record<string, string> = { "1": "qdr:d", "3": "qdr:d3", "7": "qdr:w", "30": "qdr:m" };
      return `https://www.google.com/search?q=${encodeURIComponent(`"${role}" site:wellfound.com`)}&tbs=${tbsMap[days] || "qdr:d3"}`;
    },
  },
  {
    name: "Y Combinator",
    color: "bg-[#f26522]",
    logo: "YC",
    getUrl: (role) => `https://www.workatastartup.com/jobs?q=${encodeURIComponent(role)}`,
  },
  {
    name: "Workday",
    color: "bg-[#007bbd]",
    logo: "WD",
    getUrl: (role) => `https://www.myworkdayjobs.com/en-US/External?q=${encodeURIComponent(role)}`,
  },
  {
    name: "SmartRecruiters",
    color: "bg-[#00a8e0]",
    logo: "SR",
    getUrl: (role) => `https://jobs.smartrecruiters.com/?q=${encodeURIComponent(role)}`,
  },
  {
    name: "Workable",
    color: "bg-[#47a3f3]",
    logo: "WK",
    getUrl: (role) => `https://jobs.workable.com/?q=${encodeURIComponent(role)}`,
  },
  {
    name: "BreezyHR",
    color: "bg-[#3ab8a8]",
    logo: "B",
    getUrl: (role) => `https://app.breezy.hr/p?q=${encodeURIComponent(role)}`,
  },
  {
    name: "Recruitee",
    color: "bg-[#5d4de8]",
    logo: "R",
    getUrl: (role) => `https://recruitee.com/companies?q=${encodeURIComponent(role)}`,
  },
  {
    name: "Builtin",
    color: "bg-[#1a56db]",
    logo: "BI",
    getUrl: (role, days) => `https://builtin.com/jobs?search=${encodeURIComponent(role)}&datePosted=${days}`,
  },
  {
    name: "Teamtailor",
    color: "bg-[#2a2a72]",
    logo: "TT",
    getUrl: (role) => `https://career.teamtailor.com/?q=${encodeURIComponent(role)}`,
  },
  {
    name: "JazzHR",
    color: "bg-[#e74c3c]",
    logo: "JZ",
    getUrl: (role) => `https://app.jazz.co/jobs?q=${encodeURIComponent(role)}`,
  },
  {
    name: "Jobvite",
    color: "bg-[#0f4c81]",
    logo: "JV",
    getUrl: (role, days) => {
      const tbsMap: Record<string, string> = { "1": "qdr:d", "3": "qdr:d3", "7": "qdr:w", "30": "qdr:m" };
      return `https://www.google.com/search?q=${encodeURIComponent(`"${role}" site:jobvite.com`)}&tbs=${tbsMap[days] || "qdr:d3"}`;
    },
  },
  {
    name: "iCIMS",
    color: "bg-[#009bde]",
    logo: "iC",
    getUrl: (role, days) => {
      const tbsMap: Record<string, string> = { "1": "qdr:d", "3": "qdr:d3", "7": "qdr:w", "30": "qdr:m" };
      return `https://www.google.com/search?q=${encodeURIComponent(`"${role}" site:icims.com`)}&tbs=${tbsMap[days] || "qdr:d3"}`;
    },
  },
  {
    name: "Keka",
    color: "bg-[#e05b2b]",
    logo: "K",
    getUrl: (role) => `https://keka.hire.trakstar.com/?q=${encodeURIComponent(role)}`,
  },
  {
    name: "Rippling",
    color: "bg-[#ffd100]",
    logo: "RP",
    getUrl: (role, days) => {
      const tbsMap: Record<string, string> = { "1": "qdr:d", "3": "qdr:d3", "7": "qdr:w", "30": "qdr:m" };
      return `https://www.google.com/search?q=${encodeURIComponent(`"${role}" (site:rippling.com OR site:rippling-ats.com)`)}&tbs=${tbsMap[days] || "qdr:d3"}`;
    },
  },
  {
    name: "Dover",
    color: "bg-[#3d5af1]",
    logo: "D",
    getUrl: (role, days) => {
      const tbsMap: Record<string, string> = { "1": "qdr:d", "3": "qdr:d3", "7": "qdr:w", "30": "qdr:m" };
      return `https://www.google.com/search?q=${encodeURIComponent(`"${role}" site:dover.io`)}&tbs=${tbsMap[days] || "qdr:d3"}`;
    },
  },
  {
    name: "ADP",
    color: "bg-[#d4002d]",
    logo: "ADP",
    getUrl: (role, days) => {
      const tbsMap: Record<string, string> = { "1": "qdr:d", "3": "qdr:d3", "7": "qdr:w", "30": "qdr:m" };
      return `https://www.google.com/search?q=${encodeURIComponent(`"${role}" (site:workforcenow.adp.com OR site:myjobs.adp.com)`)}&tbs=${tbsMap[days] || "qdr:d3"}`;
    },
  },
];

const POPULAR_ROLES = [
  "Software Engineer", "Data Analyst", "Product Manager", "Marketing Manager",
  "HR Manager", "Business Analyst", "Java Developer", "Python Developer",
  "React Developer", "DevOps Engineer", "UI/UX Designer", "Sales Executive",
];

const DAY_OPTIONS = [
  { label: "24 Hours", value: "1" },
  { label: "3 Days", value: "3" },
  { label: "7 Days", value: "7" },
  { label: "30 Days", value: "30" },
];

const HIRING_ROLE_FILTERS = [
  "All Roles",
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "React Developer",
  "Node.js Developer",
  "Go Developer",
  "Python Developer",
  "Java Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Data Analyst",
  "Data Engineer",
  "ML Engineer",
  "Cloud Engineer",
  "iOS Developer",
  "Android Developer",
  "Flutter Developer",
  "React Native Developer",
  "UI/UX Designer",
  "Product Manager",
  "Engineering Manager",
  "QA Engineer",
  "Cybersecurity Analyst",
  "Blockchain Developer",
  "AI Engineer",
  "SRE Engineer",
  "Technical Writer",
  "Solutions Architect",
  "Sales Engineer",
];

const WORK_MODE_FILTERS = [
  { value: "all", label: "All" },
  { value: "onsite", label: "Onsite" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

const FREE_VISIBLE_COUNT = 2;

function PlatformCard({ platform, query, days }: { platform: Platform; query: string; days: string }) {
  return (
    <button
      onClick={() => window.open(platform.getUrl(query, days), "_blank", "noopener,noreferrer")}
      className="w-full flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:border-violet-300 hover:shadow-md transition-all text-left group card-elevated"
    >
      <div className={`h-11 w-11 rounded-xl ${platform.color} flex items-center justify-center shrink-0 font-black text-white text-xs shadow-sm`}>
        {platform.logo}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-extrabold text-slate-800 group-hover:text-violet-700 transition-colors">
          {platform.name}
        </p>
        <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
          &quot;{query}&quot; · Last {DAY_OPTIONS.find(d => d.value === days)?.label}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-200 group-hover:bg-violet-600 group-hover:text-white transition-colors">
          Search
        </span>
        <ExternalLink className="h-3.5 w-3.5 text-slate-300 group-hover:text-violet-500 transition-colors" />
      </div>
    </button>
  );
}

function getGoogleWideUrl(role: string, days: string) {
  const tbsMap: Record<string, string> = { "1": "qdr:d", "3": "qdr:d3", "7": "qdr:w", "30": "qdr:m" };
  const q = `"${role}" (site:*/employment/* OR site:*/opportunities/* OR site:*/openings/* OR site:*/join-us/* OR site:*/work-with-us/* OR site:*/careers/*)`;
  return `https://www.google.com/search?q=${encodeURIComponent(q)}&tbs=${tbsMap[days] || "qdr:d3"}`;
}

/* ─── Avatar gradient palette (cycles through profiles) ─── */
const AVATAR_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-indigo-500 to-blue-600",
  "from-fuchsia-500 to-violet-600",
  "from-sky-500 to-indigo-600",
];

function getGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

/* ─── Hiring Profile Card ─── */
function HiringProfileCard({
  profile,
  isBlurred,
}: {
  profile: HiringProfile;
  isBlurred: boolean;
}) {
  const gradient = getGradient(profile.profile_name);
  const initials = profile.profile_name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`relative group flex flex-col rounded-2xl border bg-white overflow-hidden transition-all duration-300 ${
        isBlurred
          ? "select-none pointer-events-none"
          : "hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10 hover:border-violet-200 border-slate-200/70 cursor-pointer"
      }`}
      style={isBlurred ? { filter: "blur(6px)", WebkitFilter: "blur(6px)" } : undefined}
      aria-hidden={isBlurred}
    >
      {/* Top color strip */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />

      <div className="p-5 flex flex-col items-center text-center gap-3 flex-1">
        {/* Avatar */}
        <div className="relative">
          <div
            className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-105 transition-transform duration-300`}
          >
            {initials}
          </div>
          {/* Online dot */}
          <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-400 border-2 border-white shadow-sm" />
        </div>

        {/* Name */}
        <div>
          <p className="text-sm font-extrabold text-slate-800 leading-tight">
            {profile.profile_name}
          </p>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Actively Hiring</p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
            <Briefcase className="h-3 w-3" />
            {profile.role_hiring}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
              profile.work_mode === "remote"
                ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                : profile.work_mode === "hybrid"
                ? "text-amber-700 bg-amber-50 border-amber-100"
                : "text-slate-600 bg-slate-50 border-slate-200"
            }`}
          >
            {profile.work_mode === "remote" ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <MapPin className="h-3 w-3" />
            )}
            {profile.work_mode.charAt(0).toUpperCase() + profile.work_mode.slice(1)}
          </span>
        </div>

        {/* CTA Button */}
        <a
          href={profile.profile_link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2.5 rounded-xl hover:from-violet-700 hover:to-blue-700 transition-all shadow-md shadow-violet-500/20 group-hover:shadow-violet-500/30"
          tabIndex={isBlurred ? -1 : 0}
        >
          View Profile
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

/* ─── Image Lightbox ─── */
function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const [scale, setScale] = useState(1);

  const zoomIn = useCallback(() => setScale((s) => Math.min(s + 0.4, 4)), []);
  const zoomOut = useCallback(() => setScale((s) => Math.max(s - 0.4, 0.4)), []);
  const reset = useCallback(() => setScale(1), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
      if (e.key === "0") reset();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, zoomIn, zoomOut, reset]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/90 flex flex-col"
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-white/70 text-sm font-semibold truncate max-w-xs">{alt}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            title="Zoom out (−)"
          >
            <ZoomOut className="h-4 w-4 text-white" />
          </button>
          <span className="text-white/60 text-xs font-bold w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            title="Zoom in (+)"
          >
            <ZoomIn className="h-4 w-4 text-white" />
          </button>
          <button
            onClick={reset}
            className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            title="Reset (0)"
          >
            <Maximize2 className="h-3.5 w-3.5 text-white" />
          </button>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-white/10 hover:bg-red-500/80 flex items-center justify-center transition-colors ml-1"
            title="Close (Esc)"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Image area — scrollable when zoomed */}
      <div
        className="flex-1 overflow-auto flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            transition: "transform 0.2s ease",
            maxWidth: "100%",
            cursor: scale > 1 ? "move" : "zoom-in",
          }}
          onClick={() => scale < 4 ? zoomIn() : reset()}
          draggable={false}
        />
      </div>

      {/* Bottom hint */}
      <div className="text-center py-2 shrink-0">
        <p className="text-white/30 text-xs">Click image to zoom · Esc to close · +/− to zoom</p>
      </div>
    </div>
  );
}

/* ─── Email highlighter ─── */
const EMAIL_REGEX = /([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g;

function renderWithEmails(text: string): React.ReactNode {
  const parts = text.split(EMAIL_REGEX);
  return parts.map((part, i) =>
    EMAIL_REGEX.test(part) ? (
      <a
        key={i}
        href={`mailto:${part}`}
        className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5 hover:bg-emerald-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        ✉ {part}
      </a>
    ) : (
      part
    )
  );
}

/* ─── Main Component ─── */
export function CorporateJobsClient({
  hiringProfiles,
  hiringPosts,
  hasFullAccess,
  activeTab,
}: {
  hiringProfiles: HiringProfile[];
  hiringPosts: HiringPost[];
  hasFullAccess: boolean;
  activeTab: "search" | "hiring";
}) {
  const [hiringSubTab, setHiringSubTab] = useState<"posts" | "profiles">("posts");
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const [role, setRole] = useState("");
  const [days, setDays] = useState("3");
  const [showMore, setShowMore] = useState(false);

  // Hiring filters
  const [hiringRoleFilter, setHiringRoleFilter] = useState("All Roles");
  const [hiringWorkModeFilter, setHiringWorkModeFilter] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const query = role.trim() || "Software Engineer";

  function handleSearchAll() {
    MAIN_PLATFORMS.forEach((p) =>
      window.open(p.getUrl(query, days), "_blank", "noopener,noreferrer")
    );
  }

  const filteredProfiles = useMemo(() => {
    return hiringProfiles.filter((p) => {
      if (hiringRoleFilter !== "All Roles" && p.role_hiring !== hiringRoleFilter) return false;
      if (hiringWorkModeFilter !== "all" && p.work_mode !== hiringWorkModeFilter) return false;
      return true;
    });
  }, [hiringProfiles, hiringRoleFilter, hiringWorkModeFilter]);

  // All unique tags across posts for filter chips
  const allPostTags = useMemo(() => {
    const set = new Set<string>();
    hiringPosts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [hiringPosts]);

  const filteredPosts = useMemo(() => {
    if (selectedTags.length === 0) return hiringPosts;
    return hiringPosts.filter((p) =>
      selectedTags.some((tag) => p.tags.includes(tag))
    );
  }, [hiringPosts, selectedTags]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  return (
    <div className="min-h-screen page-bg">
      {/* Lightbox */}
      {lightboxImage && (
        <ImageLightbox
          src={lightboxImage.src}
          alt={lightboxImage.alt}
          onClose={() => setLightboxImage(null)}
        />
      )}
      <div className="page-bg-orb w-[400px] h-[400px] bg-blue-200/[0.08] top-[5%] -left-[10%] animate-float-slow" />
      <div className="page-bg-orb w-[350px] h-[350px] bg-violet-200/[0.07] top-[50%] -right-[8%] animate-float-delayed" />

      {/* Hero */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        </div>
        <div className="relative container mx-auto px-4 py-6 md:py-8 text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-3">
            <Briefcase className="h-3.5 w-3.5 text-amber-300" />
            <span className="text-white/90 text-xs font-bold">Corporate Job Search</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Private Jobs एक जगह खोजें
          </h1>
          <p className="mt-2 text-blue-100/80 text-sm max-w-xl mx-auto font-medium">
            LinkedIn, Glassdoor, Naukri, Indeed & more — सभी पर एक साथ search करें
          </p>

          {/* Tabs */}
          <div className="mt-5 inline-flex items-center bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/10">
            <Link
              href="/corporate-jobs"
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "search"
                  ? "bg-white text-slate-800 shadow-md"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <Search className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
              Job Search
            </Link>
            <Link
              href="/corporate-jobs/hiring"
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "hiring"
                  ? "bg-white text-slate-800 shadow-md"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <Users className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
              Who&apos;s Hiring
              {(hiringProfiles.length + hiringPosts.length) > 0 && (
                <span className="ml-1.5 bg-amber-400 text-amber-900 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {hiringProfiles.length + hiringPosts.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Tab: Job Search ─── */}
      {activeTab === "search" && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6 max-w-5xl mx-auto">
            {/* Sidebar */}
            <div className="w-full md:w-72 shrink-0">
              <div className="card-elevated bg-white rounded-2xl border border-slate-200/60 p-5 space-y-5 md:sticky md:top-4">
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Search className="h-3.5 w-3.5 text-violet-500" />
                    Job Title / Role
                  </label>
                  <Input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Software Engineer..."
                    className="h-10 text-sm font-medium border-slate-200 focus:border-violet-400"
                    onKeyDown={(e) => e.key === "Enter" && handleSearchAll()}
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {POPULAR_ROLES.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRole(r)}
                        className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold transition-colors ${
                          role === r
                            ? "bg-violet-600 text-white border-violet-600"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-violet-500" />
                    Posted Within
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {DAY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setDays(opt.value)}
                        className={`py-2 rounded-lg border text-xs font-bold transition-colors text-center ${
                          days === opt.value
                            ? "bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-500/30"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleSearchAll}
                  className="w-full h-10 gradient-purple text-white font-black text-sm border-0 shadow-lg shadow-violet-500/25 shine"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search Top 4
                </Button>

                <p className="text-[11px] text-slate-400 font-medium text-center">
                  सभी platforms new tab में खुलेंगी
                </p>
              </div>
            </div>

            {/* Right — Platform Cards */}
            <div className="flex-1 space-y-3">
              <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Platform चुनें — {query} · Last {DAY_OPTIONS.find(d => d.value === days)?.label}
              </h2>

              {/* Google Wide Search — Top Card */}
              <button
                onClick={() => window.open(getGoogleWideUrl(query, days), "_blank", "noopener,noreferrer")}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-linear-to-r from-blue-50 to-violet-50 border-2 border-violet-200 hover:border-violet-400 hover:shadow-md transition-all text-left group"
              >
                <div className="h-11 w-11 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-slate-200">
                  <Globe className="h-5 w-5 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-violet-800 group-hover:text-violet-900">
                    Search Across All Career Pages
                  </p>
                  <p className="text-xs text-violet-500 font-medium mt-0.5">
                    Google पर सभी company career pages में &quot;{query}&quot; खोजें
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-white bg-violet-600 px-2.5 py-1 rounded-lg group-hover:bg-violet-700 transition-colors">
                    Search
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-violet-400 group-hover:text-violet-600 transition-colors" />
                </div>
              </button>

              {/* Main 4 */}
              {MAIN_PLATFORMS.map((platform) => (
                <PlatformCard key={platform.name} platform={platform} query={query} days={days} />
              ))}

              {/* More Platforms toggle */}
              <button
                onClick={() => setShowMore(!showMore)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-violet-300 text-slate-500 hover:text-violet-600 font-bold text-sm transition-colors"
              >
                {showMore ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    +{MORE_PLATFORMS.length} More Platforms
                  </>
                )}
              </button>

              {showMore && (
                <div className="space-y-3">
                  <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">More Platforms</p>
                  {MORE_PLATFORMS.map((platform) => (
                    <PlatformCard key={platform.name} platform={platform} query={query} days={days} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─── Tab: Who's Hiring ─── */}
      {activeTab === "hiring" && (
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-5">

            {/* Sub-tabs: Posts | Profiles */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
              <button
                onClick={() => setHiringSubTab("posts")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  hiringSubTab === "posts"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" />
                Hiring Posts
                {hiringPosts.length > 0 && (
                  <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    {hiringPosts.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setHiringSubTab("profiles")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  hiringSubTab === "profiles"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                Hiring Profiles
                {hiringProfiles.length > 0 && (
                  <span className="bg-violet-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    100+
                  </span>
                )}
              </button>
            </div>

            {/* ── SUB-TAB: Hiring Posts ── */}
            {hiringSubTab === "posts" && (
              <div className="space-y-4">
                {/* Tag filter chips */}
                {allPostTags.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200/60 p-4 card-elevated">
                    <div className="flex items-center gap-2 mb-3">
                      <Filter className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Filter by Tag</span>
                      {selectedTags.length > 0 && (
                        <button onClick={() => setSelectedTags([])} className="ml-auto text-xs font-bold text-slate-400 hover:text-slate-600">
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {allPostTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-all ${
                            selectedTags.includes(tag)
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-700"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-xs font-bold text-slate-400">
                    {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"}
                    {selectedTags.length > 0 && ` · filtered`}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    New posts added regularly
                  </span>
                </div>

                {filteredPosts.length === 0 ? (
                  <div className="text-center py-16">
                    <Briefcase className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                    <p className="font-bold text-slate-500">No posts found</p>
                    <p className="text-sm text-slate-400 mt-1">Try removing some filters</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPosts.map((post, idx) => {
                      const isLocked = !hasFullAccess && idx >= 3;
                      return (
                        <div
                          key={post.id}
                          className={`relative bg-white rounded-2xl border border-slate-200/60 overflow-hidden card-elevated transition-all hover:border-emerald-200 hover:shadow-md`}
                        >
                          {/* Lock overlay for non-premium */}
                          {isLocked && (
                            <div className="absolute inset-0 backdrop-blur-sm bg-white/80 rounded-2xl z-10 flex items-center justify-center">
                              <div className="text-center px-4">
                                <div className="h-10 w-10 rounded-xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-2">
                                  <Lock className="h-5 w-5 text-white" />
                                </div>
                                <p className="text-sm font-extrabold text-slate-800">Premium Only</p>
                                <Link href="/membership">
                                  <Button size="sm" className="mt-2 gradient-purple text-white font-black border-0 text-xs">
                                    Unlock All Posts
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          )}

                          {/* Image — full width, click to open lightbox */}
                          {post.image_url && (
                            <div className="relative group cursor-zoom-in" onClick={() => !isLocked && setLightboxImage({ src: post.image_url!, alt: post.title })}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={post.image_url}
                                alt={post.title}
                                className="w-full object-contain max-h-96 bg-slate-50"
                              />
                              {!isLocked && (
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-full p-2">
                                    <ZoomIn className="h-5 w-5 text-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Card body */}
                          <div className="p-4 space-y-2.5">
                            {/* Header row */}
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-extrabold text-slate-800">{post.title}</p>
                                {post.company_name && (
                                  <p className="text-xs font-semibold text-slate-500 mt-0.5">{post.company_name}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {!isLocked && (
                                  <Link
                                    href={`/hiring-posts/${post.id}`}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full hover:bg-emerald-100 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <ExternalLink className="h-2.5 w-2.5" />
                                    Share
                                  </Link>
                                )}
                              </div>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit ${
                              post.work_mode === "remote" ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                              : post.work_mode === "hybrid" ? "text-amber-700 bg-amber-50 border border-amber-200"
                              : "text-slate-600 bg-slate-100 border border-slate-200"
                            }`}>
                              {post.work_mode.charAt(0).toUpperCase() + post.work_mode.slice(1)}
                            </span>

                            {/* Full description with email detection */}
                            {post.description && (
                              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {renderWithEmails(post.description)}
                              </p>
                            )}

                            {/* Tags */}
                            {post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {post.tags.map((tag) => (
                                  <span key={tag} className="text-[10px] font-bold bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full border border-violet-100">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Bottom CTA for non-premium users */}
                    {!hasFullAccess && filteredPosts.length > 3 && (
                      <div className="text-center py-4">
                        <Link href="/membership">
                          <Button className="gradient-purple text-white font-black border-0 shadow-lg shadow-violet-500/25 shine">
                            <Crown className="h-4 w-4 mr-2" />
                            Unlock All {filteredPosts.length} Posts — Get Premium
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── SUB-TAB: Hiring Profiles ── */}
            {hiringSubTab === "profiles" && (
              <div className="space-y-4">
                {/* Filters */}
                <div className="bg-white rounded-2xl border border-slate-200/60 p-4 card-elevated">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="h-4 w-4 text-violet-500" />
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Filters</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">Role</label>
                      <select
                        value={hiringRoleFilter}
                        onChange={(e) => setHiringRoleFilter(e.target.value)}
                        className="w-full h-9 text-sm font-medium border border-slate-200 rounded-lg px-3 bg-slate-50 focus:bg-white focus:border-violet-400 focus:outline-none transition-colors"
                      >
                        {HIRING_ROLE_FILTERS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 sm:max-w-[180px]">
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">Work Mode</label>
                      <select
                        value={hiringWorkModeFilter}
                        onChange={(e) => setHiringWorkModeFilter(e.target.value)}
                        className="w-full h-9 text-sm font-medium border border-slate-200 rounded-lg px-3 bg-slate-50 focus:bg-white focus:border-violet-400 focus:outline-none transition-colors"
                      >
                        {WORK_MODE_FILTERS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-xs font-bold text-slate-400">
                    {filteredProfiles.length} {filteredProfiles.length === 1 ? "person" : "people"} hiring
                    {hiringRoleFilter !== "All Roles" && ` for ${hiringRoleFilter}`}
                    {hiringWorkModeFilter !== "all" && ` · ${hiringWorkModeFilter}`}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    New profiles adding daily
                  </span>
                </div>

                {filteredProfiles.length === 0 ? (
                  <div className="text-center py-16">
                    <Users className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                    <p className="font-bold text-slate-500">No profiles found</p>
                    <p className="text-sm text-slate-400 mt-1">Try changing your filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProfiles.slice(0, FREE_VISIBLE_COUNT).map((profile) => (
                      <HiringProfileCard key={profile.id} profile={profile} isBlurred={false} />
                    ))}
                    {filteredProfiles.length > FREE_VISIBLE_COUNT && (
                      <>
                        {hasFullAccess ? (
                          filteredProfiles.slice(FREE_VISIBLE_COUNT).map((profile) => (
                            <HiringProfileCard key={profile.id} profile={profile} isBlurred={false} />
                          ))
                        ) : (
                          <div className="relative col-span-2 sm:col-span-3 lg:col-span-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" aria-hidden="true">
                              {filteredProfiles.slice(FREE_VISIBLE_COUNT, FREE_VISIBLE_COUNT + 4).map((profile) => (
                                <HiringProfileCard key={profile.id} profile={profile} isBlurred={true} />
                              ))}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                              <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-violet-200 p-6 text-center shadow-xl shadow-violet-500/10 max-w-sm mx-4">
                                <div className="h-12 w-12 rounded-xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/30">
                                  <Crown className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-lg font-extrabold text-slate-800">Premium Access Required</h3>
                                <p className="text-sm text-slate-500 mt-1.5 mb-4">Unlock 100+ hiring profiles with a premium membership</p>
                                <Link href="/membership">
                                  <Button className="w-full gradient-purple text-white font-black border-0 shadow-lg shadow-violet-500/25 shine">
                                    <Lock className="h-4 w-4 mr-2" />
                                    Show Full List — Get Premium
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </section>
      )}
    </div>
  );
}
