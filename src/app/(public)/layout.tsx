import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PromoBanner } from "@/components/layout/promo-banner";
import { ResumeChatWidget } from "@/components/resume-chat/resume-chat-widget";
import { getUser } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { getPremiumStatus } from "@/lib/actions/premium";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  let trialClaimed = false;
  let isPremium = false;
  let daysLeft: number | null = null;
  let isAdmin = false;

  if (user) {
    const supabase = await createClient();
    const [premiumStatus, { data: adminData }, { data: profile }] = await Promise.all([
      getPremiumStatus(user.id),
      supabase.from("admins").select("user_id").eq("user_id", user.id).single(),
      supabase.from("profiles").select("trial_claimed").eq("id", user.id).single(),
    ]);
    isPremium = premiumStatus.isPremium;
    daysLeft = premiumStatus.daysLeft;
    trialClaimed = !!profile?.trial_claimed;
    isAdmin = !!adminData;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PromoBanner
        isLoggedIn={!!user}
        isPremium={isPremium || isAdmin}
        trialClaimed={trialClaimed}
        daysLeft={daysLeft}
      />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ResumeChatWidget />
    </div>
  );
}
