"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ITEMS_PER_PAGE } from "@/lib/constants";

interface PaginationProps {
  totalCount: number;
}

export function Pagination({ totalCount }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page") || "1");
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="neu-flat border-slate-200/60 bg-white text-slate-800 font-bold hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 disabled:opacity-40 transition-all"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>
      <div className="neu-flat flex items-center gap-1 px-4 py-1.5 rounded-lg bg-white border border-slate-200/60">
        <span className="text-sm font-bold text-slate-700">
          {currentPage}
        </span>
        <span className="text-sm text-slate-400">/</span>
        <span className="text-sm text-slate-400">{totalPages}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="neu-flat border-slate-200/60 bg-white text-slate-800 font-bold hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 disabled:opacity-40 transition-all"
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
