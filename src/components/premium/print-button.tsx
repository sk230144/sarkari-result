"use client";

import { Printer } from "lucide-react";

/** Opens the browser's print dialog, where "Save as PDF" downloads the invoice. */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-slate-700"
    >
      <Printer className="h-4 w-4" /> Download / Print
    </button>
  );
}
