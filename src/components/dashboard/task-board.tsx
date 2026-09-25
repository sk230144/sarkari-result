"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Flag,
  ListChecks,
  CheckCircle2,
  Search,
  Plus,
  X,
  Terminal,
  Code2,
  Send,
  CalendarDays,
  Clock,
  AlertCircle,
  BadgeCheck,
  MonitorCheck,
  History,
  Download,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Archive,
  Flame,
  LogIn,
  Sparkles,
  StickyNote,
  Loader2,
} from "lucide-react";
import { useTasks, type Status, type Tag, type Task, type TaskInput } from "@/components/task-board/use-tasks";
import { ArchiveModal, STATUS_LABELS, TaskModal } from "@/components/task-board/task-modals";

const TAG_STYLES: Record<Tag, { pill: string; dot: string }> = {
  Resume: { pill: "bg-blue-500/15 text-blue-400", dot: "bg-blue-400" },
  "DSA Sheets": { pill: "bg-amber-400/15 text-amber-300", dot: "bg-amber-400" },
  Interview: { pill: "bg-[var(--color-c-violet-soft)]/20 text-[var(--color-c-violet-soft)]", dot: "bg-[var(--color-c-violet-soft)]" },
  Applied: { pill: "bg-[var(--color-c-emerald)]/20 text-[var(--color-c-lime-soft)]", dot: "bg-[var(--color-c-emerald)]" },
  Other: { pill: "bg-white/10 text-[var(--color-c-text-4)]", dot: "bg-[var(--color-c-outline)]" },
};

const COLUMNS: { status: Status; label: string; dot: string; glow: string; badge: string; ring: string; bg: string }[] = [
  {
    status: "todo",
    label: "To Do",
    dot: "bg-blue-500",
    glow: "shadow-[0_0_8px_rgba(59,130,246,0.8)]",
    badge: "bg-blue-500/20 text-blue-400",
    ring: "inset 0 0 0 1px rgba(59, 130, 246, 0.28)",
    bg: "bg-[var(--color-c-blue-dim)]/90",
  },
  {
    status: "inprogress",
    label: "In Progress",
    dot: "bg-amber-400",
    glow: "shadow-[0_0_8px_rgba(245,158,11,0.8)]",
    badge: "bg-amber-400/20 text-amber-400",
    ring: "inset 0 0 0 1px rgba(245, 158, 11, 0.32)",
    bg: "bg-[var(--color-c-amber-dim-2)]/90",
  },
  {
    status: "done",
    label: "Done",
    dot: "bg-emerald-400",
    glow: "shadow-[0_0_8px_rgba(16,185,129,0.8)]",
    badge: "bg-[var(--color-c-emerald)]/20 text-[var(--color-c-emerald)]",
    ring: "inset 0 0 0 1px rgba(16, 185, 129, 0.32)",
    bg: "bg-[var(--color-c-surface-1d)]/90",
  },
];

const FILTERS: { label: string; value: Tag | "all"; dot?: string }[] = [
  { label: "All Tasks", value: "all" },
  { label: "Resume", value: "Resume", dot: "bg-[var(--color-c-blue-soft)]" },
  { label: "DSA Sheets", value: "DSA Sheets", dot: "bg-[var(--color-c-lime-soft)]" },
  { label: "Interview", value: "Interview", dot: "bg-[var(--color-c-violet-soft)]" },
  { label: "Applications", value: "Applied", dot: "bg-[var(--color-c-emerald)]" },
  { label: "Other", value: "Other", dot: "bg-[var(--color-c-outline)]" },
];

const STARTER: TaskInput[] = [
  { title: "Update my resume headline to match my target role", tag: "Resume", status: "todo", due_date: null, reference: null, notes: null },
  { title: "Solve 3 problems from the Two Pointers pattern", tag: "DSA Sheets", status: "todo", due_date: null, reference: "/dsa-patterns", notes: null },
  { title: "Schedule a mock system design round", tag: "Interview", status: "todo", due_date: null, reference: "/system-design", notes: null },
  { title: "Apply to 3 jobs from the Jobs board", tag: "Applied", status: "todo", due_date: null, reference: "/jobs", notes: null },
];

const ORDER: Status[] = ["todo", "inprogress", "done"];

/* ----------------------------------------------------------- dates */

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const fmtDay = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

function weekStart(now = new Date()) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
  return d;
}

function isoWeek(now = new Date()) {
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

/** Consecutive days (ending today, or yesterday if today has none yet) with a completed task. */
function streakOf(completedIsoTimes: string[]) {
  const days = new Set(completedIsoTimes.map((t) => ymd(new Date(t))));
  const cursor = new Date();
  if (!days.has(ymd(cursor))) cursor.setDate(cursor.getDate() - 1);
  let n = 0;
  while (days.has(ymd(cursor))) {
    n++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return n;
}

function ago(d: Date | null) {
  if (!d) return "not yet";
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ago`;
}

function dueMeta(t: Task): { text: string; Icon: React.ComponentType<{ className?: string }>; tone: string } {
  if (t.status === "done") {
    return {
      text: t.completed_at ? `Done ${fmtDay(new Date(t.completed_at))}` : "Done",
      Icon: BadgeCheck,
      tone: "text-[var(--color-c-emerald)]",
    };
  }
  if (!t.due_date) {
    const days = Math.floor((Date.now() - Date.parse(t.created_at)) / 86_400_000);
    return {
      text: days <= 0 ? "Added today" : `Added ${days}d ago`,
      Icon: Clock,
      tone: "text-[var(--color-c-outline)]",
    };
  }
  const [y, m, d] = t.due_date.split("-").map(Number);
  const due = new Date(y, m - 1, d);
  const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  const diff = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (diff < 0) return { text: `Overdue · ${fmtDay(due)}`, Icon: AlertCircle, tone: "font-semibold text-red-400" };
  if (diff === 0) return { text: "Due today", Icon: CalendarDays, tone: "font-semibold text-amber-400" };
  if (diff === 1) return { text: "Tomorrow", Icon: Clock, tone: "text-amber-300" };
  return { text: `Due ${fmtDay(due)}`, Icon: CalendarDays, tone: "text-[var(--color-c-outline)]" };
}

/** Reference as a link when it is one (internal path or http URL). */
function RefLabel({ task }: { task: Task }) {
  const ref = task.reference;
  if (!ref) return <span />;
  const Icon = /leetcode|codeforces|gfg|geeksforgeeks|#\d/i.test(ref) ? Code2 : task.tag === "Applied" ? Send : Terminal;
  const cls = `flex min-w-0 items-center gap-1 font-mono ${Icon === Code2 ? "text-[var(--color-c-lime-soft)]" : ""}`;

  let href: string | null = null;
  let text = ref;
  if (/^\/[\w\-/#?=&]*$/.test(ref)) href = ref;
  else {
    try {
      const u = new URL(/^https?:\/\//i.test(ref) ? ref : `https://${ref}`);
      if (/^https?:\/\//i.test(ref) || /^[\w-]+\.[\w.-]+\//.test(ref)) {
        href = u.toString();
        text = `${u.hostname.replace(/^www\./, "")}${u.pathname !== "/" ? u.pathname : ""}`;
      }
    } catch {
      /* plain text reference */
    }
  }

  const inner = (
    <>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{text}</span>
    </>
  );
  return href ? (
    <a
      href={href}
      target={href.startsWith("/") ? undefined : "_blank"}
      rel="noopener noreferrer nofollow"
      onClick={(e) => e.stopPropagation()}
      draggable={false}
      className={`${cls} hover:text-[var(--color-c-text)] hover:underline`}
    >
      {inner}
    </a>
  ) : (
    <span className={cls}>{inner}</span>
  );
}

function csvCell(v: string | null | undefined) {
  const s = (v ?? "").replace(/"/g, '""');
  return /[",\n]/.test(s) ? `"${s}"` : s;
}

/* ----------------------------------------------------------- board */

type Toast = { text: string; kind: "ok" | "error"; undo?: () => void } | null;

export function TaskBoard() {
  const [toast, setToast] = useState<Toast>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const showToast = useCallback((t: NonNullable<Toast>) => {
    setToast(t);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), t.undo ? 6000 : t.kind === "error" ? 5000 : 2500);
  }, []);
  const onError = useCallback((text: string) => showToast({ text, kind: "error" }), [showToast]);

  const board = useTasks(onError);
  const { tasks } = board;

  const [filter, setFilter] = useState<Tag | "all">("all");
  const [query, setQuery] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<Status | null>(null);
  const [overCard, setOverCard] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ task: Task | null; status: Status } | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [goalEdit, setGoalEdit] = useState<string | null>(null);
  const [starterBusy, setStarterBusy] = useState(false);
  const [, tick] = useState(0);

  // Keeps "synced Xs ago" and due labels fresh.
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchesFilter = filter === "all" || t.tag === filter;
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.tag.toLowerCase().includes(q) ||
        (t.reference ?? "").toLowerCase().includes(q) ||
        (t.notes ?? "").toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [tasks, filter, query]);

  /* -------------------------------------------------- metrics */
  const total = tasks.length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const openCount = total - doneCount;
  const completion = total ? Math.round((doneCount / total) * 100) : 0;

  const ws = weekStart();
  const we = new Date(ws);
  we.setDate(we.getDate() + 6);
  const doneThisWeek = board.completedDays.filter((t) => new Date(t) >= ws).length;
  const goalPct = Math.min(100, Math.round((doneThisWeek / board.weeklyGoal) * 100));
  // Where the user "should" be by now if the goal is spread evenly over the week.
  const expectedPct = Math.round((((new Date().getDay() + 6) % 7) + 1) / 7 * 100);
  const pace =
    doneThisWeek >= board.weeklyGoal ? "Goal hit" : goalPct >= expectedPct ? "On Track" : "Behind pace";
  const streak = streakOf(board.completedDays);

  /* -------------------------------------------------- actions */
  async function deleteTask(id: string) {
    const removed = await board.remove(id);
    if (!removed) return;
    setEditor(null);
    showToast({
      text: "Task deleted",
      kind: "ok",
      undo: async () => {
        setToast(null);
        if (await board.restore(removed)) showToast({ text: "Task restored", kind: "ok" });
      },
    });
  }

  async function archiveDone() {
    const n = await board.archiveDone();
    if (n) showToast({ text: `${n} finished task${n === 1 ? "" : "s"} moved to the archive`, kind: "ok" });
  }

  function drop(status: Status) {
    if (dragId) board.move(dragId, status, overCard);
    setDragId(null);
    setOverCol(null);
    setOverCard(null);
  }

  function step(task: Task, dir: -1 | 1) {
    const next = ORDER[ORDER.indexOf(task.status) + dir];
    if (next) board.move(task.id, next);
  }

  function exportCsv() {
    const header = ["Title", "Tag", "Status", "Due date", "Reference", "Notes", "Created", "Completed"];
    const rows = tasks.map((t) =>
      [
        t.title,
        t.tag,
        STATUS_LABELS[t.status],
        t.due_date ?? "",
        t.reference ?? "",
        t.notes ?? "",
        t.created_at.slice(0, 10),
        t.completed_at?.slice(0, 10) ?? "",
      ]
        .map(csvCell)
        .join(","),
    );
    const blob = new Blob([`﻿${[header.join(","), ...rows].join("\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `task-board-${ymd(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function addStarterTasks() {
    setStarterBusy(true);
    if (await board.createMany(STARTER)) showToast({ text: "Added 4 starter tasks", kind: "ok" });
    setStarterBusy(false);
  }

  async function saveGoal() {
    const n = Number(goalEdit);
    if (Number.isFinite(n) && n >= 1) await board.saveWeeklyGoal(n);
    setGoalEdit(null);
  }

  /* -------------------------------------------------- states */
  const header = (
    <div className="flex max-w-5xl flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-c-emerald)]">
        <span className="inline-block h-2 w-2 animate-ping rounded-full bg-[var(--color-c-emerald)]" />
        <span>Developer Career Sprint Engine</span>
      </div>
      <h1 className="select-none text-[30px] font-extrabold uppercase leading-none tracking-tight text-[var(--color-c-text)]">Task Board</h1>
      <p className="max-w-4xl text-[13px] leading-relaxed text-[var(--color-c-text-muted)]">
        Plan your job search day by day. Track resume edits, cover letter drafts, mock interview practice, DSA problems,
        portfolio updates, and recruiter follow ups, all on one board synced to your account.
      </p>
    </div>
  );

  if (!board.loading && !board.signedIn) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-8 px-4 py-8 lg:px-8">
        {header}
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-[var(--color-c-charcoal)]/70 px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-c-emerald)]/15 text-[var(--color-c-emerald)]">
            <LogIn className="h-6 w-6" />
          </span>
          <h2 className="text-[18px] font-bold text-[var(--color-c-text)]">Sign in to use your task board</h2>
          <p className="max-w-md text-[13px] text-[var(--color-c-outline)]">
            Your board is saved to your account, so it&apos;s there on every device and never lost when you close the tab.
          </p>
          <Link
            href="/login?next=/task-board"
            className="rounded-lg bg-[var(--color-c-emerald)] px-5 py-2.5 text-[13px] font-bold text-[var(--color-c-text)] transition-all hover:bg-[var(--color-c-forest-13)]"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-8 px-4 py-8 lg:px-8">
      {header}

      {/* Metric strip */}
      <div className="grid grid-cols-1 gap-4 rounded-xl bg-[var(--color-c-charcoal)]/80 p-4 backdrop-blur-md sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 px-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-c-primary)]/20 text-[var(--color-c-emerald)]">
            <Flag className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-[var(--color-c-outline)]">Active Sprint</span>
            <span className="text-[15px] font-bold text-[var(--color-c-text)]">Week {isoWeek()}</span>
            <span className="text-[11px] text-[var(--color-c-outline)]">
              {fmtDay(ws)} – {fmtDay(we)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 px-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-c-dim-3)]/20 text-[var(--color-c-text)]">
            <ListChecks className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-[var(--color-c-outline)]">Pipeline Load</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[15px] font-bold text-[var(--color-c-text)]">{openCount}</span>
              <span className="text-xs text-[var(--color-c-outline)]">open · {total} on board</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 px-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-c-emerald)]/20 text-[var(--color-c-lime-soft)]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-[var(--color-c-outline)]">Completion Rate</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[15px] font-bold text-[var(--color-c-lime-soft)]">{completion}%</span>
              <span className="text-xs text-[var(--color-c-outline)]">
                {doneCount} of {total} finished
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-1.5 px-2">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="text-[var(--color-c-outline)]">
              Weekly target ·{" "}
              {goalEdit !== null ? (
                <input
                  autoFocus
                  type="number"
                  min={1}
                  max={200}
                  value={goalEdit}
                  onChange={(e) => setGoalEdit(e.target.value)}
                  onBlur={saveGoal}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveGoal();
                    if (e.key === "Escape") setGoalEdit(null);
                  }}
                  aria-label="Weekly task goal"
                  className="w-12 rounded bg-[var(--color-c-obsidian)] px-1 text-[11px] text-[var(--color-c-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-c-emerald)]"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setGoalEdit(String(board.weeklyGoal))}
                  title="Change your weekly goal"
                  className="font-semibold text-[var(--color-c-text)] underline decoration-dotted underline-offset-2 hover:text-[var(--color-c-emerald)]"
                >
                  {doneThisWeek}/{board.weeklyGoal} done
                </button>
              )}
            </span>
            <span className={`font-semibold ${pace === "Behind pace" ? "text-amber-400" : "text-[var(--color-c-emerald)]"}`}>
              {goalPct}% {pace}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-c-obsidian)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-c-primary)] to-[var(--color-c-emerald)] transition-[width] duration-700"
              style={{ width: `${goalPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
          {FILTERS.map((f) => {
            const active = filter === f.value;
            const count = f.value === "all" ? tasks.length : tasks.filter((t) => t.tag === f.value).length;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                aria-pressed={active}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] transition-all ${
                  active
                    ? "bg-[var(--color-c-emerald)] font-semibold text-[var(--color-c-on-primary-container)] shadow-sm"
                    : "bg-[var(--color-c-charcoal)] font-medium text-[var(--color-c-outline)] hover:text-[var(--color-c-text)]"
                }`}
              >
                {f.dot && <span className={`h-2 w-2 rounded-full ${f.dot}`} />}
                <span>{f.label}</span>
                <span
                  className={`rounded-full px-1.5 text-[11px] font-bold ${
                    active ? "bg-[var(--color-c-on-primary-container)]/20" : "bg-[var(--color-c-obsidian)] text-[var(--color-c-outline)]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <div className="relative flex-1 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--color-c-outline)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks, notes, references..."
              aria-label="Search tasks"
              className="h-10 w-full rounded-lg bg-[var(--color-c-charcoal)] pl-9 pr-8 text-xs text-[var(--color-c-text)] placeholder:text-[var(--color-c-outline)] focus:outline-none focus:ring-1 focus:ring-[var(--color-c-emerald)]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-c-outline)] hover:text-[var(--color-c-text)]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setEditor({ task: null, status: "todo" })}
            disabled={board.loading}
            className="flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--color-c-emerald)] px-4 text-[13px] font-bold text-[var(--color-c-text)] shadow-[0_0_16px_rgba(16,185,129,0.3)] transition-all hover:bg-[var(--color-c-forest-13)] active:scale-95 disabled:opacity-50"
          >
            <Plus className="h-[18px] w-[18px]" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const cards = visible.filter((t) => t.status === col.status);
          const allInCol = tasks.filter((t) => t.status === col.status).length;

          return (
            <div
              key={col.status}
              onDragOver={(e) => {
                e.preventDefault();
                setOverCol(col.status);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverCol(null);
              }}
              onDrop={() => drop(col.status)}
              className={`flex min-h-[420px] flex-col rounded-2xl p-4 transition-all lg:min-h-[500px] ${col.bg} ${
                overCol === col.status ? "ring-2 ring-[var(--color-c-emerald)]/50" : ""
              }`}
              style={{ boxShadow: col.ring }}
            >
              <div className="mb-2 flex items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.dot} ${col.glow}`} />
                  <span className="text-sm font-bold text-[var(--color-c-text)]">{col.label}</span>
                  <span
                    className={`ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${col.badge}`}
                  >
                    {allInCol}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {col.status === "done" && allInCol > 0 && (
                    <button
                      type="button"
                      onClick={archiveDone}
                      title="Move all finished tasks to the archive"
                      className="flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-[var(--color-c-outline)] transition-colors hover:bg-[var(--color-c-charcoal)]/50 hover:text-[var(--color-c-text)]"
                    >
                      <Archive className="h-3.5 w-3.5" />
                      Archive
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditor({ task: null, status: col.status })}
                    disabled={board.loading}
                    title={`Add task to ${col.label}`}
                    aria-label={`Add task to ${col.label}`}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-c-outline)] transition-colors hover:bg-[var(--color-c-charcoal)]/50 hover:text-[var(--color-c-text)]"
                  >
                    <Plus className="h-[18px] w-[18px]" />
                  </button>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                {board.loading &&
                  [0, 1].map((i) => <div key={i} className="h-[108px] animate-pulse rounded-xl bg-[var(--color-c-charcoal)]/60" />)}

                {!board.loading && total === 0 && col.status === "todo" && (
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/10 px-4 py-8 text-center">
                    <Sparkles className="h-5 w-5 text-[var(--color-c-emerald)]" />
                    <p className="text-[13px] font-semibold text-[var(--color-c-text)]">Your board is empty</p>
                    <p className="text-[12px] text-[var(--color-c-outline)]">Add your first task, or start with a few suggestions.</p>
                    <button
                      type="button"
                      onClick={addStarterTasks}
                      disabled={starterBusy}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-c-emerald)]/15 px-3 py-1.5 text-[12px] font-semibold text-[var(--color-c-emerald)] hover:bg-[var(--color-c-emerald)]/25 disabled:opacity-50"
                    >
                      {starterBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Add starter tasks
                    </button>
                  </div>
                )}

                {!board.loading && cards.length === 0 && !(total === 0 && col.status === "todo") && (
                  <p className="px-1 py-6 text-center text-xs text-[var(--color-c-outline)]">
                    {allInCol === 0 ? (dragId ? "Drop here" : "No tasks yet.") : "No tasks match the current filter."}
                  </p>
                )}

                {cards.map((task) => {
                  const style = TAG_STYLES[task.tag];
                  const meta = dueMeta(task);
                  const dragging = dragId === task.id;
                  const idx = ORDER.indexOf(task.status);

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => {
                        setDragId(task.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverCol(null);
                        setOverCard(null);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (dragId && dragId !== task.id) setOverCard(task.id);
                      }}
                      onDragLeave={() => setOverCard((c) => (c === task.id ? null : c))}
                      onClick={() => setEditor({ task, status: task.status })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.target === e.currentTarget) setEditor({ task, status: task.status });
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Edit task: ${task.title}`}
                      className={`group relative cursor-grab rounded-xl bg-[var(--color-c-charcoal)]/90 p-4 shadow-sm transition-all hover:bg-[var(--color-c-charcoal)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-c-emerald)]/60 active:cursor-grabbing ${
                        dragging ? "opacity-40" : ""
                      } ${overCard === task.id ? "border-t-2 border-[var(--color-c-emerald)]" : ""}`}
                    >
                      <div className="mb-2.5 flex items-center justify-between gap-2">
                        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${style.pill}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {task.tag}
                        </span>
                        <span className={`flex min-w-0 items-center gap-1 truncate text-[11px] ${meta.tone}`}>
                          <meta.Icon className="h-3.5 w-3.5 shrink-0" />
                          {meta.text}
                        </span>
                      </div>

                      <h4
                        className={`break-words text-[13px] font-medium text-[var(--color-c-text)] transition-colors group-hover:text-[var(--color-c-emerald)] ${
                          task.status === "done" ? "line-through decoration-[var(--color-c-outline)]/60" : ""
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.notes && (
                        <p className="mt-1.5 flex items-start gap-1 text-[11px] text-[var(--color-c-outline)]">
                          <StickyNote className="mt-0.5 h-3 w-3 shrink-0" />
                          <span className="line-clamp-2">{task.notes}</span>
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-between gap-2 pt-2.5 text-[12px] text-[var(--color-c-outline)]">
                        <RefLabel task={task} />
                        {/* Always visible on touch screens; revealed on hover with a mouse. */}
                        <div
                          className="flex shrink-0 items-center gap-0.5 transition-opacity lg:opacity-0 lg:group-focus-within:opacity-100 lg:group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => step(task, -1)}
                            disabled={idx === 0}
                            aria-label={`Move "${task.title}" back`}
                            title="Move back"
                            className="rounded p-1 transition-colors hover:bg-white/5 hover:text-[var(--color-c-text)] disabled:opacity-25"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => step(task, 1)}
                            disabled={idx === ORDER.length - 1}
                            aria-label={`Move "${task.title}" forward`}
                            title="Move forward"
                            className="rounded p-1 transition-colors hover:bg-white/5 hover:text-[var(--color-c-text)] disabled:opacity-25"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditor({ task, status: task.status })}
                            aria-label={`Edit "${task.title}"`}
                            title="Edit"
                            className="rounded p-1 transition-colors hover:bg-white/5 hover:text-[var(--color-c-text)]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTask(task.id)}
                            aria-label={`Delete "${task.title}"`}
                            title="Delete"
                            className="rounded p-1 transition-colors hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setEditor({ task: null, status: col.status })}
                disabled={board.loading}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--color-c-charcoal)]/30 py-2.5 text-[13px] text-[var(--color-c-outline)] transition-all hover:bg-[var(--color-c-charcoal)]/70 hover:text-[var(--color-c-text)]"
              >
                <Plus className="h-[18px] w-[18px]" />
                <span>Add task</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Sync tray */}
      <div className="mt-4 flex flex-col items-start justify-between gap-4 rounded-2xl bg-[var(--color-c-charcoal)]/60 p-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-c-emerald)]/15 text-[var(--color-c-emerald)]">
            <MonitorCheck className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-[var(--color-c-text)]">Synced to your account</h3>
              <span className="rounded-full bg-[var(--color-c-primary)]/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-c-emerald)]">
                {board.loading ? "Syncing" : "Live"}
              </span>
              {streak > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2 py-0.5 text-[11px] font-bold text-orange-300">
                  <Flame className="h-3 w-3" />
                  {streak}-day streak
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--color-c-outline)]">
              Last synced {ago(board.syncedAt)}. Finish at least one task a day to keep your streak going.
            </p>
          </div>
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
          <button
            type="button"
            onClick={() => setArchiveOpen(true)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--color-c-charcoal)] px-4 py-2 text-[13px] font-medium text-[var(--color-c-text)] transition-colors hover:bg-[var(--color-c-obsidian)] md:flex-initial"
          >
            <History className="h-[18px] w-[18px]" />
            <span>View Archive</span>
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={!total}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--color-c-surface-subtle)] px-4 py-2 text-[13px] font-semibold text-[var(--color-c-ink)] transition-colors hover:bg-[var(--color-c-text)] disabled:opacity-50 md:flex-initial"
          >
            <Download className="h-[18px] w-[18px]" />
            <span>Export Board</span>
          </button>
        </div>
      </div>

      {editor && (
        <TaskModal
          key={editor.task?.id ?? `new-${editor.status}`}
          task={editor.task}
          defaultStatus={editor.status}
          onClose={() => setEditor(null)}
          onSave={(input) => {
            if (!editor.task) return board.create(input);
            const t = editor.task;
            // Moving columns from the editor lands the card at the bottom of the new column.
            if (input.status !== t.status) {
              const { status, ...rest } = input;
              return board.move(t.id, status).then((ok) => (ok ? board.update(t.id, rest) : false));
            }
            return board.update(t.id, input);
          }}
          onDelete={editor.task ? () => deleteTask(editor.task!.id) : undefined}
        />
      )}

      {archiveOpen && (
        <ArchiveModal
          load={board.loadArchive}
          onRestore={async (t) => {
            const ok = await board.unarchive(t);
            if (ok) showToast({ text: "Task restored to the board", kind: "ok" });
            return ok;
          }}
          onDelete={board.deleteArchived}
          onClose={() => setArchiveOpen(false)}
        />
      )}

      {toast && (
        <div
          role="status"
          className="cl-fade fixed bottom-5 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-3 rounded-xl border px-4 py-2.5 text-[12px] font-semibold shadow-2xl"
          style={{
            borderColor: toast.kind === "ok" ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)",
            background: toast.kind === "ok" ? "#0f1d13" : "#2d1416",
            color: toast.kind === "ok" ? "#6ee7b7" : "#fca5a5",
          }}
        >
          {toast.text}
          {toast.undo && (
            <button type="button" onClick={toast.undo} className="rounded-md bg-white/10 px-2 py-0.5 text-white hover:bg-white/20">
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
