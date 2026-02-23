import Link from "next/link";
import { getDashboardStats } from "@/lib/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Briefcase, BookOpen, Crown, Eye, Users, ArrowRight } from "lucide-react";
import { SignupChart } from "@/components/admin/signup-chart";
import { RunScraperBtn } from "@/components/admin/run-scraper-btn";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Premium Users",
      value: stats.premiumUsers,
      icon: Crown,
      color: "bg-violet-50 text-violet-600",
    },
    {
      label: "Total Jobs",
      value: stats.totalJobs,
      icon: Briefcase,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Published Jobs",
      value: stats.publishedJobs,
      icon: Eye,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Alert Subscribers",
      value: stats.alertUsers,
      icon: Bell,
      color: "bg-rose-50 text-rose-600",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5 font-medium">
          Overview of your portal
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="card-3d">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-slate-800">
                      {stat.value}
                    </p>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Links + Scraper */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          {
            href: "/admin/jobs",
            label: "Manage Jobs",
            desc: "Add, edit or delete job listings",
            icon: Briefcase,
            color: "bg-blue-50 text-blue-600",
          },
          {
            href: "/admin/blog",
            label: "Manage Blog",
            desc: "Write and publish blog posts",
            icon: BookOpen,
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            href: "/admin/users",
            label: "Manage Users",
            desc: "View and manage user accounts",
            icon: Users,
            color: "bg-violet-50 text-violet-600",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className="card-3d hover:border-blue-200 transition-colors group cursor-pointer h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </CardContent>
              </Card>
            </Link>
          );
        })}

        {/* Auto Scraper Card */}
        <Card className="card-3d border-amber-200/60">
          <CardContent className="p-4">
            <div className="mb-3">
              <p className="font-extrabold text-slate-800 text-sm">Auto Scraper</p>
              <p className="text-xs text-slate-400 font-medium">
                Fetch jobs from SSC, UPSC, IBPS, Railway official sites
              </p>
            </div>
            <RunScraperBtn />
          </CardContent>
        </Card>
      </div>

      {/* Signup Chart */}
      <Card className="card-3d">
        <CardHeader>
          <CardTitle className="text-base font-extrabold text-slate-800">
            User Signups (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SignupChart data={stats.signupChart} />
        </CardContent>
      </Card>
    </div>
  );
}
