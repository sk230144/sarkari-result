import { getExamPdfs } from "@/lib/actions/exam-pdfs";
import { FileText } from "lucide-react";
import { ExamCalendarsClient } from "./exam-calendars-client";

export default async function AdminExamCalendarsPage() {
  const pdfs = await getExamPdfs();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-500" />
            Exam Calendar PDFs
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">
            Upload PDF calendars for SSC, UPSC, Railway, etc. Users can view them in Tools.
          </p>
        </div>
      </div>
      <ExamCalendarsClient pdfs={pdfs} />
    </div>
  );
}
