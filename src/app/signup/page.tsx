import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create account — Job Alert 24" };

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-c-canvas-deep)] px-6 py-12">
      <Suspense fallback={null}>
        <AuthForm mode="signup" />
      </Suspense>
    </main>
  );
}
