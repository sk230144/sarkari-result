import { getUser } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { MembershipContent } from "./membership-content";

export default async function MembershipPage() {
  const user = await getUser();
  let premiumPlan: string | null = null;

  if (user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("is_premium, premium_plan")
      .eq("id", user.id)
      .single();

    if (data?.is_premium) {
      premiumPlan = data.premium_plan;
    }
  }

  return <MembershipContent premiumPlan={premiumPlan} />;
}
