"use client";

import { useMemo, useState } from "react";
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
  MessageSquare,
  GripVertical,
  CircleCheck,
  CalendarDays,
  Clock,
  Timer,
  BadgeCheck,
  MonitorCheck,
  History,
  Share2,
} from "lucide-react";

type Status = "todo" | "inprogress" | "done";
type Tag = "Resume" | "DSA Sheets" | "Interview" | "Applied";

type Task = {
  id: string;
  title: string;
  tag: Tag;
  status: Status;
  ref: string;
  meta: string;
  metaIcon: "calendar" | "clock" | "timer" | "verified" | "bolt";
  refIcon: "terminal" | "code" | "send";
  done?: boolean;
};

const TAG_STYLES: Record<Tag, { pill: string; dot: string }> = {
  Resume: { pill: "bg-blue-500/15 text-blue-400", dot: "bg-blue-400" },
  "DSA Sheets": { pill: "bg-amber-400/15 text-amber-300", dot: "bg-amber-400" },
  Interview: { pill: "bg-[var(--color-c-violet-soft)]/20 text-[var(--color-c-violet-soft)]", dot: "bg-[var(--color-c-violet-soft)]" },
  Applied: { pill: "bg-[var(--color-c-emerald)]/20 text-[var(--color-c-lime-soft)]", dot: "bg-[var(--color-c-emerald)]" },
};

const COLUMNS: {
  status: Status;
  label: string;
  dot: string;
  glow: string;
  badge: string;
  ring: string;
  bg: string;
}[] = [
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
];

const INITIAL: Task[] = [
  {
    id: "t1",
    title: "Optimize ATS keywords for Google SWE referral application",
    tag: "Resume",
    status: "todo",
    ref: "JOB-104",
    meta: "Today",
    metaIcon: "calendar",
    refIcon: "terminal",
  },
  {
    id: "t2",
    title: "Schedule mock system design round with senior peer",
    tag: "Interview",
    status: "todo",
    ref: "SYS-082",
    meta: "Tomorrow",
    metaIcon: "clock",
    refIcon: "terminal",
  },
  {
    id: "t3",
    title: "Practice 3 Two-Pointer DSA patterns (Container with most water)",
    tag: "DSA Sheets",
    status: "inprogress",
    ref: "LeetCode #11",
    meta: "2/3 done",
    metaIcon: "timer",
    refIcon: "code",
  },
  {
    id: "t4",
    title: "Submit application to Amazon SDE-1 vacancy",
    tag: "Applied",
    status: "done",
    ref: "AMZ-REF-44",
    meta: "Verified",
    metaIcon: "verified",
    refIcon: "send",
    done: true,
  },
];

const META_ICONS = {
  calendar: CalendarDays,
  clock: Clock,
  timer: Timer,
  verified: BadgeCheck,
  bolt: Clock,
};

const REF_ICONS = { terminal: Terminal, code: Code2, send: Send };

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL);
  const [filter, setFilter] = useState<Tag | "all">("all");
  const [query, setQuery] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<Status | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [draftCol, setDraftCol] = useState<Status>("todo");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftTag, setDraftTag] = useState<Tag>("Resume");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchesFilter = filter === "all" || t.tag === filter;
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.tag.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [tasks, filter, query]);

  const total = tasks.length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const completion = total ? Math.round((doneCount / total) * 100) : 0;

  function openModal(status: Status) {
    setDraftCol(status);
    setDraftTitle("");
    setModalOpen(true);
  }

  function createTask() {
    const title = draftTitle.trim();
    if (!title) return;
    setTasks((prev) => [
      ...prev,
      {
        id: `t${Date.now()}`,
        title,
        tag: draftTag,
        status: draftCol,
        ref: `DEV-${Math.floor(100 + Math.random() * 900)}`,
        meta: "Just now",
        metaIcon: "bolt",
        refIcon: "terminal",
      },
    ]);
    setModalOpen(false);
  }

  function drop(status: Status) {
    if (!dragId) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === dragId ? { ...t, status, done: status === "done" } : t,
      ),
    );
    setDragId(null);
    setOverCol(null);
  }

  /** Keyboard fallback for drag-and-drop. */
  function move(id: string, dir: -1 | 1) {
    const order: Status[] = ["todo", "inprogress", "done"];
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = order[Math.min(2, Math.max(0, order.indexOf(t.status) + dir))];
        return { ...t, status: next, done: next === "done" };
      }),
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-8 px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="flex max-w-5xl flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-c-emerald)]">
          <span className="inline-block h-2 w-2 animate-ping rounded-full bg-[var(--color-c-emerald)]" />
          <span>Developer Career Sprint Engine</span>
          <span className="mx-1 text-[var(--color-c-outline)]">•</span>
          <span className="font-mono text-[var(--color-c-outline)]">v2.4.0-prod</span>
        </div>
        <h1 className="select-none text-[30px] font-extrabold uppercase leading-none tracking-tight text-[var(--color-c-text)]">
          Task Board
        </h1>
        <p className="max-w-4xl text-[13px] leading-relaxed text-[var(--color-c-text-muted)]">
          Plan your job search day by day. Track resume edits, cover letter
          drafts, mock interview practice, DSA problems, portfolio updates, and
          recruiter follow ups, all on one board synced to your account.
        </p>
      </div>

      {/* Metric strip */}
      <div className="grid grid-cols-1 gap-4 rounded-xl bg-[var(--color-c-charcoal)]/80 p-4 backdrop-blur-md md:grid-cols-4">
        <div className="flex items-center gap-4 px-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-c-primary)]/20 text-[var(--color-c-emerald)]">
            <Flag className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-[var(--color-c-outline)]">
              Active Cadence
            </span>
            <span className="text-[15px] font-bold text-[var(--color-c-text)]">Sprint 24</span>
          </div>
        </div>

        <div className="flex items-center gap-4 px-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-c-dim-3)]/20 text-[var(--color-c-text)]">
            <ListChecks className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-[var(--color-c-outline)]">
              Pipeline Load
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[15px] font-bold text-[var(--color-c-text)]">{total}</span>
              <span className="text-xs text-[var(--color-c-outline)]">Tasks synced</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 px-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-c-emerald)]/20 text-[var(--color-c-lime-soft)]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-[var(--color-c-outline)]">
              Completion Rate
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[15px] font-bold text-[var(--color-c-lime-soft)]">
                {completion}%
              </span>
              <span className="text-xs text-[var(--color-c-outline)]">
                {doneCount} of {total} finished
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-1.5 px-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[var(--color-c-outline)]">Weekly Target Velocity</span>
            <span className="font-semibold text-[var(--color-c-emerald)]">75% On Track</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-c-obsidian)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-c-primary)] to-[var(--color-c-emerald)]"
              style={{ width: "75%" }}
            />
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
          {FILTERS.map((f) => {
            const active = filter === f.value;
            const count =
              f.value === "all"
                ? tasks.length
                : tasks.filter((t) => t.tag === f.value).length;
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
              placeholder="Search tasks or keywords..."
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
            onClick={() => openModal("todo")}
            className="flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--color-c-emerald)] px-4 text-[13px] font-bold text-[var(--color-c-text)] shadow-[0_0_16px_rgba(16,185,129,0.3)] transition-all hover:bg-[var(--color-c-forest-13)] active:scale-95"
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
              onDragLeave={() => setOverCol(null)}
              onDrop={() => drop(col.status)}
              className={`flex min-h-[500px] flex-col rounded-2xl p-4 transition-all ${col.bg} ${
                overCol === col.status ? "ring-2 ring-[var(--color-c-emerald)]/50" : ""
              }`}
              style={{ boxShadow: col.ring }}
            >
              <div className="mb-2 flex items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${col.dot} ${col.glow}`}
                  />
                  <span className="text-sm font-bold text-[var(--color-c-text)]">
                    {col.label}
                  </span>
                  <span
                    className={`ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${col.badge}`}
                  >
                    {allInCol}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => openModal(col.status)}
                  title={`Add task to ${col.label}`}
                  aria-label={`Add task to ${col.label}`}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-c-outline)] transition-colors hover:bg-[var(--color-c-charcoal)]/50 hover:text-[var(--color-c-text)]"
                >
                  <Plus className="h-[18px] w-[18px]" />
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                {cards.length === 0 && (
                  <p className="px-1 py-6 text-center text-xs text-[var(--color-c-outline)]">
                    {allInCol === 0
                      ? "No tasks yet."
                      : "No tasks match the current filter."}
                  </p>
                )}

                {cards.map((task) => {
                  const style = TAG_STYLES[task.tag];
                  const MetaIcon = META_ICONS[task.metaIcon];
                  const RefIcon = REF_ICONS[task.refIcon];
                  const dragging = dragId === task.id;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => setDragId(task.id)}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverCol(null);
                      }}
                      className={`group relative cursor-grab rounded-xl bg-[var(--color-c-charcoal)]/90 p-4 shadow-sm transition-all hover:bg-[var(--color-c-charcoal)] active:cursor-grabbing ${
                        dragging ? "opacity-40" : ""
                      }`}
                    >
                      <div className="mb-2.5 flex items-center justify-between gap-1">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${style.pill}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                          />
                          {task.tag}
                        </span>
                        <span
                          className={`flex items-center gap-1 text-[11px] ${
                            task.metaIcon === "timer"
                              ? "font-semibold text-amber-400"
                              : "text-[var(--color-c-outline)]"
                          }`}
                        >
                          <MetaIcon className="h-3.5 w-3.5" />
                          {task.meta}
                        </span>
                      </div>

                      <h4
                        className={`text-[13px] font-medium text-[var(--color-c-text)] transition-colors group-hover:text-[var(--color-c-emerald)] ${
                          task.done ? "line-through decoration-[var(--color-c-outline)]/60" : ""
                        }`}
                      >
                        {task.title}
                      </h4>

                      <div className="mt-3 flex items-center justify-between pt-2.5 text-[12px] text-[var(--color-c-outline)]">
                        <div
                          className={`flex items-center gap-1 font-mono ${
                            task.refIcon === "code" ? "text-[var(--color-c-lime-soft)]" : ""
                          }`}
                        >
                          <RefIcon className="h-3.5 w-3.5" />
                          <span>{task.ref}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.done ? (
                            <CircleCheck className="h-4 w-4 text-[var(--color-c-emerald)]" />
                          ) : (
                            <MessageSquare className="h-4 w-4 cursor-pointer transition-colors hover:text-[var(--color-c-text)]" />
                          )}
                          {/* Keyboard-accessible alternative to dragging */}
                          <button
                            type="button"
                            onClick={() => move(task.id, 1)}
                            disabled={task.status === "done"}
                            aria-label={`Move "${task.title}" to next column`}
                            className="cursor-pointer transition-colors hover:text-[var(--color-c-text)] disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <GripVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => openModal(col.status)}
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
              <h3 className="text-sm font-semibold text-[var(--color-c-text)]">
                Synced with Job Alert 24 Daily Bot
              </h3>
              <span className="rounded-full bg-[var(--color-c-primary)]/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-c-emerald)]">
                Live
              </span>
            </div>
            <p className="text-xs text-[var(--color-c-outline)]">
              Completing tasks automatically updates your sprint streak &amp;
              campus leaderboard status.
            </p>
          </div>
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--color-c-charcoal)] px-4 py-2 text-[13px] font-medium text-[var(--color-c-text)] transition-colors hover:bg-[var(--color-c-obsidian)] md:flex-initial"
          >
            <History className="h-[18px] w-[18px]" />
            <span>View Archive</span>
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--color-c-surface-subtle)] px-4 py-2 text-[13px] font-semibold text-[var(--color-c-ink)] transition-colors hover:bg-[var(--color-c-text)] md:flex-initial"
          >
            <Share2 className="h-[18px] w-[18px]" />
            <span>Export Board</span>
          </button>
        </div>
      </div>

      {/* New task modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-c-obsidian)]/80 p-4 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Add new task"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-lg flex-col gap-4 rounded-2xl bg-[var(--color-c-charcoal)] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-c-emerald)]" />
                <h3 className="text-base font-bold text-[var(--color-c-text)]">
                  Add New Task
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-c-outline)] transition-colors hover:bg-[var(--color-c-obsidian)] hover:text-[var(--color-c-text)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="task-title"
                className="text-[11px] font-semibold uppercase text-[var(--color-c-outline)]"
              >
                Task Title
              </label>
              <input
                id="task-title"
                autoFocus
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createTask()}
                placeholder="e.g., Draft cold email for Stripe hiring manager"
                className="h-11 w-full rounded-lg bg-[var(--color-c-obsidian)] px-3 text-[13px] text-[var(--color-c-text)] placeholder:text-[var(--color-c-outline)] focus:outline-none focus:ring-1 focus:ring-[var(--color-c-emerald)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="task-tag"
                  className="text-[11px] font-semibold uppercase text-[var(--color-c-outline)]"
                >
                  Category Tag
                </label>
                <select
                  id="task-tag"
                  value={draftTag}
                  onChange={(e) => setDraftTag(e.target.value as Tag)}
                  className="h-10 w-full rounded-lg bg-[var(--color-c-obsidian)] px-3 text-xs text-[var(--color-c-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-c-emerald)]"
                >
                  {(Object.keys(TAG_STYLES) as Tag[]).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="task-col"
                  className="text-[11px] font-semibold uppercase text-[var(--color-c-outline)]"
                >
                  Column Status
                </label>
                <select
                  id="task-col"
                  value={draftCol}
                  onChange={(e) => setDraftCol(e.target.value as Status)}
                  className="h-10 w-full rounded-lg bg-[var(--color-c-obsidian)] px-3 text-xs text-[var(--color-c-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-c-emerald)]"
                >
                  {COLUMNS.map((c) => (
                    <option key={c.status} value={c.status}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg px-4 py-2 text-[13px] text-[var(--color-c-outline)] transition-colors hover:text-[var(--color-c-text)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={createTask}
                disabled={!draftTitle.trim()}
                className="rounded-lg bg-[var(--color-c-emerald)] px-5 py-2.5 text-[13px] font-bold text-[var(--color-c-text)] shadow-md transition-all hover:bg-[var(--color-c-forest-13)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
