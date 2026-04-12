import type { Metadata } from "next";
import { getUser } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { getEffectivePremium } from "@/lib/actions/premium";
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
  let premiumExpiresAt: string | null = null;

  if (user) {
    const supabase = await createClient();
    const [isEffectivePremium, { data }] = await Promise.all([
      getEffectivePremium(user.id),
      supabase
        .from("profiles")
        .select("premium_plan, premium_expires_at, referral_code, referral_count, referral_days_earned")
        .eq("id", user.id)
        .single(),
    ]);

    if (isEffectivePremium) {
      premiumPlan = data?.premium_plan ?? null;
      premiumExpiresAt = data?.premium_expires_at ?? null;
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
      premiumExpiresAt={premiumExpiresAt}
      referralCode={referralCode}
      referralCount={referralCount}
      referralDaysEarned={referralDaysEarned}
      isLoggedIn={!!user}
    />
  );
}
