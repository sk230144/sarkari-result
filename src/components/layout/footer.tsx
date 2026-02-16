import Link from "next/link";
import { Briefcase, ArrowUpRight } from "lucide-react";
import { CATEGORIES, SITE_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="relative bg-slate-900 text-slate-300 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="h-10 w-10 rounded-xl gradient-hero flex items-center justify-center glow-blue">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="font-extrabold text-lg text-white">{SITE_NAME}</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Your trusted portal for government job updates, results, admit
              cards, and scholarships across India.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 glass-dark rounded-full px-3 py-1.5 text-xs text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
              Updated Daily
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-wider">
              Categories
            </h4>
            <ul className="space-y-3 text-sm">
              {CATEGORIES.map((cat) => (
                <li key={cat.value}>
                  <Link
                    href={`/jobs?category=${cat.value}`}
                    className="text-slate-400 hover:text-blue-400 hover:translate-x-1 transition-all duration-200 flex items-center gap-1 group font-medium"
                  >
                    {cat.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/jobs" className="text-slate-400 hover:text-blue-400 hover:translate-x-1 transition-all duration-200 flex items-center gap-1 group font-medium">
                  Browse All Jobs
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/jobs?sort=featured" className="text-slate-400 hover:text-blue-400 hover:translate-x-1 transition-all duration-200 flex items-center gap-1 group font-medium">
                  Featured Jobs
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/jobs?category=result" className="text-slate-400 hover:text-blue-400 hover:translate-x-1 transition-all duration-200 flex items-center gap-1 group font-medium">
                  Latest Results
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-wider">
              Why Trust Us
            </h4>
            <div className="space-y-3">
              {[
                { label: "Official Sources Only", icon: "✓" },
                { label: "100% Free Forever", icon: "₹" },
                { label: "All India Coverage", icon: "🇮🇳" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2.5 glass-dark rounded-lg px-3 py-2.5"
                >
                  <div className="h-7 w-7 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0 text-xs">
                    {item.icon}
                  </div>
                  <span className="text-xs text-slate-300 font-semibold">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SEO Content Section */}
        <div className="mt-10 pt-6 border-t border-slate-800/60">
          <h4 className="font-bold text-white mb-3 text-sm">
            Job Alerts 24 - सरकारी नौकरी अलर्ट 2025
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed mb-3">
            {SITE_NAME} is India&apos;s trusted government job portal providing latest sarkari naukri updates, sarkari result, admit cards, answer keys, syllabus and scholarship information. We cover all central and state government jobs including SSC, UPSC, Railway, Bank, Defence, Police, Teaching and more.
          </p>
          <p className="text-xs text-slate-500 leading-relaxed mb-3">
            जॉब अलर्ट्स 24 पर आपको मिलेगी सरकारी नौकरी की ताज़ा जानकारी। यहाँ आप नवीनतम सरकारी भर्ती 2025, ऑनलाइन फॉर्म, एडमिट कार्ड, आंसर की, सिलेबस और रिजल्ट की जानकारी पा सकते हैं। SSC, UPSC, रेलवे, बैंक, रक्षा विभाग, पुलिस भर्ती, शिक्षक भर्ती और राज्य सरकार की सभी नौकरियाँ एक जगह।
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              "Job Alerts 24",
              "Sarkari Result",
              "Sarkari Naukri",
              "Govt Jobs 2025",
              "सरकारी नौकरी",
              "Online Form",
              "Admit Card",
              "Answer Key",
              "Railway Jobs",
              "SSC Recruitment",
              "UPSC Jobs",
              "Bank Jobs",
              "Free Job Alert",
              "Rojgar Samachar",
            ].map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-500 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            Made with care for Indian aspirants
          </p>
        </div>
      </div>
    </footer>
  );
}
