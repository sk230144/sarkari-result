"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, UserPlus } from "lucide-react";
import { signUp } from "@/lib/actions/auth";
import { toast } from "sonner";

export function SignupForm() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "";

  async function handleSubmit(formData: FormData) {
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
          <div className="icon-3d h-14 w-14 rounded-2xl gradient-green flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25 animate-float-slow">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 mt-4">
            Create Account
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Store your documents securely
          </p>
        </div>

        <div className="card-elevated glow-blue bg-white rounded-2xl border border-slate-200/60 p-7">
          <form action={handleSubmit} className="space-y-5">
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
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 focus:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)] rounded-lg transition-shadow"
              />
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
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 focus:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)] rounded-lg transition-shadow"
              />
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
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 focus:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)] rounded-lg transition-shadow"
              />
            </div>
            <Button
              type="submit"
              className="btn-3d w-full h-11 gradient-hero text-white font-black shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 shine"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              Create Account
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
      </div>
    </div>
  );
}
