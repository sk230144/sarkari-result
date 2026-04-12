"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, UserPlus, Crown } from "lucide-react";
import { signUp } from "@/lib/actions/auth";
import { toast } from "sonner";

export function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "";
  const refCode = searchParams.get("ref") || "";
  const isTrial = searchParams.get("trial") === "1";

  function validate(formData: FormData) {
    const errs: Record<string, string> = {};
    const fullName = (formData.get("fullName") as string).trim();
    const email = (formData.get("email") as string).trim();
    const password = formData.get("password") as string;

    if (!fullName) {
      errs.fullName = "Name is required";
    } else if (fullName.length < 2) {
      errs.fullName = "Name must be at least 2 characters";
    } else if (fullName.length > 50) {
      errs.fullName = "Name must be under 50 characters";
    }

    if (!email) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Enter a valid email address";
    } else if (email.length > 100) {
      errs.email = "Email must be under 100 characters";
    }

    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    } else if (password.length > 72) {
      errs.password = "Password must be under 72 characters";
    }

    return errs;
  }

  async function handleSubmit(formData: FormData) {
    const errs = validate(formData);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    const result = await signUp(formData);
    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-violet-200/15 rounded-full blur-3xl animate-float-slow" />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className={`icon-3d h-14 w-14 rounded-2xl flex items-center justify-center mx-auto shadow-lg animate-float-slow ${isTrial ? "bg-linear-to-br from-violet-500 to-purple-600 shadow-violet-500/25" : "gradient-green shadow-emerald-500/25"}`}>
            {isTrial ? <Crown className="h-6 w-6 text-white" /> : <Shield className="h-6 w-6 text-white" />}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 mt-4">
            {isTrial ? "Claim Free Premium" : "Create Account"}
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {isTrial ? "Sign up & get 7 days Premium FREE — no card needed" : "Store your documents securely"}
          </p>
        </div>

        {isTrial && (
          <div className="mb-4 flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3">
            <span className="text-2xl">👑</span>
            <div>
              <p className="text-xs font-black text-violet-700">7 Days FREE Premium — Activated on Signup!</p>
              <p className="text-[11px] text-violet-500 font-medium mt-0.5">AI Resume Analyzer • 100+ Hiring Profiles • All features unlocked</p>
            </div>
          </div>
        )}

        {refCode && (
          <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
            <span className="text-emerald-600 text-base">🎁</span>
            <p className="text-xs font-bold text-emerald-700">
              Referral code applied: <span className="font-black">{refCode}</span>
            </p>
          </div>
        )}

        <div className="card-elevated glow-blue bg-white rounded-2xl border border-slate-200/60 p-7">
          <form action={handleSubmit} className="space-y-5">
            <input type="hidden" name="refCode" value={refCode} />
            {isTrial && <input type="hidden" name="trial" value="1" />}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-semibold text-slate-700">
                Full Name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Your full name"
                required
                minLength={2}
                maxLength={50}
                className={`h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 focus:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)] rounded-lg transition-shadow ${errors.fullName ? "border-red-400 focus:border-red-400" : ""}`}
              />
              {errors.fullName && (
                <p className="text-xs text-red-500 font-medium">{errors.fullName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                maxLength={100}
                className={`h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 focus:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)] rounded-lg transition-shadow ${errors.email ? "border-red-400 focus:border-red-400" : ""}`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Min 6 characters"
                required
                minLength={6}
                maxLength={72}
                className={`h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 focus:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)] rounded-lg transition-shadow ${errors.password ? "border-red-400 focus:border-red-400" : ""}`}
              />
              {errors.password && (
                <p className="text-xs text-red-500 font-medium">{errors.password}</p>
              )}
            </div>
            <Button
              type="submit"
              className={`btn-3d w-full h-11 text-white font-black shine ${isTrial ? "bg-linear-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40" : "gradient-hero shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"}`}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : isTrial ? (
                <Crown className="h-4 w-4 mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              {isTrial ? "Sign Up & Claim Free Premium" : "Create Account"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6 font-medium">
          Already have an account?{" "}
          <Link
            href={`/auth/login${redirectTo ? `?redirect=${redirectTo}` : ""}`}
            className="text-blue-600 hover:text-blue-800 font-bold link-hover"
          >
            Sign In
          </Link>
        </p>
        {!refCode && (
          <p className="text-center text-xs text-slate-400 mt-2 font-medium">
            Have a referral code?{" "}
            <span className="text-violet-600 font-bold">Add it in the URL: ?ref=YOURCODE</span>
          </p>
        )}
      </div>
    </div>
  );
}
