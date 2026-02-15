import { getUser } from "@/lib/actions/auth";
import { ResumeBuilderForm } from "./resume-builder-form";

export default async function ResumeBuilderPage() {
  const user = await getUser();

  return (
    <ResumeBuilderForm
      defaultName={user?.user_metadata?.full_name || ""}
      defaultEmail={user?.email || ""}
    />
  );
}
