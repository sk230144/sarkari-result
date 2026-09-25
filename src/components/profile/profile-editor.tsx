"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { BrandLoader } from "@/components/ui/brand-loader";
import { BackButton } from "@/components/dashboard/back-button";
import type { ProfileResponse } from "@/lib/profile/types";
import { ProfileEditorProvider, PUBLIC_TAB } from "./editor-context";
import { ProfileHeader } from "./profile-header";
import { ProfileMain } from "./profile-main";
import { ProfileAside } from "./profile-aside";

export function ProfileEditor() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login?next=/profile");
      return;
    }
    let cancelled = false;
    fetch("/api/profile")
      .then(async (r) => {
        const json = await r.json();
        if (cancelled) return;
        if (!r.ok) setError(json.error ?? "Couldn't load your profile.");
        else setData(json);
      })
      .catch(() => !cancelled && setError("Couldn't load your profile."));
    return () => {
      cancelled = true;
    };
  }, [user, loading, router]);

  // Deep links from notifications (/profile#inbox): the sections only exist
  // once the profile has loaded, so scroll after the first render with data.
  useEffect(() => {
    if (!data || !window.location.hash) return;
    const id = setTimeout(() => {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => clearTimeout(id);
  }, [data]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="rounded-xl border border-red-500/30 bg-red-500/[0.07] px-4 py-3 text-[12px] text-red-300">{error}</p>
      </div>
    );
  }
  if (!data) return <BrandLoader label="Loading profile" />;

  return (
    <ProfileEditorProvider initial={data.profile} initialExtras={data.extras}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <BackButton fallback="/" />
        <Link
          href={`/u/${data.profile.slug}`}
          target={PUBLIC_TAB}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-c-lime)] hover:underline"
        >
          View public profile
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
      <ProfileHeader />
      <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProfileMain />
        </div>
        <ProfileAside />
      </div>
    </ProfileEditorProvider>
  );
}
