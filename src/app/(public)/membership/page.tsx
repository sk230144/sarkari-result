"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Crown,
  Check,
  Star,
  Shield,
  Calendar,
  FileText,
  Headphones,
  Zap,
} from "lucide-react";

const plans = [
  {
    id: "monthly",
    name: "Monthly",
    price: 99,
    priceLabel: "₹99",
    period: "/महीना",
    duration: "1 महीना",
    popular: false,
    accent: "border-slate-200",
    btnClass: "btn-3d text-white font-black border-0",
    features: [
      "Application Fee Refund",
      "Document Locker",
      "Exam Calendar",
      "Email Support",
    ],
  },
  {
    id: "half-yearly",
    name: "Half-Yearly",
    price: 500,
    priceLabel: "₹500",
    period: "/6 महीने",
    duration: "6 महीने",
    popular: false,
    accent: "border-blue-200",
    btnClass: "btn-3d text-white font-black border-0",
    features: [
      "Application Fee Refund",
      "Document Locker",
      "Exam Calendar",
      "Priority Support",
      "Exam Alerts",
    ],
  },
  {
    id: "yearly",
    name: "Yearly",
    price: 900,
    priceLabel: "₹900",
    period: "/साल",
    duration: "12 महीने",
    popular: true,
    accent: "border-violet-400 ring-2 ring-violet-200",
    btnClass:
      "w-full h-12 gradient-purple text-white font-black shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 shine rounded-lg",
    features: [
      "Application Fee Refund",
      "Document Locker",
      "Exam Calendar",
      "Priority Support",
      "Exam Alerts",
      "Resume Builder Access",
    ],
  },
  {
    id: "lifetime",
    name: "Lifetime",
    price: 5000,
    priceLabel: "₹5,000",
    period: "",
    duration: "हमेशा के लिए",
    popular: false,
    accent: "border-amber-200",
    btnClass: "btn-3d text-white font-black border-0",
    features: [
      "Application Fee Refund",
      "Document Locker",
      "Exam Calendar",
      "Priority Support",
      "Exam Alerts",
      "Resume Builder Access",
      "Lifetime Updates",
      "VIP Badge",
    ],
  },
];

const highlights = [
  {
    icon: Shield,
    title: "आवेदन फीस वापसी",
    desc: "परीक्षा पास करने पर आवेदन शुल्क वापस",
  },
  {
    icon: FileText,
    title: "Document Locker",
    desc: "आधार, मार्कशीट, फोटो सुरक्षित रखें",
  },
  {
    icon: Calendar,
    title: "Exam Calendar",
    desc: "परीक्षा तिथि, रिजल्ट, एडमिट कार्ड ट्रैक करें",
  },
  {
    icon: Headphones,
    title: "Priority Support",
    desc: "किसी भी समस्या में तुरंत सहायता",
  },
];

export default function MembershipPage() {
  return (
    <div className="min-h-screen page-bg">
      <div className="page-bg-orb w-[420px] h-[420px] bg-violet-200/[0.08] top-[8%] -left-[10%] animate-float-slow" />
      <div className="page-bg-orb w-[360px] h-[360px] bg-blue-200/[0.07] top-[55%] -right-[8%] animate-float-delayed" />
      <div className="page-bg-orb w-[320px] h-[320px] bg-amber-200/[0.06] bottom-[5%] left-[15%] animate-float" />

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

        <div className="relative container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-4">
              <Crown className="h-3.5 w-3.5 text-amber-300" />
              <span className="text-white/90 text-xs font-bold">
                Premium Membership
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              सरकारी नौकरी की तैयारी को{" "}
              <span className="text-amber-300">Premium</span> बनाएं
            </h1>
            <p className="mt-4 text-blue-100/80 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-medium">
              मेंबर बनें और परीक्षा पास करने पर अपनी आवेदन फीस वापस पाएं। साथ
              ही Document Locker, Exam Calendar और बहुत कुछ!
            </p>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="card-elevated bg-white rounded-xl border border-slate-200/60 p-4 text-center"
              >
                <div className="icon-3d h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center mx-auto">
                  <Icon className="h-5 w-5 text-violet-600" />
                </div>
                <h3 className="text-xs font-extrabold text-slate-800 mt-2">
                  {item.title}
                </h3>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-snug">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">
            अपना Plan चुनें
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-2">
            सभी Plans में Application Fee Refund शामिल है
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`card-3d relative ${plan.accent} ${
                plan.popular ? "scale-[1.02]" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-violet-600 text-white font-bold text-xs px-3 py-1 shadow-lg shadow-violet-500/30">
                    <Star className="h-3 w-3 mr-1" />
                    सबसे लोकप्रिय
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-sm font-extrabold text-slate-600 uppercase tracking-wider">
                  {plan.name}
                </CardTitle>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold text-slate-800">
                    {plan.priceLabel}
                  </span>
                  <span className="text-sm text-slate-500 font-semibold">
                    {plan.period}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  {plan.duration}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-xs text-slate-600 font-medium"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={`/membership/payment?plan=${plan.id}`}>
                  <Button className={`w-full ${plan.btnClass}`}>
                    <Zap className="h-4 w-4 mr-2" />
                    Plan चुनें
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="container mx-auto px-4 pb-12">
        <div className="card-elevated bg-white rounded-2xl border border-slate-200/60 p-8 max-w-3xl mx-auto text-center">
          <div className="icon-3d h-14 w-14 rounded-2xl gradient-hero flex items-center justify-center mx-auto">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-800 mt-4">
            100% सुरक्षित और भरोसेमंद
          </h3>
          <p className="text-sm text-slate-500 font-medium mt-2 max-w-md mx-auto leading-relaxed">
            आपका पैसा सुरक्षित है। अगर आपको हमारी सेवा पसंद नहीं आती, तो 7 दिन
            के अंदर पूरा रिफंड पाएं। कोई सवाल नहीं पूछा जाएगा।
          </p>
        </div>
      </section>
    </div>
  );
}
