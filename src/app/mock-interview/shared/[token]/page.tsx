import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { Lock } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { InterviewResults } from "@/components/mock-interview/results";
import { loadShared } from "@/lib/interview/share";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const shared = await loadShared(token);
  // Shared by link only: never indexed, even while public.
  const robots = { index: false, follow: false };
  if (!shared) return { title: "Mock interview result — Job Alert 24", robots };
  const who = shared.by ? `${shared.by} scored` : "Scored";
  const title = `${who} ${shared.iv.overallScore}/100 in a ${shared.iv.role} mock interview`;
  const description = shared.iv.summary?.headline ?? "AI mock interview result with feedback on every answer.";
  return pageMetadata(`/mock-interview/shared/${encodeURIComponent(token)}`, {
    title: `${title} — Job Alert 24`,
    description,
    robots,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  });
}

export default async function SharedInterviewPage({ params }: { params: Promise<{ token: string }> }) {
  const shared = await loadShared((await params).token);
  return (
    <DashboardShell canvas="obsidian" sidebar={false} backTo="/mock-interview">
      {shared ? (
        <InterviewResults iv={shared.iv} shared={{ by: shared.by, profileUrl: shared.profileUrl }} />
      ) : (
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05]">
            <Lock className="h-6 w-6 text-[var(--color-c-dim)]" />
          </span>
          <p className="text-[17px] font-bold text-[var(--color-c-text)]">This result isn&apos;t available</p>
          <p className="text-[13px] text-[var(--color-c-muted)]">The link is wrong, or its owner has stopped sharing it.</p>
          <Link href="/mock-interview#generate" className="rounded-xl bg-[var(--color-c-lime)] px-5 py-2.5 text-[13px] font-bold text-black">
            Try a free mock interview
          </Link>
        </div>
      )}
    </DashboardShell>
  );
}
