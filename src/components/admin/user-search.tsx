"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export function UserSearch({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("search", value.trim());
    router.push(`/admin/users${params.toString() ? `?${params}` : ""}`);
  }

  function handleClear() {
    setValue("");
    router.push("/admin/users");
  }

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search by name or email..."
          className="pl-9 h-10 font-medium"
        />
      </div>
      <Button type="submit" size="sm" className="h-10 px-4 font-bold">
        Search
      </Button>
      {defaultValue && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-slate-400 hover:text-slate-600"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </form>
  );
}
