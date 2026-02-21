import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { Shield, Zap, Heart, Users, BookOpen, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us - Job Alerts 24 | India's Free Govt Job Portal",
  description:
    "Job Alerts 24 is a free Indian government job portal providing latest sarkari naukri, results, admit cards, answer keys, and free tools like resume builder. Learn about our mission.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen page-bg">
      <div className="page-bg-orb w-[400px] h-[400px] bg-blue-200/[0.07] top-[10%] -right-[10%] animate-float-slow" />
      <div className="page-bg-orb w-[300px] h-[300px] bg-indigo-200/[0.06] bottom-[20%] -left-[8%] animate-float-delayed" />

      <div className="container mx-auto px-4 py-10 max-w-3xl relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3">
            About{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Job Alerts 24
            </span>
          </h1>
          <p className="text-slate-500 text-base font-medium max-w-xl mx-auto">
            India&apos;s free government job portal — built for every aspirant,
            available 24/7.
          </p>
        </div>

        {/* Mission */}
        <div className="card-3d bg-white rounded-xl border border-slate-200/60 p-6 sm:p-8 mb-6">
          <h2 className="text-xl font-extrabold text-slate-800 mb-3">
            Our Mission
          </h2>
          <p className="text-slate-600 leading-relaxed font-medium">
            <strong>Job Alerts 24</strong> was created with one goal — to make
            government job information freely accessible to every Indian
            aspirant. Lakhs of students prepare for SSC, UPSC, Railways,
            Banking, and State Govt exams every year. We ensure they never miss
            a notification, result, admit card, or answer key.
          </p>
          <p className="text-slate-600 leading-relaxed font-medium mt-3">
            We are a team of passionate individuals who understand the struggle
            of job seekers in India. From finding the right notification to
            preparing documents — we&apos;ve built tools that make every step
            easier and completely free.
          </p>
        </div>

        {/* What We Offer */}
        <div className="card-3d bg-white rounded-xl border border-slate-200/60 p-6 sm:p-8 mb-6">
          <h2 className="text-xl font-extrabold text-slate-800 mb-5">
            What We Offer
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: <Zap className="h-5 w-5 text-blue-600" />,
                title: "Latest Job Notifications",
                desc: "Daily updated govt job listings from SSC, UPSC, Railways, Banking, Defence, Police & more.",
              },
              {
                icon: <BookOpen className="h-5 w-5 text-emerald-600" />,
                title: "Results & Admit Cards",
                desc: "Instant access to exam results, admit cards, answer keys and syllabus from official sources.",
              },
              {
                icon: <Award className="h-5 w-5 text-violet-600" />,
                title: "Free Tools",
                desc: "Resume builder with LaTeX support, image converter, image to PDF — all free, no login required.",
              },
              {
                icon: <Heart className="h-5 w-5 text-rose-600" />,
                title: "Premium Membership",
                desc: "Exam calendar, WhatsApp job alerts, document locker, and exam fee refund on clearing exams.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="icon-3d h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="card-3d bg-white rounded-xl border border-slate-200/60 p-6 sm:p-8 mb-6">
          <h2 className="text-xl font-extrabold text-slate-800 mb-5">
            Our Values
          </h2>
          <div className="space-y-4">
            {[
              {
                icon: <Shield className="h-4 w-4 text-blue-600" />,
                title: "Accuracy",
                desc: "We only share verified information from official government sources. No misleading notifications.",
              },
              {
                icon: <Zap className="h-4 w-4 text-amber-500" />,
                title: "Speed",
                desc: "Job alerts within hours of official notification. We are live 24/7 so you never miss an update.",
              },
              {
                icon: <Users className="h-4 w-4 text-emerald-600" />,
                title: "Accessibility",
                desc: "Free for everyone. No paywalls on core job information. Government job data belongs to all aspirants.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="icon-3d h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm mb-0.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* About the site */}
        <div className="card-3d bg-white rounded-xl border border-slate-200/60 p-6 sm:p-8">
          <h2 className="text-xl font-extrabold text-slate-800 mb-3">
            About This Platform
          </h2>
          <p className="text-slate-600 leading-relaxed font-medium text-sm">
            <strong>Job Alerts 24</strong> (jobalerts24.com) is an independent
            platform and is not affiliated with any government body or
            organization. All job notifications are sourced from official
            government websites, employment newspapers, and official press
            releases. We aggregate and present this information to make it
            easily accessible to millions of job seekers across India.
          </p>
          <p className="text-slate-600 leading-relaxed font-medium text-sm mt-3">
            For any queries, corrections, or suggestions, feel free to reach out
            to us. We are constantly improving the platform based on user
            feedback.
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 font-medium">
              {SITE_NAME} &copy; {new Date().getFullYear()} · jobalerts24.com ·
              All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
