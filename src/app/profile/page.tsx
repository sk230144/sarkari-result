import type { Metadata } from "next";
import { ProfileEditor } from "@/components/profile/profile-editor";

export const metadata: Metadata = {
  title: "Your Profile — Job Alert 24",
  description:
    "Edit your developer profile: skills, experience, education, projects, social links and your public profile page.",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <main className="min-h-screen w-full bg-[var(--color-c-dash)] text-[var(--color-c-text-2)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-5 lg:px-6">
        <ProfileEditor />
      </div>
    </main>
  );
}
