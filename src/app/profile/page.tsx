import type { Metadata } from "next";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileMain } from "@/components/profile/profile-main";
import { ProfileAside } from "@/components/profile/profile-aside";

export const metadata: Metadata = {
  title: "Your Profile — Job Alert 24",
  description:
    "Edit your developer profile: skills, experience, education, projects, social links and auto-apply preferences.",
};

export default function ProfilePage() {
  return (
    <main className="min-h-screen w-full bg-[#0b100d] text-[#e5e7eb]">
      <div className="mx-auto w-full max-w-6xl px-4 py-5 lg:px-6">
        <ProfileHeader />

        <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ProfileMain />
          </div>
          <ProfileAside />
        </div>
      </div>
    </main>
  );
}
