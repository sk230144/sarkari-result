import Link from "next/link";
import { ArrowUpRight, Briefcase, Crown, Gift, LogIn, LogOut, Menu, MoreVertical, Search, Settings, User } from "lucide-react";
import { HeaderTagline, MobileSheetTagline } from "./site-tagline";
import { JobModeToggle } from "./job-mode-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { CATEGORIES } from "@/lib/constants";
import { getUser, signOut } from "@/lib/actions/auth";
import { isAdmin } from "@/lib/actions/admin";
import { createClient } from "@/lib/supabase/server";

const toolLinks = [
  { href: "/tools", label: "All Tools" },
  { href: "/tools/image", label: "Image Tools" },
  { href: "/tools/image-to-pdf", label: "Image to PDF" },
  { href: "/tools/resume-builder", label: "Resume Builder" },
  { href: "/tools/calendar", label: "Exam Calendar" },
  { href: "/tools/job-alerts", label: "Job Alerts Setup" },
  { href: "/tools/document-locker", label: "Document Locker" },
];

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "Tools" },
  { href: "/blog", label: "Blog" },
  ...CATEGORIES.slice(0, 3).map((cat) => ({
    href: `/jobs?category=${cat.value}`,
    label: cat.label,
  })),
];

const allNavLinks = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "Tools" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About Us" },
  ...CATEGORIES.map((cat) => ({
    href: `/jobs?category=${cat.value}`,
    label: cat.label,
  })),
];

export async function Header() {
  const user = await getUser();
  let userIsAdmin = false;
  let userIsPremium = false;

  if (user) {
    const [adminCheck, supabase] = await Promise.all([
      isAdmin(),
      createClient(),
    ]);
    userIsAdmin = adminCheck;
    const { data } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("id", user.id)
      .single();
    userIsPremium = !!data?.is_premium;
  }

  return (
    <header className="sticky top-0 z-50 w-full glass-strong border-b border-white/40">
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl gradient-hero flex items-center justify-center glow-blue group-hover:glow-blue-strong transition-all duration-300 group-hover:scale-105">
            <Briefcase className="h-4 w-4 md:h-5 md:w-5 text-white drop-shadow-sm" />
          </div>
          <div>
            <span className="font-extrabold text-base md:text-lg tracking-tight text-gradient">
              Job Alerts 24
            </span>
            <HeaderTagline />
          </div>
        </Link>

        {/* Mode toggle */}
        <div className="ml-3 md:ml-4">
          <JobModeToggle />
        </div>

        {/* Tablet nav (md to lg) */}
        <nav className="ml-3 hidden md:flex lg:hidden items-center gap-0.5">
          <Link href="/jobs">
            <Button variant="ghost" size="sm" className="text-slate-700 hover:text-blue-700 hover:bg-blue-50/80 font-bold text-sm rounded-lg">
              Jobs
            </Button>
          </Link>
          <Link href="/tools">
            <Button variant="ghost" size="sm" className="text-slate-700 hover:text-blue-700 hover:bg-blue-50/80 font-bold text-sm rounded-lg">
              Tools
            </Button>
          </Link>
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="text-slate-700 hover:text-blue-700 hover:bg-blue-50/80 font-bold text-sm rounded-lg">
              Blog
            </Button>
          </Link>
          {!userIsAdmin && (
            <Link href="/membership">
              <Button size="sm" className="gradient-purple text-white font-black text-sm rounded-lg border-0 shadow-md shadow-violet-500/20">
                <Crown className="h-3.5 w-3.5 mr-1" />
                Premium
              </Button>
            </Link>
          )}
        </nav>

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
          {userIsAdmin ? (
            <Link href="/admin">
              <Button
                size="sm"
                className="ml-1 bg-slate-800 hover:bg-slate-900 text-white font-black text-sm rounded-lg border-0 shadow-md shadow-slate-500/20 hover:shadow-slate-500/40 transition-shadow"
              >
                <Settings className="h-3.5 w-3.5 mr-1.5" />
                Admin
              </Button>
            </Link>
          ) : (
            <Link href="/membership">
              <Button
                size="sm"
                className="ml-1 gradient-purple text-white font-black text-sm rounded-lg border-0 shadow-md shadow-violet-500/20 hover:shadow-violet-500/40 transition-shadow"
              >
                {userIsPremium ? (
                  <>
                    <ArrowUpRight className="h-3.5 w-3.5 mr-1.5" />
                    Upgrade
                  </>
                ) : (
                  <>
                    <Crown className="h-3.5 w-3.5 mr-1.5" />
                    Premium
                  </>
                )}
              </Button>
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-1.5">
          <Link href="/jobs" className="hidden sm:block">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl"
            >
              <Search className="h-4.5 w-4.5" />
            </Button>
          </Link>

          {/* Auth - Desktop */}
          <div className="hidden sm:block">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-lg font-bold gap-2"
                  >
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <span className="max-w-[100px] truncate text-xs">
                      {user.user_metadata?.full_name || user.email?.split("@")[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="text-xs text-slate-400 font-medium focus:bg-transparent" disabled>
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/membership#referral" className="flex items-center gap-2 font-semibold text-sm text-violet-600">
                      <Gift className="h-3.5 w-3.5" />
                      Refer & Earn
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <form action={signOut} className="w-full">
                      <button type="submit" className="flex items-center gap-2 w-full text-red-600 font-semibold text-sm">
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-blue-700 hover:bg-blue-50/80 font-bold rounded-lg"
                >
                  <LogIn className="h-4 w-4 mr-1.5" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-500 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl"
                aria-label="Tools menu"
              >
                <MoreVertical className="h-4.5 w-4.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {toolLinks.map((tool) => (
                <DropdownMenuItem key={tool.href} asChild>
                  <Link href={tool.href} className="font-semibold">
                    {tool.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile/Tablet hamburger */}
          <div className="md:hidden">
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
                    Job Alerts 24
                  </SheetTitle>
                  <MobileSheetTagline />
                  {user && (
                    <div className="mt-3 flex items-center gap-2 relative">
                      <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-bold truncate">
                          {user.user_metadata?.full_name || "User"}
                        </p>
                        <p className="text-blue-200/70 text-[10px] truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  )}
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
                  {userIsAdmin ? (
                    <Link href="/admin" className="mt-2">
                      <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black border-0 h-11 shadow-md shadow-slate-500/20">
                        <Settings className="h-4 w-4 mr-2" />
                        Admin Panel
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/membership" className="mt-2">
                      <Button className="w-full gradient-purple text-white font-black border-0 h-11 shadow-md shadow-violet-500/20">
                        {userIsPremium ? (
                          <>
                            <ArrowUpRight className="h-4 w-4 mr-2" />
                            Upgrade Plan
                          </>
                        ) : (
                          <>
                            <Crown className="h-4 w-4 mr-2" />
                            Premium Membership
                          </>
                        )}
                      </Button>
                    </Link>
                  )}
                  <div className="my-3 border-t border-slate-100" />
                  {user && (
                    <Link href="/membership#referral">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-violet-600 hover:text-violet-700 hover:bg-violet-50 font-bold rounded-lg"
                        size="sm"
                      >
                        <Gift className="h-4 w-4 mr-2" />
                        Refer & Earn Free Premium
                      </Button>
                    </Link>
                  )}
                  {user ? (
                    <form action={signOut}>
                      <Button
                        type="submit"
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 font-bold rounded-lg"
                        size="sm"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </form>
                  ) : (
                    <Link href="/auth/login">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold rounded-lg"
                        size="sm"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </Button>
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
