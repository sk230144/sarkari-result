"use client";

import { useState, useEffect, useTransition } from "react";
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
import {
  Plus, Trash2, Edit3, ExternalLink, Eye, EyeOff,
  Users, X, Search, FileText, Briefcase, Tag, ImageIcon,
} from "lucide-react";
import {
  getAdminHiringProfiles,
  createHiringProfile,
  updateHiringProfile,
  deleteHiringProfile,
  toggleHiringProfileActive,
} from "@/lib/actions/hiring-profiles";
import {
  getAdminHiringPosts,
  createHiringPost,
  updateHiringPost,
  deleteHiringPost,
  toggleHiringPostActive,
} from "@/lib/actions/hiring-posts";
import type { HiringProfile, HiringPost } from "@/types";

const ROLE_OPTIONS = [
  "Software Engineer", "Frontend Developer", "Backend Developer",
  "Full Stack Developer", "React Developer", "Node.js Developer",
  "Go Developer", "Python Developer", "Java Developer", "DevOps Engineer",
  "Data Scientist", "Data Analyst", "Data Engineer", "ML Engineer",
  "Cloud Engineer", "iOS Developer", "Android Developer", "Flutter Developer",
  "React Native Developer", "UI/UX Designer", "Product Manager",
  "Engineering Manager", "QA Engineer", "Cybersecurity Analyst",
  "Blockchain Developer", "AI Engineer", "SRE Engineer", "Technical Writer",
  "Solutions Architect", "Sales Engineer",
];

const WORK_MODE_OPTIONS = [
  { value: "onsite", label: "Onsite" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

const TAG_OPTIONS = [
  "Frontend", "Backend", "Full Stack", "React", "Next.js", "Vue", "Angular",
  "Node.js", "Python", "Django", "FastAPI", "Java", "Spring Boot", "Go",
  "Rust", "TypeScript", "JavaScript", "PHP", "Laravel", "Ruby on Rails",
  "DevOps", "AWS", "GCP", "Azure", "Docker", "Kubernetes", "CI/CD",
  "Data Science", "Machine Learning", "AI", "LLM", "Data Engineering",
  "Mobile", "iOS", "Android", "Flutter", "React Native",
  "UI/UX", "Product", "QA", "Security", "Blockchain",
  "Remote", "Hybrid", "Onsite", "Internship", "Fresher",
];

// ─── Multi-Select Tag Picker ───────────────────────────────────────────────
function TagPicker({ selected, onChange }: { selected: string[]; onChange: (tags: string[]) => void }) {
  const [open, setOpen] = useState(false);

  function toggle(tag: string) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full min-h-10 flex flex-wrap gap-1.5 items-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-left hover:border-blue-300 focus:outline-none focus:border-blue-300"
      >
        {selected.length === 0 ? (
          <span className="text-slate-400">Select tags...</span>
        ) : (
          selected.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 bg-violet-100 text-violet-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {t}
              <span onClick={(e) => { e.stopPropagation(); toggle(t); }} className="cursor-pointer hover:text-violet-900">×</span>
            </span>
          ))
        )}
        <Tag className="h-3.5 w-3.5 text-slate-400 ml-auto shrink-0" />
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg p-3 max-h-56 overflow-y-auto">
          <div className="flex flex-wrap gap-1.5">
            {TAG_OPTIONS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggle(tag)}
                className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-all ${
                  selected.includes(tag)
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-violet-400 hover:text-violet-600"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 w-full text-xs text-slate-500 font-semibold hover:text-slate-700"
          >
            Done ✓
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Profiles Section ─────────────────────────────────────────────────────
function ProfilesSection() {
  const [profiles, setProfiles] = useState<HiringProfile[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<HiringProfile | null>(null);
  const [isPending, startTransition] = useTransition();
  const [profileName, setProfileName] = useState("");
  const [roleHiring, setRoleHiring] = useState("");
  const [workMode, setWorkMode] = useState("onsite");
  const [profileLink, setProfileLink] = useState("");

  useEffect(() => { loadProfiles(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadProfiles() {
    const { profiles: data } = await getAdminHiringProfiles(1, search);
    setProfiles(data);
  }

  function resetForm() {
    setProfileName(""); setRoleHiring(""); setWorkMode("onsite"); setProfileLink("");
    setEditingProfile(null); setShowForm(false);
  }

  function handleEdit(p: HiringProfile) {
    setProfileName(p.profile_name); setRoleHiring(p.role_hiring);
    setWorkMode(p.work_mode); setProfileLink(p.profile_link);
    setEditingProfile(p); setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("profile_name", profileName); fd.set("role_hiring", roleHiring);
    fd.set("work_mode", workMode); fd.set("profile_link", profileLink);
    startTransition(async () => {
      if (editingProfile) await updateHiringProfile(editingProfile.id, fd);
      else await createHiringProfile(fd);
      resetForm(); await loadProfiles();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or role..." className="max-w-sm"
          onKeyDown={(e) => e.key === "Enter" && loadProfiles()} />
        <Button variant="outline" onClick={loadProfiles}><Search className="h-4 w-4" /></Button>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="ml-auto gradient-purple text-white font-bold border-0">
          <Plus className="h-4 w-4 mr-2" />Add Profile
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">{editingProfile ? "Edit Profile" : "Add Profile"}</h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Profile Name *</Label>
              <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="e.g. John Doe" required className="bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Role Hiring For *</Label>
              <Select value={roleHiring} onValueChange={setRoleHiring} required>
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-lg"><SelectValue placeholder="Select role..." /></SelectTrigger>
                <SelectContent>{ROLE_OPTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Work Mode *</Label>
              <Select value={workMode} onValueChange={setWorkMode}>
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>{WORK_MODE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Profile Link *</Label>
              <Input value={profileLink} onChange={(e) => setProfileLink(e.target.value)} placeholder="https://linkedin.com/in/..." type="url" required className="bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={isPending || !profileName || !roleHiring || !profileLink} className="gradient-purple text-white font-bold border-0">
                {isPending ? "Saving..." : editingProfile ? "Update Profile" : "Add Profile"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {profiles.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="font-semibold">No profiles yet</p>
          </div>
        ) : profiles.map((profile) => (
          <div key={profile.id} className={`flex items-center gap-4 p-4 rounded-xl border bg-white transition-all ${profile.is_active ? "border-slate-200 hover:border-blue-200" : "border-slate-100 bg-slate-50 opacity-60"}`}>
            <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {profile.profile_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{profile.profile_name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{profile.role_hiring}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${profile.work_mode === "remote" ? "text-emerald-600 bg-emerald-50" : profile.work_mode === "hybrid" ? "text-amber-600 bg-amber-50" : "text-slate-600 bg-slate-100"}`}>
                  {profile.work_mode.charAt(0).toUpperCase() + profile.work_mode.slice(1)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <a href={profile.profile_link} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><ExternalLink className="h-4 w-4" /></a>
              <button onClick={() => startTransition(async () => { await toggleHiringProfileActive(profile.id, !profile.is_active); await loadProfiles(); })} className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                {profile.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button onClick={() => handleEdit(profile)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit3 className="h-4 w-4" /></button>
              <button onClick={() => { if (!confirm("Delete this profile?")) return; startTransition(async () => { await deleteHiringProfile(profile.id); await loadProfiles(); }); }} disabled={isPending} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 text-center">Total: {profiles.length} profiles</p>
    </div>
  );
}

// ─── Posts Section ────────────────────────────────────────────────────────
function PostsSection() {
  const [posts, setPosts] = useState<HiringPost[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<HiringPost | null>(null);
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [workMode, setWorkMode] = useState("onsite");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => { loadPosts(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadPosts() {
    const { posts: data } = await getAdminHiringPosts(1, search);
    setPosts(data);
  }

  function resetForm() {
    setTitle(""); setCompanyName(""); setDescription("");
    setTags([]); setWorkMode("onsite"); setImageFile(null); setImagePreview(null);
    setEditingPost(null); setShowForm(false);
  }

  function handleEdit(p: HiringPost) {
    setTitle(p.title); setCompanyName(p.company_name ?? "");
    setDescription(p.description || "");
    setTags(p.tags); setWorkMode(p.work_mode);
    setImageFile(null);
    setImagePreview(p.image_url || null);
    setEditingPost(p); setShowForm(true);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("title", title);
    fd.set("company_name", companyName);
    fd.set("description", description);
    fd.set("tags", tags.join(","));
    fd.set("work_mode", workMode);
    if (imageFile) fd.set("image", imageFile);
    // If editing and no new image selected but preview exists, keep existing
    if (editingPost && !imageFile && imagePreview) fd.set("keep_image", "1");
    startTransition(async () => {
      if (editingPost) await updateHiringPost(editingPost.id, fd);
      else await createHiringPost(fd);
      resetForm(); await loadPosts();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or company..." className="max-w-sm"
          onKeyDown={(e) => e.key === "Enter" && loadPosts()} />
        <Button variant="outline" onClick={loadPosts}><Search className="h-4 w-4" /></Button>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold border-0">
          <Plus className="h-4 w-4 mr-2" />Add Post
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">{editingPost ? "Edit Post" : "Add Hiring Post"}</h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Job Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Frontend Engineer" required className="bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Company Name</Label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Razorpay" className="bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Work Mode</Label>
              <Select value={workMode} onValueChange={setWorkMode}>
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>{WORK_MODE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Image <span className="text-slate-400 font-normal">(optional)</span></Label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-lg px-3 py-2 text-sm text-slate-600 font-medium transition-colors">
                  <ImageIcon className="h-4 w-4 text-slate-400" />
                  {imageFile ? imageFile.name : "Choose image..."}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
                {imagePreview && (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="preview" className="h-12 w-20 object-cover rounded-lg border border-slate-200" />
                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black">×</button>
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Tags <span className="text-slate-400 font-normal">(optional)</span></Label>
              <TagPicker selected={tags} onChange={setTags} />
              <p className="text-xs text-slate-400">Select relevant tags — users can filter by these</p>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Description <span className="text-slate-400 font-normal">(optional)</span></Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Job description, requirements, salary, email to apply..." rows={3} className="bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 rounded-lg resize-none" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={isPending || !title} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold border-0">
                {isPending ? "Saving..." : editingPost ? "Update Post" : "Add Post"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="font-semibold">No hiring posts yet</p>
            <p className="text-sm">Click &quot;Add Post&quot; to create your first job post</p>
          </div>
        ) : posts.map((post) => (
          <div key={post.id} className={`flex items-start gap-4 p-4 rounded-xl border bg-white transition-all ${post.is_active ? "border-slate-200 hover:border-emerald-200" : "border-slate-100 bg-slate-50 opacity-60"}`}>
            {post.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.image_url} alt={post.title} className="h-12 w-16 object-cover rounded-lg border border-slate-200 shrink-0" />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <Briefcase className="h-5 w-5 text-emerald-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-slate-800">{post.title}</p>
                  <p className="text-xs text-slate-500 font-semibold">{post.company_name}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${post.work_mode === "remote" ? "text-emerald-600 bg-emerald-50" : post.work_mode === "hybrid" ? "text-amber-600 bg-amber-50" : "text-slate-600 bg-slate-100"}`}>
                  {post.work_mode.charAt(0).toUpperCase() + post.work_mode.slice(1)}
                </span>
              </div>
              {post.description && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{post.description}</p>}
              <div className="flex flex-wrap gap-1 mt-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-bold bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full border border-violet-100">{tag}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => startTransition(async () => { await toggleHiringPostActive(post.id, !post.is_active); await loadPosts(); })} className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                {post.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button onClick={() => handleEdit(post)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit3 className="h-4 w-4" /></button>
              <button onClick={() => { if (!confirm("Delete this post?")) return; startTransition(async () => { await deleteHiringPost(post.id); await loadPosts(); }); }} disabled={isPending} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 text-center">Total: {posts.length} posts</p>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function AdminHiringPage() {
  const [activeTab, setActiveTab] = useState<"profiles" | "posts">("profiles");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Who&apos;s Hiring
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage hiring profiles and job posts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("profiles")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "profiles"
              ? "border-violet-600 text-violet-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Users className="h-4 w-4" />
          Hiring Profiles
        </button>
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "posts"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <FileText className="h-4 w-4" />
          Hiring Posts
        </button>
      </div>

      {activeTab === "profiles" ? <ProfilesSection /> : <PostsSection />}
    </div>
  );
}
