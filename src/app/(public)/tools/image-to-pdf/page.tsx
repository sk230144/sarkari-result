/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Trash2 } from "lucide-react";

type PageSize = "auto" | "a4";

type ImageItem = {
  id: string;
  file: File;
  url: string;
  width: number;
  height: number;
  type: string;
  size: number;
};

const A4_SIZE = { width: 595.28, height: 841.89 };

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (event) => {
      URL.revokeObjectURL(url);
      reject(event);
    };
    img.src = url;
  });
}

async function fileToArrayBuffer(file: File) {
  return await file.arrayBuffer();
}

async function fileToPngBytes(file: File) {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas not available");
  }
  ctx.drawImage(img, 0, 0);
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (!result) {
        reject(new Error("PNG conversion failed"));
        return;
      }
      resolve(result);
    }, "image/png");
  });
  return await blob.arrayBuffer();
}

export default function ImageToPdfPage() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [processing, setProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState("");
  const [outputSize, setOutputSize] = useState(0);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      items.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [outputUrl, items]);

  const totalInputSize = useMemo(
    () => items.reduce((sum, item) => sum + item.size, 0),
    [items]
  );

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const nextItems: ImageItem[] = [];
    for (const file of Array.from(files)) {
      const img = await loadImageFromFile(file);
      const url = URL.createObjectURL(file);
      nextItems.push({
        id: crypto.randomUUID(),
        file,
        url,
        width: img.naturalWidth,
        height: img.naturalHeight,
        type: file.type || "image",
        size: file.size,
      });
    }
    setItems((prev) => [...prev, ...nextItems]);
  }

  async function buildPdf() {
    if (!items.length) return;
    setProcessing(true);
    try {
      const pdf = await PDFDocument.create();

      for (const item of items) {
        const isJpg = item.type === "image/jpeg" || item.type === "image/jpg";
        const isPng = item.type === "image/png";
        const bytes = isJpg || isPng ? await fileToArrayBuffer(item.file) : await fileToPngBytes(item.file);

        const embedded = isJpg
          ? await pdf.embedJpg(bytes)
          : await pdf.embedPng(bytes);

        const pageDims =
          pageSize === "a4"
            ? A4_SIZE
            : { width: embedded.width, height: embedded.height };

        const page = pdf.addPage([pageDims.width, pageDims.height]);

        const margin = pageSize === "a4" ? 24 : 0;
        const maxWidth = pageDims.width - margin * 2;
        const maxHeight = pageDims.height - margin * 2;

        const scale = Math.min(
          maxWidth / embedded.width,
          maxHeight / embedded.height,
          1
        );

        const drawWidth = embedded.width * scale;
        const drawHeight = embedded.height * scale;
        const x = (pageDims.width - drawWidth) / 2;
        const y = (pageDims.height - drawHeight) / 2;

        page.drawImage(embedded, { x, y, width: drawWidth, height: drawHeight });
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setOutputSize(blob.size);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="min-h-screen page-bg">
      <div className="page-bg-orb w-[420px] h-[420px] bg-blue-200/[0.08] top-[10%] -left-[10%] animate-float-slow" />
      <div className="page-bg-orb w-[360px] h-[360px] bg-indigo-200/[0.07] top-[55%] -right-[8%] animate-float-delayed" />
      <div className="page-bg-orb w-[320px] h-[320px] bg-violet-200/[0.06] bottom-[5%] left-[15%] animate-float" />

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

        <div className="relative container mx-auto px-4 py-10 md:py-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-4">
              <FileText className="h-3 w-3 text-amber-300" />
              <span className="text-white/90 text-xs font-bold">
                100% Free - Runs in your browser
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Image to PDF
            </h1>
            <p className="mt-3 text-blue-100/80 text-sm md:text-base max-w-xl leading-relaxed font-medium">
              Convert one or many images into a single PDF without uploading
              anywhere.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 card-3d">
            <CardHeader>
              <CardTitle className="text-base font-extrabold text-slate-800">
                Upload & Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3">
                <Label htmlFor="pdf-upload" className="text-sm font-bold">
                  Upload Images
                </Label>
                <Input
                  id="pdf-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => {
                    void handleFiles(event.target.files);
                    event.currentTarget.value = "";
                  }}
                />
                {items.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {items.length} images
                    </Badge>
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {formatBytes(totalInputSize)}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Page Size</Label>
                  <Select
                    value={pageSize}
                    onValueChange={(value) =>
                      setPageSize(value as PageSize)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a4">A4 (fit)</SelectItem>
                      <SelectItem value="auto">Auto (image size)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {items.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-bold">Files</Label>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-200/60 bg-white/60 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-700 truncate">
                            {item.file.name}
                          </p>
                          <p className="text-xs text-slate-400 font-medium">
                            {item.width} x {item.height} ·{" "}
                            {formatBytes(item.size)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-rose-500"
                          onClick={() =>
                            setItems((prev) =>
                              prev.filter((img) => img.id !== item.id)
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button
                  className="btn-3d text-white font-black border-0"
                  disabled={!items.length || processing}
                  onClick={buildPdf}
                >
                  {processing ? "Building PDF..." : "Create PDF"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="text-base font-extrabold text-slate-800">
                Download
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 min-h-[220px]">
                {items.length === 0 ? (
                  <div className="text-center text-slate-400 text-sm font-semibold">
                    Upload images to generate a PDF
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {items.slice(0, 4).map((item) => (
                      <img
                        key={item.id}
                        src={item.url}
                        alt={item.file.name}
                        loading="lazy"
                        className="h-20 w-full object-cover rounded-lg border border-white/60"
                      />
                    ))}
                    {items.length > 4 && (
                      <div className="h-20 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400 font-semibold">
                        +{items.length - 4} more
                      </div>
                    )}
                  </div>
                )}
              </div>

              {outputUrl && (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs font-semibold">
                    PDF
                  </Badge>
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {formatBytes(outputSize)}
                  </Badge>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  className="btn-3d text-white font-black border-0"
                  disabled={!outputUrl}
                  onClick={() => {
                    if (!outputUrl) return;
                    const link = document.createElement("a");
                    link.href = outputUrl;
                    link.download = "images.pdf";
                    link.click();
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <p className="text-xs text-slate-400 font-medium">
                  Your images never leave your device.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
