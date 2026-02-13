import Link from "next/link";
import { Briefcase, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { CATEGORIES } from "@/lib/constants";

const navLinks = [
  { href: "/", label: "Home" },
  ...CATEGORIES.slice(0, 4).map((cat) => ({
    href: `/jobs?category=${cat.value}`,
    label: cat.label,
  })),
];

const allNavLinks = [
  { href: "/", label: "Home" },
  ...CATEGORIES.map((cat) => ({
    href: `/jobs?category=${cat.value}`,
    label: cat.label,
  })),
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full glass-strong border-b border-white/40">
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* 3D Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-xl gradient-hero flex items-center justify-center glow-blue group-hover:glow-blue-strong transition-all duration-300 group-hover:scale-105">
            <Briefcase className="h-5 w-5 text-white drop-shadow-sm" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-gradient">
              Sarkari Result
            </span>
            <span className="hidden sm:block text-[10px] text-slate-400 -mt-0.5 tracking-widest uppercase font-semibold">
              Govt Jobs Portal
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-8 hidden lg:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-700 hover:text-blue-700 hover:bg-blue-50/80 font-bold text-sm rounded-lg transition-all"
              >
                {link.label}
              </Button>
            </Link>
          ))}
          <Link href="/jobs">
            <Button
              size="sm"
              className="ml-2 btn-3d text-white font-black text-sm rounded-lg border-0"
            >
              All Jobs
            </Button>
          </Link>
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          <Link href="/jobs" className="hidden sm:block">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl"
            >
              <Search className="h-4.5 w-4.5" />
            </Button>
          </Link>

          {/* Mobile nav */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-500 hover:bg-blue-50/80 rounded-xl"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0 border-0">
                <div className="p-6 gradient-hero relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4 w-24 h-24 rounded-full border-2 border-white/30" />
                    <div className="absolute bottom-2 left-8 w-16 h-16 rounded-full border-2 border-white/20" />
                  </div>
                  <SheetTitle className="text-white text-lg font-bold flex items-center gap-2.5 relative">
                    <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <Briefcase className="h-4 w-4 text-white" />
                    </div>
                    Sarkari Result
                  </SheetTitle>
                  <p className="text-blue-200 text-xs mt-1.5 relative font-semibold tracking-wide">
                    Government Jobs Portal
                  </p>
                </div>
                <nav className="flex flex-col p-4 gap-0.5">
                  {allNavLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-slate-700 hover:text-blue-700 hover:bg-blue-50/80 font-bold rounded-lg"
                        size="sm"
                      >
                        {link.label}
                      </Button>
                    </Link>
                  ))}
                  <div className="my-3 border-t border-slate-100" />
                  <Link href="/jobs">
                    <Button className="w-full btn-3d text-white font-black border-0 h-11">
                      Browse All Jobs
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
