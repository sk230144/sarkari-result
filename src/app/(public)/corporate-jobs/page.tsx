import type { Metadata } from "next";
import { CorporateJobsClient } from "./corporate-jobs-client";
import { getHiringProfiles } from "@/lib/actions/hiring-profiles";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Corporate Jobs Search — LinkedIn, Glassdoor, Naukri, Indeed",
  description:
    "Search corporate and private sector jobs across LinkedIn, Glassdoor, Naukri, and Indeed. Filter by job role and posting date.",
};

export default async function CorporateJobsPage() {
  const hiringProfiles = await getHiringProfiles();

  // Check if user is logged in and premium
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isPremium = false;
  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("id", user.id)
      .single();

    isPremium = !!profile?.is_premium;

    const { data: admin } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    isAdmin = !!admin;
  }

  return (
    <CorporateJobsClient
      hiringProfiles={hiringProfiles}
      hasFullAccess={isPremium || isAdmin}
    />
  );
}
