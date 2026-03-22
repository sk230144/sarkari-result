import type { Metadata } from "next";
import { getUser } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { MembershipContent } from "./membership-content";

export const metadata: Metadata = {
  title: "Premium Membership - Application Fee Refund, Document Locker & More",
  description:
    "Join Job Alerts 24 Premium Membership. Get application fee refund on passing exams, document locker, exam calendar, priority support & more. जॉब अलर्ट्स 24 प्रीमियम मेंबरशिप।",
};

export default async function MembershipPage() {
  const user = await getUser();
  let premiumPlan: string | null = null;
  let referralCode: string | null = null;
  let referralCount = 0;
  let referralDaysEarned = 0;

  if (user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("is_premium, premium_plan, referral_code, referral_count, referral_days_earned")
      .eq("id", user.id)
      .single();

    if (data?.is_premium) {
      premiumPlan = data.premium_plan;
    }
    referralCount = data?.referral_count ?? 0;
    referralDaysEarned = data?.referral_days_earned ?? 0;

    if (data?.referral_code) {
      referralCode = data.referral_code;
    } else {
      // Generate and save a referral code for existing users
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "";
      for (let i = 0; i < 8; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
      const { error } = await supabase
        .from("profiles")
        .update({ referral_code: code, referral_count: 0, referral_days_earned: 0 })
        .eq("id", user.id);
      if (!error) referralCode = code;
    }
  }

  return (
    <MembershipContent
      premiumPlan={premiumPlan}
      referralCode={referralCode}
      referralCount={referralCount}
      referralDaysEarned={referralDaysEarned}
      isLoggedIn={!!user}
    />
  );
}
