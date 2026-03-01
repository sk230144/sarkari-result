import { getUser } from "@/lib/actions/auth";
import { getCalendarEvents } from "@/lib/actions/calendar";
import { getExamPdfs } from "@/lib/actions/exam-pdfs";
import { redirect } from "next/navigation";
import { ExamCalendarClient } from "./calendar-client";

export default async function ExamCalendarPage() {
  const user = await getUser();
  if (!user) redirect("/auth/login?redirect=/tools/calendar");

  const [events, pdfs] = await Promise.all([
    getCalendarEvents(),
    getExamPdfs(),
  ]);

  return (
    <ExamCalendarClient
      user={{ name: user.user_metadata?.full_name || user.email || "User" }}
      initialEvents={events}
      pdfs={pdfs}
    />
  );
}
