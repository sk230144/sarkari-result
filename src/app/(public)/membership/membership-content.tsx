"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowUpRight,
  Crown,
  Check,
  Star,
  Shield,
  Calendar,
  FileText,
  Headphones,
  Zap,
  CheckCircle2,
  PartyPopper,
  Copy,
  Users,
  Gift,
  ChevronRight,
  Send,
  Share2,
  Twitter,
  Linkedin,
} from "lucide-react";
import { toast } from "sonner";
import { REFERRAL_MILESTONES } from "@/lib/referral-config";

const plans = [
  {
    id: "monthly",
    name: "Monthly",
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
    priceLabel: "₹2,500",
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

const planRank: Record<string, number> = {
  monthly: 0,
  "half-yearly": 1,
  yearly: 2,
  lifetime: 3,
};

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
    title: "Exam Calendar 2026",
    desc: "परीक्षा तिथि, रिजल्ट, एडमिट कार्ड ट्रैक करें",
  },
  {
    icon: Headphones,
    title: "Priority Support",
    desc: "किसी भी समस्या में तुरंत सहायता",
  },
];

export function MembershipContent({
  premiumPlan,
  referralCode,
  referralCount,
  referralDaysEarned,
  isLoggedIn,
}: {
  premiumPlan: string | null;
  referralCode: string | null;
  referralCount: number;
  referralDaysEarned: number;
  isLoggedIn: boolean;
}) {
  const isPremium = !!premiumPlan;
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      setCanNativeShare(true);
    }
  }, []);

  const referralLink = referralCode
    ? `https://jobalerts24.com/auth/signup?ref=${referralCode}`
    : null;

  function copyLink() {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    if (!referralLink) return;
    const msg = encodeURIComponent(
      `🎁 Job Alerts 24 पर Free में Premium पाओ!\n\nमेरे referral link से signup करो और सरकारी नौकरी की तैयारी premium बनाओ:\n${referralLink}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  // Find next milestone
  const nextMilestone = REFERRAL_MILESTONES.find((m) => m.refs > referralCount);
  const refsNeeded = nextMilestone ? nextMilestone.refs - referralCount : 0;

  return (
    <div className="min-h-screen page-bg">
      <div className="page-bg-orb w-[420px] h-[420px] bg-violet-200/[0.08] top-[8%] -left-[10%] animate-float-slow" />
      <div className="page-bg-orb w-[360px] h-[360px] bg-pink-200/[0.07] top-[55%] -right-[8%] animate-float-delayed" />
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
                Premium Membership 2026
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              सरकारी नौकरी की तैयारी को{" "}
              <span className="text-amber-300">Premium</span> बनाएं
            </h1>
            <p className="mt-4 text-blue-100/80 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-medium">
              मेंबर बनें और परीक्षा पास करने पर अपनी आवेदन फीस वापस पाएं। साथ
              ही Document Locker, Exam Calendar 2026 और बहुत कुछ!
            </p>
            <div className="mt-5 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2">
              <span className="text-base">🎁</span>
              <span className="text-white text-sm font-black">10 Friends Refer करें — 7 Days Free Premium पाएं!</span>
              <span className="text-base">✨</span>
            </div>
          </div>
        </div>
      </section>

      {/* Already Premium Banner */}
      {isPremium && (
        <section className="container mx-auto px-4 -mt-6 relative z-20">
          <div className="max-w-2xl mx-auto rounded-2xl border border-emerald-200/70 bg-emerald-50/90 p-5 flex items-center gap-4 shadow-lg">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-emerald-800">
                You are a Premium Member!
              </p>
              <p className="text-xs text-emerald-700/80 font-medium mt-0.5">
                Plan: <span className="font-bold capitalize">{premiumPlan}</span> — All premium tools are unlocked for you.
              </p>
            </div>
            <Link href="/tools" className="ml-auto shrink-0">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                Open Tools
              </Button>
            </Link>
          </div>
        </section>
      )}

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
          <div className="inline-flex items-center gap-2 mb-3">
            <Badge className="bg-violet-100 text-violet-700 font-black text-sm px-4 py-1.5 border border-violet-200">
              🎁 Refer करें — Free Premium पाएं
            </Badge>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">
            अपना Plan चुनें
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-2">
            सभी Plans में Application Fee Refund शामिल है
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto pt-4">
          {plans.map((plan) => {
            const isCurrentPlan = isPremium && premiumPlan === plan.id;
            const currentRank = premiumPlan ? (planRank[premiumPlan] ?? -1) : -1;
            const thisPlanRank = planRank[plan.id] ?? 0;
            const isHigherPlan = isPremium && !isCurrentPlan && thisPlanRank > currentRank;
            const isLowerPlan = isPremium && !isCurrentPlan && thisPlanRank < currentRank;
            const hasBadge = isCurrentPlan || isHigherPlan || (plan.popular && !isPremium);

            const card = (
              <Card
                className={`relative rounded-xl ${
                  isCurrentPlan
                    ? "celebration-card"
                    : `card-3d ${plan.accent}`
                } ${isLowerPlan ? "opacity-60" : ""}`}
              >
                {/* Top accent strip */}
                {!isCurrentPlan && (
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-linear-to-r from-violet-500 to-indigo-500" />
                )}

                {/* Celebration sparkles */}
                {isCurrentPlan && (
                  <>
                    <span className="sparkle-dot" />
                    <span className="sparkle-dot" />
                    <span className="sparkle-dot" />
                    <span className="sparkle-dot" />
                    <span className="sparkle-dot" />
                    <span className="sparkle-dot" />
                  </>
                )}

                {/* Top badge */}
                {hasBadge && (
                  <div className="flex justify-center -mt-2 pt-2">
                    {isCurrentPlan ? (
                      <Badge className="bg-emerald-600 text-white font-bold text-xs px-3 py-1 shadow-lg shadow-emerald-500/30 animate-pulse-soft">
                        <PartyPopper className="h-3 w-3 mr-1" />
                        Activated
                      </Badge>
                    ) : isHigherPlan ? (
                      <Badge className="bg-violet-600 text-white font-bold text-xs px-3 py-1 shadow-lg shadow-violet-500/30">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        Upgrade
                      </Badge>
                    ) : (
                      <Badge className="bg-violet-600 text-white font-bold text-xs px-3 py-1 shadow-lg shadow-violet-500/30">
                        <Star className="h-3 w-3 mr-1" />
                        सबसे लोकप्रिय
                      </Badge>
                    )}
                  </div>
                )}

                <CardHeader className="text-center pb-2 pt-4">
                  <CardTitle className={`text-sm font-extrabold uppercase tracking-wider ${
                    isCurrentPlan ? "text-emerald-700" : "text-slate-600"
                  }`}>
                    {plan.name}
                  </CardTitle>

                  {/* Price */}
                  <div className="mt-3">
                    <div className="flex items-end justify-center gap-1">
                      <span className={`text-3xl font-extrabold ${
                        isCurrentPlan ? "text-emerald-800" : "text-slate-800"
                      }`}>
                        {plan.priceLabel}
                      </span>
                      <span className="text-sm text-slate-500 font-semibold pb-1">
                        {plan.period}
                      </span>
                    </div>
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
                        className={`flex items-center gap-2 text-xs font-medium ${
                          isCurrentPlan ? "text-emerald-700" : "text-slate-600"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <Button className="w-full bg-emerald-600 text-white font-black border-0 hover:bg-emerald-600 cursor-default shadow-lg shadow-emerald-500/30" disabled>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Activated
                    </Button>
                  ) : isHigherPlan ? (
                    <Link href={`/membership/payment?plan=${plan.id}`}>
                      <Button className="w-full gradient-purple text-white font-black border-0 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 shine">
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                        Upgrade करें
                      </Button>
                    </Link>
                  ) : isLowerPlan ? (
                    <Button className="w-full bg-slate-100 text-slate-400 font-bold border-0 cursor-not-allowed" disabled>
                      <Check className="h-4 w-4 mr-2" />
                      Included
                    </Button>
                  ) : (
                    <Link href={`/membership/payment?plan=${plan.id}`}>
                      <Button className={`w-full ${plan.btnClass}`}>
                        <Zap className="h-4 w-4 mr-2" />
                        Premium लें
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );

            if (isCurrentPlan) {
              return (
                <div key={plan.id} className="relative scale-[1.03] z-10">
                  <div className="celebration-border" />
                  {card}
                </div>
              );
            }

            return <div key={plan.id}>{card}</div>;
          })}
        </div>

        <p className="text-center text-xs text-slate-400 font-medium mt-6">
          🎁 Refer करें और Free Premium Days पाएं — 10 friends = 7 days • 20 friends = 18 days • 35 friends = 30 days • 100 friends = 90 days
        </p>
      </section>

      {/* Referral Section */}
      {isLoggedIn && (
        <section id="referral" className="container mx-auto px-4 pb-12">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-full px-4 py-1.5 mb-3">
                <Gift className="h-3.5 w-3.5 text-violet-600" />
                <span className="text-xs font-bold text-violet-700">Refer & Earn Premium</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800">
                दोस्तों को Refer करें, Free Premium पाएं
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1">
                हर referral पर premium days unlock होते हैं — बिल्कुल free!
              </p>
            </div>

            <div className="card-elevated bg-white rounded-2xl border border-slate-200/60 p-6 space-y-6">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center bg-violet-50 rounded-xl p-3 border border-violet-100">
                  <div className="text-2xl font-extrabold text-violet-700">{referralCount}</div>
                  <div className="text-xs font-bold text-violet-600 mt-0.5">Referred</div>
                </div>
                <div className="text-center bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <div className="text-2xl font-extrabold text-emerald-700">{referralDaysEarned}</div>
                  <div className="text-xs font-bold text-emerald-600 mt-0.5">Days Earned</div>
                </div>
                <div className="text-center bg-amber-50 rounded-xl p-3 border border-amber-100">
                  <div className="text-2xl font-extrabold text-amber-700">{refsNeeded > 0 ? refsNeeded : "✓"}</div>
                  <div className="text-xs font-bold text-amber-600 mt-0.5">
                    {refsNeeded > 0 ? "More to next reward" : "All unlocked!"}
                  </div>
                </div>
              </div>

              {/* Progress to next milestone */}
              {nextMilestone && (
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                    <span>Progress to +{nextMilestone.days} days</span>
                    <span>{referralCount}/{nextMilestone.refs} referrals</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-purple rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((referralCount / nextMilestone.refs) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Milestones */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Reward Milestones</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {REFERRAL_MILESTONES.map((m) => {
                    const done = referralCount >= m.refs;
                    return (
                      <div
                        key={m.refs}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 border text-xs font-bold transition-all ${
                          done
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-slate-50 border-slate-200 text-slate-500"
                        }`}
                      >
                        {done ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        )}
                        <span>{m.refs} friends</span>
                        <span className="ml-auto font-black">{m.days}d</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Referral link box */}
              <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-200 p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Share2 className="h-4 w-4 text-violet-600" />
                  <p className="text-sm font-extrabold text-violet-800">अपना Referral Link Share करें</p>
                </div>

                {/* Link display */}
                {referralLink ? (
                  <div className="flex items-center gap-2 bg-white border border-violet-200 rounded-xl px-3 py-2.5 shadow-sm">
                    <span className="text-xs text-slate-600 font-mono truncate flex-1">
                      {referralLink}
                    </span>
                    <button
                      onClick={copyLink}
                      className="shrink-0 flex items-center gap-1.5 text-xs font-black text-violet-600 hover:text-violet-800 bg-violet-50 hover:bg-violet-100 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                      {copied ? "✓ Copied!" : "Copy"}
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-400 font-medium text-center">
                    Loading your referral link...
                  </div>
                )}

                {/* Share via buttons */}
                <div className={`grid grid-cols-2 gap-2 ${!referralLink ? "opacity-40 pointer-events-none" : ""}`}>
                  {/* WhatsApp */}
                  <button
                    onClick={shareWhatsApp}
                    className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20b858] text-white font-black text-xs px-3 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <svg className="h-4 w-4 fill-white shrink-0" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.117 1.526 5.845L0 24l6.335-1.506A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.92 0-3.71-.518-5.248-1.418l-.376-.224-3.762.894.942-3.653-.245-.387A9.815 9.815 0 012.182 12c0-5.413 4.405-9.818 9.818-9.818 5.413 0 9.818 4.405 9.818 9.818 0 5.413-4.405 9.818-9.818 9.818z"/></svg>
                    WhatsApp
                  </button>

                  {/* Telegram */}
                  <button
                    onClick={() => {
                      const msg = encodeURIComponent(`🎁 Job Alerts 24 पर Free Premium पाओ! मेरे link से signup करो:\n${referralLink}`);
                      window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink!)}&text=${msg}`, "_blank");
                    }}
                    className="flex items-center justify-center gap-2 bg-[#229ED9] hover:bg-[#1a8bbf] text-white font-black text-xs px-3 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <Send className="h-3.5 w-3.5 shrink-0" />
                    Telegram
                  </button>

                  {/* Twitter/X */}
                  <button
                    onClick={() => {
                      const text = encodeURIComponent(`🎁 Job Alerts 24 पर Free Premium पाओ! मेरे referral link से signup करो और सरकारी नौकरी की तैयारी premium बनाओ!\n${referralLink}`);
                      window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
                    }}
                    className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-black text-xs px-3 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <Twitter className="h-3.5 w-3.5 shrink-0" />
                    Twitter / X
                  </button>

                  {/* LinkedIn */}
                  <button
                    onClick={() => {
                      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink!)}`, "_blank");
                    }}
                    className="flex items-center justify-center gap-2 bg-[#0077B5] hover:bg-[#005f8e] text-white font-black text-xs px-3 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <Linkedin className="h-3.5 w-3.5 shrink-0" />
                    LinkedIn
                  </button>
                </div>

                {/* Native share (mobile) */}
                {canNativeShare && (
                  <button
                    onClick={() => {
                      navigator.share({
                        title: "Job Alerts 24 — Free Premium",
                        text: "मेरे referral link से signup करो और Free Premium पाओ!",
                        url: referralLink!,
                      }).catch(() => {});
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-violet-200 text-violet-700 font-black text-xs px-3 py-2.5 rounded-xl transition-all hover:bg-violet-50"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    More Options (Share Sheet)
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Not logged in — referral teaser */}
      {!isLoggedIn && (
        <section className="container mx-auto px-4 pb-12">
          <div className="max-w-3xl mx-auto card-elevated bg-white rounded-2xl border border-violet-200/60 p-6 text-center">
            <div className="icon-3d h-12 w-12 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto">
              <Gift className="h-5 w-5 text-violet-600" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-800 mt-3">Refer करें, Free Premium पाएं</h3>
            <p className="text-sm text-slate-500 font-medium mt-1.5 max-w-sm mx-auto">
              10 friends refer करें → 7 days free। 20 friends → 18 days। 35 friends → 1 month!
            </p>
            <Link href="/auth/signup" className="mt-4 inline-block">
              <Button className="gradient-purple text-white font-black border-0 shadow-lg shadow-violet-500/25">
                <Users className="h-4 w-4 mr-2" />
                Sign Up & Get Your Referral Link
              </Button>
            </Link>
          </div>
        </section>
      )}

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
