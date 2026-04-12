import type { Metadata } from "next";
import { getUser } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { getEffectivePremium } from "@/lib/actions/premium";
import { ToolsGrid } from "./tools-grid";

export const metadata: Metadata = {
  title: "Free Tools - Image Converter, Resume Builder, Exam Calendar",
  description:
    "Free online tools for government job aspirants. Image resizer, passport photo maker, image to PDF converter, one-page resume builder, exam calendar & more. सरकारी नौकरी के लिए फ्री टूल्स।",
};

export default async function ToolsHubPage() {
  const user = await getUser();
  let isPremium = false;

  if (user) {
    const supabase = await createClient();
    const [effectivePremium, { data: admin }] = await Promise.all([
      getEffectivePremium(user.id),
      supabase.from("admins").select("user_id").eq("user_id", user.id).single(),
    ]);
    isPremium = !!(admin || effectivePremium);
  }

  return <ToolsGrid isPremium={isPremium} />;
}
