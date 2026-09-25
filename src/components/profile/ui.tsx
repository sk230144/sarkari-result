"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Check, X, Loader2 } from "lucide-react";
import { Modal } from "@/components/cover-letter/modal";

export function Panel({
  icon: Icon,
  tint,
  title,
  action,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-[var(--color-c-text)]">
          <Icon className={`h-4 w-4 ${tint}`} />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] ${className}`}>
      {children}
    </section>
  );
}

export function AddButton({ label = "Add", onClick }: { label?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-c-neutral-6)] bg-[var(--color-c-surface-5b)] px-2 py-1 text-[11px] font-medium text-[var(--color-c-text-4)] transition-colors hover:border-[var(--color-c-border-strong)] hover:text-[var(--color-c-text)]"
    >
      <Plus className="h-3 w-3" />
      {label}
    </button>
  );
}

export function SmallButton({
  children,
  onClick,
  tone = "default",
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  tone?: "default" | "primary" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const cls =
    tone === "primary"
      ? "bg-[var(--color-c-lime)] text-black hover:brightness-110 font-bold"
      : tone === "danger"
        ? "border border-red-500/30 text-red-300 hover:bg-red-500/10"
        : "border border-[var(--color-c-neutral-6)] bg-[var(--color-c-surface-5b)] text-[var(--color-c-text-4)] hover:border-[var(--color-c-border-strong)] hover:text-[var(--color-c-text)]";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${cls}`}
    >
      {children}
    </button>
  );
}

/** Edit / delete / move up / move down for a list row. */
export function RowActions({
  onEdit,
  onDelete,
  onUp,
  onDown,
}: {
  onEdit: () => void;
  onDelete: () => void;
  onUp?: () => void;
  onDown?: () => void;
}) {
  const btn = "rounded p-1 text-[var(--color-c-dim)] transition-colors hover:bg-white/5 disabled:opacity-25";
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      {onUp && (
        <button type="button" onClick={onUp} aria-label="Move up" className={`${btn} hover:text-[var(--color-c-text)]`}>
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
      )}
      {onDown && (
        <button type="button" onClick={onDown} aria-label="Move down" className={`${btn} hover:text-[var(--color-c-text)]`}>
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
      )}
      <button type="button" onClick={onEdit} aria-label="Edit" className={`${btn} hover:text-[var(--color-c-text)]`}>
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={onDelete} aria-label="Delete" className={`${btn} hover:text-[var(--color-c-red)]`}>
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-5 w-10 shrink-0 rounded-full p-0.5 transition-colors ${
        on ? "bg-[var(--color-c-lime)]" : "bg-[var(--color-c-border-strong)]"
      }`}
    >
      <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${on ? "translate-x-5" : ""}`} />
    </button>
  );
}

const inputCls =
  "w-full rounded-lg border border-[var(--color-c-neutral-6)] bg-[var(--color-c-canvas)] px-3 py-2 text-[12px] text-[var(--color-c-text)] placeholder:text-[var(--color-c-dim)] focus:border-[var(--color-c-lime)]/60 focus:outline-none focus:ring-1 focus:ring-[var(--color-c-lime)]/30";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} h-9 ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} resize-y leading-relaxed ${props.className ?? ""}`} />;
}

/**
 * Click-to-edit single line. Enter saves, Escape cancels.
 */
export function InlineText({
  value,
  placeholder,
  maxLength,
  onSave,
  className = "",
  inputClassName = "",
}: {
  value: string;
  placeholder: string;
  maxLength: number;
  onSave: (v: string) => Promise<boolean> | boolean | void;
  className?: string;
  inputClassName?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  async function commit() {
    const v = draft.trim();
    if (v === value) return setEditing(false);
    const ok = await onSave(v);
    if (ok !== false) setEditing(false);
  }

  if (editing) {
    return (
      <span className="flex items-center gap-1.5">
        <input
          ref={ref}
          value={draft}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
          className={`${inputCls} h-8 ${inputClassName}`}
        />
        <button type="button" onClick={commit} aria-label="Save" className="rounded-md bg-[var(--color-c-lime)] p-1.5 text-black">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          aria-label="Cancel"
          className="rounded-md p-1.5 text-[var(--color-c-dim)] hover:text-[var(--color-c-text)]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className={`group inline-flex items-center gap-2 text-left ${className}`}
    >
      <span className={value ? "" : "opacity-70"}>{value || placeholder}</span>
      <Pencil className="h-3 w-3 shrink-0 text-[var(--color-c-dim)] transition-colors group-hover:text-[var(--color-c-text)]" />
    </button>
  );
}

/* ------------------------------------------------------ entry modal */

export type Field = {
  key: string;
  label: string;
  kind?: "text" | "textarea" | "lines" | "tags";
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  half?: boolean;
};

/**
 * Add/edit form for one list item. "lines" edits a string[] one per line,
 * "tags" a string[] comma-separated.
 */
export function EntryModal<T extends Record<string, unknown>>({
  title,
  fields,
  initial,
  onClose,
  onSave,
}: {
  title: string;
  fields: Field[];
  initial: T;
  onClose: () => void;
  onSave: (value: T) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState<Record<string, string>>(() => {
    const d: Record<string, string> = {};
    for (const f of fields) {
      const v = initial[f.key];
      d[f.key] = Array.isArray(v) ? v.join(f.kind === "tags" ? ", " : "\n") : ((v as string) ?? "");
    }
    return d;
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const missing = fields.find((f) => f.required && !draft[f.key]?.trim());
    if (missing) return setErr(`${missing.label} is required.`);
    const value: Record<string, unknown> = { ...initial };
    for (const f of fields) {
      const raw = draft[f.key] ?? "";
      value[f.key] =
        f.kind === "lines"
          ? raw.split("\n").map((l) => l.trim()).filter(Boolean)
          : f.kind === "tags"
            ? raw.split(",").map((t) => t.trim()).filter(Boolean)
            : raw.trim();
    }
    setBusy(true);
    setErr(null);
    const ok = await onSave(value as T);
    setBusy(false);
    if (ok) onClose();
  }

  return (
    <Modal label={title} onClose={onClose} className="max-h-[90vh] max-w-lg">
      <form onSubmit={submit} className="flex min-h-0 flex-col">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <p className="text-[14px] font-bold text-[var(--color-c-text)]">{title}</p>
          <button type="button" onClick={onClose} aria-label="Close" className="text-[var(--color-c-dim)] hover:text-[var(--color-c-text)]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-y-auto p-5">
          {fields.map((f) => (
            <label key={f.key} className={`flex flex-col gap-1.5 ${f.half ? "col-span-1" : "col-span-2"}`}>
              <span className="text-[11px] font-semibold text-[var(--color-c-text-4)]">
                {f.label}
                {f.required && <span className="text-[var(--color-c-lime)]"> *</span>}
                {f.kind === "lines" && <span className="font-normal text-[var(--color-c-dim)]"> (one per line)</span>}
                {f.kind === "tags" && <span className="font-normal text-[var(--color-c-dim)]"> (comma separated)</span>}
              </span>
              {f.kind === "textarea" || f.kind === "lines" ? (
                <TextArea
                  rows={f.kind === "lines" ? 5 : 3}
                  value={draft[f.key]}
                  placeholder={f.placeholder}
                  maxLength={f.kind === "lines" ? 4000 : f.maxLength}
                  onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                />
              ) : (
                <TextInput
                  value={draft[f.key]}
                  placeholder={f.placeholder}
                  maxLength={f.maxLength ?? 120}
                  onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                />
              )}
            </label>
          ))}
        </div>
        {err && <p className="px-5 pb-2 text-[12px] text-red-300">{err}</p>}
        <div className="flex justify-end gap-2 border-t border-white/[0.06] px-5 py-3">
          <SmallButton onClick={onClose}>Cancel</SmallButton>
          <SmallButton type="submit" tone="primary" disabled={busy}>
            {busy && <Loader2 className="h-3 w-3 animate-spin" />}
            Save
          </SmallButton>
        </div>
      </form>
    </Modal>
  );
}

/** Returns a copy of the list with item i moved by delta. */
export function moveItem<T>(list: T[], i: number, delta: number): T[] {
  const j = i + delta;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}
