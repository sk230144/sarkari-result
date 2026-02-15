"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Crown,
  ArrowLeft,
  QrCode,
  Clock,
  Shield,
  Check,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

const PLANS: Record<
  string,
  { name: string; price: number; priceLabel: string; duration: string }
> = {
  monthly: {
    name: "Monthly",
    price: 99,
    priceLabel: "₹99",
    duration: "1 महीना",
  },
  "half-yearly": {
    name: "Half-Yearly",
    price: 500,
    priceLabel: "₹500",
    duration: "6 महीने",
  },
  yearly: {
    name: "Yearly",
    price: 900,
    priceLabel: "₹900",
    duration: "12 महीने",
  },
  lifetime: {
    name: "Lifetime",
    price: 5000,
    priceLabel: "₹5,000",
    duration: "हमेशा के लिए",
  },
};

const DUMMY_UPI = "sarkariresult@upi";

interface Props {
  user: { name: string; email: string };
  selectedPlan: string;
}

export function PaymentClient({ user, selectedPlan }: Props) {
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan") || selectedPlan;
  const plan = PLANS[planId] || PLANS.yearly;

  return (
    <div className="min-h-screen page-bg">
      <div className="page-bg-orb w-[420px] h-[420px] bg-violet-200/[0.08] top-[8%] -left-[10%] animate-float-slow" />
      <div className="page-bg-orb w-[360px] h-[360px] bg-blue-200/[0.07] top-[55%] -right-[8%] animate-float-delayed" />

      {/* Hero */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative container mx-auto px-4 py-10 md:py-12">
          <Link
            href="/membership"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm font-bold mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Plans पर वापस जाएं
          </Link>
          <div className="flex items-center gap-3">
            <div className="icon-3d h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Crown className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Payment
              </h1>
              <p className="text-blue-100/80 text-sm font-medium">
                {user.name} · {user.email}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Plan Summary */}
          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="text-base font-extrabold text-slate-800">
                आपका Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-violet-50 border border-violet-200/60">
                <div>
                  <p className="text-sm font-extrabold text-violet-800">
                    {plan.name} Plan
                  </p>
                  <p className="text-xs text-violet-600 font-medium">
                    {plan.duration}
                  </p>
                </div>
                <span className="text-2xl font-extrabold text-violet-800">
                  {plan.priceLabel}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  शामिल सुविधाएं
                </h4>
                <ul className="space-y-1.5">
                  {[
                    "Application Fee Refund",
                    "Document Locker Access",
                    "Exam Calendar",
                    "Priority Support",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-xs text-slate-600 font-medium"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/membership">
                <Button
                  variant="outline"
                  className="w-full font-bold text-sm"
                >
                  Plan बदलें
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* QR Code / Payment */}
          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                QR Code से भुगतान करें
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dummy QR Code */}
              <div className="flex justify-center">
                <div className="relative p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
                  <svg
                    width="180"
                    height="180"
                    viewBox="0 0 180 180"
                    className="rounded-lg"
                  >
                    {/* QR code pattern placeholder */}
                    <rect width="180" height="180" fill="white" />
                    {/* Corner squares */}
                    <rect x="10" y="10" width="40" height="40" rx="4" fill="#1e293b" />
                    <rect x="16" y="16" width="28" height="28" rx="2" fill="white" />
                    <rect x="22" y="22" width="16" height="16" rx="1" fill="#1e293b" />

                    <rect x="130" y="10" width="40" height="40" rx="4" fill="#1e293b" />
                    <rect x="136" y="16" width="28" height="28" rx="2" fill="white" />
                    <rect x="142" y="22" width="16" height="16" rx="1" fill="#1e293b" />

                    <rect x="10" y="130" width="40" height="40" rx="4" fill="#1e293b" />
                    <rect x="16" y="136" width="28" height="28" rx="2" fill="white" />
                    <rect x="22" y="142" width="16" height="16" rx="1" fill="#1e293b" />

                    {/* Random data blocks */}
                    {[
                      [60, 10], [70, 10], [80, 10], [100, 10], [110, 10],
                      [60, 20], [90, 20], [110, 20],
                      [60, 30], [70, 30], [80, 30], [90, 30], [100, 30], [110, 30],
                      [60, 40], [80, 40], [100, 40],
                      [10, 60], [20, 60], [40, 60], [60, 60], [80, 60], [90, 60], [120, 60], [140, 60], [160, 60],
                      [10, 70], [30, 70], [50, 70], [70, 70], [100, 70], [110, 70], [130, 70], [150, 70],
                      [20, 80], [40, 80], [60, 80], [70, 80], [80, 80], [110, 80], [120, 80], [140, 80], [160, 80],
                      [10, 90], [30, 90], [50, 90], [80, 90], [90, 90], [100, 90], [130, 90], [150, 90],
                      [20, 100], [40, 100], [70, 100], [90, 100], [110, 100], [120, 100], [140, 100], [160, 100],
                      [10, 110], [30, 110], [60, 110], [80, 110], [100, 110], [130, 110], [150, 110],
                      [60, 120], [70, 120], [80, 120], [90, 120], [100, 120], [110, 120],
                      [60, 130], [80, 130], [100, 130], [120, 130], [140, 130], [160, 130],
                      [60, 140], [70, 140], [90, 140], [110, 140], [130, 140], [150, 140],
                      [60, 150], [80, 150], [90, 150], [100, 150], [120, 150], [140, 150], [160, 150],
                      [60, 160], [70, 160], [80, 160], [110, 160], [130, 160], [150, 160], [160, 160],
                    ].map(([cx, cy], i) => (
                      <rect key={i} x={cx} y={cy} width="8" height="8" rx="1" fill="#1e293b" />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white p-1.5 rounded-lg shadow-sm">
                      <Crown className="h-5 w-5 text-violet-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-1">
                <p className="text-sm font-extrabold text-slate-800">
                  {plan.priceLabel} भुगतान करें
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  किसी भी UPI App से स्कैन करें
                </p>
              </div>

              {/* UPI ID */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    UPI ID
                  </p>
                  <p className="text-sm font-bold text-slate-700 truncate">
                    {DUMMY_UPI}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-slate-500 hover:text-blue-600"
                  onClick={() => {
                    navigator.clipboard.writeText(DUMMY_UPI);
                    toast.success("UPI ID copied!");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700 font-semibold">
                  भुगतान के बाद 24 घंटे में आपका account activate हो जाएगा
                </p>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-700 font-semibold">
                  7 दिन की money-back guarantee
                </p>
              </div>

              <Badge
                variant="secondary"
                className="w-full justify-center py-2 text-xs font-bold bg-slate-100 text-slate-500"
              >
                Demo Mode — Payment integration जल्द आ रहा है
              </Badge>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
