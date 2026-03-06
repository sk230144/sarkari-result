"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Crown,
  ArrowLeft,
  Shield,
  Check,
  Zap,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const PLANS: Record<string, { name: string; priceLabel: string; duration: string }> = {
  monthly: { name: "Monthly", priceLabel: "₹49", duration: "1 महीना" },
  "half-yearly": { name: "Half-Yearly", priceLabel: "₹250", duration: "6 महीने" },
  yearly: { name: "Yearly", priceLabel: "₹450", duration: "12 महीने" },
  lifetime: { name: "Lifetime", priceLabel: "₹2,500", duration: "हमेशा के लिए" },
};

const WHATSAPP_NUMBER = "916392891566";

interface Props {
  user: { name: string; email: string };
  selectedPlan: string;
}

export function PaymentClient({ user, selectedPlan }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan") || selectedPlan;
  const plan = PLANS[planId] || PLANS.yearly;
  const [loading, setLoading] = useState(false);

  const whatsappMessage = `Hello Job Alerts 24 Team,\n\nPayment issue — please help activate my Premium.\n\n*Plan:* ${plan.name} (${plan.priceLabel})\n*Name:* ${user.name}\n*Email:* ${user.email}`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  async function handleCashfreePayment() {
    setLoading(true);
    try {
      const res = await fetch("/api/cashfree/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const { orderId, paymentSessionId, error } = await res.json();
      if (error || !paymentSessionId) throw new Error(error || "Order creation failed");

      await loadCashfreeScript();
      const cashfree = initCashfree();

      cashfree.checkout({ paymentSessionId, redirectTarget: "_modal" }).then(
        async (result: { error?: { message: string }; redirect?: boolean }) => {
          if (result.error) {
            toast.error(result.error.message || "Payment failed. Please try again.");
            setLoading(false);
            return;
          }
          if (result.redirect) return;

          const verifyRes = await fetch("/api/cashfree/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId, plan: planId }),
          });
          const verifyResult = await verifyRes.json();

          if (verifyResult.success) {
            toast.success("Payment successful! Premium activated 🎉");
            router.push("/tools");
          } else {
            toast.error("Payment done but activation failed. Contact support.");
            setLoading(false);
          }
        }
      );
    } catch (err) {
      console.error(err);
      toast.error("Payment failed. Please try again.");
      setLoading(false);
    }
  }

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
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>
        <div className="relative container mx-auto px-4 py-8 md:py-10">
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
        <div className="max-w-md mx-auto space-y-4">
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
                  <p className="text-sm font-extrabold text-violet-800">{plan.name} Plan</p>
                  <p className="text-xs text-violet-600 font-medium">{plan.duration}</p>
                </div>
                <span className="text-2xl font-extrabold text-violet-800">{plan.priceLabel}</span>
              </div>

              <ul className="space-y-1.5">
                {["Application Fee Refund", "Document Locker Access", "Exam Calendar", "Priority Support"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/membership">
                <Button variant="outline" className="w-full font-bold text-sm">
                  Plan बदलें
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pay Button */}
          <Button
            onClick={handleCashfreePayment}
            disabled={loading}
            className="w-full h-14 gradient-purple text-white font-black text-base border-0 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 shine"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Zap className="h-5 w-5 mr-2" />
            )}
            {loading ? "Loading..." : `Pay ${plan.priceLabel} — UPI / Card / Net Banking`}
          </Button>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
            <p className="text-xs text-emerald-700 font-semibold">
              Secure payment by Cashfree · 7 दिन की money-back guarantee
            </p>
          </div>

          <p className="text-center text-xs text-slate-400 font-medium">
            Payment में problem?{" "}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold underline">
              WhatsApp पर contact करें
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}

function loadCashfreeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).Cashfree) return resolve();
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Cashfree script"));
    document.body.appendChild(script);
  });
}

function initCashfree() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).Cashfree({
    mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === "production" ? "production" : "sandbox",
  });
}
