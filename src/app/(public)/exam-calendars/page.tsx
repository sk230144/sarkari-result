import type { Metadata } from "next";
import Link from "next/link";
import { getExamPdfs } from "@/lib/actions/exam-pdfs";
import { Calendar, FileText, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Exam Calendars - SSC, UPSC, Railway, IBPS Official PDFs",
  description:
    "Download official exam calendars for SSC, UPSC, Railway, IBPS, SBI and more. सरकारी परीक्षा कैलेंडर 2026 — PDF डाउनलोड करें।",
};

export default async function ExamCalendarsPage() {
  const pdfs = await getExamPdfs();

  // Group by exam body
  const grouped = pdfs.reduce<Record<string, typeof pdfs>>((acc, pdf) => {
    if (!acc[pdf.exam_body]) acc[pdf.exam_body] = [];
    acc[pdf.exam_body].push(pdf);
    return acc;
  }, {});

  return (
    <div className="min-h-screen page-bg">
      <div className="page-bg-orb w-[420px] h-[420px] bg-red-200/[0.06] top-[8%] -left-[10%] animate-float-slow" />
      <div className="page-bg-orb w-[360px] h-[360px] bg-orange-200/[0.05] top-[55%] -right-[8%] animate-float-delayed" />

      {/* Hero */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>
        <div className="relative container mx-auto px-4 py-10 md:py-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-4">
              <Calendar className="h-3 w-3 text-amber-300" />
              <span className="text-white/90 text-xs font-bold">Official PDFs</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Exam Calendars
            </h1>
            <p className="mt-3 text-blue-100/80 text-sm md:text-base max-w-xl leading-relaxed font-medium">
              Download official exam calendars for SSC, UPSC, Railway, IBPS and more — updated by our team.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 space-y-8">
        {pdfs.length === 0 ? (
          <div className="card-3d bg-white rounded-xl border border-slate-200/60 p-12 text-center">
            <div className="icon-3d h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-7 w-7 text-red-300" />
            </div>
            <p className="text-slate-600 font-bold text-lg">No calendars uploaded yet</p>
            <p className="text-sm text-slate-400 mt-1 font-medium">Check back soon!</p>
          </div>
        ) : (
          Object.entries(grouped).map(([examBody, items]) => (
            <div key={examBody}>
              <div className="flex items-center gap-2 mb-3">
                <Badge className="text-xs bg-blue-50 text-blue-700 border-0 font-extrabold px-3 py-1">
                  {examBody}
                </Badge>
                <div className="flex-1 h-px bg-slate-200/60" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map((pdf) => (
                  <a
                    key={pdf.id}
                    href={pdf.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-3d bg-white rounded-xl border border-slate-200/60 flex items-center gap-3 px-4 py-3.5 hover:border-red-200 hover:bg-red-50/20 transition-colors group"
                  >
                    <div className="icon-3d h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-extrabold text-slate-800 truncate group-hover:text-red-600 transition-colors">
                        {pdf.name}
                      </p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Click to open PDF
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-red-400 shrink-0 group-hover:translate-x-0.5 transition-all" />
                  </a>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
