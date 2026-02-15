import { getUser } from "@/lib/actions/auth";
import { getUserAlertPreferences } from "@/lib/actions/job-alerts";
import { JobAlertsForm } from "./job-alerts-form";

export default async function JobAlertsPage() {
  const user = await getUser();
  const preferences = user ? await getUserAlertPreferences() : null;

  return (
    <JobAlertsForm
      userName={user?.user_metadata?.full_name || user?.email?.split("@")[0] || ""}
      existingPreferences={
        preferences?.wants_notifications
          ? {
              qualification: preferences.qualification || "",
              degreeStream: preferences.degree_stream || "",
              whatsappNumber: preferences.whatsapp_number || "",
            }
          : null
      }
    />
  );
}
