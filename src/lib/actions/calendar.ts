"use server";

import { createClient } from "@/lib/supabase/server";

export type EventType = "exam" | "result" | "admit";

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  event_date: string;
  event_type: EventType;
  description: string | null;
  created_at: string;
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("user_id", user.id)
    .order("event_date", { ascending: true });

  if (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }

  return data || [];
}

export async function addCalendarEvent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const title = formData.get("title") as string;
  const eventDate = formData.get("eventDate") as string;
  const eventType = formData.get("eventType") as EventType;
  const description = formData.get("description") as string;

  if (!title || !eventDate || !eventType) {
    return { error: "Title, date, and event type are required" };
  }

  const validTypes: EventType[] = ["exam", "result", "admit"];
  if (!validTypes.includes(eventType)) {
    return { error: "Invalid event type" };
  }

  const { error } = await supabase.from("calendar_events").insert({
    user_id: user.id,
    title,
    event_date: eventDate,
    event_type: eventType,
    description: description || null,
  });

  if (error) {
    console.error("Error adding calendar event:", error);
    return { error: "Failed to add event. Please try again." };
  }

  return { success: true };
}

export async function deleteCalendarEvent(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", eventId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting calendar event:", error);
    return { error: "Failed to delete event" };
  }

  return { success: true };
}
