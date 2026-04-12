"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, UserPlus, Crown, Eye, EyeOff, Check, X } from "lucide-react";
import { signUp } from "@/lib/actions/auth";
import { toast } from "sonner";

/* ─── Validation rules ─── */
function validateName(value: string) {
  const v = value.trim();
  if (!v) return "Name is required";
  if (v.length < 2) return "Name must be at least 2 characters";
  if (v.length > 50) return "Name must be under 50 characters";
  if (!/^[a-zA-Z\s'.'-]+$/.test(v)) return "Name can only contain letters, spaces, and . ' -";
  if (/\s{2,}/.test(v)) return "Name cannot have consecutive spaces";
  return "";
}

function validateEmail(value: string) {
  const v = value.trim();
  if (!v) return "Email is required";
  if (v.length > 100) return "Email must be under 100 characters";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter a valid email address";
  // block obvious disposable/fake patterns
  if (/(@(mailinator|tempmail|guerrillamail|sharklasers|trashmail|yopmail|fakeinbox|throwam|maildrop)\.)/i.test(v))
    return "Please use a real email address";
  return "";
}

function validatePassword(value: string) {
  if (!value) return "Password is required";
  if (value.length < 8) return "Password must be at least 8 characters";
  if (value.length > 72) return "Password must be under 72 characters";
  if (!/[A-Za-z]/.test(value)) return "Password must contain at least one letter";
  if (!/[0-9]/.test(value)) return "Password must contain at least one number";
  if (/^\s|\s$/.test(value)) return "Password cannot start or end with a space";
  return "";
}

/* ─── Password strength ─── */
function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
  if (score === 2) return { score, label: "Fair", color: "bg-orange-400" };
  if (score === 3) return { score, label: "Good", color: "bg-yellow-400" };
  if (score === 4) return { score, label: "Strong", color: "bg-emerald-400" };
  return { score, label: "Very strong", color: "bg-emerald-500" };
}

/* ─── Field wrapper ─── */
function FieldError({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-500 font-medium mt-1">
      <X className="h-3 w-3 shrink-0" />
      {msg}
    </p>
  );
}

function FieldSuccess({ show }: { show: boolean }) {
  if (!show) return null;
  return <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 pointer-events-none" />;
}

export function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState({ fullName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "";
  const refCode = searchParams.get("ref") || "";
  const isTrial = searchParams.get("trial") === "1";

  const nameErr = touched.fullName ? validateName(values.fullName) : "";
  const emailErr = touched.email ? validateEmail(values.email) : "";
  const passwordErr = touched.password ? validatePassword(values.password) : "";
  const strength = getStrength(values.password);

  function markTouched(field: string) {
    setTouched((p) => ({ ...p, [field]: true }));
  }

  async function handleSubmit(formData: FormData) {
    // Mark all touched and run full validation
    setTouched({ fullName: true, email: true, password: true });
    const errs = [
      validateName(values.fullName),
      validateEmail(values.email),
      validatePassword(values.password),
    ].filter(Boolean);
    if (errs.length > 0) return;

    setLoading(true);
    const result = await signUp(formData);
    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    }
  }

  const nameOk = touched.fullName && !validateName(values.fullName);
  const emailOk = touched.email && !validateEmail(values.email);
  const passwordOk = touched.password && !validatePassword(values.password);

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

            {/* Full Name */}
            <div className="space-y-1">
              <Label htmlFor="fullName" className="text-sm font-semibold text-slate-700">
                Full Name
              </Label>
              <div className="relative">
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Your full name"
                  autoComplete="name"
                  value={values.fullName}
                  onChange={(e) => setValues((p) => ({ ...p, fullName: e.target.value }))}
                  onBlur={() => markTouched("fullName")}
                  maxLength={50}
                  className={`h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 rounded-lg pr-9 transition-all ${
                    nameErr ? "border-red-400 focus:border-red-400 bg-red-50" :
                    nameOk ? "border-emerald-400 focus:border-emerald-400" : ""
                  }`}
                />
                <FieldSuccess show={nameOk} />
              </div>
              <FieldError msg={nameErr} />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                Email Address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={values.email}
                  onChange={(e) => setValues((p) => ({ ...p, email: e.target.value }))}
                  onBlur={() => markTouched("email")}
                  maxLength={100}
                  className={`h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 rounded-lg pr-9 transition-all ${
                    emailErr ? "border-red-400 focus:border-red-400 bg-red-50" :
                    emailOk ? "border-emerald-400 focus:border-emerald-400" : ""
                  }`}
                />
                <FieldSuccess show={emailOk} />
              </div>
              <FieldError msg={emailErr} />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                  value={values.password}
                  onChange={(e) => setValues((p) => ({ ...p, password: e.target.value }))}
                  onBlur={() => markTouched("password")}
                  maxLength={72}
                  className={`h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 rounded-lg pr-16 transition-all ${
                    passwordErr ? "border-red-400 focus:border-red-400 bg-red-50" :
                    passwordOk ? "border-emerald-400 focus:border-emerald-400" : ""
                  }`}
                />
                {/* show/hide toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength bar — only shows when user has typed */}
              {values.password.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score ? strength.color : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <p className={`text-[11px] font-bold ${
                      strength.score <= 1 ? "text-red-500" :
                      strength.score === 2 ? "text-orange-500" :
                      strength.score === 3 ? "text-yellow-600" :
                      "text-emerald-600"
                    }`}>
                      {strength.label}
                      {strength.score <= 2 && " — add uppercase letters or symbols to strengthen"}
                    </p>
                  )}
                </div>
              )}

              <FieldError msg={passwordErr} />

              {/* Requirements hint — shown only before first touch */}
              {!touched.password && (
                <p className="text-[11px] text-slate-400 font-medium">
                  Min 8 characters, at least one letter and one number
                </p>
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
