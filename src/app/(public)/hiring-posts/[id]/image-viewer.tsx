"use client";

import { useState, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, Maximize2, X } from "lucide-react";

export function ImageViewer({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);

  const zoomIn = useCallback(() => setScale((s) => Math.min(s + 0.4, 4)), []);
  const zoomOut = useCallback(() => setScale((s) => Math.max(s - 0.4, 0.4)), []);
  const reset = useCallback(() => setScale(1), []);
  const close = useCallback(() => { setOpen(false); setScale(1); }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
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
  }, [open, close, zoomIn, zoomOut, reset]);

  return (
    <>
      {/* Thumbnail */}
      <div
        className="relative group cursor-zoom-in bg-slate-50"
        onClick={() => setOpen(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="w-full object-contain max-h-96"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-full p-2">
            <ZoomIn className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex flex-col"
          onClick={close}
        >
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white/70 text-sm font-semibold truncate max-w-xs">{alt}</p>
            <div className="flex items-center gap-2">
              <button onClick={zoomOut} className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title="Zoom out (−)">
                <ZoomOut className="h-4 w-4 text-white" />
              </button>
              <span className="text-white/60 text-xs font-bold w-10 text-center">{Math.round(scale * 100)}%</span>
              <button onClick={zoomIn} className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title="Zoom in (+)">
                <ZoomIn className="h-4 w-4 text-white" />
              </button>
              <button onClick={reset} className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title="Reset (0)">
                <Maximize2 className="h-3.5 w-3.5 text-white" />
              </button>
              <button onClick={close} className="h-8 w-8 rounded-lg bg-white/10 hover:bg-red-500/80 flex items-center justify-center transition-colors ml-1" title="Close (Esc)">
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
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
          <div className="text-center py-2 shrink-0">
            <p className="text-white/30 text-xs">Click image to zoom · Esc to close · +/− to zoom</p>
          </div>
        </div>
      )}
    </>
  );
}
