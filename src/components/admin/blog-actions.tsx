"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deletePost } from "@/lib/actions/blog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function AdminBlogActions({ postId }: { postId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this blog post? This cannot be undone.")) return;
    setLoading(true);
    try {
      await deletePost(postId);
      toast.success("Post deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="text-slate-400 hover:text-red-600 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
