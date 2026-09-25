"use client";

import { useEffect, useState } from "react";
import { X, Trash2, Loader2, RotateCcw, Archive } from "lucide-react";
import { Modal } from "@/components/cover-letter/modal";
import { TAGS, type Status, type Tag, type Task, type TaskInput } from "./use-tasks";

export const STATUS_LABELS: Record<Status, string> = { todo: "To Do", inprogress: "In Progress", done: "Done" };

const field =
  "w-full rounded-lg bg-[var(--color-c-obsidian)] px-3 text-[13px] text-[var(--color-c-text)] placeholder:text-[var(--color-c-outline)] focus:outline-none focus:ring-1 focus:ring-[var(--color-c-emerald)]";
const label = "text-[11px] font-semibold uppercase text-[var(--color-c-outline)]";

/** Add or edit a task. `task` present means edit mode (with Delete). */
export function TaskModal({
  task,
  defaultStatus,
  onClose,
  onSave,
  onDelete,
}: {
  task: Task | null;
  defaultStatus: Status;
  onClose: () => void;
  onSave: (input: TaskInput) => Promise<boolean>;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [tag, setTag] = useState<Tag>(task?.tag ?? "Resume");
  const [status, setStatus] = useState<Status>(task?.status ?? defaultStatus);
  const [due, setDue] = useState(task?.due_date ?? "");
  const [reference, setReference] = useState(task?.reference ?? "");
  const [notes, setNotes] = useState(task?.notes ?? "");
  const [busy, setBusy] = useState(false);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const t = title.trim();
    if (!t || busy) return;
    setBusy(true);
    const ok = await onSave({
      title: t.slice(0, 200),
      tag,
      status,
      due_date: due || null,
      reference: reference.trim().slice(0, 200) || null,
      notes: notes.trim().slice(0, 2000) || null,
    });
    setBusy(false);
    if (ok) onClose();
  }

  return (
    <Modal label={task ? "Edit task" : "Add new task"} onClose={onClose} className="max-h-[92vh] max-w-lg">
      <form onSubmit={submit} className="flex min-h-0 flex-col">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-c-emerald)]" />
            <h3 className="text-base font-bold text-[var(--color-c-text)]">{task ? "Edit Task" : "Add New Task"}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-c-outline)] transition-colors hover:bg-[var(--color-c-obsidian)] hover:text-[var(--color-c-text)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="task-title" className={label}>
              Task Title
            </label>
            <input
              id="task-title"
              autoFocus
              value={title}
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Draft cold email for Stripe hiring manager"
              className={`${field} h-11`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="task-tag" className={label}>
                Category Tag
              </label>
              <select id="task-tag" value={tag} onChange={(e) => setTag(e.target.value as Tag)} className={`${field} h-10 text-xs`}>
                {TAGS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="task-col" className={label}>
                Column Status
              </label>
              <select id="task-col" value={status} onChange={(e) => setStatus(e.target.value as Status)} className={`${field} h-10 text-xs`}>
                {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="task-due" className={label}>
                Due Date
              </label>
              <input id="task-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} className={`${field} h-10 text-xs`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="task-ref" className={label}>
                Reference
              </label>
              <input
                id="task-ref"
                value={reference}
                maxLength={200}
                onChange={(e) => setReference(e.target.value)}
                placeholder="LeetCode #11, job link…"
                className={`${field} h-10 text-xs`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-notes" className={label}>
              Notes
            </label>
            <textarea
              id="task-notes"
              value={notes}
              maxLength={2000}
              rows={4}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything to remember: recruiter name, links, what's left…"
              className={`${field} resize-y py-2.5 leading-relaxed`}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] px-6 py-4">
          {task && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] text-red-300 transition-colors hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-[13px] text-[var(--color-c-outline)] transition-colors hover:text-[var(--color-c-text)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || busy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-c-emerald)] px-5 py-2.5 text-[13px] font-bold text-[var(--color-c-text)] shadow-md transition-all hover:bg-[var(--color-c-forest-13)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {task ? "Save Changes" : "Save Task"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

/** Archived tasks: restore to the board or delete for good. */
export function ArchiveModal({
  load,
  onRestore,
  onDelete,
  onClose,
}: {
  load: () => Promise<Task[]>;
  onRestore: (task: Task) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onClose: () => void;
}) {
  const [items, setItems] = useState<Task[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    load().then((rows) => !cancelled && setItems(rows));
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function act(id: string, fn: () => Promise<boolean>) {
    setBusy(id);
    const ok = await fn();
    setBusy(null);
    if (ok) setItems((prev) => prev?.filter((t) => t.id !== id) ?? null);
  }

  return (
    <Modal label="Task archive" onClose={onClose} className="h-[min(80vh,640px)] max-w-lg">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center gap-2">
          <Archive className="h-4 w-4 text-[var(--color-c-emerald)]" />
          <h3 className="text-base font-bold text-[var(--color-c-text)]">Archive</h3>
          {items && <span className="text-[12px] text-[var(--color-c-outline)]">{items.length} tasks</span>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-c-outline)] hover:bg-[var(--color-c-obsidian)] hover:text-[var(--color-c-text)]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {!items ? (
          <p className="flex items-center justify-center gap-2 py-10 text-[12px] text-[var(--color-c-outline)]">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading archive…
          </p>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-[12px] text-[var(--color-c-outline)]">
            Nothing archived yet. Use &ldquo;Archive&rdquo; on the Done column to clear finished tasks off your board.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((t) => (
              <li key={t.id} className="flex items-center gap-3 rounded-xl bg-[var(--color-c-charcoal)]/80 px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-[var(--color-c-text)]">{t.title}</p>
                  <p className="text-[11px] text-[var(--color-c-outline)]">
                    {t.tag} · {STATUS_LABELS[t.status]}
                    {t.completed_at && ` · done ${new Date(t.completed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                  </p>
                </div>
                {busy === t.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--color-c-outline)]" />
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => act(t.id, () => onRestore(t))}
                      aria-label={`Restore "${t.title}"`}
                      title="Restore to board"
                      className="rounded-lg p-1.5 text-[var(--color-c-outline)] hover:bg-white/5 hover:text-[var(--color-c-emerald)]"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => act(t.id, () => onDelete(t.id))}
                      aria-label={`Delete "${t.title}" permanently`}
                      title="Delete permanently"
                      className="rounded-lg p-1.5 text-[var(--color-c-outline)] hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
