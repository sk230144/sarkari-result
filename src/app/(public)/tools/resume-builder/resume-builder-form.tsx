"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileText,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { generateResumePdf } from "./generate-pdf";

interface Education {
  degree: string;
  institution: string;
  year: string;
  percentage: string;
}

interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  objective: string;
  education: Education[];
  experience: Experience[];
  skills: string;
  languages: string;
  hobbies: string;
}

const EMPTY_EDUCATION: Education = { degree: "", institution: "", year: "", percentage: "" };
const EMPTY_EXPERIENCE: Experience = { title: "", company: "", duration: "", description: "" };

interface ResumeBuilderFormProps {
  defaultName: string;
  defaultEmail: string;
}

export function ResumeBuilderForm({ defaultName, defaultEmail }: ResumeBuilderFormProps) {
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState<ResumeData>({
    fullName: defaultName,
    email: defaultEmail,
    phone: "",
    address: "",
    objective: "",
    education: [{ ...EMPTY_EDUCATION }],
    experience: [],
    skills: "",
    languages: "",
    hobbies: "",
  });

  function updateField<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function addEducation() {
    setData((prev) => ({ ...prev, education: [...prev.education, { ...EMPTY_EDUCATION }] }));
  }

  function removeEducation(index: number) {
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  }

  function updateEducation(index: number, field: keyof Education, value: string) {
    setData((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
  }

  function addExperience() {
    setData((prev) => ({ ...prev, experience: [...prev.experience, { ...EMPTY_EXPERIENCE }] }));
  }

  function removeExperience(index: number) {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  }

  function updateExperience(index: number, field: keyof Experience, value: string) {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));
  }

  async function handleDownload() {
    if (!data.fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!data.phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (data.education.length === 0 || !data.education[0].degree.trim()) {
      toast.error("Please add at least one education entry");
      return;
    }

    setGenerating(true);
    try {
      const pdfBytes = await generateResumePdf(data);
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.fullName.trim().replace(/\s+/g, "_")}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Resume downloaded!");
    } catch {
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setGenerating(false);
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
              <FileText className="h-3 w-3 text-amber-300" />
              <span className="text-white/90 text-xs font-bold">
                One Page Resume Builder
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Resume Builder
            </h1>
            <p className="mt-3 text-blue-100/80 text-sm md:text-base max-w-xl leading-relaxed font-medium">
              Fill in your details and download a clean, professional one-page
              resume as PDF. No signup needed for the form.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Personal Details */}
          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="text-base font-extrabold text-slate-800">
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Full Name *</Label>
                  <Input
                    placeholder="Your full name"
                    value={data.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Phone *</Label>
                  <Input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={data.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Email</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={data.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Address</Label>
                  <Input
                    placeholder="City, State"
                    value={data.address}
                    onChange={(e) => updateField("address", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold">Career Objective</Label>
                <Textarea
                  placeholder="A brief summary about yourself and your career goals..."
                  rows={3}
                  value={data.objective}
                  onChange={(e) => updateField("objective", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="card-3d">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-extrabold text-slate-800">
                  Education *
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addEducation}
                  className="text-xs font-bold"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.education.map((edu, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-slate-200/60 bg-slate-50/50 p-3 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px] font-semibold">
                      #{index + 1}
                    </Badge>
                    {data.education.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-400 hover:text-red-600"
                        onClick={() => removeEducation(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold">Degree / Class *</Label>
                      <Select
                        value={edu.degree}
                        onValueChange={(v) => updateEducation(index, "degree", v)}
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "10th",
                            "12th",
                            "ITI",
                            "Diploma",
                            "B.A",
                            "B.Com",
                            "B.Sc",
                            "B.Tech",
                            "BBA",
                            "BCA",
                            "M.A",
                            "M.Com",
                            "M.Sc",
                            "M.Tech",
                            "MBA",
                            "MCA",
                            "PhD",
                            "Other",
                          ].map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold">Institution</Label>
                      <Input
                        className="text-xs"
                        placeholder="School / College name"
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, "institution", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold">Year</Label>
                      <Input
                        className="text-xs"
                        placeholder="e.g. 2022"
                        value={edu.year}
                        onChange={(e) => updateEducation(index, "year", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold">Percentage / CGPA</Label>
                      <Input
                        className="text-xs"
                        placeholder="e.g. 85% or 8.5 CGPA"
                        value={edu.percentage}
                        onChange={(e) => updateEducation(index, "percentage", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Experience (Optional) */}
          <Card className="card-3d">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-extrabold text-slate-800">
                    Work Experience
                  </CardTitle>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">Optional</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addExperience}
                  className="text-xs font-bold"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            {data.experience.length > 0 && (
              <CardContent className="space-y-4">
                {data.experience.map((exp, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-slate-200/60 bg-slate-50/50 p-3 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-[10px] font-semibold">
                        #{index + 1}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-400 hover:text-red-600"
                        onClick={() => removeExperience(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold">Job Title</Label>
                        <Input
                          className="text-xs"
                          placeholder="e.g. Data Entry Operator"
                          value={exp.title}
                          onChange={(e) => updateExperience(index, "title", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold">Company</Label>
                        <Input
                          className="text-xs"
                          placeholder="Company name"
                          value={exp.company}
                          onChange={(e) => updateExperience(index, "company", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold">Duration</Label>
                        <Input
                          className="text-xs"
                          placeholder="e.g. Jan 2022 - Dec 2023"
                          value={exp.duration}
                          onChange={(e) => updateExperience(index, "duration", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold">Description</Label>
                      <Textarea
                        className="text-xs"
                        rows={2}
                        placeholder="Brief description of your responsibilities..."
                        value={exp.description}
                        onChange={(e) => updateExperience(index, "description", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* Skills & Others */}
          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="text-base font-extrabold text-slate-800">
                Skills & Others
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold">Skills</Label>
                <Textarea
                  placeholder="e.g. MS Office, Typing (Hindi & English), Data Entry, Computer..."
                  rows={2}
                  value={data.skills}
                  onChange={(e) => updateField("skills", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Languages</Label>
                  <Input
                    placeholder="e.g. Hindi, English"
                    value={data.languages}
                    onChange={(e) => updateField("languages", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Hobbies</Label>
                  <Input
                    placeholder="e.g. Reading, Cricket"
                    value={data.hobbies}
                    onChange={(e) => updateField("hobbies", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Download Button */}
          <Button
            className="w-full btn-3d text-white font-black border-0 h-12 text-base"
            onClick={handleDownload}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Download className="h-5 w-5 mr-2" />
            )}
            Download Resume PDF
          </Button>
        </div>
      </section>
    </div>
  );
}
