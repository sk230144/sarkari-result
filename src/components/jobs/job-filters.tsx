"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { CATEGORIES, STATES, QUALIFICATIONS } from "@/lib/constants";

export function JobFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") || "all";
  const state = searchParams.get("state") || "";
  const qualification = searchParams.get("qualification") || "";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "newest";

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all" && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/jobs?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = () => {
    router.push("/jobs");
  };

  const hasFilters = category !== "all" || state || qualification || search;

  return (
    <div className="card-elevated bg-white rounded-xl border border-slate-200/60 p-4 sm:p-5 space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search jobs by title or organization..."
          className="pl-11 h-11 bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:border-blue-300 focus:ring-blue-100 focus:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)] text-sm transition-shadow"
          defaultValue={search}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateFilter("search", e.currentTarget.value);
            }
          }}
        />
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm text-slate-500 mr-1">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline font-semibold">Filters:</span>
        </div>

        <Select
          value={category}
          onValueChange={(v) => updateFilter("category", v)}
        >
          <SelectTrigger className="w-[150px] h-9 bg-slate-50 border-slate-200 text-sm rounded-lg focus:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)] transition-shadow">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={state || "all"}
          onValueChange={(v) => updateFilter("state", v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-[150px] h-9 bg-slate-50 border-slate-200 text-sm rounded-lg focus:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)] transition-shadow">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {STATES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={qualification || "all"}
          onValueChange={(v) =>
            updateFilter("qualification", v === "all" ? "" : v)
          }
        >
          <SelectTrigger className="w-[160px] h-9 bg-slate-50 border-slate-200 text-sm rounded-lg focus:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)] transition-shadow">
            <SelectValue placeholder="Qualification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Qualifications</SelectItem>
            {QUALIFICATIONS.map((q) => (
              <SelectItem key={q} value={q}>
                {q}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => updateFilter("sort", v)}>
          <SelectTrigger className="w-[140px] h-9 bg-slate-50 border-slate-200 text-sm rounded-lg focus:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)] transition-shadow">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="last_date">Last Date</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-9"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
