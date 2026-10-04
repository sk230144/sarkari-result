"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, GraduationCap, Mail, X } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Modal } from "@/components/cover-letter/modal";

/** Applications land here, sent from the applicant's own Gmail. */
const AMBASSADOR_INBOX = "risabht043@gmail.com";

const FIELDS = [
  { key: "name", label: "Full name", type: "text", autoComplete: "name", placeholder: "Priya Sharma", required: true },
  { key: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "you@college.edu", required: true },
  { key: "phone", label: "Phone (WhatsApp)", type: "tel", autoComplete: "tel", placeholder: "+91 98765 43210", required: true },
  { key: "college", label: "College", type: "text", autoComplete: "organization", placeholder: "IIT Delhi", required: true },
  { key: "course", label: "Course and year", type: "text", autoComplete: "off", placeholder: "B.Tech CSE, 3rd year", required: true },
  { key: "city", label: "City", type: "text", autoComplete: "address-level2", placeholder: "New Delhi", required: true },
  { key: "profile", label: "LinkedIn or Instagram", type: "url", autoComplete: "url", placeholder: "https://linkedin.com/in/…", required: false },
] as const;

type Key = (typeof FIELDS)[number]["key"] | "why";
const WHY_MAX = 1000;

const enc = encodeURIComponent;

function compose(v: Record<Key, string>) {
  const subject = `Campus Ambassador application: ${v.name.trim()} (${v.college.trim()})`;
  const body = [
    ...FIELDS.filter((f) => v[f.key].trim()).map((f) => `${f.label}: ${v[f.key].trim()}`),
    "",
    "Why I want to be a Campus Ambassador:",
    v.why.trim(),
  ].join("\n");
  return {
    gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(AMBASSADOR_INBOX)}&su=${enc(subject)}&body=${enc(body)}`,
    mailto: `mailto:${AMBASSADOR_INBOX}?subject=${enc(subject)}&body=${enc(body)}`,
  };
}

const INPUT =
  "w-full rounded-xl border border-white/10 bg-[#0b0e0b] px-3 py-2.5 text-[13px] text-white placeholder:text-white/35 focus:border-[#a3e635]/50 focus:outline-none";

/** Campus Ambassador application. Submitting opens a filled-in Gmail draft to AMBASSADOR_INBOX. */
export function AmbassadorForm({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [values, setValues] = useState<Record<Key, string>>(() => ({
    name: (user?.user_metadata?.full_name as string | undefined) ?? "",
    email: user?.email ?? "",
    phone: "",
    college: "",
    course: "",
    city: "",
    profile: "",
    why: "",
  }));
  const [links, setLinks] = useState<ReturnType<typeof compose> | null>(null);

  const set = (key: Key) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = compose(values);
    // Opened inside the submit click, so pop-up blockers allow it.
    window.open(next.gmail, "_blank", "noopener,noreferrer");
    setLinks(next);
  }

  return createPortal(
    <Modal label="Become a Campus Ambassador" onClose={onClose} className="max-w-lg">
      {links ? (
        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <CheckCircle2 className="h-10 w-10 text-[#a3e635]" />
          <p className="text-[16px] font-bold text-[#e6edf3]">Almost done!</p>
          <p className="text-[13px] text-white/60">
            Gmail opened in a new tab with your application filled in. Click <strong className="text-white">Send</strong> there to submit it.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <a
              href={links.gmail}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#a3e635] px-4 py-2 text-[13px] font-bold text-black"
            >
              <Mail className="h-3.5 w-3.5" />
              Open Gmail again
            </a>
            <a href={links.mailto} className="rounded-lg border border-white/15 px-4 py-2 text-[13px] font-semibold text-white/80 hover:text-white">
              Use another email app
            </a>
          </div>
          <button type="button" onClick={onClose} className="mt-1 text-[12px] text-white/50 hover:text-white">
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex min-h-0 flex-col">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <p className="flex items-center gap-2 text-[15px] font-bold text-[#e6edf3]">
              <GraduationCap className="h-4 w-4 text-[#a3e635]" />
              Become a Campus Ambassador
            </p>
            <button type="button" onClick={onClose} aria-label="Close" className="text-white/50 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 space-y-4 overflow-y-auto p-5">
            <p className="text-[12px] leading-relaxed text-white/55">
              Represent Job Alert 24 at your college. Fill in your details and we&apos;ll get back to you.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {FIELDS.map((f) => (
                <label key={f.key} className={f.key === "profile" ? "block sm:col-span-2" : "block"}>
                  <span className="mb-1.5 block text-[12px] font-semibold text-white/70">
                    {f.label} {!f.required && <span className="font-normal text-white/40">(optional)</span>}
                  </span>
                  <input
                    type={f.type}
                    value={values[f.key]}
                    onChange={set(f.key)}
                    required={f.required}
                    maxLength={200}
                    autoComplete={f.autoComplete}
                    placeholder={f.placeholder}
                    className={INPUT}
                  />
                </label>
              ))}
            </div>
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-semibold text-white/70">Why do you want to be a Campus Ambassador?</span>
              <textarea
                value={values.why}
                onChange={set("why")}
                required
                rows={4}
                maxLength={WHY_MAX}
                placeholder="Tell us about yourself and how you'd spread the word on campus."
                className={`${INPUT} resize-y leading-relaxed`}
              />
              <span className="mt-1 block text-right font-mono text-[10px] text-white/35">
                {values.why.length}/{WHY_MAX}
              </span>
            </label>
            <p className="text-[11px] text-white/40">Submitting opens Gmail with your application ready to send to {AMBASSADOR_INBOX}.</p>
          </div>

          <div className="flex justify-end gap-2 border-t border-white/[0.06] px-5 py-3">
            <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-[13px] text-white/60 hover:text-white">
              Cancel
            </button>
            <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg bg-[#a3e635] px-4 py-2 text-[13px] font-bold text-black">
              <Mail className="h-3.5 w-3.5" />
              Send with Gmail
            </button>
          </div>
        </form>
      )}
    </Modal>,
    document.body,
  );
}
