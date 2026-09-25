"use client";

import { useState } from "react";
import {
  Github,
  Globe,
  Star,
  UserRound,
  Code2,
  Building2,
  GraduationCap,
  FolderGit2,
  BadgeCheck,
  X,
  ExternalLink,
  Loader2,
  Trash2,
  Plus,
} from "lucide-react";
import {
  SOCIALS,
  groupSkills,
  safeUrl,
  skillColor,
  type Certification,
  type Education,
  type Experience,
  type Project,
  type SocialKey,
} from "@/lib/profile/types";
import { useEditor } from "./editor-context";
import { GithubHeatmap } from "./github-heatmap";
import { ProjectArt } from "./project-art";
import { AddButton, EntryModal, Panel, RowActions, SmallButton, TextArea, TextInput, moveItem, type Field } from "./ui";

const EXPERIENCE_FIELDS: Field[] = [
  { key: "role", label: "Role", required: true, maxLength: 100, placeholder: "Associate Software Engineer" },
  { key: "company", label: "Company", maxLength: 100, placeholder: "Company name" },
  { key: "start", label: "Start", half: true, maxLength: 30, placeholder: "04/2024" },
  { key: "end", label: "End", half: true, maxLength: 30, placeholder: "Present" },
  { key: "location", label: "Location", maxLength: 80, placeholder: "Remote" },
  { key: "bullets", label: "What you did", kind: "lines", placeholder: "Built …\nImproved …" },
];
const EDUCATION_FIELDS: Field[] = [
  { key: "degree", label: "Degree / field", required: true, maxLength: 120, placeholder: "B.Tech, Computer Science" },
  { key: "school", label: "School / college", maxLength: 120 },
  { key: "end", label: "Graduation", half: true, maxLength: 30, placeholder: "06/2024" },
  { key: "location", label: "Location", half: true, maxLength: 80 },
];
const PROJECT_FIELDS: Field[] = [
  { key: "name", label: "Project name", required: true, maxLength: 100 },
  { key: "description", label: "Description", kind: "textarea", maxLength: 600 },
  { key: "url", label: "Live / repo link", maxLength: 300, placeholder: "https://…" },
  { key: "stack", label: "Tech stack", kind: "tags", placeholder: "React, Node.js" },
];
const CERT_FIELDS: Field[] = [
  { key: "name", label: "Certification", required: true, maxLength: 120 },
  { key: "issuer", label: "Issuer", half: true, maxLength: 100 },
  { key: "date", label: "Date", half: true, maxLength: 30 },
  { key: "url", label: "Credential link", maxLength: 300, placeholder: "https://…" },
];

type ModalState =
  | { kind: "experience"; index: number | null }
  | { kind: "education"; index: number | null }
  | { kind: "projects"; index: number | null }
  | { kind: "certifications"; index: number | null }
  | null;

const EMPTY = {
  experience: { id: "", role: "", company: "", location: "", start: "", end: "", bullets: [] } as Experience,
  education: { id: "", degree: "", school: "", location: "", end: "" } as Education,
  projects: { id: "", name: "", description: "", url: "", stack: [] } as Project,
  certifications: { id: "", name: "", issuer: "", date: "", url: "" } as Certification,
};

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-[var(--color-c-muted)]">{children}</p>;
}

export function ProfileMain() {
  const { profile, extras, setExtras, save, toast } = useEditor();
  const [modal, setModal] = useState<ModalState>(null);
  const [github, setGithub] = useState("");
  const [checking, setChecking] = useState(false);
  const [socialEdit, setSocialEdit] = useState<SocialKey | null>(null);
  const [socialDraft, setSocialDraft] = useState("");
  const [skillDraft, setSkillDraft] = useState("");
  const [aboutDraft, setAboutDraft] = useState<string | null>(null);

  /* ---------------------------------------------------- list helpers */
  type ListKey = "experience" | "education" | "projects" | "certifications";
  function saveList<K extends ListKey>(key: K, list: typeof profile[K], ok?: string) {
    return save({ [key]: list } as Partial<typeof profile>, ok);
  }
  function upsert<K extends ListKey>(key: K, index: number | null, item: typeof profile[K][number]) {
    const list = [...profile[key]] as typeof profile[K][number][];
    if (index === null) list.push({ ...item, id: crypto.randomUUID() });
    else list[index] = item;
    return saveList(key, list as typeof profile[K], index === null ? "Added" : "Updated");
  }
  function remove<K extends ListKey>(key: K, index: number) {
    const list = profile[key].filter((_, i) => i !== index) as typeof profile[K];
    return saveList(key, list, "Removed");
  }
  function move<K extends ListKey>(key: K, index: number, delta: number) {
    return saveList(key, moveItem(profile[key] as unknown[], index, delta) as typeof profile[K], "Reordered");
  }

  /* --------------------------------------------------------- github */
  async function connectGithub() {
    const u = github.trim().replace(/^@/, "").replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "");
    if (!u) return;
    setChecking(true);
    const res = await fetch(`/api/github/${encodeURIComponent(u)}`);
    const json = await res.json().catch(() => ({}));
    setChecking(false);
    if (!res.ok) return toast("error", json.error ?? "Couldn't find that GitHub user.");
    if (await save({ githubUsername: u }, "GitHub connected")) setGithub("");
  }

  /* -------------------------------------------------------- skills */
  function addSkills() {
    const incoming = skillDraft.split(",").map((s) => s.trim()).filter(Boolean);
    if (!incoming.length) return;
    const have = new Set(profile.skills.map((s) => s.toLowerCase()));
    const next = [...profile.skills, ...incoming.filter((s) => !have.has(s.toLowerCase()))];
    save({ skills: next }, "Skills updated");
    setSkillDraft("");
  }

  async function deleteEndorsement(id: string) {
    const res = await fetch("/api/profile/endorsements", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) return toast("error", "Couldn't remove it.");
    setExtras((e) => ({ ...e, endorsements: e.endorsements.filter((x) => x.id !== id) }));
    toast("ok", "Endorsement removed");
  }

  const latestRole = profile.experience[0];
  const topEducation = profile.education[0];
  const skillGroups = groupSkills(profile.skills);

  return (
    <div className="flex flex-col gap-4">
      {/* GitHub */}
      <Panel
        icon={Github}
        tint="text-[var(--color-c-lime)]"
        title="GitHub Contributions"
        action={
          profile.githubUsername ? (
            <SmallButton tone="danger" onClick={() => save({ githubUsername: "" }, "GitHub disconnected")}>
              Disconnect
            </SmallButton>
          ) : undefined
        }
      >
        {profile.githubUsername ? (
          <>
            <p className="mb-3 flex items-center gap-1.5 text-[11px] text-[var(--color-c-muted)]">
              Connected as
              <a
                href={`https://github.com/${profile.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[var(--color-c-text)] hover:underline"
              >
                @{profile.githubUsername}
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
            <GithubHeatmap username={profile.githubUsername} />
          </>
        ) : (
          <>
            <p className="mb-3 text-[11px] leading-relaxed text-[var(--color-c-muted)]">
              Connect your GitHub account to automatically generate and display your contribution heatmap right on your
              profile.
            </p>
            <form
              className="flex flex-wrap gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                connectGithub();
              }}
            >
              <TextInput
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="Enter github username…"
                aria-label="GitHub username"
                maxLength={60}
                className="min-w-0 flex-1"
              />
              <SmallButton type="submit" tone="primary" disabled={!github.trim() || checking}>
                {checking && <Loader2 className="h-3 w-3 animate-spin" />}
                Connect
              </SmallButton>
            </form>
          </>
        )}
      </Panel>

      {/* Social profiles */}
      <Panel icon={Globe} tint="text-[var(--color-c-lime)]" title="Social Profiles">
        <p className="mb-3 text-[11px] leading-relaxed text-[var(--color-c-muted)]">
          Add your social and professional links to display on your public profile. Click one to add or edit it.
        </p>
        <div className="flex flex-wrap gap-2">
          {SOCIALS.map((s) => {
            const connected = !!profile.socials[s.key];
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => {
                  setSocialEdit(s.key);
                  setSocialDraft(profile.socials[s.key] ?? "");
                }}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all ${
                  socialEdit === s.key
                    ? "border-[var(--color-c-lime)] text-[var(--color-c-text)]"
                    : connected
                      ? "border-[var(--color-c-border-strong)] bg-[var(--color-c-surface-8c)] text-[var(--color-c-text)]"
                      : "border-[var(--color-c-neutral-10)] bg-[var(--color-c-surface-2e)] text-[var(--color-c-dim)] hover:border-[var(--color-c-border-strong)] hover:text-[var(--color-c-text-4)]"
                }`}
              >
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-c-canvas)] text-[9px] font-bold"
                  style={{ color: s.color }}
                >
                  {s.label.charAt(0)}
                </span>
                {s.label}
                {connected && <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-c-lime)]" />}
              </button>
            );
          })}
        </div>
        {socialEdit && (
          <form
            className="cl-fade mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] p-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const next = { ...profile.socials, [socialEdit]: socialDraft.trim() };
              if (!socialDraft.trim()) delete next[socialEdit];
              if (await save({ socials: next }, "Links updated")) setSocialEdit(null);
            }}
          >
            <span className="text-[11px] font-semibold text-[var(--color-c-text-4)]">
              {SOCIALS.find((s) => s.key === socialEdit)?.label}
            </span>
            <TextInput
              value={socialDraft}
              onChange={(e) => setSocialDraft(e.target.value)}
              placeholder="https://…"
              maxLength={300}
              autoFocus
              className="min-w-0 flex-1"
            />
            <SmallButton type="submit" tone="primary">Save</SmallButton>
            {profile.socials[socialEdit] && (
              <SmallButton
                tone="danger"
                onClick={async () => {
                  const next = { ...profile.socials };
                  delete next[socialEdit];
                  if (await save({ socials: next }, "Link removed")) setSocialEdit(null);
                }}
              >
                Remove
              </SmallButton>
            )}
            <SmallButton onClick={() => setSocialEdit(null)}>Cancel</SmallButton>
          </form>
        )}
      </Panel>

      {/* Endorsements */}
      <Panel icon={Star} tint="text-[var(--color-c-amber)]" title="Endorsements">
        {extras.endorsements.length ? (
          <div className="space-y-2.5">
            {extras.endorsements.map((e) => (
              <div key={e.id} className="rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] p-3">
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-bold text-[var(--color-c-text)]">{e.authorName}</p>
                    <p className="truncate text-[10px] text-[var(--color-c-dim)]">
                      {[e.authorHeadline, e.relationship].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteEndorsement(e.id)}
                    aria-label="Remove endorsement"
                    className="rounded p-1 text-[var(--color-c-dim)] hover:text-[var(--color-c-red)]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-[11px] leading-relaxed text-[var(--color-c-muted)]">&ldquo;{e.body}&rdquo;</p>
              </div>
            ))}
          </div>
        ) : (
          <Empty>
            No endorsements yet. {profile.isPublic ? "Share your profile link" : "Make your profile public, share the link"} and
            ask a colleague or manager to write one. They can do it right on your public page.
          </Empty>
        )}
      </Panel>

      {/* Professional profile */}
      <Panel icon={UserRound} tint="text-[var(--color-c-lime)]" title="Professional Profile">
        <div className="mb-4">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-c-dim)]">About</p>
            {aboutDraft === null && (
              <button
                type="button"
                onClick={() => setAboutDraft(profile.summary)}
                className="text-[11px] font-medium text-[var(--color-c-lime)] hover:underline"
              >
                {profile.summary ? "Edit" : "Add"}
              </button>
            )}
          </div>
          {aboutDraft !== null ? (
            <div className="space-y-2">
              <TextArea rows={4} maxLength={1200} value={aboutDraft} onChange={(e) => setAboutDraft(e.target.value)} />
              <div className="flex justify-end gap-2">
                <SmallButton onClick={() => setAboutDraft(null)}>Cancel</SmallButton>
                <SmallButton
                  tone="primary"
                  onClick={async () => {
                    if (await save({ summary: aboutDraft }, "About updated")) setAboutDraft(null);
                  }}
                >
                  Save
                </SmallButton>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-line text-[12px] leading-relaxed text-[var(--color-c-text-4)]">
              {profile.summary || <span className="text-[var(--color-c-dim)]">A short summary about you.</span>}
            </p>
          )}
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-start justify-between gap-3 rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] p-3">
            <div className="min-w-0">
              <p className="mb-1 text-[10px] uppercase tracking-wider text-[var(--color-c-dim)]">Most Recent Role</p>
              <p className="truncate text-[12px] font-bold text-[var(--color-c-text)]">{latestRole?.role || "—"}</p>
              <p className="truncate text-[11px] text-[var(--color-c-muted)]">{latestRole?.company || "Add your experience below"}</p>
            </div>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-c-olive)]">
              <Building2 className="h-4 w-4 text-[var(--color-c-lime)]" />
            </span>
          </div>
          <div className="flex items-start justify-between gap-3 rounded-xl border border-[var(--color-c-blue-raised)] bg-[var(--color-c-canvas)] p-3">
            <div className="min-w-0">
              <p className="mb-1 text-[10px] uppercase tracking-wider text-[var(--color-c-dim)]">Highest Education</p>
              <p className="truncate text-[12px] font-bold text-[var(--color-c-text)]">{topEducation?.degree || "—"}</p>
              <p className="truncate text-[11px] text-[var(--color-c-muted)]">{topEducation?.school || "Add your education below"}</p>
            </div>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-c-blue-border)]">
              <GraduationCap className="h-4 w-4 text-[var(--color-c-blue)]" />
            </span>
          </div>
        </div>

        {/* Skills */}
        <div className="rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] p-4">
          <p className="mb-3 flex items-center gap-1.5 font-mono text-[11px] text-[var(--color-c-muted)]">
            <Code2 className="h-3.5 w-3.5" />
            Skills <span className="text-[var(--color-c-dim)]">{profile.skills.length} listed</span>
          </p>
          {skillGroups.map((g) => (
            <div key={g.label} className="mb-3">
              <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--color-c-dim)]">{g.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {g.items.map((name) => (
                  <span
                    key={name}
                    className="group inline-flex items-center gap-1.5 rounded-full border border-[var(--color-c-neutral-6)] bg-[var(--color-c-surface-5b)] py-1 pl-2 pr-1.5 text-[11px] text-[var(--color-c-text-4)]"
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: skillColor(name) }} />
                    {name}
                    <button
                      type="button"
                      onClick={() => save({ skills: profile.skills.filter((s) => s !== name) }, "Skill removed")}
                      aria-label={`Remove ${name}`}
                      className="rounded-full p-0.5 text-[var(--color-c-dim)] hover:bg-white/10 hover:text-[var(--color-c-text)]"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              addSkills();
            }}
          >
            <TextInput
              value={skillDraft}
              onChange={(e) => setSkillDraft(e.target.value)}
              placeholder="Add skills, comma separated"
              maxLength={200}
              className="min-w-0 flex-1"
            />
            <SmallButton type="submit" disabled={!skillDraft.trim()}>
              <Plus className="h-3 w-3" />
              Add
            </SmallButton>
          </form>
        </div>
      </Panel>

      {/* Certifications */}
      <Panel
        icon={BadgeCheck}
        tint="text-[var(--color-c-amber)]"
        title="Certifications"
        action={<AddButton onClick={() => setModal({ kind: "certifications", index: null })} />}
      >
        {profile.certifications.length ? (
          <div className="space-y-2">
            {profile.certifications.map((c, i) => (
              <div key={c.id} className="flex items-start justify-between gap-2 rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] p-3">
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-bold text-[var(--color-c-text)]">{c.name}</p>
                  <p className="truncate text-[11px] text-[var(--color-c-muted)]">{[c.issuer, c.date].filter(Boolean).join(" · ")}</p>
                  {safeUrl(c.url) && (
                    <a href={safeUrl(c.url)!} target="_blank" rel="noopener noreferrer" className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-[var(--color-c-lime)] hover:underline">
                      View credential <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
                <RowActions
                  onUp={i > 0 ? () => move("certifications", i, -1) : undefined}
                  onDown={i < profile.certifications.length - 1 ? () => move("certifications", i, 1) : undefined}
                  onEdit={() => setModal({ kind: "certifications", index: i })}
                  onDelete={() => remove("certifications", i)}
                />
              </div>
            ))}
          </div>
        ) : (
          <Empty>No certifications added yet.</Empty>
        )}
      </Panel>

      {/* Experience */}
      <Panel
        icon={Building2}
        tint="text-[var(--color-c-lime)]"
        title="Experience"
        action={<AddButton onClick={() => setModal({ kind: "experience", index: null })} />}
      >
        {profile.experience.length ? (
          <div className="space-y-3">
            {profile.experience.map((e, i) => (
              <div key={e.id} className="rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] p-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex min-w-0 gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--color-c-olive)] text-[11px] font-bold text-[var(--color-c-lime)]">
                      {(e.company || e.role).charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-bold text-[var(--color-c-text)]">{e.role}</p>
                      <p className="truncate text-[11px] text-[var(--color-c-muted)]">
                        {[e.company, e.location].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {(e.start || e.end) && (
                      <span className="hidden rounded border border-[var(--color-c-neutral-6)] bg-[var(--color-c-surface-5b)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--color-c-muted)] sm:inline">
                        {[e.start, e.end].filter(Boolean).join(" – ")}
                      </span>
                    )}
                    <RowActions
                      onUp={i > 0 ? () => move("experience", i, -1) : undefined}
                      onDown={i < profile.experience.length - 1 ? () => move("experience", i, 1) : undefined}
                      onEdit={() => setModal({ kind: "experience", index: i })}
                      onDelete={() => remove("experience", i)}
                    />
                  </div>
                </div>
                {e.bullets.length > 0 && (
                  <ul className="space-y-1 pl-9">
                    {e.bullets.map((b, bi) => (
                      <li key={bi} className="flex gap-1.5 text-[11px] leading-relaxed text-[var(--color-c-muted)]">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-c-lime-deep)]" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Empty>No experience added yet.</Empty>
        )}
      </Panel>

      {/* Education */}
      <Panel
        icon={GraduationCap}
        tint="text-[var(--color-c-blue)]"
        title="Education"
        action={<AddButton onClick={() => setModal({ kind: "education", index: null })} />}
      >
        {profile.education.length ? (
          <div className="space-y-2">
            {profile.education.map((ed, i) => (
              <div key={ed.id} className="flex items-start justify-between gap-2 rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] p-3">
                <div className="flex min-w-0 gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-c-olive)]">
                    <GraduationCap className="h-4 w-4 text-[var(--color-c-lime)]" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-bold text-[var(--color-c-text)]">{ed.school || ed.degree}</p>
                    <p className="truncate text-[11px] text-[var(--color-c-muted)]">{ed.school ? ed.degree : ""}</p>
                    <p className="truncate text-[10px] text-[var(--color-c-dim)]">{[ed.end, ed.location].filter(Boolean).join(" · ")}</p>
                  </div>
                </div>
                <RowActions
                  onUp={i > 0 ? () => move("education", i, -1) : undefined}
                  onDown={i < profile.education.length - 1 ? () => move("education", i, 1) : undefined}
                  onEdit={() => setModal({ kind: "education", index: i })}
                  onDelete={() => remove("education", i)}
                />
              </div>
            ))}
          </div>
        ) : (
          <Empty>No education added yet.</Empty>
        )}
      </Panel>

      {/* Projects */}
      <Panel
        icon={FolderGit2}
        tint="text-[var(--color-c-lime)]"
        title="Projects"
        action={<AddButton onClick={() => setModal({ kind: "projects", index: null })} />}
      >
        {profile.projects.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {profile.projects.map((p, i) => (
              <div key={p.id} className="group flex flex-col overflow-hidden rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-canvas)]">
                <ProjectArt project={p} className="h-24" />
                <div className="flex flex-1 flex-col p-3">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <p className="truncate text-[12px] font-bold text-[var(--color-c-text)]">{p.name}</p>
                    <RowActions
                      onUp={i > 0 ? () => move("projects", i, -1) : undefined}
                      onDown={i < profile.projects.length - 1 ? () => move("projects", i, 1) : undefined}
                      onEdit={() => setModal({ kind: "projects", index: i })}
                      onDelete={() => remove("projects", i)}
                    />
                  </div>
                  {p.description && <p className="text-[11px] leading-relaxed text-[var(--color-c-muted)]">{p.description}</p>}
                  {p.stack.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {p.stack.map((s) => (
                        <span key={s} className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] text-[var(--color-c-text-4)]">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {safeUrl(p.url) && (
                    <a
                      href={safeUrl(p.url)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--color-c-lime)] hover:underline"
                    >
                      Open project <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty>No projects added yet.</Empty>
        )}
      </Panel>

      {modal && (
        <EntryModal
          title={`${modal.index === null ? "Add" : "Edit"} ${
            { experience: "experience", education: "education", projects: "project", certifications: "certification" }[modal.kind]
          }`}
          fields={
            { experience: EXPERIENCE_FIELDS, education: EDUCATION_FIELDS, projects: PROJECT_FIELDS, certifications: CERT_FIELDS }[modal.kind]
          }
          initial={
            (modal.index === null ? EMPTY[modal.kind] : profile[modal.kind][modal.index]) as unknown as Record<string, unknown>
          }
          onClose={() => setModal(null)}
          onSave={(value) => upsert(modal.kind, modal.index, value as never)}
        />
      )}
    </div>
  );
}
