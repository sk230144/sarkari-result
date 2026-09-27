import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = pageMetadata("/login", { title: "Sign in — Job Alert 24",
  robots: { index: false, follow: true },
});

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-c-canvas-deep)] px-6 py-12">
      {/* AuthForm reads ?next= from the URL, which needs a Suspense boundary. */}
      <Suspense fallback={null}>
        <AuthForm mode="login" />
      </Suspense>
    </main>
  );
}
