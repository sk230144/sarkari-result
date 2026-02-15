import { getUser } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { ToolsGrid } from "./tools-grid";

export default async function ToolsHubPage() {
  const user = await getUser();
  let isPremium = false;

  if (user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("id", user.id)
      .single();

    isPremium = data?.is_premium ?? false;
  }

  return <ToolsGrid isPremium={isPremium} />;
}
