"use client";

import { usePathname } from "next/navigation";

const isCorporate = (p: string) => p.startsWith("/corporate-jobs");

export function HeaderTagline() {
  const pathname = usePathname();
  return (
    <span className="hidden md:block text-[10px] text-slate-400 -mt-0.5 tracking-widest uppercase font-semibold">
      {isCorporate(pathname) ? "Corporate Jobs Portal" : "Govt Jobs Portal"}
    </span>
  );
}

export function MobileSheetTagline() {
  const pathname = usePathname();
  return (
    <p className="text-blue-200 text-xs mt-1.5 relative font-semibold tracking-wide">
      {isCorporate(pathname) ? "Corporate Jobs Portal" : "Government Jobs Portal"}
    </p>
  );
}

export function FooterTagline() {
  const pathname = usePathname();
  if (isCorporate(pathname)) {
    return (
      <p className="text-sm text-slate-400 leading-relaxed font-medium">
        Your trusted portal for corporate & private job listings — search LinkedIn, Naukri, Indeed, Glassdoor and more, all in one place.
      </p>
    );
  }
  return (
    <p className="text-sm text-slate-400 leading-relaxed font-medium">
      Your trusted portal for government job updates, results, admit cards, and scholarships across India.
    </p>
  );
}

export function FooterSeoSection() {
  const pathname = usePathname();
  if (isCorporate(pathname)) {
    return (
      <div className="mt-10 pt-6 border-t border-slate-800/60">
        <h4 className="font-bold text-white mb-3 text-sm">
          Job Alerts 24 - Corporate & Private Jobs Search
        </h4>
        <p className="text-xs text-slate-500 leading-relaxed mb-3">
          Search private and corporate job listings from top platforms — LinkedIn, Naukri, Indeed, Glassdoor, Internshala, Shine, and ATS portals like Workday, Greenhouse, Lever, and more — all from one place.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            "Corporate Jobs",
            "Private Jobs",
            "Software Engineer Jobs",
            "Remote Jobs India",
            "LinkedIn Jobs",
            "Naukri Jobs",
            "Indeed India",
            "Glassdoor Jobs",
            "IT Jobs",
            "MNC Jobs",
            "Work From Home",
            "Fresher Jobs",
            "Job Alerts 24",
          ].map((tag) => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-500 font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="mt-10 pt-6 border-t border-slate-800/60">
      <h4 className="font-bold text-white mb-3 text-sm">
        Job Alerts 24 - सरकारी नौकरी अलर्ट 2025
      </h4>
      <p className="text-xs text-slate-500 leading-relaxed mb-3">
        Job Alerts 24 is India&apos;s trusted government job portal providing latest sarkari naukri updates, sarkari result, admit cards, answer keys, syllabus and scholarship information. We cover all central and state government jobs including SSC, UPSC, Railway, Bank, Defence, Police, Teaching and more.
      </p>
      <p className="text-xs text-slate-500 leading-relaxed mb-3">
        जॉब अलर्ट्स 24 पर आपको मिलेगी सरकारी नौकरी की ताज़ा जानकारी। यहाँ आप नवीनतम सरकारी भर्ती 2025, ऑनलाइन फॉर्म, एडमिट कार्ड, आंसर की, सिलेबस और रिजल्ट की जानकारी पा सकते हैं।
      </p>
      <div className="flex flex-wrap gap-2 mt-3">
        {[
          "Job Alerts 24", "Sarkari Result", "Sarkari Naukri", "Govt Jobs 2025",
          "सरकारी नौकरी", "Online Form", "Admit Card", "Answer Key",
          "Railway Jobs", "SSC Recruitment", "UPSC Jobs", "Bank Jobs",
          "Free Job Alert", "Rojgar Samachar",
        ].map((tag) => (
          <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-500 font-medium">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
