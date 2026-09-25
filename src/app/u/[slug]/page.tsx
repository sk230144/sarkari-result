import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import {
  MapPin,
  ExternalLink,
  Building2,
  GraduationCap,
  FolderGit2,
  BadgeCheck,
  Code2,
  Globe,
  Star,
  Lock,
  Github,
} from "lucide-react";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import { PROFILE_COLUMNS, loadEndorsements, rowToPublic, type ProfileRow } from "@/lib/profile/server";
import { SOCIALS, bannerBackground, groupSkills, safeUrl, skillColor, type PublicProfile, type SectionKey } from "@/lib/profile/types";
import { GithubHeatmap } from "@/components/profile/github-heatmap";
import { ProjectArt } from "@/components/profile/project-art";
import { PublicActions, ViewBeacon } from "@/components/profile/public-actions";
import { Logo } from "@/components/ui/logo";

export const dynamic = "force-dynamic";

const load = cache(async (slug: string) => {
  if (!/^[a-z0-9-]{3,30}$/.test(slug)) return null;
  const db = serviceDb();
  const { data: row } = await db.from("profiles").select(PROFILE_COLUMNS).eq("slug", slug).maybeSingle<ProfileRow>();
  if (!row) return null;
  const user = await getSessionUser();
  const isOwner = user?.id === row.id;
  // Private profiles are invisible to everyone but their owner.
  if (!row.is_public && !isOwner) return null;
  return { profile: rowToPublic(row, await loadEndorsements(db, row.id)), isPublic: Boolean(row.is_public), isOwner };
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) return { title: "Profile not found — Job Alert 24", robots: { index: false } };
  const p = data.profile;
  const title = `${p.fullName}${p.headline ? ` — ${p.headline}` : ""} | Job Alert 24`;
  const description = (p.summary || `${p.fullName}'s developer profile: experience, projects and skills.`).slice(0, 160);
  return {
    title,
    description,
    robots: { index: data.isPublic, follow: data.isPublic },
    openGraph: { title, description, type: "profile", images: p.avatarUrl ? [p.avatarUrl] : undefined },
  };
}

/* ------------------------------------------------------------ theme */

function themeOf(light: boolean) {
  return light
    ? {
        page: "bg-[#f4f6f1] text-slate-800",
        card: "border-slate-200 bg-white",
        inner: "border-slate-200 bg-slate-50",
        strong: "text-slate-900",
        body: "text-slate-600",
        dim: "text-slate-500",
        chip: "border-slate-200 bg-slate-100 text-slate-700",
        accent: "text-lime-700",
        ring: "border-white",
      }
    : {
        page: "bg-[var(--color-c-dash)] text-[var(--color-c-text-2)]",
        card: "border-[var(--color-c-border)] bg-[var(--color-c-surface-1)]",
        inner: "border-[var(--color-c-border)] bg-[var(--color-c-canvas)]",
        strong: "text-[var(--color-c-text)]",
        body: "text-[var(--color-c-muted)]",
        dim: "text-[var(--color-c-dim)]",
        chip: "border-[var(--color-c-neutral-6)] bg-[var(--color-c-surface-5b)] text-[var(--color-c-text-4)]",
        accent: "text-[var(--color-c-lime)]",
        ring: "border-[var(--color-c-surface-1)]",
      };
}
type T = ReturnType<typeof themeOf>;

function Section({
  t,
  icon: Icon,
  title,
  children,
  className = "",
}: {
  t: T;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`min-w-0 break-words rounded-2xl border p-4 sm:p-6 ${t.card} ${className}`}>
      <h2 className={`mb-3 flex items-center gap-2 text-[15px] font-bold ${t.strong}`}>
        <Icon className={`h-4 w-4 ${t.accent}`} />
        {title}
      </h2>
      {children}
    </section>
  );
}

function sectionContent(key: SectionKey, p: PublicProfile, t: T, light: boolean): React.ReactNode {
  switch (key) {
    case "skills":
      if (!p.skills.length) return null;
      return (
        <Section t={t} icon={Code2} title="Skills & Technologies" key={key}>
          {groupSkills(p.skills).map((g) => (
            <div key={g.label} className="mb-3 last:mb-0">
              <p className={`mb-1.5 text-[9px] font-semibold uppercase tracking-wider ${t.dim}`}>{g.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {g.items.map((s) => (
                  <span key={s} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${t.chip}`}>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: skillColor(s) }} />
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </Section>
      );
    case "certifications":
      if (!p.certifications.length) return null;
      return (
        <Section t={t} icon={BadgeCheck} title="Certifications" key={key}>
          <div className="space-y-2">
            {p.certifications.map((c) => {
              const href = safeUrl(c.url);
              return (
                <div key={c.id} className={`rounded-xl border p-3 ${t.inner}`}>
                  <p className={`text-[12px] font-bold ${t.strong}`}>{c.name}</p>
                  <p className={`text-[11px] ${t.body}`}>{[c.issuer, c.date].filter(Boolean).join(" · ")}</p>
                  {href && (
                    <a href={href} target="_blank" rel="noopener noreferrer nofollow" className={`mt-1 inline-flex items-center gap-1 text-[10px] font-semibold ${t.accent}`}>
                      View credential <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      );
    case "experience":
      if (!p.experience.length && !p.education.length) return null;
      // Wide screens: experience takes two thirds, education sits beside it.
      const both = p.experience.length > 0 && p.education.length > 0;
      return (
        <div className={`grid grid-cols-1 gap-4 ${both ? "lg:grid-cols-3" : ""}`} key={key}>
          {p.experience.length > 0 && (
            <Section t={t} icon={Building2} title="Experience" className={both ? "lg:col-span-2" : ""}>
              <ol className="relative space-y-5 border-l pl-5" style={{ borderColor: light ? "#e2e8f0" : "var(--color-c-border)" }}>
                {p.experience.map((e) => (
                  <li key={e.id} className="relative">
                    <span className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full bg-[#a3e635] ring-4" style={{ ["--tw-ring-color" as string]: light ? "#ffffff" : "var(--color-c-surface-1)" }} />
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <p className={`text-[13px] font-bold ${t.strong}`}>{e.role}</p>
                      <p className={`font-mono text-[10px] ${t.dim}`}>{[e.start, e.end].filter(Boolean).join(" – ")}</p>
                    </div>
                    <p className={`text-[11px] ${t.body}`}>{[e.company, e.location].filter(Boolean).join(" · ")}</p>
                    {e.bullets.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {e.bullets.map((b, i) => (
                          <li key={i} className={`flex gap-1.5 text-[12px] leading-relaxed ${t.body}`}>
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#84cc16]" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            </Section>
          )}
          {p.education.length > 0 && (
            <Section t={t} icon={GraduationCap} title="Education" className="self-start">
              <div className="space-y-2">
                {p.education.map((ed) => (
                  <div key={ed.id} className={`rounded-xl border p-3 ${t.inner}`}>
                    <p className={`text-[12px] font-bold ${t.strong}`}>{ed.school || ed.degree}</p>
                    {ed.school && <p className={`text-[11px] ${t.body}`}>{ed.degree}</p>}
                    <p className={`text-[10px] ${t.dim}`}>{[ed.end, ed.location].filter(Boolean).join(" · ")}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      );
    case "socials": {
      const links = SOCIALS.map((s) => ({ ...s, href: safeUrl(p.socials[s.key]) })).filter((s) => s.href);
      if (!links.length && !p.githubUsername) return null;
      return (
        <Section t={t} icon={Globe} title="Social Profiles" key={key}>
          {links.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {links.map((s) => (
                <a
                  key={s.key}
                  href={s.href!}
                  target="_blank"
                  rel="noopener noreferrer nofollow me"
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-opacity hover:opacity-80 ${t.chip}`}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/80 text-[9px] font-bold" style={{ color: s.color }}>
                    {s.label.charAt(0)}
                  </span>
                  {s.label}
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              ))}
            </div>
          )}
          {p.githubUsername && (
            <div className={`${links.length ? "mt-4 border-t pt-4" : ""}`} style={{ borderColor: light ? "#e2e8f0" : "var(--color-c-border)" }}>
              <p className={`mb-2 flex items-center gap-1.5 text-[12px] font-semibold ${t.strong}`}>
                <Github className="h-3.5 w-3.5" />
                GitHub activity ·{" "}
                <a href={`https://github.com/${p.githubUsername}`} target="_blank" rel="noopener noreferrer" className={t.accent}>
                  @{p.githubUsername}
                </a>
              </p>
              <GithubHeatmap username={p.githubUsername} light={light} />
            </div>
          )}
        </Section>
      );
    }
    case "projects":
      if (!p.projects.length) return null;
      return (
        <Section t={t} icon={FolderGit2} title="Projects" key={key}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {p.projects.map((pr) => {
              const href = safeUrl(pr.url);
              return (
                <div
                  key={pr.id}
                  className={`group flex flex-col overflow-hidden rounded-xl border transition-transform duration-300 hover:-translate-y-1 ${t.inner}`}
                >
                  <ProjectArt project={pr} className="h-28" />
                  <div className="flex flex-1 flex-col p-3">
                    <p className={`text-[12px] font-bold ${t.strong}`}>{pr.name}</p>
                    {pr.description && <p className={`mt-1 text-[11px] leading-relaxed ${t.body}`}>{pr.description}</p>}
                    {pr.stack.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {pr.stack.map((s) => (
                          <span key={s} className={`rounded border px-1.5 py-0.5 text-[9px] ${t.chip}`}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    {href && (
                      <a href={href} target="_blank" rel="noopener noreferrer nofollow" className={`mt-auto inline-flex items-center gap-1 pt-2 text-[10px] font-semibold ${t.accent}`}>
                        Open project <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      );
  }
}

export default async function PublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();
  const { profile: p, isPublic, isOwner } = data;
  const light = p.theme === "daylight";
  const t = themeOf(light);
  const sections = p.layout.order.filter((k) => !p.layout.hidden.includes(k));

  return (
    <main
      className={`min-h-screen w-full overflow-x-hidden ${t.page}`}
      // Daylight: remap the site's colour variables inside this page, so shared
      // components (logo, heatmap, modals) read correctly on the light ground.
      style={
        light
          ? ({
              "--color-c-text": "#0f172a",
              "--color-c-text-4": "#334155",
              "--color-c-muted": "#475569",
              "--color-c-dim": "#64748b",
              "--color-c-lime": "#4d7c0f",
              colorScheme: "light",
            } as React.CSSProperties)
          : undefined
      }
    >
      {isPublic && !isOwner && <ViewBeacon slug={p.slug} />}
      <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
        {!isPublic && (
          <p className="mb-4 flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-[12px] text-amber-300">
            <Lock className="h-3.5 w-3.5" />
            Only you can see this page. Make your profile public in the editor to share it.
          </p>
        )}

        {/* Identity */}
        <div className={`overflow-hidden rounded-2xl border ${t.card}`}>
          <div className="h-28 sm:h-44 lg:h-60" style={bannerBackground(p)} />
          <div className="relative px-4 pb-5 sm:px-6 lg:px-8">
            <div
              className={`absolute -top-10 left-4 h-20 w-20 overflow-hidden rounded-2xl border-4 bg-[#1f3a14] sm:-top-12 sm:left-6 sm:h-24 sm:w-24 lg:-top-14 lg:left-8 lg:h-28 lg:w-28 ${t.ring}`}
            >
              {p.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.avatarUrl} alt={p.fullName} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[30px] font-bold text-[#a3e635]">
                  {p.fullName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-4 pt-12 sm:flex-row sm:items-start sm:justify-between sm:pt-14 lg:pt-16">
              <div className="min-w-0">
                <h1 className={`break-words text-[22px] font-extrabold leading-tight tracking-tight sm:text-[28px] lg:text-[32px] ${t.strong}`}>
                  {p.fullName}
                </h1>
                {p.headline && <p className={`mt-1 break-words text-[14px] font-semibold sm:text-[15px] ${t.accent}`}>{p.headline}</p>}
                <div className={`mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] ${t.body}`}>
                  {p.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {p.location}
                    </span>
                  )}
                  {p.openToWork && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#a3e635]/50 bg-[#a3e635]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#65a30d]">
                      <span className="blink h-1.5 w-1.5 rounded-full bg-[#84cc16]" />
                      Open to Work
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0">
                <PublicActions slug={p.slug} name={p.fullName.split(" ")[0]} ownerId={p.id} light={light} />
              </div>
            </div>
            {p.summary && (
              <p className={`mt-4 max-w-4xl whitespace-pre-line break-words text-[13px] leading-relaxed sm:text-[14px] ${t.body}`}>
                {p.summary}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {sections.map((k) => sectionContent(k, p, t, light))}

          <Section t={t} icon={Star} title="Endorsements">
            {p.endorsements.length ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {p.endorsements.map((e) => (
                  <figure key={e.id} className={`rounded-xl border p-3 ${t.inner}`}>
                    <blockquote className={`text-[12px] leading-relaxed ${t.body}`}>&ldquo;{e.body}&rdquo;</blockquote>
                    <figcaption className="mt-2">
                      <p className={`text-[11px] font-bold ${t.strong}`}>{e.authorName}</p>
                      <p className={`text-[10px] ${t.dim}`}>{[e.authorHeadline, e.relationship].filter(Boolean).join(" · ")}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <p className={`text-[12px] ${t.body}`}>No endorsements yet. Worked with {p.fullName.split(" ")[0]}? Be the first to endorse.</p>
            )}
          </Section>
        </div>

        <footer className={`mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-[11px] ${t.dim}`} style={{ borderColor: light ? "#e2e8f0" : "var(--color-c-border)" }}>
          <Link href="/" className="inline-flex items-center gap-2">
            <Logo markClassName="h-6 w-6" size="sm" />
          </Link>
          <Link href="/signup" className={`font-semibold ${t.accent} hover:underline`}>
            Create your own developer profile →
          </Link>
        </footer>
      </div>
    </main>
  );
}
