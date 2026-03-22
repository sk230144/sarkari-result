"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Users,
  X,
  Search,
} from "lucide-react";
import {
  getAdminHiringProfiles,
  createHiringProfile,
  updateHiringProfile,
  deleteHiringProfile,
  toggleHiringProfileActive,
} from "@/lib/actions/hiring-profiles";
import type { HiringProfile } from "@/types";

const ROLE_OPTIONS = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "React Developer",
  "Node.js Developer",
  "Go Developer",
  "Python Developer",
  "Java Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Data Analyst",
  "Data Engineer",
  "ML Engineer",
  "Cloud Engineer",
  "iOS Developer",
  "Android Developer",
  "Flutter Developer",
  "React Native Developer",
  "UI/UX Designer",
  "Product Manager",
  "Engineering Manager",
  "QA Engineer",
  "Cybersecurity Analyst",
  "Blockchain Developer",
  "AI Engineer",
  "SRE Engineer",
  "Technical Writer",
  "Solutions Architect",
  "Sales Engineer",
];

const WORK_MODE_OPTIONS = [
  { value: "onsite", label: "Onsite" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

export default function AdminHiringPage() {
  const [profiles, setProfiles] = useState<HiringProfile[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<HiringProfile | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [profileName, setProfileName] = useState("");
  const [roleHiring, setRoleHiring] = useState("");
  const [workMode, setWorkMode] = useState("onsite");
  const [profileLink, setProfileLink] = useState("");

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    const { profiles: data } = await getAdminHiringProfiles(1, search);
    setProfiles(data);
  }

  function resetForm() {
    setProfileName("");
    setRoleHiring("");
    setWorkMode("onsite");
    setProfileLink("");
    setEditingProfile(null);
    setShowForm(false);
  }

  function handleEdit(profile: HiringProfile) {
    setProfileName(profile.profile_name);
    setRoleHiring(profile.role_hiring);
    setWorkMode(profile.work_mode);
    setProfileLink(profile.profile_link);
    setEditingProfile(profile);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.set("profile_name", profileName);
    formData.set("role_hiring", roleHiring);
    formData.set("work_mode", workMode);
    formData.set("profile_link", profileLink);

    startTransition(async () => {
      if (editingProfile) {
        await updateHiringProfile(editingProfile.id, formData);
      } else {
        await createHiringProfile(formData);
      }
      resetForm();
      await loadProfiles();
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this hiring profile?")) return;
    startTransition(async () => {
      await deleteHiringProfile(id);
      await loadProfiles();
    });
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    startTransition(async () => {
      await toggleHiringProfileActive(id, isActive);
      await loadProfiles();
    });
  }

  async function handleSearch() {
    const { profiles: data } = await getAdminHiringProfiles(1, search);
    setProfiles(data);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Who&apos;s Hiring
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage hiring profiles shown on the Corporate Jobs page
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="gradient-purple text-white font-bold border-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Profile
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or role..."
          className="max-w-sm"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button variant="outline" onClick={handleSearch}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">
              {editingProfile ? "Edit Profile" : "Add New Profile"}
            </h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Profile Name *</Label>
              <Input
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="e.g. John Doe"
                required
                className="bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Role Hiring For *</Label>
              <Select value={roleHiring} onValueChange={setRoleHiring} required>
                <SelectTrigger className="bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 rounded-lg">
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Work Mode *</Label>
              <Select value={workMode} onValueChange={setWorkMode}>
                <SelectTrigger className="bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORK_MODE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Profile Link *</Label>
              <Input
                value={profileLink}
                onChange={(e) => setProfileLink(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                type="url"
                required
                className="bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <Button
                type="submit"
                disabled={isPending || !profileName || !roleHiring || !profileLink}
                className="gradient-purple text-white font-bold border-0"
              >
                {isPending
                  ? "Saving..."
                  : editingProfile
                  ? "Update Profile"
                  : "Add Profile"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Profiles List */}
      <div className="space-y-3">
        {profiles.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="font-semibold">No hiring profiles yet</p>
            <p className="text-sm">Click &quot;Add Profile&quot; to get started</p>
          </div>
        ) : (
          profiles.map((profile) => (
            <div
              key={profile.id}
              className={`flex items-center gap-4 p-4 rounded-xl border bg-white transition-all ${
                profile.is_active
                  ? "border-slate-200 hover:border-blue-200"
                  : "border-slate-100 bg-slate-50 opacity-60"
              }`}
            >
              {/* Avatar */}
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {profile.profile_name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {profile.profile_name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {profile.role_hiring}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    profile.work_mode === "remote"
                      ? "text-emerald-600 bg-emerald-50"
                      : profile.work_mode === "hybrid"
                      ? "text-amber-600 bg-amber-50"
                      : "text-slate-600 bg-slate-100"
                  }`}>
                    {profile.work_mode.charAt(0).toUpperCase() + profile.work_mode.slice(1)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={profile.profile_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  onClick={() => handleToggleActive(profile.id, !profile.is_active)}
                  className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  title={profile.is_active ? "Deactivate" : "Activate"}
                >
                  {profile.is_active ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(profile)}
                  className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(profile.id)}
                  disabled={isPending}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="text-xs text-slate-400 text-center">
        Total: {profiles.length} profiles
      </p>
    </div>
  );
}
