"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ImagePlus,
  Lock,
  Eye,
  Globe,
  Check,
  Copy,
  Share2,
  ExternalLink,
  Camera,
  MapPin,
  Mail,
  Loader2,
  Link2,
  Upload,
} from "lucide-react";
import { BANNERS, bannerBackground } from "@/lib/profile/types";
import { useEditor } from "./editor-context";
import { InlineText, SmallButton, TextInput, Toggle } from "./ui";

export function ProfileHeader() {
  const { profile, extras, save, send, toast } = useEditor();
  const [bannerOpen, setBannerOpen] = useState(false);
  const [slugOpen, setSlugOpen] = useState(false);
  const [slugDraft, setSlugDraft] = useState(profile.slug);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const [bannerBusy, setBannerBusy] = useState(false);

  async function uploadBanner(file: File | undefined) {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) return toast("error", "Banner image must be under 4 MB.");
    setBannerOpen(false);
    setBannerBusy(true);
    const fd = new FormData();
    fd.append("banner", file);
    await send("/api/profile/banner", { method: "POST", body: fd }, "Banner updated");
    setBannerBusy(false);
    if (bannerRef.current) bannerRef.current.value = "";
  }

  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const publicUrl = `${origin}/u/${profile.slug}`;
  const shortUrl = publicUrl.replace(/^https?:\/\//, "");

  const requirements = [
    { label: "Profile photo", met: !!profile.avatarUrl },
    { label: "Headline", met: !!profile.headline },
    { label: "Resume uploaded", met: !!profile.resume.path },
    { label: "Work experience", met: profile.experience.length > 0 },
    { label: "Projects", met: profile.projects.length > 0 },
    { label: "3+ skills", met: profile.skills.length >= 3 },
    { label: "Social links", met: Object.keys(profile.socials).length > 0 },
  ];
  const met = requirements.filter((r) => r.met).length;
  const strength = Math.round((met / requirements.length) * 100);

  async function uploadAvatar(file: File | undefined) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast("error", "Photo must be under 2 MB.");
    setUploading(true);
    const fd = new FormData();
    fd.append("avatar", file);
    await send("/api/profile/avatar", { method: "POST", body: fd }, "Photo updated");
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast("error", "Couldn't copy. Select the link and copy it manually.");
    }
  }

  async function share() {
    if (!profile.isPublic) return toast("error", "Make your profile public first, so the link works for others.");
    if (navigator.share) {
      try {
        await navigator.share({ title: `${profile.fullName} — Developer profile`, url: publicUrl });
        return;
      } catch {
        /* dismissed; fall through to copy */
      }
    }
    copyLink();
  }

  const maxDaily = Math.max(1, ...extras.views.daily.map((d) => d.count));

  return (
    <>
      {/* Banner + identity */}
      <div className="overflow-hidden rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)]">
        <div className="relative h-36 sm:h-44" style={bannerBackground(profile)}>
          {!profile.bannerUrl && (
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
                backgroundSize: "34px 34px",
              }}
            />
          )}
          {bannerBusy && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
          <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={() => setBannerOpen((v) => !v)}
              aria-expanded={bannerOpen}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-c-neutral-6)] bg-[var(--color-c-canvas)]/80 px-2.5 py-1.5 text-[11px] font-medium text-[var(--color-c-text-4)] backdrop-blur-sm transition-colors hover:border-[var(--color-c-border-strong)] hover:text-[var(--color-c-text)]"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              Change banner
            </button>
            {bannerOpen && (
              <div className="cl-fade w-56 rounded-xl border border-white/10 bg-black/75 p-2.5 backdrop-blur">
                <button
                  type="button"
                  onClick={() => bannerRef.current?.click()}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--color-c-lime)]/50 px-3 py-2 text-[11px] font-semibold text-[var(--color-c-lime)] hover:bg-[var(--color-c-lime)]/10"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload image
                </button>
                <p className="mt-1 text-center text-[9px] text-white/50">JPG, PNG or WebP · max 4 MB · best at 1500×400</p>
                <p className="mb-1.5 mt-2.5 text-[9px] font-semibold uppercase tracking-wider text-white/50">Or pick a colour</p>
                <div className="flex gap-1.5">
                  {Object.entries(BANNERS).map(([key, bg]) => (
                    <button
                      key={key}
                      type="button"
                      aria-label={`${key} banner`}
                      onClick={() => {
                        save({ banner: key, bannerUrl: null }, "Banner updated");
                        setBannerOpen(false);
                      }}
                      className={`h-7 flex-1 rounded-md border-2 ${
                        !profile.bannerUrl && profile.banner === key ? "border-[var(--color-c-lime)]" : "border-transparent"
                      }`}
                      style={{ background: bg }}
                    />
                  ))}
                </div>
                {profile.bannerUrl && (
                  <button
                    type="button"
                    onClick={async () => {
                      setBannerOpen(false);
                      setBannerBusy(true);
                      await send("/api/profile/banner", { method: "DELETE" }, "Banner image removed");
                      setBannerBusy(false);
                    }}
                    className="mt-2.5 w-full rounded-lg px-3 py-1.5 text-[11px] text-red-300 hover:bg-red-500/10"
                  >
                    Remove image
                  </button>
                )}
              </div>
            )}
          </div>
          <input
            ref={bannerRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => uploadBanner(e.target.files?.[0])}
          />
        </div>

        <div className="relative px-5 pb-5">
          {/* Avatar */}
          <div className="absolute -top-10 left-5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Change profile photo"
              className="group relative block h-20 w-20 overflow-hidden rounded-xl border-2 border-[var(--color-c-surface-1)] bg-[var(--color-c-olive)]"
            >
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[24px] font-bold text-[var(--color-c-lime)]">
                  {(profile.fullName || profile.email).charAt(0).toUpperCase()}
                </span>
              )}
              <span
                className={`absolute inset-0 flex items-center justify-center bg-black/55 transition-opacity ${
                  uploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
              >
                {uploading ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <Camera className="h-5 w-5 text-white" />}
              </span>
            </button>
            {/* Always-visible camera badge, so it's obvious the photo can be changed. */}
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--color-c-surface-1)] bg-[var(--color-c-lime)] text-black"
            >
              <Camera className="h-3.5 w-3.5" />
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => uploadAvatar(e.target.files?.[0])}
            />
          </div>
          <div className="absolute left-28 top-2 flex flex-wrap items-center gap-2">
            <SmallButton onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
              {profile.avatarUrl ? "Change photo" : "Upload photo"}
            </SmallButton>
            {profile.avatarUrl && (
              <button
                type="button"
                onClick={() => send("/api/profile/avatar", { method: "DELETE" }, "Photo removed")}
                className="text-[10px] text-[var(--color-c-dim)] hover:text-[var(--color-c-red)]"
              >
                Remove
              </button>
            )}
            <span className="hidden text-[9px] text-[var(--color-c-dim)] sm:inline">JPG, PNG or WebP · max 2 MB</span>
          </div>

          <div className="pt-12">
            <h1 className="text-[22px] font-bold tracking-tight text-[var(--color-c-text)]">
              <InlineText
                value={profile.fullName}
                placeholder="Add your name"
                maxLength={80}
                onSave={(v) => (v ? save({ fullName: v }) : (toast("error", "Name cannot be empty."), false))}
              />
            </h1>
            <p className="mt-0.5 text-[12px] font-semibold text-[var(--color-c-lime)]">
              <InlineText
                value={profile.headline}
                placeholder="Add a headline to stand out"
                maxLength={120}
                onSave={(v) => save({ headline: v })}
              />
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[var(--color-c-muted)]">
              <Mail className="h-3 w-3" />
              {profile.email}
              <span className="text-[var(--color-c-dim)]">· private, never shown publicly</span>
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-[11px] text-[var(--color-c-muted)]">
              <MapPin className="h-3 w-3" />
              <InlineText
                value={profile.location}
                placeholder="Add your location"
                maxLength={80}
                onSave={(v) => save({ location: v })}
              />
            </p>

            {/* Status chips */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => save({ openToWork: !profile.openToWork }, profile.openToWork ? "Removed Open to Work" : "Marked Open to Work")}
                aria-pressed={profile.openToWork}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  profile.openToWork
                    ? "border-[var(--color-c-lime)]/50 bg-[var(--color-c-lime)]/10 text-[var(--color-c-lime)]"
                    : "border-[var(--color-c-neutral-6)] bg-[var(--color-c-surface-5b)] text-[var(--color-c-text-4)] hover:text-[var(--color-c-text)]"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${profile.openToWork ? "blink bg-[var(--color-c-lime)]" : "bg-[var(--color-c-dim)]"}`} />
                {profile.openToWork ? "Open to Work" : "Mark as Open to Work"}
              </button>
            </div>

            {/* Visibility toggle */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${profile.isPublic ? "text-[var(--color-c-muted)]" : "text-[var(--color-c-text)]"}`}>
                <Lock className="h-3 w-3" />
                Private
              </span>
              <Toggle
                on={profile.isPublic}
                label="Toggle profile visibility"
                onChange={(v) => save({ isPublic: v }, v ? "Your profile is now public" : "Your profile is now private")}
              />
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${profile.isPublic ? "text-[var(--color-c-text)]" : "text-[var(--color-c-muted)]"}`}>
                <Globe className="h-3 w-3" />
                Public
              </span>
              <span className="text-[11px] text-[var(--color-c-dim)]">
                {profile.isPublic ? "Anyone with the link can see your profile" : "Only you can see your profile"}
              </span>
            </div>

            {/* Public link */}
            <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-[var(--color-c-border)] pt-4">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-c-text)]">
                  <Link2 className="h-3 w-3" />
                  Public Profile Link
                </p>
                {slugOpen ? (
                  <form
                    className="mt-1.5 flex flex-wrap items-center gap-1.5"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (await save({ slug: slugDraft.trim().toLowerCase() }, "Profile URL updated")) setSlugOpen(false);
                    }}
                  >
                    <span className="font-mono text-[11px] text-[var(--color-c-dim)]">{origin.replace(/^https?:\/\//, "")}/u/</span>
                    <TextInput
                      value={slugDraft}
                      onChange={(e) => setSlugDraft(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      maxLength={30}
                      className="!h-8 w-44 font-mono"
                      aria-label="Custom profile URL"
                    />
                    <SmallButton type="submit" tone="primary">Save</SmallButton>
                    <SmallButton onClick={() => setSlugOpen(false)}>Cancel</SmallButton>
                  </form>
                ) : (
                  <p className="mt-0.5 truncate font-mono text-[11px] text-[var(--color-c-muted)]">{shortUrl}</p>
                )}
              </div>
              {!slugOpen && (
                <div className="flex flex-wrap gap-2">
                  <SmallButton onClick={copyLink}>
                    {copied ? <Check className="h-3 w-3 text-[var(--color-c-lime)]" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Copied" : "Copy"}
                  </SmallButton>
                  <SmallButton onClick={share}>
                    <Share2 className="h-3 w-3" />
                    Share Profile
                  </SmallButton>
                  <Link
                    href={`/u/${profile.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-c-neutral-6)] bg-[var(--color-c-surface-5b)] px-3 py-1.5 text-[11px] font-medium text-[var(--color-c-text-4)] transition-colors hover:border-[var(--color-c-border-strong)] hover:text-[var(--color-c-text)]"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View
                  </Link>
                  <SmallButton
                    onClick={() => {
                      setSlugDraft(profile.slug);
                      setSlugOpen(true);
                    }}
                  >
                    Claim Custom URL
                  </SmallButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Strength + views */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] p-4 lg:col-span-2">
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-[0.12]"
            style={{ background: "radial-gradient(circle at 80% 30%, #a3e635 0%, transparent 60%)" }}
          />
          <div className="relative">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[12px] font-bold text-[var(--color-c-text)]">Profile Strength</span>
              <span className="text-[19px] font-bold text-[var(--color-c-text)]">{strength}%</span>
            </div>
            <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-c-track)]">
              <div className="h-full rounded-full bg-[var(--color-c-lime)] transition-all duration-500" style={{ width: `${strength}%` }} />
            </div>
            <p className="mb-3 text-[10px] text-[var(--color-c-muted)]">
              {met}/{requirements.length} requirements met
            </p>
            <div className="flex flex-wrap gap-1.5">
              {requirements.map((r) => (
                <span
                  key={r.label}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                    r.met
                      ? "border-[var(--color-c-olive)] bg-[var(--color-c-chip-easy)] text-[var(--color-c-lime)]"
                      : "border-[var(--color-c-amber-border)] bg-[var(--color-c-amber-dim-3)] text-[var(--color-c-amber)]"
                  }`}
                >
                  {r.met ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : <span className="text-[9px]">✕</span>}
                  {r.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] p-4">
          <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold text-[var(--color-c-text)]">
            <Eye className="h-3.5 w-3.5 text-[var(--color-c-muted)]" />
            Profile Views
          </p>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-[22px] font-bold leading-none text-[var(--color-c-text)]">{extras.views.last7}</p>
              <p className="mt-1 text-[10px] text-[var(--color-c-dim)]">last 7 days</p>
            </div>
            <div>
              <p className="text-[15px] font-bold leading-none text-[var(--color-c-text-4)]">{extras.views.last30}</p>
              <p className="mt-1 text-[10px] text-[var(--color-c-dim)]">30 days</p>
            </div>
            <div>
              <p className="text-[15px] font-bold leading-none text-[var(--color-c-text-4)]">{extras.views.total}</p>
              <p className="mt-1 text-[10px] text-[var(--color-c-dim)]">all time</p>
            </div>
          </div>
          <div className="mt-3 flex h-10 items-end gap-[2px]" aria-label="Views per day, last 30 days">
            {extras.views.daily.map((d) => (
              <span
                key={d.day}
                title={`${d.day}: ${d.count} view${d.count === 1 ? "" : "s"}`}
                className="flex-1 rounded-sm bg-[var(--color-c-lime)]"
                style={{ height: `${Math.max(6, (d.count / maxDaily) * 100)}%`, opacity: d.count ? 0.9 : 0.15 }}
              />
            ))}
          </div>
          {!profile.isPublic && (
            <p className="mt-2 text-[10px] text-[var(--color-c-dim)]">Make your profile public to start getting views.</p>
          )}
        </div>
      </div>
    </>
  );
}
