"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Crown,
  ArrowLeft,
  QrCode,
  Shield,
  Check,
  Copy,
  MessageCircle,
  Send,
  Zap,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const PLANS: Record<
  string,
  {
    name: string;
    price: number;
    priceLabel: string;
    duration: string;
    qrImage: string;
  }
> = {
  monthly: {
    name: "Monthly",
    price: 49,
    priceLabel: "₹49",
    duration: "1 महीना",
    qrImage: "/qr/rs99.jpeg",
  },
  "half-yearly": {
    name: "Half-Yearly",
    price: 250,
    priceLabel: "₹250",
    duration: "6 महीने",
    qrImage: "/qr/rs500.jpeg",
  },
  yearly: {
    name: "Yearly",
    price: 450,
    priceLabel: "₹450",
    duration: "12 महीने",
    qrImage: "/qr/rs900.jpeg",
  },
  lifetime: {
    name: "Lifetime",
    price: 2500,
    priceLabel: "₹2,500",
    duration: "हमेशा के लिए",
    qrImage: "/qr/5000rs.jpeg",
  },
};

const UPI_ID = "risabht043@okaxis";
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

  const whatsappMessage = `Hello Job Alerts 24 Team,\n\nI want to activate my Premium Membership.\n\n*Plan:* ${plan.name} (${plan.priceLabel})\n*Name:* ${user.name}\n*Email:* ${user.email}\n\nI have completed the payment. Please activate my account.`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  async function handleRazorpayPayment() {
    setLoading(true);
    try {
      // 1. Create order
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const { orderId, amount, error } = await res.json();
      if (error || !orderId) throw new Error(error || "Order creation failed");

      // 2. Load Razorpay script if not already loaded
      await loadRazorpayScript();

      // 3. Open checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency: "INR",
        name: "Job Alerts 24",
        description: `${plan.name} Premium Membership`,
        order_id: orderId,
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: "#7c3aed" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          // 4. Verify payment and activate premium
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planId,
            }),
          });
          const result = await verifyRes.json();
          if (result.success) {
            toast.success("Payment successful! Premium activated 🎉");
            router.push("/tools");
          } else {
            toast.error("Payment verified but activation failed. Contact support.");
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
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
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
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
                <Button variant="outline" className="w-full font-bold text-sm">
                  Plan बदलें
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Payment Options */}
          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Zap className="h-4 w-4 text-violet-600" />
                भुगतान करें
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Razorpay Button */}
              <Button
                onClick={handleRazorpayPayment}
                disabled={loading}
                className="w-full h-12 gradient-purple text-white font-black text-sm border-0 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 shine"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                {loading ? "Loading..." : `Pay ${plan.priceLabel} — UPI / Card / Net Banking`}
              </Button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-semibold">या</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* QR Code fallback */}
              <div>
                <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-3">
                  <QrCode className="h-3.5 w-3.5" />
                  QR Code से भुगतान करें
                </p>
                <div className="flex justify-center">
                  <div className="relative p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
                    <Image
                      src={plan.qrImage}
                      alt={`${plan.name} Plan QR Code - ${plan.priceLabel}`}
                      width={160}
                      height={160}
                      className="rounded-lg"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* UPI ID */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    UPI ID
                  </p>
                  <p className="text-sm font-bold text-slate-700 truncate">{UPI_ID}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-slate-500 hover:text-blue-600"
                  onClick={() => {
                    navigator.clipboard.writeText(UPI_ID);
                    toast.success("UPI ID copied!");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-700 font-semibold">
                  Secure payment · 7 दिन की money-back guarantee
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* WhatsApp Activation Section — only for QR/manual payments */}
        <div className="max-w-3xl mx-auto mt-6">
          <Card className="card-3d border-emerald-200/60">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <MessageCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800">
                      QR से Payment के बाद WhatsApp पर भेजें
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      अगर आपने QR code से payment किया है तो नीचे दिए बटन पर
                      क्लिक करें। Screenshot भेजें — Premium तुरंत activate होगा।
                      Razorpay से payment करने पर automatic activate होगा।
                    </p>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <span className="font-bold text-slate-700">Plan:</span>
                        {plan.name} ({plan.priceLabel})
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <span className="font-bold text-slate-700">Name:</span>
                        {user.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <span className="font-bold text-slate-700">Email:</span>
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full h-12 bg-[#25D366] hover:bg-[#1ebe57] text-white font-black text-sm border-0 shadow-md shadow-emerald-500/20">
                      <Send className="h-4 w-4 mr-2" />
                      WhatsApp पर Payment Confirm करें
                    </Button>
                  </a>

                  <Badge
                    variant="secondary"
                    className="w-full justify-center py-1.5 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200"
                  >
                    Razorpay से payment पर automatic activate · QR payment पर WhatsApp confirm करें
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) return resolve(); // eslint-disable-line @typescript-eslint/no-explicit-any
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(script);
  });
}
