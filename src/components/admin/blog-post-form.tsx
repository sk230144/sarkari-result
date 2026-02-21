"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPost, updatePost } from "@/lib/actions/blog";
import { type BlogPost } from "@/types/blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Eye, EyeOff } from "lucide-react";

const CATEGORIES = ["general", "guide", "tips", "news", "exam"];

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function BlogPostForm({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    author: post?.author || "Job Alerts 24 Team",
    category: post?.category || "general",
    tags: post?.tags?.join(", ") || "",
    is_published: post?.is_published || false,
    published_at: post?.published_at
      ? post.published_at.slice(0, 16)
      : new Date().toISOString().slice(0, 16),
  });

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value;
    setForm((f) => ({
      ...f,
      title,
      slug: post ? f.slug : slugify(title),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.slug || !form.content) {
      toast.error("Title, slug and content are required");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        content: form.content,
        author: form.author,
        category: form.category,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        is_published: form.is_published,
        published_at: form.is_published ? form.published_at : null,
      };

      if (post) {
        await updatePost(post.id, payload);
        toast.success("Post updated");
      } else {
        await createPost(payload);
        toast.success("Post created");
      }
      router.push("/admin/blog");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card-3d bg-white rounded-xl border border-slate-200/60 p-6 space-y-5">
        {/* Title */}
        <div className="space-y-1.5">
          <Label className="text-sm font-bold text-slate-700">Title *</Label>
          <Input
            value={form.title}
            onChange={handleTitleChange}
            placeholder="e.g. How to Prepare for SSC CGL 2025"
            className="font-medium"
            required
          />
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <Label className="text-sm font-bold text-slate-700">Slug *</Label>
          <Input
            value={form.slug}
            onChange={(e) =>
              setForm((f) => ({ ...f, slug: slugify(e.target.value) }))
            }
            placeholder="how-to-prepare-for-ssc-cgl-2025"
            className="font-mono text-sm"
            required
          />
          <p className="text-xs text-slate-400 font-medium">
            URL: /blog/{form.slug || "your-slug"}
          </p>
        </div>

        {/* Excerpt */}
        <div className="space-y-1.5">
          <Label className="text-sm font-bold text-slate-700">
            Excerpt (short description)
          </Label>
          <Textarea
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            placeholder="Brief summary shown on blog listing page and in Google search..."
            rows={2}
            className="font-medium resize-none"
          />
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <Label className="text-sm font-bold text-slate-700">
            Content * (HTML supported)
          </Label>
          <Textarea
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            placeholder="<h2>Introduction</h2><p>Your blog content here...</p>"
            rows={16}
            className="font-mono text-sm resize-y"
            required
          />
          <p className="text-xs text-slate-400 font-medium">
            You can use HTML tags: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;a&gt;, &lt;blockquote&gt;
          </p>
        </div>
      </div>

      <div className="card-3d bg-white rounded-xl border border-slate-200/60 p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Author */}
          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-slate-700">Author</Label>
            <Input
              value={form.author}
              onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              placeholder="Job Alerts 24 Team"
              className="font-medium"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-slate-700">Category</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
            >
              <SelectTrigger className="font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} className="font-medium capitalize">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <Label className="text-sm font-bold text-slate-700">
            Tags (comma separated)
          </Label>
          <Input
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            placeholder="SSC, UPSC, Exam Tips, Resume"
            className="font-medium"
          />
        </div>

        {/* Published At */}
        <div className="space-y-1.5">
          <Label className="text-sm font-bold text-slate-700">
            Publish Date & Time
          </Label>
          <Input
            type="datetime-local"
            value={form.published_at}
            onChange={(e) =>
              setForm((f) => ({ ...f, published_at: e.target.value }))
            }
            className="font-medium"
          />
        </div>

        {/* Published toggle */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() =>
              setForm((f) => ({ ...f, is_published: !f.is_published }))
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              form.is_published ? "bg-emerald-500" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                form.is_published ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
            {form.is_published ? (
              <>
                <Eye className="h-4 w-4 text-emerald-500" />
                Published — visible on site
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4 text-slate-400" />
                Draft — not visible on site
              </>
            )}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="btn-3d gradient-hero text-white font-black shine shadow-lg shadow-blue-500/25"
        >
          <Save className="h-4 w-4 mr-1.5" />
          {loading ? "Saving..." : post ? "Update Post" : "Create Post"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/blog")}
          className="font-bold text-slate-600"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
