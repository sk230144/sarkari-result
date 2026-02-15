import { getDashboardStats } from "@/lib/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Briefcase, Crown, Eye, Users } from "lucide-react";
import { SignupChart } from "@/components/admin/signup-chart";

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
