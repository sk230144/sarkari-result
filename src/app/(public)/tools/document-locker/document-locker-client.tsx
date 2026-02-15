"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Shield,
  Upload,
  Trash2,
  Download,
  FileText,
  Image as ImageIcon,
  User,
  PenLine,
  GraduationCap,
  CreditCard,
  Briefcase,
  FolderOpen,
  Loader2,
  LogOut,
  Eye,
  Plus,
  Lock,
} from "lucide-react";
import {
  uploadDocument,
  deleteDocument,
  getDocumentUrl,
  type UserDocument,
  type DocType,
} from "@/lib/actions/documents";
import { signOut } from "@/lib/actions/auth";
import { toast } from "sonner";

const DOC_CATEGORIES: {
  value: DocType;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    value: "aadhar",
    label: "Aadhar Card",
    icon: <CreditCard className="h-5 w-5" />,
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    value: "marksheet_10",
    label: "10th Marksheet",
    icon: <GraduationCap className="h-5 w-5" />,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    value: "marksheet_12",
    label: "12th Marksheet",
    icon: <GraduationCap className="h-5 w-5" />,
    color: "bg-violet-50 text-violet-700 border-violet-200",
  },
  {
    value: "graduation",
    label: "Graduation Certificate",
    icon: <GraduationCap className="h-5 w-5" />,
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    value: "photo",
    label: "Passport Photo",
    icon: <User className="h-5 w-5" />,
    color: "bg-pink-50 text-pink-700 border-pink-200",
  },
  {
    value: "signature",
    label: "Signature",
    icon: <PenLine className="h-5 w-5" />,
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
  {
    value: "resume",
    label: "Resume / CV",
    icon: <Briefcase className="h-5 w-5" />,
    color: "bg-teal-50 text-teal-700 border-teal-200",
  },
  {
    value: "other",
    label: "Other Document",
    icon: <FolderOpen className="h-5 w-5" />,
    color: "bg-slate-50 text-slate-700 border-slate-200",
  },
];

function getCategoryInfo(docType: DocType) {
  return (
    DOC_CATEGORIES.find((c) => c.value === docType) || DOC_CATEGORIES[DOC_CATEGORIES.length - 1]
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  user: { id: string; email: string; name: string };
  initialDocuments: UserDocument[];
}

export function DocumentLockerClient({ user, initialDocuments }: Props) {
  const [documents, setDocuments] = useState<UserDocument[]>(initialDocuments);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [docType, setDocType] = useState<DocType>("aadhar");
  const [label, setLabel] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("docType", docType);
    formData.append("label", label);

    const result = await uploadDocument(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Document uploaded successfully!");
      setUploadOpen(false);
      setLabel("");
      if (fileRef.current) fileRef.current.value = "";
      // Refresh by re-fetching from server action
      const { getUserDocuments: refetch } = await import("@/lib/actions/documents");
      const updated = await refetch();
      setDocuments(updated);
    }
    setUploading(false);
  }

  async function handleDelete(docId: string) {
    if (!confirm("Are you sure you want to delete this document?")) return;

    setDeleting(docId);
    const result = await deleteDocument(docId);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Document deleted");
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    }
    setDeleting(null);
  }

  async function handleView(doc: UserDocument) {
    setViewing(doc.id);
    const url = await getDocumentUrl(doc.file_path);
    if (url) {
      setViewUrl(url);
    } else {
      toast.error("Failed to load document");
      setViewing(null);
    }
  }

  async function handleDownload(doc: UserDocument) {
    const url = await getDocumentUrl(doc.file_path);
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file_name;
      a.click();
    } else {
      toast.error("Failed to download");
    }
  }

  // Group docs by category
  const grouped = DOC_CATEGORIES.map((cat) => ({
    ...cat,
    docs: documents.filter((d) => d.doc_type === cat.value),
  }));

  return (
    <div className="min-h-screen page-bg">
      <div className="page-bg-orb w-[420px] h-[420px] bg-blue-200/[0.08] top-[8%] -left-[10%] animate-float-slow" />
      <div className="page-bg-orb w-[360px] h-[360px] bg-indigo-200/[0.07] top-[55%] -right-[8%] animate-float-delayed" />

      {/* Hero */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>
        <div className="absolute top-5 left-[10%] w-48 h-48 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-5 right-[10%] w-40 h-40 bg-blue-300/10 rounded-full blur-3xl animate-float-delayed" />

        <div className="relative container mx-auto px-4 py-10 md:py-12">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-4">
                <Lock className="h-3 w-3 text-emerald-300" />
                <span className="text-white/90 text-xs font-bold">
                  Encrypted & Private
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Document Locker
              </h1>
              <p className="mt-2 text-blue-100/80 text-sm md:text-base max-w-xl font-medium">
                Store your Aadhar, marksheets, photos, signature & more securely.
                Only you can access them.
              </p>
            </div>
            <form action={signOut} className="shrink-0 hidden sm:block">
              <Button
                type="submit"
                variant="ghost"
                className="glass text-white/80 hover:text-white hover:bg-white/10 font-bold text-xs"
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                Logout
              </Button>
            </form>
          </div>

          {/* User info */}
          <div className="mt-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <User className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-white/90 text-sm font-bold">{user.name || "User"}</p>
              <p className="text-blue-200/60 text-xs font-medium">{user.email}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Upload button + stats */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="icon-3d h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">
                My Documents
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {documents.length} document{documents.length !== 1 ? "s" : ""} stored
              </p>
            </div>
          </div>

          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button className="btn-3d gradient-hero text-white font-black shadow-lg shadow-blue-500/25 shine">
                <Plus className="h-4 w-4 mr-1.5" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-extrabold text-slate-800 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  Upload Document
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    Document Type
                  </Label>
                  <Select
                    value={docType}
                    onValueChange={(v) => setDocType(v as DocType)}
                  >
                    <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOC_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <span className="flex items-center gap-2 font-semibold">
                            {cat.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    Custom Label{" "}
                    <span className="text-slate-400 font-normal">(optional)</span>
                  </Label>
                  <Input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. SSC Marksheet 2023"
                    className="h-11 bg-slate-50 border-slate-200 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    File{" "}
                    <span className="text-slate-400 font-normal">
                      (JPG, PNG, WebP, PDF — max 5MB)
                    </span>
                  </Label>
                  <Input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    required
                    className="h-11 bg-slate-50 border-slate-200 rounded-lg file:mr-3 file:px-3 file:py-1 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold file:text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={uploading}
                  className="btn-3d w-full h-11 gradient-hero text-white font-black shadow-lg shadow-blue-500/25 shine"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload Document
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Document categories grid */}
        <div className="space-y-6">
          {grouped.map((cat) => (
            <div key={cat.value}>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`icon-3d h-8 w-8 rounded-lg flex items-center justify-center ${cat.color}`}
                >
                  {cat.icon}
                </div>
                <h3 className="font-bold text-slate-700 text-sm">{cat.label}</h3>
                <Badge variant="secondary" className="text-[10px] font-bold ml-1">
                  {cat.docs.length}
                </Badge>
              </div>

              {cat.docs.length === 0 ? (
                <div className="card-3d bg-white rounded-xl border border-slate-200/60 p-6 text-center">
                  <p className="text-xs text-slate-400 font-medium">
                    No {cat.label.toLowerCase()} uploaded yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cat.docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="card-3d bg-white rounded-xl border border-slate-200/60 p-4 shine"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`icon-3d h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${cat.color}`}
                        >
                          {doc.mime_type.startsWith("image/") ? (
                            <ImageIcon className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-extrabold text-slate-800 truncate">
                            {doc.label || doc.file_name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium truncate">
                            {doc.file_name}
                          </p>
                          <p className="text-[10px] text-slate-300 font-semibold mt-0.5">
                            {formatFileSize(doc.file_size)} &middot;{" "}
                            {new Date(doc.created_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs font-bold text-slate-700 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200"
                          onClick={() => handleView(doc)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                          onClick={() => handleDelete(doc.id)}
                          disabled={deleting === doc.id}
                        >
                          {deleting === doc.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile logout */}
        <div className="sm:hidden mt-8 text-center">
          <form action={signOut}>
            <Button
              type="submit"
              variant="outline"
              className="text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 font-bold"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Logout
            </Button>
          </form>
        </div>
      </div>

      {/* Fullscreen viewer dialog */}
      {viewing && viewUrl && (
        <Dialog open={!!viewing} onOpenChange={() => { setViewing(null); setViewUrl(null); }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="font-extrabold text-slate-800">
                Document Preview
              </DialogTitle>
            </DialogHeader>
            <div className="mt-2">
              {viewUrl.includes(".pdf") ||
              documents.find((d) => d.id === viewing)?.mime_type === "application/pdf" ? (
                <iframe
                  src={viewUrl}
                  className="w-full h-[70vh] rounded-lg border"
                  title="PDF Preview"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={viewUrl}
                  alt="Document Preview"
                  className="w-full rounded-lg"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
