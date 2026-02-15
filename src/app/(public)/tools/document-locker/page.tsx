import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/auth";
import { getUserDocuments } from "@/lib/actions/documents";
import { DocumentLockerClient } from "./document-locker-client";

export const metadata = {
  title: "Document Locker",
  description:
    "Securely store your Aadhar card, marksheets, photos, signatures and other documents.",
};

export default async function DocumentLockerPage() {
  const user = await getUser();

  if (!user) {
    redirect("/auth/login?redirect=/tools/document-locker");
  }

  const documents = await getUserDocuments();

  return (
    <DocumentLockerClient
      user={{ id: user.id, email: user.email || "", name: user.user_metadata?.full_name || "" }}
      initialDocuments={documents}
    />
  );
}
