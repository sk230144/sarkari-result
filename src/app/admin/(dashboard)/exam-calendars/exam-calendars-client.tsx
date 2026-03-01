"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { uploadExamPdf, deleteExamPdf, type ExamPdf } from "@/lib/actions/exam-pdfs";
import { toast } from "sonner";
import { FileText, Trash2, Upload, ExternalLink, Loader2 } from "lucide-react";
import { format } from "date-fns";

const EXAM_BODIES = ["SSC", "UPSC", "Railway", "IBPS", "SBI", "DSSSB", "State PSC", "Other"];

export function ExamCalendarsClient({ pdfs }: { pdfs: ExamPdf[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (!selectedFile) {
      toast.error("Please select a PDF file");
      return;
    }
    formData.set("file", selectedFile);
    setUploading(true);
    const result = await uploadExamPdf(formData);
    setUploading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("PDF uploaded successfully");
      formRef.current?.reset();
      setSelectedFile(null);
      router.refresh();
    }
  }

  async function handleDelete(id: string, filePath: string) {
    if (!confirm("Delete this PDF? This cannot be undone.")) return;
    setDeletingId(id);
    const result = await deleteExamPdf(id, filePath);
    setDeletingId(null);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("PDF deleted");
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <div className="card-3d bg-white rounded-xl border border-slate-200/60 p-6">
        <h2 className="text-base font-extrabold text-slate-800 mb-4 flex items-center gap-2">
          <Upload className="h-4 w-4 text-blue-500" />
          Upload New PDF
        </h2>
        <form ref={formRef} onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-slate-600">
                Calendar Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. SSC CGL 2026 Exam Calendar"
                required
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exam_body" className="text-xs font-semibold text-slate-600">
                Exam Body
              </Label>
              <select
                id="exam_body"
                name="exam_body"
                required
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select exam body...</option>
                {EXAM_BODIES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="file" className="text-xs font-semibold text-slate-600">
              PDF File (max 10 MB)
            </Label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                selectedFile ? "border-blue-300 bg-blue-50/50" : "border-slate-200 hover:border-slate-300"
              }`}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <FileText className={`h-8 w-8 mx-auto mb-2 ${selectedFile ? "text-blue-500" : "text-slate-300"}`} />
              {selectedFile ? (
                <p className="text-sm font-semibold text-blue-700">{selectedFile.name}</p>
              ) : (
                <p className="text-sm text-slate-400 font-medium">Click to select PDF</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={uploading}
            className="btn-3d gradient-hero text-white font-black shadow-lg shadow-blue-500/25 shine"
          >
            {uploading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</>
            ) : (
              <><Upload className="h-4 w-4 mr-2" />Upload PDF</>
            )}
          </Button>
        </form>
      </div>

      {/* PDF List */}
      <div className="space-y-2">
        <h2 className="text-sm font-extrabold text-slate-600 uppercase tracking-wider px-1">
          Uploaded PDFs ({pdfs.length})
        </h2>
        {pdfs.length === 0 ? (
          <div className="card-3d bg-white rounded-xl border border-slate-200/60 p-10 text-center">
            <FileText className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-medium text-sm">No PDFs uploaded yet</p>
          </div>
        ) : (
          pdfs.map((pdf) => (
            <div
              key={pdf.id}
              className="card-3d bg-white rounded-xl border border-slate-200/60 flex items-center gap-4 p-4"
            >
              <div className="icon-3d h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm text-slate-800 truncate">{pdf.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge className="text-[10px] bg-blue-50 text-blue-700 border-0 font-bold">
                    {pdf.exam_body}
                  </Badge>
                  <span className="text-[11px] text-slate-400">
                    {format(new Date(pdf.created_at), "dd MMM yyyy")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={pdf.file_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="text-xs font-bold">
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    View
                  </Button>
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-300 hover:text-red-500 h-8 w-8"
                  onClick={() => handleDelete(pdf.id, pdf.file_path)}
                  disabled={deletingId === pdf.id}
                >
                  {deletingId === pdf.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
