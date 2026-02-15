"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, CheckCircle2, Loader2 } from "lucide-react";
import { saveJobAlertPreferences } from "@/lib/actions/job-alerts";
import { toast } from "sonner";

type Step = 1 | 2 | 3;

const QUALIFICATIONS = [
  "10th Pass",
  "12th Pass",
  "Graduate",
  "Post Graduate",
  "Diploma",
];

const DEGREE_MAP: Record<string, string[]> = {
  "10th Pass": ["General"],
  "12th Pass": ["Arts", "Commerce", "Science", "Other"],
  Graduate: ["B.A", "B.Com", "B.Sc", "B.Tech", "BBA", "Other"],
  "Post Graduate": ["M.A", "M.Com", "M.Sc", "M.Tech", "MBA", "Other"],
  Diploma: ["Engineering", "Computer", "Medical", "Other"],
};

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length > 10) {
    return digits.slice(2);
  }
  return digits;
}

interface JobAlertsFormProps {
  userName: string;
  existingPreferences: {
    qualification: string;
    degreeStream: string;
    whatsappNumber: string;
  } | null;
}

export function JobAlertsForm({ userName, existingPreferences }: JobAlertsFormProps) {
  const alreadySetup = !!existingPreferences;

  const [step, setStep] = useState<Step>(alreadySetup ? 3 : 1);
  const [qualification, setQualification] = useState(existingPreferences?.qualification || "");
  const [degree, setDegree] = useState(existingPreferences?.degreeStream || "");
  const [phone, setPhone] = useState(existingPreferences?.whatsappNumber || "");
  const [confirm, setConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(alreadySetup);
  const [loading, setLoading] = useState(false);

  const degreeOptions = useMemo(() => {
    return DEGREE_MAP[qualification] || [];
  }, [qualification]);

  const normalizedPhone = normalizePhone(phone);
  const phoneValid = normalizedPhone.length === 10;

  function goNext() {
    if (step === 1 && (!qualification || !degree)) return;
    if (step === 2 && !phoneValid) return;
    setStep((prev) => Math.min(3, prev + 1) as Step);
  }

  function goBack() {
    setStep((prev) => Math.max(1, prev - 1) as Step);
  }

  async function handleSubmit() {
    if (!confirm || !phoneValid) return;
    setLoading(true);
    const result = await saveJobAlertPreferences(qualification, degree, normalizedPhone);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      setSubmitted(true);
      toast.success("Job alerts activated!");
    }
  }

  return (
    <div className="min-h-screen page-bg">
      <div className="page-bg-orb w-[420px] h-[420px] bg-blue-200/[0.08] top-[8%] -left-[10%] animate-float-slow" />
      <div className="page-bg-orb w-[360px] h-[360px] bg-indigo-200/[0.07] top-[55%] -right-[8%] animate-float-delayed" />
      <div className="page-bg-orb w-[320px] h-[320px] bg-violet-200/[0.06] bottom-[5%] left-[15%] animate-float" />

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
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-4">
              <Bell className="h-3 w-3 text-amber-300" />
              <span className="text-white/90 text-xs font-bold">
                Get WhatsApp job alerts
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Job Alerts Setup
            </h1>
            <p className="mt-3 text-blue-100/80 text-sm md:text-base max-w-xl leading-relaxed font-medium">
              {userName
                ? `Hi ${userName}! `
                : ""}
              Add your qualification and WhatsApp number. We will notify you
              about new jobs based on your profile.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <Card className="card-3d max-w-xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-extrabold text-slate-800">
                {submitted ? "Alerts Active" : `Step ${step} of 3`}
              </CardTitle>
              <Badge variant="secondary" className="text-xs font-semibold">
                {submitted
                  ? "Active"
                  : step === 1
                  ? "Qualification"
                  : step === 2
                  ? "WhatsApp"
                  : "Confirm"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {submitted ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-6 text-center space-y-4">
                  <div className="relative mx-auto h-24 w-24">
                    <div className="absolute inset-0 rounded-full bg-emerald-200/60 animate-ping" />
                    <div className="absolute inset-2 rounded-full bg-white shadow-sm flex items-center justify-center">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-emerald-700">
                      Alerts Activated
                    </p>
                    <p className="text-xs text-emerald-700/80 font-medium mt-1">
                      You will receive WhatsApp notifications for new jobs.
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200/60 bg-white/70 p-3">
                  <p className="text-sm font-semibold text-slate-700">
                    Your Preferences
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {qualification} · {degree}
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    WhatsApp: +91 {normalizedPhone}
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSubmitted(false);
                    setConfirm(false);
                    setStep(1);
                  }}
                >
                  Update Preferences
                </Button>
              </div>
            ) : (
              <>
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">Qualification</Label>
                      <Select
                        value={qualification}
                        onValueChange={(value) => {
                          setQualification(value);
                          setDegree("");
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select your qualification" />
                        </SelectTrigger>
                        <SelectContent>
                          {QUALIFICATIONS.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">Stream / Degree</Label>
                      <Select
                        value={degree}
                        onValueChange={(value) => setDegree(value)}
                        disabled={!qualification}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select your stream" />
                        </SelectTrigger>
                        <SelectContent>
                          {degreeOptions.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">WhatsApp Number</Label>
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-2 rounded-md border bg-slate-50 text-xs font-bold text-slate-500">
                          +91
                        </div>
                        <Input
                          type="tel"
                          placeholder="10-digit number"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                        />
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        We will notify you about new jobs according to your
                        qualifications.
                      </p>
                      {!phoneValid && phone.length > 0 && (
                        <p className="text-xs text-red-500 font-semibold">
                          Enter a valid 10-digit number.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-slate-200/60 bg-white/70 p-3">
                      <p className="text-sm font-semibold text-slate-700">
                        Qualification
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        {qualification} · {degree}
                      </p>
                      <div className="mt-3">
                        <p className="text-sm font-semibold text-slate-700">
                          WhatsApp
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          +91 {normalizedPhone || "—"}
                        </p>
                      </div>
                    </div>
                    <label className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                      <input
                        type="checkbox"
                        checked={confirm}
                        onChange={(event) => setConfirm(event.target.checked)}
                      />
                      I confirm to receive WhatsApp messages about new job updates.
                    </label>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    onClick={goBack}
                    disabled={step === 1 || loading}
                  >
                    Back
                  </Button>
                  {step < 3 ? (
                    <Button
                      className="btn-3d text-white font-black border-0"
                      onClick={goNext}
                      disabled={
                        (step === 1 && (!qualification || !degree)) ||
                        (step === 2 && !phoneValid)
                      }
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      className="btn-3d text-white font-black border-0"
                      onClick={handleSubmit}
                      disabled={!confirm || !phoneValid || loading}
                    >
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Send Alerts
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
