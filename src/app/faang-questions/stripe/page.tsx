import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DsaSheetTracker } from "@/components/striver/sheet-tracker";
import { STRIPE_SECTIONS, STRIPE_TOTAL } from "@/components/faang/stripe-data";

export const metadata: Metadata = {
  title: "Stripe Interview Questions — Job Alert 24",
  description:
    "11 real coding interview questions recently asked at Stripe, grouped by topic with a difficulty tag and a direct LeetCode link for every question.",
};

export default function StripeQuestionsPage() {
  return (
    <DashboardShell canvas="obsidian">
      <DsaSheetTracker
        config={{
          name: "Stripe Interview Questions",
          kicker: `FAANG · ${STRIPE_SECTIONS.length} ${STRIPE_SECTIONS.length === 1 ? "Topic" : "Topics"}`,
          blurb: `${STRIPE_TOTAL} real coding interview questions recently asked at Stripe, grouped by topic with a difficulty tag and a direct LeetCode link for every question. Tick them off as you solve them and add your own notes.`,
          sections: STRIPE_SECTIONS,
          groupLabel: "topic",
          officialUrl: "https://leetcode.com/company/stripe/",
          storageKey: "faang-stripe",
        }}
      />
    </DashboardShell>
  );
}
