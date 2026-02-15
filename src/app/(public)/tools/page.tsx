"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Calendar,
  Crown,
  FileEdit,
  FileText,
  Image as ImageIcon,
  Lock,
  Shield,
  Sparkles,
} from "lucide-react";

const tools = [
  {
    title: "Image Tools",
    description:
      "Convert, compress, resize, and crop images with KB target support.",
    href: "/tools/image",
    tags: ["JPG", "PNG", "WebP"],
    icon: ImageIcon,
    accent: "bg-blue-50 text-blue-700",
    premium: false,
  },
  {
    title: "Image to PDF",
    description: "Convert one or many images into a single PDF.",
    href: "/tools/image-to-pdf",
    tags: ["PDF", "Multi-image"],
    icon: FileText,
    accent: "bg-amber-50 text-amber-700",
    premium: false,
  },
  {
    title: "Resume Builder",
    description:
      "Build a clean one-page resume and download as PDF.",
    href: "/tools/resume-builder",
    tags: ["PDF", "One Page"],
    icon: FileEdit,
    accent: "bg-teal-50 text-teal-700",
    premium: false,
  },
  {
    title: "Exam Calendar",
    description:
      "Track exam dates, results & admit card schedules.",
    href: "/tools/calendar",
    tags: ["Exam", "Result"],
    icon: Calendar,
    accent: "bg-emerald-50 text-emerald-700",
    premium: true,
  },
  {
    title: "Job Alerts Setup",
    description:
      "Set your qualification and get WhatsApp alerts.",
    href: "/tools/job-alerts",
    tags: ["WhatsApp", "Qualification"],
    icon: Bell,
    accent: "bg-amber-50 text-amber-700",
    premium: true,
  },
  {
    title: "Document Locker",
    description:
      "Securely store Aadhar, marksheets, photo, signature & more.",
    href: "/tools/document-locker",
    tags: ["Secure", "Private"],
    icon: Shield,
    accent: "bg-violet-50 text-violet-700",
    premium: true,
  },
];

export default function ToolsHubPage() {
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
              <Sparkles className="h-3 w-3 text-amber-300" />
              <span className="text-white/90 text-xs font-bold">
                Mobile-first - 100% Free & Premium Tools
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Tools Hub
            </h1>
            <p className="mt-3 text-blue-100/80 text-sm md:text-base max-w-xl leading-relaxed font-medium">
              Quick tools for job applicants. Fast, private, and optimized for
              mobile users.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.href}
                className={`card-3d relative overflow-hidden ${tool.premium ? "ring-1 ring-violet-200" : ""}`}
              >
                {tool.premium && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-2.5 py-1 shadow-md shadow-violet-500/20">
                      <Crown className="h-3 w-3 text-amber-300" />
                      <span className="text-[10px] font-extrabold text-white tracking-wide">
                        PREMIUM
                      </span>
                    </div>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className={`icon-3d h-10 w-10 rounded-xl flex items-center justify-center ${tool.premium ? "bg-violet-50" : "bg-white"}`}
                    >
                      <Icon
                        className={`h-5 w-5 ${tool.premium ? "text-violet-500" : "text-slate-600"}`}
                      />
                    </div>
                    <div className="pr-20">
                      <CardTitle className="text-base font-extrabold text-slate-800">
                        {tool.title}
                      </CardTitle>
                      <p className="text-xs text-slate-500 font-medium">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {tool.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className={`text-xs font-semibold ${tool.accent}`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {tool.premium ? (
                    <Link href="/membership">
                      <Button className="w-full gradient-purple text-white font-black border-0 shadow-md shadow-violet-500/20 hover:shadow-violet-500/40 transition-shadow">
                        <Lock className="h-3.5 w-3.5 mr-2" />
                        Unlock with Premium
                      </Button>
                    </Link>
                  ) : (
                    <Link href={tool.href}>
                      <Button className="w-full btn-3d text-white font-black border-0">
                        Open Tool
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
