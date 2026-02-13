import { notFound } from "next/navigation";
import { getJobById } from "@/lib/actions/jobs";
import { JobForm } from "@/components/admin/job-form";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Job</h1>
      <JobForm job={job} />
    </div>
  );
}
