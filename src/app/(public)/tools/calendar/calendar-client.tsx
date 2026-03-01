"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Loader2,
  FileText,
  ExternalLink,
} from "lucide-react";
import {
  addCalendarEvent,
  deleteCalendarEvent,
  type CalendarEvent,
  type EventType,
} from "@/lib/actions/calendar";
import type { ExamPdf } from "@/lib/actions/exam-pdfs";
import { toast } from "sonner";

const TYPE_STYLES: Record<EventType, string> = {
  exam: "bg-blue-50 text-blue-700",
  result: "bg-emerald-50 text-emerald-700",
  admit: "bg-amber-50 text-amber-700",
};

const TYPE_DOT_COLORS: Record<EventType, string> = {
  exam: "bg-blue-500",
  result: "bg-emerald-500",
  admit: "bg-amber-500",
};

const TYPE_LABELS: Record<EventType, string> = {
  exam: "Exam",
  result: "Result",
  admit: "Admit Card",
};

interface Props {
  user: { name: string };
  initialEvents: CalendarEvent[];
  pdfs: ExamPdf[];
}

export function ExamCalendarClient({ user, initialEvents, pdfs }: Props) {
  const [events, setEvents] = useState(initialEvents);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filters, setFilters] = useState<Record<EventType, boolean>>({
    exam: true,
    result: true,
    admit: true,
  });
  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [eventType, setEventType] = useState<EventType>("exam");

  const enrichedEvents = useMemo(() => {
    return events.map((event) => ({
      ...event,
      dateObj: new Date(event.event_date + "T00:00:00"),
    }));
  }, [events]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const filteredEvents = useMemo(() => {
    return enrichedEvents.filter((event) => filters[event.event_type]);
  }, [enrichedEvents, filters]);

  const selectedEvents = useMemo(() => {
    return filteredEvents.filter((event) =>
      isSameDay(event.dateObj, selectedDate)
    );
  }, [filteredEvents, selectedDate]);

  async function handleAdd(formData: FormData) {
    setAdding(true);
    formData.set("eventType", eventType);
    const result = await addCalendarEvent(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Event added!");
      setAddOpen(false);
      // Refresh events from optimistic update
      const title = formData.get("title") as string;
      const eventDate = formData.get("eventDate") as string;
      const description = formData.get("description") as string;
      setEvents((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          user_id: "",
          title,
          event_date: eventDate,
          event_type: eventType,
          description: description || null,
          created_at: new Date().toISOString(),
        },
      ]);
    }
    setAdding(false);
  }

  async function handleDelete(eventId: string) {
    setDeletingId(eventId);
    const result = await deleteCalendarEvent(eventId);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Event deleted");
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    }
    setDeletingId(null);
  }

  return (
    <div className="min-h-screen page-bg">
      <div className="page-bg-orb w-[420px] h-[420px] bg-blue-200/[0.08] top-[8%] -left-[10%] animate-float-slow" />
      <div className="page-bg-orb w-[360px] h-[360px] bg-indigo-200/[0.07] top-[55%] -right-[8%] animate-float-delayed" />
      <div className="page-bg-orb w-[320px] h-[320px] bg-violet-200/[0.06] bottom-[5%] left-[15%] animate-float" />

      {/* Hero */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative container mx-auto px-4 py-10 md:py-12">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-4">
                <Calendar className="h-3 w-3 text-amber-300" />
                <span className="text-white/90 text-xs font-bold">
                  Welcome, {user.name}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Exam Calendar
              </h1>
              <p className="mt-3 text-blue-100/80 text-sm md:text-base max-w-xl leading-relaxed font-medium">
                Track your exam dates, results, and admit card schedules. Add
                your own events to stay organized.
              </p>
            </div>

            {/* Add Event Button */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="btn-3d text-white font-black border-0 shrink-0 mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-lg font-extrabold text-slate-800">
                    Add Calendar Event
                  </DialogTitle>
                </DialogHeader>
                <form action={handleAdd} className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Event Title
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g. SSC CGL Tier 1 Exam"
                      required
                      className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="eventDate"
                        className="text-sm font-semibold text-slate-700"
                      >
                        Date
                      </Label>
                      <Input
                        id="eventDate"
                        name="eventDate"
                        type="date"
                        required
                        className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Event Type
                      </Label>
                      <Select
                        value={eventType}
                        onValueChange={(v) => setEventType(v as EventType)}
                      >
                        <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="exam">Exam Date</SelectItem>
                          <SelectItem value="result">Result Day</SelectItem>
                          <SelectItem value="admit">Admit Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Notes (optional)
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Any additional details..."
                      rows={3}
                      className="bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 rounded-lg resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="btn-3d w-full h-11 gradient-hero text-white font-black shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 shine"
                    disabled={adding}
                  >
                    {adding ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Add Event
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 space-y-6">
        {/* Calendar Grid */}
        <Card className="card-3d">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-extrabold text-slate-800">
                {format(currentMonth, "MMMM yyyy")}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentMonth(new Date());
                    setSelectedDate(new Date());
                  }}
                  className="text-xs font-bold"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["exam", "result", "admit"] as EventType[]).map((type) => (
                <label
                  key={type}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all ${
                    filters[type]
                      ? "border-transparent bg-white shadow-sm"
                      : "border-slate-200 text-slate-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={filters[type]}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        [type]: e.target.checked,
                      }))
                    }
                    className="sr-only"
                  />
                  <span
                    className={`h-2 w-2 rounded-full ${TYPE_DOT_COLORS[type]}`}
                  />
                  <span>{TYPE_LABELS[type]}</span>
                </label>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-7 text-xs text-slate-400 font-semibold">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="py-2 text-center">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const dayEvents = filteredEvents.filter((event) =>
                  isSameDay(event.dateObj, day)
                );
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                const inMonth = isSameMonth(day, currentMonth);
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    className={`rounded-lg px-1.5 py-2 text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                      isSelected
                        ? "border-blue-400 bg-blue-50 text-blue-700"
                        : isToday
                        ? "border-blue-200 bg-blue-50/50 text-blue-600"
                        : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                    } ${inMonth ? "text-slate-700" : "text-slate-300"}`}
                  >
                    <span>{format(day, "d")}</span>
                    <div className="flex gap-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <span
                          key={event.id}
                          className={`h-1.5 w-1.5 rounded-full ${TYPE_DOT_COLORS[event.event_type]}`}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Events */}
        <Card className="card-3d">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-extrabold text-slate-800">
              {format(selectedDate, "dd MMM yyyy")}
            </CardTitle>
            <span className="text-xs text-slate-400 font-medium">
              {selectedEvents.length} event{selectedEvents.length !== 1 && "s"}
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedEvents.length === 0 ? (
              <p className="text-sm text-slate-400 font-medium py-4 text-center">
                No events for this date. Click &quot;Add Event&quot; to create
                one.
              </p>
            ) : (
              selectedEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200/60 bg-white/70 px-4 py-3 group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-700 truncate">
                      {event.title}
                    </p>
                    {event.description && (
                      <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
                        {event.description}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {format(event.dateObj, "EEEE, dd MMM yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="secondary"
                      className={`text-xs font-semibold ${TYPE_STYLES[event.event_type]}`}
                    >
                      {TYPE_LABELS[event.event_type]}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(event.id)}
                      disabled={deletingId === event.id}
                    >
                      {deletingId === event.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Exam Calendar PDFs */}
        {pdfs.length > 0 && (
          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <FileText className="h-4 w-4 text-red-500" />
                Official Exam Calendars (PDF)
              </CardTitle>
              <p className="text-xs text-slate-400 font-medium">
                Official calendars uploaded by admin — click to view or download
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {pdfs.map((pdf) => (
                <a
                  key={pdf.id}
                  href={pdf.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-slate-200/60 bg-white/70 px-4 py-3 hover:border-blue-200 hover:bg-blue-50/30 transition-colors group"
                >
                  <div className="h-9 w-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate group-hover:text-blue-700">
                      {pdf.name}
                    </p>
                    <Badge className="text-[10px] bg-blue-50 text-blue-700 border-0 font-bold mt-0.5">
                      {pdf.exam_body}
                    </Badge>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-blue-500 shrink-0" />
                </a>
              ))}
            </CardContent>
          </Card>
        )}

        {/* All Upcoming Events */}
        {enrichedEvents.length > 0 && (
          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="text-base font-extrabold text-slate-800">
                All Your Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {enrichedEvents
                .sort(
                  (a, b) => a.dateObj.getTime() - b.dateObj.getTime()
                )
                .map((event) => {
                  const isPast = event.dateObj < new Date();
                  return (
                    <div
                      key={event.id}
                      className={`flex items-center justify-between gap-3 rounded-lg border border-slate-200/60 px-4 py-2.5 group ${
                        isPast ? "bg-slate-50/50 opacity-60" : "bg-white/70"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-700 truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-slate-400 font-medium">
                          {format(event.dateObj, "dd MMM yyyy")}
                          {event.description && ` · ${event.description}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="secondary"
                          className={`text-xs font-semibold ${TYPE_STYLES[event.event_type]}`}
                        >
                          {TYPE_LABELS[event.event_type]}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(event.id)}
                          disabled={deletingId === event.id}
                        >
                          {deletingId === event.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
