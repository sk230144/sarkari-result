"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { TOPICS, type Topic } from "./topics";

const FIELD =
  "w-full rounded-xl border border-[var(--color-c-forest-16)] bg-[var(--color-c-surface-4)] px-4 py-3 text-sm text-[var(--color-c-text)] placeholder:text-[var(--color-c-dim)] outline-none transition-colors focus:border-[var(--color-c-green)]";

/** Opens a Gmail draft addressed to us, filled with what the visitor typed. */
export function ContactForm({ to, initialTopic }: { to: string; initialTopic: Topic }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<Topic>(initialTopic);
  const [message, setMessage] = useState("");
  const [opened, setOpened] = useState(false);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const label = TOPICS.find(([k]) => k === topic)?.[1] ?? "General question";
    const subject = `[Job Alert 24] ${label} — ${name.trim()}`;
    const body = `${message.trim()}\n\n—\nName: ${name.trim()}\nEmail: ${email.trim()}\nTopic: ${label}`;
    const url =
      "https://mail.google.com/mail/?view=cm&fs=1" +
      `&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const w = window.open(url, "_blank");
    if (w) w.opener = null;
    else window.location.href = url; // pop-up blocked: open it here instead
    setOpened(true);
  }

  return (
    <form onSubmit={send} className="space-y-4 rounded-[28px] border border-[var(--color-c-forest-8)] bg-[var(--color-c-raised-2)] p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-[var(--color-c-text)]">Your name</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={FIELD} placeholder="Aarav Sharma" autoComplete="name" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-[var(--color-c-text)]">Your email</span>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={FIELD} placeholder="you@example.com" autoComplete="email" />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-[var(--color-c-text)]">Topic</span>
        <select value={topic} onChange={(e) => setTopic(e.target.value as Topic)} className={FIELD}>
          {TOPICS.map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-[var(--color-c-text)]">Message</span>
        <textarea
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${FIELD} resize-y`}
          placeholder="How can we help?"
        />
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[var(--color-c-dim)]">
          {opened ? "Gmail opened in a new tab. Press Send there to deliver your message." : "Send opens Gmail with your message ready to go."}
        </p>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-c-green)] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-[var(--color-c-green-2)]"
        >
          <Send className="h-4 w-4" />
          Send
        </button>
      </div>
    </form>
  );
}
