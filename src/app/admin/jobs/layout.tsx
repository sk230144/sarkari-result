import Link from "next/link";
import { Briefcase, ExternalLink, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAdmin } from "@/lib/actions/admin";

export default function AdminJobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <header className="sticky top-0 z-50 border-b border-white/20 glass-strong shadow-lg shadow-blue-900/5">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/jobs"
              className="flex items-center gap-2.5"
            >
              <div className="icon-3d h-8 w-8 rounded-lg gradient-hero flex items-center justify-center">
                <LayoutDashboard className="h-4 w-4 text-white" />
              </div>
              <span className="font-extrabold text-slate-800">Admin</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-1 ml-2">
              <Link href="/admin/jobs">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-blue-700 hover:bg-blue-50 font-semibold"
                >
                  <Briefcase className="h-4 w-4 mr-1.5" />
                  Jobs
                </Button>
              </Link>
              <Link href="/" target="_blank">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  View Site
                </Button>
              </Link>
            </nav>
          </div>
          <form action={logoutAdmin}>
            <Button
              variant="ghost"
              size="sm"
              type="submit"
              className="text-slate-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Logout
            </Button>
          </form>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 max-w-5xl">{children}</main>
    </div>
  );
}
