/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
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
import { Download, Image as ImageIcon, RefreshCw } from "lucide-react";

type OutputType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/bmp"
  | "image/gif"
  | "image/avif"
  | "image/ico"
  | "image/tiff";

const LOSSLESS_TYPES: OutputType[] = ["image/png", "image/bmp", "image/gif", "image/ico", "image/tiff"];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Encode canvas ImageData to BMP format (24-bit) */
function canvasToBmpBlob(canvas: HTMLCanvasElement): Blob {
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { width, height, data } = imageData;

  const rowSize = Math.ceil((width * 3) / 4) * 4; // rows padded to 4 bytes
  const pixelDataSize = rowSize * height;
  const fileSize = 54 + pixelDataSize;
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // BMP Header (14 bytes)
  view.setUint8(0, 0x42); // 'B'
  view.setUint8(1, 0x4d); // 'M'
  view.setUint32(2, fileSize, true);
  view.setUint32(10, 54, true); // pixel data offset

  // DIB Header (40 bytes)
  view.setUint32(14, 40, true); // header size
  view.setInt32(18, width, true);
  view.setInt32(22, -height, true); // negative = top-down
  view.setUint16(26, 1, true); // color planes
  view.setUint16(28, 24, true); // bits per pixel
  view.setUint32(34, pixelDataSize, true);

  // Pixel data (BGR, top-down)
  let offset = 54;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      view.setUint8(offset++, data[i + 2]); // B
      view.setUint8(offset++, data[i + 1]); // G
      view.setUint8(offset++, data[i]);     // R
    }
    // Pad row to 4-byte boundary
    const padding = rowSize - width * 3;
    for (let p = 0; p < padding; p++) {
      view.setUint8(offset++, 0);
    }
  }

  return new Blob([buffer], { type: "image/bmp" });
}

/** Encode canvas to ICO format (single image, PNG-based) */
function canvasToIcoBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((pngBlob) => {
      if (!pngBlob) return resolve(null);
      pngBlob.arrayBuffer().then((pngData) => {
        const pngBytes = new Uint8Array(pngData);
        const w = canvas.width > 255 ? 0 : canvas.width;
        const h = canvas.height > 255 ? 0 : canvas.height;
        // ICO header (6 bytes) + 1 entry (16 bytes) + PNG data
        const icoSize = 6 + 16 + pngBytes.length;
        const buffer = new ArrayBuffer(icoSize);
        const view = new DataView(buffer);
        // Header
        view.setUint16(0, 0, true); // reserved
        view.setUint16(2, 1, true); // ICO type
        view.setUint16(4, 1, true); // 1 image
        // Entry
        view.setUint8(6, w);
        view.setUint8(7, h);
        view.setUint8(8, 0); // no palette
        view.setUint8(9, 0); // reserved
        view.setUint16(10, 1, true); // color planes
        view.setUint16(12, 32, true); // bits per pixel
        view.setUint32(14, pngBytes.length, true); // PNG size
        view.setUint32(18, 22, true); // offset to PNG data
        // PNG data
        new Uint8Array(buffer).set(pngBytes, 22);
        resolve(new Blob([buffer], { type: "image/x-icon" }));
      });
    }, "image/png");
  });
}

const FORMAT_EXT: Record<OutputType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/bmp": "bmp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/ico": "ico",
  "image/tiff": "tiff",
};

type CropRect = { x: number; y: number; width: number; height: number };

export default function ImageToolsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string>("");
  const [sourceInfo, setSourceInfo] = useState<{
    width: number;
    height: number;
    size: number;
    type: string;
  } | null>(null);
  const [outputUrl, setOutputUrl] = useState<string>("");
  const [outputInfo, setOutputInfo] = useState<{
    width: number;
    height: number;
    size: number;
    type: string;
  } | null>(null);
  const [processing, setProcessing] = useState(false);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const outputRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);

  // Crop state: use a ref for live drag drawing, state for final value
  const cropRectRef = useRef<CropRect | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const [cropRect, setCropRect] = useState<CropRect | null>(null);

  const [outputType, setOutputType] = useState<OutputType>("image/jpeg");
  const [quality, setQuality] = useState(82);
  const [targetSizeKb, setTargetSizeKb] = useState(0);
  const [scalePercent, setScalePercent] = useState(100);

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [sourceUrl, outputUrl]);

  const sourceAspect = useMemo(() => {
    if (!sourceInfo) return 1;
    return sourceInfo.width / sourceInfo.height;
  }, [sourceInfo]);

  const resizeCanvasToImage = useCallback(() => {
    const canvas = canvasRef.current;
    const wrapper = canvasWrapRef.current;
    const img = imageRef.current;
    if (!canvas || !wrapper || !img) return;
    const nextWidth = Math.max(1, Math.floor(wrapper.clientWidth));
    const nextHeight = Math.max(1, Math.floor(nextWidth / sourceAspect));
    if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
      canvas.width = nextWidth;
      canvas.height = nextHeight;
    }
  }, [sourceAspect]);

  // Pure drawing function — reads from ref, no React state dependency
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const crop = cropRectRef.current;
    if (crop && crop.width > 5 && crop.height > 5) {
      ctx.save();
      // Dim outside crop
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fillRect(0, 0, canvas.width, crop.y);
      ctx.fillRect(0, crop.y + crop.height, canvas.width, canvas.height - (crop.y + crop.height));
      ctx.fillRect(0, crop.y, crop.x, crop.height);
      ctx.fillRect(crop.x + crop.width, crop.y, canvas.width - (crop.x + crop.width), crop.height);
      // Border
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);
      // Corner handles
      ctx.setLineDash([]);
      const hs = 8;
      ctx.fillStyle = "#38bdf8";
      for (const cx of [crop.x, crop.x + crop.width]) {
        for (const cy of [crop.y, crop.y + crop.height]) {
          ctx.fillRect(cx - hs / 2, cy - hs / 2, hs, hs);
        }
      }
      ctx.restore();
    }
  }, []);

  useEffect(() => {
    if (!sourceUrl) return;
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setSourceInfo({
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file?.size || 0,
        type: file?.type || "unknown",
      });
      setScalePercent(100);
      cropRectRef.current = null;
      setCropRect(null);
      setOutputInfo(null);
      setOutputUrl("");
      requestAnimationFrame(() => {
        resizeCanvasToImage();
        drawCanvas();
      });
    };
    img.src = sourceUrl;
  }, [sourceUrl, file, resizeCanvasToImage, drawCanvas]);

  useEffect(() => {
    if (!sourceInfo) return;
    resizeCanvasToImage();
    drawCanvas();
  }, [sourceInfo, resizeCanvasToImage, drawCanvas]);

  useEffect(() => {
    function handleResize() {
      resizeCanvasToImage();
      drawCanvas();
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [resizeCanvasToImage, drawCanvas]);

  // Sync ref when React state changes (e.g. "Clear crop" button)
  useEffect(() => {
    cropRectRef.current = cropRect;
    drawCanvas();
  }, [cropRect, drawCanvas]);

  function getImageCropRect() {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    const scaleX = img.naturalWidth / canvas.width;
    const scaleY = img.naturalHeight / canvas.height;
    const crop = cropRectRef.current;
    if (!crop) {
      return {
        x: 0,
        y: 0,
        width: img.naturalWidth,
        height: img.naturalHeight,
      };
    }
    const width = clamp(crop.width * scaleX, 1, img.naturalWidth);
    const height = clamp(crop.height * scaleY, 1, img.naturalHeight);
    const x = clamp(crop.x * scaleX, 0, img.naturalWidth - width);
    const y = clamp(crop.y * scaleY, 0, img.naturalHeight - height);
    return { x, y, width, height };
  }

  function getCanvasPoint(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: clamp((event.clientX - rect.left) * scaleX, 0, canvas.width),
      y: clamp((event.clientY - rect.top) * scaleY, 0, canvas.height),
    };
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    const point = getCanvasPoint(event);
    isDraggingRef.current = true;
    dragStartRef.current = point;
    cropRectRef.current = { x: point.x, y: point.y, width: 0, height: 0 };
    drawCanvas();
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!isDraggingRef.current || !dragStartRef.current) return;
    const start = dragStartRef.current;
    const point = getCanvasPoint(event);
    const x = Math.min(start.x, point.x);
    const y = Math.min(start.y, point.y);
    const width = Math.abs(point.x - start.x);
    const height = Math.abs(point.y - start.y);
    cropRectRef.current = { x, y, width, height };
    drawCanvas();
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!isDraggingRef.current) return;
    const canvas = canvasRef.current;
    if (canvas) canvas.releasePointerCapture(event.pointerId);
    isDraggingRef.current = false;
    dragStartRef.current = null;
    const crop = cropRectRef.current;
    if (!crop || crop.width < 10 || crop.height < 10) {
      cropRectRef.current = null;
      drawCanvas();
      setCropRect(null);
    } else {
      // Commit to React state
      setCropRect({ ...crop });
    }
  }

  async function renderToBlob(
    image: HTMLImageElement,
    cr: CropRect,
    width: number,
    height: number,
    type: OutputType,
    qualityValue: number
  ): Promise<Blob | null> {
    const canvas = outputRef.current || document.createElement("canvas");
    outputRef.current = canvas;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, cr.x, cr.y, cr.width, cr.height, 0, 0, width, height);

    // BMP — manual encoding
    if (type === "image/bmp") {
      return canvasToBmpBlob(canvas);
    }

    // ICO — PNG wrapped in ICO container
    if (type === "image/ico") {
      return canvasToIcoBlob(canvas);
    }

    // TIFF — not natively supported, fall back to PNG with .tiff extension
    if (type === "image/tiff") {
      return new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png");
      });
    }

    // GIF / AVIF — try native, fall back to PNG
    if (type === "image/gif" || type === "image/avif") {
      return new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob && blob.type === type) {
              resolve(blob);
            } else {
              // Browser doesn't support this format, use PNG fallback
              canvas.toBlob((pngBlob) => resolve(pngBlob), "image/png");
            }
          },
          type,
          clamp(qualityValue, 0.1, 1)
        );
      });
    }

    // JPG, PNG, WebP — native canvas support
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        type,
        clamp(qualityValue, 0.1, 1)
      );
    });
  }

  async function processImage() {
    if (!imageRef.current || !sourceInfo) return;
    setProcessing(true);
    try {
      const cr = getImageCropRect();
      const scale = clamp(scalePercent / 100, 0.1, 1);
      const baseWidth = Math.max(1, Math.round(cr.width * scale));
      const baseHeight = Math.max(1, Math.round(cr.height * scale));

      const targetBytes = targetSizeKb > 0 ? targetSizeKb * 1024 : 0;
      let qualityValue = quality / 100;
      let sizeScale = 1;
      let lastBlob: Blob | null = null;
      let lastWidth = baseWidth;
      let lastHeight = baseHeight;

      for (let step = 0; step < 14; step += 1) {
        const currentWidth = Math.max(1, Math.round(baseWidth * sizeScale));
        const currentHeight = Math.max(1, Math.round(baseHeight * sizeScale));
        lastWidth = currentWidth;
        lastHeight = currentHeight;

        const isLossless = LOSSLESS_TYPES.includes(outputType);
        lastBlob = await renderToBlob(
          imageRef.current,
          cr,
          currentWidth,
          currentHeight,
          outputType,
          isLossless ? 1 : qualityValue
        );

        if (!lastBlob) break;
        if (!targetBytes || lastBlob.size <= targetBytes) break;

        if (isLossless) {
          sizeScale *= 0.9;
        } else {
          qualityValue = Math.max(0.2, qualityValue - 0.08);
          if (qualityValue <= 0.35) {
            sizeScale *= 0.9;
          }
        }
      }

      if (!lastBlob) return;

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      const newUrl = URL.createObjectURL(lastBlob);
      setOutputUrl(newUrl);
      setOutputInfo({
        width: lastWidth,
        height: lastHeight,
        size: lastBlob.size,
        type: outputType,
      });
    } finally {
      setProcessing(false);
    }
  }

  function resetAll() {
    setFile(null);
    setSourceUrl("");
    setSourceInfo(null);
    setOutputUrl("");
    setOutputInfo(null);
    setQuality(82);
    setTargetSizeKb(0);
    setScalePercent(100);
    cropRectRef.current = null;
    setCropRect(null);
  }

  const canProcess = Boolean(sourceInfo && sourceUrl);

  return (
    <div className="min-h-screen page-bg">
      <div className="page-bg-orb w-[450px] h-[450px] bg-blue-200/[0.08] top-[10%] -left-[10%] animate-float-slow" />
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
              <ImageIcon className="h-3 w-3 text-amber-300" />
              <span className="text-white/90 text-xs font-bold">
                100% Free - Runs in your browser
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Image Tools
            </h1>
            <p className="mt-3 text-blue-100/80 text-sm md:text-base max-w-xl leading-relaxed font-medium">
              Convert, compress, resize, and crop images without uploading
              anywhere. Supports JPG, PNG, WebP, AVIF, BMP, GIF, ICO & TIFF.
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
                <Label htmlFor="image-upload" className="text-sm font-bold">
                  Upload Image
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0] || null;
                    if (!nextFile) return;
                    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
                    setFile(nextFile);
                    setSourceUrl(URL.createObjectURL(nextFile));
                  }}
                />
                {sourceInfo && (
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {sourceInfo.type || "image"}
                    </Badge>
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {sourceInfo.width} x {sourceInfo.height}
                    </Badge>
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {formatBytes(sourceInfo.size)}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Output Format</Label>
                  <Select
                    value={outputType}
                    onValueChange={(value) =>
                      setOutputType(value as OutputType)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image/jpeg">JPG</SelectItem>
                      <SelectItem value="image/png">PNG</SelectItem>
                      <SelectItem value="image/webp">WebP</SelectItem>
                      <SelectItem value="image/avif">AVIF</SelectItem>
                      <SelectItem value="image/bmp">BMP</SelectItem>
                      <SelectItem value="image/gif">GIF</SelectItem>
                      <SelectItem value="image/ico">ICO</SelectItem>
                      <SelectItem value="image/tiff">TIFF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">
                    Quality {LOSSLESS_TYPES.includes(outputType) && "(fixed)"}
                  </Label>
                  <Input
                    type="number"
                    min={10}
                    max={100}
                    value={quality}
                    disabled={LOSSLESS_TYPES.includes(outputType)}
                    onChange={(event) =>
                      setQuality(Number(event.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">
                    Target Size (KB)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="e.g., 100"
                    value={targetSizeKb || ""}
                    onChange={(event) =>
                      setTargetSizeKb(Number(event.target.value) || 0)
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold">Resize</Label>
                  <span className="text-xs font-semibold text-slate-500">
                    {scalePercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={scalePercent}
                  onChange={(event) =>
                    setScalePercent(Number(event.target.value))
                  }
                  className="w-full accent-blue-500"
                />
                <p className="text-xs text-slate-500 font-medium">
                  Resize keeps aspect ratio. Use crop below to choose the area.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold">Manual Crop</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-semibold"
                    onClick={() => {
                      cropRectRef.current = null;
                      setCropRect(null);
                    }}
                    disabled={!cropRect}
                  >
                    Clear crop
                  </Button>
                </div>
                <div
                  ref={canvasWrapRef}
                  className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-3"
                >
                  {sourceUrl ? (
                    <canvas
                      ref={canvasRef}
                      className="w-full rounded-lg cursor-crosshair select-none"
                      style={{ touchAction: "none" }}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                    />
                  ) : (
                    <div className="text-center text-slate-400 text-sm font-semibold py-10">
                      Upload an image to crop manually
                    </div>
                  )}
                </div>
                {cropRect && (
                  <p className="text-xs text-blue-600 font-semibold">
                    Crop selected — only the highlighted area will be exported.
                  </p>
                )}
                {!cropRect && (
                  <p className="text-xs text-slate-500 font-medium">
                    Drag on the image to select a crop area.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  className="btn-3d text-white font-black border-0"
                  disabled={!canProcess || processing}
                  onClick={processImage}
                >
                  {processing ? "Processing..." : "Process Image"}
                </Button>
                <Button
                  variant="outline"
                  className="font-bold"
                  onClick={resetAll}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="text-base font-extrabold text-slate-800">
                Preview & Download
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 flex items-center justify-center min-h-[240px]">
                {outputUrl ? (
                  <img
                    src={outputUrl}
                    alt="Processed"
                    className="max-h-[240px] max-w-full rounded-lg shadow-sm"
                  />
                ) : sourceUrl ? (
                  <img
                    src={sourceUrl}
                    alt="Original"
                    className="max-h-[240px] max-w-full rounded-lg opacity-70"
                  />
                ) : (
                  <div className="text-center text-slate-400 text-sm font-semibold">
                    Upload an image to preview
                  </div>
                )}
              </div>

              {outputInfo && (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {(FORMAT_EXT[outputInfo.type as OutputType] || outputInfo.type.replace("image/", "")).toUpperCase()}
                  </Badge>
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {outputInfo.width} x {outputInfo.height}
                  </Badge>
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {formatBytes(outputInfo.size)}
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
                    const ext = FORMAT_EXT[outputInfo?.type as OutputType] || "jpg";
                    link.download = `image-tool.${ext}`;
                    link.click();
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <p className="text-xs text-slate-400 font-medium">
                  All processing happens locally in your browser.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
