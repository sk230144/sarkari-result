import { getUser } from "@/lib/actions/auth";
import { getCalendarEvents } from "@/lib/actions/calendar";
import { redirect } from "next/navigation";
import { ExamCalendarClient } from "./calendar-client";

export default async function ExamCalendarPage() {
  const user = await getUser();
  if (!user) redirect("/auth/login?redirect=/tools/calendar");

  const events = await getCalendarEvents();

  return (
    <ExamCalendarClient
      user={{ name: user.user_metadata?.full_name || user.email || "User" }}
      initialEvents={events}
    />
  );
}
