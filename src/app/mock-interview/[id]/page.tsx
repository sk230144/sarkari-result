import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { InterviewSession } from "@/components/mock-interview/session";

export const metadata: Metadata = {
  title: "Mock Interview — Job Alert 24",
  robots: { index: false, follow: false },
};

export default async function MockInterviewSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <DashboardShell canvas="obsidian" sidebar={false} backTo="/mock-interview">
      <InterviewSession id={id} />
    </DashboardShell>
  );
}
