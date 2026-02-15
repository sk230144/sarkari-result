import { getUser } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PaymentClient } from "./payment-client";

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const user = await getUser();
  const { plan } = await searchParams;

  if (!user) {
    const redirectUrl = `/membership/payment${plan ? `?plan=${plan}` : ""}`;
    redirect(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
  }

  return (
    <Suspense>
      <PaymentClient
        user={{
          name: user.user_metadata?.full_name || user.email || "User",
          email: user.email || "",
        }}
        selectedPlan={plan || "yearly"}
      />
    </Suspense>
  );
}
