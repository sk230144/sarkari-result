"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import {
  Check,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Link2,
  Loader2,
  LogIn,
  Save,
  Search,
  Send,
  Tag,
  Type,
  UploadCloud,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { isAdminEmail } from "@/lib/admin-emails";
import {
  BLOG_TAGS,
  SLUG_MAX,
  SLUG_RE,
  TAGS_MAX,
  TITLE_MAX,
  WORDS_MAX,
  WORDS_MIN,
  countWords,
  slugify,
  tagClass,
  type BlogPost,
} from "@/lib/blog/types";
import { Toolbar } from "./toolbar";

type SlugState = "idle" | "checking" | "free" | "taken" | "invalid";
type Toast = { kind: "ok" | "error"; text: string } | null;

const LOCAL_KEY = (id?: string) => `blog-draft-${id ?? "new"}`;

async function uploadImage(file: File): Promise<{ url?: string; error?: string }> {
  if (file.size > 4 * 1024 * 1024) return { error: "Images must be under 4 MB." };
  const fd = new FormData();
  fd.append("file", file);
  try {
    const r = await fetch("/api/blog/upload", { method: "POST", body: fd });
    const j = await r.json();
    return r.ok ? { url: j.url } : { error: j.error ?? "Upload failed." };
  } catch {
    return { error: "Upload failed. Check your connection." };
  }
}

export function BlogEditor({ id }: { id?: string }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loaded, setLoaded] = useState<BlogPost | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugState, setSlugState] = useState<SlugState>("idle");
  const [authorName, setAuthorName] = useState("");
  const [defaultAuthor, setDefaultAuthor] = useState("");
  const [coverMode, setCoverMode] = useState<"upload" | "url">("upload");
  const [coverUrl, setCoverUrl] = useState("");
  const [coverBusy, setCoverBusy] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagQuery, setTagQuery] = useState("");
  const [tagOpen, setTagOpen] = useState(false);
  const [optionalOpen, setOptionalOpen] = useState(true);
  const [html, setHtml] = useState("");
  const [saving, setSaving] = useState<"draft" | "submit" | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [dirty, setDirty] = useState(false);
  const [restored, setRestored] = useState(false);
  const coverInput = useRef<HTMLInputElement>(null);
  const tagBox = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: { openOnClick: false, autolink: true } }),
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image,
      TableKit.configure({ table: { resizable: false } }),
      Placeholder.configure({ placeholder: "Start writing your post… Use headings to break it into sections." }),
    ],
    editorProps: { attributes: { class: "blog-prose px-6 py-5" } },
    onUpdate: ({ editor: e }) => {
      setHtml(e.getHTML());
      setDirty(true);
    },
  });

  const flash = useCallback((t: Toast) => {
    setToast(t);
    if (t) setTimeout(() => setToast(null), 3200);
  }, []);

  /* ---- load: existing post, the author's name, and any unsaved local copy ---- */
  useEffect(() => {
    if (!user || !editor) return;
    let live = true;
    (async () => {
      const { data: prof } = await supabaseBrowser().from("profiles").select("full_name").eq("id", user.id).maybeSingle();
      if (live) setDefaultAuthor(((prof?.full_name as string) ?? "").trim() || "Job Alert 24 Writer");
      let base: Partial<BlogPost> | null = null;
      if (id) {
        const r = await fetch(`/api/blog/posts/${id}`, { cache: "no-store" });
        const j = await r.json();
        if (!live) return;
        if (!r.ok) return setLoadError(j.error ?? "Couldn't load this post.");
        base = j as BlogPost;
        setLoaded(j);
      }
      let local: Record<string, unknown> | null = null;
      try {
        local = JSON.parse(localStorage.getItem(LOCAL_KEY(id)) ?? "null");
      } catch {
        local = null;
      }
      // A local copy newer than the saved post wins, so a closed tab loses nothing.
      const useLocal = local && (!base || (local.savedAt as number) > new Date(base.updatedAt ?? 0).getTime());
      const src = (useLocal ? local : base) as Record<string, unknown> | null;
      if (!live || !src) return;
      setTitle((src.title as string) ?? "");
      setSlug((src.slug as string) ?? "");
      setSlugTouched(Boolean(src.slug));
      setAuthorName(useLocal ? ((src.authorName as string) ?? "") : ((src.authorName as string) ?? ""));
      setCoverUrl((src.coverUrl as string) ?? "");
      setTags(((src.tags as string[]) ?? []).filter((t) => BLOG_TAGS.some((b) => b.name === t)));
      const content = (useLocal ? src.contentHtml : src.contentHtml) as string;
      editor.commands.setContent(content || "", { emitUpdate: false });
      setHtml(content || "");
      if (useLocal) setRestored(true);
    })();
    return () => {
      live = false;
    };
  }, [user, editor, id]);

  /* ---- keep a local copy while typing ---- */
  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(LOCAL_KEY(id), JSON.stringify({ title, slug, authorName, coverUrl, tags, contentHtml: html, savedAt: Date.now() }));
      } catch {
        /* storage full or blocked */
      }
    }, 600);
    return () => clearTimeout(t);
  }, [dirty, id, title, slug, authorName, coverUrl, tags, html]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // The slug follows the title until the writer edits it themselves.
  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(title));
      setSlugState("idle");
    }
  }, [title, slugTouched]);

  useEffect(() => {
    if (!tagOpen) return;
    const off = (e: MouseEvent) => !tagBox.current?.contains(e.target as Node) && setTagOpen(false);
    document.addEventListener("mousedown", off);
    return () => document.removeEventListener("mousedown", off);
  }, [tagOpen]);

  const words = useMemo(() => countWords(html), [html]);
  const need = Math.max(0, WORDS_MIN - words);
  const over = words > WORDS_MAX;
  const slugValid = slug.length >= 3 && slug.length <= SLUG_MAX && SLUG_RE.test(slug);
  const admin = isAdminEmail(user?.email);
  const livePost = loaded?.status === "published";
  // Writers can't change a live post; admins can, and it stays live.
  const locked = livePost && !admin;
  const canSubmit = Boolean(title.trim()) && slugValid && !need && !over && slugState !== "taken" && !locked;

  async function checkSlug() {
    if (!slugValid) return setSlugState("invalid");
    setSlugState("checking");
    try {
      const r = await fetch(`/api/blog/slug?slug=${encodeURIComponent(slug)}${id ? `&id=${id}` : ""}`);
      const j = await r.json();
      setSlugState(j.available ? "free" : "taken");
    } catch {
      setSlugState("idle");
    }
  }

  async function onCover(file: File | undefined) {
    if (!file) return;
    setCoverBusy(true);
    const r = await uploadImage(file);
    setCoverBusy(false);
    if (r.url) {
      setCoverUrl(r.url);
      setDirty(true);
    } else flash({ kind: "error", text: r.error ?? "Upload failed." });
  }

  async function save(action: "draft" | "submit") {
    if (!title.trim()) return flash({ kind: "error", text: "Add a title first." });
    if (!slugValid) return flash({ kind: "error", text: "Fix the URL slug: lowercase letters, numbers and dashes." });
    setSaving(action);
    try {
      const r = await fetch(id ? `/api/blog/posts/${id}` : "/api/blog/posts", {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, authorName, coverUrl, tags, contentHtml: html, action }),
      });
      const j = await r.json();
      if (!r.ok) {
        if (r.status === 409 && /slug/i.test(j.error ?? "")) setSlugState("taken");
        return flash({ kind: "error", text: j.error ?? "Couldn't save." });
      }
      const post = j as BlogPost;
      setLoaded(post);
      setDirty(false);
      try {
        localStorage.removeItem(LOCAL_KEY(id));
      } catch {
        /* ignore */
      }
      if (action === "submit") {
        router.push(post.status === "published" ? `/blog/${post.slug}` : "/blog/mine?submitted=1");
        return;
      }
      flash({ kind: "ok", text: "Draft saved" });
      if (!id) router.replace(`/blog/edit/${post.id}`);
    } catch {
      flash({ kind: "error", text: "Network error. Your work is kept in this browser." });
    } finally {
      setSaving(null);
    }
  }

  const imageForEditor = useCallback(
    async (f: File) => {
      const r = await uploadImage(f);
      if (!r.url) flash({ kind: "error", text: r.error ?? "Upload failed." });
      return r.url ?? null;
    },
    [flash],
  );

  /* ---- states ---- */
  if (!authLoading && !user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-c-lime)]/10">
          <LogIn className="h-6 w-6 text-[var(--color-c-lime)]" />
        </span>
        <p className="text-[17px] font-bold text-[var(--color-c-text)]">Sign in to write a post</p>
        <p className="text-[13px] text-[var(--color-c-muted)]">Posts are reviewed by the Job Alert 24 team before they go live.</p>
        <Link href={`/login?next=${id ? `/blog/edit/${id}` : "/blog/new"}`} className="rounded-xl bg-[var(--color-c-lime)] px-5 py-2.5 text-[13px] font-bold text-black">
          Sign in
        </Link>
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-3 text-center">
        <p className="text-[15px] font-semibold text-[var(--color-c-text)]">{loadError}</p>
        <Link href="/blog/mine" className="text-[13px] font-semibold text-[var(--color-c-lime)] hover:underline">
          Back to my posts
        </Link>
      </div>
    );
  }

  const tagMatches = BLOG_TAGS.filter((t) => !tags.includes(t.name) && t.name.toLowerCase().includes(tagQuery.trim().toLowerCase()));
  const label = "mb-2 flex items-center gap-2 font-mono text-[12px] font-bold text-[var(--color-c-text)]";
  const input =
    "w-full rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[13px] text-[var(--color-c-text)] outline-none transition-colors placeholder:text-[var(--color-c-dim)] focus:border-[var(--color-c-lime)]/50";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-mono text-[clamp(1.6rem,3.5vw,2.2rem)] font-bold tracking-tight text-[var(--color-c-text)]">{id ? "Edit Post" : "Create New Post"}</h1>
          <p className="mt-1 text-[13px] text-[var(--color-c-muted)]">Write your next masterpiece</p>
        </div>
        {loaded && (
          <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-c-muted)]">
            {loaded.status === "pending" ? "In review" : loaded.status}
          </span>
        )}
      </div>

      {restored && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-400/25 bg-sky-400/[0.06] px-4 py-2.5 text-[12px] text-sky-200">
          Restored your unsaved changes from this browser.
          <button
            type="button"
            onClick={() => {
              try {
                localStorage.removeItem(LOCAL_KEY(id));
              } catch {
                /* ignore */
              }
              window.location.reload();
            }}
            className="font-semibold underline underline-offset-2"
          >
            Discard them
          </button>
        </div>
      )}
      {loaded?.status === "rejected" && loaded.reviewNote && (
        <p className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/[0.07] px-4 py-2.5 text-[12px] text-amber-200">Reviewer note: {loaded.reviewNote}</p>
      )}
      {locked && (
        <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[12px] text-[var(--color-c-muted)]">This post is published and can&apos;t be edited here.</p>
      )}
      {livePost && admin && (
        <p className="mt-4 rounded-xl border border-[var(--color-c-lime)]/25 bg-[var(--color-c-lime)]/[0.06] px-4 py-2.5 text-[12px] text-[var(--color-c-lime)]">
          Editing a live post as admin. Changes appear on the blog as soon as you click Update post.
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* editor column */}
        <div className="min-w-0">
          <p className="mb-3 flex items-center gap-2 border-b border-white/[0.07] pb-3 font-mono text-[14px] font-bold text-[var(--color-c-text)]">
            <Type className="h-4 w-4 text-[var(--color-c-lime)]" /> Content Editor
          </p>
          <div className="blog-editor overflow-hidden rounded-2xl border border-white/[0.08] bg-[#131612]">
            {editor ? <Toolbar editor={editor} onImage={imageForEditor} /> : <div className="h-12 border-b border-white/[0.07]" />}
            {editor ? (
              <EditorContent editor={editor} />
            ) : (
              <div className="flex h-[560px] items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--color-c-lime)]" />
              </div>
            )}
          </div>
          <div className="mt-3 rounded-2xl border border-white/[0.07] bg-[#131612] px-4 py-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--color-c-muted)]">
              <span>
                <b className={words < WORDS_MIN || over ? "text-red-400" : "text-[var(--color-c-lime)]"}>{words}</b> / {WORDS_MAX} words
              </span>
              <span>{title.length} title chars</span>
              <span>
                {tags.length}/{TAGS_MAX} tags
              </span>
              <span className={`ml-auto font-mono text-[10px] ${over || need ? "text-red-400" : "text-[var(--color-c-lime)]"}`}>
                {over ? `${words - WORDS_MAX} words over the limit` : need ? `Need ${need} more` : "Ready to submit"}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className={`h-full rounded-full ${over ? "bg-red-400" : words >= WORDS_MIN ? "bg-[var(--color-c-lime)]" : "bg-[var(--color-c-lime)]/50"}`}
                animate={{ width: `${Math.min(100, (words / WORDS_MAX) * 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* side panel */}
        <div className="space-y-4">
          <section className="rounded-2xl border border-white/[0.08] bg-[#131612] p-4">
            <div className="mb-4 flex items-center justify-between border-b border-white/[0.07] pb-3">
              <p className="flex items-center gap-2 font-mono text-[14px] font-bold text-[var(--color-c-text)]">
                <span className="h-2 w-2 rounded-full bg-[var(--color-c-lime)]" /> Blog Details
              </p>
              <span className="rounded-full border border-[var(--color-c-lime)]/40 bg-[var(--color-c-lime)]/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-[var(--color-c-lime)]">Required</span>
            </div>
            <label className="block">
              <span className={label}>
                <Type className="h-3.5 w-3.5" /> Blog Title
              </span>
              <input
                value={title}
                maxLength={TITLE_MAX}
                disabled={locked}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setDirty(true);
                }}
                placeholder="Enter your blog title"
                className={input}
              />
            </label>
            <div className="mt-4">
              <span className={label}>
                <Link2 className="h-3.5 w-3.5" /> URL Slug
              </span>
              <div className="flex gap-2">
                <input
                  value={slug}
                  maxLength={SLUG_MAX}
                  disabled={locked}
                  onChange={(e) => {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-{2,}/g, "-"));
                    setSlugTouched(true);
                    setSlugState("idle");
                    setDirty(true);
                  }}
                  placeholder="blog-url-slug"
                  className={`${input} min-w-0 flex-1`}
                />
                <button
                  type="button"
                  onClick={checkSlug}
                  disabled={!slug || slugState === "checking" || locked}
                  className="shrink-0 rounded-full border border-white/10 px-4 text-[12px] font-semibold text-[var(--color-c-text-4)] transition-colors hover:border-white/25 hover:text-[var(--color-c-text)] disabled:opacity-50"
                >
                  {slugState === "checking" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Check"}
                </button>
              </div>
              <p className={`mt-1.5 text-[11px] ${slugState === "free" ? "text-[var(--color-c-lime)]" : slugState === "taken" || slugState === "invalid" ? "text-red-400" : "text-[var(--color-c-dim)]"}`}>
                {slugState === "free"
                  ? "Available"
                  : slugState === "taken"
                    ? "Already used by another post"
                    : slugState === "invalid" || (slug && !slugValid)
                      ? "3-90 lowercase letters, numbers and single dashes"
                      : slug
                        ? `jobalerts24.com/blog/${slug}`
                        : "Generated from the title"}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-[#131612]">
            <button type="button" onClick={() => setOptionalOpen((v) => !v)} className="flex w-full items-center justify-between px-4 py-3.5">
              <span className="flex items-center gap-2 font-mono text-[14px] font-bold text-[var(--color-c-text)]">
                <span className="h-2 w-2 rounded-full bg-white/30" /> Optional Details
              </span>
              {optionalOpen ? <ChevronUp className="h-4 w-4 text-[var(--color-c-dim)]" /> : <ChevronDown className="h-4 w-4 text-[var(--color-c-dim)]" />}
            </button>
            <AnimatePresence initial={false}>
              {optionalOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="space-y-4 border-t border-white/[0.07] p-4">
                    <label className="block">
                      <span className={label}>
                        <User className="h-3.5 w-3.5" /> Author Name
                      </span>
                      <input
                        value={authorName}
                        maxLength={80}
                        disabled={locked}
                        onChange={(e) => {
                          setAuthorName(e.target.value);
                          setDirty(true);
                        }}
                        placeholder={defaultAuthor || "Your name"}
                        className={input}
                      />
                      <span className="mt-1.5 block text-[11px] text-[var(--color-c-dim)]">Leave empty to use: {defaultAuthor || "your profile name"}</span>
                    </label>

                    <div>
                      <span className={label}>
                        <ImageIcon className="h-3.5 w-3.5" /> Cover Image
                      </span>
                      <div className="mb-3 flex gap-2">
                        {(["upload", "url"] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setCoverMode(m)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-mono text-[12px] font-bold transition-colors ${
                              coverMode === m ? "bg-[var(--color-c-lime)] text-black" : "border border-white/10 text-[var(--color-c-text-4)] hover:text-[var(--color-c-text)]"
                            }`}
                          >
                            {m === "upload" ? <UploadCloud className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                            {m === "upload" ? "Upload" : "URL"}
                          </button>
                        ))}
                      </div>
                      {coverUrl ? (
                        <div className="relative overflow-hidden rounded-xl border border-white/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={coverUrl} alt="Cover preview" className="aspect-[16/9] w-full object-cover" />
                          <button
                            type="button"
                            aria-label="Remove cover"
                            disabled={locked}
                            onClick={() => {
                              setCoverUrl("");
                              setDirty(true);
                            }}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : coverMode === "upload" ? (
                        <button
                          type="button"
                          disabled={coverBusy || locked}
                          onClick={() => coverInput.current?.click()}
                          className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-white/15 px-4 py-7 text-center transition-colors hover:border-[var(--color-c-lime)]/40"
                        >
                          {coverBusy ? <Loader2 className="h-5 w-5 animate-spin text-[var(--color-c-lime)]" /> : <UploadCloud className="h-5 w-5 text-[var(--color-c-muted)]" />}
                          <span className="font-mono text-[12px] font-bold text-[var(--color-c-text-4)]">{coverBusy ? "Uploading…" : "Click to upload"}</span>
                          <span className="text-[11px] text-[var(--color-c-dim)]">16:9 ratio recommended · JPG, PNG or WebP under 4 MB</span>
                        </button>
                      ) : (
                        <input
                          placeholder="https://…/cover.jpg"
                          className={input}
                          disabled={locked}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const v = e.currentTarget.value.trim();
                              if (/^https?:\/\//i.test(v)) {
                                setCoverUrl(v);
                                setDirty(true);
                              } else flash({ kind: "error", text: "Use a full https:// image link." });
                            }
                          }}
                          onBlur={(e) => {
                            const v = e.currentTarget.value.trim();
                            if (/^https?:\/\//i.test(v)) {
                              setCoverUrl(v);
                              setDirty(true);
                            }
                          }}
                        />
                      )}
                      <input ref={coverInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onCover(e.target.files?.[0])} />
                    </div>

                    <div ref={tagBox} className="relative">
                      <span className={label}>
                        <Tag className="h-3.5 w-3.5" /> Tags
                      </span>
                      <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 focus-within:border-[var(--color-c-lime)]/50">
                        <input
                          value={tagQuery}
                          disabled={locked || tags.length >= TAGS_MAX}
                          onFocus={() => setTagOpen(true)}
                          onChange={(e) => {
                            setTagQuery(e.target.value);
                            setTagOpen(true);
                          }}
                          placeholder={tags.length >= TAGS_MAX ? "Tag limit reached" : "Search and select tags..."}
                          className="min-w-0 flex-1 bg-transparent text-[13px] text-[var(--color-c-text)] outline-none placeholder:text-[var(--color-c-dim)]"
                        />
                        <Search className="h-3.5 w-3.5 text-[var(--color-c-dim)]" />
                        <ChevronDown className="h-3.5 w-3.5 text-[var(--color-c-dim)]" />
                      </label>
                      <AnimatePresence>
                        {tagOpen && tags.length < TAGS_MAX && tagMatches.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="absolute z-20 mt-1.5 max-h-56 w-full overflow-y-auto rounded-2xl border border-white/10 bg-[#1a1d18] p-1.5 shadow-xl"
                          >
                            {tagMatches.map((t) => (
                              <button
                                key={t.name}
                                type="button"
                                onClick={() => {
                                  setTags((cur) => [...cur, t.name]);
                                  setTagQuery("");
                                  setDirty(true);
                                }}
                                className="flex w-full items-center rounded-lg px-2.5 py-2 text-left text-[13px] text-[var(--color-c-text-4)] hover:bg-white/[0.06] hover:text-[var(--color-c-text)]"
                              >
                                {t.name}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {tags.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {tags.map((t) => (
                            <button
                              key={t}
                              type="button"
                              disabled={locked}
                              onClick={() => {
                                setTags((cur) => cur.filter((x) => x !== t));
                                setDirty(true);
                              }}
                              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${tagClass(t)}`}
                            >
                              {t} <X className="h-3 w-3" />
                            </button>
                          ))}
                        </div>
                      )}
                      <p className="mt-1.5 text-[11px] text-[var(--color-c-dim)]">
                        {tags.length}/{TAGS_MAX} tags selected
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <section className="space-y-2.5 rounded-2xl border border-white/[0.08] bg-[#131612] p-4">
            {!(livePost && admin) && (
            <button
              type="button"
              disabled={!!saving || locked}
              onClick={() => save("draft")}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 py-2.5 font-mono text-[13px] font-bold text-[var(--color-c-text-4)] transition-colors hover:border-white/25 hover:text-[var(--color-c-text)] disabled:opacity-50"
            >
              {saving === "draft" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save as Draft
            </button>
            )}
            <button
              type="button"
              disabled={!canSubmit || !!saving}
              onClick={() => save("submit")}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-c-lime)] py-2.5 font-mono text-[13px] font-bold text-black transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#5d7a35] disabled:text-black/70"
            >
              {saving === "submit" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {livePost && admin ? "Update post" : admin ? "Publish" : "Submit for Review"}
            </button>
            <p className="text-center font-mono text-[11px] text-[var(--color-c-dim)]">
              {locked
                ? "Already published"
                : over
                  ? `Trim ${words - WORDS_MAX} words to submit`
                  : need
                    ? `Need ${need} more words to submit`
                    : !title.trim()
                      ? "Add a title to submit"
                      : admin
                        ? "Admin posts go live immediately"
                        : "Reviewed by the team before it goes live"}
            </p>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            role="status"
            className={`fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-full px-4 py-2.5 text-[13px] font-semibold shadow-xl ${
              toast.kind === "ok" ? "bg-[var(--color-c-lime)] text-black" : "bg-red-500 text-white"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              {toast.kind === "ok" && <Check className="h-4 w-4" />}
              {toast.text}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
