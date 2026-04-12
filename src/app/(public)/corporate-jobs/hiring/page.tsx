import type { Metadata } from "next";
import { CorporateJobsClient } from "../corporate-jobs-client";
import { getHiringProfiles } from "@/lib/actions/hiring-profiles";
import { getHiringPosts } from "@/lib/actions/hiring-posts";
import { createClient } from "@/lib/supabase/server";
import { getEffectivePremium } from "@/lib/actions/premium";

export const metadata: Metadata = {
  title: "Who's Hiring — Corporate & Private Jobs | Job Alerts 24",
  description:
    "See who's actively hiring right now. Browse hiring posts and profiles from companies looking for talent across India. Filter by role, work mode, and tags.",
};

export default async function WhoIsHiringPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isPremium = false;
  let isAdmin = false;

  if (user) {
    const [effectivePremium, { data: admin }] = await Promise.all([
      getEffectivePremium(user.id),
      supabase.from("admins").select("user_id").eq("user_id", user.id).single(),
    ]);
    isPremium = effectivePremium;
    isAdmin = !!admin;
  }

  const [hiringProfiles, hiringPosts] = await Promise.all([
    getHiringProfiles(),
    getHiringPosts(),
  ]);

  return (
    <CorporateJobsClient
      hiringProfiles={hiringProfiles}
      hiringPosts={hiringPosts}
      hasFullAccess={isPremium || isAdmin}
      activeTab="hiring"
    />
  );
}
