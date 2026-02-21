import Link from "next/link";
import {
  Briefcase,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Users,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAdmin } from "@/lib/actions/admin";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <header className="sticky top-0 z-50 border-b border-white/20 glass-strong shadow-lg shadow-blue-900/5">
        <div className="container mx-auto flex h-14 items-center justify-between px-3 md:px-4">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <Link href="/admin" className="flex items-center gap-2 shrink-0">
              <div className="icon-3d h-8 w-8 rounded-lg gradient-hero flex items-center justify-center">
                <LayoutDashboard className="h-4 w-4 text-white" />
              </div>
              <span className="font-extrabold text-slate-800 hidden sm:block">Admin</span>
            </Link>
            <nav className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
              <Link href="/admin">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-blue-700 hover:bg-blue-50 font-semibold whitespace-nowrap text-xs md:text-sm px-2 md:px-3"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 md:mr-1.5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <Link href="/admin/jobs">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-blue-700 hover:bg-blue-50 font-semibold whitespace-nowrap text-xs md:text-sm px-2 md:px-3"
                >
                  <Briefcase className="h-3.5 w-3.5 md:mr-1.5" />
                  <span className="hidden xs:inline">Jobs</span>
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-blue-700 hover:bg-blue-50 font-semibold whitespace-nowrap text-xs md:text-sm px-2 md:px-3"
                >
                  <Users className="h-3.5 w-3.5 md:mr-1.5" />
                  <span className="hidden sm:inline">Users</span>
                </Button>
              </Link>
              <Link href="/admin/blog">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-blue-700 hover:bg-blue-50 font-semibold whitespace-nowrap text-xs md:text-sm px-2 md:px-3"
                >
                  <BookOpen className="h-3.5 w-3.5 md:mr-1.5" />
                  <span className="hidden sm:inline">Blog</span>
                </Button>
              </Link>
              <Link href="/" target="_blank">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-blue-700 hover:bg-blue-50 whitespace-nowrap text-xs md:text-sm px-2 md:px-3"
                >
                  <ExternalLink className="h-3.5 w-3.5 md:mr-1.5" />
                  <span className="hidden md:inline">View Site</span>
                </Button>
              </Link>
            </nav>
          </div>
          <form action={logoutAdmin} className="shrink-0">
            <Button
              variant="ghost"
              size="sm"
              type="submit"
              className="text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs md:text-sm px-2 md:px-3"
            >
              <LogOut className="h-4 w-4 md:mr-1.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </form>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {children}
      </main>
    </div>
  );
}
